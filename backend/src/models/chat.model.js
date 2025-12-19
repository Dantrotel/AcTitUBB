import { pool } from '../db/connectionDB.js';
import logger from '../config/logger.js';

const chatModel = {
  /**
   * Obtener o crear conversación entre dos usuarios
   */
  async obtenerOCrearConversacion(usuario1_rut, usuario2_rut) {
    const connection = await pool.getConnection();
    try {
      // Normalizar el orden de los usuarios para evitar duplicados
      const [menor, mayor] = [usuario1_rut, usuario2_rut].sort();
      
      // Buscar conversación existente
      const [conversaciones] = await connection.query(
        `SELECT c.*, 
         m.contenido as ultimo_mensaje,
         m.created_at as ultimo_mensaje_fecha,
         m.remitente_rut as ultimo_mensaje_remitente
         FROM conversaciones c
         LEFT JOIN mensajes m ON c.ultimo_mensaje_id = m.id
         WHERE (c.usuario1_rut = ? AND c.usuario2_rut = ?)
         OR (c.usuario1_rut = ? AND c.usuario2_rut = ?)`,
        [menor, mayor, mayor, menor]
      );
      
      if (conversaciones.length > 0) {
        return conversaciones[0];
      }
      
      // Crear nueva conversación
      const [result] = await connection.query(
        'INSERT INTO conversaciones (usuario1_rut, usuario2_rut) VALUES (?, ?)',
        [menor, mayor]
      );
      
      const [nuevaConversacion] = await connection.query(
        'SELECT * FROM conversaciones WHERE id = ?',
        [result.insertId]
      );
      
      return nuevaConversacion[0];
    } finally {
      connection.release();
    }
  },

  /**
   * Obtener todas las conversaciones de un usuario
   */
  async obtenerConversacionesUsuario(usuario_rut) {
    const connection = await pool.getConnection();
    try {
      const [conversaciones] = await connection.query(
        `SELECT 
          c.id,
          c.created_at,
          c.updated_at,
          CASE 
            WHEN c.usuario1_rut = ? THEN c.usuario2_rut
            ELSE c.usuario1_rut
          END as otro_usuario_rut,
          CASE 
            WHEN c.usuario1_rut = ? THEN u2.nombre
            ELSE u1.nombre
          END as otro_usuario_nombre,
          CASE 
            WHEN c.usuario1_rut = ? THEN u2.email
            ELSE u1.email
          END as otro_usuario_email,
          m.contenido as ultimo_mensaje,
          m.created_at as ultimo_mensaje_fecha,
          m.remitente_rut as ultimo_mensaje_remitente,
          COALESCE(mnl.cantidad, 0) as mensajes_no_leidos
        FROM conversaciones c
        INNER JOIN usuarios u1 ON c.usuario1_rut = u1.rut
        INNER JOIN usuarios u2 ON c.usuario2_rut = u2.rut
        LEFT JOIN mensajes m ON c.ultimo_mensaje_id = m.id
        LEFT JOIN mensajes_no_leidos mnl ON c.id = mnl.conversacion_id AND mnl.usuario_rut = ?
        WHERE c.usuario1_rut = ? OR c.usuario2_rut = ?
        ORDER BY c.updated_at DESC`,
        [usuario_rut, usuario_rut, usuario_rut, usuario_rut, usuario_rut, usuario_rut]
      );
      
      return conversaciones;
    } finally {
      connection.release();
    }
  },

  /**
   * Enviar mensaje
   */
  async enviarMensaje(conversacion_id, remitente_rut, contenido) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Insertar mensaje
      const [result] = await connection.query(
        'INSERT INTO mensajes (conversacion_id, remitente_rut, contenido) VALUES (?, ?, ?)',
        [conversacion_id, remitente_rut, contenido]
      );
      
      const mensaje_id = result.insertId;
      
      // Actualizar ultimo_mensaje_id en conversacion
      await connection.query(
        'UPDATE conversaciones SET ultimo_mensaje_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [mensaje_id, conversacion_id]
      );
      
      // Obtener el otro usuario de la conversación
      const [conversacion] = await connection.query(
        'SELECT usuario1_rut, usuario2_rut FROM conversaciones WHERE id = ?',
        [conversacion_id]
      );
      
      if (conversacion.length > 0) {
        const destinatario_rut = conversacion[0].usuario1_rut === remitente_rut 
          ? conversacion[0].usuario2_rut 
          : conversacion[0].usuario1_rut;
        
        // Actualizar o insertar contador de mensajes no leídos
        await connection.query(
          `INSERT INTO mensajes_no_leidos (usuario_rut, conversacion_id, cantidad, ultimo_mensaje_at)
           VALUES (?, ?, 1, CURRENT_TIMESTAMP)
           ON DUPLICATE KEY UPDATE 
           cantidad = cantidad + 1,
           ultimo_mensaje_at = CURRENT_TIMESTAMP`,
          [destinatario_rut, conversacion_id]
        );
      }
      
      await connection.commit();
      
      // Obtener mensaje completo con información del remitente
      const [mensaje] = await connection.query(
        `SELECT m.*, u.nombre as remitente_nombre, u.email as remitente_email
         FROM mensajes m
         INNER JOIN usuarios u ON m.remitente_rut = u.rut
         WHERE m.id = ?`,
        [mensaje_id]
      );
      
      return mensaje[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Obtener mensajes de una conversación
   */
  async obtenerMensajes(conversacion_id, limit = 50, offset = 0) {
    const connection = await pool.getConnection();
    try {
      const [mensajes] = await connection.query(
        `SELECT m.*, u.nombre as remitente_nombre, u.email as remitente_email
         FROM mensajes m
         INNER JOIN usuarios u ON m.remitente_rut = u.rut
         WHERE m.conversacion_id = ?
         ORDER BY m.created_at DESC
         LIMIT ? OFFSET ?`,
        [conversacion_id, limit, offset]
      );
      
      // Invertir el orden para que los más antiguos queden primero
      return mensajes.reverse();
    } finally {
      connection.release();
    }
  },

  /**
   * Marcar mensajes como leídos
   */
  async marcarComoLeidos(conversacion_id, usuario_rut) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Marcar como leídos todos los mensajes de la conversación que no son del usuario
      await connection.query(
        `UPDATE mensajes 
         SET leido = TRUE, fecha_lectura = CURRENT_TIMESTAMP
         WHERE conversacion_id = ? 
         AND remitente_rut != ? 
         AND leido = FALSE`,
        [conversacion_id, usuario_rut]
      );
      
      // Resetear contador de mensajes no leídos
      await connection.query(
        `DELETE FROM mensajes_no_leidos 
         WHERE conversacion_id = ? AND usuario_rut = ?`,
        [conversacion_id, usuario_rut]
      );
      
      await connection.commit();
      
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  /**
   * Obtener total de mensajes no leídos de un usuario
   */
  async obtenerTotalNoLeidos(usuario_rut) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `SELECT COALESCE(SUM(cantidad), 0) as total
         FROM mensajes_no_leidos
         WHERE usuario_rut = ?`,
        [usuario_rut]
      );
      
      return result[0].total;
    } finally {
      connection.release();
    }
  },

  /**
   * Verificar que el usuario tiene acceso a la conversación
   */
  async verificarAccesoConversacion(conversacion_id, usuario_rut) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        `SELECT COUNT(*) as tiene_acceso
         FROM conversaciones
         WHERE id = ? AND (usuario1_rut = ? OR usuario2_rut = ?)`,
        [conversacion_id, usuario_rut, usuario_rut]
      );
      
      return result[0].tiene_acceso > 0;
    } finally {
      connection.release();
    }
  },

  /**
   * Buscar usuarios para iniciar chat (excluyendo al usuario actual)
   */
  async buscarUsuarios(usuario_rut, busqueda = '') {
    const connection = await pool.getConnection();
    try {
      const [usuarios] = await connection.query(
        `SELECT u.rut, u.nombre, u.email, r.nombre as rol
         FROM usuarios u
         INNER JOIN roles r ON u.rol_id = r.id
         WHERE u.rut != ?
         AND (u.nombre LIKE ? OR u.email LIKE ? OR u.rut LIKE ?)
         AND u.confirmado = TRUE
         ORDER BY u.nombre
         LIMIT 20`,
        [usuario_rut, `%${busqueda}%`, `%${busqueda}%`, `%${busqueda}%`]
      );
      
      return usuarios;
    } finally {
      connection.release();
    }
  }
};

export default chatModel;
