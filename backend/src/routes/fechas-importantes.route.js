import { Router } from 'express';
import * as fechasImportantesModel from '../models/fechas-importantes.model.js';
import { ProjectService } from '../services/project.service.js';
import { verifySession } from '../middlewares/verifySession.js';
import * as alertasFechasService from '../services/alertas-fechas.service.js';
import { pool } from '../db/connectionDB.js';

const router = Router();

// ===== RUTAS PARA FECHAS IMPORTANTES =====

/**
 * GET /fechas-importantes/globales
 * Obtener todas las fechas importantes globales relacionadas con entregas
 */
router.get('/globales', verifySession, async (req, res) => {
    try {
        const [fechas] = await pool.execute(
            `SELECT 
                id,
                titulo,
                descripcion,
                tipo_fecha,
                DATE_FORMAT(fecha, '%Y-%m-%d') as fecha_limite,
                hora_limite,
                habilitada,
                permite_extension,
                requiere_entrega,
                es_global,
                creado_por_rut as creado_por,
                created_at,
                updated_at
             FROM fechas 
             WHERE es_global = TRUE 
             ORDER BY fecha ASC`
        );
        
        res.json({
            success: true,
            fechas: fechas
        });
    } catch (error) {
        console.error('Error obteniendo fechas globales:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

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
        const { titulo, descripcion, fecha_limite, tipo_fecha, habilitada } = req.body;
        
        
        
        
        // Verificar que la fecha existe
        const fecha = await fechasImportantesModel.obtenerFechaImportantePorId(parseInt(fecha_id));
        if (!fecha) {
            
            return res.status(404).json({
                success: false,
                message: 'Fecha importante no encontrada'
            });
        }
        
        
        
        // Verificar permisos
        // Si es una fecha global (es_global=true y proyecto_id=null), solo admin (rol 3) o super admin (rol 4) pueden modificarla
        if (fecha.es_global && !fecha.proyecto_id) {
            if (req.user.rol_id !== 3 && req.user.rol_id !== 4) {
                
                return res.status(403).json({
                    success: false,
                    message: 'Solo los administradores pueden modificar fechas globales'
                });
            }
        } else if (fecha.proyecto_id) {
            // Si es una fecha de proyecto, verificar permisos del proyecto
            if (req.user.rol_id !== 3 && req.user.rol_id !== 4) {
                const puedeVer = await ProjectService.puedeVerProyecto(fecha.proyecto_id, req.user.rut, req.user.rol_id);
                if (!puedeVer) {
                    return res.status(403).json({
                        success: false,
                        message: 'No tienes permisos para modificar fechas de este proyecto'
                    });
                }
            }
        }
        
        // Preparar datos para actualizar
        const datosActualizar = {
            titulo,
            descripcion,
            fecha_limite,
            tipo_fecha
        };
        
        // Si se proporciona el campo habilitada, incluirlo
        if (habilitada !== undefined) {
            datosActualizar.habilitada = habilitada;
        }
        
        
        
        const actualizado = await fechasImportantesModel.actualizarFechaImportante(parseInt(fecha_id), datosActualizar);
        
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
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
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
                fi.id,
                fi.titulo,
                fi.descripcion,
                fi.tipo_fecha,
                DATE_FORMAT(fi.fecha, '%Y-%m-%d') as fecha_limite,
                fi.habilitada,
                fi.permite_extension,
                fi.requiere_entrega,
                fi.completada,
                fi.proyecto_id,
                fi.profesor_rut,
                fi.estudiante_rut as fi_estudiante_rut,
                fi.es_global,
                fi.creado_por_rut,
                fi.activa,
                p.titulo as titulo_proyecto,
                p.estudiante_rut,
                u.nombre as nombre_estudiante,
                u.email as email_estudiante,
                CASE 
                    WHEN fi.fecha < CURDATE() AND fi.completada = FALSE THEN 'vencida'
                    WHEN fi.fecha = CURDATE() AND fi.completada = FALSE THEN 'hoy'
                    WHEN fi.fecha > CURDATE() AND fi.completada = FALSE THEN 'pendiente'
                    WHEN fi.completada = TRUE THEN 'completada'
                END as estado,
                DATEDIFF(fi.fecha, CURDATE()) as dias_restantes,
                GROUP_CONCAT(CONCAT(u_prof.nombre, ' (', rp.nombre, ')') SEPARATOR ', ') as profesores_asignados
            FROM fechas fi
            INNER JOIN proyectos p ON fi.proyecto_id = p.id
            INNER JOIN usuarios u ON p.estudiante_rut = u.rut
            LEFT JOIN asignaciones_proyectos a ON p.id = a.proyecto_id AND a.activo = TRUE
            LEFT JOIN usuarios u_prof ON a.profesor_rut = u_prof.rut
            LEFT JOIN roles_profesores rp ON a.rol_profesor_id = rp.id
            GROUP BY fi.id
            ORDER BY fi.fecha ASC
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
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

export default router;