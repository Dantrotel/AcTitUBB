import { pool } from '../db/connectionDB.js';

// Crear un nuevo avance
export const crearAvance = async ({ proyecto_id, titulo, descripcion, archivo }) => {
    const [result] = await pool.execute(
        `INSERT INTO avances (proyecto_id, titulo, descripcion, archivo)
         VALUES (?, ?, ?, ?)`,
        [proyecto_id, titulo, descripcion, archivo]
    );
    return result.insertId;
};

// Obtener todos los avances de un proyecto
export const obtenerAvancesPorProyecto = async (proyecto_id) => {
    const [rows] = await pool.execute(`
        SELECT a.*, 
               u.nombre AS nombre_revisor
        FROM avances a
        LEFT JOIN usuarios u ON a.profesor_revisor = u.rut
        WHERE a.proyecto_id = ?
        ORDER BY a.fecha_envio DESC
    `, [proyecto_id]);
    return rows;
};

// Obtener avance por ID
export const obtenerAvancePorId = async (avance_id) => {
    const [rows] = await pool.execute(`
        SELECT a.*, 
               u.nombre AS nombre_revisor,
               p.titulo AS titulo_proyecto
        FROM avances a
        LEFT JOIN usuarios u ON a.profesor_revisor = u.rut
        LEFT JOIN proyectos p ON a.proyecto_id = p.id
        WHERE a.id = ?
    `, [avance_id]);
    return rows[0];
};

// Revisar avance
export const revisarAvance = async (avance_id, { comentarios_profesor, estado, profesor_revisor }) => {
    const [result] = await pool.execute(
        `UPDATE avances SET comentarios_profesor = ?, estado = ?, profesor_revisor = ?, fecha_revision = NOW() WHERE id = ?`,
        [comentarios_profesor, estado, profesor_revisor, avance_id]
    );
    return result.affectedRows > 0;
};

// Actualizar avance
export const actualizarAvance = async (avance_id, { titulo, descripcion, archivo }) => {
    const [result] = await pool.execute(
        `UPDATE avances SET titulo = ?, descripcion = ?, archivo = ?, updated_at = NOW() WHERE id = ?`,
        [titulo, descripcion, archivo, avance_id]
    );
    return result.affectedRows > 0;
};

// Eliminar avance
export const eliminarAvance = async (avance_id) => {
    const [result] = await pool.execute(`DELETE FROM avances WHERE id = ?`, [avance_id]);
    return result.affectedRows > 0;
};

// Obtener avances por profesor revisor
export const obtenerAvancesPorProfesor = async (profesor_rut) => {
    const [rows] = await pool.execute(`
        SELECT a.*, 
               p.titulo AS titulo_proyecto,
               u.nombre AS nombre_estudiante
        FROM avances a
        INNER JOIN proyectos p ON a.proyecto_id = p.id
        INNER JOIN usuarios u ON p.estudiante_rut = u.rut
        WHERE a.profesor_revisor = ?
        ORDER BY a.fecha_envio DESC
    `, [profesor_rut]);
    return rows;
};

// Obtener estadísticas de avances
export const obtenerEstadisticasAvances = async (proyecto_id) => {
    const [rows] = await pool.execute(`
        SELECT 
            COUNT(*) as total_avances,
            SUM(CASE WHEN estado = 'enviado' THEN 1 ELSE 0 END) as enviados,
            SUM(CASE WHEN estado = 'en_revision' THEN 1 ELSE 0 END) as en_revision,
            SUM(CASE WHEN estado = 'con_comentarios' THEN 1 ELSE 0 END) as con_comentarios,
            SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as aprobados
        FROM avances
        WHERE proyecto_id = ?
    `, [proyecto_id]);
    return rows[0];
}; 