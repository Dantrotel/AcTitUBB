-- ============================================
-- MIGRACIÓN A TABLA UNIFICADA DE FECHAS
-- ============================================
-- Este script migra datos de fechas_calendario y fechas_importantes
-- a la nueva tabla unificada 'fechas'
--
-- IMPORTANTE: Ejecutar este script SOLO UNA VEZ
-- Las tablas antiguas se renombran como backup

USE actitubb;

-- ============================================
-- PASO 1: Crear tabla unificada
-- ============================================

CREATE TABLE IF NOT EXISTS fechas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Información básica
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL COMMENT 'Fecha principal del evento',
    
    -- Tipo y categorización
    tipo_fecha ENUM(
        'entrega_propuesta', 
        'entrega', 
        'entrega_avance', 
        'entrega_final',
        'reunion', 
        'hito', 
        'deadline', 
        'presentacion', 
        'defensa', 
        'revision',
        'academica',
        'global',
        'otro'
    ) DEFAULT 'otro',
    
    -- Visibilidad y alcance
    es_global BOOLEAN DEFAULT FALSE COMMENT 'Si es true, visible para todos (fechas del admin)',
    activa BOOLEAN DEFAULT TRUE COMMENT 'Para soft delete (solo fechas de calendario)',
    
    -- Control de períodos (para fechas importantes)
    habilitada BOOLEAN DEFAULT TRUE COMMENT 'Controla si el período está activo para recibir entregas',
    permite_extension BOOLEAN DEFAULT TRUE COMMENT 'Si permite solicitar extensión después de la fecha límite',
    requiere_entrega BOOLEAN DEFAULT FALSE COMMENT 'Si requiere entrega de archivos/documentos',
    
    -- Estado de completitud
    completada BOOLEAN DEFAULT FALSE,
    fecha_realizada DATE NULL COMMENT 'Fecha en que se completó el evento',
    notas TEXT,
    
    -- Relaciones
    proyecto_id INT NULL COMMENT 'NULL para fechas globales, ID del proyecto para fechas específicas',
    creado_por_rut VARCHAR(10) NOT NULL COMMENT 'RUT del que creó la fecha (admin o profesor)',
    profesor_rut VARCHAR(10) NULL COMMENT 'RUT del profesor (para fechas específicas profesor-estudiante)',
    estudiante_rut VARCHAR(10) NULL COMMENT 'RUT del estudiante (para fechas específicas)',
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut),
    
    -- Índices para mejorar performance
    INDEX idx_fecha (fecha),
    INDEX idx_tipo_fecha (tipo_fecha),
    INDEX idx_es_global (es_global),
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_activa (activa),
    INDEX idx_habilitada (habilitada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PASO 2: Migrar datos de fechas_calendario
-- ============================================

INSERT INTO fechas (
    titulo, descripcion, fecha, tipo_fecha, es_global, activa,
    creado_por_rut, profesor_rut, estudiante_rut,
    created_at, updated_at,
    -- Valores por defecto para campos de fechas_importantes
    habilitada, permite_extension, requiere_entrega, completada
)
SELECT 
    fc.titulo, 
    fc.descripcion, 
    fc.fecha, 
    fc.tipo_fecha, 
    fc.es_global, 
    fc.activa,
    fc.creado_por_rut, 
    fc.profesor_rut, 
    fc.estudiante_rut,
    fc.created_at, 
    fc.updated_at,
    TRUE, TRUE, FALSE, FALSE
FROM fechas_calendario fc
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = DATABASE() AND table_name = 'fechas_calendario'
)
AND NOT EXISTS (
    -- Evitar duplicados si ya se ejecutó la migración
    SELECT 1 FROM fechas f 
    WHERE f.titulo = fc.titulo 
    AND f.fecha = fc.fecha
    AND f.creado_por_rut = fc.creado_por_rut
);

SELECT CONCAT('✅ Migradas ', ROW_COUNT(), ' fechas desde fechas_calendario') as resultado;

-- ============================================
-- PASO 3: Migrar datos de fechas_importantes
-- ============================================

INSERT INTO fechas (
    titulo, descripcion, fecha, tipo_fecha, es_global, activa,
    habilitada, permite_extension, requiere_entrega, completada, fecha_realizada, notas,
    proyecto_id, creado_por_rut,
    created_at, updated_at,
    -- Valores por defecto para campos de fechas_calendario
    profesor_rut, estudiante_rut
)
SELECT 
    fi.titulo, 
    fi.descripcion, 
    fi.fecha_limite as fecha, 
    fi.tipo_fecha, 
    fi.es_global, 
    TRUE as activa,
    fi.habilitada, 
    fi.permite_extension, 
    fi.requiere_entrega, 
    fi.completada, 
    fi.fecha_realizada, 
    fi.notas,
    fi.proyecto_id, 
    fi.creado_por as creado_por_rut,
    fi.created_at, 
    fi.updated_at,
    NULL, NULL
FROM fechas_importantes fi
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = DATABASE() AND table_name = 'fechas_importantes'
)
AND NOT EXISTS (
    -- Evitar duplicados: no insertar si ya existe una fecha con el mismo título y fecha
    SELECT 1 FROM fechas f 
    WHERE f.titulo = fi.titulo 
    AND f.fecha = fi.fecha_limite
    AND (f.creado_por_rut = fi.creado_por OR (f.creado_por_rut IS NULL AND fi.creado_por IS NULL))
);

SELECT CONCAT('✅ Migradas ', ROW_COUNT(), ' fechas desde fechas_importantes') as resultado;

-- ============================================
-- PASO 4: Verificar migración
-- ============================================

SELECT 
    'fechas_calendario' as tabla_origen,
    COUNT(*) as total_registros
FROM fechas_calendario
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = DATABASE() AND table_name = 'fechas_calendario'
)
UNION ALL
SELECT 
    'fechas_importantes' as tabla_origen,
    COUNT(*) as total_registros
FROM fechas_importantes
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = DATABASE() AND table_name = 'fechas_importantes'
)
UNION ALL
SELECT 
    'fechas (nueva)' as tabla_origen,
    COUNT(*) as total_registros
FROM fechas;

-- ============================================
-- PASO 5: Renombrar tablas antiguas (BACKUP)
-- ============================================

-- Renombrar fechas_calendario a fechas_calendario_old
RENAME TABLE fechas_calendario TO fechas_calendario_old;
SELECT '✅ Tabla fechas_calendario renombrada a fechas_calendario_old' as resultado;

-- Renombrar fechas_importantes a fechas_importantes_old
RENAME TABLE fechas_importantes TO fechas_importantes_old;
SELECT '✅ Tabla fechas_importantes renombrada a fechas_importantes_old' as resultado;

-- ============================================
-- PASO 6: Verificación final
-- ============================================

SELECT 
    '🎉 MIGRACIÓN COMPLETADA' as estado,
    (SELECT COUNT(*) FROM fechas) as total_fechas_migradas,
    (SELECT COUNT(*) FROM fechas WHERE es_global = TRUE) as fechas_globales,
    (SELECT COUNT(*) FROM fechas WHERE proyecto_id IS NOT NULL) as fechas_proyectos,
    (SELECT COUNT(*) FROM fechas WHERE profesor_rut IS NOT NULL) as fechas_profesor_estudiante;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- 1. Las tablas antiguas se renombraron a:
--    - fechas_calendario_old
--    - fechas_importantes_old
--
-- 2. Si necesitas revertir la migración:
--    DROP TABLE fechas;
--    RENAME TABLE fechas_calendario_old TO fechas_calendario;
--    RENAME TABLE fechas_importantes_old TO fechas_importantes;
--
-- 3. Después de verificar que todo funciona correctamente,
--    puedes eliminar las tablas antiguas:
--    DROP TABLE fechas_calendario_old;
--    DROP TABLE fechas_importantes_old;
--
-- ============================================

