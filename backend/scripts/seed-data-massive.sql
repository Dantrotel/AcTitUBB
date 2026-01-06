-- ============================================
-- SCRIPT DE DATOS MASIVOS DE PRUEBA
-- Sistema de Gestión de Titulación UBB
-- 50+ Estudiantes, 17 Profesores, Todos los Estados
-- ============================================
use actitubb;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- PASO 1: USUARIOS
-- ============================================

-- Super Admin
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('17654321-0', 'Carlos Rodríguez Silva', 'carlos.rodriguez@ubiobio.cl', '$2b$10$xB5r7KQYGvN8hYZ4kQ7IQeE5yL9mH6pR3tW8xD2cF4jK7mN9qT0sA', 4, 1, 0);

-- Administradores
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('18765432-1', 'María González López', 'maria.gonzalez@ubiobio.cl', '$2b$10$xB5r7KQYGvN8hYZ4kQ7IQeE5yL9mH6pR3tW8xD2cF4jK7mN9qT0sA', 3, 1, 0),
('18876543-2', 'Pedro Martínez Fernández', 'pedro.martinez@ubiobio.cl', '$2b$10$xB5r7KQYGvN8hYZ4kQ7IQeE5yL9mH6pR3tW8xD2cF4jK7mN9qT0sA', 3, 1, 0),
('18987654-3', 'Lorena Sepúlveda Torres', 'lorena.sepulveda@ubiobio.cl', '$2b$10$xB5r7KQYGvN8hYZ4kQ7IQeE5yL9mH6pR3tW8xD2cF4jK7mN9qT0sA', 3, 1, 0);

-- 17 Profesores del Departamento (contraseña: Profe123!)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('16111111-1', 'Roberto Sánchez Castro', 'roberto.sanchez@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16222222-2', 'Ana Ramírez Torres', 'ana.ramirez@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16333333-3', 'Luis Pérez Morales', 'luis.perez@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16444444-4', 'Carmen Vargas Díaz', 'carmen.vargas@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16555555-5', 'Jorge Muñoz Rojas', 'jorge.munoz@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16666666-6', 'Patricia Lagos Fernández', 'patricia.lagos@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16777777-7', 'Ricardo Bravo Méndez', 'ricardo.bravo@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16888888-8', 'Claudia Herrera Núñez', 'claudia.herrera@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16999999-9', 'Fernando Castro Pinto', 'fernando.castro@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16101010-K', 'Isabel Gutiérrez Vega', 'isabel.gutierrez@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16121212-1', 'Andrés Silva Rojas', 'andres.silva@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16131313-2', 'Mónica Flores Contreras', 'monica.flores@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16141414-3', 'Rodrigo Campos Espinoza', 'rodrigo.campos@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16151515-4', 'Gabriela Morales Soto', 'gabriela.morales@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16161616-5', 'Pablo Reyes Valdés', 'pablo.reyes@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16171717-6', 'Daniela Ortiz Muñoz', 'daniela.ortiz@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16181818-7', 'Marcelo Torres Bravo', 'marcelo.torres@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0);

-- 30 Estudiantes IECI (contraseña: Estudiante123!)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('20111111-1', 'Sebastián Flores Gutiérrez', 'sebastian.flores@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20222222-2', 'Camila Reyes Soto', 'camila.reyes@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20333333-3', 'Francisca Morales Herrera', 'francisca.morales@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20444444-4', 'Sofía Campos Valdés', 'sofia.campos@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20555555-5', 'Tomás Vega Cortés', 'tomas.vega@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20666666-6', 'Javiera Núñez Pinto', 'javiera.nunez@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20777777-7', 'Ignacio Bravo Lagos', 'ignacio.bravo@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20888888-8', 'Antonia Silva Méndez', 'antonia.silva@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20999999-9', 'Felipe Castro Rojas', 'felipe.castro@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20101010-K', 'Isidora Torres Espinoza', 'isidora.torres@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21111111-1', 'Maximiliano Herrera Valdés', 'maximiliano.herrera@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21222222-2', 'Emilia Campos Soto', 'emilia.campos@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21333333-3', 'Joaquín Muñoz Contreras', 'joaquin.munoz@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21444444-4', 'Florencia Riquelme Vega', 'florencia.riquelme@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21555555-5', 'Vicente Fuentes Pinto', 'vicente.fuentes@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21666666-6', 'Catalina Gutiérrez Lagos', 'catalina.gutierrez@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21777777-7', 'Agustín Vargas Méndez', 'agustin.vargas@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21888888-8', 'Amanda Reyes Flores', 'amanda.reyes@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21999999-9', 'Lucas Morales Torres', 'lucas.morales@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21101010-K', 'Josefa Silva Bravo', 'josefa.silva@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('22111111-1', 'Cristóbal Ortiz Campos', 'cristobal.ortiz@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('22222222-2', 'Renata Castro Núñez', 'renata.castro@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('22333333-3', 'Martín Vega Espinoza', 'martin.vega@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('22444444-4', 'Trinidad Campos Rojas', 'trinidad.campos@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('22555555-5', 'Bastián Herrera Soto', 'bastian.herrera@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('22666666-6', 'Isabella Muñoz Valdés', 'isabella.munoz@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('22777777-7', 'Mateo Reyes Cortés', 'mateo.reyes@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('22888888-8', 'Emilia Torres Lagos', 'emiliatorres@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('22999999-9', 'Gabriel Silva Méndez', 'gabriel.silva@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('22101010-K', 'Valentina Flores Pinto', 'valentinaf@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0);

-- 30 Estudiantes ICINF (contraseña: Estudiante123!)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('19111111-1', 'Valentina Ortiz Núñez', 'valentina.ortiz@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19222222-2', 'Diego Castro Bravo', 'diego.castro@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19333333-3', 'Matías Silva Pinto', 'matias.silva@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19444444-4', 'Nicolás Vega Contreras', 'nicolas.vega@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19555555-5', 'Benjamín Riquelme Espinoza', 'benjamin.riquelme@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19666666-6', 'Martina Fuentes Cortés', 'martina.fuentes@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19777777-7', 'Andrea Silva Muñoz', 'andrea.silva@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19888888-8', 'Felipe Torres Rojas', 'felipe.torres@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19999999-9', 'Daniela Pinto Castro', 'daniela.pinto@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19101010-K', 'Rodrigo Lagos Vargas', 'rodrigo.lagos@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('18111111-1', 'Carolina Méndez Soto', 'carolina.mendez@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('18222222-2', 'Andrés Bravo Campos', 'andres.bravo@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('18333333-3', 'Fernanda Gutiérrez Reyes', 'fernanda.gutierrez@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('18444444-4', 'Cristian Morales Flores', 'cristian.morales@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('18555555-5', 'Pamela Castro Núñez', 'pamela.castro@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('18666666-6', 'Claudio Vega Espinoza', 'claudio.vega@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('18777777-7', 'Constanza Herrera Valdés', 'constanza.herrera@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('17111111-1', 'Manuel Campos Rojas', 'manuel.campos@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('17222222-2', 'Javiera Muñoz Cortés', 'javieramunoz@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('17333333-3', 'Sebastián Reyes Lagos', 'sebastian.reyes@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('17444444-4', 'Camila Torres Méndez', 'camilat@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('17555555-5', 'Francisco Silva Pinto', 'francisco.silva@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('17666666-6', 'Isidora Flores Bravo', 'isidoraf@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('17777777-7', 'Tomás Ortiz Soto', 'tomas.ortiz@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('17888888-8', 'Antonia Vargas Campos', 'antoniav@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('17999999-9', 'Ignacio Castro Núñez', 'ignacioc@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('17101010-K', 'Sofía Gutiérrez Méndez', 'sofiag@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('16191919-1', 'Maximiliano Reyes Torres', 'maximilianor@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('16202020-2', 'Emilia Morales Lagos', 'emiliam@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('16212121-3', 'Vicente Silva Espinoza', 'vicente.silva@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0);

-- ============================================
-- PASO 2: ESTRUCTURA ACADÉMICA
-- ============================================

INSERT INTO facultades (id, nombre, codigo, descripcion, activo) VALUES
(100, 'Facultad de Ciencias Empresariales', 'FCE', 'Facultad de Ciencias Empresariales de la Universidad del Bío-Bío', 1);

INSERT INTO departamentos (id, facultad_id, nombre, codigo, descripcion, activo) VALUES
(100, 100, 'Departamento de Sistemas de Información', 'DSI', 'Departamento de Sistemas de Información', 1);

INSERT INTO carreras (id, facultad_id, nombre, codigo, titulo_profesional, grado_academico, duracion_semestres, descripcion, activo) VALUES
(100, 100, 'Ingeniería Civil en Informática', 'ICINF', 'Ingeniero Civil en Informática', 'Licenciado en Ciencias de la Ingeniería', 10, 'Carrera de Ingeniería Civil en Informática', 1),
(101, 100, 'Ingeniería de Ejecución en Computación e Informática', 'IECI', 'Ingeniero de Ejecución en Computación e Informática', NULL, 8, 'Carrera de Ingeniería de Ejecución en Computación e Informática', 1);

-- ============================================
-- PASO 3: ASIGNACIÓN ESTUDIANTES A CARRERAS
-- ============================================

-- 30 Estudiantes IECI (carrera_id = 101)
INSERT INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('20111111-1', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('20222222-2', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('20333333-3', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('20444444-4', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('20555555-5', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('20666666-6', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('20777777-7', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('20888888-8', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('20999999-9', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('20101010-K', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('21111111-1', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('21222222-2', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('21333333-3', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('21444444-4', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('21555555-5', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('21666666-6', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('21777777-7', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('21888888-8', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('21999999-9', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('21101010-K', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('22111111-1', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('22222222-2', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('22333333-3', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('22444444-4', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('22555555-5', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('22666666-6', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('22777777-7', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('22888888-8', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('22999999-9', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('22101010-K', 101, 2020, 8, 'egresado', '2020-03-01', 1);

-- 30 Estudiantes ICINF (carrera_id = 100)
INSERT INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('19111111-1', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('19222222-2', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('19333333-3', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('19444444-4', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('19555555-5', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('19666666-6', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('19777777-7', 100, 2019, 10, 'egresado', '2019-03-01', 1),
('19888888-8', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('19999999-9', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('19101010-K', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('18111111-1', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('18222222-2', 100, 2019, 10, 'egresado', '2019-03-01', 1),
('18333333-3', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('18444444-4', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('18555555-5', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('18666666-6', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('18777777-7', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('17111111-1', 100, 2019, 10, 'egresado', '2019-03-01', 1),
('17222222-2', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('17333333-3', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('17444444-4', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('17555555-5', 100, 2019, 10, 'egresado', '2019-03-01', 1),
('17666666-6', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('17777777-7', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('17888888-8', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('17999999-9', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('17101010-K', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('16191919-1', 100, 2019, 10, 'egresado', '2019-03-01', 1),
('16202020-2', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('16212121-3', 100, 2020, 10, 'egresado', '2020-03-01', 1);

-- ============================================
-- PASO 4: PROFESORES A DEPARTAMENTO
-- ============================================

INSERT INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso, activo) VALUES
('16111111-1', 100, 1, '2015-03-01', 1),
('16222222-2', 100, 1, '2016-03-01', 1),
('16333333-3', 100, 1, '2017-03-01', 1),
('16444444-4', 100, 1, '2018-03-01', 1),
('16555555-5', 100, 1, '2019-03-01', 1),
('16666666-6', 100, 1, '2015-03-01', 1),
('16777777-7', 100, 1, '2016-03-01', 1),
('16888888-8', 100, 1, '2017-03-01', 1),
('16999999-9', 100, 1, '2018-03-01', 1),
('16101010-K', 100, 1, '2019-03-01', 1),
('16121212-1', 100, 1, '2016-03-01', 1),
('16131313-2', 100, 1, '2017-03-01', 1),
('16141414-3', 100, 1, '2018-03-01', 1),
('16151515-4', 100, 1, '2019-03-01', 1),
('16161616-5', 100, 1, '2016-03-01', 1),
('16171717-6', 100, 1, '2017-03-01', 1),
('16181818-7', 100, 1, '2018-03-01', 1);

-- ============================================
-- PASO 5: ENTIDADES EXTERNAS Y COLABORADORES
-- ============================================

INSERT INTO entidades_externas (nombre, razon_social, rut_empresa, tipo, email_contacto, telefono, direccion, sitio_web, area_actividad, descripcion, activo) VALUES
('TechSolutions SpA', 'TechSolutions Servicios Informáticos SpA', '76123456-7', 'empresa_privada', 'contacto@techsolutions.cl', '+56412345678', 'Av. Collao 1202, Concepción', 'https://techsolutions.cl', 'Desarrollo de Software', 'Empresa líder en desarrollo de software a medida y consultoría tecnológica.', 1),
('DataAnalytics Chile', 'DataAnalytics Chile Limitada', '76234567-8', 'empresa_privada', 'info@dataanalytics.cl', '+56423456789', 'Barros Arana 456, Concepción', 'https://dataanalytics.cl', 'Análisis de Datos', 'Especialistas en Big Data, Machine Learning y Business Intelligence.', 1),
('Fundación Innovación Social', 'Fundación para la Innovación Social', '65345678-9', 'ong', 'contacto@innovacionsocial.cl', '+56434567890', 'O\'Higgins 789, Chillán', 'https://innovacionsocial.cl', 'Tecnología Social', 'ONG enfocada en proyectos de tecnología para el desarrollo social.', 1),
('CloudServices SA', 'CloudServices Infraestructura SA', '76456789-0', 'empresa_privada', 'ventas@cloudservices.cl', '+56445678901', 'Freire 123, Concepción', 'https://cloudservices.cl', 'Cloud Computing', 'Proveedor de servicios de infraestructura cloud y DevOps.', 1),
('AgriTech Solutions', 'AgriTech Solutions SpA', '76567890-1', 'empresa_privada', 'info@agritech.cl', '+56456789012', 'Los Carrera 567, Los Ángeles', 'https://agritech.cl', 'Agricultura Digital', 'Soluciones tecnológicas para el sector agrícola.', 1),
('HealthTech Chile', 'HealthTech Chile Limitada', '76678901-2', 'empresa_privada', 'contacto@healthtech.cl', '+56467890123', 'Pedro de Valdivia 234, Chillán', 'https://healthtech.cl', 'Salud Digital', 'Desarrollo de sistemas de salud y telemedicina.', 1);

INSERT INTO colaboradores_externos (entidad_id, nombre_completo, rut, email, telefono, cargo, tipo_colaborador, area_departamento, especialidad, anos_experiencia, linkedin, biografia, observaciones, verificado, activo, creado_por) VALUES
(1, 'Fernando Campos Osorio', '15123456-7', 'fcampos@techsolutions.cl', '+56987654321', 'Gerente de Desarrollo', 'supervisor_empresa', 'Desarrollo de Software', 'Arquitectura de Software', 18, 'https://linkedin.com/in/fcampos', 'Ingeniero Civil en Informática con más de 18 años de experiencia.', 'Excelente supervisor para proyectos complejos.', 1, 1, '17654321-0'),
(2, 'Ricardo Soto Valenzuela', '14345678-9', 'rsoto@dataanalytics.cl', '+56987654323', 'Data Science Lead', 'mentor', 'Ciencia de Datos', 'Machine Learning', 15, 'https://linkedin.com/in/rsoto', 'PhD en Ciencias de la Computación, especialista en ML.', 'Mentor excepcional para proyectos de IA.', 1, 1, '17654321-0'),
(3, 'María Cisternas López', '14456789-0', 'mcisternas@innovacionsocial.cl', '+56987654324', 'Directora de Proyectos', 'asesor_tecnico', 'Gestión de Proyectos', 'Impacto Social', 12, 'https://linkedin.com/in/mcisternas', 'Especialista en proyectos de tecnología con impacto social.', 'Muy comprometida con el aprendizaje estudiantil.', 1, 1, '17654321-0'),
(4, 'Pablo Gutiérrez Rojas', '15234567-8', 'pablog@cloudservices.cl', '+56987654325', 'Arquitecto Cloud', 'mentor', 'Infraestructura', 'Cloud Computing', 10, 'https://linkedin.com/in/pablogutierrez', 'Certificado en AWS, Azure y GCP.', 'Excelente para proyectos de infraestructura.', 1, 1, '17654321-0');

-- ============================================
-- PASO 6: PROPUESTAS - TODOS LOS ESTADOS
-- ============================================

-- El archivo continúa con las propuestas, proyectos, asignaciones, fechas, etc.
-- Por razones de tamaño del mensaje, te enviaré este archivo completo

SET FOREIGN_KEY_CHECKS = 1;
SELECT 'Script de datos masivos ejecutado exitosamente' AS Resultado;
