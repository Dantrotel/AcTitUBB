import { Router } from 'express';
import * as documentoController from '../controllers/documento.controller.js';
import { uploadDocumento } from '../middlewares/uploader.js';
import { verifySession, checkRole } from '../middlewares/verifySession.js';

const router = Router();

// Todas las rutas requieren sesión activa
router.use(verifySession);

// ESTUDIANTE (1): Subir documentos a su proyecto
router.post('/:proyectoId', checkRole('1', '2', '3'), uploadDocumento, documentoController.subirDocumento);

// TODOS: Obtener documentos de un proyecto (filtrado por permisos en controlador)
router.get('/proyecto/:proyectoId', checkRole('1', '2', '3'), documentoController.obtenerDocumentosProyecto);

// TODOS: Obtener un documento específico
router.get('/:documentoId', checkRole('1', '2', '3'), documentoController.obtenerDocumento);

// TODOS: Descargar un documento
router.get('/:documentoId/download', checkRole('1', '2', '3'), documentoController.descargarDocumento);

// PROFESOR (2) y ADMIN (3): Actualizar estado de documentos
router.put('/:documentoId/estado', checkRole('2', '3'), documentoController.actualizarEstadoDocumento);

// ESTUDIANTE (1): Eliminar sus propios documentos en borrador
// ADMIN (3): Eliminar cualquier documento
router.delete('/:documentoId', checkRole('1', '3'), documentoController.eliminarDocumento);

// TODOS: Obtener versiones de un tipo de documento específico
router.get('/proyecto/:proyectoId/versiones/:tipoDocumento', checkRole('1', '2', '3'), documentoController.obtenerVersionesDocumento);

export default router;
