-- Agregar columna hora_limite a la tabla fechas
USE actitubb;

-- Agregar la columna hora_limite si no existe
ALTER TABLE fechas 
ADD COLUMN IF NOT EXISTS hora_limite TIME DEFAULT '23:59:59' 
COMMENT 'Hora límite para entregas (por defecto fin del día)' 
AFTER fecha;

-- Verificar que se agregó correctamente
DESCRIBE fechas;
