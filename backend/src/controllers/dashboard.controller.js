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
