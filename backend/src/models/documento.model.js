import { pool } from "../db/connectionDB.js";

export const subirDocumento = async ({
  proyecto_id,
  tipo_documento,
  nombre_archivo,
  nombre_original,
  ruta_archivo,
  tamanio_bytes,
  mime_type,
  subido_por,
  estado = 'borrador',
  comentarios = null
}) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO documentos_proyecto (
        proyecto_id, tipo_documento, nombre_archivo, nombre_original, ruta_archivo,
        tamanio_bytes, mime_type, subido_por, estado, comentarios
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        proyecto_id, tipo_documento, nombre_archivo, nombre_original, ruta_archivo,
        tamanio_bytes, mime_type, subido_por, estado, comentarios
      ]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error en subirDocumento:', error.message);
    throw error;
  }
};

export const obtenerDocumentosProyecto = async (proyecto_id, filtros = {}) => {
  try {
    let query = `
      SELECT d.*, u1.nombre as nombre_subidor, u2.nombre as nombre_revisor
      FROM documentos_proyecto d
      LEFT JOIN usuarios u1 ON d.subido_por = u1.rut
      LEFT JOIN usuarios u2 ON d.revisado_por = u2.rut
      WHERE d.proyecto_id = ?
    `;
    const params = [proyecto_id];

    if (filtros.tipo_documento) {
      query += ` AND d.tipo_documento = ?`;
      params.push(filtros.tipo_documento);
    }

    if (filtros.estado) {
      query += ` AND d.estado = ?`;
      params.push(filtros.estado);
    }

    query += ` ORDER BY d.fecha_subida DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error en obtenerDocumentosProyecto:', error.message);
    throw error;
  }
};

export const obtenerDocumento = async (id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT d.*, u1.nombre as nombre_subidor, u2.nombre as nombre_revisor
       FROM documentos_proyecto d
       LEFT JOIN usuarios u1 ON d.subido_por = u1.rut
       LEFT JOIN usuarios u2 ON d.revisado_por = u2.rut
       WHERE d.id = ?`,
      [id]
    );
    return rows[0];
  } catch (error) {
    console.error('Error en obtenerDocumento:', error.message);
    throw error;
  }
};

export const actualizarEstadoDocumento = async (id, { estado, revisado_por, comentarios }) => {
  try {
    const [result] = await pool.execute(
      `UPDATE documentos_proyecto 
       SET estado = ?, revisado_por = ?, comentarios = ?, fecha_revision = NOW()
       WHERE id = ?`,
      [estado, revisado_por, comentarios, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en actualizarEstadoDocumento:', error.message);
    throw error;
  }
};

export const eliminarDocumento = async (id) => {
  try {
    const [result] = await pool.execute(
      `DELETE FROM documentos_proyecto WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en eliminarDocumento:', error.message);
    throw error;
  }
};

export const obtenerVersionesDocumento = async (proyecto_id, tipo_documento) => {
  try {
    const [rows] = await pool.execute(
      `SELECT d.*, u.nombre as nombre_subidor
       FROM documentos_proyecto d
       LEFT JOIN usuarios u ON d.subido_por = u.rut
       WHERE d.proyecto_id = ? AND d.tipo_documento = ?
       ORDER BY d.version DESC, d.fecha_subida DESC`,
      [proyecto_id, tipo_documento]
    );
    return rows;
  } catch (error) {
    console.error('Error en obtenerVersionesDocumento:', error.message);
    throw error;
  }
};

export const obtenerUltimaVersion = async (proyecto_id, tipo_documento) => {
  try {
    const [rows] = await pool.execute(
      `SELECT MAX(version) as ultima_version
       FROM documentos_proyecto
       WHERE proyecto_id = ? AND tipo_documento = ?`,
      [proyecto_id, tipo_documento]
    );
    return rows[0]?.ultima_version || 0;
  } catch (error) {
    console.error('Error en obtenerUltimaVersion:', error.message);
    throw error;
  }
};
