import { pool } from '../db/connectionDB.js';

// ===== GESTIÓN DE DISPONIBILIDADES =====

/**
 * Crear o actualizar disponibilidad de un usuario
 * @param {Object} disponibilidadData - Datos de disponibilidad
 * @returns {Promise<number>} - ID de la disponibilidad creada
 */
export const crearDisponibilidad = async (disponibilidadData) => {
    const { usuario_rut, dia_semana, hora_inicio, hora_fin } = disponibilidadData;
    
    // Verificar si ya existe una disponibilidad para ese usuario en ese día y horario
    const verificarQuery = `
        SELECT id FROM disponibilidades 
        WHERE usuario_rut = ? AND dia_semana = ? 
        AND ((hora_inicio <= ? AND hora_fin > ?) OR (hora_inicio < ? AND hora_fin >= ?))
        AND activo = TRUE
    `;
    
    const [existing] = await pool.execute(verificarQuery, [
        usuario_rut, dia_semana, hora_inicio, hora_inicio, hora_fin, hora_fin
    ]);
    
    if (existing.length > 0) {
        throw new Error(`Ya existe una disponibilidad que se traslapa en ${dia_semana} de ${hora_inicio} a ${hora_fin}`);
    }
    
    const insertQuery = `
        INSERT INTO disponibilidades (usuario_rut, dia_semana, hora_inicio, hora_fin)
        VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(insertQuery, [usuario_rut, dia_semana, hora_inicio, hora_fin]);
    return result.insertId;
};

/**
 * Obtener disponibilidades de un usuario
 * @param {string} usuario_rut - RUT del usuario
 * @returns {Promise<Array>} - Lista de disponibilidades
 */
export const obtenerDisponibilidadesUsuario = async (usuario_rut) => {
    const query = `
        SELECT * FROM disponibilidades 
        WHERE usuario_rut = ? AND activo = TRUE
        ORDER BY 
            FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
            hora_inicio
    `;
    
    const [rows] = await pool.execute(query, [usuario_rut]);
    return rows;
};

/**
 * Encontrar coincidencias de disponibilidad entre profesor y estudiante
 * @param {string} profesor_rut - RUT del profesor
 * @param {string} estudiante_rut - RUT del estudiante
 * @returns {Promise<Array>} - Lista de coincidencias
 */
export const encontrarCoincidenciasDisponibilidad = async (profesor_rut, estudiante_rut) => {
    const query = `
        SELECT 
            dp.dia_semana,
            GREATEST(dp.hora_inicio, de.hora_inicio) as hora_inicio_coincidencia,
            LEAST(dp.hora_fin, de.hora_fin) as hora_fin_coincidencia,
            dp.hora_inicio as profesor_hora_inicio,
            dp.hora_fin as profesor_hora_fin,
            de.hora_inicio as estudiante_hora_inicio,
            de.hora_fin as estudiante_hora_fin
        FROM disponibilidades dp
        INNER JOIN disponibilidades de ON dp.dia_semana = de.dia_semana
        WHERE dp.usuario_rut = ? 
        AND de.usuario_rut = ?
        AND dp.activo = TRUE 
        AND de.activo = TRUE
        AND dp.hora_inicio < de.hora_fin 
        AND de.hora_inicio < dp.hora_fin
        ORDER BY 
            FIELD(dp.dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
            hora_inicio_coincidencia
    `;
    
    const [rows] = await pool.execute(query, [profesor_rut, estudiante_rut]);
    return rows;
};

// ===== SISTEMA DE MATCHING AUTOMÁTICO =====

/**
 * Buscar slots disponibles para una reunión entre profesor y estudiante
 * @param {string} profesor_rut - RUT del profesor
 * @param {string} estudiante_rut - RUT del estudiante
 * @param {number} duracion_minutos - Duración de la reunión en minutos
 * @param {number} dias_anticipacion - Días de anticipación máxima
 * @returns {Promise<Array>} - Lista de slots disponibles
 */
export const buscarSlotsDisponibles = async (profesor_rut, estudiante_rut, duracion_minutos = 60, dias_anticipacion = 14) => {
    // Obtener coincidencias de disponibilidad
    const coincidencias = await encontrarCoincidenciasDisponibilidad(profesor_rut, estudiante_rut);
    
    if (coincidencias.length === 0) {
        return [];
    }
    
    const slots = [];
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 1); // Empezar desde mañana
    
    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + dias_anticipacion);
    
    // Generar fechas para cada día de la semana con coincidencias
    for (let fecha = new Date(fechaInicio); fecha <= fechaFin; fecha.setDate(fecha.getDate() + 1)) {
        const diaSemana = obtenerDiaSemanaEspanol(fecha.getDay());
        
        // Buscar coincidencias para este día de la semana
        const coincidenciasDia = coincidencias.filter(c => c.dia_semana === diaSemana);
        
        for (const coincidencia of coincidenciasDia) {
            // Verificar si ya hay reuniones programadas en este horario
            const ocupado = await verificarHorarioOcupado(
                profesor_rut, 
                estudiante_rut, 
                fecha.toISOString().split('T')[0],
                coincidencia.hora_inicio_coincidencia,
                coincidencia.hora_fin_coincidencia
            );
            
            if (!ocupado) {
                // Generar slots de tiempo dentro de la coincidencia
                const slotsHorario = generarSlotsHorario(
                    coincidencia.hora_inicio_coincidencia,
                    coincidencia.hora_fin_coincidencia,
                    duracion_minutos
                );
                
                for (const slot of slotsHorario) {
                    slots.push({
                        fecha: fecha.toISOString().split('T')[0],
                        dia_semana: diaSemana,
                        hora_inicio: slot.hora_inicio,
                        hora_fin: slot.hora_fin,
                        duracion_minutos: duracion_minutos,
                        disponibilidad_profesor: {
                            inicio: coincidencia.profesor_hora_inicio,
                            fin: coincidencia.profesor_hora_fin
                        },
                        disponibilidad_estudiante: {
                            inicio: coincidencia.estudiante_hora_inicio,
                            fin: coincidencia.estudiante_hora_fin
                        }
                    });
                }
            }
        }
    }
    
    return slots.slice(0, 10); // Retornar máximo 10 opciones
};

/**
 * Crear solicitud de reunión automática
 * @param {Object} solicitudData - Datos de la solicitud
 * @returns {Promise<number>} - ID de la solicitud creada
 */
export const crearSolicitudReunion = async (solicitudData) => {
    const {
        proyecto_id,
        profesor_rut,
        estudiante_rut,
        fecha_propuesta,
        hora_propuesta,
        duracion_minutos = 60,
        tipo_reunion = 'seguimiento',
        descripcion = '',
        creado_por = 'sistema'
    } = solicitudData;
    
    // Verificar que no haya conflictos de horario
    const conflicto = await verificarConflictoHorario(
        profesor_rut,
        estudiante_rut,
        fecha_propuesta,
        hora_propuesta,
        duracion_minutos
    );
    
    if (conflicto) {
        throw new Error('Conflicto de horario detectado');
    }
    
    const query = `
        INSERT INTO solicitudes_reunion (
            proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta, 
            hora_propuesta, duracion_minutos, tipo_reunion, descripcion, creado_por
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
        proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta,
        hora_propuesta, duracion_minutos, tipo_reunion, descripcion, creado_por
    ]);
    
    return result.insertId;
};

/**
 * Proponer reunión automática usando matching
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} tipo_reunion - Tipo de reunión
 * @param {string} descripcion - Descripción opcional
 * @returns {Promise<Object>} - Resultado del matching
 */
export const proponerReunionAutomatica = async (proyecto_id, tipo_reunion = 'seguimiento', descripcion = '') => {
    // Obtener información del proyecto y asignaciones
    const proyectoQuery = `
        SELECT 
            p.id,
            p.titulo,
            p.estudiante_rut,
            ap.profesor_rut
        FROM proyectos p
        INNER JOIN asignaciones_profesores ap ON p.id = ap.proyecto_id
        WHERE p.id = ? AND ap.rol_profesor = 'profesor_guia' AND ap.activo = TRUE
    `;
    
    const [proyectoRows] = await pool.execute(proyectoQuery, [proyecto_id]);
    
    if (proyectoRows.length === 0) {
        throw new Error('Proyecto no encontrado o no tiene profesor guía asignado');
    }
    
    const proyecto = proyectoRows[0];
    
    // Buscar slots disponibles
    const slots = await buscarSlotsDisponibles(
        proyecto.profesor_rut,
        proyecto.estudiante_rut,
        60, // 1 hora por defecto
        14  // 2 semanas de anticipación
    );
    
    if (slots.length === 0) {
        return {
            success: false,
            message: 'No se encontraron horarios disponibles que coincidan entre profesor y estudiante',
            slots_disponibles: []
        };
    }
    
    // Tomar el primer slot disponible
    const mejorSlot = slots[0];
    
    // Crear solicitud de reunión
    const solicitudId = await crearSolicitudReunion({
        proyecto_id,
        profesor_rut: proyecto.profesor_rut,
        estudiante_rut: proyecto.estudiante_rut,
        fecha_propuesta: mejorSlot.fecha,
        hora_propuesta: mejorSlot.hora_inicio,
        duracion_minutos: mejorSlot.duracion_minutos,
        tipo_reunion,
        descripcion: descripcion || `Reunión de ${tipo_reunion} - ${proyecto.titulo}`,
        creado_por: 'sistema'
    });
    
    return {
        success: true,
        message: 'Solicitud de reunión creada exitosamente',
        solicitud_id: solicitudId,
        reunion_propuesta: {
            fecha: mejorSlot.fecha,
            hora_inicio: mejorSlot.hora_inicio,
            hora_fin: mejorSlot.hora_fin,
            duracion_minutos: mejorSlot.duracion_minutos
        },
        slots_alternativos: slots.slice(1, 5) // Hasta 4 opciones adicionales
    };
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Convertir número de día a nombre en español
 */
function obtenerDiaSemanaEspanol(diaSemana) {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return dias[diaSemana];
}

/**
 * Generar slots de tiempo dentro de un rango horario
 */
function generarSlotsHorario(hora_inicio, hora_fin, duracion_minutos) {
    const slots = [];
    const inicio = new Date(`2000-01-01 ${hora_inicio}`);
    const fin = new Date(`2000-01-01 ${hora_fin}`);
    
    for (let hora = new Date(inicio); hora < fin; hora.setMinutes(hora.getMinutes() + duracion_minutos)) {
        const siguienteHora = new Date(hora.getTime() + duracion_minutos * 60000);
        
        if (siguienteHora <= fin) {
            slots.push({
                hora_inicio: hora.toTimeString().slice(0, 5),
                hora_fin: siguienteHora.toTimeString().slice(0, 5)
            });
        }
    }
    
    return slots;
}

/**
 * Verificar si un horario está ocupado
 */
async function verificarHorarioOcupado(profesor_rut, estudiante_rut, fecha, hora_inicio, hora_fin) {
    const query = `
        SELECT COUNT(*) as ocupado
        FROM reuniones_calendario
        WHERE fecha = ? 
        AND (profesor_rut = ? OR estudiante_rut = ?)
        AND estado IN ('programada', 'en_curso')
        AND (
            (hora_inicio <= ? AND hora_fin > ?) OR
            (hora_inicio < ? AND hora_fin >= ?) OR
            (hora_inicio >= ? AND hora_fin <= ?)
        )
    `;
    
    const [rows] = await pool.execute(query, [
        fecha, profesor_rut, estudiante_rut,
        hora_inicio, hora_inicio,
        hora_fin, hora_fin,
        hora_inicio, hora_fin
    ]);
    
    return rows[0].ocupado > 0;
}

/**
 * Verificar conflictos de horario
 */
async function verificarConflictoHorario(profesor_rut, estudiante_rut, fecha, hora_inicio, duracion_minutos) {
    const hora_fin = new Date(`2000-01-01 ${hora_inicio}`);
    hora_fin.setMinutes(hora_fin.getMinutes() + duracion_minutos);
    const hora_fin_str = hora_fin.toTimeString().slice(0, 5);
    
    return await verificarHorarioOcupado(profesor_rut, estudiante_rut, fecha, hora_inicio, hora_fin_str);
}

/**
 * Eliminar disponibilidad
 */
export const eliminarDisponibilidad = async (disponibilidad_id, usuario_rut) => {
    const query = `
        UPDATE disponibilidades 
        SET activo = FALSE 
        WHERE id = ? AND usuario_rut = ?
    `;
    
    const [result] = await pool.execute(query, [disponibilidad_id, usuario_rut]);
    return result.affectedRows > 0;
};

/**
 * Obtener solicitudes de reunión por usuario
 */
export const obtenerSolicitudesUsuario = async (usuario_rut, rol = null) => {
    let query = `
        SELECT 
            sr.*,
            p.titulo as proyecto_titulo,
            ue.nombre as estudiante_nombre,
            up.nombre as profesor_nombre
        FROM solicitudes_reunion sr
        INNER JOIN proyectos p ON sr.proyecto_id = p.id
        INNER JOIN usuarios ue ON sr.estudiante_rut = ue.rut
        INNER JOIN usuarios up ON sr.profesor_rut = up.rut
        WHERE (sr.profesor_rut = ? OR sr.estudiante_rut = ?)
        AND sr.estado NOT IN ('cancelada')
        ORDER BY sr.fecha_propuesta ASC, sr.hora_propuesta ASC
    `;
    
    const [rows] = await pool.execute(query, [usuario_rut, usuario_rut]);
    return rows;
};