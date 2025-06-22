import * as PropuestasModel from '../models/propuesta.model.js';

// Utilidad para validar RUT chileno simple
const rutValido = (rut) => /^\d{7,8}-[\dkK]$/.test(rut);
const fechaValida = (fecha) => !isNaN(new Date(fecha));
const estadosValidos = ['Pendiente', 'En revisión', 'Aprobada', 'Rechazada'];

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

    if (!data.comentario?.trim()) {
      throw new Error('El comentario no puede estar vacío');
    }

    if (!data.estado || !estadosValidos.includes(data.estado)) {
      throw new Error('Estado inválido');
    }

    return await PropuestasModel.revisarPropuesta(id, data);
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

  return await PropuestasModel.obtenerPropuestasPorProfesor(profprofesor_rut);
};
