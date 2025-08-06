import * as PropuestasService from '../services/propuesta.service.js';
import path from 'path';
import fs from 'fs';

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
    const nombre_archivo_original = req.file ? req.file.originalname : null;

    const nuevaPropuestaId = await PropuestasService.crearPropuesta({
      titulo,
      descripcion,
      estudiante_rut,
      fecha_envio,
      estado: estado || 'pendiente',
      archivo,
      nombre_archivo_original,
    });

    return res.status(201).json({ message: 'Propuesta creada', id: nuevaPropuestaId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Nuevo método: obtener propuestas de un estudiante específico
export const getPropuestasEstudiante = async (req, res) => {
  try {
    const estudiante_rut = req.rut; // El RUT viene del middleware de autenticación

    console.log('🔍 Debug - Obteniendo propuestas para estudiante:', estudiante_rut);

    const propuestas = await PropuestasService.getPropuestasByEstudiante(estudiante_rut);
    
    if (!propuestas || propuestas.length === 0) {
      return res.json([]);
    }

    return res.json(propuestas);
  } catch (error) {
    console.error('Error al obtener propuestas del estudiante:', error);
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

    const estadosValidos = ['pendiente', 'en_revision', 'correcciones', 'aprobada', 'rechazada'];
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
    const userRut = req.rut;
    const userRole = req.rol_id;

    console.log('🔍 Debug permisos - ID propuesta:', id);
    console.log('🔍 Debug permisos - User RUT:', userRut);
    console.log('🔍 Debug permisos - User Role:', userRole);

    const propuesta = await PropuestasService.obtenerPropuestaPorId(id);
    if (!propuesta) return res.status(404).json({ message: 'Propuesta no encontrada' });

    console.log('🔍 Debug permisos - Propuesta encontrada:', {
      id: propuesta.id,
      estudiante_rut: propuesta.estudiante_rut,
      profesor_rut: propuesta.profesor_rut
    });

    // Verificar permisos de visualización
    const puedeVer = await PropuestasService.verificarPermisosVisualizacion(propuesta, userRut, userRole);
    console.log('🔍 Debug permisos - Puede ver:', puedeVer);

    if (!puedeVer) {
      return res.status(403).json({ message: 'No tienes permisos para ver esta propuesta' });
    }

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

    // Verificar permisos de edición
    const propuesta = await PropuestasService.obtenerPropuestaPorId(id);
    if (!propuesta) {
      return res.status(404).json({ message: 'Propuesta no encontrada' });
    }

    const puedeEditar = await PropuestasService.verificarPermisosEdicion(propuesta, estudiante_rut);
    if (!puedeEditar) {
      return res.status(403).json({ message: 'No tienes permisos para editar esta propuesta' });
    }

    let archivoPath = undefined; // undefined significa que no se actualiza el archivo
    let nombreArchivoOriginal = undefined;
    
    if (req.file) {
      archivoPath = req.file.filename; // Nombre del archivo generado por el servidor
      nombreArchivoOriginal = req.file.originalname; // Nombre original del archivo
      
      // Eliminar archivo anterior si existe
      if (propuesta.archivo) {
        const archivoAnterior = path.join('uploads/propuestas', propuesta.archivo);
        if (fs.existsSync(archivoAnterior)) {
          try {
            fs.unlinkSync(archivoAnterior);
            console.log(`Archivo anterior eliminado: ${propuesta.archivo}`);
          } catch (error) {
            console.error(`Error al eliminar archivo anterior: ${error.message}`);
          }
        }
      }
    }

    const success = await PropuestasService.actualizarPropuesta(id, {
      titulo,
      descripcion,
      estudiante_rut,
      fecha_envio: fechaEnvioFinal,
      archivo: archivoPath,
      nombre_archivo_original: nombreArchivoOriginal,
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
