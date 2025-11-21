import { UserModel } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validarRUT } from '../services/RutVal.service.js';
import { addToken, isBlacklisted } from '../middlewares/blacklist.js'; 
import { sendConfirmationEmail } from '../services/email.service.js';
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

        // Access token con tiempo de vida más razonable (4 horas)
        const accessToken = jwt.sign(
            { rut: user.rut, rol_id: user.rol_id, type: 'access' },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        // Refresh token con tiempo de vida largo (7 días)
        const refreshToken = jwt.sign(
            { rut: user.rut, rol_id: user.rol_id, type: 'refresh' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        logAuth('Login exitoso', { rut: user.rut, rol_id: user.rol_id });
        return res.json({
            ok: true,
            message: "User logged in",
            user: user.email,
            rol_id: user.rol_id,
            rut: user.rut,
            nombre: user.nombre,
            token: accessToken,
            refreshToken: refreshToken,
            expiresIn: '4h',
            debe_cambiar_password: user.debe_cambiar_password || false  // Flag para forzar cambio de contraseña
        });

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

      // Generar nuevo access token
      const newAccessToken = jwt.sign(
        { rut: user.rut, rol_id: user.rol_id, type: 'access' },
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

export const loginController = {
    register,
    login,
    logout,
    refreshToken,
    findUserByRut,
    actualizarPerfil,
    cambiarPasswordPropia
};
