USE actitubb;

-- Verificar si la columna ya existe antes de agregarla
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'actitubb' 
AND TABLE_NAME = 'usuarios' 
AND COLUMN_NAME = 'debe_cambiar_password';

-- Agregar la columna solo si no existe
SET @query = IF(@col_exists = 0,
    'ALTER TABLE usuarios ADD COLUMN debe_cambiar_password BOOLEAN DEFAULT FALSE COMMENT "Indica si el usuario debe cambiar su contraseña en el próximo login (contraseña temporal)" AFTER confirmado',
    'SELECT "La columna debe_cambiar_password ya existe" as status');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Script ejecutado exitosamente' as status;
