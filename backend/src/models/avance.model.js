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
               hp.nombre_hito as hito_predecesor_nombre,
               uc.nombre as creado_por_nombre,
               ua.nombre as actualizado_por_nombre,
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
        LEFT JOIN hitos_cronograma hp ON h.hito_predecesor_id = hp.id
        LEFT JOIN usuarios uc ON h.creado_por_rut = uc.rut
        LEFT JOIN usuarios ua ON h.actualizado_por_rut = ua.rut
        WHERE h.cronograma_id = ?
        ORDER BY h.fecha_limite ASC, h.peso_en_proyecto DESC
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
export const revisarHito = async (hito_id, { comentarios_profesor, calificacion, estado, actualizado_por_rut }) => {
    const [result] = await pool.execute(
        `UPDATE hitos_cronograma 
         SET comentarios_profesor = ?, 
             calificacion = ?, 
             estado = ?,
             actualizado_por_rut = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [comentarios_profesor, calificacion, estado, actualizado_por_rut, hito_id]
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
export const configurarAlertas = async ({ proyecto_id, profesor_rut, dias_alerta_entregas, dias_alerta_reuniones, dias_alerta_defensas, alertas_entregas, alertas_reuniones, alertas_retrasos, alertas_evaluaciones, enviar_email_estudiante, enviar_email_profesor }) => {
    const [result] = await pool.execute(
        `INSERT INTO configuracion_alertas 
         (proyecto_id, profesor_rut, dias_alerta_entregas, dias_alerta_reuniones, dias_alerta_defensas, 
          alertas_entregas, alertas_reuniones, alertas_retrasos, alertas_evaluaciones, 
          enviar_email_estudiante, enviar_email_profesor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         dias_alerta_entregas = VALUES(dias_alerta_entregas),
         dias_alerta_reuniones = VALUES(dias_alerta_reuniones),
         dias_alerta_defensas = VALUES(dias_alerta_defensas),
         alertas_entregas = VALUES(alertas_entregas),
         alertas_reuniones = VALUES(alertas_reuniones),
         alertas_retrasos = VALUES(alertas_retrasos),
         alertas_evaluaciones = VALUES(alertas_evaluaciones),
         enviar_email_estudiante = VALUES(enviar_email_estudiante),
         enviar_email_profesor = VALUES(enviar_email_profesor),
         updated_at = NOW()`,
        [proyecto_id, profesor_rut, dias_alerta_entregas || 3, dias_alerta_reuniones || 1, dias_alerta_defensas || 7,
         alertas_entregas, alertas_reuniones, alertas_retrasos, alertas_evaluaciones,
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