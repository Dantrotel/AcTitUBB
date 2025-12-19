// Servicio de Respaldo Automático
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import cron from 'node-cron';
import logger from '../config/logger.js';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const BACKUP_DIR = path.join(__dirname, '../../backups');
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'actitubb';
const UPLOADS_DIR = path.join(__dirname, '../../uploads');
const MAX_BACKUPS = 30; // Mantener últimos 30 backups

let backupScheduler = null;
let backupHistory = [];

/**
 * Inicializar servicio de respaldo
 */
export const inicializarRespaldo = async () => {
  try {
    // Crear directorio de backups si no existe
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // Programar backup diario a las 2:00 AM
    backupScheduler = cron.schedule('0 2 * * *', async () => {
      logger.info('🔄 Ejecutando backup automático diario...');
      await realizarBackupCompleto();
    });

    logger.info('✅ Servicio de respaldo automático inicializado');
    logger.info('📅 Backups programados diariamente a las 2:00 AM');

    // Cargar historial de backups
    await cargarHistorialBackups();
  } catch (error) {
    logger.error('Error inicializando servicio de respaldo:', error);
    throw error;
  }
};

/**
 * Realizar backup completo (BD + archivos)
 */
export const realizarBackupCompleto = async () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `backup-${timestamp}`;
  const backupPath = path.join(BACKUP_DIR, backupName);

  try {
    logger.info(`🚀 Iniciando backup completo: ${backupName}`);
    const startTime = Date.now();

    // Crear directorio para este backup
    await fs.mkdir(backupPath, { recursive: true });

    // 1. Backup de Base de Datos
    const dbBackupFile = path.join(backupPath, 'database.sql');
    await realizarBackupBaseDatos(dbBackupFile);

    // 2. Backup de Archivos
    const filesBackupFile = path.join(backupPath, 'uploads.zip');
    await realizarBackupArchivos(filesBackupFile);

    // 3. Crear archivo de metadatos
    const metadata = {
      fecha: new Date().toISOString(),
      tipo: 'completo',
      database: {
        host: DB_HOST,
        nombre: DB_NAME,
        archivo: 'database.sql'
      },
      archivos: {
        directorio: UPLOADS_DIR,
        archivo: 'uploads.zip'
      },
      duracion_segundos: (Date.now() - startTime) / 1000
    };

    await fs.writeFile(
      path.join(backupPath, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // 4. Limpiar backups antiguos
    await limpiarBackupsAntiguos();

    // 5. Actualizar historial
    backupHistory.unshift({
      nombre: backupName,
      fecha: new Date(),
      tipo: 'completo',
      tamano: await calcularTamanoBackup(backupPath),
      duracion: metadata.duracion_segundos,
      estado: 'exitoso'
    });

    const duracion = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`✅ Backup completado exitosamente en ${duracion}s: ${backupName}`);

    return {
      success: true,
      backup: backupName,
      duracion: metadata.duracion_segundos,
      ruta: backupPath
    };
  } catch (error) {
    logger.error(`❌ Error en backup completo:`, error);
    
    // Registrar fallo en historial
    backupHistory.unshift({
      nombre: backupName,
      fecha: new Date(),
      tipo: 'completo',
      estado: 'fallido',
      error: error.message
    });

    throw error;
  }
};

/**
 * Backup solo de base de datos
 */
export const realizarBackupBaseDatos = async (outputFile) => {
  try {
    logger.info('📊 Realizando backup de base de datos...');

    const command = `mysqldump -h ${DB_HOST} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} > "${outputFile}"`;
    
    await execPromise(command);

    logger.info('✅ Backup de base de datos completado');
    return outputFile;
  } catch (error) {
    logger.error('Error en backup de base de datos:', error);
    throw error;
  }
};

/**
 * Backup de archivos (uploads)
 */
export const realizarBackupArchivos = async (outputFile) => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info('📁 Realizando backup de archivos...');

      const output = createWriteStream(outputFile);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        logger.info(`✅ Backup de archivos completado: ${archive.pointer()} bytes`);
        resolve(outputFile);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Agregar directorio uploads al zip
      archive.directory(UPLOADS_DIR, 'uploads');

      await archive.finalize();
    } catch (error) {
      logger.error('Error en backup de archivos:', error);
      reject(error);
    }
  });
};

/**
 * Restaurar backup
 */
export const restaurarBackup = async (backupName) => {
  const backupPath = path.join(BACKUP_DIR, backupName);

  try {
    logger.info(`🔄 Iniciando restauración de backup: ${backupName}`);

    // Verificar que existe
    await fs.access(backupPath);

    // Leer metadata
    const metadataPath = path.join(backupPath, 'metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));

    // 1. Restaurar base de datos
    const dbFile = path.join(backupPath, 'database.sql');
    const restoreCommand = `mysql -h ${DB_HOST} -u ${DB_USER} ${DB_PASSWORD ? `-p${DB_PASSWORD}` : ''} ${DB_NAME} < "${dbFile}"`;
    await execPromise(restoreCommand);

    logger.info('✅ Base de datos restaurada');

    // 2. Nota: Los archivos se pueden restaurar manualmente si es necesario
    logger.info(`ℹ️  Archivos disponibles en: ${path.join(backupPath, 'uploads.zip')}`);

    logger.info(`✅ Restauración completada: ${backupName}`);

    return {
      success: true,
      backup: backupName,
      metadata
    };
  } catch (error) {
    logger.error(`❌ Error restaurando backup:`, error);
    throw error;
  }
};

/**
 * Listar backups disponibles
 */
export const listarBackups = async () => {
  try {
    const archivos = await fs.readdir(BACKUP_DIR);
    
    const backups = await Promise.all(
      archivos.map(async (nombre) => {
        const rutaBackup = path.join(BACKUP_DIR, nombre);
        const stats = await fs.stat(rutaBackup);
        
        if (!stats.isDirectory()) return null;

        try {
          const metadataPath = path.join(rutaBackup, 'metadata.json');
          const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
          
          return {
            nombre,
            fecha: metadata.fecha,
            tipo: metadata.tipo,
            tamano: await calcularTamanoBackup(rutaBackup),
            duracion: metadata.duracion_segundos
          };
        } catch {
          return {
            nombre,
            fecha: stats.mtime,
            tipo: 'desconocido',
            tamano: await calcularTamanoBackup(rutaBackup)
          };
        }
      })
    );

    return backups.filter(b => b !== null).sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );
  } catch (error) {
    logger.error('Error listando backups:', error);
    throw error;
  }
};

/**
 * Eliminar backup
 */
export const eliminarBackup = async (backupName) => {
  try {
    const backupPath = path.join(BACKUP_DIR, backupName);
    await fs.rm(backupPath, { recursive: true, force: true });
    logger.info(`🗑️  Backup eliminado: ${backupName}`);
    return { success: true };
  } catch (error) {
    logger.error('Error eliminando backup:', error);
    throw error;
  }
};

/**
 * Limpiar backups antiguos (mantener solo MAX_BACKUPS)
 */
const limpiarBackupsAntiguos = async () => {
  try {
    const backups = await listarBackups();
    
    if (backups.length > MAX_BACKUPS) {
      const paraEliminar = backups.slice(MAX_BACKUPS);
      
      for (const backup of paraEliminar) {
        await eliminarBackup(backup.nombre);
      }
      
      logger.info(`🧹 ${paraEliminar.length} backups antiguos eliminados`);
    }
  } catch (error) {
    logger.error('Error limpiando backups antiguos:', error);
  }
};

/**
 * Calcular tamaño de backup
 */
const calcularTamanoBackup = async (rutaBackup) => {
  try {
    const archivos = await fs.readdir(rutaBackup);
    let tamanoTotal = 0;

    for (const archivo of archivos) {
      const stats = await fs.stat(path.join(rutaBackup, archivo));
      tamanoTotal += stats.size;
    }

    return formatearTamano(tamanoTotal);
  } catch {
    return 'Desconocido';
  }
};

/**
 * Formatear tamaño en bytes a formato legible
 */
const formatearTamano = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Cargar historial de backups al iniciar
 */
const cargarHistorialBackups = async () => {
  try {
    backupHistory = await listarBackups();
    logger.info(`📚 Historial de backups cargado: ${backupHistory.length} backups`);
  } catch (error) {
    logger.error('Error cargando historial de backups:', error);
  }
};

/**
 * Obtener historial de backups
 */
export const obtenerHistorial = () => {
  return backupHistory;
};

/**
 * Detener servicio de respaldo
 */
export const detenerRespaldo = () => {
  if (backupScheduler) {
    backupScheduler.stop();
    logger.info('⏸️  Servicio de respaldo detenido');
  }
};

export default {
  inicializarRespaldo,
  realizarBackupCompleto,
  realizarBackupBaseDatos,
  realizarBackupArchivos,
  restaurarBackup,
  listarBackups,
  eliminarBackup,
  obtenerHistorial,
  detenerRespaldo
};
