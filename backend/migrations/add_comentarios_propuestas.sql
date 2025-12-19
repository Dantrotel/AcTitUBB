-- Agregar columna comentarios a la tabla propuestas
ALTER TABLE propuestas 
ADD COLUMN comentarios TEXT NULL COMMENT 'Comentarios del profesor sobre la propuesta';
