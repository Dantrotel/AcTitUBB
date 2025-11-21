import { Router } from 'express'
import * as PropuestaController from '../controllers/propuesta.controller.js'
import { verifySession, checkRole } from '../middlewares/verifySession.js'
import { uploadPropuesta } from '../middlewares/uploader.js'
import { validate, crearPropuestaSchema, actualizarPropuestaSchema, revisarPropuestaSchema, asignarProfesorSchema } from '../middlewares/validators.js'
import { cacheMiddleware, invalidateOnMutation } from '../config/cache.js'

const routerProp = Router()

// Endpoint temporal de debug - Agregar ANTES de las demás rutas para que no sea interceptado
routerProp.post('/debug', verifySession, uploadPropuesta, PropuestaController.debugPropuestaController)
routerProp.put('/:id/debug-revisar', verifySession, PropuestaController.debugRevisarPropuesta)

// Estudiantes
routerProp.post('/', verifySession, checkRole('1'), uploadPropuesta, validate(crearPropuestaSchema), invalidateOnMutation('propuestas'), PropuestaController.crearPropuestaController)
routerProp.put('/:id', verifySession, checkRole('1'), uploadPropuesta, validate(actualizarPropuestaSchema), invalidateOnMutation('propuestas'), PropuestaController.ActualizarPropuesta)
routerProp.get('/estudiante/mis-propuestas', verifySession, checkRole('1'), cacheMiddleware('propuestas'), PropuestaController.getPropuestasEstudiante)

// Profesores
routerProp.put('/:id/revisar', verifySession, checkRole('2'), validate(revisarPropuestaSchema), invalidateOnMutation('propuestas'), PropuestaController.revisarPropuesta)
routerProp.put('/:id/asignar-profesor', verifySession, checkRole('2','3'), validate(asignarProfesorSchema), invalidateOnMutation('propuestas'), PropuestaController.asignarProfesor)
routerProp.get('/profesor/:rut', verifySession, checkRole('2','3'), cacheMiddleware('propuestas'), PropuestaController.getPropuestasPorProfesor)


// Generales (todos los roles)
routerProp.get('/', verifySession, cacheMiddleware('propuestas'), PropuestaController.obtenerPropuestas)
routerProp.get('/get/:id', verifySession, cacheMiddleware('propuestas'), PropuestaController.obtenerPropuestaPorId)
routerProp.delete('/:id', verifySession, checkRole('1'), invalidateOnMutation('propuestas'), PropuestaController.eliminarPropuesta)

export default routerProp;
