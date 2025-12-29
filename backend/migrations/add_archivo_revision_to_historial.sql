-- Agregar columnas archivo_revision y nombre_archivo_original a historial_revisiones_propuestas
-- Estas columnas permiten adjuntar archivos a las revisiones de propuestas

ALTER TABLE historial_revisiones_propuestas 
ADD COLUMN IF NOT EXISTS archivo_revision VARCHAR(255) NULL COMMENT 'Archivo adjunto a esta revisión';

ALTER TABLE historial_revisiones_propuestas 
ADD COLUMN IF NOT EXISTS nombre_archivo_original VARCHAR(255) NULL COMMENT 'Nombre original del archivo adjunto';

