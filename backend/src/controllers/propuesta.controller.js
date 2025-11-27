import * as PropuestasService from '../services/propuesta.service.js';
import * as FechasLimiteModel from '../models/fechas-limite.model.js';
import path from 'path';
import fs from 'fs';
import { logger } from '../config/logger.js';
import { notifyPropuestaAprobada, notifyPropuestaRechazada, notifyAsignacionProfesor } from '../config/socket.js';
import { sendAsignacionProfesorEmail } from '../services/email.service.js';
import { UserModel } from '../models/user.model.js';

// Endpoint temporal de debug para identificar el problema
export const debugPropuestaController = async (req, res) => {
  try {
    logger.debug('Debug propuesta iniciado', {
      method: req.method,
      url: req.url,
      contentType: req.headers['content-type'],
      body: req.body,
      file: req.file,
      user: { rut: req.rut, rol_id: req.rol_id }
    });

    // Validar qué campos están llegando
    const camposRequeridos = ['titulo', 'descripcion', 'fecha_envio'];
    const camposFaltantes = [];

    camposRequeridos.forEach(campo => {
      if (!req.body[campo] || req.body[campo].trim() === '') {
        camposFaltantes.push(campo);
      }
    });

    logger.debug('Validación de campos', { camposFaltantes });

    // Validar fecha si existe
    if (req.body.fecha_envio) {
      const fecha = new Date(req.body.fecha_envio);
      logger.debug('Validación de fecha', { 
        original: req.body.fecha_envio, 
        parseada: fecha, 
        valida: !isNaN(fecha) 
      });
    }

    res.json({
      success: true,
      debug: {
        method: req.method,
        body: req.body,
        file: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          filename: req.file.filename
        } : null,
        user: {
          rut: req.rut,
          rol: req.rol_id
        },
        camposFaltantes,
        sugerencias: camposFaltantes.length > 0 ? [
          `Faltan estos campos: ${camposFaltantes.join(', ')}`,
          'Verifica que el frontend esté enviando todos los campos requeridos',
          'Asegúrate de que fecha_envio tenga formato YYYY-MM-DD'
        ] : ['Todos los campos requeridos están presentes']
      }
    });

  } catch (error) {
    logger.error('Error en debug propuesta', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

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
    if (!numero_estudiantes || ![1, 2].includes(parseInt(numero_estudiantes))) {
      errores.push('numero_estudiantes debe ser 1 o 2');
    }
    if (!complejidad_estimada || !['baja', 'media', 'alta'].includes(complejidad_estimada)) {
      errores.push('complejidad_estimada debe ser "baja", "media" o "alta"');
    }
    if (!duracion_estimada_semestres || ![1, 2].includes(parseInt(duracion_estimada_semestres))) {
      errores.push('duracion_estimada_semestres debe ser 1 o 2');
    }
    if (!area_tematica || area_tematica.trim() === '') errores.push('area_tematica es requerida');
    if (!objetivos_generales || objetivos_generales.trim() === '') errores.push('objetivos_generales es requerido');
    if (!objetivos_especificos || objetivos_especificos.trim() === '') errores.push('objetivos_especificos es requerido');
    if (!metodologia_propuesta || metodologia_propuesta.trim() === '') errores.push('metodologia_propuesta es requerida');
    if (!estudiante_rut) errores.push('estudiante_rut falta (problema de autenticación)');

    // Validación condicional: si son 2 estudiantes y complejidad baja, requiere justificación
    if (parseInt(numero_estudiantes) === 2 && complejidad_estimada === 'baja') {
      if (!justificacion_complejidad || justificacion_complejidad.trim() === '') {
        errores.push('justificacion_complejidad es requerida para 2 estudiantes con complejidad baja');
      }
    }

    if (errores.length > 0) {
      console.log('❌ Errores de validación:', errores);
      return res.status(400).json({ 
        message: 'Faltan datos obligatorios o son inválidos',
        errores: errores
      });
    }

    // Validar fecha
    const fechaDate = new Date(fecha_envio);
    if (isNaN(fechaDate)) {
      console.log('❌ Fecha inválida:', fecha_envio);
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

    return res.status(201).json({ message: 'Propuesta creada exitosamente', id: nuevaPropuestaId });
  } catch (error) {
    console.error('Error al crear propuesta:', error);
    return res.status(500).json({ message: 'Error interno del servidor', details: error.message });
  }
};

// Endpoint temporal de debug para revisar propuestas
export const debugRevisarPropuesta = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DEBUG REVISAR PROPUESTA ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Params ID:', id);
    console.log('Headers Content-Type:', req.headers['content-type']);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('User from token:', {
      rut: req.rut,
      rol: req.rol,
      role_id: req.role_id
    });

    // Verificar que la propuesta existe
    const propuesta = await PropuestasService.obtenerPropuestaPorId(id);
    console.log('Propuesta existe:', !!propuesta);
    if (propuesta) {
      console.log('Propuesta info:', {
        id: propuesta.id,
        titulo: propuesta.titulo,
        estado_actual: propuesta.estado,
        estudiante_rut: propuesta.estudiante_rut
      });
    }

    const { comentarios_profesor, estado } = req.body;
    
    res.json({
      success: true,
      debug: {
        params: { id },
        body: req.body,
        user: { rut: req.rut, role_id: req.role_id },
        propuestaExiste: !!propuesta,
        propuestaInfo: propuesta ? {
          id: propuesta.id,
          titulo: propuesta.titulo,
          estado_actual: propuesta.estado
        } : null,
        validacion: {
          comentarios_profesor: {
            recibido: !!comentarios_profesor,
            valor: comentarios_profesor || null,
            valido: !!(comentarios_profesor && comentarios_profesor.trim())
          },
          estado: {
            recibido: !!estado,
            valor: estado || null,
            valido: ['pendiente', 'en_revision', 'correcciones', 'aprobada', 'rechazada'].includes(estado)
          }
        },
        formatoEsperado: {
          comentarios_profesor: "string no vacío - Comentarios del profesor sobre la propuesta",
          estado: "string - Uno de: pendiente, en_revision, correcciones, aprobada, rechazada"
        },
        ejemploBody: {
          comentarios_profesor: "La propuesta está bien estructurada y cumple con los requisitos.",
          estado: "aprobada"
        }
      }
    });

  } catch (error) {
    console.error('Error en debug revisar propuesta:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
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

    const resultado = await PropuestasService.asignarProfesor(id, profesor_rut);
    if (!resultado) return res.status(404).json({ message: 'Propuesta no encontrada' });

    // 🔔 Notificar al estudiante sobre la asignación del profesor
    if (resultado.estudiante_rut) {
      // WebSocket notification
      notifyAsignacionProfesor(resultado.estudiante_rut, {
        propuesta_id: id,
        titulo: resultado.titulo || 'Tu propuesta',
        profesor_rut: profesor_rut,
        profesor_nombre: resultado.profesor_nombre || 'Profesor asignado'
      });
      
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

    console.log('=== DEBUG REVISAR PROPUESTA ===');
    console.log('ID propuesta:', id);
    console.log('Body completo:', JSON.stringify(req.body, null, 2));
    console.log('comentarios_profesor:', comentarios_profesor || 'FALTA');
    console.log('estado:', estado || 'FALTA');
    console.log('User info:', { rut: req.rut, role: req.role_id });

    // Validación mejorada con más información
    const errores = [];
    if (!comentarios_profesor || comentarios_profesor.trim() === '') {
      errores.push('comentarios_profesor es requerido y no puede estar vacío');
    }
    if (!estado || estado.trim() === '') {
      errores.push('estado es requerido y no puede estar vacío');
    }

    if (errores.length > 0) {
      console.log('❌ Errores de validación:', errores);
      return res.status(400).json({ 
        message: 'Faltan comentarios o estado.',
        errores: errores,
        datosRecibidos: {
          comentarios_profesor: !!comentarios_profesor,
          estado: !!estado,
          bodyCompleto: req.body
        },
        formatoEsperado: {
          comentarios_profesor: "string no vacío",
          estado: "uno de: pendiente, en_revision, correcciones, aprobada, rechazada"
        }
      });
    }

    const estadosValidos = ['pendiente', 'en_revision', 'correcciones', 'aprobada', 'rechazada'];
    if (!estadosValidos.includes(estado)) {
      console.log('❌ Estado inválido:', estado);
      return res.status(400).json({ 
        message: 'Estado inválido.',
        estadoRecibido: estado,
        estadosValidos: estadosValidos
      });
    }

    console.log('✅ Validación exitosa - procesando...');
    console.log('Estado recibido:', estado);
    console.log('Estados válidos:', estadosValidos);

    const resultado = await PropuestasService.revisarPropuesta(id, { comentarios_profesor, estado });
    
    if (!resultado || !resultado.success) {
      return res.status(404).json({ message: 'Error al procesar la propuesta' });
    }

    // 🔔 Enviar notificaciones WebSocket según el estado
    if (estado === 'aprobada' && resultado.estudiante_rut) {
      notifyPropuestaAprobada(resultado.estudiante_rut, {
        propuesta_id: id,
        titulo: resultado.titulo || 'Tu propuesta',
        comentarios: comentarios_profesor,
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
        comentarios: comentarios_profesor
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
    
    console.log('🔍 obtenerPropuestas - req.user:', req.user);
    console.log('🔍 obtenerPropuestas - rol_id:', rol_id, 'carrera_id:', carrera_id);
    
    // Si es admin/jefe de carrera (rol 3), filtrar por su carrera
    // Si es super admin (rol 4) o no tiene carrera, ver todas las propuestas
    const carreraFiltro = (rol_id === 3 && carrera_id) ? carrera_id : null;
    
    console.log('🔍 obtenerPropuestas - carreraFiltro:', carreraFiltro);
    
    const propuestas = await PropuestasService.obtenerPropuestas(carreraFiltro);
    console.log(`✅ Propuestas obtenidas (rol ${rol_id}, carrera ${carreraFiltro || 'todas'}):`, propuestas.length);
    return res.json(propuestas);
  } catch (error) {
    console.error('❌ Error en obtenerPropuestas:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
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

    const propuesta = await PropuestasService.obtenerPropuestaPorId(id, userRut, userRole);
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
      console.log('❌ No puede actualizar propuesta:', permisoActualizacion.motivo);
      return res.status(403).json({ 
        message: permisoActualizacion.motivo,
        fecha_limite: permisoActualizacion.fecha_limite,
        dias_restantes: permisoActualizacion.dias_restantes,
        fuera_de_plazo: true
      });
    }
    console.log('✅ Puede actualizar propuesta:', permisoActualizacion.motivo);

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
