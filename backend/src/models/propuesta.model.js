import { pool } from "../db/connectionDB.js";

export const crearPropuesta = async ({ 
  titulo, 
  descripcion, 
  estudiante_rut, 
  fecha_envio, 
  archivo, 
  nombre_archivo_original,
  modalidad,
  numero_estudiantes,
  complejidad_estimada,
  justificacion_complejidad,
  duracion_estimada_semestres,
  area_tematica,
  objetivos_generales,
  objetivos_especificos,
  metodologia_propuesta,
  recursos_necesarios,
  bibliografia
}) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO propuestas (
        titulo, descripcion, estudiante_rut, fecha_envio, archivo, nombre_archivo_original,
        modalidad, numero_estudiantes, complejidad_estimada, justificacion_complejidad,
        duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos,
        metodologia_propuesta, recursos_necesarios, bibliografia
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo, descripcion, estudiante_rut, fecha_envio, archivo, nombre_archivo_original,
        modalidad, numero_estudiantes, complejidad_estimada, justificacion_complejidad,
        duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos,
        metodologia_propuesta, recursos_necesarios, bibliografia
      ]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error en crearPropuesta:', error.message);
    throw error;
  }
};

export const actualizarPropuesta = async (id, { 
  titulo, 
  descripcion, 
  fecha_envio, 
  archivo, 
  nombre_archivo_original,
  modalidad,
  numero_estudiantes,
  complejidad_estimada,
  justificacion_complejidad,
  duracion_estimada_semestres,
  area_tematica,
  objetivos_generales,
  objetivos_especificos,
  metodologia_propuesta,
  recursos_necesarios,
  bibliografia
}) => {
  let query = `UPDATE propuestas SET 
    titulo = ?, descripcion = ?, fecha_envio = ?,
    modalidad = ?, numero_estudiantes = ?, complejidad_estimada = ?, justificacion_complejidad = ?,
    duracion_estimada_semestres = ?, area_tematica = ?, objetivos_generales = ?, objetivos_especificos = ?,
    metodologia_propuesta = ?, recursos_necesarios = ?, bibliografia = ?`;
    
  let params = [
    titulo, descripcion, fecha_envio,
    modalidad, numero_estudiantes, complejidad_estimada, justificacion_complejidad,
    duracion_estimada_semestres, area_tematica, objetivos_generales, objetivos_especificos,
    metodologia_propuesta, recursos_necesarios, bibliografia
  ];
  
  // Solo actualizar el archivo si se proporciona uno nuevo
  if (archivo !== undefined) {
    query += `, archivo = ?`;
    params.push(archivo);
    
    if (nombre_archivo_original !== undefined) {
      query += `, nombre_archivo_original = ?`;
      params.push(nombre_archivo_original);
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

/**
 * Obtener usuarios por rol
 * @param {number} rol_id - ID del rol (1=estudiante, 2=profesor, 3=admin)
 * @returns {Promise<Array>} - Lista de usuarios con ese rol
 */
export const obtenerUsuariosPorRol = async (rol_id) => {
  try {
    const [rows] = await pool.execute(
      `SELECT rut, nombre, email FROM usuarios WHERE rol_id = ?`,
      [rol_id]
    );
    return rows;
  } catch (error) {
    console.error('Error al obtener usuarios por rol:', error);
    throw error;
  }
};

/**
 * Crear notificación para un usuario
 * @param {Object} notificacionData - Datos de la notificación
 * @returns {Promise<number>} - ID de la notificación creada
 */
export const crearNotificacion = async (notificacionData) => {
  try {
    const { usuario_rut, tipo, titulo, mensaje, proyecto_id, leida = false } = notificacionData;
    
    // Determinar el rol del destinatario basado en su rol_id
    const [usuario] = await pool.execute(
      `SELECT rol_id FROM usuarios WHERE rut = ?`,
      [usuario_rut]
    );
    
    if (!usuario || usuario.length === 0) {
      throw new Error(`Usuario ${usuario_rut} no encontrado`);
    }
    
    const rolMapping = {
      1: 'estudiante',
      2: 'profesor_guia', // Por defecto los profesores se marcan como guía
      3: 'admin'
    };
    
    const rol_destinatario = rolMapping[usuario[0].rol_id] || 'admin';
    
    const [result] = await pool.execute(
      `INSERT INTO notificaciones_proyecto (proyecto_id, tipo_notificacion, destinatario_rut, rol_destinatario, titulo, mensaje, leida, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [proyecto_id, tipo, usuario_rut, rol_destinatario, titulo, mensaje, leida]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};