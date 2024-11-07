import { UserModel } from '../models/person.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validarRUT } from '../services/RutVal.services.js';

const register = async (req, res) => {
    try {
        console.log(req.body);
        const { rut, nombre, email, password } = req.body;

        if (!rut || !nombre || !email || !password ) {
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
            return res.status(409).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSaltSync(10);
        const hash = await bcrypt.hashSync(password, salt);

        const newUser = await UserModel.createPerson( rut, nombre, email, hash);

        const token = jwt.sign({email: newUser.email, rol_id: newUser.rol_id}, 
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        return res.json({ok: true, message: "User created", user: newUser, token: token});
    } catch (error) {     
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
};

const login = async (req, res) => {
    try {

        const {rut, email, password} = req.body;

      if ((!email && !rut )|| !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let user;
        if (email) {
            user = await UserModel.findPersonByEmail(email);
        } else {
            user = await UserModel.findPersonByRut(rut);
        }

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = jwt.sign({ email: user.email, rol_id: user.rol_id}, 
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        return res.json({ok: true, message: "User logged in", user: user.email, token: token});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
};

export const personController = {
    register,
    login
};