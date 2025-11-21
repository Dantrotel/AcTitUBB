-- ========================================
-- MIGRACIÓN: UNIFICACIÓN DE SISTEMAS DE HITOS
-- ========================================
-- Fecha: 2025-11-19
-- Propósito: Unificar hitos_proyecto (simple) con hitos_cronograma (avanzado)
-- 
-- Este script:
-- 1. Agrega columnas faltantes a hitos_cronograma
-- 2. Migra datos de hitos_proyecto a hitos_cronograma
-- 3. Marca hitos_proyecto como DEPRECATED
-- ========================================

-- PASO 1: Mejorar tabla hitos_cronograma con funcionalidades del sistema simple
-- ==================================================================================

ALTER TABLE hitos_cronograma
  -- Agregar peso porcentual (para calcular progreso del proyecto)
  ADD COLUMN IF NOT EXISTS peso_en_proyecto DECIMAL(5,2) DEFAULT 0.00 
    CHECK (peso_en_proyecto >= 0 AND peso_en_proyecto <= 100)
    COMMENT 'Peso del hito en el proyecto (porcentaje, suma debe ser ≤100)',
  
  -- Agregar marcador de hito crítico
  ADD COLUMN IF NOT EXISTS es_critico BOOLEAN DEFAULT FALSE
    COMMENT 'Indica si el hito es crítico para el proyecto',
  
  -- Agregar dependencias entre hitos
  ADD COLUMN IF NOT EXISTS hito_predecesor_id INT NULL
    COMMENT 'ID del hito que debe completarse antes que este',
  
  -- Agregar quién creó el hito
  ADD COLUMN IF NOT EXISTS creado_por_rut VARCHAR(10) NULL
    COMMENT 'RUT del usuario que creó el hito',
  
  -- Agregar quién actualizó por última vez
  ADD COLUMN IF NOT EXISTS actualizado_por_rut VARCHAR(10) NULL
    COMMENT 'RUT del usuario que actualizó el hito',
  
  -- Agregar foreign keys
  ADD CONSTRAINT fk_hito_predecesor 
    FOREIGN KEY (hito_predecesor_id) 
    REFERENCES hitos_cronograma(id) 
    ON DELETE SET NULL,
  
  ADD CONSTRAINT fk_creado_por 
    FOREIGN KEY (creado_por_rut) 
    REFERENCES usuarios(rut),
  
  ADD CONSTRAINT fk_actualizado_por 
    FOREIGN KEY (actualizado_por_rut) 
    REFERENCES usuarios(rut);

-- Agregar índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_peso_critico ON hitos_cronograma(peso_en_proyecto, es_critico);
CREATE INDEX IF NOT EXISTS idx_predecesor ON hitos_cronograma(hito_predecesor_id);


-- PASO 2: Crear cronogramas por defecto para proyectos que no tienen
-- ====================================================================

-- Para cada proyecto que tiene hitos_proyecto pero NO tiene cronograma activo,
-- crear un cronograma "migrado" automáticamente

INSERT INTO cronogramas_proyecto (
  proyecto_id, 
  nombre_cronograma, 
  descripcion, 
  fecha_inicio, 
  fecha_fin_estimada, 
  activo, 
  creado_por_rut,
  aprobado_por_estudiante
)
SELECT 
  p.id,
  'Cronograma Migrado (Sistema Anterior)',
  'Cronograma creado automáticamente durante la migración del sistema simple de hitos',
  COALESCE(p.fecha_inicio, CURDATE()),
  COALESCE(p.fecha_entrega_estimada, DATE_ADD(CURDATE(), INTERVAL 6 MONTH)),
  TRUE,
  -- Obtener el profesor guía como creador
  (SELECT ap.profesor_rut 
   FROM asignaciones_proyectos ap 
   INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id 
   WHERE ap.proyecto_id = p.id 
     AND rp.nombre = 'profesor_guia' 
     AND ap.activo = TRUE 
   LIMIT 1),
  TRUE -- Ya aprobado automáticamente
FROM proyectos p
WHERE EXISTS (
  SELECT 1 FROM hitos_proyecto hp WHERE hp.proyecto_id = p.id
)
AND NOT EXISTS (
  SELECT 1 FROM cronogramas_proyecto cp 
  WHERE cp.proyecto_id = p.id AND cp.activo = TRUE
);


-- PASO 3: Migrar hitos_proyecto a hitos_cronograma
-- ==================================================

INSERT INTO hitos_cronograma (
  cronograma_id,
  proyecto_id,
  nombre_hito,
  descripcion,
  tipo_hito,
  fecha_limite,
  fecha_entrega,
  estado,
  porcentaje_avance,
  comentarios_estudiante,
  comentarios_profesor,
  calificacion,
  peso_en_proyecto,
  es_critico,
  hito_predecesor_id,
  creado_por_rut,
  actualizado_por_rut,
  created_at,
  updated_at
)
SELECT 
  -- Obtener el cronograma activo del proyecto (creado en PASO 2)
  (SELECT cp.id FROM cronogramas_proyecto cp 
   WHERE cp.proyecto_id = hp.proyecto_id AND cp.activo = TRUE LIMIT 1) as cronograma_id,
  
  hp.proyecto_id,
  hp.nombre,
  hp.descripcion,
  
  -- Mapear tipo_hito del sistema antiguo al nuevo
  CASE hp.tipo_hito
    WHEN 'documento' THEN 'entrega_documento'
    WHEN 'codigo' THEN 'entrega_documento'
    WHEN 'presentacion' THEN 'evaluacion'
    WHEN 'reunion' THEN 'reunion_seguimiento'
    ELSE 'entrega_documento'
  END,
  
  hp.fecha_objetivo,
  hp.fecha_completado,
  
  -- Mapear estados
  CASE hp.estado
    WHEN 'pendiente' THEN 'pendiente'
    WHEN 'en_progreso' THEN 'en_progreso'
    WHEN 'completado' THEN 'aprobado'
    WHEN 'retrasado' THEN 'retrasado'
    ELSE 'pendiente'
  END,
  
  hp.porcentaje_completado,
  hp.comentarios_estudiante,
  hp.comentarios_profesor,
  hp.calificacion,
  
  -- Campos nuevos del sistema unificado
  COALESCE(hp.peso_en_proyecto, 0),
  COALESCE(hp.es_critico, FALSE),
  NULL, -- hito_predecesor_id (se actualizará después)
  hp.creado_por_rut,
  hp.actualizado_por_rut,
  hp.created_at,
  hp.updated_at
FROM hitos_proyecto hp
WHERE EXISTS (
  -- Solo migrar si hay un cronograma activo para el proyecto
  SELECT 1 FROM cronogramas_proyecto cp 
  WHERE cp.proyecto_id = hp.proyecto_id AND cp.activo = TRUE
)
-- Evitar duplicados (si ya se migró antes)
AND NOT EXISTS (
  SELECT 1 FROM hitos_cronograma hc
  WHERE hc.proyecto_id = hp.proyecto_id 
    AND hc.nombre_hito = hp.nombre
    AND hc.fecha_limite = hp.fecha_objetivo
);


-- PASO 4: Migrar dependencias de hitos (predecesores)
-- ====================================================

-- Crear tabla temporal para mapear IDs antiguos a nuevos
CREATE TEMPORARY TABLE IF NOT EXISTS hitos_mapping (
  old_hito_id INT,
  new_hito_id INT,
  proyecto_id INT,
  nombre_hito VARCHAR(255),
  PRIMARY KEY (old_hito_id)
);

-- Llenar tabla de mapeo
INSERT INTO hitos_mapping (old_hito_id, new_hito_id, proyecto_id, nombre_hito)
SELECT 
  hp.id as old_hito_id,
  hc.id as new_hito_id,
  hp.proyecto_id,
  hp.nombre
FROM hitos_proyecto hp
INNER JOIN hitos_cronograma hc ON (
  hc.proyecto_id = hp.proyecto_id 
  AND hc.nombre_hito = hp.nombre
  AND hc.fecha_limite = hp.fecha_objetivo
);

-- Actualizar dependencias usando el mapeo
UPDATE hitos_cronograma hc
INNER JOIN hitos_mapping hm_actual ON hc.id = hm_actual.new_hito_id
INNER JOIN hitos_proyecto hp ON hp.id = hm_actual.old_hito_id
INNER JOIN hitos_mapping hm_predecesor ON hp.hito_predecesor_id = hm_predecesor.old_hito_id
SET hc.hito_predecesor_id = hm_predecesor.new_hito_id
WHERE hp.hito_predecesor_id IS NOT NULL;


-- PASO 5: Verificación de migración
-- ==================================

-- Crear tabla de reporte de migración
CREATE TABLE IF NOT EXISTS migracion_hitos_reporte (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fecha_migracion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  proyectos_con_cronograma_nuevo INT,
  hitos_migrados INT,
  hitos_con_dependencias INT,
  errores TEXT
);

-- Insertar reporte
INSERT INTO migracion_hitos_reporte (
  proyectos_con_cronograma_nuevo,
  hitos_migrados,
  hitos_con_dependencias
)
SELECT 
  (SELECT COUNT(*) FROM cronogramas_proyecto 
   WHERE nombre_cronograma = 'Cronograma Migrado (Sistema Anterior)'),
  (SELECT COUNT(*) FROM hitos_cronograma 
   WHERE creado_por_rut IS NOT NULL OR created_at < DATE_SUB(NOW(), INTERVAL 1 MINUTE)),
  (SELECT COUNT(*) FROM hitos_cronograma WHERE hito_predecesor_id IS NOT NULL);


-- PASO 6: Marcar tabla antigua como DEPRECATED
-- ==============================================

-- Renombrar tabla antigua (NO se elimina por seguridad)
RENAME TABLE hitos_proyecto TO hitos_proyecto_deprecated;

-- Agregar comentario de advertencia
ALTER TABLE hitos_proyecto_deprecated 
  COMMENT = '⚠️ DEPRECATED - Tabla antigua migrada a hitos_cronograma. NO USAR. Mantener solo por backup.';


-- PASO 7: Crear vista de compatibilidad (opcional)
-- =================================================

-- Si algún código antiguo aún usa hitos_proyecto, esta vista proporciona compatibilidad temporal
CREATE OR REPLACE VIEW hitos_proyecto AS
SELECT 
  hc.id,
  hc.proyecto_id,
  hc.nombre_hito as nombre,
  hc.descripcion,
  
  -- Mapear tipo_hito de vuelta al formato antiguo
  CASE 
    WHEN hc.tipo_hito = 'entrega_documento' THEN 'documento'
    WHEN hc.tipo_hito = 'evaluacion' THEN 'presentacion'
    WHEN hc.tipo_hito = 'reunion_seguimiento' THEN 'reunion'
    ELSE 'documento'
  END as tipo_hito,
  
  hc.fecha_limite as fecha_objetivo,
  
  -- Mapear estado
  CASE 
    WHEN hc.estado IN ('aprobado', 'revisado') THEN 'completado'
    WHEN hc.estado = 'entregado' THEN 'en_progreso'
    ELSE hc.estado
  END as estado,
  
  hc.porcentaje_avance as porcentaje_completado,
  hc.fecha_entrega as fecha_completado,
  hc.archivo_entrega as archivo_entregable,
  hc.comentarios_estudiante,
  hc.comentarios_profesor,
  hc.calificacion,
  hc.peso_en_proyecto,
  hc.es_critico,
  hc.hito_predecesor_id,
  hc.creado_por_rut,
  hc.actualizado_por_rut,
  hc.created_at,
  hc.updated_at
FROM hitos_cronograma hc;


-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

-- Mostrar resumen de la migración
SELECT 
  '=== RESUMEN DE MIGRACIÓN ===' as mensaje,
  (SELECT COUNT(*) FROM cronogramas_proyecto 
   WHERE nombre_cronograma LIKE '%Migrado%') as cronogramas_creados,
  (SELECT COUNT(*) FROM hitos_cronograma) as total_hitos_nuevos,
  (SELECT COUNT(*) FROM hitos_proyecto_deprecated) as hitos_antiguos_respaldados,
  (SELECT COUNT(*) FROM hitos_cronograma WHERE hito_predecesor_id IS NOT NULL) as hitos_con_dependencias,
  (SELECT COUNT(*) FROM hitos_cronograma WHERE peso_en_proyecto > 0) as hitos_con_peso;

-- Verificar integridad: proyectos sin cronograma pero con hitos antiguos
SELECT 
  '⚠️ ADVERTENCIA: Proyectos sin migrar' as alerta,
  COUNT(*) as cantidad
FROM proyectos p
WHERE EXISTS (SELECT 1 FROM hitos_proyecto_deprecated hp WHERE hp.proyecto_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM cronogramas_proyecto cp WHERE cp.proyecto_id = p.id AND cp.activo = TRUE)
HAVING cantidad > 0;

-- ========================================
-- NOTAS POST-MIGRACIÓN
-- ========================================
/*
IMPORTANTE:
1. La tabla hitos_proyecto_deprecated NO se elimina por seguridad
2. Se creó una vista hitos_proyecto para compatibilidad temporal
3. Actualizar el código del backend para usar solo hitos_cronograma
4. Eliminar funciones deprecated del código después de validar
5. Después de 1-2 meses sin problemas, se puede eliminar hitos_proyecto_deprecated

PRÓXIMOS PASOS:
1. Actualizar backend/src/models/project.model.js (deprecar funciones)
2. Actualizar backend/src/services/project.service.js (usar solo cronogramas)
3. Actualizar backend/src/controllers/project.controller.js
4. Actualizar backend/src/routes/project.route.js
5. Actualizar frontend para usar solo endpoints de cronogramas
6. Probar exhaustivamente
7. Deploy a producción
8. Monitorear por 1-2 meses
9. Eliminar tabla y vista deprecated

ROLLBACK (si algo falla):
  RENAME TABLE hitos_proyecto_deprecated TO hitos_proyecto;
  DROP VIEW IF EXISTS hitos_proyecto;
*/
