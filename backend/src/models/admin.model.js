import { pool } from '../db/connectionDB.js';

/**
 * Obtiene todas las asignaciones con información completa
 * @returns {Promise<Array>} Array de asignaciones con datos relacionados
 */
export const obtenerTodasLasAsignaciones = async () => {
  const [rows] = await pool.execute(`
    SELECT 
      ap.id as asignacion_id,
      ap.propuesta_id,
      ap.profesor_rut,
      ap.fecha_asignacion,
      p.titulo as titulo_propuesta,
      ep.nombre as estado_propuesta,
      ue.nombre as nombre_estudiante,
      ue.rut as estudiante_rut,
      up.nombre as nombre_profesor,
      up.email as email_profesor
    FROM asignaciones_propuestas ap
    INNER JOIN propuestas p ON ap.propuesta_id = p.id
    INNER JOIN estados_propuestas ep ON p.estado_id = ep.id
    INNER JOIN usuarios ue ON p.estudiante_rut = ue.rut
    INNER JOIN usuarios up ON ap.profesor_rut = up.rut
    ORDER BY ap.fecha_asignacion DESC
  `);
  
  return rows;
};

/**
 * Verifica si existe una propuesta
 * @param {number} propuesta_id - ID de la propuesta
 * @returns {Promise<boolean>} true si existe, false si no existe
 */
export const verificarPropuestaExiste = async (propuesta_id) => {
  const [propuesta] = await pool.execute(
    'SELECT id FROM propuestas WHERE id = ?',
    [propuesta_id]
  );
  
  return propuesta.length > 0;
};

/**
 * Verifica si existe un profesor
 * @param {string} profesor_rut - RUT del profesor
 * @returns {Promise<boolean>} true si existe, false si no existe
 */
export const verificarProfesorExiste = async (profesor_rut) => {
  const [profesor] = await pool.execute(
    'SELECT rut FROM usuarios WHERE rut = ? AND rol_id = (SELECT id FROM roles WHERE nombre = "profesor")',
    [profesor_rut]
  );
  
  return profesor.length > 0;
};

/**
 * Verifica si ya existe una asignación entre propuesta y profesor
 * @param {number} propuesta_id - ID de la propuesta
 * @param {string} profesor_rut - RUT del profesor
 * @returns {Promise<boolean>} true si existe, false si no existe
 */
export const verificarAsignacionExiste = async (propuesta_id, profesor_rut) => {
  const [asignacionExistente] = await pool.execute(
    'SELECT id FROM asignaciones_propuestas WHERE propuesta_id = ? AND profesor_rut = ?',
    [propuesta_id, profesor_rut]
  );
  
  return asignacionExistente.length > 0;
};

/**
 * Obtiene información de una asignación por su ID
 * @param {number} id - ID de la asignación
 * @returns {Promise<Object|null>} Datos de la asignación o null si no existe
 */
export const obtenerAsignacionPorId = async (id) => {
  const [asignacion] = await pool.execute(
    'SELECT propuesta_id, profesor_rut FROM asignaciones_propuestas WHERE id = ?',
    [id]
  );
  
  return asignacion.length > 0 ? asignacion[0] : null;
};

/**
 * Obtiene estadísticas de propuestas
 * @param {number|null} carrera_id - ID de la carrera para filtrar (null para todas)
 * @returns {Promise<Object>} Estadísticas de propuestas
 */
export const obtenerEstadisticasPropuestas = async (carrera_id = null) => {
  let query = `
    SELECT 
      COUNT(*) as total_propuestas,
      SUM(CASE WHEN p.estado_id = (SELECT id FROM estados_propuestas WHERE nombre = 'Pendiente') THEN 1 ELSE 0 END) as propuestas_pendientes,
      SUM(CASE WHEN p.estado_id = (SELECT id FROM estados_propuestas WHERE nombre = 'En Revisión') THEN 1 ELSE 0 END) as propuestas_en_revision,
      SUM(CASE WHEN p.estado_id = (SELECT id FROM estados_propuestas WHERE nombre = 'Aprobada') THEN 1 ELSE 0 END) as propuestas_aprobadas
    FROM propuestas p
  `;
  
  const params = [];
  
  if (carrera_id) {
    query += `
    INNER JOIN estudiantes_carreras ec ON p.estudiante_rut = ec.estudiante_rut AND ec.fecha_fin IS NULL
    WHERE ec.carrera_id = ?
    `;
    params.push(carrera_id);
  }
  
  const [propuestasStats] = await pool.execute(query, params);
  return propuestasStats[0];
};

/**
 * Obtiene estadísticas de usuarios
 * @param {number|null} carrera_id - ID de la carrera para filtrar estudiantes (null para todas)
 * @returns {Promise<Object>} Estadísticas de usuarios
 */
export const obtenerEstadisticasUsuarios = async (carrera_id = null) => {
  let queryEstudiantes = `
    SELECT COUNT(*) as total_estudiantes
    FROM usuarios u
    WHERE u.rol_id = (SELECT id FROM roles WHERE nombre = 'estudiante')
  `;
  
  const paramsEstudiantes = [];
  
  if (carrera_id) {
    queryEstudiantes += `
    AND EXISTS (
      SELECT 1 FROM estudiantes_carreras ec 
      WHERE ec.estudiante_rut = u.rut 
      AND ec.carrera_id = ? 
      AND ec.fecha_fin IS NULL
    )`;
    paramsEstudiantes.push(carrera_id);
  }
  
  // Profesores: filtrar por departamento de la carrera si aplica
  let queryProfesores = `
    SELECT COUNT(*) as total_profesores
    FROM usuarios u
    WHERE u.rol_id = (SELECT id FROM roles WHERE nombre = 'profesor')
  `;
  
  const paramsProfesores = [];
  
  if (carrera_id) {
    queryProfesores += `
    AND EXISTS (
      SELECT 1 FROM profesores_departamentos pd
      INNER JOIN departamentos d ON pd.departamento_id = d.id
      INNER JOIN carreras c ON d.facultad_id = c.facultad_id
      WHERE pd.profesor_rut = u.rut 
      AND pd.fecha_salida IS NULL
      AND c.id = ?
    )`;
    paramsProfesores.push(carrera_id);
  }
  
  const [[estudiantesResult], [profesoresResult]] = await Promise.all([
    pool.execute(queryEstudiantes, paramsEstudiantes),
    pool.execute(queryProfesores, paramsProfesores)
  ]);
  
  const total_estudiantes = estudiantesResult[0].total_estudiantes;
  const total_profesores = profesoresResult[0].total_profesores;
  
  return {
    total_usuarios: total_estudiantes + total_profesores,
    total_estudiantes,
    total_profesores
  };
};

/**
 * Obtiene estadísticas de asignaciones
 * @returns {Promise<Object>} Estadísticas de asignaciones
 */
export const obtenerEstadisticasAsignaciones = async () => {
  const [asignacionesStats] = await pool.execute(`
    SELECT COUNT(*) as total_asignaciones
    FROM asignaciones_propuestas
  `);
  
  return asignacionesStats[0];
};

/**
 * Obtiene todas las estadísticas del sistema
 * @param {number|null} carrera_id - ID de la carrera para filtrar (null para todas)
 * @returns {Promise<Object>} Objeto con todas las estadísticas
 */
export const obtenerEstadisticasCompletas = async (carrera_id = null) => {
  const [propuestas, usuarios, asignaciones] = await Promise.all([
    obtenerEstadisticasPropuestas(carrera_id),
    obtenerEstadisticasUsuarios(carrera_id),
    obtenerEstadisticasAsignaciones()
  ]);
  
  return {
    propuestas,
    usuarios,
    asignaciones
  };
};