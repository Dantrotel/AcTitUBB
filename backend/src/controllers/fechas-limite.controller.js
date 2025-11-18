import * as FechasLimiteModel from '../models/fechas-limite.model.js';

/**
 * Verificar si puede subir archivos para una fecha importante
 * GET /api/v1/fechas-limite/verificar-permiso/:fechaImportanteId
 */
export const verificarPermisoSubida = async (req, res) => {
    try {
        const { fechaImportanteId } = req.params;
        const estudianteRut = req.user?.rut || req.rut;

        if (!estudianteRut) {
            return res.status(401).json({
                success: false,
                mensaje: 'No autenticado'
            });
        }

        const resultado = await FechasLimiteModel.verificarPermisoSubida(
            parseInt(fechaImportanteId),
            estudianteRut
        );

        return res.status(200).json({
            success: true,
            ...resultado
        });

    } catch (error) {
        console.error('Error verificando permiso de subida:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al verificar permiso de subida',
            error: error.message
        });
    }
};

/**
 * Verificar si puede solicitar extensión para una fecha importante
 * GET /api/v1/fechas-limite/verificar-extension/:fechaImportanteId/:proyectoId
 */
export const verificarPermisoExtension = async (req, res) => {
    try {
        const { fechaImportanteId, proyectoId } = req.params;

        const resultado = await FechasLimiteModel.verificarPermisoExtension(
            parseInt(fechaImportanteId),
            parseInt(proyectoId)
        );

        return res.status(200).json({
            success: true,
            ...resultado
        });

    } catch (error) {
        console.error('Error verificando permiso de extensión:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al verificar permiso de extensión',
            error: error.message
        });
    }
};

/**
 * Obtener estado de todas las fechas de un proyecto
 * GET /api/v1/fechas-limite/proyecto/:proyectoId
 */
export const obtenerEstadoFechasProyecto = async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const estudianteRut = req.user?.rut || req.rut;

        if (!estudianteRut) {
            return res.status(401).json({
                success: false,
                mensaje: 'No autenticado'
            });
        }

        const fechas = await FechasLimiteModel.obtenerEstadoFechasProyecto(
            parseInt(proyectoId),
            estudianteRut
        );

        return res.status(200).json({
            success: true,
            total: fechas.length,
            fechas
        });

    } catch (error) {
        console.error('Error obteniendo estado de fechas:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al obtener estado de fechas',
            error: error.message
        });
    }
};

/**
 * Marcar fecha como completada (después de subir archivos)
 * PUT /api/v1/fechas-limite/completar/:fechaImportanteId
 */
export const marcarFechaCompletada = async (req, res) => {
    try {
        const { fechaImportanteId } = req.params;
        const estudianteRut = req.user?.rut || req.rut;

        if (!estudianteRut) {
            return res.status(401).json({
                success: false,
                mensaje: 'No autenticado'
            });
        }

        const resultado = await FechasLimiteModel.marcarFechaCompletada(
            parseInt(fechaImportanteId),
            estudianteRut
        );

        return res.status(200).json(resultado);

    } catch (error) {
        console.error('Error marcando fecha como completada:', error);
        return res.status(400).json({
            success: false,
            mensaje: error.message || 'Error al marcar fecha como completada'
        });
    }
};

/**
 * Verificar si puede crear una propuesta
 * GET /api/v1/fechas-limite/verificar-propuesta
 */
export const verificarPermisoCrearPropuesta = async (req, res) => {
    try {
        const estudianteRut = req.user?.rut || req.rut;

        if (!estudianteRut) {
            return res.status(401).json({
                success: false,
                mensaje: 'No autenticado'
            });
        }

        const resultado = await FechasLimiteModel.verificarPermisoCrearPropuesta(estudianteRut);

        return res.status(200).json({
            success: true,
            ...resultado
        });

    } catch (error) {
        console.error('Error verificando permiso para crear propuesta:', error);
        return res.status(500).json({
            success: false,
            mensaje: 'Error al verificar permiso para crear propuesta',
            error: error.message
        });
    }
};

export default {
    verificarPermisoSubida,
    verificarPermisoExtension,
    obtenerEstadoFechasProyecto,
    marcarFechaCompletada,
    verificarPermisoCrearPropuesta
};
