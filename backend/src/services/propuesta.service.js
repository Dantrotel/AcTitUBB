import * as PropuestasModel from '../models/propuesta.model.js';

// Utilidad para validar RUT chileno simple
const rutValido = (rut) => /^\d{7,8}-[\dkK]$/.test(rut);
const fechaValida = (fecha) => !isNaN(new Date(fecha));
export const estadosValidos = ['pendiente', 'en_revision', 'correcciones', 'aprobada', 'rechazada'];

export const crearPropuesta = async (data) => {
  try {
    if (!data.titulo?.trim() || !data.descripcion?.trim() || !data.estudiante_rut || !data.fecha_envio) {
      throw new Error('Faltan datos obligatorios para crear la propuesta');
    }

    if (!rutValido(data.estudiante_rut)) {
      throw new Error('El RUT del estudiante no es válido');
    }

    if (!fechaValida(data.fecha_envio)) {
      throw new Error('La fecha de envío no es válida');
    }

    return await PropuestasModel.crearPropuesta(data);
  } catch (error) {
    throw error;
  }
};

export const actualizarPropuesta = async (id, data) => {
  try {
    if (isNaN(id)) throw new Error('ID de propuesta inválido');

    if (!data.titulo?.trim() || !data.descripcion?.trim()) {
      throw new Error('Faltan datos obligatorios para actualizar la propuesta');
    }

    const fechaEnvio = data.fecha_envio || new Date();

    return await PropuestasModel.actualizarPropuesta(id, {
      ...data,
      fecha_envio: fechaEnvio,
    });
  } catch (error) {
    throw error;
  }
};


export const asignarProfesor = async (id, profesor_rut) => {
  try {
    if (isNaN(id)) throw new Error('ID de propuesta inválido');

    if (!rutValido(profesor_rut)) {
      throw new Error('El RUT del profesor no es válido');
    }

    return await PropuestasModel.asignarProfesor(id, profesor_rut);
  } catch (error) {
    throw error;
  }
};

export const revisarPropuesta = async (id, data) => {
  try {
    if (isNaN(id)) throw new Error('ID de propuesta inválido');

    const comentario = data.comentario || data.comentarios_profesor;
    const { estado } = data;

    if (!comentario || comentario.trim().length === 0) {
      throw new Error('El comentario no puede estar vacío');
    }

    if (!estado || !estadosValidos.includes(estado)) {
      throw new Error('Estado inválido');
    }

    return await PropuestasModel.revisarPropuesta(id, { comentarios_profesor: comentario, estado });
  } catch (error) {
    throw error;
  }
};

export const obtenerPropuestas = async () => {
  return await PropuestasModel.obtenerPropuestas();
};

export const obtenerPropuestaPorId = async (id) => {
  if (isNaN(id)) throw new Error('ID inválido');
  return await PropuestasModel.obtenerPropuestaPorId(id);
};

export const eliminarPropuesta = async (id) => {
  if (isNaN(id)) throw new Error('ID inválido');
  return await PropuestasModel.eliminarPropuesta(id);
};

export const getPropuestasAsignadasAlProfesor = async (profesor_rut) => {
  if (!rutValido(profesor_rut)) {
    throw new Error('RUT de profesor no válido');
  }
  return await PropuestasModel.obtenerPropuestasPorProfesor(profesor_rut);
};

// Métodos para verificar permisos
export const verificarPermisosVisualizacion = async (propuesta, userRut, userRole) => {
  // El creador siempre puede ver su propuesta
  if (propuesta.estudiante_rut === userRut) {
    return true;
  }
  
  // Los profesores pueden ver todas las propuestas sin asignar
  if (userRole === 2) { // Profesor
    // Si la propuesta no tiene profesor asignado, cualquier profesor puede verla
    if (!propuesta.profesor_rut || propuesta.profesor_rut === null) {
      return true;
    }
    // Si ya tiene profesor asignado, solo ese profesor puede verla
    return propuesta.profesor_rut === userRut;
  }
  
  // Los administradores pueden ver todas las propuestas
  if (userRole === 3) { // Admin
    return true;
  }
  
  // Otros estudiantes no pueden ver propuestas de otros estudiantes
  return false;
};

export const verificarPermisosEdicion = async (propuesta, userRut) => {
  // Solo el creador puede editar su propuesta
  return propuesta.estudiante_rut === userRut;
};
