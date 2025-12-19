import { pool } from '../db/connectionDB.js';

// ===== NUEVO SISTEMA DE RESERVAS DE HORARIOS =====
// Flujo simplificado:
// 1. Profesor publica disponibilidad_horarios
// 2. Estudiante ve horarios disponibles y reserva uno
// 3. Horario queda reservado (bloqueado para otros)
// 4. Profesor acepta/rechaza la reserva
// 5. Si acepta: se crea reunión y horario queda ocupado
// 6. Si rechaza: horario vuelve a estar disponible

// ===== GESTIÓN DE DISPONIBILIDADES DEL PROFESOR =====

/**
 * Crear disponibilidad recurrente (semanal) o específica (fecha única)
 * @param {Object} disponibilidadData - Datos de disponibilidad
 * @returns {Promise<number>} - ID de la disponibilidad creada
 */
export const crearDisponibilidad = async (disponibilidadData) => {
    const { 
        usuario_rut, 
        dia_semana, 
        hora_inicio, 
        hora_fin
    } = disponibilidadData;
    
    // Validar que no se traslape con disponibilidad_horarios existentes
    const verificarQuery = `
        SELECT id FROM disponibilidad_horarios 
        WHERE usuario_rut = ? 
        AND dia_semana = ? 
        AND ((hora_inicio <= ? AND hora_fin > ?) OR (hora_inicio < ? AND hora_fin >= ?))
        AND activo = TRUE
    `;
    
    const [existing] = await pool.execute(verificarQuery, [
        usuario_rut, dia_semana, hora_inicio, hora_inicio, hora_fin, hora_fin
    ]);
    
    if (existing.length > 0) {
        throw new Error(`Ya existe una disponibilidad que se traslapa en este horario`);
    }
    
    const insertQuery = `
        INSERT INTO disponibilidad_horarios (
            usuario_rut, dia_semana, hora_inicio, hora_fin, activo
        )
        VALUES (?, ?, ?, ?, TRUE)
    `;
    
    const [result] = await pool.execute(insertQuery, [
        usuario_rut, dia_semana, hora_inicio, hora_fin
    ]);
    
    return result.insertId;
};

/**
 * Obtener disponibilidad_horarios de un profesor (SOLO NO RESERVADAS)
 * Para que el estudiante vea qué horarios puede reservar
 * @param {string} profesor_rut - RUT del profesor
 * @param {number} dias_adelante - Días hacia adelante a mostrar (default 14)
 * @returns {Promise<Array>} - Lista de disponibilidad_horarios disponibles
 */
export const obtenerHorariosDisponiblesProfesor = async (profesor_rut, dias_adelante = 14) => {
    // Empezar desde MAÑANA (no desde hoy)
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() + 1);
    fechaInicio.setHours(0, 0, 0, 0); // Resetear a medianoche
    
    const fechaLimite = new Date(fechaInicio);
    fechaLimite.setDate(fechaLimite.getDate() + dias_adelante);
    
    // Obtener disponibilidad_horarios del profesor (solo horarios recurrentes por día de la semana)
    const query = `
        SELECT 
            id,
            usuario_rut,
            dia_semana,
            hora_inicio,
            hora_fin,
            'recurrente' as tipo
        FROM disponibilidad_horarios
        WHERE usuario_rut = ?
        AND activo = TRUE
        ORDER BY 
            FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
            hora_inicio
    `;
    
    const [recurrentes] = await pool.execute(query, [profesor_rut]);
    
    // No hay horarios específicos, solo recurrentes
    const especificas = [];
    
    // Expandir horarios recurrentes a fechas concretas
    const horariosExpandidos = [];
    
    // Mapeo de días de la semana: nombre -> número JavaScript (0=domingo, 1=lunes, ...)
    const diasMap = {
        'domingo': 0,
        'lunes': 1,
        'martes': 2,
        'miercoles': 3,
        'jueves': 4,
        'viernes': 5,
        'sabado': 6
    };
    
    for (const recurrente of recurrentes) {
        const diaObjetivo = diasMap[recurrente.dia_semana];
        
        // Encontrar la primera ocurrencia de este día desde fechaInicio
        const fechaIteracion = new Date(fechaInicio);
        
        // Avanzar hasta encontrar el día correcto
        while (fechaIteracion.getDay() !== diaObjetivo) {
            fechaIteracion.setDate(fechaIteracion.getDate() + 1);
        }
        
        // Ahora generar todas las ocurrencias de este día hasta fechaLimite
        while (fechaIteracion <= fechaLimite) {
            const fechaStr = fechaIteracion.toISOString().split('T')[0];
            
            // Dividir el horario grande en bloques de 30 minutos
            const bloques = dividirEnBloquesDe30Min(recurrente.hora_inicio, recurrente.hora_fin);
            
            // Para cada bloque, verificar si está ocupado
            for (const bloque of bloques) {
                const ocupado = await verificarHorarioOcupadoEseDia(
                    profesor_rut,
                    fechaStr,
                    bloque.hora_inicio,
                    bloque.hora_fin
                );
                
                if (!ocupado) {
                    horariosExpandidos.push({
                        ...recurrente,
                        hora_inicio: bloque.hora_inicio,
                        hora_fin: bloque.hora_fin,
                        fecha_propuesta: fechaStr,
                        es_recurrente: true
                    });
                }
            }
            
            // Avanzar 7 días (siguiente semana, mismo día)
            fechaIteracion.setDate(fechaIteracion.getDate() + 7);
        }
    }
    
    // Agregar horarios específicos (también divididos en bloques de 30 min)
    especificas.forEach(esp => {
        const bloques = dividirEnBloquesDe30Min(esp.hora_inicio, esp.hora_fin);
        bloques.forEach(bloque => {
            horariosExpandidos.push({
                ...esp,
                hora_inicio: bloque.hora_inicio,
                hora_fin: bloque.hora_fin,
                fecha_propuesta: esp.fecha_especifica,
                es_recurrente: false
            });
        });
    });
    
    // Ordenar por fecha y hora
    horariosExpandidos.sort((a, b) => {
        const fechaA = new Date(`${a.fecha_propuesta} ${a.hora_inicio}`);
        const fechaB = new Date(`${b.fecha_propuesta} ${b.hora_inicio}`);
        return fechaA - fechaB;
    });
    
    return horariosExpandidos;
};

/**
 * Obtener TODAS las disponibilidad_horarios de un profesor
 * Para que el profesor vea su calendario completo
 * @param {string} profesor_rut - RUT del profesor
 * @returns {Promise<Array>} - Lista de todas las disponibilidad_horarios
 */
export const obtenerTodasDisponibilidadesProfesor = async (profesor_rut) => {
    const query = `
        SELECT 
            d.id,
            d.usuario_rut,
            d.dia_semana,
            d.hora_inicio,
            d.hora_fin,
            d.activo,
            d.created_at,
            d.updated_at
        FROM disponibilidad_horarios d
        WHERE d.usuario_rut = ?
        ORDER BY 
            FIELD(d.dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'),
            d.hora_inicio
    `;
    
    const [rows] = await pool.execute(query, [profesor_rut]);
    return rows;
};

// ===== GESTIÓN DE RESERVAS (ESTUDIANTE) =====

/**
 * Reservar un horario disponible
 * @param {Object} reservaData - Datos de la reserva
 * @returns {Promise<Object>} - Resultado con solicitud_id
 */
export const reservarHorario = async (reservaData) => {
    const {
        disponibilidad_id,
        proyecto_id,
        estudiante_rut,
        fecha_propuesta,
        hora_inicio_bloque,
        hora_fin_bloque,
        tipo_reunion = 'seguimiento',
        descripcion = ''
    } = reservaData;
    
    // Validar parámetros requeridos
    if (!fecha_propuesta || !hora_inicio_bloque || !hora_fin_bloque) {
        throw new Error('Faltan datos del bloque horario: fecha_propuesta, hora_inicio_bloque y hora_fin_bloque son requeridos');
    }
    
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Obtener información de la disponibilidad padre
        const [dispRows] = await connection.execute(
            `SELECT * FROM disponibilidad_horarios WHERE id = ?`,
            [disponibilidad_id]
        );
        
        if (dispRows.length === 0) {
            throw new Error('Disponibilidad no encontrada');
        }
        
        const disponibilidad = dispRows[0];
        
        // 2. Verificar que esté activa
        if (!disponibilidad.activo) {
            throw new Error('Este horario ya no está disponible');
        }
        
        // 3. Verificar que el bloque específico NO esté ocupado en esa fecha
        // Verificar contra solicitudes pendientes/aceptadas Y reuniones programadas
        const [conflictosSolicitudes] = await connection.execute(
            `SELECT COUNT(*) as total
             FROM solicitudes_reunion
             WHERE profesor_rut = ?
             AND fecha_propuesta = ?
             AND estado IN ('pendiente', 'aceptada')
             AND (
                 (hora_propuesta < ? AND DATE_ADD(hora_propuesta, INTERVAL duracion_minutos MINUTE) > ?) OR
                 (hora_propuesta >= ? AND hora_propuesta < ?)
             )`,
            [disponibilidad.usuario_rut, fecha_propuesta, hora_fin_bloque, hora_inicio_bloque, hora_inicio_bloque, hora_fin_bloque]
        );
        
        const [conflictosReuniones] = await connection.execute(
            `SELECT COUNT(*) as total
             FROM reuniones_calendario
             WHERE (profesor_rut = ? OR estudiante_rut = ?)
             AND fecha = ?
             AND estado = 'programada'
             AND (
                 (hora_inicio < ? AND hora_fin > ?) OR
                 (hora_inicio >= ? AND hora_inicio < ?)
             )`,
            [disponibilidad.usuario_rut, disponibilidad.usuario_rut, fecha_propuesta, hora_fin_bloque, hora_inicio_bloque, hora_inicio_bloque, hora_fin_bloque]
        );
        
        if (conflictosSolicitudes[0].total > 0 || conflictosReuniones[0].total > 0) {
            throw new Error('Este bloque horario ya está reservado o tiene una solicitud pendiente');
        }
        
        // 4. Crear solicitud de reunión con el bloque específico de 30 minutos
        const insertSolicitudQuery = `
            INSERT INTO solicitudes_reunion (
                proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta,
                hora_propuesta, duracion_minutos, tipo_reunion, descripcion,
                estado, creado_por
            )
            VALUES (?, ?, ?, ?, ?, 30, ?, ?, 'pendiente', 'estudiante')
        `;
        
        const [solicitudResult] = await connection.execute(insertSolicitudQuery, [
            proyecto_id,
            disponibilidad.usuario_rut,
            estudiante_rut,
            fecha_propuesta,
            hora_inicio_bloque,
            tipo_reunion,
            descripcion
        ]);
        
        const solicitud_id = solicitudResult.insertId;
        
        // 5. Registrar en historial
        await connection.execute(
            `INSERT INTO historial_reuniones (
                solicitud_id, proyecto_id, profesor_rut, estudiante_rut,
                fecha_propuesta, hora_propuesta, tipo_reunion,
                accion, realizado_por, comentarios
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'reserva_realizada', ?, ?)`,
            [
                solicitud_id,
                proyecto_id,
                disponibilidad.usuario_rut,
                estudiante_rut,
                fecha_propuesta,
                hora_inicio_bloque,
                tipo_reunion,
                estudiante_rut,
                `Bloque reservado: ${fecha_propuesta} ${hora_inicio_bloque}-${hora_fin_bloque}`
            ]
        );
        
        await connection.commit();
        
        return {
            success: true,
            solicitud_id: solicitud_id,
            disponibilidad_id: disponibilidad_id,
            fecha_reunion: fecha_propuesta,
            hora_inicio: hora_inicio_bloque,
            hora_fin: hora_fin_bloque,
            message: 'Bloque horario reservado exitosamente. Esperando confirmación del profesor.'
        };
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * Liberar horario cuando se rechaza una solicitud
 * DEPRECATED: La tabla solicitudes_reunion no tiene relación directa con disponibilidad_horarios
 * Los horarios recurrentes no se "reservan", simplemente se crean solicitudes de reunión
 */
export const liberarHorarioReservado = async (solicitud_id) => {
    return true;
};

// ===== RESPONDER RESERVA (PROFESOR) =====

/**
 * Profesor acepta o rechaza una reserva
 * @param {number} solicitud_id - ID de la solicitud
 * @param {string} profesor_rut - RUT del profesor que responde
 * @param {string} respuesta - 'aceptar' o 'rechazar'
 * @param {string} comentarios - Comentarios opcionales
 * @returns {Promise<Object>} - Resultado con reunion_id si se aceptó
 */
export const responderReserva = async (solicitud_id, profesor_rut, respuesta, comentarios = '') => {
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. Obtener solicitud
        const [solicitudRows] = await connection.execute(
            `SELECT sr.*, p.titulo as proyecto_titulo
             FROM solicitudes_reunion sr
             INNER JOIN proyectos p ON sr.proyecto_id = p.id
             WHERE sr.id = ? AND sr.profesor_rut = ? AND sr.estado = 'pendiente'
             FOR UPDATE`,
            [solicitud_id, profesor_rut]
        );
        
        if (solicitudRows.length === 0) {
            throw new Error('Solicitud no encontrada o ya fue respondida');
        }
        
        const solicitud = solicitudRows[0];
        let reunion_id = null;
        
        if (respuesta === 'aceptar') {
            // 2a. ACEPTAR: Actualizar solicitud
            await connection.execute(
                `UPDATE solicitudes_reunion 
                 SET estado = 'aceptada', 
                     comentarios_profesor = ?,
                     fecha_respuesta_profesor = NOW()
                 WHERE id = ?`,
                [comentarios, solicitud_id]
            );
            
            // 2b. Crear reunión en el calendario
            const horaFin = calcularHoraFin(solicitud.hora_propuesta, solicitud.duracion_minutos);
            const titulo = `${solicitud.tipo_reunion.replace(/_/g, ' ')} - ${solicitud.proyecto_titulo}`;
            
            const [reunionResult] = await connection.execute(
                `INSERT INTO reuniones_calendario (
                    solicitud_reunion_id, proyecto_id, profesor_rut, estudiante_rut,
                    fecha, hora_inicio, hora_fin, tipo_reunion, titulo, descripcion, estado
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'programada')`,
                [
                    solicitud_id,
                    solicitud.proyecto_id,
                    solicitud.profesor_rut,
                    solicitud.estudiante_rut,
                    solicitud.fecha_propuesta,
                    solicitud.hora_propuesta,
                    horaFin,
                    solicitud.tipo_reunion,
                    titulo,
                    solicitud.descripcion
                ]
            );
            
            reunion_id = reunionResult.insertId;
            
            // 2c. La disponibilidad se marca como inactiva automáticamente por el TRIGGER
            // (Ver migracion-sistema-reservas.sql - trigger tr_solicitud_aceptada_ocupar_horario)
            
            // 2d. Registrar en historial
            await connection.execute(
                `INSERT INTO historial_reuniones (
                    reunion_id, solicitud_id, proyecto_id, profesor_rut, estudiante_rut,
                    fecha_propuesta, hora_propuesta, tipo_reunion,
                    accion, realizado_por, comentarios
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aceptada', ?, ?)`,
                [
                    reunion_id, solicitud_id, solicitud.proyecto_id,
                    solicitud.profesor_rut, solicitud.estudiante_rut,
                    solicitud.fecha_propuesta, solicitud.hora_propuesta,
                    solicitud.tipo_reunion, profesor_rut,
                    comentarios || 'Reunión aceptada y creada'
                ]
            );
            
        } else {
            // 3a. RECHAZAR: Actualizar solicitud
            await connection.execute(
                `UPDATE solicitudes_reunion 
                 SET estado = 'rechazada', 
                     comentarios_profesor = ?,
                     fecha_respuesta_profesor = NOW()
                 WHERE id = ?`,
                [comentarios, solicitud_id]
            );
            
            // 3b. La disponibilidad se libera automáticamente por el TRIGGER
            // (Ver migracion-sistema-reservas.sql - trigger tr_solicitud_rechazada_liberar_horario)
            
            // 3c. Registrar en historial
            await connection.execute(
                `INSERT INTO historial_reuniones (
                    solicitud_id, proyecto_id, profesor_rut, estudiante_rut,
                    fecha_propuesta, hora_propuesta, tipo_reunion,
                    accion, realizado_por, comentarios
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, 'rechazada', ?, ?)`,
                [
                    solicitud_id, solicitud.proyecto_id,
                    solicitud.profesor_rut, solicitud.estudiante_rut,
                    solicitud.fecha_propuesta, solicitud.hora_propuesta,
                    solicitud.tipo_reunion, profesor_rut,
                    comentarios || 'Reunión rechazada'
                ]
            );
        }
        
        await connection.commit();
        
        return {
            success: true,
            respuesta: respuesta,
            solicitud_id: solicitud_id,
            reunion_id: reunion_id,
            reunion_creada: respuesta === 'aceptar',
            horario_liberado: respuesta === 'rechazar',
            message: respuesta === 'aceptar' 
                ? 'Reunión aceptada y creada en el calendario' 
                : 'Reunión rechazada. El horario vuelve a estar disponible.'
        };
        
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Verificar si un horario está ocupado en una fecha específica
 */
async function verificarHorarioOcupadoEseDia(profesor_rut, fecha, hora_inicio, hora_fin) {
    const query = `
        SELECT COUNT(*) as ocupado
        FROM reuniones_calendario
        WHERE (profesor_rut = ? OR estudiante_rut = ?)
        AND fecha = ?
        AND estado = 'programada'
        AND (
            (hora_inicio <= ? AND hora_fin > ?) OR
            (hora_inicio < ? AND hora_fin >= ?) OR
            (hora_inicio >= ? AND hora_fin <= ?)
        )
    `;
    
    const [rows] = await pool.execute(query, [
        profesor_rut, profesor_rut, fecha,
        hora_inicio, hora_inicio,
        hora_fin, hora_fin,
        hora_inicio, hora_fin
    ]);
    
    return rows[0].ocupado > 0;
}

/**
 * Dividir un horario grande en bloques de 30 minutos
 * Ejemplo: 09:00 - 14:00 se divide en:
 *   09:00-09:30, 09:30-10:00, 10:00-10:30, ..., 13:30-14:00
 */
function dividirEnBloquesDe30Min(hora_inicio, hora_fin) {
    const bloques = [];
    
    // Parsear hora_inicio (formato "HH:MM:SS" o "HH:MM")
    const [horaIni, minIni] = hora_inicio.split(':').map(Number);
    const [horaFin, minFin] = hora_fin.split(':').map(Number);
    
    // Convertir a minutos desde medianoche
    let minutosActuales = horaIni * 60 + minIni;
    const minutosFin = horaFin * 60 + minFin;
    
    // Generar bloques de 30 minutos
    while (minutosActuales < minutosFin) {
        const siguientes30 = minutosActuales + 30;
        
        // Convertir de vuelta a formato HH:MM:SS
        const horaInicioBloque = `${String(Math.floor(minutosActuales / 60)).padStart(2, '0')}:${String(minutosActuales % 60).padStart(2, '0')}:00`;
        const horaFinBloque = `${String(Math.floor(siguientes30 / 60)).padStart(2, '0')}:${String(siguientes30 % 60).padStart(2, '0')}:00`;
        
        bloques.push({
            hora_inicio: horaInicioBloque,
            hora_fin: horaFinBloque
        });
        
        minutosActuales = siguientes30;
    }
    
    return bloques;
}

/**
 * Convertir número de día a nombre en español
 */
function obtenerDiaSemanaEspanol(diaSemana) {
    const dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    return dias[diaSemana];
}

/**
 * Encontrar la próxima fecha para un día de la semana
 */
function encontrarProximaFecha(dia_semana) {
    const diasMap = {
        'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4,
        'viernes': 5, 'sabado': 6, 'domingo': 0
    };
    
    const diaObjetivo = diasMap[dia_semana];
    const hoy = new Date();
    const diaActual = hoy.getDay();
    
    let diasHasta = diaObjetivo - diaActual;
    if (diasHasta <= 0) {
        diasHasta += 7; // Siguiente semana
    }
    
    const proximaFecha = new Date(hoy);
    proximaFecha.setDate(hoy.getDate() + diasHasta);
    
    return proximaFecha.toISOString().split('T')[0];
}

/**
 * Calcular hora de fin basada en hora de inicio y duración
 */
function calcularHoraFin(hora_inicio, duracion_minutos) {
    const [horas, minutos] = hora_inicio.split(':').map(Number);
    const fecha = new Date(2000, 0, 1, horas, minutos);
    fecha.setMinutes(fecha.getMinutes() + duracion_minutos);
    return `${String(fecha.getHours()).padStart(2, '0')}:${String(fecha.getMinutes()).padStart(2, '0')}:00`;
}

/**
 * Actualizar disponibilidad
 */
export const actualizarDisponibilidad = async (disponibilidad_id, usuario_rut, updateData) => {
    const { dia_semana, hora_inicio, hora_fin, activo } = updateData;
    
    let campos = [];
    let valores = [];
    
    if (dia_semana !== undefined) {
        campos.push('dia_semana = ?');
        valores.push(dia_semana);
    }
    
    if (hora_inicio !== undefined) {
        campos.push('hora_inicio = ?');
        valores.push(hora_inicio);
    }
    
    if (hora_fin !== undefined) {
        campos.push('hora_fin = ?');
        valores.push(hora_fin);
    }
    
    if (activo !== undefined) {
        campos.push('activo = ?');
        valores.push(activo);
    }
    
    if (campos.length === 0) {
        throw new Error('No hay campos para actualizar');
    }
    
    campos.push('updated_at = CURRENT_TIMESTAMP');
    valores.push(disponibilidad_id, usuario_rut);
    
    const query = `
        UPDATE disponibilidad_horarios 
        SET ${campos.join(', ')}
        WHERE id = ? AND usuario_rut = ?
    `;
    
    const [result] = await pool.execute(query, valores);
    return result.affectedRows > 0;
};

/**
 * Eliminar disponibilidad (marcando como inactiva)
 */
export const eliminarDisponibilidad = async (disponibilidad_id, usuario_rut) => {
    const query = `
        UPDATE disponibilidad_horarios 
        SET activo = FALSE 
        WHERE id = ? AND usuario_rut = ?
    `;
    
    const [result] = await pool.execute(query, [disponibilidad_id, usuario_rut]);
    
    if (result.affectedRows === 0) {
        throw new Error('No se puede eliminar: disponibilidad no encontrada');
    }
    
    return true;
};

/**
 * Obtener solicitudes pendientes del profesor
 */
export const obtenerSolicitudesPendientesProfesor = async (profesor_rut) => {
    const query = `
        SELECT * FROM v_solicitudes_pendientes
        WHERE profesor_rut = ?
        ORDER BY created_at DESC
    `;
    
    const [rows] = await pool.execute(query, [profesor_rut]);
    return rows;
};

/**
 * Obtener solicitudes del estudiante
 */
export const obtenerSolicitudesEstudiante = async (estudiante_rut) => {
    const query = `
        SELECT 
            sr.id,
            sr.proyecto_id,
            sr.profesor_rut,
            sr.estudiante_rut,
            DATE_FORMAT(sr.fecha_propuesta, '%Y-%m-%d') as fecha_propuesta,
            sr.hora_propuesta,
            sr.duracion_minutos,
            sr.tipo_reunion,
            sr.descripcion,
            sr.estado,
            sr.creado_por,
            sr.fecha_respuesta_profesor,
            sr.fecha_respuesta_estudiante,
            sr.comentarios_profesor,
            sr.comentarios_estudiante,
            sr.created_at,
            sr.updated_at,
            p.titulo as proyecto_titulo,
            up.nombre as profesor_nombre
        FROM solicitudes_reunion sr
        INNER JOIN proyectos p ON sr.proyecto_id = p.id
        INNER JOIN usuarios up ON sr.profesor_rut = up.rut
        WHERE sr.estudiante_rut = ?
        ORDER BY 
            CASE sr.estado
                WHEN 'pendiente' THEN 1
                WHEN 'aceptada_profesor' THEN 2
                WHEN 'aceptada_estudiante' THEN 3
                WHEN 'confirmada' THEN 4
                WHEN 'rechazada' THEN 5
                WHEN 'cancelada' THEN 6
            END,
            sr.created_at DESC
    `;
    
    const [rows] = await pool.execute(query, [estudiante_rut]);
    return rows;
};
