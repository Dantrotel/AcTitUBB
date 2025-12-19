import { Router } from 'express'
import * as PropuestaController from '../controllers/propuesta.controller.js'
import { verifySession, checkRole } from '../middlewares/verifySession.js'
import { uploadPropuesta, uploadRevision } from '../middlewares/uploader.js'
import { validate, crearPropuestaSchema, actualizarPropuestaSchema, revisarPropuestaSchema, asignarProfesorSchema } from '../middlewares/validators.js'
import { cacheMiddleware, invalidateOnMutation } from '../config/cache.js'

const routerProp = Router()

// DEBUG ENDPOINTS REMOVED FOR PRODUCTION

// Estudiantes
routerProp.post('/', verifySession, checkRole('1'), uploadPropuesta, validate(crearPropuestaSchema), invalidateOnMutation('propuestas'), PropuestaController.crearPropuestaController)
routerProp.put('/:id', verifySession, checkRole('1'), uploadPropuesta, validate(actualizarPropuestaSchema), invalidateOnMutation('propuestas'), PropuestaController.ActualizarPropuesta)
routerProp.get('/estudiante/mis-propuestas', verifySession, checkRole('1'), cacheMiddleware('propuestas'), PropuestaController.getPropuestasEstudiante)

// Profesores, Admin y SuperAdmin
routerProp.put('/:id/revisar', verifySession, checkRole('2','3','4'), uploadRevision, validate(revisarPropuestaSchema), invalidateOnMutation('propuestas'), PropuestaController.revisarPropuesta)
routerProp.get('/:id/historial-revisiones', verifySession, checkRole('1','2','3','4'), PropuestaController.obtenerHistorialRevisiones)
routerProp.put('/:id/asignar-profesor', verifySession, checkRole('2','3','4'), validate(asignarProfesorSchema), invalidateOnMutation('propuestas'), PropuestaController.asignarProfesor)
routerProp.get('/profesor/:rut', verifySession, checkRole('2','3','4'), cacheMiddleware('propuestas'), PropuestaController.getPropuestasPorProfesor)

// Archivos de propuestas
routerProp.get('/:propuesta_id/archivos', verifySession, checkRole('1','2','3','4'), PropuestaController.obtenerArchivosPropuesta)
routerProp.get('/archivos/:archivo_id/download', verifySession, checkRole('1','2','3','4'), PropuestaController.descargarArchivo)

// Estudiantes - Subir corrección
routerProp.put('/:id/subir-correccion', verifySession, checkRole('1'), uploadRevision, invalidateOnMutation('propuestas'), PropuestaController.subirCorreccion)


// Generales (todos los roles)
routerProp.get('/', verifySession, cacheMiddleware('propuestas'), PropuestaController.obtenerPropuestas)
routerProp.get('/get/:id', verifySession, cacheMiddleware('propuestas'), PropuestaController.obtenerPropuestaPorId)
routerProp.delete('/:id', verifySession, checkRole('1'), invalidateOnMutation('propuestas'), PropuestaController.eliminarPropuesta)

export default routerProp;
