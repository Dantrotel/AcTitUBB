import { pool } from '../db/connectionDB.js';

/**
 * Obtener todos los estudiantes de una propuesta
 * @param {number} propuesta_id - ID de la propuesta
 * @returns {Promise<Array>} - Array de estudiantes con sus datos
 */
export const obtenerEstudiantesPropuesta = async (propuesta_id) => {
  const [rows] = await pool.execute(
    `SELECT 
      ep.estudiante_rut,
      ep.es_creador,
      ep.orden,
      u.nombre,
      u.email
    FROM estudiantes_propuestas ep
    INNER JOIN usuarios u ON ep.estudiante_rut = u.rut
    WHERE ep.propuesta_id = ?
    ORDER BY ep.orden ASC`,
    [propuesta_id]
  );
  return rows;
};

/**
 * Obtener todos los estudiantes de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - Array de estudiantes con sus datos
 */
export const obtenerEstudiantesProyecto = async (proyecto_id) => {
  const [rows] = await pool.execute(
    `SELECT 
      ep.estudiante_rut,
      ep.es_creador,
      ep.orden,
      u.nombre,
      u.email
    FROM estudiantes_proyectos ep
    INNER JOIN usuarios u ON ep.estudiante_rut = u.rut
    WHERE ep.proyecto_id = ?
    ORDER BY ep.orden ASC`,
    [proyecto_id]
  );
  return rows;
};

/**
 * Verificar si un estudiante pertenece a una propuesta
 * @param {number} propuesta_id - ID de la propuesta
 * @param {string} estudiante_rut - RUT del estudiante
 * @returns {Promise<boolean>} - true si pertenece
 */
export const estudiantePerteneceAPropuesta = async (propuesta_id, estudiante_rut) => {
  const [rows] = await pool.execute(
    `SELECT id FROM estudiantes_propuestas WHERE propuesta_id = ? AND estudiante_rut = ?`,
    [propuesta_id, estudiante_rut]
  );
  return rows.length > 0;
};

/**
 * Verificar si un estudiante pertenece a un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} estudiante_rut - RUT del estudiante
 * @returns {Promise<boolean>} - true si pertenece
 */
export const estudiantePerteneceAProyecto = async (proyecto_id, estudiante_rut) => {
  const [rows] = await pool.execute(
    `SELECT id FROM estudiantes_proyectos WHERE proyecto_id = ? AND estudiante_rut = ?`,
    [proyecto_id, estudiante_rut]
  );
  return rows.length > 0;
};

/**
 * Obtener todas las propuestas de un estudiante
 * @param {string} estudiante_rut - RUT del estudiante
 * @returns {Promise<Array>} - Array de IDs de propuestas
 */
export const obtenerPropuestasDeEstudiante = async (estudiante_rut) => {
  const [rows] = await pool.execute(
    `SELECT propuesta_id FROM estudiantes_propuestas WHERE estudiante_rut = ?`,
    [estudiante_rut]
  );
  return rows.map(row => row.propuesta_id);
};

/**
 * Obtener todos los proyectos de un estudiante
 * @param {string} estudiante_rut - RUT del estudiante
 * @returns {Promise<Array>} - Array de IDs de proyectos
 */
export const obtenerProyectosDeEstudiante = async (estudiante_rut) => {
  const [rows] = await pool.execute(
    `SELECT proyecto_id FROM estudiantes_proyectos WHERE estudiante_rut = ?`,
    [estudiante_rut]
  );
  return rows.map(row => row.proyecto_id);
};
