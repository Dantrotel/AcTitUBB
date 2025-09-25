import { ProjectModel } from '../models/project.model.js';
import * as fechasImportantesModel from '../models/fechas-importantes.model.js';
import * as asignacionesProfesoresModel from '../models/asignaciones-profesores.model.js';

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
            estado_id: 1, // 'en_desarrollo' - Estado inicial del proyecto
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
    } catch (error) {
        console.error('Error al transferir asignaciones de profesores:', error);
        throw error;
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
    // Nuevas funciones
    crearFechasImportantesProyecto,
    obtenerFechasConNotificaciones,
    asignarProfesoresAProyecto,
    obtenerProyectoCompleto,
    crearProyectoCompleto
};