import express from 'express';
import { verifySession } from '../middlewares/verifySession.js';
import { pool } from '../db/connectionDB.js';
import {
  obtenerTodosLosUsuarios,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoUsuario,
  cambiarRolUsuario,
  crearUsuario,
  resetearPasswordUsuario,
  obtenerDetalleUsuario,
  obtenerPropuestasAsignadasAProfesor,
  obtenerTodasLasAsignaciones,
  crearAsignacion,
  eliminarAsignacion,
  obtenerEstadisticas,
  obtenerCargaAdministrativa
} from '../controllers/admin.controller.js';

const router = express.Router();

// Middleware para verificar que el usuario es administrador (Jefe de Carrera o Super Admin)
const verificarAdmin = (req, res, next) => {
  if (req.rol_id !== 3 && req.rol_id !== 4) {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

// Aplicar middleware de verificación de sesión y admin a todas las rutas
router.use(verifySession);
router.use(verificarAdmin);

// ===== RUTAS DE ROLES =====
router.get('/roles', async (req, res) => {
  try {
    const [roles] = await pool.execute('SELECT id, nombre, descripcion FROM roles ORDER BY id');
    res.json(roles);
  } catch (error) {
    
    res.status(500).json({ message: 'Error al obtener roles' });
  }
});

// ===== RUTAS DE DEPARTAMENTOS Y CARRERAS =====
router.get('/departamentos', async (req, res) => {
  try {
    const [departamentos] = await pool.execute(`
      SELECT d.id, d.nombre, d.codigo, d.facultad_id, f.nombre as facultad_nombre
      FROM departamentos d
      LEFT JOIN facultades f ON d.facultad_id = f.id
      WHERE d.activo = TRUE
      ORDER BY d.nombre
    `);
    res.json(departamentos);
  } catch (error) {
    
    res.status(500).json({ message: 'Error al obtener departamentos' });
  }
});

router.get('/carreras', async (req, res) => {
  try {
    const [carreras] = await pool.execute(`
      SELECT c.id, c.nombre, c.codigo, c.facultad_id, f.nombre as facultad_nombre
      FROM carreras c
      LEFT JOIN facultades f ON c.facultad_id = f.id
      WHERE c.activo = TRUE
      ORDER BY c.nombre
    `);
    res.json(carreras);
  } catch (error) {
    
    res.status(500).json({ message: 'Error al obtener carreras' });
  }
});

// Obtener departamentos asociados a una carrera específica
router.get('/carreras/:carreraId/departamentos', async (req, res) => {
  try {
    const { carreraId } = req.params;
    const [departamentos] = await pool.execute(`
      SELECT 
        d.id, 
        d.nombre, 
        d.codigo, 
        dc.es_principal,
        f.nombre as facultad_nombre
      FROM departamentos_carreras dc
      INNER JOIN departamentos d ON dc.departamento_id = d.id
      LEFT JOIN facultades f ON d.facultad_id = f.id
      WHERE dc.carrera_id = ? AND dc.activo = TRUE
      ORDER BY dc.es_principal DESC, d.nombre
    `, [carreraId]);
    res.json(departamentos);
  } catch (error) {
    
    res.status(500).json({ message: 'Error al obtener departamentos de la carrera' });
  }
});

// Obtener carreras asociadas a un departamento específico
router.get('/departamentos/:departamentoId/carreras', async (req, res) => {
  try {
    const { departamentoId } = req.params;
    const [carreras] = await pool.execute(`
      SELECT 
        c.id, 
        c.nombre, 
        c.codigo, 
        dc.es_principal,
        f.nombre as facultad_nombre
      FROM departamentos_carreras dc
      INNER JOIN carreras c ON dc.carrera_id = c.id
      LEFT JOIN facultades f ON c.facultad_id = f.id
      WHERE dc.departamento_id = ? AND dc.activo = TRUE
      ORDER BY dc.es_principal DESC, c.nombre
    `, [departamentoId]);
    res.json(carreras);
  } catch (error) {
    
    res.status(500).json({ message: 'Error al obtener carreras del departamento' });
  }
});

// ===== GESTIÓN DE RELACIONES DEPARTAMENTOS-CARRERAS =====

// Obtener todas las relaciones departamentos-carreras
router.get('/departamentos-carreras', async (req, res) => {
  try {
    const [relaciones] = await pool.execute(`
      SELECT 
        dc.id,
        dc.departamento_id,
        d.nombre as departamento_nombre,
        d.codigo as departamento_codigo,
        dc.carrera_id,
        c.nombre as carrera_nombre,
        c.codigo as carrera_codigo,
        dc.es_principal,
        dc.activo,
        f.nombre as facultad_nombre
      FROM departamentos_carreras dc
      INNER JOIN departamentos d ON dc.departamento_id = d.id
      INNER JOIN carreras c ON dc.carrera_id = c.id
      LEFT JOIN facultades f ON c.facultad_id = f.id
      ORDER BY c.nombre, dc.es_principal DESC, d.nombre
    `);
    res.json(relaciones);
  } catch (error) {
    
    res.status(500).json({ message: 'Error al obtener relaciones' });
  }
});

// Crear una nueva relación departamento-carrera
router.post('/departamentos-carreras', async (req, res) => {
  try {
    const { departamento_id, carrera_id, es_principal } = req.body;
    
    // Validar que existan el departamento y la carrera
    const [deptExists] = await pool.execute('SELECT id FROM departamentos WHERE id = ?', [departamento_id]);
    const [carreraExists] = await pool.execute('SELECT id FROM carreras WHERE id = ?', [carrera_id]);
    
    if (deptExists.length === 0) {
      return res.status(404).json({ message: 'Departamento no encontrado' });
    }
    if (carreraExists.length === 0) {
      return res.status(404).json({ message: 'Carrera no encontrada' });
    }
    
    // Insertar la relación
    const [result] = await pool.execute(`
      INSERT INTO departamentos_carreras (departamento_id, carrera_id, es_principal, activo)
      VALUES (?, ?, ?, TRUE)
    `, [departamento_id, carrera_id, es_principal || false]);
    
    res.status(201).json({ 
      message: 'Relación creada exitosamente',
      id: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Esta relación ya existe' });
    }
    
    res.status(500).json({ message: 'Error al crear relación' });
  }
});

// Actualizar una relación departamento-carrera
router.put('/departamentos-carreras/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { es_principal, activo } = req.body;
    
    const campos = [];
    const valores = [];
    
    if (es_principal !== undefined) {
      campos.push('es_principal = ?');
      valores.push(es_principal);
    }
    if (activo !== undefined) {
      campos.push('activo = ?');
      valores.push(activo);
    }
    
    if (campos.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' });
    }
    
    campos.push('updated_at = NOW()');
    valores.push(id);
    
    const [result] = await pool.execute(
      `UPDATE departamentos_carreras SET ${campos.join(', ')} WHERE id = ?`,
      valores
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }
    
    res.json({ message: 'Relación actualizada exitosamente' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error al actualizar relación' });
  }
});

// Eliminar una relación departamento-carrera
router.delete('/departamentos-carreras/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM departamentos_carreras WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }
    
    res.json({ message: 'Relación eliminada exitosamente' });
  } catch (error) {
    
    res.status(500).json({ message: 'Error al eliminar relación' });
  }
});

// ===== RUTAS DE USUARIOS =====
router.get('/usuarios', obtenerTodosLosUsuarios);
router.get('/usuarios/:rut', obtenerDetalleUsuario);
router.post('/usuarios', crearUsuario);
router.put('/usuarios/:rut', actualizarUsuario);
router.put('/usuarios/:rut/estado', cambiarEstadoUsuario);
router.put('/usuarios/:rut/rol', cambiarRolUsuario);
router.post('/usuarios/:rut/reset-password', resetearPasswordUsuario);
router.delete('/usuarios/:rut', eliminarUsuario);

// ===== RUTAS DE PROFESORES =====
// Nota: La gestión de profesores ahora se realiza a través de /usuarios con filtro por rol
router.get('/profesores/:rut/propuestas', obtenerPropuestasAsignadasAProfesor);

// ===== RUTAS DE ROLES DE PROFESORES =====
router.get('/roles-profesores', async (req, res) => {
  try {
    
    if (req.user) {
      
    }
    
    const query = 'SELECT id, nombre, descripcion FROM roles_profesores ORDER BY nombre';
    const [roles] = await pool.execute(query);
    
    
    
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    
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