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

-- Relación Estudiantes - Carreras (usando códigos en lugar de IDs)
INSERT IGNORE INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('20111222-3', (SELECT id FROM carreras WHERE codigo = 'ICI'), 2020, 8, 'regular', '2020-03-01', TRUE),
('20222333-4', (SELECT id FROM carreras WHERE codigo = 'ICI'), 2020, 8, 'regular', '2020-03-01', TRUE),
('20333444-5', (SELECT id FROM carreras WHERE codigo = 'IECI'), 2021, 7, 'regular', '2021-03-01', TRUE),
('20444555-6', (SELECT id FROM carreras WHERE codigo = 'ICI'), 2020, 8, 'regular', '2020-03-01', TRUE),
('20555666-7', (SELECT id FROM carreras WHERE codigo = 'IECI'), 2021, 7, 'regular', '2021-03-01', TRUE),
('20666777-8', (SELECT id FROM carreras WHERE codigo = 'ICI'), 2020, 8, 'regular', '2020-03-01', TRUE),
('20777888-9', (SELECT id FROM carreras WHERE codigo = 'IECI'), 2021, 7, 'regular', '2021-03-01', TRUE),
('20888999-0', (SELECT id FROM carreras WHERE codigo = 'ICI'), 2020, 8, 'regular', '2020-03-01', TRUE);

-- ============================================
-- 6. PROPUESTAS
-- ============================================

-- Propuesta 1: Aprobada y convertida en proyecto
INSERT IGNORE INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id,
    fecha_envio, fecha_revision, fecha_aprobacion, proyecto_id,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta,
    recursos_necesarios, bibliografia
) VALUES (
    'Sistema Web de Gestión de Inventario para PYMES',
    'Desarrollo de una aplicación web para la gestión integral de inventarios, ventas y compras orientada a pequeñas y medianas empresas del sector retail.',
    '20111222-3',
    (SELECT id FROM estados_propuestas WHERE nombre = 'aprobada'), -- aprobada
    '2024-03-15',
    '2024-03-20 14:30:00',
    '2024-03-25',
    1, -- proyecto_id
    'desarrollo_software',
    1,
    'media',
    1,
    'Desarrollo Web y Sistemas de Información',
    'Desarrollar un sistema web de gestión de inventario que permita a las PYMES optimizar el control de stock, ventas y compras mediante una interfaz intuitiva y moderna.',
    '1. Diseñar e implementar una base de datos relacional para almacenar información de productos, clientes y transacciones.\n2. Desarrollar módulos de gestión de inventario, ventas y compras.\n3. Implementar sistema de alertas para stock bajo y productos vencidos.\n4. Crear reportes y dashboards con métricas clave del negocio.',
    'Metodología ágil Scrum con sprints de 2 semanas. Desarrollo incremental con entregas parciales. Testing continuo y validación con usuarios reales. Documentación técnica y de usuario.',
    'Servidor para despliegue, base de datos MySQL, framework Angular para frontend, Node.js para backend, herramientas de testing automatizado.',
    '1. Pressman, R. (2014). Ingeniería del Software: Un Enfoque Práctico.\n2. Sommerville, I. (2016). Software Engineering.\n3. Documentación oficial de Angular y Node.js.'
);

-- Propuesta 2: En revisión
INSERT IGNORE INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id,
    fecha_envio, fecha_revision,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta,
    recursos_necesarios, bibliografia
) VALUES (
    'Aplicación Móvil para Seguimiento de Entrenamientos Deportivos',
    'Desarrollo de una aplicación móvil multiplataforma que permita a deportistas aficionados llevar un registro detallado de sus entrenamientos, progreso y objetivos.',
    '20222333-4',
    (SELECT id FROM estados_propuestas WHERE nombre = 'en_revision'), -- en_revision
    '2024-11-10',
    '2024-11-15 10:00:00',
    'desarrollo_software',
    1,
    'media',
    1,
    'Desarrollo Móvil e IoT',
    'Crear una aplicación móvil que facilite el seguimiento de entrenamientos deportivos mediante registro manual y automático de métricas físicas.',
    '1. Desarrollar aplicación multiplataforma usando React Native.\n2. Implementar sincronización con wearables y dispositivos fitness.\n3. Crear sistema de planes de entrenamiento personalizados.\n4. Generar estadísticas y gráficos de progreso.',
    'Desarrollo basado en MVP (Minimum Viable Product), iteraciones rápidas con feedback de usuarios beta, testing en dispositivos Android e iOS.',
    'Dispositivos móviles para pruebas (Android e iOS), API de integración con wearables, servidor backend, base de datos cloud.',
    '1. Deitel, P. (2017). Android for Programmers.\n2. Eisenman, B. (2016). Learning React Native.\n3. Documentación de React Native y Firebase.'
);

-- Propuesta 3: Pendiente
INSERT IGNORE INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id,
    fecha_envio,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta,
    recursos_necesarios, bibliografia
) VALUES (
    'Sistema de Recomendación de Contenido Educativo usando Machine Learning',
    'Desarrollo de un sistema inteligente de recomendación de contenido educativo personalizado basado en el perfil de aprendizaje del estudiante.',
    '20333444-5',
    (SELECT id FROM estados_propuestas WHERE nombre = 'pendiente'), -- pendiente
    '2024-12-01',
    'investigacion',
    1,
    'alta',
    2,
    'Inteligencia Artificial y Machine Learning',
    'Diseñar e implementar un sistema de recomendación basado en machine learning que sugiera contenido educativo personalizado según el perfil de aprendizaje del estudiante.',
    '1. Investigar y seleccionar algoritmos de recomendación apropiados.\n2. Recolectar y preprocesar datos de estudiantes y contenido educativo.\n3. Entrenar y evaluar modelos de machine learning.\n4. Implementar sistema web con recomendaciones en tiempo real.\n5. Validar eficacia mediante experimentos con usuarios.',
    'Investigación bibliográfica, experimentación con datasets educativos, desarrollo iterativo con evaluación continua de métricas de precisión y recall.',
    'GPU para entrenamiento de modelos, dataset educativo, bibliotecas de ML (scikit-learn, TensorFlow), plataforma web para validación.',
    '1. Aggarwal, C. (2016). Recommender Systems: The Textbook.\n2. Géron, A. (2019). Hands-On Machine Learning.\n3. Papers recientes sobre educational recommender systems.'
);

-- Propuesta 4: Requiere correcciones
INSERT IGNORE INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id,
    fecha_envio, fecha_revision,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta,
    recursos_necesarios, bibliografia
) VALUES (
    'Plataforma IoT para Monitoreo Ambiental',
    'Sistema de monitoreo ambiental basado en IoT para medir temperatura, humedad, calidad del aire en espacios interiores.',
    '20444555-6',
    (SELECT id FROM estados_propuestas WHERE nombre = 'correcciones'), -- requiere correcciones
    '2024-11-20',
    '2024-11-25 16:00:00',
    'desarrollo_software',
    1,
    'alta',
    2,
    'Internet de las Cosas',
    'Desarrollar un sistema IoT para monitoreo ambiental en tiempo real con alertas y visualización de datos históricos.',
    '1. Diseñar arquitectura del sistema IoT.\n2. Implementar nodos sensores con ESP32.\n3. Desarrollar backend para procesamiento de datos.\n4. Crear dashboard web para visualización.',
    'Prototipado rápido, desarrollo incremental, pruebas en entorno real.',
    'Sensores ambientales, microcontroladores ESP32, servidor cloud, componentes electrónicos.',
    '1. Vermesan, O. (2017). Internet of Things: Converging Technologies.\n2. Documentación de ESP32 y protocolos IoT.'
);

-- Estudiantes vinculados a propuestas (usar subconsultas para obtener IDs dinámicamente)
INSERT IGNORE INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden)
SELECT p.id, '20111222-3', TRUE, 1 FROM propuestas p WHERE p.titulo = 'Sistema Web de Gestión de Inventario para PYMES' AND p.estudiante_rut = '20111222-3' LIMIT 1;

INSERT IGNORE INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden)
SELECT p.id, '20222333-4', TRUE, 1 FROM propuestas p WHERE p.titulo = 'Aplicación Móvil para Seguimiento de Entrenamientos Deportivos' AND p.estudiante_rut = '20222333-4' LIMIT 1;

INSERT IGNORE INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden)
SELECT p.id, '20333444-5', TRUE, 1 FROM propuestas p WHERE p.titulo LIKE 'Sistema de Recomendación%' AND p.estudiante_rut = '20333444-5' LIMIT 1;

INSERT IGNORE INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden)
SELECT p.id, '20444555-6', TRUE, 1 FROM propuestas p WHERE p.titulo = 'Plataforma IoT para Monitoreo Ambiental' AND p.estudiante_rut = '20444555-6' LIMIT 1;

-- ============================================
-- 7. ASIGNACIONES DE PROFESORES A PROPUESTAS
-- ============================================

-- Asignaciones de propuestas (usando subconsultas dinámicas)
-- Propuesta 1 (aprobada)
INSERT IGNORE INTO asignaciones_propuestas (propuesta_id, profesor_rut, rol_revision, fecha_asignacion, fecha_revision, estado_revision, decision, comentarios_revision, asignado_por)
SELECT p.id, '12345678-9', 'revisor_principal', '2024-03-16 09:00:00', '2024-03-20 14:30:00', 'revisado', 'aprobar', 'Excelente propuesta. El alcance está bien definido y es factible. Recomiendo aprobar.', '33333333-3'
FROM propuestas p WHERE p.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO asignaciones_propuestas (propuesta_id, profesor_rut, rol_revision, fecha_asignacion, fecha_revision, estado_revision, decision, comentarios_revision, asignado_por)
SELECT p.id, '98765432-1', 'revisor_secundario', '2024-03-16 09:00:00', '2024-03-21 11:00:00', 'revisado', 'aprobar', 'Propuesta sólida con objetivos claros. Apoyo la aprobación.', '33333333-3'
FROM propuestas p WHERE p.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- Propuesta 2 (en revisión)
INSERT IGNORE INTO asignaciones_propuestas (propuesta_id, profesor_rut, rol_revision, fecha_asignacion, estado_revision, asignado_por)
SELECT p.id, '11223344-5', 'revisor_principal', '2024-11-11 10:00:00', 'en_revision', '33333333-3'
FROM propuestas p WHERE p.titulo = 'Aplicación Móvil para Seguimiento de Entrenamientos Deportivos' LIMIT 1;

INSERT IGNORE INTO asignaciones_propuestas (propuesta_id, profesor_rut, rol_revision, fecha_asignacion, estado_revision, asignado_por)
SELECT p.id, '55667788-9', 'informante', '2024-11-11 10:00:00', 'en_revision', '33333333-3'
FROM propuestas p WHERE p.titulo = 'Aplicación Móvil para Seguimiento de Entrenamientos Deportivos' LIMIT 1;

-- Propuesta 3 (pendiente)
INSERT IGNORE INTO asignaciones_propuestas (propuesta_id, profesor_rut, rol_revision, fecha_asignacion, estado_revision, asignado_por)
SELECT p.id, '12345678-9', 'revisor_principal', '2024-12-02 08:00:00', 'pendiente', '33333333-3'
FROM propuestas p WHERE p.titulo LIKE 'Sistema de Recomendación%' LIMIT 1;

-- Propuesta 4 (requiere correcciones)
INSERT IGNORE INTO asignaciones_propuestas (propuesta_id, profesor_rut, rol_revision, fecha_asignacion, fecha_revision, estado_revision, decision, comentarios_revision, asignado_por)
SELECT p.id, '44556677-8', 'revisor_principal', '2024-11-21 09:00:00', '2024-11-25 16:00:00', 'revisado', 'solicitar_correcciones', 'La propuesta es interesante pero necesita mayor detalle en la metodología. Falta especificar los sensores exactos y el protocolo de comunicación IoT a utilizar. Debe ampliar la bibliografía con papers recientes.', '33333333-3'
FROM propuestas p WHERE p.titulo = 'Plataforma IoT para Monitoreo Ambiental' LIMIT 1;

-- ============================================
-- 8. PROYECTOS
-- ============================================

-- Proyecto 1: Derivado de propuesta 1
INSERT IGNORE INTO proyectos (
    titulo, descripcion, propuesta_id, estudiante_rut, estado_id,
    fecha_inicio, fecha_entrega_estimada,
    objetivo_general, objetivos_especificos, metodologia,
    porcentaje_avance, estado_detallado, prioridad, riesgo_nivel,
    modalidad, complejidad, duracion_semestres,
    ultima_actividad_fecha, tiempo_dedicado_horas
) VALUES (
    'Sistema Web de Gestión de Inventario para PYMES',
    'Desarrollo de una aplicación web para la gestión integral de inventarios, ventas y compras orientada a pequeñas y medianas empresas del sector retail.',
    (SELECT id FROM propuestas WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' AND estudiante_rut = '20111222-3' LIMIT 1),
    '20111222-3',
    (SELECT id FROM estados_proyectos WHERE nombre = 'en_desarrollo'), -- en desarrollo
    '2024-04-01',
    '2024-11-30',
    'Desarrollar un sistema web de gestión de inventario que permita a las PYMES optimizar el control de stock, ventas y compras mediante una interfaz intuitiva y moderna.',
    '1. Diseñar e implementar una base de datos relacional para almacenar información de productos, clientes y transacciones.\n2. Desarrollar módulos de gestión de inventario, ventas y compras.\n3. Implementar sistema de alertas para stock bajo y productos vencidos.\n4. Crear reportes y dashboards con métricas clave del negocio.',
    'Metodología ágil Scrum con sprints de 2 semanas. Desarrollo incremental con entregas parciales. Testing continuo y validación con usuarios reales. Documentación técnica y de usuario.',
    65.5,
    'desarrollo_fase2',
    'alta',
    'medio',
    'desarrollo_software',
    'media',
    1,
    '2024-12-15',
    320
);

-- Estudiantes vinculados al proyecto
INSERT IGNORE INTO estudiantes_proyectos (proyecto_id, estudiante_rut, es_creador, orden)
SELECT pr.id, '20111222-3', TRUE, 1
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' AND pr.estudiante_rut = '20111222-3' LIMIT 1;

-- ============================================
-- 9. ASIGNACIONES DE PROFESORES A PROYECTOS
-- ============================================

INSERT IGNORE INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, activo, asignado_por)
SELECT pr.id, '12345678-9', (SELECT id FROM roles_profesores WHERE nombre = 'Profesor Guía'), '2024-04-01 10:00:00', TRUE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, activo, asignado_por)
SELECT pr.id, '98765432-1', (SELECT id FROM roles_profesores WHERE nombre = 'Profesor Informante'), '2024-04-01 10:00:00', TRUE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- ============================================
-- 10. FECHAS Y PERÍODOS ACADÉMICOS
-- ============================================

-- Período actual de propuestas (fecha = fecha límite/fin del período)
INSERT IGNORE INTO fechas (
    titulo, descripcion, fecha_inicio, fecha, hora_inicio, hora_limite,
    tipo_fecha, es_global, habilitada, activa, creado_por_rut
) VALUES
(
    'Período de Propuestas Segundo Semestre 2024',
    'Período habilitado para envío y edición de propuestas de proyecto de título del segundo semestre 2024.',
    '2024-11-01',
    '2024-12-20',
    '00:00:00',
    '23:59:59',
    'global',
    TRUE,
    TRUE,
    TRUE,
    '33333333-3'
);

-- Fechas importantes globales (fecha = fecha del evento)
INSERT IGNORE INTO fechas (
    titulo, descripcion, fecha, hora_inicio,
    tipo_fecha, es_global, habilitada, activa, creado_por_rut
) VALUES
('Inicio Período Académico 2024-2', 'Inicio del segundo semestre académico 2024', '2024-08-05', '08:00:00', 'academica', TRUE, TRUE, TRUE, '33333333-3'),
('Fin Período Académico 2024-2', 'Fin del segundo semestre académico 2024', '2024-12-20', '18:00:00', 'academica', TRUE, TRUE, TRUE, '33333333-3'),
('Receso Fiestas Patrias', 'Receso por fiestas patrias', '2024-09-16', '00:00:00', 'academica', TRUE, TRUE, TRUE, '33333333-3'),
('Inicio Período de Exámenes', 'Inicio del período de exámenes finales', '2024-12-02', '08:00:00', 'academica', TRUE, TRUE, TRUE, '33333333-3');

-- Fechas específicas del proyecto 1 (usando subconsulta para proyecto_id)
INSERT IGNORE INTO fechas (titulo, descripcion, fecha, hora_limite, tipo_fecha, es_global, proyecto_id, habilitada, activa, completada, creado_por_rut)
SELECT 'Entrega Informe de Avance 1', 'Primera entrega de informe de avance del proyecto', '2024-06-15', '23:59:00', 'entrega_avance', FALSE, pr.id, TRUE, TRUE, TRUE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO fechas (titulo, descripcion, fecha, hora_limite, tipo_fecha, es_global, proyecto_id, habilitada, activa, completada, creado_por_rut)
SELECT 'Entrega Informe de Avance 2', 'Segunda entrega de informe de avance del proyecto', '2024-09-20', '23:59:00', 'entrega_avance', FALSE, pr.id, TRUE, TRUE, TRUE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO fechas (titulo, descripcion, fecha, hora_limite, tipo_fecha, es_global, proyecto_id, habilitada, activa, completada, creado_por_rut)
SELECT 'Entrega Final Proyecto', 'Entrega final completa del proyecto', '2024-11-30', '23:59:00', 'entrega_final', FALSE, pr.id, TRUE, TRUE, FALSE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO fechas (titulo, descripcion, fecha, hora_limite, tipo_fecha, es_global, proyecto_id, habilitada, activa, completada, creado_por_rut)
SELECT 'Defensa Proyecto de Título', 'Presentación y defensa oral del proyecto', '2024-12-10', '10:00:00', 'defensa', FALSE, pr.id, TRUE, TRUE, FALSE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- ============================================
-- 11. HITOS DEL PROYECTO
-- ============================================
-- Usando subconsulta para proyecto_id dinámico

INSERT IGNORE INTO hitos_proyecto (proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, estado, peso_en_proyecto, es_critico, creado_por_rut)
SELECT pr.id, 'Análisis y Diseño del Sistema', 'Levantamiento de requerimientos, diseño de base de datos y arquitectura del sistema', 'planificacion', '2024-05-15', 'completado', 15.0, FALSE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO hitos_proyecto (proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, estado, peso_en_proyecto, es_critico, creado_por_rut)
SELECT pr.id, 'Implementación Módulo de Inventario', 'Desarrollo del módulo principal de gestión de inventario', 'desarrollo', '2024-07-15', 'completado', 25.0, TRUE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO hitos_proyecto (proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, estado, peso_en_proyecto, es_critico, creado_por_rut)
SELECT pr.id, 'Implementación Módulo de Ventas', 'Desarrollo del módulo de registro y seguimiento de ventas', 'desarrollo', '2024-09-15', 'completado', 20.0, TRUE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO hitos_proyecto (proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, estado, peso_en_proyecto, es_critico, creado_por_rut)
SELECT pr.id, 'Implementación Módulo de Compras', 'Desarrollo del módulo de gestión de compras y proveedores', 'desarrollo', '2024-10-31', 'en_progreso', 20.0, TRUE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO hitos_proyecto (proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, estado, peso_en_proyecto, es_critico, creado_por_rut)
SELECT pr.id, 'Sistema de Reportes y Dashboards', 'Implementación de reportes y visualización de métricas', 'desarrollo', '2024-11-20', 'pendiente', 10.0, FALSE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO hitos_proyecto (proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, estado, peso_en_proyecto, es_critico, creado_por_rut)
SELECT pr.id, 'Testing y Documentación Final', 'Pruebas integrales y documentación completa del sistema', 'testing', '2024-11-30', 'pendiente', 10.0, FALSE, '33333333-3'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- ============================================
-- 12. AVANCES DEL PROYECTO
-- ============================================
-- Usando subconsultas dinámicas para proyecto_id

INSERT IGNORE INTO avances (proyecto_id, titulo, descripcion, estado_id, fecha_envio)
SELECT pr.id, 'Avance Sprint 1-2: Análisis Inicial', 
'Se completó el análisis de requerimientos con el cliente. Se diseñó el modelo de datos y la arquitectura general del sistema.

Logros alcanzados:
- Entrevistas con usuarios PYME
- Diagrama Entidad-Relación completo
- Arquitectura de 3 capas definida
- Mockups de interfaz validados

Dificultades: Dificultad para coordinar reuniones con todos los stakeholders al mismo tiempo.
Próximos pasos: Iniciar implementación de la capa de datos y servicios backend.', 
1, '2024-04-25 12:00:00'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO avances (proyecto_id, titulo, descripcion, estado_id, fecha_envio)
SELECT pr.id, 'Avance Sprint 3-5: Módulo Inventario',
'Módulo de inventario completado con funcionalidades de alta, baja, modificación y búsqueda de productos. Sistema de alertas de stock implementado.

Logros alcanzados:
- CRUD completo de productos
- Sistema de categorías
- Alertas de stock bajo
- Búsqueda y filtros avanzados
- Carga masiva desde Excel

Dificultades: Optimización de consultas con grandes volúmenes de datos. Se resolvió implementando índices en la BD.
Próximos pasos: Comenzar módulo de ventas, integrando catálogo de productos.',
1, '2024-07-10 14:30:00'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO avances (proyecto_id, titulo, descripcion, estado_id, fecha_envio)
SELECT pr.id, 'Avance Sprint 6-8: Módulo Ventas',
'Módulo de ventas operativo. Permite generar órdenes de venta, aplicar descuentos, emitir boletas y facturas.

Logros alcanzados:
- Carrito de compras funcional
- Sistema de descuentos
- Generación de documentos tributarios
- Histórico de ventas
- Reportes de ventas por período

Dificultades: Integración con servicio de facturación electrónica requirió más tiempo del estimado.
Próximos pasos: Implementar módulo de compras y gestión de proveedores.',
1, '2024-09-18 10:15:00'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO avances (proyecto_id, titulo, descripcion, estado_id, fecha_envio)
SELECT pr.id, 'Avance Sprint 9-10: Módulo Compras (En Progreso)',
'Se está desarrollando el módulo de compras. Ya se implementó el registro de proveedores y órdenes de compra.

Logros alcanzados:
- Gestión de proveedores completa
- Generación de órdenes de compra
- Recepción de mercadería (80% completado)

Dificultades: Validación de stock al recibir mercadería presenta casos edge que requieren atención.
Próximos pasos: Completar recepción de mercadería, iniciar módulo de reportes.',
1, '2024-11-10 16:45:00'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- ============================================
-- 13. CRONOGRAMAS
-- ============================================
-- Usando subconsulta dinámica para proyecto_id

INSERT IGNORE INTO cronogramas_proyecto (
    proyecto_id, nombre_cronograma, descripcion, fecha_inicio, fecha_fin_estimada, activo, creado_por_rut
)
SELECT pr.id, 'Cronograma General 2024', 'Planificación completa del proyecto para el año 2024', '2024-04-01', '2024-12-10', TRUE, '22222222-2'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- Hitos del cronograma (usando subconsultas dinámicas)
INSERT IGNORE INTO hitos_cronograma (cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, estado)
SELECT c.id, c.proyecto_id, 'Sprint 1-2: Análisis y Diseño', 'Fase inicial de análisis de requerimientos y diseño del sistema', 'entrega_documento', '2024-05-15', 'aprobado'
FROM cronogramas_proyecto c JOIN proyectos pr ON c.proyecto_id = pr.id WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO hitos_cronograma (cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, estado)
SELECT c.id, c.proyecto_id, 'Sprint 3-5: Desarrollo Módulo Inventario', 'Implementación completa del módulo de gestión de inventario', 'revision_avance', '2024-07-15', 'aprobado'
FROM cronogramas_proyecto c JOIN proyectos pr ON c.proyecto_id = pr.id WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO hitos_cronograma (cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, estado)
SELECT c.id, c.proyecto_id, 'Sprint 6-8: Desarrollo Módulo Ventas', 'Implementación del módulo de ventas y facturación', 'revision_avance', '2024-09-15', 'aprobado'
FROM cronogramas_proyecto c JOIN proyectos pr ON c.proyecto_id = pr.id WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO hitos_cronograma (cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, estado)
SELECT c.id, c.proyecto_id, 'Sprint 9-10: Desarrollo Módulo Compras', 'Implementación del módulo de compras y proveedores', 'revision_avance', '2024-10-31', 'en_progreso'
FROM cronogramas_proyecto c JOIN proyectos pr ON c.proyecto_id = pr.id WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO hitos_cronograma (cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, estado)
SELECT c.id, c.proyecto_id, 'Sprint 11: Reportes y Dashboards', 'Desarrollo de sistema de reportes y visualización', 'revision_avance', '2024-11-20', 'pendiente'
FROM cronogramas_proyecto c JOIN proyectos pr ON c.proyecto_id = pr.id WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO hitos_cronograma (cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, estado)
SELECT c.id, c.proyecto_id, 'Sprint 12: Testing y Cierre', 'Pruebas finales, correcciones y documentación', 'defensa', '2024-11-30', 'pendiente'
FROM cronogramas_proyecto c JOIN proyectos pr ON c.proyecto_id = pr.id WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- ============================================
-- 14. REUNIONES
-- ============================================
-- Usando subconsultas dinámicas para proyecto_id

INSERT IGNORE INTO reuniones (proyecto_id, titulo, descripcion, fecha, hora, lugar, tipo, estado)
SELECT pr.id, 'Reunión de Inicio del Proyecto', 
'Primera reunión para definir alcance, metodología y cronograma inicial del proyecto. Se estableció la metodología de trabajo (Scrum). Se definieron reuniones semanales. Se acordó Stack tecnológico: Angular + Node.js + MySQL. Estudiante presentó cronograma inicial.',
'2024-04-05', '10:00:00', 'Oficina Profesor - Depto. DSI', 'orientacion', 'realizada'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO reuniones (proyecto_id, titulo, descripcion, fecha, hora, lugar, tipo, estado)
SELECT pr.id, 'Revisión Análisis de Requerimientos',
'Revisión del documento de análisis y diseño preliminar. Se revisó documento de requerimientos. Observaciones: falta mayor detalle en casos de uso de reportes. Se aprobó modelo de datos con modificaciones menores. Próxima reunión: mostrar prototipo de interfaz.',
'2024-04-22', '15:00:00', 'Oficina Profesor - Depto. DSI', 'revision_avance', 'realizada'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO reuniones (proyecto_id, titulo, descripcion, fecha, hora, lugar, tipo, estado)
SELECT pr.id, 'Seguimiento Sprint 5 - Demo Inventario',
'Demostración del módulo de inventario completado. Estudiante demostró módulo de inventario funcionando. Todas las funcionalidades solicitadas están implementadas. Se sugirió mejorar UX en búsqueda de productos. Avance: 40%. Muy buen progreso.',
'2024-07-12', '11:00:00', 'Oficina Profesor - Depto. DSI', 'orientacion', 'realizada'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO reuniones (proyecto_id, titulo, descripcion, fecha, hora, lugar, tipo, estado)
SELECT pr.id, 'Revisión Informe de Avance 2',
'Revisión del segundo informe de avance del proyecto. Se revisó informe de avance 2. Observaciones menores en redacción. Se aprobó informe. Estudiante está en plazo con el cronograma. Se discutió integración entre módulos.',
'2024-09-23', '14:00:00', 'Oficina Profesor - Depto. DSI', 'revision_avance', 'realizada'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO reuniones (proyecto_id, titulo, descripcion, fecha, hora, lugar, tipo, estado)
SELECT pr.id, 'Seguimiento Módulo de Compras',
'Revisión del avance en el módulo de compras y resolución de dudas técnicas.',
'2024-12-20', '10:00:00', 'Oficina Profesor - Depto. DSI', 'orientacion', 'programada'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO reuniones (proyecto_id, titulo, descripcion, fecha, hora, lugar, tipo, estado)
SELECT pr.id, 'Revisión Pre-Entrega Final',
'Revisión general del proyecto previo a la entrega final.',
'2024-12-27', '15:00:00', 'Oficina Profesor - Depto. DSI', 'defensa', 'programada'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- Participantes de las reuniones (profesor como organizador, estudiante como participante)
INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '12345678-9', 'organizador', TRUE
FROM reuniones r WHERE r.titulo = 'Reunión de Inicio del Proyecto' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '20111222-3', 'participante', TRUE
FROM reuniones r WHERE r.titulo = 'Reunión de Inicio del Proyecto' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '12345678-9', 'organizador', TRUE
FROM reuniones r WHERE r.titulo = 'Revisión Análisis de Requerimientos' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '20111222-3', 'participante', TRUE
FROM reuniones r WHERE r.titulo = 'Revisión Análisis de Requerimientos' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '12345678-9', 'organizador', TRUE
FROM reuniones r WHERE r.titulo = 'Seguimiento Sprint 5 - Demo Inventario' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '20111222-3', 'participante', TRUE
FROM reuniones r WHERE r.titulo = 'Seguimiento Sprint 5 - Demo Inventario' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '12345678-9', 'organizador', TRUE
FROM reuniones r WHERE r.titulo = 'Revisión Informe de Avance 2' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '20111222-3', 'participante', TRUE
FROM reuniones r WHERE r.titulo = 'Revisión Informe de Avance 2' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '12345678-9', 'organizador', FALSE
FROM reuniones r WHERE r.titulo = 'Seguimiento Módulo de Compras' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '20111222-3', 'participante', FALSE
FROM reuniones r WHERE r.titulo = 'Seguimiento Módulo de Compras' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '12345678-9', 'organizador', FALSE
FROM reuniones r WHERE r.titulo = 'Revisión Pre-Entrega Final' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

INSERT IGNORE INTO participantes_reuniones (reunion_id, usuario_rut, rol, confirmado)
SELECT r.id, '20111222-3', 'participante', FALSE
FROM reuniones r WHERE r.titulo = 'Revisión Pre-Entrega Final' AND r.proyecto_id = (SELECT id FROM proyectos WHERE titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1) LIMIT 1;

-- ============================================
-- 15. DOCUMENTOS DEL PROYECTO
-- ============================================
-- NOTA: La tabla documentos_proyecto no existe en el esquema actual
-- Los documentos se manejan como archivos en propuestas y avances

-- INSERT OMITIDO: documentos_proyecto no está definida en database.sql

-- ============================================
-- 16. EXTENSIONES (SOLICITUDES)
-- ============================================
-- Nota: dias_extension es un campo calculado automáticamente

INSERT IGNORE INTO solicitudes_extension (
    proyecto_id, solicitante_rut, fecha_original, fecha_solicitada,
    motivo, justificacion_detallada, documento_respaldo,
    estado, aprobado_por, fecha_resolucion
)
SELECT pr.id, '20111222-3', '2024-10-31', '2024-11-15',
 'Retraso en integración de API externa', 
 'La integración con el servicio de facturación electrónica del SII presentó problemas técnicos no previstos. El proveedor del servicio tuvo una actualización mayor que cambió la API. Se requirió tiempo adicional para adaptar el código a la nueva versión.',
 '/uploads/extensiones/proyecto_1_ext_001.pdf',
 'aprobada', '12345678-9', '2024-10-26 10:00:00'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- ============================================
-- 17. COMISIONES EVALUADORAS
-- ============================================
-- Cada fila representa un miembro de la comisión evaluadora del proyecto

INSERT IGNORE INTO comision_evaluadora (
    proyecto_id, fase_evaluacion, profesor_rut, rol_comision, activo, asignado_por, observaciones
)
SELECT pr.id, 'defensa_final', '12345678-9', 'presidente', TRUE, '33333333-3', 'Presidente de la comisión evaluadora'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO comision_evaluadora (
    proyecto_id, fase_evaluacion, profesor_rut, rol_comision, activo, asignado_por, observaciones
)
SELECT pr.id, 'defensa_final', '98765432-1', 'secretario', TRUE, '33333333-3', 'Secretario de la comisión evaluadora'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO comision_evaluadora (
    proyecto_id, fase_evaluacion, profesor_rut, rol_comision, activo, asignado_por, observaciones
)
SELECT pr.id, 'defensa_final', '11223344-5', 'vocal', TRUE, '33333333-3', 'Vocal de la comisión evaluadora'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- ============================================
-- 18. NOTIFICACIONES
-- ============================================
-- Nota: tipo_notificacion tiene valores específicos del ENUM

INSERT IGNORE INTO notificaciones_proyecto (
    proyecto_id, destinatario_rut, rol_destinatario, tipo_notificacion, titulo, mensaje,
    leida, email_enviado
)
SELECT pr.id, '20111222-3', 'estudiante', 'fecha_limite_proxima', 'Recordatorio: Entrega Final próxima',
 'Te recordamos que la fecha de entrega final de tu proyecto es el 30 de noviembre de 2024. Asegúrate de tener todos los documentos listos.',
 TRUE, TRUE
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO notificaciones_proyecto (
    proyecto_id, destinatario_rut, rol_destinatario, tipo_notificacion, titulo, mensaje,
    leida, email_enviado
)
SELECT pr.id, '20111222-3', 'estudiante', 'cronograma_modificado', 'Nueva reunión programada',
 'Se ha programado una reunión de seguimiento para el 20 de diciembre a las 10:00 hrs en la oficina del profesor.',
 FALSE, TRUE
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

INSERT IGNORE INTO notificaciones_proyecto (
    proyecto_id, destinatario_rut, rol_destinatario, tipo_notificacion, titulo, mensaje,
    leida, email_enviado
)
SELECT pr.id, '12345678-9', 'profesor_guia', 'nueva_entrega', 'Nuevo avance reportado en proyecto',
 'El estudiante Luis Morales ha reportado un nuevo avance en el proyecto "Sistema Web de Gestión de Inventario".',
 TRUE, TRUE
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- ============================================
-- 19. CONFIGURACIÓN DE ALERTAS
-- ============================================
-- NOTA: configuracion_alertas está vinculada a proyecto_id específico, no es configuración global
-- Se omite este INSERT porque requiere verificar la estructura exacta en database.sql

-- INSERT OMITIDO: configuracion_alertas tiene estructura diferente (requiere proyecto_id)

-- ============================================
-- 20. HISTORIAL DE ASIGNACIONES
-- ============================================
-- Requiere asignacion_id de asignaciones_proyectos

INSERT IGNORE INTO historial_asignaciones (
    asignacion_id, proyecto_id, profesor_rut, rol_profesor_id, accion, observaciones, realizado_por
)
SELECT ap.id, ap.proyecto_id, ap.profesor_rut, ap.rol_profesor_id, 'asignado', 'Asignación inicial como profesor guía', '33333333-3'
FROM asignaciones_proyectos ap 
JOIN proyectos pr ON ap.proyecto_id = pr.id 
WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' AND ap.profesor_rut = '12345678-9'
LIMIT 1;

INSERT IGNORE INTO historial_asignaciones (
    asignacion_id, proyecto_id, profesor_rut, rol_profesor_id, accion, observaciones, realizado_por
)
SELECT ap.id, ap.proyecto_id, ap.profesor_rut, ap.rol_profesor_id, 'asignado', 'Asignación inicial como profesor informante', '33333333-3'
FROM asignaciones_proyectos ap 
JOIN proyectos pr ON ap.proyecto_id = pr.id 
WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' AND ap.profesor_rut = '98765432-1'
LIMIT 1;

-- ============================================
-- 21. DISPONIBILIDADES DE PROFESORES (para matching reuniones)
-- ============================================

INSERT IGNORE INTO disponibilidad_horarios (
    usuario_rut, dia_semana, hora_inicio, hora_fin, activo
) VALUES
-- Dr. Juan Pérez
('12345678-9', 'lunes', '10:00:00', '12:00:00', TRUE),
('12345678-9', 'lunes', '15:00:00', '17:00:00', TRUE),
('12345678-9', 'miercoles', '10:00:00', '12:00:00', TRUE),
('12345678-9', 'viernes', '14:00:00', '16:00:00', TRUE),

-- Dra. María González
('98765432-1', 'martes', '09:00:00', '11:00:00', TRUE),
('98765432-1', 'martes', '14:00:00', '16:00:00', TRUE),
('98765432-1', 'jueves', '10:00:00', '12:00:00', TRUE),

-- Dr. Carlos Ramírez
('11223344-5', 'lunes', '11:00:00', '13:00:00', TRUE),
('11223344-5', 'miercoles', '15:00:00', '17:00:00', TRUE),
('11223344-5', 'viernes', '09:00:00', '11:00:00', TRUE);

-- ============================================
-- 22. SOLICITUDES DE REUNIÓN
-- ============================================

INSERT IGNORE INTO solicitudes_reunion (
    proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta, hora_propuesta,
    tipo_reunion, descripcion, estado, creado_por
)
SELECT pr.id, '12345678-9', '20111222-3', '2024-12-21', '10:00:00',
 'orientacion', 
 'Consultas sobre integración de módulos. Necesito orientación sobre la mejor forma de integrar el módulo de compras con el de inventario, específicamente en el manejo de transacciones.',
 'pendiente', 'estudiante'
FROM proyectos pr WHERE pr.titulo = 'Sistema Web de Gestión de Inventario para PYMES' LIMIT 1;

-- ============================================
-- RESUMEN DE DATOS CREADOS
-- ============================================
-- ✅ 3 Roles (estudiante, profesor, admin)
-- ✅ 5 Estados de propuestas
-- ✅ 5 Estados de proyectos
-- ✅ 3 Roles de profesores
-- ✅ 2 Facultades
-- ✅ 3 Departamentos
-- ✅ 3 Carreras
-- ✅ 10 Usuarios (2 admins, 5 profesores, 8 estudiantes)
-- ✅ 5 Profesores asignados a departamentos
-- ✅ 8 Estudiantes asignados a carreras
-- ✅ 4 Propuestas (aprobada, en revisión, pendiente, requiere correcciones)
-- ✅ 4 Estudiantes vinculados a propuestas
-- ✅ 5 Asignaciones de profesores a propuestas
-- ✅ 1 Proyecto activo con progreso avanzado
-- ✅ 1 Estudiante vinculado al proyecto
-- ✅ 2 Profesores asignados al proyecto (guía e informante)
-- ✅ 8 Fechas importantes (período + fechas globales + fechas proyecto)
-- ✅ 6 Hitos del proyecto
-- ✅ 4 Avances reportados
-- ✅ 1 Cronograma con 6 hitos
-- ✅ 6 Reuniones (4 realizadas, 2 programadas)
-- ✅ 5 Documentos del proyecto
-- ✅ 1 Extensión aprobada
-- ✅ 1 Comisión evaluadora con 3 miembros
-- ✅ 3 Notificaciones
-- ✅ 3 Configuraciones de alertas
-- ✅ 2 Registros de historial de asignaciones
-- ✅ 10 Disponibilidades de profesores
-- ✅ 1 Solicitud de reunión pendiente

-- ============================================
-- CREDENCIALES DE ACCESO
-- ============================================
-- Usuarios básicos (ya existen en database.sql):
--   RUT: 11111111-1  |  Email: estudiante@ubiobio.cl    |  Password: 1234  |  Rol: Estudiante
--   RUT: 22222222-2  |  Email: profesor@ubiobio.cl      |  Password: 1234  |  Rol: Profesor
--   RUT: 33333333-3  |  Email: admin@ubiobio.cl         |  Password: 1234  |  Rol: Admin
--   RUT: 44444444-4  |  Email: superadmin@ubiobio.cl    |  Password: 1234  |  Rol: SuperAdmin
--
-- Usuarios adicionales (creados aquí):
--   RUT: 12345678-9  |  Email: juan.perez@ubb.cl        |  Password: Password123!  |  Rol: Profesor
--   RUT: 20111222-3  |  Email: luis.morales@alumnos.ubb.cl  |  Password: Password123!  |  Rol: Estudiante
--   ... (y más usuarios adicionales)
-- ============================================

SELECT '✅ DATOS DE PRUEBA CARGADOS EXITOSAMENTE' as status;
SELECT 'Total usuarios:' as info, COUNT(*) as cantidad FROM usuarios
UNION ALL
SELECT 'Total propuestas:', COUNT(*) FROM propuestas
UNION ALL
SELECT 'Total proyectos:', COUNT(*) FROM proyectos
UNION ALL
SELECT 'Total reuniones:', COUNT(*) FROM reuniones
UNION ALL
SELECT 'Total hitos:', COUNT(*) FROM hitos_proyecto;
