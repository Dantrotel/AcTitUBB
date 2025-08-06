import { pool } from '../db/connectionDB.js';

// ===== FECHAS GLOBALES (ADMIN) =====

// Crear una fecha global (solo admin)
export const crearFechaGlobal = async ({ titulo, descripcion, fecha, tipo_fecha, creado_por_rut }) => {
    const [result] = await pool.execute(
        `INSERT INTO fechas_calendario (titulo, descripcion, fecha, tipo_fecha, es_global, creado_por_rut)
         VALUES (?, ?, ?, ?, TRUE, ?)`,
        [titulo, descripcion, fecha, tipo_fecha, creado_por_rut]
    );
    return result.insertId;
};

// Obtener todas las fechas globales
export const obtenerFechasGlobales = async () => {
    const [rows] = await pool.execute(`
        SELECT fc.*, 
               u.nombre AS nombre_creador
        FROM fechas_calendario fc
        LEFT JOIN usuarios u ON fc.creado_por_rut = u.rut
        WHERE fc.es_global = TRUE 
        AND fc.activa = TRUE
        ORDER BY fc.fecha ASC
    `);
    return rows;
};

// ===== FECHAS ESPECÍFICAS (PROFESOR) =====

// Crear una fecha específica para un estudiante (profesor)
export const crearFechaEspecifica = async ({ titulo, descripcion, fecha, tipo_fecha, profesor_rut, estudiante_rut }) => {
    const [result] = await pool.execute(
        `INSERT INTO fechas_calendario (titulo, descripcion, fecha, tipo_fecha, es_global, creado_por_rut, profesor_rut, estudiante_rut)
         VALUES (?, ?, ?, ?, FALSE, ?, ?, ?)`,
        [titulo, descripcion, fecha, tipo_fecha, profesor_rut, profesor_rut, estudiante_rut]
    );
    return result.insertId;
};

// Obtener fechas creadas por un profesor específico
export const obtenerFechasPorProfesor = async (profesor_rut) => {
    const [rows] = await pool.execute(`
        SELECT fc.*, 
               ue.nombre AS nombre_estudiante,
               ue.email AS email_estudiante
        FROM fechas_calendario fc
        LEFT JOIN usuarios ue ON fc.estudiante_rut = ue.rut
        WHERE fc.profesor_rut = ? 
        AND fc.activa = TRUE
        ORDER BY fc.fecha ASC
    `, [profesor_rut]);
    return rows;
};

// ===== FECHAS PARA ESTUDIANTES =====

// Obtener todas las fechas visibles para un estudiante específico
export const obtenerFechasParaEstudiante = async (estudiante_rut) => {
    // Obtener el profesor asignado al estudiante
    const [asignacionRows] = await pool.execute(`
        SELECT DISTINCT ap.profesor_rut
        FROM asignaciones_propuestas ap
        INNER JOIN propuestas p ON ap.propuesta_id = p.id
        WHERE p.estudiante_rut = ?
        AND ap.fecha_asignacion = (
            SELECT MAX(ap2.fecha_asignacion)
            FROM asignaciones_propuestas ap2
            INNER JOIN propuestas p2 ON ap2.propuesta_id = p2.id
            WHERE p2.estudiante_rut = ?
        )
        LIMIT 1
    `, [estudiante_rut, estudiante_rut]);
    
    const profesor_rut = asignacionRows.length > 0 ? asignacionRows[0].profesor_rut : null;
    
    // Consulta principal: fechas globales + fechas específicas del profesor asignado
    const query = `
        SELECT fc.*, 
               u.nombre AS nombre_creador,
               CASE 
                   WHEN fc.es_global = TRUE THEN 'Admin'
                   ELSE 'Profesor'
               END AS tipo_creador
        FROM fechas_calendario fc
        LEFT JOIN usuarios u ON fc.creado_por_rut = u.rut
        WHERE fc.activa = TRUE
        AND (
            fc.es_global = TRUE 
            OR (fc.profesor_rut = ? AND fc.estudiante_rut = ?)
        )
        ORDER BY fc.fecha ASC
    `;
    
    const [rows] = await pool.execute(query, [profesor_rut, estudiante_rut]);
    return rows;
};

// ===== OPERACIONES GENERALES =====

// Obtener fecha por ID
export const obtenerFechaPorId = async (fecha_id) => {
    const [rows] = await pool.execute(`
        SELECT fc.*, 
               u.nombre AS nombre_creador,
               ue.nombre AS nombre_estudiante,
               up.nombre AS nombre_profesor
        FROM fechas_calendario fc
        LEFT JOIN usuarios u ON fc.creado_por_rut = u.rut
        LEFT JOIN usuarios ue ON fc.estudiante_rut = ue.rut
        LEFT JOIN usuarios up ON fc.profesor_rut = up.rut
        WHERE fc.id = ?
    `, [fecha_id]);
    return rows[0];
};

// Actualizar fecha
export const actualizarFecha = async (fecha_id, { titulo, descripcion, fecha, tipo_fecha }) => {
    const [result] = await pool.execute(
        `UPDATE fechas_calendario 
         SET titulo = ?, descripcion = ?, fecha = ?, tipo_fecha = ?, updated_at = NOW() 
         WHERE id = ?`,
        [titulo, descripcion, fecha, tipo_fecha, fecha_id]
    );
    return result.affectedRows > 0;
};

// Eliminar fecha (marcar como inactiva)
export const eliminarFecha = async (fecha_id) => {
    const [result] = await pool.execute(
        `UPDATE fechas_calendario SET activa = FALSE WHERE id = ?`,
        [fecha_id]
    );
    return result.affectedRows > 0;
};

// Obtener fechas próximas - Fechas globales del administrador visibles para todos
export const obtenerFechasProximas = async (estudiante_rut, limite = 5) => {
    console.log('🔍 Debug obtenerFechasProximas - INICIO:');
    console.log('  - estudiante_rut:', estudiante_rut, '(tipo:', typeof estudiante_rut, ')');
    console.log('  - limite:', limite, '(tipo:', typeof limite, ')');
    
    // Validar parámetros de entrada
    if (!estudiante_rut) {
        console.error('❌ Error: estudiante_rut es requerido');
        return [];
    }
    
    // Convertir límite a número y validar
    limite = parseInt(limite);
    if (isNaN(limite) || limite <= 0) {
        console.warn('⚠️  Warning: limite inválido, usando valor por defecto');
        limite = 5;
    }
    
    try {
        // Query para obtener TODAS las fechas globales del administrador
        // Las fechas globales son visibles para todos los usuarios
        const query = `
            SELECT 
                id, titulo, descripcion, fecha, tipo_fecha, es_global,
                creado_por_rut,
                'Admin' AS nombre_creador,
                'Admin' AS tipo_creador,
                DATEDIFF(fecha, CURDATE()) AS dias_restantes
            FROM fechas_calendario 
            WHERE es_global = 1
            AND activa = 1
            AND fecha >= CURDATE()
            ORDER BY fecha ASC 
            LIMIT ?`;
        
        console.log('  - Ejecutando query para fechas globales del admin con limite:', limite);
        
        const [rows] = await pool.execute(query, [limite]);
        console.log('✅ Fechas globales obtenidas:', rows.length);
        
        if (rows.length > 0) {
            console.log('  - Fechas encontradas:', rows.map(r => ({ titulo: r.titulo, fecha: r.fecha })));
        } else {
            console.log('ℹ️  No hay fechas globales del administrador');
        }
        
        return rows;
        
    } catch (error) {
        console.error('❌ Error obteniendo fechas globales:', error.message);
        console.warn('  - Devolviendo array vacío como fallback');
        return [];
    }
};

// Obtener estadísticas de fechas para admin
export const obtenerEstadisticasFechas = async () => {
    const [rows] = await pool.execute(`
        SELECT 
            COUNT(*) as total_fechas,
            SUM(CASE WHEN es_global = TRUE THEN 1 ELSE 0 END) as fechas_globales,
            SUM(CASE WHEN es_global = FALSE THEN 1 ELSE 0 END) as fechas_especificas,
            SUM(CASE WHEN fecha >= CURDATE() THEN 1 ELSE 0 END) as fechas_futuras,
            SUM(CASE WHEN fecha < CURDATE() THEN 1 ELSE 0 END) as fechas_pasadas
        FROM fechas_calendario
        WHERE activa = TRUE
    `);
    return rows[0];
};

// Verificar si un usuario puede editar una fecha
export const puedeEditarFecha = async (fecha_id, usuario_rut, rol_usuario) => {
    const fecha = await obtenerFechaPorId(fecha_id);
    if (!fecha) return false;
    
    // Admin puede editar cualquier fecha
    if (rol_usuario === 'admin') return true;
    
    // Profesor solo puede editar sus propias fechas específicas
    if (rol_usuario === 'profesor' && !fecha.es_global && fecha.creado_por_rut === usuario_rut) {
        return true;
    }
    
    return false;
};