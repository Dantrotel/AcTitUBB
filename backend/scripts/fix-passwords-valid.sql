-- Script para actualizar las contraseñas con hashes bcrypt válidos
-- Generado: 2025-01-22

-- Hashes generados:
-- Admin123!     -> $2b$10$87yMBHq3fgH1pS0M/FtpFeV2Y2QWGdxdSk/2wfwZ4.lVLM5ie79.W
-- Profe123!     -> $2b$10$r3EdLjGXpFZfC2wEbOGD..vC86ry3/MYSB4aPAOpIbzHzK4v.NVXi
-- Estudiante123! -> $2b$10$ekQnJzqFyngwori0fgOML.nWpw5wn3P5gDDgpd7MzxPwl5Ud1GsyC

-- Actualizar contraseñas para Super Admin y Admins (roles 3 y 4)
-- Contraseña: Admin123!
UPDATE usuarios 
SET password = '$2b$10$87yMBHq3fgH1pS0M/FtpFeV2Y2QWGdxdSk/2wfwZ4.lVLM5ie79.W'
WHERE rol_id IN (3, 4);

-- Actualizar contraseñas para Profesores (rol 2)
-- Contraseña: Profe123!
UPDATE usuarios 
SET password = '$2b$10$r3EdLjGXpFZfC2wEbOGD..vC86ry3/MYSB4aPAOpIbzHzK4v.NVXi'
WHERE rol_id = 2;

-- Actualizar contraseñas para Estudiantes (rol 1)
-- Contraseña: Estudiante123!
UPDATE usuarios 
SET password = '$2b$10$ekQnJzqFyngwori0fgOML.nWpw5wn3P5gDDgpd7MzxPwl5Ud1GsyC'
WHERE rol_id = 1;

-- Verificar actualizaciones
SELECT 
    'Super Admin/Admin' as tipo,
    COUNT(*) as total_usuarios
FROM usuarios 
WHERE rol_id IN (3, 4)
UNION ALL
SELECT 
    'Profesores' as tipo,
    COUNT(*) as total_usuarios
FROM usuarios 
WHERE rol_id = 2
UNION ALL
SELECT 
    'Estudiantes' as tipo,
    COUNT(*) as total_usuarios
FROM usuarios 
WHERE rol_id = 1;

-- Mostrar algunos usuarios de ejemplo
SELECT 
    u.rut,
    u.nombre,
    u.email,
    CASE u.rol_id
        WHEN 1 THEN 'Estudiante → Estudiante123!'
        WHEN 2 THEN 'Profesor → Profe123!'
        WHEN 3 THEN 'Admin → Admin123!'
        WHEN 4 THEN 'Super Admin → Admin123!'
    END as 'Rol y Contraseña'
FROM usuarios u
ORDER BY u.rol_id DESC, u.rut
LIMIT 10;
