-- ============================================================
-- SEED DATA FICTICIO - AcTitUBB
-- Fecha: 2026-02-24
-- Proyectos: 1 con 2 estudiantes, 1 con 3 estudiantes
-- Contraseña de todos los usuarios: 1234
-- ============================================================

-- ============================================================
-- 1. ACTUALIZAR ESTRUCTURA ACADÉMICA
-- ============================================================
UPDATE facultades SET
    nombre = 'Facultad de Ciencias de la Ingeniería',
    codigo = 'FCI',
    descripcion = 'Facultad dedicada a la formación de ingenieros en diversas disciplinas.',
    email = 'fci@ubiobio.cl',
    ubicacion = 'Campus La Castilla, Concepción'
WHERE id = 1;

UPDATE departamentos SET
    nombre = 'Departamento de Informática y Computación',
    codigo = 'DIC',
    email = 'dic@ubiobio.cl',
    ubicacion = 'Edificio 2, Campus La Castilla',
    facultad_id = 1
WHERE id = 1;

UPDATE carreras SET
    nombre = 'Ingeniería Civil en Informática',
    codigo = 'ICINF',
    titulo_profesional = 'Ingeniero Civil en Informática',
    grado_academico = 'Licenciado en Ciencias de la Ingeniería',
    duracion_semestres = 10,
    descripcion = 'Carrera orientada al desarrollo de software empresarial y sistemas complejos.'
WHERE id = 1;

UPDATE carreras SET
    nombre = 'Ingeniería Informática Empresarial',
    codigo = 'IIE',
    titulo_profesional = 'Ingeniero en Informática Empresarial',
    grado_academico = 'Licenciado en Informática',
    duracion_semestres = 8,
    descripcion = 'Carrera enfocada en la gestión tecnológica y transformación digital de empresas.'
WHERE id = 2;

-- ============================================================
-- 2. NUEVOS USUARIOS
-- ============================================================
-- Hash bcrypt de la contraseña "1234"
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
-- Estudiantes adicionales
('15234567-3', 'Ana Martínez López',     'ana.martinez@alumnos.ubiobio.cl',   '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('16789012-4', 'Carlos Fuentes Soto',    'carlos.fuentes@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('17890123-5', 'María González Pérez',   'maria.gonzalez@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('18901234-6', 'Pedro Rojas Vega',       'pedro.rojas@alumnos.ubiobio.cl',    '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
-- Profesores adicionales
('13456789-8', 'Dr. Roberto Sánchez Muñoz',   'roberto.sanchez@ubiobio.cl',  '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('12345678-9', 'Dra. Carmen Valdivia Torres', 'carmen.valdivia@ubiobio.cl',   '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), email = VALUES(email);

-- ============================================================
-- 3. ACTUALIZAR PROPUESTA Y PROYECTO EXISTENTES (AAAA → real)
-- ============================================================
UPDATE propuestas SET
    titulo                     = 'Sistema Web de Gestión de Inventario para PyMES',
    descripcion                = 'Sistema web que permite a pequeñas y medianas empresas gestionar su inventario de forma eficiente, con control de stock, alertas de reabastecimiento y reportes en tiempo real.',
    modalidad                  = 'desarrollo_software',
    numero_estudiantes         = 2,
    complejidad_estimada       = 'media',
    duracion_estimada_semestres = 1,
    area_tematica              = 'Sistemas de Información',
    objetivos_generales        = 'Desarrollar un sistema web de gestión de inventario accesible y eficiente para PyMES chilenas.',
    objetivos_especificos      = '1. Implementar módulo de control de stock con historial de movimientos.\n2. Crear sistema de alertas automáticas de reabastecimiento.\n3. Diseñar panel de reportes gerenciales en tiempo real.',
    metodologia_propuesta      = 'Metodología ágil SCRUM con sprints de 2 semanas y reuniones de seguimiento semanales.',
    recursos_necesarios        = 'Servidor de desarrollo, base de datos MySQL, acceso a empresa piloto PyME.'
WHERE id = 2;

UPDATE proyectos SET
    titulo               = 'Sistema Web de Gestión de Inventario para PyMES',
    descripcion          = 'Sistema web que permite a pequeñas y medianas empresas gestionar su inventario de forma eficiente, con control de stock, alertas de reabastecimiento y reportes en tiempo real.',
    estado_id            = 2,  -- en_desarrollo
    fecha_inicio         = '2025-03-01',
    fecha_entrega_estimada = '2025-08-31',
    objetivo_general     = 'Desarrollar un sistema web de gestión de inventario accesible y eficiente para PyMES chilenas.',
    metodologia          = 'Metodología ágil SCRUM con sprints de 2 semanas.',
    porcentaje_avance    = 42.00,
    estado_detallado     = 'desarrollo_fase1',
    prioridad            = 'media',
    riesgo_nivel         = 'bajo',
    modalidad            = 'desarrollo_software',
    complejidad          = 'media',
    duracion_semestres   = 1,
    tiempo_dedicado_horas = 130,
    ultima_actividad_fecha = '2025-07-15',
    ultima_actividad     = NOW()
WHERE id = 1;

-- ============================================================
-- 4. PROYECTO 1: AGREGAR 2° ESTUDIANTE (total = 2)
-- ============================================================
INSERT IGNORE INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden) VALUES
(2, '11111111-1',  1, 1),
(2, '15234567-3',  0, 2);

INSERT IGNORE INTO estudiantes_proyectos (proyecto_id, estudiante_rut, es_creador, orden) VALUES
(1, '15234567-3', 0, 2);

-- ============================================================
-- 5. ASIGNAR PROFESOR INFORMANTE AL PROYECTO 1
-- ============================================================
INSERT IGNORE INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, activo, asignado_por) VALUES
(1, '13456789-8', 4, 1, '33333333-3');  -- Profesor Informante

-- ============================================================
-- 6. CREAR PROPUESTA PARA PROYECTO 2 (3 estudiantes)
-- ============================================================
INSERT INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id, fecha_envio, fecha_aprobacion,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta,
    justificacion_complejidad, recursos_necesarios
) VALUES (
    'Plataforma de E-Learning para Educación Rural',
    'Desarrollo de una plataforma educativa en línea adaptada para zonas rurales con conectividad limitada, que permita a estudiantes de educación básica y media acceder a contenidos de calidad con soporte offline.',
    '16789012-4',
    4,  -- aprobada
    '2025-02-15',
    '2025-03-01',
    'desarrollo_software',
    3,
    'alta',
    2,
    'Tecnologías de la Información para la Educación',
    'Desarrollar una plataforma e-learning funcional para zonas rurales con soporte offline y adaptación a dispositivos de bajo rendimiento.',
    '1. Implementar sistema de caché y descarga offline de contenidos.\n2. Crear motor de sincronización incremental para entornos de baja conectividad.\n3. Diseñar interfaz adaptativa para dispositivos de bajo rendimiento.\n4. Integrar sistema de evaluaciones y seguimiento del aprendizaje.',
    'Desarrollo iterativo con entregas mensuales y pruebas de usabilidad con usuarios reales en zonas rurales de la Región del Biobío.',
    'Alta complejidad por la necesidad de soporte offline robusto, sincronización inteligente y adaptación a múltiples dispositivos en entornos con conectividad limitada o intermitente.',
    'Servidor de desarrollo, dispositivos móviles de bajo rendimiento para pruebas, acceso a escuelas rurales piloto en la Región del Biobío.'
);

SET @propuesta2_id = LAST_INSERT_ID();

-- ============================================================
-- 7. CREAR PROYECTO 2 (3 estudiantes)
-- ============================================================
INSERT INTO proyectos (
    titulo, descripcion, propuesta_id, estudiante_rut, estado_id,
    fecha_inicio, fecha_entrega_estimada,
    objetivo_general, objetivos_especificos, metodologia,
    porcentaje_avance, estado_detallado, prioridad, riesgo_nivel,
    modalidad, complejidad, duracion_semestres,
    tiempo_dedicado_horas, ultima_actividad_fecha, ultima_actividad
) VALUES (
    'Plataforma de E-Learning para Educación Rural',
    'Plataforma educativa en línea con soporte offline para zonas rurales con conectividad limitada.',
    @propuesta2_id,
    '16789012-4',
    2,  -- en_desarrollo
    '2025-03-15',
    '2025-12-15',
    'Desarrollar una plataforma e-learning funcional para zonas rurales con soporte offline.',
    '1. Sistema de caché offline.\n2. Motor de sincronización incremental.\n3. UI adaptativa.\n4. Sistema de evaluaciones.',
    'Desarrollo iterativo con sprints de 3 semanas y pruebas en terreno.',
    22.00,
    'planificacion',
    'alta',
    'medio',
    'desarrollo_software',
    'alta',
    2,
    85,
    '2025-07-10',
    NOW()
);

SET @proyecto2_id = LAST_INSERT_ID();

-- ============================================================
-- 8. ASOCIAR 3 ESTUDIANTES AL PROYECTO 2
-- ============================================================
INSERT IGNORE INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden) VALUES
(@propuesta2_id, '16789012-4', 1, 1),
(@propuesta2_id, '17890123-5', 0, 2),
(@propuesta2_id, '18901234-6', 0, 3);

INSERT IGNORE INTO estudiantes_proyectos (proyecto_id, estudiante_rut, es_creador, orden) VALUES
(@proyecto2_id, '16789012-4', 1, 1),
(@proyecto2_id, '17890123-5', 0, 2),
(@proyecto2_id, '18901234-6', 0, 3);

-- ============================================================
-- 9. ASIGNAR PROFESORES AL PROYECTO 2
-- ============================================================
INSERT IGNORE INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, activo, asignado_por) VALUES
(@proyecto2_id, '12345678-9', 2, 1, '33333333-3'),  -- Profesor Guía
(@proyecto2_id, '22222222-2', 4, 1, '33333333-3');  -- Profesor Informante

-- ============================================================
-- 10. MATRICULAR ESTUDIANTES EN CARRERAS
-- ============================================================
INSERT IGNORE INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso) VALUES
('11111111-1', 1, 2021, 9, 'regular',  '2021-03-01'),
('15234567-3', 1, 2021, 9, 'regular',  '2021-03-01'),
('16789012-4', 1, 2022, 7, 'regular',  '2022-03-01'),
('17890123-5', 2, 2022, 7, 'regular',  '2022-03-01'),
('18901234-6', 2, 2022, 7, 'regular',  '2022-03-01');

-- ============================================================
-- 11. ASIGNAR PROFESORES A DEPARTAMENTO
-- ============================================================
INSERT IGNORE INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso, activo) VALUES
('22222222-2', 1, 1, '2018-03-01', 1),
('13456789-8', 1, 1, '2015-03-01', 1),
('12345678-9', 1, 1, '2020-03-01', 1);

-- ============================================================
-- 12. HITOS DEL PROYECTO 1 (Sistema Inventario)
-- ============================================================
INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, fecha_completado, estado, porcentaje_completado, peso_en_proyecto, es_critico, creado_por_rut) VALUES
(1, 'Kickoff y Levantamiento de Requisitos',
    'Reunión inicial con stakeholders y levantamiento de requisitos funcionales y no funcionales del sistema.',
    'inicio', '2025-03-15', '2025-03-14', 'completado', 100.00, 10.0, 1, '22222222-2'),
(1, 'Diseño de Base de Datos y Arquitectura',
    'Modelado entidad-relación, diseño de la arquitectura de 3 capas y definición de tecnologías a utilizar.',
    'planificacion', '2025-04-15', '2025-04-13', 'completado', 100.00, 15.0, 1, '22222222-2'),
(1, 'Implementación Módulo de Stock',
    'Desarrollo del CRUD de productos, registro de movimientos de inventario y cálculo automático de stock mínimo.',
    'desarrollo', '2025-05-31', '2025-05-28', 'completado', 100.00, 20.0, 1, '22222222-2'),
(1, 'Implementación Módulo de Alertas y Reportes',
    'Desarrollo del sistema de alertas automáticas de reabastecimiento y módulo de reportes gerenciales.',
    'desarrollo', '2025-07-15', NULL, 'en_progreso', 50.00, 20.0, 0, '22222222-2'),
(1, 'Pruebas e Integración',
    'Testing unitario, de integración y pruebas de aceptación con usuarios finales de la PyME piloto.',
    'testing', '2025-08-10', NULL, 'pendiente', 0.00, 15.0, 1, '22222222-2'),
(1, 'Documentación Técnica y de Usuario',
    'Redacción del informe final, manual de usuario y documentación técnica del sistema.',
    'documentacion', '2025-08-22', NULL, 'pendiente', 0.00, 10.0, 0, '22222222-2'),
(1, 'Defensa del Proyecto',
    'Presentación y defensa oral ante la comisión evaluadora.',
    'defensa', '2025-08-31', NULL, 'pendiente', 0.00, 10.0, 1, '22222222-2');

-- ============================================================
-- 13. HITOS DEL PROYECTO 2 (E-Learning Rural)
-- ============================================================
INSERT INTO hitos_proyecto (proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, fecha_completado, estado, porcentaje_completado, peso_en_proyecto, es_critico, creado_por_rut) VALUES
(@proyecto2_id, 'Análisis de Requerimientos y Planificación',
    'Análisis completo de requerimientos, planificación del proyecto y definición de tecnologías.',
    'inicio', '2025-04-01', '2025-03-30', 'completado', 100.00, 10.0, 1, '12345678-9'),
(@proyecto2_id, 'Prototipo de Interfaz Adaptativa',
    'Diseño y validación del prototipo de interfaz de usuario adaptativa con pruebas de usabilidad.',
    'planificacion', '2025-05-15', '2025-05-10', 'completado', 100.00, 10.0, 0, '12345678-9'),
(@proyecto2_id, 'Módulo de Gestión de Contenidos',
    'Implementación del sistema de carga, organización y reproducción de contenidos educativos.',
    'desarrollo', '2025-07-01', NULL, 'en_progreso', 35.00, 20.0, 1, '12345678-9'),
(@proyecto2_id, 'Módulo de Caché y Soporte Offline',
    'Implementación del sistema de caché local y sincronización para funcionamiento sin conectividad.',
    'desarrollo', '2025-08-31', NULL, 'pendiente', 0.00, 25.0, 1, '12345678-9'),
(@proyecto2_id, 'Módulo de Evaluaciones',
    'Desarrollo del sistema de pruebas, seguimiento del aprendizaje y generación de reportes para docentes.',
    'desarrollo', '2025-10-15', NULL, 'pendiente', 0.00, 15.0, 0, '12345678-9'),
(@proyecto2_id, 'Pruebas en Terreno',
    'Pruebas de campo con estudiantes y docentes de escuelas rurales de la región.',
    'testing', '2025-11-15', NULL, 'pendiente', 0.00, 10.0, 1, '12345678-9'),
(@proyecto2_id, 'Defensa Final',
    'Presentación y defensa ante la comisión evaluadora.',
    'defensa', '2025-12-10', NULL, 'pendiente', 0.00, 10.0, 1, '12345678-9');

-- ============================================================
-- 14. AVANCES DEL PROYECTO 1
-- ============================================================
INSERT INTO avances (proyecto_id, titulo, descripcion, estado_id, fecha_envio, fecha_revision, profesor_revisor, comentarios_profesor) VALUES
(1, 'Avance 1 – Análisis y Diseño de Base de Datos',
    'Se completó el levantamiento de requisitos con la empresa piloto "Distribuidora El Roble". Se adjunta documento de requisitos, modelo entidad-relación y propuesta de arquitectura del sistema.',
    6, '2025-04-20', '2025-04-25', '22222222-2',
    'Excelente trabajo en el modelado de datos. El diagrama ER está bien estructurado y cubre todos los requerimientos levantados. Proceder con la implementación del módulo de stock según lo planificado.'),
(1, 'Avance 2 – Módulo de Control de Stock',
    'Se implementó el módulo completo de control de stock: CRUD de productos, categorías, proveedores, historial de movimientos de inventario y cálculo automático de puntos de reorden. Se adjunta código fuente y capturas de pantalla.',
    6, '2025-06-05', '2025-06-12', '22222222-2',
    'Muy buen avance. Las funcionalidades de stock están correctamente implementadas y el código es limpio. Observación: mejorar la validación de entradas en el formulario de ingreso masivo de productos y agregar paginación en la tabla de historial.');

-- Avance del proyecto 2
INSERT INTO avances (proyecto_id, titulo, descripcion, estado_id, fecha_envio, fecha_revision, profesor_revisor, comentarios_profesor) VALUES
(@proyecto2_id, 'Avance 1 – Análisis, Prototipo y Plan de Desarrollo',
    'Se finalizó el análisis de requerimientos con docentes de 3 escuelas rurales de Santa Bárbara. Se validó el prototipo de interfaz con usuarios reales (8 docentes y 15 estudiantes). Se adjunta informe de análisis, prototipos en Figma y plan de desarrollo detallado.',
    5, '2025-05-20', NULL, '12345678-9', NULL);

-- ============================================================
-- 15. FECHAS IMPORTANTES
-- ============================================================
INSERT INTO fechas (titulo, descripcion, fecha, tipo_fecha, es_global, activa, permite_extension, requiere_entrega, proyecto_id, creado_por_rut) VALUES
-- Fechas del proyecto 1
('Entrega Informe Parcial – Módulo Alertas y Reportes',
    'Entrega del informe de avance 3 con descripción e implementación del módulo de alertas y reportes.',
    '2025-07-25', 'entrega_avance', 0, 1, 1, 1, 1, '22222222-2'),
('Reunión de Seguimiento – Semana 20',
    'Reunión quincenal de seguimiento del estado del proyecto de inventario.',
    '2025-07-18', 'reunion', 0, 1, 0, 0, 1, '22222222-2'),
-- Fechas del proyecto 2
('Entrega Avance 2 – Módulo de Contenidos',
    'Primera entrega importante del módulo de gestión de contenidos educativos.',
    '2025-08-01', 'entrega_avance', 0, 1, 1, 1, @proyecto2_id, '12345678-9'),
('Reunión de Revisión de Prototipos',
    'Revisión de los prototipos validados con usuarios y ajuste del plan de desarrollo.',
    '2025-07-22', 'reunion', 0, 1, 0, 0, @proyecto2_id, '12345678-9'),
-- Fechas globales del sistema
('Fecha Límite Envío de Propuestas – 2° Semestre 2025',
    'Fecha límite para el envío de propuestas de titulación del segundo semestre del año 2025.',
    '2025-07-31', 'entrega_propuesta', 1, 1, 0, 1, NULL, '33333333-3'),
('Inicio Período de Titulaciones – 2° Semestre 2025',
    'Fecha de inicio del período oficial de proyectos de titulación para el segundo semestre 2025.',
    '2025-08-04', 'academica', 1, 1, 0, 0, NULL, '33333333-3');

-- ============================================================
-- 16. CRONOGRAMA DEL PROYECTO 1
-- ============================================================
INSERT INTO cronogramas_proyecto (proyecto_id, nombre_cronograma, descripcion, fecha_inicio, fecha_fin_estimada, activo, creado_por_rut, aprobado_por_estudiante, fecha_aprobacion_estudiante) VALUES
(1, 'Cronograma 1er Semestre 2025',
    'Planificación completa del primer semestre de desarrollo del Sistema de Inventario para PyMES.',
    '2025-03-01', '2025-08-31', 1, '22222222-2', 1, '2025-03-05 10:30:00');

SET @crono1_id = LAST_INSERT_ID();

-- Hitos del cronograma proyecto 1
INSERT INTO hitos_cronograma (cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, estado, porcentaje_avance) VALUES
(@crono1_id, 1, 'Informe de Análisis y Diseño',
    'Documento con requisitos, modelo de datos y arquitectura del sistema.',
    'entrega_documento', '2025-04-20', 'revisado', 100.00),
(@crono1_id, 1, 'Revisión Avance Módulo Stock',
    'Revisión del módulo de control de stock con demostración funcional.',
    'revision_avance', '2025-06-05', 'aprobado', 100.00),
(@crono1_id, 1, 'Informe de Avance – Alertas y Reportes',
    'Documento e implementación del módulo de alertas y reportes gerenciales.',
    'entrega_documento', '2025-07-25', 'pendiente', 0.00),
(@crono1_id, 1, 'Reunión Final antes de Defensa',
    'Reunión de preparación y revisión final del proyecto.',
    'reunion_seguimiento', '2025-08-20', 'pendiente', 0.00);

-- ============================================================
-- 17. CRONOGRAMA DEL PROYECTO 2
-- ============================================================
INSERT INTO cronogramas_proyecto (proyecto_id, nombre_cronograma, descripcion, fecha_inicio, fecha_fin_estimada, activo, creado_por_rut, aprobado_por_estudiante, fecha_aprobacion_estudiante) VALUES
(@proyecto2_id, 'Cronograma Anual 2025',
    'Planificación completa del año 2025 para la Plataforma E-Learning Rural.',
    '2025-03-15', '2025-12-15', 1, '12345678-9', 1, '2025-03-20 09:00:00');

SET @crono2_id = LAST_INSERT_ID();

-- Hitos del cronograma proyecto 2
INSERT INTO hitos_cronograma (cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, estado, porcentaje_avance) VALUES
(@crono2_id, @proyecto2_id, 'Informe de Análisis y Prototipo',
    'Documento de análisis de requerimientos y prototipos validados.',
    'entrega_documento', '2025-05-20', 'aprobado', 100.00),
(@crono2_id, @proyecto2_id, 'Avance Módulo de Contenidos',
    'Demostración funcional del módulo de gestión de contenidos.',
    'revision_avance', '2025-08-01', 'pendiente', 0.00),
(@crono2_id, @proyecto2_id, 'Informe Módulo Offline',
    'Documento e implementación del sistema de caché y sincronización offline.',
    'entrega_documento', '2025-10-01', 'pendiente', 0.00),
(@crono2_id, @proyecto2_id, 'Defensa Final',
    'Presentación oral ante comisión evaluadora.',
    'defensa', '2025-12-10', 'pendiente', 0.00);

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT '=== RESUMEN DE DATOS CARGADOS ===' AS mensaje;

SELECT
    p.id,
    p.titulo AS proyecto,
    ep.nombre AS estado,
    COUNT(DISTINCT ep2.estudiante_rut) AS num_estudiantes,
    GROUP_CONCAT(DISTINCT u.nombre ORDER BY ep2.orden SEPARATOR ', ') AS estudiantes
FROM proyectos p
JOIN estados_proyectos ep ON p.estado_id = ep.id
JOIN estudiantes_proyectos ep2 ON ep2.proyecto_id = p.id
JOIN usuarios u ON u.rut = ep2.estudiante_rut
GROUP BY p.id, p.titulo, ep.nombre;

SELECT
    u.rut,
    u.nombre,
    u.email,
    r.nombre AS rol
FROM usuarios u
JOIN roles r ON r.id = u.rol_id
WHERE u.rut IN ('11111111-1','22222222-2','33333333-3','44444444-4')
ORDER BY r.id;
