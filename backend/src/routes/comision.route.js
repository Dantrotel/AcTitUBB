import express from 'express';
import * as comisionController from '../controllers/comision.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

// Obtener comisión de un proyecto
router.get('/proyecto/:proyectoId', comisionController.obtenerComision);

// Obtener todos los proyectos con estado de comisión (admin)
router.get('/proyectos', comisionController.obtenerProyectosConComision);

// Obtener profesores disponibles para un proyecto (admin)
router.get('/proyecto/:proyectoId/profesores-disponibles', comisionController.obtenerProfesoresDisponibles);

// Agregar miembro a la comisión (admin)
router.post('/miembro', comisionController.agregarMiembro);

// Remover miembro de la comisión (admin)
router.delete('/miembro/:comisionId', comisionController.removerMiembro);

// Actualizar rol de un miembro (admin)
router.put('/miembro/:comisionId/rol', comisionController.actualizarRol);

export default router;
