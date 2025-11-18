import express from 'express';
import * as FechasLimiteController from '../controllers/fechas-limite.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(verifySession);

// Verificar si puede subir archivos para una fecha importante
router.get(
    '/verificar-permiso/:fechaImportanteId',
    FechasLimiteController.verificarPermisoSubida
);

// Verificar si puede solicitar extensión
router.get(
    '/verificar-extension/:fechaImportanteId/:proyectoId',
    FechasLimiteController.verificarPermisoExtension
);

// Obtener estado de todas las fechas de un proyecto
router.get(
    '/proyecto/:proyectoId',
    FechasLimiteController.obtenerEstadoFechasProyecto
);

// Marcar fecha como completada
router.put(
    '/completar/:fechaImportanteId',
    FechasLimiteController.marcarFechaCompletada
);

// Verificar si puede crear/actualizar propuesta
router.get(
    '/verificar-propuesta',
    FechasLimiteController.verificarPermisoCrearPropuesta
);

export default router;
