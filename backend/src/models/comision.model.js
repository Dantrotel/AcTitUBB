import { pool } from '../db/connectionDB.js';

/**
 * Obtener comisión evaluadora de un proyecto
 * @param {number} proyectoId - ID del proyecto
 * @returns {Promise<Array>} - Miembros de la comisión
 */
export const obtenerComisionPorProyecto = async (proyectoId) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                ce.id,
                ce.proyecto_id,
                ce.profesor_rut,
                u.nombre AS profesor_nombre,
                u.email AS profesor_email,
                ce.rol_comision,
                ce.fecha_designacion,
                ce.fecha_remocion,
                ce.activo,
                ce.observaciones,
                ce.asignado_por,
                admin.nombre AS asignado_por_nombre
            FROM comision_evaluadora ce
            INNER JOIN usuarios u ON ce.profesor_rut = u.rut
            LEFT JOIN usuarios admin ON ce.asignado_por = admin.rut
            WHERE ce.proyecto_id = ? AND ce.activo = TRUE
            ORDER BY 
                FIELD(ce.rol_comision, 'presidente', 'secretario', 'vocal', 'suplente')
        `, [proyectoId]);

        return rows;
    } catch (error) {
        console.error('Error al obtener comisión:', error);
        throw error;
    }
};

/**
 * Verificar si un proyecto tiene comisión completa
 * @param {number} proyectoId 
 * @returns {Promise<Object>} - Estado de la comisión
 */
export const verificarComisionCompleta = async (proyectoId) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                COUNT(*) as total_miembros,
                SUM(CASE WHEN rol_comision = 'presidente' THEN 1 ELSE 0 END) as tiene_presidente,
                SUM(CASE WHEN rol_comision = 'secretario' THEN 1 ELSE 0 END) as tiene_secretario,
                SUM(CASE WHEN rol_comision = 'vocal' THEN 1 ELSE 0 END) as vocales
            FROM comision_evaluadora
            WHERE proyecto_id = ? AND activo = TRUE
        `, [proyectoId]);

        const estado = rows[0];
        estado.completa = estado.tiene_presidente > 0 && estado.tiene_secretario > 0 && estado.vocales >= 1;
        
        return estado;
    } catch (error) {
        console.error('Error al verificar comisión:', error);
        throw error;
    }
};

/**
 * Agregar miembro a la comisión evaluadora
 * @param {Object} data - Datos del miembro
 * @returns {Promise<number>} - ID del registro creado
 */
export const agregarMiembroComision = async ({ proyecto_id, profesor_rut, rol_comision, observaciones = null, asignado_por }) => {
    try {
        // Validar que el rol no esté ocupado
        const [existente] = await pool.query(`
            SELECT id FROM comision_evaluadora 
            WHERE proyecto_id = ? AND rol_comision = ? AND activo = TRUE
        `, [proyecto_id, rol_comision]);

        if (existente.length > 0 && rol_comision !== 'vocal') {
            throw new Error(`Ya existe un ${rol_comision} asignado a este proyecto`);
        }

        // Validar que el profesor no esté ya en la comisión
        const [yaAsignado] = await pool.query(`
            SELECT id FROM comision_evaluadora 
            WHERE proyecto_id = ? AND profesor_rut = ? AND activo = TRUE
        `, [proyecto_id, profesor_rut]);

        if (yaAsignado.length > 0) {
            throw new Error('Este profesor ya está asignado a la comisión de este proyecto');
        }

        // Validar que el profesor existe y es rol profesor
        const [profesor] = await pool.query(`
            SELECT rut, rol_id FROM usuarios WHERE rut = ? AND rol_id = 2
        `, [profesor_rut]);

        if (profesor.length === 0) {
            throw new Error('El profesor no existe o no tiene rol de profesor');
        }

        const [result] = await pool.query(`
            INSERT INTO comision_evaluadora 
            (proyecto_id, profesor_rut, rol_comision, observaciones, asignado_por, activo)
            VALUES (?, ?, ?, ?, ?, TRUE)
        `, [proyecto_id, profesor_rut, rol_comision, observaciones, asignado_por]);

        return result.insertId;
    } catch (error) {
        console.error('Error al agregar miembro a comisión:', error);
        throw error;
    }
};

/**
 * Remover miembro de la comisión (desactivar)
 * @param {number} comisionId - ID del registro de comisión
 * @param {string} removidoPor - RUT de quien remueve
 * @returns {Promise<boolean>}
 */
export const removerMiembroComision = async (comisionId, removidoPor) => {
    try {
        const [result] = await pool.query(`
            UPDATE comision_evaluadora 
            SET activo = FALSE, 
                fecha_remocion = CURRENT_TIMESTAMP,
                observaciones = CONCAT(IFNULL(observaciones, ''), 
                    '\nRemovido el ', CURRENT_TIMESTAMP, ' por ', ?)
            WHERE id = ? AND activo = TRUE
        `, [removidoPor, comisionId]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al remover miembro de comisión:', error);
        throw error;
    }
};

/**
 * Actualizar rol de un miembro de la comisión
 * @param {number} comisionId 
 * @param {string} nuevoRol 
 * @returns {Promise<boolean>}
 */
export const actualizarRolMiembro = async (comisionId, nuevoRol) => {
    try {
        // Validar que el nuevo rol no esté ocupado
        const [miembro] = await pool.query(`
            SELECT proyecto_id FROM comision_evaluadora WHERE id = ?
        `, [comisionId]);

        if (miembro.length === 0) {
            throw new Error('Miembro de comisión no encontrado');
        }

        const [existente] = await pool.query(`
            SELECT id FROM comision_evaluadora 
            WHERE proyecto_id = ? AND rol_comision = ? AND activo = TRUE AND id != ?
        `, [miembro[0].proyecto_id, nuevoRol, comisionId]);

        if (existente.length > 0 && nuevoRol !== 'vocal') {
            throw new Error(`Ya existe un ${nuevoRol} en este proyecto`);
        }

        const [result] = await pool.query(`
            UPDATE comision_evaluadora 
            SET rol_comision = ?
            WHERE id = ?
        `, [nuevoRol, comisionId]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        throw error;
    }
};

/**
 * Obtener todos los proyectos con estado de comisión
 * @returns {Promise<Array>}
 */
export const obtenerProyectosConComision = async () => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id,
                p.titulo,
                p.estudiante_rut,
                u.nombre AS estudiante_nombre,
                COUNT(ce.id) as total_miembros,
                SUM(CASE WHEN ce.rol_comision = 'presidente' THEN 1 ELSE 0 END) as tiene_presidente,
                SUM(CASE WHEN ce.rol_comision = 'secretario' THEN 1 ELSE 0 END) as tiene_secretario,
                SUM(CASE WHEN ce.rol_comision = 'vocal' THEN 1 ELSE 0 END) as total_vocales,
                CASE 
                    WHEN SUM(CASE WHEN ce.rol_comision = 'presidente' THEN 1 ELSE 0 END) > 0
                         AND SUM(CASE WHEN ce.rol_comision = 'secretario' THEN 1 ELSE 0 END) > 0
                         AND SUM(CASE WHEN ce.rol_comision = 'vocal' THEN 1 ELSE 0 END) >= 1
                    THEN TRUE 
                    ELSE FALSE 
                END as comision_completa
            FROM proyectos p
            INNER JOIN usuarios u ON p.estudiante_rut = u.rut
            LEFT JOIN comision_evaluadora ce ON p.id = ce.proyecto_id AND ce.activo = TRUE
            WHERE p.activo = TRUE
            GROUP BY p.id, p.titulo, p.estudiante_rut, u.nombre
            ORDER BY p.fecha_inicio DESC
        `);

        return rows;
    } catch (error) {
        console.error('Error al obtener proyectos con comisión:', error);
        throw error;
    }
};

/**
 * Obtener profesores disponibles para comisión (no asignados al proyecto)
 * @param {number} proyectoId 
 * @returns {Promise<Array>}
 */
export const obtenerProfesoresDisponibles = async (proyectoId) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.rut,
                u.nombre,
                u.email,
                COUNT(ce.id) as total_comisiones_activas
            FROM usuarios u
            LEFT JOIN comision_evaluadora ce ON u.rut = ce.profesor_rut AND ce.activo = TRUE
            WHERE u.rol_id = 2 -- Solo profesores
            AND u.rut NOT IN (
                SELECT profesor_rut 
                FROM comision_evaluadora 
                WHERE proyecto_id = ? AND activo = TRUE
            )
            GROUP BY u.rut, u.nombre, u.email
            ORDER BY total_comisiones_activas ASC, u.nombre ASC
        `, [proyectoId]);

        return rows;
    } catch (error) {
        console.error('Error al obtener profesores disponibles:', error);
        throw error;
    }
};
