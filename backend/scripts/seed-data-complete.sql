-- ============================================
-- SCRIPT COMPLETO DE DATOS DE PRUEBA
-- Sistema de Gestión de Titulación UBB
-- Llena TODAS las tablas con datos coherentes
-- ============================================

USE actitubb;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- PERIODOS DE PROPUESTAS
-- ============================================
INSERT INTO periodos_propuestas (nombre, fecha_inicio, fecha_fin, activo) VALUES
('Período 2025-1', '2025-03-01', '2025-07-31', FALSE),
('Período 2025-2', '2025-08-01', '2025-12-31', TRUE),
('Período 2026-1', '2026-03-01', '2026-07-31', FALSE);

-- ============================================
-- ESTUDIANTES - PROPUESTAS (Propuestas grupales)
-- ============================================
-- Propuestas individuales ya están en la tabla propuestas con estudiante_rut
-- Estas son propuestas grupales (2 o más estudiantes)
INSERT INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden) VALUES
-- Propuesta 15 (2 estudiantes IECI)
(15, '20444444-4', TRUE, 1),
(15, '20555555-5', FALSE, 2),

-- Propuesta 20 (2 estudiantes ICINF)
(20, '19666666-6', TRUE, 1),
(20, '19777777-7', FALSE, 2),

-- Propuesta 30 (grupo de 3 estudiantes IECI)
(30, '20666666-6', TRUE, 1),
(30, '20777777-7', FALSE, 2),
(30, '20888888-8', FALSE, 3);

-- ============================================
-- HISTORIAL DE REVISIONES DE PROPUESTAS
-- ============================================
-- Para propuestas en revisión, correcciones, aprobadas y rechazadas
-- Nota: Se requieren asignaciones previas (ver seed-data-generated.sql)
INSERT INTO historial_revisiones_propuestas (asignacion_id, propuesta_id, profesor_rut, accion, decision, comentarios, fecha_accion) VALUES
-- Propuestas en revisión (estado 2) - usando asignaciones existentes
(11, 11, '16111111-1', 'decision_tomada', 'solicitar_correcciones', 'Se requieren mejoras en la metodología propuesta. Favor revisar el cronograma y agregar más detalle en los objetivos específicos.', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(12, 12, '16222222-2', 'decision_tomada', 'solicitar_correcciones', 'La descripción del problema está bien planteada, pero falta justificación del impacto esperado.', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(13, 13, '16333333-3', 'decision_tomada', 'solicitar_correcciones', 'Propuesta interesante. Agregar referencias bibliográficas y detallar los recursos necesarios.', DATE_SUB(NOW(), INTERVAL 12 DAY)),

-- Propuestas con correcciones (estado 3)
(19, 19, '16444444-4', 'decision_tomada', 'solicitar_correcciones', 'Primera revisión: Falta claridad en la metodología. Se requiere mayor detalle en el alcance del proyecto.', DATE_SUB(NOW(), INTERVAL 35 DAY)),
(19, 19, '16444444-4', 'decision_tomada', 'solicitar_correcciones', 'Segunda revisión: Mejor, pero aún faltan algunas referencias clave.', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(20, 20, '16555555-5', 'decision_tomada', 'solicitar_correcciones', 'Agregar análisis de factibilidad técnica y económica.', DATE_SUB(NOW(), INTERVAL 25 DAY)),

-- Propuestas aprobadas (estado 4)
(24, 24, '16666666-6', 'decision_tomada', 'aprobar', 'Propuesta bien fundamentada. Se aprueba para continuar con el proyecto.', DATE_SUB(NOW(), INTERVAL 50 DAY)),
(25, 25, '16777777-7', 'decision_tomada', 'aprobar', 'Excelente propuesta, objetivos claros y metodología adecuada. Aprobada.', DATE_SUB(NOW(), INTERVAL 48 DAY)),
(26, 26, '16888888-8', 'decision_tomada', 'aprobar', 'Propuesta innovadora con buen sustento teórico. Aprobada.', DATE_SUB(NOW(), INTERVAL 45 DAY)),
(27, 27, '16999999-9', 'decision_tomada', 'aprobar', 'Cumple con todos los requisitos. Aprobada para desarrollo.', DATE_SUB(NOW(), INTERVAL 42 DAY)),
(28, 28, '16101010-K', 'decision_tomada', 'aprobar', 'Propuesta viable y bien documentada. Aprobada.', DATE_SUB(NOW(), INTERVAL 40 DAY)),

-- Propuestas rechazadas (estado 5)
(45, 45, '16121212-1', 'decision_tomada', 'rechazar', 'La propuesta no cumple con los requisitos mínimos. Falta viabilidad técnica y el alcance es demasiado ambicioso para el tiempo disponible.', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(46, 46, '16131313-2', 'decision_tomada', 'rechazar', 'Tema ya desarrollado en proyectos anteriores. Se sugiere replantear el enfoque o elegir otro tema.', DATE_SUB(NOW(), INTERVAL 28 DAY));

-- ============================================
-- ARCHIVOS DE PROPUESTAS
-- ============================================
INSERT INTO archivos_propuesta (propuesta_id, ruta_archivo, nombre_archivo, tipo_archivo, tamanio_bytes, subido_por) VALUES
(1, '/uploads/propuestas/prop1_documento.pdf', 'Propuesta_Sistema_Gestion_Inventario.pdf', 'application/pdf', 2458624, '22555555-5'),
(2, '/uploads/propuestas/prop2_documento.pdf', 'Propuesta_Plataforma_ELearning.pdf', 'application/pdf', 3145728, '22888888-8'),
(3, '/uploads/propuestas/prop3_anexos.zip', 'Anexos_Propuesta_IoT.zip', 'application/zip', 5242880, '16191919-1'),
(11, '/uploads/propuestas/prop11_v1.pdf', 'Propuesta_Marketplace_v1.pdf', 'application/pdf', 2097152, '18444444-4'),
(11, '/uploads/propuestas/prop11_v2.pdf', 'Propuesta_Marketplace_v2_corregida.pdf', 'application/pdf', 2359296, '18444444-4'),
(24, '/uploads/propuestas/prop24_final.pdf', 'Propuesta_Aprobada_Proyecto5.pdf', 'application/pdf', 3670016, '20111111-1');

-- ============================================
-- HITOS DE PROYECTO
-- ============================================
INSERT INTO hitos_proyecto (proyecto_id, titulo, descripcion, fecha_estimada, fecha_completado, porcentaje_peso, estado, tipo, creado_por) VALUES
-- Proyecto 1 (IECI - esperando_asignacion)
(1, 'Planificación Inicial', 'Definición del alcance y planificación del proyecto', DATE_ADD(NOW(), INTERVAL 10 DAY), NULL, 10, 'pendiente', 'inicio', '20444444-4'),

-- Proyecto 2 (ICINF - en_desarrollo)
(2, 'Análisis de Requerimientos', 'Levantamiento y documentación de requerimientos', DATE_SUB(NOW(), INTERVAL 80 DAY), DATE_SUB(NOW(), INTERVAL 75 DAY), 15, 'completado', 'analisis', '19999999-9'),
(2, 'Diseño de Arquitectura', 'Diseño de la arquitectura del sistema', DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY), 20, 'completado', 'diseno', '19999999-9'),
(2, 'Implementación Módulo 1', 'Desarrollo del módulo principal', DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, 25, 'en_progreso', 'implementacion', '19999999-9'),
(2, 'Testing Módulo 1', 'Pruebas unitarias e integración', DATE_ADD(NOW(), INTERVAL 15 DAY), NULL, 15, 'pendiente', 'testing', '19999999-9'),

-- Proyecto 5 (IECI - en_revision)
(5, 'Documentación Final', 'Elaboración del informe final', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 20, 'completado', 'documentacion', '19222222-2'),
(5, 'Preparación Defensa', 'Preparación de presentación para defensa', DATE_ADD(NOW(), INTERVAL 7 DAY), NULL, 10, 'pendiente', 'defensa', '19222222-2');

-- ============================================
-- AVANCES DE PROYECTO
-- ============================================
INSERT INTO avances (proyecto_id, estudiante_rut, titulo, descripcion, porcentaje_completado, fecha_avance, archivos, comentarios_profesor, profesor_rut) VALUES
-- Proyecto 2
(2, '19999999-9', 'Avance Semana 1', 'Completado análisis de requerimientos funcionales y no funcionales. Se documentaron 15 casos de uso principales.', 15, DATE_SUB(NOW(), INTERVAL 75 DAY), '/uploads/avances/proy2_sem1.pdf', 'Buen trabajo, continuar con el diseño', '16666666-6'),
(2, '19999999-9', 'Avance Semana 3', 'Diseño de base de datos y arquitectura del sistema completado. Diagramas UML elaborados.', 35, DATE_SUB(NOW(), INTERVAL 55 DAY), '/uploads/avances/proy2_sem3.pdf', 'Excelente progreso, arquitectura bien definida', '16666666-6'),
(2, '19999999-9', 'Avance Semana 5', 'Implementación del módulo de autenticación y gestión de usuarios al 80%.', 55, DATE_SUB(NOW(), INTERVAL 35 DAY), '/uploads/avances/proy2_sem5.pdf', 'Módulo bien implementado, revisar seguridad', '16666666-6'),
(2, '19999999-9', 'Avance Semana 7', 'Módulo principal completado, iniciando pruebas de integración.', 70, DATE_SUB(NOW(), INTERVAL 15 DAY), '/uploads/avances/proy2_sem7.pdf', NULL, NULL),

-- Proyecto 5
(5, '19222222-2', 'Avance Final', 'Proyecto completado al 100%, documentación lista para revisión.', 100, DATE_SUB(NOW(), INTERVAL 3 DAY), '/uploads/avances/proy5_final.pdf', 'Proyecto bien ejecutado, listo para defensa', '16333333-3');

-- ============================================
-- CRONOGRAMAS DE PROYECTO
-- ============================================
INSERT INTO cronogramas_proyecto (proyecto_id, titulo, descripcion, fecha_inicio, fecha_fin, estado, creado_por, aprobado_por, fecha_aprobacion) VALUES
(2, 'Cronograma Semestre 2025-2', 'Cronograma detallado del desarrollo del proyecto', DATE_SUB(NOW(), INTERVAL 90 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 'activo', '19999999-9', '16666666-6', DATE_SUB(NOW(), INTERVAL 85 DAY)),
(3, 'Plan de Trabajo Q4 2025', 'Planificación trimestral del proyecto', DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_ADD(NOW(), INTERVAL 120 DAY), 'activo', '21222222-2', '16777777-7', DATE_SUB(NOW(), INTERVAL 55 DAY)),
(5, 'Cronograma Final', 'Cronograma de cierre del proyecto', DATE_SUB(NOW(), INTERVAL 120 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 'completado', '19222222-2', '16333333-3', DATE_SUB(NOW(), INTERVAL 115 DAY));

-- ============================================
-- HITOS DE CRONOGRAMA
-- ============================================
INSERT INTO hitos_cronograma (cronograma_id, titulo, descripcion, fecha_inicio, fecha_fin, fecha_entrega_estimada, fecha_entrega_real, prioridad, estado, porcentaje_completado, cumplido_en_fecha, responsable_rut, validado_por, comentarios) VALUES
-- Cronograma 1 (Proyecto 2)
(1, 'Fase de Análisis', 'Análisis completo de requerimientos', DATE_SUB(NOW(), INTERVAL 90 DAY), DATE_SUB(NOW(), INTERVAL 70 DAY), DATE_SUB(NOW(), INTERVAL 70 DAY), DATE_SUB(NOW(), INTERVAL 75 DAY), 'alta', 'completado', 100, TRUE, '19999999-9', '16666666-6', 'Completado antes de tiempo'),
(1, 'Fase de Diseño', 'Diseño de arquitectura y BD', DATE_SUB(NOW(), INTERVAL 70 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY), 'alta', 'completado', 100, TRUE, '19999999-9', '16666666-6', 'Buen diseño'),
(1, 'Implementación Backend', 'Desarrollo del backend', DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), NULL, 'critica', 'en_progreso', 70, NULL, '19999999-9', NULL, NULL),
(1, 'Implementación Frontend', 'Desarrollo del frontend', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), NULL, 'alta', 'pendiente', 0, NULL, '19999999-9', NULL, NULL),

-- Cronograma 3 (Proyecto 5)
(3, 'Entrega Final', 'Entrega del informe final', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 'critica', 'completado', 100, TRUE, '19222222-2', '16333333-3', 'Entregado a tiempo');

-- ============================================
-- CONFIGURACIÓN DE ALERTAS
-- ============================================
INSERT INTO configuracion_alertas (proyecto_id, alerta_inactividad_dias, alerta_proximidad_fecha_dias, alerta_cumplimiento_hitos, alerta_avance_mensual, dias_previos_reunion, notificar_profesor_guia, notificar_estudiante, activo) VALUES
(1, 30, 7, TRUE, TRUE, 3, TRUE, TRUE, TRUE),
(2, 30, 7, TRUE, TRUE, 3, TRUE, TRUE, TRUE),
(3, 30, 7, TRUE, TRUE, 3, TRUE, TRUE, TRUE),
(4, 30, 7, TRUE, TRUE, 3, TRUE, TRUE, TRUE),
(5, 30, 7, TRUE, TRUE, 3, TRUE, TRUE, TRUE);

-- ============================================
-- REUNIONES
-- ============================================
INSERT INTO reuniones (proyecto_id, tipo_reunion, titulo, descripcion, fecha, hora_inicio, hora_fin, ubicacion, modalidad, link_virtual, estado, creado_por) VALUES
-- Reuniones pasadas
(2, 'seguimiento', 'Reunión de Seguimiento Semanal', 'Revisión del avance del proyecto y planificación de la semana', DATE_SUB(NOW(), INTERVAL 7 DAY), '10:00:00', '11:00:00', 'Sala 201, Edificio Negocios', 'presencial', NULL, 'realizada', '16666666-6'),
(2, 'revision_avance', 'Revisión Hito 1', 'Revisión del primer hito del proyecto', DATE_SUB(NOW(), INTERVAL 45 DAY), '14:00:00', '15:30:00', NULL, 'virtual', 'https://meet.google.com/abc-defg-hij', 'realizada', '16666666-6'),

-- Reuniones programadas
(2, 'seguimiento', 'Seguimiento Semanal', 'Seguimiento del desarrollo del backend', DATE_ADD(NOW(), INTERVAL 3 DAY), '15:00:00', '16:00:00', NULL, 'virtual', 'https://meet.google.com/xyz-abcd-efg', 'programada', '19999999-9'),
(3, 'orientacion', 'Asesoría Técnica', 'Resolución de dudas técnicas sobre implementación', DATE_ADD(NOW(), INTERVAL 5 DAY), '11:00:00', '12:00:00', 'Oficina Profesor', 'presencial', NULL, 'programada', '16777777-7'),
(5, 'defensa_parcial', 'Defensa Preliminar', 'Presentación preliminar antes de la defensa final', DATE_ADD(NOW(), INTERVAL 10 DAY), '09:00:00', '10:30:00', 'Auditorio Principal', 'presencial', NULL, 'programada', '16333333-3');

-- ============================================
-- PARTICIPANTES DE REUNIONES
-- ============================================
INSERT INTO participantes_reuniones (reunion_id, usuario_rut, rol_participante, confirmacion, comentarios) VALUES
-- Reunión 1 (pasada)
(1, '16666666-6', 'organizador', 'confirmada', NULL),
(1, '19999999-9', 'participante', 'confirmada', 'Reunión muy productiva'),

-- Reunión 2 (pasada)
(2, '16666666-6', 'organizador', 'confirmada', NULL),
(2, '19999999-9', 'participante', 'confirmada', NULL),
(2, '16101010-K', 'observador', 'confirmada', NULL),

-- Reunión 3 (programada)
(3, '19999999-9', 'organizador', 'confirmada', NULL),
(3, '16666666-6', 'participante', 'pendiente', NULL),

-- Reunión 4 (programada)
(4, '16777777-7', 'organizador', 'confirmada', NULL),
(4, '21222222-2', 'participante', 'confirmada', NULL);

-- ============================================
-- REUNIONES CALENDARIO (Sistema de matching)
-- ============================================
INSERT INTO reuniones_calendario (proyecto_id, profesor_rut, estudiante_rut, fecha_reunion, hora_inicio, hora_fin, tipo_reunion, estado, link_reunion, ubicacion, notas_reunion, creado_por, confirmada_por_profesor, confirmada_por_estudiante, fecha_confirmacion_profesor, fecha_confirmacion_estudiante) VALUES
-- Reuniones confirmadas
(2, '16666666-6', '19999999-9', DATE_ADD(NOW(), INTERVAL 2 DAY), '10:00:00', '11:00:00', 'seguimiento', 'confirmada', 'https://meet.google.com/aaa-bbbb-ccc', NULL, 'Revisión de avance semanal', '19999999-9', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(3, '16777777-7', '21222222-2', DATE_ADD(NOW(), INTERVAL 4 DAY), '15:00:00', '16:00:00', 'orientacion', 'confirmada', NULL, 'Oficina 302', 'Consulta sobre arquitectura', '21222222-2', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Reunión pendiente
(4, '16888888-8', '21222222-2', DATE_ADD(NOW(), INTERVAL 7 DAY), '11:00:00', '12:00:00', 'revision_avance', 'pendiente', 'https://zoom.us/j/123456789', NULL, NULL, '21222222-2', FALSE, TRUE, NULL, NOW()),

-- Reunión realizada
(2, '16666666-6', '19999999-9', DATE_SUB(NOW(), INTERVAL 14 DAY), '14:00:00', '15:00:00', 'seguimiento', 'realizada', NULL, 'Sala 105', 'Se revisó el diseño de la base de datos', '16666666-6', TRUE, TRUE, DATE_SUB(NOW(), INTERVAL 16 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY));

-- ============================================
-- HISTORIAL DE REUNIONES
-- ============================================
INSERT INTO historial_reuniones (reunion_id, accion, realizado_por, detalles) VALUES
(1, 'crear', '16666666-6', 'Reunión creada por el profesor guía'),
(1, 'confirmar', '19999999-9', 'Estudiante confirmó asistencia'),
(1, 'completar', '16666666-6', 'Reunión completada exitosamente'),
(2, 'crear', '16666666-6', 'Reunión de revisión de hito programada'),
(2, 'confirmar', '19999999-9', 'Confirmación de asistencia'),
(2, 'completar', '16666666-6', 'Hito revisado y aprobado'),
(4, 'crear', '16777777-7', 'Asesoría técnica solicitada'),
(4, 'confirmar', '21222222-2', 'Estudiante confirmó asistencia');

-- ============================================
-- ALERTAS DE ABANDONO
-- ============================================
INSERT INTO alertas_abandono (proyecto_id, tipo_alerta, gravedad, descripcion, fecha_generacion, fecha_limite_accion, estado, atendida_por, fecha_atencion, acciones_tomadas) VALUES
-- Proyecto con alerta activa
(1, 'sin_actividad', 'alta', 'El proyecto no ha registrado actividad en los últimos 35 días', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 'activa', NULL, NULL, NULL),

-- Proyecto con alerta atendida
(4, 'sin_avances', 'media', 'No se han registrado avances en el último mes', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), 'atendida', '16888888-8', DATE_SUB(NOW(), INTERVAL 3 DAY), 'Se contactó al estudiante y se reprogramó cronograma'),

-- Alerta de hitos vencidos
(3, 'hitos_vencidos', 'critica', 'Dos hitos del cronograma están vencidos sin completar', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 'activa', NULL, NULL, NULL);

-- ============================================
-- BLOQUEOS DE HORARIOS
-- ============================================
INSERT INTO bloqueos_horarios (usuario_rut, fecha_inicio, fecha_fin, hora_inicio, hora_fin, motivo, tipo_bloqueo, recurrente, frecuencia_recurrencia) VALUES
-- Bloqueos únicos
('16666666-6', DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), '09:00:00', '13:00:00', 'Reunión de Departamento', 'reunion_departamental', FALSE, NULL),
('16777777-7', DATE_ADD(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 8 DAY), '14:00:00', '18:00:00', 'Congreso Nacional de Informática', 'congreso', FALSE, NULL),

-- Bloqueos recurrentes
('16666666-6', NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), '08:00:00', '10:00:00', 'Clases de Ingeniería de Software', 'clase', TRUE, 'semanal'),
('16777777-7', NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), '15:00:00', '17:00:00', 'Clases de Base de Datos', 'clase', TRUE, 'semanal');

-- ============================================
-- DÍAS FERIADOS
-- ============================================
INSERT INTO dias_feriados (fecha, nombre, tipo, recurrente) VALUES
('2026-01-01', 'Año Nuevo', 'nacional', TRUE),
('2026-04-03', 'Viernes Santo', 'nacional', FALSE),
('2026-04-04', 'Sábado Santo', 'nacional', FALSE),
('2026-05-01', 'Día del Trabajador', 'nacional', TRUE),
('2026-05-21', 'Día de las Glorias Navales', 'nacional', TRUE),
('2026-09-18', 'Fiestas Patrias', 'nacional', TRUE),
('2026-09-19', 'Día del Ejército', 'nacional', TRUE),
('2026-10-12', 'Encuentro de Dos Mundos', 'nacional', TRUE),
('2026-12-25', 'Navidad', 'nacional', TRUE);

-- ============================================
-- CONFIGURACIÓN DE MATCHING
-- ============================================
INSERT INTO configuracion_matching (clave, valor, tipo_dato, descripcion, categoria) VALUES
('duracion_minima_reunion', '30', 'integer', 'Duración mínima de reunión en minutos', 'calendario'),
('duracion_maxima_reunion', '120', 'integer', 'Duración máxima de reunión en minutos', 'calendario'),
('horas_anticipacion_minima', '24', 'integer', 'Horas mínimas de anticipación para agendar', 'calendario'),
('permitir_fines_semana', 'false', 'boolean', 'Permitir reuniones en fin de semana', 'calendario'),
('hora_inicio_jornada', '08:00', 'string', 'Hora de inicio de jornada', 'calendario'),
('hora_fin_jornada', '20:00', 'string', 'Hora de fin de jornada', 'calendario');

-- ============================================
-- COMISIÓN EVALUADORA
-- ============================================
INSERT INTO comision_evaluadora (proyecto_id, profesor_rut, rol_comision, fecha_asignacion, activo, observaciones) VALUES
-- Proyecto 5 (próximo a defensa)
(5, '16333333-3', 'presidente', DATE_SUB(NOW(), INTERVAL 30 DAY), TRUE, 'Profesor guía del proyecto'),
(5, '16444444-4', 'secretario', DATE_SUB(NOW(), INTERVAL 30 DAY), TRUE, 'Especialista en el área'),
(5, '16555555-5', 'vocal', DATE_SUB(NOW(), INTERVAL 30 DAY), TRUE, 'Evaluador externo del área'),

-- Proyecto 6 (en preparación)
(6, '16999999-9', 'presidente', DATE_SUB(NOW(), INTERVAL 20 DAY), TRUE, NULL),
(6, '16101010-K', 'secretario', DATE_SUB(NOW(), INTERVAL 20 DAY), TRUE, NULL);

-- ============================================
-- SOLICITUDES DE EXTENSIÓN
-- ============================================
INSERT INTO solicitudes_extension (proyecto_id, solicitante_rut, tipo_extension, fecha_limite_actual, nueva_fecha_propuesta, motivo, justificacion_detallada, estado, revisado_por, fecha_revision, comentarios_revision, dias_extension) VALUES
-- Solicitud aprobada
(3, '21222222-2', 'entrega', DATE_ADD(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'Enfermedad prolongada del estudiante', 'Se adjunta certificado médico que indica reposo de 3 semanas. Se requiere extensión de 30 días para completar implementación.', 'aprobada', '18765432-1', DATE_SUB(NOW(), INTERVAL 5 DAY), 'Aprobada por motivos de salud. Se otorga extensión completa solicitada.', 30),

-- Solicitud rechazada
(4, '21222222-2', 'hito', DATE_ADD(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 45 DAY), 'Complejidad mayor a la estimada', 'El módulo de integración resultó más complejo de lo previsto.', 'rechazada', '18765432-1', DATE_SUB(NOW(), INTERVAL 10 DAY), 'Rechazada. La complejidad era previsible en el análisis inicial.', 0),

-- Solicitud pendiente
(2, '19999999-9', 'defensa', DATE_ADD(NOW(), INTERVAL 45 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'Superposición con otro compromiso académico', 'Defensa de otra asignatura programada en la misma fecha.', 'pendiente', NULL, NULL, NULL, NULL);

-- ============================================
-- ACTAS DE REUNIÓN
-- ============================================
INSERT INTO actas_reunion (reunion_id, acta_numero, fecha_reunion, hora_inicio_real, hora_fin_real, lugar, asistentes, temas_tratados, acuerdos, tareas_asignadas, proxima_reunion, observaciones, elaborado_por, aprobado_por, estado_acta) VALUES
(1, 'ACTA-001-2026', DATE_SUB(NOW(), INTERVAL 7 DAY), '10:05:00', '10:55:00', 'Sala 201', 'Patricia Lagos Fernández (Profesor Guía), Daniel Silva Mora (Estudiante)', 
'1. Revisión avance semana anterior\n2. Análisis de problemas encontrados en testing\n3. Planificación próxima semana', 
'1. Corregir bugs identificados en módulo de autenticación\n2. Completar documentación técnica\n3. Preparar demo para próxima reunión', 
'Estudiante: Corregir bugs (Plazo: 3 días)\nEstudiante: Actualizar documentación (Plazo: 5 días)\nProfesor: Revisar arquitectura propuesta (Plazo: 2 días)', 
DATE_ADD(DATE_SUB(NOW(), INTERVAL 7 DAY), INTERVAL 7 DAY), 
'Reunión productiva. Estudiante muestra buen avance.', 
'16666666-6', '16666666-6', 'aprobada'),

(2, 'ACTA-002-2026', DATE_SUB(NOW(), INTERVAL 45 DAY), '14:00:00', '15:25:00', 'Virtual - Google Meet', 'Patricia Lagos Fernández (Profesor Guía), Daniel Silva Mora (Estudiante), Isabel Gutiérrez Vega (Observador)', 
'1. Presentación del Hito 1\n2. Revisión de arquitectura diseñada\n3. Validación de casos de uso', 
'1. Aprobar diseño de arquitectura con modificaciones menores\n2. Validar 12 de 15 casos de uso\n3. Solicitar ajustes en 3 casos de uso', 
'Estudiante: Ajustar casos de uso CU-03, CU-07, CU-12 (Plazo: 1 semana)\nEstudiante: Documentar decisiones de diseño (Plazo: 3 días)', 
DATE_ADD(DATE_SUB(NOW(), INTERVAL 45 DAY), INTERVAL 14 DAY), 
'Hito 1 aprobado con observaciones menores.', 
'16666666-6', '16666666-6', 'aprobada');

-- ============================================
-- HISTORIAL DE EXTENSIONES
-- ============================================
INSERT INTO historial_extensiones (solicitud_id, accion, fecha_accion, realizado_por, comentarios) VALUES
(1, 'solicitar', DATE_SUB(NOW(), INTERVAL 15 DAY), '21222222-2', 'Solicitud de extensión creada por el estudiante'),
(1, 'revisar', DATE_SUB(NOW(), INTERVAL 8 DAY), '18765432-1', 'Administrador inició revisión de la solicitud'),
(1, 'aprobar', DATE_SUB(NOW(), INTERVAL 5 DAY), '18765432-1', 'Solicitud aprobada por motivos justificados'),
(2, 'solicitar', DATE_SUB(NOW(), INTERVAL 12 DAY), '21222222-2', 'Solicitud de extensión creada'),
(2, 'rechazar', DATE_SUB(NOW(), INTERVAL 10 DAY), '18765432-1', 'Solicitud rechazada por falta de justificación'),
(3, 'solicitar', DATE_SUB(NOW(), INTERVAL 3 DAY), '19999999-9', 'Solicitud pendiente de revisión');

-- ============================================
-- JEFES DE CARRERAS
-- ============================================
INSERT INTO jefes_carreras (carrera_id, profesor_rut, fecha_inicio, fecha_fin, activo) VALUES
(100, '16111111-1', '2024-01-01', NULL, TRUE),
(101, '16222222-2', '2024-01-01', NULL, TRUE);

-- ============================================
-- DEPARTAMENTOS - CARRERAS
-- ============================================
INSERT INTO departamentos_carreras (departamento_id, carrera_id) VALUES
(100, 100),
(100, 101);

-- ============================================
-- CONVERSACIONES (CHAT)
-- ============================================
INSERT INTO conversaciones (proyecto_id, nombre_conversacion, tipo, creado_por) VALUES
(2, 'Chat Proyecto Sistema E-Commerce', 'proyecto', '19999999-9'),
(3, 'Grupo Proyecto IoT', 'proyecto', '21222222-2'),
(NULL, 'Chat Directo', 'directo', '19999999-9');

-- ============================================
-- MENSAJES (CHAT)
-- ============================================
INSERT INTO mensajes (conversacion_id, remitente_rut, contenido, tipo_mensaje, archivo_adjunto, editado) VALUES
-- Conversación 1 (Proyecto 2)
(1, '19999999-9', 'Hola profesor, he completado el diseño de la base de datos. ¿Puede revisarlo?', 'texto', NULL, FALSE),
(1, '16666666-6', 'Perfecto, voy a revisarlo ahora mismo. ¿Lo subiste al repositorio?', 'texto', NULL, FALSE),
(1, '19999999-9', 'Sí, está en la rama develop. Adjunto el diagrama ER.', 'archivo', '/uploads/chat/diagrama_er.pdf', FALSE),
(1, '16666666-6', 'Excelente trabajo. Solo algunas observaciones menores en las relaciones.', 'texto', NULL, FALSE),

-- Conversación 2 (Proyecto 3)
(2, '21222222-2', 'Necesito ayuda con la configuración del sensor de temperatura.', 'texto', NULL, FALSE),
(2, '16777777-7', '¿Qué error te está dando? Envía una captura.', 'texto', NULL, FALSE),
(2, '21222222-2', 'Este es el error que me aparece en el monitor serial.', 'archivo', '/uploads/chat/error_sensor.png', FALSE);

-- ============================================
-- MENSAJES NO LEÍDOS
-- ============================================
INSERT INTO mensajes_no_leidos (mensaje_id, usuario_rut) VALUES
(7, '16777777-7');

-- ============================================
-- CONFIGURACIÓN DEL SISTEMA
-- ============================================
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria, modificado_por) VALUES
('tiempo_maximo_propuesta_dias', '90', 'numero', 'Días máximos para revisar propuesta', 'propuestas', '17654321-0'),
('tiempo_maximo_proyecto_semestres', '3', 'numero', 'Semestres máximos para completar proyecto', 'proyectos', '17654321-0'),
('permitir_extensiones', 'true', 'booleano', 'Permitir solicitudes de extensión', 'proyectos', '17654321-0'),
('max_extensiones_por_proyecto', '2', 'numero', 'Máximo de extensiones permitidas', 'proyectos', '17654321-0'),
('dias_alerta_inactividad', '30', 'numero', 'Días sin actividad para generar alerta', 'alertas', '17654321-0'),
('email_notificaciones', 'titulacion@ubiobio.cl', 'texto', 'Email para notificaciones del sistema', 'general', '17654321-0'),
('habilitar_chat', 'true', 'booleano', 'Habilitar sistema de chat', 'chat', '17654321-0'),
('habilitar_calendario_matching', 'true', 'booleano', 'Habilitar calendario con matching', 'calendario', '17654321-0');

-- ============================================
-- ACTIVIDAD DEL SISTEMA
-- ============================================
INSERT INTO actividad_sistema (usuario_rut, accion, entidad_tipo, entidad_id, ip_address, user_agent, detalles) VALUES
('17654321-0', 'login', 'usuario', NULL, '192.168.1.100', 'Mozilla/5.0', 'Inicio de sesión exitoso'),
('19999999-9', 'crear_avance', 'avance', 1, '192.168.1.101', 'Chrome/120.0', 'Creó avance del proyecto'),
('16666666-6', 'revisar_avance', 'avance', 1, '192.168.1.102', 'Firefox/121.0', 'Revisó y comentó avance'),
('21222222-2', 'solicitar_extension', 'extension', 3, '192.168.1.103', 'Safari/17.0', 'Solicitó extensión de plazo'),
('18765432-1', 'aprobar_extension', 'extension', 1, '192.168.1.104', 'Chrome/120.0', 'Aprobó solicitud de extensión'),
('19999999-9', 'enviar_mensaje', 'mensaje', 1, '192.168.1.101', 'Chrome/120.0', 'Envió mensaje en chat del proyecto');

-- ============================================
-- COLABORADORES - PROYECTOS
-- ============================================
INSERT INTO colaboradores_proyectos (colaborador_id, proyecto_id, rol_colaborador, fecha_inicio, fecha_fin, horas_semanales, estado, area_participacion, objetivos_colaboracion, entregables_esperados, evaluacion_desempeno, aprobado_por) VALUES
-- Proyecto 2 con colaborador externo
(1, 2, 'supervisor_empresa', DATE_SUB(NOW(), INTERVAL 60 DAY), NULL, 4, 'activo', 'Desarrollo de Software, Arquitectura', 
'Supervisar el desarrollo del sistema desde perspectiva empresarial, validar requisitos con casos reales', 
'1. Validación de requisitos funcionales\n2. Revisión de arquitectura propuesta\n3. Feedback sobre usabilidad', 
NULL, '18765432-1'),

-- Proyecto 3 con mentor
(2, 3, 'mentor', DATE_SUB(NOW(), INTERVAL 45 DAY), NULL, 2, 'activo', 'IoT, Machine Learning', 
'Asesorar en implementación de algoritmos de ML para análisis de datos de sensores', 
'1. Asesoría técnica en ML\n2. Revisión de código Python\n3. Recomendaciones de optimización', 
8.5, '18765432-1');

-- ============================================
-- EVALUACIONES DE COLABORADORES EXTERNOS
-- ============================================
INSERT INTO evaluaciones_colaboradores_externos (colaborador_proyecto_id, evaluador_rut, tipo_evaluador, calificacion_general, calificacion_conocimiento, calificacion_disponibilidad, calificacion_comunicacion, comentarios, recomendaria) VALUES
(2, '21222222-2', 'estudiante', 9, 10, 8, 9, 'Excelente mentor, muy claro en sus explicaciones y siempre disponible para resolver dudas. Su experiencia en ML fue fundamental para el proyecto.', TRUE),
(2, '16777777-7', 'profesor_guia', 9, 9, 9, 9, 'Colaborador muy comprometido. Aportó significativamente al proyecto con su experiencia práctica.', TRUE);

-- ============================================
-- VERSIONES DE DOCUMENTOS
-- ============================================
INSERT INTO versiones_documento (proyecto_id, titulo, tipo_documento, numero_version, ruta_archivo, tamanio_bytes, subido_por, comentarios_version, es_version_final, aprobado_por, fecha_aprobacion) VALUES
-- Proyecto 2
(2, 'Informe de Análisis de Requerimientos', 'informe_avance', 1, '/uploads/documentos/proy2_analisis_v1.pdf', 1048576, '19999999-9', 'Primera versión del análisis', FALSE, NULL, NULL),
(2, 'Informe de Análisis de Requerimientos', 'informe_avance', 2, '/uploads/documentos/proy2_analisis_v2.pdf', 1153433, '19999999-9', 'Versión corregida según observaciones', FALSE, '16666666-6', DATE_SUB(NOW(), INTERVAL 70 DAY)),
(2, 'Diseño de Arquitectura del Sistema', 'informe_avance', 1, '/uploads/documentos/proy2_arquitectura_v1.pdf', 2097152, '19999999-9', 'Diseño completo de arquitectura', FALSE, '16666666-6', DATE_SUB(NOW(), INTERVAL 50 DAY)),

-- Proyecto 5
(5, 'Informe Final', 'informe_final', 1, '/uploads/documentos/proy5_final_v1.pdf', 5242880, '19222222-2', 'Borrador del informe final', FALSE, NULL, NULL),
(5, 'Informe Final', 'informe_final', 2, '/uploads/documentos/proy5_final_v2.pdf', 5452595, '19222222-2', 'Versión final corregida', TRUE, '16333333-3', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- ============================================
-- COMENTARIOS DE VERSIONES
-- ============================================
INSERT INTO comentarios_version (version_id, comentarista_rut, comentario, tipo_comentario, linea_inicio, linea_fin, estado_comentario, resuelto_por, fecha_resolucion) VALUES
-- Comentarios en versión 1 del análisis (Proyecto 2)
(1, '16666666-6', 'Falta detallar los requisitos no funcionales de rendimiento', 'revision', 45, 48, 'resuelto', '19999999-9', DATE_SUB(NOW(), INTERVAL 75 DAY)),
(1, '16666666-6', 'Los casos de uso CU-05 y CU-07 necesitan más detalle en el flujo alternativo', 'correccion', 78, 95, 'resuelto', '19999999-9', DATE_SUB(NOW(), INTERVAL 75 DAY)),

-- Comentarios en diseño de arquitectura
(3, '16666666-6', 'Excelente elección del patrón MVC. Bien justificado.', 'aprobacion', NULL, NULL, 'resuelto', NULL, DATE_SUB(NOW(), INTERVAL 50 DAY)),
(3, '16101010-K', 'Considerar agregar capa de cache para mejorar performance', 'sugerencia', 120, 125, 'pendiente', NULL, NULL),

-- Comentarios en informe final (Proyecto 5)
(4, '16333333-3', 'El abstract necesita ser más conciso. Reducir a 250 palabras máximo.', 'correccion', 1, 5, 'resuelto', '19222222-2', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, '16333333-3', 'Informe aprobado. Excelente trabajo.', 'aprobacion', NULL, NULL, 'resuelto', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY));

-- ============================================
-- PLANTILLAS DE DOCUMENTOS
-- ============================================
INSERT INTO plantillas_documentos (nombre, descripcion, tipo_documento, categoria, ruta_archivo, version, idioma, formato, tamanio_bytes, creado_por, es_oficial, activa) VALUES
('Plantilla Propuesta de Proyecto', 'Plantilla oficial para propuestas de proyectos de titulación', 'propuesta', 'academico', '/uploads/plantillas/plantilla_propuesta_v1.docx', '1.0', 'es', 'docx', 524288, '18765432-1', TRUE, TRUE),
('Plantilla Informe de Avance', 'Plantilla para informes de avance mensuales', 'informe_avance', 'academico', '/uploads/plantillas/plantilla_avance_v1.docx', '1.0', 'es', 'docx', 327680, '18765432-1', TRUE, TRUE),
('Plantilla Informe Final', 'Plantilla oficial para informe final de proyecto', 'informe_final', 'academico', '/uploads/plantillas/plantilla_final_v2.docx', '2.0', 'es', 'docx', 655360, '18765432-1', TRUE, TRUE),
('Plantilla Acta de Reunión', 'Plantilla para actas de reuniones', 'acta', 'administrativo', '/uploads/plantillas/plantilla_acta_v1.docx', '1.0', 'es', 'docx', 204800, '18765432-1', TRUE, TRUE),
('Plantilla Cronograma', 'Plantilla Excel para cronograma de proyecto', 'cronograma', 'planificacion', '/uploads/plantillas/plantilla_cronograma_v1.xlsx', '1.0', 'es', 'xlsx', 409600, '18765432-1', TRUE, TRUE);

-- ============================================
-- RESULTADOS FINALES DE PROYECTOS
-- ============================================
INSERT INTO resultados_finales_proyecto (proyecto_id, nota_final, nota_informe, nota_presentacion, nota_producto, nota_proceso, fecha_defensa, miembros_comision, acta_defensa, observaciones_finales, estado_titulacion, fecha_titulacion, titulo_otorgado) VALUES
-- Proyecto completado exitosamente
(5, 6.5, 6.7, 6.3, 6.8, 6.2, DATE_SUB(NOW(), INTERVAL 5 DAY), 
'Presidente: Carmen Vargas Díaz\nSecretario: Jorge Muñoz Rojas\nVocal: Patricia Lagos Fernández', 
'/uploads/actas/acta_defensa_proy5.pdf', 
'Proyecto bien ejecutado. Solución innovadora con buen fundamento teórico. Presentación clara y profesional.', 
'titulado', DATE_SUB(NOW(), INTERVAL 3 DAY), 'Ingeniero de Ejecución en Computación e Informática');

-- ============================================
-- HISTORIAL DE ESTADOS DE PROYECTO
-- ============================================
INSERT INTO historial_estados_proyecto (proyecto_id, estado_anterior_id, estado_nuevo_id, fecha_cambio, cambiado_por, motivo) VALUES
-- Proyecto 2 (en desarrollo)
(2, 1, 2, DATE_SUB(NOW(), INTERVAL 85 DAY), '18765432-1', 'Profesores asignados, proyecto iniciado'),

-- Proyecto 5 (completado)
(5, 1, 2, DATE_SUB(NOW(), INTERVAL 120 DAY), '18765432-1', 'Proyecto iniciado'),
(5, 2, 3, DATE_SUB(NOW(), INTERVAL 10 DAY), '16333333-3', 'Informe enviado para revisión'),
(5, 3, 5, DATE_SUB(NOW(), INTERVAL 5 DAY), '16333333-3', 'Informe aprobado, proyecto listo para defensa');

-- ============================================
-- EVALUACIONES DE COLABORADORES (Sistema interno)
-- ============================================
INSERT INTO evaluaciones_colaboradores (colaborador_proyecto_id, evaluado_por, tipo_evaluador, periodo_evaluacion, competencia_tecnica, cumplimiento_objetivos, comunicacion, proactividad, comentarios, fortalezas, areas_mejora, recomendaciones) VALUES
(1, '19999999-9', 'estudiante', 'Evaluación Semestral', 9, 9, 10, 9, 
'Fernando ha sido un supervisor excepcional. Su experiencia en la industria ha sido invaluable.', 
'Gran conocimiento técnico, excelente comunicación, siempre disponible', 
'Ninguna área significativa de mejora observada', 
'Altamente recomendado para futuros proyectos'),

(1, '16666666-6', 'profesor', 'Evaluación Semestral', 9, 9, 9, 10, 
'Colaborador muy comprometido y profesional. Aporta perspectiva empresarial valiosa.', 
'Experiencia práctica, feedback constructivo, puntualidad', 
'Podría profundizar más en aspectos académicos', 
'Excelente colaborador para proyectos con enfoque empresarial');

-- ============================================
-- TOKENS DE COLABORADORES
-- ============================================
INSERT INTO tokens_colaboradores (colaborador_id, token, tipo_token, expiracion, usado) VALUES
(1, 'tok_abcd1234efgh5678ijkl', 'acceso_proyecto', DATE_ADD(NOW(), INTERVAL 90 DAY), FALSE),
(2, 'tok_mnop9012qrst3456uvwx', 'acceso_proyecto', DATE_ADD(NOW(), INTERVAL 90 DAY), FALSE),
(3, 'tok_yzab7890cdef1234ghij', 'activacion', DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE);

-- ============================================
-- NOTIFICACIONES DE COLABORADORES
-- ============================================
INSERT INTO notificaciones_colaboradores (colaborador_id, tipo_notificacion, titulo, mensaje, leida, proyecto_id, url_destino) VALUES
(1, 'nuevo_avance', 'Nuevo avance disponible', 'El estudiante Daniel Silva ha subido un nuevo avance del proyecto. Puede revisarlo en la plataforma.', FALSE, 2, '/proyectos/2/avances'),
(2, 'reunion_programada', 'Reunión programada', 'Se ha programado una reunión para el 10 de enero. Por favor confirme su asistencia.', FALSE, 3, '/reuniones/4'),
(1, 'evaluacion_pendiente', 'Evaluación pendiente', 'Tiene una evaluación pendiente del estudiante. Por favor complete la evaluación.', TRUE, 2, '/evaluaciones/1');

-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Script completo ejecutado exitosamente' AS Resultado;

-- Verificación de datos insertados
SELECT 
    'historial_revisiones_propuestas' AS tabla, COUNT(*) AS registros FROM historial_revisiones_propuestas
UNION ALL SELECT 'archivos_propuesta', COUNT(*) FROM archivos_propuesta
UNION ALL SELECT 'hitos_proyecto', COUNT(*) FROM hitos_proyecto
UNION ALL SELECT 'avances', COUNT(*) FROM avances
UNION ALL SELECT 'cronogramas_proyecto', COUNT(*) FROM cronogramas_proyecto
UNION ALL SELECT 'hitos_cronograma', COUNT(*) FROM hitos_cronograma
UNION ALL SELECT 'configuracion_alertas', COUNT(*) FROM configuracion_alertas
UNION ALL SELECT 'reuniones', COUNT(*) FROM reuniones
UNION ALL SELECT 'participantes_reuniones', COUNT(*) FROM participantes_reuniones
UNION ALL SELECT 'reuniones_calendario', COUNT(*) FROM reuniones_calendario
UNION ALL SELECT 'historial_reuniones', COUNT(*) FROM historial_reuniones
UNION ALL SELECT 'alertas_abandono', COUNT(*) FROM alertas_abandono
UNION ALL SELECT 'bloqueos_horarios', COUNT(*) FROM bloqueos_horarios
UNION ALL SELECT 'dias_feriados', COUNT(*) FROM dias_feriados
UNION ALL SELECT 'configuracion_matching', COUNT(*) FROM configuracion_matching
UNION ALL SELECT 'comision_evaluadora', COUNT(*) FROM comision_evaluadora
UNION ALL SELECT 'solicitudes_extension', COUNT(*) FROM solicitudes_extension
UNION ALL SELECT 'actas_reunion', COUNT(*) FROM actas_reunion
UNION ALL SELECT 'historial_extensiones', COUNT(*) FROM historial_extensiones
UNION ALL SELECT 'jefes_carreras', COUNT(*) FROM jefes_carreras
UNION ALL SELECT 'departamentos_carreras', COUNT(*) FROM departamentos_carreras
UNION ALL SELECT 'conversaciones', COUNT(*) FROM conversaciones
UNION ALL SELECT 'mensajes', COUNT(*) FROM mensajes
UNION ALL SELECT 'mensajes_no_leidos', COUNT(*) FROM mensajes_no_leidos
UNION ALL SELECT 'configuracion_sistema', COUNT(*) FROM configuracion_sistema
UNION ALL SELECT 'actividad_sistema', COUNT(*) FROM actividad_sistema
UNION ALL SELECT 'colaboradores_proyectos', COUNT(*) FROM colaboradores_proyectos
UNION ALL SELECT 'evaluaciones_colaboradores_externos', COUNT(*) FROM evaluaciones_colaboradores_externos
UNION ALL SELECT 'versiones_documento', COUNT(*) FROM versiones_documento
UNION ALL SELECT 'comentarios_version', COUNT(*) FROM comentarios_version
UNION ALL SELECT 'plantillas_documentos', COUNT(*) FROM plantillas_documentos
UNION ALL SELECT 'resultados_finales_proyecto', COUNT(*) FROM resultados_finales_proyecto
UNION ALL SELECT 'historial_estados_proyecto', COUNT(*) FROM historial_estados_proyecto
UNION ALL SELECT 'evaluaciones_colaboradores', COUNT(*) FROM evaluaciones_colaboradores
UNION ALL SELECT 'tokens_colaboradores', COUNT(*) FROM tokens_colaboradores
UNION ALL SELECT 'notificaciones_colaboradores', COUNT(*) FROM notificaciones_colaboradores;
