import { pool } from '../db/connectionDB.js';

// ========== DASHBOARD ESTUDIANTE ==========

export const obtenerDashboardEstudiante = async (estudiante_rut) => {
    try {
        // 1. Proyectos del estudiante con progreso
        const [proyectos] = await pool.execute(`
            SELECT 
                p.id,
                p.titulo,
                p.porcentaje_avance,
                p.estado_detallado,
                p.fecha_entrega_estimada,
                p.proximo_hito_fecha,
                ep.nombre as estado,
                DATEDIFF(p.fecha_entrega_estimada, CURDATE()) as dias_restantes
            FROM proyectos p
            INNER JOIN estudiantes_proyectos est_p ON p.id = est_p.proyecto_id
            LEFT JOIN estados_proyectos ep ON p.estado_id = ep.id
            WHERE est_p.estudiante_rut = ? AND p.activo = TRUE
            ORDER BY p.fecha_entrega_estimada ASC
        `, [estudiante_rut]);

        // 2. Próximos hitos
        const [proximosHitos] = await pool.execute(`
            SELECT 
                h.id,
                h.nombre_hito,
                h.fecha_limite,
                h.estado,
                h.porcentaje_avance,
                hc.proyecto_id,
                p.titulo as proyecto_titulo,
                DATEDIFF(h.fecha_limite, CURDATE()) as dias_restantes
            FROM hitos_cronograma h
            INNER JOIN cronogramas_proyecto hc ON h.cronograma_id = hc.id
            INNER JOIN proyectos p ON hc.proyecto_id = p.id
            INNER JOIN estudiantes_proyectos est_p ON p.id = est_p.proyecto_id
            WHERE est_p.estudiante_rut = ? 
                AND h.estado IN ('pendiente', 'en_progreso')
                AND h.fecha_limite >= CURDATE()
            ORDER BY h.fecha_limite ASC
            LIMIT 5
        `, [estudiante_rut]);

        // 3. Avances pendientes o con comentarios
        const [avancesPendientes] = await pool.execute(`
            SELECT 
                a.id,
                a.titulo,
                a.fecha_envio,
                a.estado_id,
                p.titulo as proyecto_titulo,
                CASE 
                    WHEN a.comentarios_profesor IS NOT NULL THEN 'con_comentarios'
                    ELSE 'pendiente'
                END as estado_revision
            FROM avances a
            INNER JOIN proyectos p ON a.proyecto_id = p.id
            INNER JOIN estudiantes_proyectos est_p ON p.id = est_p.proyecto_id
            WHERE est_p.estudiante_rut = ? 
                AND a.estado_id IN (1, 2, 3)
            ORDER BY a.fecha_envio DESC
            LIMIT 5
        `, [estudiante_rut]);

        // 4. Propuestas del estudiante
        const [propuestas] = await pool.execute(`
            SELECT 
                prop.id,
                prop.titulo,
                prop.estado_id,
                ep.nombre as estado,
                prop.fecha_envio
            FROM propuestas prop
            INNER JOIN estudiantes_propuestas est_prop ON prop.id = est_prop.propuesta_id
            LEFT JOIN estados_propuestas ep ON prop.estado_id = ep.id
            WHERE est_prop.estudiante_rut = ?
            ORDER BY prop.fecha_envio DESC
        `, [estudiante_rut]);

        return {
            proyectos,
            proximos_hitos: proximosHitos,
            avances_pendientes: avancesPendientes,
            propuestas
        };
    } catch (error) {
        
        throw error;
    }
};

// ========== DASHBOARD PROFESOR ==========

export const obtenerDashboardProfesor = async (profesor_rut) => {
    try {
        // 1. Propuestas asignadas por estado
        const [propuestasPorEstado] = await pool.execute(`
            SELECT 
                ep.nombre as estado,
                COUNT(*) as total
            FROM asignaciones_propuestas ap
            INNER JOIN propuestas prop ON ap.propuesta_id = prop.id
            LEFT JOIN estados_propuestas ep ON prop.estado_id = ep.id
            WHERE ap.profesor_rut = ?
            GROUP BY ep.nombre
        `, [profesor_rut]);

        // 2. Proyectos asignados por rol
        const [proyectosPorRol] = await pool.execute(`
            SELECT 
                rp.nombre as rol,
                COUNT(*) as total
            FROM asignaciones_proyectos ap
            INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            INNER JOIN proyectos p ON ap.proyecto_id = p.id
            WHERE ap.profesor_rut = ? AND ap.activo = TRUE AND p.activo = TRUE
            GROUP BY rp.nombre
        `, [profesor_rut]);

        // 3. Avances pendientes de revisar
        const [avancesPendientes] = await pool.execute(`
            SELECT 
                a.id,
                a.titulo,
                a.fecha_envio,
                p.titulo as proyecto_titulo,
                DATEDIFF(CURDATE(), a.fecha_envio) as dias_sin_revisar
            FROM avances a
            INNER JOIN proyectos p ON a.proyecto_id = p.id
            INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
            WHERE ap.profesor_rut = ? 
                AND ap.activo = TRUE
                AND a.estado_id = 2
                AND a.comentarios_profesor IS NULL
            ORDER BY a.fecha_envio ASC
            LIMIT 10
        `, [profesor_rut]);

        // 4. Estadísticas de tiempos de revisión
        const [estadisticasTiempos] = await pool.execute(`
            SELECT 
                AVG(DATEDIFF(a.fecha_revision, a.fecha_envio)) as promedio_dias_revision,
                MIN(DATEDIFF(a.fecha_revision, a.fecha_envio)) as minimo_dias_revision,
                MAX(DATEDIFF(a.fecha_revision, a.fecha_envio)) as maximo_dias_revision,
                COUNT(*) as total_revisados
            FROM avances a
            INNER JOIN proyectos p ON a.proyecto_id = p.id
            INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
            WHERE ap.profesor_rut = ? 
                AND a.fecha_revision IS NOT NULL
                AND a.fecha_revision >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        `, [profesor_rut]);

        // 5. Propuestas pendientes de revisar
        const [propuestasPendientes] = await pool.execute(`
            SELECT 
                prop.id,
                prop.titulo,
                prop.fecha_envio,
                DATEDIFF(CURDATE(), prop.fecha_envio) as dias_sin_revisar,
                u.nombre as estudiante_nombre
            FROM asignaciones_propuestas ap
            INNER JOIN propuestas prop ON ap.propuesta_id = prop.id
            INNER JOIN usuarios u ON prop.estudiante_rut = u.rut
            WHERE ap.profesor_rut = ?
                AND prop.estado_id = 2
            ORDER BY prop.fecha_envio ASC
            LIMIT 10
        `, [profesor_rut]);

        return {
            propuestas_por_estado: propuestasPorEstado,
            proyectos_por_rol: proyectosPorRol,
            avances_pendientes: avancesPendientes,
            propuestas_pendientes: propuestasPendientes,
            estadisticas_tiempos: estadisticasTiempos[0] || {
                promedio_dias_revision: 0,
                minimo_dias_revision: 0,
                maximo_dias_revision: 0,
                total_revisados: 0
            }
        };
    } catch (error) {
        
        throw error;
    }
};

// ========== DASHBOARD ADMIN ==========

export const obtenerDashboardAdmin = async () => {
    try {
        // 1. Propuestas por estado
        const [propuestasPorEstado] = await pool.execute(`
            SELECT 
                ep.nombre as estado,
                COUNT(*) as total,
                ep.id as estado_id
            FROM propuestas prop
            LEFT JOIN estados_propuestas ep ON prop.estado_id = ep.id
            GROUP BY ep.nombre, ep.id
            ORDER BY ep.id
        `);

        // 2. Proyectos por estado
        const [proyectosPorEstado] = await pool.execute(`
            SELECT 
                ep.nombre as estado,
                COUNT(*) as total,
                ep.id as estado_id
            FROM proyectos p
            LEFT JOIN estados_proyectos ep ON p.estado_id = ep.id
            WHERE p.activo = TRUE
            GROUP BY ep.nombre, ep.id
            ORDER BY ep.id
        `);

        // 3. Distribución por modalidad
        const [distribucionModalidad] = await pool.execute(`
            SELECT 
                modalidad,
                COUNT(*) as total,
                AVG(porcentaje_avance) as avance_promedio
            FROM proyectos
            WHERE activo = TRUE
            GROUP BY modalidad
        `);

        // 4. Tiempos promedio de revisión de propuestas
        const [tiemposRevisionPropuestas] = await pool.execute(`
            SELECT 
                AVG(DATEDIFF(fecha_revision, fecha_envio)) as promedio_dias,
                MIN(DATEDIFF(fecha_revision, fecha_envio)) as minimo_dias,
                MAX(DATEDIFF(fecha_revision, fecha_envio)) as maximo_dias,
                COUNT(*) as total_revisadas
            FROM propuestas
            WHERE fecha_revision IS NOT NULL
                AND fecha_revision >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        `);

        // 5. Métricas generales
        const [metricas] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM usuarios WHERE rol_id = 1) as total_estudiantes,
                (SELECT COUNT(*) FROM usuarios WHERE rol_id = 2) as total_profesores,
                (SELECT COUNT(*) FROM propuestas) as total_propuestas,
                (SELECT COUNT(*) FROM proyectos WHERE activo = TRUE) as total_proyectos_activos,
                (SELECT COUNT(*) FROM propuestas WHERE estado_id = 4) as propuestas_aprobadas,
                (SELECT COUNT(*) FROM propuestas WHERE estado_id = 5) as propuestas_rechazadas,
                (SELECT AVG(porcentaje_avance) FROM proyectos WHERE activo = TRUE) as avance_promedio_proyectos
        `);

        // 6. Tendencias mensuales (últimos 6 meses)
        const [tendencias] = await pool.execute(`
            SELECT 
                DATE_FORMAT(fecha_envio, '%Y-%m') as mes,
                COUNT(*) as propuestas_enviadas,
                SUM(CASE WHEN estado_id = 4 THEN 1 ELSE 0 END) as propuestas_aprobadas
            FROM propuestas
            WHERE fecha_envio >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha_envio, '%Y-%m')
            ORDER BY mes ASC
        `);

        // 7. Proyectos por profesor (top 10 con más carga)
        const [cargaProfesores] = await pool.execute(`
            SELECT 
                u.nombre as profesor,
                COUNT(DISTINCT ap.proyecto_id) as total_proyectos,
                GROUP_CONCAT(DISTINCT rp.nombre SEPARATOR ', ') as roles
            FROM usuarios u
            INNER JOIN asignaciones_proyectos ap ON u.rut = ap.profesor_rut
            INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            WHERE ap.activo = TRUE AND u.rol_id = 2
            GROUP BY u.rut, u.nombre
            ORDER BY total_proyectos DESC
            LIMIT 10
        `);

        return {
            propuestas_por_estado: propuestasPorEstado,
            proyectos_por_estado: proyectosPorEstado,
            distribucion_modalidad: distribucionModalidad,
            tiempos_revision: tiemposRevisionPropuestas[0] || {
                promedio_dias: 0,
                minimo_dias: 0,
                maximo_dias: 0,
                total_revisadas: 0
            },
            metricas_generales: metricas[0],
            tendencias_mensuales: tendencias,
            carga_profesores: cargaProfesores
        };
    } catch (error) {
        
        throw error;
    }
};
