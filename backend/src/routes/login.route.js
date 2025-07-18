import e from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { loginController } from '../controllers/login.controller.js';

const router = e.Router();

router.post('/login', loginController.login);
router.post('/register', loginController.register);

router.get('/confirm/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await UserModel.findOne({ email });
    if (!user) {
      // Opcional: devolver mensaje genérico para no revelar existencia del usuario
      return res.status(404).json({ message: 'Token inválido o usuario no encontrado' });
    }

    if (user.verificado) {
      return res.status(400).json({ message: 'Usuario ya confirmado' });
    }

    user.verificado = true;
    await user.save();

    return res.status(200).send('¡Cuenta confirmada correctamente!');
  } catch (error) {
    console.error(error);
    return res.status(400).send('Token inválido o expirado');
  }
});

export default router;
