import { pool } from '../db/connectionDB.js';

// ========== GESTIÓN DE CARRERAS ==========

/**
 * Obtener todas las carreras
 */
const obtenerCarreras = async (soloActivas = false, facultadId = null) => {
    let query = `
        SELECT c.*, f.nombre as facultad_nombre, u.nombre as jefe_carrera_nombre, u.email as jefe_carrera_email
        FROM carreras c
        LEFT JOIN facultades f ON c.facultad_id = f.id
        LEFT JOIN usuarios u ON c.jefe_carrera_rut = u.rut
    `;
    
    const conditions = [];
    const params = [];
    
    if (soloActivas) {
        conditions.push('c.activo = TRUE');
    }
    
    if (facultadId) {
        conditions.push('c.facultad_id = ?');
        params.push(facultadId);
    }
    
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY f.nombre, c.nombre';
    
    const [rows] = await pool.execute(query, params);
    return rows;
};

/**
 * Obtener carrera por ID
 */
const obtenerCarreraPorId = async (id) => {
    const query = `
        SELECT c.*, f.nombre as facultad_nombre, f.codigo as facultad_codigo,
               u.nombre as jefe_carrera_nombre, u.email as jefe_carrera_email, u.rut as jefe_carrera_rut
        FROM carreras c
        LEFT JOIN facultades f ON c.facultad_id = f.id
        LEFT JOIN usuarios u ON c.jefe_carrera_rut = u.rut
        WHERE c.id = ?
    `;
    
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
};

/**
 * Obtener carrera por código
 */
const obtenerCarreraPorCodigo = async (codigo) => {
    const query = `
        SELECT c.*, f.nombre as facultad_nombre
        FROM carreras c
        LEFT JOIN facultades f ON c.facultad_id = f.id
        WHERE c.codigo = ?
    `;
    
    const [rows] = await pool.execute(query, [codigo]);
    return rows[0];
};

/**
 * Obtener la carrera de un jefe de carrera por su RUT
 */
const obtenerCarreraPorJefeRut = async (rut) => {
    const query = `
        SELECT c.id, c.nombre, c.codigo, c.facultad_id, f.nombre as facultad_nombre
        FROM carreras c
        LEFT JOIN facultades f ON c.facultad_id = f.id
        WHERE c.jefe_carrera_rut = ? AND c.activo = TRUE
    `;
    
    const [rows] = await pool.execute(query, [rut]);
    return rows[0]; // Un jefe solo puede estar en una carrera
};

/**
 * Crear nueva carrera
 */
const crearCarrera = async (carreraData) => {
    const { 
        facultad_id, 
        nombre, 
        codigo, 
        titulo_profesional, 
        grado_academico = null, 
        duracion_semestres = null, 
        jefe_carrera_rut = null, 
        descripcion = null, 
        modalidad = 'presencial' 
    } = carreraData;
    
    const query = `
        INSERT INTO carreras (
            facultad_id, nombre, codigo, titulo_profesional, grado_academico, 
            duracion_semestres, jefe_carrera_rut, descripcion, modalidad
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
        facultad_id, nombre, codigo, titulo_profesional, grado_academico,
        duracion_semestres, jefe_carrera_rut, descripcion, modalidad
    ]);
    
    return result.insertId;
};

/**
 * Actualizar carrera
 */
const actualizarCarrera = async (id, carreraData) => {
    const { 
        facultad_id, 
        nombre, 
        codigo, 
        titulo_profesional, 
        grado_academico = null, 
        duracion_semestres = null, 
        jefe_carrera_rut = null, 
        descripcion = null, 
        modalidad = 'presencial', 
        activo = true 
    } = carreraData;
    
    const query = `
        UPDATE carreras 
        SET facultad_id = ?, nombre = ?, codigo = ?, titulo_profesional = ?, grado_academico = ?, 
            duracion_semestres = ?, jefe_carrera_rut = ?, descripcion = ?, modalidad = ?, activo = ?
        WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [
        facultad_id, nombre, codigo, titulo_profesional, grado_academico,
        duracion_semestres, jefe_carrera_rut, descripcion, modalidad, activo, id
    ]);
    
    return result.affectedRows > 0;
};

/**
 * Asignar jefe de carrera
 */
const asignarJefeCarrera = async (carrera_id, profesor_rut) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Obtener el jefe actual de la carrera (si existe)
        const [carreraActual] = await connection.execute(
            'SELECT jefe_carrera_rut FROM carreras WHERE id = ?',
            [carrera_id]
        );
        
        // Si hay un jefe actual, cambiar su rol de vuelta a Profesor (rol 2)
        if (carreraActual[0]?.jefe_carrera_rut) {
            await connection.execute(
                'UPDATE usuarios SET rol_id = 2 WHERE rut = ?',
                [carreraActual[0].jefe_carrera_rut]
            );
        }
        
        // Actualizar carrera con nuevo jefe
        await connection.execute(
            'UPDATE carreras SET jefe_carrera_rut = ? WHERE id = ?',
            [profesor_rut, carrera_id]
        );
        
        // Cambiar rol del nuevo profesor a Admin (Jefe de Carrera - rol 3)
        await connection.execute(
            'UPDATE usuarios SET rol_id = 3 WHERE rut = ?',
            [profesor_rut]
        );
        
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Remover jefe de carrera
 */
const removerJefeCarrera = async (carrera_id) => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Obtener RUT del jefe actual
        const [carrera] = await connection.execute('SELECT jefe_carrera_rut FROM carreras WHERE id = ?', [carrera_id]);
        
        if (carrera[0]?.jefe_carrera_rut) {
            // Cambiar rol del usuario de vuelta a Profesor (rol 2)
            await connection.execute(
                'UPDATE usuarios SET rol_id = 2 WHERE rut = ?',
                [carrera[0].jefe_carrera_rut]
            );
        }
        
        // Remover jefe de la carrera
        await connection.execute('UPDATE carreras SET jefe_carrera_rut = NULL WHERE id = ?', [carrera_id]);
        
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Obtener estudiantes de una carrera
 */
const obtenerEstudiantesCarrera = async (carrera_id) => {
    const query = `
        SELECT u.rut, u.nombre, u.email, 
               ec.ano_ingreso, ec.semestre_actual, ec.estado_estudiante, 
               ec.promedio_acumulado, ec.creditos_aprobados, ec.es_carrera_principal
        FROM estudiantes_carreras ec
        INNER JOIN usuarios u ON ec.estudiante_rut = u.rut
        WHERE ec.carrera_id = ?
        ORDER BY ec.ano_ingreso DESC, u.nombre
    `;
    
    const [rows] = await pool.execute(query, [carrera_id]);
    return rows;
};

/**
 * Asignar estudiante a carrera
 */
const asignarEstudianteCarrera = async (estudiante_rut, carrera_id, datosAcademicos = {}) => {
    const { 
        ano_ingreso = new Date().getFullYear(),
        semestre_actual = 1,
        estado_estudiante = 'regular',
        es_carrera_principal = true,
        fecha_ingreso = new Date().toISOString().split('T')[0]
    } = datosAcademicos;
    
    const query = `
        INSERT INTO estudiantes_carreras (
            estudiante_rut, carrera_id, ano_ingreso, semestre_actual, 
            estado_estudiante, es_carrera_principal, fecha_ingreso
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            semestre_actual = ?, estado_estudiante = ?
    `;
    
    const [result] = await pool.execute(query, [
        estudiante_rut, carrera_id, ano_ingreso, semestre_actual,
        estado_estudiante, es_carrera_principal, fecha_ingreso,
        semestre_actual, estado_estudiante
    ]);
    
    return result.affectedRows > 0;
};

/**
 * Obtener estadísticas de una carrera
 */
const obtenerEstadisticasCarrera = async (id) => {
    const query = `
        SELECT 
            c.id,
            c.nombre,
            c.codigo,
            COUNT(DISTINCT ec.estudiante_rut) as total_estudiantes,
            COUNT(DISTINCT CASE WHEN ec.estado_estudiante = 'regular' THEN ec.estudiante_rut END) as estudiantes_activos,
            COUNT(DISTINCT CASE WHEN ec.estado_estudiante = 'egresado' THEN ec.estudiante_rut END) as egresados,
            COUNT(DISTINCT CASE WHEN ec.estado_estudiante = 'titulado' THEN ec.estudiante_rut END) as titulados,
            COUNT(DISTINCT p.id) as total_propuestas,
            COUNT(DISTINCT pr.id) as total_proyectos
        FROM carreras c
        LEFT JOIN estudiantes_carreras ec ON c.id = ec.carrera_id
        LEFT JOIN propuestas p ON c.id = p.carrera_id
        LEFT JOIN proyectos pr ON c.id = pr.carrera_id
        WHERE c.id = ?
        GROUP BY c.id, c.nombre, c.codigo
    `;
    
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
};

/**
 * Obtener propuestas pendientes de aprobación por jefe de carrera
 */
const obtenerPropuestasPendientesAprobacion = async (carrera_id) => {
    const query = `
        SELECT p.*, u.nombre as estudiante_nombre, u.email as estudiante_email,
               ep.estado as estado_propuesta
        FROM propuestas p
        INNER JOIN usuarios u ON p.estudiante_rut = u.rut
        LEFT JOIN estados_propuestas ep ON p.estado_id = ep.id
        WHERE p.carrera_id = ? 
          AND p.requiere_aprobacion_jefe_carrera = TRUE
          AND NOT EXISTS (
              SELECT 1 FROM aprobaciones_jefes_carrera ajc 
              WHERE ajc.propuesta_id = p.id AND ajc.estado_aprobacion != 'pendiente'
          )
        ORDER BY p.created_at DESC
    `;
    
    const [rows] = await pool.execute(query, [carrera_id]);
    return rows;
};

export {
    obtenerCarreras,
    obtenerCarreraPorId,
    obtenerCarreraPorCodigo,
    obtenerCarreraPorJefeRut,
    crearCarrera,
    actualizarCarrera,
    asignarJefeCarrera,
    removerJefeCarrera,
    obtenerEstudiantesCarrera,
    asignarEstudianteCarrera,
    obtenerEstadisticasCarrera,
    obtenerPropuestasPendientesAprobacion
};
