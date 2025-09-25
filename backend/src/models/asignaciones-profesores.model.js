import { pool } from '../db/connectionDB.js';

// ===== GESTIÓN DE ASIGNACIONES DE PROFESORES A PROYECTOS =====

/**
 * Asignar un profesor a un proyecto con un rol específico
 * @param {Object} asignacionData - Datos de la asignación
 * @returns {Promise<number>} - ID de la asignación creada
 */
export const asignarProfesorAProyecto = async (asignacionData) => {
    const { proyecto_id, profesor_rut, rol_profesor, fecha_asignacion } = asignacionData;
    
    // Verificar que el profesor tenga rol 2 (profesor)
    const verificarProfesor = `
        SELECT id FROM usuarios 
        WHERE rut = ? AND role_id = 2
    `;
    const [profesorExists] = await pool.execute(verificarProfesor, [profesor_rut]);
    
    if (profesorExists.length === 0) {
        throw new Error('El usuario no es un profesor válido');
    }
    
    // Verificar que no exista ya una asignación del mismo rol para el mismo proyecto
    const verificarAsignacion = `
        SELECT id FROM asignaciones_profesores 
        WHERE proyecto_id = ? AND rol_profesor = ? AND activo = TRUE
    `;
    const [asignacionExists] = await pool.execute(verificarAsignacion, [proyecto_id, rol_profesor]);
    
    if (asignacionExists.length > 0) {
        throw new Error(`Ya existe un ${rol_profesor} asignado a este proyecto`);
    }
    
    const query = `
        INSERT INTO asignaciones_profesores (proyecto_id, profesor_rut, rol_profesor, fecha_asignacion, activo)
        VALUES (?, ?, ?, ?, TRUE)
    `;
    
    const fechaAsignacionValue = fecha_asignacion || new Date().toISOString().split('T')[0];
    
    const [result] = await pool.execute(query, [
        proyecto_id,
        profesor_rut,
        rol_profesor,
        fechaAsignacionValue
    ]);
    
    return result.insertId;
};

/**
 * Obtener todas las asignaciones de profesores de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - Lista de asignaciones con datos del profesor
 */
export const obtenerProfesoresProyecto = async (proyecto_id) => {
    const query = `
        SELECT 
            ap.*,
            u.nombre as nombre_profesor,
            u.email as email_profesor,
            rp.nombre as nombre_rol
        FROM asignaciones_profesores ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor = rp.codigo
        WHERE ap.proyecto_id = ? AND ap.activo = TRUE
        ORDER BY 
            CASE ap.rol_profesor
                WHEN 'profesor_guia' THEN 1
                WHEN 'profesor_co_guia' THEN 2
                WHEN 'profesor_informante' THEN 3
                WHEN 'profesor_sala' THEN 4
                WHEN 'profesor_corrector' THEN 5
                ELSE 6
            END
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id]);
    return rows;
};

/**
 * Obtener proyectos asignados a un profesor
 * @param {string} profesor_rut - RUT del profesor
 * @param {string} rol_profesor - Rol específico (opcional)
 * @returns {Promise<Array>} - Lista de proyectos
 */
export const obtenerProyectosProfesor = async (profesor_rut, rol_profesor = null) => {
    let query = `
        SELECT 
            p.*,
            ap.rol_profesor,
            ap.fecha_asignacion,
            rp.nombre as nombre_rol,
            u.nombre as nombre_estudiante,
            u.email as email_estudiante
        FROM asignaciones_profesores ap
        INNER JOIN proyectos p ON ap.proyecto_id = p.id
        INNER JOIN usuarios u ON p.estudiante_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor = rp.codigo
        WHERE ap.profesor_rut = ? AND ap.activo = TRUE
    `;
    
    const params = [profesor_rut];
    
    if (rol_profesor) {
        query += ' AND ap.rol_profesor = ?';
        params.push(rol_profesor);
    }
    
    query += ' ORDER BY p.fecha_inicio DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
};

/**
 * Cambiar la asignación de un profesor (desactivar actual y crear nueva)
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} rol_profesor - Rol del profesor
 * @param {string} nuevo_profesor_rut - RUT del nuevo profesor
 * @returns {Promise<number>} - ID de la nueva asignación
 */
export const cambiarProfesorProyecto = async (proyecto_id, rol_profesor, nuevo_profesor_rut) => {
    // Verificar que el nuevo profesor sea válido
    const verificarProfesor = `
        SELECT id FROM usuarios 
        WHERE rut = ? AND role_id = 2
    `;
    const [profesorExists] = await pool.execute(verificarProfesor, [nuevo_profesor_rut]);
    
    if (profesorExists.length === 0) {
        throw new Error('El nuevo usuario no es un profesor válido');
    }
    
    // Desactivar asignación actual
    const desactivarQuery = `
        UPDATE asignaciones_profesores 
        SET activo = FALSE, fecha_desasignacion = CURDATE()
        WHERE proyecto_id = ? AND rol_profesor = ? AND activo = TRUE
    `;
    
    await pool.execute(desactivarQuery, [proyecto_id, rol_profesor]);
    
    // Crear nueva asignación
    return await asignarProfesorAProyecto({
        proyecto_id,
        profesor_rut: nuevo_profesor_rut,
        rol_profesor
    });
};

/**
 * Remover un profesor de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} rol_profesor - Rol del profesor a remover
 * @returns {Promise<boolean>} - true si se removió correctamente
 */
export const removerProfesorProyecto = async (proyecto_id, rol_profesor) => {
    const query = `
        UPDATE asignaciones_profesores 
        SET activo = FALSE, fecha_desasignacion = CURDATE()
        WHERE proyecto_id = ? AND rol_profesor = ? AND activo = TRUE
    `;
    
    const [result] = await pool.execute(query, [proyecto_id, rol_profesor]);
    return result.affectedRows > 0;
};

/**
 * Obtener una asignación específica por ID
 * @param {number} asignacion_id - ID de la asignación
 * @returns {Promise<Object|null>} - Datos de la asignación o null
 */
export const obtenerAsignacionPorId = async (asignacion_id) => {
    const query = `
        SELECT 
            ap.*,
            u.nombre as nombre_profesor,
            u.email as email_profesor,
            p.titulo as titulo_proyecto,
            rp.nombre as nombre_rol
        FROM asignaciones_profesores ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN proyectos p ON ap.proyecto_id = p.id
        INNER JOIN roles_profesores rp ON ap.rol_profesor = rp.codigo
        WHERE ap.id = ?
    `;
    
    const [rows] = await pool.execute(query, [asignacion_id]);
    return rows[0] || null;
};

/**
 * Verificar si un profesor tiene un rol específico en un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} profesor_rut - RUT del profesor
 * @param {string} rol_profesor - Rol a verificar
 * @returns {Promise<boolean>} - true si tiene el rol asignado
 */
export const verificarRolProfesorProyecto = async (proyecto_id, profesor_rut, rol_profesor) => {
    const query = `
        SELECT id FROM asignaciones_profesores
        WHERE proyecto_id = ? AND profesor_rut = ? AND rol_profesor = ? AND activo = TRUE
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id, profesor_rut, rol_profesor]);
    return rows.length > 0;
};

/**
 * Obtener estadísticas de asignaciones por profesor
 * @param {string} profesor_rut - RUT del profesor (opcional)
 * @returns {Promise<Array>} - Estadísticas de asignaciones
 */
export const obtenerEstadisticasAsignaciones = async (profesor_rut = null) => {
    let query = `
        SELECT 
            ap.profesor_rut,
            u.nombre as nombre_profesor,
            ap.rol_profesor,
            rp.nombre as nombre_rol,
            COUNT(*) as total_proyectos,
            COUNT(CASE WHEN p.estado = 'en_curso' THEN 1 END) as proyectos_activos,
            COUNT(CASE WHEN p.estado = 'finalizado' THEN 1 END) as proyectos_finalizados
        FROM asignaciones_profesores ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor = rp.codigo
        INNER JOIN proyectos p ON ap.proyecto_id = p.id
        WHERE ap.activo = TRUE
    `;
    
    const params = [];
    
    if (profesor_rut) {
        query += ' AND ap.profesor_rut = ?';
        params.push(profesor_rut);
    }
    
    query += `
        GROUP BY ap.profesor_rut, ap.rol_profesor, u.nombre, rp.nombre
        ORDER BY u.nombre, ap.rol_profesor
    `;
    
    const [rows] = await pool.execute(query, params);
    return rows;
};

/**
 * Obtener profesores disponibles para asignar a un proyecto
 * @param {string} rol_profesor - Rol específico a buscar
 * @returns {Promise<Array>} - Lista de profesores disponibles
 */
export const obtenerProfesoresDisponibles = async (rol_profesor) => {
    const query = `
        SELECT 
            u.rut,
            u.nombre,
            u.email,
            COUNT(ap.id) as proyectos_actuales
        FROM usuarios u
        LEFT JOIN asignaciones_profesores ap ON u.rut = ap.profesor_rut 
            AND ap.activo = TRUE 
            AND ap.rol_profesor = ?
        WHERE u.role_id = 2
        GROUP BY u.rut, u.nombre, u.email
        ORDER BY proyectos_actuales ASC, u.nombre ASC
    `;
    
    const [rows] = await pool.execute(query, [rol_profesor]);
    return rows;
};