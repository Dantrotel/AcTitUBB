import { pool } from '../db/connectionDB.js';

// Guardar un archivo de propuesta
export const guardarArchivoPropuesta = async (propuesta_id, tipo_archivo, archivo, nombre_archivo_original, subido_por, comentario = null) => {
  try {
    // Obtener la siguiente versión
    const [versiones] = await pool.execute(
      'SELECT COALESCE(MAX(version), 0) as ultima_version FROM archivos_propuesta WHERE propuesta_id = ?',
      [propuesta_id]
    );
    
    const nueva_version = versiones[0].ultima_version + 1;
    
    const [result] = await pool.execute(
      `INSERT INTO archivos_propuesta 
       (propuesta_id, tipo_archivo, archivo, nombre_archivo_original, subido_por, version, comentario)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [propuesta_id, tipo_archivo, archivo, nombre_archivo_original, subido_por, nueva_version, comentario]
    );
    
    return {
      id: result.insertId,
      version: nueva_version
    };
  } catch (error) {
    
    throw error;
  }
};

// Obtener todos los archivos de una propuesta
export const obtenerArchivosPropuesta = async (propuesta_id) => {
  try {
    const [archivos] = await pool.execute(
      `SELECT ap.*, u.nombre as nombre_usuario
       FROM archivos_propuesta ap
       LEFT JOIN usuarios u ON ap.subido_por = u.rut
       WHERE ap.propuesta_id = ?
       ORDER BY ap.version ASC, ap.created_at ASC`,
      [propuesta_id]
    );
    
    return archivos;
  } catch (error) {
    
    throw error;
  }
};

// Obtener el último archivo de un tipo específico
export const obtenerUltimoArchivoPorTipo = async (propuesta_id, tipo_archivo) => {
  try {
    const [archivos] = await pool.execute(
      `SELECT ap.*, u.nombre as nombre_usuario
       FROM archivos_propuesta ap
       LEFT JOIN usuarios u ON ap.subido_por = u.rut
       WHERE ap.propuesta_id = ? AND ap.tipo_archivo = ?
       ORDER BY ap.version DESC
       LIMIT 1`,
      [propuesta_id, tipo_archivo]
    );
    
    return archivos[0] || null;
  } catch (error) {
    
    throw error;
  }
};

// Obtener archivo específico por ID
export const obtenerArchivoPorId = async (archivo_id) => {
  try {
    const [archivos] = await pool.execute(
      `SELECT ap.*, u.nombre as nombre_usuario
       FROM archivos_propuesta ap
       LEFT JOIN usuarios u ON ap.subido_por = u.rut
       WHERE ap.id = ?`,
      [archivo_id]
    );
    
    return archivos[0] || null;
  } catch (error) {
    
    throw error;
  }
};

// Obtener historial completo con archivos
export const obtenerHistorialConArchivos = async (propuesta_id) => {
  try {
    const [historial] = await pool.execute(
      `SELECT 
        hrp.id,
        hrp.fecha_accion,
        hrp.accion,
        hrp.decision,
        hrp.comentarios,
        hrp.realizado_por,
        u.nombre as nombre_usuario,
        hrp.archivo_revision,
        hrp.nombre_archivo_original,
        ap.id as archivo_id,
        ap.tipo_archivo,
        ap.version as archivo_version
       FROM historial_revisiones_propuestas hrp
       LEFT JOIN usuarios u ON hrp.profesor_rut = u.rut
       LEFT JOIN archivos_propuesta ap ON hrp.propuesta_id = ap.propuesta_id 
         AND hrp.fecha_accion = ap.created_at
       WHERE hrp.propuesta_id = ?
       ORDER BY hrp.fecha_accion DESC`,
      [propuesta_id]
    );
    
    return historial;
  } catch (error) {
    
    throw error;
  }
};
