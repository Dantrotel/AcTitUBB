import { Router } from 'express';
import { verifySession } from '../middlewares/verifySession.js';
import { pool } from '../db/connectionDB.js';
import { logger } from '../config/logger.js';

const router = Router();

// ===== RUTAS DE SEMESTRES ACADÉMICOS =====

/**
 * GET /semestres/activo
 * Obtener el semestre activo actual (cualquier usuario autenticado)
 */
router.get('/activo', verifySession, async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM semestres WHERE activo = TRUE ORDER BY año DESC, numero DESC LIMIT 1'
        );
        if (rows.length === 0) {
            return res.json({ success: true, data: null, hayActivo: false });
        }
        res.json({ success: true, data: rows[0], hayActivo: true });
    } catch (error) {
        logger.error('Error al obtener semestre activo', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * GET /semestres
 * Listar todos los semestres (admin)
 */
router.get('/', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const [rows] = await pool.execute(`
            SELECT s.*,
                (SELECT COUNT(*) FROM propuestas p WHERE p.semestre_id = s.id) AS total_propuestas,
                (SELECT COUNT(*) FROM proyectos pr WHERE pr.semestre_id = s.id) AS total_proyectos
            FROM semestres s
            ORDER BY s.año DESC, s.numero DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        logger.error('Error al listar semestres', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * GET /semestres/:id/historial
 * Historial de inscripciones de un semestre (admin)
 */
router.get('/:id/historial', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const { id } = req.params;
        const [rows] = await pool.execute(`
            SELECT
                pr.id AS proyecto_id,
                pr.titulo,
                pr.tipo_proyecto,
                pr.resultado,
                pr.estado_detallado,
                u.rut AS estudiante_rut,
                u.nombre AS estudiante_nombre,
                u.email AS estudiante_email,
                pr.created_at AS fecha_inscripcion
            FROM proyectos pr
            INNER JOIN usuarios u ON pr.estudiante_rut = u.rut
            WHERE pr.semestre_id = ?
            ORDER BY pr.created_at DESC
        `, [id]);
        res.json({ success: true, data: rows });
    } catch (error) {
        logger.error('Error al obtener historial de semestre', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * GET /semestres/mis-inscripciones
 * Historial de inscripciones del estudiante autenticado
 */
router.get('/mis-inscripciones', verifySession, async (req, res) => {
    try {
        const estudiante_rut = req.user.rut;
        const [rows] = await pool.execute(`
            SELECT
                pr.id AS proyecto_id,
                pr.titulo,
                pr.tipo_proyecto,
                pr.resultado,
                pr.estado_detallado,
                pr.continua_ap,
                s.nombre AS semestre_nombre,
                s.año,
                s.numero,
                s.activo AS semestre_activo,
                pr.created_at AS fecha_inscripcion
            FROM proyectos pr
            INNER JOIN estudiantes_proyectos ep ON ep.proyecto_id = pr.id AND ep.estudiante_rut = ?
            LEFT JOIN semestres s ON pr.semestre_id = s.id
            ORDER BY s.año DESC, s.numero DESC, pr.created_at DESC
        `, [estudiante_rut]);
        res.json({ success: true, data: rows });
    } catch (error) {
        logger.error('Error al obtener inscripciones del estudiante', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * POST /semestres
 * Crear nuevo semestre (admin)
 */
router.post('/', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const { nombre, año, numero, fecha_inicio, fecha_fin, activo = false } = req.body;

        if (!nombre || !año || !numero || !fecha_inicio || !fecha_fin) {
            return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: nombre, año, numero, fecha_inicio, fecha_fin' });
        }
        if (![1, 2].includes(Number(numero))) {
            return res.status(400).json({ success: false, message: 'El número de semestre debe ser 1 o 2' });
        }
        if (new Date(fecha_fin) <= new Date(fecha_inicio)) {
            return res.status(400).json({ success: false, message: 'La fecha de fin debe ser posterior a la de inicio' });
        }

        // Si se activa este semestre, desactivar los demás
        if (activo) {
            await pool.execute('UPDATE semestres SET activo = FALSE');
        }

        const [result] = await pool.execute(
            `INSERT INTO semestres (nombre, año, numero, fecha_inicio, fecha_fin, activo)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, año, numero, fecha_inicio, fecha_fin, activo ? 1 : 0]
        );

        logger.info('Semestre creado', { nombre, creado_por: req.user.rut });
        res.status(201).json({ success: true, data: { id: result.insertId }, message: `Semestre ${nombre} creado exitosamente` });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: 'Ya existe un semestre con ese nombre' });
        }
        logger.error('Error al crear semestre', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * PUT /semestres/:id
 * Actualizar semestre (admin)
 */
router.put('/:id', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const { id } = req.params;
        const { nombre, año, numero, fecha_inicio, fecha_fin } = req.body;

        await pool.execute(
            'UPDATE semestres SET nombre=?, año=?, numero=?, fecha_inicio=?, fecha_fin=? WHERE id=?',
            [nombre, año, numero, fecha_inicio, fecha_fin, id]
        );
        res.json({ success: true, message: 'Semestre actualizado correctamente' });
    } catch (error) {
        logger.error('Error al actualizar semestre', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * PUT /semestres/:id/activar
 * Marcar un semestre como el activo (desactiva el anterior)
 */
router.put('/:id/activar', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const { id } = req.params;
        await pool.execute('UPDATE semestres SET activo = FALSE');
        await pool.execute('UPDATE semestres SET activo = TRUE WHERE id = ?', [id]);
        logger.info('Semestre activado', { semestre_id: id, por: req.user.rut });
        res.json({ success: true, message: 'Semestre activado correctamente' });
    } catch (error) {
        logger.error('Error al activar semestre', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * PUT /semestres/:id/resultado-proyecto
 * Admin: registrar resultado de un proyecto en un semestre
 */
router.put('/:id/resultado-proyecto', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const { proyecto_id, resultado } = req.body;
        const validos = ['aprobado', 'reprobado', 'retirado', 'en_curso'];
        if (!proyecto_id || !validos.includes(resultado)) {
            return res.status(400).json({ success: false, message: `resultado debe ser uno de: ${validos.join(', ')}` });
        }
        await pool.execute('UPDATE proyectos SET resultado = ? WHERE id = ?', [resultado, proyecto_id]);
        res.json({ success: true, message: `Resultado actualizado a "${resultado}"` });
    } catch (error) {
        logger.error('Error al actualizar resultado proyecto', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * DELETE /semestres/:id
 * Eliminar semestre (solo si no tiene propuestas asociadas)
 */
router.delete('/:id', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const { id } = req.params;
        const [props] = await pool.execute('SELECT COUNT(*) AS cnt FROM propuestas WHERE semestre_id = ?', [id]);
        if (props[0].cnt > 0) {
            return res.status(409).json({ success: false, message: 'No se puede eliminar: el semestre tiene propuestas asociadas' });
        }
        await pool.execute('DELETE FROM semestres WHERE id = ?', [id]);
        res.json({ success: true, message: 'Semestre eliminado correctamente' });
    } catch (error) {
        logger.error('Error al eliminar semestre', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

export default router;
