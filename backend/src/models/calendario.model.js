import { pool } from '../db/connectionDB.js';

// ============================================
// MODELO UNIFICADO DE FECHAS
// ============================================
// Usa la tabla 'fechas' que reemplaza a fechas_calendario y fechas_importantes

// ===== CREAR FECHAS =====

// Crear una fecha global (solo admin)
export const crearFechaGlobal = async ({ titulo, descripcion, fecha_inicio, hora_inicio, fecha, hora_limite, tipo_fecha, es_global, creado_por_rut }) => {
    
    
    // Determinar valores por defecto según el tipo de fecha
    const habilitada = fecha_inicio ? false : true; // Si tiene fecha_inicio, se habilita automáticamente al llegar a esa fecha
    const permite_extension = tipo_fecha === 'entrega_propuesta' ? true : true;
    const requiere_entrega = ['entrega', 'entrega_propuesta', 'entrega_avance', 'entrega_final'].includes(tipo_fecha);
    const horaLimite = hora_limite || '23:59:59';
    const horaInicio = hora_inicio || '00:00:00';
    
    const [result] = await pool.execute(
        `INSERT INTO fechas (
            titulo, descripcion, fecha_inicio, hora_inicio, fecha, hora_limite, tipo_fecha, es_global, 
            creado_por_rut, habilitada, permite_extension, requiere_entrega,
            activa
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [titulo, descripcion, fecha_inicio || null, horaInicio, fecha, horaLimite, tipo_fecha, es_global || false, creado_por_rut, habilitada, permite_extension, requiere_entrega]
    );
    
    
    return result.insertId;
};

// Crear fecha específica de profesor
export const crearFechaProfesor = async ({ titulo, descripcion, fecha, tipo_fecha, profesor_rut, estudiante_rut }) => {
    const [result] = await pool.execute(
        `INSERT INTO fechas (
            titulo, descripcion, fecha, tipo_fecha, 
            es_global, creado_por_rut, profesor_rut, estudiante_rut,
            activa, habilitada
        ) VALUES (?, ?, ?, ?, FALSE, ?, ?, ?, TRUE, TRUE)`,
        [titulo, descripcion, fecha, tipo_fecha, profesor_rut, profesor_rut, estudiante_rut]
    );
    return result.insertId;
};

// ===== OBTENER FECHAS =====

// Obtener todas las fechas globales
export const obtenerFechasGlobales = async () => {
    const [rows] = await pool.execute(`
        SELECT f.id,
               f.titulo,
               f.descripcion,
               DATE_FORMAT(f.fecha_inicio, '%Y-%m-%d') as fecha_inicio,
               f.hora_inicio,
               DATE_FORMAT(f.fecha, '%Y-%m-%d') as fecha,
               f.hora_limite,
               f.tipo_fecha,
               f.es_global,
               f.creado_por_rut,
               f.habilitada,
               f.permite_extension,
               f.requiere_entrega,
               f.activa,
               u.nombre AS nombre_creador
        FROM fechas f
        LEFT JOIN usuarios u ON f.creado_por_rut = u.rut
        WHERE f.es_global = TRUE 
        AND f.activa = TRUE
        ORDER BY f.fecha ASC
    `);
    return rows;
};

// Obtener fechas próximas (globales visibles para todos)
export const obtenerFechasProximas = async (limite = 10) => {
    const [rows] = await pool.execute(`
        SELECT f.id,
               f.titulo,
               f.descripcion,
               DATE_FORMAT(f.fecha, '%Y-%m-%d') as fecha,
               f.tipo_fecha,
               f.es_global,
               f.creado_por_rut,
               f.habilitada,
               f.permite_extension,
               f.requiere_entrega,
               f.activa,
               u.nombre AS nombre_creador,
               DATEDIFF(f.fecha, CURDATE()) AS dias_restantes
        FROM fechas f
        LEFT JOIN usuarios u ON f.creado_por_rut = u.rut
        WHERE f.es_global = TRUE 
        AND f.activa = TRUE
        AND f.fecha >= CURDATE()
        ORDER BY f.fecha ASC
        LIMIT ?
    `, [limite]);
    return rows;
};

// Obtener fecha por ID (busca en la tabla unificada)
export const obtenerFechaPorId = async (fecha_id) => {
    

    const [rows] = await pool.execute(`
        SELECT f.*, 
               u.nombre AS nombre_creador,
               ue.nombre AS nombre_estudiante,
               up.nombre AS nombre_profesor
        FROM fechas f
        LEFT JOIN usuarios u ON f.creado_por_rut = u.rut
        LEFT JOIN usuarios ue ON f.estudiante_rut = ue.rut
        LEFT JOIN usuarios up ON f.profesor_rut = up.rut
        WHERE f.id = ?
    `, [fecha_id]);
    
    if (rows.length > 0) {
        
    return rows[0];
    }
    
    
    return null;
};

// Obtener fechas de un proyecto específico
export const obtenerFechasProyecto = async (proyecto_id) => {
    const [rows] = await pool.execute(`
        SELECT f.*, 
               u.nombre AS nombre_creador
        FROM fechas f
        LEFT JOIN usuarios u ON f.creado_por_rut = u.rut
        WHERE f.proyecto_id = ?
        AND f.activa = TRUE
        ORDER BY f.fecha ASC
    `, [proyecto_id]);
    return rows;
};

// Obtener fechas específicas de un profesor
export const obtenerFechasProfesor = async (profesor_rut) => {
    const [rows] = await pool.execute(`
        SELECT f.*, 
               u.nombre AS nombre_creador,
               ue.nombre AS nombre_estudiante
        FROM fechas f
        LEFT JOIN usuarios u ON f.creado_por_rut = u.rut
        LEFT JOIN usuarios ue ON f.estudiante_rut = ue.rut
        WHERE (f.profesor_rut = ? OR f.creado_por_rut = ? OR f.es_global = TRUE)
        AND f.activa = TRUE
        ORDER BY f.fecha ASC
    `, [profesor_rut, profesor_rut]);
    return rows;
};

// Obtener fechas de un estudiante
export const obtenerFechasEstudiante = async (estudiante_rut) => {
    const [rows] = await pool.execute(`
        SELECT f.*, 
               u.nombre AS nombre_creador,
               up.nombre AS nombre_profesor
        FROM fechas f
        LEFT JOIN usuarios u ON f.creado_por_rut = u.rut
        LEFT JOIN usuarios up ON f.profesor_rut = up.rut
        WHERE (f.estudiante_rut = ? OR f.es_global = TRUE)
        AND f.activa = TRUE
        ORDER BY f.fecha ASC
    `, [estudiante_rut]);
        return rows;
};

// Alias para compatibilidad con controladores existentes
export const crearFechaEspecifica = crearFechaProfesor;
export const obtenerFechasPorProfesor = obtenerFechasProfesor;
export const obtenerFechasParaEstudiante = obtenerFechasEstudiante;

// Obtener estadísticas de fechas
export const obtenerEstadisticasFechas = async () => {
    const [rows] = await pool.execute(`
        SELECT 
            COUNT(*) as total_fechas,
            SUM(CASE WHEN es_global = TRUE THEN 1 ELSE 0 END) as fechas_globales,
            SUM(CASE WHEN es_global = FALSE THEN 1 ELSE 0 END) as fechas_especificas,
            SUM(CASE WHEN fecha >= CURDATE() AND activa = TRUE THEN 1 ELSE 0 END) as fechas_proximas,
            SUM(CASE WHEN fecha < CURDATE() AND activa = TRUE THEN 1 ELSE 0 END) as fechas_pasadas,
            SUM(CASE WHEN completada = TRUE THEN 1 ELSE 0 END) as fechas_completadas
        FROM fechas
        WHERE activa = TRUE
    `);
    return rows[0];
};

// ===== ACTUALIZAR FECHAS =====

export const actualizarFecha = async (fecha_id, { titulo, descripcion, fecha_inicio, hora_inicio, fecha, hora_limite, tipo_fecha, habilitada, es_global }) => {
    
    
    
    // Construir query dinámicamente según los campos disponibles
    let campos = [];
    let valores = [];
    
    if (titulo !== undefined) {
        campos.push('titulo = ?');
        valores.push(titulo);
    }
    if (descripcion !== undefined) {
        campos.push('descripcion = ?');
        valores.push(descripcion);
    }
    if (fecha_inicio !== undefined) {
        campos.push('fecha_inicio = ?');
        valores.push(fecha_inicio || null);
    }
    if (hora_inicio !== undefined) {
        campos.push('hora_inicio = ?');
        valores.push(hora_inicio || '00:00:00');
    }
    if (fecha !== undefined) {
        campos.push('fecha = ?');
        valores.push(fecha);
    }
    if (hora_limite !== undefined) {
        campos.push('hora_limite = ?');
        valores.push(hora_limite);
    }
    if (tipo_fecha !== undefined) {
        campos.push('tipo_fecha = ?');
        valores.push(tipo_fecha);
    }
    if (habilitada !== undefined) {
        campos.push('habilitada = ?');
        valores.push(habilitada);
    }
    if (es_global !== undefined) {
        campos.push('es_global = ?');
        valores.push(es_global);
    }
    
    if (campos.length === 0) {
        
        return false;
    }
    
    campos.push('updated_at = NOW()');
    valores.push(fecha_id);
    
    const [result] = await pool.execute(
        `UPDATE fechas SET ${campos.join(', ')} WHERE id = ?`,
        valores
    );
    
    const updated = result.affectedRows > 0;
    
    return updated;
};

// ===== ELIMINAR FECHAS =====

export const eliminarFecha = async (fecha_id) => {
    
    
    // Verificar que la fecha existe
    const fecha = await obtenerFechaPorId(fecha_id);
    
    if (!fecha) {
        
        return false;
    }
    
    
    
    // Eliminar directamente (hard delete)
    const [result] = await pool.execute(
        `DELETE FROM fechas WHERE id = ?`,
        [fecha_id]
    );
    
    const deleted = result.affectedRows > 0;
    
    
    return deleted;
};

// Soft delete (marcar como inactiva)
export const desactivarFecha = async (fecha_id) => {
    const [result] = await pool.execute(
        `UPDATE fechas SET activa = FALSE, updated_at = NOW() WHERE id = ?`,
        [fecha_id]
    );
    return result.affectedRows > 0;
};

// ===== VALIDACIONES Y PERMISOS =====

export const puedeEditarFecha = async (fecha_id, usuario_rut, rol_usuario) => {
    const fecha = await obtenerFechaPorId(fecha_id);
    if (!fecha) {
        
        return false;
    }
    
    
    
    
    
    
    
    // Admin (rol 'admin' o rol_id 3) puede editar cualquier fecha
    if (rol_usuario === 'admin' || rol_usuario === 3 || rol_usuario === '3') {
        
        return true;
    }
    
    // Super Admin (rol_id 4) puede editar cualquier fecha
    if (rol_usuario === 4 || rol_usuario === '4') {
        
        return true;
    }
    
    // Profesor solo puede editar sus propias fechas específicas
    if ((rol_usuario === 'profesor' || rol_usuario === 2 || rol_usuario === '2') && 
        !fecha.es_global && 
        fecha.creado_por_rut === usuario_rut) {
        
        return true;
    }
    
    
    return false;
};

// ===== FUNCIONES ESPECÍFICAS PARA FECHAS IMPORTANTES =====

// Obtener fechas importantes globales (para control de períodos)
export const obtenerFechasImportantesGlobales = async () => {
    const [rows] = await pool.execute(`
        SELECT f.*,
               u.nombre AS nombre_creador,
               DATEDIFF(f.fecha, CURDATE()) AS dias_restantes
        FROM fechas f
        LEFT JOIN usuarios u ON f.creado_por_rut = u.rut
        WHERE f.es_global = TRUE
        AND f.proyecto_id IS NULL
        AND f.activa = TRUE
        ORDER BY f.fecha ASC
    `);
    return rows;
};

// Obtener período de propuestas activo
export const obtenerPeriodoPropuestasActivo = async () => {
    const [rows] = await pool.execute(`
        SELECT f.*,
               DATEDIFF(f.fecha, CURDATE()) AS dias_restantes
        FROM fechas f
        WHERE f.tipo_fecha = 'entrega_propuesta'
        AND f.es_global = TRUE
        AND f.proyecto_id IS NULL
        AND f.habilitada = TRUE
        AND f.activa = TRUE
        AND f.fecha >= CURDATE()
        ORDER BY f.fecha ASC
        LIMIT 1
    `);
    return rows[0] || null;
};

// Habilitar/Deshabilitar período
export const cambiarEstadoPeriodo = async (fecha_id, habilitada) => {
    const [result] = await pool.execute(
        `UPDATE fechas SET habilitada = ?, updated_at = NOW() WHERE id = ?`,
        [habilitada, fecha_id]
    );
    return result.affectedRows > 0;
};

// Deshabilitar períodos vencidos automáticamente
export const deshabilitarPeriodosVencidos = async () => {
    const [result] = await pool.execute(`
        UPDATE fechas 
        SET habilitada = FALSE, updated_at = NOW()
        WHERE tipo_fecha = 'entrega_propuesta'
        AND es_global = TRUE
        AND habilitada = TRUE
        AND fecha < CURDATE()
    `);
    return result.affectedRows;
};

export default {
    crearFechaGlobal,
    crearFechaProfesor,
    crearFechaEspecifica,
    obtenerFechasGlobales,
    obtenerFechasProximas,
    obtenerFechaPorId,
    obtenerFechasProyecto,
    obtenerFechasProfesor,
    obtenerFechasPorProfesor,
    obtenerFechasEstudiante,
    obtenerFechasParaEstudiante,
    obtenerEstadisticasFechas,
    actualizarFecha,
    eliminarFecha,
    desactivarFecha,
    puedeEditarFecha,
    obtenerFechasImportantesGlobales,
    obtenerPeriodoPropuestasActivo,
    cambiarEstadoPeriodo,
    deshabilitarPeriodosVencidos
};
