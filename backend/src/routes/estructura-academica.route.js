import express from 'express';
import * as EstructuraController from '../controllers/estructura-academica.controller.js';
import { verifySession, checkRole } from '../middlewares/verifySession.js';

const router = express.Router();

// ============================================
// RUTAS DE FACULTADES
// ============================================

// Obtener todas las facultades (accesible por todos los roles autenticados)
router.get('/facultades', verifySession, EstructuraController.obtenerFacultades);

// Obtener facultad por ID
router.get('/facultades/:id', verifySession, EstructuraController.obtenerFacultadPorId);

// Crear facultad (solo Super Admin)
router.post('/facultades', verifySession, checkRole('4'), EstructuraController.crearFacultad);

// Actualizar facultad (solo Super Admin)
router.put('/facultades/:id', verifySession, checkRole('4'), EstructuraController.actualizarFacultad);

// Eliminar facultad - soft delete (solo Super Admin)
router.delete('/facultades/:id', verifySession, checkRole('4'), EstructuraController.eliminarFacultad);

// Reactivar facultad (solo Super Admin)
router.put('/facultades/:id/reactivar', verifySession, checkRole('4'), EstructuraController.reactivarFacultad);

// Eliminar facultad permanentemente (solo Super Admin)
router.delete('/facultades/:id/permanente', verifySession, checkRole('4'), EstructuraController.eliminarFacultadPermanente);

// Obtener estadísticas de facultad
router.get('/facultades/:id/estadisticas', verifySession, EstructuraController.obtenerEstadisticasFacultad);

// ============================================
// RUTAS DE DEPARTAMENTOS
// ============================================

// Obtener todos los departamentos (público para registro de profesores)
router.get('/departamentos/public', EstructuraController.obtenerDepartamentosPublicos);
// Obtener todos los departamentos
router.get('/departamentos', verifySession, EstructuraController.obtenerDepartamentos);

// Obtener departamento por ID
router.get('/departamentos/:id', verifySession, EstructuraController.obtenerDepartamentoPorId);

// Crear departamento (solo Super Admin)
router.post('/departamentos', verifySession, checkRole('4'), EstructuraController.crearDepartamento);

// Actualizar departamento (solo Super Admin)
router.put('/departamentos/:id', verifySession, checkRole('4'), EstructuraController.actualizarDepartamento);

// Eliminar departamento - soft delete (solo Super Admin)
router.delete('/departamentos/:id', verifySession, checkRole('4'), EstructuraController.eliminarDepartamento);

// Reactivar departamento (solo Super Admin)
router.put('/departamentos/:id/reactivar', verifySession, checkRole('4'), EstructuraController.reactivarDepartamento);

// Eliminar departamento permanentemente (solo Super Admin)
router.delete('/departamentos/:id/permanente', verifySession, checkRole('4'), EstructuraController.eliminarDepartamentoPermanente);

// Asignar profesor a departamento (Super Admin o Jefe de Departamento)
router.post('/departamentos/:id/profesores', verifySession, checkRole('4'), EstructuraController.asignarProfesorDepartamento);

// Obtener profesores de un departamento
router.get('/departamentos/:id/profesores', verifySession, EstructuraController.obtenerProfesoresDepartamento);

// Remover profesor de departamento (solo Super Admin)
router.delete('/departamentos/:id/profesores/:profesorRut', verifySession, checkRole('4'), EstructuraController.removerProfesorDepartamento);

// ============================================
// RUTAS DE CARRERAS
// ============================================

// Obtener todas las carreras (público para registro de estudiantes)
router.get('/carreras/public', EstructuraController.obtenerCarrerasPublicas);
router.get('/carreras', verifySession, EstructuraController.obtenerCarreras);

// Obtener carrera por ID
router.get('/carreras/:id', verifySession, EstructuraController.obtenerCarreraPorId);

// Crear carrera (solo Super Admin)
router.post('/carreras', verifySession, checkRole('4'), EstructuraController.crearCarrera);

// Actualizar carrera (solo Super Admin)
router.put('/carreras/:id', verifySession, checkRole('4'), EstructuraController.actualizarCarrera);

// Eliminar carrera - soft delete (solo Super Admin)
router.delete('/carreras/:id', verifySession, checkRole('4'), EstructuraController.eliminarCarrera);

// Reactivar carrera (solo Super Admin)
router.put('/carreras/:id/reactivar', verifySession, checkRole('4'), EstructuraController.reactivarCarrera);

// Eliminar carrera permanentemente (solo Super Admin)
router.delete('/carreras/:id/permanente', verifySession, checkRole('4'), EstructuraController.eliminarCarreraPermanente);

// Asignar jefe de carrera (solo Super Admin)
router.post('/carreras/:id/jefe', verifySession, checkRole('4'), EstructuraController.asignarJefeCarrera);

// Remover jefe de carrera (solo Super Admin)
router.delete('/carreras/:id/jefe', verifySession, checkRole('4'), EstructuraController.removerJefeCarrera);

// Asignar estudiante a carrera (Super Admin o registro automático)
router.post('/carreras/:id/estudiantes', verifySession, EstructuraController.asignarEstudianteCarrera);

// Obtener estudiantes de una carrera
router.get('/carreras/:id/estudiantes', verifySession, EstructuraController.obtenerEstudiantesCarrera);

// Remover estudiante de carrera (solo Super Admin)
router.delete('/carreras/:id/estudiantes/:estudianteRut', verifySession, checkRole('4'), EstructuraController.removerEstudianteCarrera);

// Obtener estadísticas de carrera
router.get('/carreras/:id/estadisticas', verifySession, EstructuraController.obtenerEstadisticasCarrera);

// Obtener propuestas pendientes de aprobación (Jefe de Carrera)
router.get('/carreras/:id/propuestas-pendientes', verifySession, checkRole('3,4'), EstructuraController.obtenerPropuestasPendientes);

export default router;
