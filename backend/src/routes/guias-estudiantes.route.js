import { Router } from 'express';
import { verifySession } from '../middlewares/verifySession.js';
import { pool } from '../db/connectionDB.js';
import { logger } from '../config/logger.js';
import { flush } from '../config/cache.js';

const router = Router();

// ===== RUTAS PARA PRE-ASIGNACIÓN DE GUÍA A ESTUDIANTE =====

/**
 * GET /guias-estudiantes
 * Admin: listar todas las asignaciones de guía activas
 */
router.get('/', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden listar guías de estudiantes' });
        }

        const [rows] = await pool.execute(`
            SELECT
                ge.id,
                ge.estudiante_rut,
                ue.nombre  AS estudiante_nombre,
                ue.email   AS estudiante_email,
                ge.profesor_guia_rut,
                up.nombre  AS profesor_nombre,
                up.email   AS profesor_email,
                ge.activo,
                ge.fecha_asignacion,
                ge.observaciones,
                ua.nombre  AS asignado_por_nombre,
                ge.asignado_por
            FROM guias_estudiantes ge
            INNER JOIN usuarios ue ON ge.estudiante_rut  = ue.rut
            INNER JOIN usuarios up ON ge.profesor_guia_rut = up.rut
            LEFT JOIN usuarios ua ON ge.asignado_por    = ua.rut
            WHERE ge.activo = TRUE
            ORDER BY ge.fecha_asignacion DESC
        `);

        res.json({ success: true, data: rows });
    } catch (error) {
        logger.error('Error al listar guías de estudiantes', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * GET /guias-estudiantes/mis-datos
 * Estudiante: obtener su propio guía asignado
 */
router.get('/mis-datos', verifySession, async (req, res) => {
    try {
        const estudiante_rut = req.user.rut;

        const [rows] = await pool.execute(`
            SELECT
                ge.id,
                ge.profesor_guia_rut,
                u.nombre  AS profesor_nombre,
                u.email   AS profesor_email,
                ge.fecha_asignacion,
                ge.observaciones
            FROM guias_estudiantes ge
            INNER JOIN usuarios u ON ge.profesor_guia_rut = u.rut
            WHERE ge.estudiante_rut = ? AND ge.activo = TRUE
            ORDER BY ge.fecha_asignacion DESC
            LIMIT 1
        `, [estudiante_rut]);

        if (rows.length === 0) {
            return res.json({ success: true, data: null, tieneGuia: false });
        }

        res.json({ success: true, data: rows[0], tieneGuia: true });
    } catch (error) {
        logger.error('Error al obtener guía del estudiante', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * GET /guias-estudiantes/estudiante/:estudiante_rut
 * Admin o el propio estudiante: obtener guía de un estudiante específico
 */
router.get('/estudiante/:estudiante_rut', verifySession, async (req, res) => {
    try {
        const { estudiante_rut } = req.params;

        // Solo admin, superadmin o el mismo estudiante
        if (![3, 4].includes(req.user.role_id) && req.user.rut !== estudiante_rut) {
            return res.status(403).json({ success: false, message: 'Sin permisos para ver este dato' });
        }

        const [rows] = await pool.execute(`
            SELECT
                ge.id,
                ge.profesor_guia_rut,
                u.nombre  AS profesor_nombre,
                u.email   AS profesor_email,
                ge.fecha_asignacion,
                ge.observaciones,
                ge.activo
            FROM guias_estudiantes ge
            INNER JOIN usuarios u ON ge.profesor_guia_rut = u.rut
            WHERE ge.estudiante_rut = ? AND ge.activo = TRUE
            ORDER BY ge.fecha_asignacion DESC
            LIMIT 1
        `, [estudiante_rut]);

        if (rows.length === 0) {
            return res.json({ success: true, data: null, tieneGuia: false });
        }

        res.json({ success: true, data: rows[0], tieneGuia: true });
    } catch (error) {
        logger.error('Error al obtener guía de estudiante', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * POST /guias-estudiantes
 * Admin: asignar un guía a un estudiante
 * Body: { estudiante_rut, profesor_guia_rut, observaciones? }
 */
router.post('/', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden asignar guías a estudiantes' });
        }

        const { estudiante_rut, profesor_guia_rut, observaciones } = req.body;

        if (!estudiante_rut || !profesor_guia_rut) {
            return res.status(400).json({ success: false, message: 'Se requieren estudiante_rut y profesor_guia_rut' });
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
            [profesor_guia_rut]
        );
        if (profRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
        }

        // Desactivar guía anterior si existe
        const [existing] = await pool.execute(
            'SELECT id FROM guias_estudiantes WHERE estudiante_rut = ? AND activo = TRUE',
            [estudiante_rut]
        );
        if (existing.length > 0) {
            await pool.execute(
                'UPDATE guias_estudiantes SET activo = FALSE, fecha_desasignacion = NOW() WHERE estudiante_rut = ? AND activo = TRUE',
                [estudiante_rut]
            );
        }

        // Crear nueva asignación
        const [result] = await pool.execute(
            `INSERT INTO guias_estudiantes (estudiante_rut, profesor_guia_rut, asignado_por, observaciones)
             VALUES (?, ?, ?, ?)`,
            [estudiante_rut, profesor_guia_rut, req.user.rut, observaciones ?? null]
        );

        logger.info('Guía asignado a estudiante', { estudiante_rut, profesor_guia_rut, asignado_por: req.user.rut });

        // Sincronizar asignaciones_proyectos para proyectos activos del estudiante
        try {
            const [rolRows] = await pool.execute(
                "SELECT id FROM roles_profesores WHERE nombre = 'Profesor Guía' LIMIT 1"
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
                        [proyecto.id, profesor_guia_rut, rol_profesor_id, req.user.rut]
                    );
                }
            }
        } catch (syncError) {
            logger.error('Error al sincronizar guía en asignaciones_proyectos (no bloqueante)', { error: syncError.message });
        }

        // Invalidar cachés para que el frontend vea datos actualizados
        flush('propuestas');
        flush('proyectos');

        res.status(201).json({
            success: true,
            message: 'Profesor guía asignado al estudiante exitosamente',
            data: { id: result.insertId, estudiante_rut, profesor_guia_rut }
        });
    } catch (error) {
        logger.error('Error al asignar guía a estudiante', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * DELETE /guias-estudiantes/estudiante/:estudiante_rut
 * Admin: desasignar el guía activo de un estudiante
 */
router.delete('/estudiante/:estudiante_rut', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores pueden desasignar guías' });
        }

        const { estudiante_rut } = req.params;

        const [result] = await pool.execute(
            'UPDATE guias_estudiantes SET activo = FALSE, fecha_desasignacion = NOW() WHERE estudiante_rut = ? AND activo = TRUE',
            [estudiante_rut]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'No hay guía activo para este estudiante' });
        }

        logger.info('Guía desasignado de estudiante', { estudiante_rut, por: req.user.rut });

        res.json({ success: true, message: 'Profesor guía desasignado exitosamente' });
    } catch (error) {
        logger.error('Error al desasignar guía de estudiante', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

export default router;
