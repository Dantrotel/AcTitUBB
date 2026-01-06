-- ============================================
-- SCRIPT DE DATOS FICTICIOS COHERENTES
-- Sistema de Gestión de Titulación UBB
-- ============================================
-- IMPORTANTE: Este script asume que database.sql ya fue ejecutado
-- Solo inserta datos de prueba, NO crea estructura
-- ============================================
use actitubb;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. LIMPIEZA DE DATOS EXISTENTES
-- ============================================
-- DESACTIVADO: El script solo agrega datos sin borrar existentes
-- Si necesitas limpiar antes de insertar, descomenta las siguientes líneas:

-- DELETE FROM solicitudes_reunion WHERE 1=1;
-- DELETE FROM disponibilidad_horarios WHERE 1=1;
-- DELETE FROM fechas WHERE 1=1;
-- DELETE FROM asignaciones_proyectos WHERE 1=1;
-- DELETE FROM estudiantes_proyectos WHERE 1=1;
-- DELETE FROM proyectos WHERE 1=1;
-- DELETE FROM asignaciones_propuestas WHERE 1=1;
-- DELETE FROM estudiantes_propuestas WHERE 1=1;
-- DELETE FROM propuestas WHERE 1=1;
-- DELETE FROM colaboradores_externos WHERE 1=1;
-- DELETE FROM entidades_externas WHERE 1=1;
-- DELETE FROM usuarios WHERE 1=1;

-- ============================================
-- 2. USUARIOS
-- ============================================

-- Super Admin (contraseña: Admin123!)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('17654321-0', 'Carlos Rodríguez Silva', 'carlos.rodriguez@ubiobio.cl', '$2b$10$xB5r7KQYGvN8hYZ4kQ7IQeE5yL9mH6pR3tW8xD2cF4jK7mN9qT0sA', 4, 1, 0);

-- Administradores (contraseña: Admin123!)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('18765432-1', 'María González López', 'maria.gonzalez@ubiobio.cl', '$2b$10$xB5r7KQYGvN8hYZ4kQ7IQeE5yL9mH6pR3tW8xD2cF4jK7mN9qT0sA', 3, 1, 0),
('18876543-2', 'Pedro Martínez Fernández', 'pedro.martinez@ubiobio.cl', '$2b$10$xB5r7KQYGvN8hYZ4kQ7IQeE5yL9mH6pR3tW8xD2cF4jK7mN9qT0sA', 3, 1, 0);

-- Profesores del Departamento de Sistemas de Información (contraseña: Profe123!)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('16234567-8', 'Roberto Sánchez Castro', 'roberto.sanchez@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16345678-9', 'Ana Ramírez Torres', 'ana.ramirez@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16456789-0', 'Luis Pérez Morales', 'luis.perez@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16567890-1', 'Carmen Vargas Díaz', 'carmen.vargas@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0),
('16678901-2', 'Jorge Muñoz Rojas', 'jorge.munoz@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0);

-- Estudiantes IECI (Ingeniería de Ejecución en Computación e Informática) - Solo 1 semestre (contraseña: Estudiante123!)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('20987654-3', 'Sebastián Flores Gutiérrez', 'sebastian.flores@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21098765-4', 'Camila Reyes Soto', 'camila.reyes@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21109876-5', 'Francisca Morales Herrera', 'francisca.morales@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21210987-6', 'Sofía Campos Valdés', 'sofia.campos@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0);

-- Estudiantes ICINF (Ingeniería Civil en Informática) - Puede 1 o 2 semestres (contraseña: Estudiante123!)
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('20876543-2', 'Valentina Ortiz Núñez', 'valentina.ortiz@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20765432-1', 'Diego Castro Bravo', 'diego.castro@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('20654321-0', 'Matías Silva Pinto', 'matias.silva@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21321098-7', 'Nicolás Vega Contreras', 'nicolas.vega@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21432109-8', 'Benjamín Riquelme Espinoza', 'benjamin.riquelme@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('21543210-9', 'Martina Fuentes Cortés', 'martina.fuentes@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0);

-- ============================================
-- 3. ESTRUCTURA ACADÉMICA (FACULTADES, DEPARTAMENTOS, CARRERAS)
-- ============================================

-- Facultad de Ciencias Empresariales
INSERT INTO facultades (id, nombre, codigo, descripcion, activo) VALUES
(100, 'Facultad de Ciencias Empresariales', 'FCE', 'Facultad de Ciencias Empresariales de la Universidad del Bío-Bío', 1);

-- Departamento de Sistemas de Información
INSERT INTO departamentos (id, facultad_id, nombre, codigo, descripcion, activo) VALUES
(100, 100, 'Departamento de Sistemas de Información', 'DSI', 'Departamento de Sistemas de Información', 1);

-- Carreras
INSERT INTO carreras (id, facultad_id, nombre, codigo, titulo_profesional, grado_academico, duracion_semestres, descripcion, activo) VALUES
(100, 100, 'Ingeniería Civil en Informática', 'ICINF', 'Ingeniero Civil en Informática', 'Licenciado en Ciencias de la Ingeniería', 10, 'Carrera de Ingeniería Civil en Informática', 1),
(101, 100, 'Ingeniería de Ejecución en Computación e Informática', 'IECI', 'Ingeniero de Ejecución en Computación e Informática', NULL, 8, 'Carrera de Ingeniería de Ejecución en Computación e Informática', 1);

-- ============================================
-- 4. ASIGNACIÓN DE ESTUDIANTES A CARRERAS
-- ============================================

-- Estudiantes IECI (carrera_id = 101)
INSERT INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('20987654-3', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('21098765-4', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('21109876-5', 101, 2021, 8, 'egresado', '2021-03-01', 1),
('21210987-6', 101, 2021, 8, 'egresado', '2021-03-01', 1);

-- Estudiantes ICINF (carrera_id = 100)
INSERT INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('20876543-2', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('20765432-1', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('20654321-0', 100, 2020, 10, 'egresado', '2020-03-01', 1),
('21321098-7', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('21432109-8', 100, 2021, 10, 'egresado', '2021-03-01', 1),
('21543210-9', 100, 2021, 10, 'egresado', '2021-03-01', 1);

-- ============================================
-- 5. ASIGNACIÓN DE PROFESORES A DEPARTAMENTO
-- ============================================

-- Todos los profesores pertenecen al Departamento de Sistemas de Información (departamento_id = 100)
INSERT INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso, activo) VALUES
('16234567-8', 100, 1, '2015-03-01', 1),
('16345678-9', 100, 1, '2016-03-01', 1),
('16456789-0', 100, 1, '2017-03-01', 1),
('16567890-1', 100, 1, '2018-03-01', 1),
('16678901-2', 100, 1, '2019-03-01', 1);

-- ============================================
-- 6. ENTIDADES EXTERNAS
-- ============================================

INSERT INTO entidades_externas (nombre, razon_social, rut_empresa, tipo, email_contacto, telefono, direccion, sitio_web, area_actividad, descripcion, activo) VALUES
('TechSolutions SpA', 'TechSolutions Servicios Informáticos SpA', '76123456-7', 'empresa_privada', 'contacto@techsolutions.cl', '+56412345678', 'Av. Collao 1202, Concepción', 'https://techsolutions.cl', 'Desarrollo de Software', 'Empresa líder en desarrollo de software a medida y consultoría tecnológica.', 1),
('DataAnalytics Chile', 'DataAnalytics Chile Limitada', '76234567-8', 'empresa_privada', 'info@dataanalytics.cl', '+56423456789', 'Barros Arana 456, Concepción', 'https://dataanalytics.cl', 'Análisis de Datos', 'Especialistas en Big Data, Machine Learning y Business Intelligence.', 1),
('Fundación Innovación Social', 'Fundación para la Innovación Social', '65345678-9', 'ong', 'contacto@innovacionsocial.cl', '+56434567890', 'O\'Higgins 789, Chillán', 'https://innovacionsocial.cl', 'Tecnología Social', 'ONG enfocada en proyectos de tecnología para el desarrollo social.', 1),
('CloudServices SA', 'CloudServices Infraestructura SA', '76456789-0', 'empresa_privada', 'ventas@cloudservices.cl', '+56445678901', 'Freire 123, Concepción', 'https://cloudservices.cl', 'Cloud Computing', 'Proveedor de servicios de infraestructura cloud y DevOps.', 1);

-- ============================================
-- 7. COLABORADORES EXTERNOS
-- ============================================

INSERT INTO colaboradores_externos (entidad_id, nombre_completo, rut, email, telefono, cargo, tipo_colaborador, area_departamento, especialidad, anos_experiencia, linkedin, biografia, observaciones, verificado, activo, creado_por) VALUES
 (1, 'Fernando Campos Osorio', '15123456-7', 'fcampos@techsolutions.cl', '+56987654321', 'Gerente de Desarrollo', 'supervisor_empresa', 'Desarrollo de Software', 'Arquitectura de Software', 18, 'https://linkedin.com/in/fcampos', 'Ingeniero Civil en Informática con más de 18 años de experiencia.', 'Excelente supervisor para proyectos complejos.', 1, 1, '17654321-0'),
 (2, 'Ricardo Soto Valenzuela', '14345678-9', 'rsoto@dataanalytics.cl', '+56987654323', 'Data Science Lead', 'mentor', 'Ciencia de Datos', 'Machine Learning', 15, 'https://linkedin.com/in/rsoto', 'PhD en Ciencias de la Computación, especialista en ML.', 'Mentor excepcional para proyectos de IA.', 1, 1, '17654321-0');

-- ============================================
-- 8. PROPUESTAS (Con campos actuales del sistema)
-- ============================================

-- Propuestas aprobadas (estado_id = 4) - Distribuidas en últimos 6 meses
INSERT INTO propuestas (titulo, descripcion, estudiante_rut, estado_id, fecha_envio, archivo, modalidad, numero_estudiantes, duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta, complejidad_estimada) VALUES
('Sistema de Gestión de Inventario con ML', 
'Sistema web para gestión de inventario con algoritmos de ML para predicción de demanda. Dashboard interactivo y alertas automatizadas.',
'20987654-3', 4, DATE_SUB(NOW(), INTERVAL 165 DAY), 'propuesta_inventario_ml.pdf', 'desarrollo_software', 1, 1, 'Inteligencia Artificial', 'Desarrollar sistema de gestión de inventario inteligente', 'Implementar predicción de demanda con ML; Crear dashboard interactivo; Configurar alertas automatizadas', 'Desarrollo incremental con metodología ágil', 'media'),

('Plataforma de E-Learning Adaptativo',
'Plataforma educativa adaptativa con IA. Sistema de evaluación automática y gamificación.',
'20876543-2', 4, DATE_SUB(NOW(), INTERVAL 140 DAY), 'propuesta_elearning.pdf', 'desarrollo_software', 2, 2, 'Educación y Tecnología', 'Crear plataforma educativa adaptativa con IA', 'Desarrollar sistema adaptativo; Implementar evaluación automática; Integrar gamificación', 'Desarrollo en fases con pruebas continuas', 'alta'),

('Sistema de Monitoreo Ambiental IoT',
'Red de sensores IoT para monitoreo ambiental en tiempo real con dashboard web.',
'21098765-4', 4, DATE_SUB(NOW(), INTERVAL 110 DAY), 'propuesta_iot_ambiental.pdf', 'desarrollo_software', 1, 1, 'Internet de las Cosas', 'Implementar sistema de monitoreo ambiental IoT', 'Configurar red de sensores; Desarrollar dashboard web; Implementar alertas en tiempo real', 'Prototipado y desarrollo iterativo', 'media');

-- Estudiantes adicionales para propuesta 2 (2 estudiantes ICINF)
INSERT INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden) VALUES
(2, '20876543-2', TRUE, 1),
(2, '20765432-1', FALSE, 2);

-- Propuestas en revisión (estado_id = 2)
INSERT INTO propuestas (titulo, descripcion, estudiante_rut, estado_id, fecha_envio, archivo, modalidad, numero_estudiantes, duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta, complejidad_estimada) VALUES
('Análisis Comparativo de Algoritmos ML',
'Investigación sobre eficiencia de algoritmos de ML en datasets médicos.',
'20654321-0', 2, DATE_SUB(NOW(), INTERVAL 35 DAY), 'propuesta_investigacion.pdf', 'investigacion', 2, 2, 'Investigación Científica', 'Comparar eficiencia de algoritmos ML en contexto médico', 'Implementar algoritmos ML; Ejecutar pruebas con datasets médicos; Analizar resultados', 'Investigación experimental con análisis estadístico', 'media');

INSERT INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden) VALUES
(4, '20654321-0', TRUE, 1),
(4, '21109876-5', FALSE, 2);

-- Propuestas con correcciones solicitadas (estado_id = 3)
INSERT INTO propuestas (titulo, descripcion, estudiante_rut, estado_id, fecha_envio, archivo, modalidad, numero_estudiantes, duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta, complejidad_estimada, fecha_revision) VALUES
('Sistema de Gestión Académica',
'Sistema web para gestión de notas y asistencia.',
'21210987-6', 3, DATE_SUB(NOW(), INTERVAL 55 DAY), 'propuesta_academica.pdf', 'desarrollo_software', 1, 1, 'Sistemas de Información', 'Desarrollar sistema de gestión académica', 'Módulo de notas; Módulo de asistencia; Reportes estadísticos', 'Desarrollo incremental', 'baja', DATE_SUB(NOW(), INTERVAL 40 DAY));

-- Propuestas rechazadas (estado_id = 5)
INSERT INTO propuestas (titulo, descripcion, estudiante_rut, estado_id, fecha_envio, archivo, modalidad, numero_estudiantes, duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta, complejidad_estimada, fecha_revision) VALUES
('Clon de Red Social Existente',
'Copiar funcionalidad de Instagram.',
'21543210-9', 5, DATE_SUB(NOW(), INTERVAL 90 DAY), 'propuesta_social.pdf', 'desarrollo_software', 1, 1, 'Redes Sociales', 'Crear red social', 'Copiar funciones existentes', 'Sin metodología clara', 'baja', DATE_SUB(NOW(), INTERVAL 75 DAY));

-- Propuestas pendientes (estado_id = 1)
INSERT INTO propuestas (titulo, descripcion, estudiante_rut, estado_id, fecha_envio, archivo, modalidad, numero_estudiantes, duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta, complejidad_estimada) VALUES
('App Móvil de Finanzas Personales',
'Aplicación móvil para control de gastos con gráficos y alertas.',
'21321098-7', 1, DATE_SUB(NOW(), INTERVAL 18 DAY), 'propuesta_finanzas.pdf', 'desarrollo_software', 1, 2, 'Desarrollo Móvil', 'Crear aplicación móvil de finanzas personales', 'Desarrollar interfaz móvil; Implementar gráficos interactivos; Configurar sistema de alertas', 'Desarrollo ágil con sprints semanales', 'baja'),

('Sistema de Recomendaciones E-Commerce',
'Sistema de recomendaciones usando ML para plataforma web.',
'21432109-8', 1, DATE_SUB(NOW(), INTERVAL 8 DAY), 'propuesta_recomendaciones.pdf', 'desarrollo_software', 2, 1, 'Machine Learning', 'Implementar sistema de recomendaciones inteligente', 'Desarrollar algoritmo de recomendaciones; Integrar con plataforma web; Optimizar rendimiento', 'Desarrollo iterativo con análisis de métricas', 'media');

INSERT INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden) VALUES
(8, '21432109-8', TRUE, 1),
(8, '21543210-9', FALSE, 2);

-- ============================================
-- 9. ASIGNACIONES DE PROPUESTAS
-- ============================================
-- En tu sistema: asignaciones_propuestas solo tiene (propuesta_id, profesor_rut, asignado_por)
-- Un profesor revisa la propuesta, no hay roles de revisión en esta tabla

-- Propuestas aprobadas (ya revisadas)
INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut, asignado_por) VALUES
(1, '16234567-8', '18765432-1'),
(2, '16345678-9', '18765432-1'),
(3, '16678901-2', '18765432-1');

-- Propuesta en revisión (asignada pero no revisada aún)
INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut, asignado_por) VALUES
(4, '16234567-8', '18765432-1');

-- Propuesta con correcciones (ya revisada, esperando correcciones)
INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut, asignado_por) VALUES
(5, '16456789-0', '18765432-1');

-- Propuesta rechazada (ya revisada)
INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut, asignado_por) VALUES
(6, '16567890-1', '18765432-1');

-- Historial de revisiones para propuestas con decisión
INSERT INTO historial_revisiones_propuestas (asignacion_id, propuesta_id, profesor_rut, accion, decision, comentarios, fecha_accion, realizado_por) VALUES
-- Propuesta 5 (con correcciones)
(5, 5, '16456789-0', 'decision_tomada', 'solicitar_correcciones', 'Falta mayor detalle en objetivos específicos y justificación de complejidad. Se requiere ampliar la metodología propuesta.', DATE_SUB(NOW(), INTERVAL 40 DAY), '16456789-0'),
-- Propuesta 6 (rechazada)
(6, 6, '16567890-1', 'decision_tomada', 'rechazar', 'Propuesta carece de innovación y aporte académico. No se justifica como trabajo de titulación. Se recomienda replantear el enfoque.', DATE_SUB(NOW(), INTERVAL 75 DAY), '16567890-1'),
-- Propuesta 1 (aprobada)
(1, 1, '16234567-8', 'decision_tomada', 'aprobar', 'Propuesta sólida con objetivos claros. El uso de ML para predicción de demanda es innovador y aplicable.', DATE_SUB(NOW(), INTERVAL 160 DAY), '16234567-8'),
-- Propuesta 2 (aprobada)
(2, 2, '16345678-9', 'decision_tomada', 'aprobar', 'Excelente propuesta. La adaptación con IA y el componente de gamificación son muy interesantes.', DATE_SUB(NOW(), INTERVAL 135 DAY), '16345678-9'),
-- Propuesta 3 (aprobada)
(3, 3, '16678901-2', 'decision_tomada', 'aprobar', 'Propuesta bien fundamentada. IoT aplicado a monitoreo ambiental tiene buen potencial académico.', DATE_SUB(NOW(), INTERVAL 105 DAY), '16678901-2');

-- ============================================
-- 10. PROYECTOS
-- ============================================
-- Estados: 1=esperando_asignacion_profesores, 2=en_desarrollo
-- Campos requeridos: titulo, descripcion, propuesta_id, estudiante_rut, estado_id, fecha_inicio, modalidad, complejidad, duracion_semestres

INSERT INTO proyectos (titulo, descripcion, propuesta_id, estudiante_rut, estado_id, fecha_inicio, fecha_entrega_estimada, modalidad, complejidad, duracion_semestres) VALUES
('Sistema de Gestión de Inventario con ML',
'Sistema web con React y Node.js. Algoritmos de ML para predicción. PostgreSQL y AWS. IECI 1 semestre.',
1, '20987654-3', 2, DATE_SUB(NOW(), INTERVAL 160 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 'desarrollo_software', 'media', 1),

('Plataforma de E-Learning Adaptativo',
'Plataforma Angular/Django con IA usando TensorFlow. MongoDB. ICINF 2 estudiantes, 2 semestres.',
2, '20876543-2', 2, DATE_SUB(NOW(), INTERVAL 135 DAY), DATE_ADD(NOW(), INTERVAL 225 DAY), 'desarrollo_software', 'alta', 2),

('Sistema de Monitoreo Ambiental IoT',
'Red sensores ESP32 con MQTT. Python/FastAPI backend. Dashboard Vue.js. IECI 1 semestre.',
3, '21098765-4', 2, DATE_SUB(NOW(), INTERVAL 105 DAY), DATE_ADD(NOW(), INTERVAL 75 DAY), 'desarrollo_software', 'media', 1);

-- ============================================
-- 11. ESTUDIANTES_PROYECTOS
-- ============================================
-- Campos: proyecto_id, estudiante_rut, es_creador, orden

INSERT INTO estudiantes_proyectos (proyecto_id, estudiante_rut, es_creador, orden) VALUES
(1, '20987654-3', 1, 1),
(2, '20876543-2', 1, 1),
(2, '20765432-1', 0, 2),
(3, '21098765-4', 1, 1);

-- ============================================
-- 12. ASIGNACIONES DE PROFESORES A PROYECTOS
-- ============================================
-- Roles: 2='Profesor Guía', 4='Profesor Informante'

INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, activo, asignado_por) VALUES
(1, '16234567-8', 2, DATE_SUB(NOW(), INTERVAL 160 DAY), TRUE, '18765432-1'),
(1, '16345678-9', 4, DATE_SUB(NOW(), INTERVAL 160 DAY), TRUE, '18765432-1'),

(2, '16345678-9', 2, DATE_SUB(NOW(), INTERVAL 135 DAY), TRUE, '18765432-1'),
(2, '16456789-0', 4, DATE_SUB(NOW(), INTERVAL 135 DAY), TRUE, '18765432-1'),

(3, '16678901-2', 2, DATE_SUB(NOW(), INTERVAL 105 DAY), TRUE, '18765432-1'),
(3, '16234567-8', 4, DATE_SUB(NOW(), INTERVAL 105 DAY), TRUE, '18765432-1');

-- ============================================
-- 13. FECHAS IMPORTANTES (Tabla: fechas)
-- ============================================
-- Campos requeridos: titulo, fecha, tipo_fecha, proyecto_id, creado_por_rut

INSERT INTO fechas (titulo, descripcion, fecha, tipo_fecha, proyecto_id, creado_por_rut, es_global, activa) VALUES
-- Proyecto 1 (IECI - 1 semestre)
('Entrega Capítulo 1', 'Marco teórico y estado del arte', DATE_ADD(NOW(), INTERVAL 15 DAY), 'entrega', 1, '16234567-8', 0, 1),
('Reunión Avance', 'Presentación avance ML', DATE_ADD(NOW(), INTERVAL 30 DAY), 'reunion', 1, '16234567-8', 0, 1),
('Entrega Prototipo', 'Demo prototipo funcional', DATE_ADD(NOW(), INTERVAL 60 DAY), 'entrega', 1, '16234567-8', 0, 1),
('Defensa Final', 'Defensa trabajo titulación', DATE_ADD(NOW(), INTERVAL 95 DAY), 'defensa', 1, '16234567-8', 0, 1),

-- Proyecto 2 (ICINF - 2 semestres, 2 estudiantes)
('Revisión Arquitectura', 'Validación arquitectura', DATE_ADD(NOW(), INTERVAL 20 DAY), 'revision', 2, '16345678-9', 0, 1),
('Entrega Primer Semestre', 'Módulos base', DATE_ADD(NOW(), INTERVAL 120 DAY), 'hito', 2, '16345678-9', 0, 1),
('Entrega Módulo IA', 'Módulo adaptación IA', DATE_ADD(NOW(), INTERVAL 180 DAY), 'entrega', 2, '16345678-9', 0, 1),
('Testing Usuarios', 'Pruebas usabilidad', DATE_ADD(NOW(), INTERVAL 230 DAY), 'hito', 2, '16345678-9', 0, 1),
('Defensa Final', 'Defensa final', DATE_ADD(NOW(), INTERVAL 280 DAY), 'defensa', 2, '16345678-9', 0, 1),

-- Proyecto 3 (IECI - 1 semestre)
('Instalación Sensores', 'Instalación red sensores', DATE_ADD(NOW(), INTERVAL 25 DAY), 'hito', 3, '16678901-2', 0, 1),
('Calibración Sistema', 'Calibración y validación', DATE_ADD(NOW(), INTERVAL 50 DAY), 'revision', 3, '16678901-2', 0, 1),
('Presentación Resultados', 'Análisis datos', DATE_ADD(NOW(), INTERVAL 90 DAY), 'entrega', 3, '16678901-2', 0, 1),
('Defensa Final', 'Defensa proyecto', DATE_ADD(NOW(), INTERVAL 110 DAY), 'defensa', 3, '16678901-2', 0, 1);

-- ============================================
-- 14. DISPONIBILIDAD HORARIOS
-- ============================================
-- Campos: usuario_rut, dia_semana, hora_inicio, hora_fin, activo

INSERT INTO disponibilidad_horarios (usuario_rut, dia_semana, hora_inicio, hora_fin, activo) VALUES
('16234567-8', 'lunes', '09:00:00', '11:00:00', 1),
('16234567-8', 'lunes', '15:00:00', '17:00:00', 1),
('16234567-8', 'miercoles', '10:00:00', '12:00:00', 1),
('16234567-8', 'viernes', '14:00:00', '16:00:00', 1),

('16345678-9', 'lunes', '11:00:00', '13:00:00', 1),
('16345678-9', 'martes', '09:00:00', '11:00:00', 1),
('16345678-9', 'jueves', '15:00:00', '17:00:00', 1),
('16345678-9', 'viernes', '10:00:00', '12:00:00', 1),

('16456789-0', 'martes', '14:00:00', '16:00:00', 1),
('16456789-0', 'miercoles', '09:00:00', '11:00:00', 1),
('16456789-0', 'jueves', '11:00:00', '13:00:00', 1),

('16567890-1', 'lunes', '10:00:00', '12:00:00', 1),
('16567890-1', 'miercoles', '15:00:00', '17:00:00', 1),
('16567890-1', 'viernes', '09:00:00', '11:00:00', 1),

('16678901-2', 'martes', '10:00:00', '12:00:00', 1),
('16678901-2', 'miercoles', '14:00:00', '16:00:00', 1),
('16678901-2', 'jueves', '09:00:00', '11:00:00', 1);

-- ============================================
-- 15. SOLICITUDES DE REUNIÓN
-- Campos requeridos: proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta, hora_propuesta, tipo_reunion, estado

INSERT INTO solicitudes_reunion (proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta, hora_propuesta, tipo_reunion, descripcion, estado, creado_por) VALUES
(1, '16234567-8', '20987654-3', DATE_ADD(NOW(), INTERVAL 5 DAY), '09:00:00', 'revision_avance', 'Resultados preliminares modelo ML', 'pendiente', 'estudiante'),
(2, '16345678-9', '20876543-2', DATE_ADD(NOW(), INTERVAL 3 DAY), '15:00:00', 'seguimiento', 'Revisión arquitectura plataforma', 'aceptada_profesor', 'estudiante'),
(3, '16678901-2', '21098765-4', DATE_ADD(NOW(), INTERVAL 2 DAY), '14:00:00', 'seguimiento', 'Revisión protocolo MQTT', 'confirmada', 'estudiante');

-- ============================================
-- 16. DATOS ADICIONALES PARA TESTING COMPLETO
-- ============================================

-- Más usuarios para tener más datos de prueba
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('19111111-1', 'Andrea Silva Muñoz', 'andrea.silva@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19222222-2', 'Felipe Torres Rojas', 'felipe.torres@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0),
('19333333-3', 'Daniela Pinto Castro', 'daniela.pinto@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0);

-- Asignar nuevos estudiantes a carreras
INSERT INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal) VALUES
('19111111-1', 100, 2019, 10, 'egresado', '2019-03-01', 1),
('19222222-2', 101, 2020, 8, 'egresado', '2020-03-01', 1),
('19333333-3', 100, 2020, 10, 'egresado', '2020-03-01', 1);

-- Más propuestas con diferentes estados - Distribuidas en últimos 6 meses
INSERT INTO propuestas (titulo, descripcion, estudiante_rut, estado_id, fecha_envio, archivo, modalidad, numero_estudiantes, duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta, complejidad_estimada) VALUES
('Blockchain para Trazabilidad Agrícola',
'Sistema blockchain para trazabilidad de productos agrícolas desde productor a consumidor.',
'19111111-1', 4, DATE_SUB(NOW(), INTERVAL 155 DAY), 'propuesta_blockchain.pdf', 'investigacion', 1, 2, 'Blockchain', 'Implementar sistema de trazabilidad con blockchain', 'Diseño arquitectura blockchain; Desarrollo smart contracts; Integración con sistemas existentes', 'Investigación aplicada con prototipo', 'alta'),

('Chatbot con IA para Atención al Cliente',
'Chatbot inteligente usando NLP para automatizar atención al cliente.',
'19222222-2', 2, DATE_SUB(NOW(), INTERVAL 28 DAY), 'propuesta_chatbot.pdf', 'desarrollo_software', 1, 1, 'Inteligencia Artificial', 'Desarrollar chatbot inteligente con NLP', 'Entrenar modelo NLP; Integrar con sistemas existentes; Medir efectividad', 'Desarrollo iterativo con pruebas A/B', 'media'),

('Sistema de Gestión de Biblioteca Digital',
'Plataforma web para gestión integral de biblioteca universitaria digital.',
'19333333-3', 1, DATE_SUB(NOW(), INTERVAL 14 DAY), 'propuesta_biblioteca.pdf', 'desarrollo_software', 1, 2, 'Sistemas de Información', 'Crear sistema de gestión de biblioteca digital', 'Módulo de catalogación; Módulo de préstamos; Sistema de búsqueda avanzada', 'Desarrollo ágil con Scrum', 'media');

-- Asignar revisores a nuevas propuestas
INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut, asignado_por) VALUES
(9, '16456789-0', '18765432-1'),
(10, '16567890-1', '18765432-1');

-- Más proyectos con estados diversos - Distribuidos en últimos 6 meses
INSERT INTO proyectos (titulo, descripcion, propuesta_id, estudiante_rut, estado_id, fecha_inicio, fecha_entrega_estimada, modalidad, complejidad, duracion_semestres, porcentaje_avance) VALUES
('Blockchain para Trazabilidad Agrícola',
'Sistema blockchain Ethereum para trazabilidad. Smart contracts con Solidity. Frontend React. ICINF 2 semestres.',
9, '19111111-1', 7, DATE_SUB(NOW(), INTERVAL 150 DAY), DATE_ADD(NOW(), INTERVAL 210 DAY), 'investigacion', 'alta', 2, 45);

INSERT INTO estudiantes_proyectos (proyecto_id, estudiante_rut, es_creador, orden) VALUES
(4, '19111111-1', 1, 1);

-- Asignaciones de profesores a proyectos adicionales
INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, activo, asignado_por) VALUES
(4, '16456789-0', 2, DATE_SUB(NOW(), INTERVAL 145 DAY), TRUE, '18765432-1'),
(4, '16567890-1', 4, DATE_SUB(NOW(), INTERVAL 145 DAY), TRUE, '18765432-1');

-- Notificaciones de proyectos
INSERT INTO notificaciones_proyecto (proyecto_id, destinatario_rut, tipo_notificacion, rol_destinatario, titulo, mensaje, leida) VALUES
(1, '20987654-3', 'fecha_limite_proxima', 'estudiante', 'Entrega Próxima', 'Recordatorio: Entrega de Capítulo 1 en 15 días', 0),
(1, '16234567-8', 'fecha_limite_proxima', 'profesor_guia', 'Entrega Próxima', 'El estudiante Sebastián Flores tiene una entrega próxima', 0),
(2, '20876543-2', 'revision_pendiente', 'estudiante', 'Revisión Pendiente', 'Nuevo comentario del profesor en tu proyecto', 1),
(2, '20765432-1', 'revision_pendiente', 'estudiante', 'Revisión Pendiente', 'Nuevo comentario del profesor en tu proyecto', 1),
(3, '21098765-4', 'fecha_limite_proxima', 'estudiante', 'Reunión Confirmada', 'Reunión confirmada para el 08/01/2026 a las 14:00', 1),
(4, '19111111-1', 'cronograma_modificado', 'estudiante', 'Proyecto Pausado', 'Tu proyecto ha sido pausado temporalmente', 1);

-- Fechas globales (sin proyecto_id)
INSERT INTO fechas (titulo, descripcion, fecha, tipo_fecha, creado_por_rut, es_global, activa) VALUES
('Inicio Período Académico 2026-1', 'Inicio del primer semestre 2026', '2026-03-01', 'academica', '18765432-1', 1, 1),
('Fin Período Académico 2026-1', 'Fin del primer semestre 2026', '2026-07-31', 'academica', '18765432-1', 1, 1),
('Plazo Entrega Propuestas 2026-1', 'Fecha límite para entrega de propuestas', '2026-04-15', 'deadline', '18765432-1', 1, 1),
('Período de Defensas 2026-1', 'Período de defensas de trabajos de titulación', '2026-07-15', 'defensa', '18765432-1', 1, 1);

-- Más fechas para proyectos existentes
INSERT INTO fechas (titulo, descripcion, fecha, tipo_fecha, proyecto_id, creado_por_rut, es_global, activa) VALUES
('Revisión Capítulo 2', 'Revisión metodología', DATE_ADD(NOW(), INTERVAL 45 DAY), 'revision', 1, '16234567-8', 0, 1),
('Entrega Informe Final', 'Entrega del informe final completo', DATE_ADD(NOW(), INTERVAL 85 DAY), 'entrega', 1, '16234567-8', 0, 1),
('Revisión Sprint 2', 'Revisión segundo sprint', DATE_ADD(NOW(), INTERVAL 60 DAY), 'revision', 2, '16345678-9', 0, 1),
('Demo Módulo Evaluación', 'Demostración módulo de evaluación', DATE_ADD(NOW(), INTERVAL 90 DAY), 'hito', 2, '16345678-9', 0, 1),
('Entrega Hardware', 'Entrega documentación hardware', DATE_ADD(NOW(), INTERVAL 35 DAY), 'entrega', 3, '16678901-2', 0, 1),
('Revisión Smart Contracts', 'Revisión implementación contratos', DATE_ADD(NOW(), INTERVAL 30 DAY), 'revision', 4, '16456789-0', 0, 1);

-- Más solicitudes de reunión con diferentes estados
INSERT INTO solicitudes_reunion (proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta, hora_propuesta, tipo_reunion, descripcion, estado, creado_por) VALUES
(1, '16345678-9', '20987654-3', DATE_ADD(NOW(), INTERVAL 8 DAY), '11:00:00', 'revision_avance', 'Revisión pre-entrega Capítulo 1', 'pendiente', 'estudiante'),
(2, '16345678-9', '20876543-2', DATE_ADD(NOW(), INTERVAL 10 DAY), '15:00:00', 'seguimiento', 'Avance desarrollo módulo IA', 'pendiente', 'estudiante'),
(2, '16456789-0', '20876543-2', DATE_ADD(NOW(), INTERVAL 6 DAY), '14:00:00', 'revision_avance', 'Revisión arquitectura sistema', 'aceptada_profesor', 'estudiante'),
(3, '16678901-2', '21098765-4', DATE_SUB(NOW(), INTERVAL 5 DAY), '10:00:00', 'seguimiento', 'Revisión calibración sensores', 'confirmada', 'estudiante'),
(4, '16456789-0', '19111111-1', DATE_ADD(NOW(), INTERVAL 4 DAY), '09:00:00', 'seguimiento', 'Estado del proyecto pausado', 'pendiente', 'profesor'),
(1, '16234567-8', '20987654-3', DATE_SUB(NOW(), INTERVAL 10 DAY), '09:00:00', 'revision_avance', 'Revisión avance inicial', 'confirmada', 'estudiante');

-- Más disponibilidad horaria para todos los profesores
INSERT INTO disponibilidad_horarios (usuario_rut, dia_semana, hora_inicio, hora_fin, activo) VALUES
('16234567-8', 'martes', '10:00:00', '12:00:00', 1),
('16234567-8', 'jueves', '09:00:00', '11:00:00', 1),
('16345678-9', 'miercoles', '14:00:00', '16:00:00', 1),
('16456789-0', 'lunes', '09:00:00', '11:00:00', 1),
('16456789-0', 'viernes', '15:00:00', '17:00:00', 1),
('16567890-1', 'martes', '11:00:00', '13:00:00', 1),
('16567890-1', 'jueves', '14:00:00', '16:00:00', 1),
('16678901-2', 'lunes', '15:00:00', '17:00:00', 1),
('16678901-2', 'viernes', '10:00:00', '12:00:00', 1);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

-- Verificación
SELECT 'Datos de prueba insertados correctamente' AS Resultado;
SELECT 
    (SELECT COUNT(*) FROM usuarios) AS Usuarios,
    (SELECT COUNT(*) FROM propuestas) AS Propuestas,
    (SELECT COUNT(*) FROM proyectos) AS Proyectos,
    (SELECT COUNT(*) FROM asignaciones_proyectos) AS Asignaciones,
    (SELECT COUNT(*) FROM fechas) AS Fechas,
    (SELECT COUNT(*) FROM solicitudes_reunion) AS Reuniones,
    (SELECT COUNT(*) FROM notificaciones_proyecto) AS Notificaciones;
