import e from 'express';
import { roleController } from '../controllers/role.controller.js';
import {  verifySession, checkRole } from '../middlewares/verifySession.js';
import { cacheMiddleware, invalidateOnMutation } from '../config/cache.js';

const routerRole = e.Router();

// ============= RUTAS PARA ROLES BÁSICOS =============
routerRole.post('/create', verifySession, checkRole('3'), invalidateOnMutation('config'), roleController.createRole);
routerRole.put('/update/:nombre', verifySession, checkRole('3'), invalidateOnMutation('config'), roleController.updateRole);
routerRole.delete('/delete/:nombre', verifySession, checkRole('3'), invalidateOnMutation('config'), roleController.deleteRole);
routerRole.get('/find/:nombre', verifySession, checkRole('3'), cacheMiddleware('config'), roleController.findRoleByName);

// ============= RUTAS PARA ROLES DE PROFESORES =============
routerRole.get('/profesores', verifySession, checkRole('3'), cacheMiddleware('usuarios'), roleController.getRolesProfesores);

// ============= RUTAS PARA GESTIÓN DE ASIGNACIONES =============

// Asignar profesor a proyecto con rol específico (solo admin)
routerRole.post('/asignaciones', verifySession, checkRole('3'), invalidateOnMutation('proyectos'), roleController.asignarProfesorAProyecto);

// Desasignar profesor de proyecto (solo admin)
routerRole.delete('/asignaciones/:asignacion_id', verifySession, checkRole('3'), invalidateOnMutation('proyectos'), roleController.desasignarProfesorDeProyecto);

// Obtener asignaciones de un proyecto específico (admin y profesores)
routerRole.get('/asignaciones/proyecto/:proyecto_id', verifySession, cacheMiddleware('proyectos'), roleController.getAsignacionesProyecto);

// Obtener proyectos asignados a un profesor específico (dos rutas para manejar opcional)
routerRole.get('/asignaciones/profesor/:profesor_rut', verifySession, cacheMiddleware('proyectos'), roleController.getProyectosAsignadosProfesor);
routerRole.get('/asignaciones/profesor', verifySession, cacheMiddleware('proyectos'), roleController.getProyectosAsignadosProfesor);

// Obtener estadísticas de asignaciones (solo admin)
routerRole.get('/asignaciones/estadisticas', verifySession, checkRole('3'), roleController.getEstadisticasAsignaciones);

// Obtener historial de asignaciones (solo admin)
routerRole.get('/asignaciones/historial', verifySession, checkRole('3'), roleController.getHistorialAsignaciones);

export default routerRole;
