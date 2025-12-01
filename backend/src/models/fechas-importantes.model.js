import { pool } from '../db/connectionDB.js';

// ===== GESTIÓN DE FECHAS IMPORTANTES DE PROYECTOS =====
// Ahora usa la tabla unificada 'fechas'

/**
 * Crear una nueva fecha importante para un proyecto
 * @param {Object} fechaData - Datos de la fecha importante
 * @returns {Promise<number>} - ID de la fecha creada
 */
export const crearFechaImportante = async (fechaData) => {
    const { proyecto_id, tipo_fecha, titulo, descripcion, fecha_limite, creado_por, habilitada, permite_extension, requiere_entrega } = fechaData;
    
    const query = `
        INSERT INTO fechas (
            proyecto_id, tipo_fecha, titulo, descripcion, fecha, 
            creado_por_rut, habilitada, permite_extension, requiere_entrega,
            es_global, activa
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, TRUE)
    `;
    
    const [result] = await pool.execute(query, [
        proyecto_id,
        tipo_fecha,
        titulo,
        descripcion,
        fecha_limite,
        creado_por || null,
        habilitada !== undefined ? habilitada : true,
        permite_extension !== undefined ? permite_extension : true,
        requiere_entrega !== undefined ? requiere_entrega : false
    ]);
    
    return result.insertId;
};

/**
 * Obtener todas las fechas importantes de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - Lista de fechas importantes
 */
export const obtenerFechasImportantesPorProyecto = async (proyecto_id) => {
    const query = `
        SELECT 
            f.*,
            CASE 
                WHEN f.fecha < CURDATE() AND f.completada = FALSE THEN 'vencida'
                WHEN f.fecha = CURDATE() AND f.completada = FALSE THEN 'hoy'
                WHEN f.fecha > CURDATE() AND f.completada = FALSE THEN 'pendiente'
                WHEN f.completada = TRUE THEN 'completada'
            END as estado,
            DATEDIFF(f.fecha, CURDATE()) as dias_restantes
        FROM fechas f
        WHERE f.proyecto_id = ?
        AND f.activa = TRUE
        ORDER BY f.fecha ASC
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id]);
    return rows;
};

/**
 * Obtener una fecha importante específica por ID
 * @param {number} fecha_id - ID de la fecha
 * @returns {Promise<Object>} - Datos de la fecha
 */
export const obtenerFechaImportantePorId = async (fecha_id) => {
    const query = `
        SELECT f.*
        FROM fechas f
        WHERE f.id = ?
    `;
    
    const [rows] = await pool.execute(query, [fecha_id]);
    return rows[0];
};

/**
 * Actualizar una fecha importante
 * @param {number} fecha_id - ID de la fecha
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
export const actualizarFechaImportante = async (fecha_id, updateData) => {
    const { titulo, descripcion, fecha_limite, tipo_fecha, habilitada, permite_extension, requiere_entrega } = updateData;
    
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
    if (fecha_limite !== undefined) {
        campos.push('fecha = ?');
        valores.push(fecha_limite);
    }
    if (tipo_fecha !== undefined) {
        campos.push('tipo_fecha = ?');
        valores.push(tipo_fecha);
    }
    if (habilitada !== undefined) {
        campos.push('habilitada = ?');
        valores.push(habilitada);
    }
    if (permite_extension !== undefined) {
        campos.push('permite_extension = ?');
        valores.push(permite_extension);
    }
    if (requiere_entrega !== undefined) {
        campos.push('requiere_entrega = ?');
        valores.push(requiere_entrega);
    }
    
    if (campos.length === 0) {
        return false;
    }
    
    campos.push('updated_at = NOW()');
    valores.push(fecha_id);
    
    const query = `UPDATE fechas SET ${campos.join(', ')} WHERE id = ?`;
    
    const [result] = await pool.execute(query, valores);
    return result.affectedRows > 0;
};

/**
 * Eliminar una fecha importante
 * @param {number} fecha_id - ID de la fecha
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export const eliminarFechaImportante = async (fecha_id) => {
    const query = `DELETE FROM fechas WHERE id = ?`;
    const [result] = await pool.execute(query, [fecha_id]);
    return result.affectedRows > 0;
};

/**
 * Marcar una fecha importante como completada
 * @param {number} fecha_id - ID de la fecha
 * @param {string} fecha_realizada - Fecha en que se completó (opcional)
 * @param {string} notas - Notas adicionales (opcional)
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
export const marcarFechaComoCompletada = async (fecha_id, fecha_realizada = null, notas = null) => {
    const query = `
        UPDATE fechas 
        SET completada = TRUE, 
            fecha_realizada = COALESCE(?, CURDATE()), 
            notas = ?,
            updated_at = NOW()
        WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [fecha_realizada, notas, fecha_id]);
    return result.affectedRows > 0;
};

/**
 * Obtener fechas próximas a vencer de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {number} dias - Número de días hacia adelante para buscar
 * @returns {Promise<Array>} - Lista de fechas próximas
 */
export const obtenerFechasProximasAVencer = async (proyecto_id, dias = 7) => {
    const query = `
        SELECT 
            f.*,
            DATEDIFF(f.fecha, CURDATE()) as dias_restantes
        FROM fechas f
        WHERE f.proyecto_id = ?
        AND f.completada = FALSE
        AND f.activa = TRUE
        AND f.fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
        ORDER BY f.fecha ASC
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id, dias]);
    return rows;
};

/**
 * Obtener fechas vencidas de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - Lista de fechas vencidas
 */
export const obtenerFechasVencidas = async (proyecto_id) => {
    const query = `
        SELECT 
            f.*,
            DATEDIFF(CURDATE(), f.fecha) as dias_vencidos
        FROM fechas f
        WHERE f.proyecto_id = ?
        AND f.completada = FALSE
        AND f.activa = TRUE
        AND f.fecha < CURDATE()
        ORDER BY f.fecha ASC
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id]);
    return rows;
};

/**
 * Obtener estadísticas de fechas de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Object>} - Estadísticas de fechas
 */
export const obtenerEstadisticasFechas = async (proyecto_id) => {
    const query = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN completada = TRUE THEN 1 ELSE 0 END) as completadas,
            SUM(CASE WHEN fecha < CURDATE() AND completada = FALSE THEN 1 ELSE 0 END) as vencidas,
            SUM(CASE WHEN fecha >= CURDATE() AND completada = FALSE THEN 1 ELSE 0 END) as pendientes
        FROM fechas
        WHERE proyecto_id = ?
        AND activa = TRUE
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id]);
    return rows[0];
};

/**
 * Obtener fechas importantes globales (para períodos de propuestas, etc.)
 * @returns {Promise<Array>} - Lista de fechas globales
 */
export const obtenerFechasImportantesGlobales = async () => {
    const query = `
        SELECT 
            f.*,
            DATEDIFF(f.fecha, CURDATE()) as dias_restantes
        FROM fechas f
        WHERE f.es_global = TRUE
        AND f.proyecto_id IS NULL
        AND f.activa = TRUE
        ORDER BY f.fecha ASC
    `;
    
    const [rows] = await pool.execute(query);
    return rows;
};

/**
 * Verificar si una fecha permite extensión
 * @param {number} fecha_id - ID de la fecha
 * @returns {Promise<boolean>} - true si permite extensión
 */
export const permiteExtension = async (fecha_id) => {
    const query = `
        SELECT permite_extension
        FROM fechas
        WHERE id = ?
    `;
    
    const [rows] = await pool.execute(query, [fecha_id]);
    return rows[0]?.permite_extension || false;
};

export default {
    crearFechaImportante,
    obtenerFechasImportantesPorProyecto,
    obtenerFechaImportantePorId,
    actualizarFechaImportante,
    eliminarFechaImportante,
    marcarFechaComoCompletada,
    obtenerFechasProximasAVencer,
    obtenerFechasVencidas,
    obtenerEstadisticasFechas,
    obtenerFechasImportantesGlobales,
    permiteExtension
};
