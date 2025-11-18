import express from 'express';
import * as reunionesController from '../controllers/reuniones.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

// ===== RUTAS DE REUNIONES =====

// Obtener reuniones del usuario
router.get('/', reunionesController.obtenerReuniones);

// Responder a solicitud de reunión
router.put('/solicitud/:solicitudId/responder', reunionesController.responderSolicitud);

// Actualizar estado de reunión
router.put('/:reunionId/estado', reunionesController.actualizarEstado);

// ===== RUTAS DE ACTAS =====

// Crear acta de reunión
router.post('/actas', reunionesController.crearActa);

// Obtener acta por ID
router.get('/actas/:actaId', reunionesController.obtenerActa);

// Obtener actas por proyecto
router.get('/actas/proyecto/:proyectoId', reunionesController.obtenerActasPorProyecto);

// Obtener acta por reunión
router.get('/actas/reunion/:reunionId', reunionesController.obtenerActaPorReunion);

// Actualizar acta
router.put('/actas/:actaId', reunionesController.actualizarActa);

// Publicar acta (cambiar de borrador a pendiente_firma)
router.put('/actas/:actaId/publicar', reunionesController.publicarActa);

// Firmar acta
router.put('/actas/:actaId/firmar', reunionesController.firmarActa);

// Archivar acta
router.put('/actas/:actaId/archivar', reunionesController.archivarActa);

export default router;
