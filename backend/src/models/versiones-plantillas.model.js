// Modelo de Versiones de Documentos y Plantillas
import { pool } from '../db/connectionDB.js';
import logger from '../config/logger.js';

const versionesModel = {
  // ========== VERSIONES DE DOCUMENTOS ==========

  /**
   * Crear nueva versión de documento
   */
  async crearVersion(datosVersion, autorRut) {
    try {
      const {
        avance_id,
        proyecto_id,
        numero_version,
        tipo_version,
        archivo_nombre,
        archivo_ruta,
        archivo_tamano_kb,
        archivo_tipo,
        descripcion_cambios,
        cambios_principales,
        autor_rol,
        comentarios_generales,
        estado,
        es_version_final
      } = datosVersion;

      const [result] = await pool.query(
        `INSERT INTO versiones_documento (
          avance_id, proyecto_id, numero_version, tipo_version, 
          archivo_nombre, archivo_ruta, archivo_tamano_kb, archivo_tipo,
          descripcion_cambios, cambios_principales,
          autor_rut, autor_rol, comentarios_generales, estado, es_version_final
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          avance_id, proyecto_id, numero_version, tipo_version,
          archivo_nombre, archivo_ruta, archivo_tamano_kb, archivo_tipo,
          descripcion_cambios, cambios_principales,
          autorRut, autor_rol, comentarios_generales, estado || 'enviado', 
          es_version_final || false
        ]
      );

      logger.info('Nueva versión de documento creada', { 
        version_id: result.insertId, 
        proyecto_id, 
        numero_version 
      });

      return { id: result.insertId };
    } catch (error) {
      logger.error('Error al crear versión de documento', { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener todas las versiones de un avance
   */
  async obtenerVersionesPorAvance(avance_id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          v.*,
          u.nombres AS autor_nombre,
          u.apellidos AS autor_apellido,
          COUNT(c.id) AS total_comentarios
        FROM versiones_documento v
        LEFT JOIN usuarios u ON v.autor_rut = u.rut
        LEFT JOIN comentarios_version c ON v.id = c.version_id
        WHERE v.avance_id = ?
        GROUP BY v.id
        ORDER BY v.fecha_subida DESC`,
        [avance_id]
      );
      return rows;
    } catch (error) {
      logger.error('Error al obtener versiones por avance', { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener todas las versiones de un proyecto
   */
  async obtenerVersionesPorProyecto(proyecto_id, filtros = {}) {
    try {
      let query = `
        SELECT 
          v.*,
          u.nombres AS autor_nombre,
          u.apellidos AS autor_apellido,
          a.titulo AS avance_titulo,
          COUNT(c.id) AS total_comentarios
        FROM versiones_documento v
        LEFT JOIN usuarios u ON v.autor_rut = u.rut
        LEFT JOIN avances a ON v.avance_id = a.id
        LEFT JOIN comentarios_version c ON v.id = c.version_id
        WHERE v.proyecto_id = ?
      `;

      const params = [proyecto_id];

      if (filtros.tipo_version) {
        query += ` AND v.tipo_version = ?`;
        params.push(filtros.tipo_version);
      }

      if (filtros.estado) {
        query += ` AND v.estado = ?`;
        params.push(filtros.estado);
      }

      if (filtros.autor_rol) {
        query += ` AND v.autor_rol = ?`;
        params.push(filtros.autor_rol);
      }

      query += ` GROUP BY v.id ORDER BY v.fecha_subida DESC`;

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener versiones por proyecto', { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener versión por ID
   */
  async obtenerVersionPorId(version_id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          v.*,
          u.nombres AS autor_nombre,
          u.apellidos AS autor_apellido,
          a.titulo AS avance_titulo,
          p.titulo AS proyecto_titulo
        FROM versiones_documento v
        LEFT JOIN usuarios u ON v.autor_rut = u.rut
        LEFT JOIN avances a ON v.avance_id = a.id
        LEFT JOIN proyectos p ON v.proyecto_id = p.id
        WHERE v.id = ?`,
        [version_id]
      );
      return rows[0];
    } catch (error) {
      logger.error('Error al obtener versión por ID', { error: error.message });
      throw error;
    }
  },

  /**
   * Actualizar estado de versión
   */
  async actualizarEstadoVersion(version_id, estado, comentarios = null) {
    try {
      await pool.query(
        `UPDATE versiones_documento 
         SET estado = ?, 
             comentarios_generales = COALESCE(?, comentarios_generales),
             fecha_revision = CASE WHEN ? IN ('revisado', 'aprobado', 'rechazado') THEN NOW() ELSE fecha_revision END
         WHERE id = ?`,
        [estado, comentarios, estado, version_id]
      );

      logger.info('Estado de versión actualizado', { version_id, estado });
    } catch (error) {
      logger.error('Error al actualizar estado de versión', { error: error.message });
      throw error;
    }
  },

  /**
   * Marcar versión como final
   */
  async marcarVersionFinal(version_id, autorRut) {
    try {
      const conexion = await pool.getConnection();
      await conexion.beginTransaction();

      try {
        // Desmarcar cualquier versión final anterior del mismo avance
        const [version] = await conexion.query(
          'SELECT avance_id FROM versiones_documento WHERE id = ?',
          [version_id]
        );

        if (version.length === 0) {
          throw new Error('Versión no encontrada');
        }

        await conexion.query(
          `UPDATE versiones_documento 
           SET es_version_final = FALSE 
           WHERE avance_id = ?`,
          [version[0].avance_id]
        );

        // Marcar la nueva versión como final
        await conexion.query(
          `UPDATE versiones_documento 
           SET es_version_final = TRUE, estado = 'aprobado' 
           WHERE id = ?`,
          [version_id]
        );

        await conexion.commit();
        logger.info('Versión marcada como final', { version_id });
      } catch (error) {
        await conexion.rollback();
        throw error;
      } finally {
        conexion.release();
      }
    } catch (error) {
      logger.error('Error al marcar versión como final', { error: error.message });
      throw error;
    }
  },

  /**
   * Calcular número de versión siguiente
   */
  async calcularSiguienteVersion(avance_id) {
    try {
      const [rows] = await pool.query(
        `SELECT numero_version 
         FROM versiones_documento 
         WHERE avance_id = ? 
         ORDER BY fecha_subida DESC 
         LIMIT 1`,
        [avance_id]
      );

      if (rows.length === 0) {
        return 'v1.0';
      }

      // Parsear versión actual (ej: v1.2)
      const versionActual = rows[0].numero_version;
      const match = versionActual.match(/v(\d+)\.(\d+)/);
      
      if (match) {
        const mayor = parseInt(match[1]);
        const menor = parseInt(match[2]);
        return `v${mayor}.${menor + 1}`;
      }

      return 'v1.0';
    } catch (error) {
      logger.error('Error al calcular siguiente versión', { error: error.message });
      throw error;
    }
  },

  // ========== COMENTARIOS DE VERSIONES ==========

  /**
   * Crear comentario en una versión
   */
  async crearComentario(datosComentario, autorRut) {
    try {
      const {
        version_id,
        comentario,
        tipo_comentario,
        prioridad,
        seccion_referencia,
        autor_rol
      } = datosComentario;

      // Obtener nombre del autor
      const [usuario] = await pool.query(
        'SELECT CONCAT(nombres, " ", apellidos) AS nombre_completo FROM usuarios WHERE rut = ?',
        [autorRut]
      );

      const [result] = await pool.query(
        `INSERT INTO comentarios_version (
          version_id, autor_rut, autor_nombre, autor_rol, 
          comentario, tipo_comentario, prioridad, seccion_referencia
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          version_id, autorRut, 
          usuario.length > 0 ? usuario[0].nombre_completo : null,
          autor_rol, comentario, 
          tipo_comentario || 'general',
          prioridad || 'media',
          seccion_referencia
        ]
      );

      logger.info('Comentario de versión creado', { comentario_id: result.insertId, version_id });
      return { id: result.insertId };
    } catch (error) {
      logger.error('Error al crear comentario de versión', { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener comentarios de una versión
   */
  async obtenerComentariosPorVersion(version_id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          c.*,
          u.nombres AS autor_nombre_usuario,
          u.apellidos AS autor_apellido_usuario
        FROM comentarios_version c
        LEFT JOIN usuarios u ON c.autor_rut = u.rut
        WHERE c.version_id = ?
        ORDER BY c.created_at ASC`,
        [version_id]
      );
      return rows;
    } catch (error) {
      logger.error('Error al obtener comentarios de versión', { error: error.message });
      throw error;
    }
  },

  /**
   * Marcar comentario como resuelto
   */
  async resolverComentario(comentario_id) {
    try {
      await pool.query(
        `UPDATE comentarios_version 
         SET resuelto = TRUE, fecha_resolucion = NOW() 
         WHERE id = ?`,
        [comentario_id]
      );
      logger.info('Comentario marcado como resuelto', { comentario_id });
    } catch (error) {
      logger.error('Error al resolver comentario', { error: error.message });
      throw error;
    }
  },

  // ========== PLANTILLAS ==========

  /**
   * Crear plantilla de documento
   */
  async crearPlantilla(datosPlantilla, creadoPorRut) {
    try {
      const {
        nombre,
        descripcion,
        tipo_documento,
        archivo_nombre,
        archivo_ruta,
        archivo_tipo,
        archivo_tamano_kb,
        carrera_id,
        departamento_id,
        facultad_id,
        version_plantilla,
        formato_requerido,
        instrucciones,
        ejemplo_url,
        obligatoria
      } = datosPlantilla;

      const [result] = await pool.query(
        `INSERT INTO plantillas_documentos (
          nombre, descripcion, tipo_documento, archivo_nombre, archivo_ruta,
          archivo_tipo, archivo_tamano_kb, carrera_id, departamento_id, facultad_id,
          version_plantilla, formato_requerido, instrucciones, ejemplo_url,
          obligatoria, creado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          nombre, descripcion, tipo_documento, archivo_nombre, archivo_ruta,
          archivo_tipo, archivo_tamano_kb, carrera_id, departamento_id, facultad_id,
          version_plantilla || '1.0', formato_requerido, instrucciones, ejemplo_url,
          obligatoria || false, creadoPorRut
        ]
      );

      logger.info('Plantilla de documento creada', { plantilla_id: result.insertId });
      return { id: result.insertId };
    } catch (error) {
      logger.error('Error al crear plantilla', { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener plantillas disponibles (con filtros opcionales)
   */
  async obtenerPlantillas(filtros = {}) {
    try {
      let query = `
        SELECT 
          p.*,
          c.nombre AS carrera_nombre,
          d.nombre AS departamento_nombre,
          f.nombre AS facultad_nombre,
          u.nombres AS creador_nombre,
          u.apellidos AS creador_apellido
        FROM plantillas_documentos p
        LEFT JOIN carreras c ON p.carrera_id = c.id
        LEFT JOIN departamentos d ON p.departamento_id = d.id
        LEFT JOIN facultades f ON p.facultad_id = f.id
        LEFT JOIN usuarios u ON p.creado_por = u.rut
        WHERE p.activa = TRUE
      `;

      const params = [];

      if (filtros.tipo_documento) {
        query += ` AND p.tipo_documento = ?`;
        params.push(filtros.tipo_documento);
      }

      if (filtros.carrera_id) {
        query += ` AND (p.carrera_id = ? OR p.carrera_id IS NULL)`;
        params.push(filtros.carrera_id);
      }

      if (filtros.obligatoria !== undefined) {
        query += ` AND p.obligatoria = ?`;
        params.push(filtros.obligatoria);
      }

      query += ` ORDER BY p.orden_visualizacion ASC, p.created_at DESC`;

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      logger.error('Error al obtener plantillas', { error: error.message });
      throw error;
    }
  },

  /**
   * Incrementar contador de descargas de plantilla
   */
  async incrementarDescargas(plantilla_id) {
    try {
      await pool.query(
        'UPDATE plantillas_documentos SET descargas = descargas + 1 WHERE id = ?',
        [plantilla_id]
      );
    } catch (error) {
      logger.error('Error al incrementar descargas', { error: error.message });
      throw error;
    }
  },

  /**
   * Actualizar plantilla
   */
  async actualizarPlantilla(plantilla_id, datosActualizacion, actualizadoPorRut) {
    try {
      const campos = [];
      const valores = [];

      Object.keys(datosActualizacion).forEach(key => {
        if (datosActualizacion[key] !== undefined) {
          campos.push(`${key} = ?`);
          valores.push(datosActualizacion[key]);
        }
      });

      if (campos.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      campos.push('actualizado_por = ?');
      valores.push(actualizadoPorRut);
      valores.push(plantilla_id);

      await pool.query(
        `UPDATE plantillas_documentos SET ${campos.join(', ')} WHERE id = ?`,
        valores
      );

      logger.info('Plantilla actualizada', { plantilla_id });
    } catch (error) {
      logger.error('Error al actualizar plantilla', { error: error.message });
      throw error;
    }
  },

  /**
   * Desactivar plantilla
   */
  async desactivarPlantilla(plantilla_id) {
    try {
      await pool.query(
        'UPDATE plantillas_documentos SET activa = FALSE WHERE id = ?',
        [plantilla_id]
      );
      logger.info('Plantilla desactivada', { plantilla_id });
    } catch (error) {
      logger.error('Error al desactivar plantilla', { error: error.message });
      throw error;
    }
  },

  // ========== RESULTADOS FINALES ==========

  /**
   * Crear resultado final de proyecto
   */
  async crearResultadoFinal(datosResultado, cerradoPorRut) {
    try {
      const {
        proyecto_id,
        estado_final,
        evaluacion_profesor_guia,
        evaluacion_profesor_informante,
        evaluacion_comision,
        observaciones_finales,
        recomendaciones,
        areas_destacadas,
        documento_final,
        acta_aprobacion,
        mencion_honores,
        mencion_excelencia,
        publicacion_recomendada,
        fecha_aprobacion
      } = datosResultado;

      const [result] = await pool.query(
        `INSERT INTO resultados_finales_proyecto (
          proyecto_id, estado_final, evaluacion_profesor_guia, 
          evaluacion_profesor_informante, evaluacion_comision,
          observaciones_finales, recomendaciones, areas_destacadas,
          documento_final, acta_aprobacion,
          mencion_honores, mencion_excelencia, publicacion_recomendada,
          fecha_aprobacion, cerrado_por
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          proyecto_id, estado_final, evaluacion_profesor_guia,
          evaluacion_profesor_informante, evaluacion_comision,
          observaciones_finales, recomendaciones, areas_destacadas,
          documento_final, acta_aprobacion,
          mencion_honores || false, mencion_excelencia || false, 
          publicacion_recomendada || false,
          fecha_aprobacion, cerradoPorRut
        ]
      );

      // Registrar cambio de estado
      await this.registrarCambioEstado(proyecto_id, null, estado_final, 
        'Cierre del proyecto', cerradoPorRut);

      logger.info('Resultado final creado', { proyecto_id, estado_final });
      return { id: result.insertId };
    } catch (error) {
      logger.error('Error al crear resultado final', { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener resultado final de proyecto
   */
  async obtenerResultadoFinal(proyecto_id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          r.*,
          u.nombres AS cerrado_por_nombre,
          u.apellidos AS cerrado_por_apellido
        FROM resultados_finales_proyecto r
        LEFT JOIN usuarios u ON r.cerrado_por = u.rut
        WHERE r.proyecto_id = ?`,
        [proyecto_id]
      );
      return rows[0];
    } catch (error) {
      logger.error('Error al obtener resultado final', { error: error.message });
      throw error;
    }
  },

  /**
   * Registrar cambio de estado de proyecto
   */
  async registrarCambioEstado(proyecto_id, estado_anterior, estado_nuevo, motivo, cambiado_por) {
    try {
      await pool.query(
        `INSERT INTO historial_estados_proyecto 
         (proyecto_id, estado_anterior, estado_nuevo, motivo, cambiado_por)
         VALUES (?, ?, ?, ?, ?)`,
        [proyecto_id, estado_anterior, estado_nuevo, motivo, cambiado_por]
      );
    } catch (error) {
      logger.error('Error al registrar cambio de estado', { error: error.message });
      throw error;
    }
  },

  /**
   * Obtener historial de estados de proyecto
   */
  async obtenerHistorialEstados(proyecto_id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          h.*,
          u.nombres AS cambiado_por_nombre,
          u.apellidos AS cambiado_por_apellido
        FROM historial_estados_proyecto h
        LEFT JOIN usuarios u ON h.cambiado_por = u.rut
        WHERE h.proyecto_id = ?
        ORDER BY h.fecha_cambio DESC`,
        [proyecto_id]
      );
      return rows;
    } catch (error) {
      logger.error('Error al obtener historial de estados', { error: error.message });
      throw error;
    }
  }
};

export default versionesModel;
