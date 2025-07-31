import { pool } from '../db/connectionDB.js';

// Crear una nueva fecha importante
export const crearFechaImportante = async ({ proyecto_id, tipo_fecha, titulo, descripcion, fecha_limite }) => {
    const [result] = await pool.execute(
        `INSERT INTO fechas_importantes (proyecto_id, tipo_fecha, titulo, descripcion, fecha_limite)
         VALUES (?, ?, ?, ?, ?)`,
        [proyecto_id, tipo_fecha, titulo, descripcion, fecha_limite]
    );
    return result.insertId;
};

// Obtener todas las fechas importantes de un proyecto
export const obtenerFechasPorProyecto = async (proyecto_id) => {
    const [rows] = await pool.execute(`
        SELECT *
        FROM fechas_importantes
        WHERE proyecto_id = ?
        ORDER BY fecha_limite ASC
    `, [proyecto_id]);
    return rows;
};

// Obtener fecha importante por ID
export const obtenerFechaPorId = async (fecha_id) => {
    const [rows] = await pool.execute(`
        SELECT fi.*, p.titulo AS titulo_proyecto
        FROM fechas_importantes fi
        LEFT JOIN proyectos p ON fi.proyecto_id = p.id
        WHERE fi.id = ?
    `, [fecha_id]);
    return rows[0];
};

// Actualizar fecha importante
export const actualizarFechaImportante = async (fecha_id, { titulo, descripcion, fecha_limite, fecha_realizada, completada }) => {
    const [result] = await pool.execute(
        `UPDATE fechas_importantes 
         SET titulo = ?, descripcion = ?, fecha_limite = ?, fecha_realizada = ?, completada = ?, updated_at = NOW() 
         WHERE id = ?`,
        [titulo, descripcion, fecha_limite, fecha_realizada, completada, fecha_id]
    );
    return result.affectedRows > 0;
};

// Marcar fecha como completada
export const marcarFechaCompletada = async (fecha_id, fecha_realizada) => {
    const [result] = await pool.execute(
        `UPDATE fechas_importantes 
         SET completada = TRUE, fecha_realizada = ?, updated_at = NOW() 
         WHERE id = ?`,
        [fecha_realizada, fecha_id]
    );
    return result.affectedRows > 0;
};

// Eliminar fecha importante
export const eliminarFechaImportante = async (fecha_id) => {
    const [result] = await pool.execute(`DELETE FROM fechas_importantes WHERE id = ?`, [fecha_id]);
    return result.affectedRows > 0;
};

// Obtener fechas próximas (próximos 30 días)
export const obtenerFechasProximas = async (proyecto_id) => {
    const [rows] = await pool.execute(`
        SELECT *
        FROM fechas_importantes
        WHERE proyecto_id = ? 
        AND fecha_limite >= CURDATE() 
        AND fecha_limite <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND completada = FALSE
        ORDER BY fecha_limite ASC
    `, [proyecto_id]);
    return rows;
};

// Obtener fechas vencidas
export const obtenerFechasVencidas = async (proyecto_id) => {
    const [rows] = await pool.execute(`
        SELECT *
        FROM fechas_importantes
        WHERE proyecto_id = ? 
        AND fecha_limite < CURDATE()
        AND completada = FALSE
        ORDER BY fecha_limite DESC
    `, [proyecto_id]);
    return rows;
};

// Obtener fechas por tipo
export const obtenerFechasPorTipo = async (proyecto_id, tipo_fecha) => {
    const [rows] = await pool.execute(`
        SELECT *
        FROM fechas_importantes
        WHERE proyecto_id = ? AND tipo_fecha = ?
        ORDER BY fecha_limite ASC
    `, [proyecto_id, tipo_fecha]);
    return rows;
};

// Crear fechas por defecto para un proyecto
export const crearFechasPorDefecto = async (proyecto_id) => {
    const fechasDefault = [
        {
            tipo_fecha: 'entrega_avance',
            titulo: 'Primer Avance',
            descripcion: 'Entrega del primer avance del proyecto',
            fecha_limite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días desde hoy
        },
        {
            tipo_fecha: 'entrega_avance',
            titulo: 'Segundo Avance',
            descripcion: 'Entrega del segundo avance del proyecto',
            fecha_limite: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 días desde hoy
        },
        {
            tipo_fecha: 'entrega_final',
            titulo: 'Entrega Final',
            descripcion: 'Entrega final del proyecto',
            fecha_limite: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 días desde hoy
        },
        {
            tipo_fecha: 'defensa',
            titulo: 'Defensa del Proyecto',
            descripcion: 'Presentación y defensa del proyecto',
            fecha_limite: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000) // 95 días desde hoy
        }
    ];

    for (const fecha of fechasDefault) {
        await crearFechaImportante({
            proyecto_id,
            ...fecha
        });
    }
}; 