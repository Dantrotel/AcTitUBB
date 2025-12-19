// Rutas de Colaboradores Externos
import express from 'express';
import colaboradoresExternosController from '../controllers/colaboradores-externos.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

// === Rutas de Entidades Externas (Empresas/Organizaciones) ===

/**
 * GET /api/v1/colaboradores-externos/entidades
 * Obtener todas las entidades externas
 * Query params: activo (boolean)
 * Roles permitidos: Todos los autenticados
 */
router.get('/entidades', colaboradoresExternosController.obtenerEntidades);

/**
 * POST /api/v1/colaboradores-externos/entidades
 * Crear nueva entidad externa
 * Body: { nombre, razon_social, rut_empresa, tipo, email_contacto, ... }
 * Roles permitidos: Admin, Super Admin
 */
router.post('/entidades', colaboradoresExternosController.crearEntidad);

// === Rutas de Colaboradores Externos ===

/**
 * GET /api/v1/colaboradores-externos
 * Obtener colaboradores externos
 * Query params: activo, entidad_id, tipo_colaborador, busqueda
 * Roles permitidos: Todos los autenticados
 */
router.get('/', colaboradoresExternosController.obtenerColaboradores);

/**
 * POST /api/v1/colaboradores-externos
 * Crear colaborador externo
 * Body: { nombre_completo, email, entidad_id, cargo, tipo_colaborador, ... }
 * Roles permitidos: Profesor, Admin, Super Admin
 */
router.post('/', colaboradoresExternosController.crearColaborador);

/**
 * PUT /api/v1/colaboradores-externos/:colaborador_id/verificar
 * Verificar identidad de colaborador
 * Roles permitidos: Admin, Super Admin
 */
router.put('/:colaborador_id/verificar', colaboradoresExternosController.verificarColaborador);

// === Rutas de Asignación a Proyectos ===

/**
 * POST /api/v1/colaboradores-externos/proyectos/asignar
 * Asignar colaborador a proyecto
 * Body: { proyecto_id, colaborador_id, rol_en_proyecto, puede_evaluar, ... }
 * Roles permitidos: Profesor, Admin, Super Admin
 */
router.post('/proyectos/asignar', colaboradoresExternosController.asignarColaboradorAProyecto);

/**
 * GET /api/v1/colaboradores-externos/proyectos-colaborador/:colaborador_id
 * Obtener proyectos asignados a un colaborador específico
 * Query params: activo (boolean)
 * Roles permitidos: Todos los autenticados
 */
router.get('/proyectos-colaborador/:colaborador_id', colaboradoresExternosController.obtenerProyectosDeColaborador);

/**
 * GET /api/v1/colaboradores-externos/proyectos/:proyecto_id
 * Obtener colaboradores de un proyecto específico
 * Query params: activo (boolean)
 * Roles permitidos: Todos los autenticados
 */
router.get('/proyectos/:proyecto_id', colaboradoresExternosController.obtenerColaboradoresDeProyecto);

/**
 * DELETE /api/v1/colaboradores-externos/proyectos/:colaborador_proyecto_id
 * Desasignar colaborador de proyecto
 * Body: { motivo }
 * Roles permitidos: Profesor, Admin, Super Admin
 */
router.delete('/proyectos/:colaborador_proyecto_id', colaboradoresExternosController.desasignarColaborador);

// === Rutas de Evaluaciones ===

/**
 * POST /api/v1/colaboradores-externos/evaluaciones
 * Crear evaluación de colaborador externo sobre estudiante
 * Body: { colaborador_proyecto_id, proyecto_id, colaborador_id, estudiante_rut, ... }
 * Roles permitidos: Profesor, Admin, Super Admin
 */
router.post('/evaluaciones', colaboradoresExternosController.crearEvaluacion);

export default router;
