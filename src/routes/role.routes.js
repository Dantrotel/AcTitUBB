import {Router} from 'express';
import { roleController } from '../controllers/role.controller.js';
import { verifyHeadcareers, verifySession, verifyStudent } from '../middlewares/verifySession.js';

const routerRole = Router();

routerRole.post('/create', verifySession, verifyHeadcareers, roleController.createRole);
routerRole.put('/update/:nombre', verifySession, verifyHeadcareers, roleController.updateRole);
routerRole.delete('/delete/:nombre', verifySession, verifyHeadcareers, roleController.deleteRole);
routerRole.get('/find/:nombre', verifySession, verifyStudent, roleController.findRoleByName);

export default routerRole;
