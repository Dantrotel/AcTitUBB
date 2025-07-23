import { Router } from 'express'
import * as PropuestaController from '../controllers/propuesta.controller.js'
import { verifySession, checkRole } from '../middlewares/verifySession.js'
import { uploadPropuesta } from '../middlewares/uploader.js'

const routerProp = Router()

// Estudiantes
routerProp.post('/', verifySession, checkRole('1'), uploadPropuesta ,PropuestaController.crearPropuestaController)
routerProp.put('/:id', verifySession, checkRole('1'), PropuestaController.ActualizarPropuesta)

// Profesores
routerProp.put('/:id/revisar', verifySession, checkRole('2'), PropuestaController.revisarPropuesta)
routerProp.put('/:id/asignar-profesor', verifySession, checkRole('2','3'), PropuestaController.asignarProfesor)
routerProp.get('/profesor/:rut', verifySession, checkRole('2','3'), PropuestaController.getPropuestasPorProfesor)


// Generales (todos los roles)
routerProp.get('/', verifySession, PropuestaController.obtenerPropuestas)
routerProp.get('/get/:id', verifySession, PropuestaController.obtenerPropuestaPorId)
routerProp.delete('/:id', verifySession, checkRole('1'), PropuestaController.eliminarPropuesta)

export default routerProp;
