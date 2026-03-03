import express from 'express';
import * as CalendarioMatchingService from '../services/calendario-matching.service.js';
import * as CalendarioMatchingModel from '../models/calendario-matching.model.js';
import * as ReunionesModel from '../models/reuniones.model.js';
import { verifySession } from '../middlewares/verifySession.js';
import { pool } from '../db/connectionDB.js';
import { sendSolicitudReunionEmail } from '../services/email.service.js';
import { UserModel } from '../models/user.model.js';
import { logger } from '../config/logger.js';

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
        
        if (!user || !user.rut) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }
        
        const disponibilidades = await CalendarioMatchingModel.obtenerTodasDisponibilidadesUsuario(user.rut);
        
        // Mapear 'activo' del backend a 'activa' del frontend
        const disponibilidadesMapeadas = disponibilidades.map(disp => ({
            ...disp,
            activa: disp.activo
        }));
        
        res.json({
            success: true,
            data: disponibilidadesMapeadas,
            message: `Disponibilidades de ${user.nombre}`
        });
        
    } catch (error) {
        
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
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * PUT /api/calendario-matching/disponibilidades/:id
 * Actualizar disponibilidad existente
 */
router.put('/disponibilidades/:id', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const updateData = req.body;
        
        // Validar que el ID sea un número
        if (isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'ID de disponibilidad inválido'
            });
        }
        
        // Mapear 'activa' del frontend a 'activo' del backend si existe
        if ('activa' in updateData) {
            updateData.activo = updateData.activa;
            delete updateData.activa;
        }
        
        // Validar campos si se proporcionan
        const { dia_semana, hora_inicio, hora_fin, activo } = updateData;
        
        if (dia_semana && !['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].includes(dia_semana)) {
            return res.status(400).json({
                success: false,
                message: 'Día de la semana inválido'
            });
        }
        
        if (hora_inicio && hora_fin && hora_inicio >= hora_fin) {
            return res.status(400).json({
                success: false,
                message: 'La hora de inicio debe ser menor que la hora de fin'
            });
        }
        
        const actualizado = await CalendarioMatchingModel.actualizarDisponibilidad(id, user.rut, updateData);
        
        if (!actualizado) {
            return res.status(404).json({
                success: false,
                message: 'Disponibilidad no encontrada o no tienes permisos para modificarla'
            });
        }
        
        res.json({
            success: true,
            message: 'Disponibilidad actualizada exitosamente'
        });
        
    } catch (error) {
        
        res.status(500).json({
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
        const { tipo_reunion, descripcion, duracion_minutos, profesor_rut } = req.body;
        
        // Validar que se envió el profesor_rut
        if (!profesor_rut) {
            return res.status(400).json({
                success: false,
                message: 'profesor_rut es requerido'
            });
        }

        // Obtener el proyecto más reciente del estudiante (sin filtrar por estado)
        const proyectoQuery = `
            SELECT id FROM proyectos 
            WHERE estudiante_rut = ?
            ORDER BY fecha_inicio DESC 
            LIMIT 1
        `;
        const [proyectos] = await pool.execute(proyectoQuery, [user.rut]);
        
        if (proyectos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No tienes proyectos registrados. Debes tener un proyecto para solicitar reuniones.'
            });
        }

        const proyecto_id = proyectos[0].id;
        
        const preferencias = {
            tipo_reunion: tipo_reunion || 'seguimiento',
            descripcion: descripcion || undefined,
            duracion_minutos: duracion_minutos || 60,
            profesor_rut: profesor_rut
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
                    COALESCE(p.titulo, 'Proyecto sin título') as proyecto_titulo,
                    COALESCE(ue.nombre, 'Estudiante') as estudiante_nombre,
                    COALESCE(up.nombre, 'Profesor') as profesor_nombre,
                    'Profesor Guía' as rol_profesor_nombre
                FROM solicitudes_reunion sr
                LEFT JOIN proyectos p ON sr.proyecto_id = p.id
                LEFT JOIN usuarios ue ON sr.estudiante_rut = ue.rut
                LEFT JOIN usuarios up ON sr.profesor_rut = up.rut
                WHERE sr.estudiante_rut = ? 
                ${estado ? 'AND sr.estado = ?' : 'AND sr.estado NOT IN ("cancelada")'}
                ORDER BY sr.fecha_propuesta ASC, sr.hora_propuesta ASC
            `;
            
            const params = estado ? [user.rut, estado] : [user.rut];
            const [rows] = await pool.execute(query, params);
            solicitudes = rows;
            
        } else if (user.role_id === 2) {
            // PROFESORES: Solo ven solicitudes dirigidas a ellos
            const query = `
                SELECT 
                    sr.*,
                    COALESCE(p.titulo, 'Proyecto sin título') as proyecto_titulo,
                    COALESCE(ue.nombre, 'Estudiante') as estudiante_nombre,
                    COALESCE(up.nombre, 'Profesor') as profesor_nombre,
                    'Profesor Guía' as rol_profesor_nombre
                FROM solicitudes_reunion sr
                LEFT JOIN proyectos p ON sr.proyecto_id = p.id
                LEFT JOIN usuarios ue ON sr.estudiante_rut = ue.rut
                LEFT JOIN usuarios up ON sr.profesor_rut = up.rut
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
                    COALESCE(p.titulo, 'Proyecto sin título') as proyecto_titulo,
                    COALESCE(ue.nombre, 'Estudiante') as estudiante_nombre,
                    COALESCE(up.nombre, 'Profesor') as profesor_nombre,
                    'Profesor Guía' as rol_profesor_nombre
                FROM solicitudes_reunion sr
                LEFT JOIN proyectos p ON sr.proyecto_id = p.id
                LEFT JOIN usuarios ue ON sr.estudiante_rut = ue.rut
                LEFT JOIN usuarios up ON sr.profesor_rut = up.rut
                ${estado ? 'WHERE sr.estado = ?' : 'WHERE sr.estado NOT IN ("cancelada")'}
                ORDER BY sr.fecha_propuesta ASC, sr.hora_propuesta ASC
            `;
            
            const params = estado ? [estado] : [];
            const [rows] = await pool.execute(query, params);
            solicitudes = rows;
        }
        
        res.json({
            success: true,
            data: solicitudes || [],
            message: `Solicitudes de ${user.nombre}`,
            filtros: { estado: estado || 'todas' }
        });
        
    } catch (error) {
        
        res.status(500).json({
            success: false,
            data: [], // Siempre devolver un array vacío
            message: error.message || 'Error interno del servidor'
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

        // Calcular hora_fin si no viene
        let hora_fin_calculada = hora_fin_propuesta;
        if (!hora_fin_calculada) {
            const horaInicio = new Date(`2000-01-01 ${hora_inicio_propuesta}`);
            horaInicio.setMinutes(horaInicio.getMinutes() + duracion_minutos);
            hora_fin_calculada = horaInicio.toTimeString().slice(0, 5);
        }

        // Verificar que el usuario es estudiante
        if (user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Solo los estudiantes pueden crear solicitudes de reunión'
            });
        }

        // Obtener el proyecto más reciente del estudiante (sin filtrar por estado)
        const proyectoQuery = `
            SELECT id FROM proyectos 
            WHERE estudiante_rut = ?
            ORDER BY fecha_inicio DESC 
            LIMIT 1
        `;
        const [proyectos] = await pool.execute(proyectoQuery, [user.rut]);
        
        if (proyectos.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No tienes proyectos registrados. Debes tener un proyecto para solicitar reuniones.'
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

        // Formatear nombre del rol
        const rolFormateado = asignaciones[0].rol_nombre
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

        // 📧 Enviar email al profesor
        try {
            const [proyectos] = await pool.query('SELECT titulo FROM proyectos WHERE id = ?', [proyecto_id]);
            const profesor = await UserModel.findPersonByRut(profesor_rut);
            const estudiante = await UserModel.findPersonByRut(user.rut);
            
            if (profesor && profesor.email && profesor.rol_id !== 3 && estudiante && proyectos.length > 0) {
                await sendSolicitudReunionEmail(
                    profesor.email,
                    profesor.nombre,
                    estudiante.nombre,
                    proyectos[0].titulo,
                    `${fecha_propuesta} ${hora_inicio_propuesta}`,
                    motivo || ''
                );
                logger.info('Email de solicitud de reunión enviado', { 
                    solicitud_id: nuevaSolicitud.id, 
                    profesor_email: profesor.email 
                });
            }
        } catch (emailError) {
            logger.error('Error al enviar email de solicitud de reunión', { error: emailError.message });
        }

        res.status(201).json({
            success: true,
            data: nuevaSolicitud,
            message: `Solicitud de reunión enviada exitosamente al ${rolFormateado}`,
            profesor_rol: rolFormateado
        });

    } catch (error) {
        
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
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/calendario-matching/reuniones/:id/marcar-realizada
 * Marcar una reunión como realizada
 */
router.post('/reuniones/:id/marcar-realizada', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const { acta_reunion, lugar, modalidad } = req.body;
        
        // Validar que el usuario sea profesor de la reunión
        const [reuniones] = await pool.execute(
            `SELECT * FROM reuniones_calendario 
             WHERE id = ? AND profesor_rut = ?`,
            [id, user.rut]
        );
        
        if (reuniones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reunión no encontrada o no tienes permisos'
            });
        }
        
        const reunion = reuniones[0];
        
        // Verificar que esté en estado programada
        if (reunion.estado !== 'programada') {
            return res.status(400).json({
                success: false,
                message: `No se puede marcar como realizada una reunión en estado: ${reunion.estado}`
            });
        }
        
        // Actualizar reunión
        const updateQuery = `
            UPDATE reuniones_calendario 
            SET estado = 'realizada',
                fecha_realizacion = NOW(),
                acta_reunion = ?,
                lugar = COALESCE(?, lugar),
                modalidad = COALESCE(?, modalidad)
            WHERE id = ?
        `;
        
        await pool.execute(updateQuery, [
            acta_reunion || 'Reunión marcada como realizada',
            lugar,
            modalidad,
            id
        ]);
        
        res.json({
            success: true,
            message: 'Reunión marcada como realizada exitosamente'
        });
        
    } catch (error) {
        
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/calendario-matching/reuniones/:id/confirmar
 * Confirmar una reunión programada
 */
router.post('/reuniones/:id/confirmar', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const { confirmado } = req.body;
        
        
        
        // Validar que el usuario sea parte de la reunión
        const [reuniones] = await pool.execute(
            `SELECT * FROM reuniones_calendario 
             WHERE id = ? AND (profesor_rut = ? OR estudiante_rut = ?)`,
            [id, user.rut, user.rut]
        );
        
        if (reuniones.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reunión no encontrada o no tienes permiso para confirmarla'
            });
        }
        
        const reunion = reuniones[0];

        // El estado de reuniones_calendario solo acepta 'programada', 'realizada', 'cancelada'.
        // Una reunión 'programada' ya es una reunión confirmada; no se cambia el estado.
        res.json({
            success: true,
            data: { id, estado: reunion.estado },
            message: confirmado
                ? 'Asistencia a la reunión confirmada exitosamente'
                : 'Confirmación registrada'
        });
        
    } catch (error) {
        
        res.status(500).json({
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
        
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/calendario-matching/historial-reuniones
 * Obtener historial completo de todas las reuniones
 */
router.get('/historial-reuniones', async (req, res) => {
    try {
        const { user } = req;
        
        const historial = await ReunionesModel.obtenerHistorialReuniones(user.rut);
        
        res.json({
            success: true,
            data: historial,
            message: `Historial de reuniones de ${user.nombre}`
        });
        
    } catch (error) {
        
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
        
        
        if (!user || !user.rut) {
            
            return res.status(401).json({
                success: false,
                data: [],
                message: 'Usuario no autenticado'
            });
        }
        
        // Obtener el proyecto del estudiante
        const [proyectos] = await pool.execute(
            'SELECT id, titulo FROM proyectos WHERE estudiante_rut = ? ORDER BY fecha_inicio DESC LIMIT 1',
            [user.rut]
        );
        
        
        if (proyectos.length === 0) {
            
            return res.json({
                success: true,
                data: [],
                message: 'No tienes proyectos registrados'
            });
        }
        
        const proyecto_id = proyectos[0].id;
        
        // Obtener solo profesores asignados a este proyecto
        const profesoresQuery = `
            SELECT DISTINCT
                u.rut,
                u.nombre,
                u.email,
                rp.nombre as rol_nombre
            FROM asignaciones_proyectos ap
            INNER JOIN usuarios u ON ap.profesor_rut = u.rut
            INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            WHERE ap.proyecto_id = ? AND ap.activo = TRUE
            ORDER BY rp.nombre, u.nombre
        `;
        
        const [profesores] = await pool.execute(profesoresQuery, [proyecto_id]);
        
        if (profesores.length > 0) {
            console.log(`📋 Profesores encontrados: ${profesores.map(p => `${p.nombre} - ${p.rol_nombre}`).join(', ')}`);
        }

        res.json({
            success: true,
            data: profesores || [],
            message: `Profesores asignados a tu proyecto (${profesores?.length || 0} encontrados)`
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            data: [], // Siempre devolver un array vacío
            message: error.message || 'Error interno del servidor'
        });
    }
});

// ===== ENDPOINTS DE BLOQUEOS DE HORARIOS =====

/**
 * POST /api/calendario-matching/bloqueos
 * Crear un bloqueo de horario
 */
router.post('/bloqueos', async (req, res) => {
    try {
        const { user } = req;
        const { fecha_inicio, fecha_fin, hora_inicio, hora_fin, motivo, tipo } = req.body;

        if (!fecha_inicio || !fecha_fin || !motivo || !tipo) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos: fecha_inicio, fecha_fin, motivo, tipo'
            });
        }

        const id = await CalendarioMatchingModel.crearBloqueo(user.rut, { fecha_inicio, fecha_fin, hora_inicio, hora_fin, motivo, tipo });

        res.status(201).json({
            success: true,
            data: { id },
            message: 'Bloqueo de horario creado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/calendario-matching/bloqueos
 * Obtener bloqueos activos del usuario autenticado
 */
router.get('/bloqueos', async (req, res) => {
    try {
        const { user } = req;

        const bloqueos = await CalendarioMatchingModel.obtenerBloqueosUsuario(user.rut);

        res.json({
            success: true,
            data: bloqueos,
            message: `Bloqueos de horario de ${user.nombre}`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * DELETE /api/calendario-matching/bloqueos/:id
 * Eliminar un bloqueo de horario
 */
router.delete('/bloqueos/:id', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;

        const eliminado = await CalendarioMatchingModel.eliminarBloqueo(id, user.rut);

        if (!eliminado) {
            return res.status(404).json({
                success: false,
                message: 'Bloqueo no encontrado o no tienes permisos para eliminarlo'
            });
        }

        res.json({
            success: true,
            message: 'Bloqueo de horario eliminado exitosamente'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;