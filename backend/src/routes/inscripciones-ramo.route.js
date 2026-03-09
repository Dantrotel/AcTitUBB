import { Router } from 'express';
import { verifySession } from '../middlewares/verifySession.js';
import { pool } from '../db/connectionDB.js';
import { logger } from '../config/logger.js';

const router = Router();

// ===== INSCRIPCIONES DE RAMO POR SEMESTRE =====

/**
 * GET /inscripciones-ramo
 * Listar todas las inscripciones del semestre activo (admin)
 */
router.get('/', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const [rows] = await pool.execute(`
            SELECT ir.id, ir.estudiante_rut, ir.semestre_id, ir.tipo_ramo,
                   u.nombre AS estudiante_nombre, u.email AS estudiante_email,
                   s.nombre AS semestre_nombre
            FROM inscripciones_ramo ir
            INNER JOIN usuarios u ON ir.estudiante_rut = u.rut
            INNER JOIN semestres s ON ir.semestre_id = s.id
            ORDER BY s.año DESC, s.numero DESC, u.nombre ASC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        logger.error('Error al listar inscripciones_ramo', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * GET /inscripciones-ramo/activa
 * Obtener la inscripción del estudiante autenticado en el semestre activo
 */
router.get('/activa', verifySession, async (req, res) => {
    try {
        const estudiante_rut = req.user.rut;
        const [rows] = await pool.execute(`
            SELECT ir.id, ir.tipo_ramo, ir.semestre_id,
                   s.nombre AS semestre_nombre, s.activo
            FROM inscripciones_ramo ir
            INNER JOIN semestres s ON ir.semestre_id = s.id
            WHERE ir.estudiante_rut = ? AND s.activo = TRUE
            LIMIT 1
        `, [estudiante_rut]);
        if (rows.length === 0) {
            return res.json({ success: true, data: null, tieneInscripcion: false });
        }
        res.json({ success: true, data: rows[0], tieneInscripcion: true });
    } catch (error) {
        logger.error('Error al obtener inscripcion activa', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * GET /inscripciones-ramo/estudiante/:rut
 * Obtener todas las inscripciones históricas de un estudiante (admin)
 */
router.get('/estudiante/:rut', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const { rut } = req.params;
        const [rows] = await pool.execute(`
            SELECT ir.id, ir.tipo_ramo, ir.semestre_id, ir.created_at,
                   s.nombre AS semestre_nombre, s.activo
            FROM inscripciones_ramo ir
            INNER JOIN semestres s ON ir.semestre_id = s.id
            WHERE ir.estudiante_rut = ?
            ORDER BY s.año DESC, s.numero DESC
        `, [rut]);
        res.json({ success: true, data: rows });
    } catch (error) {
        logger.error('Error al obtener inscripciones de estudiante', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * POST /inscripciones-ramo
 * Crear inscripción en el semestre activo.
 * Usado por el frontend al registrarse (autenticado) o por el admin para un estudiante.
 */
router.post('/', verifySession, async (req, res) => {
    try {
        const { tipo_ramo, estudiante_rut } = req.body;

        if (!['AP', 'PT'].includes(tipo_ramo)) {
            return res.status(400).json({ success: false, message: 'tipo_ramo debe ser AP o PT' });
        }

        // El estudiante se inscribe a sí mismo; el admin puede inscribir a cualquiera
        const rut = req.user.role_id === 1
            ? req.user.rut
            : (estudiante_rut || req.user.rut);

        // Obtener semestre activo
        const [semestres] = await pool.execute(
            'SELECT id, nombre FROM semestres WHERE activo = TRUE LIMIT 1'
        );
        if (semestres.length === 0) {
            return res.status(400).json({ success: false, message: 'No hay un semestre activo. Contacta al administrador.' });
        }
        const semestre = semestres[0];

        // Insertar o actualizar (si ya existe para ese semestre)
        await pool.execute(
            `INSERT INTO inscripciones_ramo (estudiante_rut, semestre_id, tipo_ramo)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE tipo_ramo = VALUES(tipo_ramo), updated_at = NOW()`,
            [rut, semestre.id, tipo_ramo]
        );

        logger.info('Inscripcion ramo creada/actualizada', { rut, semestre: semestre.nombre, tipo_ramo });
        res.status(201).json({
            success: true,
            message: `Inscripción en ${tipo_ramo} para semestre ${semestre.nombre} registrada`
        });
    } catch (error) {
        logger.error('Error al crear inscripcion_ramo', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * PUT /inscripciones-ramo/:id
 * Actualizar tipo_ramo de una inscripción (solo admin)
 */
router.put('/:id', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const { id } = req.params;
        const { tipo_ramo } = req.body;
        if (!['AP', 'PT'].includes(tipo_ramo)) {
            return res.status(400).json({ success: false, message: 'tipo_ramo debe ser AP o PT' });
        }
        const [result] = await pool.execute(
            'UPDATE inscripciones_ramo SET tipo_ramo = ? WHERE id = ?',
            [tipo_ramo, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Inscripción no encontrada' });
        }
        res.json({ success: true, message: 'Ramo actualizado correctamente' });
    } catch (error) {
        logger.error('Error al actualizar inscripcion_ramo', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

/**
 * POST /inscripciones-ramo/semestre/:semestre_id/generar-siguiente
 * Admin: genera inscripciones automáticas para el semestre destino
 * basándose en los resultados del semestre origen.
 *
 * Lógica:
 *  - Aprobó AP  → PT en semestre siguiente
 *  - Reprobó AP → AP en semestre siguiente
 *  - Aprobó PT  → no genera inscripción (terminó)
 *  - Reprobó PT → PT en semestre siguiente
 *  - en_curso   → se mantiene el mismo tipo (por si se activa antes de cierre)
 *
 * Body: { semestre_destino_id: number }
 */
router.post('/semestre/:semestre_id/generar-siguiente', verifySession, async (req, res) => {
    try {
        if (![3, 4].includes(req.user.role_id)) {
            return res.status(403).json({ success: false, message: 'Solo administradores' });
        }
        const { semestre_id } = req.params;
        const { semestre_destino_id } = req.body;

        if (!semestre_destino_id) {
            return res.status(400).json({ success: false, message: 'semestre_destino_id es requerido' });
        }

        // Verificar que el semestre destino existe
        const [destRows] = await pool.execute(
            'SELECT id, nombre FROM semestres WHERE id = ?', [semestre_destino_id]
        );
        if (destRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Semestre destino no encontrado' });
        }

        // Obtener proyectos del semestre origen con su resultado y tipo
        const [proyectos] = await pool.execute(`
            SELECT DISTINCT
                ep.estudiante_rut,
                pr.tipo_proyecto,
                pr.resultado
            FROM proyectos pr
            INNER JOIN estudiantes_proyectos ep ON ep.proyecto_id = pr.id
            WHERE pr.semestre_id = ?
            ORDER BY ep.estudiante_rut
        `, [semestre_id]);

        let generados = 0;
        let omitidos = 0;
        const detalle = [];

        for (const p of proyectos) {
            let tipo_siguiente = null;

            if (p.tipo_proyecto === 'AP') {
                tipo_siguiente = (p.resultado === 'aprobado') ? 'PT' : 'AP';
            } else if (p.tipo_proyecto === 'PT') {
                if (p.resultado === 'aprobado') {
                    // Terminó → no inscribir
                    omitidos++;
                    detalle.push({ rut: p.estudiante_rut, accion: 'omitido (PT aprobado)' });
                    continue;
                }
                tipo_siguiente = 'PT';
            } else {
                omitidos++;
                continue;
            }

            await pool.execute(
                `INSERT INTO inscripciones_ramo (estudiante_rut, semestre_id, tipo_ramo)
                 VALUES (?, ?, ?)
                 ON DUPLICATE KEY UPDATE tipo_ramo = VALUES(tipo_ramo), updated_at = NOW()`,
                [p.estudiante_rut, semestre_destino_id, tipo_siguiente]
            );
            generados++;
            detalle.push({ rut: p.estudiante_rut, tipo_ramo: tipo_siguiente });
        }

        logger.info('Inscripciones generadas para semestre siguiente', {
            semestre_origen: semestre_id,
            semestre_destino: semestre_destino_id,
            generados,
            omitidos
        });

        res.json({
            success: true,
            message: `Se generaron ${generados} inscripción(es). ${omitidos} omitida(s) (PT aprobado = finalizado).`,
            generados,
            omitidos,
            detalle
        });
    } catch (error) {
        logger.error('Error al generar inscripciones siguiente semestre', { error: error.message });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

export default router;
