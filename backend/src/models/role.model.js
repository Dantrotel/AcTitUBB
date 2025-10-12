import { pool } from "../db/connectionDB.js";

// Crear un nuevo rol
const createRole = async (nombre, descripcion = null) => {
    const [rows] = await pool.execute(
        `INSERT INTO roles (nombre, descripcion) VALUES (?, ?)`,
        [nombre, descripcion]
    );

    const insertId = rows.insertId;
    const [result] = await pool.execute(
        `SELECT id, nombre, descripcion FROM roles WHERE id = ?`,
        [insertId]
    );
    return result[0];
};

// Buscar un rol por su nombre
const findRoleByName = async (nombre) => {
    const [rows] = await pool.execute(
        `SELECT * FROM roles WHERE nombre = ?`,
        [nombre]
    );

    return rows[0] || null;
};

// Buscar un rol por su ID
const findRoleById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM roles WHERE id = ?`,
        [id]
    );

    return rows[0] || null;
};

// Obtener todos los roles
const getAllRoles = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM roles ORDER BY nombre`
    );
    return rows;
};

// Actualizar un rol
const updateRole = async (id, { nombre, descripcion }) => {
    await pool.execute(
        `UPDATE roles SET nombre = ?, descripcion = ?, updated_at = NOW() WHERE id = ?`,
        [nombre, descripcion, id]
    );

    const [rows] = await pool.execute(
        `SELECT id, nombre, descripcion FROM roles WHERE id = ?`,
        [id]
    );

    return rows[0] || null;
};

// Eliminar un rol
const deleteRole = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM roles WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
};

// Roles de profesores en proyectos
const createRoleProfesor = async (nombre, descripcion = null) => {
    const [rows] = await pool.execute(
        `INSERT INTO roles_profesores (nombre, descripcion) VALUES (?, ?)`,
        [nombre, descripcion]
    );

    const insertId = rows.insertId;
    const [result] = await pool.execute(
        `SELECT id, nombre, descripcion FROM roles_profesores WHERE id = ?`,
        [insertId]
    );
    return result[0];
};

const findRoleProfesorByName = async (nombre) => {
    const [rows] = await pool.execute(
        `SELECT * FROM roles_profesores WHERE nombre = ?`,
        [nombre]
    );

    return rows[0] || null;
};

const getAllRolesProfesores = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM roles_profesores ORDER BY nombre`
    );
    return rows;
};

const updateRoleProfesor = async (id, { nombre, descripcion }) => {
    await pool.execute(
        `UPDATE roles_profesores SET nombre = ?, descripcion = ?, updated_at = NOW() WHERE id = ?`,
        [nombre, descripcion, id]
    );

    const [rows] = await pool.execute(
        `SELECT id, nombre, descripcion FROM roles_profesores WHERE id = ?`,
        [id]
    );

    return rows[0] || null;
};

const deleteRoleProfesor = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM roles_profesores WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
};

// ============= GESTIÓN DE ASIGNACIONES DE PROFESORES =============

// Asignar profesor a proyecto con rol específico
const asignarProfesorAProyecto = async (proyectoId, profesorRut, rolProfesorId, asignadoPor, observaciones = null) => {
    try {
        // Verificar que no exista una asignación activa con el mismo rol
        const [existente] = await pool.execute(
            `SELECT id FROM asignaciones_proyectos 
             WHERE proyecto_id = ? AND profesor_rut = ? AND rol_profesor_id = ? AND activo = 1`,
            [proyectoId, profesorRut, rolProfesorId]
        );

        if (existente.length > 0) {
            throw new Error('El profesor ya tiene este rol asignado en el proyecto');
        }

        // Crear la asignación
        const [result] = await pool.execute(
            `INSERT INTO asignaciones_proyectos 
             (proyecto_id, profesor_rut, rol_profesor_id, asignado_por, observaciones) 
             VALUES (?, ?, ?, ?, ?)`,
            [proyectoId, profesorRut, rolProfesorId, asignadoPor, observaciones]
        );

        // Registrar en historial
        await pool.execute(
            `INSERT INTO historial_asignaciones 
             (asignacion_id, proyecto_id, profesor_rut, rol_profesor_id, accion, realizado_por, observaciones)
             VALUES (?, ?, ?, ?, 'asignado', ?, ?)`,
            [result.insertId, proyectoId, profesorRut, rolProfesorId, asignadoPor, observaciones]
        );

        return { id: result.insertId, mensaje: 'Profesor asignado exitosamente' };
    } catch (error) {
        throw error;
    }
};

// Desasignar profesor de proyecto
const desasignarProfesorDeProyecto = async (asignacionId, desasignadoPor, observaciones = null) => {
    try {
        // Obtener datos de la asignación antes de desactivarla
        const [asignacion] = await pool.execute(
            `SELECT proyecto_id, profesor_rut, rol_profesor_id FROM asignaciones_proyectos WHERE id = ? AND activo = 1`,
            [asignacionId]
        );

        if (asignacion.length === 0) {
            throw new Error('Asignación no encontrada o ya desactivada');
        }

        // Desactivar la asignación
        await pool.execute(
            `UPDATE asignaciones_proyectos 
             SET activo = 0, fecha_desasignacion = NOW() 
             WHERE id = ?`,
            [asignacionId]
        );

        // Registrar en historial
        await pool.execute(
            `INSERT INTO historial_asignaciones 
             (asignacion_id, proyecto_id, profesor_rut, rol_profesor_id, accion, realizado_por, observaciones)
             VALUES (?, ?, ?, ?, 'desasignado', ?, ?)`,
            [asignacionId, asignacion[0].proyecto_id, asignacion[0].profesor_rut, asignacion[0].rol_profesor_id, desasignadoPor, observaciones]
        );

        return { mensaje: 'Profesor desasignado exitosamente' };
    } catch (error) {
        throw error;
    }
};

// Obtener asignaciones de un proyecto
const getAsignacionesProyecto = async (proyectoId) => {
    const [rows] = await pool.execute(
        `SELECT 
            ap.id,
            ap.proyecto_id,
            ap.profesor_rut,
            u.nombre as profesor_nombre,
            u.email as profesor_email,
            ap.rol_profesor_id,
            rp.nombre as rol_nombre,
            rp.descripcion as rol_descripcion,
            ap.fecha_asignacion,
            ap.fecha_desasignacion,
            ap.activo,
            ap.observaciones,
            admin.nombre as asignado_por_nombre
         FROM asignaciones_proyectos ap
         INNER JOIN usuarios u ON ap.profesor_rut = u.rut
         INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
         LEFT JOIN usuarios admin ON ap.asignado_por = admin.rut
         WHERE ap.proyecto_id = ?
         ORDER BY ap.activo DESC, rp.nombre, ap.fecha_asignacion`,
        [proyectoId]
    );
    return rows;
};

// Obtener proyectos asignados a un profesor
const getProyectosAsignadosProfesor = async (profesorRut) => {
    const [rows] = await pool.execute(
        `SELECT 
            p.id as proyecto_id,
            p.titulo,
            p.descripcion,
            p.estado_proyecto,
            p.porcentaje_avance,
            ap.id as asignacion_id,
            ap.rol_profesor_id,
            rp.nombre as rol_nombre,
            rp.descripcion as rol_descripcion,
            ap.fecha_asignacion,
            ap.observaciones,
            est.nombre as estudiante_nombre
         FROM asignaciones_proyectos ap
         INNER JOIN proyectos p ON ap.proyecto_id = p.id
         INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
         LEFT JOIN usuarios est ON p.estudiante_rut = est.rut
         WHERE ap.profesor_rut = ? AND ap.activo = 1
         ORDER BY rp.nombre, p.titulo`,
        [profesorRut]
    );
    return rows;
};

// Obtener estadísticas de asignaciones
const getEstadisticasAsignaciones = async () => {
    const [stats] = await pool.execute(
        `SELECT 
            COUNT(DISTINCT ap.proyecto_id) as proyectos_con_asignaciones,
            COUNT(DISTINCT ap.profesor_rut) as profesores_asignados,
            COUNT(*) as total_asignaciones_activas,
            rp.nombre as rol_nombre,
            COUNT(ap.id) as asignaciones_por_rol
         FROM asignaciones_proyectos ap
         INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
         WHERE ap.activo = 1
         GROUP BY rp.id, rp.nombre
         ORDER BY asignaciones_por_rol DESC`
    );

    const [totales] = await pool.execute(
        `SELECT 
            COUNT(DISTINCT ap.proyecto_id) as total_proyectos_asignados,
            COUNT(DISTINCT ap.profesor_rut) as total_profesores_activos,
            COUNT(*) as total_asignaciones_activas
         FROM asignaciones_proyectos ap
         WHERE ap.activo = 1`
    );

    return {
        totales: totales[0],
        por_roles: stats
    };
};

// Obtener historial de asignaciones
const getHistorialAsignaciones = async (proyectoId = null, profesorRut = null, limite = 50) => {
    let query = `
        SELECT 
            ha.id,
            ha.proyecto_id,
            p.titulo as proyecto_titulo,
            ha.profesor_rut,
            prof.nombre as profesor_nombre,
            ha.rol_profesor_id,
            rp.nombre as rol_nombre,
            ha.accion,
            ha.fecha_accion,
            ha.realizado_por,
            admin.nombre as realizado_por_nombre,
            ha.observaciones
        FROM historial_asignaciones ha
        INNER JOIN proyectos p ON ha.proyecto_id = p.id
        INNER JOIN usuarios prof ON ha.profesor_rut = prof.rut
        INNER JOIN roles_profesores rp ON ha.rol_profesor_id = rp.id
        LEFT JOIN usuarios admin ON ha.realizado_por = admin.rut
        WHERE 1=1
    `;
    
    const params = [];
    
    if (proyectoId) {
        query += ` AND ha.proyecto_id = ?`;
        params.push(proyectoId);
    }
    
    if (profesorRut) {
        query += ` AND ha.profesor_rut = ?`;
        params.push(profesorRut);
    }
    
    query += ` ORDER BY ha.fecha_accion DESC LIMIT ?`;
    params.push(limite);

    const [rows] = await pool.execute(query, params);
    return rows;
};

export const RoleModel = {
    // Roles de usuarios
    createRole,
    findRoleByName,
    findRoleById,
    getAllRoles,
    updateRole,
    deleteRole,
    
    // Roles de profesores
    createRoleProfesor,
    findRoleProfesorByName,
    getAllRolesProfesores,
    updateRoleProfesor,
    deleteRoleProfesor,
    
    // Gestión de asignaciones
    asignarProfesorAProyecto,
    desasignarProfesorDeProyecto,
    getAsignacionesProyecto,
    getProyectosAsignadosProfesor,
    getEstadisticasAsignaciones,
    getHistorialAsignaciones
};
