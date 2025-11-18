import express from 'express';
import * as PeriodoPropuestasController from '../controllers/periodo-propuestas.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

// Obtener estado del período de propuestas (todos los roles autenticados)
router.get('/estado', PeriodoPropuestasController.obtenerEstadoPeriodo);

// Habilitar período de propuestas (solo admin)
router.put('/habilitar', PeriodoPropuestasController.habilitarPeriodo);

// Deshabilitar período de propuestas (solo admin)
router.put('/deshabilitar', PeriodoPropuestasController.deshabilitarPeriodo);

// Deshabilitar automáticamente períodos vencidos (solo admin)
router.post('/deshabilitar-vencidos', PeriodoPropuestasController.deshabilitarPeriodosVencidos);

export default router;
