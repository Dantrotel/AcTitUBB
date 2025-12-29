// Controlador para gestión de configuraciones del sistema
import { pool } from '../db/connectionDB.js';
import logger from '../config/logger.js';

/**
 * Obtener todas las configuraciones del sistema
 */
export const obtenerConfiguraciones = async (req, res) => {
  try {
    const [configuraciones] = await pool.execute(`
      SELECT clave, valor, descripcion, tipo_valor 
      FROM configuracion_sistema 
      ORDER BY clave
    `);

    res.json({
      success: true,
      configuraciones
    });
  } catch (error) {
    logger.error('Error obteniendo configuraciones:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuraciones'
    });
  }
};

/**
 * Actualizar una configuración específica
 */
export const actualizarConfiguracion = async (req, res) => {
  try {
    const { clave } = req.params;
    const { valor } = req.body;
    const usuario_rut = req.user?.rut;
    const rol_id = req.user?.rol_id;

    // Validación: solo super admin puede modificar configuraciones
    if (rol_id !== 4) {
      return res.status(403).json({
        success: false,
        message: 'Solo el super administrador puede modificar configuraciones del sistema'
      });
    }

    // Validar que la configuración existe
    const [exists] = await pool.execute(
      'SELECT tipo_valor FROM configuracion_sistema WHERE clave = ?',
      [clave]
    );

    if (exists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Configuración no encontrada'
      });
    }

    const tipoValor = exists[0].tipo_valor;

    // Validar el tipo de valor
    if (tipoValor === 'entero') {
      const numValue = parseInt(valor);
      if (isNaN(numValue) || numValue < 0) {
        return res.status(400).json({
          success: false,
          message: 'El valor debe ser un número entero positivo'
        });
      }
    } else if (tipoValor === 'booleano') {
      if (valor !== 'true' && valor !== 'false') {
        return res.status(400).json({
          success: false,
          message: 'El valor debe ser true o false'
        });
      }
    }

    // Actualizar configuración
    await pool.execute(
      'UPDATE configuracion_sistema SET valor = ? WHERE clave = ?',
      [valor.toString(), clave]
    );

    logger.info('Configuración actualizada', {
      clave,
      valor,
      usuario: usuario_rut
    });

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      clave,
      valor
    });
  } catch (error) {
    logger.error('Error actualizando configuración:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error al actualizar configuración'
    });
  }
};

/**
 * Obtener estadísticas globales del sistema
 */
export const obtenerEstadisticasGlobales = async (req, res) => {
  try {
    const rol_id = req.user?.rol_id;

    // Solo super admin puede ver estadísticas globales
    if (rol_id !== 4) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver estadísticas globales'
      });
    }

    // Estadísticas de usuarios
    const [usuarios] = await pool.execute(`
      SELECT 
        rol_id,
        COUNT(*) as total
      FROM usuarios
      GROUP BY rol_id
    `);

    // Estadísticas de propuestas
    const [propuestas] = await pool.execute(`
      SELECT 
        estado_id,
        COUNT(*) as total
      FROM propuestas
      GROUP BY estado_id
    `);

    // Estadísticas de proyectos
    const [proyectos] = await pool.execute(`
      SELECT 
        estado_detallado,
        COUNT(*) as total
      FROM proyectos
      GROUP BY estado_detallado
    `);

    // Proyectos por carrera
    const [proyectosPorCarrera] = await pool.execute(`
      SELECT 
        c.nombre as carrera,
        COUNT(p.id) as total_proyectos,
        SUM(CASE WHEN p.estado_detallado IN ('cerrado', 'defendido') THEN 1 ELSE 0 END) as completados,
        SUM(CASE WHEN DATEDIFF(NOW(), p.ultima_actividad_fecha) > 30 THEN 1 ELSE 0 END) as en_riesgo
      FROM proyectos p
      INNER JOIN usuarios u ON p.estudiante_rut = u.rut
      INNER JOIN estudiantes_carreras ec ON u.rut = ec.estudiante_rut AND ec.es_carrera_principal = TRUE
      INNER JOIN carreras c ON ec.carrera_id = c.id
      WHERE p.estado_detallado NOT IN ('cerrado')
      GROUP BY c.id, c.nombre
      ORDER BY total_proyectos DESC
    `);

    // Carga de profesores
    const [cargaProfesores] = await pool.execute(`
      SELECT 
        u.rut,
        u.nombre,
        u.email,
        d.nombre as departamento,
        COUNT(DISTINCT ap.proyecto_id) as total_proyectos,
        SUM(CASE WHEN rp.nombre = 'Profesor Guía' THEN 1 ELSE 0 END) as como_guia,
        SUM(CASE WHEN rp.nombre = 'Profesor Informante' THEN 1 ELSE 0 END) as como_informante
      FROM usuarios u
      LEFT JOIN departamentos d ON u.departamento_id = d.id
      LEFT JOIN asignaciones_proyectos ap ON u.rut = ap.profesor_rut AND ap.activo = TRUE
      LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
      WHERE u.rol_id IN (2, 3)
      GROUP BY u.rut, u.nombre, u.email, d.nombre
      ORDER BY total_proyectos DESC
      LIMIT 20
    `);

    // Actividad reciente
    const [actividadReciente] = await pool.execute(`
      SELECT 
        'propuesta' as tipo,
        p.titulo,
        p.fecha_envio as fecha,
        u.nombre as usuario
      FROM propuestas p
      INNER JOIN usuarios u ON p.estudiante_rut = u.rut
      WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      UNION ALL
      SELECT 
        'proyecto' as tipo,
        p.titulo,
        p.fecha_inicio as fecha,
        u.nombre as usuario
      FROM proyectos p
      INNER JOIN usuarios u ON p.estudiante_rut = u.rut
      WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY fecha DESC
      LIMIT 10
    `);

    // Cumplimiento de plazos
    const [cumplimientoPlazos] = await pool.execute(`
      SELECT 
        COUNT(*) as total_entregas,
        SUM(CASE WHEN cumplido_en_fecha = TRUE THEN 1 ELSE 0 END) as entregas_a_tiempo,
        ROUND((SUM(CASE WHEN cumplido_en_fecha = TRUE THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as porcentaje_cumplimiento
      FROM hitos_cronograma
      WHERE fecha_entrega_real IS NOT NULL
        AND created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
    `);

    res.json({
      success: true,
      estadisticas: {
        usuarios: usuarios.reduce((acc, u) => {
          const roles = { 1: 'estudiantes', 2: 'profesores', 3: 'admins', 4: 'super_admins' };
          acc[roles[u.rol_id]] = u.total;
          return acc;
        }, {}),
        propuestas: propuestas.reduce((acc, p) => {
          acc[`estado_${p.estado_id}`] = p.total;
          return acc;
        }, {}),
        proyectos: proyectos.reduce((acc, p) => {
          acc[p.estado_detallado] = p.total;
          return acc;
        }, {}),
        proyectos_por_carrera: proyectosPorCarrera,
        carga_profesores: cargaProfesores,
        actividad_reciente: actividadReciente,
        cumplimiento_plazos: cumplimientoPlazos[0] || { total_entregas: 0, entregas_a_tiempo: 0, porcentaje_cumplimiento: 0 }
      }
    });
  } catch (error) {
    logger.error('Error obteniendo estadísticas globales:', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas globales'
    });
  }
};

export default {
  obtenerConfiguraciones,
  actualizarConfiguracion,
  obtenerEstadisticasGlobales
};
