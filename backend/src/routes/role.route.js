import e from 'express';
import { roleController } from '../controllers/role.controller.js';
import {  verifySession, checkRole } from '../middlewares/verifySession.js';

const routerRole = e.Router();

routerRole.post('/create', verifySession, checkRole('1','4'), roleController.createRole);
routerRole.put('/update/:nombre', verifySession, checkRole('1','4'), roleController.updateRole);
routerRole.delete('/delete/:nombre', verifySession, checkRole('1','4'), roleController.deleteRole);
routerRole.get('/find/:nombre', verifySession, checkRole('1','4'), roleController.findRoleByName);

export default routerRole;
