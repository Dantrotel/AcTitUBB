import { UserModel } from '../models/user.model.js';
import { 
  obtenerPropuestasPorProfesor,
  asignarProfesor,
  desasignarProfesor
} from '../models/propuesta.model.js';
import { pool } from '../db/connectionDB.js';

// ===== GESTIÓN DE USUARIOS =====
export const obtenerTodosLosUsuarios = async (req, res) => {
  try {
    const usuarios = await UserModel.findpersonAll();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { rut } = req.params;
    const { nombre, email } = req.body;
    
    const actualizado = await UserModel.actualizarUsuario(rut, { nombre, email });
    
    if (actualizado) {
      res.json({ message: 'Usuario actualizado correctamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { rut } = req.params;
    
    const eliminado = await UserModel.eliminarUsuario(rut);
    
    if (eliminado) {
      res.json({ message: 'Usuario eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== GESTIÓN DE PROFESORES =====
export const obtenerTodosLosProfesores = async (req, res) => {
  try {
    const profesores = await UserModel.obtenerUsuariosPorRol('profesor');
    res.json(profesores);
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const obtenerPropuestasAsignadasAProfesor = async (req, res) => {
  try {
    const { rut } = req.params;
    const propuestas = await obtenerPropuestasPorProfesor(rut);
    res.json(propuestas);
  } catch (error) {
    console.error('Error al obtener propuestas del profesor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== GESTIÓN DE ASIGNACIONES =====
export const obtenerTodasLasAsignaciones = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ap.id as asignacion_id,
        ap.propuesta_id,
        ap.profesor_rut,
        ap.fecha_asignacion,
        p.titulo as titulo_propuesta,
        ep.nombre as estado_propuesta,
        ue.nombre as nombre_estudiante,
        ue.rut as estudiante_rut,
        up.nombre as nombre_profesor,
        up.email as email_profesor
      FROM asignaciones_propuestas ap
      INNER JOIN propuestas p ON ap.propuesta_id = p.id
      INNER JOIN estados_propuestas ep ON p.estado_id = ep.id
      INNER JOIN usuarios ue ON p.estudiante_rut = ue.rut
      INNER JOIN usuarios up ON ap.profesor_rut = up.rut
      ORDER BY ap.fecha_asignacion DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const crearAsignacion = async (req, res) => {
  try {
    const { propuesta_id, profesor_rut } = req.body;
    
    // Verificar que la propuesta existe
    const [propuesta] = await pool.execute(
      'SELECT id FROM propuestas WHERE id = ?',
      [propuesta_id]
    );
    
    if (propuesta.length === 0) {
      return res.status(404).json({ message: 'Propuesta no encontrada' });
    }
    
    // Verificar que el profesor existe
    const [profesor] = await pool.execute(
      'SELECT rut FROM usuarios WHERE rut = ? AND rol_id = (SELECT id FROM roles WHERE nombre = "profesor")',
      [profesor_rut]
    );
    
    if (profesor.length === 0) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    
    // Verificar que no existe ya una asignación
    const [asignacionExistente] = await pool.execute(
      'SELECT id FROM asignaciones_propuestas WHERE propuesta_id = ? AND profesor_rut = ?',
      [propuesta_id, profesor_rut]
    );
    
    if (asignacionExistente.length > 0) {
      return res.status(409).json({ message: 'La asignación ya existe' });
    }
    
    // Crear la asignación
    await asignarProfesor(propuesta_id, profesor_rut);
    
    res.status(201).json({ message: 'Asignación creada correctamente' });
  } catch (error) {
    console.error('Error al crear asignación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const eliminarAsignacion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información de la asignación antes de eliminarla
    const [asignacion] = await pool.execute(
      'SELECT propuesta_id, profesor_rut FROM asignaciones_propuestas WHERE id = ?',
      [id]
    );
    
    if (asignacion.length === 0) {
      return res.status(404).json({ message: 'Asignación no encontrada' });
    }
    
    // Eliminar la asignación
    await desasignarProfesor(
      asignacion[0].propuesta_id, 
      asignacion[0].profesor_rut
    );
    
    res.json({ message: 'Asignación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ===== ESTADÍSTICAS =====
export const obtenerEstadisticas = async (req, res) => {
  try {
    // Estadísticas de propuestas
    const [propuestasStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_propuestas,
        SUM(CASE WHEN estado_id = (SELECT id FROM estados_propuestas WHERE nombre = 'Pendiente') THEN 1 ELSE 0 END) as propuestas_pendientes,
        SUM(CASE WHEN estado_id = (SELECT id FROM estados_propuestas WHERE nombre = 'En Revisión') THEN 1 ELSE 0 END) as propuestas_en_revision,
        SUM(CASE WHEN estado_id = (SELECT id FROM estados_propuestas WHERE nombre = 'Aprobada') THEN 1 ELSE 0 END) as propuestas_aprobadas
      FROM propuestas
    `);
    
    // Estadísticas de usuarios
    const [usuariosStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_usuarios,
        SUM(CASE WHEN rol_id = (SELECT id FROM roles WHERE nombre = 'estudiante') THEN 1 ELSE 0 END) as total_estudiantes,
        SUM(CASE WHEN rol_id = (SELECT id FROM roles WHERE nombre = 'profesor') THEN 1 ELSE 0 END) as total_profesores
      FROM usuarios
    `);
    
    // Estadísticas de asignaciones
    const [asignacionesStats] = await pool.execute(`
      SELECT COUNT(*) as total_asignaciones
      FROM asignaciones_propuestas
    `);
    
    const estadisticas = {
      propuestas: propuestasStats[0],
      usuarios: usuariosStats[0],
      asignaciones: asignacionesStats[0]
    };
    
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 