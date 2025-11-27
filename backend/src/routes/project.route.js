import e from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { checkRole, verifySession } from '../middlewares/verifySession.js';
import { uploadPropuesta } from '../middlewares/uploader.js';
import { validate, crearProyectoSchema } from '../middlewares/validators.js';
import { cacheMiddleware, invalidateOnMutation } from '../config/cache.js';

const routerProject = e.Router();

// ===== RUTAS GENERALES (Con control de permisos automático) =====

// Obtener todos los proyectos (filtrados por permisos del usuario)
routerProject.get('/', verifySession, cacheMiddleware('proyectos'), ProjectController.getProjects);

// Obtener proyecto específico por ID (con verificación de permisos)
routerProject.get('/:projectId', verifySession, cacheMiddleware('proyectos'), ProjectController.getDetailProject);

// Obtener proyecto específico con información completa (fechas importantes y profesores)
routerProject.get('/:projectId/completo', verifySession, cacheMiddleware('proyectos'), ProjectController.getProyectoCompleto);

// Crear nuevo proyecto (solo estudiantes)
routerProject.post('/', verifySession, checkRole('1'), validate(crearProyectoSchema), invalidateOnMutation('proyectos'), ProjectController.createProject);

// Eliminar proyecto (solo administradores)
routerProject.delete('/:projectId', verifySession, checkRole('3'), invalidateOnMutation('proyectos'), ProjectController.deleteProject);

// ===== RUTAS ESPECÍFICAS POR ROL =====

// Obtener proyectos del estudiante autenticado
routerProject.get('/estudiante/mis-proyectos', verifySession, checkRole('1'), cacheMiddleware('proyectos'), ProjectController.getMisProyectos);

// Obtener proyectos asignados al profesor autenticado
routerProject.get('/profesor/proyectos-asignados', verifySession, checkRole('2'), cacheMiddleware('proyectos'), ProjectController.getProyectosAsignados);

// ===== RUTAS DE ADMINISTRADOR =====

// Los administradores pueden usar la ruta general / que les mostrará todo

// ===== RUTAS DE HITOS (⚠️ DEPRECATED - Usar sistema de cronogramas) =====
// NOTA: Estas rutas están DEPRECATED y se mantendrán solo por compatibilidad temporal.
// USAR EN SU LUGAR: /api/projects/cronogramas/:cronogramaId/hitos
// Ver documentación: backend/SISTEMA_HITOS_UNIFICADO.md

// ⚠️ DEPRECATED: Crear hito para un proyecto (usar cronogramas en su lugar)
routerProject.post('/:projectId/hitos', verifySession, ProjectController.crearHitoProyecto);

// ⚠️ DEPRECATED: Obtener hitos de un proyecto (usar cronogramas en su lugar)
routerProject.get('/:projectId/hitos', verifySession, ProjectController.obtenerHitosProyecto);

// ⚠️ DEPRECATED: Actualizar hito específico (usar cronogramas en su lugar)
routerProject.put('/:projectId/hitos/:hitoId', verifySession, ProjectController.actualizarHitoProyecto);

// ⚠️ DEPRECATED: Completar hito (usar /hitos/:hitoId/entregar en su lugar)
routerProject.patch('/:projectId/hitos/:hitoId/completar', verifySession, checkRole('1'), ProjectController.completarHito);

// ===== RUTAS DE DASHBOARD =====

// Obtener dashboard completo del proyecto
routerProject.get('/:projectId/dashboard', verifySession, ProjectController.obtenerDashboardProyecto);

// ===== RUTAS DEL SISTEMA DE CRONOGRAMAS Y ENTREGAS (✅ SISTEMA UNIFICADO) =====
// Este es el sistema principal y unificado para gestión de hitos
// Ver documentación completa: backend/SISTEMA_HITOS_UNIFICADO.md

// Gestión de cronogramas
routerProject.post('/:projectId/cronograma', verifySession, checkRole('2'), ProjectController.crearCronograma);
routerProject.get('/:projectId/cronograma', verifySession, ProjectController.obtenerCronograma);
routerProject.patch('/cronogramas/:cronogramaId/aprobar', verifySession, checkRole('1'), ProjectController.aprobarCronograma);

// ✅ Gestión de hitos del cronograma (MEJORADO con peso, críticos, dependencias)
routerProject.post('/cronogramas/:cronogramaId/hitos', verifySession, checkRole('2'), ProjectController.crearHitoCronograma);
routerProject.get('/cronogramas/:cronogramaId/hitos', verifySession, ProjectController.obtenerHitosCronograma);

// ✅ Entregas y revisiones de hitos (CON emails y notificaciones automáticas)
routerProject.post('/hitos/:hitoId/entregar', verifySession, checkRole('1'), uploadPropuesta, ProjectController.entregarHito);
routerProject.patch('/hitos/:hitoId/revisar', verifySession, checkRole('2'), ProjectController.revisarHito);

// Gestión de notificaciones
routerProject.get('/notificaciones', verifySession, ProjectController.obtenerNotificaciones);
routerProject.patch('/notificaciones/:notificacionId/leer', verifySession, ProjectController.marcarNotificacionLeida);

// Configuración de alertas
routerProject.post('/:projectId/alertas', verifySession, checkRole('2'), ProjectController.configurarAlertas);

// Estadísticas y reportes
routerProject.get('/:projectId/estadisticas', verifySession, ProjectController.obtenerEstadisticasCumplimiento);

export default routerProject;