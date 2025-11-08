-- =====================================================
-- MIGRACIÓN: NUEVO SISTEMA DE RESERVAS DE HORARIOS
-- Fecha: 2025-11-03
-- Descripción: Simplificación del flujo de solicitudes de reuniones
-- =====================================================

USE actitubb;

-- ============================================
-- PASO 1: MODIFICAR TABLA disponibilidades
-- ============================================

-- Agregar campos para sistema de reservas
ALTER TABLE disponibilidades
ADD COLUMN fecha_especifica DATE NULL COMMENT 'Si es NULL, es horario recurrente semanal. Si tiene fecha, es horario específico de un día.',
ADD COLUMN reservado BOOLEAN DEFAULT FALSE COMMENT 'TRUE cuando un estudiante ha reservado este horario',
ADD COLUMN reservado_por VARCHAR(10) NULL COMMENT 'RUT del estudiante que reservó',
ADD COLUMN fecha_reserva TIMESTAMP NULL COMMENT 'Fecha en que se hizo la reserva',
ADD COLUMN solicitud_id INT NULL COMMENT 'ID de la solicitud asociada',
ADD INDEX idx_disponibilidad_reservado (reservado, activo),
ADD INDEX idx_disponibilidad_fecha (fecha_especifica),
ADD INDEX idx_disponibilidad_reservado_por (reservado_por),
ADD CONSTRAINT fk_disponibilidad_reservado_por 
    FOREIGN KEY (reservado_por) REFERENCES usuarios(rut) ON DELETE SET NULL,
ADD CONSTRAINT fk_disponibilidad_solicitud 
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes_reunion(id) ON DELETE SET NULL;

-- ============================================
-- PASO 2: SIMPLIFICAR ESTADOS DE SOLICITUDES
-- ============================================

-- Primero, convertir estados antiguos a nuevos estados
UPDATE solicitudes_reunion 
SET estado = 'aceptada' 
WHERE estado IN ('aceptada_profesor', 'aceptada_estudiante', 'confirmada');

UPDATE solicitudes_reunion 
SET estado = 'rechazada' 
WHERE estado = 'cancelada';

-- Modificar ENUM de estados (simplificar de 6 a 3 estados)
ALTER TABLE solicitudes_reunion
MODIFY COLUMN estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente'
COMMENT 'pendiente=esperando respuesta profesor, aceptada=reunión creada, rechazada=profesor rechazó';

-- Agregar campo para referenciar la disponibilidad reservada
ALTER TABLE solicitudes_reunion
ADD COLUMN disponibilidad_id INT NULL COMMENT 'ID de la disponibilidad que fue reservada',
ADD INDEX idx_solicitud_disponibilidad (disponibilidad_id),
ADD CONSTRAINT fk_solicitud_disponibilidad 
    FOREIGN KEY (disponibilidad_id) REFERENCES disponibilidades(id) ON DELETE SET NULL;

-- ============================================
-- PASO 3: ACTUALIZAR DATOS EXISTENTES
-- ============================================

-- Convertir estados antiguos al nuevo sistema
UPDATE solicitudes_reunion 
SET estado = 'aceptada' 
WHERE estado IN ('aceptada_profesor', 'aceptada_estudiante', 'confirmada');

UPDATE solicitudes_reunion 
SET estado = 'rechazada' 
WHERE estado IN ('cancelada');

-- Marcar disponibilidades existentes como recurrentes (sin fecha específica)
UPDATE disponibilidades 
SET fecha_especifica = NULL 
WHERE fecha_especifica IS NULL;

-- ============================================
-- PASO 4: LIMPIAR TABLA historial_reuniones
-- ============================================

-- Simplificar acciones en historial
ALTER TABLE historial_reuniones
MODIFY COLUMN accion ENUM('solicitud_creada', 'reserva_realizada', 'aceptada', 'rechazada', 'cancelada', 'realizada') NOT NULL
COMMENT 'Nuevas acciones simplificadas del sistema de reservas';

-- ============================================
-- PASO 5: CREAR VISTAS ÚTILES
-- ============================================

-- Vista de horarios disponibles (no reservados y activos)
CREATE OR REPLACE VIEW v_horarios_disponibles AS
SELECT 
    d.id,
    d.usuario_rut,
    u.nombre as profesor_nombre,
    d.dia_semana,
    d.fecha_especifica,
    d.hora_inicio,
    d.hora_fin,
    d.activo,
    d.reservado,
    d.reservado_por,
    ue.nombre as reservado_por_nombre,
    d.fecha_reserva,
    d.solicitud_id
FROM disponibilidades d
INNER JOIN usuarios u ON d.usuario_rut = u.rut
LEFT JOIN usuarios ue ON d.reservado_por = ue.rut
WHERE d.activo = TRUE;

-- Vista de solicitudes pendientes con información completa
CREATE OR REPLACE VIEW v_solicitudes_pendientes AS
SELECT 
    sr.id,
    sr.proyecto_id,
    p.titulo as proyecto_titulo,
    sr.profesor_rut,
    up.nombre as profesor_nombre,
    sr.estudiante_rut,
    ue.nombre as estudiante_nombre,
    sr.fecha_propuesta,
    sr.hora_propuesta,
    sr.duracion_minutos,
    sr.tipo_reunion,
    sr.descripcion,
    sr.estado,
    sr.disponibilidad_id,
    d.dia_semana,
    d.fecha_especifica,
    sr.created_at,
    TIMESTAMPDIFF(HOUR, sr.created_at, NOW()) as horas_pendiente
FROM solicitudes_reunion sr
INNER JOIN proyectos p ON sr.proyecto_id = p.id
INNER JOIN usuarios up ON sr.profesor_rut = up.rut
INNER JOIN usuarios ue ON sr.estudiante_rut = ue.rut
LEFT JOIN disponibilidades d ON sr.disponibilidad_id = d.id
WHERE sr.estado = 'pendiente';

-- ============================================
-- PASO 6: CREAR PROCEDIMIENTOS ALMACENADOS
-- ============================================

DELIMITER //

-- Procedimiento para liberar horario cuando se rechaza
CREATE PROCEDURE liberar_horario_reservado(
    IN p_solicitud_id INT
)
BEGIN
    DECLARE v_disponibilidad_id INT;
    
    -- Obtener la disponibilidad asociada
    SELECT disponibilidad_id INTO v_disponibilidad_id
    FROM solicitudes_reunion
    WHERE id = p_solicitud_id;
    
    -- Liberar la disponibilidad
    IF v_disponibilidad_id IS NOT NULL THEN
        UPDATE disponibilidades
        SET reservado = FALSE,
            reservado_por = NULL,
            fecha_reserva = NULL,
            solicitud_id = NULL
        WHERE id = v_disponibilidad_id;
    END IF;
END//

-- Procedimiento para marcar horario como ocupado cuando se acepta
CREATE PROCEDURE ocupar_horario_definitivo(
    IN p_disponibilidad_id INT
)
BEGIN
    -- Marcar la disponibilidad como inactiva (ya fue usada)
    UPDATE disponibilidades
    SET activo = FALSE
    WHERE id = p_disponibilidad_id;
END//

DELIMITER ;

-- ============================================
-- PASO 7: CREAR TRIGGERS PARA AUTOMATIZACIÓN
-- ============================================

DELIMITER //

-- Trigger: Cuando se rechaza una solicitud, liberar el horario automáticamente
CREATE TRIGGER tr_solicitud_rechazada_liberar_horario
AFTER UPDATE ON solicitudes_reunion
FOR EACH ROW
BEGIN
    IF NEW.estado = 'rechazada' AND OLD.estado = 'pendiente' THEN
        CALL liberar_horario_reservado(NEW.id);
    END IF;
END//

-- Trigger: Cuando se acepta una solicitud, marcar horario como ocupado
CREATE TRIGGER tr_solicitud_aceptada_ocupar_horario
AFTER UPDATE ON solicitudes_reunion
FOR EACH ROW
BEGIN
    IF NEW.estado = 'aceptada' AND OLD.estado = 'pendiente' THEN
        IF NEW.disponibilidad_id IS NOT NULL THEN
            CALL ocupar_horario_definitivo(NEW.disponibilidad_id);
        END IF;
    END IF;
END//

DELIMITER ;

-- ============================================
-- PASO 8: CREAR ÍNDICES ADICIONALES
-- ============================================

-- Índice compuesto para búsquedas eficientes
CREATE INDEX idx_disponibilidad_profesor_activo_reservado 
ON disponibilidades(usuario_rut, activo, reservado, dia_semana);

-- Índice para solicitudes por estado y fecha
CREATE INDEX idx_solicitud_estado_fecha 
ON solicitudes_reunion(estado, fecha_propuesta, hora_propuesta);

-- ============================================
-- VERIFICACIÓN Y ESTADÍSTICAS
-- ============================================

-- Mostrar estadísticas después de la migración
SELECT 
    'Disponibilidades totales' as metrica,
    COUNT(*) as cantidad
FROM disponibilidades
UNION ALL
SELECT 
    'Disponibilidades activas no reservadas',
    COUNT(*)
FROM disponibilidades
WHERE activo = TRUE AND reservado = FALSE
UNION ALL
SELECT 
    'Disponibilidades reservadas',
    COUNT(*)
FROM disponibilidades
WHERE reservado = TRUE
UNION ALL
SELECT 
    'Solicitudes pendientes',
    COUNT(*)
FROM solicitudes_reunion
WHERE estado = 'pendiente'
UNION ALL
SELECT 
    'Solicitudes aceptadas',
    COUNT(*)
FROM solicitudes_reunion
WHERE estado = 'aceptada'
UNION ALL
SELECT 
    'Solicitudes rechazadas',
    COUNT(*)
FROM solicitudes_reunion
WHERE estado = 'rechazada';

-- =====================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================

-- NOTAS IMPORTANTES:
-- 1. Ejecutar este script en un ambiente de desarrollo primero
-- 2. Hacer backup de la base de datos antes de ejecutar en producción
-- 3. Verificar que las aplicaciones frontend y backend sean actualizadas
-- 4. Los triggers automatizarán la liberación/ocupación de horarios
-- 5. Las vistas facilitan las consultas en el código

SELECT '✅ Migración completada exitosamente' as resultado;
