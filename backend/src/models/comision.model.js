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
                ap.id,
                ap.profesor_rut,
                u.nombre AS profesor_nombre,
                u.email AS profesor_email,
                CASE ap.rol_profesor_id
                    WHEN 2 THEN 'profesor_guia'
                    WHEN 4 THEN 'profesor_informante'
                END AS rol_comision,
                ap.fecha_asignacion AS fecha_designacion,
                NULL AS observaciones,
                'asignacion' AS origen
            FROM asignaciones_proyectos ap
            INNER JOIN usuarios u ON ap.profesor_rut = u.rut
            WHERE ap.proyecto_id = ? AND ap.rol_profesor_id IN (2, 4) AND ap.activo = TRUE

            UNION ALL

            SELECT 
                ce.id,
                ce.profesor_rut,
                u.nombre AS profesor_nombre,
                u.email AS profesor_email,
                ce.rol_comision,
                ce.fecha_designacion,
                ce.observaciones,
                'comision' AS origen
            FROM comision_evaluadora ce
            INNER JOIN usuarios u ON ce.profesor_rut = u.rut
            WHERE ce.proyecto_id = ? AND ce.rol_comision = 'tercer_integrante' AND ce.activo = TRUE

            ORDER BY FIELD(rol_comision, 'profesor_guia', 'profesor_informante', 'tercer_integrante')
        `, [proyectoId, proyectoId]);

        return rows;
    } catch (error) {
        
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
        const [[guia]] = await pool.query(
            'SELECT COUNT(*) as cnt FROM asignaciones_proyectos WHERE proyecto_id = ? AND rol_profesor_id = 2 AND activo = TRUE',
            [proyectoId]
        );
        const [[informante]] = await pool.query(
            'SELECT COUNT(*) as cnt FROM asignaciones_proyectos WHERE proyecto_id = ? AND rol_profesor_id = 4 AND activo = TRUE',
            [proyectoId]
        );
        const [[tercer]] = await pool.query(
            "SELECT COUNT(*) as cnt FROM comision_evaluadora WHERE proyecto_id = ? AND rol_comision = 'tercer_integrante' AND activo = TRUE",
            [proyectoId]
        );

        const estado = {
            tiene_profesor_guia: guia.cnt,
            tiene_profesor_informante: informante.cnt,
            tiene_tercer_integrante: tercer.cnt,
            total_miembros: Number(guia.cnt) + Number(informante.cnt) + Number(tercer.cnt),
            completa: guia.cnt > 0 && informante.cnt > 0
        };

        return estado;
    } catch (error) {
        
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

        if (existente.length > 0) {
            throw new Error(`Ya existe un ${rol_comision.replace(/_/g, ' ')} asignado a este proyecto`);
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

        if (existente.length > 0) {
            throw new Error(`Ya existe un ${nuevoRol.replace(/_/g, ' ')} en este proyecto`);
        }

        const [result] = await pool.query(`
            UPDATE comision_evaluadora 
            SET rol_comision = ?
            WHERE id = ?
        `, [nuevoRol, comisionId]);

        return result.affectedRows > 0;
    } catch (error) {
        
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
                (
                    (SELECT COUNT(*) FROM asignaciones_proyectos ap WHERE ap.proyecto_id = p.id AND ap.rol_profesor_id IN (2, 4) AND ap.activo = TRUE)
                    + (SELECT COUNT(*) FROM comision_evaluadora ce WHERE ce.proyecto_id = p.id AND ce.rol_comision = 'tercer_integrante' AND ce.activo = TRUE)
                ) AS total_miembros,
                (SELECT COUNT(*) FROM asignaciones_proyectos WHERE proyecto_id = p.id AND rol_profesor_id = 2 AND activo = TRUE) AS tiene_profesor_guia,
                (SELECT COUNT(*) FROM asignaciones_proyectos WHERE proyecto_id = p.id AND rol_profesor_id = 4 AND activo = TRUE) AS tiene_profesor_informante,
                (SELECT COUNT(*) FROM comision_evaluadora WHERE proyecto_id = p.id AND rol_comision = 'tercer_integrante' AND activo = TRUE) AS tiene_tercer_integrante,
                CASE
                    WHEN (SELECT COUNT(*) FROM asignaciones_proyectos WHERE proyecto_id = p.id AND rol_profesor_id = 2 AND activo = TRUE) > 0
                         AND (SELECT COUNT(*) FROM asignaciones_proyectos WHERE proyecto_id = p.id AND rol_profesor_id = 4 AND activo = TRUE) > 0
                    THEN TRUE
                    ELSE FALSE
                END AS comision_completa
            FROM proyectos p
            INNER JOIN usuarios u ON p.estudiante_rut = u.rut
            WHERE p.activo = TRUE
            AND EXISTS (
                SELECT 1 FROM asignaciones_proyectos ap
                WHERE ap.proyecto_id = p.id AND ap.rol_profesor_id = 2 AND ap.activo = TRUE
            )
            ORDER BY p.fecha_inicio DESC
        `);

        return rows;
    } catch (error) {
        
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
            WHERE u.rol_id IN (2, 3) -- Profesores y administradores
            AND u.rut NOT IN (
                SELECT profesor_rut 
                FROM asignaciones_proyectos 
                WHERE proyecto_id = ? AND rol_profesor_id IN (2, 4) AND activo = TRUE
            )
            AND u.rut NOT IN (
                SELECT profesor_rut 
                FROM comision_evaluadora 
                WHERE proyecto_id = ? AND rol_comision = 'tercer_integrante' AND activo = TRUE
            )
            GROUP BY u.rut, u.nombre, u.email
            ORDER BY total_comisiones_activas ASC, u.nombre ASC
        `, [proyectoId, proyectoId]);

        return rows;
    } catch (error) {
        
        throw error;
    }
};
