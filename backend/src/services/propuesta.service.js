import * as PropuestasModel from '../models/propuesta.model.js';
import { ProjectService } from './project.service.js';
import { pool } from '../db/connectionDB.js';

// Utilidad para validar RUT chileno simple
const rutValido = (rut) => /^\d{7,8}-[\dkK]$/.test(rut);
const fechaValida = (fecha) => !isNaN(new Date(fecha));
export const estadosValidos = ['pendiente', 'en_revision', 'correcciones', 'aprobada', 'rechazada'];

export const crearPropuesta = async (data) => {
  try {
    // Validaciones básicas obligatorias
    if (!data.titulo?.trim() || !data.descripcion?.trim() || !data.estudiante_rut || !data.fecha_envio) {
      throw new Error('Faltan datos obligatorios para crear la propuesta');
    }

    // Validaciones nuevos campos obligatorios
    if (!data.modalidad || !['desarrollo_software', 'investigacion'].includes(data.modalidad)) {
      throw new Error('Modalidad debe ser "desarrollo_software" o "investigacion"');
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

    if (!data.complejidad_estimada || !['baja', 'media', 'alta'].includes(data.complejidad_estimada)) {
      throw new Error('Complejidad estimada debe ser "baja", "media" o "alta"');
    }

    if (!data.duracion_estimada_semestres || ![1, 2].includes(data.duracion_estimada_semestres)) {
      throw new Error('Duración estimada debe ser 1 o 2 semestres');
    }

    if (!data.area_tematica?.trim()) {
      throw new Error('Área temática es obligatoria');
    }

    if (!data.objetivos_generales?.trim()) {
      throw new Error('Objetivos generales son obligatorios');
    }

    if (!data.objetivos_especificos?.trim()) {
      throw new Error('Objetivos específicos son obligatorios');
    }

    if (!data.metodologia_propuesta?.trim()) {
      throw new Error('Metodología propuesta es obligatoria');
    }

    // Validación condicional: justificación para 2 estudiantes con complejidad baja
    if (data.numero_estudiantes === 2 && data.complejidad_estimada === 'baja') {
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

    // Crear la propuesta
    const propuestaId = await PropuestasModel.crearPropuesta(data);

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
    console.error('Error en getPropuestasByEstudiante service:', error);
    throw error;
  }
};

export const asignarProfesor = async (id, profesor_rut) => {
  try {
    if (isNaN(id)) throw new Error('ID de propuesta inválido');

    if (!rutValido(profesor_rut)) {
      throw new Error('El RUT del profesor no es válido');
    }

    const success = await PropuestasModel.asignarProfesor(id, profesor_rut);
    
    if (success) {
      // Obtener datos adicionales para notificación
      const propuesta = await PropuestasModel.obtenerPropuestaPorId(id);
      const profesor = await pool.query('SELECT nombre FROM usuarios WHERE rut = ?', [profesor_rut]);
      
      return {
        success: true,
        estudiante_rut: propuesta?.estudiante_rut,
        titulo: propuesta?.titulo,
        profesor_nombre: profesor[0]?.[0]?.nombre || 'Profesor'
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

    if (!comentario || comentario.trim().length === 0) {
      throw new Error('El comentario no puede estar vacío');
    }

    if (!estado || !estadosValidos.includes(estado)) {
      throw new Error('Estado inválido');
    }

    // Obtener los datos de la propuesta antes de la actualización
    const propuesta = await PropuestasModel.obtenerPropuestaPorId(id);
    if (!propuesta) {
      throw new Error('Propuesta no encontrada');
    }

    // Actualizar la propuesta
    const actualizada = await PropuestasModel.revisarPropuesta(id, { comentarios_profesor: comentario, estado });
    
    if (!actualizada) {
      throw new Error('Error al actualizar la propuesta');
    }

    // Si el estado es "aprobada", crear automáticamente el proyecto
    if (estado === 'aprobada') {
      try {
        console.log(`🚀 Propuesta ${id} aprobada. Creando proyecto automáticamente...`);
        
        // Crear el proyecto desde la propuesta aprobada
        const proyectoId = await ProjectService.crearProyectoDesdeAprobacion(propuesta);
        
        // Actualizar la propuesta con el ID del proyecto creado
        await PropuestasModel.aprobarPropuesta(id, proyectoId);
        
        // ❌ NO transferir profesores automáticamente
        // El profesor guía se asignará manualmente (por el profesor o por admin)
        // Los otros roles (revisor, informante) se asignan al final del semestre
        // El profesor de sala es opcional
        console.log(`✅ Proyecto ${proyectoId} creado sin profesores. Esperando asignación manual del profesor guía.`);
        
        // Crear notificación para administradores sobre el nuevo proyecto
        try {
          await crearNotificacionAdminProyectoCreado(proyectoId, propuesta.titulo);
          console.log(`✅ Notificación enviada a administradores para proyecto ${proyectoId}`);
        } catch (notifError) {
          console.error('⚠️ Error al crear notificación para admins:', notifError);
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
        console.error('❌ Error al crear proyecto automáticamente:', projectError);
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
    throw error;
  }
};

export const obtenerPropuestas = async () => {
  return await PropuestasModel.obtenerPropuestas();
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
  // El creador siempre puede ver su propuesta
  if (propuesta.estudiante_rut === userRut) {
    return true;
  }
  
  // Verificar si el usuario es parte del equipo (estudiante adicional)
  if (userRole === 1) { // Estudiante
    const [rows] = await pool.execute(
      'SELECT * FROM estudiantes_propuestas WHERE propuesta_id = ? AND estudiante_rut = ?',
      [propuesta.id, userRut]
    );
    if (rows.length > 0) {
      return true;
    }
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
      console.log('⚠️ No hay administradores para notificar');
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

    console.log(`✅ Notificación enviada a ${administradores.length} administradores sobre proyecto ${proyecto_id}`);
  } catch (error) {
    console.error('Error al crear notificación para administradores:', error);
    throw error;
  }
};
