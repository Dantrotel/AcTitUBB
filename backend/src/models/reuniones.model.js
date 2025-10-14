import { pool } from '../db/connectionDB.js';

// ===== GESTIÓN DE SOLICITUDES Y CONFIRMACIONES =====

/**
 * Responder a una solicitud de reunión (profesor o estudiante)
 * @param {number} solicitud_id - ID de la solicitud
 * @param {string} usuario_rut - RUT del usuario que responde
 * @param {string} respuesta - 'aceptar' o 'rechazar'
 * @param {string} comentarios - Comentarios opcionales
 * @returns {Promise<Object>} - Resultado de la respuesta
 */
export const responderSolicitudReunion = async (solicitud_id, usuario_rut, respuesta, comentarios = '') => {
    // Obtener la solicitud con validación de asignación
    const solicitudQuery = `
        SELECT 
            sr.*, 
            p.titulo as proyecto_titulo,
            ap.id as asignacion_id,
            rp.nombre as rol_profesor_nombre
        FROM solicitudes_reunion sr
        INNER JOIN proyectos p ON sr.proyecto_id = p.id
        LEFT JOIN asignaciones_proyectos ap ON ap.proyecto_id = sr.proyecto_id 
            AND ap.profesor_rut = sr.profesor_rut 
            AND ap.activo = TRUE
        LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE sr.id = ?
    `;
    
    const [solicitudRows] = await pool.execute(solicitudQuery, [solicitud_id]);
    
    if (solicitudRows.length === 0) {
        throw new Error('Solicitud de reunión no encontrada');
    }
    
    const solicitud = solicitudRows[0];
    
    // Verificar que el usuario es parte de la reunión
    if (usuario_rut !== solicitud.profesor_rut && usuario_rut !== solicitud.estudiante_rut) {
        throw new Error('No tienes permisos para responder a esta solicitud');
    }
    
    // Verificar que el profesor está asignado al proyecto (solo para profesores)
    if (usuario_rut === solicitud.profesor_rut && !solicitud.asignacion_id) {
        throw new Error('No tienes asignación activa a este proyecto para responder esta solicitud');
    }
    
    // Verificar estado actual
    if (solicitud.estado === 'confirmada') {
        throw new Error('La reunión ya está confirmada');
    }
    
    if (solicitud.estado === 'rechazada' || solicitud.estado === 'cancelada') {
        throw new Error('La solicitud ya fue rechazada o cancelada');
    }
    
    const esProfesor = usuario_rut === solicitud.profesor_rut;
    let nuevoEstado = solicitud.estado;
    let updateFields = [];
    let updateValues = [];
    
    if (respuesta === 'aceptar') {
        if (esProfesor) {
            nuevoEstado = 'aceptada_profesor';
            updateFields.push('fecha_respuesta_profesor = NOW()');
            if (comentarios) {
                updateFields.push('comentarios_profesor = ?');
                updateValues.push(comentarios);
            }
            
            // Si el estudiante ya aceptó, confirmar la reunión
            if (solicitud.estado === 'aceptada_estudiante') {
                nuevoEstado = 'confirmada';
            }
        } else {
            nuevoEstado = 'aceptada_estudiante';
            updateFields.push('fecha_respuesta_estudiante = NOW()');
            if (comentarios) {
                updateFields.push('comentarios_estudiante = ?');
                updateValues.push(comentarios);
            }
            
            // Si el profesor ya aceptó, confirmar la reunión
            if (solicitud.estado === 'aceptada_profesor') {
                nuevoEstado = 'confirmada';
            }
        }
    } else {
        nuevoEstado = 'rechazada';
        if (esProfesor) {
            updateFields.push('fecha_respuesta_profesor = NOW()');
            if (comentarios) {
                updateFields.push('comentarios_profesor = ?');
                updateValues.push(comentarios);
            }
        } else {
            updateFields.push('fecha_respuesta_estudiante = NOW()');
            if (comentarios) {
                updateFields.push('comentarios_estudiante = ?');
                updateValues.push(comentarios);
            }
        }
    }
    
    // Actualizar solicitud
    updateFields.push('estado = ?');
    updateValues.push(nuevoEstado, solicitud_id);
    
    const updateQuery = `
        UPDATE solicitudes_reunion 
        SET ${updateFields.join(', ')}
        WHERE id = ?
    `;
    
    await pool.execute(updateQuery, updateValues);
    
    // Si se confirmó la reunión, crear la reunión en el calendario
    let reunion_id = null;
    if (nuevoEstado === 'confirmada') {
        reunion_id = await crearReunionConfirmada(solicitud_id);
    }
    
    return {
        success: true,
        estado_anterior: solicitud.estado,
        estado_nuevo: nuevoEstado,
        reunion_confirmada: nuevoEstado === 'confirmada',
        reunion_id: reunion_id,
        message: obtenerMensajeEstado(nuevoEstado, esProfesor)
    };
};

/**
 * Crear reunión confirmada en el calendario
 * @param {number} solicitud_id - ID de la solicitud confirmada
 * @returns {Promise<number>} - ID de la reunión creada
 */
export const crearReunionConfirmada = async (solicitud_id) => {
    // Obtener datos de la solicitud
    const solicitudQuery = `
        SELECT sr.*, p.titulo as proyecto_titulo
        FROM solicitudes_reunion sr
        INNER JOIN proyectos p ON sr.proyecto_id = p.id
        WHERE sr.id = ? AND sr.estado = 'confirmada'
    `;
    
    const [solicitudRows] = await pool.execute(solicitudQuery, [solicitud_id]);
    
    if (solicitudRows.length === 0) {
        throw new Error('Solicitud no encontrada o no está confirmada');
    }
    
    const solicitud = solicitudRows[0];
    
    // Calcular hora de fin
    const horaInicio = new Date(`2000-01-01 ${solicitud.hora_propuesta}`);
    const horaFin = new Date(horaInicio.getTime() + solicitud.duracion_minutos * 60000);
    const horaFinStr = horaFin.toTimeString().slice(0, 5);
    
    // Crear título de la reunión
    const titulo = `${solicitud.tipo_reunion.charAt(0).toUpperCase() + solicitud.tipo_reunion.slice(1)} - ${solicitud.proyecto_titulo}`;
    
    const insertQuery = `
        INSERT INTO reuniones_calendario (
            solicitud_reunion_id, proyecto_id, profesor_rut, estudiante_rut,
            fecha, hora_inicio, hora_fin, tipo_reunion, titulo, descripcion
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(insertQuery, [
        solicitud_id,
        solicitud.proyecto_id,
        solicitud.profesor_rut,
        solicitud.estudiante_rut,
        solicitud.fecha_propuesta,
        solicitud.hora_propuesta,
        horaFinStr,
        solicitud.tipo_reunion,
        titulo,
        solicitud.descripcion
    ]);
    
    return result.insertId;
};

/**
 * Obtener reuniones confirmadas de un usuario
 * @param {string} usuario_rut - RUT del usuario
 * @param {string} estado - Estado de las reuniones (opcional)
 * @returns {Promise<Array>} - Lista de reuniones
 */
export const obtenerReunionesUsuario = async (usuario_rut, estado = null) => {
    let query = `
        SELECT 
            rc.*,
            p.titulo as proyecto_titulo,
            ue.nombre as estudiante_nombre,
            up.nombre as profesor_nombre,
            sr.comentarios_profesor,
            sr.comentarios_estudiante
        FROM reuniones_calendario rc
        INNER JOIN proyectos p ON rc.proyecto_id = p.id
        INNER JOIN usuarios ue ON rc.estudiante_rut = ue.rut
        INNER JOIN usuarios up ON rc.profesor_rut = up.rut
        INNER JOIN solicitudes_reunion sr ON rc.solicitud_reunion_id = sr.id
        WHERE (rc.profesor_rut = ? OR rc.estudiante_rut = ?)
    `;
    
    const params = [usuario_rut, usuario_rut];
    
    if (estado) {
        query += ' AND rc.estado = ?';
        params.push(estado);
    }
    
    query += ' ORDER BY rc.fecha ASC, rc.hora_inicio ASC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
};

/**
 * Actualizar estado de reunión
 * @param {number} reunion_id - ID de la reunión
 * @param {string} nuevo_estado - Nuevo estado
 * @param {string} usuario_rut - RUT del usuario que actualiza
 * @param {Object} datos_adicionales - Datos adicionales (acta, lugar, etc.)
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
export const actualizarEstadoReunion = async (reunion_id, nuevo_estado, usuario_rut, datos_adicionales = {}) => {
    // Verificar permisos
    const verificarQuery = `
        SELECT * FROM reuniones_calendario 
        WHERE id = ? AND (profesor_rut = ? OR estudiante_rut = ?)
    `;
    
    const [reunionRows] = await pool.execute(verificarQuery, [reunion_id, usuario_rut, usuario_rut]);
    
    if (reunionRows.length === 0) {
        throw new Error('Reunión no encontrada o sin permisos');
    }
    
    let updateFields = ['estado = ?'];
    let updateValues = [nuevo_estado];
    
    // Agregar campos adicionales según el estado
    if (nuevo_estado === 'realizada') {
        updateFields.push('fecha_realizacion = NOW()');
        
        if (datos_adicionales.acta_reunion) {
            updateFields.push('acta_reunion = ?');
            updateValues.push(datos_adicionales.acta_reunion);
        }
    }
    
    if (datos_adicionales.lugar) {
        updateFields.push('lugar = ?');
        updateValues.push(datos_adicionales.lugar);
    }
    
    if (datos_adicionales.modalidad) {
        updateFields.push('modalidad = ?');
        updateValues.push(datos_adicionales.modalidad);
    }
    
    if (datos_adicionales.link_reunion) {
        updateFields.push('link_reunion = ?');
        updateValues.push(datos_adicionales.link_reunion);
    }
    
    updateValues.push(reunion_id);
    
    const updateQuery = `
        UPDATE reuniones_calendario 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
    `;
    
    const [result] = await pool.execute(updateQuery, updateValues);
    return result.affectedRows > 0;
};

/**
 * Cancelar reunión
 * @param {number} reunion_id - ID de la reunión
 * @param {string} usuario_rut - RUT del usuario que cancela
 * @param {string} motivo - Motivo de la cancelación
 * @returns {Promise<boolean>} - true si se canceló correctamente
 */
export const cancelarReunion = async (reunion_id, usuario_rut, motivo = '') => {
    const reunion = await obtenerReunionPorId(reunion_id);
    
    if (!reunion) {
        throw new Error('Reunión no encontrada');
    }
    
    if (reunion.profesor_rut !== usuario_rut && reunion.estudiante_rut !== usuario_rut) {
        throw new Error('No tienes permisos para cancelar esta reunión');
    }
    
    if (reunion.estado === 'realizada') {
        throw new Error('No se puede cancelar una reunión que ya se realizó');
    }
    
    // Actualizar reunión
    const updateReunionQuery = `
        UPDATE reuniones_calendario 
        SET estado = 'cancelada' 
        WHERE id = ?
    `;
    
    await pool.execute(updateReunionQuery, [reunion_id]);
    
    // Actualizar solicitud original
    const updateSolicitudQuery = `
        UPDATE solicitudes_reunion 
        SET estado = 'cancelada' 
        WHERE id = ?
    `;
    
    await pool.execute(updateSolicitudQuery, [reunion.solicitud_reunion_id]);
    
    return true;
};

/**
 * Reprogramar reunión
 * @param {number} reunion_id - ID de la reunión
 * @param {string} nueva_fecha - Nueva fecha
 * @param {string} nueva_hora - Nueva hora
 * @param {string} usuario_rut - RUT del usuario que reprograma
 * @returns {Promise<number>} - ID de la nueva solicitud
 */
export const reprogramarReunion = async (reunion_id, nueva_fecha, nueva_hora, usuario_rut) => {
    const reunion = await obtenerReunionPorId(reunion_id);
    
    if (!reunion) {
        throw new Error('Reunión no encontrada');
    }
    
    if (reunion.profesor_rut !== usuario_rut && reunion.estudiante_rut !== usuario_rut) {
        throw new Error('No tienes permisos para reprogramar esta reunión');
    }
    
    // Verificar disponibilidad en la nueva fecha/hora
    const conflicto = await verificarConflictoHorario(
        reunion.profesor_rut,
        reunion.estudiante_rut,
        nueva_fecha,
        nueva_hora,
        60 // Duración por defecto
    );
    
    if (conflicto) {
        throw new Error('Conflicto de horario en la nueva fecha/hora propuesta');
    }
    
    // Marcar reunión actual como reprogramada
    await pool.execute(
        'UPDATE reuniones_calendario SET estado = ? WHERE id = ?',
        ['reprogramada', reunion_id]
    );
    
    // Crear nueva solicitud
    const nuevaSolicitudQuery = `
        INSERT INTO solicitudes_reunion (
            proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta, 
            hora_propuesta, duracion_minutos, tipo_reunion, descripcion, 
            creado_por, estado
        )
        SELECT 
            proyecto_id, profesor_rut, estudiante_rut, ?, 
            ?, duracion_minutos, tipo_reunion, 
            CONCAT('Reprogramación: ', descripcion),
            ?, 'pendiente'
        FROM solicitudes_reunion 
        WHERE id = ?
    `;
    
    const creado_por = reunion.profesor_rut === usuario_rut ? 'profesor' : 'estudiante';
    
    const [result] = await pool.execute(nuevaSolicitudQuery, [
        nueva_fecha, nueva_hora, creado_por, reunion.solicitud_reunion_id
    ]);
    
    return result.insertId;
};

/**
 * Obtener reunión por ID
 */
export const obtenerReunionPorId = async (reunion_id) => {
    const query = `
        SELECT rc.*, sr.duracion_minutos
        FROM reuniones_calendario rc
        INNER JOIN solicitudes_reunion sr ON rc.solicitud_reunion_id = sr.id
        WHERE rc.id = ?
    `;
    
    const [rows] = await pool.execute(query, [reunion_id]);
    return rows[0] || null;
};

/**
 * Obtener estadísticas de reuniones de un usuario
 */
export const obtenerEstadisticasReuniones = async (usuario_rut) => {
    const query = `
        SELECT 
            estado,
            COUNT(*) as cantidad,
            tipo_reunion
        FROM reuniones_calendario
        WHERE profesor_rut = ? OR estudiante_rut = ?
        GROUP BY estado, tipo_reunion
        ORDER BY estado, tipo_reunion
    `;
    
    const [rows] = await pool.execute(query, [usuario_rut, usuario_rut]);
    return rows;
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Obtener mensaje según el estado
 */
function obtenerMensajeEstado(estado, esProfesor) {
    const tipo = esProfesor ? 'profesor' : 'estudiante';
    
    switch (estado) {
        case 'aceptada_profesor':
            return esProfesor ? 
                'Has aceptado la reunión. Esperando respuesta del estudiante.' :
                'El profesor ha aceptado la reunión. Esperando tu respuesta.';
        case 'aceptada_estudiante':
            return esProfesor ? 
                'El estudiante ha aceptado la reunión. Esperando tu respuesta.' :
                'Has aceptado la reunión. Esperando respuesta del profesor.';
        case 'confirmada':
            return 'Reunión confirmada por ambas partes. Se ha agregado al calendario.';
        case 'rechazada':
            return `Reunión rechazada por ${esProfesor ? 'el profesor' : 'el estudiante'}.`;
        default:
            return 'Estado de reunión actualizado.';
    }
}

/**
 * Verificar conflicto de horario (importada del modelo anterior)
 */
async function verificarConflictoHorario(profesor_rut, estudiante_rut, fecha, hora_inicio, duracion_minutos) {
    const hora_fin = new Date(`2000-01-01 ${hora_inicio}`);
    hora_fin.setMinutes(hora_fin.getMinutes() + duracion_minutos);
    const hora_fin_str = hora_fin.toTimeString().slice(0, 5);
    
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
        hora_fin_str, hora_fin_str,
        hora_inicio, hora_fin_str
    ]);
    
    return rows[0].ocupado > 0;
}