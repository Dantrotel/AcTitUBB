import { Router } from 'express';
import {
    crearFechaGlobalController,
    crearFechaEspecificaController,
    obtenerFechasGlobalesController,
    obtenerFechasPorProfesorController,
    obtenerFechasParaEstudianteController,
    obtenerFechasProximasController,
    obtenerFechaPorIdController,
    actualizarFechaController,
    eliminarFechaController,
    obtenerEstadisticasFechasController
} from '../controllers/calendario.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = Router();

// ===== RUTAS PARA ADMIN =====

// Crear fecha global (solo admin)
router.post('/admin/global', verifySession, crearFechaGlobalController);

// Obtener todas las fechas globales (admin)
router.get('/admin/globales', verifySession, obtenerFechasGlobalesController);

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
router.get('/estudiante/proximas', verifySession, obtenerFechasProximasController);

// ===== RUTAS GENERALES =====

// Obtener fecha por ID (con control de permisos)
router.get('/:id', verifySession, obtenerFechaPorIdController);

// Actualizar fecha (con control de permisos)
router.put('/:id', verifySession, actualizarFechaController);

// Eliminar fecha (con control de permisos)
router.delete('/:id', verifySession, eliminarFechaController);

export default router;