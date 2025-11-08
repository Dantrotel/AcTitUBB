import express from 'express';
import { verifySession } from '../middlewares/verifySession.js';
import { pool } from '../db/connectionDB.js';
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

// ===== RUTAS DE ROLES DE PROFESORES =====
router.get('/roles-profesores', async (req, res) => {
  try {
    console.log('🔄 Solicitando roles de profesores...');
    if (req.user) {
      console.log('👤 Usuario autenticado:', req.user.rut);
    }
    
    const query = 'SELECT id, nombre, descripcion FROM roles_profesores ORDER BY nombre';
    const [roles] = await pool.execute(query);
    
    console.log('✅ Roles encontrados:', roles.length);
    
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('❌ Error al obtener roles de profesores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// ===== RUTAS DE ASIGNACIONES =====
router.get('/asignaciones', obtenerTodasLasAsignaciones);
router.post('/asignaciones', crearAsignacion);
router.delete('/asignaciones/:id', eliminarAsignacion);

// ===== RUTAS DE ESTADÍSTICAS =====
router.get('/estadisticas', obtenerEstadisticas);

export default router; 