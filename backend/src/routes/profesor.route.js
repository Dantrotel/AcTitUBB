import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { verifySession, checkRole } from '../middlewares/verifySession.js';
import { getMetricasProfesor, getPropuestasRevisadas, getReunionesProfesor } from '../controllers/reportes-profesor.controller.js';

const router = Router();

// ===== RUTAS DE PROFESOR PARA PROYECTOS =====

/**
 * GET /profesor/proyectos/:projectId/fechas-importantes
 * Obtener fechas importantes de un proyecto asignado al profesor
 */
router.get('/proyectos/:projectId/fechas-importantes', 
    verifySession, 
    checkRole('2'), 
    ProjectController.obtenerFechasImportantes
);

/**
 * POST /profesor/proyectos/:projectId/fechas-importantes
 * Crear fecha importante para un proyecto asignado al profesor
 */
router.post('/proyectos/:projectId/fechas-importantes', 
    verifySession, 
    checkRole('2'), 
    ProjectController.crearFechaImportante
);

/**
 * PUT /profesor/proyectos/:projectId/fechas-importantes/:fechaId
 * Actualizar fecha importante de un proyecto asignado al profesor
 */
router.put('/proyectos/:projectId/fechas-importantes/:fechaId', 
    verifySession, 
    checkRole('2'), 
    ProjectController.actualizarFechaImportante
);

/**
 * DELETE /profesor/proyectos/:projectId/fechas-importantes/:fechaId
 * Eliminar fecha importante de un proyecto asignado al profesor
 */
router.delete('/proyectos/:projectId/fechas-importantes/:fechaId', 
    verifySession, 
    checkRole('2'), 
    ProjectController.eliminarFechaImportante
);

// ===== RUTAS DE REPORTES Y MÉTRICAS =====

/**
 * GET /profesor/metricas
 * Obtener métricas completas del profesor
 */
router.get('/metricas', 
    verifySession, 
    checkRole('2'), 
    getMetricasProfesor
);

/**
 * GET /profesor/propuestas-revisadas
 * Obtener propuestas revisadas por el profesor
 */
router.get('/propuestas-revisadas', 
    verifySession, 
    checkRole('2'), 
    getPropuestasRevisadas
);

/**
 * GET /profesor/reuniones
 * Obtener reuniones del profesor
 */
router.get('/reuniones', 
    verifySession, 
    checkRole('2'), 
    getReunionesProfesor
);

export default router;

