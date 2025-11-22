import e from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { loginController } from '../controllers/login.controller.js';
import verifySession from '../middlewares/verifySession.js';
import { validate, loginSchema, registerSchema, actualizarPerfilSchema, cambiarPasswordSchema } from '../middlewares/validators.js';
import { logger } from '../config/logger.js';

const router = e.Router();

router.post('/login', validate(loginSchema), loginController.login);
router.post('/register', validate(registerSchema), loginController.register);
router.post('/refresh-token', loginController.refreshToken);

router.get('/confirm/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await UserModel.findPersonByEmail( email );
    if (!user) {
      logger.warn('Token de confirmación con email no encontrado', { email });
      return res.status(404).json({ message: 'Token inválido o usuario no encontrado' });
    }

    if (user.confirmado) {
      return res.status(400).json({ message: 'Usuario confirmado. ya puedes iniciar sesion' });
    }

    user.confirmado = true;
   await UserModel.confirmarCuentaPorEmail(email);

    logger.info('Cuenta confirmada exitosamente', { email });
    return res.status(200).send('¡Cuenta confirmada correctamente!');
  } catch (error) {
    logger.error('Error en confirmación de cuenta', { error: error.message });
    return res.status(400).send('Token inválido o expirado');
  }
});

// Endpoint público para solicitar reset de contraseña
router.post('/forgot-password', loginController.forgotPassword);

// Endpoint para cambiar contraseña obligatoria (después de reset)
router.put('/cambiar-password-obligatorio', verifySession, loginController.cambiarPasswordObligatorio);

// Endpoint público para solicitar reset de contraseña
router.post('/forgot-password', loginController.forgotPassword);

// Endpoint para cambiar contraseña obligatoria (después de reset)
router.put('/cambiar-password-obligatorio', verifySession, loginController.cambiarPasswordObligatorio);

router.post('/logout', loginController.logout);
router.get('/:rut', loginController.findUserByRut);
router.put('/perfil', verifySession, validate(actualizarPerfilSchema), loginController.actualizarPerfil);
router.put('/cambiar-password', verifySession, validate(cambiarPasswordSchema), loginController.cambiarPasswordPropia);

export default router;
