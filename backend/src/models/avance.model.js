import { pool } from '../db/connectionDB.js';

// Crear un nuevo avance
export const crearAvance = async ({ proyecto_id, titulo, descripcion, archivo }) => {
    const [result] = await pool.execute(
        `INSERT INTO avances (proyecto_id, titulo, descripcion, archivo)
         VALUES (?, ?, ?, ?)`,
        [proyecto_id, titulo, descripcion, archivo]
    );
    
    // Actualizar última actividad del proyecto (control de abandono)
    await pool.execute(
        `UPDATE proyectos 
         SET ultima_actividad_fecha = CURDATE(), 
             alerta_inactividad_enviada = FALSE 
         WHERE id = ?`,
        [proyecto_id]
    );
    
    return result.insertId;
};

// Obtener todos los avances de un proyecto
export const obtenerAvancesPorProyecto = async (proyecto_id) => {
    const [rows] = await pool.execute(`
        SELECT a.*, 
               u.nombre AS nombre_revisor
        FROM avances a
        LEFT JOIN usuarios u ON a.profesor_revisor = u.rut
        WHERE a.proyecto_id = ?
        ORDER BY a.fecha_envio DESC
    `, [proyecto_id]);
    return rows;
};

// Obtener avance por ID
export const obtenerAvancePorId = async (avance_id) => {
    const [rows] = await pool.execute(`
        SELECT a.*, 
               u.nombre AS nombre_revisor,
               p.titulo AS titulo_proyecto
        FROM avances a
        LEFT JOIN usuarios u ON a.profesor_revisor = u.rut
        LEFT JOIN proyectos p ON a.proyecto_id = p.id
        WHERE a.id = ?
    `, [avance_id]);
    return rows[0];
};

// Revisar avance
export const revisarAvance = async (avance_id, { comentarios_profesor, estado, profesor_revisor }) => {
    const [result] = await pool.execute(
        `UPDATE avances SET comentarios_profesor = ?, estado = ?, profesor_revisor = ?, fecha_revision = NOW() WHERE id = ?`,
        [comentarios_profesor, estado, profesor_revisor, avance_id]
    );
    return result.affectedRows > 0;
};

// Actualizar avance
export const actualizarAvance = async (avance_id, { titulo, descripcion, archivo }) => {
    const [result] = await pool.execute(
        `UPDATE avances SET titulo = ?, descripcion = ?, archivo = ?, updated_at = NOW() WHERE id = ?`,
        [titulo, descripcion, archivo, avance_id]
    );
    return result.affectedRows > 0;
};

// Eliminar avance
export const eliminarAvance = async (avance_id) => {
    const [result] = await pool.execute(`DELETE FROM avances WHERE id = ?`, [avance_id]);
    return result.affectedRows > 0;
};

// Obtener avances por profesor revisor
export const obtenerAvancesPorProfesor = async (profesor_rut) => {
    const [rows] = await pool.execute(`
        SELECT a.*, 
               p.titulo AS titulo_proyecto,
               u.nombre AS nombre_estudiante
        FROM avances a
        INNER JOIN proyectos p ON a.proyecto_id = p.id
        INNER JOIN usuarios u ON p.estudiante_rut = u.rut
        WHERE a.profesor_revisor = ?
        ORDER BY a.fecha_envio DESC
    `, [profesor_rut]);
    return rows;
};

// Obtener estadísticas de avances
export const obtenerEstadisticasAvances = async (proyecto_id) => {
    const [rows] = await pool.execute(`
        SELECT 
            COUNT(*) as total_avances,
            SUM(CASE WHEN estado = 'enviado' THEN 1 ELSE 0 END) as enviados,
            SUM(CASE WHEN estado = 'en_revision' THEN 1 ELSE 0 END) as en_revision,
            SUM(CASE WHEN estado = 'con_comentarios' THEN 1 ELSE 0 END) as con_comentarios,
            SUM(CASE WHEN estado = 'aprobado' THEN 1 ELSE 0 END) as aprobados
        FROM avances
        WHERE proyecto_id = ?
    `, [proyecto_id]);
    return rows[0];
};

// ============= FUNCIONES PARA CRONOGRAMAS DE PROYECTO =============

// Crear cronograma para proyecto
export const crearCronograma = async ({ proyecto_id, nombre_cronograma, descripcion, fecha_inicio, fecha_fin_estimada, creado_por_rut, dias_alerta_previa }) => {
    try {
        // Desactivar cronogramas anteriores
        await pool.execute(
            `UPDATE cronogramas_proyecto SET activo = FALSE WHERE proyecto_id = ?`,
            [proyecto_id]
        );

        const [result] = await pool.execute(
            `INSERT INTO cronogramas_proyecto 
             (proyecto_id, nombre_cronograma, descripcion, fecha_inicio, fecha_fin_estimada, creado_por_rut, dias_alerta_previa)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [proyecto_id, nombre_cronograma, descripcion, fecha_inicio, fecha_fin_estimada, creado_por_rut, dias_alerta_previa || 3]
        );
        return result.insertId;
    } catch (error) {
        throw error;
    }
};

// Obtener cronograma activo de un proyecto
export const obtenerCronogramaActivo = async (proyecto_id) => {
    const [rows] = await pool.execute(`
        SELECT c.*, 
               u.nombre as creador_nombre,
               p.titulo as proyecto_titulo,
               est.nombre as estudiante_nombre
        FROM cronogramas_proyecto c
        INNER JOIN usuarios u ON c.creado_por_rut = u.rut
        INNER JOIN proyectos p ON c.proyecto_id = p.id
        INNER JOIN usuarios est ON p.estudiante_rut = est.rut
        WHERE c.proyecto_id = ? AND c.activo = TRUE
        ORDER BY c.created_at DESC
        LIMIT 1
    `, [proyecto_id]);
    return rows[0];
};

// Aprobar cronograma por estudiante
export const aprobarCronogramaPorEstudiante = async (cronograma_id) => {
    const [result] = await pool.execute(
        `UPDATE cronogramas_proyecto 
         SET aprobado_por_estudiante = TRUE, fecha_aprobacion_estudiante = NOW() 
         WHERE id = ?`,
        [cronograma_id]
    );
    return result.affectedRows > 0;
};

// ============= FUNCIONES PARA HITOS DEL CRONOGRAMA =============

// Crear hito en cronograma (SISTEMA UNIFICADO)
export const crearHitoCronograma = async ({ cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, peso_en_proyecto, es_critico, hito_predecesor_id, creado_por_rut }) => {
    const [result] = await pool.execute(
        `INSERT INTO hitos_cronograma 
         (cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite, 
          peso_en_proyecto, es_critico, hito_predecesor_id, creado_por_rut)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [cronograma_id, proyecto_id, nombre_hito, descripcion, tipo_hito, fecha_limite,
         peso_en_proyecto || 0, es_critico || false, hito_predecesor_id || null, creado_por_rut]
    );
    return result.insertId;
};

// Obtener hitos de un cronograma (CON NUEVOS CAMPOS)
export const obtenerHitosCronograma = async (cronograma_id) => {
    const [rows] = await pool.execute(`
        SELECT h.*,
               u.nombre as estudiante_nombre,
               CASE
                   WHEN h.fecha_limite < CURDATE() AND h.estado NOT IN ('entregado', 'revisado', 'aprobado')
                   THEN 'retrasado'
                   ELSE h.estado
               END as estado_real,
               CASE
                   WHEN h.fecha_limite < CURDATE() AND h.estado NOT IN ('entregado', 'revisado', 'aprobado')
                   THEN DATEDIFF(CURDATE(), h.fecha_limite)
                   ELSE 0
               END as dias_retraso_calculado
        FROM hitos_cronograma h
        LEFT JOIN cronogramas_proyecto c ON h.cronograma_id = c.id
        LEFT JOIN proyectos p ON c.proyecto_id = p.id
        LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
        WHERE h.cronograma_id = ?
        ORDER BY h.fecha_limite ASC
    `, [cronograma_id]);
    return rows;
};

// Entregar hito (subir archivo)
export const entregarHito = async (hito_id, { archivo_entrega, nombre_archivo_original, comentarios_estudiante }) => {
    try {
        const [hito] = await pool.execute(
            `SELECT fecha_limite FROM hitos_cronograma WHERE id = ?`,
            [hito_id]
        );

        if (!hito[0]) {
            throw new Error('Hito no encontrado');
        }

        const fechaLimite = new Date(hito[0].fecha_limite);
        const fechaEntrega = new Date();
        const cumplido = fechaEntrega <= fechaLimite;
        const diasRetraso = cumplido ? 0 : Math.ceil((fechaEntrega - fechaLimite) / (1000 * 60 * 60 * 24));

        const [result] = await pool.execute(
            `UPDATE hitos_cronograma 
             SET estado = 'entregado', 
                 fecha_entrega = NOW(),
                 archivo_entrega = ?,
                 nombre_archivo_original = ?,
                 comentarios_estudiante = ?,
                 cumplido_en_fecha = ?,
                 dias_retraso = ?,
                 porcentaje_avance = 100
             WHERE id = ?`,
            [archivo_entrega, nombre_archivo_original, comentarios_estudiante, cumplido, diasRetraso, hito_id]
        );

        // Actualizar última actividad del proyecto (control de abandono)
        const [cronograma] = await pool.execute(
            `SELECT proyecto_id FROM cronogramas_proyecto WHERE id = (
                SELECT cronograma_id FROM hitos_cronograma WHERE id = ?
            )`,
            [hito_id]
        );
        
        if (cronograma[0]) {
            await pool.execute(
                `UPDATE proyectos 
                 SET ultima_actividad_fecha = CURDATE(), 
                     alerta_inactividad_enviada = FALSE 
                 WHERE id = ?`,
                [cronograma[0].proyecto_id]
            );
        }

        return { 
            success: result.affectedRows > 0, 
            cumplido_en_fecha: cumplido, 
            dias_retraso: diasRetraso 
        };
    } catch (error) {
        throw error;
    }
};

// Revisar hito entregado (CON AUDITORÍA)
export const revisarHito = async (hito_id, { comentarios_profesor, calificacion, estado, actualizado_por_rut, archivo_retroalimentacion, nombre_archivo_retroalimentacion }) => {
    const setClauses = [
        'comentarios_profesor = ?',
        'calificacion = ?',
        'estado = ?',
        'actualizado_por_rut = ?',
        'updated_at = NOW()'
    ];
    const values = [comentarios_profesor, calificacion, estado, actualizado_por_rut];

    if (archivo_retroalimentacion !== undefined) {
        setClauses.push('archivo_retroalimentacion = ?');
        values.push(archivo_retroalimentacion);
    }
    if (nombre_archivo_retroalimentacion !== undefined) {
        setClauses.push('nombre_archivo_retroalimentacion = ?');
        values.push(nombre_archivo_retroalimentacion);
    }

    values.push(hito_id);

    const [result] = await pool.execute(
        `UPDATE hitos_cronograma SET ${setClauses.join(', ')} WHERE id = ?`,
        values
    );
    return result.affectedRows > 0;
};

// ============= FUNCIONES PARA NOTIFICACIONES =============

// Crear notificación
export const crearNotificacion = async ({ proyecto_id, hito_cronograma_id, tipo_notificacion, destinatario_rut, rol_destinatario, titulo, mensaje, enviar_email }) => {
    const [result] = await pool.execute(
        `INSERT INTO notificaciones_proyecto 
         (proyecto_id, hito_cronograma_id, tipo_notificacion, destinatario_rut, rol_destinatario, titulo, mensaje, enviar_email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [proyecto_id, hito_cronograma_id, tipo_notificacion, destinatario_rut, rol_destinatario, titulo, mensaje, enviar_email || true]
    );
    return result.insertId;
};

// Obtener notificaciones de un usuario
export const obtenerNotificacionesUsuario = async (usuario_rut, solo_no_leidas = false) => {
    let query = `
        SELECT n.*, 
               p.titulo as proyecto_titulo,
               h.nombre_hito,
               h.fecha_limite
        FROM notificaciones_proyecto n
        INNER JOIN proyectos p ON n.proyecto_id = p.id
        LEFT JOIN hitos_cronograma h ON n.hito_cronograma_id = h.id
        WHERE n.destinatario_rut = ? AND n.activa = TRUE
    `;

    if (solo_no_leidas) {
        query += ` AND n.leida = FALSE`;
    }

    query += ` ORDER BY n.created_at DESC`;

    const [rows] = await pool.execute(query, [usuario_rut]);
    return rows;
};

// Marcar notificación como leída
export const marcarNotificacionLeida = async (notificacion_id) => {
    const [result] = await pool.execute(
        `UPDATE notificaciones_proyecto 
         SET leida = TRUE, fecha_lectura = NOW() 
         WHERE id = ?`,
        [notificacion_id]
    );
    return result.affectedRows > 0;
};

// ============= FUNCIONES PARA ALERTAS AUTOMÁTICAS =============

// Configurar alertas para proyecto
export const configurarAlertas = async ({ proyecto_id, profesor_rut, dias_alerta_entregas, dias_alerta_reuniones, dias_alerta_defensas, alertas_entregas, alertas_reuniones, alertas_retrasos, enviar_email_estudiante, enviar_email_profesor }) => {
    const [result] = await pool.execute(
        `INSERT INTO configuracion_alertas
         (proyecto_id, profesor_rut, dias_alerta_entregas, dias_alerta_reuniones, dias_alerta_defensas,
          alertas_entregas, alertas_reuniones, alertas_retrasos,
          enviar_email_estudiante, enviar_email_profesor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         dias_alerta_entregas = VALUES(dias_alerta_entregas),
         dias_alerta_reuniones = VALUES(dias_alerta_reuniones),
         dias_alerta_defensas = VALUES(dias_alerta_defensas),
         alertas_entregas = VALUES(alertas_entregas),
         alertas_reuniones = VALUES(alertas_reuniones),
         alertas_retrasos = VALUES(alertas_retrasos),
         enviar_email_estudiante = VALUES(enviar_email_estudiante),
         enviar_email_profesor = VALUES(enviar_email_profesor),
         updated_at = NOW()`,
        [proyecto_id, profesor_rut, dias_alerta_entregas || 3, dias_alerta_reuniones || 1, dias_alerta_defensas || 7,
         alertas_entregas, alertas_reuniones, alertas_retrasos,
         enviar_email_estudiante, enviar_email_profesor]
    );
    return result.affectedRows > 0;
};

// Obtener hitos próximos a vencer (para alertas)
export const obtenerHitosProximosVencer = async (dias_anticipacion = 3) => {
    const [rows] = await pool.execute(`
        SELECT h.*, 
               c.alertas_activas,
               c.dias_alerta_previa,
               p.titulo as proyecto_titulo,
               p.estudiante_rut,
               est.nombre as estudiante_nombre,
               est.email as estudiante_email,
               prof.rut as profesor_guia_rut,
               prof.nombre as profesor_guia_nombre,
               prof.email as profesor_guia_email
        FROM hitos_cronograma h
        INNER JOIN cronogramas_proyecto c ON h.cronograma_id = c.id
        INNER JOIN proyectos p ON h.proyecto_id = p.id
        INNER JOIN usuarios est ON p.estudiante_rut = est.rut
        INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        INNER JOIN usuarios prof ON ap.profesor_rut = prof.rut
        WHERE c.activo = TRUE 
          AND c.alertas_activas = TRUE
          AND rp.nombre = 'profesor_guia'
          AND ap.activo = TRUE
          AND h.estado IN ('pendiente', 'en_progreso')
          AND h.fecha_limite BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
    `, [dias_anticipacion]);
    return rows;
};

// ============= FUNCIONES DE TRACKING Y ESTADÍSTICAS =============

// Obtener estadísticas de cumplimiento de cronograma
export const obtenerEstadisticasCumplimiento = async (proyecto_id) => {
    const [rows] = await pool.execute(`
        SELECT
            COUNT(*) as total_hitos,
            SUM(CASE WHEN estado IN ('entregado', 'revisado', 'aprobado') THEN 1 ELSE 0 END) as hitos_completados,
            SUM(CASE WHEN cumplido_en_fecha = TRUE THEN 1 ELSE 0 END) as hitos_a_tiempo,
            SUM(CASE WHEN estado = 'retrasado' OR dias_retraso > 0 THEN 1 ELSE 0 END) as hitos_retrasados,
            AVG(CASE WHEN calificacion IS NOT NULL THEN calificacion ELSE NULL END) as promedio_calificaciones,
            AVG(CASE WHEN dias_retraso IS NOT NULL THEN dias_retraso ELSE 0 END) as promedio_dias_retraso,
            AVG(porcentaje_avance) as avance_promedio
        FROM hitos_cronograma h
        INNER JOIN cronogramas_proyecto c ON h.cronograma_id = c.id
        WHERE c.proyecto_id = ? AND c.activo = TRUE
    `, [proyecto_id]);

    const estadisticas = rows[0];
    if (estadisticas.total_hitos > 0) {
        estadisticas.porcentaje_cumplimiento = (estadisticas.hitos_completados / estadisticas.total_hitos) * 100;
        estadisticas.porcentaje_puntualidad = estadisticas.hitos_a_tiempo > 0
            ? (estadisticas.hitos_a_tiempo / estadisticas.total_hitos) * 100
            : 0;
    } else {
        estadisticas.porcentaje_cumplimiento = 0;
        estadisticas.porcentaje_puntualidad = 0;
        estadisticas.avance_promedio = 0;
    }

    return estadisticas;
};

// ============= FUNCIONES DE VERIFICACIÓN DE PERMISOS =============

// Verificar si un profesor es guía de un proyecto
export const esProfesorGuia = async (proyecto_id, profesor_rut) => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM asignaciones_proyectos ap
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.proyecto_id = ?
          AND ap.profesor_rut = ?
          AND ap.activo = TRUE
          AND (rp.nombre LIKE '%guia%' OR rp.nombre LIKE '%guía%' OR rp.nombre LIKE '%Guía%' OR rp.nombre = 'profesor_guia')
    `, [proyecto_id, profesor_rut]);
    return rows[0].count > 0;
};

// Verificar si un estudiante pertenece al proyecto de un cronograma
export const esEstudianteDelCronograma = async (cronograma_id, estudiante_rut) => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM cronogramas_proyecto c
        INNER JOIN estudiantes_proyectos ep ON c.proyecto_id = ep.proyecto_id
        WHERE c.id = ? AND ep.estudiante_rut = ?
    `, [cronograma_id, estudiante_rut]);
    return rows[0].count > 0;
};

// Verificar si un profesor es guía del proyecto de un cronograma
export const esProfesorGuiaDelCronograma = async (cronograma_id, profesor_rut) => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM cronogramas_proyecto c
        INNER JOIN asignaciones_proyectos ap ON c.proyecto_id = ap.proyecto_id
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE c.id = ?
          AND ap.profesor_rut = ?
          AND ap.activo = TRUE
          AND (rp.nombre LIKE '%guia%' OR rp.nombre LIKE '%guía%' OR rp.nombre LIKE '%Guía%' OR rp.nombre = 'profesor_guia')
    `, [cronograma_id, profesor_rut]);
    return rows[0].count > 0;
};

// Verificar si un profesor (cualquier rol) está asignado al proyecto del cronograma
export const esProfesorAsignadoAlCronograma = async (cronograma_id, profesor_rut) => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM cronogramas_proyecto c
        INNER JOIN asignaciones_proyectos ap ON c.proyecto_id = ap.proyecto_id
        WHERE c.id = ?
          AND ap.profesor_rut = ?
          AND ap.activo = TRUE
    `, [cronograma_id, profesor_rut]);
    return rows[0].count > 0;
};

// Verificar si un usuario puede ver un cronograma
export const puedeVerCronograma = async (cronograma_id, usuario_rut, rol_usuario) => {
    // Admins y super admins pueden ver todo
    if (rol_usuario === 'admin' || rol_usuario === 'superadmin' || rol_usuario === 3 || rol_usuario === 4) {
        return true;
    }
    const [rows] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM cronogramas_proyecto c
        LEFT JOIN estudiantes_proyectos ep ON c.proyecto_id = ep.proyecto_id AND ep.estudiante_rut = ?
        LEFT JOIN asignaciones_proyectos ap ON c.proyecto_id = ap.proyecto_id AND ap.profesor_rut = ? AND ap.activo = TRUE
        WHERE c.id = ?
          AND (ep.estudiante_rut IS NOT NULL OR ap.profesor_rut IS NOT NULL)
    `, [usuario_rut, usuario_rut, cronograma_id]);
    return rows[0].count > 0;
};

// Verificar si un estudiante pertenece al proyecto de un hito
export const esEstudianteDelHito = async (hito_id, estudiante_rut) => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM hitos_cronograma h
        INNER JOIN cronogramas_proyecto c ON h.cronograma_id = c.id
        INNER JOIN estudiantes_proyectos ep ON c.proyecto_id = ep.proyecto_id
        WHERE h.id = ? AND ep.estudiante_rut = ?
    `, [hito_id, estudiante_rut]);
    return rows[0].count > 0;
};

// Verificar si un profesor es guía del proyecto de un hito
export const esProfesorGuiaDelHito = async (hito_id, profesor_rut) => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM hitos_cronograma h
        INNER JOIN cronogramas_proyecto c ON h.cronograma_id = c.id
        INNER JOIN asignaciones_proyectos ap ON c.proyecto_id = ap.proyecto_id
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE h.id = ?
          AND ap.profesor_rut = ?
          AND ap.activo = TRUE
          AND (rp.nombre LIKE '%guia%' OR rp.nombre LIKE '%guía%' OR rp.nombre LIKE '%Guía%' OR rp.nombre = 'profesor_guia')
    `, [hito_id, profesor_rut]);
    return rows[0].count > 0;
};

// Actualizar hito del cronograma
export const actualizarHitoCronograma = async (cronograma_id, hito_id, data) => {
    const allowedFields = ['nombre_hito', 'descripcion', 'tipo_hito', 'fecha_limite', 'peso_en_proyecto', 'es_critico', 'hito_predecesor_id'];
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
        if (allowedFields.includes(key) && value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    }

    if (fields.length === 0) throw new Error('No hay campos válidos para actualizar');

    let query = `UPDATE hitos_cronograma SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    values.push(hito_id);

    if (cronograma_id) {
        query += ` AND cronograma_id = ?`;
        values.push(cronograma_id);
    }

    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
};

// Eliminar hito del cronograma
export const eliminarHitoCronograma = async (cronograma_id, hito_id) => {
    const [result] = await pool.execute(
        `DELETE FROM hitos_cronograma WHERE id = ? AND cronograma_id = ?`,
        [hito_id, cronograma_id]
    );
    return result.affectedRows > 0;
};

// Obtener hito por ID (incluye proyecto_id desde el cronograma)
export const obtenerHitoPorId = async (hito_id) => {
    const [rows] = await pool.execute(`
        SELECT h.*, c.proyecto_id
        FROM hitos_cronograma h
        INNER JOIN cronogramas_proyecto c ON h.cronograma_id = c.id
        WHERE h.id = ?
    `, [hito_id]);
    return rows[0];
};

// Limpiar entrega de un hito (restablece al estado pendiente)
export const limpiarEntregaHito = async (hito_id) => {
    const [result] = await pool.execute(
        `UPDATE hitos_cronograma
         SET estado = 'pendiente', fecha_entrega = NULL, archivo_entrega = NULL,
             nombre_archivo_original = NULL, comentarios_estudiante = NULL,
             cumplido_en_fecha = NULL, dias_retraso = 0, porcentaje_avance = 0,
             updated_at = NOW()
         WHERE id = ?`,
        [hito_id]
    );
    return result.affectedRows > 0;
};

// Verificar si una notificación pertenece a un usuario
export const notificacionPerteneceAUsuario = async (notificacion_id, usuario_rut) => {
    const [rows] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM notificaciones_proyecto
        WHERE id = ? AND destinatario_rut = ?
    `, [notificacion_id, usuario_rut]);
    return rows[0].count > 0;
};