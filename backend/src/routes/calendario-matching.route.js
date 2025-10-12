import express from 'express';
import * as CalendarioMatchingService from '../services/calendario-matching.service.js';
import verifySession from '../middlewares/verifySession.js';

const router = express.Router();

// ===== MIDDLEWARE DE VERIFICACIÓN =====
// Todos los endpoints requieren autenticación
router.use(verifySession);

// ===== ENDPOINTS DE DISPONIBILIDAD =====

/**
 * GET /api/calendario-matching/disponibilidades
 * Obtener disponibilidades del usuario autenticado
 */
router.get('/disponibilidades', async (req, res) => {
    try {
        const { user } = req;
        
        const disponibilidades = await CalendarioMatchingModel.obtenerDisponibilidadesUsuario(user.rut);
        
        res.json({
            success: true,
            data: disponibilidades,
            message: `Disponibilidades de ${user.nombre}`
        });
        
    } catch (error) {
        console.error('Error obteniendo disponibilidades:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/calendario-matching/disponibilidades
 * Crear nueva disponibilidad
 */
router.post('/disponibilidades', async (req, res) => {
    try {
        const { user } = req;
        const { dia_semana, hora_inicio, hora_fin } = req.body;
        
        // Validaciones básicas
        if (!dia_semana || !hora_inicio || !hora_fin) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos: dia_semana, hora_inicio, hora_fin'
            });
        }
        
        const resultado = await CalendarioMatchingService.crearDisponibilidadValidada({
            dia_semana,
            hora_inicio,
            hora_fin
        }, user.rut);
        
        res.status(201).json({
            success: true,
            data: resultado,
            message: 'Disponibilidad creada exitosamente'
        });
        
    } catch (error) {
        console.error('Error creando disponibilidad:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * DELETE /api/calendario-matching/disponibilidades/:id
 * Eliminar disponibilidad
 */
router.delete('/disponibilidades/:id', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        
        const resultado = await CalendarioMatchingModel.eliminarDisponibilidad(id, user.rut);
        
        res.json({
            success: true,
            data: resultado,
            message: 'Disponibilidad eliminada exitosamente'
        });
        
    } catch (error) {
        console.error('Error eliminando disponibilidad:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== ENDPOINTS DE MATCHING Y SOLICITUDES =====

/**
 * POST /api/calendario-matching/buscar-reunion
 * Buscar horarios disponibles y proponer reunión automática
 */
router.post('/buscar-reunion', async (req, res) => {
    try {
        const { user } = req;
        const { proyecto_id, tipo_reunion, descripcion, duracion_minutos } = req.body;
        
        if (!proyecto_id) {
            return res.status(400).json({
                success: false,
                message: 'proyecto_id es requerido'
            });
        }
        
        const preferencias = {
            tipo_reunion: tipo_reunion || 'seguimiento',
            descripcion: descripcion || undefined,
            duracion_minutos: duracion_minutos || 60
        };
        
        const resultado = await CalendarioMatchingService.buscarYProponerReunion(
            proyecto_id,
            user.rut,
            preferencias
        );
        
        res.json({
            success: true,
            data: resultado,
            message: 'Búsqueda de horarios completada'
        });
        
    } catch (error) {
        console.error('Error en búsqueda de reunión:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/calendario-matching/solicitudes
 * Obtener solicitudes de reunión del usuario
 */
router.get('/solicitudes', async (req, res) => {
    try {
        const { user } = req;
        const { estado } = req.query;
        
        const solicitudes = await CalendarioMatchingModel.obtenerSolicitudesUsuario(user.rut, estado);
        
        res.json({
            success: true,
            data: solicitudes,
            message: `Solicitudes de ${user.nombre}`,
            filtros: { estado: estado || 'todas' }
        });
        
    } catch (error) {
        console.error('Error obteniendo solicitudes:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/calendario-matching/solicitudes/:id/responder
 * Responder a una solicitud de reunión
 */
router.post('/solicitudes/:id/responder', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const { respuesta, comentarios } = req.body;
        
        if (!respuesta || !['aceptar', 'rechazar'].includes(respuesta)) {
            return res.status(400).json({
                success: false,
                message: 'Respuesta debe ser "aceptar" o "rechazar"'
            });
        }
        
        const resultado = await CalendarioMatchingService.gestionarRespuestaSolicitud(
            id,
            user.rut,
            respuesta,
            comentarios || ''
        );
        
        res.json({
            success: true,
            data: resultado,
            message: `Solicitud ${respuesta === 'aceptar' ? 'aceptada' : 'rechazada'} exitosamente`
        });
        
    } catch (error) {
        console.error('Error respondiendo solicitud:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ===== ENDPOINTS DE REUNIONES =====

/**
 * GET /api/calendario-matching/reuniones
 * Obtener reuniones del usuario
 */
router.get('/reuniones', async (req, res) => {
    try {
        const { user } = req;
        const { estado } = req.query;
        
        const reuniones = await ReunionesModel.obtenerReunionesUsuario(user.rut, estado);
        
        res.json({
            success: true,
            data: reuniones,
            message: `Reuniones de ${user.nombre}`,
            filtros: { estado: estado || 'todas' }
        });
        
    } catch (error) {
        console.error('Error obteniendo reuniones:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/calendario-matching/reuniones/:id/reprogramar
 * Reprogramar una reunión
 */
router.post('/reuniones/:id/reprogramar', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const { nueva_fecha, nueva_hora } = req.body;
        
        if (!nueva_fecha || !nueva_hora) {
            return res.status(400).json({
                success: false,
                message: 'nueva_fecha y nueva_hora son requeridos'
            });
        }
        
        const resultado = await CalendarioMatchingService.reprogramarReunionValidada(
            id,
            nueva_fecha,
            nueva_hora,
            user.rut
        );
        
        res.json({
            success: true,
            data: resultado,
            message: 'Reunión reprogramada exitosamente'
        });
        
    } catch (error) {
        console.error('Error reprogramando reunión:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/calendario-matching/reuniones/:id/cancelar
 * Cancelar una reunión
 */
router.post('/reuniones/:id/cancelar', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const { motivo } = req.body;
        
        const resultado = await ReunionesModel.cancelarReunion(id, user.rut, motivo || '');
        
        res.json({
            success: true,
            data: resultado,
            message: 'Reunión cancelada exitosamente'
        });
        
    } catch (error) {
        console.error('Error cancelando reunión:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// ===== DASHBOARD Y ESTADÍSTICAS =====

/**
 * GET /api/calendario-matching/dashboard
 * Obtener dashboard completo del usuario
 */
router.get('/dashboard', async (req, res) => {
    try {
        const { user } = req;
        
        const dashboard = await CalendarioMatchingService.obtenerDashboardReuniones(
            user.rut,
            user.role_id
        );
        
        res.json({
            success: true,
            data: dashboard,
            message: `Dashboard de ${user.nombre}`
        });
        
    } catch (error) {
        console.error('Error obteniendo dashboard:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/calendario-matching/verificar-relacion/:proyecto_id
 * Verificar si el usuario puede agendar reunión en un proyecto
 */
router.get('/verificar-relacion/:proyecto_id', async (req, res) => {
    try {
        const { user } = req;
        const { proyecto_id } = req.params;
        
        // Obtener información del proyecto y verificar relación
        const verificacion = await CalendarioMatchingService.verificarRelacionProfesorEstudiante(
            user.rut,
            proyecto_id
        );
        
        res.json({
            success: true,
            data: verificacion,
            message: 'Verificación completada'
        });
        
    } catch (error) {
        console.error('Error verificando relación:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== ENDPOINTS DE ADMINISTRACIÓN =====

/**
 * GET /api/calendario-matching/estadisticas
 * Obtener estadísticas generales del sistema (solo admin)
 */
router.get('/estadisticas', async (req, res) => {
    try {
        const { user } = req;
        
        // Solo admins pueden ver estadísticas generales
        if (user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver estadísticas generales'
            });
        }
        
        const estadisticas = await ReunionesModel.obtenerEstadisticasGenerales();
        
        res.json({
            success: true,
            data: estadisticas,
            message: 'Estadísticas generales del sistema'
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// ===== IMPORTACIONES NECESARIAS =====
import * as CalendarioMatchingModel from '../models/calendario-matching.model.js';
import * as ReunionesModel from '../models/reuniones.model.js';

export default router;