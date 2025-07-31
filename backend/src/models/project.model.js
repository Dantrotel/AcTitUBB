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
    getProjectStats
};
