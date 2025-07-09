import jwt from 'jsonwebtoken';
import { isBlacklisted } from './blacklist.js'; // ajusta la ruta según tu proyecto

export const verifySession = async (req, res, next) => {
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
    const { rut, rol_id } = jwt.verify(token, process.env.JWT_SECRET);
    req.rut = rut; 
    req.rol_id = rol_id;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized" });
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
