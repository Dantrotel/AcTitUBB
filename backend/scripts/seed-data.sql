-- ============================================
-- SCRIPT DE DATOS FICTICIOS COHERENTES
-- Sistema de Gestión de Titulación UBB
-- ============================================
-- IMPORTANTE: Este script respeta los datos iniciales creados por database.sql
-- Solo limpia tablas de datos de negocio, NO tablas de configuración (roles, estados)
-- ============================================

-- Limpiar datos existentes (en orden inverso por dependencias)
-- NO se limpian: roles, estados_propuestas, estados_proyectos (datos de configuración)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE notificaciones;
TRUNCATE TABLE mensajes_chat;
TRUNCATE TABLE solicitudes_reunion;
TRUNCATE TABLE disponibilidad_horarios;
TRUNCATE TABLE fechas_importantes;
TRUNCATE TABLE asignaciones_proyectos;
TRUNCATE TABLE estudiantes_proyecto;
TRUNCATE TABLE proyectos;
TRUNCATE TABLE asignaciones_propuestas;
TRUNCATE TABLE propuestas;
TRUNCATE TABLE colaboradores_externos;
TRUNCATE TABLE entidades_externas;
TRUNCATE TABLE usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN DE DATOS INICIALES
-- ============================================
-- Estos datos deben existir (creados por database.sql)
-- Solo verificamos, NO los creamos aquí

SELECT 'Verificando datos iniciales...' AS Info;

-- Verificar que existen los roles
SELECT COUNT(*) AS roles_count FROM roles;
-- Debe ser 4: estudiante(1), profesor(2), admin(3), superadmin(4)

-- Verificar que existen los estados de propuestas  
SELECT COUNT(*) AS estados_propuestas_count FROM estados_propuestas;
-- Debe ser 5: pendiente, en_revision, correcciones, aprobada, rechazada

-- Verificar que existen los estados de proyectos
SELECT COUNT(*) AS estados_proyectos_count FROM estados_proyectos;
-- Debe ser 14 estados diferentes

-- ============================================
-- 1. USUARIOS
-- ============================================

-- Super Admin (contraseña: Admin123!)
INSERT INTO usuarios (rut, nombre, apellido_paterno, apellido_materno, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('11111111-1', 'Carlos', 'Rodríguez', 'Silva', 'admin@ubiobio.cl', '$2b$10$xB5r7KQYGvN8hYZ4kQ7IQeE5yL9mH6pR3tW8xD2cF4jK7mN9qT0sA', 4, 1, 0);

-- Administradores (contraseña: Admin123!)
INSERT INTO usuarios (rut, nombre, apellido_paterno, apellido_materno, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
('22222222-2', 'María', 'González', 'López', 'admin2@ubiobio.cl', '$2b$10$xB5r7KQYGvN8hYZ4kQ7IQeE5yL9mH6pR3tW8xD2cF4jK7mN9qT0sA', 3, 1, 0),
('33333333-3', 'Pedro', 'Martínez', 'Fernández', 'admin3@ubiobio.cl', '$2b$10$xB5r7KQYGvN8hYZ4kQ7IQeE5yL9mH6pR3tW8xD2cF4jK7mN9qT0sA', 3, 1, 0);

-- Profesores (contraseña: Profe123!)
INSERT INTO usuarios (rut, nombre, apellido_paterno, apellido_materno, email, password, rol_id, confirmado, debe_cambiar_password, titulo_profesional, grado_academico, area_especializacion, anos_experiencia) VALUES
('12345678-9', 'Roberto', 'Sánchez', 'Castro', 'rsanchez@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0, 'Ingeniero Civil en Informática', 'Doctor en Ciencias de la Computación', 'Inteligencia Artificial', 15),
('23456789-0', 'Ana', 'Ramírez', 'Torres', 'aramirez@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0, 'Ingeniera en Computación', 'Magíster en Ingeniería de Software', 'Desarrollo Web', 10),
('34567890-1', 'Luis', 'Pérez', 'Morales', 'lperez@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0, 'Ingeniero Civil Industrial', 'Doctor en Gestión de Proyectos', 'Bases de Datos', 12),
('45678901-2', 'Carmen', 'Vargas', 'Díaz', 'cvargas@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0, 'Ingeniera en Informática', 'Magíster en Ciberseguridad', 'Seguridad Informática', 8),
('56789012-3', 'Jorge', 'Muñoz', 'Rojas', 'jmunoz@ubiobio.cl', '$2b$10$yC6s8LRZHwO9iZA5lR8JRfF6zM0nI7qS4uX9yE3dG5kL8nO0rU1tB', 2, 1, 0, 'Ingeniero Civil en Computación', 'Magíster en Redes y Telecomunicaciones', 'Redes de Computadores', 11);

-- Estudiantes (contraseña: Estudiante123!)
INSERT INTO usuarios (rut, nombre, apellido_paterno, apellido_materno, email, password, rol_id, confirmado, debe_cambiar_password, carrera, nivel_academico, semestre_ingreso) VALUES
('19876543-2', 'Sebastián', 'Flores', 'Gutiérrez', 'sflores2019@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0, 'Ingeniería Civil en Informática', 'Pregrado', '2019-1'),
('19876543-3', 'Valentina', 'Ortiz', 'Núñez', 'vortiz2019@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0, 'Ingeniería en Computación', 'Pregrado', '2019-1'),
('20123456-7', 'Diego', 'Castro', 'Bravo', 'dcastro2020@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0, 'Ingeniería Civil en Informática', 'Pregrado', '2020-1'),
('20234567-8', 'Camila', 'Reyes', 'Soto', 'creyes2020@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0, 'Ingeniería en Informática', 'Pregrado', '2020-1'),
('20345678-9', 'Matías', 'Silva', 'Pinto', 'msilva2020@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0, 'Ingeniería Civil en Informática', 'Pregrado', '2020-2'),
('20456789-0', 'Francisca', 'Morales', 'Herrera', 'fmorales2020@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0, 'Ingeniería en Computación', 'Pregrado', '2020-2'),
('21123456-7', 'Nicolás', 'Vega', 'Contreras', 'nvega2021@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0, 'Ingeniería Civil en Informática', 'Pregrado', '2021-1'),
('21234567-8', 'Sofía', 'Campos', 'Valdés', 'scampos2021@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0, 'Ingeniería en Informática', 'Pregrado', '2021-1'),
('21345678-9', 'Benjamín', 'Riquelme', 'Espinoza', 'briquelme2021@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0, 'Ingeniería en Computación', 'Pregrado', '2021-2'),
('21456789-0', 'Martina', 'Fuentes', 'Cortés', 'mfuentes2021@egresados.ubiobio.cl', '$2b$10$zD7t9MSAIxP0jAB6mS9KSgG7aO1pJ8rT5vY0zF4eH6lM9oP1sV2uC', 1, 1, 0, 'Ingeniería Civil en Informática', 'Pregrado', '2021-2');

-- ============================================
-- 2. ENTIDADES EXTERNAS
-- ============================================

INSERT INTO entidades_externas (nombre, razon_social, rut_empresa, tipo, email_contacto, telefono, direccion, sitio_web, area_actividad, descripcion, activo) VALUES
('TechSolutions SpA', 'TechSolutions Servicios Informáticos SpA', '76123456-7', 'empresa', 'contacto@techsolutions.cl', '+56412345678', 'Av. Collao 1202, Concepción', 'https://techsolutions.cl', 'Desarrollo de Software', 'Empresa líder en desarrollo de software a medida y consultoría tecnológica.', 1),
('DataAnalytics Chile', 'DataAnalytics Chile Limitada', '76234567-8', 'empresa', 'info@dataanalytics.cl', '+56423456789', 'Barros Arana 456, Concepción', 'https://dataanalytics.cl', 'Análisis de Datos', 'Especialistas en Big Data, Machine Learning y Business Intelligence.', 1),
('Fundación Innovación Social', 'Fundación para la Innovación Social', '65345678-9', 'ong', 'contacto@innovacionsocial.cl', '+56434567890', 'O\'Higgins 789, Chillán', 'https://innovacionsocial.cl', 'Tecnología Social', 'ONG enfocada en proyectos de tecnología para el desarrollo social.', 1),
('CloudServices SA', 'CloudServices Infraestructura SA', '76456789-0', 'empresa', 'ventas@cloudservices.cl', '+56445678901', 'Freire 123, Concepción', 'https://cloudservices.cl', 'Cloud Computing', 'Proveedor de servicios de infraestructura cloud y DevOps.', 1),
('Universidad del Bío-Bío', 'Universidad del Bío-Bío', '60810000-8', 'institucion', 'vinculacion@ubiobio.cl', '+56422463000', 'Av. Collao 1202, Concepción', 'https://www.ubiobio.cl', 'Educación Superior', 'Casa de estudios superiores con vinculación al medio.', 1),
('CyberSecure Chile', 'CyberSecure Seguridad Informática Ltda', '76567890-1', 'empresa', 'contacto@cybersecure.cl', '+56456789012', 'Caupolicán 567, Concepción', 'https://cybersecure.cl', 'Ciberseguridad', 'Empresa especializada en auditorías de seguridad y pentesting.', 1),
('GobiernoBíoBío', 'Gobierno Regional del Bío-Bío', '61602000-4', 'gobierno', 'innovacion@gorebiobio.cl', '+56423272000', 'Castellón 444, Concepción', 'https://www.gorebiobio.cl', 'Administración Pública', 'Institución pública enfocada en el desarrollo regional.', 1),
('StartupHub Concepción', 'StartupHub Concepción SpA', '76678901-2', 'empresa', 'hola@startuphub.cl', '+56467890123', 'Freire 890, Concepción', 'https://startuphub.cl', 'Emprendimiento', 'Incubadora y aceleradora de startups tecnológicas.', 1);

-- ============================================
-- 3. COLABORADORES EXTERNOS
-- ============================================

INSERT INTO colaboradores_externos (entidad_id, nombre_completo, rut, email, telefono, cargo, tipo_colaborador, area_departamento, especialidad, anos_experiencia, linkedin, biografia, observaciones, verificado, activo) VALUES
-- TechSolutions SpA
(1, 'Fernando Campos Osorio', '15123456-7', 'fcampos@techsolutions.cl', '+56987654321', 'Gerente de Desarrollo', 'supervisor', 'Desarrollo de Software', 'Arquitectura de Software', 18, 'https://linkedin.com/in/fcampos', 'Ingeniero Civil en Informática con más de 18 años de experiencia liderando equipos de desarrollo en proyectos complejos.', 'Excelente supervisor para proyectos de arquitectura y desarrollo full-stack.', 1, 1),
(1, 'Patricia Muñoz Bravo', '16234567-8', 'pmunoz@techsolutions.cl', '+56987654322', 'Senior Developer', 'asesor', 'Desarrollo Web', 'Frontend Development', 10, 'https://linkedin.com/in/pmunoz', 'Desarrolladora especializada en React, Angular y tecnologías frontend modernas.', 'Ideal para asesoría técnica en proyectos web.', 1, 1),

-- DataAnalytics Chile
(2, 'Ricardo Soto Valenzuela', '14345678-9', 'rsoto@dataanalytics.cl', '+56987654323', 'Data Science Lead', 'mentor', 'Ciencia de Datos', 'Machine Learning', 15, 'https://linkedin.com/in/rsoto', 'PhD en Ciencias de la Computación, especialista en ML y análisis predictivo.', 'Mentor excepcional para proyectos de IA y análisis de datos.', 1, 1),
(2, 'Elena Rojas Pizarro', '17456789-0', 'erojas@dataanalytics.cl', '+56987654324', 'Business Intelligence Manager', 'asesor', 'BI y Reportes', 'Visualización de Datos', 12, 'https://linkedin.com/in/erojas', 'Experta en Power BI, Tableau y desarrollo de dashboards ejecutivos.', 'Buena para proyectos de visualización y reportería.', 1, 1),

-- Fundación Innovación Social
(3, 'Marcelo Torres Guzmán', '13567890-1', 'mtorres@innovacionsocial.cl', '+56987654325', 'Director de Proyectos', 'supervisor', 'Gestión de Proyectos', 'Tecnología Social', 20, 'https://linkedin.com/in/mtorres', 'Sociólogo con maestría en Gestión de Proyectos Tecnológicos. Amplia experiencia en proyectos de impacto social.', 'Excelente para proyectos con enfoque social y comunitario.', 1, 1),

-- CloudServices SA
(4, 'Andrea Silva Bustamante', '18678901-2', 'asilva@cloudservices.cl', '+56987654326', 'Cloud Architect', 'asesor', 'Infraestructura Cloud', 'AWS y Azure', 14, 'https://linkedin.com/in/asilva', 'Arquitecta cloud certificada en AWS y Azure. Especialista en microservicios y DevOps.', 'Ideal para proyectos de infraestructura cloud.', 1, 1),
(4, 'Cristian Vega Henríquez', '16789012-3', 'cvega@cloudservices.cl', '+56987654327', 'DevOps Engineer', 'asesor', 'DevOps', 'CI/CD y Automatización', 9, 'https://linkedin.com/in/cvega', 'Ingeniero especializado en pipelines CI/CD, Docker, Kubernetes y automatización.', 'Bueno para proyectos que requieran automatización.', 1, 1),

-- CyberSecure Chile
(6, 'Rodrigo Espinoza Núñez', '15890123-4', 'respinoza@cybersecure.cl', '+56987654328', 'Security Consultant', 'revisor', 'Seguridad Informática', 'Pentesting', 16, 'https://linkedin.com/in/respinoza', 'Consultor de seguridad certificado CEH y OSCP. Experto en auditorías de seguridad.', 'Revisor técnico para aspectos de seguridad.', 1, 1),

-- GobiernoBíoBío
(7, 'Claudia Contreras Parra', '14901234-5', 'ccontreras@gorebiobio.cl', '+56987654329', 'Jefa de Innovación Digital', 'mentor', 'Transformación Digital', 'Gestión Pública Digital', 13, 'https://linkedin.com/in/ccontreras', 'Administradora pública con especialización en gobierno digital y transformación tecnológica del sector público.', 'Mentora para proyectos de e-government.', 1, 1),

-- StartupHub Concepción
(8, 'Pablo Reyes Salazar', '17012345-6', 'preyes@startuphub.cl', '+56987654330', 'Innovation Manager', 'mentor', 'Emprendimiento', 'Startups Tecnológicas', 11, 'https://linkedin.com/in/preyes', 'Emprendedor serial y mentor de startups. Ha fundado 3 empresas tecnológicas exitosas.', 'Mentor ideal para proyectos con enfoque emprendedor.', 1, 1);

-- ============================================
-- 4. PROPUESTAS
-- ============================================

INSERT INTO propuestas (titulo, descripcion, estudiante_rut, estado_id, fecha_envio, archivo) VALUES
-- Propuestas aprobadas (estado 4)
('Sistema de Gestión de Inventario con Machine Learning', 
'Desarrollo de un sistema web para gestión de inventario que utiliza algoritmos de ML para predecir la demanda y optimizar el stock. Incluye dashboard interactivo y sistema de alertas automatizadas.',
'19876543-2', 4, DATE_SUB(NOW(), INTERVAL 90 DAY), 'propuesta_inventario_ml.pdf'),

('Plataforma de E-Learning Adaptativo',
'Plataforma educativa que se adapta al ritmo de aprendizaje del estudiante usando IA. Incluye sistema de evaluación automática, foros de discusión y gamificación.',
'19876543-3', 4, DATE_SUB(NOW(), INTERVAL 85 DAY), 'propuesta_elearning.pdf'),

('App Móvil de Telemedicina para Zonas Rurales',
'Aplicación móvil multiplataforma para conectar pacientes de zonas rurales con profesionales de la salud. Incluye videoconferencias, recetas digitales y historial médico.',
'20123456-7', 4, DATE_SUB(NOW(), INTERVAL 80 DAY), 'propuesta_telemedicina.pdf'),

('Sistema de Monitoreo Ambiental IoT',
'Red de sensores IoT para monitoreo en tiempo real de variables ambientales (temperatura, humedad, calidad del aire). Dashboard web con visualización de datos históricos.',
'20234567-8', 4, DATE_SUB(NOW(), INTERVAL 75 DAY), 'propuesta_iot_ambiental.pdf'),

-- Propuestas en revisión (estado 2)
('Blockchain para Trazabilidad de Productos Agrícolas',
'Sistema basado en blockchain para garantizar la trazabilidad de productos agrícolas desde el campo hasta el consumidor final. Incluye app móvil para agricultores y consumidores.',
'20345678-9', 2, DATE_SUB(NOW(), INTERVAL 15 DAY), 'propuesta_blockchain_agricola.pdf'),

('Asistente Virtual con Procesamiento de Lenguaje Natural',
'Chatbot inteligente para atención al cliente usando NLP y transformers. Integración con sistemas CRM y bases de conocimiento.',
'20456789-0', 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 'propuesta_chatbot_nlp.pdf'),

-- Propuestas pendientes (estado 1)
('Sistema de Gestión de Torneos Deportivos',
'Plataforma web y móvil para organizar y gestionar torneos deportivos. Incluye brackets automáticos, livestreaming y estadísticas en tiempo real.',
'21123456-7', 1, DATE_SUB(NOW(), INTERVAL 5 DAY), 'propuesta_torneos.pdf'),

('Marketplace de Servicios Profesionales',
'Plataforma que conecta profesionales freelance con clientes. Sistema de pagos integrado, reviews, y gestión de proyectos.',
'21234567-8', 1, DATE_SUB(NOW(), INTERVAL 3 DAY), 'propuesta_marketplace.pdf');

-- ============================================
-- 5. ASIGNACIONES DE PROPUESTAS (Revisores)
-- ============================================

INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut, tipo_asignacion, fecha_asignacion, fecha_revision, comentarios) VALUES
-- Propuesta 1: Sistema de Inventario ML
(1, '12345678-9', 'guia', DATE_SUB(NOW(), INTERVAL 88 DAY), DATE_SUB(NOW(), INTERVAL 87 DAY), 'Excelente propuesta. El enfoque de ML para predicción de demanda es innovador. Aprobado para continuar como proyecto.'),
(1, '23456789-0', 'informante', DATE_SUB(NOW(), INTERVAL 88 DAY), DATE_SUB(NOW(), INTERVAL 87 DAY), 'Propuesta técnicamente sólida. El stack tecnológico propuesto es adecuado.'),

-- Propuesta 2: E-Learning Adaptativo
(2, '23456789-0', 'guia', DATE_SUB(NOW(), INTERVAL 83 DAY), DATE_SUB(NOW(), INTERVAL 82 DAY), 'Proyecto muy completo. La gamificación y adaptación al estudiante son puntos fuertes. Aprobado.'),
(2, '34567890-1', 'informante', DATE_SUB(NOW(), INTERVAL 83 DAY), DATE_SUB(NOW(), INTERVAL 82 DAY), 'Buena arquitectura de base de datos propuesta. Sugiero considerar escalabilidad.'),

-- Propuesta 3: Telemedicina
(3, '34567890-1', 'guia', DATE_SUB(NOW(), INTERVAL 78 DAY), DATE_SUB(NOW(), INTERVAL 77 DAY), 'Proyecto con gran impacto social. Cumple con todos los requisitos técnicos. Aprobado.'),
(3, '45678901-2', 'informante', DATE_SUB(NOW(), INTERVAL 78 DAY), DATE_SUB(NOW(), INTERVAL 77 DAY), 'Importante considerar aspectos de seguridad y privacidad de datos médicos. Con esas consideraciones, aprobado.'),

-- Propuesta 4: Monitoreo Ambiental IoT
(4, '56789012-3', 'guia', DATE_SUB(NOW(), INTERVAL 73 DAY), DATE_SUB(NOW(), INTERVAL 72 DAY), 'Excelente integración de hardware y software. El protocolo de comunicación propuesto es adecuado. Aprobado.'),
(4, '12345678-9', 'informante', DATE_SUB(NOW(), INTERVAL 73 DAY), DATE_SUB(NOW(), INTERVAL 72 DAY), 'Propuesta bien fundamentada. El análisis de datos históricos añade valor.'),

-- Propuesta 5: Blockchain Agrícola (en revisión)
(5, '12345678-9', 'guia', DATE_SUB(NOW(), INTERVAL 14 DAY), NULL, NULL),
(5, '56789012-3', 'informante', DATE_SUB(NOW(), INTERVAL 14 DAY), NULL, NULL),

-- Propuesta 6: Chatbot NLP (en revisión)
(6, '23456789-0', 'guia', DATE_SUB(NOW(), INTERVAL 9 DAY), NULL, NULL),
(6, '45678901-2', 'informante', DATE_SUB(NOW(), INTERVAL 9 DAY), NULL, NULL);

-- ============================================
-- 6. PROYECTOS
-- ============================================

INSERT INTO proyectos (titulo, descripcion, propuesta_id, estudiante_rut, estado_id, fecha_inicio, fecha_entrega_estimada) VALUES
('Sistema de Gestión de Inventario con Machine Learning',
'Sistema web desarrollado con React y Node.js que implementa algoritmos de regresión y series temporales para predicción de demanda. Base de datos PostgreSQL y despliegue en AWS.',
1, '19876543-2', 1, DATE_SUB(NOW(), INTERVAL 85 DAY), DATE_ADD(NOW(), INTERVAL 95 DAY)),

('Plataforma de E-Learning Adaptativo',
'Plataforma desarrollada con Angular y Django. Algoritmos de IA implementados con TensorFlow para adaptación del contenido. Base de datos MongoDB.',
2, '19876543-3', 1, DATE_SUB(NOW(), INTERVAL 80 DAY), DATE_ADD(NOW(), INTERVAL 100 DAY)),

('App Móvil de Telemedicina para Zonas Rurales',
'Aplicación multiplataforma desarrollada con React Native. Backend en Node.js con Express. Videoconferencias con WebRTC. Firebase para notificaciones push.',
3, '20123456-7', 1, DATE_SUB(NOW(), INTERVAL 75 DAY), DATE_ADD(NOW(), INTERVAL 105 DAY)),

('Sistema de Monitoreo Ambiental IoT',
'Red de sensores ESP32 con comunicación MQTT. Backend en Python con FastAPI. Dashboard web con Vue.js y Chart.js. Base de datos TimescaleDB.',
4, '20234567-8', 1, DATE_SUB(NOW(), INTERVAL 70 DAY), DATE_ADD(NOW(), INTERVAL 110 DAY));

-- ============================================
-- 7. ESTUDIANTES_PROYECTO (relación N:M)
-- ============================================

INSERT INTO estudiantes_proyecto (proyecto_id, estudiante_rut, rol_estudiante, fecha_incorporacion) VALUES
(1, '19876543-2', 'titular', DATE_SUB(NOW(), INTERVAL 85 DAY)),
(2, '19876543-3', 'titular', DATE_SUB(NOW(), INTERVAL 80 DAY)),
(3, '20123456-7', 'titular', DATE_SUB(NOW(), INTERVAL 75 DAY)),
(4, '20234567-8', 'titular', DATE_SUB(NOW(), INTERVAL 70 DAY));

-- ============================================
-- 8. ASIGNACIONES DE PROFESORES A PROYECTOS
-- ============================================

INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor, fecha_asignacion) VALUES
-- Proyecto 1: Inventario ML
(1, '12345678-9', 'guia', DATE_SUB(NOW(), INTERVAL 85 DAY)),
(1, '23456789-0', 'informante', DATE_SUB(NOW(), INTERVAL 85 DAY)),
(1, '15123456-7', 'colaborador_externo', DATE_SUB(NOW(), INTERVAL 80 DAY)), -- Fernando Campos (TechSolutions)

-- Proyecto 2: E-Learning
(2, '23456789-0', 'guia', DATE_SUB(NOW(), INTERVAL 80 DAY)),
(2, '34567890-1', 'informante', DATE_SUB(NOW(), INTERVAL 80 DAY)),
(2, '16234567-8', 'colaborador_externo', DATE_SUB(NOW(), INTERVAL 75 DAY)), -- Patricia Muñoz (TechSolutions)

-- Proyecto 3: Telemedicina
(3, '34567890-1', 'guia', DATE_SUB(NOW(), INTERVAL 75 DAY)),
(3, '45678901-2', 'informante', DATE_SUB(NOW(), INTERVAL 75 DAY)),
(3, '13567890-1', 'colaborador_externo', DATE_SUB(NOW(), INTERVAL 70 DAY)), -- Marcelo Torres (Fundación)

-- Proyecto 4: IoT Ambiental
(4, '56789012-3', 'guia', DATE_SUB(NOW(), INTERVAL 70 DAY)),
(4, '12345678-9', 'informante', DATE_SUB(NOW(), INTERVAL 70 DAY)),
(4, '18678901-2', 'colaborador_externo', DATE_SUB(NOW(), INTERVAL 65 DAY)); -- Andrea Silva (CloudServices)

-- ============================================
-- 9. FECHAS IMPORTANTES
-- ============================================

INSERT INTO fechas_importantes (proyecto_id, titulo, descripcion, fecha, tipo, recordatorio, creado_por) VALUES
-- Proyecto 1
(1, 'Entrega Capítulo 1', 'Entrega del marco teórico y estado del arte', DATE_ADD(NOW(), INTERVAL 15 DAY), 'entrega', 1, '12345678-9'),
(1, 'Reunión de Avance', 'Presentación del avance del modelo de ML', DATE_ADD(NOW(), INTERVAL 30 DAY), 'reunion', 1, '12345678-9'),
(1, 'Entrega Prototipo', 'Demostración del prototipo funcional', DATE_ADD(NOW(), INTERVAL 60 DAY), 'entrega', 1, '12345678-9'),
(1, 'Defensa Final', 'Presentación y defensa del trabajo de titulación', DATE_ADD(NOW(), INTERVAL 95 DAY), 'hito', 1, '12345678-9'),

-- Proyecto 2
(2, 'Revisión Arquitectura', 'Validación de la arquitectura del sistema', DATE_ADD(NOW(), INTERVAL 20 DAY), 'revision', 1, '23456789-0'),
(2, 'Entrega Módulo IA', 'Entrega del módulo de adaptación con IA', DATE_ADD(NOW(), INTERVAL 45 DAY), 'entrega', 1, '23456789-0'),
(2, 'Testing con Usuarios', 'Pruebas de usabilidad con usuarios reales', DATE_ADD(NOW(), INTERVAL 70 DAY), 'hito', 1, '23456789-0'),
(2, 'Entrega Final', 'Entrega del informe final y defensa', DATE_ADD(NOW(), INTERVAL 100 DAY), 'hito', 1, '23456789-0'),

-- Proyecto 3
(3, 'Aprobación Ética', 'Revisión del comité de ética por manejo de datos médicos', DATE_ADD(NOW(), INTERVAL 10 DAY), 'otro', 1, '34567890-1'),
(3, 'Demo Videoconferencias', 'Demostración del módulo de videoconferencias', DATE_ADD(NOW(), INTERVAL 35 DAY), 'entrega', 1, '34567890-1'),
(3, 'Piloto en Terreno', 'Prueba piloto en comunidad rural', DATE_ADD(NOW(), INTERVAL 75 DAY), 'hito', 1, '34567890-1'),

-- Proyecto 4
(4, 'Instalación Sensores', 'Instalación de la red de sensores en campus', DATE_ADD(NOW(), INTERVAL 25 DAY), 'hito', 1, '56789012-3'),
(4, 'Calibración Sistema', 'Calibración y validación de mediciones', DATE_ADD(NOW(), INTERVAL 50 DAY), 'revision', 1, '56789012-3'),
(4, 'Presentación Resultados', 'Presentación de análisis de datos recopilados', DATE_ADD(NOW(), INTERVAL 90 DAY), 'entrega', 1, '56789012-3');

-- ============================================
-- 10. DISPONIBILIDAD HORARIOS (Profesores)
-- ============================================

INSERT INTO disponibilidad_horarios (profesor_rut, dia_semana, hora_inicio, hora_fin, modalidad, disponible) VALUES
-- Profesor Roberto Sánchez (12345678-9)
('12345678-9', 'lunes', '09:00:00', '11:00:00', 'presencial', 1),
('12345678-9', 'lunes', '15:00:00', '17:00:00', 'virtual', 1),
('12345678-9', 'miercoles', '10:00:00', '12:00:00', 'presencial', 1),
('12345678-9', 'viernes', '14:00:00', '16:00:00', 'virtual', 1),

-- Profesora Ana Ramírez (23456789-0)
('23456789-0', 'lunes', '11:00:00', '13:00:00', 'virtual', 1),
('23456789-0', 'martes', '09:00:00', '11:00:00', 'presencial', 1),
('23456789-0', 'jueves', '15:00:00', '17:00:00', 'presencial', 1),
('23456789-0', 'viernes', '10:00:00', '12:00:00', 'virtual', 1),

-- Profesor Luis Pérez (34567890-1)
('34567890-1', 'martes', '14:00:00', '16:00:00', 'presencial', 1),
('34567890-1', 'miercoles', '09:00:00', '11:00:00', 'virtual', 1),
('34567890-1', 'jueves', '11:00:00', '13:00:00', 'presencial', 1),

-- Profesora Carmen Vargas (45678901-2)
('45678901-2', 'lunes', '10:00:00', '12:00:00', 'virtual', 1),
('45678901-2', 'miercoles', '15:00:00', '17:00:00', 'presencial', 1),
('45678901-2', 'viernes', '09:00:00', '11:00:00', 'presencial', 1),

-- Profesor Jorge Muñoz (56789012-3)
('56789012-3', 'martes', '10:00:00', '12:00:00', 'presencial', 1),
('56789012-3', 'miercoles', '14:00:00', '16:00:00', 'virtual', 1),
('56789012-3', 'jueves', '09:00:00', '11:00:00', 'virtual', 1);

-- ============================================
-- 11. SOLICITUDES DE REUNIÓN
-- ============================================

INSERT INTO solicitudes_reunion (estudiante_rut, profesor_rut, fecha_solicitada, hora_inicio, hora_fin, tipo_reunion, descripcion, estado, modalidad, fecha_solicitud) VALUES
-- Reuniones confirmadas (pasadas)
('19876543-2', '12345678-9', DATE_SUB(NOW(), INTERVAL 7 DAY), '10:00:00', '11:00:00', 'seguimiento', 'Revisión de avances del modelo de predicción', 'realizada', 'presencial', DATE_SUB(NOW(), INTERVAL 14 DAY)),
('19876543-3', '23456789-0', DATE_SUB(NOW(), INTERVAL 5 DAY), '15:00:00', '16:00:00', 'revision_avance', 'Revisión de la arquitectura del sistema', 'realizada', 'virtual', DATE_SUB(NOW(), INTERVAL 12 DAY)),
('20123456-7', '34567890-1', DATE_SUB(NOW(), INTERVAL 3 DAY), '11:00:00', '12:00:00', 'consultoria', 'Consultas sobre integración de WebRTC', 'realizada', 'presencial', DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- Reuniones confirmadas (futuras)
('20234567-8', '56789012-3', DATE_ADD(NOW(), INTERVAL 2 DAY), '14:00:00', '15:00:00', 'seguimiento', 'Revisión del protocolo de comunicación MQTT', 'confirmada', 'virtual', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('19876543-2', '12345678-9', DATE_ADD(NOW(), INTERVAL 5 DAY), '09:00:00', '10:00:00', 'revision_avance', 'Presentación de resultados preliminares', 'confirmada', 'presencial', NOW()),

-- Reuniones pendientes
('19876543-3', '23456789-0', DATE_ADD(NOW(), INTERVAL 7 DAY), '11:00:00', '12:00:00', 'consultoria', 'Consultas sobre algoritmos de adaptación', 'pendiente', 'virtual', NOW()),
('20123456-7', '34567890-1', DATE_ADD(NOW(), INTERVAL 10 DAY), '14:00:00', '15:00:00', 'seguimiento', 'Revisión de seguridad de datos médicos', 'pendiente', 'presencial', NOW());

-- ============================================
-- 12. MENSAJES CHAT (Simulando conversaciones)
-- ============================================

INSERT INTO mensajes_chat (emisor_rut, receptor_rut, mensaje, leido, fecha_envio) VALUES
-- Conversación Sebastián - Prof. Roberto (Proyecto Inventario ML)
('19876543-2', '12345678-9', 'Buenos días profesor, quisiera comentarle sobre el avance del modelo de predicción.', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('12345678-9', '19876543-2', 'Hola Sebastián, perfecto. ¿Qué métrica de error obtuviste?', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('19876543-2', '12345678-9', 'El RMSE está en 0.15, mejor de lo esperado. Adjunto los gráficos en el drive.', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('12345678-9', '19876543-2', 'Excelente resultado. Agenda una reunión para esta semana para revisar el informe.', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Conversación Valentina - Prof. Ana (Proyecto E-Learning)
('19876543-3', '23456789-0', 'Profesora, tengo dudas sobre la implementación del módulo de gamificación.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('23456789-0', '19876543-3', 'Hola Valentina, ¿qué aspecto específico te genera dudas?', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('19876543-3', '23456789-0', 'El sistema de badges y puntos. ¿Lo implemento en el backend o frontend?', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
('23456789-0', '19876543-3', 'Recomiendo que la lógica esté en el backend y el frontend solo visualice. Te paso ejemplos.', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Conversación Diego - Prof. Luis (Proyecto Telemedicina)
('20123456-7', '34567890-1', 'Profesor, logré implementar las videoconferencias con WebRTC!', 1, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
('34567890-1', '20123456-7', 'Felicitaciones Diego! ¿Probaste la calidad en conexiones lentas?', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('20123456-7', '34567890-1', 'Aún no, pero lo haré esta tarde. También quería consultarle sobre el cifrado de datos.', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- ============================================
-- 13. NOTIFICACIONES
-- ============================================

INSERT INTO notificaciones (usuario_rut, tipo, titulo, mensaje, leida, fecha_creacion, enlace) VALUES
-- Notificaciones para Sebastián (estudiante proyecto 1)
('19876543-2', 'fecha_importante', 'Próxima Entrega: Capítulo 1', 'Recuerda que tienes la entrega del Capítulo 1 en 15 días.', 0, NOW(), '/estudiante/proyecto/1'),
('19876543-2', 'reunion', 'Reunión Confirmada', 'Tu reunión con el Prof. Roberto Sánchez fue confirmada para el ' || DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 5 DAY), '%d/%m/%Y') || ' a las 09:00', 1, DATE_SUB(NOW(), INTERVAL 1 DAY), '/estudiante/reuniones'),
('19876543-2', 'sistema', 'Colaborador Externo Asignado', 'Se asignó a Fernando Campos (TechSolutions) como colaborador externo de tu proyecto.', 1, DATE_SUB(NOW(), INTERVAL 5 DAY), '/estudiante/proyecto/1'),

-- Notificaciones para Valentina (estudiante proyecto 2)
('19876543-3', 'mensaje', 'Nuevo Mensaje', 'Tienes un nuevo mensaje de la Prof. Ana Ramírez.', 0, DATE_SUB(NOW(), INTERVAL 1 DAY), '/chat'),
('19876543-3', 'fecha_importante', 'Próxima Revisión', 'Revisión de Arquitectura programada para dentro de 20 días.', 0, NOW(), '/estudiante/proyecto/2'),

-- Notificaciones para profesores
('12345678-9', 'reunion', 'Nueva Solicitud de Reunión', 'Sebastián Flores ha solicitado una reunión para el ' || DATE_FORMAT(DATE_ADD(NOW(), INTERVAL 5 DAY), '%d/%m/%Y'), 1, DATE_SUB(NOW(), INTERVAL 1 DAY), '/profesor/reuniones'),
('23456789-0', 'proyecto', 'Actualización en Proyecto', 'Valentina Ortiz subió nuevos archivos al repositorio del proyecto.', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR), '/profesor/proyectos/2'),
('34567890-1', 'mensaje', 'Nuevo Mensaje', 'Diego Castro te ha enviado un mensaje.', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR), '/chat');

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Verificación de datos insertados
SELECT 'Datos ficticios insertados correctamente' AS Resultado;
SELECT 
    (SELECT COUNT(*) FROM usuarios) AS Usuarios,
    (SELECT COUNT(*) FROM entidades_externas) AS Entidades,
    (SELECT COUNT(*) FROM colaboradores_externos) AS Colaboradores,
    (SELECT COUNT(*) FROM propuestas) AS Propuestas,
    (SELECT COUNT(*) FROM proyectos) AS Proyectos,
    (SELECT COUNT(*) FROM asignaciones_proyectos) AS Asignaciones,
    (SELECT COUNT(*) FROM fechas_importantes) AS FechasImportantes,
    (SELECT COUNT(*) FROM solicitudes_reunion) AS Reuniones,
    (SELECT COUNT(*) FROM mensajes_chat) AS Mensajes,
    (SELECT COUNT(*) FROM notificaciones) AS Notificaciones;

