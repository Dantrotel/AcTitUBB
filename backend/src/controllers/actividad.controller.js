// Controlador de Actividad en Tiempo Real
import * as actividadService from '../services/actividad.service.js';
import logger from '../config/logger.js';

/**
 * Obtener usuarios activos en tiempo real
 */
export const obtenerUsuariosActivos = async (req, res) => {
  try {
    // Solo Super Admin puede ver esto
    if (req.user.rol_id !== 4) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const estadisticas = actividadService.obtenerEstadisticasActivos();
    
    res.json({
      success: true,
      ...estadisticas
    });
  } catch (error) {
    logger.error('Error obteniendo usuarios activos:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios activos' });
  }
};

/**
 * Obtener actividad reciente del sistema
 */
export const obtenerActividadReciente = async (req, res) => {
  try {
    const { limite } = req.query;
    
    // Solo Admin y Super Admin
    if (![3, 4].includes(req.user.rol_id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const actividades = actividadService.obtenerActividadReciente(parseInt(limite) || 50);
    
    res.json({
      success: true,
      total: actividades.length,
      actividades
    });
  } catch (error) {
    logger.error('Error obteniendo actividad reciente:', error);
    res.status(500).json({ error: 'Error obteniendo actividad' });
  }
};

/**
 * Obtener estadísticas de actividad por período
 */
export const obtenerEstadisticasActividad = async (req, res) => {
  try {
    const { dias } = req.query;
    
    // Solo Admin y Super Admin
    if (![3, 4].includes(req.user.rol_id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const estadisticas = await actividadService.obtenerEstadisticasActividad(parseInt(dias) || 7);
    const tiempoPromedio = await actividadService.obtenerTiempoPromedioSesion();
    
    res.json({
      success: true,
      ...estadisticas,
      tiempoPromedioSesion: tiempoPromedio
    });
  } catch (error) {
    logger.error('Error obteniendo estadísticas de actividad:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
};

export default {
  obtenerUsuariosActivos,
  obtenerActividadReciente,
  obtenerEstadisticasActividad
};
