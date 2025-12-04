import * as FechasLimiteModel from '../models/fechas-limite.model.js';

/**
 * Obtener estado actual del período de propuestas
 * Endpoint público (requiere autenticación pero cualquier rol puede verlo)
 */
export const obtenerEstadoPeriodo = async (req, res) => {
    try {
        const estado = await FechasLimiteModel.obtenerEstadoPeriodoPropuestas();
        return res.json(estado);
    } catch (error) {
        console.error('Error obteniendo estado del período:', error);
        return res.status(500).json({ 
            message: 'Error al obtener el estado del período de propuestas',
            error: error.message 
        });
    }
};

/**
 * Habilitar período de propuestas (solo admin)
 */
export const habilitarPeriodo = async (req, res) => {
    try {
        const { fecha_importante_id } = req.body;

        if (!fecha_importante_id) {
            return res.status(400).json({ 
                message: 'Se requiere el ID de la fecha importante' 
            });
        }

        // Verificar que el usuario sea admin o superadmin
        if (req.rol_id !== 3 && req.rol_id !== 4) {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden habilitar períodos de propuestas' 
            });
        }

        const resultado = await FechasLimiteModel.habilitarPeriodoPropuestas(fecha_importante_id);
        
        return res.json({
            ok: true,
            ...resultado
        });

    } catch (error) {
        console.error('Error habilitando período:', error);
        return res.status(500).json({ 
            message: 'Error al habilitar el período de propuestas',
            error: error.message 
        });
    }
};

/**
 * Deshabilitar período de propuestas (solo admin)
 */
export const deshabilitarPeriodo = async (req, res) => {
    try {
        const { fecha_importante_id } = req.body;

        if (!fecha_importante_id) {
            return res.status(400).json({ 
                message: 'Se requiere el ID de la fecha importante' 
            });
        }

        // Verificar que el usuario sea admin o superadmin
        if (req.rol_id !== 3 && req.rol_id !== 4) {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden deshabilitar períodos de propuestas' 
            });
        }

        const resultado = await FechasLimiteModel.deshabilitarPeriodoPropuestas(fecha_importante_id);
        
        return res.json({
            ok: true,
            ...resultado
        });

    } catch (error) {
        console.error('Error deshabilitando período:', error);
        return res.status(500).json({ 
            message: 'Error al deshabilitar el período de propuestas',
            error: error.message 
        });
    }
};

/**
 * Deshabilitar automáticamente períodos vencidos (solo admin)
 * Este endpoint se puede llamar manualmente o desde un cron job
 */
export const deshabilitarPeriodosVencidos = async (req, res) => {
    try {
        // Verificar que el usuario sea admin o superadmin
        if (req.rol_id !== 3 && req.rol_id !== 4) {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden ejecutar esta acción' 
            });
        }

        const resultado = await FechasLimiteModel.deshabilitarPeriodosVencidos();
        
        return res.json({
            ok: true,
            ...resultado
        });

    } catch (error) {
        console.error('Error deshabilitando períodos vencidos:', error);
        return res.status(500).json({ 
            message: 'Error al deshabilitar períodos vencidos',
            error: error.message 
        });
    }
};
