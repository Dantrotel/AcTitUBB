import e from 'express';
import { loginController } from '../controllers/login.controller.js';



const router = e.Router();

router.post('/login', loginController.login);
router.post('/register', loginController.register);

export default router;