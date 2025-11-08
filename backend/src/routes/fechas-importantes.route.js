import { Router } from 'express';
import * as fechasImportantesModel from '../models/fechas-importantes.model.js';
import { ProjectService } from '../services/project.service.js';
import { verifySession } from '../middlewares/verifySession.js';
import * as alertasFechasService from '../services/alertas-fechas.service.js';
import { pool } from '../db/connectionDB.js';

const router = Router();

// ===== RUTAS PARA FECHAS IMPORTANTES =====

/**
 * GET /fechas-importantes/admin/todas
 * Obtener todas las fechas importantes de todos los proyectos (solo admin)
 */
router.get('/admin/todas', verifySession, async (req, res) => {
    try {
        // Verificar que el usuario sea admin
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver todas las fechas importantes'
            });
        }
        
        const todasFechas = await fechasImportantesModel.obtenerTodasFechasImportantes();
        
        res.json({
            success: true,
            data: todasFechas
        });
    } catch (error) {
        console.error('Error al obtener todas las fechas importantes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /fechas-importantes/proyecto/:proyecto_id
 * Obtener todas las fechas importantes de un proyecto
 */
router.get('/proyecto/:proyecto_id', verifySession, async (req, res) => {
    try {
        const { proyecto_id } = req.params;
        
        // Verificar permisos para ver el proyecto
        const puedeVer = await ProjectService.puedeVerProyecto(proyecto_id, req.user.rut, req.user.role_id);
        if (!puedeVer) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver las fechas de este proyecto'
            });
        }
        
        const fechasInfo = await ProjectService.obtenerFechasConNotificaciones(parseInt(proyecto_id));
        
        res.json({
            success: true,
            data: fechasInfo
        });
    } catch (error) {
        console.error('Error al obtener fechas importantes:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /fechas-importantes
 * Crear una nueva fecha importante
 */
router.post('/', verifySession, async (req, res) => {
    try {
        const { proyecto_id, tipo_fecha, titulo, descripcion, fecha_limite } = req.body;
        
        // Validar datos requeridos
        if (!proyecto_id || !tipo_fecha || !titulo || !fecha_limite) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios: proyecto_id, tipo_fecha, titulo, fecha_limite'
            });
        }
        
        // Verificar permisos (solo admin y profesores guía pueden crear fechas)
        if (req.user.role_id !== 3) { // No es admin
            const puedeVer = await ProjectService.puedeVerProyecto(proyecto_id, req.user.rut, req.user.role_id);
            if (!puedeVer) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para crear fechas en este proyecto'
                });
            }
        }
        
        const fechaId = await fechasImportantesModel.crearFechaImportante({
            proyecto_id,
            tipo_fecha,
            titulo,
            descripcion,
            fecha_limite
        });
        
        const fechaCreada = await fechasImportantesModel.obtenerFechaImportantePorId(fechaId);
        
        res.status(201).json({
            success: true,
            message: 'Fecha importante creada exitosamente',
            data: fechaCreada
        });
    } catch (error) {
        console.error('Error al crear fecha importante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * PUT /fechas-importantes/:fecha_id
 * Actualizar una fecha importante
 */
router.put('/:fecha_id', verifySession, async (req, res) => {
    try {
        const { fecha_id } = req.params;
        const { titulo, descripcion, fecha_limite, tipo_fecha } = req.body;
        
        // Verificar que la fecha existe
        const fecha = await fechasImportantesModel.obtenerFechaImportantePorId(parseInt(fecha_id));
        if (!fecha) {
            return res.status(404).json({
                success: false,
                message: 'Fecha importante no encontrada'
            });
        }
        
        // Verificar permisos
        if (req.user.role_id !== 3) { // No es admin
            const puedeVer = await ProjectService.puedeVerProyecto(fecha.proyecto_id, req.user.rut, req.user.role_id);
            if (!puedeVer) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para modificar fechas de este proyecto'
                });
            }
        }
        
        const actualizado = await fechasImportantesModel.actualizarFechaImportante(parseInt(fecha_id), {
            titulo,
            descripcion,
            fecha_limite,
            tipo_fecha
        });
        
        if (!actualizado) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar la fecha importante'
            });
        }
        
        const fechaActualizada = await fechasImportantesModel.obtenerFechaImportantePorId(parseInt(fecha_id));
        
        res.json({
            success: true,
            message: 'Fecha importante actualizada exitosamente',
            data: fechaActualizada
        });
    } catch (error) {
        console.error('Error al actualizar fecha importante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * PUT /fechas-importantes/:fecha_id/completar
 * Marcar una fecha como completada
 */
router.put('/:fecha_id/completar', verifySession, async (req, res) => {
    try {
        const { fecha_id } = req.params;
        const { fecha_realizada } = req.body;
        
        // Verificar que la fecha existe
        const fecha = await fechasImportantesModel.obtenerFechaImportantePorId(parseInt(fecha_id));
        if (!fecha) {
            return res.status(404).json({
                success: false,
                message: 'Fecha importante no encontrada'
            });
        }
        
        // Verificar permisos
        if (req.user.role_id !== 3) { // No es admin
            const puedeVer = await ProjectService.puedeVerProyecto(fecha.proyecto_id, req.user.rut, req.user.role_id);
            if (!puedeVer) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para completar fechas de este proyecto'
                });
            }
        }
        
        const completado = await fechasImportantesModel.marcarFechaComoCompletada(
            parseInt(fecha_id),
            fecha_realizada ? new Date(fecha_realizada) : null
        );
        
        if (!completado) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo marcar la fecha como completada'
            });
        }
        
        const fechaActualizada = await fechasImportantesModel.obtenerFechaImportantePorId(parseInt(fecha_id));
        
        res.json({
            success: true,
            message: 'Fecha marcada como completada exitosamente',
            data: fechaActualizada
        });
    } catch (error) {
        console.error('Error al completar fecha importante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * DELETE /fechas-importantes/:fecha_id
 * Eliminar una fecha importante
 */
router.delete('/:fecha_id', verifySession, async (req, res) => {
    try {
        const { fecha_id } = req.params;
        
        // Verificar que la fecha existe
        const fecha = await fechasImportantesModel.obtenerFechaImportantePorId(parseInt(fecha_id));
        if (!fecha) {
            return res.status(404).json({
                success: false,
                message: 'Fecha importante no encontrada'
            });
        }
        
        // Solo admin puede eliminar fechas
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar fechas importantes'
            });
        }
        
        const eliminado = await fechasImportantesModel.eliminarFechaImportante(parseInt(fecha_id));
        
        if (!eliminado) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo eliminar la fecha importante'
            });
        }
        
        res.json({
            success: true,
            message: 'Fecha importante eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar fecha importante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /fechas-importantes/:fecha_id
 * Obtener una fecha importante específica
 */
router.get('/:fecha_id', verifySession, async (req, res) => {
    try {
        const { fecha_id } = req.params;
        
        const fecha = await fechasImportantesModel.obtenerFechaImportantePorId(parseInt(fecha_id));
        
        if (!fecha) {
            return res.status(404).json({
                success: false,
                message: 'Fecha importante no encontrada'
            });
        }
        
        // Verificar permisos
        const puedeVer = await ProjectService.puedeVerProyecto(fecha.proyecto_id, req.user.rut, req.user.role_id);
        if (!puedeVer) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver esta fecha importante'
            });
        }
        
        res.json({
            success: true,
            data: fecha
        });
    } catch (error) {
        console.error('Error al obtener fecha importante:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// ===== RUTAS PARA SISTEMA DE ALERTAS AUTOMÁTICAS =====

/**
 * POST /fechas-importantes/alertas/generar
 * Generar alertas automáticas (solo admin - para ejecutar manualmente o con cron)
 */
router.post('/alertas/generar', verifySession, async (req, res) => {
    try {
        // Verificar que el usuario sea admin
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden generar alertas'
            });
        }
        
        const resultado = await alertasFechasService.generarAlertasAutomaticas();
        
        res.json({
            success: true,
            message: 'Alertas generadas correctamente',
            data: resultado
        });
    } catch (error) {
        console.error('Error al generar alertas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /fechas-importantes/alertas/mis-alertas
 * Obtener alertas del usuario autenticado
 */
router.get('/alertas/mis-alertas', verifySession, async (req, res) => {
    try {
        const alertas = await alertasFechasService.obtenerAlertasUsuario(
            req.user.rut,
            req.user.role_id
        );
        
        res.json({
            success: true,
            data: alertas
        });
    } catch (error) {
        console.error('Error al obtener alertas de usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /fechas-importantes/alertas/resumen-proyecto/:proyecto_id
 * Obtener resumen de alertas de un proyecto
 */
router.get('/alertas/resumen-proyecto/:proyecto_id', verifySession, async (req, res) => {
    try {
        const { proyecto_id } = req.params;
        
        // Verificar permisos para ver el proyecto
        const puedeVer = await ProjectService.puedeVerProyecto(proyecto_id, req.user.rut, req.user.role_id);
        if (!puedeVer) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver las alertas de este proyecto'
            });
        }
        
        const resumen = await alertasFechasService.obtenerResumenAlertasProyecto(parseInt(proyecto_id));
        
        res.json({
            success: true,
            data: resumen
        });
    } catch (error) {
        console.error('Error al obtener resumen de alertas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * PUT /fechas-importantes/alertas/marcar-leidas
 * Marcar todas las alertas del usuario como leídas
 */
router.put('/alertas/marcar-leidas', verifySession, async (req, res) => {
    try {
        const resultado = await alertasFechasService.marcarTodasAlertasLeidas(req.user.rut);
        
        res.json({
            success: true,
            message: 'Alertas marcadas como leídas',
            data: { actualizado: resultado }
        });
    } catch (error) {
        console.error('Error al marcar alertas como leídas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /fechas-importantes/admin/calendario-general
 * Vista de calendario general para admin con TODAS las fechas importantes
 * Artículos 29-32 del reglamento
 */
router.get('/admin/calendario-general', verifySession, async (req, res) => {
    try {
        // Verificar que el usuario sea admin
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver el calendario general'
            });
        }
        
        // Obtener todas las fechas con información de profesores
        const [fechasCompletas] = await pool.execute(`
            SELECT 
                fi.*,
                p.titulo as titulo_proyecto,
                p.estudiante_rut,
                u.nombre as nombre_estudiante,
                u.email as email_estudiante,
                CASE 
                    WHEN fi.fecha_limite < CURDATE() AND fi.completada = FALSE THEN 'vencida'
                    WHEN fi.fecha_limite = CURDATE() AND fi.completada = FALSE THEN 'hoy'
                    WHEN fi.fecha_limite > CURDATE() AND fi.completada = FALSE THEN 'pendiente'
                    WHEN fi.completada = TRUE THEN 'completada'
                END as estado,
                DATEDIFF(fi.fecha_limite, CURDATE()) as dias_restantes,
                GROUP_CONCAT(CONCAT(u_prof.nombre, ' (', rp.nombre, ')') SEPARATOR ', ') as profesores_asignados
            FROM fechas_importantes fi
            INNER JOIN proyectos p ON fi.proyecto_id = p.id
            INNER JOIN usuarios u ON p.estudiante_rut = u.rut
            LEFT JOIN asignaciones_proyectos a ON p.id = a.proyecto_id AND a.activo = TRUE
            LEFT JOIN usuarios u_prof ON a.profesor_rut = u_prof.rut
            LEFT JOIN roles_profesores rp ON a.rol_profesor_id = rp.id
            GROUP BY fi.id
            ORDER BY fi.fecha_limite ASC
        `);
        
        // Agrupar por tipo de fecha
        const calendarioPorTipo = {
            entrega_final: [],
            defensa: [],
            presentacion: [],
            entrega_avance: [],
            revision_parcial: []
        };
        
        fechasCompletas.forEach(fecha => {
            if (calendarioPorTipo[fecha.tipo_fecha]) {
                calendarioPorTipo[fecha.tipo_fecha].push(fecha);
            }
        });
        
        res.json({
            success: true,
            data: {
                todas_fechas: fechasCompletas,
                por_tipo: calendarioPorTipo,
                estadisticas: {
                    total: fechasCompletas.length,
                    vencidas: fechasCompletas.filter(f => f.estado === 'vencida').length,
                    hoy: fechasCompletas.filter(f => f.estado === 'hoy').length,
                    pendientes: fechasCompletas.filter(f => f.estado === 'pendiente').length,
                    completadas: fechasCompletas.filter(f => f.estado === 'completada').length
                }
            }
        });
    } catch (error) {
        console.error('Error al obtener calendario general:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

export default router;