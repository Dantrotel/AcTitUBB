import express from 'express';
import * as SistemaReservasModel from '../models/sistema-reservas.model.js';
import { verifySession } from '../middlewares/verifySession.js';
import { pool } from '../db/connectionDB.js';

const router = express.Router();

// ===== MIDDLEWARE DE VERIFICACIÓN =====
router.use(verifySession);

// =====================================================
// ENDPOINTS PARA PROFESORES
// =====================================================

/**
 * POST /api/sistema-reservas/disponibilidades
 * Profesor crea un horario disponible (recurrente o específico)
 */
router.post('/disponibilidades', async (req, res) => {
    try {
        const { user } = req;
        
        if (user.role_id !== 2) { // Solo profesores
            return res.status(403).json({
                success: false,
                message: 'Solo los profesores pueden publicar disponibilidades'
            });
        }
        
        const { dia_semana, hora_inicio, hora_fin, fecha_especifica } = req.body;
        
        // Validaciones
        if (!dia_semana || !hora_inicio || !hora_fin) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos: dia_semana, hora_inicio, hora_fin'
            });
        }
        
        if (hora_inicio >= hora_fin) {
            return res.status(400).json({
                success: false,
                message: 'La hora de inicio debe ser menor que la hora de fin'
            });
        }
        
        const disponibilidad_id = await SistemaReservasModel.crearDisponibilidad({
            usuario_rut: user.rut,
            dia_semana,
            hora_inicio,
            hora_fin,
            fecha_especifica: fecha_especifica || null
        });
        
        res.status(201).json({
            success: true,
            data: { disponibilidad_id },
            message: fecha_especifica 
                ? `Horario específico creado para ${fecha_especifica}` 
                : `Horario recurrente creado para todos los ${dia_semana}s`
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
 * GET /api/sistema-reservas/mis-disponibilidades
 * Profesor ve TODAS sus disponibilidades (incluyendo reservadas)
 */
router.get('/mis-disponibilidades', async (req, res) => {
    try {
        const { user } = req;
        
        if (user.role_id !== 2) {
            return res.status(403).json({
                success: false,
                message: 'Solo los profesores pueden ver sus disponibilidades'
            });
        }
        
        const disponibilidades = await SistemaReservasModel.obtenerTodasDisponibilidadesProfesor(user.rut);
        
        res.json({
            success: true,
            data: disponibilidades,
            resumen: {
                total: disponibilidades.length,
                activas: disponibilidades.filter(d => d.activo).length,
                reservadas: disponibilidades.filter(d => d.reservado).length,
                disponibles: disponibilidades.filter(d => d.activo && !d.reservado).length
            }
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
 * PUT /api/sistema-reservas/disponibilidades/:id
 * Profesor actualiza una disponibilidad (solo si NO está reservada)
 */
router.put('/disponibilidades/:id', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        
        if (user.role_id !== 2) {
            return res.status(403).json({
                success: false,
                message: 'Solo los profesores pueden actualizar disponibilidades'
            });
        }
        
        const actualizado = await SistemaReservasModel.actualizarDisponibilidad(
            id,
            user.rut,
            req.body
        );
        
        if (!actualizado) {
            return res.status(404).json({
                success: false,
                message: 'Disponibilidad no encontrada o está reservada'
            });
        }
        
        res.json({
            success: true,
            message: 'Disponibilidad actualizada exitosamente'
        });
        
    } catch (error) {
        console.error('Error actualizando disponibilidad:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * DELETE /api/sistema-reservas/disponibilidades/:id
 * Profesor elimina una disponibilidad (solo si NO está reservada)
 */
router.delete('/disponibilidades/:id', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        
        if (user.role_id !== 2) {
            return res.status(403).json({
                success: false,
                message: 'Solo los profesores pueden eliminar disponibilidades'
            });
        }
        
        await SistemaReservasModel.eliminarDisponibilidad(id, user.rut);
        
        res.json({
            success: true,
            message: 'Disponibilidad eliminada exitosamente'
        });
        
    } catch (error) {
        console.error('Error eliminando disponibilidad:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/sistema-reservas/solicitudes-pendientes
 * Profesor ve las reservas pendientes que debe aceptar/rechazar
 */
router.get('/solicitudes-pendientes', async (req, res) => {
    try {
        const { user } = req;
        
        if (user.role_id !== 2) {
            return res.status(403).json({
                success: false,
                message: 'Solo los profesores pueden ver solicitudes pendientes'
            });
        }
        
        const solicitudes = await SistemaReservasModel.obtenerSolicitudesPendientesProfesor(user.rut);
        
        res.json({
            success: true,
            data: solicitudes,
            total: solicitudes.length
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
 * POST /api/sistema-reservas/responder-reserva/:id
 * Profesor acepta o rechaza una reserva
 */
router.post('/responder-reserva/:id', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const { respuesta, comentarios } = req.body;
        
        if (user.role_id !== 2) {
            return res.status(403).json({
                success: false,
                message: 'Solo los profesores pueden responder reservas'
            });
        }
        
        if (!respuesta || !['aceptar', 'rechazar'].includes(respuesta)) {
            return res.status(400).json({
                success: false,
                message: 'Respuesta debe ser "aceptar" o "rechazar"'
            });
        }
        
        const resultado = await SistemaReservasModel.responderReserva(
            id,
            user.rut,
            respuesta,
            comentarios || ''
        );
        
        res.json(resultado);
        
    } catch (error) {
        console.error('Error respondiendo reserva:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// =====================================================
// ENDPOINTS PARA ESTUDIANTES
// =====================================================

/**
 * GET /api/sistema-reservas/horarios-disponibles/:profesor_rut
 * Estudiante ve los horarios disponibles de un profesor específico
 */
router.get('/horarios-disponibles/:profesor_rut', async (req, res) => {
    try {
        const { user } = req;
        const { profesor_rut } = req.params;
        const { dias_adelante } = req.query;
        
        if (user.role_id !== 1) { // Solo estudiantes
            return res.status(403).json({
                success: false,
                message: 'Solo los estudiantes pueden ver horarios disponibles'
            });
        }
        
        // Verificar que el profesor esté asignado al proyecto del estudiante
        const [proyectos] = await pool.execute(
            `SELECT p.id, p.titulo, ap.rol_profesor_id, rp.nombre as rol_nombre
             FROM proyectos p
             INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
             INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
             WHERE p.estudiante_rut = ? 
             AND ap.profesor_rut = ? 
             AND ap.activo = TRUE
             LIMIT 1`,
            [user.rut, profesor_rut]
        );
        
        if (proyectos.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'No tienes un proyecto con este profesor'
            });
        }
        
        const proyecto = proyectos[0];
        
        // Obtener horarios disponibles
        const horarios = await SistemaReservasModel.obtenerHorariosDisponiblesProfesor(
            profesor_rut,
            parseInt(dias_adelante) || 14
        );
        
        res.json({
            success: true,
            data: horarios,
            proyecto: {
                id: proyecto.id,
                titulo: proyecto.titulo,
                rol_profesor: proyecto.rol_nombre
            },
            total: horarios.length
        });
        
    } catch (error) {
        console.error('Error obteniendo horarios disponibles:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/sistema-reservas/reservar
 * Estudiante reserva un horario disponible
 */
router.post('/reservar', async (req, res) => {
    try {
        const { user } = req;
        const { 
            disponibilidad_id, 
            proyecto_id, 
            fecha_propuesta, 
            hora_inicio_bloque, 
            hora_fin_bloque, 
            tipo_reunion, 
            descripcion 
        } = req.body;
        
        if (user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Solo los estudiantes pueden reservar horarios'
            });
        }
        
        // Validaciones
        if (!disponibilidad_id || !proyecto_id || !fecha_propuesta || !hora_inicio_bloque || !hora_fin_bloque) {
            return res.status(400).json({
                success: false,
                message: 'Campos requeridos: disponibilidad_id, proyecto_id, fecha_propuesta, hora_inicio_bloque, hora_fin_bloque'
            });
        }
        
        // Verificar que el estudiante pertenece al proyecto
        const [proyectos] = await pool.execute(
            `SELECT id FROM proyectos WHERE id = ? AND estudiante_rut = ?`,
            [proyecto_id, user.rut]
        );
        
        if (proyectos.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos sobre este proyecto'
            });
        }
        
        const resultado = await SistemaReservasModel.reservarHorario({
            disponibilidad_id,
            proyecto_id,
            estudiante_rut: user.rut,
            fecha_propuesta,
            hora_inicio_bloque,
            hora_fin_bloque,
            tipo_reunion: tipo_reunion || 'seguimiento',
            descripcion: descripcion || ''
        });
        
        res.status(201).json(resultado);
        
    } catch (error) {
        console.error('Error reservando horario:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/sistema-reservas/mis-solicitudes
 * Estudiante ve sus solicitudes (pendientes, aceptadas, rechazadas)
 */
router.get('/mis-solicitudes', async (req, res) => {
    try {
        const { user } = req;
        
        if (user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Solo los estudiantes pueden ver sus solicitudes'
            });
        }
        
        const solicitudes = await SistemaReservasModel.obtenerSolicitudesEstudiante(user.rut);
        
        res.json({
            success: true,
            data: solicitudes,
            resumen: {
                total: solicitudes.length,
                pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
                aceptadas: solicitudes.filter(s => s.estado === 'aceptada').length,
                rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length
            }
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
 * DELETE /api/sistema-reservas/cancelar-reserva/:id
 * Estudiante cancela una reserva pendiente (libera el horario)
 */
router.delete('/cancelar-reserva/:id', async (req, res) => {
    try {
        const { user } = req;
        const { id } = req.params;
        
        if (user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Solo los estudiantes pueden cancelar reservas'
            });
        }
        
        // Verificar que la solicitud es del estudiante y está pendiente
        const [solicitudes] = await pool.execute(
            `SELECT * FROM solicitudes_reunion 
             WHERE id = ? AND estudiante_rut = ? AND estado = 'pendiente'`,
            [id, user.rut]
        );
        
        if (solicitudes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada o ya fue respondida'
            });
        }
        
        // Actualizar estado a cancelada (el trigger liberará el horario)
        await pool.execute(
            `UPDATE solicitudes_reunion SET estado = 'rechazada' WHERE id = ?`,
            [id]
        );
        
        // Liberar horario manualmente (por si el trigger no existe aún)
        await SistemaReservasModel.liberarHorarioReservado(id);
        
        res.json({
            success: true,
            message: 'Reserva cancelada. El horario vuelve a estar disponible.'
        });
        
    } catch (error) {
        console.error('Error cancelando reserva:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// =====================================================
// ENDPOINTS COMPARTIDOS
// =====================================================

/**
 * GET /api/sistema-reservas/profesores-asignados
 * Obtener profesores asignados al proyecto del estudiante
 */
router.get('/profesores-asignados', async (req, res) => {
    try {
        const { user } = req;
        
        if (user.role_id !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Solo los estudiantes pueden ver profesores asignados'
            });
        }
        
        const [profesores] = await pool.execute(
            `SELECT DISTINCT
                u.rut,
                u.nombre,
                u.email,
                rp.nombre as rol_nombre,
                p.id as proyecto_id,
                p.titulo as proyecto_titulo
             FROM proyectos p
             INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
             INNER JOIN usuarios u ON ap.profesor_rut = u.rut
             INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
             WHERE p.estudiante_rut = ? AND ap.activo = TRUE
             ORDER BY 
                CASE rp.nombre
                    WHEN 'profesor_guia' THEN 1
                    WHEN 'profesor_co_guia' THEN 2
                    WHEN 'profesor_informante' THEN 3
                    ELSE 4
                END`,
            [user.rut]
        );
        
        res.json({
            success: true,
            data: profesores
        });
        
    } catch (error) {
        console.error('Error obteniendo profesores:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * GET /api/sistema-reservas/dashboard
 * Dashboard para ambos roles (profesor y estudiante)
 */
router.get('/dashboard', async (req, res) => {
    try {
        const { user } = req;
        
        if (user.role_id === 2) {
            // Dashboard del PROFESOR
            const disponibilidades = await SistemaReservasModel.obtenerTodasDisponibilidadesProfesor(user.rut);
            const solicitudesPendientes = await SistemaReservasModel.obtenerSolicitudesPendientesProfesor(user.rut);
            
            res.json({
                success: true,
                rol: 'profesor',
                data: {
                    disponibilidades: {
                        total: disponibilidades.length,
                        activas: disponibilidades.filter(d => d.activo).length,
                        reservadas: disponibilidades.filter(d => d.reservado).length,
                        disponibles: disponibilidades.filter(d => d.activo && !d.reservado).length,
                        lista: disponibilidades
                    },
                    solicitudes_pendientes: {
                        total: solicitudesPendientes.length,
                        lista: solicitudesPendientes
                    }
                }
            });
            
        } else if (user.role_id === 1) {
            // Dashboard del ESTUDIANTE
            const solicitudes = await SistemaReservasModel.obtenerSolicitudesEstudiante(user.rut);
            const [profesores] = await pool.execute(
                `SELECT DISTINCT u.rut, u.nombre, rp.nombre as rol_nombre
                 FROM proyectos p
                 INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
                 INNER JOIN usuarios u ON ap.profesor_rut = u.rut
                 INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
                 WHERE p.estudiante_rut = ? AND ap.activo = TRUE`,
                [user.rut]
            );
            
            res.json({
                success: true,
                rol: 'estudiante',
                data: {
                    solicitudes: {
                        total: solicitudes.length,
                        pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
                        aceptadas: solicitudes.filter(s => s.estado === 'aceptada').length,
                        rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length,
                        lista: solicitudes
                    },
                    profesores_disponibles: profesores
                }
            });
            
        } else {
            res.status(403).json({
                success: false,
                message: 'Rol no soportado para dashboard'
            });
        }
        
    } catch (error) {
        console.error('Error obteniendo dashboard:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
