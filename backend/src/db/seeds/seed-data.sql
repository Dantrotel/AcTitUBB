-- ============================================
-- SEED DATA - DATOS DE PRUEBA COHERENTES
-- Sistema de Gestión de Titulación - AcTitUBB
-- Universidad del Bío-Bío
-- ============================================
-- Compatible con database.sql (versión actual)
-- Contraseña para TODOS los usuarios: 1234
-- Hash bcrypt (rounds=10): $2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe
-- ============================================
-- IMPORTANTE:
--   • Este script LIMPIA y REPONE datos de prueba.
--   • NO modifica tablas de configuración del sistema:
--     roles, estados_propuestas, estados_proyectos,
--     roles_profesores, configuracion_sistema, configuracion_matching,
--     dias_feriados, periodos_propuestas.
--   • Los usuarios base (11111111-1 … 44444444-4) son recreados
--     con los mismos RUT que database.sql.
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- LIMPIEZA DE DATOS (orden no importa con FK checks OFF)
-- ============================================
TRUNCATE TABLE mensajes_no_leidos;
TRUNCATE TABLE mensajes;
TRUNCATE TABLE conversaciones;
TRUNCATE TABLE historial_reuniones;
TRUNCATE TABLE reuniones_calendario;
TRUNCATE TABLE solicitudes_reunion;
TRUNCATE TABLE disponibilidad_horarios;
TRUNCATE TABLE notificaciones_proyecto;
TRUNCATE TABLE fechas;
TRUNCATE TABLE historial_asignaciones;
TRUNCATE TABLE asignaciones_proyectos;
TRUNCATE TABLE estudiantes_proyectos;
TRUNCATE TABLE avances;
TRUNCATE TABLE hitos_proyecto;
TRUNCATE TABLE cronogramas_proyecto;
TRUNCATE TABLE proyectos;
TRUNCATE TABLE historial_revisiones_propuestas;
TRUNCATE TABLE asignaciones_propuestas;
TRUNCATE TABLE estudiantes_propuestas;
TRUNCATE TABLE propuestas;
TRUNCATE TABLE colaboradores_externos;
TRUNCATE TABLE entidades_externas;
TRUNCATE TABLE usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. USUARIOS (contraseña: 1234)
-- ============================================
-- Nota: tabla 'usuarios' solo tiene la columna 'nombre' (sin apellidos separados).
--       Se usa nombre completo en ese campo.

INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado, debe_cambiar_password) VALUES
-- Usuarios base del sistema (mismos RUT que database.sql)
('11111111-1', 'Usuario Estudiante',  'estudiante@ubiobio.cl',  '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('22222222-2', 'Usuario Profesor',    'profesor@ubiobio.cl',    '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('33333333-3', 'Usuario Admin',       'admin@ubiobio.cl',       '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 3, 1, 0),
('44444444-4', 'Usuario SuperAdmin',  'superadmin@ubiobio.cl',  '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 4, 1, 0),

-- Profesores de prueba (rol_id = 2)
('12345678-9', 'Roberto Sánchez Castro',   'rsanchez@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('23456789-0', 'Ana Ramírez Torres',       'aramirez@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('34567890-1', 'Luis Pérez Morales',       'lperez@ubiobio.cl',   '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('45678901-2', 'Carmen Vargas Díaz',       'cvargas@ubiobio.cl',  '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),
('56789012-3', 'Jorge Muñoz Rojas',        'jmunoz@ubiobio.cl',   '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1, 0),

-- Estudiantes de prueba (rol_id = 1)
('19876543-2', 'Sebastián Flores Gutiérrez',  'sflores@egresados.ubiobio.cl',  '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('19876543-3', 'Valentina Ortiz Núñez',       'vortiz@egresados.ubiobio.cl',   '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('20123456-7', 'Diego Castro Bravo',          'dcastro@egresados.ubiobio.cl',  '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('20234567-8', 'Camila Reyes Soto',           'creyes@egresados.ubiobio.cl',   '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('20345678-9', 'Matías Silva Pinto',          'msilva@egresados.ubiobio.cl',   '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('20456789-0', 'Francisca Morales Herrera',   'fmorales@egresados.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('21123456-7', 'Nicolás Vega Contreras',      'nvega@egresados.ubiobio.cl',    '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0),
('21234567-8', 'Sofía Campos Valdés',         'scampos@egresados.ubiobio.cl',  '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1, 0);

-- ============================================
-- 2. ENTIDADES EXTERNAS
-- ============================================
-- tipo ENUM: 'empresa_privada','empresa_publica','institucion_educativa',
--            'ong','organismo_publico','otra'

INSERT INTO entidades_externas (nombre, razon_social, rut_empresa, tipo, email_contacto, telefono, direccion, sitio_web, area_actividad, descripcion, activo) VALUES
('TechSolutions SpA',          'TechSolutions Servicios Informáticos SpA',   '76123456-7', 'empresa_privada',       'contacto@techsolutions.cl',    '+56412345678', 'Av. Collao 1202, Concepción',   'https://techsolutions.cl',  'Desarrollo de Software',  'Empresa líder en desarrollo de software a medida y consultoría tecnológica.',                     1),
('DataAnalytics Chile',        'DataAnalytics Chile Limitada',               '76234567-8', 'empresa_privada',       'info@dataanalytics.cl',        '+56423456789', 'Barros Arana 456, Concepción',  'https://dataanalytics.cl', 'Análisis de Datos',       'Especialistas en Big Data, Machine Learning y Business Intelligence.',                            1),
('Fundación Innovación Social', 'Fundación para la Innovación Social',       '65345678-9', 'ong',                   'contacto@innovacionsocial.cl', '+56434567890', 'O''Higgins 789, Chillán',       NULL,                        'Tecnología Social',       'ONG enfocada en proyectos de tecnología para el desarrollo social y comunitario.',                1),
('CloudServices SA',           'CloudServices Infraestructura SA',           '76456789-0', 'empresa_privada',       'ventas@cloudservices.cl',      '+56445678901', 'Freire 123, Concepción',        'https://cloudservices.cl', 'Cloud Computing',         'Proveedor de servicios de infraestructura cloud y DevOps.',                                       1),
('Universidad del Bío-Bío',    'Universidad del Bío-Bío',                    '60810000-8', 'institucion_educativa', 'vinculacion@ubiobio.cl',       '+56422463000', 'Av. Collao 1202, Concepción',   'https://www.ubiobio.cl',   'Educación Superior',      'Casa de estudios superiores con vinculación al medio productivo y comunidad.',                    1),
('CyberSecure Chile',          'CyberSecure Seguridad Informática Ltda',     '76567890-1', 'empresa_privada',       'contacto@cybersecure.cl',      '+56456789012', 'Caupolicán 567, Concepción',    'https://cybersecure.cl',   'Ciberseguridad',          'Empresa especializada en auditorías de seguridad, pentesting y cumplimiento normativo.',          1),
('Gobierno Regional Bío-Bío',  'Gobierno Regional del Bío-Bío',              '61602000-4', 'organismo_publico',     'innovacion@gorebiobio.cl',     '+56423272000', 'Castellón 444, Concepción',     'https://www.gorebiobio.cl', 'Administración Pública', 'Institución pública enfocada en el desarrollo regional y transformación digital del territorio.', 1),
('StartupHub Concepción',      'StartupHub Concepción SpA',                  '76678901-2', 'empresa_privada',       'hola@startuphub.cl',           '+56467890123', 'Freire 890, Concepción',        'https://startuphub.cl',    'Emprendimiento',          'Incubadora y aceleradora de startups tecnológicas de la región del Bío-Bío.',                    1);

-- ============================================
-- 3. COLABORADORES EXTERNOS
-- ============================================
-- tipo_colaborador ENUM: 'supervisor_empresa','mentor','asesor_tecnico',
--                        'cliente','evaluador_externo','otro'
-- creado_por NOT NULL → usamos admin RUT '33333333-3'

INSERT INTO colaboradores_externos (entidad_id, nombre_completo, rut, email, telefono, cargo, tipo_colaborador, area_departamento, especialidad, anos_experiencia, linkedin, biografia, observaciones, verificado, activo, creado_por) VALUES
-- TechSolutions SpA (entidad_id = 1)
(1, 'Fernando Campos Osorio',   '15123456-7', 'fcampos@techsolutions.cl', '+56987654321', 'Gerente de Desarrollo',          'supervisor_empresa', 'Desarrollo de Software',  'Arquitectura de Software', 18, 'https://linkedin.com/in/fcampos', 'Ingeniero Civil en Informática con más de 18 años liderando equipos de desarrollo en proyectos de alta complejidad.',         'Excelente supervisor para proyectos de arquitectura y desarrollo full-stack.',       1, 1, '33333333-3'),
(1, 'Patricia Muñoz Bravo',     '16234567-8', 'pmunoz@techsolutions.cl',  '+56987654322', 'Senior Developer',               'asesor_tecnico',     'Desarrollo Web',          'Frontend Development',     10, 'https://linkedin.com/in/pmunoz',  'Desarrolladora especializada en React, Angular y tecnologías frontend modernas. Certificada en UX Design.',                  'Ideal para asesoría técnica en proyectos de desarrollo web.',                       1, 1, '33333333-3'),
-- DataAnalytics Chile (entidad_id = 2)
(2, 'Ricardo Soto Valenzuela',  '14345678-9', 'rsoto@dataanalytics.cl',   '+56987654323', 'Data Science Lead',              'mentor',             'Ciencia de Datos',        'Machine Learning',         15, 'https://linkedin.com/in/rsoto',   'PhD en Ciencias de la Computación, especialista en ML y análisis predictivo aplicado a industria.',                           'Mentor excepcional para proyectos de IA y análisis de datos.',                      1, 1, '33333333-3'),
(2, 'Elena Rojas Pizarro',      '17456789-0', 'erojas@dataanalytics.cl',  '+56987654324', 'Business Intelligence Manager',  'asesor_tecnico',     'BI y Reportes',           'Visualización de Datos',   12, 'https://linkedin.com/in/erojas',  'Experta en Power BI, Tableau y desarrollo de dashboards ejecutivos para toma de decisiones.',                                 'Adecuada para proyectos de visualización y reportería empresarial.',                1, 1, '33333333-3'),
-- Fundación Innovación Social (entidad_id = 3)
(3, 'Marcelo Torres Guzmán',    '13567890-1', 'mtorres@innovacionsocial.cl', '+56987654325', 'Director de Proyectos',        'supervisor_empresa', 'Gestión de Proyectos',    'Tecnología Social',        20, 'https://linkedin.com/in/mtorres', 'Sociólogo con maestría en Gestión de Proyectos Tecnológicos. 20 años de experiencia en proyectos de impacto social.',         'Excelente para proyectos con enfoque social y comunitario.',                        1, 1, '33333333-3'),
-- CloudServices SA (entidad_id = 4)
(4, 'Andrea Silva Bustamante',  '18678901-2', 'asilva@cloudservices.cl',  '+56987654326', 'Cloud Architect',                'asesor_tecnico',     'Infraestructura Cloud',   'AWS y Azure',              14, 'https://linkedin.com/in/asilva',  'Arquitecta cloud certificada en AWS y Azure. Especialista en microservicios, contenedores y DevOps.',                         'Ideal para proyectos que requieran infraestructura cloud escalable.',               1, 1, '33333333-3'),
-- CyberSecure Chile (entidad_id = 6)
(6, 'Rodrigo Espinoza Núñez',   '15890123-4', 'respinoza@cybersecure.cl', '+56987654328', 'Security Consultant',            'evaluador_externo',  'Seguridad Informática',   'Pentesting y Auditoría',   16, 'https://linkedin.com/in/respinoza', 'Consultor de seguridad certificado CEH y OSCP. Experto en auditorías de seguridad y análisis de vulnerabilidades.',           'Evaluador técnico para proyectos con requisitos de seguridad.',                     1, 1, '33333333-3'),
-- Gobierno Regional Bío-Bío (entidad_id = 7)
(7, 'Claudia Contreras Parra',  '14901234-5', 'ccontreras@gorebiobio.cl', '+56987654329', 'Jefa de Innovación Digital',     'mentor',             'Transformación Digital',  'Gestión Pública Digital',  13, 'https://linkedin.com/in/ccontreras', 'Administradora pública con especialización en gobierno digital y transformación tecnológica del sector público.',              'Mentora para proyectos de e-government y tecnología en el sector público.',         1, 1, '33333333-3');

-- ============================================
-- 4. PROPUESTAS
-- ============================================
-- Campos NOT NULL nuevos requeridos por schema actual:
--   modalidad, numero_estudiantes, complejidad_estimada,
--   duracion_estimada_semestres, area_tematica,
--   objetivos_generales, objetivos_especificos, metodologia_propuesta
--
-- Estado IDs (de database.sql):
--   1=pendiente, 2=en_revision, 3=correcciones, 4=aprobada, 5=rechazada

INSERT INTO propuestas (
    titulo, descripcion, estudiante_rut, estado_id, fecha_envio,
    modalidad, numero_estudiantes, complejidad_estimada, duracion_estimada_semestres,
    area_tematica, objetivos_generales, objetivos_especificos, metodologia_propuesta, archivo
) VALUES

-- Propuesta 1: Aprobada (estado_id = 4) → genera Proyecto 1
('Sistema de Gestión de Inventario con Machine Learning',
 'Desarrollo de un sistema web para gestión de inventario que utiliza algoritmos de ML para predecir la demanda y optimizar el stock. Incluye dashboard interactivo y sistema de alertas automatizadas.',
 '19876543-2', 4, DATE_SUB(CURDATE(), INTERVAL 90 DAY),
 'desarrollo_software', 1, 'alta', 2,
 'Inteligencia Artificial y Sistemas de Información',
 'Desarrollar un sistema inteligente de gestión de inventario que mejore la eficiencia operacional mediante la predicción de demanda con algoritmos de aprendizaje automático.',
 '1. Implementar modelos de regresión y series temporales para predicción de demanda. 2. Desarrollar dashboard de monitoreo en tiempo real. 3. Diseñar sistema de alertas automáticas para reposición de stock. 4. Integrar API REST con sistemas ERP existentes.',
 'Metodología ágil SCRUM con sprints de 2 semanas. Stack tecnológico: Python (scikit-learn, pandas) para modelos ML, React para frontend, Node.js para backend REST. Base de datos PostgreSQL.',
 'propuesta_inventario_ml.pdf'),

-- Propuesta 2: Aprobada (estado_id = 4) → genera Proyecto 2
('Plataforma de E-Learning Adaptativo',
 'Plataforma educativa que se adapta al ritmo de aprendizaje del estudiante usando IA. Incluye sistema de evaluación automática, foros de discusión y gamificación.',
 '19876543-3', 4, DATE_SUB(CURDATE(), INTERVAL 85 DAY),
 'desarrollo_software', 1, 'alta', 2,
 'Tecnología Educativa e Inteligencia Artificial',
 'Diseñar y desarrollar una plataforma de e-learning con capacidad adaptativa basada en IA que personalice el contenido y ritmo de aprendizaje según el perfil de cada estudiante.',
 '1. Desarrollar módulo de evaluación diagnóstica del estudiante. 2. Implementar algoritmo de recomendación de contenido adaptativo. 3. Crear sistema de gamificación con badges, puntos y rankings. 4. Desarrollar panel de análisis de progreso para docentes.',
 'Metodología iterativa con fases: análisis de requisitos, diseño de arquitectura, implementación y pruebas con usuarios reales. Stack: Angular, Django REST Framework, TensorFlow, MongoDB.',
 'propuesta_elearning.pdf'),

-- Propuesta 3: Aprobada (estado_id = 4) → genera Proyecto 3
('App Móvil de Telemedicina para Zonas Rurales',
 'Aplicación móvil multiplataforma para conectar pacientes de zonas rurales con profesionales de la salud. Incluye videoconferencias, recetas digitales y historial médico.',
 '20123456-7', 4, DATE_SUB(CURDATE(), INTERVAL 80 DAY),
 'desarrollo_software', 1, 'alta', 2,
 'Salud Digital y Tecnología Móvil',
 'Desarrollar una aplicación móvil de telemedicina que reduzca las brechas de acceso a salud en zonas rurales mediante consultas virtuales y gestión digital del historial médico.',
 '1. Implementar módulo de videoconferencias médico-paciente con WebRTC. 2. Desarrollar sistema de recetas digitales con firma electrónica. 3. Crear historial médico electrónico con cifrado de extremo a extremo. 4. Integrar sistema de notificaciones push para recordatorios de consultas.',
 'Desarrollo ágil. React Native para app multiplataforma (iOS/Android). Backend Node.js con Express. WebRTC para videoconferencias con NAT traversal (STUN/TURN). Firebase para notificaciones. Cumplimiento Ley 19.628 datos de salud.',
 'propuesta_telemedicina.pdf'),

-- Propuesta 4: Aprobada (estado_id = 4) → genera Proyecto 4
('Sistema de Monitoreo Ambiental IoT',
 'Red de sensores IoT para monitoreo en tiempo real de variables ambientales (temperatura, humedad, calidad del aire). Dashboard web con visualización de datos históricos y alertas.',
 '20234567-8', 4, DATE_SUB(CURDATE(), INTERVAL 75 DAY),
 'desarrollo_software', 1, 'media', 2,
 'Internet de las Cosas y Monitoreo Ambiental',
 'Diseñar e implementar una red de sensores IoT para monitoreo ambiental en tiempo real del campus UBB, con análisis de datos históricos y alertas automáticas ante parámetros fuera de rango.',
 '1. Diseñar e implementar red de sensores ESP32 con protocolo MQTT. 2. Desarrollar backend para recepción y almacenamiento de series temporales. 3. Crear dashboard web con visualización en tiempo real e histórico. 4. Implementar sistema de alertas configurables por umbrales críticos.',
 'Arquitectura IoT: sensores ESP32 → broker MQTT Mosquitto → backend Python FastAPI → TimescaleDB. Frontend Vue.js con Chart.js. Despliegue en servidor local del departamento.',
 'propuesta_iot_ambiental.pdf'),

-- Propuesta 5: En revisión (estado_id = 2)
('Blockchain para Trazabilidad de Productos Agrícolas',
 'Sistema basado en blockchain para garantizar la trazabilidad de productos agrícolas desde el campo hasta el consumidor final. Incluye app móvil para agricultores y consumidores.',
 '20345678-9', 2, DATE_SUB(CURDATE(), INTERVAL 15 DAY),
 'investigacion', 1, 'alta', 2,
 'Blockchain y Sistemas de Trazabilidad',
 'Investigar y desarrollar un sistema de trazabilidad agrícola basado en tecnología blockchain que garantice la autenticidad e integridad de la información desde la producción hasta el consumo final.',
 '1. Investigar plataformas blockchain (Ethereum, Hyperledger Fabric) para el contexto agrícola chileno. 2. Diseñar modelo de datos y contratos inteligentes para registro de trazabilidad. 3. Implementar prototipo funcional. 4. Desarrollar app móvil para agricultores y consumidores.',
 'Investigación exploratoria seguida de desarrollo de prototipo. Hyperledger Fabric por su orientación empresarial y permisionada. React Native para app móvil. Validación con agricultores de la región del Bío-Bío.',
 'propuesta_blockchain_agricola.pdf'),

-- Propuesta 6: En revisión (estado_id = 2)
('Asistente Virtual con Procesamiento de Lenguaje Natural',
 'Chatbot inteligente para atención al cliente usando NLP y modelos de lenguaje. Integración con sistemas CRM y bases de conocimiento empresariales.',
 '20456789-0', 2, DATE_SUB(CURDATE(), INTERVAL 10 DAY),
 'desarrollo_software', 1, 'alta', 2,
 'Procesamiento de Lenguaje Natural e IA Conversacional',
 'Desarrollar un asistente virtual inteligente basado en modelos de lenguaje (LLM) para automatizar la atención al cliente, reduciendo tiempos de respuesta y mejorando la satisfacción del usuario.',
 '1. Evaluar y seleccionar modelo NLP base (BERT, GPT) para el dominio específico. 2. Desarrollar pipeline de clasificación de intenciones y extracción de entidades. 3. Implementar integración con sistema CRM. 4. Crear interfaz web de chat y panel de administración con analíticas.',
 'Fine-tuning de modelos preentrenados con datos del dominio. Framework LangChain para orquestación. Backend FastAPI. Frontend React con TypeScript. Evaluación mediante métricas de precisión (F1-score) y satisfacción de usuarios (CSAT).',
 'propuesta_chatbot_nlp.pdf'),

-- Propuesta 7: Pendiente (estado_id = 1)
('Sistema de Gestión de Torneos Deportivos',
 'Plataforma web y móvil para organizar y gestionar torneos deportivos universitarios. Incluye brackets automáticos, resultados en tiempo real y estadísticas de rendimiento.',
 '21123456-7', 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY),
 'desarrollo_software', 1, 'media', 1,
 'Sistemas de Información Deportiva',
 'Desarrollar una plataforma integral para la gestión de torneos deportivos universitarios que automatice la generación de brackets y facilite el seguimiento de resultados en tiempo real.',
 '1. Diseñar algoritmo de generación automática de brackets por modalidad (liga, eliminación directa). 2. Implementar módulo de resultados en tiempo real con WebSockets. 3. Desarrollar estadísticas y reportes de rendimiento por equipo y jugador. 4. Crear app móvil para participantes y árbitros.',
 'Desarrollo ágil SCRUM. Backend Node.js con WebSockets. Frontend Angular. Base de datos MySQL. App móvil React Native. Despliegue en Azure App Service.',
 'propuesta_torneos.pdf'),

-- Propuesta 8: Pendiente (estado_id = 1)
('Marketplace de Servicios Profesionales',
 'Plataforma que conecta profesionales freelance con clientes. Sistema de pagos integrado, reviews verificadas y gestión completa de proyectos freelance.',
 '21234567-8', 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY),
 'desarrollo_software', 1, 'alta', 2,
 'Comercio Electrónico y Plataformas Digitales',
 'Diseñar y desarrollar un marketplace digital que conecte eficientemente a profesionales independientes con clientes, facilitando la contratación, gestión y pago de servicios profesionales en Chile.',
 '1. Implementar sistema de registro y perfiles verificados para profesionales y clientes. 2. Desarrollar motor de búsqueda y recomendación con filtros avanzados. 3. Integrar pasarela de pagos (Transbank/Mercado Pago Chile). 4. Implementar sistema de reviews verificadas y resolución de disputas.',
 'Metodología SCRUM. Backend Django REST Framework. Frontend Next.js con TypeScript. PostgreSQL. Integración con APIs de pago nacionales. Notificaciones en tiempo real con WebSockets y celery para tareas asíncronas.',
 'propuesta_marketplace.pdf');

-- ============================================
-- 5. ESTUDIANTES_PROPUESTAS
-- ============================================
-- Columnas: propuesta_id, estudiante_rut, es_creador, orden, fecha_agregado

INSERT INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden) VALUES
(1, '19876543-2', 1, 1),
(2, '19876543-3', 1, 1),
(3, '20123456-7', 1, 1),
(4, '20234567-8', 1, 1),
(5, '20345678-9', 1, 1),
(6, '20456789-0', 1, 1),
(7, '21123456-7', 1, 1),
(8, '21234567-8', 1, 1);

-- ============================================
-- 6. ASIGNACIONES DE PROPUESTAS (Revisores)
-- ============================================
-- rol_revision ENUM:   'revisor_principal', 'revisor_secundario', 'informante'
-- estado_revision ENUM: 'pendiente', 'en_revision', 'revisado'
-- decision ENUM:        'aprobar', 'rechazar', 'solicitar_correcciones'
-- asignado_por NOT NULL → admin RUT '33333333-3'

INSERT INTO asignaciones_propuestas (
    propuesta_id, profesor_rut, rol_revision, fecha_asignacion, fecha_revision,
    estado_revision, decision, comentarios_revision, asignado_por
) VALUES
-- Propuesta 1: Inventario ML (aprobada)
(1, '12345678-9', 'revisor_principal', DATE_SUB(NOW(), INTERVAL 88 DAY), DATE_SUB(NOW(), INTERVAL 87 DAY),
 'revisado', 'aprobar',
 'Excelente propuesta. El enfoque de ML para predicción de demanda es innovador y técnicamente sólido. Stack tecnológico adecuado. Aprobado para continuar como proyecto.',
 '33333333-3'),
(1, '23456789-0', 'informante', DATE_SUB(NOW(), INTERVAL 88 DAY), DATE_SUB(NOW(), INTERVAL 87 DAY),
 'revisado', 'aprobar',
 'Propuesta técnicamente robusta. Los objetivos son claros y alcanzables dentro del plazo propuesto. Aprobado.',
 '33333333-3'),

-- Propuesta 2: E-Learning Adaptativo (aprobada)
(2, '23456789-0', 'revisor_principal', DATE_SUB(NOW(), INTERVAL 83 DAY), DATE_SUB(NOW(), INTERVAL 82 DAY),
 'revisado', 'aprobar',
 'Proyecto muy completo. La gamificación y la adaptación por IA son puntos fuertes diferenciadores. Metodología bien fundamentada. Aprobado.',
 '33333333-3'),
(2, '34567890-1', 'informante', DATE_SUB(NOW(), INTERVAL 83 DAY), DATE_SUB(NOW(), INTERVAL 82 DAY),
 'revisado', 'aprobar',
 'Buena arquitectura de base de datos propuesta. Recomiendo considerar escalabilidad horizontal en el módulo de IA para producción. Con observaciones incorporadas, aprobado.',
 '33333333-3'),

-- Propuesta 3: Telemedicina (aprobada)
(3, '34567890-1', 'revisor_principal', DATE_SUB(NOW(), INTERVAL 78 DAY), DATE_SUB(NOW(), INTERVAL 77 DAY),
 'revisado', 'aprobar',
 'Proyecto con gran impacto social. Cumple todos los requisitos técnicos y académicos. La metodología ágil propuesta es apropiada. Aprobado.',
 '33333333-3'),
(3, '45678901-2', 'informante', DATE_SUB(NOW(), INTERVAL 78 DAY), DATE_SUB(NOW(), INTERVAL 77 DAY),
 'revisado', 'aprobar',
 'Es fundamental incorporar aspectos de seguridad y privacidad de datos médicos según Ley 19.628. Con esas consideraciones debidamente tratadas, aprobado.',
 '33333333-3'),

-- Propuesta 4: IoT Ambiental (aprobada)
(4, '56789012-3', 'revisor_principal', DATE_SUB(NOW(), INTERVAL 73 DAY), DATE_SUB(NOW(), INTERVAL 72 DAY),
 'revisado', 'aprobar',
 'Excelente integración de hardware y software. El protocolo MQTT propuesto es la elección correcta. TimescaleDB es adecuada para series temporales. Aprobado.',
 '33333333-3'),
(4, '12345678-9', 'informante', DATE_SUB(NOW(), INTERVAL 73 DAY), DATE_SUB(NOW(), INTERVAL 72 DAY),
 'revisado', 'aprobar',
 'Propuesta bien fundamentada. El análisis de datos históricos añade valor significativo y utilidad real al campus. Aprobado.',
 '33333333-3'),

-- Propuesta 5: Blockchain Agrícola (en revisión)
(5, '12345678-9', 'revisor_principal', DATE_SUB(NOW(), INTERVAL 14 DAY), NULL,
 'en_revision', NULL, NULL, '33333333-3'),
(5, '56789012-3', 'informante', DATE_SUB(NOW(), INTERVAL 14 DAY), NULL,
 'pendiente', NULL, NULL, '33333333-3'),

-- Propuesta 6: Chatbot NLP (en revisión)
(6, '23456789-0', 'revisor_principal', DATE_SUB(NOW(), INTERVAL 9 DAY), NULL,
 'en_revision', NULL, NULL, '33333333-3'),
(6, '45678901-2', 'informante', DATE_SUB(NOW(), INTERVAL 9 DAY), NULL,
 'pendiente', NULL, NULL, '33333333-3');

-- ============================================
-- 7. PROYECTOS
-- ============================================
-- Campos NOT NULL nuevos requeridos por schema actual:
--   modalidad ENUM('desarrollo_software','investigacion','practica')
--   complejidad ENUM('baja','media','alta')
--   duracion_semestres INT
--
-- Estado ID 2 = 'en_desarrollo' (según orden de inserción en database.sql)

INSERT INTO proyectos (
    titulo, descripcion, propuesta_id, estudiante_rut, estado_id,
    fecha_inicio, fecha_entrega_estimada,
    modalidad, complejidad, duracion_semestres,
    porcentaje_avance, estado_detallado, prioridad
) VALUES
('Sistema de Gestión de Inventario con Machine Learning',
 'Sistema web desarrollado con React y Node.js que implementa algoritmos de regresión y series temporales para predicción de demanda. Base de datos PostgreSQL con despliegue en AWS.',
 1, '19876543-2', 2,
 DATE_SUB(CURDATE(), INTERVAL 85 DAY), DATE_ADD(CURDATE(), INTERVAL 95 DAY),
 'desarrollo_software', 'alta', 2,
 35.00, 'desarrollo_fase1', 'alta'),

('Plataforma de E-Learning Adaptativo',
 'Plataforma desarrollada con Angular y Django. Algoritmos de IA implementados con TensorFlow para adaptación dinámica de contenido. Base de datos MongoDB para flexibilidad de esquema.',
 2, '19876543-3', 2,
 DATE_SUB(CURDATE(), INTERVAL 80 DAY), DATE_ADD(CURDATE(), INTERVAL 100 DAY),
 'desarrollo_software', 'alta', 2,
 28.00, 'desarrollo_fase1', 'alta'),

('App Móvil de Telemedicina para Zonas Rurales',
 'Aplicación multiplataforma desarrollada con React Native. Backend Node.js con Express. Videoconferencias WebRTC con servidor coturn. Firebase para notificaciones push.',
 3, '20123456-7', 2,
 DATE_SUB(CURDATE(), INTERVAL 75 DAY), DATE_ADD(CURDATE(), INTERVAL 105 DAY),
 'desarrollo_software', 'alta', 2,
 22.00, 'planificacion', 'alta'),

('Sistema de Monitoreo Ambiental IoT',
 'Red de sensores ESP32 comunicando vía MQTT a broker Mosquitto. Backend Python FastAPI. Dashboard Vue.js con Chart.js. Base de datos TimescaleDB para series temporales.',
 4, '20234567-8', 2,
 DATE_SUB(CURDATE(), INTERVAL 70 DAY), DATE_ADD(CURDATE(), INTERVAL 110 DAY),
 'desarrollo_software', 'media', 2,
 18.00, 'planificacion', 'media');

-- Actualizar propuestas aprobadas con su proyecto_id generado
UPDATE propuestas SET proyecto_id = 1 WHERE id = 1;
UPDATE propuestas SET proyecto_id = 2 WHERE id = 2;
UPDATE propuestas SET proyecto_id = 3 WHERE id = 3;
UPDATE propuestas SET proyecto_id = 4 WHERE id = 4;

-- ============================================
-- 8. ESTUDIANTES_PROYECTOS
-- ============================================
-- Columnas: proyecto_id, estudiante_rut, es_creador, orden, fecha_agregado
-- Nota: tabla es 'estudiantes_proyectos' (con 's'), NO 'estudiantes_proyecto'

INSERT INTO estudiantes_proyectos (proyecto_id, estudiante_rut, es_creador, orden) VALUES
(1, '19876543-2', 1, 1),
(2, '19876543-3', 1, 1),
(3, '20123456-7', 1, 1),
(4, '20234567-8', 1, 1);

-- ============================================
-- 9. ASIGNACIONES DE PROFESORES A PROYECTOS
-- ============================================
-- Columna 'rol_profesor_id' es INT FK a roles_profesores (NO string):
--   1 = Profesor Revisor
--   2 = Profesor Guía
--   3 = Profesor Co-Guía
--   4 = Profesor Informante
--   5 = Profesor de Sala
-- 'asignado_por' NOT NULL → admin RUT '33333333-3'
-- Restricción: solo UNA asignación activa por (proyecto_id, rol_profesor_id)

INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, asignado_por, fecha_asignacion) VALUES
-- Proyecto 1: Inventario ML
(1, '12345678-9', 2, '33333333-3', DATE_SUB(NOW(), INTERVAL 85 DAY)), -- Guía
(1, '23456789-0', 4, '33333333-3', DATE_SUB(NOW(), INTERVAL 85 DAY)), -- Informante
(1, '34567890-1', 3, '33333333-3', DATE_SUB(NOW(), INTERVAL 83 DAY)), -- Co-Guía

-- Proyecto 2: E-Learning Adaptativo
(2, '23456789-0', 2, '33333333-3', DATE_SUB(NOW(), INTERVAL 80 DAY)), -- Guía
(2, '34567890-1', 4, '33333333-3', DATE_SUB(NOW(), INTERVAL 80 DAY)), -- Informante
(2, '45678901-2', 3, '33333333-3', DATE_SUB(NOW(), INTERVAL 78 DAY)), -- Co-Guía

-- Proyecto 3: Telemedicina
(3, '34567890-1', 2, '33333333-3', DATE_SUB(NOW(), INTERVAL 75 DAY)), -- Guía
(3, '45678901-2', 4, '33333333-3', DATE_SUB(NOW(), INTERVAL 75 DAY)), -- Informante

-- Proyecto 4: IoT Ambiental
(4, '56789012-3', 2, '33333333-3', DATE_SUB(NOW(), INTERVAL 70 DAY)), -- Guía
(4, '12345678-9', 4, '33333333-3', DATE_SUB(NOW(), INTERVAL 70 DAY)); -- Informante

-- ============================================
-- 10. FECHAS (tabla unificada - reemplaza fechas_importantes y fechas_calendario)
-- ============================================
-- tipo_fecha ENUM: 'entrega_propuesta','entrega','entrega_avance','entrega_final',
--                  'reunion','hito','deadline','presentacion','defensa',
--                  'revision','academica','global','otro'
-- creado_por_rut NOT NULL

INSERT INTO fechas (titulo, descripcion, fecha, tipo_fecha, proyecto_id, creado_por_rut, profesor_rut, es_global) VALUES
-- Proyecto 1: Inventario ML
('Entrega Capítulo 1 – Marco Teórico',
 'Entrega del marco teórico y estado del arte del sistema de gestión de inventario con ML.',
 DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'entrega_avance', 1, '12345678-9', '12345678-9', 0),
('Reunión de Avance – Modelo Predictivo',
 'Presentación de resultados preliminares del modelo de predicción de demanda.',
 DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'reunion', 1, '12345678-9', '12345678-9', 0),
('Entrega Prototipo Funcional',
 'Demostración del prototipo funcional con datos reales del caso de estudio.',
 DATE_ADD(CURDATE(), INTERVAL 60 DAY), 'entrega_avance', 1, '12345678-9', '12345678-9', 0),
('Defensa Final – Proyecto Inventario ML',
 'Presentación y defensa del trabajo de titulación ante comisión evaluadora.',
 DATE_ADD(CURDATE(), INTERVAL 95 DAY), 'defensa', 1, '33333333-3', NULL, 0),

-- Proyecto 2: E-Learning Adaptativo
('Revisión de Arquitectura del Sistema',
 'Validación de la arquitectura propuesta (patrones, BD, módulos de IA) por el equipo docente.',
 DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'revision', 2, '23456789-0', '23456789-0', 0),
('Entrega Módulo de Adaptación IA',
 'Entrega del módulo de adaptación inteligente de contenido educativo.',
 DATE_ADD(CURDATE(), INTERVAL 45 DAY), 'entrega_avance', 2, '23456789-0', '23456789-0', 0),
('Testing con Usuarios Reales',
 'Pruebas de usabilidad con estudiantes y docentes reales. Recolección de métricas UX.',
 DATE_ADD(CURDATE(), INTERVAL 70 DAY), 'hito', 2, '23456789-0', '23456789-0', 0),
('Entrega Informe Final – E-Learning',
 'Entrega del informe final y memoria completa del proyecto de titulación.',
 DATE_ADD(CURDATE(), INTERVAL 100 DAY), 'entrega_final', 2, '23456789-0', '23456789-0', 0),

-- Proyecto 3: Telemedicina
('Revisión Aspectos Éticos y Legales',
 'Revisión del comité de ética por manejo de datos médicos sensibles. Verificación normativa.',
 DATE_ADD(CURDATE(), INTERVAL 10 DAY), 'revision', 3, '34567890-1', '34567890-1', 0),
('Demo Módulo Videoconferencias Médicas',
 'Demostración del módulo de videoconferencias médico-paciente con NAT traversal resuelto.',
 DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'entrega_avance', 3, '34567890-1', '34567890-1', 0),
('Piloto en Comunidad Rural Bío-Bío',
 'Prueba piloto de la aplicación con pacientes y médicos en comunidad rural de la región.',
 DATE_ADD(CURDATE(), INTERVAL 75 DAY), 'hito', 3, '34567890-1', '34567890-1', 0),

-- Proyecto 4: IoT Ambiental
('Instalación Red de Sensores en Campus',
 'Instalación y configuración de la red de sensores IoT ESP32 en puntos estratégicos del campus.',
 DATE_ADD(CURDATE(), INTERVAL 25 DAY), 'hito', 4, '56789012-3', '56789012-3', 0),
('Calibración y Validación del Sistema',
 'Calibración de sensores y validación de mediciones con instrumentos de referencia certificados.',
 DATE_ADD(CURDATE(), INTERVAL 50 DAY), 'revision', 4, '56789012-3', '56789012-3', 0),
('Presentación de Resultados Ambientales',
 'Presentación de análisis de datos recopilados durante el período de monitoreo al departamento.',
 DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'presentacion', 4, '56789012-3', '56789012-3', 0);

-- ============================================
-- 11. DISPONIBILIDAD DE HORARIOS
-- ============================================
-- Columnas: usuario_rut, dia_semana, hora_inicio, hora_fin, activo
-- NOTA: NO existe columna 'modalidad' ni 'disponible' en esta tabla.
--       Se usa 'usuario_rut' (NO 'profesor_rut') y 'activo' (NO 'disponible').

INSERT INTO disponibilidad_horarios (usuario_rut, dia_semana, hora_inicio, hora_fin, activo) VALUES
-- Prof. Roberto Sánchez (12345678-9)
('12345678-9', 'lunes',     '09:00:00', '11:00:00', 1),
('12345678-9', 'lunes',     '15:00:00', '17:00:00', 1),
('12345678-9', 'miercoles', '10:00:00', '12:00:00', 1),
('12345678-9', 'viernes',   '14:00:00', '16:00:00', 1),

-- Profa. Ana Ramírez (23456789-0)
('23456789-0', 'lunes',     '11:00:00', '13:00:00', 1),
('23456789-0', 'martes',    '09:00:00', '11:00:00', 1),
('23456789-0', 'jueves',    '15:00:00', '17:00:00', 1),
('23456789-0', 'viernes',   '10:00:00', '12:00:00', 1),

-- Prof. Luis Pérez (34567890-1)
('34567890-1', 'martes',    '14:00:00', '16:00:00', 1),
('34567890-1', 'miercoles', '09:00:00', '11:00:00', 1),
('34567890-1', 'jueves',    '11:00:00', '13:00:00', 1),

-- Profa. Carmen Vargas (45678901-2)
('45678901-2', 'lunes',     '10:00:00', '12:00:00', 1),
('45678901-2', 'miercoles', '15:00:00', '17:00:00', 1),
('45678901-2', 'viernes',   '09:00:00', '11:00:00', 1),

-- Prof. Jorge Muñoz (56789012-3)
('56789012-3', 'martes',    '10:00:00', '12:00:00', 1),
('56789012-3', 'miercoles', '14:00:00', '16:00:00', 1),
('56789012-3', 'jueves',    '09:00:00', '11:00:00', 1);

-- ============================================
-- 12. SOLICITUDES DE REUNIÓN
-- ============================================
-- proyecto_id NOT NULL (campo nuevo y requerido)
-- Columnas: proyecto_id, profesor_rut, estudiante_rut,
--           fecha_propuesta DATE, hora_propuesta TIME, duracion_minutos,
--           tipo_reunion, descripcion, estado, creado_por
-- tipo_reunion ENUM: 'seguimiento','revision_avance','orientacion','defensa_parcial','otra'
-- estado ENUM:       'pendiente','aceptada_profesor','aceptada_estudiante','confirmada','rechazada','cancelada'
-- creado_por ENUM:   'profesor','estudiante','sistema'

INSERT INTO solicitudes_reunion (
    proyecto_id, profesor_rut, estudiante_rut,
    fecha_propuesta, hora_propuesta, duracion_minutos,
    tipo_reunion, descripcion, estado, creado_por
) VALUES
-- Reuniones confirmadas (pasadas)
(1, '12345678-9', '19876543-2',
 DATE_SUB(CURDATE(), INTERVAL 7 DAY), '10:00:00', 60,
 'seguimiento', 'Revisión de avances del modelo de predicción de demanda y análisis de métricas RMSE.',
 'confirmada', 'estudiante'),

(2, '23456789-0', '19876543-3',
 DATE_SUB(CURDATE(), INTERVAL 5 DAY), '15:00:00', 60,
 'revision_avance', 'Revisión de la arquitectura del sistema de e-learning y diseño del módulo de adaptación.',
 'confirmada', 'estudiante'),

(3, '34567890-1', '20123456-7',
 DATE_SUB(CURDATE(), INTERVAL 3 DAY), '11:00:00', 60,
 'orientacion', 'Consultas sobre NAT traversal con WebRTC y cifrado de datos médicos sensibles.',
 'confirmada', 'estudiante'),

-- Reuniones futuras confirmadas
(4, '56789012-3', '20234567-8',
 DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', 60,
 'seguimiento', 'Revisión del protocolo de comunicación MQTT y configuración de sensores ESP32.',
 'confirmada', 'estudiante'),

(1, '12345678-9', '19876543-2',
 DATE_ADD(CURDATE(), INTERVAL 5 DAY), '09:00:00', 90,
 'revision_avance', 'Presentación de resultados preliminares del modelo predictivo con datos reales.',
 'confirmada', 'profesor'),

-- Reuniones pendientes de confirmación
(2, '23456789-0', '19876543-3',
 DATE_ADD(CURDATE(), INTERVAL 7 DAY), '11:00:00', 60,
 'orientacion', 'Consultas sobre implementación del algoritmo de recomendación de contenido adaptativo.',
 'pendiente', 'estudiante'),

(3, '34567890-1', '20123456-7',
 DATE_ADD(CURDATE(), INTERVAL 10 DAY), '14:00:00', 60,
 'seguimiento', 'Revisión de medidas de seguridad y privacidad para datos médicos según normativa vigente.',
 'pendiente', 'estudiante');

-- ============================================
-- 13. CONVERSACIONES Y MENSAJES (Sistema de Chat)
-- ============================================
-- Reemplaza la tabla 'mensajes_chat' del esquema anterior.
-- Flujo: insertar conversación → obtener ID → insertar mensajes → actualizar ultimo_mensaje_id

-- Conversación 1: Sebastián (19876543-2) ↔ Prof. Roberto (12345678-9) – Proyecto Inventario ML
INSERT INTO conversaciones (usuario1_rut, usuario2_rut) VALUES ('19876543-2', '12345678-9');

INSERT INTO mensajes (conversacion_id, remitente_rut, contenido, leido) VALUES
(1, '19876543-2', 'Buenos días profesor, quisiera comentarle sobre el avance del modelo de predicción. El RMSE bajó a 0.15 con el conjunto de validación.', 1),
(1, '12345678-9', 'Hola Sebastián, excelente resultado. ¿Con qué dataset y división train/test lo validaste?', 1),
(1, '19876543-2', 'Usé los datos históricos de los últimos 3 años con split 80/20. Adjunto los gráficos de predicción vs real en el drive compartido.', 1),
(1, '12345678-9', 'Muy bien. Agenda una reunión esta semana para revisar el informe escrito y la sección de análisis de resultados.', 1);

-- Conversación 2: Valentina (19876543-3) ↔ Profa. Ana (23456789-0) – Proyecto E-Learning
INSERT INTO conversaciones (usuario1_rut, usuario2_rut) VALUES ('19876543-3', '23456789-0');

INSERT INTO mensajes (conversacion_id, remitente_rut, contenido, leido) VALUES
(2, '19876543-3', 'Profesora, tengo dudas sobre el módulo de gamificación. ¿La lógica de badges y puntos va en backend o puedo manejarlo en frontend?', 1),
(2, '23456789-0', 'Hola Valentina. La lógica de negocio siempre en el backend; el frontend solo visualiza el estado. Así garantizas consistencia y evitas manipulaciones del cliente.', 1),
(2, '19876543-3', 'Entendido, implementaré el sistema de puntos como eventos del servidor. ¿Puede revisar el modelo de BD que subí al repositorio para confirmar la normalización?', 1),
(2, '23456789-0', 'Claro, lo reviso hoy en la tarde y te comento. A primera vista el modelo de puntos y badges se ve bien normalizado.', 0);

-- Conversación 3: Diego (20123456-7) ↔ Prof. Luis (34567890-1) – Proyecto Telemedicina
INSERT INTO conversaciones (usuario1_rut, usuario2_rut) VALUES ('20123456-7', '34567890-1');

INSERT INTO mensajes (conversacion_id, remitente_rut, contenido, leido) VALUES
(3, '20123456-7', 'Profesor, logré implementar las videoconferencias con WebRTC. Funciona perfecto en LAN, pero tengo problemas con NAT traversal en redes externas con firewall restrictivo.', 1),
(3, '34567890-1', 'Buen avance Diego! Para el NAT traversal necesitas un servidor TURN además del STUN. ¿Probaste con los servidores STUN públicos de Google?', 1),
(3, '20123456-7', 'Sí, el STUN funciona en la mayoría de casos pero para redes muy restrictivas necesito TURN relay. ¿Tenemos recursos para instalar coturn o usar Twilio?', 0),
(3, '34567890-1', 'Instala coturn en el servidor del proyecto, es open source y sin costo. Te mando la guía de configuración que usé en otro proyecto similar.', 0);

-- Actualizar último mensaje en cada conversación (IDs auto-increment desde 1 tras TRUNCATE)
UPDATE conversaciones SET ultimo_mensaje_id = 4  WHERE id = 1;
UPDATE conversaciones SET ultimo_mensaje_id = 8  WHERE id = 2;
UPDATE conversaciones SET ultimo_mensaje_id = 12 WHERE id = 3;

-- ============================================
-- 14. MENSAJES NO LEÍDOS (contador por usuario y conversación)
-- ============================================
-- Refleja mensajes con leido=0 en la tabla mensajes

INSERT INTO mensajes_no_leidos (usuario_rut, conversacion_id, cantidad) VALUES
('19876543-3', 2, 1),  -- Valentina tiene 1 mensaje no leído (msg 8 de Profa. Ana)
('34567890-1', 3, 1),  -- Prof. Luis tiene 1 mensaje no leído (msg 11 de Diego)
('20123456-7', 3, 1);  -- Diego tiene 1 mensaje no leído (msg 12 de Prof. Luis)

-- ============================================
-- 15. NOTIFICACIONES DE PROYECTOS
-- ============================================
-- Reemplaza la tabla 'notificaciones' del esquema anterior.
-- tipo_notificacion ENUM: 'fecha_limite_proxima','entrega_retrasada','revision_pendiente',
--                         'cronograma_modificado','nueva_entrega','proyecto_creado'
-- rol_destinatario ENUM:  'estudiante','profesor_guia','profesor_revisor','admin'
-- proyecto_id NOT NULL

INSERT INTO notificaciones_proyecto (
    proyecto_id, tipo_notificacion, destinatario_rut, rol_destinatario,
    titulo, mensaje, leida
) VALUES
-- Notificaciones para Sebastián (Proyecto 1)
(1, 'fecha_limite_proxima', '19876543-2', 'estudiante',
 'Próxima Entrega: Capítulo 1',
 'Tu entrega del Capítulo 1 (Marco Teórico) vence en 15 días. Asegúrate de subir el documento al sistema.',
 0),
(1, 'proyecto_creado', '19876543-2', 'estudiante',
 'Proyecto Aprobado e Iniciado',
 'Tu propuesta "Sistema de Gestión de Inventario con ML" fue aprobada. Tu proyecto está activo en el sistema.',
 1),

-- Notificaciones para Valentina (Proyecto 2)
(2, 'fecha_limite_proxima', '19876543-3', 'estudiante',
 'Próxima Revisión de Arquitectura',
 'La revisión de arquitectura del sistema está programada para 20 días. Prepara la documentación técnica.',
 0),
(2, 'proyecto_creado', '19876543-3', 'estudiante',
 'Proyecto Aprobado e Iniciado',
 'Tu propuesta "Plataforma de E-Learning Adaptativo" fue aprobada. Ya tienes acceso al panel del proyecto.',
 1),

-- Notificaciones para Diego (Proyecto 3)
(3, 'fecha_limite_proxima', '20123456-7', 'estudiante',
 'Próxima Revisión: Aspectos Éticos',
 'La revisión de aspectos éticos y legales vence en 10 días. Coordina con el Prof. Pérez los documentos necesarios.',
 0),

-- Notificaciones para profesores
(1, 'nueva_entrega', '12345678-9', 'profesor_guia',
 'Avance Reportado – Proyecto Inventario ML',
 'Sebastián Flores ha reportado avance en el modelo de predicción. RMSE actual: 0.15. Revisa el repositorio.',
 0),
(2, 'revision_pendiente', '23456789-0', 'profesor_guia',
 'Revisión Pendiente de BD',
 'Valentina Ortiz ha subido el diseño de BD del módulo de gamificación para revisión. Pendiente tu retroalimentación.',
 0),
(3, 'fecha_limite_proxima', '34567890-1', 'profesor_guia',
 'Revisión Ética – Proyecto Telemedicina',
 'La revisión de aspectos éticos del Proyecto Telemedicina vence en 10 días. Coordina con el comité institucional.',
 0),

-- Notificación para admin
(4, 'proyecto_creado', '33333333-3', 'admin',
 'Nuevo Proyecto Iniciado',
 'El proyecto "Sistema de Monitoreo Ambiental IoT" de Camila Reyes ha sido iniciado y está en fase de planificación.',
 1);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

SELECT 'Datos de prueba insertados correctamente.' AS Resultado;

SELECT
    (SELECT COUNT(*) FROM usuarios)               AS Usuarios,
    (SELECT COUNT(*) FROM entidades_externas)      AS Entidades,
    (SELECT COUNT(*) FROM colaboradores_externos)  AS Colaboradores,
    (SELECT COUNT(*) FROM propuestas)              AS Propuestas,
    (SELECT COUNT(*) FROM estudiantes_propuestas)  AS EstudiantesPropuestas,
    (SELECT COUNT(*) FROM asignaciones_propuestas) AS AsignacionesPropuestas,
    (SELECT COUNT(*) FROM proyectos)               AS Proyectos,
    (SELECT COUNT(*) FROM estudiantes_proyectos)   AS EstudiantesProyectos,
    (SELECT COUNT(*) FROM asignaciones_proyectos)  AS AsignacionesProyectos,
    (SELECT COUNT(*) FROM fechas)                  AS Fechas,
    (SELECT COUNT(*) FROM disponibilidad_horarios) AS Disponibilidad,
    (SELECT COUNT(*) FROM solicitudes_reunion)     AS SolicitudesReunion,
    (SELECT COUNT(*) FROM conversaciones)          AS Conversaciones,
    (SELECT COUNT(*) FROM mensajes)                AS Mensajes,
    (SELECT COUNT(*) FROM mensajes_no_leidos)      AS MensajesNoLeidos,
    (SELECT COUNT(*) FROM notificaciones_proyecto) AS Notificaciones;
