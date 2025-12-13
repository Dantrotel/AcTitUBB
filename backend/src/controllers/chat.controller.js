import chatModel from '../models/chat.model.js';
import logger from '../config/logger.js';
import { getIO } from '../config/socket.js';

const chatController = {
  /**
   * Obtener todas las conversaciones del usuario
   */
  async obtenerConversaciones(req, res) {
    try {
      const { rut } = req.user;
      
      const conversaciones = await chatModel.obtenerConversacionesUsuario(rut);
      
      res.status(200).json({
        success: true,
        conversaciones
      });
    } catch (error) {
      logger.error('Error obteniendo conversaciones', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Error al obtener conversaciones',
        error: error.message
      });
    }
  },

  /**
   * Obtener o crear conversación con otro usuario
   */
  async obtenerOCrearConversacion(req, res) {
    try {
      const { rut } = req.user;
      const { otro_usuario_rut } = req.params;
      
      if (rut === otro_usuario_rut) {
        return res.status(400).json({
          success: false,
          message: 'No puedes crear una conversación contigo mismo'
        });
      }
      
      const conversacion = await chatModel.obtenerOCrearConversacion(rut, otro_usuario_rut);
      
      res.status(200).json({
        success: true,
        conversacion
      });
    } catch (error) {
      logger.error('Error obteniendo/creando conversación', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Error al obtener conversación',
        error: error.message
      });
    }
  },

  /**
   * Obtener mensajes de una conversación
   */
  async obtenerMensajes(req, res) {
    try {
      const { rut } = req.user;
      const { conversacion_id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      // Verificar acceso
      const tieneAcceso = await chatModel.verificarAccesoConversacion(conversacion_id, rut);
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta conversación'
        });
      }
      
      const mensajes = await chatModel.obtenerMensajes(
        conversacion_id, 
        parseInt(limit), 
        parseInt(offset)
      );
      
      res.status(200).json({
        success: true,
        mensajes
      });
    } catch (error) {
      logger.error('Error obteniendo mensajes', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Error al obtener mensajes',
        error: error.message
      });
    }
  },

  /**
   * Enviar mensaje (también se puede hacer por WebSocket)
   */
  async enviarMensaje(req, res) {
    try {
      const { rut } = req.user;
      const { conversacion_id } = req.params;
      const { contenido } = req.body;
      
      if (!contenido || contenido.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El contenido del mensaje no puede estar vacío'
        });
      }
      
      // Verificar acceso
      const tieneAcceso = await chatModel.verificarAccesoConversacion(conversacion_id, rut);
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta conversación'
        });
      }
      
      const mensaje = await chatModel.enviarMensaje(conversacion_id, rut, contenido.trim());
      
      // Emitir mensaje por WebSocket
      try {
        const io = getIO();
        const [conversacion] = await chatModel.obtenerConversacionesUsuario(rut);
        const destinatario_rut = conversacion.usuario1_rut === rut 
          ? conversacion.usuario2_rut 
          : conversacion.usuario1_rut;
        
        io.to(`user_${destinatario_rut}`).emit('chat:nuevo-mensaje', {
          conversacion_id,
          mensaje
        });
      } catch (socketError) {
        logger.warn('Error emitiendo mensaje por WebSocket', { error: socketError.message });
      }
      
      res.status(201).json({
        success: true,
        mensaje
      });
    } catch (error) {
      logger.error('Error enviando mensaje', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Error al enviar mensaje',
        error: error.message
      });
    }
  },

  /**
   * Marcar mensajes como leídos
   */
  async marcarComoLeidos(req, res) {
    try {
      const { rut } = req.user;
      const { conversacion_id } = req.params;
      
      // Verificar acceso
      const tieneAcceso = await chatModel.verificarAccesoConversacion(conversacion_id, rut);
      if (!tieneAcceso) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta conversación'
        });
      }
      
      await chatModel.marcarComoLeidos(conversacion_id, rut);
      
      res.status(200).json({
        success: true,
        message: 'Mensajes marcados como leídos'
      });
    } catch (error) {
      logger.error('Error marcando mensajes como leídos', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Error al marcar mensajes como leídos',
        error: error.message
      });
    }
  },

  /**
   * Obtener total de mensajes no leídos
   */
  async obtenerTotalNoLeidos(req, res) {
    try {
      const { rut } = req.user;
      
      const total = await chatModel.obtenerTotalNoLeidos(rut);
      
      res.status(200).json({
        success: true,
        total
      });
    } catch (error) {
      logger.error('Error obteniendo total no leídos', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Error al obtener total de mensajes no leídos',
        error: error.message
      });
    }
  },

  /**
   * Buscar usuarios para iniciar chat
   */
  async buscarUsuarios(req, res) {
    try {
      const { rut } = req.user;
      const { q = '' } = req.query;
      
      const usuarios = await chatModel.buscarUsuarios(rut, q);
      
      res.status(200).json({
        success: true,
        usuarios
      });
    } catch (error) {
      logger.error('Error buscando usuarios', { error: error.message, stack: error.stack });
      res.status(500).json({
        success: false,
        message: 'Error al buscar usuarios',
        error: error.message
      });
    }
  }
};

export default chatController;
