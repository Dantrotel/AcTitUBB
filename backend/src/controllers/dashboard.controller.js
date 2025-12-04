import { 
    obtenerDashboardEstudiante, 
    obtenerDashboardProfesor, 
    obtenerDashboardAdmin 
} from '../models/dashboard.model.js';

// Dashboard para Estudiante
export const getDashboardEstudiante = async (req, res) => {
    try {
        const estudiante_rut = req.rut; // Del middleware verifySession
        
        const dashboard = await obtenerDashboardEstudiante(estudiante_rut);
        
        res.json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Error al obtener dashboard estudiante:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener dashboard del estudiante',
            error: error.message
        });
    }
};

// Dashboard para Profesor
export const getDashboardProfesor = async (req, res) => {
    try {
        const profesor_rut = req.rut; // Del middleware verifySession
        
        const dashboard = await obtenerDashboardProfesor(profesor_rut);
        
        res.json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Error al obtener dashboard profesor:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener dashboard del profesor',
            error: error.message
        });
    }
};

// Dashboard para Admin
export const getDashboardAdmin = async (req, res) => {
    try {
        const dashboard = await obtenerDashboardAdmin();
        
        res.json({
            success: true,
            data: dashboard
        });
    } catch (error) {
        console.error('Error al obtener dashboard admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener dashboard del administrador',
            error: error.message
        });
    }
};

// ============= CONTROLADORES PARA MONITOREO REGULATORIO =============

import { 
    obtenerProyectosRiesgoAbandono,
    obtenerInformantesPendientes,
    obtenerAlertasAbandono,
    marcarAlertaAtendida,
    obtenerConfiguracionAbandono
} from '../models/project.model.js';

/**
 * Obtener proyectos en riesgo de abandono (Admin y Profesores)
 */
export const getProyectosRiesgo = async (req, res) => {
    try {
        const proyectos = await obtenerProyectosRiesgoAbandono();
        
        res.json({
            success: true,
            total: proyectos.length,
            proyectos
        });
    } catch (error) {
        console.error('Error al obtener proyectos en riesgo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener proyectos en riesgo de abandono',
            error: error.message
        });
    }
};

/**
 * Obtener entregas pendientes de revisión por Informante
 */
export const getInformantesPendientes = async (req, res) => {
    try {
        const entregas = await obtenerInformantesPendientes();
        
        res.json({
            success: true,
            total: entregas.length,
            entregas
        });
    } catch (error) {
        console.error('Error al obtener informantes pendientes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener entregas pendientes de informante',
            error: error.message
        });
    }
};

/**
 * Obtener alertas de abandono activas
 */
export const getAlertasAbandono = async (req, res) => {
    try {
        const { proyecto_id } = req.query;
        const alertas = await obtenerAlertasAbandono(proyecto_id);
        
        res.json({
            success: true,
            total: alertas.length,
            alertas
        });
    } catch (error) {
        console.error('Error al obtener alertas de abandono:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener alertas de abandono',
            error: error.message
        });
    }
};

/**
 * Marcar alerta como atendida
 */
export const marcarAlertaComoAtendida = async (req, res) => {
    try {
        const { alerta_id } = req.params;
        const { observaciones } = req.body;
        
        const success = await marcarAlertaAtendida(alerta_id, observaciones);
        
        if (success) {
            res.json({
                success: true,
                message: 'Alerta marcada como atendida'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Alerta no encontrada'
            });
        }
    } catch (error) {
        console.error('Error al marcar alerta:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar alerta como atendida',
            error: error.message
        });
    }
};

/**
 * Obtener configuración de umbrales de abandono
 */
export const getConfiguracionAbandono = async (req, res) => {
    try {
        const config = await obtenerConfiguracionAbandono();
        
        res.json({
            success: true,
            configuracion: config
        });
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuración de abandono',
            error: error.message
        });
    }
};
