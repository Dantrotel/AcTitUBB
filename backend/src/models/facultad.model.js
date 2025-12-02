import { pool } from '../db/connectionDB.js';

// ========== GESTIÓN DE FACULTADES ==========

/**
 * Obtener todas las facultades
 */
const obtenerFacultades = async (soloActivas = false) => {
    let query = 'SELECT * FROM facultades';
    if (soloActivas) {
        query += ' WHERE activo = TRUE';
    }
    query += ' ORDER BY nombre';
    
    const [rows] = await pool.execute(query);
    return rows;
};

/**
 * Obtener facultad por ID
 */
const obtenerFacultadPorId = async (id) => {
    const query = 'SELECT * FROM facultades WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
};

/**
 * Obtener facultad por código
 */
const obtenerFacultadPorCodigo = async (codigo) => {
    const query = 'SELECT * FROM facultades WHERE codigo = ?';
    const [rows] = await pool.execute(query, [codigo]);
    return rows[0];
};

/**
 * Crear nueva facultad
 */
const crearFacultad = async (facultadData) => {
    const { 
        nombre, 
        codigo, 
        descripcion = null, 
        telefono = null, 
        email = null, 
        ubicacion = null 
    } = facultadData;
    
    const query = `
        INSERT INTO facultades (nombre, codigo, descripcion, telefono, email, ubicacion)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [nombre, codigo, descripcion, telefono, email, ubicacion]);
    return result.insertId;
};

/**
 * Actualizar facultad
 */
const actualizarFacultad = async (id, facultadData) => {
    const { nombre, codigo, descripcion, telefono, email, ubicacion, activo } = facultadData;
    
    const query = `
        UPDATE facultades 
        SET nombre = ?, codigo = ?, descripcion = ?, telefono = ?, email = ?, ubicacion = ?, activo = ?
        WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [nombre, codigo, descripcion, telefono, email, ubicacion, activo, id]);
    return result.affectedRows > 0;
};

/**
 * Eliminar (desactivar) facultad - Soft Delete
 */
const eliminarFacultad = async (id) => {
    const query = 'UPDATE facultades SET activo = FALSE WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
};

/**
 * Reactivar facultad - Restaurar Soft Delete
 */
const reactivarFacultad = async (id) => {
    const query = 'UPDATE facultades SET activo = TRUE WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
};

/**
 * Eliminar facultad permanentemente - Hard Delete
 */
const eliminarFacultadPermanente = async (id) => {
    const query = 'DELETE FROM facultades WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
};

/**
 * Obtener estadísticas de una facultad
 */
const obtenerEstadisticasFacultad = async (id) => {
    const query = `
        SELECT 
            f.id,
            f.nombre,
            f.codigo,
            COUNT(DISTINCT d.id) as total_departamentos,
            COUNT(DISTINCT c.id) as total_carreras,
            COUNT(DISTINCT pd.profesor_rut) as total_profesores,
            COUNT(DISTINCT ec.estudiante_rut) as total_estudiantes
        FROM facultades f
        LEFT JOIN departamentos d ON f.id = d.facultad_id AND d.activo = TRUE
        LEFT JOIN carreras c ON f.id = c.facultad_id AND c.activo = TRUE
        LEFT JOIN profesores_departamentos pd ON d.id = pd.departamento_id AND pd.activo = TRUE
        LEFT JOIN estudiantes_carreras ec ON c.id = ec.carrera_id AND ec.estado_estudiante = 'regular'
        WHERE f.id = ?
        GROUP BY f.id, f.nombre, f.codigo
    `;
    
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
};

export {
    obtenerFacultades,
    obtenerFacultadPorId,
    obtenerFacultadPorCodigo,
    crearFacultad,
    actualizarFacultad,
    eliminarFacultad,
    reactivarFacultad,
    eliminarFacultadPermanente,
    obtenerEstadisticasFacultad
};
