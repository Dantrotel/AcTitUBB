import { pool } from '../db/connectionDB.js';

/**
 * Crear solicitud de extensión
 * @param {Object} data - Datos de la solicitud
 * @returns {Promise<number>} - ID de la solicitud creada
 */
export const crearSolicitudExtension = async ({
    proyecto_id,
    fecha_importante_id = null,
    solicitante_rut,
    fecha_original,
    fecha_solicitada,
    motivo,
    justificacion_detallada,
    documento_respaldo = null
}) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Validar que la fecha solicitada sea posterior a la original
        if (new Date(fecha_solicitada) <= new Date(fecha_original)) {
            throw new Error('La fecha solicitada debe ser posterior a la fecha original');
        }

        // Validar que el solicitante sea el estudiante del proyecto
        const [proyecto] = await connection.query(`
            SELECT estudiante_rut FROM proyectos WHERE id = ?
        `, [proyecto_id]);

        if (proyecto.length === 0) {
            throw new Error('Proyecto no encontrado');
        }

        if (proyecto[0].estudiante_rut !== solicitante_rut) {
            throw new Error('Solo el estudiante del proyecto puede solicitar extensiones');
        }

        // Validar que no haya otra solicitud pendiente para la misma fecha
        if (fecha_importante_id) {
            const [pendientes] = await connection.query(`
                SELECT id FROM solicitudes_extension 
                WHERE fecha_importante_id = ? AND estado IN ('pendiente', 'en_revision')
            `, [fecha_importante_id]);

            if (pendientes.length > 0) {
                throw new Error('Ya existe una solicitud pendiente para esta fecha');
            }
        }

        const [result] = await connection.query(`
            INSERT INTO solicitudes_extension (
                proyecto_id, fecha_importante_id, solicitante_rut,
                fecha_original, fecha_solicitada, motivo, 
                justificacion_detallada, documento_respaldo, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')
        `, [
            proyecto_id, fecha_importante_id, solicitante_rut,
            fecha_original, fecha_solicitada, motivo,
            justificacion_detallada, documento_respaldo
        ]);

        // Registrar en historial
        await connection.query(`
            INSERT INTO historial_extensiones (
                solicitud_id, proyecto_id, accion, realizado_por, comentarios
            ) VALUES (?, ?, 'solicitud_creada', ?, ?)
        `, [result.insertId, proyecto_id, solicitante_rut, `Solicitud de extensión: ${motivo}`]);

        await connection.commit();
        return result.insertId;
    } catch (error) {
        await connection.rollback();
        
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Obtener solicitudes de extensión por proyecto
 * @param {number} proyectoId 
 * @param {string} estado - Opcional: filtrar por estado
 * @returns {Promise<Array>}
 */
export const obtenerSolicitudesPorProyecto = async (proyectoId, estado = null) => {
    try {
        let query = `
            SELECT 
                se.*,
                u.nombre AS solicitante_nombre,
                u.email AS solicitante_email,
                fi.titulo AS fecha_titulo,
                fi.tipo_fecha,
                admin.nombre AS aprobado_por_nombre,
                DATEDIFF(se.fecha_solicitada, se.fecha_original) as dias_solicitados
            FROM solicitudes_extension se
            INNER JOIN usuarios u ON se.solicitante_rut = u.rut
            LEFT JOIN fechas fi ON se.fecha_importante_id = fi.id
            LEFT JOIN usuarios admin ON se.aprobado_por = admin.rut
            WHERE se.proyecto_id = ?
        `;

        const params = [proyectoId];

        if (estado) {
            query += ' AND se.estado = ?';
            params.push(estado);
        }

        query += ' ORDER BY se.created_at DESC';

        const [rows] = await pool.query(query, params);
        return rows;
    } catch (error) {
        
        throw error;
    }
};

/**
 * Obtener todas las solicitudes pendientes (para admin)
 * @returns {Promise<Array>}
 */
export const obtenerSolicitudesPendientes = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                se.*,
                p.titulo AS proyecto_titulo,
                u.nombre AS solicitante_nombre,
                u.email AS solicitante_email,
                fi.titulo AS fecha_titulo,
                fi.tipo_fecha,
                DATEDIFF(se.fecha_solicitada, se.fecha_original) as dias_solicitados,
                DATEDIFF(CURRENT_DATE, DATE(se.created_at)) as dias_desde_solicitud
            FROM solicitudes_extension se
            INNER JOIN proyectos p ON se.proyecto_id = p.id
            INNER JOIN usuarios u ON se.solicitante_rut = u.rut
            LEFT JOIN fechas fi ON se.fecha_importante_id = fi.id
            WHERE se.estado IN ('pendiente', 'en_revision')
            ORDER BY se.created_at ASC
        `);

        return rows;
    } catch (error) {
        
        throw error;
    }
};

/**
 * Revisar solicitud de extensión (cambiar a en_revision)
 * @param {number} solicitudId 
 * @param {string} revisadoPor 
 * @returns {Promise<boolean>}
 */
export const marcarEnRevision = async (solicitudId, revisadoPor) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [result] = await connection.query(`
            UPDATE solicitudes_extension 
            SET estado = 'en_revision', fecha_revision = CURRENT_TIMESTAMP
            WHERE id = ? AND estado = 'pendiente'
        `, [solicitudId]);

        if (result.affectedRows > 0) {
            const [solicitud] = await connection.query(`
                SELECT proyecto_id FROM solicitudes_extension WHERE id = ?
            `, [solicitudId]);

            await connection.query(`
                INSERT INTO historial_extensiones (
                    solicitud_id, proyecto_id, accion, realizado_por, comentarios
                ) VALUES (?, ?, 'en_revision', ?, 'Solicitud marcada en revisión')
            `, [solicitudId, solicitud[0].proyecto_id, revisadoPor]);
        }

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Aprobar solicitud de extensión
 * @param {number} solicitudId 
 * @param {string} aprobadoPor 
 * @param {string} comentarios 
 * @returns {Promise<Object>}
 */
export const aprobarSolicitud = async (solicitudId, aprobadoPor, comentarios = null) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Obtener datos de la solicitud
        const [solicitud] = await connection.query(`
            SELECT * FROM solicitudes_extension WHERE id = ?
        `, [solicitudId]);

        if (solicitud.length === 0) {
            throw new Error('Solicitud no encontrada');
        }

        if (!['pendiente', 'en_revision'].includes(solicitud[0].estado)) {
            throw new Error('La solicitud ya fue procesada');
        }

        // Aprobar solicitud
        await connection.query(`
            UPDATE solicitudes_extension 
            SET estado = 'aprobada',
                aprobado_por = ?,
                fecha_resolucion = CURRENT_TIMESTAMP,
                comentarios_revision = ?
            WHERE id = ?
        `, [aprobadoPor, comentarios, solicitudId]);

        // Si es una fecha importante, actualizar la fecha límite
        if (solicitud[0].fecha_importante_id) {
            await connection.query(`
                UPDATE fechas 
                SET fecha = ?,
                    observaciones = CONCAT(
                        IFNULL(observaciones, ''), 
                        '\nExtensión aprobada el ', CURRENT_TIMESTAMP,
                        ': ', IFNULL(?, 'Sin comentarios')
                    )
                WHERE id = ?
            `, [solicitud[0].fecha_solicitada, comentarios, solicitud[0].fecha_importante_id]);
        }

        // Registrar en historial
        await connection.query(`
            INSERT INTO historial_extensiones (
                solicitud_id, proyecto_id, accion, realizado_por, comentarios
            ) VALUES (?, ?, 'aprobada', ?, ?)
        `, [solicitudId, solicitud[0].proyecto_id, aprobadoPor, comentarios || 'Solicitud aprobada']);

        await connection.commit();

        return {
            success: true,
            mensaje: 'Solicitud aprobada exitosamente',
            fecha_actualizada: solicitud[0].fecha_importante_id ? solicitud[0].fecha_solicitada : null
        };
    } catch (error) {
        await connection.rollback();
        
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Rechazar solicitud de extensión
 * @param {number} solicitudId 
 * @param {string} rechazadoPor 
 * @param {string} comentarios 
 * @returns {Promise<boolean>}
 */
export const rechazarSolicitud = async (solicitudId, rechazadoPor, comentarios) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        if (!comentarios || comentarios.trim() === '') {
            throw new Error('Debe proporcionar un motivo para el rechazo');
        }

        const [solicitud] = await connection.query(`
            SELECT proyecto_id, estado FROM solicitudes_extension WHERE id = ?
        `, [solicitudId]);

        if (solicitud.length === 0) {
            throw new Error('Solicitud no encontrada');
        }

        if (!['pendiente', 'en_revision'].includes(solicitud[0].estado)) {
            throw new Error('La solicitud ya fue procesada');
        }

        const [result] = await connection.query(`
            UPDATE solicitudes_extension 
            SET estado = 'rechazada',
                aprobado_por = ?,
                fecha_resolucion = CURRENT_TIMESTAMP,
                comentarios_revision = ?
            WHERE id = ?
        `, [rechazadoPor, comentarios, solicitudId]);

        // Registrar en historial
        await connection.query(`
            INSERT INTO historial_extensiones (
                solicitud_id, proyecto_id, accion, realizado_por, comentarios
            ) VALUES (?, ?, 'rechazada', ?, ?)
        `, [solicitudId, solicitud[0].proyecto_id, rechazadoPor, comentarios]);

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Obtener historial de una solicitud
 * @param {number} solicitudId 
 * @returns {Promise<Array>}
 */
export const obtenerHistorialSolicitud = async (solicitudId) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                he.*,
                u.nombre AS realizado_por_nombre
            FROM historial_extensiones he
            INNER JOIN usuarios u ON he.realizado_por = u.rut
            WHERE he.solicitud_id = ?
            ORDER BY he.fecha_accion DESC
        `, [solicitudId]);

        return rows;
    } catch (error) {
        
        throw error;
    }
};

/**
 * Obtener estadísticas de extensiones
 * @returns {Promise<Object>}
 */
export const obtenerEstadisticasExtensiones = async () => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_solicitudes,
                SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                SUM(CASE WHEN estado = 'en_revision' THEN 1 ELSE 0 END) as en_revision,
                SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas,
                SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rechazadas,
                AVG(DATEDIFF(fecha_solicitada, fecha_original)) as promedio_dias_extension,
                AVG(DATEDIFF(fecha_resolucion, created_at)) as promedio_dias_resolucion
            FROM solicitudes_extension
        `);

        return stats[0];
    } catch (error) {
        
        throw error;
    }
};
