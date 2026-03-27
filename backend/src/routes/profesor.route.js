import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { verifySession, checkRole } from '../middlewares/verifySession.js';
import { getMetricasProfesor, getPropuestasRevisadas, getReunionesProfesor } from '../controllers/reportes-profesor.controller.js';

const router = Router();

// ===== RUTAS DE PROFESOR PARA PROYECTOS =====

/**
 * GET /profesor/proyectos
 * Obtener todos los proyectos asignados al profesor autenticado
 */
router.get('/proyectos',
    verifySession,
    checkRole('2'),
    ProjectController.getProyectosAsignados
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

