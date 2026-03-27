import { Router } from 'express';
import { verifySession } from '../middlewares/verifySession.js';
import { pool } from '../db/connectionDB.js';
import { logger } from '../config/logger.js';
import { flush } from '../config/cache.js';

const router = Router();

// ===== RUTAS PARA PRE-ASIGNACIÓN DE CO-GUÍA A ESTUDIANTE =====

/**
 * GET /co-guias-estudiantes
 * Admin: listar todas las asignaciones de co-guía activas
 */
router.get('/', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden listar co-guías de estudiantes' });
        }

        const [rows] = await pool.execute(`
            SELECT
                cge.id,
                cge.estudiante_rut,
                ue.nombre  AS estudiante_nombre,
                ue.email   AS estudiante_email,
                cge.profesor_co_guia_rut,
                up.nombre  AS profesor_nombre,
                up.email   AS profesor_email,
                cge.activo,
                cge.fecha_asignacion,
                cge.observaciones,
                ua.nombre  AS asignado_por_nombre,
                cge.asignado_por
            FROM co_guias_estudiantes cge
            INNER JOIN usuarios ue ON cge.estudiante_rut      = ue.rut
            INNER JOIN usuarios up ON cge.profesor_co_guia_rut = up.rut
            LEFT JOIN usuarios ua  ON cge.asignado_por         = ua.rut
            WHERE cge.activo = TRUE
            ORDER BY cge.fecha_asignacion DESC
        `);

        res.json({ success: true, data: rows });
    } catch (error) {
        logger.error('Error al listar co-guías de estudiantes', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * GET /co-guias-estudiantes/estudiante/:estudiante_rut
 * Admin o el propio estudiante: obtener co-guía de un estudiante específico
 */
router.get('/estudiante/:estudiante_rut', verifySession, async (req, res) => {
    try {
        const { estudiante_rut } = req.params;

        if (![3, 4].includes(req.user.role_id) && req.user.rut !== estudiante_rut) {
            return res.status(403).json({ success: false, message: 'Sin permisos para ver este dato' });
        }

        const [rows] = await pool.execute(`
            SELECT
                cge.id,
                cge.profesor_co_guia_rut,
                u.nombre  AS profesor_nombre,
                u.email   AS profesor_email,
                cge.fecha_asignacion,
                cge.observaciones,
                cge.activo
            FROM co_guias_estudiantes cge
            INNER JOIN usuarios u ON cge.profesor_co_guia_rut = u.rut
            WHERE cge.estudiante_rut = ? AND cge.activo = TRUE
            ORDER BY cge.fecha_asignacion DESC
            LIMIT 1
        `, [estudiante_rut]);

        if (rows.length === 0) {
            return res.json({ success: true, data: null, tieneCoGuia: false });
        }

        res.json({ success: true, data: rows[0], tieneCoGuia: true });
    } catch (error) {
        logger.error('Error al obtener co-guía de estudiante', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * POST /co-guias-estudiantes
 * Admin: asignar un co-guía a un estudiante
 * Body: { estudiante_rut, profesor_co_guia_rut, observaciones? }
 */
router.post('/', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden asignar co-guías a estudiantes' });
        }

        const { estudiante_rut, profesor_co_guia_rut, observaciones } = req.body;

        if (!estudiante_rut || !profesor_co_guia_rut) {
            return res.status(400).json({ success: false, message: 'Se requieren estudiante_rut y profesor_co_guia_rut' });
        }

        // Verificar que el estudiante existe y es estudiante (rol_id = 1)
        const [estRows] = await pool.execute(
            'SELECT rut FROM usuarios WHERE rut = ? AND rol_id = 1',
            [estudiante_rut]
        );
        if (estRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        // Verificar que el profesor existe y es profesor o admin (rol_id 2,3,4)
        const [profRows] = await pool.execute(
            'SELECT rut FROM usuarios WHERE rut = ? AND rol_id IN (2, 3, 4)',
            [profesor_co_guia_rut]
        );
        if (profRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
        }

        // Desactivar co-guía anterior si existe
        const [existing] = await pool.execute(
            'SELECT id FROM co_guias_estudiantes WHERE estudiante_rut = ? AND activo = TRUE',
            [estudiante_rut]
        );
        if (existing.length > 0) {
            await pool.execute(
                'UPDATE co_guias_estudiantes SET activo = FALSE, fecha_desasignacion = NOW() WHERE estudiante_rut = ? AND activo = TRUE',
                [estudiante_rut]
            );
        }

        // Crear nueva asignación
        const [result] = await pool.execute(
            `INSERT INTO co_guias_estudiantes (estudiante_rut, profesor_co_guia_rut, asignado_por, observaciones)
             VALUES (?, ?, ?, ?)`,
            [estudiante_rut, profesor_co_guia_rut, req.user.rut, observaciones ?? null]
        );

        logger.info('Co-guía asignado a estudiante', { estudiante_rut, profesor_co_guia_rut, asignado_por: req.user.rut });

        // Sincronizar asignaciones_proyectos para proyectos activos del estudiante
        try {
            const [rolRows] = await pool.execute(
                "SELECT id FROM roles_profesores WHERE nombre = 'Profesor Co-Guía' LIMIT 1"
            );
            if (rolRows.length > 0) {
                const rol_profesor_id = rolRows[0].id;
                const [proyectos] = await pool.execute(
                    'SELECT id FROM proyectos WHERE estudiante_rut = ? AND activo = TRUE',
                    [estudiante_rut]
                );
                for (const proyecto of proyectos) {
                    await pool.execute(
                        'UPDATE asignaciones_proyectos SET activo = FALSE, fecha_desasignacion = NOW() WHERE proyecto_id = ? AND rol_profesor_id = ? AND activo = TRUE',
                        [proyecto.id, rol_profesor_id]
                    );
                    await pool.execute(
                        `INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, asignado_por, activo) VALUES (?, ?, ?, ?, TRUE)`,
                        [proyecto.id, profesor_co_guia_rut, rol_profesor_id, req.user.rut]
                    );
                }
            }
        } catch (syncError) {
            logger.error('Error al sincronizar co-guía en asignaciones_proyectos (no bloqueante)', { error: syncError.message });
        }

        flush('propuestas');
        flush('proyectos');

        res.status(201).json({
            success: true,
            message: 'Profesor co-guía asignado al estudiante exitosamente',
            data: { id: result.insertId, estudiante_rut, profesor_co_guia_rut }
        });
    } catch (error) {
        logger.error('Error al asignar co-guía a estudiante', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * DELETE /co-guias-estudiantes/estudiante/:estudiante_rut
 * Admin: desasignar el co-guía activo de un estudiante
 */
router.delete('/estudiante/:estudiante_rut', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden desasignar co-guías' });
        }

        const { estudiante_rut } = req.params;

        const [result] = await pool.execute(
            'UPDATE co_guias_estudiantes SET activo = FALSE, fecha_desasignacion = NOW() WHERE estudiante_rut = ? AND activo = TRUE',
            [estudiante_rut]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'No hay co-guía activo para este estudiante' });
        }

        logger.info('Co-guía desasignado de estudiante', { estudiante_rut, por: req.user.rut });

        res.json({ success: true, message: 'Profesor co-guía desasignado exitosamente' });
    } catch (error) {
        logger.error('Error al desasignar co-guía de estudiante', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

export default router;
