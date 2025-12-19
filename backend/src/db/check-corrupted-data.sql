-- Script para verificar datos corruptos en propuestas
-- Ejecuta esto en MySQL para ver qué propuesta tiene el problema

USE actitubb;

-- Ver la propuesta ID 1
SELECT 
    id,
    titulo,
    LENGTH(titulo) as titulo_length,
    LENGTH(descripcion) as descripcion_length,
    LENGTH(objetivos_generales) as obj_gen_length,
    LENGTH(objetivos_especificos) as obj_esp_length,
    LEFT(descripcion, 100) as descripcion_preview,
    LEFT(objetivos_generales, 100) as obj_gen_preview
FROM propuestas
WHERE id = 1;

-- Ver todas las propuestas con campos muy largos (posiblemente corruptos)
SELECT 
    id,
    titulo,
    LENGTH(descripcion) as desc_len,
    LENGTH(objetivos_generales) as obj_gen_len,
    LENGTH(objetivos_especificos) as obj_esp_len
FROM propuestas
WHERE 
    LENGTH(descripcion) > 10000
    OR LENGTH(objetivos_generales) > 5000
    OR LENGTH(objetivos_especificos) > 5000
ORDER BY desc_len DESC;

-- Ver si hay caracteres raros
SELECT 
    id,
    titulo,
    SUBSTRING(descripcion, 1, 200) as descripcion_inicio
FROM propuestas
WHERE 
    descripcion LIKE '%AAAA%'
    OR objetivos_generales LIKE '%AAAA%'
    OR objetivos_especificos LIKE '%AAAA%';
