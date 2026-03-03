import express from 'express';
import * as comisionController from '../controllers/comision.controller.js';
import { verifySession, checkRole } from '../middlewares/verifySession.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

// Obtener comisión de un proyecto (profesores y admins)
router.get('/proyecto/:proyectoId', checkRole('2,3'), comisionController.obtenerComision);

// Obtener todos los proyectos con estado de comisión (admin)
router.get('/proyectos', checkRole('3'), comisionController.obtenerProyectosConComision);

// Obtener profesores disponibles para un proyecto (admin)
router.get('/proyecto/:proyectoId/profesores-disponibles', checkRole('3'), comisionController.obtenerProfesoresDisponibles);

// Agregar miembro a la comisión (admin)
router.post('/miembro', checkRole('3'), comisionController.agregarMiembro);

// Remover miembro de la comisión (admin)
router.delete('/miembro/:comisionId', checkRole('3'), comisionController.removerMiembro);

// Actualizar rol de un miembro (admin)
router.put('/miembro/:comisionId/rol', checkRole('3'), comisionController.actualizarRol);

export default router;
