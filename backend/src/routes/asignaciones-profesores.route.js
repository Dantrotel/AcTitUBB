import { Router } from 'express';
import { verifySession } from '../middlewares/verifySession.js';
import { pool } from '../db/connectionDB.js';
import * as asignacionesProfesoresModel from '../models/asignaciones-profesores.model.js';

const router = Router();

// ===== RUTAS PARA ASIGNACIONES DE PROFESORES =====

/**
 * GET /asignaciones-profesores/proyecto/:proyecto_id
 * Obtener todos los profesores asignados a un proyecto
 */
router.get('/proyecto/:proyecto_id', verifySession, async (req, res) => {
    try {
        const { proyecto_id } = req.params;
        
        const profesores = await asignacionesProfesoresModel.obtenerProfesoresAsignados(proyecto_id);
        
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
        
        const proyectos = await asignacionesProfesoresModel.obtenerProyectosAsignadosProfesor(profesor_rut);
        
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

// ===== ASIGNACIONES DE PROFESORES A PROYECTOS =====

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
 * PUT /asignaciones-profesores/proyecto/:proyecto_id/rol/:rol_profesor_id
 * Cambiar el profesor asignado a un rol específico en un proyecto
 */
router.put('/proyecto/:proyecto_id/rol/:rol_profesor_id', verifySession, async (req, res) => {
    try {
        const { proyecto_id, rol_profesor_id } = req.params;
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
            parseInt(rol_profesor_id),
            nuevo_profesor_rut,
            req.user.rut
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
 * DELETE /asignaciones-profesores/proyecto/:proyecto_id/rol/:rol_profesor_id
 * Remover un profesor de un proyecto
 */
router.delete('/proyecto/:proyecto_id/rol/:rol_profesor_id', verifySession, async (req, res) => {
    try {
        const { proyecto_id, rol_profesor_id } = req.params;
        
        // Solo admin puede remover asignaciones
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden remover asignaciones de profesores'
            });
        }
        
        const removido = await asignacionesProfesoresModel.removerProfesorProyecto(
            parseInt(proyecto_id),
            parseInt(rol_profesor_id)
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
 * GET /asignaciones-profesores/disponibles/:rol_profesor_id
 * Obtener profesores disponibles para un rol específico
 */
router.get('/disponibles/:rol_profesor_id', verifySession, async (req, res) => {
    try {
        const { rol_profesor_id } = req.params;
        
        // Solo admin puede ver profesores disponibles
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver profesores disponibles'
            });
        }
        
        const profesoresDisponibles = await asignacionesProfesoresModel.obtenerProfesoresDisponibles(parseInt(rol_profesor_id));
        
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

/**
 * GET /asignaciones-profesores/admin/todas
 * Obtener todas las asignaciones de profesores (solo admin)
 */
router.get('/admin/todas', verifySession, async (req, res) => {
    try {
        // Verificar que sea admin (role_id = 3)
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver todas las asignaciones'
            });
        }
        
        // Verificar estructura de la tabla roles_profesores
        try {
            console.log('🔍 Verificando estructura de roles_profesores...');
            const [columns] = await pool.execute('DESCRIBE roles_profesores');
            console.log('📋 Columnas disponibles:', columns.map(col => col.Field));
            
            const [roleCount] = await pool.execute('SELECT COUNT(*) as total FROM roles_profesores');
            console.log('📊 Total de roles:', roleCount[0].total);
            
            // Verificar si la tabla tiene datos
            const [sampleRoles] = await pool.execute('SELECT * FROM roles_profesores LIMIT 3');
            console.log('🔍 Muestra de roles:', sampleRoles);
        } catch (diagError) {
            console.error('❌ Error en diagnóstico:', diagError);
        }
        
        const query = `
            SELECT 
                ap.id,
                ap.proyecto_id,
                ap.profesor_rut,
                ap.rol_profesor_id,
                ap.fecha_asignacion,
                ap.fecha_desasignacion,
                ap.activo,
                ap.observaciones,
                ap.asignado_por,
                u.nombre as profesor_nombre,
                u.email as profesor_email,
                p.titulo as proyecto_titulo,
                p.estudiante_rut,
                ue.nombre as estudiante_nombre,
                rp.nombre as rol_nombre,
                rp.descripcion as rol_descripcion,
                ua.nombre as asignado_por_nombre
            FROM asignaciones_proyectos ap
            INNER JOIN usuarios u ON ap.profesor_rut = u.rut
            INNER JOIN proyectos p ON ap.proyecto_id = p.id
            INNER JOIN usuarios ue ON p.estudiante_rut = ue.rut
            INNER JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
            LEFT JOIN usuarios ua ON ap.asignado_por = ua.rut
            WHERE ap.activo = TRUE
            ORDER BY ap.fecha_asignacion DESC, p.titulo, rp.nombre
        `;
        
        const [asignaciones] = await pool.execute(query);
        
        res.json({
            success: true,
            data: asignaciones
        });
    } catch (error) {
        console.error('Error al obtener todas las asignaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * GET /asignaciones-profesores/admin/estadisticas
 * Obtener estadísticas generales de asignaciones (solo admin)
 */
router.get('/admin/estadisticas', verifySession, async (req, res) => {
    try {
        // Verificar que sea admin
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden ver las estadísticas generales'
            });
        }
        
        const estadisticas = await asignacionesProfesoresModel.obtenerEstadisticasGenerales();
        
        res.json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        console.error('Error al obtener todas las asignaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * POST /asignaciones-profesores
 * Crear una nueva asignación de profesor a proyecto
 */
router.post('/', verifySession, async (req, res) => {
    try {
        // Verificar que sea admin (role_id = 3)
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden crear asignaciones'
            });
        }
        
        const { proyecto_id, profesor_rut, rol_profesor_id } = req.body;
        
        console.log('📝 Datos recibidos para asignación:', {
            proyecto_id,
            profesor_rut,
            rol_profesor_id,
            tipos: {
                proyecto_id: typeof proyecto_id,
                profesor_rut: typeof profesor_rut,
                rol_profesor_id: typeof rol_profesor_id
            }
        });
        
        if (!proyecto_id || !profesor_rut || !rol_profesor_id) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios: proyecto_id, profesor_rut, rol_profesor_id',
                received: { proyecto_id, profesor_rut, rol_profesor_id }
            });
        }
        
        // Validar y convertir a números
        const proyectoIdNum = parseInt(proyecto_id);
        const rolProfesorIdNum = parseInt(rol_profesor_id);
        
        if (isNaN(proyectoIdNum)) {
            return res.status(400).json({
                success: false,
                message: `proyecto_id debe ser un número válido. Recibido: ${proyecto_id} (tipo: ${typeof proyecto_id})`
            });
        }
        
        if (isNaN(rolProfesorIdNum)) {
            return res.status(400).json({
                success: false,
                message: `rol_profesor_id debe ser un número válido. Recibido: ${rol_profesor_id} (tipo: ${typeof rol_profesor_id})`
            });
        }
        
        // Verificar que no exista asignación duplicada
        const verificarQuery = `
            SELECT id, profesor_rut FROM asignaciones_proyectos 
            WHERE proyecto_id = ? AND rol_profesor_id = ? AND activo = TRUE
        `;
        const [existente] = await pool.execute(verificarQuery, [proyectoIdNum, rolProfesorIdNum]);
        
        // Si ya existe un profesor con este rol activo
        if (existente.length > 0) {
            const profesorActual = existente[0].profesor_rut;
            
            // Si es el mismo profesor, no hacer nada (ya está asignado)
            if (profesorActual === profesor_rut) {
                return res.status(200).json({
                    success: true,
                    message: 'El profesor ya está asignado con este rol al proyecto',
                    data: { id: existente[0].id }
                });
            }
            
            // Si es diferente profesor, desasignar el anterior automáticamente
            console.log(`🔄 Reemplazando profesor ${profesorActual} por ${profesor_rut} en rol ${rolProfesorIdNum} del proyecto ${proyectoIdNum}`);
            
            const desasignarQuery = `
                UPDATE asignaciones_proyectos 
                SET activo = FALSE, fecha_desasignacion = NOW() 
                WHERE proyecto_id = ? AND rol_profesor_id = ? AND activo = TRUE
            `;
            await pool.execute(desasignarQuery, [proyectoIdNum, rolProfesorIdNum]);
        }
        
        // Crear nueva asignación
        const insertQuery = `
            INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, asignado_por)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.execute(insertQuery, [proyectoIdNum, profesor_rut, rolProfesorIdNum, req.user.rut]);
        
        res.status(201).json({
            success: true,
            data: { id: result.insertId },
            message: 'Asignación creada exitosamente'
        });
    } catch (error) {
        console.error('Error al crear asignación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

/**
 * DELETE /asignaciones-profesores/:proyecto_id/:profesor_rut
 * Desasignar un profesor de un proyecto (versión simplificada)
 */
router.delete('/:proyecto_id/:profesor_rut', verifySession, async (req, res) => {
    try {
        const { proyecto_id, profesor_rut } = req.params;
        
        // Solo admin puede desasignar profesores
        if (req.user.role_id !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden desasignar profesores'
            });
        }
        
        const resultado = await asignacionesProfesoresModel.desasignarProfesor(proyecto_id, profesor_rut);
        
        if (resultado) {
            res.json({
                success: true,
                message: 'Profesor desasignado exitosamente'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No se encontró la asignación a eliminar'
            });
        }
    } catch (error) {
        console.error('Error al desasignar profesor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

export default router;