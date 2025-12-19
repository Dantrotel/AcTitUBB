import express from 'express';
import * as actividadController from '../controllers/actividad.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

// Obtener usuarios activos en tiempo real (Solo Super Admin)
router.get('/usuarios-activos', actividadController.obtenerUsuariosActivos);

// Obtener actividad reciente (Admin y Super Admin)
router.get('/reciente', actividadController.obtenerActividadReciente);

// Obtener estadísticas de actividad (Admin y Super Admin)
router.get('/estadisticas', actividadController.obtenerEstadisticasActividad);

export default router;
