import jwt from 'jsonwebtoken';
import { isBlacklisted } from './blacklist.js';
import { pool } from '../db/connectionDB.js';
import { logger } from '../config/logger.js';

const verifySession = async (req, res, next) => {
  
  
  
  let token = req.headers.authorization;

  if (!token) {
    logger.warn('No authorization header recibido');
    return res.status(401).json({ message: "Unauthorized" });
  }

  token = token.split(" ")[1];

  // Verificar si el token está en la blacklist (IMPORTANTE: await porque isBlacklisted es async)
  const tokenBlacklisted = await isBlacklisted(token);
  if (tokenBlacklisted) {
    logger.warn('Token en blacklist rechazado');
    return res.status(401).json({ 
      message: "Token revoked. Please login again.",
      code: "TOKEN_REVOKED"
    });
  }
  

  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { rut, rol_id, type } = decoded;
    
    // Verificar que es un access token válido
    if (type !== 'access') {
      return res.status(401).json({ 
        message: "Token inválido. Use un access token válido.",
        code: "INVALID_TOKEN_TYPE"
      });
    }
    
    // Mapear rol_id a nombre de rol
    const roleMap = {
      1: 'estudiante',
      2: 'profesor', 
      3: 'admin',
      4: 'superadmin'
    };
    
    req.rut = rut; 
    req.rol_id = rol_id;
    
    // Obtener información adicional del usuario desde la BD
    let carrera_administrada_id = null;
    let carreras_administradas = [];
    let nombre = 'Usuario';
    
    try {
      // Obtener nombre del usuario
      const [userRows] = await pool.execute(
        'SELECT nombre FROM usuarios WHERE rut = ?',
        [rut]
      );
      
      if (userRows.length > 0) {
        nombre = userRows[0].nombre;
      }
      
      // Si es Admin (rol 3), buscar TODAS las carreras que administra
      if (rol_id === 3) {
        const [carreraRows] = await pool.execute(
          'SELECT carrera_id FROM jefes_carreras WHERE profesor_rut = ? AND activo = TRUE',
          [rut]
        );
        
        if (carreraRows.length > 0) {
          carreras_administradas = carreraRows.map(row => row.carrera_id);
          carrera_administrada_id = carreras_administradas[0]; // Primera carrera por compatibilidad
        }
      }
    } catch (dbError) {
      
      // Continuar sin estos datos, no es crítico
    }
    
    // Crear objeto user para compatibilidad con controladores
    req.user = {
      rut: rut,
      rol_id: rol_id,
      role_id: rol_id, // Mantener ambos por compatibilidad
      rol: roleMap[rol_id] || 'unknown',
      nombre: nombre,
      carrera_administrada_id: carrera_administrada_id, // Primera carrera (retrocompatibilidad)
      carreras_administradas: carreras_administradas // NUEVO: Array con todas las carreras
    };
    
    
    
    next();
  } catch (error) {
    
    
    if (error.name === 'TokenExpiredError') {
      
      return res.status(401).json({ 
        message: "Token expirado. Usa el refresh token para obtener uno nuevo.",
        code: "TOKEN_EXPIRED"
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      
    }
    
    
    return res.status(401).json({ 
      message: "Token inválido",
      code: "INVALID_TOKEN"
    });
  }
};

// Helper para verificar si un rol tiene acceso a otro rol
// Super Admin (4) puede acceder a todo
// Admin (3) puede acceder a rutas de profesores (2) y estudiantes (1)
const puedeAcceder = (rolUsuario, rolRequerido) => {
  // Super Admin puede acceder a todo
  if (rolUsuario === 4) {
    return true;
  }
  
  // Admin puede acceder a rutas de profesores y estudiantes
  if (rolUsuario === 3) {
    return rolRequerido === 1 || rolRequerido === 2 || rolRequerido === 3;
  }
  
  // Usuario normal solo puede acceder a su propio rol
  return rolUsuario === rolRequerido;
};

// Middleware genérico con mensajes personalizados según rol esperado
// Soporta múltiples roles separados por coma: checkRole('3,4') permite Admin o Super Admin
// Super Admin (4) siempre tiene acceso
// Admin (3) puede acceder a rutas de profesores (2) y estudiantes (1)
export const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    
    
    
    
    
    if (!req.rol_id) {
      
      return res.status(403).json({ message: "Sin rol definido" });
    }

    const rolUsuario = Number(req.rol_id);
    
    // Super Admin siempre tiene acceso
    if (rolUsuario === 4) {
      return next();
    }
    
    // Expandir roles que contienen comas (ej: '3,4' → ['3', '4'])
    const rolesExpandidos = rolesPermitidos.flatMap(rol => rol.split(','));

    // Verificar si el rol del usuario está en los permitidos
    const rolStr = String(rolUsuario);
    if (rolesExpandidos.includes(rolStr)) {
      return next();
    }

    for (const rolPermitido of rolesExpandidos) {
      const rolRequerido = Number(rolPermitido);
      if (puedeAcceder(rolUsuario, rolRequerido)) {
        return next();
      }
    }

    let mensaje = "Acceso denegado";
    if (rolesExpandidos.includes('1')) mensaje = "Acceso solo para estudiantes";
    if (rolesExpandidos.includes('2')) mensaje = "Acceso solo para profesores";
    if (rolesExpandidos.includes('3')) mensaje = "Acceso solo para administradores";
    if (rolesExpandidos.includes('4')) mensaje = "Acceso solo para super administrador";

    logger.warn('Acceso denegado por rol insuficiente', { rolUsuario, rolesRequeridos: rolesExpandidos });
    return res.status(403).json({ message: mensaje });
  };
};

export default verifySession;
export { verifySession };
