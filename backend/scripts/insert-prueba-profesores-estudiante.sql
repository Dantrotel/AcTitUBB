-- ============================================================
-- DATOS DE PRUEBA: 3 Profesores + 1 Estudiante
-- Contraseña de todos: 1234
-- Hash bcrypt: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle
-- ============================================================

USE actitubb;

-- ============================================================
-- 1. PROFESORES (3 nuevos)
-- ============================================================
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) VALUES
('12111111-1', 'Luisa Fernanda Rojas Andrade',  'lrojas@ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('12222222-2', 'Tomás Ignacio Peña Carrasco',   'tpena@ubiobio.cl',     '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1),
('12333333-3', 'Sofía Beatriz Lagos Moya',      'slagos@ubiobio.cl',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 2, 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), email = VALUES(email);

-- Asignar profesores al Departamento de Sistemas de Información (DSI, id=1)
INSERT IGNORE INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso) VALUES
('12111111-1', 1, TRUE, '2023-03-01'),
('12222222-2', 1, TRUE, '2023-03-01'),
('12333333-3', 1, TRUE, '2024-03-01');

-- ============================================================
-- 2. ESTUDIANTE (1 nuevo)
-- ============================================================
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) VALUES
('26111111-1', 'Mateo Andrés Cifuentes Vera',   'mcifuentes.ici@alumnos.ubiobio.cl', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.ucrRFABle', 1, 1)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), email = VALUES(email);

-- Inscribir estudiante en carrera ICI (id=1)
INSERT IGNORE INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('26111111-1', 1, 2023, 7, 'regular', '2023-03-01', TRUE);

-- Inscribir estudiante en el ramo PT del semestre activo
-- (Se usa el semestre con activo=TRUE; si no hay ninguno, insertar manualmente el semestre_id correcto)
INSERT IGNORE INTO inscripciones_ramo (estudiante_rut, semestre_id, tipo_ramo)
SELECT '26111111-1', id, 'PT'
FROM semestres
WHERE activo = TRUE
LIMIT 1;

-- ============================================================
-- VERIFICACIÓN
-- ============================================================
SELECT 'Profesores insertados:' AS info;
SELECT rut, nombre, email FROM usuarios WHERE rut IN ('12111111-1','12222222-2','12333333-3');

SELECT 'Departamento de los profesores:' AS info;
SELECT pd.profesor_rut, u.nombre, d.nombre AS departamento
FROM profesores_departamentos pd
JOIN usuarios u ON u.rut = pd.profesor_rut
JOIN departamentos d ON d.id = pd.departamento_id
WHERE pd.profesor_rut IN ('12111111-1','12222222-2','12333333-3');

SELECT 'Estudiante insertado:' AS info;
SELECT u.rut, u.nombre, u.email, c.nombre AS carrera, ec.semestre_actual, ec.ano_ingreso
FROM usuarios u
JOIN estudiantes_carreras ec ON ec.estudiante_rut = u.rut
JOIN carreras c ON c.id = ec.carrera_id
WHERE u.rut = '26111111-1';

SELECT 'Inscripción de ramo:' AS info;
SELECT ir.estudiante_rut, ir.tipo_ramo, s.nombre AS semestre
FROM inscripciones_ramo ir
JOIN semestres s ON s.id = ir.semestre_id
WHERE ir.estudiante_rut = '26111111-1';
