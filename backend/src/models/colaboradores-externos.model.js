// Modelo de Colaboradores Externos
import { pool } from '../db/connectionDB.js';
import { logger } from '../config/logger.js';

const colaboradoresExternosModel = {
  /**
   * Obtener todas las entidades externas
   */
  async obtenerEntidades(filtros = {}) {
    try {
      const { activo } = filtros;
      let query = 'SELECT * FROM entidades_externas';
      const params = [];
      
      if (activo !== undefined) {
        query += ' WHERE activo = ?';
        params.push(activo);
      }
      
      query += ' ORDER BY nombre ASC';
      
      const [entidades] = await pool.query(query, params);
      return entidades;
    } catch (error) {
      logger.error('Error obteniendo entidades externas', { error: error.message });
      throw error;
    }
  },

  /**
   * Crear nueva entidad externa
   */
  async crearEntidad(datosEntidad) {
    try {
      const [result] = await pool.query(
        `INSERT INTO entidades_externas 
        (nombre, razon_social, rut_empresa, tipo, email_contacto, telefono, 
         direccion, sitio_web, descripcion, area_actividad) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          datosEntidad.nombre,
          datosEntidad.razon_social || null,
          datosEntidad.rut_empresa || null,
          datosEntidad.tipo,
          datosEntidad.email_contacto || null,
          datosEntidad.telefono || null,
          datosEntidad.direccion || null,
          datosEntidad.sitio_web || null,
          datosEntidad.descripcion || null,
          datosEntidad.area_actividad || null
        ]
      );
      
      return { id: result.insertId };
    } catch (error) {
      logger.error('Error creando entidad externa', { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener colaboradores externos con filtros
   */
  async obtenerColaboradores(filtros = {}) {
    try {
      const { activo, entidad_id, tipo_colaborador, busqueda } = filtros;
      
      let query = `
        SELECT 
          c.*,
          e.nombre as entidad_nombre,
          u.nombre as creado_por_nombre,
          uv.nombre as verificado_por_nombre
        FROM colaboradores_externos c
        LEFT JOIN entidades_externas e ON c.entidad_id = e.id
        LEFT JOIN usuarios u ON c.creado_por = u.rut
        LEFT JOIN usuarios uv ON c.verificado_por = uv.rut
        WHERE 1=1
      `;
      const params = [];
      
      if (activo !== undefined) {
        query += ' AND c.activo = ?';
        params.push(activo);
      }
      
      if (entidad_id) {
        query += ' AND c.entidad_id = ?';
        params.push(entidad_id);
      }
      
      if (tipo_colaborador) {
        query += ' AND c.tipo_colaborador = ?';
        params.push(tipo_colaborador);
      }
      
      if (busqueda) {
        query += ' AND (c.nombre_completo LIKE ? OR c.email LIKE ? OR c.especialidad LIKE ?)';
        const searchTerm = `%${busqueda}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      query += ' ORDER BY c.nombre_completo ASC';
      
      const [colaboradores] = await pool.query(query, params);
      return colaboradores;
    } catch (error) {
      logger.error('Error obteniendo colaboradores externos', { error: error.message });
      throw error;
    }
  },

  /**
   * Crear nuevo colaborador externo
   */
  async crearColaborador(datosColaborador, creado_por) {
    try {
      // Verificar si el email ya existe
      const [existing] = await pool.query(
        'SELECT id FROM colaboradores_externos WHERE email = ?',
        [datosColaborador.email]
      );
      
      if (existing.length > 0) {
        throw new Error('Ya existe un colaborador con ese email');
      }
      
      const [result] = await pool.query(
        `INSERT INTO colaboradores_externos 
        (nombre_completo, rut, email, telefono, entidad_id, cargo, area_departamento,
         especialidad, anos_experiencia, linkedin, tipo_colaborador, biografia, 
         observaciones, creado_por) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          datosColaborador.nombre_completo,
          datosColaborador.rut || null,
          datosColaborador.email,
          datosColaborador.telefono || null,
          datosColaborador.entidad_id || null,
          datosColaborador.cargo || null,
          datosColaborador.area_departamento || null,
          datosColaborador.especialidad || null,
          datosColaborador.anos_experiencia || null,
          datosColaborador.linkedin || null,
          datosColaborador.tipo_colaborador || 'supervisor_empresa',
          datosColaborador.biografia || null,
          datosColaborador.observaciones || null,
          creado_por
        ]
      );
      
      return { id: result.insertId };
    } catch (error) {
      logger.error('Error creando colaborador externo', { error: error.message });
      throw error;
    }
  },

  /**
   * Asignar colaborador a proyecto
   */
  async asignarColaboradorAProyecto(datos, asignado_por) {
    try {
      const [result] = await pool.query(
        `INSERT INTO colaboradores_proyectos 
        (proyecto_id, colaborador_id, rol_en_proyecto, descripcion_rol, 
         fecha_inicio, horas_dedicadas, frecuencia_interaccion, puede_evaluar, asignado_por) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          datos.proyecto_id,
          datos.colaborador_id,
          datos.rol_en_proyecto,
          datos.descripcion_rol || null,
          datos.fecha_inicio || new Date(),
          datos.horas_dedicadas || null,
          datos.frecuencia_interaccion || null,
          datos.puede_evaluar || false,
          asignado_por
        ]
      );
      
      return { id: result.insertId };
    } catch (error) {
      logger.error('Error asignando colaborador a proyecto', { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener colaboradores de un proyecto
   */
  async obtenerColaboradoresDeProyecto(proyecto_id, activo = true) {
    try {
      const [colaboradores] = await pool.query(
        `SELECT 
          cp.*,
          c.nombre_completo,
          c.email,
          c.telefono,
          c.cargo,
          c.especialidad,
          c.tipo_colaborador,
          e.nombre as entidad_nombre,
          u.nombre as asignado_por_nombre
        FROM colaboradores_proyectos cp
        INNER JOIN colaboradores_externos c ON cp.colaborador_id = c.id
        LEFT JOIN entidades_externas e ON c.entidad_id = e.id
        LEFT JOIN usuarios u ON cp.asignado_por = u.rut
        WHERE cp.proyecto_id = ? AND cp.activo = ?
        ORDER BY cp.fecha_inicio DESC`,
        [proyecto_id, activo]
      );
      
      return colaboradores;
    } catch (error) {
      logger.error('Error obteniendo colaboradores del proyecto', { error: error.message });
      throw error;
    }
  },

  /**
   * Desasignar colaborador de proyecto
   */
  async desasignarColaborador(colaborador_proyecto_id, motivo = null) {
    try {
      await pool.query(
        `UPDATE colaboradores_proyectos 
        SET activo = FALSE, fecha_fin = CURDATE(), motivo_desvinculacion = ?
        WHERE id = ?`,
        [motivo, colaborador_proyecto_id]
      );
      
      return { success: true };
    } catch (error) {
      logger.error('Error desasignando colaborador', { error: error.message });
      throw error;
    }
  },

  /**
   * Crear evaluación de colaborador externo
   */
  async crearEvaluacion(datosEvaluacion) {
    try {
      const [result] = await pool.query(
        `INSERT INTO evaluaciones_colaboradores_externos 
        (colaborador_proyecto_id, proyecto_id, colaborador_id, estudiante_rut,
         fecha_evaluacion, calificacion, asistencia_puntualidad, calidad_trabajo,
         proactividad, trabajo_equipo, comunicacion, cumplimiento_plazos,
         fortalezas, areas_mejora, comentarios_generales, recomendaria_estudiante) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          datosEvaluacion.colaborador_proyecto_id,
          datosEvaluacion.proyecto_id,
          datosEvaluacion.colaborador_id,
          datosEvaluacion.estudiante_rut,
          datosEvaluacion.fecha_evaluacion || new Date(),
          datosEvaluacion.calificacion || null,
          datosEvaluacion.asistencia_puntualidad || null,
          datosEvaluacion.calidad_trabajo || null,
          datosEvaluacion.proactividad || null,
          datosEvaluacion.trabajo_equipo || null,
          datosEvaluacion.comunicacion || null,
          datosEvaluacion.cumplimiento_plazos || null,
          datosEvaluacion.fortalezas || null,
          datosEvaluacion.areas_mejora || null,
          datosEvaluacion.comentarios_generales || null,
          datosEvaluacion.recomendaria_estudiante || null
        ]
      );
      
      // Marcar evaluación como realizada
      await pool.query(
        'UPDATE colaboradores_proyectos SET evaluacion_realizada = TRUE WHERE id = ?',
        [datosEvaluacion.colaborador_proyecto_id]
      );
      
      return { id: result.insertId };
    } catch (error) {
      logger.error('Error creando evaluación', { error: error.message });
      throw error;
    }
  },

  /**
   * Verificar colaborador
   */
  async verificarColaborador(colaborador_id, verificado_por) {
    try {
      await pool.query(
        `UPDATE colaboradores_externos 
        SET verificado = TRUE, fecha_verificacion = NOW(), verificado_por = ?
        WHERE id = ?`,
        [verificado_por, colaborador_id]
      );
      
      return { success: true };
    } catch (error) {
      logger.error('Error verificando colaborador', { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener proyectos asignados a un colaborador
   */
  async obtenerProyectosDeColaborador(colaboradorId, activo = undefined) {
    try {
      let query = `
        SELECT 
          cp.id,
          cp.proyecto_id,
          cp.colaborador_id,
          cp.rol_en_proyecto,
          cp.descripcion_rol,
          cp.fecha_inicio,
          cp.fecha_fin,
          cp.horas_dedicadas,
          cp.frecuencia_interaccion,
          cp.puede_evaluar,
          cp.evaluacion_realizada,
          cp.activo,
          cp.created_at,
          cp.updated_at,
          p.titulo AS proyecto_titulo,
          p.descripcion AS proyecto_descripcion,
          p.estado_id AS proyecto_estado_id,
          p.estudiante_rut,
          u.nombre AS estudiante_nombre
        FROM colaboradores_proyectos cp
        INNER JOIN proyectos p ON cp.proyecto_id = p.id
        LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
        WHERE cp.colaborador_id = ?
      `;
      
      const params = [colaboradorId];
      
      if (activo !== undefined) {
        query += ' AND cp.activo = ?';
        params.push(activo);
      }
      
      query += ' ORDER BY cp.fecha_inicio DESC';
      
      const [proyectos] = await pool.query(query, params);
      return proyectos;
    } catch (error) {
      logger.error('Error obteniendo proyectos del colaborador', { error: error.message });
      throw error;
    }
  }
};

export default colaboradoresExternosModel;
