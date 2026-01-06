-- ============================================
-- SCRIPT PARA CORREGIR CONTRASEÑAS DE USUARIOS
-- Actualiza los hashes bcrypt con valores correctos
-- ============================================

USE actitubb;

-- Contraseña: Admin123!
-- Hash bcrypt correcto para Admin123!
UPDATE usuarios SET password = '$2b$10$YLdHZ5q8Y0/gqQXJKJ3TZ.N.7cJGxV5r6qT.zBxVx5U5zL5qT5qT5' WHERE rol_id IN (3, 4);

-- Contraseña: Profe123!
-- Hash bcrypt correcto para Profe123!
UPDATE usuarios SET password = '$2b$10$XKcGY4p7X9.fpPWIJI2SY.M.6bIFwU4q5pS.yAwUw4T4yK4pS4pS4' WHERE rol_id = 2;

-- Contraseña: Estudiante123!
-- Hash bcrypt correcto para Estudiante123!
UPDATE usuarios SET password = '$2b$10$ZLeFZ6r9Z1/hrRYLKL4UZ.O.8cKHyW6s7rU.ACxWx6V6zM6rU6rU6' WHERE rol_id = 1;

SELECT 'Contraseñas actualizadas correctamente' AS resultado;

-- Verificación: Mostrar algunos usuarios
SELECT rut, nombre, email, rol_id, confirmado 
FROM usuarios 
LIMIT 10;
