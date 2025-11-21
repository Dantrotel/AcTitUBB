import { Router } from 'express';
import {
    crearFechaGlobalController,
    crearFechaEspecificaController,
    obtenerFechasGlobalesController,
    obtenerFechasPorProfesorController,
    obtenerFechasParaEstudianteController,
    obtenerFechasProximasController,
    obtenerFechasProximasEstudianteController,
    obtenerFechaPorIdController,
    actualizarFechaController,
    eliminarFechaController,
    obtenerEstadisticasFechasController
} from '../controllers/calendario.controller.js';
import { verifySession } from '../middlewares/verifySession.js';
import { cacheMiddleware, invalidateOnMutation } from '../config/cache.js';

const router = Router();


// Crear fecha global (solo admin)
router.post('/admin/global', verifySession, invalidateOnMutation('config'), crearFechaGlobalController);

// Obtener todas las fechas globales (admin)
router.get('/admin/globales', verifySession, cacheMiddleware('config'), obtenerFechasGlobalesController);

// Obtener estadísticas de fechas (solo admin)
router.get('/admin/estadisticas', verifySession, obtenerEstadisticasFechasController);

// ===== RUTAS PARA PROFESORES =====

// Crear fecha específica para un estudiante (solo profesores)
router.post('/profesor/especifica', verifySession, crearFechaEspecificaController);

// Obtener fechas creadas por el profesor
router.get('/profesor/mis-fechas', verifySession, obtenerFechasPorProfesorController);

// ===== RUTAS PARA ESTUDIANTES =====

// Obtener fechas visibles para el estudiante (globales + específicas del profesor)
router.get('/estudiante/mis-fechas', verifySession, obtenerFechasParaEstudianteController);

// Obtener fechas próximas para el estudiante
router.get('/estudiante/proximas', verifySession, obtenerFechasProximasEstudianteController);

// ===== RUTAS GENERALES =====

// Obtener fechas globales visibles para todos los usuarios (sin restricción de rol)
router.get('/globales', verifySession, cacheMiddleware('config'), obtenerFechasGlobalesController);

// Obtener fechas próximas visibles para todos los usuarios (sin restricción de rol)
router.get('/proximas', verifySession, cacheMiddleware('config'), obtenerFechasProximasController);

// Obtener fecha por ID (con control de permisos)
router.get('/:id', verifySession, cacheMiddleware('config'), obtenerFechaPorIdController);

// Actualizar fecha (con control de permisos)
router.put('/:id', verifySession, invalidateOnMutation('config'), actualizarFechaController);

// Eliminar fecha (con control de permisos)
router.delete('/:id', verifySession, invalidateOnMutation('config'), eliminarFechaController);

export default router;