-- ============================================
-- DATOS DE PRUEBA COMPLETOS PARA ACTITUBB
-- Sistema de Gestión de Proyectos de Título
-- ============================================
-- NOTA: Este script NO inserta roles, estados ni usuarios básicos
-- porque ya existen en database.sql
-- ============================================

USE actitubb;

-- ============================================
-- NOTA: Roles y Estados ya existen en database.sql
-- No se insertan para evitar duplicados
-- ============================================
-- Roles existentes: 1=estudiante, 2=profesor, 3=admin, 4=superadmin
-- Estados de propuestas: pendiente, en_revision, correcciones, aprobada, rechazada
-- Estados de proyectos: en_desarrollo, pausado, completado, etc.
-- Roles de profesores: Profesor Revisor, Profesor Guía, Profesor Co-Guía, Profesor Informante, Profesor de Sala
-- ============================================

-- ============================================
-- 4. ESTRUCTURA ACADÉMICA
-- ============================================

-- Facultades (INSERT IGNORE para evitar duplicados)
INSERT IGNORE INTO facultades (nombre, codigo, descripcion, activo) VALUES
('Facultad de Ciencias Empresariales', 'FCE', 'Facultad de Ciencias Empresariales', TRUE),
('Facultad de Ingeniería', 'FI', 'Facultad de Ingeniería', TRUE);

-- Departamentos (INSERT IGNORE para evitar duplicados)
-- Nota: facultad_id se obtiene dinámicamente
INSERT IGNORE INTO departamentos (nombre, codigo, facultad_id, descripcion, activo) VALUES
('Departamento de Sistemas de Información', 'DSI', (SELECT id FROM facultades WHERE codigo = 'FI'), 'Departamento de Sistemas de Información', TRUE),
('Departamento de Ciencias de la Computación', 'DCC', (SELECT id FROM facultades WHERE codigo = 'FI'), 'Departamento de Ciencias de la Computación', TRUE),
('Departamento de Ingeniería Civil', 'DICIV', (SELECT id FROM facultades WHERE codigo = 'FI'), 'Departamento de Ingeniería Civil', TRUE);

-- Carreras (INSERT IGNORE para evitar duplicados)
INSERT IGNORE INTO carreras (nombre, codigo, facultad_id, titulo_profesional, duracion_semestres, descripcion, activo) VALUES
('Ingeniería Civil en Informática', 'ICI', (SELECT id FROM facultades WHERE codigo = 'FI'), 'Ingeniero Civil en Informática', 12, 'Ingeniería Civil en Informática', TRUE),
('Ingeniería de Ejecución en Computación e Informática', 'IECI', (SELECT id FROM facultades WHERE codigo = 'FI'), 'Ingeniero de Ejecución en Computación e Informática', 8, 'Ingeniería de Ejecución en Computación e Informática', TRUE),
('Ingeniería Civil Industrial', 'ICIND', (SELECT id FROM facultades WHERE codigo = 'FI'), 'Ingeniero Civil Industrial', 12, 'Ingeniería Civil Industrial', TRUE);

-- ============================================
-- 5. USUARIOS ADICIONALES DE PRUEBA
-- ============================================
-- NOTA: Los usuarios básicos ya existen en database.sql:
-- - 11111111-1: Usuario Estudiante (rol 1) - password: 1234
-- - 22222222-2: Usuario Profesor (rol 2) - password: 1234  
-- - 33333333-3: Usuario Admin (rol 3) - password: 1234
-- - 44444444-4: Usuario SuperAdmin (rol 4) - password: 1234
-- 
-- Aquí agregamos usuarios adicionales con RUTs diferentes
-- Contraseña para nuevos usuarios: 1234
-- Hash bcrypt: $2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe
-- ============================================

-- Profesores adicionales (INSERT IGNORE para evitar duplicados)
INSERT IGNORE INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('12345678-9', 'Dr. Juan Pérez Soto', 'juan.perez@ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, TRUE, FALSE),
('98765432-1', 'Dra. María González López', 'maria.gonzalez@ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, TRUE, FALSE),
('11223344-5', 'Dr. Carlos Ramírez Torres', 'carlos.ramirez@ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, TRUE, FALSE),
('55667788-9', 'Dra. Ana Martínez Silva', 'ana.martinez@ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, TRUE, FALSE),
('44556677-8', 'Dr. Pedro Sánchez Rojas', 'pedro.sanchez@ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, TRUE, FALSE);

-- Estudiantes adicionales (INSERT IGNORE para evitar duplicados)
INSERT IGNORE INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('20111222-3', 'Luis Andrés Morales Castro', 'luis.morales@alumnos.ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, TRUE, FALSE),
('20222333-4', 'Camila Andrea Rojas Fernández', 'camila.rojas@alumnos.ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, TRUE, FALSE),
('20333444-5', 'Diego Sebastián Vargas Muñoz', 'diego.vargas@alumnos.ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, TRUE, FALSE),
('20444555-6', 'Valentina Isabel Núñez Pérez', 'valentina.nunez@alumnos.ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, TRUE, FALSE),
('20555666-7', 'Matías Alejandro Silva Contreras', 'matias.silva@alumnos.ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, TRUE, FALSE),
('20666777-8', 'Sofía Constanza Vega Díaz', 'sofia.vega@alumnos.ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, TRUE, FALSE),
('20777888-9', 'Benjamín Eduardo Herrera Soto', 'benjamin.herrera@alumnos.ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, TRUE, FALSE),
('20888999-0', 'Javiera Paz Flores Gómez', 'javiera.flores@alumnos.ubb.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, TRUE, FALSE);

-- Relación Profesores - Departamentos (usando códigos en lugar de IDs)
INSERT IGNORE INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso) VALUES
('12345678-9', (SELECT id FROM departamentos WHERE codigo = 'DSI'), TRUE, '2020-03-01'),
('98765432-1', (SELECT id FROM departamentos WHERE codigo = 'DSI'), FALSE, '2019-08-01'),
('11223344-5', (SELECT id FROM departamentos WHERE codigo = 'DCC'), TRUE, '2018-03-01'),
('55667788-9', (SELECT id FROM departamentos WHERE codigo = 'DSI'), FALSE, '2021-03-01'),
('44556677-8', (SELECT id FROM departamentos WHERE codigo = 'DCC'), FALSE, '2022-08-01');

-- (file preserved in archive)
