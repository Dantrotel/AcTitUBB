import jwt from 'jsonwebtoken';
import { isBlacklisted } from './blacklist.js'; // ajusta la ruta según tu proyecto

const verifySession = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  token = token.split(" ")[1];

  // Verificar si el token está en la blacklist
  if (isBlacklisted(token)) {
    return res.status(401).json({ message: "Token revoked. Please login again." });
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
      3: 'admin'
    };
    
    req.rut = rut; 
    req.rol_id = rol_id;
    
    // Crear objeto user para compatibilidad con controladores
    req.user = {
      rut: rut,
      role_id: rol_id,
      rol: roleMap[rol_id] || 'unknown',
      nombre: 'Usuario' // Placeholder, podrías obtener el nombre real de la BD
    };
    
    console.log('🔐 Usuario autenticado:', {
      rut: req.user.rut,
      role_id: req.user.role_id,
      rol: req.user.rol
    });
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Token expirado. Usa el refresh token para obtener uno nuevo.",
        code: "TOKEN_EXPIRED"
      });
    }
    
    console.log('Error de verificación de token:', error.message);
    return res.status(401).json({ 
      message: "Token inválido",
      code: "INVALID_TOKEN"
    });
  }
};

// Middleware genérico con mensajes personalizados según rol esperado
export const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.rol_id) {
      return res.status(403).json({ message: "Sin rol definido" });
    }

    const rolStr = String(req.rol_id);

    if (rolesPermitidos.includes(rolStr)) {
      return next();
    }

    // Mensajes personalizados por rol esperado
    let mensaje = "Acceso denegado";

    if (rolesPermitidos.includes('1')) mensaje = "jota denied";         // Admin
    if (rolesPermitidos.includes('2')) mensaje = "holamundo denied";    // Student
    if (rolesPermitidos.includes('3')) mensaje = "gaga denied";         // Teacher
    if (rolesPermitidos.includes('4')) mensaje = "taili denied";        // Head of career

    return res.status(403).json({ message: mensaje });
  };
};

export default verifySession;
export { verifySession };
