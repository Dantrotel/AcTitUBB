import e from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { checkRole, verifySession } from '../middlewares/verifySession.js';
import { uploadPropuesta } from '../middlewares/uploader.js';

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

// ===== RUTAS DE HITOS =====

// Crear hito para un proyecto
routerProject.post('/projects/:projectId/hitos', verifySession, ProjectController.crearHitoProyecto);

// Obtener hitos de un proyecto
routerProject.get('/projects/:projectId/hitos', verifySession, ProjectController.obtenerHitosProyecto);

// Actualizar hito específico
routerProject.put('/projects/:projectId/hitos/:hitoId', verifySession, ProjectController.actualizarHitoProyecto);

// Completar hito (solo estudiantes)
routerProject.patch('/projects/:projectId/hitos/:hitoId/completar', verifySession, checkRole('1'), ProjectController.completarHito);

// ===== RUTAS DE EVALUACIONES =====

// Crear evaluación para un proyecto (solo profesores)
routerProject.post('/projects/:projectId/evaluaciones', verifySession, checkRole('2'), ProjectController.crearEvaluacionProyecto);

// Obtener evaluaciones de un proyecto
routerProject.get('/projects/:projectId/evaluaciones', verifySession, ProjectController.obtenerEvaluacionesProyecto);

// ===== RUTAS DE DASHBOARD =====

// Obtener dashboard completo del proyecto
routerProject.get('/projects/:projectId/dashboard', verifySession, ProjectController.obtenerDashboardProyecto);

// ===== RUTAS DEL SISTEMA DE CRONOGRAMAS Y ENTREGAS =====

// Gestión de cronogramas
routerProject.post('/projects/:projectId/cronograma', verifySession, checkRole('2'), ProjectController.crearCronograma);
routerProject.get('/projects/:projectId/cronograma', verifySession, ProjectController.obtenerCronograma);
routerProject.patch('/cronogramas/:cronogramaId/aprobar', verifySession, checkRole('1'), ProjectController.aprobarCronograma);

// Gestión de hitos del cronograma
routerProject.post('/cronogramas/:cronogramaId/hitos', verifySession, checkRole('2'), ProjectController.crearHitoCronograma);
routerProject.get('/cronogramas/:cronogramaId/hitos', verifySession, ProjectController.obtenerHitosCronograma);

// Entregas y revisiones de hitos
routerProject.post('/hitos/:hitoId/entregar', verifySession, checkRole('1'), uploadPropuesta, ProjectController.entregarHito);
routerProject.patch('/hitos/:hitoId/revisar', verifySession, checkRole('2'), ProjectController.revisarHito);

// Gestión de notificaciones
routerProject.get('/notificaciones', verifySession, ProjectController.obtenerNotificaciones);
routerProject.patch('/notificaciones/:notificacionId/leer', verifySession, ProjectController.marcarNotificacionLeida);

// Configuración de alertas
routerProject.post('/projects/:projectId/alertas', verifySession, checkRole('2'), ProjectController.configurarAlertas);

// Estadísticas y reportes
routerProject.get('/projects/:projectId/estadisticas', verifySession, ProjectController.obtenerEstadisticasCumplimiento);

export default routerProject;