import * as CalendarioMatchingModel from '../models/calendario-matching.model.js';
import * as ReunionesModel from '../models/reuniones.model.js';
import * as AsignacionesProfesoresModel from '../models/asignaciones-profesores.model.js';

// ===== SERVICIOS DE CALENDARIO CON MATCHING =====

/**
 * Verificar si profesor y estudiante están relacionados por un proyecto
 * @param {string} profesor_rut - RUT del profesor
 * @param {string} estudiante_rut - RUT del estudiante
 * @returns {Promise<Object>} - Información de la relación
 */
export const verificarRelacionProfesorEstudiante = async (profesor_rut, estudiante_rut) => {
    try {
        // Buscar proyectos donde el estudiante esté asignado y el profesor tenga algún rol
        const query = `
            SELECT 
                p.id as proyecto_id,
                p.titulo,
                rp.nombre as rol_profesor,
                rp.nombre as nombre_rol
            FROM proyectos p
            INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
            INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            WHERE p.estudiante_rut = ? 
            AND ap.profesor_rut = ? 
            AND ap.activo = TRUE
            ORDER BY 
                CASE rp.nombre
                    WHEN 'profesor_guia' THEN 1
                    WHEN 'profesor_co_guia' THEN 2
                    WHEN 'profesor_informante' THEN 3
                    WHEN 'profesor_sala' THEN 4
                    WHEN 'profesor_corrector' THEN 5
                    ELSE 6
                END
        `;
        
        const [rows] = await pool.execute(query, [estudiante_rut, profesor_rut]);
        
        if (rows.length === 0) {
            return {
                relacionados: false,
                mensaje: 'No existe relación entre el profesor y estudiante en ningún proyecto'
            };
        }
        
        return {
            relacionados: true,
            proyectos: rows,
            principal: rows[0], // El rol con mayor prioridad
            puede_agendar_reunion: true,
            mensaje: `Relación encontrada: ${rows[0].nombre_rol} en proyecto "${rows[0].titulo}"`
        };
        
    } catch (error) {
        throw new Error(`Error verificando relación: ${error.message}`);
    }
};

/**
 * Crear disponibilidad con validaciones
 * @param {Object} disponibilidadData - Datos de disponibilidad
 * @param {string} usuario_rut - RUT del usuario
 * @returns {Promise<Object>} - Resultado de la creación
 */
export const crearDisponibilidadValidada = async (disponibilidadData, usuario_rut) => {
    try {
        // Validar formato de datos
        const { dia_semana, hora_inicio, hora_fin } = disponibilidadData;
        
        if (!['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].includes(dia_semana)) {
            throw new Error('Día de la semana inválido');
        }
        
        // Validar que hora_inicio sea menor que hora_fin
        const inicio = new Date(`2000-01-01 ${hora_inicio}`);
        const fin = new Date(`2000-01-01 ${hora_fin}`);
        
        if (inicio >= fin) {
            throw new Error('La hora de inicio debe ser menor que la hora de fin');
        }
        
        // Validar horario laboral básico (8:00 - 20:00)
        const horaInicioNum = inicio.getHours() + inicio.getMinutes() / 60;
        const horaFinNum = fin.getHours() + fin.getMinutes() / 60;
        
        if (horaInicioNum < 8 || horaFinNum > 20) {
            throw new Error('Los horarios deben estar entre las 8:00 y 20:00');
        }
        
        const disponibilidadId = await CalendarioMatchingModel.crearDisponibilidad({
            usuario_rut,
            dia_semana,
            hora_inicio,
            hora_fin
        });
        
        return {
            success: true,
            disponibilidad_id: disponibilidadId,
            message: `Disponibilidad creada para ${dia_semana} de ${hora_inicio} a ${hora_fin}`
        };
        
    } catch (error) {
        throw new Error(`Error creando disponibilidad: ${error.message}`);
    }
};

/**
 * Buscar y proponer reunión automática
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} usuario_solicitante - RUT del usuario que solicita
 * @param {Object} preferencias - Preferencias de reunión
 * @returns {Promise<Object>} - Opciones de horarios disponibles
 */
export const buscarYProponerReunion = async (proyecto_id, usuario_solicitante, preferencias = {}) => {
    try {
        // Configurar preferencias por defecto
        const {
            tipo_reunion = 'seguimiento',
            duracion_minutos = 60,
            dias_anticipacion = 14,
            descripcion,
            profesor_rut
        } = preferencias;

        // Validar que se proporcionó el profesor_rut
        if (!profesor_rut) {
            throw new Error('profesor_rut es requerido');
        }

        // Obtener información del proyecto
        const proyectoQuery = `
            SELECT 
                p.id,
                p.titulo,
                p.estudiante_rut
            FROM proyectos p
            WHERE p.id = ?
        `;
        
        const [proyectoRows] = await pool.execute(proyectoQuery, [proyecto_id]);
        
        if (proyectoRows.length === 0) {
            throw new Error('Proyecto no encontrado');
        }
        
        const proyecto = proyectoRows[0];
        
        // Verificar que el usuario solicitante es el estudiante del proyecto
        if (usuario_solicitante !== proyecto.estudiante_rut) {
            throw new Error('No tienes permisos para solicitar reuniones en este proyecto');
        }

        // Verificar que el profesor está asignado al proyecto
        const validacionProfesorQuery = `
            SELECT ap.id, rp.nombre as rol_profesor
            FROM asignaciones_proyectos ap
            INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            WHERE ap.proyecto_id = ? AND ap.profesor_rut = ? AND ap.activo = TRUE
        `;
        const [asignaciones] = await pool.execute(validacionProfesorQuery, [proyecto_id, profesor_rut]);
        
        if (asignaciones.length === 0) {
            throw new Error('El profesor seleccionado no está asignado a tu proyecto');
        }
        
        // Buscar slots disponibles
        const slots = await CalendarioMatchingModel.buscarSlotsDisponibles(
            profesor_rut,
            proyecto.estudiante_rut,
            duracion_minutos,
            dias_anticipacion
        );
        
        if (slots.length === 0) {
            return {
                success: false,
                message: 'No se encontraron horarios disponibles que coincidan entre profesor y estudiante',
                opciones: [],
                proyecto_info: {
                    id: proyecto.id,
                    titulo: proyecto.titulo,
                    profesor_rut: profesor_rut,
                    estudiante_rut: proyecto.estudiante_rut
                }
            };
        }
        
        // Calcular probabilidad de éxito para cada slot (simulación simple)
        const opcionesConProbabilidad = slots.map((slot, index) => ({
            ...slot,
            probabilidad_exito: Math.max(95 - (index * 5), 70), // Disminuye según posición
            urgencia_sugerida: index < 3 ? 'alta' : 'media'
        }));
        
        return {
            success: true,
            message: `Se encontraron ${slots.length} horarios disponibles`,
            opciones: opcionesConProbabilidad,
            proyecto_info: {
                id: proyecto.id,
                titulo: proyecto.titulo,
                profesor_rut: profesor_rut,
                estudiante_rut: proyecto.estudiante_rut
            },
            solicitante: usuario_solicitante
        };
        
    } catch (error) {
        throw new Error(`Error en búsqueda de reunión: ${error.message}`);
    }
};

/**
 * Gestionar respuesta a solicitud con validaciones
 * @param {number} solicitud_id - ID de la solicitud
 * @param {string} usuario_rut - RUT del usuario que responde
 * @param {string} respuesta - 'aceptar' o 'rechazar'
 * @param {string} comentarios - Comentarios opcionales
 * @returns {Promise<Object>} - Resultado de la respuesta
 */
export const gestionarRespuestaSolicitud = async (solicitud_id, usuario_rut, respuesta, comentarios = '') => {
    try {
        if (!['aceptar', 'rechazar'].includes(respuesta)) {
            throw new Error('Respuesta debe ser "aceptar" o "rechazar"');
        }
        
        const resultado = await ReunionesModel.responderSolicitudReunion(
            solicitud_id,
            usuario_rut,
            respuesta,
            comentarios
        );
        
        // Si se confirmó la reunión, enviar notificación (aquí podrías agregar lógica de notificaciones)
        if (resultado.reunion_confirmada) {
            await notificarReunionConfirmada(resultado.reunion_id);
        }
        
        return resultado;
        
    } catch (error) {
        throw new Error(`Error gestionando respuesta: ${error.message}`);
    }
};

/**
 * Obtener dashboard de reuniones para un usuario
 * @param {string} usuario_rut - RUT del usuario
 * @param {number} role_id - ID del rol del usuario
 * @returns {Promise<Object>} - Dashboard completo
 */
export const obtenerDashboardReuniones = async (usuario_rut, role_id) => {
    try {
        // Obtener SOLO solicitudes pendientes (sin confirmar ni rechazar)
        const solicitudesPendientes = await CalendarioMatchingModel.obtenerSolicitudesUsuario(usuario_rut);
        
        // Filtrar solo las que están realmente pendientes
        const solicitudesSinResponder = solicitudesPendientes.filter(s => s.estado === 'pendiente');
        
        // Obtener TODAS las reuniones del usuario (historial completo)
        const todasReuniones = await ReunionesModel.obtenerReunionesUsuario(usuario_rut);
        
        // Separar reuniones por estado
        const ahora = new Date();
        
        const reunionesProgramadas = todasReuniones.filter(r => 
            r.estado === 'programada' && new Date(r.fecha) >= ahora
        );
        
        const reunionesRealizadas = todasReuniones.filter(r => r.estado === 'realizada');
        const reunionesCanceladas = todasReuniones.filter(r => r.estado === 'cancelada');
        
        // Reuniones próximas (próximos 7 días)
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + 7);
        
        const reunionesProximas = reunionesProgramadas.filter(r => 
            new Date(r.fecha) <= fechaLimite
        );
        
        // Obtener disponibilidades
        const disponibilidades = await CalendarioMatchingModel.obtenerDisponibilidadesUsuario(usuario_rut);
        
        // Obtener estadísticas
        const estadisticas = await ReunionesModel.obtenerEstadisticasReuniones(usuario_rut);
        
        // Calcular alertas
        const alertas = [];
        
        if (solicitudesSinResponder.length > 0) {
            alertas.push({
                tipo: 'solicitudes_pendientes',
                cantidad: solicitudesSinResponder.length,
                mensaje: `Tienes ${solicitudesSinResponder.length} solicitud(es) de reunión pendiente(s)`
            });
        }
        
        if (disponibilidades.length === 0 && role_id === 2) {
            alertas.push({
                tipo: 'sin_disponibilidad',
                mensaje: 'No has configurado tu disponibilidad horaria'
            });
        }
        
        return {
            usuario: {
                rut: usuario_rut,
                role_id: role_id,
                es_profesor: role_id === 2,
                es_estudiante: role_id === 1
            },
            solicitudes: {
                pendientes: solicitudesSinResponder,
                total: solicitudesSinResponder.length
            },
            reuniones: {
                proximas: reunionesProximas,
                programadas: reunionesProgramadas,
                realizadas: reunionesRealizadas,
                canceladas: reunionesCanceladas,
                historial_completo: todasReuniones
            },
            disponibilidades: disponibilidades,
            estadisticas: estadisticas,
            alertas: alertas,
            resumen: {
                solicitudes_pendientes: solicitudesSinResponder.length,
                reuniones_proximas: reunionesProximas.length,
                reuniones_programadas: reunionesProgramadas.length,
                reuniones_realizadas: reunionesRealizadas.length,
                reuniones_canceladas: reunionesCanceladas.length,
                total_reuniones: todasReuniones.length
            }
        };
        
    } catch (error) {
        throw new Error(`Error obteniendo dashboard: ${error.message}`);
    }
};

/**
 * Validar y reprogramar reunión
 * @param {number} reunion_id - ID de la reunión
 * @param {string} nueva_fecha - Nueva fecha
 * @param {string} nueva_hora - Nueva hora
 * @param {string} usuario_rut - RUT del usuario que reprograma
 * @returns {Promise<Object>} - Resultado de la reprogramación
 */
export const reprogramarReunionValidada = async (reunion_id, nueva_fecha, nueva_hora, usuario_rut) => {
    try {
        // Validar fecha futura
        const fechaActual = new Date();
        const fechaNueva = new Date(nueva_fecha);
        
        if (fechaNueva <= fechaActual) {
            throw new Error('La nueva fecha debe ser futura');
        }
        
        // Validar horario laboral
        const hora = new Date(`2000-01-01 ${nueva_hora}`);
        const horaNum = hora.getHours() + hora.getMinutes() / 60;
        
        if (horaNum < 8 || horaNum > 20) {
            throw new Error('La hora debe estar entre las 8:00 y 20:00');
        }
        
        const nuevaSolicitudId = await ReunionesModel.reprogramarReunion(
            reunion_id,
            nueva_fecha,
            nueva_hora,
            usuario_rut
        );
        
        return {
            success: true,
            nueva_solicitud_id: nuevaSolicitudId,
            message: 'Reunión reprogramada. Se ha creado una nueva solicitud que requiere confirmación.',
            nueva_fecha: nueva_fecha,
            nueva_hora: nueva_hora
        };
        
    } catch (error) {
        throw new Error(`Error reprogramando reunión: ${error.message}`);
    }
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Notificar reunión confirmada (placeholder para sistema de notificaciones)
 */
async function notificarReunionConfirmada(reunion_id) {
    // Aquí podrías implementar:
    // - Envío de emails
    // - Notificaciones push
    // - Integración con calendarios externos (Google Calendar, Outlook)
    // - Webhooks
    
    console.log(`📅 Reunión confirmada ID: ${reunion_id} - Notificación enviada`);
}

/**
 * Importar pool desde el modelo de calendario
 */
import { pool } from '../db/connectionDB.js';
