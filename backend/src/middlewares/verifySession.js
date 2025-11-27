import jwt from 'jsonwebtoken';
import { isBlacklisted } from './blacklist.js'; // ajusta la ruta según tu proyecto
import { pool } from '../db/connectionDB.js';

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
      3: 'admin',
      4: 'superadmin'
    };
    
    req.rut = rut; 
    req.rol_id = rol_id;
    
    // Obtener información adicional del usuario desde la BD
    let carrera_administrada_id = null;
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
      
      // Si es Admin (rol 3), buscar la carrera que administra
      if (rol_id === 3) {
        const [carreraRows] = await pool.execute(
          'SELECT id FROM carreras WHERE jefe_carrera_rut = ? LIMIT 1',
          [rut]
        );
        
        if (carreraRows.length > 0) {
          carrera_administrada_id = carreraRows[0].id;
        }
      }
    } catch (dbError) {
      console.error('⚠️  Error al obtener datos adicionales del usuario:', dbError);
      // Continuar sin estos datos, no es crítico
    }
    
    // Crear objeto user para compatibilidad con controladores
    req.user = {
      rut: rut,
      rol_id: rol_id,
      role_id: rol_id, // Mantener ambos por compatibilidad
      rol: roleMap[rol_id] || 'unknown',
      nombre: nombre,
      carrera_administrada_id: carrera_administrada_id
    };
    
    console.log('🔐 Usuario autenticado:', {
      rut: req.user.rut,
      rol_id: req.user.rol_id,
      rol: req.user.rol,
      carrera_administrada_id: req.user.carrera_administrada_id
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
// Soporta múltiples roles separados por coma: checkRole('3,4') permite Admin o Super Admin
export const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.rol_id) {
      return res.status(403).json({ message: "Sin rol definido" });
    }

    const rolStr = String(req.rol_id);
    
    // Expandir roles que contienen comas (ej: '3,4' → ['3', '4'])
    const rolesExpandidos = rolesPermitidos.flatMap(rol => rol.split(','));

    if (rolesExpandidos.includes(rolStr)) {
      return next();
    }

    // Mensajes personalizados por rol esperado
    let mensaje = "Acceso denegado";

    if (rolesExpandidos.includes('1')) mensaje = "Acceso solo para estudiantes";
    if (rolesExpandidos.includes('2')) mensaje = "Acceso solo para profesores";
    if (rolesExpandidos.includes('3')) mensaje = "Acceso solo para administradores";
    if (rolesExpandidos.includes('4')) mensaje = "Acceso solo para super administrador";

    return res.status(403).json({ message: mensaje });
  };
};

export default verifySession;
export { verifySession };
