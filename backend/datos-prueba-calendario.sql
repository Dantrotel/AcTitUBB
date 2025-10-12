-- ===== DATOS DE PRUEBA PARA SISTEMA DE CALENDARIO CON MATCHING =====

-- 1. Crear propuesta de prueba
INSERT IGNORE INTO propuestas (
    id, titulo, descripcion, estudiante_rut, estado_id, 
    comentarios_profesor, fecha_envio, fecha_aprobacion, proyecto_id
) VALUES (
    1, 
    'Sistema de Gestión de Inventarios',
    'Desarrollo de un sistema web para gestión de inventarios en tiempo real con tecnologías modernas',
    '12345678-9', 
    4, -- Estado: aprobada
    'Excelente propuesta, muy bien estructurada',
    '2025-01-15',
    '2025-01-20',
    1 -- Se creará el proyecto con este ID
);

-- 2. Crear proyecto de prueba
INSERT IGNORE INTO proyectos (
    id, titulo, descripcion, propuesta_id, estudiante_rut, 
    estado_id, fecha_inicio, fecha_entrega_estimada
) VALUES (
    1,
    'Sistema de Gestión de Inventarios',
    'Desarrollo de un sistema web para gestión de inventarios en tiempo real con React y Node.js',
    1, -- Referencia a la propuesta
    '12345678-9', -- Ana Estudiante
    1, -- Estado: en_desarrollo
    '2025-01-21',
    '2025-06-30'
);

-- 3. Asignar profesor guía al proyecto
INSERT IGNORE INTO asignaciones_profesores (
    proyecto_id, profesor_rut, rol_profesor, fecha_asignacion, activo
) VALUES (
    1, -- Proyecto: Sistema de Gestión de Inventarios
    '98765432-1', -- Carlos Profesor
    'profesor_guia',
    '2025-01-21',
    TRUE
);

-- 4. Crear disponibilidades de ejemplo

-- Disponibilidades del Profesor Carlos
INSERT IGNORE INTO disponibilidades (usuario_rut, dia_semana, hora_inicio, hora_fin) VALUES
('98765432-1', 'lunes', '09:00', '12:00'),
('98765432-1', 'lunes', '14:00', '17:00'),
('98765432-1', 'martes', '10:00', '13:00'),
('98765432-1', 'miercoles', '09:00', '11:00'),
('98765432-1', 'miercoles', '15:00', '18:00'),
('98765432-1', 'jueves', '08:00', '12:00'),
('98765432-1', 'viernes', '14:00', '16:00');

-- Disponibilidades de la Estudiante Ana
INSERT IGNORE INTO disponibilidades (usuario_rut, dia_semana, hora_inicio, hora_fin) VALUES
('12345678-9', 'lunes', '10:00', '11:00'),
('12345678-9', 'lunes', '15:00', '16:00'),
('12345678-9', 'martes', '11:00', '12:00'),
('12345678-9', 'miercoles', '09:30', '10:30'),
('12345678-9', 'miercoles', '16:00', '17:00'),
('12345678-9', 'jueves', '09:00', '11:00'),
('12345678-9', 'viernes', '14:30', '15:30');

-- 5. Crear ejemplo de bloqueo de horarios (profesor en vacaciones)
INSERT IGNORE INTO bloqueos_horarios (
    usuario_rut, fecha_inicio, fecha_fin, motivo, tipo
) VALUES (
    '98765432-1', 
    '2025-02-10', 
    '2025-02-14', 
    'Vacaciones de verano', 
    'vacaciones'
);

-- 6. Crear una solicitud de reunión de ejemplo
INSERT IGNORE INTO solicitudes_reunion (
    proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta, 
    hora_propuesta, tipo_reunion, descripcion, estado, creado_por
) VALUES (
    1, -- Sistema de Gestión de Inventarios
    '98765432-1', -- Carlos Profesor
    '12345678-9', -- Ana Estudiante
    '2025-02-03', -- Próximo lunes
    '10:30', -- Horario donde ambos están disponibles
    'seguimiento',
    'Primera reunión de seguimiento para definir alcance del proyecto',
    'pendiente',
    'sistema'
);

-- 7. Crear una segunda propuesta y proyecto para más pruebas
INSERT IGNORE INTO propuestas (
    id, titulo, descripcion, estudiante_rut, estado_id, 
    comentarios_profesor, fecha_envio, fecha_aprobacion, proyecto_id
) VALUES (
    2, 
    'Aplicación Móvil de Transporte',
    'Desarrollo de una aplicación móvil para gestión de transporte público',
    '12345678-9', 
    4, -- Estado: aprobada
    'Buena propuesta, innovadora',
    '2025-01-10',
    '2025-01-18',
    2
);

INSERT IGNORE INTO proyectos (
    id, titulo, descripcion, propuesta_id, estudiante_rut, 
    estado_id, fecha_inicio, fecha_entrega_estimada
) VALUES (
    2,
    'Aplicación Móvil de Transporte',
    'App móvil con React Native para gestión de rutas de transporte público',
    2,
    '12345678-9',
    1, -- Estado: en_desarrollo
    '2025-01-19',
    '2025-07-15'
);

-- Asignar mismo profesor a segundo proyecto (diferentes roles)
INSERT IGNORE INTO asignaciones_profesores (
    proyecto_id, profesor_rut, rol_profesor, fecha_asignacion, activo
) VALUES (
    2, -- Aplicación Móvil
    '98765432-1', -- Carlos Profesor
    'profesor_informante', -- Diferente rol
    '2025-01-19',
    TRUE
);

-- 8. Crear fechas importantes para los proyectos
INSERT IGNORE INTO fechas_importantes (
    proyecto_id, tipo_fecha, titulo, descripcion, fecha_limite
) VALUES 
(1, 'entrega_avance', 'Primera Entrega', 'Entrega del primer avance del sistema', '2025-03-15'),
(1, 'defensa', 'Defensa Final', 'Defensa final del proyecto de título', '2025-06-20'),
(2, 'entrega_avance', 'Prototipo App', 'Entrega del prototipo funcional', '2025-04-10'),
(2, 'presentacion', 'Presentación Intermedia', 'Presentación de avances a comité', '2025-05-15');

-- ===== VERIFICACIÓN DE DATOS CREADOS =====

-- Query para verificar la estructura completa
/*
SELECT 'Verificación de datos de prueba creados:' as mensaje;

SELECT 
    p.id,
    p.titulo as proyecto,
    p.estudiante_rut,
    u.nombre as estudiante,
    ap.profesor_rut,
    up.nombre as profesor,
    ap.rol_profesor
FROM proyectos p
JOIN usuarios u ON p.estudiante_rut = u.rut
JOIN asignaciones_profesores ap ON p.id = ap.proyecto_id
JOIN usuarios up ON ap.profesor_rut = up.rut
WHERE ap.activo = TRUE;

SELECT 
    d.usuario_rut,
    u.nombre,
    d.dia_semana,
    d.hora_inicio,
    d.hora_fin
FROM disponibilidades d
JOIN usuarios u ON d.usuario_rut = u.rut
WHERE d.activo = TRUE
ORDER BY d.usuario_rut, d.dia_semana;

SELECT 
    sr.id,
    sr.proyecto_id,
    p.titulo,
    sr.fecha_propuesta,
    sr.hora_propuesta,
    sr.tipo_reunion,
    sr.estado
FROM solicitudes_reunion sr
JOIN proyectos p ON sr.proyecto_id = p.id;
*/

-- Mensaje de confirmación
SELECT 'Datos de prueba para Sistema de Calendario con Matching creados exitosamente' as status;