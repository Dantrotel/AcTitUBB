// Rutas para configuración del sistema
import { Router } from 'express';
import { verifySession } from '../middlewares/verifySession.js';
import * as ConfigController from '../controllers/configuracion.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

/**
 * GET /api/v1/configuracion
 * Obtener todas las configuraciones del sistema
 * Acceso: Admin (rol 3) y Super Admin (rol 4)
 */
router.get('/', ConfigController.obtenerConfiguraciones);

/**
 * PUT /api/v1/configuracion/:clave
 * Actualizar una configuración específica
 * Acceso: Solo Super Admin (rol 4)
 */
router.put('/:clave', ConfigController.actualizarConfiguracion);

/**
 * GET /api/v1/configuracion/estadisticas/globales
 * Obtener estadísticas globales del sistema
 * Acceso: Solo Super Admin (rol 4)
 */
router.get('/estadisticas/globales', ConfigController.obtenerEstadisticasGlobales);

export default router;
