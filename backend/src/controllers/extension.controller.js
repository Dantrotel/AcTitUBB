import * as extensionModel from '../models/extension.model.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para documentos de respaldo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/extensiones'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten archivos PDF, Word o imágenes'));
    }
}).single('documento_respaldo');

/**
 * Crear solicitud de extensión
 */
export const crearSolicitud = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const {
                proyecto_id,
                fecha_importante_id,
                fecha_original,
                fecha_solicitada,
                motivo,
                justificacion_detallada
            } = req.body;

            const solicitante_rut = req.user?.rut || req.rut;
            const documento_respaldo = req.file ? req.file.filename : null;

            // Validaciones
            if (!proyecto_id || !fecha_original || !fecha_solicitada || !motivo || !justificacion_detallada) {
                return res.status(400).json({
                    message: 'Faltan datos requeridos: proyecto_id, fecha_original, fecha_solicitada, motivo, justificacion_detallada'
                });
            }

            if (motivo.trim().length < 10) {
                return res.status(400).json({ message: 'El motivo debe tener al menos 10 caracteres' });
            }

            if (justificacion_detallada.trim().length < 50) {
                return res.status(400).json({ 
                    message: 'La justificación debe ser detallada (mínimo 50 caracteres)' 
                });
            }

            const solicitudId = await extensionModel.crearSolicitudExtension({
                proyecto_id,
                fecha_importante_id: fecha_importante_id || null,
                solicitante_rut,
                fecha_original,
                fecha_solicitada,
                motivo,
                justificacion_detallada,
                documento_respaldo
            });

            res.status(201).json({
                message: 'Solicitud de extensión creada exitosamente',
                solicitud_id: solicitudId
            });
        } catch (error) {
            console.error('Error al crear solicitud:', error);

            if (error.message.includes('posterior')) {
                return res.status(400).json({ message: error.message });
            }

            if (error.message.includes('Solo el estudiante')) {
                return res.status(403).json({ message: error.message });
            }

            if (error.message.includes('Ya existe')) {
                return res.status(409).json({ message: error.message });
            }

            res.status(500).json({ message: 'Error al crear solicitud de extensión' });
        }
    });
};

/**
 * Obtener solicitudes por proyecto
 */
export const obtenerSolicitudesPorProyecto = async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const { estado } = req.query;
        const usuario_rut = req.user?.rut || req.rut;
        const rol_id = String(req.user?.role_id || req.rol_id);

        if (!proyectoId) {
            return res.status(400).json({ message: 'ID de proyecto requerido' });
        }

        // Verificar permisos (estudiante del proyecto, profesor asignado o admin/superadmin)
        if (rol_id !== '3' && rol_id !== '4') {
            // TODO: Verificar que sea estudiante del proyecto o profesor asignado
            // Por ahora permitimos acceso a todos
        }

        const solicitudes = await extensionModel.obtenerSolicitudesPorProyecto(proyectoId, estado);

        res.json({
            total: solicitudes.length,
            solicitudes
        });
    } catch (error) {
        console.error('Error al obtener solicitudes:', error);
        res.status(500).json({ message: 'Error al obtener solicitudes' });
    }
};

/**
 * Obtener todas las solicitudes pendientes (admin)
 */
export const obtenerSolicitudesPendientes = async (req, res) => {
    try {
        const rol_id = String(req.user?.role_id || req.rol_id);

        // Solo admin y superadmin pueden ver todas las solicitudes pendientes
        if (rol_id !== '3' && rol_id !== '4') {
            return res.status(403).json({ message: 'Solo administradores pueden acceder a este recurso' });
        }

        const solicitudes = await extensionModel.obtenerSolicitudesPendientes();

        res.json({
            total: solicitudes.length,
            solicitudes
        });
    } catch (error) {
        console.error('Error al obtener solicitudes pendientes:', error);
        res.status(500).json({ message: 'Error al obtener solicitudes pendientes' });
    }
};

/**
 * Marcar solicitud en revisión
 */
export const marcarEnRevision = async (req, res) => {
    try {
        const { solicitudId } = req.params;
        const revisado_por = req.user?.rut || req.rut;
        const rol_id = String(req.user?.role_id || req.rol_id);

        // Solo admin y superadmin pueden marcar en revisión
        if (rol_id !== '3' && rol_id !== '4') {
            return res.status(403).json({ message: 'Solo administradores pueden revisar solicitudes' });
        }

        const resultado = await extensionModel.marcarEnRevision(solicitudId, revisado_por);

        if (!resultado) {
            return res.status(404).json({ message: 'Solicitud no encontrada o ya procesada' });
        }

        res.json({ 
            message: 'Solicitud marcada en revisión',
            solicitud_id: solicitudId 
        });
    } catch (error) {
        console.error('Error al marcar en revisión:', error);
        res.status(500).json({ message: 'Error al marcar solicitud en revisión' });
    }
};

/**
 * Aprobar solicitud de extensión
 */
export const aprobarSolicitud = async (req, res) => {
    try {
        const { solicitudId } = req.params;
        const { comentarios } = req.body;
        const aprobado_por = req.user?.rut || req.rut;
        const rol_id = String(req.user?.role_id || req.rol_id);

        // Solo admin puede aprobar
        if (rol_id !== '3' && rol_id !== '4') {
            return res.status(403).json({ message: 'Solo administradores pueden aprobar solicitudes de extensión' });
        }

        if (!solicitudId) {
            return res.status(400).json({ message: 'ID de solicitud requerido' });
        }

        const resultado = await extensionModel.aprobarSolicitud(
            solicitudId,
            aprobado_por,
            comentarios
        );

        res.json({
            message: 'Solicitud aprobada exitosamente',
            ...resultado
        });
    } catch (error) {
        console.error('Error al aprobar solicitud:', error);

        if (error.message.includes('no encontrada')) {
            return res.status(404).json({ message: error.message });
        }

        if (error.message.includes('ya fue procesada')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al aprobar solicitud' });
    }
};

/**
 * Rechazar solicitud de extensión
 */
export const rechazarSolicitud = async (req, res) => {
    try {
        const { solicitudId } = req.params;
        const { comentarios } = req.body;
        const rechazado_por = req.user?.rut || req.rut;
        const rol_id = String(req.user?.role_id || req.rol_id);

        // Solo admin y superadmin pueden rechazar
        if (rol_id !== '3' && rol_id !== '4') {
            return res.status(403).json({ message: 'Solo administradores pueden rechazar solicitudes' });
        }

        if (!comentarios || comentarios.trim() === '') {
            return res.status(400).json({ 
                message: 'Debe proporcionar un motivo para el rechazo' 
            });
        }

        if (comentarios.trim().length < 20) {
            return res.status(400).json({ 
                message: 'El motivo del rechazo debe ser detallado (mínimo 20 caracteres)' 
            });
        }

        const resultado = await extensionModel.rechazarSolicitud(
            solicitudId,
            rechazado_por,
            comentarios
        );

        if (!resultado) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        res.json({ 
            message: 'Solicitud rechazada',
            solicitud_id: solicitudId 
        });
    } catch (error) {
        console.error('Error al rechazar solicitud:', error);

        if (error.message.includes('ya fue procesada')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al rechazar solicitud' });
    }
};

/**
 * Obtener historial de una solicitud
 */
export const obtenerHistorial = async (req, res) => {
    try {
        const { solicitudId } = req.params;

        if (!solicitudId) {
            return res.status(400).json({ message: 'ID de solicitud requerido' });
        }

        const historial = await extensionModel.obtenerHistorialSolicitud(solicitudId);

        res.json({
            total: historial.length,
            historial
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ message: 'Error al obtener historial' });
    }
};

/**
 * Obtener estadísticas de extensiones (admin)
 */
export const obtenerEstadisticas = async (req, res) => {
    try {
        const rol_id = String(req.user?.role_id || req.rol_id);

        // Solo admin y superadmin pueden ver estadísticas
        if (rol_id !== '3' && rol_id !== '4') {
            return res.status(403).json({ message: 'Solo administradores pueden acceder a estadísticas' });
        }

        const estadisticas = await extensionModel.obtenerEstadisticasExtensiones();

        res.json(estadisticas);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
};
