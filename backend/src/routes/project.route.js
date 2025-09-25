import e from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { checkRole, verifySession } from '../middlewares/verifySession.js';

const routerProject = e.Router();

// ===== RUTAS GENERALES (Con control de permisos automático) =====

// Obtener todos los proyectos (filtrados por permisos del usuario)
routerProject.get('/projects', verifySession, ProjectController.getProjects);

// Obtener proyecto específico por ID (con verificación de permisos)
routerProject.get('/projects/:projectId', verifySession, ProjectController.getDetailProject);

// Obtener proyecto específico con información completa (fechas importantes y profesores)
routerProject.get('/projects/:projectId/completo', verifySession, ProjectController.getProyectoCompleto);

// Crear nuevo proyecto (solo estudiantes)
routerProject.post('/projects', verifySession, checkRole('1'), ProjectController.createProject);

// Eliminar proyecto (solo administradores)
routerProject.delete('/projects/:projectId', verifySession, checkRole('3'), ProjectController.deleteProject);

// ===== RUTAS ESPECÍFICAS POR ROL =====

// Obtener proyectos del estudiante autenticado
routerProject.get('/estudiante/mis-proyectos', verifySession, checkRole('1'), ProjectController.getMisProyectos);

// Obtener proyectos asignados al profesor autenticado
routerProject.get('/profesor/proyectos-asignados', verifySession, checkRole('2'), ProjectController.getProyectosAsignados);

// ===== RUTAS DE ADMINISTRADOR =====

// Los administradores pueden usar la ruta general /projects que les mostrará todo

export default routerProject;