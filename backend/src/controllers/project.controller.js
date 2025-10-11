import { ProjectService } from '../services/project.service.js';

const createProject = async (req, res) => {
    try {
        const { titulo, descripcion } = req.body;

        const estudianteId = req.rut;
       
        const project = await ProjectService.createProject(titulo, descripcion, estudianteId);
        res.status(201).json(project);
    } catch 
    (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener proyectos con control de permisos
const getProjects = async (req, res) => {
    try {
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const projects = await ProjectService.obtenerProyectosPorPermisos(usuario_rut, rol_usuario);
        res.status(200).json({
            total: projects.length,
            projects: projects,
            usuario_rol: rol_usuario
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener proyecto específico con control de permisos
const getDetailProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (!projectId || isNaN(parseInt(projectId))) {
            return res.status(400).json({ message: 'ID de proyecto inválido' });
        }

        const project = await ProjectService.obtenerProyectoPorIdConPermisos(
            parseInt(projectId), 
            usuario_rut, 
            rol_usuario
        );

        if (!project) {
            return res.status(404).json({ 
                message: 'Proyecto no encontrado o no tienes permisos para verlo' 
            });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error('Error al obtener proyecto:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Solo administradores pueden eliminar proyectos
        if (rol_usuario !== 'admin') {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden eliminar proyectos' 
            });
        }

        const project = await ProjectService.deleteProject(projectId);
        res.status(200).json({ message: 'Proyecto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener proyectos del estudiante autenticado
const getMisProyectos = async (req, res) => {
    try {
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (rol_usuario !== 'estudiante') {
            return res.status(403).json({ message: 'Solo estudiantes pueden acceder a esta ruta' });
        }

        const projects = await ProjectService.obtenerProyectosPorPermisos(usuario_rut, rol_usuario);
        res.status(200).json({
            total: projects.length,
            projects: projects
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener proyectos asignados al profesor autenticado
const getProyectosAsignados = async (req, res) => {
    try {
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (rol_usuario !== 'profesor') {
            return res.status(403).json({ message: 'Solo profesores pueden acceder a esta ruta' });
        }

        const projects = await ProjectService.obtenerProyectosPorPermisos(usuario_rut, rol_usuario);
        res.status(200).json({
            total: projects.length,
            projects: projects
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener proyecto con información completa (fechas importantes y profesores)
const getProyectoCompleto = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.role_id;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Verificar permisos
        const puedeVer = await ProjectService.puedeVerProyecto(projectId, usuario_rut, rol_usuario);
        if (!puedeVer) {
            return res.status(403).json({ message: 'No tienes permisos para ver este proyecto' });
        }

        const proyectoCompleto = await ProjectService.obtenerProyectoCompleto(projectId);
        
        if (!proyectoCompleto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.status(200).json({
            success: true,
            data: proyectoCompleto
        });
    } catch (error) {
        console.error('Error al obtener proyecto completo:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// ========== CONTROLADORES DE HITOS ==========

// Crear hito para un proyecto
const crearHitoProyecto = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;
        
        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Verificar permisos para modificar el proyecto
        const puedeModificar = await ProjectService.puedeModificarProyecto(projectId, usuario_rut, rol_usuario);
        if (!puedeModificar) {
            return res.status(403).json({ message: 'No tienes permisos para modificar este proyecto' });
        }

        const hitoData = {
            ...req.body,
            proyecto_id: projectId,
            creado_por_rut: usuario_rut
        };

        const hitoId = await ProjectService.crearHitoProyecto(hitoData);
        
        // Actualizar progreso del proyecto
        await ProjectService.actualizarProgresoProyecto(projectId);

        res.status(201).json({
            success: true,
            message: 'Hito creado exitosamente',
            hito_id: hitoId
        });
    } catch (error) {
        console.error('Error al crear hito:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener hitos de un proyecto
const obtenerHitosProyecto = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Verificar permisos para ver el proyecto
        const puedeVer = await ProjectService.puedeVerProyecto(projectId, usuario_rut, rol_usuario);
        if (!puedeVer) {
            return res.status(403).json({ message: 'No tienes permisos para ver este proyecto' });
        }

        const hitos = await ProjectService.obtenerHitosProyecto(projectId);
        const estadisticas = await ProjectService.obtenerEstadisticasHitos(projectId);

        res.status(200).json({
            success: true,
            hitos: hitos,
            estadisticas: estadisticas
        });
    } catch (error) {
        console.error('Error al obtener hitos:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Actualizar hito
const actualizarHitoProyecto = async (req, res) => {
    try {
        const { projectId, hitoId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Verificar permisos
        const puedeModificar = await ProjectService.puedeModificarProyecto(projectId, usuario_rut, rol_usuario);
        if (!puedeModificar) {
            return res.status(403).json({ message: 'No tienes permisos para modificar este proyecto' });
        }

        const actualizado = await ProjectService.actualizarHitoProyecto(hitoId, req.body, usuario_rut);
        
        if (!actualizado) {
            return res.status(404).json({ message: 'Hito no encontrado' });
        }

        // Actualizar progreso del proyecto
        await ProjectService.actualizarProgresoProyecto(projectId);

        res.status(200).json({
            success: true,
            message: 'Hito actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar hito:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Completar hito
const completarHito = async (req, res) => {
    try {
        const { projectId, hitoId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Solo estudiantes pueden marcar hitos como completados
        if (rol_usuario !== 'estudiante') {
            return res.status(403).json({ message: 'Solo estudiantes pueden completar hitos' });
        }

        const completado = await ProjectService.completarHito(hitoId, req.body, usuario_rut);
        
        if (!completado) {
            return res.status(404).json({ message: 'Hito no encontrado' });
        }

        // Actualizar progreso del proyecto
        await ProjectService.actualizarProgresoProyecto(projectId);

        res.status(200).json({
            success: true,
            message: 'Hito completado exitosamente'
        });
    } catch (error) {
        console.error('Error al completar hito:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ========== CONTROLADORES DE EVALUACIONES ==========

// Crear evaluación de proyecto
const crearEvaluacionProyecto = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Solo profesores pueden crear evaluaciones
        if (rol_usuario !== 'profesor') {
            return res.status(403).json({ message: 'Solo profesores pueden crear evaluaciones' });
        }

        // Verificar que el profesor está asignado al proyecto
        const puedeEvaluar = await ProjectService.puedeEvaluarProyecto(projectId, usuario_rut);
        if (!puedeEvaluar) {
            return res.status(403).json({ message: 'No estás asignado a este proyecto' });
        }

        const evaluacionData = {
            ...req.body,
            proyecto_id: projectId,
            profesor_evaluador_rut: usuario_rut
        };

        const evaluacionId = await ProjectService.crearEvaluacionProyecto(evaluacionData);

        res.status(201).json({
            success: true,
            message: 'Evaluación creada exitosamente',
            evaluacion_id: evaluacionId
        });
    } catch (error) {
        console.error('Error al crear evaluación:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener evaluaciones de un proyecto
const obtenerEvaluacionesProyecto = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Verificar permisos para ver el proyecto
        const puedeVer = await ProjectService.puedeVerProyecto(projectId, usuario_rut, rol_usuario);
        if (!puedeVer) {
            return res.status(403).json({ message: 'No tienes permisos para ver este proyecto' });
        }

        const evaluaciones = await ProjectService.obtenerEvaluacionesProyecto(projectId);

        res.status(200).json({
            success: true,
            evaluaciones: evaluaciones
        });
    } catch (error) {
        console.error('Error al obtener evaluaciones:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Obtener dashboard completo del proyecto
const obtenerDashboardProyecto = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Verificar permisos para ver el proyecto
        const puedeVer = await ProjectService.puedeVerProyecto(projectId, usuario_rut, rol_usuario);
        if (!puedeVer) {
            return res.status(403).json({ message: 'No tienes permisos para ver este proyecto' });
        }

        const dashboard = await ProjectService.obtenerDashboardProyecto(projectId);

        if (!dashboard) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.status(200).json({
            success: true,
            dashboard: dashboard
        });
    } catch (error) {
        console.error('Error al obtener dashboard:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ============= CONTROLADORES PARA SISTEMA DE CRONOGRAMAS Y ENTREGAS =============

// Crear cronograma para proyecto
const crearCronograma = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { nombre_cronograma, descripcion, fecha_inicio, fecha_fin_estimada, dias_alerta_previa } = req.body;
        const creado_por_rut = req.user.rut;

        if (!nombre_cronograma || !fecha_inicio || !fecha_fin_estimada) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: nombre_cronograma, fecha_inicio, fecha_fin_estimada' 
            });
        }

        // Verificar permisos (solo profesor guía puede crear cronogramas)
        const puedeCrear = await ProjectService.esProfesorGuia(projectId, creado_por_rut);
        if (!puedeCrear) {
            return res.status(403).json({ message: 'Solo el profesor guía puede crear cronogramas' });
        }

        const cronogramaId = await ProjectService.crearCronograma({
            proyecto_id: projectId,
            nombre_cronograma,
            descripcion,
            fecha_inicio,
            fecha_fin_estimada,
            creado_por_rut,
            dias_alerta_previa
        });

        res.status(201).json({
            success: true,
            message: 'Cronograma creado exitosamente',
            cronograma_id: cronogramaId
        });
    } catch (error) {
        console.error('Error al crear cronograma:', error);
        res.status(500).json({ message: error.message });
    }
};

// Obtener cronograma activo del proyecto
const obtenerCronograma = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user.rut;
        const rol_usuario = req.user.rol;

        // Verificar permisos para ver el proyecto
        const puedeVer = await ProjectService.puedeVerProyecto(projectId, usuario_rut, rol_usuario);
        if (!puedeVer) {
            return res.status(403).json({ message: 'No tienes permisos para ver este proyecto' });
        }

        const cronograma = await ProjectService.obtenerCronogramaActivo(projectId);

        if (!cronograma) {
            return res.status(404).json({ message: 'No hay cronograma activo para este proyecto' });
        }

        res.status(200).json({
            success: true,
            cronograma: cronograma
        });
    } catch (error) {
        console.error('Error al obtener cronograma:', error);
        res.status(500).json({ message: error.message });
    }
};

// Aprobar cronograma (solo estudiante)
const aprobarCronograma = async (req, res) => {
    try {
        const { cronogramaId } = req.params;
        const usuario_rut = req.user.rut;

        // Verificar que el usuario sea el estudiante del proyecto
        const esEstudiante = await ProjectService.esEstudianteDelCronograma(cronogramaId, usuario_rut);
        if (!esEstudiante) {
            return res.status(403).json({ message: 'Solo el estudiante puede aprobar el cronograma' });
        }

        const success = await ProjectService.aprobarCronogramaPorEstudiante(cronogramaId);

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Cronograma aprobado exitosamente'
            });
        } else {
            res.status(400).json({ message: 'Error al aprobar cronograma' });
        }
    } catch (error) {
        console.error('Error al aprobar cronograma:', error);
        res.status(500).json({ message: error.message });
    }
};

// Crear hito en cronograma
const crearHitoCronograma = async (req, res) => {
    try {
        const { cronogramaId } = req.params;
        const { nombre_hito, descripcion, tipo_hito, fecha_limite } = req.body;
        const usuario_rut = req.user.rut;

        if (!nombre_hito || !tipo_hito || !fecha_limite) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: nombre_hito, tipo_hito, fecha_limite' 
            });
        }

        // Verificar que el usuario sea profesor guía del proyecto
        const esProfesorGuia = await ProjectService.esProfesorGuiaDelCronograma(cronogramaId, usuario_rut);
        if (!esProfesorGuia) {
            return res.status(403).json({ message: 'Solo el profesor guía puede crear hitos' });
        }

        const hitoId = await ProjectService.crearHitoCronograma({
            cronograma_id: cronogramaId,
            nombre_hito,
            descripcion,
            tipo_hito,
            fecha_limite
        });

        res.status(201).json({
            success: true,
            message: 'Hito creado exitosamente',
            hito_id: hitoId
        });
    } catch (error) {
        console.error('Error al crear hito:', error);
        res.status(500).json({ message: error.message });
    }
};

// Obtener hitos del cronograma
const obtenerHitosCronograma = async (req, res) => {
    try {
        const { cronogramaId } = req.params;
        const usuario_rut = req.user.rut;
        const rol_usuario = req.user.rol;

        // Verificar permisos para ver el cronograma
        const puedeVer = await ProjectService.puedeVerCronograma(cronogramaId, usuario_rut, rol_usuario);
        if (!puedeVer) {
            return res.status(403).json({ message: 'No tienes permisos para ver este cronograma' });
        }

        const hitos = await ProjectService.obtenerHitosCronograma(cronogramaId);

        res.status(200).json({
            success: true,
            hitos: hitos
        });
    } catch (error) {
        console.error('Error al obtener hitos:', error);
        res.status(500).json({ message: error.message });
    }
};

// Entregar hito (subir archivo)
const entregarHito = async (req, res) => {
    try {
        const { hitoId } = req.params;
        const { comentarios_estudiante } = req.body;
        const archivo_entrega = req.file?.filename;
        const nombre_archivo_original = req.file?.originalname;
        const usuario_rut = req.user.rut;

        if (!archivo_entrega) {
            return res.status(400).json({ message: 'Debe subir un archivo para la entrega' });
        }

        // Verificar que el usuario sea el estudiante del proyecto
        const esEstudiante = await ProjectService.esEstudianteDelHito(hitoId, usuario_rut);
        if (!esEstudiante) {
            return res.status(403).json({ message: 'Solo el estudiante puede entregar el hito' });
        }

        const resultado = await ProjectService.entregarHito(hitoId, {
            archivo_entrega,
            nombre_archivo_original,
            comentarios_estudiante
        });

        res.status(200).json({
            success: true,
            message: 'Hito entregado exitosamente',
            cumplido_en_fecha: resultado.cumplido_en_fecha,
            dias_retraso: resultado.dias_retraso
        });
    } catch (error) {
        console.error('Error al entregar hito:', error);
        res.status(500).json({ message: error.message });
    }
};

// Revisar hito entregado
const revisarHito = async (req, res) => {
    try {
        const { hitoId } = req.params;
        const { comentarios_profesor, calificacion, estado } = req.body;
        const usuario_rut = req.user.rut;

        if (!comentarios_profesor || !estado) {
            return res.status(400).json({ 
                message: 'Faltan campos requeridos: comentarios_profesor, estado' 
            });
        }

        // Verificar que el usuario sea profesor guía del proyecto
        const esProfesorGuia = await ProjectService.esProfesorGuiaDelHito(hitoId, usuario_rut);
        if (!esProfesorGuia) {
            return res.status(403).json({ message: 'Solo el profesor guía puede revisar hitos' });
        }

        const success = await ProjectService.revisarHito(hitoId, {
            comentarios_profesor,
            calificacion,
            estado
        });

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Hito revisado exitosamente'
            });
        } else {
            res.status(400).json({ message: 'Error al revisar hito' });
        }
    } catch (error) {
        console.error('Error al revisar hito:', error);
        res.status(500).json({ message: error.message });
    }
};

// Obtener notificaciones del usuario
const obtenerNotificaciones = async (req, res) => {
    try {
        const usuario_rut = req.user.rut;
        const { solo_no_leidas } = req.query;

        const notificaciones = await ProjectService.obtenerNotificacionesUsuario(
            usuario_rut, 
            solo_no_leidas === 'true'
        );

        res.status(200).json({
            success: true,
            notificaciones: notificaciones
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ message: error.message });
    }
};

// Marcar notificación como leída
const marcarNotificacionLeida = async (req, res) => {
    try {
        const { notificacionId } = req.params;
        const usuario_rut = req.user.rut;

        // Verificar que la notificación pertenece al usuario
        const esDelUsuario = await ProjectService.notificacionPerteneceAUsuario(notificacionId, usuario_rut);
        if (!esDelUsuario) {
            return res.status(403).json({ message: 'No tienes permisos para modificar esta notificación' });
        }

        const success = await ProjectService.marcarNotificacionLeida(notificacionId);

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Notificación marcada como leída'
            });
        } else {
            res.status(400).json({ message: 'Error al marcar notificación' });
        }
    } catch (error) {
        console.error('Error al marcar notificación:', error);
        res.status(500).json({ message: error.message });
    }
};

// Configurar alertas del proyecto
const configurarAlertas = async (req, res) => {
    try {
        const { projectId } = req.params;
        const configAlerta = req.body;
        const profesor_rut = req.user.rut;

        // Verificar que el usuario sea profesor guía
        const esProfesorGuia = await ProjectService.esProfesorGuia(projectId, profesor_rut);
        if (!esProfesorGuia) {
            return res.status(403).json({ message: 'Solo el profesor guía puede configurar alertas' });
        }

        const success = await ProjectService.configurarAlertas({
            proyecto_id: projectId,
            profesor_rut,
            ...configAlerta
        });

        if (success) {
            res.status(200).json({
                success: true,
                message: 'Alertas configuradas exitosamente'
            });
        } else {
            res.status(400).json({ message: 'Error al configurar alertas' });
        }
    } catch (error) {
        console.error('Error al configurar alertas:', error);
        res.status(500).json({ message: error.message });
    }
};

// Obtener estadísticas de cumplimiento
const obtenerEstadisticasCumplimiento = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user.rut;
        const rol_usuario = req.user.rol;

        // Verificar permisos para ver el proyecto
        const puedeVer = await ProjectService.puedeVerProyecto(projectId, usuario_rut, rol_usuario);
        if (!puedeVer) {
            return res.status(403).json({ message: 'No tienes permisos para ver este proyecto' });
        }

        const estadisticas = await ProjectService.obtenerEstadisticasCumplimiento(projectId);

        res.status(200).json({
            success: true,
            estadisticas: estadisticas
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: error.message });
    }
};

export const ProjectController = {
    createProject,
    getProjects,
    getDetailProject,
    deleteProject,
    getMisProyectos,
    getProyectosAsignados,
    getProyectoCompleto,
    
    // Gestión de hitos
    crearHitoProyecto,
    obtenerHitosProyecto,
    actualizarHitoProyecto,
    completarHito,
    
    // Gestión de evaluaciones
    crearEvaluacionProyecto,
    obtenerEvaluacionesProyecto,
    
    // Dashboard
    obtenerDashboardProyecto,
    
    // Sistema de cronogramas y entregas
    crearCronograma,
    obtenerCronograma,
    aprobarCronograma,
    crearHitoCronograma,
    obtenerHitosCronograma,
    entregarHito,
    revisarHito,
    obtenerNotificaciones,
    marcarNotificacionLeida,
    configurarAlertas,
    obtenerEstadisticasCumplimiento
};