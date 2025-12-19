import { pool } from '../db/connectionDB.js';

/**
 * Obtener métricas completas del profesor
 */
export const getMetricasProfesor = async (req, res) => {
    try {
        const profesor_rut = req.user?.rut;
        const periodo = req.query.periodo || 'mes';
        
        if (!profesor_rut) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Calcular fechas según el período
        const now = new Date();
        let fechaInicio;
        
        switch (periodo) {
            case 'trimestre':
                fechaInicio = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case 'semestre':
                fechaInicio = new Date(now.setMonth(now.getMonth() - 6));
                break;
            case 'año':
                fechaInicio = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default: // mes
                fechaInicio = new Date(now.setMonth(now.getMonth() - 1));
        }

        // Métricas de propuestas (usando asignaciones_propuestas)
        const [propuestas] = await pool.execute(`
            SELECT 
                COUNT(DISTINCT ap.propuesta_id) as total,
                SUM(CASE WHEN p.estado_id = 4 THEN 1 ELSE 0 END) as aprobadas,
                SUM(CASE WHEN p.estado_id = 5 THEN 1 ELSE 0 END) as rechazadas,
                SUM(CASE WHEN ap.estado_revision = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                AVG(TIMESTAMPDIFF(HOUR, p.fecha_envio, ap.fecha_revision)) as tiempo_promedio
            FROM asignaciones_propuestas ap
            INNER JOIN propuestas p ON ap.propuesta_id = p.id
            WHERE ap.profesor_rut = ?
            AND ap.fecha_asignacion >= ?
        `, [profesor_rut, fechaInicio]);

        // Métricas de proyectos
        const [proyectos] = await pool.execute(`
            SELECT 
                COUNT(DISTINCT CASE WHEN p.estado_id IN (1, 2) THEN p.id END) as activos,
                COUNT(DISTINCT CASE WHEN p.estado_id = 3 THEN p.id END) as completados,
                rp.nombre as rol,
                COUNT(DISTINCT p.id) as cantidad
            FROM proyectos p
            INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
            INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            WHERE ap.profesor_rut = ? AND ap.activo = TRUE
            GROUP BY rp.nombre
        `, [profesor_rut]);

        // Contar proyectos activos y completados
        const [proyectosEstado] = await pool.execute(`
            SELECT 
                COUNT(DISTINCT CASE WHEN p.estado_id IN (1, 2) THEN p.id END) as activos,
                COUNT(DISTINCT CASE WHEN p.estado_id = 3 THEN p.id END) as completados
            FROM proyectos p
            INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
            WHERE ap.profesor_rut = ? AND ap.activo = TRUE
        `, [profesor_rut]);

        // Métricas de reuniones (usando reuniones_calendario)
        const [reuniones] = await pool.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(TIMESTAMPDIFF(MINUTE, hora_inicio, hora_fin)) as minutos_totales,
                COUNT(CASE WHEN fecha >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END) as ultimo_mes
            FROM reuniones_calendario
            WHERE profesor_rut = ?
            AND fecha >= ?
        `, [profesor_rut, fechaInicio]);

        // Contar estudiantes únicos asignados
        const [estudiantes] = await pool.execute(`
            SELECT COUNT(DISTINCT p.estudiante_rut) as total
            FROM proyectos p
            INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
            WHERE ap.profesor_rut = ? AND ap.activo = TRUE
            AND p.estado_id IN (1, 2)
        `, [profesor_rut]);

        // Fechas importantes
        const [fechas] = await pool.execute(`
            SELECT 
                COUNT(CASE WHEN f.fecha >= CURDATE() AND f.fecha <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as proximas,
                COUNT(CASE WHEN f.fecha < CURDATE() AND f.completada = FALSE THEN 1 END) as vencidas
            FROM fechas f
            INNER JOIN proyectos p ON f.proyecto_id = p.id
            INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
            WHERE ap.profesor_rut = ? AND ap.activo = TRUE
        `, [profesor_rut]);

        // Disponibilidad horaria
        const [disponibilidad] = await pool.execute(`
            SELECT 
                SUM(TIMESTAMPDIFF(MINUTE, hora_inicio, hora_fin)) / 60 as horas_semanales
            FROM disponibilidad_horarios
            WHERE usuario_rut = ? AND activo = TRUE
        `, [profesor_rut]);

        // Construir respuesta
        const proyectosPorRol = {};
        proyectos.forEach(p => {
            if (p.rol) {
                proyectosPorRol[p.rol] = p.cantidad;
            }
        });

        const horasDisponibilidad = disponibilidad[0]?.horas_semanales || 0;
        const horasEstimadas = estudiantes[0].total * 2; // Estimación: 2h por estudiante/semana
        const porcentajeOcupacion = horasDisponibilidad > 0 
            ? Math.min(100, Math.round((horasEstimadas / horasDisponibilidad) * 100))
            : 0;

        const metricas = {
            // Propuestas
            totalPropuestasRevisadas: parseInt(propuestas[0].total) || 0,
            propuestasAprobadas: parseInt(propuestas[0].aprobadas) || 0,
            propuestasRechazadas: parseInt(propuestas[0].rechazadas) || 0,
            propuestasPendientes: parseInt(propuestas[0].pendientes) || 0,
            tiempoPromedioRevision: Math.round(propuestas[0].tiempo_promedio) || 0,
            
            // Proyectos
            proyectosActivos: parseInt(proyectosEstado[0].activos) || 0,
            proyectosCompletados: parseInt(proyectosEstado[0].completados) || 0,
            proyectosPorRol,
            
            // Reuniones
            totalReuniones: parseInt(reuniones[0].total) || 0,
            reunionesUltimoMes: parseInt(reuniones[0].ultimo_mes) || 0,
            horasReunionesTotal: Math.round((reuniones[0].minutos_totales || 0) / 60),
            
            // Carga Académica
            estudiantesAsignados: parseInt(estudiantes[0].total) || 0,
            horasSemanalesEstimadas: horasEstimadas,
            
            // Fechas Importantes
            fechasProximas: parseInt(fechas[0].proximas) || 0,
            fechasVencidas: parseInt(fechas[0].vencidas) || 0,
            
            // Disponibilidad
            horasDisponibilidadSemanal: Math.round(horasDisponibilidad),
            porcentajeOcupacion
        };

        res.json({
            success: true,
            data: metricas
        });
    } catch (error) {
        console.error('Error al obtener métricas del profesor:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener propuestas revisadas por el profesor
 */
export const getPropuestasRevisadas = async (req, res) => {
    try {
        const profesor_rut = req.user?.rut;
        
        if (!profesor_rut) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const [propuestas] = await pool.execute(`
            SELECT 
                p.id,
                p.titulo,
                p.descripcion,
                u.nombre as estudiante_nombre,
                ep.nombre as estado,
                ap.fecha_revision,
                ap.comentarios_revision as comentarios
            FROM asignaciones_propuestas ap
            INNER JOIN propuestas p ON ap.propuesta_id = p.id
            INNER JOIN usuarios u ON p.estudiante_rut = u.rut
            INNER JOIN estados_propuestas ep ON p.estado_id = ep.id
            WHERE ap.profesor_rut = ?
            ORDER BY ap.fecha_revision DESC
            LIMIT 50
        `, [profesor_rut]);

        res.json({
            success: true,
            data: propuestas
        });
    } catch (error) {
        console.error('Error al obtener propuestas revisadas:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Obtener reuniones del profesor
 */
export const getReunionesProfesor = async (req, res) => {
    try {
        const profesor_rut = req.user?.rut;
        
        if (!profesor_rut) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const [reuniones] = await pool.execute(`
            SELECT 
                r.id,
                p.titulo as proyecto_titulo,
                u.nombre as estudiante_nombre,
                r.fecha,
                TIMESTAMPDIFF(MINUTE, r.hora_inicio, r.hora_fin) as duracion,
                r.tipo_reunion as tipo
            FROM reuniones_calendario r
            INNER JOIN proyectos p ON r.proyecto_id = p.id
            INNER JOIN usuarios u ON p.estudiante_rut = u.rut
            WHERE r.profesor_rut = ?
            ORDER BY r.fecha DESC, r.hora_inicio DESC
            LIMIT 50
        `, [profesor_rut]);

        res.json({
            success: true,
            data: reuniones
        });
    } catch (error) {
        console.error('Error al obtener reuniones:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

