import express from 'express';
import * as extensionController from '../controllers/extension.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

// Crear solicitud de extensión (estudiante)
router.post('/', extensionController.crearSolicitud);

// Obtener solicitudes por proyecto
router.get('/proyecto/:proyectoId', extensionController.obtenerSolicitudesPorProyecto);

// Obtener todas las solicitudes pendientes (admin)
router.get('/pendientes', extensionController.obtenerSolicitudesPendientes);

// Obtener historial de una solicitud
router.get('/:solicitudId/historial', extensionController.obtenerHistorial);

// Obtener estadísticas (admin)
router.get('/estadisticas/generales', extensionController.obtenerEstadisticas);

// Marcar solicitud en revisión (admin)
router.put('/:solicitudId/revisar', extensionController.marcarEnRevision);

// Aprobar solicitud (admin)
router.put('/:solicitudId/aprobar', extensionController.aprobarSolicitud);

// Rechazar solicitud (admin)
router.put('/:solicitudId/rechazar', extensionController.rechazarSolicitud);

export default router;
