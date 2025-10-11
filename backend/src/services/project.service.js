import { ProjectModel, actualizarEstadoProyecto, obtenerProfesoresProyecto } from '../models/project.model.js';
import * as fechasImportantesModel from '../models/fechas-importantes.model.js';
import * as asignacionesProfesoresModel from '../models/asignaciones-profesores.model.js';
import * as AvanceModel from '../models/avance.model.js';

const createProject = async (titulo, descripcion, estudianteId) => {
    if (!titulo || !descripcion) {
        throw new Error('Título y descripción son obligatorios');
    }
    return await ProjectModel.createProject(titulo, descripcion, estudianteId);
};

const getProjects = async () => {
    return await ProjectModel.getProjects();
}

const getDetailProject = async (projectId) => {
    return await ProjectModel.getDetailProject(projectId);
}

const deleteProject = async (projectId) => {
    return await ProjectModel.deleteProject(projectId);
}

/**
 * Crear un proyecto desde una propuesta aprobada
 * @param {Object} propuestaData - Datos de la propuesta aprobada
 * @returns {Promise<number>} - ID del proyecto creado
 */
const crearProyectoDesdeAprobacion = async (propuestaData) => {
    try {
        // Validar que la propuesta tenga los datos necesarios
        if (!propuestaData) {
            throw new Error('No se proporcionaron datos de la propuesta');
        }

        const { id, titulo, descripcion, estudiante_rut } = propuestaData;

        if (!id || !titulo || !descripcion || !estudiante_rut) {
            throw new Error('Faltan datos obligatorios de la propuesta para crear el proyecto');
        }

        // Crear el objeto del proyecto con los datos de la propuesta
        const proyectoData = {
            titulo: titulo,
            descripcion: descripcion,
            propuesta_id: id,
            estudiante_rut: estudiante_rut,
            estado_id: 1, // 'esperando_asignacion_profesores' - Estado inicial hasta que se asignen los 3 profesores
            fecha_inicio: new Date(),
            fecha_entrega_estimada: null, // Se puede establecer después
            fecha_entrega_real: null,
            fecha_defensa: null
        };

        // Crear el proyecto usando el modelo
        const proyectoId = await ProjectModel.crearProyectoCompleto(proyectoData);

        console.log(`✅ Proyecto creado automáticamente: ID ${proyectoId} para propuesta ${id}`);

        return proyectoId;
    } catch (error) {
        console.error('Error al crear proyecto desde aprobación:', error);
        throw error;
    }
};

/**
 * Transferir asignaciones de profesores de propuesta a proyecto
 * @param {number} propuesta_id - ID de la propuesta
 * @param {number} proyecto_id - ID del proyecto
 */
const transferirAsignacionesProfesores = async (propuesta_id, proyecto_id) => {
    try {
        // Obtener profesores asignados a la propuesta
        const profesoresAsignados = await ProjectModel.obtenerProfesoresAsignadosPropuesta(propuesta_id);
        
        if (!profesoresAsignados || profesoresAsignados.length === 0) {
            console.log('⚠️  No hay profesores asignados a la propuesta');
            return;
        }

        // Asignar cada profesor al proyecto con rol por defecto de 'profesor_guia'
        for (const profesor of profesoresAsignados) {
            await ProjectModel.asignarProfesorProyecto({
                proyecto_id: proyecto_id,
                profesor_rut: profesor.profesor_rut,
                rol_profesor_id: 1 // 'profesor_guia' por defecto
            });
        }

        console.log(`✅ Transferidas asignaciones de ${profesoresAsignados.length} profesores al proyecto`);
        
        // Verificar si ahora se cumplen los 3 roles y activar automáticamente el proyecto
        await verificarYActivarProyectoSiCompleto(proyecto_id);
    } catch (error) {
        console.error('Error al transferir asignaciones de profesores:', error);
        throw error;
    }
};

/**
 * Verificar si un proyecto tiene los 3 roles asignados y activarlo automáticamente
 * @param {number} proyecto_id - ID del proyecto
 */
const verificarYActivarProyectoSiCompleto = async (proyecto_id) => {
    try {
        // Obtener los profesores asignados al proyecto con sus roles
        const profesoresAsignados = await obtenerProfesoresProyecto(proyecto_id);
        
        if (!profesoresAsignados || profesoresAsignados.length === 0) {
            console.log(`⚠️ Proyecto ${proyecto_id}: No hay profesores asignados`);
            return false;
        }

        // Verificar que estén los 3 roles: profesor_guia (1), profesor_revisor (2), profesor_informante (3)
        const rolesRequeridos = [1, 2, 3];
        const rolesAsignados = profesoresAsignados.map(p => p.rol_profesor_id);
        
        const todosCumplidos = rolesRequeridos.every(rol => rolesAsignados.includes(rol));
        
        if (todosCumplidos) {
            // Cambiar el estado del proyecto a 'en_desarrollo' (estado_id = 2)
            await actualizarEstadoProyecto(proyecto_id, 2);
            console.log(`✅ Proyecto ${proyecto_id} activado automáticamente - Todos los roles asignados`);
            
            // TODO: Crear notificación para el estudiante
            // await crearNotificacionProyectoActivado(proyecto_id);
            
            return true;
        } else {
            console.log(`⚠️ Proyecto ${proyecto_id}: Faltan roles. Asignados: [${rolesAsignados.join(', ')}], Requeridos: [${rolesRequeridos.join(', ')}]`);
            return false;
        }
    } catch (error) {
        console.error('Error al verificar y activar proyecto:', error);
        return false;
    }
};

/**
 * Obtener proyectos según los permisos del usuario
 * @param {string} usuario_rut - RUT del usuario
 * @param {string} rol_usuario - Rol del usuario ('admin', 'profesor', 'estudiante')
 * @returns {Promise<Array>} - Lista de proyectos que el usuario puede ver
 */
const obtenerProyectosPorPermisos = async (usuario_rut, rol_usuario) => {
    if (!usuario_rut || !rol_usuario) {
        throw new Error('Usuario y rol son requeridos');
    }
    
    return await ProjectModel.obtenerProyectosPorPermisos(usuario_rut, rol_usuario);
};

/**
 * Obtener proyecto por ID con verificación de permisos
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} usuario_rut - RUT del usuario
 * @param {string} rol_usuario - Rol del usuario
 * @returns {Promise<Object|null>} - Datos del proyecto o null si no tiene permisos
 */
const obtenerProyectoPorIdConPermisos = async (proyecto_id, usuario_rut, rol_usuario) => {
    if (!proyecto_id || !usuario_rut || !rol_usuario) {
        throw new Error('ID del proyecto, usuario y rol son requeridos');
    }
    
    return await ProjectModel.obtenerProyectoPorIdConPermisos(proyecto_id, usuario_rut, rol_usuario);
};

/**
 * Verificar si un usuario puede ver un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} usuario_rut - RUT del usuario
 * @param {string} rol_usuario - Rol del usuario
 * @returns {Promise<boolean>} - true si puede ver, false si no
 */
const puedeVerProyecto = async (proyecto_id, usuario_rut, rol_usuario) => {
    if (!proyecto_id || !usuario_rut || !rol_usuario) {
        return false;
    }
    
    return await ProjectModel.puedeVerProyecto(proyecto_id, usuario_rut, rol_usuario);
};

// ===== SERVICIOS DE FECHAS IMPORTANTES =====

/**
 * Crear fechas importantes para un proyecto con fechas personalizadas o por defecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {Array} fechasPersonalizadas - Array de fechas personalizadas (opcional)
 * @returns {Promise<Array>} - IDs de las fechas creadas
 */
const crearFechasImportantesProyecto = async (proyecto_id, fechasPersonalizadas = null) => {
    if (fechasPersonalizadas && fechasPersonalizadas.length > 0) {
        const idsCreados = [];
        for (const fecha of fechasPersonalizadas) {
            const fechaId = await fechasImportantesModel.crearFechaImportante({
                proyecto_id,
                ...fecha
            });
            idsCreados.push(fechaId);
        }
        return idsCreados;
    } else {
        return await fechasImportantesModel.crearFechasPorDefectoProyecto(proyecto_id);
    }
};

/**
 * Obtener fechas importantes de un proyecto con notificaciones
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Object>} - Fechas con estadísticas
 */
const obtenerFechasConNotificaciones = async (proyecto_id) => {
    const fechas = await fechasImportantesModel.obtenerFechasImportantesPorProyecto(proyecto_id);
    const fechasProximas = await fechasImportantesModel.obtenerFechasProximasProyecto(proyecto_id);
    
    const estadisticas = {
        total: fechas.length,
        completadas: fechas.filter(f => f.completada).length,
        pendientes: fechas.filter(f => !f.completada).length,
        vencidas: fechas.filter(f => f.estado === 'vencida').length,
        proximasVencer: fechasProximas.length
    };
    
    return {
        fechas,
        fechasProximas,
        estadisticas
    };
};

// ===== SERVICIOS DE ASIGNACIONES DE PROFESORES =====

/**
 * Asignar múltiples profesores a un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {Array} asignaciones - Array de {profesor_rut, rol_profesor}
 * @returns {Promise<Array>} - IDs de las asignaciones creadas
 */
const asignarProfesoresAProyecto = async (proyecto_id, asignaciones) => {
    const idsCreados = [];
    
    for (const asignacion of asignaciones) {
        try {
            const asignacionId = await asignacionesProfesoresModel.asignarProfesorAProyecto({
                proyecto_id,
                profesor_rut: asignacion.profesor_rut,
                rol_profesor: asignacion.rol_profesor
            });
            idsCreados.push({
                id: asignacionId,
                rol: asignacion.rol_profesor,
                profesor: asignacion.profesor_rut,
                exito: true
            });
        } catch (error) {
            idsCreados.push({
                rol: asignacion.rol_profesor,
                profesor: asignacion.profesor_rut,
                exito: false,
                error: error.message
            });
        }
    }
    
    return idsCreados;
};

/**
 * Obtener información completa de un proyecto incluyendo fechas y profesores
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Object>} - Información completa del proyecto
 */
const obtenerProyectoCompleto = async (proyecto_id) => {
    const proyecto = await ProjectModel.getDetailProject(proyecto_id);
    
    if (!proyecto) {
        return null;
    }
    
    const fechasInfo = await obtenerFechasConNotificaciones(proyecto_id);
    const profesores = await asignacionesProfesoresModel.obtenerProfesoresProyecto(proyecto_id);
    
    return {
        ...proyecto,
        fechasImportantes: fechasInfo,
        profesores
    };
};

/**
 * Crear proyecto completo con fechas y asignaciones
 * @param {Object} proyectoData - Datos del proyecto
 * @param {Array} fechasPersonalizadas - Fechas importantes personalizadas
 * @param {Array} asignacionesProfesores - Asignaciones de profesores
 * @returns {Promise<Object>} - Proyecto creado con toda la información
 */
const crearProyectoCompleto = async (proyectoData, fechasPersonalizadas = null, asignacionesProfesores = []) => {
    // Crear el proyecto base
    const proyectoId = await ProjectModel.createProject(
        proyectoData.titulo,
        proyectoData.descripcion,
        proyectoData.estudiante_rut
    );
    
    // Crear fechas importantes
    const fechasCreadas = await crearFechasImportantesProyecto(proyectoId, fechasPersonalizadas);
    
    // Asignar profesores si se proporcionaron
    let asignacionesCreadas = [];
    if (asignacionesProfesores.length > 0) {
        asignacionesCreadas = await asignarProfesoresAProyecto(proyectoId, asignacionesProfesores);
    }
    
    // Retornar proyecto completo
    const proyectoCompleto = await obtenerProyectoCompleto(proyectoId);
    
    return {
        ...proyectoCompleto,
        fechasCreadas,
        asignacionesCreadas
    };
};

// ========== SERVICIOS DE HITOS ==========

/**
 * Crear hito de proyecto con validaciones de negocio
 * @param {Object} hitoData - Datos del hito
 * @returns {Promise<number>} - ID del hito creado
 */
const crearHitoProyecto = async (hitoData) => {
    // Validaciones de negocio
    if (!hitoData.nombre || !hitoData.tipo_hito || !hitoData.fecha_objetivo) {
        throw new Error('Nombre, tipo de hito y fecha objetivo son obligatorios');
    }

    if (new Date(hitoData.fecha_objetivo) < new Date()) {
        throw new Error('La fecha objetivo no puede estar en el pasado');
    }

    // Validar que el peso no exceda el 100%
    if (hitoData.peso_en_proyecto > 100 || hitoData.peso_en_proyecto < 0) {
        throw new Error('El peso del hito debe estar entre 0 y 100');
    }

    // Verificar que el total de pesos no exceda 100%
    const hitosExistentes = await ProjectModel.obtenerHitosProyecto(hitoData.proyecto_id);
    const pesoTotal = hitosExistentes.reduce((total, hito) => total + (hito.peso_en_proyecto || 0), 0);
    
    if (pesoTotal + hitoData.peso_en_proyecto > 100) {
        throw new Error(`El peso total de hitos no puede exceder 100%. Actualmente: ${pesoTotal}%`);
    }

    return await ProjectModel.crearHitoProyecto(hitoData);
};

/**
 * Obtener hitos de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - Lista de hitos
 */
const obtenerHitosProyecto = async (proyecto_id) => {
    return await ProjectModel.obtenerHitosProyecto(proyecto_id);
};

/**
 * Actualizar hito de proyecto
 * @param {number} hito_id - ID del hito
 * @param {Object} hitoData - Datos actualizados
 * @param {string} actualizado_por_rut - RUT del usuario que actualiza
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
const actualizarHitoProyecto = async (hito_id, hitoData, actualizado_por_rut) => {
    // Validaciones de fecha si se está actualizando
    if (hitoData.fecha_objetivo && new Date(hitoData.fecha_objetivo) < new Date()) {
        throw new Error('La fecha objetivo no puede estar en el pasado');
    }

    return await ProjectModel.actualizarHitoProyecto(hito_id, hitoData, actualizado_por_rut);
};

/**
 * Completar hito con validaciones
 * @param {number} hito_id - ID del hito
 * @param {Object} datos_completado - Datos de completado
 * @param {string} actualizado_por_rut - RUT del usuario
 * @returns {Promise<boolean>} - true si se completó correctamente
 */
const completarHito = async (hito_id, datos_completado, actualizado_por_rut) => {
    return await ProjectModel.completarHito(hito_id, datos_completado, actualizado_por_rut);
};

/**
 * Obtener estadísticas de hitos
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Object>} - Estadísticas de hitos
 */
const obtenerEstadisticasHitos = async (proyecto_id) => {
    return await ProjectModel.obtenerEstadisticasHitos(proyecto_id);
};

// ========== SERVICIOS DE EVALUACIONES ==========

/**
 * Crear evaluación de proyecto con validaciones
 * @param {Object} evaluacionData - Datos de la evaluación
 * @returns {Promise<number>} - ID de la evaluación creada
 */
const crearEvaluacionProyecto = async (evaluacionData) => {
    // Validaciones de negocio
    if (!evaluacionData.titulo || !evaluacionData.tipo_evaluacion || !evaluacionData.fecha_evaluacion) {
        throw new Error('Título, tipo de evaluación y fecha son obligatorios');
    }

    // Validar notas si se proporcionan
    const notas = ['nota_aspecto_tecnico', 'nota_metodologia', 'nota_documentacion', 'nota_presentacion', 'nota_global'];
    for (const nota of notas) {
        if (evaluacionData[nota] && (evaluacionData[nota] < 1.0 || evaluacionData[nota] > 7.0)) {
            throw new Error(`La ${nota} debe estar entre 1.0 y 7.0`);
        }
    }

    return await ProjectModel.crearEvaluacionProyecto(evaluacionData);
};

/**
 * Obtener evaluaciones de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - Lista de evaluaciones
 */
const obtenerEvaluacionesProyecto = async (proyecto_id) => {
    return await ProjectModel.obtenerEvaluacionesProyecto(proyecto_id);
};

// ========== SERVICIOS DE PERMISOS ==========

/**
 * Verificar si un usuario puede modificar un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} usuario_rut - RUT del usuario
 * @param {string} rol_usuario - Rol del usuario
 * @returns {Promise<boolean>} - true si puede modificar
 */
const puedeModificarProyecto = async (proyecto_id, usuario_rut, rol_usuario) => {
    // Los administradores pueden modificar cualquier proyecto
    if (rol_usuario === 'admin') return true;

    // Los profesores pueden modificar proyectos donde están asignados
    if (rol_usuario === 'profesor') {
        return await puedeEvaluarProyecto(proyecto_id, usuario_rut);
    }

    // Los estudiantes solo pueden modificar sus propios proyectos
    if (rol_usuario === 'estudiante') {
        const proyecto = await ProjectModel.obtenerProyectoPorIdConPermisos(proyecto_id, usuario_rut, rol_usuario);
        return proyecto && proyecto.estudiante_rut === usuario_rut;
    }

    return false;
};

/**
 * Verificar si un profesor puede evaluar un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} profesor_rut - RUT del profesor
 * @returns {Promise<boolean>} - true si puede evaluar
 */
const puedeEvaluarProyecto = async (proyecto_id, profesor_rut) => {
    const profesores = await ProjectModel.getProjectProfessors(proyecto_id);
    return profesores.some(p => p.rut === profesor_rut);
};

/**
 * Actualizar progreso del proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
const actualizarProgresoProyecto = async (proyecto_id) => {
    return await ProjectModel.actualizarProgresoProyecto(proyecto_id);
};

/**
 * Obtener dashboard completo del proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Object>} - Dashboard con toda la información
 */
const obtenerDashboardProyecto = async (proyecto_id) => {
    return await ProjectModel.obtenerDashboardProyecto(proyecto_id);
};

// ============= FUNCIONES DEL SISTEMA DE CRONOGRAMAS Y ENTREGAS =============

/**
 * Crear cronograma para proyecto
 */
const crearCronograma = async (cronogramaData) => {
    return await AvanceModel.crearCronograma(cronogramaData);
};

/**
 * Obtener cronograma activo del proyecto
 */
const obtenerCronogramaActivo = async (proyecto_id) => {
    return await AvanceModel.obtenerCronogramaActivo(proyecto_id);
};

/**
 * Aprobar cronograma por estudiante
 */
const aprobarCronogramaPorEstudiante = async (cronograma_id) => {
    return await AvanceModel.aprobarCronogramaPorEstudiante(cronograma_id);
};

/**
 * Crear hito en cronograma
 */
const crearHitoCronograma = async (hitoData) => {
    return await AvanceModel.crearHitoCronograma(hitoData);
};

/**
 * Obtener hitos del cronograma
 */
const obtenerHitosCronograma = async (cronograma_id) => {
    return await AvanceModel.obtenerHitosCronograma(cronograma_id);
};

/**
 * Entregar hito (subir archivo)
 */
const entregarHito = async (hito_id, entregaData) => {
    return await AvanceModel.entregarHito(hito_id, entregaData);
};

/**
 * Revisar hito entregado
 */
const revisarHito = async (hito_id, revisionData) => {
    return await AvanceModel.revisarHito(hito_id, revisionData);
};

/**
 * Obtener notificaciones del usuario
 */
const obtenerNotificacionesUsuario = async (usuario_rut, solo_no_leidas = false) => {
    return await AvanceModel.obtenerNotificacionesUsuario(usuario_rut, solo_no_leidas);
};

/**
 * Marcar notificación como leída
 */
const marcarNotificacionLeida = async (notificacion_id) => {
    return await AvanceModel.marcarNotificacionLeida(notificacion_id);
};

/**
 * Configurar alertas del proyecto
 */
const configurarAlertas = async (alertaData) => {
    return await AvanceModel.configurarAlertas(alertaData);
};

/**
 * Obtener estadísticas de cumplimiento
 */
const obtenerEstadisticasCumplimiento = async (proyecto_id) => {
    return await AvanceModel.obtenerEstadisticasCumplimiento(proyecto_id);
};

// ============= FUNCIONES DE VERIFICACIÓN DE PERMISOS =============

/**
 * Verificar si el usuario es profesor guía del proyecto
 */
const esProfesorGuia = async (proyecto_id, profesor_rut) => {
    return await AvanceModel.esProfesorGuia(proyecto_id, profesor_rut);
};

/**
 * Verificar si el usuario es estudiante del cronograma
 */
const esEstudianteDelCronograma = async (cronograma_id, estudiante_rut) => {
    return await AvanceModel.esEstudianteDelCronograma(cronograma_id, estudiante_rut);
};

/**
 * Verificar si el usuario es profesor guía del cronograma
 */
const esProfesorGuiaDelCronograma = async (cronograma_id, profesor_rut) => {
    return await AvanceModel.esProfesorGuiaDelCronograma(cronograma_id, profesor_rut);
};

/**
 * Verificar si el usuario puede ver el cronograma
 */
const puedeVerCronograma = async (cronograma_id, usuario_rut, rol_usuario) => {
    return await AvanceModel.puedeVerCronograma(cronograma_id, usuario_rut, rol_usuario);
};

/**
 * Verificar si el usuario es estudiante del hito
 */
const esEstudianteDelHito = async (hito_id, estudiante_rut) => {
    return await AvanceModel.esEstudianteDelHito(hito_id, estudiante_rut);
};

/**
 * Verificar si el usuario es profesor guía del hito
 */
const esProfesorGuiaDelHito = async (hito_id, profesor_rut) => {
    return await AvanceModel.esProfesorGuiaDelHito(hito_id, profesor_rut);
};

/**
 * Verificar si la notificación pertenece al usuario
 */
const notificacionPerteneceAUsuario = async (notificacion_id, usuario_rut) => {
    return await AvanceModel.notificacionPerteneceAUsuario(notificacion_id, usuario_rut);
};

export const ProjectService = {
    createProject,
    getProjects,
    getDetailProject,
    deleteProject,
    crearProyectoDesdeAprobacion,
    transferirAsignacionesProfesores,
    obtenerProyectosPorPermisos,
    obtenerProyectoPorIdConPermisos,
    puedeVerProyecto,
    // Funciones existentes
    crearFechasImportantesProyecto,
    obtenerFechasConNotificaciones,
    asignarProfesoresAProyecto,
    obtenerProyectoCompleto,
    crearProyectoCompleto,
    
    // Nuevas funciones de hitos
    crearHitoProyecto,
    obtenerHitosProyecto,
    actualizarHitoProyecto,
    completarHito,
    obtenerEstadisticasHitos,
    
    // Nuevas funciones de evaluaciones
    crearEvaluacionProyecto,
    obtenerEvaluacionesProyecto,
    
    // Nuevas funciones de permisos y progreso
    puedeModificarProyecto,
    puedeEvaluarProyecto,
    actualizarProgresoProyecto,
    obtenerDashboardProyecto,
    
    // Sistema de cronogramas y entregas
    crearCronograma,
    obtenerCronogramaActivo,
    aprobarCronogramaPorEstudiante,
    crearHitoCronograma,
    obtenerHitosCronograma,
    entregarHito,
    revisarHito,
    obtenerNotificacionesUsuario,
    marcarNotificacionLeida,
    configurarAlertas,
    obtenerEstadisticasCumplimiento,
    
    // Funciones de verificación de permisos para cronogramas
    esProfesorGuia,
    esEstudianteDelCronograma,
    esProfesorGuiaDelCronograma,
    puedeVerProyecto,
    puedeVerCronograma,
    esEstudianteDelHito,
    esProfesorGuiaDelHito,
    notificacionPerteneceAUsuario,
    
    // Funciones para flujo automático propuesta → proyecto
    verificarYActivarProyectoSiCompleto
};