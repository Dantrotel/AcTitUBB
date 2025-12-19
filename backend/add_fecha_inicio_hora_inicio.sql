-- Agregar columnas fecha_inicio y hora_inicio a la tabla fechas
-- para soportar períodos con rangos de fechas

USE actitubb;

-- Agregar fecha_inicio (opcional)
ALTER TABLE fechas
ADD COLUMN fecha_inicio DATE NULL COMMENT 'Fecha de inicio del período (opcional)' 
AFTER descripcion;

-- Agregar hora_inicio (por defecto 00:00:00)
ALTER TABLE fechas
ADD COLUMN hora_inicio TIME DEFAULT '00:00:00' COMMENT 'Hora de inicio del período'
AFTER fecha_inicio;

-- Verificar cambios
DESCRIBE fechas;

SELECT 'Columnas agregadas exitosamente: fecha_inicio y hora_inicio' AS resultado;
