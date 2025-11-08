-- ============================================
-- MIGRACIÓN SIMPLIFICADA - SISTEMA DE RESERVAS
-- Solo actualiza lo que falta
-- ============================================

USE AcTitUBB;

-- ============================================
-- PASO 1: CONVERTIR ESTADOS ANTIGUOS
-- ============================================

UPDATE solicitudes_reunion 
SET estado = 'aceptada' 
WHERE estado IN ('aceptada_profesor', 'aceptada_estudiante', 'confirmada');

UPDATE solicitudes_reunion 
SET estado = 'rechazada' 
WHERE estado = 'cancelada';

-- ============================================
-- PASO 2: SIMPLIFICAR ENUM DE ESTADOS
-- ============================================

ALTER TABLE solicitudes_reunion
MODIFY COLUMN estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente'
COMMENT 'pendiente=esperando respuesta profesor, aceptada=reunión creada, rechazada=profesor rechazó';

-- ============================================
-- PASO 3: AGREGAR DISPONIBILIDAD_ID SI NO EXISTE
-- ============================================

-- Verificar si la columna existe antes de agregarla
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'AcTitUBB'
AND TABLE_NAME = 'solicitudes_reunion'
AND COLUMN_NAME = 'disponibilidad_id';

SET @query = IF(@col_exists = 0,
    'ALTER TABLE solicitudes_reunion ADD COLUMN disponibilidad_id INT NULL COMMENT "ID de la disponibilidad que fue reservada", ADD INDEX idx_solicitud_disponibilidad (disponibilidad_id)',
    'SELECT "La columna disponibilidad_id ya existe" as Resultado');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- PASO 4: CREAR VISTA DE HORARIOS DISPONIBLES
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
-- PASO 5: CREAR VISTA DE SOLICITUDES PENDIENTES
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
-- PASO 6: CREAR STORED PROCEDURES
-- ============================================

DROP PROCEDURE IF EXISTS liberar_horario_reservado;

DELIMITER //
CREATE PROCEDURE liberar_horario_reservado(IN p_solicitud_id INT)
BEGIN
    -- Liberar disponibilidad cuando se rechaza una solicitud
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
    -- Marcar disponibilidad como inactiva cuando se acepta (reunión creada)
    UPDATE disponibilidades
    SET activo = FALSE
    WHERE id = p_disponibilidad_id;
END //
DELIMITER ;

-- ============================================
-- PASO 7: CREAR TRIGGERS
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
-- PASO 8: CREAR ÍNDICES COMPUESTOS
-- ============================================

-- Solo crear si no existe
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'AcTitUBB'
AND TABLE_NAME = 'disponibilidades'
AND INDEX_NAME = 'idx_disponibilidad_profesor_activo_reservado';

SET @query_idx1 = IF(@index_exists = 0,
    'CREATE INDEX idx_disponibilidad_profesor_activo_reservado ON disponibilidades(usuario_rut, activo, reservado)',
    'SELECT "Índice idx_disponibilidad_profesor_activo_reservado ya existe" as Resultado');

PREPARE stmt FROM @query_idx1;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice para solicitudes
SET @index_exists2 = 0;
SELECT COUNT(*) INTO @index_exists2
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'AcTitUBB'
AND TABLE_NAME = 'solicitudes_reunion'
AND INDEX_NAME = 'idx_solicitud_estado_fecha';

SET @query_idx2 = IF(@index_exists2 = 0,
    'CREATE INDEX idx_solicitud_estado_fecha ON solicitudes_reunion(estado, fecha_propuesta)',
    'SELECT "Índice idx_solicitud_estado_fecha ya existe" as Resultado');

PREPARE stmt FROM @query_idx2;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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

SHOW TRIGGERS WHERE `Table` = 'solicitudes_reunion';
