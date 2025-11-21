// Sprint 2: Sistema de caché con node-cache
import NodeCache from 'node-cache';
import logger from '../config/logger.js';

// Configuración de cachés por categoría
const caches = {
  // Caché para datos de usuarios (TTL: 5 minutos)
  usuarios: new NodeCache({ 
    stdTTL: 300,
    checkperiod: 60,
    useClones: false
  }),
  
  // Caché para roles y configuraciones (TTL: 15 minutos)
  config: new NodeCache({ 
    stdTTL: 900,
    checkperiod: 120,
    useClones: false
  }),
  
  // Caché para proyectos (TTL: 2 minutos)
  proyectos: new NodeCache({ 
    stdTTL: 120,
    checkperiod: 30,
    useClones: false
  }),
  
  // Caché para propuestas (TTL: 2 minutos)
  propuestas: new NodeCache({ 
    stdTTL: 120,
    checkperiod: 30,
    useClones: false
  }),
  
  // Caché para disponibilidades (TTL: 1 minuto)
  disponibilidades: new NodeCache({ 
    stdTTL: 60,
    checkperiod: 20,
    useClones: false
  })
};

/**
 * Obtener valor del caché
 */
export const get = (categoria, key) => {
  try {
    const cache = caches[categoria];
    if (!cache) {
      logger.warn(`Categoría de caché no existe: ${categoria}`);
      return null;
    }
    
    const value = cache.get(key);
    
    if (value !== undefined) {
      logger.debug(`Cache HIT: ${categoria}:${key}`);
      return value;
    }
    
    logger.debug(`Cache MISS: ${categoria}:${key}`);
    return null;
    
  } catch (error) {
    logger.error('Error obteniendo del caché:', { error: error.message, categoria, key });
    return null;
  }
};

/**
 * Establecer valor en caché
 */
export const set = (categoria, key, value, ttl = null) => {
  try {
    const cache = caches[categoria];
    if (!cache) {
      logger.warn(`Categoría de caché no existe: ${categoria}`);
      return false;
    }
    
    const success = ttl 
      ? cache.set(key, value, ttl)
      : cache.set(key, value);
    
    if (success) {
      logger.debug(`Cache SET: ${categoria}:${key}`);
    }
    
    return success;
    
  } catch (error) {
    logger.error('Error guardando en caché:', { error: error.message, categoria, key });
    return false;
  }
};

/**
 * Eliminar valor del caché
 */
export const del = (categoria, key) => {
  try {
    const cache = caches[categoria];
    if (!cache) return 0;
    
    const count = cache.del(key);
    
    if (count > 0) {
      logger.debug(`Cache DEL: ${categoria}:${key}`);
    }
    
    return count;
    
  } catch (error) {
    logger.error('Error eliminando del caché:', { error: error.message, categoria, key });
    return 0;
  }
};

/**
 * Limpiar todos los valores de una categoría
 */
export const flush = (categoria) => {
  try {
    const cache = caches[categoria];
    if (!cache) return;
    
    cache.flushAll();
    logger.info(`Cache flushed: ${categoria}`);
    
  } catch (error) {
    logger.error('Error limpiando caché:', { error: error.message, categoria });
  }
};

/**
 * Limpiar todas las categorías
 */
export const flushAll = () => {
  try {
    Object.keys(caches).forEach(categoria => {
      caches[categoria].flushAll();
    });
    
    logger.info('Todos los cachés limpiados');
    
  } catch (error) {
    logger.error('Error limpiando todos los cachés:', { error: error.message });
  }
};

/**
 * Obtener estadísticas del caché
 */
export const getStats = (categoria = null) => {
  try {
    if (categoria) {
      const cache = caches[categoria];
      return cache ? cache.getStats() : null;
    }
    
    // Retornar stats de todas las categorías
    const stats = {};
    Object.keys(caches).forEach(cat => {
      stats[cat] = caches[cat].getStats();
    });
    
    return stats;
    
  } catch (error) {
    logger.error('Error obteniendo stats de caché:', { error: error.message });
    return null;
  }
};

/**
 * Middleware para caché automático de respuestas GET
 */
export const cacheMiddleware = (categoria, getTTL = null) => {
  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Generar key basada en URL y query params
    const key = `${req.path}:${JSON.stringify(req.query)}`;
    
    // Intentar obtener del caché
    const cachedResponse = get(categoria, key);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    // Interceptar res.json para guardar en caché
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      // Guardar en caché solo si es respuesta exitosa
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ttl = typeof getTTL === 'function' ? getTTL(req) : getTTL;
        set(categoria, key, data, ttl);
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Invalidar caché cuando hay modificaciones
 */
export const invalidateOnMutation = (categoria) => {
  return (req, res, next) => {
    // Solo para operaciones de modificación
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      // Guardar referencia al método json original
      const originalJson = res.json.bind(res);
      
      res.json = (data) => {
        // Invalidar caché solo si fue exitoso
        if (res.statusCode >= 200 && res.statusCode < 300) {
          flush(categoria);
          logger.info(`Cache invalidado por mutación: ${categoria}`, {
            method: req.method,
            path: req.path
          });
        }
        
        return originalJson(data);
      };
    }
    
    next();
  };
};

// Logging de estadísticas cada 10 minutos
setInterval(() => {
  const stats = getStats();
  logger.info('Estadísticas de caché', { stats });
}, 600000);

export default {
  get,
  set,
  del,
  flush,
  flushAll,
  getStats,
  cacheMiddleware,
  invalidateOnMutation
};
