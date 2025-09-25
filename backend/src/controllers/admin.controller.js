import { UserModel } from '../models/user.model.js';
import { 
  obtenerPropuestasPorProfesor,
  asignarProfesor,
  desasignarProfesor
} from '../models/propuesta.model.js';
import * as AdminModel from '../models/admin.model.js';

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

export const obtenerTodasLasAsignaciones = async (req, res) => {
  try {
    const asignaciones = await AdminModel.obtenerTodasLasAsignaciones();
    res.json(asignaciones);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const crearAsignacion = async (req, res) => {
  try {
    const { propuesta_id, profesor_rut } = req.body;
    
    // Verificar que la propuesta existe
    const propuestaExiste = await AdminModel.verificarPropuestaExiste(propuesta_id);
    if (!propuestaExiste) {
      return res.status(404).json({ message: 'Propuesta no encontrada' });
    }
    
    // Verificar que el profesor existe
    const profesorExiste = await AdminModel.verificarProfesorExiste(profesor_rut);
    if (!profesorExiste) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    
    // Verificar que no existe ya una asignación
    const asignacionExiste = await AdminModel.verificarAsignacionExiste(propuesta_id, profesor_rut);
    if (asignacionExiste) {
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
    const asignacion = await AdminModel.obtenerAsignacionPorId(id);
    
    if (!asignacion) {
      return res.status(404).json({ message: 'Asignación no encontrada' });
    }
    
    // Eliminar la asignación
    await desasignarProfesor(
      asignacion.propuesta_id, 
      asignacion.profesor_rut
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
    const estadisticas = await AdminModel.obtenerEstadisticasCompletas();
    res.json(estadisticas);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}; 