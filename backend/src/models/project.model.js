import { pool } from '../db/connectionDB.js';

// Crear un nuevo proyecto desde una propuesta aprobada
const createProject = async ({ titulo, descripcion, propuesta_id, estudiante_rut, fecha_inicio, fecha_entrega_estimada }) => {
    const query = `
        INSERT INTO proyectos (titulo, descripcion, propuesta_id, estudiante_rut, fecha_inicio, fecha_entrega_estimada)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [titulo, descripcion, propuesta_id, estudiante_rut, fecha_inicio, fecha_entrega_estimada]);
    
    // Actualizar la propuesta con el proyecto_id
    await pool.execute(
        `UPDATE propuestas SET proyecto_id = ? WHERE id = ?`,
        [result.insertId, propuesta_id]
    );

    return result.insertId;
};

// Obtener todos los proyectos
const getProjects = async () => {
    const query = `
        SELECT p.*, 
               u.nombre AS nombre_estudiante,
               prop.titulo AS titulo_propuesta,
               GROUP_CONCAT(DISTINCT rp.nombre) AS roles_profesores
        FROM proyectos p
        LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
        LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
        LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
        LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        GROUP BY p.id
        ORDER BY p.fecha_inicio DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
};

// Obtener proyecto por ID
const getProjectById = async (projectId) => {
    const query = `
        SELECT p.*, 
               u.nombre AS nombre_estudiante,
               prop.titulo AS titulo_propuesta,
               prop.descripcion AS descripcion_propuesta
        FROM proyectos p
        LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
        LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
        WHERE p.id = ?
    `;
    const [rows] = await pool.execute(query, [projectId]);
    return rows[0];
};

// Obtener proyectos por estudiante
const getProjectsByStudent = async (estudiante_rut) => {
    const query = `
        SELECT p.*, 
               prop.titulo AS titulo_propuesta,
               GROUP_CONCAT(DISTINCT rp.nombre) AS roles_profesores
        FROM proyectos p
        LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
        LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
        LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE p.estudiante_rut = ?
        GROUP BY p.id
        ORDER BY p.fecha_inicio DESC
    `;
    const [rows] = await pool.execute(query, [estudiante_rut]);
    return rows;
};

// Obtener proyectos por profesor
const getProjectsByProfessor = async (profesor_rut) => {
    const query = `
        SELECT p.*, 
               u.nombre AS nombre_estudiante,
               prop.titulo AS titulo_propuesta,
               rp.nombre AS rol_profesor
        FROM proyectos p
        INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
        LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
        LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
        LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.profesor_rut = ? AND ap.activo = TRUE
        ORDER BY p.fecha_inicio DESC
    `;
    const [rows] = await pool.execute(query, [profesor_rut]);
    return rows;
};

// Actualizar proyecto
const updateProject = async (projectId, { titulo, descripcion, estado, fecha_entrega_estimada, fecha_defensa }) => {
    const query = `
        UPDATE proyectos 
        SET titulo = ?, descripcion = ?, estado = ?, fecha_entrega_estimada = ?, fecha_defensa = ?, updated_at = NOW()
        WHERE id = ?
    `;
    const [result] = await pool.execute(query, [titulo, descripcion, estado, fecha_entrega_estimada, fecha_defensa, projectId]);
    return result.affectedRows > 0;
};

// Asignar profesor a proyecto
const assignProfessorToProject = async (projectId, profesor_rut, rol_profesor_id) => {
    const query = `
        INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id)
        VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(query, [projectId, profesor_rut, rol_profesor_id]);
    return result.affectedRows > 0;
};

// Obtener profesores asignados a un proyecto
const getProjectProfessors = async (projectId) => {
    const query = `
        SELECT u.rut, u.nombre, u.email, rp.nombre AS rol_profesor, ap.fecha_asignacion
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.proyecto_id = ? AND ap.activo = TRUE
        ORDER BY rp.nombre
    `;
    const [rows] = await pool.execute(query, [projectId]);
    return rows;
};

// Desasignar profesor de proyecto
const unassignProfessorFromProject = async (projectId, profesor_rut, rol_profesor_id) => {
    const query = `
        UPDATE asignaciones_proyectos 
        SET activo = FALSE 
        WHERE proyecto_id = ? AND profesor_rut = ? AND rol_profesor_id = ?
    `;
    const [result] = await pool.execute(query, [projectId, profesor_rut, rol_profesor_id]);
    return result.affectedRows > 0;
};

// Eliminar proyecto
const deleteProject = async (projectId) => {
    const query = `DELETE FROM proyectos WHERE id = ?`;
    await pool.execute(query, [projectId]);
};

// Obtener estadísticas de proyectos
const getProjectStats = async () => {
    const query = `
        SELECT 
            COUNT(*) as total_proyectos,
            SUM(CASE WHEN estado = 'en_desarrollo' THEN 1 ELSE 0 END) as en_desarrollo,
            SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
            SUM(CASE WHEN estado = 'defendido' THEN 1 ELSE 0 END) as defendidos
        FROM proyectos
    `;
    const [rows] = await pool.execute(query);
    return rows[0];
};

// Crear proyecto completo desde propuesta aprobada
const crearProyectoCompleto = async (proyectoData) => {
    const { titulo, descripcion, propuesta_id, estudiante_rut, estado_id, fecha_inicio, fecha_entrega_estimada, fecha_entrega_real, fecha_defensa } = proyectoData;
    
    const query = `
        INSERT INTO proyectos (titulo, descripcion, propuesta_id, estudiante_rut, estado_id, fecha_inicio, fecha_entrega_estimada, fecha_entrega_real, fecha_defensa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
        titulo, 
        descripcion, 
        propuesta_id, 
        estudiante_rut, 
        estado_id, 
        fecha_inicio, 
        fecha_entrega_estimada, 
        fecha_entrega_real, 
        fecha_defensa
    ]);
    
    return result.insertId;
};

// Obtener profesores asignados a una propuesta
const obtenerProfesoresAsignadosPropuesta = async (propuesta_id) => {
    const query = `
        SELECT ap.profesor_rut, u.nombre, u.email
        FROM asignaciones_propuestas ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        WHERE ap.propuesta_id = ?
    `;
    const [rows] = await pool.execute(query, [propuesta_id]);
    return rows;
};

// Asignar profesor a proyecto con rol específico
const asignarProfesorProyecto = async ({ proyecto_id, profesor_rut, rol_profesor_id }) => {
    const query = `
        INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, activo)
        VALUES (?, ?, ?, TRUE)
        ON DUPLICATE KEY UPDATE activo = TRUE, fecha_asignacion = CURRENT_TIMESTAMP
    `;
    const [result] = await pool.execute(query, [proyecto_id, profesor_rut, rol_profesor_id]);
    return result.affectedRows > 0;
};

// Verificar si un usuario puede ver un proyecto específico
const puedeVerProyecto = async (proyecto_id, usuario_rut, rol_usuario) => {
    // Los administradores pueden ver todos los proyectos
    if (rol_usuario === 'admin' || rol_usuario === 3) {
        return true;
    }

    const query = `
        SELECT 
            p.id,
            p.estudiante_rut,
            ap.profesor_rut
        FROM proyectos p
        LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id AND ap.activo = TRUE
        WHERE p.id = ?
        AND (
            p.estudiante_rut = ?  -- Es el estudiante dueño del proyecto
            OR ap.profesor_rut = ? -- Es un profesor asignado al proyecto
        )
        LIMIT 1
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id, usuario_rut, usuario_rut]);
    return rows.length > 0;
};

// Obtener proyectos filtrados por permisos de usuario
const obtenerProyectosPorPermisos = async (usuario_rut, rol_usuario) => {
    let query;
    let params;

    if (rol_usuario === 'admin' || rol_usuario === 3) {
        // Los administradores ven todos los proyectos
        query = `
            SELECT p.*, 
                   u.nombre AS nombre_estudiante,
                   u.email AS email_estudiante,
                   prop.titulo AS titulo_propuesta,
                   ep.nombre AS estado_proyecto,
                   GROUP_CONCAT(DISTINCT CONCAT(up.nombre, ' (', rp.nombre, ')')) AS profesores_asignados
            FROM proyectos p
            LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
            LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
            LEFT JOIN estados_proyectos ep ON p.estado_id = ep.id
            LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id AND ap.activo = TRUE
            LEFT JOIN usuarios up ON ap.profesor_rut = up.rut
            LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            GROUP BY p.id
            ORDER BY p.fecha_inicio DESC
        `;
        params = [];
    } else if (rol_usuario === 'estudiante' || rol_usuario === 1) {
        // Los estudiantes solo ven sus propios proyectos
        query = `
            SELECT p.*, 
                   u.nombre AS nombre_estudiante,
                   u.email AS email_estudiante,
                   prop.titulo AS titulo_propuesta,
                   ep.nombre AS estado_proyecto,
                   GROUP_CONCAT(DISTINCT CONCAT(up.nombre, ' (', rp.nombre, ')')) AS profesores_asignados
            FROM proyectos p
            LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
            LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
            LEFT JOIN estados_proyectos ep ON p.estado_id = ep.id
            LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id AND ap.activo = TRUE
            LEFT JOIN usuarios up ON ap.profesor_rut = up.rut
            LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            WHERE p.estudiante_rut = ?
            GROUP BY p.id
            ORDER BY p.fecha_inicio DESC
        `;
        params = [usuario_rut];
    } else if (rol_usuario === 'profesor' || rol_usuario === 2) {
        // Los profesores ven proyectos donde están asignados
        query = `
            SELECT p.*, 
                   u.nombre AS nombre_estudiante,
                   u.email AS email_estudiante,
                   prop.titulo AS titulo_propuesta,
                   ep.nombre AS estado_proyecto,
                   GROUP_CONCAT(DISTINCT CONCAT(up.nombre, ' (', rp.nombre, ')')) AS profesores_asignados,
                   rp_actual.nombre AS mi_rol
            FROM proyectos p
            LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
            LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
            LEFT JOIN estados_proyectos ep ON p.estado_id = ep.id
            INNER JOIN asignaciones_proyectos ap_usuario ON p.id = ap_usuario.proyecto_id 
                AND ap_usuario.profesor_rut = ? AND ap_usuario.activo = TRUE
            LEFT JOIN roles_profesores rp_actual ON ap_usuario.rol_profesor_id = rp_actual.id
            LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id AND ap.activo = TRUE
            LEFT JOIN usuarios up ON ap.profesor_rut = up.rut
            LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            GROUP BY p.id
            ORDER BY p.fecha_inicio DESC
        `;
        params = [usuario_rut];
    } else {
        // Rol no reconocido, sin acceso
        return [];
    }

    const [rows] = await pool.execute(query, params);
    return rows;
};

// Obtener detalles de proyecto con verificación de permisos
const obtenerProyectoPorIdConPermisos = async (proyecto_id, usuario_rut, rol_usuario) => {
    // Verificar primero si tiene permisos
    const tienePermiso = await puedeVerProyecto(proyecto_id, usuario_rut, rol_usuario);
    if (!tienePermiso) {
        return null;
    }

    const query = `
        SELECT p.*, 
               u.nombre AS nombre_estudiante,
               u.email AS email_estudiante,
               u.rut AS estudiante_rut,
               prop.titulo AS titulo_propuesta,
               prop.descripcion AS descripcion_propuesta,
               prop.fecha_envio AS fecha_envio_propuesta,
               ep.nombre AS estado_proyecto,
               ep.descripcion AS descripcion_estado
        FROM proyectos p
        LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
        LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
        LEFT JOIN estados_proyectos ep ON p.estado_id = ep.id
        WHERE p.id = ?
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id]);
    
    if (rows.length === 0) {
        return null;
    }

    const proyecto = rows[0];

    // Obtener profesores asignados al proyecto
    const queryProfesores = `
        SELECT ap.profesor_rut,
               u.nombre AS nombre_profesor,
               u.email AS email_profesor,
               rp.nombre AS rol_profesor,
               rp.descripcion AS descripcion_rol,
               ap.fecha_asignacion
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.proyecto_id = ? AND ap.activo = TRUE
        ORDER BY rp.nombre
    `;
    
    const [profesores] = await pool.execute(queryProfesores, [proyecto_id]);
    
    proyecto.profesores_asignados = profesores;
    
    return proyecto;
};

export const ProjectModel = {
    createProject,
    getProjects,
    getProjectById,
    getProjectsByStudent,
    getProjectsByProfessor,
    updateProject,
    assignProfessorToProject,
    getProjectProfessors,
    unassignProfessorFromProject,
    deleteProject,
    getProjectStats,
    crearProyectoCompleto,
    obtenerProfesoresAsignadosPropuesta,
    asignarProfesorProyecto,
    puedeVerProyecto,
    obtenerProyectosPorPermisos,
    obtenerProyectoPorIdConPermisos
};
