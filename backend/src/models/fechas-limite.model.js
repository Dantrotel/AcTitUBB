import { pool } from '../db/connectionDB.js';

/**
 * Verificar si un estudiante puede subir archivos para una fecha importante
 * @param {number} fechaImportanteId - ID de la fecha importante
 * @param {string} estudianteRut - RUT del estudiante
 * @returns {Object} { puede_subir: boolean, motivo: string, fecha_limite: Date, dias_restantes: number, tiene_extension_pendiente: boolean }
 */
export const verificarPermisoSubida = async (fechaImportanteId, estudianteRut) => {
    try {
        // Obtener información de la fecha importante
        const [fechas] = await pool.execute(`
            SELECT 
                fi.id,
                fi.proyecto_id,
                fi.titulo,
                fi.fecha as fecha_limite,
                fi.permite_extension,
                fi.requiere_entrega,
                fi.completada,
                p.estudiante_rut,
                DATEDIFF(fi.fecha, CURDATE()) as dias_restantes
            FROM fechas fi
            INNER JOIN proyectos p ON fi.proyecto_id = p.id
            WHERE fi.id = ? AND p.estudiante_rut = ?
        `, [fechaImportanteId, estudianteRut]);

        if (fechas.length === 0) {
            return {
                puede_subir: false,
                motivo: 'Fecha importante no encontrada o no pertenece a tu proyecto',
                fecha_limite: null,
                dias_restantes: null,
                tiene_extension_pendiente: false
            };
        }

        const fecha = fechas[0];
        const hoy = new Date();
        const fechaLimite = new Date(fecha.fecha_limite);

        // Verificar si ya está completada
        if (fecha.completada) {
            return {
                puede_subir: false,
                motivo: 'Esta entrega ya fue completada',
                fecha_limite: fechaLimite,
                dias_restantes: fecha.dias_restantes,
                tiene_extension_pendiente: false
            };
        }

        // Verificar si tiene una extensión pendiente o aprobada
        const [extensiones] = await pool.execute(`
            SELECT 
                id,
                estado,
                fecha_solicitada,
                DATEDIFF(fecha_solicitada, fecha_original) as dias_extension
            FROM solicitudes_extension
            WHERE fecha_importante_id = ? 
            AND proyecto_id = ?
            AND estado IN ('pendiente', 'en_revision', 'aprobada')
            ORDER BY created_at DESC
            LIMIT 1
        `, [fechaImportanteId, fecha.proyecto_id]);

        let tiene_extension_pendiente = false;
        let nueva_fecha_limite = fechaLimite;

        if (extensiones.length > 0) {
            const extension = extensiones[0];
            
            if (extension.estado === 'aprobada') {
                // Si hay una extensión aprobada, usar la nueva fecha
                nueva_fecha_limite = new Date(extension.fecha_solicitada);
            } else if (extension.estado === 'pendiente' || extension.estado === 'en_revision') {
                tiene_extension_pendiente = true;
            }
        }

        // Calcular días restantes con la fecha límite actual (considerando extensión aprobada)
        const diffTime = nueva_fecha_limite.getTime() - hoy.getTime();
        const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Si la fecha límite no ha pasado (o hay extensión aprobada), puede subir
        if (diasRestantes >= 0) {
            return {
                puede_subir: true,
                motivo: 'Dentro del plazo de entrega',
                fecha_limite: nueva_fecha_limite,
                dias_restantes: diasRestantes,
                tiene_extension_pendiente: false,
                tiene_extension_aprobada: extensiones.length > 0 && extensiones[0].estado === 'aprobada'
            };
        }

        // Si la fecha límite pasó
        if (tiene_extension_pendiente) {
            return {
                puede_subir: false,
                motivo: 'Tienes una solicitud de extensión pendiente. Espera la respuesta del administrador.',
                fecha_limite: fechaLimite,
                dias_restantes: diasRestantes,
                tiene_extension_pendiente: true,
                puede_solicitar_extension: false
            };
        }

        // Si permite extensiones, puede solicitarla
        if (fecha.permite_extension) {
            return {
                puede_subir: false,
                motivo: 'La fecha límite ha pasado. Puedes solicitar una extensión.',
                fecha_limite: fechaLimite,
                dias_restantes: diasRestantes,
                tiene_extension_pendiente: false,
                puede_solicitar_extension: true
            };
        }

        // No permite extensiones y ya pasó la fecha
        return {
            puede_subir: false,
            motivo: 'La fecha límite ha pasado y no se permiten extensiones',
            fecha_limite: fechaLimite,
            dias_restantes: diasRestantes,
            tiene_extension_pendiente: false,
            puede_solicitar_extension: false
        };

    } catch (error) {
        console.error('Error verificando permiso de subida:', error);
        throw error;
    }
};

/**
 * Verificar si un estudiante puede solicitar extensión para una fecha importante
 * @param {number} fechaImportanteId - ID de la fecha importante
 * @param {number} proyectoId - ID del proyecto
 * @returns {Object} { puede_solicitar: boolean, motivo: string }
 */
export const verificarPermisoExtension = async (fechaImportanteId, proyectoId) => {
    try {
        // Verificar que la fecha importante existe y permite extensión
        const [fechas] = await pool.execute(`
            SELECT 
                id,
                titulo,
                fecha_limite,
                permite_extension,
                completada
            FROM fechas
            WHERE id = ? AND proyecto_id = ?
        `, [fechaImportanteId, proyectoId]);

        if (fechas.length === 0) {
            return {
                puede_solicitar: false,
                motivo: 'Fecha importante no encontrada'
            };
        }

        const fecha = fechas[0];

        if (fecha.completada) {
            return {
                puede_solicitar: false,
                motivo: 'Esta entrega ya fue completada'
            };
        }

        if (!fecha.permite_extension) {
            return {
                puede_solicitar: false,
                motivo: 'Esta fecha no permite solicitar extensiones'
            };
        }

        // Verificar si ya tiene una solicitud pendiente o en revisión
        const [extensiones] = await pool.execute(`
            SELECT id, estado
            FROM solicitudes_extension
            WHERE fecha_importante_id = ? 
            AND proyecto_id = ?
            AND estado IN ('pendiente', 'en_revision')
            LIMIT 1
        `, [fechaImportanteId, proyectoId]);

        if (extensiones.length > 0) {
            return {
                puede_solicitar: false,
                motivo: 'Ya tienes una solicitud de extensión pendiente para esta fecha'
            };
        }

        return {
            puede_solicitar: true,
            motivo: 'Puedes solicitar extensión',
            fecha_limite: fecha.fecha_limite
        };

    } catch (error) {
        console.error('Error verificando permiso de extensión:', error);
        throw error;
    }
};

/**
 * Obtener estado de todas las fechas importantes de un proyecto
 * @param {number} proyectoId - ID del proyecto
 * @param {string} estudianteRut - RUT del estudiante
 * @returns {Array} Lista de fechas con su estado de disponibilidad
 */
export const obtenerEstadoFechasProyecto = async (proyectoId, estudianteRut) => {
    try {
        const [fechas] = await pool.execute(`
            SELECT 
                fi.id,
                fi.tipo_fecha,
                fi.titulo,
                fi.descripcion,
                fi.fecha as fecha_limite,
                fi.permite_extension,
                fi.requiere_entrega,
                fi.completada,
                fi.creado_por,
                u.nombre as creado_por_nombre,
                DATEDIFF(fi.fecha, CURDATE()) as dias_restantes,
                CASE 
                    WHEN fi.completada = TRUE THEN 'completada'
                    WHEN DATEDIFF(fi.fecha, CURDATE()) >= 0 THEN 'vigente'
                    ELSE 'vencida'
                END as estado
            FROM fechas fi
            LEFT JOIN usuarios u ON fi.creado_por = u.rut
            WHERE fi.proyecto_id = ?
            ORDER BY fi.fecha ASC
        `, [proyectoId]);

        // Para cada fecha, obtener si tiene extensión pendiente o aprobada
        for (let fecha of fechas) {
            const [extensiones] = await pool.execute(`
                SELECT 
                    id,
                    estado,
                    fecha_solicitada,
                    fecha_original,
                    DATEDIFF(fecha_solicitada, fecha_original) as dias_extension
                FROM solicitudes_extension
                WHERE fecha_importante_id = ? 
                AND proyecto_id = ?
                ORDER BY created_at DESC
                LIMIT 1
            `, [fecha.id, proyectoId]);

            if (extensiones.length > 0) {
                fecha.extension = extensiones[0];
                
                if (extensiones[0].estado === 'aprobada') {
                    // Recalcular días restantes con la fecha aprobada
                    const hoy = new Date();
                    const fechaNueva = new Date(extensiones[0].fecha_solicitada);
                    const diffTime = fechaNueva.getTime() - hoy.getTime();
                    fecha.dias_restantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    fecha.fecha_limite_extendida = extensiones[0].fecha_solicitada;
                    fecha.estado = fecha.dias_restantes >= 0 ? 'vigente' : 'vencida';
                }
            }

            // Determinar si puede subir archivos
            if (fecha.requiere_entrega && !fecha.completada) {
                const permiso = await verificarPermisoSubida(fecha.id, estudianteRut);
                fecha.puede_subir = permiso.puede_subir;
                fecha.puede_solicitar_extension = permiso.puede_solicitar_extension || false;
                fecha.motivo = permiso.motivo;
            }
        }

        return fechas;

    } catch (error) {
        console.error('Error obteniendo estado de fechas:', error);
        throw error;
    }
};

/**
 * Marcar una fecha importante como completada (después de subir archivos)
 * @param {number} fechaImportanteId - ID de la fecha importante
 * @param {string} estudianteRut - RUT del estudiante
 * @returns {Object} Resultado de la operación
 */
export const marcarFechaCompletada = async (fechaImportanteId, estudianteRut) => {
    try {
        // Verificar que puede marcarla como completada
        const permiso = await verificarPermisoSubida(fechaImportanteId, estudianteRut);
        
        if (!permiso.puede_subir) {
            throw new Error('No tienes permiso para completar esta fecha');
        }

        // Marcar como completada
        const [result] = await pool.execute(`
            UPDATE fechas fi
            INNER JOIN proyectos p ON fi.proyecto_id = p.id
            SET 
                fi.completada = TRUE,
                fi.fecha_realizada = CURDATE(),
                fi.updated_at = CURRENT_TIMESTAMP
            WHERE fi.id = ? AND p.estudiante_rut = ?
        `, [fechaImportanteId, estudianteRut]);

        if (result.affectedRows === 0) {
            throw new Error('No se pudo marcar la fecha como completada');
        }

        return {
            success: true,
            mensaje: 'Fecha marcada como completada'
        };

    } catch (error) {
        console.error('Error marcando fecha como completada:', error);
        throw error;
    }
};

/**
 * Verificar si un estudiante puede crear/actualizar una propuesta
 * @param {string} estudianteRut - RUT del estudiante
 * @returns {Object} { puede_crear: boolean, motivo: string, fecha_limite: Date, dias_restantes: number, habilitada: boolean }
 */
export const verificarPermisoCrearPropuesta = async (estudianteRut) => {
    try {
        // Buscar fecha límite global para entrega de propuestas
        const [fechas] = await pool.execute(`
            SELECT 
                id,
                titulo,
                fecha as fecha_limite,
                permite_extension,
                habilitada,
                DATEDIFF(fecha, CURDATE()) as dias_restantes
            FROM fechas
            WHERE tipo_fecha = 'entrega_propuesta'
            AND es_global = TRUE
            AND proyecto_id IS NULL
            ORDER BY fecha DESC
            LIMIT 1
        `);

        // Si no hay fecha límite configurada, NO permitir crear propuestas
        if (fechas.length === 0) {
            return {
                puede_crear: false,
                motivo: 'No hay período de propuestas configurado. Contacta al administrador para que establezca una fecha límite.',
                fecha_limite: null,
                dias_restantes: null,
                sin_limite: true,
                habilitada: false
            };
        }

        const fecha = fechas[0];
        const hoy = new Date();
        const fechaLimite = new Date(fecha.fecha_limite);

        // Calcular días restantes
        const diffTime = fechaLimite.getTime() - hoy.getTime();
        const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // 🔒 VERIFICAR SI EL PERÍODO ESTÁ HABILITADO POR EL ADMIN
        if (!fecha.habilitada) {
            return {
                puede_crear: false,
                motivo: 'El período de entrega de propuestas está actualmente cerrado por el administrador.',
                fecha_limite: fechaLimite,
                dias_restantes: diasRestantes,
                sin_limite: false,
                habilitada: false
            };
        }

        // 🔒 VERIFICAR SI LA FECHA LÍMITE YA PASÓ
        if (diasRestantes < 0) {
            return {
                puede_crear: false,
                motivo: `El período de entrega de propuestas finalizó el ${fechaLimite.toLocaleDateString('es-CL')}. Ya no es posible crear nuevas propuestas.`,
                fecha_limite: fechaLimite,
                dias_restantes: diasRestantes,
                sin_limite: false,
                habilitada: false
            };
        }

        // ✅ Si está dentro del plazo y habilitado
        return {
            puede_crear: true,
            motivo: diasRestantes === 0 
                ? '¡ÚLTIMO DÍA! El período de propuestas finaliza hoy.'
                : diasRestantes <= 3
                    ? `¡Quedan solo ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}! Envía tu propuesta pronto.`
                    : `Dentro del plazo. Tienes ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} para crear tu propuesta.`,
            fecha_limite: fechaLimite,
            dias_restantes: diasRestantes,
            sin_limite: false,
            habilitada: true
        };

    } catch (error) {
        console.error('Error verificando permiso para crear propuesta:', error);
        throw error;
    }
};

/**
 * Verificar si un estudiante puede actualizar una propuesta rechazada o con correcciones
 * @param {number} propuestaId - ID de la propuesta
 * @param {string} estudianteRut - RUT del estudiante
 * @param {string} estadoActual - Estado actual de la propuesta ('rechazada' o 'correcciones')
 * @returns {Object} { puede_actualizar: boolean, motivo: string, fecha_limite: Date, dias_restantes: number }
 */
export const verificarPermisoActualizarPropuesta = async (propuestaId, estudianteRut, estadoActual) => {
    try {
        // Si está rechazada, puede crear una nueva (usar verificarPermisoCrearPropuesta)
        if (estadoActual === 'rechazada') {
            return await verificarPermisoCrearPropuesta(estudianteRut);
        }

        // Si tiene correcciones, verificar plazo de 7 días desde la revisión
        if (estadoActual === 'correcciones') {
            const [propuestas] = await pool.execute(`
                SELECT 
                    id,
                    fecha_revision,
                    DATEDIFF(DATE_ADD(fecha_revision, INTERVAL 7 DAY), CURDATE()) as dias_restantes,
                    DATE_ADD(fecha_revision, INTERVAL 7 DAY) as fecha_limite
                FROM propuestas
                WHERE id = ? AND estudiante_rut = ?
            `, [propuestaId, estudianteRut]);

            if (propuestas.length === 0) {
                return {
                    puede_actualizar: false,
                    motivo: 'Propuesta no encontrada',
                    fecha_limite: null,
                    dias_restantes: null
                };
            }

            const propuesta = propuestas[0];
            
            // Si no tiene fecha de revisión aún, permitir
            if (!propuesta.fecha_revision) {
                return {
                    puede_actualizar: true,
                    motivo: 'La propuesta aún no ha sido revisada. Puedes actualizarla.',
                    fecha_limite: null,
                    dias_restantes: null
                };
            }

            const diasRestantes = propuesta.dias_restantes;

            // Dentro del plazo de 7 días
            if (diasRestantes >= 0) {
                return {
                    puede_actualizar: true,
                    motivo: `Tienes ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''} para subir las correcciones.`,
                    fecha_limite: new Date(propuesta.fecha_limite),
                    dias_restantes: diasRestantes
                };
            }

            // Fuera del plazo
            return {
                puede_actualizar: false,
                motivo: `El plazo de 7 días para correcciones venció el ${new Date(propuesta.fecha_limite).toLocaleDateString('es-CL')}.`,
                fecha_limite: new Date(propuesta.fecha_limite),
                dias_restantes: diasRestantes
            };
        }

        // Para otros estados, no permitir actualización
        return {
            puede_actualizar: false,
            motivo: 'La propuesta no está en un estado que permita actualizaciones.',
            fecha_limite: null,
            dias_restantes: null
        };

    } catch (error) {
        console.error('Error verificando permiso para actualizar propuesta:', error);
        throw error;
    }
};

/**
 * Habilitar período de propuestas (solo admin)
 * @param {number} fechaImportanteId - ID de la fecha importante de tipo 'entrega_propuesta'
 * @returns {Object} Resultado de la operación
 */
export const habilitarPeriodoPropuestas = async (fechaImportanteId) => {
    try {
        const [result] = await pool.execute(`
            UPDATE fechas 
            SET habilitada = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND tipo_fecha = 'entrega_propuesta' AND es_global = TRUE
        `, [fechaImportanteId]);

        if (result.affectedRows === 0) {
            throw new Error('Fecha importante no encontrada o no es una fecha global de propuestas');
        }

        return {
            success: true,
            mensaje: 'Período de propuestas habilitado correctamente'
        };

    } catch (error) {
        console.error('Error habilitando período de propuestas:', error);
        throw error;
    }
};

/**
 * Deshabilitar período de propuestas (solo admin)
 * @param {number} fechaImportanteId - ID de la fecha importante de tipo 'entrega_propuesta'
 * @returns {Object} Resultado de la operación
 */
export const deshabilitarPeriodoPropuestas = async (fechaImportanteId) => {
    try {
        const [result] = await pool.execute(`
            UPDATE fechas 
            SET habilitada = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND tipo_fecha = 'entrega_propuesta' AND es_global = TRUE
        `, [fechaImportanteId]);

        if (result.affectedRows === 0) {
            throw new Error('Fecha importante no encontrada o no es una fecha global de propuestas');
        }

        return {
            success: true,
            mensaje: 'Período de propuestas deshabilitado correctamente'
        };

    } catch (error) {
        console.error('Error deshabilitando período de propuestas:', error);
        throw error;
    }
};

/**
 * Obtener estado del período de propuestas actual
 * @returns {Object} Estado del período de propuestas
 */
export const obtenerEstadoPeriodoPropuestas = async () => {
    try {
        const [fechas] = await pool.execute(`
            SELECT 
                id,
                titulo,
                descripcion,
                fecha as fecha_limite,
                habilitada,
                permite_extension,
                DATEDIFF(fecha, CURDATE()) as dias_restantes,
                CASE 
                    WHEN fecha < CURDATE() THEN 'vencido'
                    WHEN fecha = CURDATE() THEN 'ultimo_dia'
                    WHEN DATEDIFF(fecha, CURDATE()) <= 3 THEN 'proximo_a_vencer'
                    ELSE 'activo'
                END as estado_tiempo
            FROM fechas
            WHERE tipo_fecha = 'entrega_propuesta'
            AND es_global = TRUE
            AND proyecto_id IS NULL
            ORDER BY fecha DESC
            LIMIT 1
        `);

        if (fechas.length === 0) {
            return {
                existe: false,
                mensaje: 'No hay período de propuestas configurado'
            };
        }

        const fecha = fechas[0];
        
        return {
            existe: true,
            id: fecha.id,
            titulo: fecha.titulo,
            descripcion: fecha.descripcion,
            fecha_limite: fecha.fecha_limite,
            habilitada: Boolean(fecha.habilitada),
            permite_extension: Boolean(fecha.permite_extension),
            dias_restantes: fecha.dias_restantes,
            estado_tiempo: fecha.estado_tiempo,
            puede_recibir_propuestas: fecha.habilitada && fecha.dias_restantes >= 0
        };

    } catch (error) {
        console.error('Error obteniendo estado del período de propuestas:', error);
        throw error;
    }
};

/**
 * Deshabilitar automáticamente períodos vencidos (llamar desde un cron job o manualmente)
 * @returns {Object} Resultado de la operación
 */
export const deshabilitarPeriodosVencidos = async () => {
    try {
        const [result] = await pool.execute(`
            UPDATE fechas 
            SET habilitada = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE tipo_fecha = 'entrega_propuesta' 
            AND es_global = TRUE
            AND habilitada = TRUE
            AND fecha < CURDATE()
        `);

        return {
            success: true,
            periodos_deshabilitados: result.affectedRows,
            mensaje: `${result.affectedRows} período(s) vencido(s) deshabilitado(s) automáticamente`
        };

    } catch (error) {
        console.error('Error deshabilitando períodos vencidos:', error);
        throw error;
    }
};

export default {
    verificarPermisoSubida,
    verificarPermisoExtension,
    obtenerEstadoFechasProyecto,
    marcarFechaCompletada,
    verificarPermisoCrearPropuesta,
    verificarPermisoActualizarPropuesta,
    habilitarPeriodoPropuestas,
    deshabilitarPeriodoPropuestas,
    obtenerEstadoPeriodoPropuestas,
    deshabilitarPeriodosVencidos
};
