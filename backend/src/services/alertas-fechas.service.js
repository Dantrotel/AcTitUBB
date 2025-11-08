import { pool } from '../db/connectionDB.js';
import * as fechasImportantesModel from '../models/fechas-importantes.model.js';
import * as avanceModel from '../models/avance.model.js';

// ===== SERVICIO DE ALERTAS AUTOMÁTICAS DE FECHAS REGLAMENTARIAS =====

/**
 * Genera alertas automáticas para fechas importantes según el reglamento
 * Artículos 29-32: alertas de 30, 10 y 0 días para entregas, defensas, etc.
 * 
 * Este servicio debe ejecutarse diariamente (cron job o similar)
 */
export const generarAlertasAutomaticas = async () => {
    console.log('🔔 Iniciando generación de alertas automáticas de fechas importantes...');
    
    try {
        // Obtener todas las fechas importantes NO completadas
        const [fechasActivas] = await pool.execute(`
            SELECT 
                fi.*,
                p.titulo as titulo_proyecto,
                p.estudiante_rut,
                u.nombre as nombre_estudiante,
                u.email as email_estudiante,
                DATEDIFF(fi.fecha_limite, CURDATE()) as dias_restantes
            FROM fechas_importantes fi
            INNER JOIN proyectos p ON fi.proyecto_id = p.id
            INNER JOIN usuarios u ON p.estudiante_rut = u.rut
            WHERE fi.completada = FALSE
        `);

        const alertasGeneradas = {
            alerta_30_dias: 0,
            alerta_10_dias: 0,
            alerta_hoy: 0,
            alerta_vencida: 0
        };

        for (const fecha of fechasActivas) {
            const diasRestantes = fecha.dias_restantes;
            
            // ALERTA: Quedan 30 días
            if (diasRestantes === 30) {
                await crearAlertaFecha(fecha, 'alerta_30_dias', 'warning');
                alertasGeneradas.alerta_30_dias++;
            }
            
            // ALERTA: Quedan 10 días (defensa programada en 10 días)
            if (diasRestantes === 10) {
                await crearAlertaFecha(fecha, 'alerta_10_dias', 'warning');
                alertasGeneradas.alerta_10_dias++;
            }
            
            // ALERTA: Es hoy
            if (diasRestantes === 0) {
                await crearAlertaFecha(fecha, 'alerta_hoy', 'danger');
                alertasGeneradas.alerta_hoy++;
            }
            
            // ALERTA: Fecha límite vencida
            if (diasRestantes < 0 && diasRestantes >= -7) { // Solo primeros 7 días de retraso
                await crearAlertaFecha(fecha, 'alerta_vencida', 'danger');
                alertasGeneradas.alerta_vencida++;
            }
        }

        console.log('✅ Alertas generadas:', alertasGeneradas);
        return alertasGeneradas;

    } catch (error) {
        console.error('❌ Error al generar alertas automáticas:', error);
        throw error;
    }
};

/**
 * Crea una alerta específica para una fecha importante
 */
const crearAlertaFecha = async (fecha, tipoAlerta, nivelAlerta) => {
    const mensajes = {
        alerta_30_dias: `Quedan 30 días para: ${fecha.titulo}`,
        alerta_10_dias: `${fecha.tipo_fecha === 'defensa' ? 'Defensa programada' : 'Fecha importante'} en 10 días: ${fecha.titulo}`,
        alerta_hoy: `¡HOY es la fecha límite de: ${fecha.titulo}!`,
        alerta_vencida: `⚠️ Fecha límite vencida: ${fecha.titulo}`
    };

    const titulos = {
        alerta_30_dias: '📅 Recordatorio: 30 días',
        alerta_10_dias: '⏰ Próxima fecha importante',
        alerta_hoy: '🚨 Fecha límite HOY',
        alerta_vencida: '⚠️ Fecha vencida'
    };

    try {
        // Verificar si ya existe una alerta similar reciente (últimas 24 horas)
        const [alertasExistentes] = await pool.execute(`
            SELECT id FROM notificaciones_proyecto
            WHERE proyecto_id = ?
            AND tipo_notificacion = ?
            AND DATE(created_at) = CURDATE()
        `, [fecha.proyecto_id, tipoAlerta]);

        if (alertasExistentes.length > 0) {
            console.log(`⏭️ Alerta ${tipoAlerta} ya existe para proyecto ${fecha.proyecto_id}`);
            return; // No duplicar alertas del mismo día
        }

        // Crear notificación para el estudiante
        await avanceModel.crearNotificacion({
            proyecto_id: fecha.proyecto_id,
            hito_cronograma_id: null, // No está asociada a un hito específico
            tipo_notificacion: tipoAlerta,
            destinatario_rut: fecha.estudiante_rut,
            rol_destinatario: 'estudiante',
            titulo: titulos[tipoAlerta],
            mensaje: mensajes[tipoAlerta],
            enviar_email: true
        });

        // Obtener profesores asignados al proyecto
        const [profesores] = await pool.execute(`
            SELECT profesor_rut 
            FROM asignaciones_proyectos 
            WHERE proyecto_id = ? AND activo = TRUE
        `, [fecha.proyecto_id]);

        // Crear notificación para cada profesor asignado
        for (const profesor of profesores) {
            await avanceModel.crearNotificacion({
                proyecto_id: fecha.proyecto_id,
                hito_cronograma_id: null,
                tipo_notificacion: tipoAlerta,
                destinatario_rut: profesor.profesor_rut,
                rol_destinatario: 'profesor',
                titulo: titulos[tipoAlerta],
                mensaje: `${mensajes[tipoAlerta]} - Estudiante: ${fecha.nombre_estudiante}`,
                enviar_email: true
            });
        }

        console.log(`✅ Alerta creada: ${tipoAlerta} para proyecto ${fecha.proyecto_id}`);

    } catch (error) {
        console.error(`❌ Error al crear alerta ${tipoAlerta}:`, error);
    }
};

/**
 * Obtener alertas activas de un usuario específico
 * @param {string} rut - RUT del usuario
 * @param {number} rol_id - ID del rol (1=estudiante, 2=profesor, 3=admin)
 * @returns {Promise<Array>} - Lista de alertas activas
 */
export const obtenerAlertasUsuario = async (rut, rol_id) => {
    try {
        // Estudiantes: solo sus alertas
        // Profesores: alertas de proyectos asignados
        // Admin: todas las alertas críticas
        
        let query = '';
        let params = [];

        if (rol_id === 1) { // Estudiante
            query = `
                SELECT 
                    n.*,
                    fi.titulo as fecha_titulo,
                    fi.fecha_limite,
                    fi.tipo_fecha,
                    DATEDIFF(fi.fecha_limite, CURDATE()) as dias_restantes
                FROM notificaciones_proyecto n
                LEFT JOIN fechas_importantes fi ON n.proyecto_id = fi.proyecto_id
                WHERE n.destinatario_rut = ?
                AND n.tipo_notificacion IN ('alerta_30_dias', 'alerta_10_dias', 'alerta_hoy', 'alerta_vencida')
                AND n.leida = FALSE
                ORDER BY n.created_at DESC
                LIMIT 10
            `;
            params = [rut];

        } else if (rol_id === 2) { // Profesor
            query = `
                SELECT DISTINCT
                    n.*,
                    fi.titulo as fecha_titulo,
                    fi.fecha_limite,
                    fi.tipo_fecha,
                    p.titulo as titulo_proyecto,
                    p.estudiante_rut,
                    u.nombre as nombre_estudiante,
                    DATEDIFF(fi.fecha_limite, CURDATE()) as dias_restantes
                FROM notificaciones_proyecto n
                INNER JOIN proyectos p ON n.proyecto_id = p.id
                INNER JOIN asignaciones_proyectos a ON p.id = a.proyecto_id
                LEFT JOIN fechas_importantes fi ON n.proyecto_id = fi.proyecto_id
                LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
                WHERE a.profesor_rut = ?
                AND a.activo = TRUE
                AND n.tipo_notificacion IN ('alerta_30_dias', 'alerta_10_dias', 'alerta_hoy', 'alerta_vencida')
                AND n.leida = FALSE
                ORDER BY n.created_at DESC
                LIMIT 20
            `;
            params = [rut];

        } else if (rol_id === 3) { // Admin - solo alertas críticas
            query = `
                SELECT 
                    n.*,
                    fi.titulo as fecha_titulo,
                    fi.fecha_limite,
                    fi.tipo_fecha,
                    p.titulo as titulo_proyecto,
                    p.estudiante_rut,
                    u.nombre as nombre_estudiante,
                    DATEDIFF(fi.fecha_limite, CURDATE()) as dias_restantes
                FROM notificaciones_proyecto n
                INNER JOIN proyectos p ON n.proyecto_id = p.id
                LEFT JOIN fechas_importantes fi ON n.proyecto_id = fi.proyecto_id
                LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
                WHERE n.tipo_notificacion IN ('alerta_hoy', 'alerta_vencida')
                AND n.leida = FALSE
                ORDER BY n.created_at DESC
                LIMIT 50
            `;
            params = [];
        }

        const [alertas] = await pool.execute(query, params);
        return alertas;

    } catch (error) {
        console.error('❌ Error al obtener alertas de usuario:', error);
        throw error;
    }
};

/**
 * Obtener resumen de alertas por proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Object>} - Resumen de alertas
 */
export const obtenerResumenAlertasProyecto = async (proyecto_id) => {
    try {
        const [fechas] = await pool.execute(`
            SELECT 
                COUNT(*) as total_fechas,
                SUM(CASE WHEN completada = FALSE AND fecha_limite < CURDATE() THEN 1 ELSE 0 END) as vencidas,
                SUM(CASE WHEN completada = FALSE AND DATEDIFF(fecha_limite, CURDATE()) BETWEEN 0 AND 10 THEN 1 ELSE 0 END) as proximas_10_dias,
                SUM(CASE WHEN completada = FALSE AND DATEDIFF(fecha_limite, CURDATE()) BETWEEN 11 AND 30 THEN 1 ELSE 0 END) as proximas_30_dias,
                SUM(CASE WHEN completada = TRUE THEN 1 ELSE 0 END) as completadas
            FROM fechas_importantes
            WHERE proyecto_id = ?
        `, [proyecto_id]);

        return fechas[0];

    } catch (error) {
        console.error('❌ Error al obtener resumen de alertas:', error);
        throw error;
    }
};

/**
 * Marcar todas las alertas de un usuario como leídas
 * @param {string} rut - RUT del usuario
 * @returns {Promise<boolean>}
 */
export const marcarTodasAlertasLeidas = async (rut) => {
    try {
        const [result] = await pool.execute(`
            UPDATE notificaciones_proyecto
            SET leida = TRUE
            WHERE destinatario_rut = ?
            AND tipo_notificacion IN ('alerta_30_dias', 'alerta_10_dias', 'alerta_hoy', 'alerta_vencida')
        `, [rut]);

        return result.affectedRows > 0;

    } catch (error) {
        console.error('❌ Error al marcar alertas como leídas:', error);
        throw error;
    }
};
