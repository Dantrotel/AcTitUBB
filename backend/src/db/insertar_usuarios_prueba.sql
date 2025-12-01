-- ============================================
-- Script para insertar 10 profesores y 20 estudiantes
-- Carreras: ICINF (id=1), IECCI (id=2)
-- Departamento: Departamento de Ciencias de la Computación y Tecnologías de Información (id=1)
-- Ninguno tiene correo (email = NULL)
-- ============================================

USE actitubb;

-- ============================================
-- INSERTAR 10 PROFESORES
-- ============================================
-- Contraseña por defecto: 1234 (hash: $2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe)
-- NOTA: El campo email tiene restricción NOT NULL, por lo que se usa un formato ficticio único
-- que indica que el usuario no tiene correo real
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('20000001-1', 'Profesor Juan Pérez', 'sin-correo-20000001-1@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('20000002-2', 'Profesora María González', 'sin-correo-20000002-2@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('20000003-3', 'Profesor Carlos Rodríguez', 'sin-correo-20000003-3@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('20000004-4', 'Profesora Ana Martínez', 'sin-correo-20000004-4@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('20000005-5', 'Profesor Luis Fernández', 'sin-correo-20000005-5@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('20000006-6', 'Profesora Carmen López', 'sin-correo-20000006-6@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('20000007-7', 'Profesor Roberto Sánchez', 'sin-correo-20000007-7@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('20000008-8', 'Profesora Patricia Ramírez', 'sin-correo-20000008-8@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('20000009-9', 'Profesor Diego Torres', 'sin-correo-20000009-9@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('20000010-0', 'Profesora Laura Jiménez', 'sin-correo-20000010-0@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0);

-- Asociar profesores al departamento (Departamento de Ciencias de la Computación y Tecnologías de Información, id=1)
INSERT INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso, activo) VALUES
('20000001-1', 1, TRUE, CURDATE(), TRUE),
('20000002-2', 1, TRUE, CURDATE(), TRUE),
('20000003-3', 1, TRUE, CURDATE(), TRUE),
('20000004-4', 1, TRUE, CURDATE(), TRUE),
('20000005-5', 1, TRUE, CURDATE(), TRUE),
('20000006-6', 1, TRUE, CURDATE(), TRUE),
('20000007-7', 1, TRUE, CURDATE(), TRUE),
('20000008-8', 1, TRUE, CURDATE(), TRUE),
('20000009-9', 1, TRUE, CURDATE(), TRUE),
('20000010-0', 1, TRUE, CURDATE(), TRUE);

-- ============================================
-- INSERTAR 20 ESTUDIANTES
-- ============================================
-- 10 estudiantes en ICINF (id=1)
-- 10 estudiantes en IECCI (id=2)
-- Contraseña por defecto: 1234 (hash: $2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe)

-- Estudiantes ICINF (id=1)
-- NOTA: El campo email tiene restricción NOT NULL, por lo que se usa un formato ficticio único
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('10000001-1', 'Estudiante Andrés Silva', 'sin-correo-10000001-1@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000002-2', 'Estudiante Beatriz Morales', 'sin-correo-10000002-2@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000003-3', 'Estudiante Cristian Vega', 'sin-correo-10000003-3@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000004-4', 'Estudiante Daniela Castro', 'sin-correo-10000004-4@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000005-5', 'Estudiante Eduardo Rojas', 'sin-correo-10000005-5@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000006-6', 'Estudiante Francisca Díaz', 'sin-correo-10000006-6@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000007-7', 'Estudiante Gabriel Herrera', 'sin-correo-10000007-7@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000008-8', 'Estudiante Isabel Muñoz', 'sin-correo-10000008-8@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000009-9', 'Estudiante Javier Contreras', 'sin-correo-10000009-9@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000010-0', 'Estudiante Karen Valenzuela', 'sin-correo-10000010-0@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0);

-- Estudiantes IECCI (id=2)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('10000011-1', 'Estudiante Leonardo Espinoza', 'sin-correo-10000011-1@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000012-2', 'Estudiante Marcela Fuentes', 'sin-correo-10000012-2@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000013-3', 'Estudiante Nicolás Guzmán', 'sin-correo-10000013-3@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000014-4', 'Estudiante Olivia Henríquez', 'sin-correo-10000014-4@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000015-5', 'Estudiante Pablo Ibáñez', 'sin-correo-10000015-5@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000016-6', 'Estudiante Quintina Jara', 'sin-correo-10000016-6@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000017-7', 'Estudiante Rafael Karmy', 'sin-correo-10000017-7@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000018-8', 'Estudiante Sofía Lira', 'sin-correo-10000018-8@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000019-9', 'Estudiante Tomás Méndez', 'sin-correo-10000019-9@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('10000020-0', 'Estudiante Valentina Núñez', 'sin-correo-10000020-0@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0);

-- Asociar estudiantes a sus carreras
-- Estudiantes ICINF (carrera_id = 1)
INSERT INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('10000001-1', 1, 2023, 5, 'regular', CURDATE(), TRUE),
('10000002-2', 1, 2023, 5, 'regular', CURDATE(), TRUE),
('10000003-3', 1, 2022, 7, 'regular', CURDATE(), TRUE),
('10000004-4', 1, 2022, 7, 'regular', CURDATE(), TRUE),
('10000005-5', 1, 2024, 3, 'regular', CURDATE(), TRUE),
('10000006-6', 1, 2024, 3, 'regular', CURDATE(), TRUE),
('10000007-7', 1, 2021, 9, 'regular', CURDATE(), TRUE),
('10000008-8', 1, 2021, 9, 'regular', CURDATE(), TRUE),
('10000009-9', 1, 2023, 5, 'regular', CURDATE(), TRUE),
('10000010-0', 1, 2023, 5, 'regular', CURDATE(), TRUE);

-- Estudiantes IECCI (carrera_id = 2)
INSERT INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('10000011-1', 2, 2023, 4, 'regular', CURDATE(), TRUE),
('10000012-2', 2, 2023, 4, 'regular', CURDATE(), TRUE),
('10000013-3', 2, 2022, 6, 'regular', CURDATE(), TRUE),
('10000014-4', 2, 2022, 6, 'regular', CURDATE(), TRUE),
('10000015-5', 2, 2024, 2, 'regular', CURDATE(), TRUE),
('10000016-6', 2, 2024, 2, 'regular', CURDATE(), TRUE),
('10000017-7', 2, 2021, 8, 'regular', CURDATE(), TRUE),
('10000018-8', 2, 2021, 8, 'regular', CURDATE(), TRUE),
('10000019-9', 2, 2023, 4, 'regular', CURDATE(), TRUE),
('10000020-0', 2, 2023, 4, 'regular', CURDATE(), TRUE);

-- ============================================
-- RESUMEN
-- ============================================
SELECT 'Usuarios insertados exitosamente' as status;
SELECT COUNT(*) as total_profesores FROM usuarios WHERE rol_id = 2 AND email IS NULL;
SELECT COUNT(*) as total_estudiantes FROM usuarios WHERE rol_id = 1 AND email IS NULL;
SELECT COUNT(*) as profesores_departamento FROM profesores_departamentos WHERE departamento_id = 1 AND activo = TRUE;
SELECT COUNT(*) as estudiantes_icinf FROM estudiantes_carreras WHERE carrera_id = 1;
SELECT COUNT(*) as estudiantes_iecci FROM estudiantes_carreras WHERE carrera_id = 2;

