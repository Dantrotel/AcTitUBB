// Servicio de Recordatorios Automáticos
import cron from 'node-cron';
import { pool } from '../db/connectionDB.js';
import logger from '../config/logger.js';
import { notifyUser } from '../config/socket.js';
import * as emailService from './email.service.js';

let schedulerRunning = false;

/**
 * Inicializar todos los schedulers
 */
export const initializeSchedulers = () => {
  if (schedulerRunning) {
    logger.warn('Schedulers ya están en ejecución');
    return;
  }

  logger.info('🕐 Inicializando sistema de recordatorios automáticos...');

  // Ejecutar cada minuto para habilitar/deshabilitar períodos automáticamente
  cron.schedule('* * * * *', async () => {
    logger.info('⏰ Ejecutando verificación de períodos académicos...');
    await verificarPeriodosAcademicos();
  });

  // Ejecutar cada hora para recordatorios de fechas límite
  cron.schedule('0 * * * *', async () => {
    logger.info('⏰ Ejecutando verificación de fechas límite...');
    await verificarFechasLimite();
  });

  // Ejecutar cada 6 horas para alertas de inactividad
  cron.schedule('0 */6 * * *', async () => {
    logger.info('⏰ Ejecutando verificación de inactividad de proyectos...');
    await verificarInactividadProyectos();
  });

  // Ejecutar todos los días a las 8 AM para recordatorios de reuniones
  cron.schedule('0 8 * * *', async () => {
    logger.info('⏰ Ejecutando recordatorios de reuniones del día...');
    await recordatoriosReuniones();
  });

  // Ejecutar todos los días a las 9 AM para alertas de evaluaciones pendientes
  cron.schedule('0 9 * * *', async () => {
    logger.info('⏰ Ejecutando verificación de evaluaciones pendientes...');
    await verificarEvaluacionesPendientes();
  });

  schedulerRunning = true;
  logger.info('✅ Schedulers de recordatorios iniciados correctamente');
};

/**
 * Verificar y actualizar estado de períodos académicos automáticamente
 * Habilita períodos cuando llega su fecha_inicio + hora_inicio
 * Deshabilita períodos cuando llega su fecha + hora_limite
 */
const verificarPeriodosAcademicos = async () => {
  try {
    logger.info('🔍 Iniciando verificación de períodos académicos...');
    const ahora = new Date();
    logger.info(`📅 Fecha/hora actual del servidor: ${ahora.toISOString()}`);
    
    // 1. Habilitar períodos que deben iniciarse (tienen fecha_inicio y ya llegó la hora)
    const [periodosParaHabilitar] = await pool.execute(`
      SELECT id, titulo, fecha_inicio, hora_inicio,
             CONCAT(fecha_inicio, ' ', hora_inicio) as inicio_completo
      FROM fechas
      WHERE es_global = TRUE
        AND habilitada = FALSE
        AND fecha_inicio IS NOT NULL
        AND hora_inicio IS NOT NULL
        AND CONCAT(fecha_inicio, ' ', hora_inicio) <= NOW()
        AND activa = TRUE
    `);
    
    logger.info(`📊 Períodos para habilitar encontrados: ${periodosParaHabilitar.length}`);

    if (periodosParaHabilitar.length > 0) {
      for (const periodo of periodosParaHabilitar) {
        await pool.execute(
          'UPDATE fechas SET habilitada = TRUE WHERE id = ?',
          [periodo.id]
        );
        logger.info(`✅ Período habilitado automáticamente: "${periodo.titulo}" (ID: ${periodo.id})`);
      }
    }

    // 2. Deshabilitar períodos que ya finalizaron (llegó su fecha + hora_limite)
    const [periodosParaDeshabilitar] = await pool.execute(`
      SELECT id, titulo, fecha, hora_limite
      FROM fechas
      WHERE es_global = TRUE
        AND habilitada = TRUE
        AND fecha IS NOT NULL
        AND hora_limite IS NOT NULL
        AND CONCAT(fecha, ' ', hora_limite) <= NOW()
        AND activa = TRUE
    `);

    if (periodosParaDeshabilitar.length > 0) {
      for (const periodo of periodosParaDeshabilitar) {
        await pool.execute(
          'UPDATE fechas SET habilitada = FALSE WHERE id = ?',
          [periodo.id]
        );
        logger.info(`🔒 Período deshabilitado automáticamente: "${periodo.titulo}" (ID: ${periodo.id})`);
      }
    }

    if (periodosParaHabilitar.length > 0 || periodosParaDeshabilitar.length > 0) {
      logger.info(`✅ Verificación de períodos completada. Habilitados: ${periodosParaHabilitar.length}, Deshabilitados: ${periodosParaDeshabilitar.length}`);
    }
  } catch (error) {
    logger.error('Error verificando períodos académicos:', { error: error.message, stack: error.stack });
  }
};

/**
 * Verificar fechas límite próximas a vencer (24h y 48h)
 */
const verificarFechasLimite = async () => {
  try {
    const [fechasProximas] = await pool.execute(`
      SELECT 
        f.id,
        f.titulo,
        f.descripcion,
        f.fecha,
        f.proyecto_id,
        p.titulo as proyecto_titulo,
        p.estudiante_rut,
        u.nombre as estudiante_nombre,
        u.email as estudiante_email,
        TIMESTAMPDIFF(HOUR, NOW(), CONCAT(f.fecha, ' ', f.hora_limite)) as horas_restantes
      FROM fechas f
      LEFT JOIN proyectos p ON f.proyecto_id = p.id
      LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
      WHERE CONCAT(f.fecha, ' ', f.hora_limite) > NOW()
        AND f.completada = FALSE
        AND f.activa = TRUE
        AND (
          TIMESTAMPDIFF(HOUR, NOW(), CONCAT(f.fecha, ' ', f.hora_limite)) <= 48
          AND TIMESTAMPDIFF(HOUR, NOW(), CONCAT(f.fecha, ' ', f.hora_limite)) > 24
        )
        OR (
          TIMESTAMPDIFF(HOUR, NOW(), CONCAT(f.fecha, ' ', f.hora_limite)) <= 24
          AND TIMESTAMPDIFF(HOUR, NOW(), CONCAT(f.fecha, ' ', f.hora_limite)) > 0
        )
    `);

    for (const fecha of fechasProximas) {
      const horasRestantes = fecha.horas_restantes;
      const urgencia = horasRestantes <= 24 ? 'urgente' : 'proximo';
      
      // Notificación WebSocket
      if (fecha.estudiante_rut) {
        notifyUser(fecha.estudiante_rut, 'fecha:recordatorio', {
          type: urgencia === 'urgente' ? 'warning' : 'info',
          title: `⏰ Fecha Límite ${urgencia === 'urgente' ? 'Urgente' : 'Próxima'}`,
          message: `${fecha.titulo} vence en ${Math.floor(horasRestantes)} horas`,
          fechaId: fecha.id,
          proyectoId: fecha.proyecto_id,
          horasRestantes: Math.floor(horasRestantes)
        });

        // Email si es urgente (24h)
        if (urgencia === 'urgente' && fecha.estudiante_email) {
          await emailService.sendRecordatorioFechaLimite(
            fecha.estudiante_email,
            fecha.estudiante_nombre,
            fecha.titulo,
            fecha.fecha,
            fecha.proyecto_titulo
          );
        }
      }

      // Notificar también a profesores asignados
      if (fecha.proyecto_id) {
        const [profesores] = await pool.execute(`
          SELECT u.rut, u.nombre, u.email
          FROM asignaciones_proyectos ap
          INNER JOIN usuarios u ON ap.profesor_rut = u.rut
          WHERE ap.proyecto_id = ? AND ap.activo = TRUE
        `, [fecha.proyecto_id]);

        for (const profesor of profesores) {
          notifyUser(profesor.rut, 'fecha:recordatorio-proyecto', {
            type: 'info',
            title: '📅 Recordatorio de Fecha Importante',
            message: `El proyecto "${fecha.proyecto_titulo}" tiene fecha límite: ${fecha.titulo}`,
            fechaId: fecha.id,
            proyectoId: fecha.proyecto_id,
            horasRestantes: Math.floor(horasRestantes)
          });
        }
      }
    }

    logger.info(`✅ Verificación de fechas límite completada. ${fechasProximas.length} recordatorios enviados`);
  } catch (error) {
    logger.error('Error verificando fechas límite:', { error: error.message, stack: error.stack });
  }
};

/**
 * Verificar proyectos con inactividad prolongada
 */
const verificarInactividadProyectos = async () => {
  try {
    // Obtener umbral de configuración (default 30 días)
    const [config] = await pool.execute(
      "SELECT valor FROM configuracion_sistema WHERE clave = 'dias_sin_actividad_alerta' LIMIT 1"
    );
    const diasUmbral = config.length > 0 ? parseInt(config[0].valor) : 30;

    const [proyectosInactivos] = await pool.execute(`
      SELECT 
        p.id,
        p.titulo,
        p.estudiante_rut,
        u.nombre as estudiante_nombre,
        u.email as estudiante_email,
        p.ultima_actividad_fecha,
        DATEDIFF(NOW(), p.ultima_actividad_fecha) as dias_inactivo,
        p.alerta_inactividad_enviada
      FROM proyectos p
      INNER JOIN usuarios u ON p.estudiante_rut = u.rut
      WHERE p.estado_detallado NOT IN ('cerrado', 'defendido')
        AND p.ultima_actividad_fecha IS NOT NULL
        AND DATEDIFF(NOW(), p.ultima_actividad_fecha) >= ?
        AND (p.alerta_inactividad_enviada = FALSE OR p.fecha_alerta_inactividad < DATE_SUB(NOW(), INTERVAL 7 DAY))
    `, [diasUmbral]);

    for (const proyecto of proyectosInactivos) {
      // Notificación al estudiante
      notifyUser(proyecto.estudiante_rut, 'proyecto:inactividad', {
        type: 'warning',
        title: '⚠️ Alerta de Inactividad',
        message: `Tu proyecto "${proyecto.titulo}" lleva ${proyecto.dias_inactivo} días sin actividad`,
        proyectoId: proyecto.id,
        diasInactivo: proyecto.dias_inactivo
      });

      // Email al estudiante
      if (proyecto.estudiante_email) {
        await emailService.sendAlertaInactividad(
          proyecto.estudiante_email,
          proyecto.estudiante_nombre,
          proyecto.titulo,
          proyecto.dias_inactivo
        );
      }

      // Notificar a profesores guía
      const [profesores] = await pool.execute(`
        SELECT u.rut, u.nombre, u.email, rp.nombre as rol_nombre
        FROM asignaciones_proyectos ap
        INNER JOIN usuarios u ON ap.profesor_rut = u.rut
        INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
        WHERE ap.proyecto_id = ? AND ap.activo = TRUE AND rp.nombre = 'Profesor Guía'
      `, [proyecto.id]);

      for (const profesor of profesores) {
        notifyUser(profesor.rut, 'proyecto:inactividad-estudiante', {
          type: 'warning',
          title: '⚠️ Estudiante Inactivo',
          message: `El proyecto "${proyecto.titulo}" de ${proyecto.estudiante_nombre} lleva ${proyecto.dias_inactivo} días sin actividad`,
          proyectoId: proyecto.id,
          estudianteRut: proyecto.estudiante_rut,
          diasInactivo: proyecto.dias_inactivo
        });
      }

      // Actualizar flag de alerta enviada
      await pool.execute(
        'UPDATE proyectos SET alerta_inactividad_enviada = TRUE, fecha_alerta_inactividad = NOW() WHERE id = ?',
        [proyecto.id]
      );
    }

    logger.info(`✅ Verificación de inactividad completada. ${proyectosInactivos.length} alertas enviadas`);
  } catch (error) {
    logger.error('Error verificando inactividad:', { error: error.message, stack: error.stack });
  }
};

/**
 * Recordatorios de reuniones del día
 */
const recordatoriosReuniones = async () => {
  try {
    const [reunionesHoy] = await pool.execute(`
      SELECT 
        rc.id,
        rc.titulo,
        rc.fecha,
        rc.hora_inicio,
        rc.hora_fin,
        rc.lugar,
        rc.link_reunion,
        rc.proyecto_id,
        p.titulo as proyecto_titulo,
        rc.estudiante_rut,
        ue.nombre as estudiante_nombre,
        ue.email as estudiante_email,
        rc.profesor_rut,
        up.nombre as profesor_nombre,
        up.email as profesor_email
      FROM reuniones_calendario rc
      LEFT JOIN proyectos p ON rc.proyecto_id = p.id
      LEFT JOIN usuarios ue ON rc.estudiante_rut = ue.rut
      LEFT JOIN usuarios up ON rc.profesor_rut = up.rut
      WHERE DATE(rc.fecha) = CURDATE()
        AND rc.estado = 'confirmada'
    `);

    for (const reunion of reunionesHoy) {
      // Notificar estudiante
      if (reunion.estudiante_rut) {
        notifyUser(reunion.estudiante_rut, 'reunion:recordatorio', {
          type: 'info',
          title: '📅 Recordatorio de Reunión Hoy',
          message: `Tienes reunión "${reunion.titulo}" hoy a las ${reunion.hora_inicio}`,
          reunionId: reunion.id,
          fecha: reunion.fecha,
          hora: reunion.hora_inicio,
          lugar: reunion.lugar || reunion.link_reunion
        });
      }

      // Notificar profesor
      if (reunion.profesor_rut) {
        notifyUser(reunion.profesor_rut, 'reunion:recordatorio', {
          type: 'info',
          title: '📅 Recordatorio de Reunión Hoy',
          message: `Reunión con ${reunion.estudiante_nombre} hoy a las ${reunion.hora_inicio}`,
          reunionId: reunion.id,
          fecha: reunion.fecha,
          hora: reunion.hora_inicio,
          lugar: reunion.lugar || reunion.link_reunion
        });
      }
    }

    logger.info(`✅ Recordatorios de reuniones enviados. ${reunionesHoy.length} reuniones hoy`);
  } catch (error) {
    logger.error('Error enviando recordatorios de reuniones:', { error: error.message });
  }
};

/**
 * Verificar evaluaciones pendientes de profesores informantes
 */
const verificarEvaluacionesPendientes = async () => {
  try {
    // Obtener días hábiles del informante de configuración (default 15)
    const [config] = await pool.execute(
      "SELECT valor FROM configuracion_sistema WHERE clave = 'dias_habiles_informante' LIMIT 1"
    );
    const diasHabiles = config.length > 0 ? parseInt(config[0].valor) : 15;

    const [evaluacionesPendientes] = await pool.execute(`
      SELECT 
        hc.id as hito_id,
        hc.nombre_hito as hito_nombre,
        hc.fecha_entrega_real,
        hc.proyecto_id,
        p.titulo as proyecto_titulo,
        ap.profesor_rut,
        u.nombre as profesor_nombre,
        u.email as profesor_email,
        DATEDIFF(NOW(), hc.fecha_entrega_real) as dias_desde_entrega
      FROM hitos_cronograma hc
      INNER JOIN proyectos p ON hc.proyecto_id = p.id
      INNER JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id
      INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
      INNER JOIN usuarios u ON ap.profesor_rut = u.rut
      WHERE hc.tipo_hito = 'entrega_final'
        AND hc.estado = 'entregado'
        AND ap.activo = TRUE
        AND rp.nombre = 'Profesor de Asignatura'
        AND hc.fecha_entrega_real IS NOT NULL
        AND DATEDIFF(NOW(), hc.fecha_entrega_real) >= ?
        AND DATEDIFF(NOW(), hc.fecha_entrega_real) <= ?
    `, [diasHabiles - 3, diasHabiles]); // Alertar 3 días antes del vencimiento

    for (const evaluacion of evaluacionesPendientes) {
      const diasRestantes = diasHabiles - evaluacion.dias_desde_entrega;
      
      notifyUser(evaluacion.profesor_rut, 'evaluacion:pendiente-urgente', {
        type: 'warning',
        title: '⚠️ Evaluación Pendiente Urgente',
        message: `Quedan ${diasRestantes} días para evaluar "${evaluacion.hito_nombre}" del proyecto "${evaluacion.proyecto_titulo}"`,
        hitoId: evaluacion.hito_id,
        proyectoId: evaluacion.proyecto_id,
        diasRestantes: diasRestantes
      });

      if (evaluacion.profesor_email) {
        await emailService.sendRecordatorioEvaluacion(
          evaluacion.profesor_email,
          evaluacion.profesor_nombre,
          evaluacion.proyecto_titulo,
          evaluacion.hito_nombre,
          diasRestantes
        );
      }
    }

    logger.info(`✅ Verificación de evaluaciones pendientes completada. ${evaluacionesPendientes.length} alertas enviadas`);
  } catch (error) {
    logger.error('Error verificando evaluaciones pendientes:', { error: error.message });
  }
};

/**
 * Detener todos los schedulers (útil para testing o shutdown)
 */
export const stopSchedulers = () => {
  schedulerRunning = false;
  logger.info('⏸️ Schedulers detenidos');
};

export default {
  initializeSchedulers,
  stopSchedulers
};
