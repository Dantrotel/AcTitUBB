// Sprint 3: Sistema de notificaciones en tiempo real con Socket.io
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

let io = null;

/**
 * Inicializar Socket.io server
 */
export const initializeSocketIO = (httpServer, allowedOrigins) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        logger.warn('Socket connection sin token', { 
          socketId: socket.id 
        });
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      socket.user = {
        rut: decoded.rut,
        rol_id: decoded.rol_id,
        rol: getRoleName(decoded.rol_id)
      };
      
      logger.info('Socket autenticado', {
        socketId: socket.id,
        user: socket.user.rut,
        rol: socket.user.rol
      });
      
      next();
      
    } catch (error) {
      logger.warn('Socket authentication fallida', { 
        error: error.message,
        socketId: socket.id 
      });
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Eventos de conexión
  io.on('connection', (socket) => {
    const { rut, rol } = socket.user;
    
    // Unir a sala personal
    socket.join(`user_${rut}`);
    
    // Unir a sala por rol
    socket.join(`role_${rol}`);
    
    logger.info('Usuario conectado vía WebSocket', {
      socketId: socket.id,
      rut,
      rol,
      salas: [`user_${rut}`, `role_${rol}`]
    });

    // Enviar confirmación de conexión
    socket.emit('connected', {
      message: 'Conectado al servidor de notificaciones',
      user: rut,
      timestamp: new Date().toISOString()
    });

    // Evento: Usuario solicita unirse a sala de proyecto
    socket.on('join:proyecto', (proyectoId) => {
      socket.join(`proyecto_${proyectoId}`);
      logger.debug('Usuario unido a sala de proyecto', {
        rut,
        proyectoId,
        socketId: socket.id
      });
      
      socket.emit('joined:proyecto', { proyectoId });
    });

    // Evento: Usuario sale de sala de proyecto
    socket.on('leave:proyecto', (proyectoId) => {
      socket.leave(`proyecto_${proyectoId}`);
      logger.debug('Usuario salió de sala de proyecto', {
        rut,
        proyectoId
      });
    });

    // Evento: Marcar notificación como leída
    socket.on('notificacion:leida', (notificacionId) => {
      logger.debug('Notificación marcada como leída', {
        rut,
        notificacionId
      });
      // Aquí podrías actualizar en BD si es necesario
    });

    // Evento: Desconexión
    socket.on('disconnect', (reason) => {
      logger.info('Usuario desconectado de WebSocket', {
        socketId: socket.id,
        rut,
        reason
      });
    });

    // Manejo de errores
    socket.on('error', (error) => {
      logger.error('Error en socket', {
        socketId: socket.id,
        rut,
        error: error.message
      });
    });
  });

  logger.info('✅ Socket.io inicializado correctamente');
  
  return io;
};

/**
 * Obtener instancia de Socket.io
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado. Llama a initializeSocketIO primero.');
  }
  return io;
};

/**
 * Mapear rol_id a nombre
 */
const getRoleName = (rol_id) => {
  const roleMap = {
    1: 'estudiante',
    2: 'profesor',
    3: 'admin'
  };
  return roleMap[rol_id] || 'unknown';
};

/**
 * Emitir notificación a un usuario específico
 */
export const notifyUser = (userRut, eventName, data) => {
  try {
    const socket = getIO();
    socket.to(`user_${userRut}`).emit(eventName, {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    logger.debug('Notificación enviada a usuario', {
      userRut,
      eventName,
      data: JSON.stringify(data).substring(0, 100)
    });
    
  } catch (error) {
    logger.error('Error enviando notificación a usuario', {
      error: error.message,
      userRut,
      eventName
    });
  }
};

/**
 * Emitir notificación a todos los usuarios de un rol
 */
export const notifyRole = (role, eventName, data) => {
  try {
    const socket = getIO();
    socket.to(`role_${role}`).emit(eventName, {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    logger.debug('Notificación enviada a rol', {
      role,
      eventName
    });
    
  } catch (error) {
    logger.error('Error enviando notificación a rol', {
      error: error.message,
      role,
      eventName
    });
  }
};

/**
 * Emitir notificación a todos los miembros de un proyecto
 */
export const notifyProyecto = (proyectoId, eventName, data) => {
  try {
    const socket = getIO();
    socket.to(`proyecto_${proyectoId}`).emit(eventName, {
      ...data,
      proyectoId,
      timestamp: new Date().toISOString()
    });
    
    logger.debug('Notificación enviada a proyecto', {
      proyectoId,
      eventName
    });
    
  } catch (error) {
    logger.error('Error enviando notificación a proyecto', {
      error: error.message,
      proyectoId,
      eventName
    });
  }
};

/**
 * Broadcast a todos los usuarios conectados
 */
export const notifyAll = (eventName, data) => {
  try {
    const socket = getIO();
    socket.emit(eventName, {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    logger.debug('Broadcast enviado', { eventName });
    
  } catch (error) {
    logger.error('Error en broadcast', {
      error: error.message,
      eventName
    });
  }
};

/**
 * Helpers para eventos específicos del dominio
 */

export const notifyPropuestaAprobada = (estudianteRut, propuesta) => {
  notifyUser(estudianteRut, 'propuesta:aprobada', {
    type: 'success',
    title: 'Propuesta Aprobada',
    message: `Tu propuesta "${propuesta.titulo}" ha sido aprobada`,
    propuestaId: propuesta.id,
    action: {
      label: 'Ver Proyecto',
      url: `/proyectos/${propuesta.proyecto_id}`
    }
  });
};

export const notifyPropuestaRechazada = (estudianteRut, propuesta, motivo) => {
  notifyUser(estudianteRut, 'propuesta:rechazada', {
    type: 'warning',
    title: 'Propuesta Rechazada',
    message: `Tu propuesta "${propuesta.titulo}" ha sido rechazada`,
    propuestaId: propuesta.id,
    motivo,
    action: {
      label: 'Ver Comentarios',
      url: `/propuestas/${propuesta.id}`
    }
  });
};

export const notifyReunionSolicitada = (profesorRut, solicitud) => {
  notifyUser(profesorRut, 'reunion:solicitada', {
    type: 'info',
    title: 'Nueva Solicitud de Reunión',
    message: `Tienes una nueva solicitud de reunión para el proyecto`,
    solicitudId: solicitud.id,
    estudianteNombre: solicitud.estudiante_nombre,
    proyectoId: solicitud.proyecto_id,
    action: {
      label: 'Ver Solicitud',
      url: `/calendario/solicitudes/${solicitud.id}`
    }
  });
};

export const notifyReunionConfirmada = (estudianteRut, reunion) => {
  notifyUser(estudianteRut, 'reunion:confirmada', {
    type: 'success',
    title: 'Reunión Confirmada',
    message: `Tu reunión ha sido confirmada para ${reunion.fecha} a las ${reunion.hora_inicio}`,
    reunionId: reunion.id,
    fecha: reunion.fecha,
    hora: reunion.hora_inicio,
    action: {
      label: 'Ver Calendario',
      url: `/calendario`
    }
  });
};

export const notifyHitoProximoVencimiento = (estudianteRut, hito) => {
  notifyUser(estudianteRut, 'hito:proximo_vencimiento', {
    type: 'warning',
    title: 'Hito Próximo a Vencer',
    message: `El hito "${hito.nombre}" vence en ${hito.dias_restantes} días`,
    hitoId: hito.id,
    proyectoId: hito.proyecto_id,
    fechaVencimiento: hito.fecha_entrega,
    action: {
      label: 'Ver Hito',
      url: `/proyectos/${hito.proyecto_id}/hitos/${hito.id}`
    }
  });
};

export const notifyDocumentoRevisado = (estudianteRut, documento, aprobado) => {
  notifyUser(estudianteRut, 'documento:revisado', {
    type: aprobado ? 'success' : 'warning',
    title: aprobado ? 'Documento Aprobado' : 'Documento Requiere Correcciones',
    message: `Tu documento "${documento.nombre}" ha sido revisado`,
    documentoId: documento.id,
    proyectoId: documento.proyecto_id,
    aprobado,
    action: {
      label: 'Ver Documento',
      url: `/proyectos/${documento.proyecto_id}/documentos/${documento.id}`
    }
  });
};

export const notifyAsignacionProfesor = (profesorRut, proyecto, rol) => {
  notifyUser(profesorRut, 'proyecto:asignado', {
    type: 'info',
    title: 'Nuevo Proyecto Asignado',
    message: `Has sido asignado como ${rol} al proyecto "${proyecto.nombre}"`,
    proyectoId: proyecto.id,
    rol,
    action: {
      label: 'Ver Proyecto',
      url: `/proyectos/${proyecto.id}`
    }
  });
};

export default {
  initializeSocketIO,
  getIO,
  notifyUser,
  notifyRole,
  notifyProyecto,
  notifyAll,
  notifyPropuestaAprobada,
  notifyPropuestaRechazada,
  notifyReunionSolicitada,
  notifyReunionConfirmada,
  notifyHitoProximoVencimiento,
  notifyDocumentoRevisado,
  notifyAsignacionProfesor
};
