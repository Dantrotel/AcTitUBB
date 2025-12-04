-- =====================================================
-- SCRIPT DE DATOS DE PRUEBA - AcTitUBB
-- =====================================================
-- Este script inserta datos de prueba para todas las funcionalidades
-- Incluye: Usuarios, Estructura Académica, Propuestas, Proyectos,
-- Cronogramas, Hitos, Avances, Reuniones y Datos Regulatorios

USE actitubb;

-- =====================================================
-- 1. USUARIOS ADICIONALES (Estudiantes y Profesores)
-- =====================================================

-- Estudiantes adicionales (password: 1234)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) VALUES
('12345678-9', 'Carlos Pérez González', 'carlos.perez@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1),
('98765432-1', 'María Fernández López', 'maria.fernandez@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1),
('15975348-6', 'Juan Ramírez Silva', 'juan.ramirez@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1),
('75395145-2', 'Ana Torres Muñoz', 'ana.torres@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1),
('35795145-8', 'Diego Morales Vega', 'diego.morales@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1),
('95175385-3', 'Sofía Rojas Castro', 'sofia.rojas@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1),
('85246913-7', 'Matías Soto Díaz', 'matias.soto@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1),
('74185296-K', 'Valentina Vargas Ortiz', 'valentina.vargas@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Profesores adicionales (password: 1234)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) VALUES
('11223344-5', 'Dr. Roberto García Mendoza', 'roberto.garcia@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1),
('22334455-6', 'Dra. Patricia Herrera Núñez', 'patricia.herrera@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1),
('33445566-7', 'Dr. Fernando Campos Ríos', 'fernando.campos@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1),
('44556677-8', 'Dra. Carmen Reyes Flores', 'carmen.reyes@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1),
('55667788-9', 'Dr. Luis Castro Pinto', 'luis.castro@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1),
('66778899-0', 'Dra. Elena Navarro Bravo', 'elena.navarro@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- =====================================================
-- 2. ESTRUCTURA ACADÉMICA (Facultades, Departamentos, Carreras)
-- =====================================================

-- Facultades
INSERT INTO facultades (id, nombre, codigo, descripcion) VALUES
(1, 'Facultad de Ingeniería', 'FING', 'Facultad de Ingeniería de la Universidad del Bío-Bío'),
(2, 'Facultad de Ciencias', 'FCIE', 'Facultad de Ciencias de la Universidad del Bío-Bío')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), codigo=VALUES(codigo);

-- Departamentos
INSERT INTO departamentos (id, nombre, codigo, facultad_id) VALUES
(1, 'Departamento de Ingeniería en Sistemas', 'DIS', 1),
(2, 'Departamento de Ingeniería Civil Informática', 'DICI', 1),
(3, 'Departamento de Ciencias de la Computación', 'DCC', 2)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Carreras
INSERT INTO carreras (id, nombre, codigo, facultad_id, duracion_semestres, titulo_profesional) VALUES
(1, 'Ingeniería Civil en Informática', 'ICI', 1, 12, 'Ingeniero Civil en Informática'),
(2, 'Ingeniería de Ejecución en Computación e Informática', 'IECI', 1, 10, 'Ingeniero de Ejecución en Computación e Informática'),
(3, 'Ingeniería en Sistemas', 'IS', 1, 10, 'Ingeniero en Sistemas')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), codigo=VALUES(codigo);

-- Relación Departamentos-Carreras
INSERT INTO departamentos_carreras (departamento_id, carrera_id, es_principal) VALUES
(1, 1, TRUE),
(1, 2, TRUE),
(2, 3, TRUE)
ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal);

-- Asignar profesores a departamentos
INSERT INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso) VALUES
('22222222-2', 1, TRUE, '2020-03-01'),
('11223344-5', 1, FALSE, '2018-01-15'),
('22334455-6', 1, FALSE, '2019-06-10'),
('33445566-7', 2, TRUE, '2017-08-20'),
('44556677-8', 2, FALSE, '2021-01-05'),
('55667788-9', 3, TRUE, '2016-03-12'),
('66778899-0', 3, FALSE, '2022-02-28')
ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal);

-- Asignar estudiantes a carreras
INSERT INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('11111111-1', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('12345678-9', 1, 2021, 7, 'regular', '2021-03-01', TRUE),
('98765432-1', 2, 2022, 5, 'regular', '2022-03-01', TRUE),
('15975348-6', 1, 2020, 9, 'regular', '2020-03-01', TRUE),
('75395145-2', 3, 2021, 7, 'regular', '2021-03-01', TRUE),
('35795145-8', 2, 2022, 5, 'regular', '2022-03-01', TRUE),
('95175385-3', 1, 2023, 3, 'regular', '2023-03-01', TRUE),
('85246913-7', 3, 2021, 7, 'regular', '2021-03-01', TRUE),
('74185296-K', 2, 2023, 3, 'regular', '2023-03-01', TRUE)
ON DUPLICATE KEY UPDATE semestre_actual=VALUES(semestre_actual), estado_estudiante=VALUES(estado_estudiante);

-- Asignar jefes de carrera (Admin como jefe de Ingeniería Civil en Informática)
INSERT INTO jefes_carreras (profesor_rut, carrera_id, fecha_inicio, activo) VALUES
('33333333-3', 1, '2023-01-01', TRUE),
('33333333-3', 2, '2023-01-01', TRUE)
ON DUPLICATE KEY UPDATE activo=VALUES(activo);

-- Agregar al admin en un departamento
INSERT INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso) VALUES
('33333333-3', 1, TRUE, '2023-01-01')
ON DUPLICATE KEY UPDATE es_principal=VALUES(es_principal);

-- =====================================================
-- 3. ESTADOS DEL SISTEMA
-- =====================================================

-- Estados de Propuestas
INSERT INTO estados_propuestas (id, nombre, descripcion) VALUES
(1, 'pendiente', 'Propuesta enviada, pendiente de revisión'),
(2, 'en_revision', 'Propuesta en proceso de revisión'),
(3, 'observaciones', 'Propuesta con observaciones que deben ser corregidas'),
(4, 'aprobada', 'Propuesta aprobada, lista para convertirse en proyecto'),
(5, 'rechazada', 'Propuesta rechazada')
ON DUPLICATE KEY UPDATE descripcion=VALUES(descripcion);

-- Estados de Proyectos
INSERT INTO estados_proyectos (id, nombre, descripcion) VALUES
(1, 'iniciando', 'Proyecto recién creado, en proceso de inicio'),
(2, 'en_desarrollo', 'Proyecto en desarrollo activo'),
(3, 'en_revision', 'Proyecto en revisión intermedia'),
(4, 'detenido', 'Proyecto temporalmente detenido'),
(5, 'en_riesgo', 'Proyecto con riesgo de abandono por inactividad'),
(6, 'completado', 'Proyecto completado, pendiente de defensa'),
(7, 'defendido', 'Proyecto defendido exitosamente'),
(8, 'cerrado', 'Proyecto cerrado definitivamente')
ON DUPLICATE KEY UPDATE descripcion=VALUES(descripcion);

-- =====================================================
-- 4. PROPUESTAS DE TÍTULO
-- =====================================================

-- Propuesta 1: Aprobada (convertida a proyecto)
INSERT INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id, fecha_envio, fecha_revision,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta
) VALUES (
    'Sistema de Gestión de Inventario con IoT',
    'Desarrollo de un sistema web integrado con dispositivos IoT para el control y gestión automatizada de inventario en tiempo real para pequeñas y medianas empresas.',
    '12345678-9',
    4, -- aprobada
    '2024-11-15',
    '2024-11-25',
    'desarrollo_software',
    1,
    'alta',
    2,
    'Internet de las Cosas (IoT)',
    'Desarrollar un sistema web integrado con tecnología IoT para la gestión automatizada de inventario en tiempo real.',
    '1. Diseñar la arquitectura del sistema web y comunicación IoT\n2. Implementar sensores RFID para tracking de productos\n3. Desarrollar dashboard de monitoreo en tiempo real\n4. Implementar alertas automáticas de reposición\n5. Realizar pruebas de integración y validación',
    'Metodología Scrum con sprints de 2 semanas. Desarrollo incremental con prototipado rápido. Testing continuo con usuarios reales.'
);

SET @propuesta1_id = LAST_INSERT_ID();

-- Propuesta 2: En revisión
INSERT INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id, fecha_envio,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta
) VALUES (
    'Aplicación Móvil para Gestión de Salud Personal',
    'Desarrollo de una aplicación móvil multiplataforma que permita a los usuarios llevar un registro completo de su salud, incluyendo medicamentos, citas médicas y recordatorios.',
    '98765432-1',
    2, -- en_revision
    '2024-12-01',
    'desarrollo_software',
    1,
    'media',
    1,
    'Aplicaciones Móviles',
    'Crear una aplicación móvil integral para la gestión personalizada de la salud del usuario.',
    '1. Analizar requisitos de usuarios en materia de salud personal\n2. Diseñar interfaz intuitiva y accesible\n3. Implementar sistema de recordatorios inteligentes\n4. Integrar con APIs de servicios de salud\n5. Validar con usuarios finales',
    'Desarrollo ágil con enfoque en UX/UI. Prototipado con Figma. Implementación en Flutter para iOS y Android.'
);

-- Propuesta 3: Con observaciones
INSERT INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id, fecha_envio, fecha_revision,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta,
    recursos_necesarios
) VALUES (
    'Sistema de Reconocimiento Facial para Control de Acceso',
    'Implementación de un sistema de reconocimiento facial usando deep learning para control de acceso en edificios universitarios. OBSERVACIONES: Se requiere mayor detalle en la metodología de entrenamiento del modelo. Incluir plan de privacidad y protección de datos biométricos. Ampliar el análisis de trabajos relacionados.',
    '15975348-6',
    3, -- observaciones
    '2024-11-20',
    '2024-11-28',
    'investigacion',
    1,
    'alta',
    2,
    'Inteligencia Artificial',
    'Desarrollar un sistema de reconocimiento facial robusto y eficiente para control de acceso.',
    '1. Investigar algoritmos de reconocimiento facial\n2. Entrenar modelo con dataset local\n3. Implementar sistema de captura en tiempo real\n4. Integrar con control de acceso físico',
    'Investigación aplicada con Deep Learning. Framework TensorFlow. Validación con métricas de precisión y recall.',
    'Servidor con GPU para entrenamiento, cámaras web de alta resolución, dataset de rostros'
);

-- Propuesta 4: Pendiente
INSERT INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id, fecha_envio,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta
) VALUES (
    'Plataforma E-learning con Gamificación',
    'Desarrollo de una plataforma de aprendizaje en línea que incorpore elementos de gamificación para aumentar la motivación y engagement de los estudiantes.',
    '75395145-2',
    1, -- pendiente
    '2024-12-02',
    'desarrollo_software',
    1,
    'media',
    1,
    'Tecnologías Educativas',
    'Crear una plataforma e-learning innovadora que mejore el engagement estudiantil mediante gamificación.',
    '1. Analizar sistemas e-learning actuales\n2. Diseñar mecánicas de gamificación apropiadas\n3. Implementar sistema de puntos, insignias y rankings\n4. Desarrollar módulos de contenido interactivo\n5. Evaluar efectividad con grupos de usuarios',
    'Diseño centrado en el usuario. Desarrollo iterativo con feedback continuo. A/B testing para validar mecánicas de gamificación.'
);

-- Propuesta 5: Equipo de 2 estudiantes
INSERT INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id, fecha_envio,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta,
    justificacion_complejidad
) VALUES (
    'Sistema Distribuido de Procesamiento de Big Data',
    'Diseño e implementación de un sistema distribuido escalable para procesamiento de grandes volúmenes de datos en tiempo real usando arquitectura microservicios.',
    '35795145-8',
    1, -- pendiente
    '2024-11-28',
    'desarrollo_software',
    2,
    'alta',
    2,
    'Sistemas Distribuidos',
    'Desarrollar un sistema distribuido robusto y escalable para procesamiento eficiente de Big Data.',
    '1. Diseñar arquitectura de microservicios distribuidos\n2. Implementar sistema de mensajería (Kafka)\n3. Desarrollar workers de procesamiento paralelo\n4. Implementar sistema de monitoreo y observabilidad\n5. Realizar pruebas de carga y escalabilidad',
    'Arquitectura orientada a servicios. Implementación con Docker y Kubernetes. Testing de carga con herramientas especializadas.',
    'El proyecto requiere dos estudiantes debido a su alta complejidad técnica: uno se enfocará en el backend distribuido y procesamiento, mientras el otro en la infraestructura, DevOps y monitoreo del sistema.'
);

-- =====================================================
-- 5. ASIGNACIONES DE PROFESORES A PROPUESTAS
-- =====================================================

INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut, rol_revision, asignado_por) VALUES
(@propuesta1_id, '22222222-2', 'revisor_principal', '33333333-3'),
(@propuesta1_id, '11223344-5', 'revisor_secundario', '33333333-3');

-- =====================================================
-- 6. PROYECTOS (Desde propuesta aprobada)
-- =====================================================

-- Proyecto 1: Activo con actividad reciente (Sin riesgo)
INSERT INTO proyectos (
    titulo, descripcion, propuesta_id, estudiante_rut, estado_id,
    fecha_inicio, fecha_entrega_estimada,
    objetivo_general, objetivos_especificos, metodologia,
    modalidad, complejidad, duracion_semestres,
    porcentaje_avance, ultima_actividad_fecha, umbral_dias_riesgo, umbral_dias_abandono
) VALUES (
    'Sistema de Gestión de Inventario con IoT',
    'Desarrollo de un sistema web integrado con dispositivos IoT para el control y gestión automatizada de inventario en tiempo real.',
    @propuesta1_id,
    '12345678-9',
    2, -- en_desarrollo
    '2024-12-01',
    '2025-06-30',
    'Desarrollar un sistema web integrado con tecnología IoT para la gestión automatizada de inventario en tiempo real.',
    '1. Diseñar la arquitectura del sistema web y comunicación IoT\n2. Implementar sensores RFID para tracking de productos\n3. Desarrollar dashboard de monitoreo en tiempo real\n4. Implementar alertas automáticas de reposición\n5. Realizar pruebas de integración y validación',
    'Metodología Scrum con sprints de 2 semanas',
    'desarrollo_software',
    'alta',
    2,
    25,
    '2024-12-02', -- Actividad hace 1 día
    30,
    60
);

SET @proyecto1_id = LAST_INSERT_ID();

-- Propuesta para proyecto 2
INSERT INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id, fecha_envio, fecha_revision,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta
) VALUES (
    'Sistema de Análisis Predictivo de Ventas',
    'Desarrollo de un sistema de análisis predictivo usando Machine Learning para proyección de ventas en retail.',
    '98765432-1',
    4, -- aprobada
    '2024-07-01',
    '2024-07-10',
    'investigacion',
    1,
    'alta',
    2,
    'Inteligencia Artificial',
    'Crear un sistema de análisis predictivo robusto para mejorar la toma de decisiones comerciales.',
    '1. Recopilar y limpiar datos históricos de ventas\n2. Implementar modelos de ML (LSTM, Prophet)\n3. Desarrollar API de predicción\n4. Crear dashboard de visualización\n5. Validar precisión con datos reales',
    'CRISP-DM para proyectos de Data Science'
);

SET @propuesta2_id = LAST_INSERT_ID();

-- Proyecto 2: Con riesgo (47 días sin actividad)
INSERT INTO proyectos (
    titulo, descripcion, propuesta_id, estudiante_rut, estado_id,
    fecha_inicio, fecha_entrega_estimada,
    objetivo_general, objetivos_especificos, metodologia,
    modalidad, complejidad, duracion_semestres,
    porcentaje_avance, ultima_actividad_fecha, umbral_dias_riesgo, umbral_dias_abandono,
    alerta_inactividad_enviada, fecha_alerta_inactividad
) VALUES (
    'Sistema de Análisis Predictivo de Ventas',
    'Desarrollo de un sistema de análisis predictivo usando Machine Learning para proyección de ventas en retail.',
    @propuesta2_id,
    '98765432-1',
    5, -- en_riesgo
    '2024-08-15',
    '2025-03-30',
    'Crear un sistema de análisis predictivo robusto para mejorar la toma de decisiones comerciales.',
    '1. Recopilar y limpiar datos históricos de ventas\n2. Implementar modelos de ML (LSTM, Prophet)\n3. Desarrollar API de predicción\n4. Crear dashboard de visualización\n5. Validar precisión con datos reales',
    'CRISP-DM para proyectos de Data Science',
    'investigacion',
    'alta',
    2,
    40,
    DATE_SUB(CURDATE(), INTERVAL 47 DAY), -- 47 días sin actividad
    30,
    60,
    TRUE,
    DATE_SUB(CURDATE(), INTERVAL 2 DAY)
);

SET @proyecto2_id = LAST_INSERT_ID();

-- Propuesta para proyecto 3
INSERT INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id, fecha_envio, fecha_revision,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta
) VALUES (
    'Red Social para Estudiantes Universitarios',
    'Plataforma social especializada para estudiantes que facilite el networking académico y colaboración.',
    '15975348-6',
    4, -- aprobada
    '2024-06-01',
    '2024-06-10',
    'desarrollo_software',
    1,
    'media',
    2,
    'Aplicaciones Web',
    'Desarrollar una red social enfocada en el ámbito académico universitario.',
    '1. Analizar necesidades de networking estudiantil\n2. Diseñar arquitectura de red social escalable\n3. Implementar sistema de matching por intereses\n4. Desarrollar funcionalidades de colaboración\n5. Realizar pruebas de usabilidad',
    'Metodología ágil con enfoque en MVP'
);

SET @propuesta3_id = LAST_INSERT_ID();

-- Proyecto 3: Abandono potencial (68 días sin actividad)
INSERT INTO proyectos (
    titulo, descripcion, propuesta_id, estudiante_rut, estado_id,
    fecha_inicio, fecha_entrega_estimada,
    objetivo_general, objetivos_especificos, metodologia,
    modalidad, complejidad, duracion_semestres,
    porcentaje_avance, ultima_actividad_fecha, umbral_dias_riesgo, umbral_dias_abandono,
    alerta_inactividad_enviada, fecha_alerta_inactividad
) VALUES (
    'Red Social para Estudiantes Universitarios',
    'Plataforma social especializada para estudiantes que facilite el networking académico y colaboración.',
    @propuesta3_id,
    '15975348-6',
    5, -- en_riesgo
    '2024-07-01',
    '2025-02-28',
    'Desarrollar una red social enfocada en el ámbito académico universitario.',
    '1. Analizar necesidades de networking estudiantil\n2. Diseñar arquitectura de red social escalable\n3. Implementar sistema de matching por intereses\n4. Desarrollar funcionalidades de colaboración\n5. Realizar pruebas de usabilidad',
    'Metodología ágil con enfoque en MVP',
    'desarrollo_software',
    'media',
    2,
    15,
    DATE_SUB(CURDATE(), INTERVAL 68 DAY), -- 68 días sin actividad (ABANDONO)
    30,
    60,
    TRUE,
    DATE_SUB(CURDATE(), INTERVAL 8 DAY)
);

SET @proyecto3_id = LAST_INSERT_ID();

-- Propuesta para proyecto 4
INSERT INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id, fecha_envio, fecha_revision,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta
) VALUES (
    'Sistema de Gestión Documental Digital',
    'Plataforma web para digitalización y gestión eficiente de documentos corporativos con OCR.',
    '75395145-2',
    4, -- aprobada
    '2024-02-01',
    '2024-02-15',
    'desarrollo_software',
    1,
    'alta',
    2,
    'Gestión Documental',
    'Desarrollar un sistema integral de gestión documental con capacidades de OCR y búsqueda inteligente.',
    '1. Implementar módulo de digitalización con OCR\n2. Desarrollar sistema de clasificación automática\n3. Implementar búsqueda fulltext avanzada\n4. Crear sistema de permisos granular\n5. Desarrollar módulo de firma digital',
    'Desarrollo iterativo con validación continua'
);

SET @propuesta4_id = LAST_INSERT_ID();

-- Proyecto 4: Próximo a completarse (con entrega final pendiente de Informante)
INSERT INTO proyectos (
    titulo, descripcion, propuesta_id, estudiante_rut, estado_id,
    fecha_inicio, fecha_entrega_estimada,
    objetivo_general, objetivos_especificos, metodologia,
    modalidad, complejidad, duracion_semestres,
    porcentaje_avance, ultima_actividad_fecha
) VALUES (
    'Sistema de Gestión Documental Digital',
    'Plataforma web para digitalización y gestión eficiente de documentos corporativos con OCR.',
    @propuesta4_id,
    '75395145-2',
    6, -- completado
    '2024-03-01',
    '2024-12-15',
    'Desarrollar un sistema integral de gestión documental con capacidades de OCR y búsqueda inteligente.',
    '1. Implementar módulo de digitalización con OCR\n2. Desarrollar sistema de clasificación automática\n3. Implementar búsqueda fulltext avanzada\n4. Crear sistema de permisos granular\n5. Desarrollar módulo de firma digital',
    'Desarrollo iterativo con validación continua',
    'desarrollo_software',
    'alta',
    2,
    95,
    '2024-12-01'
);

SET @proyecto4_id = LAST_INSERT_ID();

-- =====================================================
-- 7. ASIGNACIONES DE PROFESORES A PROYECTOS
-- =====================================================

-- Proyecto 1: Completo (Guía, Informante, Revisor)
INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, asignado_por) VALUES
(@proyecto1_id, '22222222-2', 1, '2024-12-01', '33333333-3'), -- Profesor Guía
(@proyecto1_id, '11223344-5', 2, '2024-12-01', '33333333-3'), -- Profesor Informante
(@proyecto1_id, '22334455-6', 3, '2024-12-01', '33333333-3'); -- Profesor Revisor

-- Proyecto 2: Solo Guía
INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, asignado_por) VALUES
(@proyecto2_id, '33445566-7', 1, '2024-08-15', '33333333-3'); -- Profesor Guía

-- Proyecto 3: Guía e Informante
INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, asignado_por) VALUES
(@proyecto3_id, '44556677-8', 1, '2024-07-01', '33333333-3'), -- Profesor Guía
(@proyecto3_id, '55667788-9', 2, '2024-07-01', '33333333-3'); -- Profesor Informante

-- Proyecto 4: Completo
INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, asignado_por) VALUES
(@proyecto4_id, '66778899-0', 1, '2024-03-01', '33333333-3'), -- Profesor Guía
(@proyecto4_id, '22222222-2', 2, '2024-03-01', '33333333-3'), -- Profesor Informante
(@proyecto4_id, '11223344-5', 3, '2024-03-01', '33333333-3'); -- Profesor Revisor

-- =====================================================
-- 8. HITOS DE PROYECTO (para proyecto 1 y 4)
-- =====================================================

-- Hitos para Proyecto 1
INSERT INTO hitos_proyecto (
    proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo,
    estado, peso_en_proyecto, es_critico, creado_por_rut
) VALUES
(@proyecto1_id, 'Diseño de Arquitectura', 'Diseño completo de la arquitectura del sistema IoT', 'planificacion', '2024-12-15', 'completado', 15, TRUE, '12345678-9'),
(@proyecto1_id, 'Prototipo Hardware IoT', 'Implementación del prototipo con sensores RFID', 'desarrollo', '2025-01-15', 'en_progreso', 20, TRUE, '12345678-9'),
(@proyecto1_id, 'Backend y API REST', 'Desarrollo del backend con API REST completa', 'desarrollo', '2025-02-28', 'pendiente', 25, TRUE, '12345678-9'),
(@proyecto1_id, 'Dashboard Web', 'Desarrollo del dashboard de monitoreo en tiempo real', 'desarrollo', '2025-04-15', 'pendiente', 20, FALSE, '12345678-9'),
(@proyecto1_id, 'Entrega Final', 'Entrega del informe final y presentación', 'entrega_final', '2025-06-20', 'pendiente', 20, TRUE, '12345678-9');

-- Hitos para Proyecto 4 (completados)
INSERT INTO hitos_proyecto (
    proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo,
    estado, peso_en_proyecto, es_critico, creado_por_rut
) VALUES
(@proyecto4_id, 'Análisis y Diseño', 'Análisis de requisitos y diseño de sistema', 'planificacion', '2024-04-15', 'completado', 15, TRUE, '75395145-2'),
(@proyecto4_id, 'Módulo OCR', 'Implementación de módulo de OCR', 'desarrollo', '2024-06-30', 'completado', 20, TRUE, '75395145-2'),
(@proyecto4_id, 'Sistema de Búsqueda', 'Implementación de búsqueda fulltext', 'desarrollo', '2024-08-31', 'completado', 20, FALSE, '75395145-2'),
(@proyecto4_id, 'Firma Digital', 'Implementación de módulo de firma digital', 'desarrollo', '2024-10-31', 'completado', 20, TRUE, '75395145-2');

-- Hito de entrega final con datos del Informante
INSERT INTO hitos_proyecto (
    proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo,
    estado, peso_en_proyecto, es_critico, creado_por_rut,
    fecha_entrega_estudiante, dias_habiles_informante, informante_notificado
) VALUES
(@proyecto4_id, 'Entrega Final', 'Entrega del informe final', 'entrega_final', '2024-12-10', 'completado', 25, TRUE, '75395145-2', '2024-11-25', 15, TRUE);

-- Calcular fecha límite para Informante del Proyecto 4 (15 días hábiles desde 2024-11-25)
-- Aproximadamente: 2024-12-16 (sin contar fines de semana y feriados)
UPDATE hitos_proyecto 
SET fecha_limite_informante = DATE_ADD('2024-11-25', INTERVAL 21 DAY),
    fecha_notificacion_informante = '2024-11-25'
WHERE proyecto_id = @proyecto4_id AND tipo_hito = 'entrega_final';

-- =====================================================
-- 9. CRONOGRAMAS Y HITOS DE CRONOGRAMA (Proyecto 1)
-- =====================================================

INSERT INTO cronogramas_proyecto (
    proyecto_id, nombre_cronograma, descripcion, fecha_inicio, fecha_fin_estimada,
    creado_por_rut, aprobado_por_estudiante, fecha_aprobacion_estudiante, dias_alerta_previa
) VALUES (
    @proyecto1_id,
    'Cronograma Principal - Semestre 1',
    'Cronograma detallado del primer semestre de desarrollo',
    '2024-12-01',
    '2025-06-30',
    '22222222-2', -- Profesor Guía
    TRUE,
    '2024-12-02',
    3
);

SET @cronograma1_id = LAST_INSERT_ID();

-- Hitos del cronograma
INSERT INTO hitos_cronograma (
    cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, estado
) VALUES
(@cronograma1_id, @proyecto1_id, 'Sprint 1 - Setup', 'Configuración de entorno y herramientas', 'entrega_documento', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'pendiente'),
(@cronograma1_id, @proyecto1_id, 'Sprint 2 - Diseño Base de Datos', 'Diseño completo del modelo de datos', 'revision_avance', DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'pendiente'),
(@cronograma1_id, @proyecto1_id, 'Sprint 3 - API Básica', 'Implementación de endpoints básicos', 'revision_avance', DATE_ADD(CURDATE(), INTERVAL 21 DAY), 'pendiente'),
(@cronograma1_id, @proyecto1_id, 'Sprint 4 - Integración IoT', 'Integración con dispositivos IoT', 'entrega_documento', DATE_ADD(CURDATE(), INTERVAL 28 DAY), 'pendiente');

-- =====================================================
-- 10. AVANCES (Proyecto 1)
-- =====================================================

INSERT INTO avances (proyecto_id, titulo, descripcion, archivo, fecha_envio) VALUES
(@proyecto1_id, 'Avance 1 - Investigación Inicial', 'Investigación de tecnologías IoT y selección de sensores RFID apropiados para el proyecto', 'avances/proyecto1_investigacion.pdf', '2024-12-01'),
(@proyecto1_id, 'Avance 2 - Prototipo Inicial', 'Primer prototipo funcional con lectura básica de etiquetas RFID', 'avances/proyecto1_prototipo.pdf', '2024-12-02');

-- =====================================================
-- 11. REUNIONES Y SOLICITUDES
-- =====================================================

-- Solicitud de reunión 1 (confirmada)
INSERT INTO solicitudes_reunion (
    proyecto_id, profesor_rut, estudiante_rut, tipo_reunion,
    fecha_propuesta, hora_propuesta, descripcion, estado, creado_por,
    comentarios_profesor, fecha_respuesta_profesor
) VALUES
(@proyecto1_id, '22222222-2', '12345678-9', 'seguimiento', '2024-12-05', '10:00:00', 'Revisión de avances del Sprint 1', 'confirmada', 'estudiante', 'Perfecto, nos vemos el jueves', '2024-12-03');

SET @solicitud1_id = LAST_INSERT_ID();

-- Reunión confirmada
INSERT INTO reuniones_calendario (
    solicitud_reunion_id, proyecto_id, profesor_rut, estudiante_rut,
    fecha, hora_inicio, hora_fin, tipo_reunion, titulo, descripcion, estado
) VALUES
(@solicitud1_id, @proyecto1_id, '22222222-2', '12345678-9', '2024-12-05', '10:00:00', '11:00:00', 'seguimiento', 'Seguimiento - Sistema IoT', 'Revisión de avances del Sprint 1', 'programada');

-- Solicitud de reunión 2 (pendiente)
INSERT INTO solicitudes_reunion (
    proyecto_id, profesor_rut, estudiante_rut, tipo_reunion,
    fecha_propuesta, hora_propuesta, descripcion, estado, creado_por,
    comentarios_profesor, fecha_respuesta_profesor
) VALUES
(@proyecto1_id, '22222222-2', '12345678-9', 'seguimiento', '2024-12-10', '15:00:00', 'Revisión de diseño de base de datos', 'pendiente', 'estudiante', NULL, NULL);

-- =====================================================
-- 12. ALERTAS DE ABANDONO
-- =====================================================

-- Alerta para Proyecto 2 (en riesgo)
INSERT INTO alertas_abandono (
    proyecto_id, tipo_alerta, nivel_severidad, dias_sin_actividad,
    fecha_ultima_actividad, mensaje, accion_sugerida, notificados
) VALUES
(@proyecto2_id, 'riesgo_abandono', 'grave', 47, DATE_SUB(CURDATE(), INTERVAL 47 DAY),
'El proyecto lleva 47 días sin registrar actividad (avances, reuniones o entregas)',
'Contactar urgentemente al estudiante y profesor guía. Evaluar causas de la inactividad. Considerar plan de recuperación.',
JSON_ARRAY('98765432-1', '33445566-7'));

-- Alerta para Proyecto 3 (abandono potencial)
INSERT INTO alertas_abandono (
    proyecto_id, tipo_alerta, nivel_severidad, dias_sin_actividad,
    fecha_ultima_actividad, mensaje, accion_sugerida, notificados
) VALUES
(@proyecto3_id, 'abandono_potencial', 'critico', 68, DATE_SUB(CURDATE(), INTERVAL 68 DAY),
'CRÍTICO: El proyecto lleva 68 días sin actividad. Se ha superado el umbral de abandono (60 días)',
'Citar al estudiante, profesor guía e informante. Evaluar continuidad del proyecto según reglamento. Considerar suspensión formal si no hay respuesta.',
JSON_ARRAY('15975348-6', '44556677-8', '55667788-9'));

-- =====================================================
-- 13. DÍAS FERIADOS (Para cálculo de días hábiles)
-- =====================================================

INSERT INTO dias_feriados (fecha, nombre, tipo, es_inamovible) VALUES
-- Feriados 2024
('2024-12-25', 'Navidad', 'nacional', TRUE),
-- Feriados 2025
('2025-01-01', 'Año Nuevo', 'nacional', TRUE),
('2025-04-18', 'Viernes Santo', 'nacional', TRUE),
('2025-04-19', 'Sábado Santo', 'nacional', TRUE),
('2025-05-01', 'Día del Trabajo', 'nacional', TRUE),
('2025-05-21', 'Día de las Glorias Navales', 'nacional', TRUE),
('2025-06-29', 'San Pedro y San Pablo', 'nacional', FALSE),
('2025-07-16', 'Día de la Virgen del Carmen', 'nacional', TRUE),
('2025-08-15', 'Asunción de la Virgen', 'nacional', TRUE),
('2025-09-18', 'Día de la Independencia', 'nacional', TRUE),
('2025-09-19', 'Día de las Glorias del Ejército', 'nacional', TRUE),
('2025-10-12', 'Encuentro de Dos Mundos', 'nacional', FALSE),
('2025-10-31', 'Día de las Iglesias Evangélicas', 'nacional', FALSE),
('2025-11-01', 'Día de Todos los Santos', 'nacional', TRUE),
('2025-12-08', 'Inmaculada Concepción', 'nacional', TRUE),
('2025-12-25', 'Navidad', 'nacional', TRUE)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- =====================================================
-- 14. COMISIÓN EVALUADORA
-- =====================================================

-- Comisión para Proyecto 4 (en fase de proyecto)
INSERT INTO comision_evaluadora (
    proyecto_id, profesor_rut, rol_comision, fase_evaluacion, asignado_por
) VALUES
(@proyecto4_id, '22222222-2', 'presidente', 'proyecto', '33333333-3'),
(@proyecto4_id, '11223344-5', 'secretario', 'proyecto', '33333333-3'),
(@proyecto4_id, '22334455-6', 'vocal', 'proyecto', '33333333-3');

-- =====================================================
-- RESUMEN DE DATOS INSERTADOS
-- =====================================================

SELECT '===== DATOS DE PRUEBA INSERTADOS EXITOSAMENTE =====' as status;
SELECT CONCAT('Usuarios adicionales: ', COUNT(*)) as info FROM usuarios WHERE rut NOT IN ('11111111-1', '22222222-2', '33333333-3', '44444444-4');
SELECT CONCAT('Propuestas creadas: ', COUNT(*)) as info FROM propuestas;
SELECT CONCAT('Proyectos creados: ', COUNT(*)) as info FROM proyectos;
SELECT CONCAT('Asignaciones de profesores: ', COUNT(*)) as info FROM asignaciones_proyectos;
SELECT CONCAT('Hitos de proyecto: ', COUNT(*)) as info FROM hitos_proyecto;
SELECT CONCAT('Alertas de abandono: ', COUNT(*)) as info FROM alertas_abandono;
SELECT CONCAT('Días feriados registrados: ', COUNT(*)) as info FROM dias_feriados;

SELECT '
CASOS DE PRUEBA INCLUIDOS:
✓ Proyecto activo con actividad reciente (Sin riesgo)
✓ Proyecto en riesgo (47 días sin actividad)
✓ Proyecto con abandono potencial (68 días sin actividad)
✓ Proyecto completado con entrega pendiente de Informante
✓ Propuestas en diferentes estados
✓ Cronogramas y hitos detallados
✓ Reuniones programadas
✓ Alertas de abandono con diferentes niveles de severidad
✓ Días feriados para cálculo de días hábiles
' as casos_prueba;
