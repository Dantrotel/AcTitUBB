import { pool } from '../db/connectionDB.js';

// ===== GESTIÓN SIMPLIFICADA DE ASIGNACIONES DE PROFESORES A PROYECTOS =====
// Basado en el patrón exitoso del sistema de propuestas

/**
 * Asignar un profesor a un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} profesor_rut - RUT del profesor
 * @returns {Promise<boolean>} - true si se asignó correctamente
 */
export const asignarProfesor = async (proyecto_id, profesor_rut) => {
  const [result] = await pool.execute(
    `INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, activo) VALUES (?, ?, 1, TRUE)`,
    [proyecto_id, profesor_rut]
  );
  return result.affectedRows > 0;
};

/**
 * Asignar un profesor a un proyecto con rol específico
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} profesor_rut - RUT del profesor
 * @param {number} rol_profesor_id - ID del rol del profesor
 * @returns {Promise<boolean>} - true si se asignó correctamente
 */
export const asignarProfesorConRol = async (proyecto_id, profesor_rut, rol_profesor_id) => {
  // Verificar que el profesor sea válido (profesor o admin)
  const [profesorExists] = await pool.execute(
    `SELECT rut FROM usuarios WHERE rut = ? AND rol_id IN (2, 3)`,
    [profesor_rut]
  );
  
  if (profesorExists.length === 0) {
    throw new Error('El usuario no es un profesor o administrador válido');
  }

  // Verificar que no exista ya una asignación del mismo rol
  const [asignacionExists] = await pool.execute(
    `SELECT id FROM asignaciones_proyectos WHERE proyecto_id = ? AND rol_profesor_id = ? AND activo = TRUE`,
    [proyecto_id, rol_profesor_id]
  );
  
  if (asignacionExists.length > 0) {
    throw new Error('Ya existe un profesor con este rol asignado a este proyecto');
  }

  const [result] = await pool.execute(
    `INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, activo) VALUES (?, ?, ?, TRUE)`,
    [proyecto_id, profesor_rut, rol_profesor_id]
  );
  return result.affectedRows > 0;
};

/**
 * Asignar un profesor a un proyecto usando parámetros de objeto
 * @param {Object} params - Parámetros de asignación
 * @param {number} params.proyecto_id - ID del proyecto
 * @param {string} params.profesor_rut - RUT del profesor
 * @param {number} params.rol_profesor_id - ID del rol del profesor
 * @param {string} params.asignado_por - Usuario que realiza la asignación
 * @param {string} params.observaciones - Observaciones opcionales
 * @returns {Promise<number>} - ID de la asignación creada
 */
export const asignarProfesorAProyecto = async ({ proyecto_id, profesor_rut, rol_profesor_id, asignado_por, observaciones = null }) => {
  // Verificar que el profesor sea válido (profesor o admin)
  const [profesorExists] = await pool.execute(
    `SELECT rut FROM usuarios WHERE rut = ? AND rol_id IN (2, 3)`,
    [profesor_rut]
  );
  
  if (profesorExists.length === 0) {
    throw new Error('El usuario no es un profesor o administrador válido');
  }

  // Verificar que no exista ya una asignación activa del mismo rol
  const [asignacionExists] = await pool.execute(
    `SELECT id FROM asignaciones_proyectos WHERE proyecto_id = ? AND rol_profesor_id = ? AND activo = TRUE`,
    [proyecto_id, rol_profesor_id]
  );
  
  if (asignacionExists.length > 0) {
    throw new Error('Ya existe un profesor con este rol asignado a este proyecto');
  }

  const [result] = await pool.execute(
    `INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, activo, asignado_por, observaciones) 
     VALUES (?, ?, ?, TRUE, ?, ?)`,
    [proyecto_id, profesor_rut, rol_profesor_id, asignado_por ?? 'system', observaciones]
  );
  
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
            rp.nombre as nombre_rol,
            rp.nombre as codigo_rol
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.proyecto_id = ? AND ap.activo = TRUE
        ORDER BY 
            CASE rp.nombre
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
export const obtenerProyectosProfesor = async (profesor_rut, rol_profesor_id = null) => {
    let query = `
        SELECT 
            p.*,
            ap.rol_profesor_id,
            ap.fecha_asignacion,
            rp.nombre as nombre_rol,
            rp.nombre as codigo_rol,
            u.nombre as nombre_estudiante,
            u.email as email_estudiante
        FROM asignaciones_proyectos ap
        INNER JOIN proyectos p ON ap.proyecto_id = p.id
        INNER JOIN usuarios u ON p.estudiante_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.profesor_rut = ? AND ap.activo = TRUE
    `;
    
    const params = [profesor_rut];
    
    if (rol_profesor_id) {
        query += ' AND ap.rol_profesor_id = ?';
        params.push(rol_profesor_id);
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
export const cambiarProfesorProyecto = async (proyecto_id, rol_profesor_id, nuevo_profesor_rut, asignado_por) => {
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
        UPDATE asignaciones_proyectos 
        SET activo = FALSE, fecha_desasignacion = NOW()
        WHERE proyecto_id = ? AND rol_profesor_id = ? AND activo = TRUE
    `;
    
    await pool.execute(desactivarQuery, [proyecto_id, rol_profesor_id]);
    
    // Crear nueva asignación
    return await asignarProfesorAProyecto({
        proyecto_id,
        profesor_rut: nuevo_profesor_rut,
        rol_profesor_id,
        asignado_por
    });
};

/**
 * Remover un profesor de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {number} rol_profesor_id - ID del rol del profesor a remover
 * @returns {Promise<boolean>} - true si se removió correctamente
 */
export const removerProfesorProyecto = async (proyecto_id, rol_profesor_id) => {
    const query = `
        UPDATE asignaciones_proyectos 
        SET activo = FALSE, fecha_desasignacion = NOW()
        WHERE proyecto_id = ? AND rol_profesor_id = ? AND activo = TRUE
    `;
    
    const [result] = await pool.execute(query, [proyecto_id, rol_profesor_id]);
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
            rp.nombre as nombre_rol,
            rp.nombre as codigo_rol
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN proyectos p ON ap.proyecto_id = p.id
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
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
export const verificarRolProfesorProyecto = async (proyecto_id, profesor_rut, rol_profesor_id) => {
    const query = `
        SELECT id FROM asignaciones_proyectos
        WHERE proyecto_id = ? AND profesor_rut = ? AND rol_profesor_id = ? AND activo = TRUE
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id, profesor_rut, rol_profesor_id]);
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
            ap.rol_profesor_id,
            rp.nombre as nombre_rol,
            rp.nombre as codigo_rol,
            COUNT(*) as total_proyectos,
            COUNT(CASE WHEN ep.nombre = 'en_desarrollo' THEN 1 END) as proyectos_activos,
            COUNT(CASE WHEN ep.nombre = 'completado' THEN 1 END) as proyectos_finalizados
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        INNER JOIN proyectos p ON ap.proyecto_id = p.id
        INNER JOIN estados_proyectos ep ON p.estado_id = ep.id
        WHERE ap.activo = TRUE
    `;
    
    const params = [];
    
    if (profesor_rut) {
        query += ' AND ap.profesor_rut = ?';
        params.push(profesor_rut);
    }
    
    query += `
        GROUP BY ap.profesor_rut, ap.rol_profesor_id, u.nombre, rp.nombre, rp.nombre
        ORDER BY u.nombre, rp.nombre
    `;
    
    const [rows] = await pool.execute(query, params);
    return rows;
};

/**
 * Obtener profesores disponibles para asignar a un proyecto
 * @param {string} rol_profesor - Rol específico a buscar
 * @returns {Promise<Array>} - Lista de profesores disponibles
 */
export const obtenerProfesoresDisponibles = async (rol_profesor_id) => {
    const query = `
        SELECT 
            u.rut,
            u.nombre,
            u.email,
            COUNT(ap.id) as proyectos_actuales
        FROM usuarios u
        LEFT JOIN asignaciones_proyectos ap ON u.rut = ap.profesor_rut 
            AND ap.activo = TRUE 
            AND ap.rol_profesor_id = ?
        WHERE u.rol_id IN (2, 3)
        GROUP BY u.rut, u.nombre, u.email
        ORDER BY proyectos_actuales ASC, u.nombre ASC
    `;
    
    const [rows] = await pool.execute(query, [rol_profesor_id]);
    return rows;
};

/**
 * Obtener todas las asignaciones de profesores (admin)
 * @returns {Promise<Array>} - Lista completa de asignaciones
 */
export const obtenerTodasLasAsignacionesAdmin = async () => {
    const query = `
        SELECT 
            ap.id,
            ap.proyecto_id,
            ap.profesor_rut,
            ap.rol_profesor_id,
            ap.fecha_asignacion,
            ap.activo,
            u.nombre as profesor_nombre,
            u.email as profesor_email,
            p.titulo as proyecto_titulo,
            p.descripcion as proyecto_descripcion,
            ue.nombre as estudiante_nombre,
            ue.rut as estudiante_rut,
            rp.nombre as nombre_rol,
            rp.nombre as codigo_rol
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN proyectos p ON ap.proyecto_id = p.id
        INNER JOIN usuarios ue ON p.estudiante_rut = ue.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.activo = TRUE
        ORDER BY ap.fecha_asignacion DESC, ap.proyecto_id, rp.nombre
    `;
    
    const [rows] = await pool.execute(query);
    return rows;
};

/**
 * Obtener estadísticas generales de asignaciones (admin)
 * @returns {Promise<Object>} - Estadísticas completas
 */
export const obtenerEstadisticasGenerales = async () => {
    // Total de proyectos con asignaciones
    const queryProyectos = `
        SELECT COUNT(DISTINCT proyecto_id) as total_proyectos_asignados
        FROM asignaciones_proyectos 
        WHERE activo = TRUE
    `;
    
    // Total de profesores activos
    const queryProfesores = `
        SELECT COUNT(DISTINCT profesor_rut) as total_profesores_activos
        FROM asignaciones_proyectos 
        WHERE activo = TRUE
    `;
    
    // Total de asignaciones activas
    const queryAsignaciones = `
        SELECT COUNT(*) as total_asignaciones_activas
        FROM asignaciones_proyectos 
        WHERE activo = TRUE
    `;
    
    // Distribución por roles
    const queryRoles = `
        SELECT 
            rp.nombre as rol_profesor,
            COUNT(*) as asignaciones_por_rol
        FROM asignaciones_proyectos ap
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.activo = TRUE
        GROUP BY rp.nombre, rp.id
        ORDER BY asignaciones_por_rol DESC
    `;
    
    // Profesores más activos
    const queryProfesoresActivos = `
        SELECT 
            ap.profesor_rut,
            u.nombre as profesor_nombre,
            COUNT(*) as total_asignaciones
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        WHERE ap.activo = TRUE
        GROUP BY ap.profesor_rut, u.nombre
        ORDER BY total_asignaciones DESC
        LIMIT 5
    `;
    
    const [proyectos] = await pool.execute(queryProyectos);
    const [profesores] = await pool.execute(queryProfesores);
    const [asignaciones] = await pool.execute(queryAsignaciones);
    const [roles] = await pool.execute(queryRoles);
    const [profesoresActivos] = await pool.execute(queryProfesoresActivos);
    
    return {
        totales: {
            total_proyectos_asignados: proyectos[0]?.total_proyectos_asignados || 0,
            total_profesores_activos: profesores[0]?.total_profesores_activos || 0,
            total_asignaciones_activas: asignaciones[0]?.total_asignaciones_activas || 0
        },
        por_roles: roles.map(rol => ({
            rol_nombre: rol.rol_profesor,
            asignaciones_por_rol: rol.asignaciones_por_rol
        })),
        profesores_mas_activos: profesoresActivos
    };
};

// ===== FUNCIÓN CONSOLIDADA PARA OBTENER TODAS LAS ASIGNACIONES =====

/**
 * Obtener todas las asignaciones con información completa
 * @returns {Promise<Array>} - Lista de todas las asignaciones
 */
export const obtenerTodasLasAsignaciones = async () => {
    const query = `
        SELECT 
            ap.*,
            u.nombre as nombre_profesor,
            u.email as email_profesor,
            p.titulo as titulo_proyecto,
            p.estudiante_rut,
            ue.nombre as nombre_estudiante,
            rp.nombre as nombre_rol,
            rp.nombre as codigo_rol,
            ep.nombre as estado_proyecto
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN proyectos p ON ap.proyecto_id = p.id
        INNER JOIN usuarios ue ON p.estudiante_rut = ue.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        INNER JOIN estados_proyectos ep ON p.estado_id = ep.id
        WHERE ap.activo = TRUE
        ORDER BY p.titulo, rp.nombre
    `;
    
    const [rows] = await pool.execute(query);
    return rows;
};

// ===== FUNCIONES SIMPLIFICADAS BASADAS EN EL PATRÓN DE PROPUESTAS =====

/**
 * Obtener profesores asignados a un proyecto (versión simplificada)
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - Lista de profesores asignados
 */
export const obtenerProfesoresAsignados = async (proyecto_id) => {
  const [rows] = await pool.execute(`
    SELECT 
      u.rut, u.nombre, u.email, 
      ap.fecha_asignacion,
      rp.nombre as rol_nombre,
      rp.id as rol_id
    FROM asignaciones_proyectos ap
    INNER JOIN usuarios u ON ap.profesor_rut = u.rut
    LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
    WHERE ap.proyecto_id = ? AND ap.activo = TRUE
    ORDER BY rp.nombre
  `, [proyecto_id]);
  return rows;
};

/**
 * Desasignar un profesor de un proyecto (versión simplificada)
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} profesor_rut - RUT del profesor
 * @returns {Promise<boolean>} - true si se desasignó correctamente
 */
export const desasignarProfesor = async (proyecto_id, profesor_rut) => {
  // Primero verificamos si existe una asignación activa
  const [rows] = await pool.execute(
    `SELECT id, rol_profesor_id FROM asignaciones_proyectos WHERE proyecto_id = ? AND profesor_rut = ? AND activo = TRUE`,
    [proyecto_id, profesor_rut]
  );
  
  // Si no hay asignación activa, retornamos false
  if (rows.length === 0) {
    console.log(`⚠️ No hay asignación activa para proyecto ${proyecto_id} y profesor ${profesor_rut}`);
    return false;
  }
  
  const rolProfesorId = rows[0].rol_profesor_id;
  
  // WORKAROUND: Eliminar asignaciones inactivas antiguas del mismo proyecto y rol
  // para evitar conflicto con la restricción unique_asignacion_activa
  try {
    await pool.execute(
      `DELETE FROM asignaciones_proyectos 
       WHERE proyecto_id = ? AND rol_profesor_id = ? AND activo = FALSE`,
      [proyecto_id, rolProfesorId]
    );
    console.log(`🗑️ Limpiadas asignaciones inactivas antiguas del proyecto ${proyecto_id} con rol ${rolProfesorId}`);
  } catch (cleanupError) {
    console.warn('⚠️ Error al limpiar asignaciones antiguas:', cleanupError.message);
  }
  
  // Ahora desactivamos la asignación actual
  const [result] = await pool.execute(
    `UPDATE asignaciones_proyectos 
     SET activo = FALSE, fecha_desasignacion = NOW() 
     WHERE proyecto_id = ? AND profesor_rut = ? AND activo = TRUE`,
    [proyecto_id, profesor_rut]
  );
  
  return result.affectedRows > 0;
};

/**
 * Obtener proyectos asignados a un profesor (versión simplificada)
 * @param {string} profesor_rut - RUT del profesor
 * @returns {Promise<Array>} - Lista de proyectos
 */
export const obtenerProyectosAsignadosProfesor = async (profesor_rut) => {
  const [rows] = await pool.execute(`
    SELECT 
      p.*, 
      u.nombre as nombre_estudiante,
      ep.nombre as estado_nombre,
      rp.nombre as rol_nombre
    FROM asignaciones_proyectos ap
    INNER JOIN proyectos p ON ap.proyecto_id = p.id
    INNER JOIN usuarios u ON p.estudiante_rut = u.rut
    LEFT JOIN estados_proyectos ep ON p.estado_id = ep.id
    LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
    WHERE ap.profesor_rut = ? AND ap.activo = TRUE
    ORDER BY p.fecha_inicio DESC
  `, [profesor_rut]);
  return rows;
};
