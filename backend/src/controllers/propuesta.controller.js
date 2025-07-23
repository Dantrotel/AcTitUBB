import * as PropuestasService from '../services/propuesta.service.js';
import path from 'path';

export const crearPropuestaController = async (req, res) => {
   console.log('BODY:', req.body);
  console.log('FILE:', req.file);

  try {
    const { titulo, descripcion, fecha_envio, estado } = req.body;
    const estudiante_rut = req.rut;

    if (!titulo || !descripcion || !fecha_envio) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    // Nombre del archivo (si se subió)
    const archivo = req.file ? req.file.filename : null;

    const nuevaPropuestaId = await PropuestasService.crearPropuesta({
      titulo,
      descripcion,
      estudiante_rut,
      fecha_envio,
      estado: estado || 'pendiente',
      archivo,
    });

    return res.status(201).json({ message: 'Propuesta creada', id: nuevaPropuestaId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const asignarProfesor = async (req, res) => {
  try {
    const { id } = req.params;
    const profesor_rut = req.rut;

    if (!profesor_rut) {
      return res.status(400).json({ message: 'Datos incompletos para asignar profesor.' });
    }

    const success = await PropuestasService.asignarProfesor(id, profesor_rut);
    if (!success) return res.status(404).json({ message: 'Propuesta no encontrada' });

    return res.json({ message: 'Profesor asignado correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const revisarPropuesta = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios_profesor, estado } = req.body;

    if (!comentarios_profesor || !estado) {
      return res.status(400).json({ message: 'Faltan comentarios o estado.' });
    }

    const estadosValidos = ['pendiente', 'correcciones', 'aprobada', 'rechazada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido.' });
    }

    console.log('Estado recibido:', estado);
    console.log('Estados válidos:', estadosValidos);

    const success = await PropuestasService.revisarPropuesta(id, { comentarios_profesor, estado });
    if (!success) return res.status(404).json({ message: 'Propuesta no encontrada' });

    return res.json({ message: 'Propuesta revisada correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const obtenerPropuestas = async (req, res) => {
  try {
    const propuestas = await PropuestasService.obtenerPropuestas();
     console.log('propuestas obtenidas: ', propuestas );
    return res.json(propuestas);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const obtenerPropuestaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const propuesta = await PropuestasService.obtenerPropuestaPorId(id);
    if (!propuesta) return res.status(404).json({ message: 'Propuesta no encontrada' });

    return res.json(propuesta);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const eliminarPropuesta = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await PropuestasService.eliminarPropuesta(id);
    if (!success) return res.status(404).json({ message: 'Propuesta no encontrada' });

    return res.json({ message: 'Propuesta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const descargarArchivo = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join('uploads/propuestas', filename);

  res.download(filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
  });
}

export const ActualizarPropuesta = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion } = req.body;
    const estudiante_rut = req.rut;

    const fechaEnvioFinal = new Date(); // fecha automática

    if (!titulo || !descripcion || !estudiante_rut) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    let archivoPath = null;
    if (req.file) {
      archivoPath = path.join('uploads/propuestas', req.file.filename);
    }

    const success = await PropuestasService.actualizarPropuesta(id, {
      titulo,
      descripcion,
      estudiante_rut,
      fecha_envio: fechaEnvioFinal,
      archivo: archivoPath,
    });

    if (!success) return res.status(404).json({ message: 'Propuesta no encontrada' });

    return res.json({ message: 'Propuesta actualizada correctamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const getPropuestasPorProfesor = async (req, res) => {
  try {
    const profesor_rut = req.rut;

    const propuestas = await PropuestasService.getPropuestasAsignadasAlProfesor(profesor_rut);

    res.status(200).json(propuestas);
  } catch (error) {
    console.error('Error al obtener propuestas del profesor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
