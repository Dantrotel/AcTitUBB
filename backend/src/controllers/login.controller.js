import { UserModel } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validarRUT } from '../services/RutVal.service.js';
import { addToken, isBlacklisted } from '../middlewares/blacklist.js'; 
import { sendConfirmationEmail } from '../services/email.service.js';

const register = async (req, res) => {
    try {
        const { rut, nombre, email, password } = req.body;
        console.log("Datos recibidos para registro:", req.body);

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
        console.error(error);
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

        return res.json({
            ok: true,
            message: "User logged in",
            user: user.email,
            rol_id: user.rol_id,
            rut: user.rut,
            nombre: user.nombre,
            token: accessToken,
            refreshToken: refreshToken,
            expiresIn: '4h'
        });

    } catch (error) {
        console.error(error);
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

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
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
    console.error('Error al buscar usuario por RUT:', error);
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
    console.error('Error al renovar token:', error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { rut } = req; // Viene del middleware verifySession
    const { nombre, email, telefono, carrera, matricula } = req.body;
    
    console.log('Actualizando perfil para RUT:', rut);
    console.log('Datos recibidos:', req.body);
    
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
      console.log('Perfil actualizado exitosamente para:', rut);
      res.json({ 
        message: 'Perfil actualizado correctamente',
        datos: datosActualizados 
      });
    } else {
      res.status(404).json({ message: 'No se pudo actualizar el perfil' });
    }
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

export const loginController = {
    register,
    login,
    logout,
    refreshToken,
    findUserByRut,
    actualizarPerfil
};
