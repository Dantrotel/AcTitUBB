import { pool } from '../db/connectionDB.js';

// Crear un nuevo proyecto desde una propuesta aprobada
const createProject = async ({ titulo, descripcion, propuesta_id, estudiante_rut, fecha_inicio, fecha_entrega_estimada, objetivo_general, objetivos_especificos, metodologia, modalidad, complejidad, duracion_semestres }) => {
    const query = `
        INSERT INTO proyectos (
            titulo, descripcion, propuesta_id, estudiante_rut, fecha_inicio, fecha_entrega_estimada,
            objetivo_general, objetivos_especificos, metodologia, modalidad, complejidad, duracion_semestres
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
        titulo, descripcion, propuesta_id, estudiante_rut, fecha_inicio, fecha_entrega_estimada,
        objetivo_general, objetivos_especificos, metodologia, modalidad, complejidad, duracion_semestres
    ]);
    
    // Actualizar la propuesta con el proyecto_id
    await pool.execute(
        `UPDATE propuestas SET proyecto_id = ? WHERE id = ?`,
        [result.insertId, propuesta_id]
    );

    return result.insertId;
};

// Obtener todos los proyectos
const getProjects = async () => {
    const query = `
        SELECT p.*, 
               u.nombre AS nombre_estudiante,
               prop.titulo AS titulo_propuesta,
               ep.nombre AS estado_proyecto,
               GROUP_CONCAT(DISTINCT rp.nombre) AS roles_profesores
        FROM proyectos p
        LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
        LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
        LEFT JOIN estados_proyectos ep ON p.estado_id = ep.id
        LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
        LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE p.activo = TRUE
        GROUP BY p.id
        ORDER BY p.fecha_inicio DESC
    `;
    const [rows] = await pool.execute(query);
    return rows;
};

// Obtener proyecto por ID
const getProjectById = async (projectId) => {
    const query = `
        SELECT p.*, 
               u.nombre AS nombre_estudiante,
               prop.titulo AS titulo_propuesta,
               prop.descripcion AS descripcion_propuesta
        FROM proyectos p
        LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
        LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
        WHERE p.id = ?
    `;
    const [rows] = await pool.execute(query, [projectId]);
    return rows[0];
};

// Obtener proyectos por estudiante (usa tabla estudiantes_proyectos)
const getProjectsByStudent = async (estudiante_rut) => {
    const query = `
        SELECT p.*, 
               prop.titulo AS titulo_propuesta,
               GROUP_CONCAT(DISTINCT rp.nombre) AS roles_profesores,
               (SELECT GROUP_CONCAT(CONCAT(u2.nombre, ' (', u2.rut, ')') ORDER BY est_p.orden SEPARATOR ', ')
                FROM estudiantes_proyectos est_p
                INNER JOIN usuarios u2 ON est_p.estudiante_rut = u2.rut
                WHERE est_p.proyecto_id = p.id) as estudiantes_completo
        FROM proyectos p
        INNER JOIN estudiantes_proyectos ep_join ON p.id = ep_join.proyecto_id
        LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
        LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
        LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ep_join.estudiante_rut = ?
        GROUP BY p.id
        ORDER BY p.fecha_inicio DESC
    `;
    const [rows] = await pool.execute(query, [estudiante_rut]);
    return rows;
};

// Obtener proyectos por profesor
const getProjectsByProfessor = async (profesor_rut) => {
    const query = `
        SELECT p.*, 
               u.nombre AS nombre_estudiante,
               prop.titulo AS titulo_propuesta,
               rp.nombre AS rol_profesor
        FROM proyectos p
        INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
        LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
        LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
        LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.profesor_rut = ? AND ap.activo = TRUE
        ORDER BY p.fecha_inicio DESC
    `;
    const [rows] = await pool.execute(query, [profesor_rut]);
    return rows;
};

// Actualizar proyecto
const updateProject = async (projectId, { titulo, descripcion, estado_id, fecha_entrega_estimada, fecha_defensa, estado_detallado, porcentaje_avance, prioridad, riesgo_nivel, observaciones_profesor, observaciones_estudiante }) => {
    const query = `
        UPDATE proyectos 
        SET titulo = ?, descripcion = ?, estado_id = ?, fecha_entrega_estimada = ?, fecha_defensa = ?, 
            estado_detallado = ?, porcentaje_avance = ?, prioridad = ?, riesgo_nivel = ?,
            observaciones_profesor = ?, observaciones_estudiante = ?, updated_at = NOW()
        WHERE id = ?
    `;
    const [result] = await pool.execute(query, [
        titulo, descripcion, estado_id, fecha_entrega_estimada, fecha_defensa,
        estado_detallado, porcentaje_avance, prioridad, riesgo_nivel,
        observaciones_profesor, observaciones_estudiante, projectId
    ]);
    return result.affectedRows > 0;
};

// Asignar profesor a proyecto
const assignProfessorToProject = async (projectId, profesor_rut, rol_profesor_id) => {
    const query = `
        INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id)
        VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(query, [projectId, profesor_rut, rol_profesor_id]);
    return result.affectedRows > 0;
};

// Obtener profesores asignados a un proyecto
const getProjectProfessors = async (projectId) => {
    const query = `
        SELECT u.rut, u.nombre, u.email, rp.nombre AS rol_profesor, ap.fecha_asignacion
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.proyecto_id = ? AND ap.activo = TRUE
        ORDER BY rp.nombre
    `;
    const [rows] = await pool.execute(query, [projectId]);
    return rows;
};

// Desasignar profesor de proyecto
const unassignProfessorFromProject = async (projectId, profesor_rut, rol_profesor_id) => {
    const query = `
        UPDATE asignaciones_proyectos 
        SET activo = FALSE 
        WHERE proyecto_id = ? AND profesor_rut = ? AND rol_profesor_id = ?
    `;
    const [result] = await pool.execute(query, [projectId, profesor_rut, rol_profesor_id]);
    return result.affectedRows > 0;
};

// Eliminar proyecto
const deleteProject = async (projectId) => {
    const query = `DELETE FROM proyectos WHERE id = ?`;
    await pool.execute(query, [projectId]);
};

// Obtener estadísticas de proyectos
const getProjectStats = async () => {
    const query = `
        SELECT 
            COUNT(*) as total_proyectos,
            SUM(CASE WHEN estado = 'en_desarrollo' THEN 1 ELSE 0 END) as en_desarrollo,
            SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
            SUM(CASE WHEN estado = 'defendido' THEN 1 ELSE 0 END) as defendidos
        FROM proyectos
    `;
    const [rows] = await pool.execute(query);
    return rows[0];
};

// Crear proyecto completo desde propuesta aprobada
const crearProyectoCompleto = async (proyectoData) => {
    const { titulo, descripcion, propuesta_id, estudiante_rut, estado_id, fecha_inicio, fecha_entrega_estimada, fecha_entrega_real, fecha_defensa } = proyectoData;
    
    const query = `
        INSERT INTO proyectos (titulo, descripcion, propuesta_id, estudiante_rut, estado_id, fecha_inicio, fecha_entrega_estimada, fecha_entrega_real, fecha_defensa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
        titulo, 
        descripcion, 
        propuesta_id, 
        estudiante_rut, 
        estado_id, 
        fecha_inicio, 
        fecha_entrega_estimada, 
        fecha_entrega_real, 
        fecha_defensa
    ]);
    
    return result.insertId;
};

// Obtener profesores asignados a una propuesta
const obtenerProfesoresAsignadosPropuesta = async (propuesta_id) => {
    const query = `
        SELECT ap.profesor_rut, u.nombre, u.email
        FROM asignaciones_propuestas ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        WHERE ap.propuesta_id = ?
    `;
    const [rows] = await pool.execute(query, [propuesta_id]);
    return rows;
};

// Verificar si un usuario puede ver un proyecto específico (actualizado para múltiples estudiantes)
const puedeVerProyecto = async (proyecto_id, usuario_rut, rol_usuario) => {
    // Los administradores y super administradores pueden ver todos los proyectos
    if (rol_usuario === 'admin' || rol_usuario === 3 || rol_usuario === 4) {
        return true;
    }

    const query = `
        SELECT 
            p.id
        FROM proyectos p
        LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id AND ap.activo = TRUE
        LEFT JOIN estudiantes_proyectos ep ON p.id = ep.proyecto_id
        WHERE p.id = ?
        AND (
            ep.estudiante_rut = ?  -- Es uno de los estudiantes del proyecto
            OR ap.profesor_rut = ? -- Es un profesor asignado al proyecto
        )
        LIMIT 1
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id, usuario_rut, usuario_rut]);
    return rows.length > 0;
};

// Obtener proyectos filtrados por permisos de usuario
const obtenerProyectosPorPermisos = async (usuario_rut, rol_usuario) => {
    try {
        let query;
        let params;

        if (rol_usuario === 'admin' || rol_usuario === 3 || rol_usuario === 4) {
            // Los administradores y super administradores ven todos los proyectos - consulta simplificada
            query = `
                SELECT p.*, 
                       u.nombre AS nombre_estudiante,
                       u.email AS email_estudiante,
                       prop.titulo AS titulo_propuesta
                FROM proyectos p
                LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
                LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
                ORDER BY p.fecha_inicio DESC
            `;
            params = [];
        } else if (rol_usuario === 'estudiante' || rol_usuario === 1) {
            // Los estudiantes ven proyectos donde son creadores o miembros del equipo
            query = `
                SELECT p.*, 
                       u.nombre AS nombre_estudiante,
                       u.email AS email_estudiante,
                       prop.titulo AS titulo_propuesta
                FROM proyectos p
                LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
                LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
                INNER JOIN estudiantes_proyectos ep_join ON p.id = ep_join.proyecto_id
                WHERE ep_join.estudiante_rut = ?
                GROUP BY p.id
                ORDER BY p.fecha_inicio DESC
            `;
            params = [usuario_rut];
        } else if (rol_usuario === 'profesor' || rol_usuario === 2) {
            // Los profesores ven proyectos donde están asignados - consulta simplificada
            query = `
                SELECT DISTINCT p.*, 
                       u.nombre AS nombre_estudiante,
                       u.email AS email_estudiante,
                       prop.titulo AS titulo_propuesta
                FROM proyectos p
                LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
                LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
                INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id 
                WHERE ap.profesor_rut = ? AND ap.activo = TRUE
                ORDER BY p.fecha_inicio DESC
            `;
            params = [usuario_rut];
        } else {
            // Rol no reconocido, sin acceso
            return [];
        }

        console.log('🔍 Ejecutando consulta SQL:', query);
        console.log('🔍 Parámetros:', params);

        const [rows] = await pool.execute(query, params);
        
        console.log('✅ Consulta exitosa, filas obtenidas:', rows.length);
        
        return rows;
    } catch (error) {
        console.error('❌ Error en obtenerProyectosPorPermisos:', error);
        throw error;
    }
};

// Obtener detalles de proyecto con verificación de permisos
const obtenerProyectoPorIdConPermisos = async (proyecto_id, usuario_rut, rol_usuario) => {
    // Verificar primero si tiene permisos
    const tienePermiso = await puedeVerProyecto(proyecto_id, usuario_rut, rol_usuario);
    if (!tienePermiso) {
        return null;
    }

    const query = `
        SELECT p.*, 
               u.nombre AS nombre_estudiante,
               u.email AS email_estudiante,
               u.rut AS estudiante_rut,
               prop.titulo AS titulo_propuesta,
               prop.descripcion AS descripcion_propuesta,
               prop.fecha_envio AS fecha_envio_propuesta,
               ep.nombre AS estado_proyecto,
               ep.descripcion AS descripcion_estado
        FROM proyectos p
        LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
        LEFT JOIN propuestas prop ON p.propuesta_id = prop.id
        LEFT JOIN estados_proyectos ep ON p.estado_id = ep.id
        WHERE p.id = ?
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id]);
    
    if (rows.length === 0) {
        return null;
    }

    const proyecto = rows[0];

    // Obtener estudiantes del proyecto
    const queryEstudiantes = `
        SELECT ep.estudiante_rut AS rut,
               u.nombre,
               u.email,
               ep.es_creador,
               ep.orden
        FROM estudiantes_proyectos ep
        INNER JOIN usuarios u ON ep.estudiante_rut = u.rut
        WHERE ep.proyecto_id = ?
        ORDER BY ep.orden ASC
    `;
    
    const [estudiantes] = await pool.execute(queryEstudiantes, [proyecto_id]);
    proyecto.estudiantes = estudiantes;

    // Obtener profesores asignados al proyecto
    const queryProfesores = `
        SELECT ap.profesor_rut,
               u.nombre AS nombre_profesor,
               u.email AS email_profesor,
               rp.nombre AS rol_profesor,
               rp.descripcion AS descripcion_rol,
               ap.fecha_asignacion
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.proyecto_id = ? AND ap.activo = TRUE
        ORDER BY rp.nombre
    `;
    
    const [profesores] = await pool.execute(queryProfesores, [proyecto_id]);
    
    proyecto.profesores_asignados = profesores;
    
    return proyecto;
};

// ========== GESTIÓN DE HITOS ==========

// Crear hito de proyecto
const crearHitoProyecto = async (hitoData) => {
    const { proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, peso_en_proyecto, es_critico, hito_predecesor_id, creado_por_rut } = hitoData;
    
    const query = `
        INSERT INTO hitos_proyecto (
            proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo, 
            peso_en_proyecto, es_critico, hito_predecesor_id, creado_por_rut
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [
        proyecto_id, nombre, descripcion, tipo_hito, fecha_objetivo,
        peso_en_proyecto, es_critico, hito_predecesor_id, creado_por_rut
    ]);
    
    return result.insertId;
};

// Obtener hitos de un proyecto
const obtenerHitosProyecto = async (proyecto_id) => {
    const query = `
        SELECT h.*, 
               hp.nombre AS hito_predecesor_nombre,
               uc.nombre AS creado_por_nombre,
               ua.nombre AS actualizado_por_nombre
        FROM hitos_proyecto h
        LEFT JOIN hitos_proyecto hp ON h.hito_predecesor_id = hp.id
        LEFT JOIN usuarios uc ON h.creado_por_rut = uc.rut
        LEFT JOIN usuarios ua ON h.actualizado_por_rut = ua.rut
        WHERE h.proyecto_id = ?
        ORDER BY h.fecha_objetivo ASC, h.tipo_hito ASC
    `;
    
    const [rows] = await pool.execute(query, [proyecto_id]);
    return rows;
};

// Actualizar hito de proyecto
const actualizarHitoProyecto = async (hito_id, hitoData, actualizado_por_rut) => {
    const { nombre, descripcion, fecha_objetivo, estado, porcentaje_completado, fecha_completado, comentarios_estudiante, comentarios_profesor, calificacion } = hitoData;
    
    const query = `
        UPDATE hitos_proyecto 
        SET nombre = ?, descripcion = ?, fecha_objetivo = ?, estado = ?, 
            porcentaje_completado = ?, fecha_completado = ?, 
            comentarios_estudiante = ?, comentarios_profesor = ?, calificacion = ?,
            actualizado_por_rut = ?, updated_at = NOW()
        WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [
        nombre, descripcion, fecha_objetivo, estado, 
        porcentaje_completado, fecha_completado,
        comentarios_estudiante, comentarios_profesor, calificacion,
        actualizado_por_rut, hito_id
    ]);
    
    return result.affectedRows > 0;
};

// Completar hito
const completarHito = async (hito_id, datos_completado, actualizado_por_rut) => {
    const { archivo_entregable, comentarios_estudiante } = datos_completado;
    
    const query = `
        UPDATE hitos_proyecto 
        SET estado = 'completado', 
            porcentaje_completado = 100, 
            fecha_completado = CURDATE(),
            archivo_entregable = ?,
            comentarios_estudiante = ?,
            actualizado_por_rut = ?,
            updated_at = NOW()
        WHERE id = ?
    `;
    
    const [result] = await pool.execute(query, [
        archivo_entregable, comentarios_estudiante, actualizado_por_rut, hito_id
    ]);
    
    return result.affectedRows > 0;
};

// Obtener estadísticas de hitos de un proyecto
const obtenerEstadisticasHitos = async (proyecto_id) => {
    const query = `
        SELECT 
            COUNT(*) as total_hitos,
            SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
            SUM(CASE WHEN estado = 'en_progreso' THEN 1 ELSE 0 END) as en_progreso,
            SUM(CASE WHEN estado = 'retrasado' THEN 1 ELSE 0 END) as retrasados,
            AVG(porcentaje_completado) as avance_promedio,
            SUM(CASE WHEN es_critico = TRUE THEN 1 ELSE 0 END) as criticos
        FROM hitos_proyecto
        WHERE proyecto_id = ?
    `;
    
    try {
        const [rows] = await pool.execute(query, [proyecto_id]);
        return rows[0] || {
            total_hitos: 0,
            completados: 0,
            en_progreso: 0,
            retrasados: 0,
            avance_promedio: 0,
            criticos: 0
        };
    } catch (error) {
        console.error('Error al obtener estadísticas de hitos:', error);
        // Retornar valores por defecto si hay error
        return {
            total_hitos: 0,
            completados: 0,
            en_progreso: 0,
            retrasados: 0,
            avance_promedio: 0,
            criticos: 0
        };
    }
};



// Actualizar progreso del proyecto basado en hitos
const actualizarProgresoProyecto = async (proyecto_id) => {
    // Calcular el progreso basado en los hitos completados
    const queryProgreso = `
        UPDATE proyectos p
        SET porcentaje_avance = (
            SELECT COALESCE(
                SUM(CASE WHEN h.estado = 'completado' THEN h.peso_en_proyecto ELSE 0 END), 0
            )
            FROM hitos_proyecto h
            WHERE h.proyecto_id = p.id
        ),
        ultimo_avance_fecha = (
            SELECT MAX(h.fecha_completado)
            FROM hitos_proyecto h
            WHERE h.proyecto_id = p.id AND h.estado = 'completado'
        ),
        proximo_hito_fecha = (
            SELECT MIN(h.fecha_objetivo)
            FROM hitos_proyecto h
            WHERE h.proyecto_id = p.id AND h.estado IN ('pendiente', 'en_progreso')
        ),
        ultima_actividad = NOW()
        WHERE p.id = ?
    `;
    
    const [result] = await pool.execute(queryProgreso, [proyecto_id]);
    return result.affectedRows > 0;
};

// Obtener dashboard completo del proyecto
const obtenerDashboardProyecto = async (proyecto_id) => {
    try {
        // Información básica del proyecto
        const proyecto = await obtenerProyectoPorIdConPermisos(proyecto_id, null, 'admin');
        if (!proyecto) return null;
        
        // Estadísticas de hitos
        const estadisticasHitos = await obtenerEstadisticasHitos(proyecto_id);
    
        // Hitos recientes
        let hitosRecientes = [];
        try {
            const [hitosRows] = await pool.execute(`
                SELECT * FROM hitos_proyecto 
                WHERE proyecto_id = ? 
                ORDER BY updated_at DESC 
                LIMIT 5
            `, [proyecto_id]);
            hitosRecientes = hitosRows;
        } catch (error) {
            console.warn('Error al obtener hitos recientes:', error.message);
        }
        
        // Evaluaciones recientes
        let evaluacionesRecientes = [];
        try {
            const [evalRows] = await pool.execute(`
                SELECT e.*, u.nombre AS evaluador_nombre
                FROM evaluaciones_proyecto e
                LEFT JOIN usuarios u ON e.profesor_evaluador_rut = u.rut
                WHERE e.proyecto_id = ? 
                ORDER BY e.fecha_evaluacion DESC 
                LIMIT 3
            `, [proyecto_id]);
            evaluacionesRecientes = evalRows;
        } catch (error) {
            console.warn('Error al obtener evaluaciones recientes:', error.message);
        }
        
        // Próximos hitos
        let proximosHitos = [];
        try {
            const [proximosRows] = await pool.execute(`
                SELECT * FROM hitos_proyecto 
                WHERE proyecto_id = ? AND estado IN ('pendiente', 'en_progreso')
                AND fecha_objetivo >= CURDATE()
                ORDER BY fecha_objetivo ASC 
                LIMIT 5
            `, [proyecto_id]);
            proximosHitos = proximosRows;
        } catch (error) {
            console.warn('Error al obtener próximos hitos:', error.message);
        }
    
        return {
            proyecto,
            estadisticas_hitos: estadisticasHitos,
            hitos_recientes: hitosRecientes,
            evaluaciones_recientes: evaluacionesRecientes,
            proximos_hitos: proximosHitos
        };
    } catch (error) {
        console.error('Error al obtener dashboard del proyecto:', error);
        throw error;
    }
};

export const ProjectModel = {
    createProject,
    getProjects,
    getProjectById,
    getProjectsByStudent,
    getProjectsByProfessor,
    updateProject,
    assignProfessorToProject,
    getProjectProfessors,
    unassignProfessorFromProject,
    deleteProject,
    getProjectStats,
    crearProyectoCompleto,
    obtenerProfesoresAsignadosPropuesta,
    puedeVerProyecto,
    obtenerProyectosPorPermisos,
    obtenerProyectoPorIdConPermisos,
    
    // Gestión de hitos
    crearHitoProyecto,
    obtenerHitosProyecto,
    actualizarHitoProyecto,
    completarHito,
    obtenerEstadisticasHitos,
    
    // Gestión de progreso
    actualizarProgresoProyecto,
    obtenerDashboardProyecto
};

// ============= FUNCIONES PARA FLUJO AUTOMÁTICO PROPUESTA → PROYECTO =============

/**
 * Actualizar el estado de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {number} estado_id - ID del nuevo estado
 * @returns {Promise<boolean>} - True si se actualizó correctamente
 */
const actualizarEstadoProyecto = async (proyecto_id, estado_id) => {
    try {
        const [result] = await pool.execute(
            `UPDATE proyectos SET estado_id = ?, updated_at = NOW() WHERE id = ?`,
            [estado_id, proyecto_id]
        );
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al actualizar estado del proyecto:', error);
        throw error;
    }
};

/**
 * Obtener profesores asignados a un proyecto con sus roles
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - Lista de profesores con sus roles
 */
const obtenerProfesoresProyecto = async (proyecto_id) => {
    try {
        const [rows] = await pool.execute(`
            SELECT 
                ap.profesor_rut,
                ap.rol_profesor_id,
                u.nombre as nombre_profesor,
                rp.nombre as nombre_rol
            FROM asignaciones_proyectos ap
            JOIN usuarios u ON ap.profesor_rut = u.rut
            JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            WHERE ap.proyecto_id = ?
        `, [proyecto_id]);
        return rows;
    } catch (error) {
        console.error('Error al obtener profesores del proyecto:', error);
        throw error;
    }
};

/**
 * Obtener carga administrativa de todos los profesores
 * Cuenta proyectos activos por rol (Guía, Informante, Revisor, etc.)
 * @returns {Promise<Array>} - Lista de profesores con su carga por rol
 */
const obtenerCargaProfesores = async (carrera_id = null) => {
    try {
        let query = `
            SELECT 
                u.rut,
                u.nombre,
                u.email,
                -- Conteo por rol específico
                SUM(CASE WHEN rp.nombre = 'Profesor Guía' THEN 1 ELSE 0 END) as proyectos_guia,
                SUM(CASE WHEN rp.nombre = 'Profesor Informante' THEN 1 ELSE 0 END) as proyectos_informante,
                SUM(CASE WHEN rp.nombre = 'Profesor Revisor' THEN 1 ELSE 0 END) as proyectos_revisor,
                SUM(CASE WHEN rp.nombre = 'Profesor Co-Guía' THEN 1 ELSE 0 END) as proyectos_coguia,
                SUM(CASE WHEN rp.nombre = 'Profesor de Sala' THEN 1 ELSE 0 END) as proyectos_sala,
                SUM(CASE WHEN rp.nombre = 'Profesor Corrector' THEN 1 ELSE 0 END) as proyectos_corrector,
                COUNT(ap.id) as total_proyectos
            FROM usuarios u
            LEFT JOIN asignaciones_proyectos ap ON u.rut = ap.profesor_rut AND ap.activo = TRUE
            LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            LEFT JOIN proyectos p ON ap.proyecto_id = p.id AND p.activo = TRUE
        `;
        
        const params = [];
        
        // Filtrar por profesores del departamento de la carrera si se especifica carrera_id
        if (carrera_id) {
            query += `
            INNER JOIN profesores_departamentos pd ON u.rut = pd.profesor_rut AND pd.fecha_salida IS NULL
            INNER JOIN departamentos d ON pd.departamento_id = d.id
            INNER JOIN carreras c ON d.facultad_id = c.facultad_id
            WHERE u.rol_id = 2 AND c.id = ?  -- Solo profesores del departamento de la carrera
            `;
            params.push(carrera_id);
        } else {
            query += ` WHERE u.rol_id = 2  -- Solo profesores `;
        }
        
        query += `
            GROUP BY u.rut, u.nombre, u.email
            ORDER BY total_proyectos DESC, u.nombre ASC
        `;
        
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error al obtener carga de profesores:', error);
        throw error;
    }
};

/**
 * Obtener estadísticas generales de carga administrativa
 * @param {number|null} carrera_id - ID de la carrera para filtrar (null para todas)
 * @returns {Promise<Object>} - Estadísticas globales o por carrera
 */
const obtenerEstadisticasCarga = async (carrera_id = null) => {
    try {
        let query = `
            SELECT 
                COUNT(DISTINCT u.rut) as total_profesores,
                COUNT(DISTINCT ap.proyecto_id) as total_proyectos_activos,
                AVG(proyectos_por_profesor.total) as promedio_proyectos_profesor,
                MAX(proyectos_por_profesor.total) as max_proyectos_profesor,
                MIN(proyectos_por_profesor.total) as min_proyectos_profesor
            FROM usuarios u
            LEFT JOIN (
                SELECT profesor_rut, COUNT(*) as total
                FROM asignaciones_proyectos
                WHERE activo = TRUE
                GROUP BY profesor_rut
            ) as proyectos_por_profesor ON u.rut = proyectos_por_profesor.profesor_rut
            LEFT JOIN asignaciones_proyectos ap ON u.rut = ap.profesor_rut AND ap.activo = TRUE
        `;
        
        const params = [];
        
        if (carrera_id) {
            query += `
            INNER JOIN profesores_departamentos pd ON u.rut = pd.profesor_rut AND pd.fecha_salida IS NULL
            INNER JOIN departamentos d ON pd.departamento_id = d.id
            INNER JOIN carreras c ON d.facultad_id = c.facultad_id
            WHERE u.rol_id = 2 AND c.id = ?
            `;
            params.push(carrera_id);
        } else {
            query += ` WHERE u.rol_id = 2 `;
        }
        
        const [rows] = await pool.execute(query, params);
        return rows[0];
    } catch (error) {
        console.error('Error al obtener estadísticas de carga:', error);
        throw error;
    }
};

// ============= FUNCIONES PARA MONITOREO REGULATORIO =============

/**
 * Obtener proyectos en riesgo de abandono según reglamento
 * Utiliza la vista vista_proyectos_riesgo_abandono
 * @returns {Promise<Array>} - Lista de proyectos en riesgo
 */
const obtenerProyectosRiesgoAbandono = async () => {
    try {
        const [rows] = await pool.execute(`
            SELECT * FROM vista_proyectos_riesgo_abandono
            ORDER BY dias_sin_actividad DESC
        `);
        return rows;
    } catch (error) {
        console.error('Error al obtener proyectos en riesgo:', error);
        throw error;
    }
};

/**
 * Obtener entregas finales pendientes de revisión por Informante
 * Utiliza la vista vista_informante_pendientes
 * @returns {Promise<Array>} - Lista de entregas pendientes
 */
const obtenerInformantesPendientes = async () => {
    try {
        const [rows] = await pool.execute(`
            SELECT * FROM vista_informante_pendientes
            ORDER BY dias_restantes ASC
        `);
        return rows;
    } catch (error) {
        console.error('Error al obtener informantes pendientes:', error);
        throw error;
    }
};

/**
 * Actualizar fecha de última actividad de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<boolean>}
 */
const actualizarUltimaActividad = async (proyecto_id) => {
    try {
        const [result] = await pool.execute(`
            UPDATE proyectos 
            SET ultima_actividad_fecha = CURDATE(),
                alerta_inactividad_enviada = FALSE,
                updated_at = NOW()
            WHERE id = ?
        `, [proyecto_id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al actualizar última actividad:', error);
        throw error;
    }
};

/**
 * Registrar entrega de Informe Final
 * @param {number} hito_id - ID del hito de entrega final
 * @param {string} fecha_entrega - Fecha de entrega
 * @returns {Promise<boolean>}
 */
const registrarEntregaInformeFinal = async (hito_id, fecha_entrega) => {
    try {
        const [result] = await pool.execute(`
            UPDATE hitos_proyecto 
            SET fecha_entrega_estudiante = ?,
                informante_notificado = FALSE,
                updated_at = NOW()
            WHERE id = ? AND tipo_hito = 'entrega_final'
        `, [fecha_entrega, hito_id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al registrar entrega de informe final:', error);
        throw error;
    }
};

/**
 * Calcular y establecer fecha límite para Informante
 * @param {number} hito_id - ID del hito
 * @param {string} fecha_limite - Fecha límite calculada
 * @returns {Promise<boolean>}
 */
const establecerFechaLimiteInformante = async (hito_id, fecha_limite) => {
    try {
        const [result] = await pool.execute(`
            UPDATE hitos_proyecto 
            SET fecha_limite_informante = ?,
                fecha_notificacion_informante = NOW(),
                informante_notificado = TRUE,
                updated_at = NOW()
            WHERE id = ?
        `, [fecha_limite, hito_id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al establecer fecha límite informante:', error);
        throw error;
    }
};

/**
 * Crear alerta de abandono
 * @param {Object} alertaData - Datos de la alerta
 * @returns {Promise<number>} - ID de la alerta creada
 */
const crearAlertaAbandono = async (alertaData) => {
    const {
        proyecto_id,
        tipo_alerta,
        nivel_severidad,
        dias_sin_actividad,
        fecha_ultima_actividad,
        mensaje,
        accion_sugerida
    } = alertaData;

    try {
        const [result] = await pool.execute(`
            INSERT INTO alertas_abandono (
                proyecto_id, tipo_alerta, nivel_severidad, dias_sin_actividad,
                fecha_ultima_actividad, mensaje, accion_sugerida
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            proyecto_id, tipo_alerta, nivel_severidad, dias_sin_actividad,
            fecha_ultima_actividad, mensaje, accion_sugerida
        ]);
        return result.insertId;
    } catch (error) {
        console.error('Error al crear alerta de abandono:', error);
        throw error;
    }
};

/**
 * Obtener alertas de abandono activas
 * @param {number} proyecto_id - ID del proyecto (opcional)
 * @returns {Promise<Array>}
 */
const obtenerAlertasAbandono = async (proyecto_id = null) => {
    try {
        let query = `
            SELECT a.*, p.titulo AS proyecto_titulo, u.nombre AS estudiante_nombre
            FROM alertas_abandono a
            INNER JOIN proyectos p ON a.proyecto_id = p.id
            INNER JOIN usuarios u ON p.estudiante_rut = u.rut
            WHERE a.alerta_atendida = FALSE
        `;
        
        const params = [];
        if (proyecto_id) {
            query += ` AND a.proyecto_id = ?`;
            params.push(proyecto_id);
        }
        
        query += ` ORDER BY a.nivel_severidad DESC, a.fecha_alerta DESC`;
        
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error al obtener alertas de abandono:', error);
        throw error;
    }
};

/**
 * Marcar alerta como atendida
 * @param {number} alerta_id - ID de la alerta
 * @param {string} observaciones - Observaciones de atención
 * @returns {Promise<boolean>}
 */
const marcarAlertaAtendida = async (alerta_id, observaciones = null) => {
    try {
        const [result] = await pool.execute(`
            UPDATE alertas_abandono 
            SET alerta_atendida = TRUE,
                fecha_atencion = NOW(),
                observaciones = COALESCE(?, observaciones)
            WHERE id = ?
        `, [observaciones, alerta_id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error al marcar alerta como atendida:', error);
        throw error;
    }
};

/**
 * Obtener configuración de umbrales de abandono
 * @returns {Promise<Object>}
 */
const obtenerConfiguracionAbandono = async () => {
    try {
        const [rows] = await pool.execute(`
            SELECT clave, valor, descripcion
            FROM configuracion_matching
            WHERE clave IN (
                'dias_sin_actividad_alerta',
                'dias_sin_actividad_riesgo',
                'dias_sin_actividad_abandono',
                'dias_habiles_informante',
                'notificar_informante_auto'
            )
        `);
        
        const config = {};
        rows.forEach(row => {
            config[row.clave] = row.valor;
        });
        return config;
    } catch (error) {
        console.error('Error al obtener configuración de abandono:', error);
        throw error;
    }
};

// Exportar también las nuevas funciones
export { 
    actualizarEstadoProyecto, 
    obtenerProfesoresProyecto, 
    obtenerCargaProfesores, 
    obtenerEstadisticasCarga,
    // Funciones de monitoreo regulatorio
    obtenerProyectosRiesgoAbandono,
    obtenerInformantesPendientes,
    actualizarUltimaActividad,
    registrarEntregaInformeFinal,
    establecerFechaLimiteInformante,
    crearAlertaAbandono,
    obtenerAlertasAbandono,
    marcarAlertaAtendida,
    obtenerConfiguracionAbandono
};
