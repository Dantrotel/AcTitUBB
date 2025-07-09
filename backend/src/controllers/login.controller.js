import { UserModel } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validarRUT } from '../services/RutVal.service.js';
import { addToken } from '../middlewares/blacklist.js'; 

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

        const token = jwt.sign(
            { rut: newUser.rut, rol_id: newUser.rol_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(201).json({
            ok: true,
            message: "User created",
            user: newUser.email,
            token: token
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

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        console.log("Usuario que inicia sesión:", user.rut);

        const token = jwt.sign(
            { rut: user.rut, rol_id: user.rol_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.json({
            ok: true,
            message: "User logged in",
            user: user.email,
            rol_id: user.rol_id,
            rut: user.rut,
            nombre: user.nombre,
            token: token
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

export const loginController = {
    register,
    login,
    logout,
};
