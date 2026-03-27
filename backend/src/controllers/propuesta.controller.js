import * as PropuestasService from '../services/propuesta.service.js';
import * as FechasLimiteModel from '../models/fechas-limite.model.js';
import path from 'path';
import fs from 'fs';
import { logger } from '../config/logger.js';
import { notifyPropuestaAprobada, notifyPropuestaRechazada, notifyAsignacionProfesor } from '../config/socket.js';
import { sendAsignacionProfesorEmail } from '../services/email.service.js';
import { UserModel } from '../models/user.model.js';
import { pool } from '../db/connectionDB.js';

// DEBUG ENDPOINT REMOVED FOR PRODUCTION

export const crearPropuestaController = async (req, res) => {
  logger.info('Iniciando creación de propuesta', { 
    rut: req.rut, 
    body: req.body, 
    file: req.file?.originalname 
  });

  try {
    const { 
      titulo, 
      descripcion, 
      fecha_envio, 
      estado,
      modalidad,
      numero_estudiantes,
      complejidad_estimada,
      justificacion_complejidad,
      duracion_estimada_semestres,
      area_tematica,
      objetivos_generales,
      objetivos_especificos,
      metodologia_propuesta,
      recursos_necesarios,
      bibliografia
    } = req.body;
    
    // Parsear estudiantes_adicionales si viene como string JSON
    let estudiantes_adicionales = req.body.estudiantes_adicionales;
    if (typeof estudiantes_adicionales === 'string' && estudiantes_adicionales.trim() !== '') {
      try {
        estudiantes_adicionales = JSON.parse(estudiantes_adicionales);
      } catch (e) {
        logger.error('Error parseando estudiantes_adicionales', { error: e.message, valor: estudiantes_adicionales });
        estudiantes_adicionales = [];
      }
    } else if (!estudiantes_adicionales) {
      estudiantes_adicionales = [];
    }
    
    const estudiante_rut = req.rut;

    logger.debug('Datos extraídos de propuesta', {
      titulo: titulo || 'FALTA',
      descripcion: descripcion || 'FALTA', 
      fecha_envio: fecha_envio || 'FALTA',
      modalidad: modalidad || 'FALTA',
      numero_estudiantes: numero_estudiantes || 'FALTA',
      estudiantes_adicionales: estudiantes_adicionales,
      estudiantes_adicionales_length: estudiantes_adicionales?.length,
      area_tematica: area_tematica || 'FALTA',
      estudiante_rut: estudiante_rut || 'FALTA'
    });

    // 🔒 VALIDAR FECHA LÍMITE PARA CREAR PROPUESTA
    const permisoCreacion = await FechasLimiteModel.verificarPermisoCrearPropuesta(estudiante_rut);
    if (!permisoCreacion.puede_crear) {
      logger.warn('Intento de crear propuesta fuera de plazo', { 
        rut: estudiante_rut, 
        motivo: permisoCreacion.motivo 
      });
      return res.status(403).json({ 
        message: permisoCreacion.motivo,
        fecha_limite: permisoCreacion.fecha_limite,
        dias_restantes: permisoCreacion.dias_restantes,
        fuera_de_plazo: true
      });
    }
    logger.info('Propuesta dentro del plazo', { motivo: permisoCreacion.motivo });

    // Validación estricta de campos obligatorios
    const errores = [];
    if (!titulo || titulo.trim() === '') errores.push('titulo es requerido');
    if (!descripcion || descripcion.trim() === '') errores.push('descripcion es requerida');
    if (!fecha_envio) errores.push('fecha_envio es requerida');
    if (!modalidad || !['desarrollo_software', 'investigacion'].includes(modalidad)) {
      errores.push('modalidad debe ser "desarrollo_software" o "investigacion"');
    }
    if (!numero_estudiantes || ![1, 2, 3].includes(parseInt(numero_estudiantes))) {
      errores.push('numero_estudiantes debe ser 1, 2 o 3');
    }
    if (!duracion_estimada_semestres || ![1, 2].includes(parseInt(duracion_estimada_semestres))) {
      errores.push('duracion_estimada_semestres debe ser 1 o 2');
    }
    if (!estudiante_rut) errores.push('estudiante_rut falta (problema de autenticación)');

    // Validación de estudiantes adicionales
    if (parseInt(numero_estudiantes) > 1) {
      if (!estudiantes_adicionales || estudiantes_adicionales.length === 0) {
        errores.push('Se requiere especificar los estudiantes adicionales cuando numero_estudiantes > 1');
      } else if (estudiantes_adicionales.length !== parseInt(numero_estudiantes) - 1) {
        errores.push(`Se requieren ${parseInt(numero_estudiantes) - 1} estudiantes adicionales pero se recibieron ${estudiantes_adicionales.length}`);
      }
    }

    if (errores.length > 0) {
      logger.warn('Errores de validación en propuesta', { errores });
      return res.status(400).json({
        message: 'Faltan datos obligatorios o son inválidos',
        errores: errores
      });
    }

    // Validar fecha
    const fechaDate = new Date(fecha_envio);
    if (isNaN(fechaDate)) {
      logger.warn('Fecha inválida en propuesta', { fecha_envio });
      return res.status(400).json({ 
        message: 'La fecha_envio no es válida. Formato esperado: YYYY-MM-DD',
        fecha_recibida: fecha_envio
      });
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
      modalidad,
      numero_estudiantes: parseInt(numero_estudiantes),
      estudiantes_adicionales,
      complejidad_estimada,
      justificacion_complejidad,
      duracion_estimada_semestres: parseInt(duracion_estimada_semestres),
      area_tematica,
      objetivos_generales,
      objetivos_especificos,
      metodologia_propuesta,
      recursos_necesarios,
      bibliografia
    });

    // Guardar archivo inicial en historial
    if (archivo) {
      try {
        logger.info('Guardando archivo inicial en historial', { archivo });
        await PropuestasService.guardarArchivoPropuesta(
          nuevaPropuestaId,
          'propuesta_inicial',
          archivo,
          nombre_archivo_original,
          estudiante_rut,
          'Versión inicial de la propuesta'
        );
        logger.info('Archivo inicial guardado en historial');
      } catch (error) {
        logger.warn('Error al guardar archivo inicial en historial', { error: error.message });
        // No fallar la creación si falla el guardado del historial
      }
    }

    return res.status(201).json({ message: 'Propuesta creada exitosamente', id: nuevaPropuestaId });
  } catch (error) {
    logger.error('Error al crear propuesta', { error: error.message });
    return res.status(500).json({ message: 'Error interno del servidor', details: error.message });
  }
};

// DEBUG ENDPOINT REMOVED FOR PRODUCTION

// Nuevo método: obtener propuestas de un estudiante específico
export const getPropuestasEstudiante = async (req, res) => {
  try {
    const estudiante_rut = req.rut; // El RUT viene del middleware de autenticación

    logger.debug('Obteniendo propuestas para estudiante', { rut: estudiante_rut });

    const propuestas = await PropuestasService.getPropuestasByEstudiante(estudiante_rut);
    
    if (!propuestas || propuestas.length === 0) {
      return res.json([]);
    }

    return res.json(propuestas);
  } catch (error) {
    logger.error('Error al obtener propuestas del estudiante', { error: error.message });
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const asignarProfesor = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol_id } = req.user || {};
    const asignado_por = req.rut;

    // Admins (rol 3 y 4) pueden asignar cualquier profesor pasando profesor_rut en el body
    // Profesores (rol 2) se asignan a sí mismos
    const esAdmin = rol_id === 3 || rol_id === 4 || rol_id === '3' || rol_id === '4';
    const profesor_rut = (esAdmin && req.body?.profesor_rut) ? req.body.profesor_rut : req.rut;

    if (!profesor_rut) {
      return res.status(400).json({ message: 'Datos incompletos para asignar profesor.' });
    }

    const resultado = await PropuestasService.asignarProfesor(id, profesor_rut, asignado_por);
    if (!resultado) return res.status(404).json({ message: 'Propuesta no encontrada' });

    // 🔔 Notificar al profesor sobre su asignación a la propuesta
    if (resultado.estudiante_rut) {
      // WebSocket notification
      notifyAsignacionProfesor(profesor_rut, {
        id: id,
        nombre: resultado.titulo || 'Propuesta sin título'
      }, 'Evaluador');
      
      // 📧 Email notification
      try {
        const estudiante = await UserModel.findPersonByRut(resultado.estudiante_rut);
        if (estudiante && estudiante.email && estudiante.rol_id !== 3) { // No enviar a admins
          await sendAsignacionProfesorEmail(
            estudiante.email,
            estudiante.nombre,
            resultado.titulo,
            resultado.profesor_nombre
          );
          logger.info('Email de asignación enviado', { 
            propuesta_id: id, 
            estudiante_email: estudiante.email 
          });
        }
      } catch (emailError) {
        logger.error('Error al enviar email de asignación', { error: emailError.message });
        // No falla el proceso, solo registra el error
      }
      
      logger.info('Profesor asignado a propuesta - notificaciones enviadas', { 
        propuesta_id: id, 
        profesor: profesor_rut,
        estudiante: resultado.estudiante_rut 
      });
    }

    return res.json({ message: 'Profesor asignado correctamente' });
  } catch (error) {
    logger.error('Error al asignar profesor', { error: error.message, propuesta_id: req.params.id });
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const revisarPropuesta = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentarios_profesor, estado } = req.body;
    const userRut = req.rut;
    const userRole = req.rol_id;
    const carrerasAdministradas = req.user?.carreras_administradas || [];
    const archivoRevision = req.file; // Multer agrega el archivo aquí

    logger.info('Iniciando revisión de propuesta', {
      id,
      estado: estado || 'FALTA',
      archivo: archivoRevision ? archivoRevision.filename : 'sin archivo',
      rut: userRut,
      role: userRole
    });

    // Validación mejorada con más información
    const errores = [];
    
    // Los comentarios son obligatorios solo si el estado NO es 'aprobada'
    if (estado !== 'aprobada' && (!comentarios_profesor || comentarios_profesor.trim() === '')) {
      errores.push('comentarios_profesor es requerido y no puede estar vacío (excepto cuando el estado es "aprobada")');
    }
    
    if (!estado || estado.trim() === '') {
      errores.push('estado es requerido y no puede estar vacío');
    }

    if (errores.length > 0) {
      logger.warn('Errores de validación en revisión', { errores });
      return res.status(400).json({
        message: 'Faltan comentarios o estado.',
        errores: errores,
        datosRecibidos: {
          comentarios_profesor: !!comentarios_profesor,
          estado: !!estado,
          bodyCompleto: req.body
        },
        formatoEsperado: {
          comentarios_profesor: "string no vacío (opcional si estado es 'aprobada')",
          estado: "uno de: pendiente, en_revision, correcciones, aprobada, rechazada"
        }
      });
    }

    const estadosValidos = ['pendiente', 'en_revision', 'correcciones', 'aprobada', 'rechazada'];
    if (!estadosValidos.includes(estado)) {
      logger.warn('Estado inválido en revisión de propuesta', { estado });
      return res.status(400).json({ 
        message: 'Estado inválido.',
        estadoRecibido: estado,
        estadosValidos: estadosValidos
      });
    }

    logger.debug('Validación de revisión exitosa', { estado });

    // Verificar permisos según rol
    // SuperAdmin: puede revisar todas las propuestas
    // Admin: solo puede revisar propuestas de estudiantes de sus carreras
    // Profesor: puede revisar propuestas asignadas o sin asignar
    if (userRole === 3) { // Admin
      // Verificar que la propuesta sea de un estudiante de una carrera que administra
      const propuesta = await PropuestasService.obtenerPropuestaPorId(id);
      if (!propuesta) {
        return res.status(404).json({ message: 'Propuesta no encontrada' });
      }

      // Obtener la carrera del estudiante
      const [estudianteInfo] = await pool.execute(
        `SELECT u.rut, c.id as carrera_id, c.nombre as carrera_nombre
         FROM usuarios u
         LEFT JOIN estudiantes_carreras ec ON u.rut = ec.estudiante_rut AND ec.es_carrera_principal = TRUE
         LEFT JOIN carreras c ON ec.carrera_id = c.id
         WHERE u.rut = ?`,
        [propuesta.estudiante_rut]
      );

      if (estudianteInfo.length === 0 || !estudianteInfo[0].carrera_id) {
        return res.status(403).json({ 
          message: 'No tienes permisos para revisar esta propuesta (estudiante sin carrera asignada)' 
        });
      }

      const carreraEstudiante = estudianteInfo[0].carrera_id;
      
      if (!carrerasAdministradas.includes(carreraEstudiante)) {
        return res.status(403).json({ 
          message: 'No tienes permisos para revisar esta propuesta (no administras la carrera del estudiante)',
          carreraEstudiante: estudianteInfo[0].carrera_nombre,
          carrerasAdministradas: carrerasAdministradas
        });
      }

      logger.debug('Admin verificado para revisión', { carrera: estudianteInfo[0].carrera_nombre });
    }
    // SuperAdmin (rol 4) y Profesores (rol 2) no necesitan verificación adicional aquí

    // Preparar datos de revisión
    // Si no hay comentarios (cuando estado es 'aprobada'), convertir a null para SQL
    const comentariosNormalizados = comentarios_profesor && comentarios_profesor.trim() !== '' ? comentarios_profesor : null;
    
    const datosRevision = { 
      comentarios_profesor: comentariosNormalizados, 
      estado 
    };

    const resultado = await PropuestasService.revisarPropuesta(id, datosRevision);
    
    if (!resultado || !resultado.success) {
      return res.status(404).json({ message: 'Error al procesar la propuesta' });
    }

    // Guardar archivo de revisión del profesor en tabla de archivos (sin sobrescribir)
    if (archivoRevision) {
      await PropuestasService.guardarArchivoPropuesta(
        id,
        'revision_profesor',
        archivoRevision.filename,
        archivoRevision.originalname,
        userRut,
        comentariosNormalizados
      );
    }

    // Registrar en historial de revisiones
    await PropuestasService.registrarRevisionEnHistorial(
      id,
      userRut,
      estado,
      comentariosNormalizados,
      archivoRevision ? archivoRevision.filename : null,
      archivoRevision ? archivoRevision.originalname : null
    );

    // 🔔 Enviar notificaciones WebSocket según el estado
    if (estado === 'aprobada' && resultado.estudiante_rut) {
      notifyPropuestaAprobada(resultado.estudiante_rut, {
        propuesta_id: id,
        titulo: resultado.titulo || 'Tu propuesta',
        comentarios: comentariosNormalizados,
        proyecto_id: resultado.proyecto_id
      });
      logger.info('Propuesta aprobada - notificación enviada', {
        propuesta_id: id,
        estudiante: resultado.estudiante_rut
      });
    } else if (estado === 'rechazada' && resultado.estudiante_rut) {
      notifyPropuestaRechazada(resultado.estudiante_rut, {
        propuesta_id: id,
        titulo: resultado.titulo || 'Tu propuesta',
        comentarios: comentariosNormalizados
      });
      logger.info('Propuesta rechazada - notificación enviada', { 
        propuesta_id: id, 
        estudiante: resultado.estudiante_rut 
      });
    }

    // Si se creó un proyecto automáticamente, incluir esa información en la respuesta
    if (resultado.proyecto_id) {
      return res.json({ 
        message: resultado.message,
        proyecto_id: resultado.proyecto_id,
        proyecto_creado: true
      });
    }

    return res.json({ message: resultado.message });
  } catch (error) {
    logger.error('Error al revisar propuesta', { error: error.message, propuesta_id: req.params.id });
    return res.status(500).json({ message: error.message || 'Error interno del servidor' });
  }
};

export const obtenerPropuestas = async (req, res) => {
  try {
    const { rol_id, carrera_id } = req.user || {};
    
    logger.debug('obtenerPropuestas', { rol_id, carrera_id });
    
    // Los estudiantes (rol 1) deben usar /estudiante/mis-propuestas
    if (rol_id === 1 || rol_id === '1') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Los estudiantes deben usar el endpoint /estudiante/mis-propuestas',
        code: 'FORBIDDEN_ESTUDIANTE'
      });
    }
    
    // Si es admin/jefe de carrera (rol 3), filtrar por su carrera
    // Si es super admin (rol 4) o no tiene carrera, ver todas las propuestas
    const carreraFiltro = (rol_id === 3 && carrera_id) ? carrera_id : null;
    
    const propuestas = await PropuestasService.obtenerPropuestas(carreraFiltro);
    logger.info('Propuestas obtenidas', { rol_id, carreraFiltro: carreraFiltro || 'todas', total: propuestas.length });
    return res.json(propuestas);
  } catch (error) {
    logger.error('Error en obtenerPropuestas', { error: error.message });
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

export const obtenerPropuestaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const userRut = req.rut;
    const userRole = req.rol_id;

    logger.debug('Verificando permisos de propuesta', { id, rut: userRut, role: userRole });

    const propuesta = await PropuestasService.obtenerPropuestaPorId(id, userRut, userRole);
    if (!propuesta) return res.status(404).json({ message: 'Propuesta no encontrada' });

    // SuperAdmin y Admin tienen acceso total (verificación directa)
    if (userRole === 4 || userRole === 3) {
      return res.json(propuesta);
    }

    const puedeVer = await PropuestasService.verificarPermisosVisualizacion(propuesta, userRut, userRole);

    if (!puedeVer) {
      return res.status(403).json({ message: 'No tienes permisos para ver esta propuesta' });
    }

    return res.json(propuesta);
  } catch (error) {
    logger.error('Error al obtener propuesta por ID', { error: error.message, id: req.params.id });
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const eliminarPropuesta = async (req, res) => {
  try {
    const { id } = req.params;
    const userRut = req.rut;
    const userRole = req.rol_id;
    
    // Obtener la propuesta
    const propuesta = await PropuestasService.obtenerPropuestaPorId(id);
    if (!propuesta) return res.status(404).json({ message: 'Propuesta no encontrada' });
    
    // Verificar permisos de edición (los administradores pueden eliminar cualquier propuesta)
    if (userRole !== 3) { // Si no es administrador
      const puedeEditar = await PropuestasService.verificarPermisosEdicion(propuesta, userRut);
      if (!puedeEditar) {
        return res.status(403).json({ message: 'No tienes permisos para eliminar esta propuesta' });
      }
    }
    
    const success = await PropuestasService.eliminarPropuesta(id);
    if (!success) return res.status(500).json({ message: 'Error al eliminar la propuesta' });

    return res.json({ message: 'Propuesta eliminada correctamente' });
  } catch (error) {
    logger.error('Error al eliminar propuesta', { error: error.message, id: req.params.id });
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const ActualizarPropuesta = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      titulo, 
      descripcion,
      modalidad,
      numero_estudiantes,
      complejidad_estimada,
      justificacion_complejidad,
      duracion_estimada_semestres,
      area_tematica,
      objetivos_generales,
      objetivos_especificos,
      metodologia_propuesta,
      recursos_necesarios,
      bibliografia
    } = req.body;
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

    // 🔒 VALIDAR FECHA LÍMITE SEGÚN EL ESTADO DE LA PROPUESTA
    const permisoActualizacion = await FechasLimiteModel.verificarPermisoActualizarPropuesta(
      id, 
      estudiante_rut, 
      propuesta.estado
    );
    
    if (!permisoActualizacion.puede_actualizar) {
      logger.warn('No puede actualizar propuesta', { motivo: permisoActualizacion.motivo, id });
      return res.status(403).json({ 
        message: permisoActualizacion.motivo,
        fecha_limite: permisoActualizacion.fecha_limite,
        dias_restantes: permisoActualizacion.dias_restantes,
        fuera_de_plazo: true
      });
    }
    logger.debug('Puede actualizar propuesta', { motivo: permisoActualizacion.motivo });

    let archivoPath = undefined; // undefined significa que no se actualiza el archivo
    let nombreArchivoOriginal = undefined;
    
    if (req.file) {
      archivoPath = req.file.filename; // Nombre del archivo generado por el servidor
      nombreArchivoOriginal = req.file.originalname; // Nombre original del archivo
      
      // GUARDAR archivo anterior en historial (NO eliminarlo)
      if (propuesta.archivo) {
        try {
          logger.info('Guardando archivo anterior en historial', { archivo: propuesta.archivo });
          await PropuestasService.guardarArchivoPropuesta(
            id,
            'correccion_estudiante',
            propuesta.archivo,
            propuesta.nombre_archivo_original || 'archivo_anterior.pdf',
            estudiante_rut,
            'Versión anterior antes de corrección'
          );
          logger.info('Archivo anterior guardado en historial');
        } catch (error) {
          logger.warn('Error al guardar archivo anterior en historial', { error: error.message });
          // No fallar la actualización si falla el guardado del historial
        }
      }
      
      // Guardar el nuevo archivo en historial también
      try {
        logger.info('Guardando nuevo archivo en historial', { archivo: archivoPath });
        await PropuestasService.guardarArchivoPropuesta(
          id,
          'correccion_estudiante',
          archivoPath,
          nombreArchivoOriginal,
          estudiante_rut,
          'Nueva versión con correcciones'
        );
        logger.info('Nuevo archivo guardado en historial');
      } catch (error) {
        logger.warn('Error al guardar nuevo archivo en historial', { error: error.message });
      }
    }

    const success = await PropuestasService.actualizarPropuesta(id, {
      titulo,
      descripcion,
      estudiante_rut,
      fecha_envio: fechaEnvioFinal,
      archivo: archivoPath,
      nombre_archivo_original: nombreArchivoOriginal,
      modalidad,
      numero_estudiantes,
      complejidad_estimada,
      justificacion_complejidad,
      duracion_estimada_semestres,
      area_tematica,
      objetivos_generales,
      objetivos_especificos,
      metodologia_propuesta,
      recursos_necesarios,
      bibliografia
    });

    if (!success) return res.status(404).json({ message: 'Propuesta no encontrada' });

    return res.json({ message: 'Propuesta actualizada correctamente' });
  } catch (error) {
    logger.error('Error al actualizar propuesta', { error: error.message, id: req.params.id });
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const getPropuestasPorProfesor = async (req, res) => {
  try {
    const profesor_rut = req.rut;

    const propuestas = await PropuestasService.getPropuestasAsignadasAlProfesor(profesor_rut);

    res.status(200).json(propuestas);
  } catch (error) {
    logger.error('Error al obtener propuestas del profesor', { error: error.message });
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const obtenerHistorialRevisiones = async (req, res) => {
  try {
    const { id } = req.params;
    
    const historial = await PropuestasService.obtenerHistorialRevisiones(id);
    
    return res.status(200).json(historial);
  } catch (error) {
    logger.error('Error al obtener historial de revisiones', { error: error.message });
    return res.status(500).json({ 
      message: 'Error al obtener el historial de revisiones',
      details: error.message 
    });
  }
};

// Obtener todos los archivos de una propuesta
export const obtenerArchivosPropuesta = async (req, res) => {
  try {
    const { propuesta_id } = req.params;
    
    const archivos = await PropuestasService.obtenerArchivosPropuesta(propuesta_id);
    
    return res.status(200).json(archivos);
  } catch (error) {
    logger.error('Error al obtener archivos de propuesta', { error: error.message });
    return res.status(500).json({ 
      message: 'Error al obtener los archivos',
      details: error.message 
    });
  }
};

// Descargar un archivo específico
export const descargarArchivo = async (req, res) => {
  try {
    const { archivo_id } = req.params;
    
    // Obtener información del archivo
    const ArchivosPropuestaModel = await import('../models/archivos-propuesta.model.js');
    const archivo = await ArchivosPropuestaModel.obtenerArchivoPorId(archivo_id);
    
    if (!archivo) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    // Construir ruta completa del archivo
    const filePath = path.join(process.cwd(), 'uploads', 'propuestas', archivo.archivo);
    
    // Verificar que el archivo existe
    const fs = await import('fs');
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
    }
    
    // Descargar archivo con nombre original
    return res.download(filePath, archivo.nombre_archivo_original);
  } catch (error) {
    logger.error('Error al descargar archivo', { error: error.message });
    return res.status(500).json({ 
      message: 'Error al descargar el archivo',
      details: error.message 
    });
  }
};

// Estudiante sube corrección
export const subirCorreccion = async (req, res) => {
  try {
    const { id } = req.params;
    const userRut = req.rut;
    const archivoCorreccion = req.file;
    
    // Verificar que el estudiante es el dueño de la propuesta
    const propuesta = await PropuestasService.obtenerPropuestaPorId(id, userRut, 1);
    
    if (!propuesta) {
      return res.status(404).json({ message: 'Propuesta no encontrada' });
    }
    
    if (propuesta.estudiante_rut !== userRut) {
      return res.status(403).json({ message: 'No tienes permiso para subir archivos a esta propuesta' });
    }
    
    // Verificar que el estado permite correcciones
    if (propuesta.estado !== 'correcciones') {
      return res.status(400).json({ 
        message: 'Solo puedes subir correcciones cuando la propuesta está en estado "correcciones"',
        estado_actual: propuesta.estado
      });
    }
    
    if (!archivoCorreccion) {
      return res.status(400).json({ message: 'Debes subir un archivo' });
    }
    
    // Guardar archivo de corrección en tabla de archivos
    const resultado = await PropuestasService.guardarArchivoPropuesta(
      id,
      'correccion_estudiante',
      archivoCorreccion.filename,
      archivoCorreccion.originalname,
      userRut,
      'Corrección del estudiante'
    );
    
    // Actualizar estado de la propuesta a "en_revision" para que el profesor la revise nuevamente
    await PropuestasService.actualizarEstadoPropuesta(id, 'en_revision');
    
    logger.info('Corrección de estudiante subida', { 
      propuesta_id: id, 
      estudiante: userRut,
      archivo: archivoCorreccion.filename,
      version: resultado.version
    });
    
    return res.json({ 
      message: 'Corrección subida exitosamente. La propuesta ha sido enviada nuevamente a revisión.',
      version: resultado.version
    });
  } catch (error) {
    logger.error('Error al subir corrección', { error: error.message, propuesta_id: req.params.id });
    return res.status(500).json({ message: error.message || 'Error interno del servidor' });
  }
};
