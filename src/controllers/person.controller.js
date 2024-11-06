import { UserModel } from '../models/person.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
    try {
        console.log(req.body);
        const { rut, nombre, apellido, email, telefono, password } = req.body;

        if (!rut || !nombre || !apellido || !email || !telefono || !password ) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const user = await UserModel.findPersonByEmail(email);

        if (user) {
            return res.status(409).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSaltSync(10);
        const hash = await bcrypt.hashSync(password, salt);

        const newUser = await UserModel.createPerson( rut, nombre, apellido, email, telefono, hash);

        const token = jwt.sign({
            email: newUser.email
            }, 
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

        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({message: "Missing required fields"});
        }

        const user = await UserModel.findPersonByEmail(email);

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = jwt.sign({
            email: user.email
            }, 
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