// Servicio de Actividad en Tiempo Real
import { pool } from '../db/connectionDB.js';
import logger from '../config/logger.js';

// Almacenamiento en memoria de usuarios activos
const usuariosActivos = new Map();
const actividadReciente = [];
const MAX_ACTIVIDADES = 100;

/**
 * Registrar usuario como activo
 */
export const registrarUsuarioActivo = (socketId, usuario) => {
  const datos = {
    socketId,
    rut: usuario.rut,
    nombre: usuario.nombre,
    rol_id: usuario.rol_id,
    ultimaActividad: new Date(),
    paginaActual: null
  };
  
  usuariosActivos.set(socketId, datos);
  logger.info(`Usuario activo registrado: ${usuario.nombre} (${socketId})`);
  
  return obtenerEstadisticasActivos();
};

/**
 * Actualizar actividad del usuario
 */
export const actualizarActividadUsuario = (socketId, paginaActual) => {
  const usuario = usuariosActivos.get(socketId);
  if (usuario) {
    usuario.ultimaActividad = new Date();
    usuario.paginaActual = paginaActual;
    usuariosActivos.set(socketId, usuario);
  }
};

/**
 * Eliminar usuario activo (desconexión)
 */
export const eliminarUsuarioActivo = (socketId) => {
  const usuario = usuariosActivos.get(socketId);
  if (usuario) {
    logger.info(`Usuario desconectado: ${usuario.nombre} (${socketId})`);
    usuariosActivos.delete(socketId);
    return obtenerEstadisticasActivos();
  }
  return null;
};

/**
 * Obtener estadísticas de usuarios activos
 */
export const obtenerEstadisticasActivos = () => {
  const ahora = new Date();
  const usuarios = Array.from(usuariosActivos.values());
  
  // Filtrar usuarios realmente activos (últimos 5 minutos)
  const usuariosRealesmenteActivos = usuarios.filter(u => {
    const diff = (ahora - u.ultimaActividad) / 1000 / 60; // minutos
    return diff < 5;
  });

  // Agrupar por rol
  const porRol = usuariosRealesmenteActivos.reduce((acc, u) => {
    const rolNombre = getRolNombre(u.rol_id);
    acc[rolNombre] = (acc[rolNombre] || 0) + 1;
    return acc;
  }, {});

  // Páginas más visitadas
  const paginasActivas = usuariosRealesmenteActivos
    .filter(u => u.paginaActual)
    .reduce((acc, u) => {
      acc[u.paginaActual] = (acc[u.paginaActual] || 0) + 1;
      return acc;
    }, {});

  return {
    total: usuariosRealesmenteActivos.length,
    porRol,
    paginasActivas,
    usuarios: usuariosRealesmenteActivos.map(u => ({
      nombre: u.nombre,
      rol: getRolNombre(u.rol_id),
      paginaActual: u.paginaActual,
      ultimaActividad: u.ultimaActividad
    }))
  };
};

/**
 * Registrar actividad del sistema
 */
export const registrarActividad = async (tipo, descripcion, usuario_rut, detalles = {}) => {
  try {
    const actividad = {
      id: Date.now(),
      tipo, // 'propuesta_creada', 'proyecto_aprobado', 'reunion_agendada', etc.
      descripcion,
      usuario_rut,
      timestamp: new Date(),
      detalles
    };

    actividadReciente.unshift(actividad);
    
    // Mantener solo las últimas MAX_ACTIVIDADES
    if (actividadReciente.length > MAX_ACTIVIDADES) {
      actividadReciente.pop();
    }

    // Guardar en BD para historial permanente
    await pool.execute(`
      INSERT INTO actividad_sistema (tipo, descripcion, usuario_rut, detalles)
      VALUES (?, ?, ?, ?)
    `, [tipo, descripcion, usuario_rut, JSON.stringify(detalles)]);

    return actividad;
  } catch (error) {
    logger.error('Error registrando actividad:', error);
    throw error;
  }
};

/**
 * Obtener actividad reciente
 */
export const obtenerActividadReciente = (limite = 50) => {
  return actividadReciente.slice(0, limite);
};

/**
 * Obtener estadísticas de actividad por período
 */
export const obtenerEstadisticasActividad = async (diasAtras = 7) => {
  try {
    const [actividadPorDia] = await pool.execute(`
      SELECT 
        DATE(timestamp) as fecha,
        COUNT(*) as total_actividades,
        COUNT(DISTINCT usuario_rut) as usuarios_unicos
      FROM actividad_sistema
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY fecha
      ORDER BY fecha DESC
    `, [diasAtras]);

    const [actividadPorTipo] = await pool.execute(`
      SELECT 
        tipo,
        COUNT(*) as cantidad
      FROM actividad_sistema
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY tipo
      ORDER BY cantidad DESC
    `, [diasAtras]);

    const [horasPico] = await pool.execute(`
      SELECT 
        HOUR(timestamp) as hora,
        COUNT(*) as actividades
      FROM actividad_sistema
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY hora
      ORDER BY hora
    `, [diasAtras]);

    return {
      actividadPorDia,
      actividadPorTipo,
      horasPico
    };
  } catch (error) {
    logger.error('Error obteniendo estadísticas de actividad:', error);
    throw error;
  }
};

/**
 * Obtener tiempo promedio de sesión
 */
export const obtenerTiempoPromedioSesion = async () => {
  try {
    // Calcular basándose en actividades consecutivas del mismo usuario
    const [resultado] = await pool.execute(`
      SELECT 
        AVG(TIMESTAMPDIFF(MINUTE, min_time, max_time)) as promedio_minutos
      FROM (
        SELECT 
          usuario_rut,
          DATE(timestamp) as fecha,
          MIN(timestamp) as min_time,
          MAX(timestamp) as max_time
        FROM actividad_sistema
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY usuario_rut, DATE(timestamp)
        HAVING TIMESTAMPDIFF(MINUTE, min_time, max_time) > 0
        AND TIMESTAMPDIFF(MINUTE, min_time, max_time) < 480
      ) as sesiones
    `);

    return resultado[0]?.promedio_minutos || 0;
  } catch (error) {
    logger.error('Error calculando tiempo promedio de sesión:', error);
    throw error;
  }
};

// Helper
const getRolNombre = (rol_id) => {
  const roles = {
    1: 'Estudiantes',
    2: 'Profesores',
    3: 'Jefes de Carrera',
    4: 'Super Admin'
  };
  return roles[rol_id] || 'Desconocido';
};

export default {
  registrarUsuarioActivo,
  actualizarActividadUsuario,
  eliminarUsuarioActivo,
  obtenerEstadisticasActivos,
  registrarActividad,
  obtenerActividadReciente,
  obtenerEstadisticasActividad,
  obtenerTiempoPromedioSesion
};
