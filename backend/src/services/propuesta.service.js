import * as PropuestasModel from '../models/propuesta.model.js';

export const crearPropuesta = async (data) => {
  if (!data.titulo || !data.descripcion || !data.estudiante_rut || !data.fecha_envio) {
    throw new Error('Faltan datos obligatorios para crear la propuesta');
  }

  return await PropuestasModel.crearPropuesta(data);
};

export const actualizarPropuesta = async (id, data) => {
  if (!data.titulo || !data.descripcion || !data.fecha_envio) {
    throw new Error('Faltan datos obligatorios para actualizar la propuesta');
  }

  return await PropuestasModel.actualizarPropuesta(id, data);
};

export const asignarProfesor = async (id, profesor_rut) => {
  return await PropuestasModel.asignarProfesor(id, profesor_rut);
};

export const revisarPropuesta = async (id, data) => {
  return await PropuestasModel.revisarPropuesta(id, data);
};

export const obtenerPropuestas = async () => {
  return await PropuestasModel.obtenerPropuestas();
};

export const obtenerPropuestaPorId = async (id) => {
  return await PropuestasModel.obtenerPropuestaPorId(id);
};

export const eliminarPropuesta = async (id) => {
  return await PropuestasModel.eliminarPropuesta(id);
};
