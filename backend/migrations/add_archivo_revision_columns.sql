-- Agregar columnas para archivo de revisión en la tabla propuestas
ALTER TABLE propuestas 
ADD COLUMN archivo_revision VARCHAR(255) NULL COMMENT 'Nombre del archivo revisado subido por el profesor',
ADD COLUMN nombre_archivo_revision_original VARCHAR(255) NULL COMMENT 'Nombre original del archivo de revisión';

-- Agregar columnas en la tabla de historial
ALTER TABLE historial_revisiones_propuestas
ADD COLUMN archivo_revision VARCHAR(255) NULL COMMENT 'Archivo adjunto a esta revisión',
ADD COLUMN nombre_archivo_original VARCHAR(255) NULL COMMENT 'Nombre original del archivo adjunto';
