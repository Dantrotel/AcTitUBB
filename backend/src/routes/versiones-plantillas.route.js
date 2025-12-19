// Rutas de Versiones de Documentos y Plantillas
import { Router } from 'express';
import versionesController from '../controllers/versiones-plantillas.controller.js';
import { verifySession } from '../middlewares/verifySession.js';
import { upload } from '../middlewares/uploader.js';

const router = Router();

// ========== VERSIONES DE DOCUMENTOS ==========

/**
 * Subir nueva versión de documento
 * POST /api/v1/versiones
 * Roles: estudiante, profesor_guia, profesor_informante
 */
router.post(
  '/',
  verifySession,
  upload.single('archivo'),
  versionesController.subirVersion
);

/**
 * Obtener versiones de un avance
 * GET /api/v1/versiones/avance/:avance_id
 */
router.get(
  '/avance/:avance_id',
  verifySession,
  versionesController.obtenerVersionesAvance
);

/**
 * Obtener versiones de un proyecto (con filtros opcionales)
 * GET /api/v1/versiones/proyecto/:proyecto_id?tipo_version=estudiante&estado=enviado
 */
router.get(
  '/proyecto/:proyecto_id',
  verifySession,
  versionesController.obtenerVersionesProyecto
);

/**
 * Obtener detalles de una versión específica
 * GET /api/v1/versiones/:version_id
 */
router.get(
  '/:version_id',
  verifySession,
  versionesController.obtenerVersion
);

/**
 * Descargar archivo de una versión
 * GET /api/v1/versiones/:version_id/descargar
 */
router.get(
  '/:version_id/descargar',
  verifySession,
  versionesController.descargarVersion
);

/**
 * Actualizar estado de una versión
 * PUT /api/v1/versiones/:version_id/estado
 * Roles: profesor_guia, profesor_informante, admin
 */
router.put(
  '/:version_id/estado',
  verifySession,
  versionesController.actualizarEstadoVersion
);

/**
 * Marcar versión como final
 * PUT /api/v1/versiones/:version_id/marcar-final
 * Roles: profesor_guia, admin
 */
router.put(
  '/:version_id/marcar-final',
  verifySession,
  versionesController.marcarVersionFinal
);

// ========== COMENTARIOS DE VERSIONES ==========

/**
 * Crear comentario en una versión
 * POST /api/v1/versiones/:version_id/comentarios
 */
router.post(
  '/:version_id/comentarios',
  verifySession,
  versionesController.crearComentario
);

/**
 * Obtener comentarios de una versión
 * GET /api/v1/versiones/:version_id/comentarios
 */
router.get(
  '/:version_id/comentarios',
  verifySession,
  versionesController.obtenerComentarios
);

/**
 * Marcar comentario como resuelto
 * PUT /api/v1/versiones/comentarios/:comentario_id/resolver
 */
router.put(
  '/comentarios/:comentario_id/resolver',
  verifySession,
  versionesController.resolverComentario
);

// ========== PLANTILLAS ==========

/**
 * Subir plantilla de documento
 * POST /api/v1/plantillas
 * Rol: admin
 */
router.post(
  '/plantillas',
  verifySession,
  upload.single('archivo'),
  versionesController.subirPlantilla
);

/**
 * Obtener plantillas disponibles (con filtros opcionales)
 * GET /api/v1/plantillas?tipo_documento=informe_final&carrera_id=1&obligatoria=true
 */
router.get(
  '/plantillas',
  verifySession,
  versionesController.obtenerPlantillas
);

/**
 * Descargar plantilla
 * GET /api/v1/plantillas/:plantilla_id/descargar
 */
router.get(
  '/plantillas/:plantilla_id/descargar',
  verifySession,
  versionesController.descargarPlantilla
);

/**
 * Actualizar plantilla
 * PUT /api/v1/plantillas/:plantilla_id
 * Rol: admin
 */
router.put(
  '/plantillas/:plantilla_id',
  verifySession,
  upload.single('archivo'),
  versionesController.actualizarPlantilla
);

/**
 * Desactivar plantilla
 * DELETE /api/v1/plantillas/:plantilla_id
 * Rol: admin
 */
router.delete(
  '/plantillas/:plantilla_id',
  verifySession,
  versionesController.desactivarPlantilla
);

// ========== RESULTADOS FINALES ==========

/**
 * Crear resultado final de proyecto
 * POST /api/v1/proyectos/:proyecto_id/resultado-final
 * Roles: profesor_guia, admin
 */
router.post(
  '/proyectos/:proyecto_id/resultado-final',
  verifySession,
  versionesController.crearResultadoFinal
);

/**
 * Obtener resultado final de proyecto
 * GET /api/v1/proyectos/:proyecto_id/resultado-final
 */
router.get(
  '/proyectos/:proyecto_id/resultado-final',
  verifySession,
  versionesController.obtenerResultadoFinal
);

/**
 * Obtener historial de estados de proyecto
 * GET /api/v1/proyectos/:proyecto_id/historial-estados
 */
router.get(
  '/proyectos/:proyecto_id/historial-estados',
  verifySession,
  versionesController.obtenerHistorialEstados
);

export default router;
