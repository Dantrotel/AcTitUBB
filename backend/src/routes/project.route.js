import e from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { checkRole, verifySession } from '../middlewares/verifySession.js';

const routerProject = e.Router();

routerProject.post('/projects', verifySession, ProjectController.createProject);
routerProject.get('/get', verifySession, checkRole('2'), ProjectController.getProjects);
routerProject.get('/:projectId', verifySession, checkRole('2','3'), ProjectController.getDetailProject);
routerProject.delete('/:projectId', verifySession, checkRole('2','3'), ProjectController.deleteProject);

export default routerProject;