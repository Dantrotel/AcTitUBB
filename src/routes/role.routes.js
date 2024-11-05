import {Router} from 'express';
import { roleController } from '../controllers/role.controller.js';

const routerRole = Router();

routerRole.post('/create', roleController.createRole);
routerRole.put('/update/:nombre', roleController.updateRole);
routerRole.delete('/delete/:nombre', roleController.deleteRole);
routerRole.get('/find/:nombre', roleController.findRoleByName);

export default routerRole;
