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
router.get('/roles-profesores', verifySession, async (req, res) => {
  try {
    console.log('🔄 Solicitando roles de profesores...');
    console.log('👤 Usuario:', req.user);
    
    const query = 'SELECT id, codigo, nombre, descripcion FROM roles_profesores ORDER BY nombre';
    const [roles] = await pool.execute(query);
    
    console.log('✅ Roles encontrados:', roles.length);
    console.log('📋 Roles:', roles);
    
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

// ===== RUTA DE PRUEBA PARA VERIFICAR ROLES (SIN AUTENTICACIÓN) =====
router.get('/test-roles', async (req, res) => {
  try {
    console.log('🧪 Probando acceso a roles_profesores...');
    
    // Verificar si la tabla existe
    const [tables] = await pool.execute("SHOW TABLES LIKE 'roles_profesores'");
    console.log('📋 Tabla roles_profesores existe:', tables.length > 0);
    
    if (tables.length > 0) {
      // Verificar estructura de la tabla
      const [columns] = await pool.execute('DESCRIBE roles_profesores');
      console.log('🏗️ Estructura de la tabla:');
      columns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
      
      // Obtener todos los roles
      const [roles] = await pool.execute('SELECT * FROM roles_profesores');
      console.log('👥 Total de roles encontrados:', roles.length);
      console.log('📝 Roles:', roles);
    }
    
    res.json({
      success: true,
      tabla_existe: tables.length > 0,
      columnas: tables.length > 0 ? await pool.execute('DESCRIBE roles_profesores').then(([cols]) => cols) : [],
      total_roles: tables.length > 0 ? await pool.execute('SELECT COUNT(*) as total FROM roles_profesores').then(([count]) => count[0].total) : 0,
      roles: tables.length > 0 ? await pool.execute('SELECT * FROM roles_profesores').then(([roles]) => roles) : []
    });
  } catch (error) {
    console.error('❌ Error en test de roles:', error);
    res.status(500).json({
      success: false,
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