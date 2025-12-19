// Controlador de Respaldo
import * as respaldoService from '../services/respaldo.service.js';
import logger from '../config/logger.js';

/**
 * Realizar backup manual completo
 */
export const realizarBackupManual = async (req, res) => {
  try {
    // Solo Super Admin puede hacer backups manuales
    if (req.user.rol_id !== 4) {
      return res.status(403).json({ error: 'Acceso denegado. Solo Super Admin.' });
    }

    const resultado = await respaldoService.realizarBackupCompleto();
    
    res.json({
      success: true,
      mensaje: 'Backup completado exitosamente',
      ...resultado
    });
  } catch (error) {
    logger.error('Error realizando backup manual:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error realizando backup',
      details: error.message
    });
  }
};

/**
 * Listar backups disponibles
 */
export const listarBackups = async (req, res) => {
  try {
    // Solo Super Admin
    if (req.user.rol_id !== 4) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const backups = await respaldoService.listarBackups();
    
    res.json({
      success: true,
      total: backups.length,
      backups
    });
  } catch (error) {
    logger.error('Error listando backups:', error);
    res.status(500).json({ error: 'Error listando backups' });
  }
};

/**
 * Restaurar un backup
 */
export const restaurarBackup = async (req, res) => {
  try {
    const { nombre } = req.params;
    
    // Solo Super Admin
    if (req.user.rol_id !== 4) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const resultado = await respaldoService.restaurarBackup(nombre);
    
    res.json({
      success: true,
      mensaje: 'Backup restaurado exitosamente',
      ...resultado
    });
  } catch (error) {
    logger.error('Error restaurando backup:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error restaurando backup',
      details: error.message
    });
  }
};

/**
 * Eliminar un backup
 */
export const eliminarBackup = async (req, res) => {
  try {
    const { nombre } = req.params;
    
    // Solo Super Admin
    if (req.user.rol_id !== 4) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    await respaldoService.eliminarBackup(nombre);
    
    res.json({
      success: true,
      mensaje: 'Backup eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error eliminando backup:', error);
    res.status(500).json({ error: 'Error eliminando backup' });
  }
};

/**
 * Obtener historial de backups
 */
export const obtenerHistorialBackups = async (req, res) => {
  try {
    // Solo Super Admin
    if (req.user.rol_id !== 4) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const historial = respaldoService.obtenerHistorial();
    
    res.json({
      success: true,
      historial
    });
  } catch (error) {
    logger.error('Error obteniendo historial de backups:', error);
    res.status(500).json({ error: 'Error obteniendo historial' });
  }
};

export default {
  realizarBackupManual,
  listarBackups,
  restaurarBackup,
  eliminarBackup,
  obtenerHistorialBackups
};
