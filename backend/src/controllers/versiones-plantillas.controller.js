// Controlador de Versiones de Documentos y Plantillas
import versionesModel from '../models/versiones-plantillas.model.js';
import logger from '../config/logger.js';
import fs from 'fs';
import path from 'path';

const versionesController = {
  // ========== VERSIONES DE DOCUMENTOS ==========

  /**
   * Subir nueva versión de documento
   */
  async subirVersion(req, res) {
    try {
      const autorRut = req.session.user.rut;
      const autorRol = req.session.user.rol;

      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo' });
      }

      const {
        avance_id,
        proyecto_id,
        tipo_version,
        descripcion_cambios,
        cambios_principales,
        comentarios_generales,
        es_version_final
      } = req.body;

      // Validar campos requeridos
      if (!avance_id || !proyecto_id || !tipo_version) {
        return res.status(400).json({ 
          message: 'Faltan campos requeridos (avance_id, proyecto_id, tipo_version)' 
        });
      }

      // Calcular número de versión
      const numero_version = await versionesModel.calcularSiguienteVersion(avance_id);

      const datosVersion = {
        avance_id,
        proyecto_id,
        numero_version,
        tipo_version,
        archivo_nombre: req.file.originalname,
        archivo_ruta: req.file.path,
        archivo_tamano_kb: Math.round(req.file.size / 1024),
        archivo_tipo: req.file.mimetype,
        descripcion_cambios,
        cambios_principales,
        autor_rol: autorRol,
        comentarios_generales,
        estado: tipo_version === 'estudiante' ? 'enviado' : 'en_revision',
        es_version_final
      };

      const resultado = await versionesModel.crearVersion(datosVersion, autorRut);

      logger.info('Versión de documento subida', { 
        usuario: autorRut, 
        version_id: resultado.id 
      });

      res.status(201).json({
        message: 'Versión subida exitosamente',
        version: { id: resultado.id, numero_version }
      });
    } catch (error) {
      logger.error('Error al subir versión', { error: error.message });
      res.status(500).json({ message: 'Error al subir versión', error: error.message });
    }
  },

  /**
   * Obtener versiones de un avance
   */
  async obtenerVersionesAvance(req, res) {
    try {
      const { avance_id } = req.params;
      const versiones = await versionesModel.obtenerVersionesPorAvance(avance_id);

      res.status(200).json({ versiones });
    } catch (error) {
      logger.error('Error al obtener versiones', { error: error.message });
      res.status(500).json({ message: 'Error al obtener versiones', error: error.message });
    }
  },

  /**
   * Obtener versiones de un proyecto con filtros
   */
  async obtenerVersionesProyecto(req, res) {
    try {
      const { proyecto_id } = req.params;
      const { tipo_version, estado, autor_rol } = req.query;

      const filtros = {};
      if (tipo_version) filtros.tipo_version = tipo_version;
      if (estado) filtros.estado = estado;
      if (autor_rol) filtros.autor_rol = autor_rol;

      const versiones = await versionesModel.obtenerVersionesPorProyecto(proyecto_id, filtros);

      res.status(200).json({ versiones });
    } catch (error) {
      logger.error('Error al obtener versiones de proyecto', { error: error.message });
      res.status(500).json({ 
        message: 'Error al obtener versiones de proyecto', 
        error: error.message 
      });
    }
  },

  /**
   * Obtener detalles de una versión específica
   */
  async obtenerVersion(req, res) {
    try {
      const { version_id } = req.params;
      const version = await versionesModel.obtenerVersionPorId(version_id);

      if (!version) {
        return res.status(404).json({ message: 'Versión no encontrada' });
      }

      res.status(200).json({ version });
    } catch (error) {
      logger.error('Error al obtener versión', { error: error.message });
      res.status(500).json({ message: 'Error al obtener versión', error: error.message });
    }
  },

  /**
   * Descargar archivo de una versión
   */
  async descargarVersion(req, res) {
    try {
      const { version_id } = req.params;
      const version = await versionesModel.obtenerVersionPorId(version_id);

      if (!version) {
        return res.status(404).json({ message: 'Versión no encontrada' });
      }

      const rutaArchivo = path.resolve(version.archivo_ruta);

      if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
      }

      res.download(rutaArchivo, version.archivo_nombre);
    } catch (error) {
      logger.error('Error al descargar versión', { error: error.message });
      res.status(500).json({ message: 'Error al descargar archivo', error: error.message });
    }
  },

  /**
   * Actualizar estado de una versión
   */
  async actualizarEstadoVersion(req, res) {
    try {
      const { version_id } = req.params;
      const { estado, comentarios } = req.body;

      if (!estado) {
        return res.status(400).json({ message: 'El estado es requerido' });
      }

      await versionesModel.actualizarEstadoVersion(version_id, estado, comentarios);

      logger.info('Estado de versión actualizado', { 
        usuario: req.session.user.rut, 
        version_id, 
        estado 
      });

      res.status(200).json({ message: 'Estado actualizado exitosamente' });
    } catch (error) {
      logger.error('Error al actualizar estado', { error: error.message });
      res.status(500).json({ 
        message: 'Error al actualizar estado', 
        error: error.message 
      });
    }
  },

  /**
   * Marcar versión como final
   */
  async marcarVersionFinal(req, res) {
    try {
      const { version_id } = req.params;
      const autorRut = req.session.user.rut;

      await versionesModel.marcarVersionFinal(version_id, autorRut);

      logger.info('Versión marcada como final', { 
        usuario: autorRut, 
        version_id 
      });

      res.status(200).json({ message: 'Versión marcada como final exitosamente' });
    } catch (error) {
      logger.error('Error al marcar versión final', { error: error.message });
      res.status(500).json({ 
        message: 'Error al marcar versión final', 
        error: error.message 
      });
    }
  },

  // ========== COMENTARIOS DE VERSIONES ==========

  /**
   * Crear comentario en una versión
   */
  async crearComentario(req, res) {
    try {
      const autorRut = req.session.user.rut;
      const autorRol = req.session.user.rol;
      const { version_id } = req.params;

      const {
        comentario,
        tipo_comentario,
        prioridad,
        seccion_referencia
      } = req.body;

      if (!comentario) {
        return res.status(400).json({ message: 'El comentario es requerido' });
      }

      const datosComentario = {
        version_id,
        comentario,
        tipo_comentario,
        prioridad,
        seccion_referencia,
        autor_rol: autorRol
      };

      const resultado = await versionesModel.crearComentario(datosComentario, autorRut);

      logger.info('Comentario creado en versión', { 
        usuario: autorRut, 
        comentario_id: resultado.id 
      });

      res.status(201).json({
        message: 'Comentario creado exitosamente',
        comentario: { id: resultado.id }
      });
    } catch (error) {
      logger.error('Error al crear comentario', { error: error.message });
      res.status(500).json({ message: 'Error al crear comentario', error: error.message });
    }
  },

  /**
   * Obtener comentarios de una versión
   */
  async obtenerComentarios(req, res) {
    try {
      const { version_id } = req.params;
      const comentarios = await versionesModel.obtenerComentariosPorVersion(version_id);

      res.status(200).json({ comentarios });
    } catch (error) {
      logger.error('Error al obtener comentarios', { error: error.message });
      res.status(500).json({ message: 'Error al obtener comentarios', error: error.message });
    }
  },

  /**
   * Marcar comentario como resuelto
   */
  async resolverComentario(req, res) {
    try {
      const { comentario_id } = req.params;

      await versionesModel.resolverComentario(comentario_id);

      logger.info('Comentario resuelto', { 
        usuario: req.session.user.rut, 
        comentario_id 
      });

      res.status(200).json({ message: 'Comentario marcado como resuelto' });
    } catch (error) {
      logger.error('Error al resolver comentario', { error: error.message });
      res.status(500).json({ message: 'Error al resolver comentario', error: error.message });
    }
  },

  // ========== PLANTILLAS ==========

  /**
   * Subir plantilla de documento (solo admin)
   */
  async subirPlantilla(req, res) {
    try {
      const creadoPorRut = req.session.user.rut;

      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo' });
      }

      const {
        nombre,
        descripcion,
        tipo_documento,
        carrera_id,
        departamento_id,
        facultad_id,
        version_plantilla,
        formato_requerido,
        instrucciones,
        ejemplo_url,
        obligatoria
      } = req.body;

      if (!nombre || !tipo_documento) {
        return res.status(400).json({ 
          message: 'Faltan campos requeridos (nombre, tipo_documento)' 
        });
      }

      const datosPlantilla = {
        nombre,
        descripcion,
        tipo_documento,
        archivo_nombre: req.file.originalname,
        archivo_ruta: req.file.path,
        archivo_tipo: req.file.mimetype,
        archivo_tamano_kb: Math.round(req.file.size / 1024),
        carrera_id: carrera_id || null,
        departamento_id: departamento_id || null,
        facultad_id: facultad_id || null,
        version_plantilla,
        formato_requerido,
        instrucciones,
        ejemplo_url,
        obligatoria: obligatoria === 'true'
      };

      const resultado = await versionesModel.crearPlantilla(datosPlantilla, creadoPorRut);

      logger.info('Plantilla creada', { 
        usuario: creadoPorRut, 
        plantilla_id: resultado.id 
      });

      res.status(201).json({
        message: 'Plantilla creada exitosamente',
        plantilla: { id: resultado.id }
      });
    } catch (error) {
      logger.error('Error al subir plantilla', { error: error.message });
      res.status(500).json({ message: 'Error al subir plantilla', error: error.message });
    }
  },

  /**
   * Obtener plantillas disponibles (con filtros)
   */
  async obtenerPlantillas(req, res) {
    try {
      const { tipo_documento, carrera_id, obligatoria } = req.query;

      const filtros = {};
      if (tipo_documento) filtros.tipo_documento = tipo_documento;
      if (carrera_id) filtros.carrera_id = carrera_id;
      if (obligatoria !== undefined) filtros.obligatoria = obligatoria === 'true';

      const plantillas = await versionesModel.obtenerPlantillas(filtros);

      res.status(200).json({ plantillas });
    } catch (error) {
      logger.error('Error al obtener plantillas', { error: error.message });
      res.status(500).json({ message: 'Error al obtener plantillas', error: error.message });
    }
  },

  /**
   * Descargar plantilla
   */
  async descargarPlantilla(req, res) {
    try {
      const { plantilla_id } = req.params;
      const plantillas = await versionesModel.obtenerPlantillas({});
      const plantilla = plantillas.find(p => p.id == plantilla_id);

      if (!plantilla) {
        return res.status(404).json({ message: 'Plantilla no encontrada' });
      }

      const rutaArchivo = path.resolve(plantilla.archivo_ruta);

      if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
      }

      // Incrementar contador de descargas
      await versionesModel.incrementarDescargas(plantilla_id);

      res.download(rutaArchivo, plantilla.archivo_nombre);
    } catch (error) {
      logger.error('Error al descargar plantilla', { error: error.message });
      res.status(500).json({ message: 'Error al descargar plantilla', error: error.message });
    }
  },

  /**
   * Actualizar plantilla (solo admin)
   */
  async actualizarPlantilla(req, res) {
    try {
      const { plantilla_id } = req.params;
      const actualizadoPorRut = req.session.user.rut;

      const datosActualizacion = { ...req.body };

      if (req.file) {
        datosActualizacion.archivo_nombre = req.file.originalname;
        datosActualizacion.archivo_ruta = req.file.path;
        datosActualizacion.archivo_tipo = req.file.mimetype;
        datosActualizacion.archivo_tamano_kb = Math.round(req.file.size / 1024);
      }

      await versionesModel.actualizarPlantilla(
        plantilla_id, 
        datosActualizacion, 
        actualizadoPorRut
      );

      logger.info('Plantilla actualizada', { 
        usuario: actualizadoPorRut, 
        plantilla_id 
      });

      res.status(200).json({ message: 'Plantilla actualizada exitosamente' });
    } catch (error) {
      logger.error('Error al actualizar plantilla', { error: error.message });
      res.status(500).json({ 
        message: 'Error al actualizar plantilla', 
        error: error.message 
      });
    }
  },

  /**
   * Desactivar plantilla (solo admin)
   */
  async desactivarPlantilla(req, res) {
    try {
      const { plantilla_id } = req.params;

      await versionesModel.desactivarPlantilla(plantilla_id);

      logger.info('Plantilla desactivada', { 
        usuario: req.session.user.rut, 
        plantilla_id 
      });

      res.status(200).json({ message: 'Plantilla desactivada exitosamente' });
    } catch (error) {
      logger.error('Error al desactivar plantilla', { error: error.message });
      res.status(500).json({ 
        message: 'Error al desactivar plantilla', 
        error: error.message 
      });
    }
  },

  // ========== RESULTADOS FINALES ==========

  /**
   * Crear resultado final de proyecto
   */
  async crearResultadoFinal(req, res) {
    try {
      const cerradoPorRut = req.session.user.rut;
      const { proyecto_id } = req.params;

      const datosResultado = {
        proyecto_id,
        ...req.body
      };

      const resultado = await versionesModel.crearResultadoFinal(
        datosResultado, 
        cerradoPorRut
      );

      logger.info('Resultado final creado', { 
        usuario: cerradoPorRut, 
        proyecto_id 
      });

      res.status(201).json({
        message: 'Resultado final creado exitosamente',
        resultado: { id: resultado.id }
      });
    } catch (error) {
      logger.error('Error al crear resultado final', { error: error.message });
      res.status(500).json({ 
        message: 'Error al crear resultado final', 
        error: error.message 
      });
    }
  },

  /**
   * Obtener resultado final de proyecto
   */
  async obtenerResultadoFinal(req, res) {
    try {
      const { proyecto_id } = req.params;
      const resultado = await versionesModel.obtenerResultadoFinal(proyecto_id);

      if (!resultado) {
        return res.status(404).json({ message: 'No hay resultado final para este proyecto' });
      }

      res.status(200).json({ resultado });
    } catch (error) {
      logger.error('Error al obtener resultado final', { error: error.message });
      res.status(500).json({ 
        message: 'Error al obtener resultado final', 
        error: error.message 
      });
    }
  },

  /**
   * Obtener historial de estados de proyecto
   */
  async obtenerHistorialEstados(req, res) {
    try {
      const { proyecto_id } = req.params;
      const historial = await versionesModel.obtenerHistorialEstados(proyecto_id);

      res.status(200).json({ historial });
    } catch (error) {
      logger.error('Error al obtener historial de estados', { error: error.message });
      res.status(500).json({ 
        message: 'Error al obtener historial de estados', 
        error: error.message 
      });
    }
  }
};

export default versionesController;
