import { pool } from "../db/connectionDB.js";

export const crearPropuesta = async ({ titulo, descripcion, estudiante_rut, fecha_envio, archivo, nombre_archivo_original }) => {
  try {
    // Verificar si la columna nombre_archivo_original existe
    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = 'actitubb' AND TABLE_NAME = 'propuestas' 
       AND COLUMN_NAME = 'nombre_archivo_original'`
    );
    
    if (columns.length > 0) {
      // La columna existe, incluirla en la query
      const [result] = await pool.execute(
        `INSERT INTO propuestas (titulo, descripcion, estudiante_rut, fecha_envio, archivo, nombre_archivo_original)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [titulo, descripcion, estudiante_rut, fecha_envio, archivo, nombre_archivo_original]
      );
      return result.insertId;
    } else {
      // La columna no existe, usar query sin ella
      console.warn('⚠️  Columna nombre_archivo_original no existe aún. Ejecutar migración.');
      const [result] = await pool.execute(
        `INSERT INTO propuestas (titulo, descripcion, estudiante_rut, fecha_envio, archivo)
         VALUES (?, ?, ?, ?, ?)`,
        [titulo, descripcion, estudiante_rut, fecha_envio, archivo]
      );
      return result.insertId;
    }
  } catch (error) {
    console.error('Error en crearPropuesta:', error.message);
    // Fallback: intentar sin la columna nombre_archivo_original
    const [result] = await pool.execute(
      `INSERT INTO propuestas (titulo, descripcion, estudiante_rut, fecha_envio, archivo)
       VALUES (?, ?, ?, ?, ?)`,
      [titulo, descripcion, estudiante_rut, fecha_envio, archivo]
    );
    return result.insertId;
  }
};

export const actualizarPropuesta = async (id, { titulo, descripcion, fecha_envio, archivo, nombre_archivo_original }) => {
  let query = `UPDATE propuestas SET titulo = ?, descripcion = ?, fecha_envio = ?`;
  let params = [titulo, descripcion, fecha_envio];
  
  // Solo actualizar el archivo si se proporciona uno nuevo
  if (archivo !== undefined) {
    query += `, archivo = ?`;
    params.push(archivo);
    
    // También actualizar el nombre original si se proporciona y la columna existe
    if (nombre_archivo_original !== undefined) {
      try {
        // Verificar si la columna existe
        const [columns] = await pool.execute(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = 'actitubb' AND TABLE_NAME = 'propuestas' 
           AND COLUMN_NAME = 'nombre_archivo_original'`
        );
        
        if (columns.length > 0) {
          query += `, nombre_archivo_original = ?`;
          params.push(nombre_archivo_original);
        } else {
          console.warn('⚠️  Columna nombre_archivo_original no existe aún. Ejecutar migración.');
        }
      } catch (error) {
        console.warn('⚠️  Error verificando columna nombre_archivo_original:', error.message);
      }
    }
  }
  
  query += ` WHERE id = ?`;
  params.push(id);
  
  const [result] = await pool.execute(query, params);
  return result.affectedRows > 0;
};

// Nuevo método: obtener propuestas de un estudiante específico
export const getPropuestasByEstudiante = async (estudiante_rut) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.*,
        ep.nombre as estado_nombre,
        u.nombre as estudiante_nombre,
        u.nombre as nombre_estudiante,
        ap.profesor_rut,
        prof.nombre as profesor_nombre,
        prof.nombre as nombre_profesor,
        prof.email as profesor_email
      FROM propuestas p
      LEFT JOIN estados_propuestas ep ON p.estado_id = ep.id
      LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
      LEFT JOIN asignaciones_propuestas ap ON p.id = ap.propuesta_id
      LEFT JOIN usuarios prof ON ap.profesor_rut = prof.rut
      WHERE p.estudiante_rut = ?
      ORDER BY p.fecha_envio DESC
    `, [estudiante_rut]);
    
    return rows;
  } catch (error) {
    console.error('Error en getPropuestasByEstudiante model:', error);
    throw error;
  }
};

export const asignarProfesor = async (propuesta_id, profesor_rut) => {
  const [result] = await pool.execute(
    `INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut) VALUES (?, ?)`,
    [propuesta_id, profesor_rut]
  );
  return result.affectedRows > 0;
};

export const revisarPropuesta = async (id, { comentarios_profesor, estado }) => {
  // Mapear el nombre del estado al ID correspondiente
  const estadoMap = {
    'pendiente': 1,
    'en_revision': 2,
    'correcciones': 3,
    'aprobada': 4,
    'rechazada': 5
  };
  
  const estado_id = estadoMap[estado];
  if (!estado_id) {
    throw new Error(`Estado inválido: ${estado}`);
  }
  
  const [result] = await pool.execute(
    `UPDATE propuestas SET comentarios_profesor = ?, estado_id = ?, fecha_revision = NOW() WHERE id = ?`,
    [comentarios_profesor, estado_id, id]
  );
  return result.affectedRows > 0;
};

export const aprobarPropuesta = async (id, proyecto_id) => {
  const [result] = await pool.execute(
    `UPDATE propuestas SET estado_id = 4, fecha_aprobacion = NOW(), proyecto_id = ? WHERE id = ?`,
    [proyecto_id, id]
  );
  return result.affectedRows > 0;
};

export const obtenerPropuestas = async () => {
  const [rows] = await pool.execute(`
    SELECT p.*, 
           ep.nombre AS estado,
           u.nombre AS nombre_estudiante,
           GROUP_CONCAT(DISTINCT up.nombre) AS profesores_asignados,
           (SELECT up2.nombre FROM asignaciones_propuestas ap2 
            INNER JOIN usuarios up2 ON ap2.profesor_rut = up2.rut 
            WHERE ap2.propuesta_id = p.id LIMIT 1) AS nombre_profesor,
           (SELECT up2.rut FROM asignaciones_propuestas ap2 
            INNER JOIN usuarios up2 ON ap2.profesor_rut = up2.rut 
            WHERE ap2.propuesta_id = p.id LIMIT 1) AS profesor_rut
    FROM propuestas p
    LEFT JOIN estados_propuestas ep ON p.estado_id = ep.id
    LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
    LEFT JOIN asignaciones_propuestas ap ON p.id = ap.propuesta_id
    LEFT JOIN usuarios up ON ap.profesor_rut = up.rut
    GROUP BY p.id
    ORDER BY p.fecha_envio DESC
  `);
  return rows;
};

export const obtenerPropuestaPorId = async (id) => {
  const [rows] = await pool.execute(`
    SELECT 
      p.*, 
      ep.nombre AS estado,
      ue.nombre AS nombre_estudiante,
      GROUP_CONCAT(DISTINCT up.nombre) AS profesores_asignados,
      GROUP_CONCAT(DISTINCT up.rut) AS profesores_ruts,
      (SELECT up2.rut FROM asignaciones_propuestas ap2 
       INNER JOIN usuarios up2 ON ap2.profesor_rut = up2.rut 
       WHERE ap2.propuesta_id = p.id LIMIT 1) AS profesor_rut
    FROM propuestas p
    LEFT JOIN estados_propuestas ep ON p.estado_id = ep.id
    LEFT JOIN usuarios ue ON p.estudiante_rut = ue.rut
    LEFT JOIN asignaciones_propuestas ap ON p.id = ap.propuesta_id
    LEFT JOIN usuarios up ON ap.profesor_rut = up.rut
    WHERE p.id = ?
    GROUP BY p.id
  `, [id]);

  return rows[0];
};

export const obtenerPropuestasPorEstudiante = async (estudiante_rut) => {
  const [rows] = await pool.execute(`
    SELECT p.*, 
           ep.nombre AS estado,
           GROUP_CONCAT(DISTINCT up.nombre) AS profesores_asignados
    FROM propuestas p
    LEFT JOIN estados_propuestas ep ON p.estado_id = ep.id
    LEFT JOIN asignaciones_propuestas ap ON p.id = ap.propuesta_id
    LEFT JOIN usuarios up ON ap.profesor_rut = up.rut
    WHERE p.estudiante_rut = ?
    GROUP BY p.id
    ORDER BY p.fecha_envio DESC
  `, [estudiante_rut]);
  return rows;
};

export const obtenerPropuestasPorProfesor = async (profesor_rut) => {
  const [rows] = await pool.execute(`
    SELECT p.*, 
           ep.nombre AS estado,
           u.nombre AS nombre_estudiante
    FROM propuestas p
    INNER JOIN asignaciones_propuestas ap ON p.id = ap.propuesta_id
    LEFT JOIN estados_propuestas ep ON p.estado_id = ep.id
    LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
    WHERE ap.profesor_rut = ?
    ORDER BY p.fecha_envio DESC
  `, [profesor_rut]);
  return rows;
};

export const eliminarPropuesta = async (id) => {
  const [result] = await pool.execute(`DELETE FROM propuestas WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

export const obtenerProfesoresAsignados = async (propuesta_id) => {
  const [rows] = await pool.execute(`
    SELECT u.rut, u.nombre, u.email, ap.fecha_asignacion
    FROM asignaciones_propuestas ap
    INNER JOIN usuarios u ON ap.profesor_rut = u.rut
    WHERE ap.propuesta_id = ?
  `, [propuesta_id]);
  return rows;
};

export const desasignarProfesor = async (propuesta_id, profesor_rut) => {
  const [result] = await pool.execute(
    `DELETE FROM asignaciones_propuestas WHERE propuesta_id = ? AND profesor_rut = ?`,
    [propuesta_id, profesor_rut]
  );
  return result.affectedRows > 0;
};