import express from 'express';
import chatController from '../controllers/chat.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

// Obtener conversaciones del usuario
router.get('/conversaciones', chatController.obtenerConversaciones);

// Obtener o crear conversación con otro usuario
router.get('/conversaciones/:otro_usuario_rut', chatController.obtenerOCrearConversacion);

// Obtener mensajes de una conversación
router.get('/conversaciones/:conversacion_id/mensajes', chatController.obtenerMensajes);

// Enviar mensaje
router.post('/conversaciones/:conversacion_id/mensajes', chatController.enviarMensaje);

// Marcar mensajes como leídos
router.put('/conversaciones/:conversacion_id/marcar-leidos', chatController.marcarComoLeidos);

// Obtener total de mensajes no leídos
router.get('/no-leidos', chatController.obtenerTotalNoLeidos);

// Buscar usuarios para iniciar chat
router.get('/usuarios/buscar', chatController.buscarUsuarios);

export default router;
