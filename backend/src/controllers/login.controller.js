import { UserModel } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validarRUT } from '../services/RutVal.service.js';
import { addToken, isBlacklisted } from '../middlewares/blacklist.js'; 
import { sendConfirmationEmail, sendPasswordResetEmail } from '../services/email.service.js';
import { logger, logAuth } from '../config/logger.js';

const register = async (req, res) => {
    try {
        const { rut, nombre, email, password } = req.body;
        logAuth('Datos recibidos para registro', { rut, nombre, email });

        if (!rut || !nombre || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!email.endsWith('@alumnos.ubiobio.cl') && !email.endsWith('@ubiobio.cl')) {
            return res.status(400).json({ message: "Invalid email" });
        }

        if (!validarRUT(rut)) {
            return res.status(400).json({ message: "Invalid RUT" });
        }

        const user = await UserModel.findPersonByEmail(email);
        if (user) {
            return res.status(409).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = await UserModel.createPerson(rut, nombre, email, hash);

        const confirmToken = jwt.sign(
            { email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        await sendConfirmationEmail(newUser.email, confirmToken);


        return res.status(201).json({
            ok: true,
            message: "User created, please confirm your email",
            user: newUser.email
        });

    } catch (error) {
        logger.error('Error en registro de usuario', { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error", error });
    }
};


const login = async (req, res) => {
    try {
        const { rut, email, password } = req.body;

        if ((!email && !rut) || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let user;
        if (email) {
            user = await UserModel.findPersonByEmail(email);
        } 
        if (rut) {
            user = await UserModel.findPersonByRut(rut);
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.confirmado) {
            return res.status(401).json({ message: "Debes confirmar tu correo para iniciar sesión" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Si el usuario es admin/jefe de carrera (rol 3), obtener su carrera asignada
        let carreraInfo = null;
        if (user.rol_id === 3) {
            const { obtenerCarreraPorJefeRut } = await import('../models/carrera.model.js');
            carreraInfo = await obtenerCarreraPorJefeRut(user.rut);
        }

        // Access token con tiempo de vida más razonable (4 horas)
        const tokenPayload = { 
            rut: user.rut, 
            rol_id: user.rol_id, 
            type: 'access'
        };
        
        // Agregar carrera_id si es jefe de carrera
        if (carreraInfo) {
            tokenPayload.carrera_id = carreraInfo.id;
            tokenPayload.es_jefe_carrera = true;
        }
        
        const accessToken = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        // Refresh token con tiempo de vida largo (7 días)
        const refreshTokenPayload = { 
            rut: user.rut, 
            rol_id: user.rol_id, 
            type: 'refresh'
        };
        
        if (carreraInfo) {
            refreshTokenPayload.carrera_id = carreraInfo.id;
            refreshTokenPayload.es_jefe_carrera = true;
        }
        
        const refreshToken = jwt.sign(
            refreshTokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        logAuth('Login exitoso', { rut: user.rut, rol_id: user.rol_id, debe_cambiar_password: user.debe_cambiar_password, carrera_id: carreraInfo?.id });
        
        const responseData = {
            ok: true,
            message: "User logged in",
            user: user.email,
            rol_id: user.rol_id,
            rut: user.rut,
            nombre: user.nombre,
            token: accessToken,
            refreshToken: refreshToken,
            expiresIn: '4h',
            debe_cambiar_password: user.debe_cambiar_password || false
        };
        
        // Agregar info de carrera si es jefe de carrera
        if (carreraInfo) {
            responseData.carrera_id = carreraInfo.id;
            responseData.carrera_nombre = carreraInfo.nombre;
            responseData.es_jefe_carrera = true;
        }
        
        return res.json(responseData);

    } catch (error) {
        logger.error('Error en login', { error: error.message, stack: error.stack });
        return res.status(500).json({ message: "Internal server error", error });
    }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    addToken(token); // agrega token a la blacklist
    logAuth('Logout exitoso', { token_length: token.length });

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    logger.error('Error en logout', { error: error.message });
    return res.status(500).json({ message: "Internal server error", error });
  }
};

const findUserByRut = async (req, res) => {
  try {
    const { rut } = req.params;
    if (!rut) {
      return res.status(400).json({ message: 'Falta el RUT' });
    }

    const user = await UserModel.findPersonByRut(rut);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Ojo: no devolver contraseña ni datos sensibles
    delete user.password;

    return res.json(user);
  } catch (error) {
    logger.error('Error al buscar usuario por RUT', { rut: req.params.rut, error: error.message });
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token requerido" });
    }

    // Verificar si el refresh token está en la blacklist
    if (isBlacklisted(refreshToken)) {
      return res.status(401).json({ message: "Refresh token revocado" });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Verificar que es un refresh token
      if (decoded.type !== 'refresh') {
        return res.status(401).json({ message: "Token inválido" });
      }
      
      // Verificar que el usuario aún existe
      const user = await UserModel.findPersonByRut(decoded.rut);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Si el usuario es admin/jefe de carrera (rol 3), obtener su carrera asignada
      let carreraInfo = null;
      if (user.rol_id === 3) {
        const { obtenerCarreraPorJefeRut } = await import('../models/carrera.model.js');
        carreraInfo = await obtenerCarreraPorJefeRut(user.rut);
      }

      // Generar nuevo access token con carrera_id si aplica
      const tokenPayload = { 
        rut: user.rut, 
        rol_id: user.rol_id, 
        type: 'access'
      };
      
      if (carreraInfo) {
        tokenPayload.carrera_id = carreraInfo.id;
        tokenPayload.es_jefe_carrera = true;
      }
      
      const newAccessToken = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: '4h' }
      );

      return res.json({
        ok: true,
        message: "Token renovado exitosamente",
        token: newAccessToken,
        expiresIn: '4h'
      });

    } catch (tokenError) {
      return res.status(401).json({ message: "Refresh token inválido o expirado" });
    }

  } catch (error) {
    logger.error('Error al renovar token', { error: error.message });
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { rut } = req; // Viene del middleware verifySession
    const { nombre, email, telefono, carrera, matricula } = req.body;
    
    logger.info('Actualizando perfil', { rut, campos: Object.keys(req.body) });
    
    // Validar que el usuario existe
    const user = await UserModel.findPersonByRut(rut);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Actualizar solo los campos permitidos
    const datosActualizados = {};
    if (nombre) datosActualizados.nombre = nombre;
    if (email) datosActualizados.email = email;
    if (telefono) datosActualizados.telefono = telefono;
    if (carrera) datosActualizados.carrera = carrera;
    if (matricula) datosActualizados.matricula = matricula;
    
    const actualizado = await UserModel.actualizarUsuario(rut, datosActualizados);
    
    if (actualizado) {
      logger.info('Perfil actualizado exitosamente', { rut });
      res.json({ 
        message: 'Perfil actualizado correctamente',
        datos: datosActualizados 
      });
    } else {
      res.status(404).json({ message: 'No se pudo actualizar el perfil' });
    }
  } catch (error) {
    logger.error('Error al actualizar perfil', { rut: req.rut, error: error.message });
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

const cambiarPasswordPropia = async (req, res) => {
  try {
    const { rut } = req; // Viene del middleware verifySession
    const { password_actual, password_nueva } = req.body;
    
    logger.info('Solicitud de cambio de contraseña', { rut });
    
    if (!password_actual || !password_nueva) {
      return res.status(400).json({ message: 'Se requieren la contraseña actual y la nueva' });
    }
    
    // Validar que la contraseña nueva tenga al menos 6 caracteres
    if (password_nueva.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Obtener usuario
    const user = await UserModel.findPersonByRut(rut);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar contraseña actual
    const match = await bcrypt.compare(password_actual, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }
    
    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password_nueva, salt);
    
    // Actualizar contraseña
    const actualizado = await UserModel.cambiarPasswordPropia(rut, hashedPassword);
    
    if (actualizado) {
      logAuth('Contraseña actualizada exitosamente', { rut });
      res.json({ 
        message: 'Contraseña actualizada correctamente' 
      });
    } else {
      res.status(500).json({ message: 'No se pudo actualizar la contraseña' });
    }
  } catch (error) {
    logger.error('Error al cambiar contraseña', { rut: req.rut, error: error.message });
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Endpoint público para solicitar reset de contraseña
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    logAuth('Solicitud de reset de contraseña', { email });
    
    if (!email) {
      return res.status(400).json({ message: 'El email es requerido' })
;
    }
    
    // Buscar usuario por email
    const user = await UserModel.findUserBasicByEmail(email);
    if (!user) {
      // Por seguridad, no revelamos si el usuario existe o no
      return res.json({ 
        message: 'Si el email existe en el sistema, recibirás un correo con instrucciones' 
      });
    }
    
    if (!user.confirmado) {
      return res.status(400).json({ 
        message: 'Tu cuenta aún no está confirmada. Por favor confirma tu email primero' 
      });
    }
    
    // Generar contraseña temporal aleatoria (8 caracteres)
    const passwordTemporal = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    
    // Hashear la contraseña temporal
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordTemporal, salt);
    
    // Actualizar en DB y marcar debe_cambiar_password = TRUE
    const actualizado = await UserModel.resetearPassword(user.rut, hashedPassword);
    
    if (actualizado) {
      // Enviar email con contraseña temporal
      try {
        await sendPasswordResetEmail(user.email, user.nombre, passwordTemporal, user.rut);
        logAuth('Contraseña temporal generada y email enviado', { rut: user.rut });
      } catch (emailError) {
        logger.error('Error al enviar email de reset', { error: emailError.message });
        return res.status(500).json({ message: 'Error al enviar el correo electrónico' });
      }
      
      res.json({ 
        message: 'Se ha enviado un correo con tu contraseña temporal' 
      });
    } else {
      res.status(500).json({ message: 'Error al resetear la contraseña' });
    }
  } catch (error) {
    logger.error('Error en forgot password', { error: error.message });
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// Cambiar contraseña obligatoria (después de login con contraseña temporal)
const cambiarPasswordObligatorio = async (req, res) => {
  try {
    const { rut } = req; // Viene del middleware verifySession
    const { password_nueva } = req.body;
    
    logAuth('Cambio de contraseña obligatoria', { rut });
    
    if (!password_nueva) {
      return res.status(400).json({ message: 'La nueva contraseña es requerida' });
    }
    
    // Validar que la contraseña nueva tenga al menos 6 caracteres
    if (password_nueva.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Obtener usuario
    const user = await UserModel.findPersonByRut(rut);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Verificar que el usuario tenga debe_cambiar_password = true
    if (!user.debe_cambiar_password) {
      return res.status(400).json({ message: 'No es necesario cambiar la contraseña' });
    }
    
    // Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password_nueva, salt);
    
    // Actualizar contraseña y poner debe_cambiar_password = FALSE
    const actualizado = await UserModel.cambiarPasswordPropia(rut, hashedPassword);
    
    if (actualizado) {
      logAuth('Contraseña actualizada exitosamente (cambio obligatorio)', { rut });
      res.json({ 
        message: 'Contraseña actualizada correctamente. Ahora puedes iniciar sesión con tu nueva contraseña' 
      });
    } else {
      res.status(500).json({ message: 'No se pudo actualizar la contraseña' });
    }
  } catch (error) {
    logger.error('Error al cambiar contraseña obligatoria', { rut: req.rut, error: error.message });
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

export const loginController = {
    register,
    login,
    logout,
    refreshToken,
    findUserByRut,
    actualizarPerfil,
    cambiarPasswordPropia,
    forgotPassword,
    cambiarPasswordObligatorio
};
