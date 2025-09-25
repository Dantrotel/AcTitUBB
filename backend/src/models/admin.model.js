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
 * @returns {Promise<Object>} Estadísticas de propuestas
 */
export const obtenerEstadisticasPropuestas = async () => {
  const [propuestasStats] = await pool.execute(`
    SELECT 
      COUNT(*) as total_propuestas,
      SUM(CASE WHEN estado_id = (SELECT id FROM estados_propuestas WHERE nombre = 'Pendiente') THEN 1 ELSE 0 END) as propuestas_pendientes,
      SUM(CASE WHEN estado_id = (SELECT id FROM estados_propuestas WHERE nombre = 'En Revisión') THEN 1 ELSE 0 END) as propuestas_en_revision,
      SUM(CASE WHEN estado_id = (SELECT id FROM estados_propuestas WHERE nombre = 'Aprobada') THEN 1 ELSE 0 END) as propuestas_aprobadas
    FROM propuestas
  `);
  
  return propuestasStats[0];
};

/**
 * Obtiene estadísticas de usuarios
 * @returns {Promise<Object>} Estadísticas de usuarios
 */
export const obtenerEstadisticasUsuarios = async () => {
  const [usuariosStats] = await pool.execute(`
    SELECT 
      COUNT(*) as total_usuarios,
      SUM(CASE WHEN rol_id = (SELECT id FROM roles WHERE nombre = 'estudiante') THEN 1 ELSE 0 END) as total_estudiantes,
      SUM(CASE WHEN rol_id = (SELECT id FROM roles WHERE nombre = 'profesor') THEN 1 ELSE 0 END) as total_profesores
    FROM usuarios
  `);
  
  return usuariosStats[0];
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
 * @returns {Promise<Object>} Objeto con todas las estadísticas
 */
export const obtenerEstadisticasCompletas = async () => {
  const [propuestas, usuarios, asignaciones] = await Promise.all([
    obtenerEstadisticasPropuestas(),
    obtenerEstadisticasUsuarios(),
    obtenerEstadisticasAsignaciones()
  ]);
  
  return {
    propuestas,
    usuarios,
    asignaciones
  };
};