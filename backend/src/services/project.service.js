import { ProjectModel, actualizarEstadoProyecto, obtenerProfesoresProyecto } from '../models/project.model.js';
import * as asignacionesProfesoresModel from '../models/asignaciones-profesores.model.js';
import * as AvanceModel from '../models/avance.model.js';
import { crearRevisionesInformante } from '../models/avance.model.js';
import { pool } from '../db/connectionDB.js';
import { logger } from '../config/logger.js';

const createProject = async (titulo, descripcion, estudianteId) => {
    if (!titulo || !descripcion) {
        throw new Error('Título y descripción son obligatorios');
    }
    return await ProjectModel.createProject(titulo, descripcion, estudianteId);
};

const getProjects = async () => {
    return await ProjectModel.getProjects();
}

const getDetailProject = async (projectId) => {
    return await ProjectModel.getDetailProject(projectId);
}

const deleteProject = async (projectId) => {
    return await ProjectModel.deleteProject(projectId);
}

/**
 * Crear un proyecto desde una propuesta aprobada
 * @param {Object} propuestaData - Datos de la propuesta aprobada
 * @returns {Promise<number>} - ID del proyecto creado
 */
/**
 * Determina el estado_detallado inicial según el tipo de proyecto y si es continuación de AP.
 *
 * Reglas del flujo:
 *   - PT continúa de AP  → 'avance_con_nota'  (salta propuesta y guía)
 *   - PT normal          → 'inicializacion'   (flujo completo)
 *   - AP                 → 'avance1_ap'       (inicia en la primera etapa AP)
 */
const estadoInicialSegunTipo = ({ tipo_proyecto, continua_ap }) => {
    if (continua_ap)              return 'avance_con_nota';
    if (tipo_proyecto === 'AP')   return 'avance1_ap';
    return 'inicializacion'; // PT normal
};

const crearProyectoDesdeAprobacion = async (propuestaData) => {
    try {
        if (!propuestaData) throw new Error('No se proporcionaron datos de la propuesta');

        const { id, titulo, descripcion, estudiante_rut, tipo_proyecto, continua_ap, ap_origen_id, semestre_id } = propuestaData;

        if (!id || !titulo || !descripcion || !estudiante_rut) {
            throw new Error('Faltan datos obligatorios de la propuesta para crear el proyecto');
        }

        const tipoProyecto = tipo_proyecto ?? 'PT';
        const esContinuacion = continua_ap === true;

        const proyectoData = {
            titulo,
            descripcion,
            propuesta_id: id,
            estudiante_rut,
            estado_id: esContinuacion ? 2 : 1,
            fecha_inicio: new Date(),
            fecha_entrega_estimada: null,
            fecha_entrega_real: null,
            fecha_defensa: null,
            tipo_proyecto: tipoProyecto,
            continua_ap: esContinuacion,
            ap_origen_id: ap_origen_id ?? null,
            semestre_id: semestre_id ?? null,
            estado_detallado: estadoInicialSegunTipo({ tipo_proyecto: tipoProyecto, continua_ap: esContinuacion })
        };

        const proyectoId = await ProjectModel.crearProyectoCompleto(proyectoData);

        logger.info('Proyecto creado automáticamente', { proyectoId, propuestaId: id, tipoProyecto, esContinuacion });

        await transferirEstudiantesAlProyecto(id, proyectoId);

        // Transferir guía pre-asignado al estudiante → asignaciones_proyectos
        await transferirGuiaAlProyecto(estudiante_rut, proyectoId);

        return proyectoId;
    } catch (error) {
        logger.error('Error al crear proyecto desde aprobación', { error: error.message });
        throw error;
    }
};

/**
 * Transfiere el guía pre-asignado del estudiante (guias_estudiantes) a asignaciones_proyectos.
 * Si no hay guía asignado o el rol no existe, simplemente registra un warning y continúa.
 */
const transferirGuiaAlProyecto = async (estudiante_rut, proyecto_id) => {
    try {
        // Obtener guía activo del estudiante
        const [guiaRows] = await pool.execute(
            'SELECT profesor_guia_rut, asignado_por FROM guias_estudiantes WHERE estudiante_rut = ? AND activo = TRUE ORDER BY fecha_asignacion DESC LIMIT 1',
            [estudiante_rut]
        );
        if (guiaRows.length === 0) {
            logger.warn('No hay guía asignado al estudiante al crear proyecto', { estudiante_rut, proyecto_id });
            return;
        }
        const profesor_guia_rut = guiaRows[0].profesor_guia_rut;
        const asignado_por = guiaRows[0].asignado_por;

        // Obtener el rol_profesor_id del rol 'Profesor Guía'
        const [rolRows] = await pool.execute(
            "SELECT id FROM roles_profesores WHERE nombre = 'Profesor Guía' LIMIT 1"
        );
        if (rolRows.length === 0) {
            logger.warn('Rol profesor_guia no encontrado en roles_profesores', { proyecto_id });
            return;
        }
        const rol_profesor_id = rolRows[0].id;

        // Insertar en asignaciones_proyectos
        await pool.execute(
            `INSERT INTO asignaciones_proyectos (proyecto_id, profesor_rut, rol_profesor_id, asignado_por)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE activo = TRUE, fecha_asignacion = NOW()`,
            [proyecto_id, profesor_guia_rut, rol_profesor_id, asignado_por]
        );

        logger.info('Guía transferido al proyecto', { proyecto_id, profesor_guia_rut, rol_profesor_id });
    } catch (error) {
        // No interrumpir la creación del proyecto si falla la transferencia
        logger.error('Error al transferir guía al proyecto (no bloqueante)', { error: error.message, estudiante_rut, proyecto_id });
    }
};

/**
 * Avanza el estado_detallado del proyecto AP a la siguiente etapa.
 * Secuencia AP: avance1_ap → defensa_tema_ap → avance2_ap → final_ap
 * Después de final_ap la decisión de continuar en PT queda en manos del admin/estudiante.
 */
const avanzarEtapaAP = async (proyecto_id) => {
    const FLUJO_AP = ['avance1_ap', 'defensa_tema_ap', 'avance2_ap', 'final_ap'];

    const [rows] = await pool.execute(
        'SELECT estado_detallado, tipo_proyecto FROM proyectos WHERE id = ? LIMIT 1',
        [proyecto_id]
    );
    const proyecto = rows[0];
    if (!proyecto) throw new Error('Proyecto no encontrado');
    if (proyecto.tipo_proyecto !== 'AP') throw new Error('Solo proyectos AP pueden avanzar por este flujo');

    const idx = FLUJO_AP.indexOf(proyecto.estado_detallado);
    if (idx === -1) throw new Error(`Estado inesperado para flujo AP: ${proyecto.estado_detallado}`);
    if (idx === FLUJO_AP.length - 1) throw new Error('El proyecto AP ya está en la etapa final');

    const nuevoEstado = FLUJO_AP[idx + 1];
    await actualizarEstadoProyecto(proyecto_id, null, nuevoEstado);
    logger.info('Etapa AP avanzada', { proyecto_id, nuevoEstado });
    return nuevoEstado;
};

/**
 * Avanza el estado_detallado del proyecto PT a la siguiente etapa.
 * Secuencia PT: inicializacion → avance_con_nota → informe_final → defensa_titulo
 *               → tramites_finales → acta_secretaria → verificar_deudas → biblioteca_formularios
 */
const avanzarEtapaPT = async (proyecto_id) => {
    const FLUJO_PT = [
        'inicializacion',
        'avance_con_nota',
        'informe_final',
        'defensa_titulo',
        'tramites_finales',
        'acta_secretaria',
        'verificar_deudas',
        'biblioteca_formularios'
    ];

    const [rows] = await pool.execute(
        'SELECT estado_detallado, tipo_proyecto FROM proyectos WHERE id = ? LIMIT 1',
        [proyecto_id]
    );
    const proyecto = rows[0];
    if (!proyecto) throw new Error('Proyecto no encontrado');
    if (proyecto.tipo_proyecto !== 'PT') throw new Error('Solo proyectos PT pueden avanzar por este flujo');

    const idx = FLUJO_PT.indexOf(proyecto.estado_detallado);
    if (idx === -1) throw new Error(`Estado inesperado para flujo PT: ${proyecto.estado_detallado}`);
    if (idx === FLUJO_PT.length - 1) throw new Error('El proyecto PT ya está en la etapa final');

    const nuevoEstado = FLUJO_PT[idx + 1];
    await actualizarEstadoProyecto(proyecto_id, null, nuevoEstado);
    logger.info('Etapa PT avanzada', { proyecto_id, nuevoEstado });
    return nuevoEstado;
};

/**
 * Transferir estudiantes de propuesta a proyecto
 * @param {number} propuesta_id - ID de la propuesta
 * @param {number} proyecto_id - ID del proyecto
 */
const transferirEstudiantesAlProyecto = async (propuesta_id, proyecto_id) => {
    try {
        // Obtener todos los estudiantes vinculados a la propuesta
        const [estudiantes] = await pool.execute(
            `SELECT estudiante_rut, es_creador, orden 
             FROM estudiantes_propuestas 
             WHERE propuesta_id = ? 
             ORDER BY orden ASC`,
            [propuesta_id]
        );

        if (!estudiantes || estudiantes.length === 0) {
            throw new Error('No se encontraron estudiantes vinculados a la propuesta');
        }

        // Transferir cada estudiante al proyecto
        for (const estudiante of estudiantes) {
            await pool.execute(
                `INSERT INTO estudiantes_proyectos (proyecto_id, estudiante_rut, es_creador, orden) 
                 VALUES (?, ?, ?, ?)`,
                [proyecto_id, estudiante.estudiante_rut, estudiante.es_creador, estudiante.orden]
            );
        }

        logger.info('Estudiantes transferidos al proyecto', { cantidad: estudiantes.length, proyecto_id });
    } catch (error) {
        logger.error('Error al transferir estudiantes', { error: error.message });
        throw error;
    }
};

/**
 * Transferir asignaciones de profesores de propuesta a proyecto
 * @param {number} propuesta_id - ID de la propuesta
 * @param {number} proyecto_id - ID del proyecto
 */
const transferirAsignacionesProfesores = async (propuesta_id, proyecto_id) => {
    try {
        // Obtener profesores asignados a la propuesta
        const profesoresAsignados = await ProjectModel.obtenerProfesoresAsignadosPropuesta(propuesta_id);
        
        if (!profesoresAsignados || profesoresAsignados.length === 0) {
            logger.warn('No hay profesores asignados a la propuesta', { propuesta_id });
            return;
        }

        // Asignar cada profesor al proyecto preservando su rol original de la propuesta
        for (const profesor of profesoresAsignados) {
            await asignacionesProfesoresModel.asignarProfesorAProyecto({
                proyecto_id: proyecto_id,
                profesor_rut: profesor.profesor_rut,
                rol_profesor_id: profesor.rol_profesor_id, // Preservar rol original
                asignado_por: 'system' // Sistema automático
            });
        }

        logger.info('Asignaciones de profesores transferidas', { cantidad: profesoresAsignados.length, proyecto_id });
        
        // Verificar si ahora se cumplen los 3 roles y activar automáticamente el proyecto
        await verificarYActivarProyectoSiCompleto(proyecto_id);
    } catch (error) {
        logger.error('Error al transferir asignaciones de profesores', { error: error.message });
        throw error;
    }
};

/**
 * Verificar si un proyecto tiene los 3 roles asignados y activarlo automáticamente
 * @param {number} proyecto_id - ID del proyecto
 */
const verificarYActivarProyectoSiCompleto = async (proyecto_id) => {
    try {
        // Obtener los profesores asignados al proyecto con sus roles
        const profesoresAsignados = await obtenerProfesoresProyecto(proyecto_id);
        
        if (!profesoresAsignados || profesoresAsignados.length === 0) {
            logger.warn('Proyecto sin profesores asignados', { proyecto_id });
            return false;
        }

        // Obtener dinámicamente los roles requeridos básicos de la base de datos
        const rolesRequeridosQuery = `
            SELECT id, nombre FROM roles_profesores 
            WHERE nombre IN ('profesor_guia', 'profesor_co_guia', 'profesor_informante')
            ORDER BY id
        `;
        const [rolesRequeridosData] = await pool.execute(rolesRequeridosQuery);
        const rolesRequeridos = rolesRequeridosData.map(rol => rol.id);
        
        if (rolesRequeridos.length === 0) {
            logger.warn('No se encontraron roles básicos configurados en la BD');
            return false;
        }
        
        const rolesAsignados = profesoresAsignados.map(p => p.rol_profesor_id);
        
        // Verificar que al menos estén los roles mínimos (guía es obligatorio)
        const rolGuia = rolesRequeridosData.find(r => r.nombre === 'profesor_guia');
        const tieneRolGuia = rolGuia && rolesAsignados.includes(rolGuia.id);
        
        // Para activar el proyecto se requiere al menos el profesor guía
        if (tieneRolGuia) {
            // Cambiar el estado del proyecto a 'en_desarrollo' (estado_id = 2)
            await actualizarEstadoProyecto(proyecto_id, 2);
            logger.info('Proyecto activado automáticamente', { proyecto_id });

            // Notificar a todos los estudiantes del proyecto
            try {
                const [estudiantesRows] = await pool.execute(
                    'SELECT estudiante_rut FROM estudiantes_proyectos WHERE proyecto_id = ?',
                    [proyecto_id]
                );
                for (const { estudiante_rut } of estudiantesRows) {
                    await pool.execute(
                        `INSERT INTO notificaciones_proyecto (usuario_rut, tipo, titulo, mensaje, proyecto_id, leida)
                         VALUES (?, 'proyecto_activado', 'Proyecto Activado', ?, ?, FALSE)`,
                        [
                            estudiante_rut,
                            'Tu proyecto ha sido activado. Se ha asignado un profesor guía y el trabajo puede comenzar.',
                            proyecto_id
                        ]
                    );
                }
            } catch (notifError) {
                logger.warn('No se pudo crear notificación de proyecto activado', { proyecto_id, error: notifError.message });
            }
            
            return true;
        } else {
            logger.warn('Proyecto sin profesor guía, no activado', { proyecto_id, rolesAsignados });
            return false;
        }
    } catch (error) {
        logger.error('Error al verificar y activar proyecto', { error: error.message });
        return false;
    }
};

/**
 * Obtener proyectos según los permisos del usuario
 * @param {string} usuario_rut - RUT del usuario
 * @param {string} rol_usuario - Rol del usuario ('admin', 'profesor', 'estudiante')
 * @returns {Promise<Array>} - Lista de proyectos que el usuario puede ver
 */
const obtenerProyectosPorPermisos = async (usuario_rut, rol_usuario) => {
    if (!usuario_rut || !rol_usuario) {
        throw new Error('Usuario y rol son requeridos');
    }
    
    const proyectos = await ProjectModel.obtenerProyectosPorPermisos(usuario_rut, rol_usuario);
    
    // Agregar flags de permisos para estudiantes
    if (rol_usuario === 'estudiante' || rol_usuario === 1) {
        return proyectos.map(proyecto => {
            // Los estudiantes pueden editar proyectos en ciertos estados
            // (Similar a propuestas, pero proyectos tienen diferentes estados)
            const puedeEditar = true; // Por ahora, todos los miembros del equipo pueden editar
            const puedeEliminar = false; // Por seguridad, eliminar proyectos es más restrictivo
            
            return {
                ...proyecto,
                puedeEditar,
                puedeEliminar
            };
        });
    }
    
    return proyectos;
};

/**
 * Obtener proyecto por ID con verificación de permisos
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} usuario_rut - RUT del usuario
 * @param {string} rol_usuario - Rol del usuario
 * @returns {Promise<Object|null>} - Datos del proyecto o null si no tiene permisos
 */
const obtenerProyectoPorIdConPermisos = async (proyecto_id, usuario_rut, rol_usuario) => {
    if (!proyecto_id || !usuario_rut || !rol_usuario) {
        throw new Error('ID del proyecto, usuario y rol son requeridos');
    }
    
    return await ProjectModel.obtenerProyectoPorIdConPermisos(proyecto_id, usuario_rut, rol_usuario);
};

/**
 * Verificar si un usuario puede ver un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} usuario_rut - RUT del usuario
 * @param {string} rol_usuario - Rol del usuario
 * @returns {Promise<boolean>} - true si puede ver, false si no
 */
const puedeVerProyecto = async (proyecto_id, usuario_rut, rol_usuario) => {
    if (!proyecto_id || !usuario_rut || !rol_usuario) {
        return false;
    }
    
    return await ProjectModel.puedeVerProyecto(proyecto_id, usuario_rut, rol_usuario);
};

// ===== SERVICIOS DE ASIGNACIONES DE PROFESORES =====

/**
 * Asignar múltiples profesores a un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {Array} asignaciones - Array de {profesor_rut, rol_profesor}
 * @returns {Promise<Array>} - IDs de las asignaciones creadas
 */
const asignarProfesoresAProyecto = async (proyecto_id, asignaciones) => {
    const idsCreados = [];
    
    for (const asignacion of asignaciones) {
        try {
            const asignacionId = await asignacionesProfesoresModel.asignarProfesorAProyecto({
                proyecto_id,
                profesor_rut: asignacion.profesor_rut,
                rol_profesor: asignacion.rol_profesor
            });
            idsCreados.push({
                id: asignacionId,
                rol: asignacion.rol_profesor,
                profesor: asignacion.profesor_rut,
                exito: true
            });
        } catch (error) {
            idsCreados.push({
                rol: asignacion.rol_profesor,
                profesor: asignacion.profesor_rut,
                exito: false,
                error: error.message
            });
        }
    }
    
    return idsCreados;
};

/**
 * Obtener información completa de un proyecto incluyendo fechas y profesores
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Object>} - Información completa del proyecto
 */
const obtenerProyectoCompleto = async (proyecto_id) => {
    const proyecto = await ProjectModel.getDetailProject(proyecto_id);

    if (!proyecto) {
        return null;
    }

    const profesores = await asignacionesProfesoresModel.obtenerProfesoresProyecto(proyecto_id);

    return {
        ...proyecto,
        profesores
    };
};

/**
 * Crear proyecto completo con fechas y asignaciones
 * @param {Object} proyectoData - Datos del proyecto
 * @param {Array} fechasPersonalizadas - Fechas importantes personalizadas
 * @param {Array} asignacionesProfesores - Asignaciones de profesores
 * @returns {Promise<Object>} - Proyecto creado con toda la información
 */
const crearProyectoCompleto = async (proyectoData, fechasPersonalizadas = null, asignacionesProfesores = []) => {
    // Crear el proyecto base
    const proyectoId = await ProjectModel.createProject(
        proyectoData.titulo,
        proyectoData.descripcion,
        proyectoData.estudiante_rut
    );
    
    // Asignar profesores si se proporcionaron
    let asignacionesCreadas = [];
    if (asignacionesProfesores.length > 0) {
        asignacionesCreadas = await asignarProfesoresAProyecto(proyectoId, asignacionesProfesores);
    }
    
    // Retornar proyecto completo
    const proyectoCompleto = await obtenerProyectoCompleto(proyectoId);
    
    return {
        ...proyectoCompleto,
        asignacionesCreadas
    };
};

// ========== SERVICIOS DE HITOS ==========

/**
 * Crear hito de proyecto con validaciones de negocio
 * @param {Object} hitoData - Datos del hito
 * @returns {Promise<number>} - ID del hito creado
 */
const crearHitoProyecto = async (hitoData) => {
    // Validaciones de negocio
    if (!hitoData.nombre || !hitoData.tipo_hito || !hitoData.fecha_objetivo) {
        throw new Error('Nombre, tipo de hito y fecha objetivo son obligatorios');
    }

    if (new Date(hitoData.fecha_objetivo) < new Date()) {
        throw new Error('La fecha objetivo no puede estar en el pasado');
    }

    // Validar que el peso no exceda el 100%
    if (hitoData.peso_en_proyecto > 100 || hitoData.peso_en_proyecto < 0) {
        throw new Error('El peso del hito debe estar entre 0 y 100');
    }

    // Verificar que el total de pesos no exceda 100%
    const hitosExistentes = await ProjectModel.obtenerHitosProyecto(hitoData.proyecto_id);
    const pesoTotal = hitosExistentes.reduce((total, hito) => total + (hito.peso_en_proyecto || 0), 0);
    
    if (pesoTotal + hitoData.peso_en_proyecto > 100) {
        throw new Error(`El peso total de hitos no puede exceder 100%. Actualmente: ${pesoTotal}%`);
    }

    return await ProjectModel.crearHitoProyecto(hitoData);
};

/**
 * Obtener hitos de un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Array>} - Lista de hitos
 */
const obtenerHitosProyecto = async (proyecto_id) => {
    return await ProjectModel.obtenerHitosProyecto(proyecto_id);
};

/**
 * Actualizar hito de proyecto
 * @param {number} hito_id - ID del hito
 * @param {Object} hitoData - Datos actualizados
 * @param {string} actualizado_por_rut - RUT del usuario que actualiza
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
const actualizarHitoProyecto = async (hito_id, hitoData, actualizado_por_rut) => {
    // Validaciones de fecha si se está actualizando
    if (hitoData.fecha_objetivo && new Date(hitoData.fecha_objetivo) < new Date()) {
        throw new Error('La fecha objetivo no puede estar en el pasado');
    }

    return await ProjectModel.actualizarHitoProyecto(hito_id, hitoData, actualizado_por_rut);
};

/**
 * Completar hito con validaciones
 * @param {number} hito_id - ID del hito
 * @param {Object} datos_completado - Datos de completado
 * @param {string} actualizado_por_rut - RUT del usuario
 * @returns {Promise<boolean>} - true si se completó correctamente
 */
const completarHito = async (hito_id, datos_completado, actualizado_por_rut) => {
    return await ProjectModel.completarHito(hito_id, datos_completado, actualizado_por_rut);
};

/**
 * Obtener estadísticas de hitos
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Object>} - Estadísticas de hitos
 */
const obtenerEstadisticasHitos = async (proyecto_id) => {
    return await ProjectModel.obtenerEstadisticasHitos(proyecto_id);
};

// ========== SERVICIOS DE PERMISOS ==========

/**
 * Verificar si un usuario puede modificar un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} usuario_rut - RUT del usuario
 * @param {string} rol_usuario - Rol del usuario
 * @returns {Promise<boolean>} - true si puede modificar
 */
const puedeModificarProyecto = async (proyecto_id, usuario_rut, rol_usuario) => {
    // Los administradores pueden modificar cualquier proyecto
    if (rol_usuario === 'admin') return true;

    // Los profesores pueden modificar proyectos donde están asignados
    if (rol_usuario === 'profesor') {
        return await puedeEvaluarProyecto(proyecto_id, usuario_rut);
    }

    // Los estudiantes solo pueden modificar sus propios proyectos o los de su equipo
    if (rol_usuario === 'estudiante') {
        const proyecto = await ProjectModel.obtenerProyectoPorIdConPermisos(proyecto_id, usuario_rut, rol_usuario);
        if (!proyecto) return false;
        
        // Verificar si es el creador
        if (proyecto.estudiante_rut === usuario_rut) {
            return true;
        }
        
        // Verificar si es miembro del equipo
        const [rows] = await pool.execute(
            'SELECT * FROM estudiantes_proyectos WHERE proyecto_id = ? AND estudiante_rut = ?',
            [proyecto_id, usuario_rut]
        );
        return rows.length > 0;
    }

    return false;
};

/**
 * Verificar si un profesor puede evaluar un proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @param {string} profesor_rut - RUT del profesor
 * @returns {Promise<boolean>} - true si puede evaluar
 */
const puedeEvaluarProyecto = async (proyecto_id, profesor_rut) => {
    const profesores = await ProjectModel.getProjectProfessors(proyecto_id);
    return profesores.some(p => p.rut === profesor_rut);
};

/**
 * Actualizar progreso del proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<boolean>} - true si se actualizó correctamente
 */
const actualizarProgresoProyecto = async (proyecto_id) => {
    return await ProjectModel.actualizarProgresoProyecto(proyecto_id);
};

/**
 * Obtener dashboard completo del proyecto
 * @param {number} proyecto_id - ID del proyecto
 * @returns {Promise<Object>} - Dashboard con toda la información
 */
const obtenerDashboardProyecto = async (proyecto_id) => {
    return await ProjectModel.obtenerDashboardProyecto(proyecto_id);
};

// ============= FUNCIONES DEL SISTEMA DE CRONOGRAMAS Y ENTREGAS =============

/**
 * Crear cronograma para proyecto
 */
const crearCronograma = async (cronogramaData) => {
    return await AvanceModel.crearCronograma(cronogramaData);
};

/**
 * Obtener cronograma activo del proyecto
 */
const obtenerCronogramaActivo = async (proyecto_id) => {
    return await AvanceModel.obtenerCronogramaActivo(proyecto_id);
};

/**
 * Obtener cronograma por ID (helper)
 */
const obtenerCronogramaPorId = async (cronograma_id) => {
    const [rows] = await pool.execute(
        'SELECT * FROM cronogramas_proyecto WHERE id = ? LIMIT 1',
        [cronograma_id]
    );
    return rows[0] || null;
};

/**
 * Aprobar cronograma por estudiante
 */
const aprobarCronogramaPorEstudiante = async (cronograma_id) => {
    return await AvanceModel.aprobarCronogramaPorEstudiante(cronograma_id);
};

/**
 * Crear hito en cronograma (SISTEMA UNIFICADO)
 */
const crearHitoCronograma = async (hitoData) => {
    // Validaciones de negocio
    if (!hitoData.nombre_hito || !hitoData.tipo_hito || !hitoData.fecha_limite) {
        throw new Error('Nombre, tipo de hito y fecha límite son obligatorios');
    }

    if (new Date(hitoData.fecha_limite) < new Date()) {
        throw new Error('La fecha límite no puede estar en el pasado');
    }

    // Validar peso si se proporciona
    if (hitoData.peso_en_proyecto) {
        if (hitoData.peso_en_proyecto > 100 || hitoData.peso_en_proyecto < 0) {
            throw new Error('El peso del hito debe estar entre 0 y 100');
        }

        // Verificar que el total de pesos no exceda 100%
        const hitosExistentes = await AvanceModel.obtenerHitosCronograma(hitoData.cronograma_id);
        const pesoTotal = hitosExistentes.reduce((total, hito) => total + (parseFloat(hito.peso_en_proyecto) || 0), 0);
        
        if (pesoTotal + parseFloat(hitoData.peso_en_proyecto) > 100) {
            throw new Error(`El peso total de hitos no puede exceder 100%. Actualmente: ${pesoTotal.toFixed(2)}%`);
        }
    }

    const hito = await AvanceModel.crearHitoCronograma(hitoData);

    return hito;
};

/**
 * Obtener hitos del cronograma
 */
const obtenerHitosCronograma = async (cronograma_id) => {
    return await AvanceModel.obtenerHitosCronograma(cronograma_id);
};

/**
 * Entregar hito (subir archivo)
 */
const entregarHito = async (hito_id, entregaData) => {
    return await AvanceModel.entregarHito(hito_id, entregaData);
};

/**
 * Revisar hito entregado (CON AUDITORÍA)
 */
const revisarHito = async (hito_id, revisionData, profesor_rut) => {
    // Validar calificación si se proporciona
    if (revisionData.calificacion) {
        if (revisionData.calificacion < 1.0 || revisionData.calificacion > 7.0) {
            throw new Error('La calificación debe estar entre 1.0 y 7.0');
        }
    }

    const result = await AvanceModel.revisarHito(hito_id, {
        ...revisionData,
        actualizado_por_rut: profesor_rut
    });

    // Marcar la fecha importante como completada si el hito fue aprobado
    if (revisionData.estado === 'aprobado') {
        try {
            await pool.execute(
                `UPDATE fechas SET completada = TRUE, fecha_realizada = CURDATE()
                 WHERE hito_cronograma_id = ? AND activa = TRUE`,
                [hito_id]
            );
        } catch (e) {
            logger.warn('No se pudo marcar fecha importante como completada', { error: e.message });
        }

        // Si es entrega_documento, disparar revisión del informante
        try {
            const [[hito]] = await pool.execute(
                `SELECT h.tipo_hito, cp.proyecto_id
                 FROM hitos_cronograma h
                 INNER JOIN cronogramas_proyecto cp ON h.cronograma_id = cp.id
                 WHERE h.id = ?`,
                [hito_id]
            );
            if (hito && hito.tipo_hito === 'entrega_final') {
                await crearRevisionesInformante(hito_id, hito.proyecto_id);
            }
        } catch (e) {
            logger.warn('No se pudo crear revisión de informante', { error: e.message });
        }
    }

    return result;
};

/**
 * Revisiones del Profesor Informante
 */
const obtenerRevisionesInformante = async (informante_rut) => {
    return await AvanceModel.obtenerRevisionesInformanteByProfesor(informante_rut);
};

const revisarHitoComoInformante = async (revision_id, informante_rut, revisionData) => {
    return await AvanceModel.actualizarRevisionInformante(revision_id, informante_rut, revisionData);
};

const puedeInformanteCrearHitos = async (proyecto_id, informante_rut) => {
    return await AvanceModel.verificarHitoFinalAprobadoInformante(proyecto_id, informante_rut);
};

const obtenerHitosInformante = async (cronograma_id) => {
    return await AvanceModel.obtenerHitosCreados(cronograma_id, 'informante');
};

const obtenerRevisionesInformanteProyecto = async (proyecto_id) => {
    return await AvanceModel.obtenerRevisionesInformanteByProyecto(proyecto_id);
};

const obtenerDocumentosHitos = async (proyecto_id) => {
    return await AvanceModel.obtenerDocumentosHitos(proyecto_id);
};

/**
 * Obtener información completa del hito para notificaciones
 */
const obtenerInfoHito = async (hito_id) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                h.id,
                h.nombre_hito as nombre_hito,
                h.descripcion,
                p.id as proyecto_id,
                p.titulo as proyecto_titulo,
                ep.estudiante_rut,
                ap.profesor_rut as profesor_guia_rut
            FROM hitos_cronograma h
            INNER JOIN cronogramas_proyecto c ON h.cronograma_id = c.id
            INNER JOIN proyectos p ON c.proyecto_id = p.id
            LEFT JOIN estudiantes_proyectos ep ON p.id = ep.proyecto_id
            LEFT JOIN asignaciones_proyectos ap ON p.id = ap.proyecto_id AND ap.activo = TRUE
            LEFT JOIN roles_profesores rp ON ap.rol_profesor_id = rp.id
                AND (rp.nombre LIKE '%guía%' OR rp.nombre LIKE '%guia%' OR rp.nombre LIKE '%Guía%')
            WHERE h.id = ?
            LIMIT 1
        `, [hito_id]);
        
        return rows[0] || null;
    } catch (error) {
        logger.error('Error al obtener info del hito', { error: error.message });
        return null;
    }
};

/**
 * Obtener notificaciones del usuario
 */
const obtenerNotificacionesUsuario = async (usuario_rut, solo_no_leidas = false) => {
    return await AvanceModel.obtenerNotificacionesUsuario(usuario_rut, solo_no_leidas);
};

/**
 * Marcar notificación como leída
 */
const marcarNotificacionLeida = async (notificacion_id) => {
    return await AvanceModel.marcarNotificacionLeida(notificacion_id);
};

/**
 * Configurar alertas del proyecto
 */
const configurarAlertas = async (alertaData) => {
    return await AvanceModel.configurarAlertas(alertaData);
};

/**
 * Obtener estadísticas de cumplimiento
 */
const obtenerEstadisticasCumplimiento = async (proyecto_id) => {
    return await AvanceModel.obtenerEstadisticasCumplimiento(proyecto_id);
};

// ============= FUNCIONES DE VERIFICACIÓN DE PERMISOS =============

/**
 * Verificar si el usuario es profesor guía del proyecto
 */
const esProfesorGuia = async (proyecto_id, profesor_rut) => {
    return await AvanceModel.esProfesorGuia(proyecto_id, profesor_rut);
};

/**
 * Verificar si el usuario es estudiante del cronograma
 */
const esEstudianteDelCronograma = async (cronograma_id, estudiante_rut) => {
    return await AvanceModel.esEstudianteDelCronograma(cronograma_id, estudiante_rut);
};

/**
 * Verificar si el usuario es profesor guía del cronograma
 */
const esProfesorGuiaDelCronograma = async (cronograma_id, profesor_rut) => {
    return await AvanceModel.esProfesorGuiaDelCronograma(cronograma_id, profesor_rut);
};

/**
 * Verificar si el usuario es cualquier profesor asignado al cronograma
 */
const esProfesorAsignadoAlCronograma = async (cronograma_id, profesor_rut) => {
    return await AvanceModel.esProfesorAsignadoAlCronograma(cronograma_id, profesor_rut);
};

/**
 * Verificar si el usuario puede ver el cronograma
 */
const puedeVerCronograma = async (cronograma_id, usuario_rut, rol_usuario) => {
    return await AvanceModel.puedeVerCronograma(cronograma_id, usuario_rut, rol_usuario);
};

/**
 * Verificar si el usuario es estudiante del hito
 */
const esEstudianteDelHito = async (hito_id, estudiante_rut) => {
    return await AvanceModel.esEstudianteDelHito(hito_id, estudiante_rut);
};

/**
 * Verificar si el usuario es profesor guía del hito
 */
const esProfesorGuiaDelHito = async (hito_id, profesor_rut) => {
    return await AvanceModel.esProfesorGuiaDelHito(hito_id, profesor_rut);
};

/**
 * Verificar si la notificación pertenece al usuario
 */
const notificacionPerteneceAUsuario = async (notificacion_id, usuario_rut) => {
    return await AvanceModel.notificacionPerteneceAUsuario(notificacion_id, usuario_rut);
};

const actualizarHitoCronograma = async (cronograma_id, hito_id, data) => {
    const result = await AvanceModel.actualizarHitoCronograma(cronograma_id, hito_id, data);

    // Sincronizar cambios con la fecha importante enlazada
    try {
        const updates = [];
        const values = [];
        if (data.nombre_hito)  { updates.push('titulo = ?');      values.push(data.nombre_hito); }
        if (data.descripcion !== undefined) { updates.push('descripcion = ?'); values.push(data.descripcion ?? null); }
        if (data.fecha_limite) { updates.push('fecha = ?');       values.push(data.fecha_limite); }
        if (updates.length) {
            values.push(hito_id);
            await pool.execute(
                `UPDATE fechas SET ${updates.join(', ')} WHERE hito_cronograma_id = ? AND activa = TRUE`,
                values
            );
        }
    } catch (e) {
        logger.warn('No se pudo sincronizar actualización de hito con fechas importantes', { error: e.message });
    }

    return result;
};

const eliminarHitoCronograma = async (cronograma_id, hito_id) => {
    // Soft-delete la fecha importante enlazada antes de eliminar el hito
    try {
        await pool.execute(
            `UPDATE fechas SET activa = FALSE WHERE hito_cronograma_id = ?`,
            [hito_id]
        );
    } catch (e) {
        logger.warn('No se pudo desactivar fecha importante al eliminar hito', { error: e.message });
    }

    return await AvanceModel.eliminarHitoCronograma(cronograma_id, hito_id);
};

const obtenerHitoPorId = async (hito_id) => {
    return await AvanceModel.obtenerHitoPorId(hito_id);
};

const limpiarEntregaHito = async (hito_id) => {
    return await AvanceModel.limpiarEntregaHito(hito_id);
};

export const ProjectService = {
    createProject,
    getProjects,
    getDetailProject,
    deleteProject,
    crearProyectoDesdeAprobacion,
    transferirAsignacionesProfesores,
    obtenerProyectosPorPermisos,
    obtenerProyectoPorIdConPermisos,
    puedeVerProyecto,
    // Funciones existentes
    asignarProfesoresAProyecto,
    obtenerProyectoCompleto,
    crearProyectoCompleto,
    
    // Nuevas funciones de hitos
    crearHitoProyecto,
    obtenerHitosProyecto,
    actualizarHitoProyecto,
    completarHito,
    obtenerEstadisticasHitos,
    
    // Nuevas funciones de permisos y progreso
    puedeModificarProyecto,
    puedeEvaluarProyecto,
    actualizarProgresoProyecto,
    obtenerDashboardProyecto,
    
    // Sistema de cronogramas y entregas
    crearCronograma,
    obtenerCronogramaActivo,
    obtenerCronogramaPorId,
    aprobarCronogramaPorEstudiante,
    crearHitoCronograma,
    obtenerHitosCronograma,
    entregarHito,
    revisarHito,
    obtenerRevisionesInformante,
    obtenerRevisionesInformanteProyecto,
    puedeInformanteCrearHitos,
    obtenerHitosInformante,
    revisarHitoComoInformante,
    obtenerDocumentosHitos,
    obtenerInfoHito,
    obtenerNotificacionesUsuario,
    marcarNotificacionLeida,
    configurarAlertas,
    obtenerEstadisticasCumplimiento,
    
    // Funciones de verificación de permisos para cronogramas
    esProfesorGuia,
    esEstudianteDelCronograma,
    esProfesorGuiaDelCronograma,
    esProfesorAsignadoAlCronograma,
    puedeVerProyecto,
    puedeVerCronograma,
    esEstudianteDelHito,
    esProfesorGuiaDelHito,
    notificacionPerteneceAUsuario,
    actualizarHitoCronograma,
    eliminarHitoCronograma,
    obtenerHitoPorId,
    limpiarEntregaHito,
    
    // Funciones para flujo automático propuesta → proyecto
    verificarYActivarProyectoSiCompleto,

    // Funciones de avance de etapa por tipo de proyecto
    avanzarEtapaAP,
    avanzarEtapaPT
};