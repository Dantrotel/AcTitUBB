-- ============================================
-- FIX: Actualizar vista v_solicitudes_pendientes
-- para que retorne fecha_propuesta como string YYYY-MM-DD
-- en lugar de timestamp ISO
-- ============================================

USE AcTitUBB;

DROP VIEW IF EXISTS v_solicitudes_pendientes;

CREATE VIEW v_solicitudes_pendientes AS
SELECT 
    sr.id,
    sr.proyecto_id,
    sr.profesor_rut,
    sr.estudiante_rut,
    DATE_FORMAT(sr.fecha_propuesta, '%Y-%m-%d') as fecha_propuesta,
    sr.hora_propuesta,
    sr.duracion_minutos,
    sr.tipo_reunion,
    sr.descripcion,
    sr.estado,
    sr.created_at,
    sr.comentarios_profesor,
    p.titulo as proyecto_titulo,
    ue.nombre as estudiante_nombre,
    up.nombre as profesor_nombre,
    TIMESTAMPDIFF(HOUR, sr.created_at, NOW()) as horas_esperando
FROM solicitudes_reunion sr
INNER JOIN proyectos p ON sr.proyecto_id = p.id
INNER JOIN usuarios ue ON sr.estudiante_rut = ue.rut
INNER JOIN usuarios up ON sr.profesor_rut = up.rut
WHERE sr.estado = 'pendiente';

SELECT '✅ Vista v_solicitudes_pendientes actualizada con formato de fecha correcto' as Estado;
