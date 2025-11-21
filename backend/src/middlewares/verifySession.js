import jwt from 'jsonwebtoken';
import { isBlacklisted } from './blacklist.js'; // ajusta la ruta según tu proyecto

const verifySession = async (req, res, next) => {
  console.log('🔍 verifySession - Método:', req.method, 'URL:', req.url);
  console.log('🔍 verifySession - Headers Authorization:', req.headers.authorization ? 'Presente' : 'Ausente');
  
  let token = req.headers.authorization;

  if (!token) {
    console.log('❌ verifySession - No se encontró token de autorización');
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log('🔍 verifySession - Token completo:', token.substring(0, 30) + '...');
  token = token.split(" ")[1];
  console.log('🔍 verifySession - Token extraído:', token ? token.substring(0, 30) + '...' : 'UNDEFINED');

  // Verificar si el token está en la blacklist (IMPORTANTE: await porque isBlacklisted es async)
  const tokenBlacklisted = await isBlacklisted(token);
  if (tokenBlacklisted) {
    console.log('❌ verifySession - Token en blacklist (revocado)');
    return res.status(401).json({ 
      message: "Token revoked. Please login again.",
      code: "TOKEN_REVOKED"
    });
  }
  console.log('✅ verifySession - Token NO está en blacklist');

  try {
    console.log('🔍 verifySession - Verificando token con JWT...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ verifySession - Token verificado exitosamente:', decoded);
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
    console.error('❌ verifySession - Error al verificar token:', error.name, error.message);
    
    if (error.name === 'TokenExpiredError') {
      console.log('❌ verifySession - Token expirado');
      return res.status(401).json({ 
        message: "Token expirado. Usa el refresh token para obtener uno nuevo.",
        code: "TOKEN_EXPIRED"
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.log('❌ verifySession - Token JWT inválido:', error.message);
    }
    
    console.log('❌ verifySession - Error de verificación de token:', error.message);
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
