import {Router} from 'express';
import { personController } from '../controllers/person.controller.js';

const router = Router();

router.post('/login', personController.login);
router.post('/register', personController.register);

export default router;