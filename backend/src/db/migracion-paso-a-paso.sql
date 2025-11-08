-- ============================================
-- MIGRACIÓN PASO A PASO - SISTEMA DE RESERVAS
-- ============================================

USE AcTitUBB;

-- ============================================
-- PASO 1: AMPLIAR ENUM TEMPORALMENTE
-- ============================================

ALTER TABLE solicitudes_reunion
MODIFY COLUMN estado ENUM(
    'pendiente', 
    'aceptada_profesor', 
    'aceptada_estudiante', 
    'confirmada', 
    'rechazada', 
    'cancelada',
    'aceptada'  -- Agregar nuevo estado temporalmente
) DEFAULT 'pendiente';

-- ============================================
-- PASO 2: CONVERTIR DATOS
-- ============================================

UPDATE solicitudes_reunion 
SET estado = 'aceptada' 
WHERE estado IN ('aceptada_profesor', 'aceptada_estudiante', 'confirmada');

UPDATE solicitudes_reunion 
SET estado = 'rechazada' 
WHERE estado = 'cancelada';

-- ============================================
-- PASO 3: SIMPLIFICAR ENUM (solo 3 estados)
-- ============================================

ALTER TABLE solicitudes_reunion
MODIFY COLUMN estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente'
COMMENT 'pendiente=esperando respuesta profesor, aceptada=reunión creada, rechazada=profesor rechazó';

-- ============================================
-- PASO 4: AGREGAR DISPONIBILIDAD_ID (si no existe)
-- ============================================

SET @col_exists = (SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'AcTitUBB' 
    AND TABLE_NAME = 'solicitudes_reunion' 
    AND COLUMN_NAME = 'disponibilidad_id');

SET @query = IF(@col_exists = 0,
    'ALTER TABLE solicitudes_reunion ADD COLUMN disponibilidad_id INT NULL COMMENT "ID de la disponibilidad que fue reservada"',
    'SELECT "disponibilidad_id ya existe" as Info');
    
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'AcTitUBB' 
    AND TABLE_NAME = 'solicitudes_reunion' 
    AND INDEX_NAME = 'idx_solicitud_disponibilidad');

SET @query2 = IF(@idx_exists = 0,
    'CREATE INDEX idx_solicitud_disponibilidad ON solicitudes_reunion(disponibilidad_id)',
    'SELECT "idx_solicitud_disponibilidad ya existe" as Info');
    
PREPARE stmt2 FROM @query2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- ============================================
-- PASO 5: CREAR VISTA DE HORARIOS DISPONIBLES
-- ============================================

DROP VIEW IF EXISTS v_horarios_disponibles;

CREATE VIEW v_horarios_disponibles AS
SELECT 
    d.id,
    d.usuario_rut as profesor_rut,
    u.nombre as profesor_nombre,
    u.email as profesor_email,
    d.dia_semana,
    d.hora_inicio,
    d.hora_fin,
    d.fecha_especifica,
    d.activo,
    d.reservado,
    d.reservado_por,
    d.fecha_reserva,
    d.created_at
FROM disponibilidades d
INNER JOIN usuarios u ON d.usuario_rut = u.rut
WHERE d.activo = TRUE AND d.reservado = FALSE;

-- ============================================
-- PASO 6: CREAR VISTA DE SOLICITUDES PENDIENTES
-- ============================================

DROP VIEW IF EXISTS v_solicitudes_pendientes;

CREATE VIEW v_solicitudes_pendientes AS
SELECT 
    sr.id,
    sr.proyecto_id,
    p.titulo as proyecto_titulo,
    sr.profesor_rut,
    prof.nombre as profesor_nombre,
    sr.estudiante_rut,
    est.nombre as estudiante_nombre,
    est.email as estudiante_email,
    sr.fecha_propuesta,
    sr.hora_propuesta,
    sr.duracion_minutos,
    sr.tipo_reunion,
    sr.descripcion,
    sr.estado,
    sr.disponibilidad_id,
    sr.created_at,
    TIMESTAMPDIFF(HOUR, sr.created_at, NOW()) as horas_pendiente
FROM solicitudes_reunion sr
INNER JOIN proyectos p ON sr.proyecto_id = p.id
INNER JOIN usuarios prof ON sr.profesor_rut = prof.rut
INNER JOIN usuarios est ON sr.estudiante_rut = est.rut
WHERE sr.estado = 'pendiente'
ORDER BY sr.created_at ASC;

-- ============================================
-- PASO 7: CREAR STORED PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS liberar_horario_reservado;

DELIMITER //
CREATE PROCEDURE liberar_horario_reservado(IN p_solicitud_id INT)
BEGIN
    UPDATE disponibilidades d
    INNER JOIN solicitudes_reunion sr ON d.solicitud_id = sr.id
    SET 
        d.reservado = FALSE,
        d.reservado_por = NULL,
        d.fecha_reserva = NULL,
        d.solicitud_id = NULL
    WHERE sr.id = p_solicitud_id;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS ocupar_horario_definitivo;

DELIMITER //
CREATE PROCEDURE ocupar_horario_definitivo(IN p_disponibilidad_id INT)
BEGIN
    UPDATE disponibilidades
    SET activo = FALSE
    WHERE id = p_disponibilidad_id;
END //
DELIMITER ;

-- ============================================
-- PASO 8: CREAR TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS tr_solicitud_rechazada_liberar_horario;

DELIMITER //
CREATE TRIGGER tr_solicitud_rechazada_liberar_horario
AFTER UPDATE ON solicitudes_reunion
FOR EACH ROW
BEGIN
    IF NEW.estado = 'rechazada' AND OLD.estado = 'pendiente' THEN
        CALL liberar_horario_reservado(NEW.id);
    END IF;
END //
DELIMITER ;

DROP TRIGGER IF EXISTS tr_solicitud_aceptada_ocupar_horario;

DELIMITER //
CREATE TRIGGER tr_solicitud_aceptada_ocupar_horario
AFTER UPDATE ON solicitudes_reunion
FOR EACH ROW
BEGIN
    IF NEW.estado = 'aceptada' AND OLD.estado = 'pendiente' AND NEW.disponibilidad_id IS NOT NULL THEN
        CALL ocupar_horario_definitivo(NEW.disponibilidad_id);
    END IF;
END //
DELIMITER ;

-- ============================================
-- PASO 9: CREAR ÍNDICES COMPUESTOS
-- ============================================

SET @idx1 = (SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'AcTitUBB' 
    AND TABLE_NAME = 'disponibilidades' 
    AND INDEX_NAME = 'idx_disponibilidad_profesor_activo_reservado');

SET @query_idx1 = IF(@idx1 = 0,
    'CREATE INDEX idx_disponibilidad_profesor_activo_reservado ON disponibilidades(usuario_rut, activo, reservado)',
    'SELECT "idx_disponibilidad_profesor_activo_reservado ya existe" as Info');
    
PREPARE stmt_idx1 FROM @query_idx1;
EXECUTE stmt_idx1;
DEALLOCATE PREPARE stmt_idx1;

SET @idx2 = (SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'AcTitUBB' 
    AND TABLE_NAME = 'solicitudes_reunion' 
    AND INDEX_NAME = 'idx_solicitud_estado_fecha');

SET @query_idx2 = IF(@idx2 = 0,
    'CREATE INDEX idx_solicitud_estado_fecha ON solicitudes_reunion(estado, fecha_propuesta)',
    'SELECT "idx_solicitud_estado_fecha ya existe" as Info');
    
PREPARE stmt_idx2 FROM @query_idx2;
EXECUTE stmt_idx2;
DEALLOCATE PREPARE stmt_idx2;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT '✅ Migración completada exitosamente!' as Estado;

SELECT 
    COUNT(*) as total_disponibilidades,
    SUM(CASE WHEN activo = TRUE THEN 1 ELSE 0 END) as activas,
    SUM(CASE WHEN reservado = TRUE THEN 1 ELSE 0 END) as reservadas
FROM disponibilidades;

SELECT 
    COUNT(*) as total_solicitudes,
    SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
    SUM(CASE WHEN estado = 'aceptada' THEN 1 ELSE 0 END) as aceptadas,
    SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rechazadas
FROM solicitudes_reunion;

SELECT 'Triggers creados:' as Info;
SHOW TRIGGERS WHERE `Table` = 'solicitudes_reunion';
