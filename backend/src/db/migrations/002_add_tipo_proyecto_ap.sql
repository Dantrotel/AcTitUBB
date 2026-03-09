-- ============================================================
-- MIGRACIÓN 002: Soporte para Actividad Práctica (AP)
-- ============================================================
-- Ejecutar una sola vez sobre la BD existente.
-- La database.sql ya incluye estas columnas para nuevas instalaciones.

-- 1. Agregar tipo_proyecto a propuestas
ALTER TABLE propuestas
  ADD COLUMN IF NOT EXISTS tipo_proyecto ENUM('PT','AP') NOT NULL DEFAULT 'PT'
  AFTER modalidad;

-- 2. Agregar tipo_proyecto, continua_ap y ap_origen_id a proyectos
ALTER TABLE proyectos
  ADD COLUMN IF NOT EXISTS tipo_proyecto  ENUM('PT','AP') NOT NULL DEFAULT 'PT'  AFTER modalidad,
  ADD COLUMN IF NOT EXISTS continua_ap    BOOLEAN         NOT NULL DEFAULT FALSE   AFTER tipo_proyecto,
  ADD COLUMN IF NOT EXISTS ap_origen_id   INT             NULL                     AFTER continua_ap;

-- 3. Ampliar el ENUM estado_detallado con las etapas reales del flujo
ALTER TABLE proyectos
  MODIFY COLUMN estado_detallado ENUM(
    -- heredado (compatibilidad)
    'inicializacion','planificacion','desarrollo_fase1','desarrollo_fase2',
    'testing','documentacion','revision_final','preparacion_defensa','defendido','cerrado',
    -- etapas PT
    'avance_con_nota','informe_final','defensa_titulo',
    'tramites_finales','acta_secretaria','verificar_deudas','biblioteca_formularios',
    -- etapas AP
    'avance1_ap','defensa_tema_ap','avance2_ap','final_ap'
  ) DEFAULT 'inicializacion';

-- 4. FK opcional: ap_origen_id → proyectos(id)
ALTER TABLE proyectos
  ADD CONSTRAINT fk_ap_origen
    FOREIGN KEY IF NOT EXISTS (ap_origen_id) REFERENCES proyectos(id)
    ON DELETE SET NULL;
