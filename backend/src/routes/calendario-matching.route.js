import express from 'express';
import * as CalendarioMatchingService from '../services/calendario-matching.service.js';
import * as CalendarioMatchingModel from '../models/calendario-matching.model.js';
import * as ReunionesModel from '../models/reuniones.model.js';
import { verifySession } from '../middlewares/verifySession.js';
import { pool } from '../db/connectionDB.js';

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
 * Obtener solicitudes de reunión del usuario con permisos estrictos
 */
router.get('/solicitudes', async (req, res) => {
    try {
        const { user } = req;
        const { estado } = req.query;
        
        let solicitudes = [];
        
        if (user.role_id === 1) {
            // ESTUDIANTES: Solo ven sus propias solicitudes enviadas
            const query = `
                SELECT 
                    sr.*,
                    p.titulo as proyecto_titulo,
                    ue.nombre as estudiante_nombre,
                    up.nombre as profesor_nombre,
                    rp.nombre as rol_profesor_nombre
                FROM solicitudes_reunion sr
                INNER JOIN proyectos p ON sr.proyecto_id = p.id
                INNER JOIN usuarios ue ON sr.estudiante_rut = ue.rut
                INNER JOIN usuarios up ON sr.profesor_rut = up.rut
                INNER JOIN asignaciones_proyectos ap ON ap.proyecto_id = sr.proyecto_id AND ap.profesor_rut = sr.profesor_rut
                INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
                WHERE sr.estudiante_rut = ? 
                ${estado ? 'AND sr.estado = ?' : 'AND sr.estado NOT IN ("cancelada")'}
                ORDER BY sr.fecha_propuesta ASC, sr.hora_propuesta ASC
            `;
            
            const params = estado ? [user.rut, estado] : [user.rut];
            const [rows] = await pool.execute(query, params);
            solicitudes = rows;
            
        } else if (user.role_id === 2) {
            // PROFESORES: Solo ven solicitudes dirigidas a ellos en proyectos donde están asignados
            const query = `
                SELECT 
                    sr.*,
                    p.titulo as proyecto_titulo,
                    ue.nombre as estudiante_nombre,
                    up.nombre as profesor_nombre,
                    rp.nombre as rol_profesor_nombre
                FROM solicitudes_reunion sr
                INNER JOIN proyectos p ON sr.proyecto_id = p.id
                INNER JOIN usuarios ue ON sr.estudiante_rut = ue.rut
                INNER JOIN usuarios up ON sr.profesor_rut = up.rut
                INNER JOIN asignaciones_proyectos ap ON ap.proyecto_id = sr.proyecto_id 
                    AND ap.profesor_rut = sr.profesor_rut 
                    AND ap.activo = TRUE
                INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
                WHERE sr.profesor_rut = ? 
                ${estado ? 'AND sr.estado = ?' : 'AND sr.estado NOT IN ("cancelada")'}
                ORDER BY sr.fecha_propuesta ASC, sr.hora_propuesta ASC
            `;
            
            const params = estado ? [user.rut, estado] : [user.rut];
            const [rows] = await pool.execute(query, params);
            solicitudes = rows;
            
        } else {
            // ADMINS: Pueden ver todas las solicitudes
            const query = `
                SELECT 
                    sr.*,
                    p.titulo as proyecto_titulo,
                    ue.nombre as estudiante_nombre,
                    up.nombre as profesor_nombre,
                    rp.nombre as rol_profesor_nombre
                FROM solicitudes_reunion sr
                INNER JOIN proyectos p ON sr.proyecto_id = p.id
                INNER JOIN usuarios ue ON sr.estudiante_rut = ue.rut
                INNER JOIN usuarios up ON sr.profesor_rut = up.rut
                INNER JOIN asignaciones_proyectos ap ON ap.proyecto_id = sr.proyecto_id AND ap.profesor_rut = sr.profesor_rut
                INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
                ${estado ? 'WHERE sr.estado = ?' : 'WHERE sr.estado NOT IN ("cancelada")'}
                ORDER BY sr.fecha_propuesta ASC, sr.hora_propuesta ASC
            `;
            
            const params = estado ? [estado] : [];
            const [rows] = await pool.execute(query, params);
            solicitudes = rows;
        }
        
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
 * POST /api/calendario-matching/solicitudes
 * Crear una nueva solicitud de reunión
 */
router.post('/solicitudes', async (req, res) => {
    try {
        const { user } = req;
        const { 
            profesor_rut, 
            fecha_propuesta, 
            hora_inicio_propuesta, 
            hora_fin_propuesta,
            motivo,
            duracion_minutos = 60,
            urgencia = 'media',
            comentarios_adicionales
        } = req.body;

        // Validaciones básicas
        if (!profesor_rut || !fecha_propuesta || !hora_inicio_propuesta || !motivo) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios: profesor_rut, fecha_propuesta, hora_inicio_propuesta, motivo'
            });
        }

        // Verificar que el usuario es estudiante
        if (user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Solo los estudiantes pueden crear solicitudes de reunión'
            });
        }

        // Obtener el proyecto activo del estudiante
        const proyectoQuery = `
            SELECT id FROM proyectos 
            WHERE estudiante_rut = ? AND estado_id IN (1, 2, 3, 4, 5, 6, 11, 12, 13)
            ORDER BY fecha_inicio DESC 
            LIMIT 1
        `;
        const [proyectos] = await pool.execute(proyectoQuery, [user.rut]);
        
        if (proyectos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No tienes proyectos activos para solicitar reuniones'
            });
        }

        const proyecto_id = proyectos[0].id;

        // Verificar que el profesor está asignado al proyecto del estudiante
        const validacionProfesorQuery = `
            SELECT ap.id, rp.nombre as rol_nombre
            FROM asignaciones_proyectos ap
            INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            WHERE ap.proyecto_id = ? AND ap.profesor_rut = ? AND ap.activo = TRUE
        `;
        const [asignaciones] = await pool.execute(validacionProfesorQuery, [proyecto_id, profesor_rut]);
        
        console.log('Validación de profesor:', { proyecto_id, profesor_rut, asignaciones });
        
        if (asignaciones.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'No puedes solicitar reunión a este profesor. Solo puedes solicitar reuniones a los profesores asignados a tu proyecto (guía, co-guía o informante).'
            });
        }

        // Crear la solicitud
        const nuevaSolicitud = await CalendarioMatchingModel.crearSolicitudReunion({
            proyecto_id,
            profesor_rut,
            estudiante_rut: user.rut,
            fecha_propuesta,
            hora_propuesta: hora_inicio_propuesta,
            duracion_minutos,
            tipo_reunion: 'seguimiento',
            descripcion: motivo,
            estado: 'pendiente',
            creado_por: 'estudiante',
            comentarios_estudiante: comentarios_adicionales
        });

        res.status(201).json({
            success: true,
            data: nuevaSolicitud,
            message: `Solicitud de reunión enviada exitosamente al ${asignaciones[0].rol_nombre}`,
            profesor_rol: asignaciones[0].rol_nombre
        });

    } catch (error) {
        console.error('Error creando solicitud:', error);
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

/**
 * GET /api/calendario-matching/profesores
 * Obtener profesores del proyecto activo del estudiante
 */
router.get('/profesores', async (req, res) => {
    try {
        const { user } = req;
        console.log('Usuario solicitando profesores:', user);
        
        // Verificar que el usuario es estudiante
        if (user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Solo los estudiantes pueden ver sus profesores asignados'
            });
        }

        // Obtener el proyecto activo del estudiante
        const proyectoQuery = `
            SELECT id FROM proyectos 
            WHERE estudiante_rut = ? AND estado_id IN (1, 2, 3, 4, 5, 6, 11, 12, 13)
            ORDER BY fecha_inicio DESC 
            LIMIT 1
        `;
        const [proyectos] = await pool.execute(proyectoQuery, [user.rut]);
        console.log('Proyectos encontrados:', proyectos);
        
        if (proyectos.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'No tienes proyectos activos'
            });
        }

        const proyecto_id = proyectos[0].id;
        console.log('Proyecto ID:', proyecto_id);

        // Obtener los profesores asignados al proyecto
        const profesoresQuery = `
            SELECT 
                u.rut,
                u.nombre,
                u.email,
                rp.nombre as rol_nombre,
                ap.rol_profesor_id
            FROM asignaciones_proyectos ap
            INNER JOIN usuarios u ON ap.profesor_rut = u.rut
            INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            WHERE ap.proyecto_id = ? AND ap.activo = TRUE
            ORDER BY u.nombre
        `;
        const [profesores] = await pool.execute(profesoresQuery, [proyecto_id]);
        console.log('Profesores encontrados:', profesores);

        res.json({
            success: true,
            data: profesores,
            message: `Profesores asignados a tu proyecto (${profesores.length} encontrados)`
        });

    } catch (error) {
        console.error('Error obteniendo profesores del proyecto:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;