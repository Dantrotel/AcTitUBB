-- Script para limpiar datos corruptos en propuestas
-- CUIDADO: Esto limpiará los campos que tengan muchas "A" repetidas

USE actitubb;

-- Primero, hacer backup de los datos actuales
CREATE TABLE IF NOT EXISTS propuestas_backup_20251219 AS
SELECT * FROM propuestas;

-- Limpiar campos corruptos (con más de 100 caracteres "A" consecutivos)
UPDATE propuestas
SET 
    descripcion = CASE 
        WHEN descripcion REGEXP 'A{100,}' THEN 'Descripción pendiente de completar'
        ELSE descripcion
    END,
    objetivos_generales = CASE 
        WHEN objetivos_generales REGEXP 'A{100,}' THEN 'Objetivos generales pendientes'
        ELSE objetivos_generales
    END,
    objetivos_especificos = CASE 
        WHEN objetivos_especificos REGEXP 'A{100,}' THEN 'Objetivos específicos pendientes'
        ELSE objetivos_especificos
    END,
    metodologia_propuesta = CASE 
        WHEN metodologia_propuesta REGEXP 'A{100,}' THEN 'Metodología pendiente'
        ELSE metodologia_propuesta
    END,
    recursos_necesarios = CASE 
        WHEN recursos_necesarios REGEXP 'A{100,}' THEN NULL
        ELSE recursos_necesarios
    END,
    bibliografia = CASE 
        WHEN bibliografia REGEXP 'A{100,}' THEN NULL
        ELSE bibliografia
    END;

-- Verificar cambios
SELECT 
    id,
    titulo,
    LEFT(descripcion, 50) as descripcion_preview,
    LEFT(objetivos_generales, 50) as obj_gen_preview
FROM propuestas
WHERE id IN (1, 2, 3, 4);

-- Si los datos se ven bien, puedes eliminar el backup:
-- DROP TABLE propuestas_backup_20251219;
