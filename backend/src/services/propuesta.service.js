import * as PropuestasModel from '../models/propuesta.model.js';
import { ProjectService } from './project.service.js';
import { pool } from '../db/connectionDB.js';
import { logger } from '../config/logger.js';

// Utilidad para validar RUT chileno simple
const rutValido = (rut) => /^\d{7,8}-[\dkK]$/.test(rut);
const fechaValida = (fecha) => !isNaN(new Date(fecha));
export const estadosValidos = ['pendiente', 'en_revision', 'correcciones', 'aprobada', 'rechazada'];

// ─── helpers internos ────────────────────────────────────────────────────────

/**
 * Obtiene el semestre activo con inscripción abierta.
 */
const obtenerSemestreActivo = async () => {
  const [rows] = await pool.execute(
    'SELECT * FROM semestres WHERE activo = TRUE ORDER BY año DESC, numero DESC LIMIT 1'
  );
  return rows[0] ?? null;
};

/**
 * Verifica si el estudiante ya tiene una inscripción activa (propuesta/proyecto no rechazado/reprobado)
 * en el semestre indicado.
 */
const tieneInscripcionActivaEnSemestre = async (estudiante_rut, semestre_id) => {
  // Verificar propuestas activas (no rechazadas) en este semestre
  const [rows] = await pool.execute(
    `SELECT p.id FROM propuestas p
     INNER JOIN estados_propuestas ep ON p.estado_id = ep.id
     INNER JOIN estudiantes_propuestas eprop ON eprop.propuesta_id = p.id
     WHERE eprop.estudiante_rut = ?
       AND p.semestre_id = ?
       AND ep.nombre NOT IN ('rechazada')
     LIMIT 1`,
    [estudiante_rut, semestre_id]
  );
  return rows.length > 0;
};

/**
 * Verifica si un estudiante tiene al menos un proyecto AP cuyo estado_detallado
 * es 'final_ap' (fase completada) y devuelve ese proyecto o null.
 */
const obtenerAPCompletadoPorEstudiante = async (estudiante_rut) => {
  const [rows] = await pool.execute(
    `SELECT p.id FROM proyectos p
     JOIN estudiantes_proyectos ep ON ep.proyecto_id = p.id
     WHERE ep.estudiante_rut = ? AND p.tipo_proyecto = 'AP' AND p.estado_detallado = 'final_ap'
     ORDER BY p.created_at DESC LIMIT 1`,
    [estudiante_rut]
  );
  return rows[0] ?? null;
};

// ─── helpers internos (continuación) ──────────────────────────────────────────

/**
 * Verifica si el estudiante tiene un profesor guía pre-asignado activo en guias_estudiantes.
 */
const obtenerGuiaEstudiante = async (estudiante_rut) => {
  const [rows] = await pool.execute(
    `SELECT ge.profesor_guia_rut, u.nombre AS profesor_nombre
     FROM guias_estudiantes ge
     INNER JOIN usuarios u ON ge.profesor_guia_rut = u.rut
     WHERE ge.estudiante_rut = ? AND ge.activo = TRUE
     ORDER BY ge.fecha_asignacion DESC LIMIT 1`,
    [estudiante_rut]
  );
  return rows[0] ?? null;
};

// ─── crearPropuesta ───────────────────────────────────────────────────────────

export const crearPropuesta = async (data) => {
  try {
    const esAP         = data.tipo_proyecto === 'AP';
    const continuaAP   = !esAP && data.continua_ap === true;

    // Validaciones básicas obligatorias (comunes a PT y AP)
    if (!data.titulo?.trim() || !data.descripcion?.trim() || !data.estudiante_rut || !data.fecha_envio) {
      throw new Error('Faltan datos obligatorios para crear la propuesta');
    }

    // ── Verificar que el estudiante tiene guía pre-asignado ───────────────────
    const guia = await obtenerGuiaEstudiante(data.estudiante_rut);
    if (!guia) {
      throw new Error('No tienes un profesor guía asignado. Contacta al administrador para que te asigne un profesor guía antes de crear una propuesta.');
    }

    // ── Semestre activo ───────────────────────────────────────────────────────
    const semestre = await obtenerSemestreActivo();
    if (!semestre) {
      throw new Error('No hay un semestre activo. Contacta al administrador.');
    }

    // ── Verificar que el estudiante no esté ya inscrito en este semestre ──────
    const yaInscrito = await tieneInscripcionActivaEnSemestre(data.estudiante_rut, semestre.id);
    if (yaInscrito) {
      throw new Error(`Ya tienes una propuesta activa en el semestre ${semestre.nombre}. Solo puedes inscribir un ramo por semestre.`);
    }

    // Para PT con continuación de AP: verificar que realmente tenga un AP completado
    if (continuaAP) {
      const apOrigen = await obtenerAPCompletadoPorEstudiante(data.estudiante_rut);
      if (!apOrigen) {
        throw new Error('No se encontró un Actividad Práctica completada para continuar como PT');
      }
      data._apOrigenId = apOrigen.id; // lo usaremos al crear el proyecto
    }

    // Modalidad
    const modalidadesValidas = ['desarrollo_software', 'investigacion', 'practica'];
    if (!data.modalidad || !modalidadesValidas.includes(data.modalidad)) {
      throw new Error('Modalidad debe ser "desarrollo_software", "investigacion" o "practica"');
    }

    if (!data.numero_estudiantes || ![1, 2, 3].includes(data.numero_estudiantes)) {
      throw new Error('Número de estudiantes debe ser 1, 2 o 3');
    }

    // Validar estudiantes adicionales si numero_estudiantes > 1
    if (data.numero_estudiantes > 1) {
      if (!data.estudiantes_adicionales || data.estudiantes_adicionales.length === 0) {
        throw new Error(`Debes agregar ${data.numero_estudiantes - 1} estudiante(s) adicional(es)`);
      }
      if (data.estudiantes_adicionales.length !== data.numero_estudiantes - 1) {
        throw new Error(`Debes agregar exactamente ${data.numero_estudiantes - 1} estudiante(s) adicional(es)`);
      }
      // Validar que los RUTs sean válidos
      for (const rut of data.estudiantes_adicionales) {
        if (!rutValido(rut)) {
          throw new Error(`El RUT ${rut} no es válido`);
        }
        // Validar que no sea el mismo estudiante creador
        if (rut === data.estudiante_rut) {
          throw new Error('No puedes agregarte a ti mismo como estudiante adicional');
        }
      }
      // Validar que no haya duplicados
      const rutSet = new Set(data.estudiantes_adicionales);
      if (rutSet.size !== data.estudiantes_adicionales.length) {
        throw new Error('No puedes agregar el mismo estudiante dos veces');
      }
    }

    // Campos extendidos: solo obligatorios en PT normal (no AP, no continua_ap)
    const requiereDetallesCompletos = !esAP && !continuaAP;

    if (!data.complejidad_estimada || !['baja', 'media', 'alta'].includes(data.complejidad_estimada)) {
      throw new Error('Complejidad estimada debe ser "baja", "media" o "alta"');
    }

    if (!data.duracion_estimada_semestres || ![1, 2].includes(data.duracion_estimada_semestres)) {
      throw new Error('Duración estimada debe ser 1 o 2 semestres');
    }

    if (requiereDetallesCompletos) {
      if (!data.area_tematica?.trim())        throw new Error('Área temática es obligatoria');
      if (!data.objetivos_generales?.trim())  throw new Error('Objetivos generales son obligatorios');
      if (!data.objetivos_especificos?.trim())throw new Error('Objetivos específicos son obligatorios');
      if (!data.metodologia_propuesta?.trim())throw new Error('Metodología propuesta es obligatoria');
    }

    // Validación condicional: justificación para 2 estudiantes con complejidad baja
    if (data.numero_estudiantes === 2 && data.complejidad_estimada === 'baja' && requiereDetallesCompletos) {
      if (!data.justificacion_complejidad?.trim()) {
        throw new Error('Justificación de complejidad es requerida para 2 estudiantes con complejidad baja');
      }
    }

    if (!rutValido(data.estudiante_rut)) {
      throw new Error('El RUT del estudiante no es válido');
    }

    if (!fechaValida(data.fecha_envio)) {
      throw new Error('La fecha de envío no es válida');
    }

    // Crear la propuesta (con semestre activo)
    const propuestaId = await PropuestasModel.crearPropuesta({
      ...data,
      tipo_proyecto: data.tipo_proyecto ?? 'PT',
      semestre_id: semestre.id
    });
    // Guardar para uso posterior (transferir al proyecto)
    data._semestreId = semestre.id;

    // Agregar el estudiante creador a estudiantes_propuestas
    await pool.execute(
      `INSERT INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden) VALUES (?, ?, TRUE, 1)`,
      [propuestaId, data.estudiante_rut]
    );

    // Agregar estudiantes adicionales si existen
    if (data.estudiantes_adicionales && data.estudiantes_adicionales.length > 0) {
      for (let i = 0; i < data.estudiantes_adicionales.length; i++) {
        await pool.execute(
          `INSERT INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden) VALUES (?, ?, FALSE, ?)`,
          [propuestaId, data.estudiantes_adicionales[i], i + 2]
        );
      }
    }

    // ── PT que continúa de AP: auto-aprobar y crear proyecto directamente ─────
    if (continuaAP) {
      // Marcar propuesta como aprobada automáticamente
      await pool.execute(
        `UPDATE propuestas SET estado_id = (SELECT id FROM estados_propuestas WHERE nombre = 'aprobada' LIMIT 1),
          fecha_aprobacion = CURDATE() WHERE id = ?`,
        [propuestaId]
      );

      // Obtener el dato completo de la propuesta para crearProyecto
      const propuesta = await PropuestasModel.obtenerPropuestaPorId(propuestaId);

      const proyectoId = await ProjectService.crearProyectoDesdeAprobacion({
        ...propuesta,
        tipo_proyecto: 'PT',
        continua_ap: true,
        ap_origen_id: data._apOrigenId ?? null,
        semestre_id: data._semestreId ?? null
      });

      await PropuestasModel.aprobarPropuesta(propuestaId, proyectoId);

      return { propuestaId, proyectoId, continua_ap: true };
    }

    return propuestaId;
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


// Nuevo método: obtener propuestas de un estudiante específico
export const getPropuestasByEstudiante = async (estudiante_rut) => {
  try {
    if (!rutValido(estudiante_rut)) {
      throw new Error('El RUT del estudiante no es válido');
    }

    const propuestas = await PropuestasModel.getPropuestasByEstudiante(estudiante_rut);
    
    // Agregar permisos: todos los estudiantes del equipo pueden editar y eliminar
    // Solo si la propuesta está en estado "pendiente" o "correcciones"
    const propuestasConPermisos = propuestas.map(propuesta => {
      const estadosEditables = ['pendiente', 'correcciones'];
      const puedeModificar = estadosEditables.includes(propuesta.estado_nombre?.toLowerCase());
      
      return {
        ...propuesta,
        puedeEditar: puedeModificar,
        puedeEliminar: puedeModificar
      };
    });
    
    return propuestasConPermisos || [];
  } catch (error) {
    
    throw error;
  }
};

export const asignarProfesor = async (id, profesor_rut, asignado_por = null) => {
  try {
    if (isNaN(id)) throw new Error('ID de propuesta inválido');

    if (!rutValido(profesor_rut)) {
      throw new Error('El RUT del profesor no es válido');
    }

    const success = await PropuestasModel.asignarProfesor(id, profesor_rut, asignado_por);

    if (success) {
      // Obtener datos adicionales para notificación
      const propuesta = await PropuestasModel.obtenerPropuestaPorId(id);
      const [profesorRows] = await pool.execute('SELECT nombre FROM usuarios WHERE rut = ?', [profesor_rut]);

      return {
        success: true,
        estudiante_rut: propuesta?.estudiante_rut,
        titulo: propuesta?.titulo,
        profesor_nombre: profesorRows[0]?.nombre || 'Profesor'
      };
    }
    
    return null;
  } catch (error) {
    throw error;
  }
};

export const revisarPropuesta = async (id, data) => {
  try {
    if (isNaN(id)) throw new Error('ID de propuesta inválido');

    const comentario = data.comentario || data.comentarios_profesor;
    const { estado } = data;

    // Los comentarios son opcionales cuando el estado es 'aprobada'
    if (estado !== 'aprobada' && (!comentario || comentario.trim().length === 0)) {
      throw new Error('El comentario no puede estar vacío para estados que no sean "aprobada"');
    }

    if (!estado || !estadosValidos.includes(estado)) {
      throw new Error('Estado inválido');
    }

    // Obtener los datos de la propuesta antes de la actualización
    const propuesta = await PropuestasModel.obtenerPropuestaPorId(id);
    if (!propuesta) {
      throw new Error('Propuesta no encontrada');
    }

    // Actualizar la propuesta (solo estado y comentarios)
    // NOTA: Los archivos se guardan en historial_revisiones_propuestas, no en propuestas
    const datosActualizacion = { 
      comentarios_profesor: comentario, 
      estado 
    };
    
    logger.debug('Service - Datos enviados al modelo para revisión', { propuesta_id: id, estado });

    const actualizada = await PropuestasModel.revisarPropuesta(id, datosActualizacion);

    if (!actualizada) {
      throw new Error('Error al actualizar la propuesta');
    }

    // Si el estado es "aprobada", crear automáticamente el proyecto
    if (estado === 'aprobada') {
      try {
        
        
        // Crear el proyecto desde la propuesta aprobada
        const proyectoId = await ProjectService.crearProyectoDesdeAprobacion(propuesta);
        
        // Actualizar la propuesta con el ID del proyecto creado
        await PropuestasModel.aprobarPropuesta(id, proyectoId);
        
        // ❌ NO transferir profesores automáticamente
        // El profesor guía se asignará manualmente (por el profesor o por admin)
        // Los otros roles (revisor, informante) se asignan al final del semestre
        // El profesor de sala es opcional
        
        
        // Crear notificación para administradores sobre el nuevo proyecto
        try {
          await crearNotificacionAdminProyectoCreado(proyectoId, propuesta.titulo);
          
        } catch (notifError) {
          
          // No falla el proceso, solo registra el error
        }
        
        // Nota: Las fechas importantes se crearán manualmente por los profesores
        
        return {
          success: true,
          proyecto_id: proyectoId,
          estudiante_rut: propuesta.estudiante_rut,
          titulo: propuesta.titulo,
          message: 'Propuesta aprobada y proyecto creado. Pendiente de asignación de profesor guía.'
        };
      } catch (projectError) {
        
        // La propuesta ya fue actualizada, pero no se pudo crear el proyecto
        throw new Error(`Propuesta aprobada pero error al crear proyecto: ${projectError.message}`);
      }
    }

    return {
      success: true,
      estudiante_rut: propuesta.estudiante_rut,
      titulo: propuesta.titulo,
      message: 'Propuesta revisada correctamente'
    };

  } catch (error) {
    logger.error('Error al revisar propuesta', { propuesta_id: id, error: error.message });
    throw error;
  }
};

export const obtenerPropuestas = async (carreraFiltro = null) => {
  return await PropuestasModel.obtenerPropuestas(carreraFiltro);
};

export const obtenerPropuestaPorId = async (id, userRut = null, userRole = null) => {
  if (isNaN(id)) throw new Error('ID inválido');
  const propuesta = await PropuestasModel.obtenerPropuestaPorId(id);
  
  // Si se proporciona información del usuario, agregar flags de permisos
  if (propuesta && userRut) {
    const estadosEditables = ['pendiente', 'correcciones'];
    const puedeEditarPorEstado = estadosEditables.includes(propuesta.estado_nombre);
    
    // Verificar si es creador o miembro del equipo
    const esCreador = propuesta.estudiante_rut === userRut;
    let esMiembroEquipo = false;
    
    if (!esCreador && userRole === 1) { // Solo verificar para estudiantes
      const [rows] = await pool.execute(
        'SELECT * FROM estudiantes_propuestas WHERE propuesta_id = ? AND estudiante_rut = ?',
        [id, userRut]
      );
      esMiembroEquipo = rows.length > 0;
    }
    
    const perteneceAlEquipo = esCreador || esMiembroEquipo;
    
    propuesta.puedeEditar = puedeEditarPorEstado && perteneceAlEquipo;
    propuesta.puedeEliminar = puedeEditarPorEstado && perteneceAlEquipo;
  }
  
  return propuesta;
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
  
  
  
  
  // Los super administradores pueden ver absolutamente todo (verificar PRIMERO)
  if (userRole === 4 || userRole === '4') { // SuperAdmin
    
    return true;
  }
  
  // Los administradores pueden ver todas las propuestas
  if (userRole === 3 || userRole === '3') { // Admin
    
    return true;
  }
  
  // El creador siempre puede ver su propuesta
  if (propuesta.estudiante_rut === userRut) {
    
    return true;
  }
  
  // Verificar si el usuario es parte del equipo (estudiante adicional)
  if (userRole === 1 || userRole === '1') { // Estudiante
    const [rows] = await pool.execute(
      'SELECT * FROM estudiantes_propuestas WHERE propuesta_id = ? AND estudiante_rut = ?',
      [propuesta.id, userRut]
    );
    if (rows.length > 0) {
      return true;
    }
  }
  
  // Los profesores pueden ver todas las propuestas sin asignar
  if (userRole === 2 || userRole === '2') { // Profesor
    // Si la propuesta no tiene profesor asignado, cualquier profesor puede verla
    if (!propuesta.profesor_rut || propuesta.profesor_rut === null) {
      
      return true;
    }
    // Si ya tiene profesor asignado, solo ese profesor puede verla
    const puedeVer = propuesta.profesor_rut === userRut;
    
    return puedeVer;
  }
  
  // Otros estudiantes no pueden ver propuestas de otros estudiantes
  
  return false;
};

export const verificarPermisosEdicion = async (propuesta, userRut) => {
  // Verificar si el usuario es el creador original
  if (propuesta.estudiante_rut === userRut) {
    return true;
  }
  
  // Verificar si el usuario es parte del equipo
  const [rows] = await pool.execute(
    'SELECT * FROM estudiantes_propuestas WHERE propuesta_id = ? AND estudiante_rut = ?',
    [propuesta.id, userRut]
  );
  
  return rows.length > 0;
};

/**
 * Crear notificación para administradores cuando se crea un proyecto
 * @param {number} proyecto_id - ID del proyecto creado
 * @param {string} titulo_proyecto - Título del proyecto
 */
const crearNotificacionAdminProyectoCreado = async (proyecto_id, titulo_proyecto) => {
  try {
    // Obtener todos los administradores (rol_id = 3)
    const administradores = await PropuestasModel.obtenerUsuariosPorRol(3);
    
    if (!administradores || administradores.length === 0) {
      
      return;
    }

    const mensaje = `Nuevo proyecto creado automáticamente: "${titulo_proyecto}". Requiere asignación de los 3 roles de profesores para activarse.`;
    
    // Crear notificación para cada administrador
    for (const admin of administradores) {
      await PropuestasModel.crearNotificacion({
        usuario_rut: admin.rut,
        tipo: 'proyecto_creado',
        titulo: 'Nuevo Proyecto Creado',
        mensaje: mensaje,
        proyecto_id: proyecto_id,
        leida: false
      });
    }

    
  } catch (error) {
    
    throw error;
  }
};

// ===== MÉTODOS PARA HISTORIAL DE REVISIONES =====
export const registrarRevisionEnHistorial = async (propuesta_id, profesor_rut, decision, comentarios, archivo_revision = null, nombre_archivo_original = null) => {
  try {
    return await PropuestasModel.registrarRevisionEnHistorial(
      propuesta_id,
      profesor_rut,
      decision,
      comentarios,
      archivo_revision,
      nombre_archivo_original
    );
  } catch (error) {
    
    throw error;
  }
};

export const obtenerHistorialRevisiones = async (propuesta_id) => {
  try {
    return await PropuestasModel.obtenerHistorialRevisiones(propuesta_id);
  } catch (error) {
    
    throw error;
  }
};

// Guardar archivo de propuesta sin sobrescribir
export const guardarArchivoPropuesta = async (propuesta_id, tipo_archivo, archivo, nombre_archivo_original, subido_por, comentario = null) => {
  try {
    const ArchivosPropuestaModel = await import('../models/archivos-propuesta.model.js');
    return await ArchivosPropuestaModel.guardarArchivoPropuesta(
      propuesta_id,
      tipo_archivo,
      archivo,
      nombre_archivo_original,
      subido_por,
      comentario
    );
  } catch (error) {
    
    throw error;
  }
};

// Obtener todos los archivos de una propuesta
export const obtenerArchivosPropuesta = async (propuesta_id) => {
  try {
    const ArchivosPropuestaModel = await import('../models/archivos-propuesta.model.js');
    return await ArchivosPropuestaModel.obtenerArchivosPropuesta(propuesta_id);
  } catch (error) {
    
    throw error;
  }
};

// Actualizar estado de propuesta
export const actualizarEstadoPropuesta = async (propuesta_id, estado) => {
  try {
    // Obtener estado_id basado en el nombre del estado
    const connection = await pool.getConnection();
    
    try {
      const [estados] = await connection.query('SELECT id FROM estados_propuestas WHERE nombre = ?', [estado]);

      if (estados.length === 0) {
        throw new Error(`Estado '${estado}' no encontrado`);
      }

      const estado_id = estados[0].id;

      await connection.query('UPDATE propuestas SET estado_id = ? WHERE id = ?', [estado_id, propuesta_id]);
      
      return { success: true, estado, estado_id };
    } finally {
      connection.release();
    }
  } catch (error) {
    
    throw error;
  }
};
