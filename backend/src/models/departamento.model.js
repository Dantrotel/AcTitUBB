import { pool } from '../db/connectionDB.js';

// ========== GESTIÓN DE DEPARTAMENTOS ==========

/**
 * Obtener todos los departamentos
 */
const obtenerDepartamentos = async (soloActivos = false, facultadId = null) => {
    let query = `
        SELECT d.*, f.nombre as facultad_nombre, u.nombre as jefe_nombre
        FROM departamentos d
        LEFT JOIN facultades f ON d.facultad_id = f.id
        LEFT JOIN usuarios u ON d.jefe_departamento_rut = u.rut
    `;
    
    const conditions = [];
    const params = [];
    
    if (soloActivos) {
        conditions.push('d.activo = TRUE');
    }
    
    if (facultadId) {
        conditions.push('d.facultad_id = ?');
        params.push(facultadId);
    }
    
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY f.nombre, d.nombre';
    
    const [rows] = await pool.execute(query, params);
    return rows;
};

/**
 * Obtener departamento por ID
 */
const obtenerDepartamentoPorId = async (id) => {
    const query = `
        SELECT d.*, f.nombre as facultad_nombre, u.nombre as jefe_nombre, u.email as jefe_email
        FROM departamentos d
        LEFT JOIN facultades f ON d.facultad_id = f.id
        LEFT JOIN usuarios u ON d.jefe_departamento_rut = u.rut
        WHERE d.id = ?
    `;
    
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
};

/**
 * Crear nuevo departamento
 */
const crearDepartamento = async (departamentoData) => {
    const { 
        facultad_id, 
        nombre, 
        codigo, 
        descripcion = null, 
        jefe_departamento_rut = null, 
        telefono = null, 
        email = null, 
        ubicacion = null 
    } = departamentoData;
    
    const query = `
        INSERT INTO departamentos (facultad_id, nombre, codigo, descripcion, jefe_departamento_rut, telefono, email, ubicacion)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [facultad_id, nombre, codigo, descripcion, jefe_departamento_rut, telefono, email, ubicacion]);
    return result.insertId;
};

/**
 * Actualizar departamento
 */
const actualizarDepartamento = async (id, departamentoData) => {
    const { 
        facultad_id, 
        nombre, 
        codigo, 
        descripcion = null, 
        jefe_departamento_rut = null, 
        telefono = null, 
        email = null, 
        ubicacion = null, 
        activo = true 
    } = departamentoData;
    
    const query = `
        UPDATE departamentos 
        SET facultad_id = ?, nombre = ?, codigo = ?, descripcion = ?, jefe_departamento_rut = ?, 
            telefono = ?, email = ?, ubicacion = ?, activo = ?
        WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [facultad_id, nombre, codigo, descripcion, jefe_departamento_rut, telefono, email, ubicacion, activo, id]);
    return result.affectedRows > 0;
};

/**
 * Asignar jefe de departamento
 */
const asignarJefeDepartamento = async (departamento_id, profesor_rut) => {
    const query = 'UPDATE departamentos SET jefe_departamento_rut = ? WHERE id = ?';
    const [result] = await pool.execute(query, [profesor_rut, departamento_id]);
    return result.affectedRows > 0;
};

/**
 * Obtener profesores de un departamento
 */
const obtenerProfesoresDepartamento = async (departamento_id) => {
    const query = `
        SELECT u.rut, u.nombre, u.email, pd.es_principal, pd.fecha_ingreso, pd.activo
        FROM profesores_departamentos pd
        INNER JOIN usuarios u ON pd.profesor_rut = u.rut
        WHERE pd.departamento_id = ? AND pd.activo = TRUE
        ORDER BY pd.es_principal DESC, u.nombre
    `;
    
    const [rows] = await pool.execute(query, [departamento_id]);
    return rows;
};

/**
 * Asignar profesor a departamento
 */
const asignarProfesorDepartamento = async (profesor_rut, departamento_id, es_principal = false, fecha_ingreso = null) => {
    const query = `
        INSERT INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE es_principal = ?, activo = TRUE
    `;
    
    const fechaIngreso = fecha_ingreso || new Date().toISOString().split('T')[0];
    const [result] = await pool.execute(query, [profesor_rut, departamento_id, es_principal, fechaIngreso, es_principal]);
    return result.affectedRows > 0;
};

/**
 * Remover profesor de departamento
 */
const removerProfesorDepartamento = async (profesor_rut, departamento_id) => {
    const query = `
        UPDATE profesores_departamentos 
        SET activo = FALSE, fecha_salida = CURDATE()
        WHERE profesor_rut = ? AND departamento_id = ?
    `;
    
    const [result] = await pool.execute(query, [profesor_rut, departamento_id]);
    return result.affectedRows > 0;
};

/**
 * Obtener estadísticas de un departamento
 */
const obtenerEstadisticasDepartamento = async (id) => {
    const query = `
        SELECT 
            d.id,
            d.nombre,
            d.codigo,
            COUNT(DISTINCT pd.profesor_rut) as total_profesores,
            COUNT(DISTINCT c.id) as carreras_relacionadas
        FROM departamentos d
        LEFT JOIN profesores_departamentos pd ON d.id = pd.departamento_id AND pd.activo = TRUE
        LEFT JOIN carreras c ON d.facultad_id = c.facultad_id AND c.activo = TRUE
        WHERE d.id = ?
        GROUP BY d.id, d.nombre, d.codigo
    `;
    
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
};

export {
    obtenerDepartamentos,
    obtenerDepartamentoPorId,
    crearDepartamento,
    actualizarDepartamento,
    asignarJefeDepartamento,
    obtenerProfesoresDepartamento,
    asignarProfesorDepartamento,
    removerProfesorDepartamento,
    obtenerEstadisticasDepartamento
};
