-- =====================================================
-- ACTUALIZACIÓN DE TIPOS DE FECHA EN EL SISTEMA
-- =====================================================
-- Este script actualiza las tablas para soportar todos los tipos de fecha
-- necesarios para el correcto funcionamiento del sistema de titulación

USE actitubb;

-- =====================================================
-- 1. ACTUALIZAR TABLA: fechas_calendario
-- =====================================================
-- Modificar el ENUM para incluir todos los nuevos tipos de fecha
ALTER TABLE fechas_calendario 
MODIFY COLUMN tipo_fecha ENUM(
    -- Académicas
    'academica',
    'inicio_semestre',
    'fin_semestre',
    'feriado',
    'receso',
    -- Propuestas
    'entrega_propuesta',
    'revision_propuesta',
    -- Entregas
    'entrega',
    'entrega_avance',
    'entrega_parcial',
    'entrega_final',
    -- Evaluaciones
    'evaluacion',
    'revision',
    'presentacion',
    'defensa',
    'defensa_parcial',
    -- Reuniones
    'reunion',
    'seguimiento',
    'orientacion',
    -- Hitos
    'hito',
    'deadline',
    'plazo_extension',
    -- Globales y otros
    'global',
    'otro'
) DEFAULT 'otro' COMMENT 'Tipo de fecha para clasificación y visualización';

-- =====================================================
-- 2. ACTUALIZAR TABLA: fechas_importantes
-- =====================================================
-- Modificar el ENUM para incluir todos los tipos relevantes a proyectos
ALTER TABLE fechas_importantes 
MODIFY COLUMN tipo_fecha ENUM(
    -- Propuestas
    'entrega_propuesta',
    'revision_propuesta',
    -- Entregas
    'entrega',
    'entrega_avance',
    'entrega_parcial',
    'entrega_final',
    -- Evaluaciones
    'evaluacion',
    'revision',
    'revision_parcial',
    'presentacion',
    'defensa',
    'defensa_parcial',
    -- Reuniones
    'reunion',
    'seguimiento',
    'orientacion',
    -- Hitos y plazos
    'hito',
    'deadline',
    'plazo_extension',
    -- Otros
    'otro'
) DEFAULT 'otro' COMMENT 'Tipo de fecha importante asociada al proyecto';

-- =====================================================
-- 3. INSERTAR DATOS DE EJEMPLO CON NUEVOS TIPOS
-- =====================================================
-- Agregar fechas globales de ejemplo para el sistema

-- Fechas Académicas
INSERT IGNORE INTO fechas_calendario 
    (titulo, descripcion, fecha, tipo_fecha, es_global, creado_por_rut, activa) 
VALUES
    ('Inicio Semestre 1-2025', 'Inicio del primer semestre académico 2025', '2025-03-01', 'inicio_semestre', TRUE, '11111111-1', TRUE),
    ('Fin Semestre 1-2025', 'Finalización del primer semestre académico 2025', '2025-07-15', 'fin_semestre', TRUE, '11111111-1', TRUE),
    ('Día del Trabajo', 'Feriado nacional - No hay actividades académicas', '2025-05-01', 'feriado', TRUE, '11111111-1', TRUE),
    ('Receso Invernal', 'Semana de receso académico', '2025-07-16', 'receso', TRUE, '11111111-1', TRUE);

-- Fechas de Propuestas
INSERT IGNORE INTO fechas_calendario 
    (titulo, descripcion, fecha, tipo_fecha, es_global, creado_por_rut, activa) 
VALUES
    ('Apertura Período Propuestas', 'Inicio del período para envío de propuestas de título', '2025-03-10', 'entrega_propuesta', TRUE, '11111111-1', TRUE),
    ('Cierre Período Propuestas', 'Fecha límite para envío de propuestas de título', '2025-04-15', 'entrega_propuesta', TRUE, '11111111-1', TRUE),
    ('Inicio Revisión Propuestas', 'Profesores comienzan revisión de propuestas', '2025-04-16', 'revision_propuesta', TRUE, '11111111-1', TRUE);

-- Fechas de Entregas y Avances
INSERT IGNORE INTO fechas_calendario 
    (titulo, descripcion, fecha, tipo_fecha, es_global, creado_por_rut, activa) 
VALUES
    ('Primera Entrega de Avance', 'Fecha límite para primera entrega de avance de proyectos', '2025-04-30', 'entrega_avance', TRUE, '11111111-1', TRUE),
    ('Segunda Entrega de Avance', 'Fecha límite para segunda entrega de avance de proyectos', '2025-05-31', 'entrega_avance', TRUE, '11111111-1', TRUE),
    ('Entrega Parcial', 'Fecha límite para entrega parcial de proyectos', '2025-06-15', 'entrega_parcial', TRUE, '11111111-1', TRUE),
    ('Entrega Final/Memoria', 'Fecha límite para entrega de documento final/memoria', '2025-06-30', 'entrega_final', TRUE, '11111111-1', TRUE);

-- Fechas de Evaluaciones y Defensas
INSERT IGNORE INTO fechas_calendario 
    (titulo, descripcion, fecha, tipo_fecha, es_global, creado_por_rut, activa) 
VALUES
    ('Evaluación Primer Avance', 'Período de evaluación del primer avance', '2025-05-05', 'evaluacion', TRUE, '11111111-1', TRUE),
    ('Presentación Intermedia', 'Presentaciones intermedias de proyectos', '2025-06-01', 'presentacion', TRUE, '11111111-1', TRUE),
    ('Defensas Parciales', 'Semana de defensas parciales', '2025-06-20', 'defensa_parcial', TRUE, '11111111-1', TRUE),
    ('Defensas Finales', 'Semana de defensas finales de título', '2025-07-08', 'defensa', TRUE, '11111111-1', TRUE);

-- =====================================================
-- 4. CREAR ÍNDICES ADICIONALES PARA MEJOR RENDIMIENTO
-- =====================================================
-- Índices para búsquedas por tipo de fecha
CREATE INDEX IF NOT EXISTS idx_fechas_calendario_tipo_fecha 
ON fechas_calendario(tipo_fecha, fecha);

CREATE INDEX IF NOT EXISTS idx_fechas_importantes_tipo_fecha 
ON fechas_importantes(tipo_fecha, fecha_limite);

-- =====================================================
-- 5. VERIFICACIÓN DE DATOS
-- =====================================================
-- Consultar las fechas globales creadas agrupadas por tipo
SELECT 
    tipo_fecha,
    COUNT(*) as cantidad,
    MIN(fecha) as primera_fecha,
    MAX(fecha) as ultima_fecha
FROM fechas_calendario 
WHERE es_global = TRUE AND activa = TRUE
GROUP BY tipo_fecha
ORDER BY primera_fecha;

-- Mostrar resumen de actualización
SELECT 
    'Tipos de fecha actualizados correctamente' as status,
    (SELECT COUNT(DISTINCT tipo_fecha) FROM fechas_calendario) as tipos_diferentes_calendario,
    (SELECT COUNT(*) FROM fechas_calendario WHERE es_global = TRUE) as fechas_globales_totales;
