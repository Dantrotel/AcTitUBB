import express from 'express';
import { verifySession } from '../middlewares/verifySession.js';
import {
  obtenerTodosLosUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  obtenerTodosLosProfesores,
  obtenerPropuestasAsignadasAProfesor,
  obtenerTodasLasAsignaciones,
  crearAsignacion,
  eliminarAsignacion,
  obtenerEstadisticas
} from '../controllers/admin.controller.js';

const router = express.Router();

// Middleware para verificar que el usuario es administrador
const verificarAdmin = (req, res, next) => {
  if (req.rol_id !== 3) {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// Aplicar middleware de verificación de sesión y admin a todas las rutas
router.use(verifySession);
router.use(verificarAdmin);

// ===== RUTAS DE USUARIOS =====
router.get('/usuarios', obtenerTodosLosUsuarios);
router.put('/usuarios/:rut', actualizarUsuario);
router.delete('/usuarios/:rut', eliminarUsuario);

// ===== RUTAS DE PROFESORES =====
router.get('/profesores', obtenerTodosLosProfesores);
router.get('/profesores/:rut/propuestas', obtenerPropuestasAsignadasAProfesor);

// ===== RUTAS DE ASIGNACIONES =====
router.get('/asignaciones', obtenerTodasLasAsignaciones);
router.post('/asignaciones', crearAsignacion);
router.delete('/asignaciones/:id', eliminarAsignacion);

// ===== RUTAS DE ESTADÍSTICAS =====
router.get('/estadisticas', obtenerEstadisticas);

export default router; 