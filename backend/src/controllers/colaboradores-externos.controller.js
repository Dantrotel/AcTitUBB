// Controlador de Colaboradores Externos
import colaboradoresExternosModel from '../models/colaboradores-externos.model.js';
import logger from '../config/logger.js';

const colaboradoresExternosController = {
  /**
   * Obtener todas las entidades externas
   */
  async obtenerEntidades(req, res) {
    try {
      const { activo } = req.query;
      const entidades = await colaboradoresExternosModel.obtenerEntidades({ 
        activo: activo !== undefined ? activo === 'true' : undefined 
      });
      
      res.json({
        success: true,
        entidades
      });
    } catch (error) {
      logger.error('Error en obtenerEntidades', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al obtener entidades externas'
      });
    }
  },

  /**
   * Crear entidad externa
   */
  async crearEntidad(req, res) {
    try {
      // Solo Admin y Super Admin pueden crear entidades
      if (![3, 4].includes(req.user.rol_id)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      
      const resultado = await colaboradoresExternosModel.crearEntidad(req.body);
      
      res.status(201).json({
        success: true,
        mensaje: 'Entidad externa creada exitosamente',
        id: resultado.id
      });
    } catch (error) {
      logger.error('Error en crearEntidad', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al crear entidad externa'
      });
    }
  },

  /**
   * Obtener colaboradores externos
   */
  async obtenerColaboradores(req, res) {
    try {
      const { activo, entidad_id, tipo_colaborador, busqueda } = req.query;
      
      const colaboradores = await colaboradoresExternosModel.obtenerColaboradores({
        activo: activo !== undefined ? activo === 'true' : undefined,
        entidad_id,
        tipo_colaborador,
        busqueda
      });
      
      res.json({
        success: true,
        colaboradores
      });
    } catch (error) {
      logger.error('Error en obtenerColaboradores', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al obtener colaboradores externos'
      });
    }
  },

  /**
   * Crear colaborador externo
   */
  async crearColaborador(req, res) {
    try {
      // Admin, Super Admin y Profesores pueden crear colaboradores
      if (![2, 3, 4].includes(req.user.rol_id)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      
      const resultado = await colaboradoresExternosModel.crearColaborador(
        req.body,
        req.user.rut
      );
      
      res.status(201).json({
        success: true,
        mensaje: 'Colaborador externo creado exitosamente',
        id: resultado.id
      });
    } catch (error) {
      logger.error('Error en crearColaborador', { error: error.message });
      
      if (error.message.includes('Ya existe')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error al crear colaborador externo'
      });
    }
  },

  /**
   * Asignar colaborador a proyecto
   */
  async asignarColaboradorAProyecto(req, res) {
    try {
      // Admin, Super Admin y Profesores pueden asignar
      if (![2, 3, 4].includes(req.user.rol_id)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      
      const resultado = await colaboradoresExternosModel.asignarColaboradorAProyecto(
        req.body,
        req.user.rut
      );
      
      res.status(201).json({
        success: true,
        mensaje: 'Colaborador asignado al proyecto exitosamente',
        id: resultado.id
      });
    } catch (error) {
      logger.error('Error en asignarColaboradorAProyecto', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al asignar colaborador al proyecto'
      });
    }
  },

  /**
   * Obtener colaboradores de un proyecto
   */
  async obtenerColaboradoresDeProyecto(req, res) {
    try {
      const { proyecto_id } = req.params;
      const { activo } = req.query;
      
      const colaboradores = await colaboradoresExternosModel.obtenerColaboradoresDeProyecto(
        proyecto_id,
        activo !== undefined ? activo === 'true' : true
      );
      
      res.json({
        success: true,
        colaboradores
      });
    } catch (error) {
      logger.error('Error en obtenerColaboradoresDeProyecto', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al obtener colaboradores del proyecto'
      });
    }
  },

  /**
   * Desasignar colaborador de proyecto
   */
  async desasignarColaborador(req, res) {
    try {
      // Admin, Super Admin y Profesores pueden desasignar
      if (![2, 3, 4].includes(req.user.rol_id)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      
      const { colaborador_proyecto_id } = req.params;
      const { motivo } = req.body;
      
      await colaboradoresExternosModel.desasignarColaborador(
        colaborador_proyecto_id,
        motivo
      );
      
      res.json({
        success: true,
        mensaje: 'Colaborador desasignado exitosamente'
      });
    } catch (error) {
      logger.error('Error en desasignarColaborador', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al desasignar colaborador'
      });
    }
  },

  /**
   * Crear evaluación de colaborador
   */
  async crearEvaluacion(req, res) {
    try {
      // Admin, Super Admin y Profesores pueden crear evaluaciones
      if (![2, 3, 4].includes(req.user.rol_id)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      
      const resultado = await colaboradoresExternosModel.crearEvaluacion(req.body);
      
      res.status(201).json({
        success: true,
        mensaje: 'Evaluación creada exitosamente',
        id: resultado.id
      });
    } catch (error) {
      logger.error('Error en crearEvaluacion', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al crear evaluación'
      });
    }
  },

  /**
   * Verificar colaborador
   */
  async verificarColaborador(req, res) {
    try {
      // Solo Admin y Super Admin pueden verificar
      if (![3, 4].includes(req.user.rol_id)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      
      const { colaborador_id } = req.params;
      
      await colaboradoresExternosModel.verificarColaborador(
        colaborador_id,
        req.user.rut
      );
      
      res.json({
        success: true,
        mensaje: 'Colaborador verificado exitosamente'
      });
    } catch (error) {
      logger.error('Error en verificarColaborador', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al verificar colaborador'
      });
    }
  },

  /**
   * Obtener proyectos asignados a un colaborador
   */
  async obtenerProyectosDeColaborador(req, res) {
    try {
      const { colaborador_id } = req.params;
      const { activo } = req.query;
      
      const proyectos = await colaboradoresExternosModel.obtenerProyectosDeColaborador(
        colaborador_id,
        activo !== undefined ? activo === 'true' : undefined
      );
      
      res.json({
        success: true,
        proyectos
      });
    } catch (error) {
      logger.error('Error en obtenerProyectosDeColaborador', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Error al obtener proyectos del colaborador'
      });
    }
  }
};

export default colaboradoresExternosController;
