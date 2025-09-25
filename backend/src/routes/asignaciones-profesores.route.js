import { Router } from 'express';
import * as asignacionesProfesoresModel from '../models/asignaciones-profesores.model.js';
import { ProjectService } from '../services/project.service.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = Router();

// ===== RUTAS PARA ASIGNACIONES DE PROFESORES =====

/**
 * GET /asignaciones-profesores/proyecto/:proyecto_id
 * Obtener todos los profesores asignados a un proyecto
 */
router.get('/proyecto/:proyecto_id', verifySession, async (req, res) => {
    try {
        const { proyecto_id } = req.params;
        
        // Verificar permisos para ver el proyecto
        const puedeVer = await ProjectService.puedeVerProyecto(proyecto_id, req.user.rut, req.user.role_id);
        if (!puedeVer) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver las asignaciones de este proyecto'
            });
        }
        
        const profesores = await asignacionesProfesoresModel.obtenerProfesoresProyecto(parseInt(proyecto_id));
        
        res.json({
            success: true,
            data: profesores
        });
    } catch (error) {
        console.error('Error al obtener asignaciones de profesores:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /asignaciones-profesores/profesor/:profesor_rut
 * Obtener todos los proyectos asignados a un profesor
 */
router.get('/profesor/:profesor_rut', verifySession, async (req, res) => {
    try {
        const { profesor_rut } = req.params;
        const { rol_profesor } = req.query;
        
        // Verificar permisos: solo el mismo profesor, admin, o si es admin puede ver cualquier profesor
        if (req.user.role_id !== 3 && req.user.rut !== profesor_rut) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver las asignaciones de este profesor'
            });
        }
        
        const proyectos = await asignacionesProfesoresModel.obtenerProyectosProfesor(profesor_rut, rol_profesor);
        
        res.json({
            success: true,
            data: proyectos
        });
    } catch (error) {
        console.error('Error al obtener proyectos del profesor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /asignaciones-profesores
 * Asignar un profesor a un proyecto
 */
router.post('/', verifySession, async (req, res) => {
    try {
        const { proyecto_id, profesor_rut, rol_profesor } = req.body;
        
        // Validar datos requeridos
        if (!proyecto_id || !profesor_rut || !rol_profesor) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios: proyecto_id, profesor_rut, rol_profesor'
            });
        }
        
        // Solo admin puede asignar profesores
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden asignar profesores a proyectos'
            });
        }
        
        const asignacionId = await asignacionesProfesoresModel.asignarProfesorAProyecto({
            proyecto_id,
            profesor_rut,
            rol_profesor
        });
        
        const asignacionCreada = await asignacionesProfesoresModel.obtenerAsignacionPorId(asignacionId);
        
        res.status(201).json({
            success: true,
            message: 'Profesor asignado exitosamente',
            data: asignacionCreada
        });
    } catch (error) {
        console.error('Error al asignar profesor:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
});

/**
 * POST /asignaciones-profesores/multiples
 * Asignar múltiples profesores a un proyecto
 */
router.post('/multiples', verifySession, async (req, res) => {
    try {
        const { proyecto_id, asignaciones } = req.body;
        
        // Validar datos requeridos
        if (!proyecto_id || !Array.isArray(asignaciones) || asignaciones.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere proyecto_id y un array de asignaciones no vacío'
            });
        }
        
        // Solo admin puede asignar profesores
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden asignar profesores a proyectos'
            });
        }
        
        const resultados = await ProjectService.asignarProfesoresAProyecto(proyecto_id, asignaciones);
        
        const exitosos = resultados.filter(r => r.exito);
        const fallidos = resultados.filter(r => !r.exito);
        
        res.status(201).json({
            success: true,
            message: `Se procesaron ${resultados.length} asignaciones: ${exitosos.length} exitosas, ${fallidos.length} fallidas`,
            data: {
                exitosos,
                fallidos,
                total: resultados.length
            }
        });
    } catch (error) {
        console.error('Error al asignar múltiples profesores:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * PUT /asignaciones-profesores/proyecto/:proyecto_id/rol/:rol_profesor
 * Cambiar el profesor asignado a un rol específico en un proyecto
 */
router.put('/proyecto/:proyecto_id/rol/:rol_profesor', verifySession, async (req, res) => {
    try {
        const { proyecto_id, rol_profesor } = req.params;
        const { nuevo_profesor_rut } = req.body;
        
        if (!nuevo_profesor_rut) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere nuevo_profesor_rut'
            });
        }
        
        // Solo admin puede cambiar asignaciones
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden cambiar asignaciones de profesores'
            });
        }
        
        const nuevaAsignacionId = await asignacionesProfesoresModel.cambiarProfesorProyecto(
            parseInt(proyecto_id),
            rol_profesor,
            nuevo_profesor_rut
        );
        
        const nuevaAsignacion = await asignacionesProfesoresModel.obtenerAsignacionPorId(nuevaAsignacionId);
        
        res.json({
            success: true,
            message: 'Asignación de profesor cambiada exitosamente',
            data: nuevaAsignacion
        });
    } catch (error) {
        console.error('Error al cambiar asignación de profesor:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Error interno del servidor'
        });
    }
});

/**
 * DELETE /asignaciones-profesores/proyecto/:proyecto_id/rol/:rol_profesor
 * Remover un profesor de un proyecto
 */
router.delete('/proyecto/:proyecto_id/rol/:rol_profesor', verifySession, async (req, res) => {
    try {
        const { proyecto_id, rol_profesor } = req.params;
        
        // Solo admin puede remover asignaciones
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden remover asignaciones de profesores'
            });
        }
        
        const removido = await asignacionesProfesoresModel.removerProfesorProyecto(
            parseInt(proyecto_id),
            rol_profesor
        );
        
        if (!removido) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró la asignación especificada'
            });
        }
        
        res.json({
            success: true,
            message: 'Profesor removido del proyecto exitosamente'
        });
    } catch (error) {
        console.error('Error al remover profesor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /asignaciones-profesores/disponibles/:rol_profesor
 * Obtener profesores disponibles para un rol específico
 */
router.get('/disponibles/:rol_profesor', verifySession, async (req, res) => {
    try {
        const { rol_profesor } = req.params;
        
        // Solo admin puede ver profesores disponibles
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver profesores disponibles'
            });
        }
        
        const profesoresDisponibles = await asignacionesProfesoresModel.obtenerProfesoresDisponibles(rol_profesor);
        
        res.json({
            success: true,
            data: profesoresDisponibles
        });
    } catch (error) {
        console.error('Error al obtener profesores disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /asignaciones-profesores/estadisticas
 * Obtener estadísticas de asignaciones de profesores
 */
router.get('/estadisticas', verifySession, async (req, res) => {
    try {
        const { profesor_rut } = req.query;
        
        // Solo admin puede ver estadísticas generales, profesores solo sus propias estadísticas
        if (req.user.role_id !== 3) {
            if (profesor_rut && profesor_rut !== req.user.rut) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes ver tus propias estadísticas'
                });
            }
        }
        
        const estadisticas = await asignacionesProfesoresModel.obtenerEstadisticasAsignaciones(
            profesor_rut || (req.user.role_id === 2 ? req.user.rut : null)
        );
        
        res.json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /asignaciones-profesores/:asignacion_id
 * Obtener una asignación específica por ID
 */
router.get('/:asignacion_id', verifySession, async (req, res) => {
    try {
        const { asignacion_id } = req.params;
        
        const asignacion = await asignacionesProfesoresModel.obtenerAsignacionPorId(parseInt(asignacion_id));
        
        if (!asignacion) {
            return res.status(404).json({
                success: false,
                message: 'Asignación no encontrada'
            });
        }
        
        // Verificar permisos
        const puedeVer = await ProjectService.puedeVerProyecto(asignacion.proyecto_id, req.user.rut, req.user.role_id);
        if (!puedeVer) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver esta asignación'
            });
        }
        
        res.json({
            success: true,
            data: asignacion
        });
    } catch (error) {
        console.error('Error al obtener asignación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

export default router;