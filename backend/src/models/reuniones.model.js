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
    
    // Verificar estado actual (nuevo sistema con 3 estados)
    if (solicitud.estado === 'aceptada') {
        throw new Error('La reunión ya está aceptada');
    }
    
    if (solicitud.estado === 'rechazada') {
        throw new Error('La solicitud ya fue rechazada');
    }
    
    const esProfesor = usuario_rut === solicitud.profesor_rut;
    let nuevoEstado = solicitud.estado;
    let updateFields = [];
    let updateValues = [];
    
    if (respuesta === 'aceptar') {
        // NUEVO SISTEMA: Solo estados 'pendiente', 'aceptada', 'rechazada'
        nuevoEstado = 'aceptada';
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
    } else {
        // Rechazar
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
    
    // Registrar en historial (adaptado al nuevo sistema)
    const accionHistorial = respuesta === 'aceptar' ? 'aceptada' : 'rechazada';
    await registrarEnHistorial(solicitud, accionHistorial, usuario_rut, comentarios);
    
    // Si se aceptó la reunión, crear la reunión en el calendario
    let reunion_id = null;
    if (nuevoEstado === 'aceptada') {
        reunion_id = await crearReunionAceptada(solicitud_id);
        // Registrar aceptación en historial
        await registrarEnHistorial(solicitud, 'aceptada', usuario_rut, 'Reunión aceptada');
    }
    
    return {
        success: true,
        estado_anterior: solicitud.estado,
        estado_nuevo: nuevoEstado,
        reunion_confirmada: nuevoEstado === 'aceptada',
        reunion_id: reunion_id,
        message: obtenerMensajeEstado(nuevoEstado, esProfesor)
    };
};

/**
 * Crear reunión aceptada en el calendario
 * @param {number} solicitud_id - ID de la solicitud aceptada
 * @returns {Promise<number>} - ID de la reunión creada
 */
export const crearReunionAceptada = async (solicitud_id) => {
    // Obtener datos de la solicitud
    const solicitudQuery = `
        SELECT sr.*, p.titulo as proyecto_titulo
        FROM solicitudes_reunion sr
        INNER JOIN proyectos p ON sr.proyecto_id = p.id
        WHERE sr.id = ? AND sr.estado = 'aceptada'
    `;
    
    const [solicitudRows] = await pool.execute(solicitudQuery, [solicitud_id]);
    
    if (solicitudRows.length === 0) {
        throw new Error('Solicitud no encontrada o no está aceptada');
    }
    
    const solicitud = solicitudRows[0];
    
    // Calcular hora de fin
    const horaInicio = new Date(`2000-01-01 ${solicitud.hora_propuesta}`);
    const horaFin = new Date(horaInicio.getTime() + solicitud.duracion_minutos * 60000);
    const horaFinStr = horaFin.toTimeString().slice(0, 5);
    
    // Crear título de la reunión
    const tipoCapitalizado = solicitud.tipo_reunion.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const titulo = `${tipoCapitalizado} - ${solicitud.proyecto_titulo}`;
    
    const insertQuery = `
        INSERT INTO reuniones_calendario (
            solicitud_reunion_id, proyecto_id, profesor_rut, estudiante_rut,
            fecha, hora_inicio, hora_fin, tipo_reunion, titulo, descripcion, estado
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'programada')
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
    
    // Actualizar última actividad del proyecto (control de abandono)
    if (solicitud.proyecto_id) {
        await pool.execute(
            `UPDATE proyectos 
             SET ultima_actividad_fecha = CURDATE(), 
                 alerta_inactividad_enviada = FALSE 
             WHERE id = ?`,
            [solicitud.proyecto_id]
        );
    }
    
    return result.insertId;
};

/**
 * Obtener reuniones confirmadas de un usuario
 * @param {string} usuario_rut - RUT del usuario
 * @param {string} estado - Estado de las reuniones (opcional)
 * @returns {Promise<Array>} - Lista de reuniones con indicador de expiración
 */
export const obtenerReunionesUsuario = async (usuario_rut, estado = null) => {
    let query = `
        SELECT 
            rc.*,
            p.titulo as proyecto_titulo,
            ue.nombre as estudiante_nombre,
            up.nombre as profesor_nombre,
            sr.comentarios_profesor,
            sr.comentarios_estudiante,
            CASE 
                WHEN rc.estado = 'programada' 
                    AND CONCAT(rc.fecha, ' ', rc.hora_fin) < NOW() 
                THEN TRUE
                ELSE FALSE
            END as expirada
        FROM reuniones_calendario rc
        INNER JOIN proyectos p ON rc.proyecto_id = p.id
        INNER JOIN usuarios ue ON rc.estudiante_rut = ue.rut
        INNER JOIN usuarios up ON rc.profesor_rut = up.rut
        LEFT JOIN solicitudes_reunion sr ON rc.solicitud_reunion_id = sr.id
        WHERE (rc.profesor_rut = ? OR rc.estudiante_rut = ?)
    `;
    
    const params = [usuario_rut, usuario_rut];
    
    if (estado) {
        query += ' AND rc.estado = ?';
        params.push(estado);
    }
    
    query += ' ORDER BY rc.fecha DESC, rc.hora_inicio DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
};

/**
 * Registrar acción en historial de reuniones
 */
async function registrarEnHistorial(solicitud, accion, realizado_por, comentarios = '') {
    try {
        const insertQuery = `
            INSERT INTO historial_reuniones (
                solicitud_id, proyecto_id, profesor_rut, estudiante_rut,
                fecha_propuesta, hora_propuesta, tipo_reunion,
                accion, realizado_por, comentarios
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await pool.execute(insertQuery, [
            solicitud.id,
            solicitud.proyecto_id,
            solicitud.profesor_rut,
            solicitud.estudiante_rut,
            solicitud.fecha_propuesta,
            solicitud.hora_propuesta,
            solicitud.tipo_reunion,
            accion,
            realizado_por,
            comentarios
        ]);
    } catch (error) {
        console.error('Error registrando en historial:', error);
        // No lanzar error para no interrumpir el flujo principal
    }
}

/**
 * Registrar en historial desde datos de reunión directa
 */
async function registrarEnHistorialDirecto(datos, accion, realizado_por, comentarios = '') {
    try {
        const insertQuery = `
            INSERT INTO historial_reuniones (
                reunion_id, solicitud_id, proyecto_id, profesor_rut, estudiante_rut,
                fecha_propuesta, hora_propuesta, tipo_reunion,
                accion, realizado_por, comentarios
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await pool.execute(insertQuery, [
            datos.reunion_id || null,
            datos.solicitud_id || null,
            datos.proyecto_id,
            datos.profesor_rut,
            datos.estudiante_rut,
            datos.fecha_propuesta,
            datos.hora_propuesta,
            datos.tipo_reunion,
            accion,
            realizado_por,
            comentarios
        ]);
    } catch (error) {
        console.error('Error registrando en historial directo:', error);
    }
}

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
        SELECT rc.*, sr.id as solicitud_id, sr.profesor_rut as sr_profesor_rut, sr.estudiante_rut as sr_estudiante_rut,
               sr.proyecto_id, sr.tipo_reunion, sr.fecha_propuesta, sr.hora_propuesta
        FROM reuniones_calendario rc
        LEFT JOIN solicitudes_reunion sr ON rc.solicitud_reunion_id = sr.id
        WHERE rc.id = ? AND (rc.profesor_rut = ? OR rc.estudiante_rut = ?)
    `;
    
    const [reunionRows] = await pool.execute(verificarQuery, [reunion_id, usuario_rut, usuario_rut]);
    
    if (reunionRows.length === 0) {
        throw new Error('Reunión no encontrada o sin permisos');
    }
    
    const reunion = reunionRows[0];
    
    let updateFields = ['estado = ?'];
    let updateValues = [nuevo_estado];
    
    // Agregar campos adicionales según el estado
    if (nuevo_estado === 'realizada') {
        updateFields.push('fecha_realizacion = NOW()');
        
        if (datos_adicionales.acta_reunion) {
            updateFields.push('acta_reunion = ?');
            updateValues.push(datos_adicionales.acta_reunion);
        }
        
        // Registrar en historial
        await registrarEnHistorialDirecto({
            reunion_id: reunion_id,
            solicitud_id: reunion.solicitud_id,
            proyecto_id: reunion.proyecto_id,
            profesor_rut: reunion.profesor_rut,
            estudiante_rut: reunion.estudiante_rut,
            fecha_propuesta: reunion.fecha,
            hora_propuesta: reunion.hora_inicio,
            tipo_reunion: reunion.tipo_reunion
        }, 'realizada', usuario_rut, datos_adicionales.acta_reunion || 'Reunión marcada como realizada');
        
    } else if (nuevo_estado === 'cancelada') {
        if (datos_adicionales.motivo_cancelacion) {
            updateFields.push('motivo_cancelacion = ?');
            updateValues.push(datos_adicionales.motivo_cancelacion);
        }
        
        // Registrar en historial
        await registrarEnHistorialDirecto({
            reunion_id: reunion_id,
            solicitud_id: reunion.solicitud_id,
            proyecto_id: reunion.proyecto_id,
            profesor_rut: reunion.profesor_rut,
            estudiante_rut: reunion.estudiante_rut,
            fecha_propuesta: reunion.fecha,
            hora_propuesta: reunion.hora_inicio,
            tipo_reunion: reunion.tipo_reunion
        }, 'cancelada', usuario_rut, datos_adicionales.motivo_cancelacion || 'Reunión cancelada');
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
    
    // Actualizar reunión a cancelada (tabla reuniones_calendario todavía tiene este estado)
    const updateReunionQuery = `
        UPDATE reuniones_calendario 
        SET estado = 'cancelada' 
        WHERE id = ?
    `;
    
    await pool.execute(updateReunionQuery, [reunion_id]);
    
    // Actualizar solicitud original a RECHAZADA (nuevo sistema con 3 estados)
    const updateSolicitudQuery = `
        UPDATE solicitudes_reunion 
        SET estado = 'rechazada',
            comentarios_profesor = ?
        WHERE id = ?
    `;
    
    await pool.execute(updateSolicitudQuery, [motivo || 'Reunión cancelada', reunion.solicitud_reunion_id]);
    
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
 * Obtener historial completo de reuniones (para dashboard)
 * Incluye todas las solicitudes y su estado actual
 */
export const obtenerHistorialReuniones = async (usuario_rut) => {
    const query = `
        SELECT 
            hr.*,
            p.titulo as proyecto_titulo,
            ue.nombre as estudiante_nombre,
            up.nombre as profesor_nombre,
            ur.nombre as realizado_por_nombre,
            rc.id as reunion_id,
            rc.estado as estado_reunion_actual
        FROM historial_reuniones hr
        INNER JOIN proyectos p ON hr.proyecto_id = p.id
        INNER JOIN usuarios ue ON hr.estudiante_rut = ue.rut
        INNER JOIN usuarios up ON hr.profesor_rut = up.rut
        INNER JOIN usuarios ur ON hr.realizado_por = ur.rut
        LEFT JOIN reuniones_calendario rc ON hr.reunion_id = rc.id
        WHERE (hr.profesor_rut = ? OR hr.estudiante_rut = ?)
        ORDER BY hr.fecha_accion DESC
    `;
    
    const [rows] = await pool.execute(query, [usuario_rut, usuario_rut]);
    return rows;
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
        AND estado = 'programada'
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

// ===== GESTIÓN DE ACTAS DE REUNIÓN =====

/**
 * Generar número de acta automático
 * @param {number} proyectoId 
 * @returns {Promise<string>}
 */
async function generarNumeroActa(proyectoId) {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) + 1 as siguiente
        FROM actas_reunion
        WHERE proyecto_id = ?
    `, [proyectoId]);
    
    const numero = rows[0].siguiente;
    const año = new Date().getFullYear();
    return `ACT-${String(proyectoId).padStart(3, '0')}-${String(numero).padStart(3, '0')}-${año}`;
}

/**
 * Crear acta de reunión
 * @param {Object} data - Datos del acta
 * @returns {Promise<number>} - ID del acta creada
 */
export const crearActaReunion = async ({
    reunion_id,
    proyecto_id,
    fecha_reunion,
    hora_inicio,
    hora_fin,
    lugar = null,
    asistentes,
    objetivo,
    temas_tratados,
    acuerdos,
    tareas_asignadas = null,
    proximos_pasos = null,
    observaciones = null,
    creado_por
}) => {
    try {
        // Validar que la reunión existe
        const [reunion] = await pool.execute(`
            SELECT * FROM reuniones_calendario WHERE id = ?
        `, [reunion_id]);

        if (reunion.length === 0) {
            throw new Error('Reunión no encontrada');
        }

        // Validar que el creador es parte de la reunión
        if (reunion[0].profesor_rut !== creado_por && reunion[0].estudiante_rut !== creado_por) {
            throw new Error('Solo los participantes pueden crear el acta');
        }

        // Verificar que no exista ya un acta para esta reunión
        const [actaExistente] = await pool.execute(`
            SELECT id FROM actas_reunion WHERE reunion_id = ?
        `, [reunion_id]);

        if (actaExistente.length > 0) {
            throw new Error('Ya existe un acta para esta reunión');
        }

        const numero_acta = await generarNumeroActa(proyecto_id);

        // Convertir asistentes a JSON si es array
        const asistentesJSON = typeof asistentes === 'string' ? asistentes : JSON.stringify(asistentes);

        const [result] = await pool.execute(`
            INSERT INTO actas_reunion (
                reunion_id, proyecto_id, numero_acta, fecha_reunion,
                hora_inicio, hora_fin, lugar, asistentes, objetivo,
                temas_tratados, acuerdos, tareas_asignadas, proximos_pasos,
                observaciones, creado_por, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador')
        `, [
            reunion_id, proyecto_id, numero_acta, fecha_reunion,
            hora_inicio, hora_fin, lugar, asistentesJSON, objetivo,
            temas_tratados, acuerdos, tareas_asignadas, proximos_pasos,
            observaciones, creado_por
        ]);

        return result.insertId;
    } catch (error) {
        console.error('Error al crear acta:', error);
        throw error;
    }
};

/**
 * Obtener acta por ID
 * @param {number} actaId 
 * @returns {Promise<Object>}
 */
export const obtenerActaPorId = async (actaId) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                ar.*,
                p.titulo AS proyecto_titulo,
                p.estudiante_rut,
                u_est.nombre AS estudiante_nombre,
                u_creador.nombre AS creado_por_nombre,
                rc.profesor_rut,
                u_prof.nombre AS profesor_nombre
            FROM actas_reunion ar
            INNER JOIN proyectos p ON ar.proyecto_id = p.id
            INNER JOIN usuarios u_est ON p.estudiante_rut = u_est.rut
            INNER JOIN usuarios u_creador ON ar.creado_por = u_creador.rut
            INNER JOIN reuniones_calendario rc ON ar.reunion_id = rc.id
            INNER JOIN usuarios u_prof ON rc.profesor_rut = u_prof.rut
            WHERE ar.id = ?
        `, [actaId]);

        if (rows.length === 0) return null;

        const acta = rows[0];
        // Parsear asistentes si es JSON
        try {
            acta.asistentes = JSON.parse(acta.asistentes);
        } catch (e) {
            // Si no es JSON válido, dejar como está
        }

        return acta;
    } catch (error) {
        console.error('Error al obtener acta:', error);
        throw error;
    }
};

/**
 * Obtener actas por proyecto
 * @param {number} proyectoId 
 * @returns {Promise<Array>}
 */
export const obtenerActasPorProyecto = async (proyectoId) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                ar.*,
                rc.tipo_reunion,
                u_creador.nombre AS creado_por_nombre,
                CASE 
                    WHEN ar.firma_estudiante = TRUE AND ar.firma_profesor = TRUE THEN 'firmada'
                    WHEN ar.firma_estudiante = FALSE OR ar.firma_profesor = FALSE THEN 'pendiente_firma'
                    ELSE ar.estado
                END as estado_calculado
            FROM actas_reunion ar
            INNER JOIN reuniones_calendario rc ON ar.reunion_id = rc.id
            INNER JOIN usuarios u_creador ON ar.creado_por = u_creador.rut
            WHERE ar.proyecto_id = ?
            ORDER BY ar.fecha_reunion DESC, ar.created_at DESC
        `, [proyectoId]);

        return rows;
    } catch (error) {
        console.error('Error al obtener actas por proyecto:', error);
        throw error;
    }
};

/**
 * Obtener actas por reunión
 * @param {number} reunionId 
 * @returns {Promise<Object|null>}
 */
export const obtenerActaPorReunion = async (reunionId) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                ar.*,
                p.titulo AS proyecto_titulo,
                u_creador.nombre AS creado_por_nombre
            FROM actas_reunion ar
            INNER JOIN proyectos p ON ar.proyecto_id = p.id
            INNER JOIN usuarios u_creador ON ar.creado_por = u_creador.rut
            WHERE ar.reunion_id = ?
        `, [reunionId]);

        if (rows.length === 0) return null;

        const acta = rows[0];
        try {
            acta.asistentes = JSON.parse(acta.asistentes);
        } catch (e) {}

        return acta;
    } catch (error) {
        console.error('Error al obtener acta por reunión:', error);
        throw error;
    }
};

/**
 * Actualizar acta de reunión
 * @param {number} actaId 
 * @param {Object} data 
 * @param {string} usuario_rut 
 * @returns {Promise<boolean>}
 */
export const actualizarActa = async (actaId, data, usuario_rut) => {
    try {
        // Verificar que el acta existe y el usuario tiene permisos
        const [acta] = await pool.execute(`
            SELECT ar.*, p.estudiante_rut, rc.profesor_rut
            FROM actas_reunion ar
            INNER JOIN proyectos p ON ar.proyecto_id = p.id
            INNER JOIN reuniones_calendario rc ON ar.reunion_id = rc.id
            WHERE ar.id = ?
        `, [actaId]);

        if (acta.length === 0) {
            throw new Error('Acta no encontrada');
        }

        const actaData = acta[0];

        // Solo el creador puede editar si está en borrador
        if (actaData.estado === 'borrador' && actaData.creado_por !== usuario_rut) {
            throw new Error('Solo el creador puede editar el acta en borrador');
        }

        // No se puede editar si ya está firmada
        if (actaData.estado === 'firmada') {
            throw new Error('No se puede editar un acta firmada');
        }

        const updateFields = [];
        const updateValues = [];

        const camposEditables = [
            'objetivo', 'temas_tratados', 'acuerdos', 'tareas_asignadas',
            'proximos_pasos', 'observaciones', 'lugar'
        ];

        camposEditables.forEach(campo => {
            if (data[campo] !== undefined) {
                updateFields.push(`${campo} = ?`);
                updateValues.push(data[campo]);
            }
        });

        if (data.asistentes) {
            updateFields.push('asistentes = ?');
            updateValues.push(typeof data.asistentes === 'string' ? data.asistentes : JSON.stringify(data.asistentes));
        }

        if (updateFields.length === 0) {
            return false;
        }

        updateValues.push(actaId);

        const [result] = await pool.execute(`
            UPDATE actas_reunion 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al actualizar acta:', error);
        throw error;
    }
};

/**
 * Firmar acta (estudiante o profesor)
 * @param {number} actaId 
 * @param {string} usuario_rut 
 * @param {string} tipo - 'estudiante' o 'profesor'
 * @returns {Promise<Object>}
 */
export const firmarActa = async (actaId, usuario_rut, tipo) => {
    try {
        const [acta] = await pool.execute(`
            SELECT ar.*, p.estudiante_rut, rc.profesor_rut
            FROM actas_reunion ar
            INNER JOIN proyectos p ON ar.proyecto_id = p.id
            INNER JOIN reuniones_calendario rc ON ar.reunion_id = rc.id
            WHERE ar.id = ?
        `, [actaId]);

        if (acta.length === 0) {
            throw new Error('Acta no encontrada');
        }

        const actaData = acta[0];

        // Validar que el usuario corresponde al tipo
        if (tipo === 'estudiante' && actaData.estudiante_rut !== usuario_rut) {
            throw new Error('No eres el estudiante de este proyecto');
        }

        if (tipo === 'profesor' && actaData.profesor_rut !== usuario_rut) {
            throw new Error('No eres el profesor de esta reunión');
        }

        // Verificar que el acta no esté ya firmada por este usuario
        const campoFirma = tipo === 'estudiante' ? 'firma_estudiante' : 'firma_profesor';
        if (actaData[campoFirma]) {
            throw new Error('Ya has firmado esta acta');
        }

        // Actualizar firma
        const campoFechaFirma = tipo === 'estudiante' ? 'fecha_firma_estudiante' : 'fecha_firma_profesor';
        
        await pool.execute(`
            UPDATE actas_reunion 
            SET ${campoFirma} = TRUE, 
                ${campoFechaFirma} = CURRENT_TIMESTAMP,
                estado = CASE 
                    WHEN firma_estudiante = TRUE AND firma_profesor = TRUE THEN 'firmada'
                    ELSE 'pendiente_firma'
                END
            WHERE id = ?
        `, [actaId]);

        // Verificar si ambos firmaron
        const [actaActualizada] = await pool.execute(`
            SELECT firma_estudiante, firma_profesor, estado
            FROM actas_reunion WHERE id = ?
        `, [actaId]);

        const ambasFirmas = actaActualizada[0].firma_estudiante && actaActualizada[0].firma_profesor;

        return {
            success: true,
            firmado_por: tipo,
            acta_completa: ambasFirmas,
            estado: actaActualizada[0].estado
        };
    } catch (error) {
        console.error('Error al firmar acta:', error);
        throw error;
    }
};

/**
 * Publicar acta (cambiar de borrador a pendiente_firma)
 * @param {number} actaId 
 * @param {string} usuario_rut 
 * @returns {Promise<boolean>}
 */
export const publicarActa = async (actaId, usuario_rut) => {
    try {
        const [acta] = await pool.execute(`
            SELECT * FROM actas_reunion WHERE id = ?
        `, [actaId]);

        if (acta.length === 0) {
            throw new Error('Acta no encontrada');
        }

        if (acta[0].creado_por !== usuario_rut) {
            throw new Error('Solo el creador puede publicar el acta');
        }

        if (acta[0].estado !== 'borrador') {
            throw new Error('Solo se pueden publicar actas en borrador');
        }

        const [result] = await pool.execute(`
            UPDATE actas_reunion 
            SET estado = 'pendiente_firma'
            WHERE id = ?
        `, [actaId]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al publicar acta:', error);
        throw error;
    }
};

/**
 * Archivar acta
 * @param {number} actaId 
 * @param {string} usuario_rut 
 * @returns {Promise<boolean>}
 */
export const archivarActa = async (actaId, usuario_rut) => {
    try {
        const [acta] = await pool.execute(`
            SELECT ar.*, p.estudiante_rut, rc.profesor_rut
            FROM actas_reunion ar
            INNER JOIN proyectos p ON ar.proyecto_id = p.id
            INNER JOIN reuniones_calendario rc ON ar.reunion_id = rc.id
            WHERE ar.id = ?
        `, [actaId]);

        if (acta.length === 0) {
            throw new Error('Acta no encontrada');
        }

        const actaData = acta[0];

        // Solo profesor o admin pueden archivar
        if (actaData.profesor_rut !== usuario_rut) {
            throw new Error('Solo el profesor puede archivar actas');
        }

        // Solo se pueden archivar actas firmadas
        if (actaData.estado !== 'firmada') {
            throw new Error('Solo se pueden archivar actas firmadas');
        }

        const [result] = await pool.execute(`
            UPDATE actas_reunion 
            SET estado = 'archivada'
            WHERE id = ?
        `, [actaId]);

        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al archivar acta:', error);
        throw error;
    }
};