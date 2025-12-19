-- Crear período de propuestas activo para desarrollo y testing
-- Ejecuta este SQL en tu base de datos MySQL

INSERT INTO periodos_propuestas (nombre, fecha_inicio, fecha_fin, activo, createdAt, updatedAt) 
VALUES (
    'Período de Desarrollo 2025', 
    '2025-01-01', 
    '2025-12-31', 
    1,
    NOW(),
    NOW()
);

-- Verificar que se creó correctamente
SELECT * FROM periodos_propuestas WHERE activo = 1;
