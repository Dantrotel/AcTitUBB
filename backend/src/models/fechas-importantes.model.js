import { pool } from '../db/connectionDB.js';

// ===== GESTIÓN DE FECHAS IMPORTANTES DE PROYECTOS =====

/**
 * Crear una nueva fecha importante para un proyecto
 * @param {Object} fechaData - Datos de la fecha importante
 * @returns {Promise<number>} - ID de la fecha creada
 */
export const crearFechaImportante = async (fechaData) => {
    const { proyecto_id, tipo_fecha, titulo, descripcion, fecha_limite } = fechaData;
    
    const query = `
        INSERT INTO fechas_importantes (proyecto_id, tipo_fecha, titulo, descripcion, fecha_limite)
        VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
        proyecto_id,
        tipo_fecha,
        titulo,
        descripcion,
        fecha_limite
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
            fi.*,
            CASE 
                WHEN fi.fecha_limite < CURDATE() AND fi.completada = FALSE THEN 'vencida'
                WHEN fi.fecha_limite = CURDATE() AND fi.completada = FALSE THEN 'hoy'
                WHEN fi.fecha_limite > CURDATE() AND fi.completada = FALSE THEN 'pendiente'
                WHEN fi.completada = TRUE THEN 'completada'
            END as estado,
            DATEDIFF(fi.fecha_limite, CURDATE()) as dias_restantes
        FROM fechas_importantes fi
        WHERE fi.proyecto_id = ?
        ORDER BY fi.fecha_limite ASC
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id]);
    return rows;
};

/**
 * Obtener fechas próximas de un proyecto (próximos 30 días)
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - Lista de fechas próximas
 */
export const obtenerFechasProximasProyecto = async (proyecto_id) => {
    const query = `
        SELECT 
            fi.*,
            CASE 
                WHEN fi.fecha_limite < CURDATE() AND fi.completada = FALSE THEN 'vencida'
                WHEN fi.fecha_limite = CURDATE() AND fi.completada = FALSE THEN 'hoy'
                WHEN fi.fecha_limite > CURDATE() AND fi.completada = FALSE THEN 'pendiente'
                WHEN fi.completada = TRUE THEN 'completada'
            END as estado,
            DATEDIFF(fi.fecha_limite, CURDATE()) as dias_restantes
        FROM fechas_importantes fi
        WHERE fi.proyecto_id = ?
        AND fi.fecha_limite BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND fi.completada = FALSE
        ORDER BY fi.fecha_limite ASC
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id]);
    return rows;
};

/**
 * Marcar una fecha importante como completada
 * @param {number} fecha_id - ID de la fecha importante
 * @param {Date} fecha_realizada - Fecha en que se completó (opcional, por defecto hoy)
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
export const marcarFechaComoCompletada = async (fecha_id, fecha_realizada = null) => {
    const fechaRealizada = fecha_realizada || new Date();
    
    const query = `
        UPDATE fechas_importantes 
        SET completada = TRUE, fecha_realizada = ?
        WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [fechaRealizada, fecha_id]);
    return result.affectedRows > 0;
};

/**
 * Actualizar una fecha importante
 * @param {number} fecha_id - ID de la fecha importante
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
export const actualizarFechaImportante = async (fecha_id, updateData) => {
    const { titulo, descripcion, fecha_limite, tipo_fecha } = updateData;
    
    const query = `
        UPDATE fechas_importantes 
        SET titulo = ?, descripcion = ?, fecha_limite = ?, tipo_fecha = ?
        WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [titulo, descripcion, fecha_limite, tipo_fecha, fecha_id]);
    return result.affectedRows > 0;
};

/**
 * Eliminar una fecha importante
 * @param {number} fecha_id - ID de la fecha importante
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
export const eliminarFechaImportante = async (fecha_id) => {
    const query = `DELETE FROM fechas_importantes WHERE id = ?`;
    const [result] = await pool.execute(query, [fecha_id]);
    return result.affectedRows > 0;
};

/**
 * Obtener una fecha importante por ID
 * @param {number} fecha_id - ID de la fecha importante
 * @returns {Promise<Object|null>} - Datos de la fecha o null si no existe
 */
export const obtenerFechaImportantePorId = async (fecha_id) => {
    const query = `
        SELECT 
            fi.*,
            p.titulo as titulo_proyecto,
            p.estudiante_rut,
            u.nombre as nombre_estudiante
        FROM fechas_importantes fi
        INNER JOIN proyectos p ON fi.proyecto_id = p.id
        INNER JOIN usuarios u ON p.estudiante_rut = u.rut
        WHERE fi.id = ?
    `;
    
    const [rows] = await pool.execute(query, [fecha_id]);
    return rows[0] || null;
};

/**
 * Crear fechas importantes por defecto para un nuevo proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - IDs de las fechas creadas
 */
export const crearFechasPorDefectoProyecto = async (proyecto_id) => {
    const fechasDefecto = [
        {
            tipo_fecha: 'entrega_avance',
            titulo: 'Entrega Primer Avance',
            descripcion: 'Primera entrega de avance del proyecto',
            dias_desde_inicio: 30
        },
        {
            tipo_fecha: 'entrega_avance',
            titulo: 'Entrega Segundo Avance',
            descripcion: 'Segunda entrega de avance del proyecto',
            dias_desde_inicio: 60
        },
        {
            tipo_fecha: 'entrega_final',
            titulo: 'Entrega Final',
            descripcion: 'Entrega final del proyecto de título',
            dias_desde_inicio: 120
        },
        {
            tipo_fecha: 'defensa',
            titulo: 'Defensa de Título',
            descripcion: 'Presentación y defensa del proyecto de título',
            dias_desde_inicio: 130
        }
    ];
    
    const idsCreados = [];
    
    for (const fecha of fechasDefecto) {
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + fecha.dias_desde_inicio);
        
        const fechaId = await crearFechaImportante({
            proyecto_id,
            tipo_fecha: fecha.tipo_fecha,
            titulo: fecha.titulo,
            descripcion: fecha.descripcion,
            fecha_limite: fechaLimite.toISOString().split('T')[0]
        });
        
        idsCreados.push(fechaId);
    }
    
    return idsCreados;
};