-- Migración 007: Agregar columnas de retroalimentación a hitos_cronograma
ALTER TABLE hitos_cronograma
    ADD COLUMN IF NOT EXISTS archivo_retroalimentacion VARCHAR(255) NULL AFTER calificacion,
    ADD COLUMN IF NOT EXISTS nombre_archivo_retroalimentacion VARCHAR(255) NULL AFTER archivo_retroalimentacion;
