-- ============================================================
-- SEED DATA - AcTitUBB
-- 50 Estudiantes, 17 Profesores, 1 Facultad, 1 Departamento
-- 2 Carreras: Ing. Ejecución Computación e Informática + Ing. Civil Informática
-- Propuestas, Proyectos, Reuniones, Avances, Cronogramas, etc.
-- Contraseña de todos los usuarios: 1234
-- Hash bcrypt: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle
-- ============================================================

USE actitubb;

-- ============================================================
-- 1. FACULTAD
-- ============================================================
INSERT INTO facultades (id, nombre, codigo, descripcion, activo) VALUES
(1, 'Facultad de Ciencias Empresariales', 'FCE', 'Facultad de Ciencias Empresariales de la Universidad del Bío-Bío', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ============================================================
-- 2. DEPARTAMENTO
-- ============================================================
INSERT INTO departamentos (id, facultad_id, nombre, codigo, descripcion, activo) VALUES
(1, 1, 'Departamento de Sistemas de Información', 'DSI', 'Departamento encargado de las carreras de informática', TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ============================================================
-- 3. CARRERAS
-- ============================================================
INSERT INTO carreras (id, facultad_id, nombre, codigo, titulo_profesional, grado_academico, duracion_semestres, activo) VALUES
(1, 1, 'Ingeniería Civil en Informática', 'ICI', 'Ingeniero Civil en Informática', 'Licenciado en Ciencias de la Ingeniería', 10, TRUE),
(2, 1, 'Ingeniería de Ejecución en Computación e Informática', 'IECI', 'Ingeniero de Ejecución en Computación e Informática', NULL, 8, TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ============================================================
-- 4. DEPARTAMENTO-CARRERA
-- ============================================================
INSERT IGNORE INTO departamentos_carreras (departamento_id, carrera_id, es_principal, activo) VALUES
(1, 1, TRUE, TRUE),
(1, 2, TRUE, TRUE);

-- ============================================================
-- 5. PROFESORES (17)
-- ============================================================
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) VALUES
('10111111-1', 'Carlos Mendoza Rojas',        'cmendoza@ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('10222222-2', 'Ana Pérez Fuentes',           'aperez@ubiobio.cl',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('10333333-3', 'Roberto Silva Vega',          'rsilva@ubiobio.cl',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('10444444-4', 'María Torres Campos',         'mtorres@ubiobio.cl',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('10555555-5', 'Javier Morales Soto',         'jmorales@ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('10666666-6', 'Patricia Vargas Núñez',       'pvargas@ubiobio.cl',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('10777777-7', 'Diego Castillo Ríos',         'dcastillo@ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('10888888-8', 'Claudia Espinoza Mena',       'cespinoza@ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('10999999-9', 'Fernando Muñoz Lagos',        'fmunoz@ubiobio.cl',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('11000000-0', 'Valentina Reyes Paredes',     'vreyes@ubiobio.cl',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('11100000-K', 'Andrés Gutiérrez Leal',       'agutierrez@ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('11200000-1', 'Sandra Flores Ibarra',        'sflores@ubiobio.cl',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('11300000-2', 'Rodrigo Navarro Cisternas',   'rnavarro@ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('11400000-3', 'Camila Herrera Bravo',        'cherrera@ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('11500000-4', 'Marcelo Contreras Pino',      'mcontreras@ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('11600000-5', 'Isabel Ramírez Donoso',       'iramirez@ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('11700000-6', 'Pablo Sepúlveda Araya',       'psepulveda@ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), email = VALUES(email);

-- Profesores en departamento DSI
INSERT IGNORE INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso) VALUES
('10111111-1', 1, TRUE,  '2010-03-01'),
('10222222-2', 1, TRUE,  '2012-03-01'),
('10333333-3', 1, TRUE,  '2008-03-01'),
('10444444-4', 1, TRUE,  '2015-03-01'),
('10555555-5', 1, TRUE,  '2011-03-01'),
('10666666-6', 1, TRUE,  '2013-03-01'),
('10777777-7', 1, TRUE,  '2009-03-01'),
('10888888-8', 1, TRUE,  '2016-03-01'),
('10999999-9', 1, TRUE,  '2007-03-01'),
('11000000-0', 1, TRUE,  '2018-03-01'),
('11100000-K', 1, TRUE,  '2014-03-01'),
('11200000-1', 1, TRUE,  '2017-03-01'),
('11300000-2', 1, TRUE,  '2006-03-01'),
('11400000-3', 1, TRUE,  '2019-03-01'),
('11500000-4', 1, TRUE,  '2010-03-01'),
('11600000-5', 1, TRUE,  '2021-03-01'),
('11700000-6', 1, TRUE,  '2020-03-01');

-- ============================================================
-- 6. ESTUDIANTES (50) — 25 ICI, 25 IECI
-- ============================================================
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) VALUES
-- ICI (25 estudiantes)
('20111111-1', 'Alejandro Muñoz Pérez',       'amunioz.ici@alumnos.ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('20222222-2', 'Bastián Riquelme Soto',       'briquelme.ici@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('20333333-3', 'Camilo Fuentes Lagos',        'cfuentes.ici@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('20444444-4', 'Daniela Vega Contreras',      'dvega.ici@alumnos.ubiobio.cl',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('20555555-5', 'Emilio Torres Bravo',         'etorres.ici@alumnos.ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('20666666-6', 'Fernanda Silva Núñez',        'fsilva.ici@alumnos.ubiobio.cl',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('20777777-7', 'Gabriel Morales Rojas',       'gmorales.ici@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('20888888-8', 'Héctor Castillo Mena',        'hcastillo.ici@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('20999999-9', 'Ignacio Espinoza Paredes',    'iespinoza.ici@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('21000000-0', 'Javiera Reyes Ibarra',        'jreyes.ici@alumnos.ubiobio.cl',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('21100000-K', 'Kevin Gutiérrez Cisternas',   'kgutierrez.ici@alumnos.ubiobio.cl',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('21200000-1', 'Laura Herrera Donoso',        'lherrera.ici@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('21300000-2', 'Matías Navarro Pino',         'mnavarro.ici@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('21400000-3', 'Nicole Contreras Araya',      'ncontreras.ici@alumnos.ubiobio.cl',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('21500000-4', 'Osvaldo Ramírez Leal',        'oramirez.ici@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('21600000-5', 'Paula Sepúlveda Flores',      'psepulveda.ici@alumnos.ubiobio.cl',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('21700000-6', 'Quintín Vargas Lagos',        'qvargas.ici@alumnos.ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('21800000-7', 'Rocío Muñoz Torres',          'rmunoz.ici@alumnos.ubiobio.cl',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('21900000-8', 'Sebastián Riquelme Vega',     'sriquelme.ici@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('22000000-9', 'Tamara Fuentes Silva',        'tfuentes.ici@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('22100000-K', 'Ulises Torres Morales',       'utorres.ici@alumnos.ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('22200000-0', 'Valentina Vega Castillo',     'vvega.ici@alumnos.ubiobio.cl',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('22300000-1', 'Wilson Espinoza Reyes',       'wespinoza.ici@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('22400000-2', 'Ximena Gutiérrez Navarro',    'xgutierrez.ici@alumnos.ubiobio.cl',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('22500000-3', 'Yolanda Herrera Contreras',   'yherrera.ici@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
-- IECI (25 estudiantes)
('23111111-1', 'Aaron Ramírez Sepúlveda',     'aramirez.ieci@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('23222222-2', 'Bárbara Vargas Muñoz',        'bvargas.ieci@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('23333333-3', 'César Fuentes Riquelme',      'cfuentes.ieci@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('23444444-4', 'Dania Torres Lagos',          'dtorres.ieci@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('23555555-5', 'Ernesto Silva Bravo',         'esilva.ieci@alumnos.ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('23666666-6', 'Fiorella Morales Núñez',      'fmorales.ieci@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('23777777-7', 'Gonzalo Castillo Rojas',      'gcastillo.ieci@alumnos.ubiobio.cl',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('23888888-8', 'Hilda Espinoza Mena',         'hespinoza.ieci@alumnos.ubiobio.cl',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('23999999-9', 'Iván Reyes Paredes',          'ireyes.ieci@alumnos.ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('24000000-0', 'Josefa Gutiérrez Ibarra',     'jgutierrez.ieci@alumnos.ubiobio.cl', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('24100000-K', 'Karina Herrera Cisternas',    'kherrera.ieci@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('24200000-1', 'Lorenzo Navarro Donoso',      'lnavarro.ieci@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('24300000-2', 'Mónica Contreras Pino',       'mcontreras.ieci@alumnos.ubiobio.cl', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('24400000-3', 'Nicolás Ramírez Araya',       'nramirez.ieci@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('24500000-4', 'Olga Sepúlveda Leal',         'osepulveda.ieci@alumnos.ubiobio.cl', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('24600000-5', 'Pedro Vargas Flores',         'pvargas.ieci@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('24700000-6', 'Quesia Muñoz Torres',         'qmunoz.ieci@alumnos.ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('24800000-7', 'Renato Riquelme Vega',        'rriquelme.ieci@alumnos.ubiobio.cl',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('24900000-8', 'Sofía Fuentes Silva',         'sfuentes.ieci@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('25000000-9', 'Tomás Torres Morales',        'ttorres.ieci@alumnos.ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('25100000-K', 'Úrsula Vega Castillo',        'uvega.ieci@alumnos.ubiobio.cl',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('25200000-0', 'Vicente Espinoza Reyes',      'vespinoza.ieci@alumnos.ubiobio.cl',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('25300000-1', 'Wanda Gutiérrez Navarro',     'wgutierrez.ieci@alumnos.ubiobio.cl', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('25400000-2', 'Xenia Herrera Contreras',     'xherrera.ieci@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1),
('25500000-3', 'Yerlan Ramírez Sepúlveda',    'yramirez.ieci@alumnos.ubiobio.cl',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), email = VALUES(email);

-- ============================================================
-- 7. ESTUDIANTES EN CARRERAS
-- ============================================================
-- ICI (25 estudiantes)
INSERT IGNORE INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('20111111-1', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('20222222-2', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('20333333-3', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('20444444-4', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('20555555-5', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('20666666-6', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('20777777-7', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('20888888-8', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('20999999-9', 1, 2022, 5, 'regular', '2022-03-01', TRUE),
('21000000-0', 1, 2022, 5, 'regular', '2022-03-01', TRUE),
('21100000-K', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('21200000-1', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('21300000-2', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('21400000-3', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('21500000-4', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('21600000-5', 1, 2022, 5, 'regular', '2022-03-01', TRUE),
('21700000-6', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('21800000-7', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('21900000-8', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('22000000-9', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('22100000-K', 1, 2022, 5, 'regular', '2022-03-01', TRUE),
('22200000-0', 1, 2022, 5, 'regular', '2022-03-01', TRUE),
('22300000-1', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('22400000-2', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('22500000-3', 1, 2021, 7, 'regular', '2021-03-01', TRUE);

-- IECI (25 estudiantes)
INSERT IGNORE INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('23111111-1', 2, 2021, 7, 'regular', '2021-03-01', TRUE),
('23222222-2', 2, 2021, 7, 'regular', '2021-03-01', TRUE),
('23333333-3', 2, 2022, 5, 'regular', '2022-03-01', TRUE),
('23444444-4', 2, 2022, 5, 'regular', '2022-03-01', TRUE),
('23555555-5', 2, 2021, 7, 'regular', '2021-03-01', TRUE),
('23666666-6', 2, 2021, 7, 'regular', '2021-03-01', TRUE),
('23777777-7', 2, 2020, 8, 'regular', '2020-03-01', TRUE),
('23888888-8', 2, 2020, 8, 'regular', '2020-03-01', TRUE),
('23999999-9', 2, 2022, 5, 'regular', '2022-03-01', TRUE),
('24000000-0', 2, 2022, 5, 'regular', '2022-03-01', TRUE),
('24100000-K', 2, 2021, 7, 'regular', '2021-03-01', TRUE),
('24200000-1', 2, 2021, 7, 'regular', '2021-03-01', TRUE),
('24300000-2', 2, 2020, 8, 'regular', '2020-03-01', TRUE),
('24400000-3', 2, 2020, 8, 'regular', '2020-03-01', TRUE),
('24500000-4', 2, 2022, 5, 'regular', '2022-03-01', TRUE),
('24600000-5', 2, 2022, 5, 'regular', '2022-03-01', TRUE),
('24700000-6', 2, 2021, 7, 'regular', '2021-03-01', TRUE),
('24800000-7', 2, 2021, 7, 'regular', '2021-03-01', TRUE),
('24900000-8', 2, 2020, 8, 'regular', '2020-03-01', TRUE),
('25000000-9', 2, 2020, 8, 'regular', '2020-03-01', TRUE),
('25100000-K', 2, 2022, 5, 'regular', '2022-03-01', TRUE),
('25200000-0', 2, 2022, 5, 'regular', '2022-03-01', TRUE),
('25300000-1', 2, 2021, 7, 'regular', '2021-03-01', TRUE),
('25400000-2', 2, 2021, 7, 'regular', '2021-03-01', TRUE),
('25500000-3', 2, 2020, 8, 'regular', '2020-03-01', TRUE);

-- ============================================================
-- 8. DISPONIBILIDAD DE HORARIOS (Profesores)
-- ============================================================
INSERT IGNORE INTO disponibilidad_horarios (usuario_rut, dia_semana, hora_inicio, hora_fin) VALUES
('10111111-1','lunes','09:00','12:00'), ('10111111-1','miercoles','14:00','17:00'),
('10222222-2','martes','09:00','12:00'), ('10222222-2','jueves','14:00','17:00'),
('10333333-3','lunes','14:00','17:00'), ('10333333-3','viernes','09:00','12:00'),
('10444444-4','miercoles','09:00','12:00'), ('10444444-4','viernes','14:00','17:00'),
('10555555-5','martes','14:00','17:00'), ('10555555-5','jueves','09:00','12:00'),
('10666666-6','lunes','09:00','11:00'), ('10666666-6','miercoles','15:00','17:00'),
('10777777-7','martes','10:00','12:00'), ('10777777-7','jueves','15:00','17:00'),
('10888888-8','lunes','14:00','16:00'), ('10888888-8','viernes','10:00','12:00'),
('10999999-9','miercoles','09:00','11:00'), ('10999999-9','viernes','14:00','16:00'),
('11000000-0','martes','09:00','11:00'), ('11000000-0','jueves','14:00','16:00');

-- ============================================================
-- 9. PROPUESTAS (20 propuestas — mezcla individual y grupal)
-- ============================================================
-- Estado IDs: 1=pendiente, 2=en_revision, 3=correcciones, 4=aprobada, 5=rechazada

INSERT INTO propuestas (id, titulo, descripcion, estudiante_rut, estado_id, fecha_envio, modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta) VALUES
-- Aprobadas (se convierten en proyectos)
(1, 'Sistema de Gestión de Titulaciones Web', 'Plataforma web para administrar el proceso de titulación de estudiantes universitarios, incluyendo seguimiento de avances y notificaciones automáticas.', '20111111-1', 4, '2024-03-15', 'desarrollo_software', 2, 'alta', 2, 'Ingeniería de Software', 'Desarrollar un sistema web integral para la gestión del proceso de titulación universitaria.', 'Diseñar la base de datos, Implementar backend REST, Desarrollar frontend SPA, Integrar notificaciones.', 'Metodología ágil Scrum con sprints de 2 semanas.'),
(2, 'App Móvil de Monitoreo de Cultivos', 'Aplicación móvil para agricultores que permite monitorear condiciones climáticas y del suelo en tiempo real usando sensores IoT.', '20333333-3', 4, '2024-03-20', 'desarrollo_software', 2, 'alta', 2, 'IoT y Agricultura', 'Desarrollar una app móvil para monitoreo agrícola con sensores IoT.', 'Integrar sensores, Crear app React Native, Implementar dashboard.', 'Metodología iterativa con prototipos funcionales.'),
(3, 'Plataforma E-learning Adaptativa', 'Sistema de aprendizaje en línea con rutas personalizadas según el rendimiento del estudiante usando algoritmos de machine learning.', '20555555-5', 4, '2024-04-01', 'desarrollo_software', 1, 'alta', 2, 'Educación y ML', 'Crear plataforma e-learning con personalización basada en ML.', 'Diseñar motor de recomendaciones, Implementar LMS, Evaluar con usuarios.', 'Design Thinking + metodología ágil.'),
(4, 'Sistema de Inventario con QR', 'Solución para gestión de inventario usando códigos QR, con alertas de stock y reportes automáticos para PYMES.', '20777777-7', 4, '2024-04-10', 'desarrollo_software', 2, 'media', 1, 'Gestión Empresarial', 'Automatizar la gestión de inventario para PYMES mediante códigos QR.', 'Implementar escáner QR, gestión de stock, sistema de alertas.', 'Metodología cascada con entregas incrementales.'),
(5, 'Chatbot de Atención Ciudadana', 'Bot inteligente para municipalidades que responde consultas ciudadanas mediante NLP y se integra con sistemas municipales existentes.', '20999999-9', 4, '2024-04-15', 'desarrollo_software', 1, 'alta', 2, 'IA y Gobierno Digital', 'Desarrollar chatbot con NLP para atención ciudadana municipal.', 'Entrenar modelo NLP, Integrar APIs municipales, Desplegar en producción.', 'Investigación aplicada con iteraciones de mejora.'),
(6, 'Plataforma de Telemedicina Rural', 'Sistema de teleconsultas médicas para zonas rurales con baja conectividad, usando compresión de video adaptativa.', '23111111-1', 4, '2024-05-01', 'desarrollo_software', 2, 'alta', 2, 'Salud Digital', 'Facilitar el acceso a atención médica en zonas rurales mediante telemedicina.', 'Implementar videollamadas adaptativas, gestión de citas, historial médico.', 'Metodología centrada en el usuario con pruebas en terreno.'),
(7, 'Sistema de Control de Acceso Biométrico', 'Solución de control de acceso usando reconocimiento facial para empresas medianas, con registro y alertas en tiempo real.', '23333333-3', 4, '2024-05-10', 'desarrollo_software', 2, 'alta', 1, 'Seguridad Informática', 'Implementar control de acceso biométrico basado en reconocimiento facial.', 'Entrenar modelo de reconocimiento facial, integrar hardware, sistema de alertas.', 'Metodología ágil con foco en seguridad.'),
(8, 'App de Transporte Compartido Universitario', 'Aplicación para coordinar viajes compartidos entre estudiantes universitarios de una misma zona geográfica.', '23555555-5', 4, '2024-05-20', 'desarrollo_software', 2, 'media', 1, 'Movilidad Urbana', 'Reducir costos de transporte estudiantil mediante una app de carpooling universitario.', 'Geolocalización, matching de rutas, sistema de pagos, calificaciones.', 'Lean startup con MVP y validación de usuarios.'),
-- En revisión
(9, 'Plataforma de Voluntariado Digital', 'Sistema que conecta voluntarios con organizaciones sociales, gestionando proyectos, horas y certificados digitales.', '21100000-K', 2, '2024-06-01', 'desarrollo_software', 2, 'media', 1, 'Impacto Social', 'Conectar voluntarios con organizaciones mediante plataforma digital.', 'Registro de voluntarios, gestión de proyectos, certificación digital.', 'Metodología ágil Kanban.'),
(10, 'Sistema de Detección de Plagio Académico', 'Herramienta para detectar plagio en trabajos académicos usando NLP y comparación semántica avanzada.', '21300000-2', 2, '2024-06-05', 'investigacion', 1, 'alta', 2, 'NLP y Educación', 'Desarrollar sistema robusto de detección de plagio para entornos académicos.', 'Investigar algoritmos NLP, implementar comparador semántico, validar con corpus.', 'Investigación empírica con datasets académicos reales.'),
(11, 'Dashboard de Análisis de Redes Sociales', 'Herramienta de análisis de sentimientos y tendencias en redes sociales para equipos de marketing digital.', '24100000-K', 2, '2024-06-10', 'desarrollo_software', 2, 'media', 1, 'Análisis de Datos', 'Proveer insights de redes sociales mediante análisis de sentimientos en tiempo real.', 'Conectar APIs sociales, análisis de sentimientos, visualizaciones interactivas.', 'Metodología ágil con sprints cortos.'),
(12, 'Sistema de Gestión de Residuos Inteligente', 'Plataforma IoT para municipalidades que optimiza rutas de recolección de residuos según nivel de llenado de contenedores.', '24300000-2', 2, '2024-06-15', 'desarrollo_software', 2, 'alta', 2, 'Smart City', 'Optimizar la recolección de residuos urbanos mediante sensores IoT y algoritmos de rutas.', 'Integrar sensores de nivel, optimizar rutas, reportes de eficiencia.', 'Metodología iterativa con pilotos municipales.'),
-- Pendientes
(13, 'Plataforma de Crowdfunding Comunitario', 'Sistema de financiamiento colectivo para proyectos locales con validación comunitaria y seguimiento transparente.', '21500000-4', 1, '2024-07-01', 'desarrollo_software', 2, 'media', 1, 'Fintech', 'Democratizar el financiamiento de proyectos locales mediante crowdfunding transparente.', 'Gestión de campañas, pagos seguros, reportes públicos.', 'Metodología ágil con foco en experiencia de usuario.'),
(14, 'App de Realidad Aumentada para Museos', 'Aplicación móvil que enriquece la experiencia museística con contenido AR interactivo y guías virtuales.', '21700000-6', 1, '2024-07-05', 'desarrollo_software', 1, 'alta', 2, 'Cultura Digital', 'Mejorar la experiencia de visitantes de museos mediante realidad aumentada.', 'Desarrollar AR markers, contenido multimedia, guía virtual interactiva.', 'Design Thinking centrado en la experiencia del visitante.'),
(15, 'Sistema de Predicción de Deserción Estudiantil', 'Modelo de ML para predecir y prevenir la deserción estudiantil universitaria con intervenciones tempranas.', '22300000-1', 1, '2024-07-10', 'investigacion', 2, 'alta', 2, 'ML en Educación', 'Predecir la deserción estudiantil universitaria para intervenir a tiempo.', 'Recolectar datos académicos, entrenar modelos, validar predicciones.', 'Metodología CRISP-DM para minería de datos.'),
-- Con correcciones
(16, 'App de Gestión de Tareas para Equipos', 'Herramienta colaborativa de gestión de tareas y proyectos para equipos remotos con integración a herramientas populares.', '24500000-4', 3, '2024-05-25', 'desarrollo_software', 1, 'media', 1, 'Productividad', 'Mejorar la gestión de proyectos en equipos remotos mediante app colaborativa.', 'Gestión de tareas, notificaciones, integraciones con Slack y GitHub.', 'Lean startup validando con equipos reales.'),
(17, 'Sistema de Monitoreo de Pacientes Crónicos', 'Plataforma de seguimiento remoto para pacientes con enfermedades crónicas, con alertas para médicos tratantes.', '24700000-6', 3, '2024-05-28', 'desarrollo_software', 2, 'alta', 2, 'Salud Digital', 'Mejorar el seguimiento de pacientes crónicos mediante monitoreo remoto continuo.', 'Registro de signos vitales, alertas automáticas, historial clínico digital.', 'Metodología centrada en el usuario con validación clínica.'),
-- Rechazadas
(18, 'Blog de Recetas Culinarias', 'Un blog simple con recetas de cocina y fotos.', '22100000-K', 5, '2024-04-01', 'desarrollo_software', 1, 'baja', 1, 'Entretenimiento', 'Crear blog de recetas.', 'Diseñar interfaz, subir recetas.', 'Sin metodología definida.'),
(19, 'App de Música Personal', 'Reproductor de música básico para uso personal.', '24900000-8', 5, '2024-04-05', 'desarrollo_software', 1, 'baja', 1, 'Entretenimiento', 'Crear reproductor de música.', 'Interfaz, lista de canciones.', 'Sin metodología definida.'),
(20, 'Investigación sobre Blockchain en Salud', 'Estudio sobre el uso de tecnología blockchain para asegurar historiales clínicos en hospitales públicos chilenos.', '25500000-3', 1, '2024-07-15', 'investigacion', 1, 'alta', 2, 'Blockchain y Salud', 'Investigar la viabilidad de blockchain para proteger historiales clínicos.', 'Revisión bibliográfica, análisis de casos, propuesta de arquitectura.', 'Metodología de investigación sistemática.')
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);

-- Estudiantes adicionales en propuestas grupales
INSERT IGNORE INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden) VALUES
(1, '20111111-1', TRUE, 1), (1, '20222222-2', FALSE, 2),
(2, '20333333-3', TRUE, 1), (2, '20444444-4', FALSE, 2),
(3, '20555555-5', TRUE, 1),
(4, '20777777-7', TRUE, 1), (4, '20888888-8', FALSE, 2),
(5, '20999999-9', TRUE, 1),
(6, '23111111-1', TRUE, 1), (6, '23222222-2', FALSE, 2),
(7, '23333333-3', TRUE, 1), (7, '23444444-4', FALSE, 2),
(8, '23555555-5', TRUE, 1), (8, '23666666-6', FALSE, 2),
(9, '21100000-K', TRUE, 1), (9, '21200000-1', FALSE, 2),
(10, '21300000-2', TRUE, 1),
(11, '24100000-K', TRUE, 1), (11, '24200000-1', FALSE, 2),
(12, '24300000-2', TRUE, 1), (12, '24400000-3', FALSE, 2),
(13, '21500000-4', TRUE, 1), (13, '21600000-5', FALSE, 2),
(14, '21700000-6', TRUE, 1),
(15, '22300000-1', TRUE, 1), (15, '22400000-2', FALSE, 2),
(16, '24500000-4', TRUE, 1),
(17, '24700000-6', TRUE, 1), (17, '24800000-7', FALSE, 2),
(18, '22100000-K', TRUE, 1),
(19, '24900000-8', TRUE, 1),
(20, '25500000-3', TRUE, 1);

-- ============================================================
-- 10. ASIGNACIONES DE PROFESORES A PROPUESTAS
-- ============================================================
INSERT IGNORE INTO asignaciones_propuestas (propuesta_id, profesor_rut, rol_revision, estado_revision, decision, comentarios_revision, activo, asignado_por) VALUES
(1, '10111111-1', 'revisor_principal', 'revisado', 'aprobar', 'Propuesta sólida con objetivos claros y metodología bien definida. Aprobada.', TRUE, '33333333-3'),
(2, '10222222-2', 'revisor_principal', 'revisado', 'aprobar', 'Excelente propuesta con innovación tecnológica significativa. Aprobada.', TRUE, '33333333-3'),
(3, '10333333-3', 'revisor_principal', 'revisado', 'aprobar', 'Propuesta bien fundamentada. Aprobada con observaciones menores.', TRUE, '33333333-3'),
(4, '10444444-4', 'revisor_principal', 'revisado', 'aprobar', 'Alcance adecuado para el plazo establecido. Aprobada.', TRUE, '33333333-3'),
(5, '10555555-5', 'revisor_principal', 'revisado', 'aprobar', 'Propuesta innovadora con impacto social positivo. Aprobada.', TRUE, '33333333-3'),
(6, '10666666-6', 'revisor_principal', 'revisado', 'aprobar', 'Gran impacto social y técnica robusta. Aprobada.', TRUE, '33333333-3'),
(7, '10777777-7', 'revisor_principal', 'revisado', 'aprobar', 'Desafío técnico bien planteado. Aprobada.', TRUE, '33333333-3'),
(8, '10888888-8', 'revisor_principal', 'revisado', 'aprobar', 'Solución práctica con mercado definido. Aprobada.', TRUE, '33333333-3'),
(9, '10999999-9', 'revisor_principal', 'en_revision', NULL, NULL, TRUE, '33333333-3'),
(10, '11000000-0', 'revisor_principal', 'en_revision', NULL, NULL, TRUE, '33333333-3'),
(11, '11100000-K', 'revisor_principal', 'en_revision', NULL, NULL, TRUE, '33333333-3'),
(12, '11200000-1', 'revisor_principal', 'en_revision', NULL, NULL, TRUE, '33333333-3'),
(16, '11300000-2', 'revisor_principal', 'revisado', 'solicitar_correcciones', 'Falta justificación técnica del stack elegido. Requiere correcciones.', TRUE, '33333333-3'),
(17, '11400000-3', 'revisor_principal', 'revisado', 'solicitar_correcciones', 'El alcance es muy amplio para un semestre. Reducir scope.', TRUE, '33333333-3'),
(18, '11500000-4', 'revisor_principal', 'revisado', 'rechazar', 'No cumple con los requisitos mínimos de complejidad técnica.', TRUE, '33333333-3'),
(19, '11600000-5', 'revisor_principal', 'revisado', 'rechazar', 'No constituye un proyecto de titulación válido.', TRUE, '33333333-3');

-- ============================================================
-- 11. PROYECTOS (8 proyectos activos desde las propuestas aprobadas)
-- ============================================================
INSERT INTO proyectos (id, titulo, descripcion, propuesta_id, estudiante_rut, estado_id, fecha_inicio, fecha_entrega_estimada, porcentaje_avance, estado_detallado, modalidad, complejidad, duracion_semestres, objetivo_general, ultima_actividad_fecha) VALUES
(1, 'Sistema de Gestión de Titulaciones Web', 'Plataforma web integral para la gestión del proceso de titulación universitaria.', 1, '20111111-1', 2, '2024-04-01', '2024-11-30', 65.00, 'desarrollo_fase2', 'desarrollo_software', 'alta', 2, 'Desarrollar un sistema web integral para la gestión del proceso de titulación universitaria.', '2024-12-01'),
(2, 'App Móvil de Monitoreo de Cultivos', 'Aplicación móvil para agricultores con monitoreo IoT en tiempo real.', 2, '20333333-3', 2, '2024-04-15', '2024-12-15', 45.00, 'desarrollo_fase1', 'desarrollo_software', 'alta', 2, 'Desarrollar app móvil para monitoreo agrícola con sensores IoT.', '2024-11-28'),
(3, 'Plataforma E-learning Adaptativa', 'Sistema de aprendizaje en línea con personalización basada en ML.', 3, '20555555-5', 2, '2024-05-01', '2025-01-15', 30.00, 'planificacion', 'desarrollo_software', 'alta', 2, 'Crear plataforma e-learning con personalización basada en ML.', '2024-11-25'),
(4, 'Sistema de Inventario con QR', 'Gestión de inventario para PYMES con códigos QR y alertas automáticas.', 4, '20777777-7', 2, '2024-05-10', '2024-12-30', 70.00, 'testing', 'desarrollo_software', 'media', 1, 'Automatizar gestión de inventario para PYMES mediante códigos QR.', '2024-12-02'),
(5, 'Chatbot de Atención Ciudadana', 'Bot inteligente con NLP para municipalidades.', 5, '20999999-9', 2, '2024-05-15', '2025-01-30', 50.00, 'desarrollo_fase2', 'desarrollo_software', 'alta', 2, 'Desarrollar chatbot con NLP para atención ciudadana municipal.', '2024-11-30'),
(6, 'Plataforma de Telemedicina Rural', 'Sistema de teleconsultas para zonas rurales con video adaptativo.', 6, '23111111-1', 2, '2024-06-01', '2025-02-28', 25.00, 'planificacion', 'desarrollo_software', 'alta', 2, 'Facilitar acceso a atención médica en zonas rurales mediante telemedicina.', '2024-11-20'),
(7, 'Sistema de Control de Acceso Biométrico', 'Control de acceso con reconocimiento facial para empresas medianas.', 7, '23333333-3', 2, '2024-06-10', '2025-02-28', 40.00, 'desarrollo_fase1', 'desarrollo_software', 'alta', 1, 'Implementar control de acceso biométrico basado en reconocimiento facial.', '2024-11-22'),
(8, 'App de Transporte Compartido Universitario', 'App de carpooling para estudiantes universitarios.', 8, '23555555-5', 2, '2024-06-20', '2025-01-31', 55.00, 'desarrollo_fase2', 'desarrollo_software', 'media', 1, 'Reducir costos de transporte estudiantil mediante app de carpooling.', '2024-12-01')
ON DUPLICATE KEY UPDATE titulo = VALUES(titulo);

-- Actualizar propuestas con proyecto_id
UPDATE propuestas SET proyecto_id = 1 WHERE id = 1;
UPDATE propuestas SET proyecto_id = 2 WHERE id = 2;
UPDATE propuestas SET proyecto_id = 3 WHERE id = 3;
UPDATE propuestas SET proyecto_id = 4 WHERE id = 4;
UPDATE propuestas SET proyecto_id = 5 WHERE id = 5;
UPDATE propuestas SET proyecto_id = 6 WHERE id = 6;
UPDATE propuestas SET proyecto_id = 7 WHERE id = 7;
UPDATE propuestas SET proyecto_id = 8 WHERE id = 8;

-- Estudiantes en proyectos
INSERT IGNORE INTO estudiantes_proyectos (proyecto_id, estudiante_rut, es_creador, orden) VALUES
(1, '20111111-1', TRUE, 1), (1, '20222222-2', FALSE, 2),
(2, '20333333-3', TRUE, 1), (2, '20444444-4', FALSE, 2),
(3, '20555555-5', TRUE, 1),
(4, '20777777-7', TRUE, 1), (4, '20888888-8', FALSE, 2),
(5, '20999999-9', TRUE, 1),
(6, '23111111-1', TRUE, 1), (6, '23222222-2', FALSE, 2),
(7, '23333333-3', TRUE, 1), (7, '23444444-4', FALSE, 2),
(8, '23555555-5', TRUE, 1), (8, '23666666-6', FALSE, 2);

-- ============================================================
-- 12. ASIGNACIONES DE PROFESORES A PROYECTOS
-- rol_profesor_id: 1=Revisor, 2=Guía, 3=Sala, 4=Informante
-- ============================================================
INSERT IGNORE INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, activo, asignado_por, observaciones) VALUES
-- Proyecto 1
(1, '10111111-1', 2, TRUE, '33333333-3', 'Profesor Guía asignado por experiencia en ingeniería de software'),
(1, '10222222-2', 4, TRUE, '33333333-3', 'Profesor Informante asignado'),
(1, '10333333-3', 1, TRUE, '33333333-3', 'Profesor Revisor asignado'),
-- Proyecto 2
(2, '10222222-2', 2, TRUE, '33333333-3', 'Profesor Guía con experiencia en IoT'),
(2, '10444444-4', 4, TRUE, '33333333-3', 'Profesor Informante asignado'),
(2, '10555555-5', 1, TRUE, '33333333-3', 'Profesor Revisor asignado'),
-- Proyecto 3
(3, '10333333-3', 2, TRUE, '33333333-3', 'Profesor Guía con experiencia en ML'),
(3, '10666666-6', 4, TRUE, '33333333-3', 'Profesor Informante asignado'),
(3, '10777777-7', 1, TRUE, '33333333-3', 'Profesor Revisor asignado'),
-- Proyecto 4
(4, '10444444-4', 2, TRUE, '33333333-3', 'Profesor Guía con experiencia en sistemas empresariales'),
(4, '10888888-8', 4, TRUE, '33333333-3', 'Profesor Informante asignado'),
(4, '10999999-9', 1, TRUE, '33333333-3', 'Profesor Revisor asignado'),
-- Proyecto 5
(5, '10555555-5', 2, TRUE, '33333333-3', 'Profesor Guía con experiencia en IA'),
(5, '11000000-0', 4, TRUE, '33333333-3', 'Profesor Informante asignado'),
(5, '11100000-K', 1, TRUE, '33333333-3', 'Profesor Revisor asignado'),
-- Proyecto 6
(6, '10666666-6', 2, TRUE, '33333333-3', 'Profesor Guía con experiencia en salud digital'),
(6, '11200000-1', 4, TRUE, '33333333-3', 'Profesor Informante asignado'),
(6, '11300000-2', 1, TRUE, '33333333-3', 'Profesor Revisor asignado'),
-- Proyecto 7
(7, '10777777-7', 2, TRUE, '33333333-3', 'Profesor Guía con experiencia en seguridad'),
(7, '11400000-3', 4, TRUE, '33333333-3', 'Profesor Informante asignado'),
(7, '11500000-4', 1, TRUE, '33333333-3', 'Profesor Revisor asignado'),
-- Proyecto 8
(8, '10888888-8', 2, TRUE, '33333333-3', 'Profesor Guía con experiencia en apps móviles'),
(8, '11600000-5', 4, TRUE, '33333333-3', 'Profesor Informante asignado'),
(8, '11700000-6', 1, TRUE, '33333333-3', 'Profesor Revisor asignado');

-- ============================================================
-- 13. AVANCES
-- ============================================================
INSERT IGNORE INTO avances (proyecto_id, titulo, descripcion, estado_id, comentarios_profesor, fecha_envio, profesor_revisor) VALUES
-- Proyecto 1
(1, 'Avance 1 - Diseño de Base de Datos', 'Se completó el modelo entidad-relación y la creación de la base de datos con todas las tablas necesarias.', 4, 'Excelente trabajo en el diseño. El modelo está bien normalizado.', '2024-05-15', '10111111-1'),
(1, 'Avance 2 - Backend API REST', 'Se implementaron los endpoints principales del backend con autenticación JWT.', 4, 'Buena implementación. Considerar agregar más validaciones de entrada.', '2024-07-01', '10111111-1'),
(1, 'Avance 3 - Frontend React', 'Se desarrollaron los módulos principales del frontend con componentes reutilizables.', 2, NULL, '2024-09-15', NULL),
-- Proyecto 2
(2, 'Avance 1 - Arquitectura del Sistema', 'Definición de la arquitectura IoT y selección de sensores para el prototipo inicial.', 4, 'Buen análisis de alternativas tecnológicas.', '2024-06-01', '10222222-2'),
(2, 'Avance 2 - Integración de Sensores', 'Implementación de la lectura de datos de temperatura, humedad y pH del suelo.', 2, NULL, '2024-08-20', NULL),
-- Proyecto 3
(3, 'Avance 1 - Estado del Arte', 'Revisión bibliográfica sobre sistemas adaptativos de aprendizaje y algoritmos de ML aplicados.', 4, 'Revisión exhaustiva. Incorporar fuentes más recientes (2022-2024).', '2024-06-20', '10333333-3'),
-- Proyecto 4
(4, 'Avance 1 - Análisis de Requerimientos', 'Levantamiento de requerimientos con 3 PYMES de la región para validar el producto.', 4, 'Muy buen trabajo de campo. Los requerimientos están bien documentados.', '2024-06-15', '10444444-4'),
(4, 'Avance 2 - Módulo QR y Escáner', 'Implementación del módulo de generación y lectura de códigos QR integrado al inventario.', 4, 'Funcionalidad correcta. Agregar soporte para múltiples formatos de código.', '2024-08-01', '10444444-4'),
(4, 'Avance 3 - Sistema de Alertas', 'Implementación del sistema de notificaciones y alertas de stock mínimo.', 4, 'Excelente implementación. Listo para testing con usuarios reales.', '2024-10-01', '10444444-4'),
-- Proyecto 5
(5, 'Avance 1 - Modelo NLP Base', 'Entrenamiento del modelo base de procesamiento de lenguaje natural con corpus municipal.', 4, 'Métricas de precisión aceptables. Continuar con fine-tuning.', '2024-07-01', '10555555-5'),
(5, 'Avance 2 - Integración con Sistema Municipal', 'Conexión del chatbot con el sistema de trámites del municipio piloto.', 2, NULL, '2024-09-10', NULL),
-- Proyecto 6
(6, 'Avance 1 - Diseño de Arquitectura', 'Diseño de la arquitectura del sistema con foco en baja conectividad.', 2, NULL, '2024-07-20', NULL),
-- Proyecto 7
(7, 'Avance 1 - Investigación Tecnológica', 'Evaluación de bibliotecas de reconocimiento facial: OpenCV, DeepFace, FaceNet.', 4, 'Análisis comparativo muy completo. Buena elección de tecnología.', '2024-07-25', '10777777-7'),
(7, 'Avance 2 - Prototipo Reconocimiento Facial', 'Prototipo funcional de reconocimiento facial con 95% de precisión en condiciones controladas.', 2, NULL, '2024-10-01', NULL),
-- Proyecto 8
(8, 'Avance 1 - Diseño UX/UI', 'Diseño de interfaces y flujos de usuario validados con 20 estudiantes de la universidad.', 4, 'Excelente trabajo de UX. Las pantallas son intuitivas y bien diseñadas.', '2024-08-01', '10888888-8'),
(8, 'Avance 2 - Backend y Geolocalización', 'Implementación del backend y módulo de geolocalización con algoritmo de matching.', 2, NULL, '2024-10-15', NULL);

-- ============================================================
-- 14. CRONOGRAMAS DE PROYECTO
-- ============================================================
INSERT IGNORE INTO cronogramas_proyecto (proyecto_id, nombre_cronograma, fecha_inicio, fecha_fin_estimada, activo, creado_por_rut, aprobado_por_estudiante) VALUES
(1, 'Cronograma Principal P1', '2024-04-01', '2024-11-30', TRUE, '10111111-1', TRUE),
(2, 'Cronograma Principal P2', '2024-04-15', '2024-12-15', TRUE, '10222222-2', TRUE),
(3, 'Cronograma Principal P3', '2024-05-01', '2025-01-15', TRUE, '10333333-3', FALSE),
(4, 'Cronograma Principal P4', '2024-05-10', '2024-12-30', TRUE, '10444444-4', TRUE),
(5, 'Cronograma Principal P5', '2024-05-15', '2025-01-30', TRUE, '10555555-5', TRUE),
(6, 'Cronograma Principal P6', '2024-06-01', '2025-02-28', TRUE, '10666666-6', FALSE),
(7, 'Cronograma Principal P7', '2024-06-10', '2025-02-28', TRUE, '10777777-7', TRUE),
(8, 'Cronograma Principal P8', '2024-06-20', '2025-01-31', TRUE, '10888888-8', TRUE);

-- ============================================================
-- 15. HITOS DE CRONOGRAMA
-- ============================================================
INSERT IGNORE INTO hitos_cronograma (cronograma_id, proyecto_id, nombre_hito, tipo_hito, fecha_limite, estado, porcentaje_avance, creado_por_rut) VALUES
-- P1
(1, 1, 'Entrega documento de análisis', 'entrega_documento', '2024-05-31', 'aprobado', 100.00, '10111111-1'),
(1, 1, 'Revisión de avance Backend', 'revision_avance', '2024-07-15', 'aprobado', 100.00, '10111111-1'),
(1, 1, 'Entrega Frontend completo', 'entrega_documento', '2024-09-30', 'en_progreso', 70.00, '10111111-1'),
(1, 1, 'Defensa final', 'defensa', '2024-11-30', 'pendiente', 0.00, '10111111-1'),
-- P2
(2, 2, 'Entrega arquitectura y diseño', 'entrega_documento', '2024-06-15', 'aprobado', 100.00, '10222222-2'),
(2, 2, 'Prototipo sensores integrado', 'revision_avance', '2024-09-01', 'en_progreso', 50.00, '10222222-2'),
(2, 2, 'App móvil funcional', 'entrega_documento', '2024-11-15', 'pendiente', 0.00, '10222222-2'),
-- P4
(4, 4, 'Análisis de requerimientos', 'entrega_documento', '2024-06-30', 'aprobado', 100.00, '10444444-4'),
(4, 4, 'Módulo QR implementado', 'revision_avance', '2024-08-15', 'aprobado', 100.00, '10444444-4'),
(4, 4, 'Sistema de alertas', 'revision_avance', '2024-10-15', 'aprobado', 100.00, '10444444-4'),
(4, 4, 'Testing con usuarios finales', 'revision_avance', '2024-11-30', 'en_progreso', 60.00, '10444444-4'),
-- P8
(8, 8, 'Diseño UX validado', 'entrega_documento', '2024-08-15', 'aprobado', 100.00, '10888888-8'),
(8, 8, 'Backend y matching implementado', 'revision_avance', '2024-10-31', 'en_progreso', 55.00, '10888888-8'),
(8, 8, 'Defensa final', 'defensa', '2025-01-31', 'pendiente', 0.00, '10888888-8');

-- ============================================================
-- 16. REUNIONES Y PARTICIPANTES
-- ============================================================
INSERT IGNORE INTO solicitudes_reunion (proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta, hora_propuesta, duracion_minutos, tipo_reunion, descripcion, estado, creado_por) VALUES
(1, '10111111-1', '20111111-1', '2024-05-10', '10:00', 60, 'revision_avance', 'Revisión del diseño de base de datos', 'confirmada', 'profesor'),
(1, '10111111-1', '20111111-1', '2024-07-05', '10:00', 60, 'revision_avance', 'Revisión del avance del backend', 'confirmada', 'profesor'),
(1, '10111111-1', '20111111-1', '2024-10-01', '11:00', 90, 'revision_avance', 'Revisión integración frontend-backend', 'confirmada', 'sistema'),
(2, '10222222-2', '20333333-3', '2024-06-05', '09:00', 60, 'revision_avance', 'Revisión arquitectura IoT', 'confirmada', 'profesor'),
(4, '10444444-4', '20777777-7', '2024-06-20', '14:00', 60, 'revision_avance', 'Validación de requerimientos con PYME', 'confirmada', 'sistema'),
(4, '10444444-4', '20777777-7', '2024-08-10', '14:00', 60, 'revision_avance', 'Demo módulo QR', 'confirmada', 'sistema'),
(7, '10777777-7', '23333333-3', '2024-08-01', '11:00', 60, 'revision_avance', 'Presentación análisis tecnológico', 'confirmada', 'profesor'),
(8, '10888888-8', '23555555-5', '2024-08-10', '15:00', 60, 'revision_avance', 'Revisión prototipos UX', 'confirmada', 'profesor');

INSERT IGNORE INTO reuniones_calendario (solicitud_reunion_id, proyecto_id, profesor_rut, estudiante_rut, fecha, hora_inicio, hora_fin, tipo_reunion, titulo, descripcion, lugar, modalidad, estado) VALUES
(1, 1, '10111111-1', '20111111-1', '2024-05-10', '10:00', '11:00', 'revision_avance', 'Revisión DB - P1', 'Revisión del modelo de base de datos', 'Sala DSI-301', 'presencial', 'realizada'),
(2, 1, '10111111-1', '20111111-1', '2024-07-05', '10:00', '11:00', 'revision_avance', 'Revisión Backend - P1', 'Revisión del avance del backend', 'Sala DSI-301', 'presencial', 'realizada'),
(3, 1, '10111111-1', '20111111-1', '2024-10-01', '11:00', '12:30', 'revision_avance', 'Revisión Integración - P1', 'Integración frontend-backend', 'Microsoft Teams', 'virtual', 'realizada'),
(4, 2, '10222222-2', '20333333-3', '2024-06-05', '09:00', '10:00', 'revision_avance', 'Revisión Arquitectura - P2', 'Arquitectura IoT del sistema', 'Sala DSI-302', 'presencial', 'realizada'),
(5, 4, '10444444-4', '20777777-7', '2024-06-20', '14:00', '15:00', 'revision_avance', 'Validación Requerimientos - P4', 'Validación con PYME piloto', 'Empresa piloto', 'presencial', 'realizada'),
(6, 4, '10444444-4', '20777777-7', '2024-08-10', '14:00', '15:00', 'revision_avance', 'Demo QR - P4', 'Demostración módulo QR', 'Sala DSI-303', 'presencial', 'realizada'),
(7, 7, '10777777-7', '23333333-3', '2024-08-01', '11:00', '12:00', 'revision_avance', 'Análisis Tecnológico - P7', 'Análisis de tecnologías de reconocimiento facial', 'Sala DSI-301', 'presencial', 'realizada'),
(8, 8, '10888888-8', '23555555-5', '2024-08-10', '15:00', '16:00', 'revision_avance', 'Revisión UX - P8', 'Revisión de prototipos UX de la app', 'Sala DSI-302', 'presencial', 'realizada');

-- Participantes en reuniones
INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado) VALUES
(1, '10111111-1', 'organizador', TRUE), (1, '20111111-1', 'participante', TRUE), (1, '20222222-2', 'participante', TRUE),
(2, '10111111-1', 'organizador', TRUE), (2, '20111111-1', 'participante', TRUE), (2, '20222222-2', 'participante', TRUE),
(3, '10111111-1', 'organizador', TRUE), (3, '20111111-1', 'participante', TRUE), (3, '20222222-2', 'participante', TRUE),
(4, '10222222-2', 'organizador', TRUE), (4, '20333333-3', 'participante', TRUE), (4, '20444444-4', 'participante', TRUE),
(5, '10444444-4', 'organizador', TRUE), (5, '20777777-7', 'participante', TRUE), (5, '20888888-8', 'participante', TRUE),
(6, '10444444-4', 'organizador', TRUE), (6, '20777777-7', 'participante', TRUE), (6, '20888888-8', 'participante', TRUE),
(7, '10777777-7', 'organizador', TRUE), (7, '23333333-3', 'participante', TRUE), (7, '23444444-4', 'participante', TRUE),
(8, '10888888-8', 'organizador', TRUE), (8, '23555555-5', 'participante', TRUE), (8, '23666666-6', 'participante', TRUE);

-- ============================================================
-- 17. FECHAS IMPORTANTES
-- ============================================================
INSERT IGNORE INTO fechas (titulo, descripcion, fecha, tipo_fecha, es_global, habilitada, requiere_entrega, creado_por_rut) VALUES
('Cierre envío propuestas 2024-1', 'Fecha límite para envío de propuestas primer semestre 2024', '2024-05-31', 'entrega_propuesta', TRUE, FALSE, TRUE, '33333333-3'),
('Cierre envío propuestas 2024-2', 'Fecha límite para envío de propuestas segundo semestre 2024', '2024-09-30', 'entrega_propuesta', TRUE, TRUE, TRUE, '33333333-3'),
('Defensa Oral Diciembre 2024', 'Período de defensas orales de proyectos semestre 2024-2', '2024-12-20', 'defensa', TRUE, TRUE, FALSE, '33333333-3'),
('Entrega Informe Final 2024-2', 'Fecha límite entrega informe final proyectos 2024-2', '2024-12-15', 'entrega_final', TRUE, TRUE, TRUE, '33333333-3'),
('Inicio período titulación 2025-1', 'Apertura del sistema para nuevas propuestas de titulación 2025', '2025-03-01', 'academica', TRUE, TRUE, FALSE, '33333333-3');

-- ============================================================
-- 18. HITOS DE PROYECTO
-- ============================================================
INSERT IGNORE INTO hitos_proyecto (proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, estado, porcentaje_completado, peso_en_proyecto, es_critico, creado_por_rut) VALUES
-- P1
(1, 'Análisis y Diseño', 'Documento de análisis de requerimientos y diseño del sistema', 'planificacion', '2024-05-31', 'completado', 100.00, 20.0, TRUE, '10111111-1'),
(1, 'Desarrollo Backend', 'Implementación completa de la API REST', 'desarrollo', '2024-07-31', 'completado', 100.00, 30.0, TRUE, '10111111-1'),
(1, 'Desarrollo Frontend', 'Implementación completa de la SPA', 'desarrollo', '2024-10-31', 'en_progreso', 70.00, 30.0, TRUE, '10111111-1'),
(1, 'Testing y Documentación', 'Pruebas de sistema y documentación final', 'documentacion', '2024-11-15', 'pendiente', 0.00, 10.0, FALSE, '10111111-1'),
(1, 'Defensa Oral', 'Presentación y defensa del proyecto', 'defensa', '2024-11-30', 'pendiente', 0.00, 10.0, TRUE, '10111111-1'),
-- P4
(4, 'Análisis de Requerimientos', 'Levantamiento de requerimientos con PYMES', 'planificacion', '2024-06-30', 'completado', 100.00, 15.0, FALSE, '10444444-4'),
(4, 'Módulo QR', 'Implementación generación y lectura QR', 'desarrollo', '2024-08-15', 'completado', 100.00, 25.0, TRUE, '10444444-4'),
(4, 'Sistema de Alertas', 'Implementación notificaciones y alertas', 'desarrollo', '2024-10-15', 'completado', 100.00, 25.0, FALSE, '10444444-4'),
(4, 'Testing', 'Pruebas de usuario con PYMES reales', 'revision', '2024-11-30', 'en_progreso', 60.00, 20.0, TRUE, '10444444-4'),
(4, 'Defensa', 'Presentación y defensa del proyecto', 'defensa', '2024-12-20', 'pendiente', 0.00, 15.0, TRUE, '10444444-4');

-- ============================================================
-- 19. CONVERSACIONES Y MENSAJES
-- ============================================================
INSERT IGNORE INTO conversaciones (id, usuario1_rut, usuario2_rut) VALUES
(1, '10111111-1', '20111111-1'),
(2, '10222222-2', '20333333-3'),
(3, '10444444-4', '20777777-7'),
(4, '10777777-7', '23333333-3'),
(5, '10888888-8', '23555555-5');

INSERT IGNORE INTO mensajes (conversacion_id, remitente_rut, contenido, leido) VALUES
(1, '10111111-1', 'Hola Alejandro, ¿cómo va el desarrollo del frontend?', TRUE),
(1, '20111111-1', 'Hola profesor, vamos al 70%. Tengo una duda sobre la integración con la API.', TRUE),
(1, '10111111-1', 'Claro, agendemos una reunión para revisarlo. ¿Cuándo tienes disponibilidad?', TRUE),
(1, '20111111-1', 'Esta semana el jueves a las 10 am me vendría bien.', FALSE),
(2, '10222222-2', 'Camilo, necesito que me envíes el informe de la integración de sensores.', TRUE),
(2, '20333333-3', 'Listo profesor, se lo envío esta tarde al correo.', TRUE),
(3, '10444444-4', 'Gabriel, excelente trabajo en el módulo de alertas. Procedamos con el testing.', TRUE),
(3, '20777777-7', 'Gracias profesor. Ya coordiné con las 3 PYMES para hacer las pruebas.', FALSE),
(4, '10777777-7', 'Gonzalo, ¿lograron mejorar la precisión del reconocimiento?', TRUE),
(4, '23333333-3', 'Sí profesor, llegamos al 97% con el ajuste de parámetros que sugirió.', FALSE),
(5, '10888888-8', 'Ernesto, los prototipos UX están muy bien diseñados. Sigan así.', TRUE),
(5, '23555555-5', 'Muchas gracias profesor, incorporamos todos los feedbacks de los usuarios.', TRUE);

-- Actualizar ultimo_mensaje_id
UPDATE conversaciones SET ultimo_mensaje_id = 4 WHERE id = 1;
UPDATE conversaciones SET ultimo_mensaje_id = 6 WHERE id = 2;
UPDATE conversaciones SET ultimo_mensaje_id = 8 WHERE id = 3;
UPDATE conversaciones SET ultimo_mensaje_id = 10 WHERE id = 4;
UPDATE conversaciones SET ultimo_mensaje_id = 12 WHERE id = 5;

-- Mensajes no leídos
INSERT IGNORE INTO mensajes_no_leidos (usuario_rut, conversacion_id, cantidad) VALUES
('10111111-1', 1, 1),
('10444444-4', 3, 1),
('10777777-7', 4, 1);

-- ============================================================
-- 20. NOTIFICACIONES
-- ============================================================
INSERT IGNORE INTO notificaciones_proyecto (proyecto_id, tipo_notificacion, destinatario_rut, rol_destinatario, titulo, mensaje, leida) VALUES
(1, 'nueva_entrega',         '10111111-1', 'profesor_guia',      'Nuevo avance enviado - P1',         'El estudiante Alejandro Muñoz ha enviado el avance 3 del proyecto.', FALSE),
(2, 'fecha_limite_proxima',  '20333333-3', 'estudiante',         'Fecha límite próxima - P2',          'El hito "Prototipo sensores integrado" vence en 15 días.', FALSE),
(4, 'nueva_entrega',         '10444444-4', 'profesor_guia',      'Avance 3 aprobado - P4',             'El avance del sistema de alertas fue aprobado exitosamente.', TRUE),
(5, 'nueva_entrega',         '10555555-5', 'profesor_guia',      'Nuevo avance enviado - P5',          'El estudiante Emilio Torres ha enviado el avance 2 del proyecto.', FALSE),
(7, 'nueva_entrega',         '10777777-7', 'profesor_guia',      'Avance 2 recibido - P7',             'Prototipo de reconocimiento facial enviado para revisión.', FALSE),
(1, 'proyecto_creado',       '20111111-1', 'estudiante',         '¡Proyecto creado exitosamente!',     'Tu propuesta fue aprobada y el proyecto ha sido creado. ¡Mucho éxito!', TRUE),
(6, 'proyecto_creado',       '23111111-1', 'estudiante',         '¡Proyecto creado exitosamente!',     'Tu propuesta fue aprobada y el proyecto ha sido creado. ¡Mucho éxito!', TRUE);

-- ============================================================
-- 21. DOCUMENTOS DE PROYECTO
-- ============================================================
INSERT IGNORE INTO documentos_proyecto (proyecto_id, tipo_documento, nombre_archivo, nombre_original, ruta_archivo, subido_por, version, estado) VALUES
(1, 'propuesta_final',  'prop_p1_v1.pdf',    'Propuesta_SistemaGestion_v1.pdf',    'uploads/proyectos/1/', '20111111-1', 1, 'aprobado'),
(1, 'informe_avance',   'avance1_p1.pdf',    'Informe_Avance1_BD.pdf',             'uploads/proyectos/1/', '20111111-1', 1, 'aprobado'),
(1, 'informe_avance',   'avance2_p1.pdf',    'Informe_Avance2_Backend.pdf',        'uploads/proyectos/1/', '20111111-1', 2, 'aprobado'),
(2, 'propuesta_final',  'prop_p2_v1.pdf',    'Propuesta_AppCultivos_v1.pdf',       'uploads/proyectos/2/', '20333333-3', 1, 'aprobado'),
(4, 'propuesta_final',  'prop_p4_v1.pdf',    'Propuesta_InventarioQR_v1.pdf',      'uploads/proyectos/4/', '20777777-7', 1, 'aprobado'),
(4, 'informe_avance',   'avance1_p4.pdf',    'Informe_Requerimientos_PYME.pdf',    'uploads/proyectos/4/', '20777777-7', 1, 'aprobado'),
(4, 'informe_avance',   'avance2_p4.pdf',    'Informe_ModuloQR.pdf',               'uploads/proyectos/4/', '20777777-7', 2, 'aprobado'),
(7, 'informe_avance',   'avance1_p7.pdf',    'Analisis_Tecnologias_Biometricas.pdf','uploads/proyectos/7/', '23333333-3', 1, 'aprobado'),
(8, 'informe_avance',   'avance1_p8.pdf',    'Prototipos_UX_Carpooling.pdf',       'uploads/proyectos/8/', '23555555-5', 1, 'aprobado');

-- ============================================================
-- 22. ACTIVIDAD DEL SISTEMA
-- ============================================================
INSERT IGNORE INTO actividad_sistema (tipo, descripcion, usuario_rut, detalles) VALUES
('login',               'Inicio de sesión exitoso',                    '20111111-1', '{"ip":"192.168.1.1"}'),
('propuesta_creada',    'Propuesta "Sistema de Gestión" creada',       '20111111-1', '{"propuesta_id":1}'),
('propuesta_aprobada',  'Propuesta 1 aprobada por profesor',           '10111111-1', '{"propuesta_id":1}'),
('proyecto_creado',     'Proyecto 1 creado desde propuesta aprobada',  '33333333-3', '{"proyecto_id":1}'),
('avance_enviado',      'Avance 1 enviado al proyecto 1',              '20111111-1', '{"avance_id":1}'),
('avance_revisado',     'Avance 1 revisado y aprobado',                '10111111-1', '{"avance_id":1}'),
('login',               'Inicio de sesión exitoso',                    '20333333-3', '{"ip":"192.168.1.5"}'),
('propuesta_creada',    'Propuesta "App Cultivos" creada',             '20333333-3', '{"propuesta_id":2}'),
('reunion_agendada',    'Reunión agendada para proyecto 4',            '10444444-4', '{"reunion_id":5}'),
('login',               'Inicio de sesión exitoso',                    '33333333-3', '{"ip":"192.168.0.1"}');

-- ============================================================
-- 23. CONFIGURACIÓN DE ALERTAS POR PROYECTO
-- ============================================================
INSERT IGNORE INTO configuracion_alertas (proyecto_id, profesor_rut, dias_alerta_entregas, dias_alerta_reuniones, dias_alerta_defensas) VALUES
(1, '10111111-1', 5, 2, 10),
(2, '10222222-2', 5, 2, 10),
(3, '10333333-3', 7, 1, 14),
(4, '10444444-4', 3, 1, 7),
(5, '10555555-5', 5, 2, 10),
(6, '10666666-6', 7, 2, 14),
(7, '10777777-7', 5, 1, 10),
(8, '10888888-8', 5, 2, 7);

-- ============================================================
-- FIN DEL SCRIPT SEED
-- ============================================================
SELECT CONCAT('✅ Seed completado: ', 
  (SELECT COUNT(*) FROM usuarios WHERE rol_id = 1), ' estudiantes, ',
  (SELECT COUNT(*) FROM usuarios WHERE rol_id = 2), ' profesores, ',
  (SELECT COUNT(*) FROM propuestas), ' propuestas, ',
  (SELECT COUNT(*) FROM proyectos), ' proyectos') AS resultado;
