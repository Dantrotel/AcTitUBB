import { UserModel } from '../models/person.model.js';
import bcrypt from 'bcryptjs';

const register = async (req, res) => {
    try {
        console.log(req.body);
        const  {nombre, email, password} = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({message: "Missing required fields"});
        }

        const user = await UserModel.findPersonByEmail(email);

        if (user) {
            return res.status(409).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSaltSync(10);
        const hash = await bcrypt.hashSync(password, salt);

        const newUser = await UserModel.createPerson(nombre, email, hash);
        console.log('Nombre:', nombre, 'Email:', email, 'Password:', password);



        return res.json({ok: true, message: "new user created", user: newUser});
    } catch (error) {     
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
};

const login = async (req, res) => {
    try {
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server error"});
    }
};

export const personController = {
    register,
    login
};