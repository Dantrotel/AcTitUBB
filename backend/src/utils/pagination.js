// Sprint 2: Helper de paginación universal
import logger from '../config/logger.js';

/**
 * Parsear parámetros de paginación de la query
 */
export const getPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
};

/**
 * Construir respuesta paginada
 */
export const buildPaginatedResponse = (data, total, page, limit, additionalMeta = {}) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      ...additionalMeta
    }
  };
};

/**
 * Middleware de paginación genérico
 * Agrega métodos de paginación al objeto req
 */
export const paginationMiddleware = (req, res, next) => {
  const { page, limit, offset } = getPaginationParams(req);
  
  req.pagination = {
    page,
    limit,
    offset,
    
    /**
     * Método helper para responder con datos paginados
     */
    respond: (data, total, additionalMeta = {}) => {
      const response = buildPaginatedResponse(data, total, page, limit, additionalMeta);
      
      logger.debug('Respuesta paginada', {
        route: req.path,
        page,
        limit,
        total,
        totalPages: response.meta.totalPages
      });
      
      return res.json(response);
    }
  };
  
  next();
};

/**
 * Generar cláusula SQL LIMIT con offset
 */
export const getSQLLimit = (limit, offset) => {
  return `LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
};

/**
 * Generar query de conteo desde query principal
 */
export const getCountQuery = (mainQuery) => {
  // Remover ORDER BY y LIMIT para query de conteo
  const cleanQuery = mainQuery
    .replace(/ORDER BY.*?(?=LIMIT|$)/gi, '')
    .replace(/LIMIT.*$/gi, '');
  
  return `SELECT COUNT(*) as total FROM (${cleanQuery}) as count_subquery`;
};

/**
 * Ejecutar query paginada en MySQL
 */
export const executePaginatedQuery = async (pool, query, params, pagination) => {
  try {
    const { limit, offset } = pagination;
    
    // Query principal con límite
    const paginatedQuery = `${query} ${getSQLLimit(limit, offset)}`;
    const [rows] = await pool.execute(paginatedQuery, params);
    
    // Query de conteo total
    const countQuery = getCountQuery(query);
    const [countResult] = await pool.execute(countQuery, params);
    const total = countResult[0]?.total || 0;
    
    return { rows, total };
    
  } catch (error) {
    logger.error('Error en query paginada:', { 
      error: error.message,
      query: query.substring(0, 100) 
    });
    throw error;
  }
};

/**
 * Validar y sanitizar parámetros de ordenamiento
 */
export const getSortParams = (req, allowedFields = []) => {
  const sortBy = req.query.sortBy;
  const sortOrder = (req.query.sortOrder || 'asc').toLowerCase();
  
  // Validar campo de ordenamiento
  if (sortBy && allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
    logger.warn('Campo de ordenamiento inválido', { 
      sortBy, 
      allowedFields 
    });
    return null;
  }
  
  // Validar dirección
  if (!['asc', 'desc'].includes(sortOrder)) {
    return null;
  }
  
  return sortBy ? { sortBy, sortOrder } : null;
};

/**
 * Construir cláusula ORDER BY segura
 */
export const buildOrderByClause = (sortParams, defaultSort = 'id DESC') => {
  if (!sortParams) {
    return `ORDER BY ${defaultSort}`;
  }
  
  const { sortBy, sortOrder } = sortParams;
  
  // Escapar nombre de campo (prevenir SQL injection)
  const safeField = sortBy.replace(/[^a-zA-Z0-9_]/g, '');
  const safeOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';
  
  return `ORDER BY ${safeField} ${safeOrder}`;
};

/**
 * Middleware combinado: paginación + ordenamiento
 */
export const queryParamsMiddleware = (allowedSortFields = []) => {
  return (req, res, next) => {
    // Agregar paginación
    const { page, limit, offset } = getPaginationParams(req);
    
    // Agregar ordenamiento
    const sortParams = getSortParams(req, allowedSortFields);
    
    req.queryParams = {
      pagination: { page, limit, offset },
      sort: sortParams,
      
      /**
       * Construir query SQL completa con paginación y ordenamiento
       */
      buildQuery: (baseQuery, defaultSort = 'id DESC') => {
        const orderBy = buildOrderByClause(sortParams, defaultSort);
        return `${baseQuery} ${orderBy} ${getSQLLimit(limit, offset)}`;
      },
      
      /**
       * Ejecutar query paginada
       */
      execute: async (pool, query, params = []) => {
        return executePaginatedQuery(pool, query, params, { limit, offset });
      },
      
      /**
       * Responder con datos paginados
       */
      respond: (res, data, total, additionalMeta = {}) => {
        const response = buildPaginatedResponse(data, total, page, limit, additionalMeta);
        return res.json(response);
      }
    };
    
    next();
  };
};

export default {
  getPaginationParams,
  buildPaginatedResponse,
  paginationMiddleware,
  getSQLLimit,
  getCountQuery,
  executePaginatedQuery,
  getSortParams,
  buildOrderByClause,
  queryParamsMiddleware
};
