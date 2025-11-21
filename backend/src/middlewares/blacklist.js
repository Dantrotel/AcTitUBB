// Sprint 1: Blacklist de tokens persistente en base de datos
import { pool } from '../db/connectionDB.js';
import logger from '../config/logger.js';
import crypto from 'crypto';

// Cache en memoria para rendimiento (actualizado desde DB)
const memoryBlacklist = new Set();
let lastSync = Date.now();
const SYNC_INTERVAL = 60000; // 1 minuto

/**
 * Crear tabla de blacklist si no existe
 */
export const initializeBlacklist = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS tokens_blacklist (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token_hash VARCHAR(64) UNIQUE NOT NULL,
        revocado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expira_en TIMESTAMP NOT NULL,
        usuario_rut VARCHAR(12),
        motivo VARCHAR(255),
        INDEX idx_expiracion (expira_en),
        INDEX idx_token_hash (token_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    logger.info('Tabla tokens_blacklist verificada/creada');
    
    // Sincronizar memoria con DB al inicio
    await syncFromDatabase();
    
    // Limpiar tokens expirados
    await cleanExpiredTokens();
    
  } catch (error) {
    logger.error('Error inicializando blacklist:', { error: error.message });
  }
};

/**
 * Hash del token para almacenamiento (por seguridad)
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Agregar token a blacklist
 */
export const addToken = async (token, usuarioRut = null, motivo = 'logout', expiresIn = '4h') => {
  try {
    const tokenHash = hashToken(token);
    
    // Calcular fecha de expiración (mismo TTL que el token)
    const expiraEn = new Date();
    const hours = parseInt(expiresIn) || 4;
    expiraEn.setHours(expiraEn.getHours() + hours);
    
    await pool.execute(
      `INSERT INTO tokens_blacklist (token_hash, usuario_rut, motivo, expira_en) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE revocado_en = CURRENT_TIMESTAMP`,
      [tokenHash, usuarioRut, motivo, expiraEn]
    );
    
    // Agregar a memoria
    memoryBlacklist.add(tokenHash);
    
    logger.info('Token agregado a blacklist', { 
      usuario_rut: usuarioRut, 
      motivo,
      expira_en: expiraEn 
    });
    
  } catch (error) {
    logger.error('Error agregando token a blacklist:', { error: error.message });
    // Agregar solo a memoria si falla DB
    memoryBlacklist.add(hashToken(token));
  }
};

/**
 * Verificar si token está en blacklist
 */
export const isBlacklisted = async (token) => {
  const tokenHash = hashToken(token);
  
  // Check memoria primero (rápido)
  if (memoryBlacklist.has(tokenHash)) {
    return true;
  }
  
  // Sincronizar con DB periódicamente
  if (Date.now() - lastSync > SYNC_INTERVAL) {
    await syncFromDatabase();
  }
  
  // Check DB si no está en memoria (por si acaso)
  try {
    const [rows] = await pool.execute(
      `SELECT 1 FROM tokens_blacklist 
       WHERE token_hash = ? AND expira_en > NOW() 
       LIMIT 1`,
      [tokenHash]
    );
    
    if (rows.length > 0) {
      memoryBlacklist.add(tokenHash);
      return true;
    }
    
  } catch (error) {
    logger.error('Error verificando blacklist en DB:', { error: error.message });
  }
  
  return false;
};

/**
 * Sincronizar memoria con base de datos
 */
const syncFromDatabase = async () => {
  try {
    const [rows] = await pool.execute(
      `SELECT token_hash FROM tokens_blacklist 
       WHERE expira_en > NOW()`
    );
    
    memoryBlacklist.clear();
    rows.forEach(row => memoryBlacklist.add(row.token_hash));
    
    lastSync = Date.now();
    logger.debug(`Blacklist sincronizada: ${rows.length} tokens activos`);
    
  } catch (error) {
    logger.error('Error sincronizando blacklist:', { error: error.message });
  }
};

/**
 * Limpiar tokens expirados (ejecutar periódicamente)
 */
export const cleanExpiredTokens = async () => {
  try {
    const [result] = await pool.execute(
      `DELETE FROM tokens_blacklist WHERE expira_en < NOW()`
    );
    
    if (result.affectedRows > 0) {
      logger.info(`Limpieza blacklist: ${result.affectedRows} tokens expirados eliminados`);
      await syncFromDatabase();
    }
    
  } catch (error) {
    logger.error('Error limpiando blacklist:', { error: error.message });
  }
};

/**
 * Revocar todos los tokens de un usuario
 */
export const revokeAllUserTokens = async (usuarioRut, motivo = 'revocacion_masiva') => {
  try {
    // Marcar tokens existentes como revocados
    await pool.execute(
      `UPDATE tokens_blacklist 
       SET motivo = ?, revocado_en = CURRENT_TIMESTAMP 
       WHERE usuario_rut = ?`,
      [motivo, usuarioRut]
    );
    
    await syncFromDatabase();
    
    logger.warn('Tokens de usuario revocados', { usuario_rut: usuarioRut, motivo });
    
  } catch (error) {
    logger.error('Error revocando tokens de usuario:', { error: error.message });
  }
};

// Iniciar limpieza automática cada hora
setInterval(cleanExpiredTokens, 3600000);
