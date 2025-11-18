import * as reunionesModel from '../models/reuniones.model.js';

/**
 * Responder a solicitud de reunión
 */
export const responderSolicitud = async (req, res) => {
    try {
        const { solicitudId } = req.params;
        const { respuesta, comentarios } = req.body;
        const usuario_rut = req.user?.rut || req.rut;

        if (!solicitudId) {
            return res.status(400).json({ message: 'ID de solicitud requerido' });
        }

        if (!respuesta || !['aceptar', 'rechazar'].includes(respuesta)) {
            return res.status(400).json({ message: 'Respuesta inválida. Debe ser "aceptar" o "rechazar"' });
        }

        const resultado = await reunionesModel.responderSolicitudReunion(
            solicitudId,
            usuario_rut,
            respuesta,
            comentarios || ''
        );

        res.json(resultado);
    } catch (error) {
        console.error('Error al responder solicitud:', error);

        if (error.message.includes('no encontrada') || error.message.includes('no encontrado')) {
            return res.status(404).json({ message: error.message });
        }

        if (error.message.includes('permisos') || error.message.includes('asignación')) {
            return res.status(403).json({ message: error.message });
        }

        if (error.message.includes('ya')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al responder solicitud de reunión' });
    }
};

/**
 * Obtener reuniones de un usuario
 */
export const obtenerReuniones = async (req, res) => {
    try {
        const usuario_rut = req.user?.rut || req.rut;
        const { estado } = req.query;

        const reuniones = await reunionesModel.obtenerReunionesUsuario(usuario_rut, estado);

        res.json({
            total: reuniones.length,
            reuniones
        });
    } catch (error) {
        console.error('Error al obtener reuniones:', error);
        res.status(500).json({ message: 'Error al obtener reuniones' });
    }
};

/**
 * Actualizar estado de reunión
 */
export const actualizarEstado = async (req, res) => {
    try {
        const { reunionId } = req.params;
        const { nuevo_estado, datos_adicionales } = req.body;
        const usuario_rut = req.user?.rut || req.rut;

        if (!nuevo_estado) {
            return res.status(400).json({ message: 'Nuevo estado requerido' });
        }

        const estadosValidos = ['programada', 'realizada', 'cancelada'];
        if (!estadosValidos.includes(nuevo_estado)) {
            return res.status(400).json({ 
                message: 'Estado inválido. Debe ser: programada, realizada o cancelada' 
            });
        }

        const resultado = await reunionesModel.actualizarEstadoReunion(
            reunionId,
            nuevo_estado,
            usuario_rut,
            datos_adicionales || {}
        );

        if (!resultado) {
            return res.status(404).json({ message: 'Reunión no encontrada o sin permisos' });
        }

        res.json({ 
            message: 'Estado de reunión actualizado',
            reunion_id: reunionId,
            nuevo_estado
        });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        
        if (error.message.includes('permisos')) {
            return res.status(403).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al actualizar estado de reunión' });
    }
};

// ===== GESTIÓN DE ACTAS =====

/**
 * Crear acta de reunión
 */
export const crearActa = async (req, res) => {
    try {
        const {
            reunion_id,
            proyecto_id,
            fecha_reunion,
            hora_inicio,
            hora_fin,
            lugar,
            asistentes,
            objetivo,
            temas_tratados,
            acuerdos,
            tareas_asignadas,
            proximos_pasos,
            observaciones
        } = req.body;

        const creado_por = req.user?.rut || req.rut;

        // Validaciones
        if (!reunion_id || !proyecto_id || !fecha_reunion || !hora_inicio || !hora_fin) {
            return res.status(400).json({
                message: 'Faltan datos requeridos: reunion_id, proyecto_id, fecha_reunion, hora_inicio, hora_fin'
            });
        }

        if (!asistentes || !objetivo || !temas_tratados || !acuerdos) {
            return res.status(400).json({
                message: 'Faltan datos de contenido: asistentes, objetivo, temas_tratados, acuerdos'
            });
        }

        if (objetivo.trim().length < 20) {
            return res.status(400).json({ message: 'El objetivo debe tener al menos 20 caracteres' });
        }

        if (temas_tratados.trim().length < 30) {
            return res.status(400).json({ message: 'Los temas tratados deben ser detallados (mínimo 30 caracteres)' });
        }

        if (acuerdos.trim().length < 20) {
            return res.status(400).json({ message: 'Los acuerdos deben ser detallados (mínimo 20 caracteres)' });
        }

        const actaId = await reunionesModel.crearActaReunion({
            reunion_id,
            proyecto_id,
            fecha_reunion,
            hora_inicio,
            hora_fin,
            lugar,
            asistentes,
            objetivo,
            temas_tratados,
            acuerdos,
            tareas_asignadas,
            proximos_pasos,
            observaciones,
            creado_por
        });

        res.status(201).json({
            message: 'Acta creada exitosamente',
            acta_id: actaId
        });
    } catch (error) {
        console.error('Error al crear acta:', error);

        if (error.message.includes('no encontrada')) {
            return res.status(404).json({ message: error.message });
        }

        if (error.message.includes('Solo los participantes')) {
            return res.status(403).json({ message: error.message });
        }

        if (error.message.includes('Ya existe')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al crear acta de reunión' });
    }
};

/**
 * Obtener acta por ID
 */
export const obtenerActa = async (req, res) => {
    try {
        const { actaId } = req.params;

        if (!actaId) {
            return res.status(400).json({ message: 'ID de acta requerido' });
        }

        const acta = await reunionesModel.obtenerActaPorId(actaId);

        if (!acta) {
            return res.status(404).json({ message: 'Acta no encontrada' });
        }

        res.json(acta);
    } catch (error) {
        console.error('Error al obtener acta:', error);
        res.status(500).json({ message: 'Error al obtener acta' });
    }
};

/**
 * Obtener actas por proyecto
 */
export const obtenerActasPorProyecto = async (req, res) => {
    try {
        const { proyectoId } = req.params;

        if (!proyectoId) {
            return res.status(400).json({ message: 'ID de proyecto requerido' });
        }

        const actas = await reunionesModel.obtenerActasPorProyecto(proyectoId);

        res.json({
            total: actas.length,
            actas
        });
    } catch (error) {
        console.error('Error al obtener actas:', error);
        res.status(500).json({ message: 'Error al obtener actas del proyecto' });
    }
};

/**
 * Obtener acta por reunión
 */
export const obtenerActaPorReunion = async (req, res) => {
    try {
        const { reunionId } = req.params;

        if (!reunionId) {
            return res.status(400).json({ message: 'ID de reunión requerido' });
        }

        const acta = await reunionesModel.obtenerActaPorReunion(reunionId);

        if (!acta) {
            return res.status(404).json({ message: 'No se encontró acta para esta reunión' });
        }

        res.json(acta);
    } catch (error) {
        console.error('Error al obtener acta:', error);
        res.status(500).json({ message: 'Error al obtener acta de reunión' });
    }
};

/**
 * Actualizar acta
 */
export const actualizarActa = async (req, res) => {
    try {
        const { actaId } = req.params;
        const usuario_rut = req.user?.rut || req.rut;

        if (!actaId) {
            return res.status(400).json({ message: 'ID de acta requerido' });
        }

        const resultado = await reunionesModel.actualizarActa(actaId, req.body, usuario_rut);

        if (!resultado) {
            return res.status(404).json({ message: 'Acta no encontrada o sin cambios' });
        }

        res.json({ 
            message: 'Acta actualizada exitosamente',
            acta_id: actaId
        });
    } catch (error) {
        console.error('Error al actualizar acta:', error);

        if (error.message.includes('Solo el creador')) {
            return res.status(403).json({ message: error.message });
        }

        if (error.message.includes('no puede editar')) {
            return res.status(403).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al actualizar acta' });
    }
};

/**
 * Firmar acta
 */
export const firmarActa = async (req, res) => {
    try {
        const { actaId } = req.params;
        const { tipo } = req.body; // 'estudiante' o 'profesor'
        const usuario_rut = req.user?.rut || req.rut;

        if (!actaId) {
            return res.status(400).json({ message: 'ID de acta requerido' });
        }

        if (!tipo || !['estudiante', 'profesor'].includes(tipo)) {
            return res.status(400).json({ message: 'Tipo inválido. Debe ser "estudiante" o "profesor"' });
        }

        const resultado = await reunionesModel.firmarActa(actaId, usuario_rut, tipo);

        res.json({
            message: resultado.acta_completa ? 
                'Acta firmada. El acta está completamente firmada' : 
                `Acta firmada por ${tipo}. Falta firma de ${tipo === 'estudiante' ? 'profesor' : 'estudiante'}`,
            ...resultado
        });
    } catch (error) {
        console.error('Error al firmar acta:', error);

        if (error.message.includes('no encontrada')) {
            return res.status(404).json({ message: error.message });
        }

        if (error.message.includes('No eres')) {
            return res.status(403).json({ message: error.message });
        }

        if (error.message.includes('Ya has firmado')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al firmar acta' });
    }
};

/**
 * Publicar acta (cambiar de borrador a pendiente_firma)
 */
export const publicarActa = async (req, res) => {
    try {
        const { actaId } = req.params;
        const usuario_rut = req.user?.rut || req.rut;

        if (!actaId) {
            return res.status(400).json({ message: 'ID de acta requerido' });
        }

        const resultado = await reunionesModel.publicarActa(actaId, usuario_rut);

        if (!resultado) {
            return res.status(404).json({ message: 'Acta no encontrada' });
        }

        res.json({ 
            message: 'Acta publicada. Esperando firmas de los participantes',
            acta_id: actaId
        });
    } catch (error) {
        console.error('Error al publicar acta:', error);

        if (error.message.includes('Solo el creador')) {
            return res.status(403).json({ message: error.message });
        }

        if (error.message.includes('Solo se pueden publicar')) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al publicar acta' });
    }
};

/**
 * Archivar acta
 */
export const archivarActa = async (req, res) => {
    try {
        const { actaId } = req.params;
        const usuario_rut = req.user?.rut || req.rut;

        if (!actaId) {
            return res.status(400).json({ message: 'ID de acta requerido' });
        }

        const resultado = await reunionesModel.archivarActa(actaId, usuario_rut);

        if (!resultado) {
            return res.status(404).json({ message: 'Acta no encontrada' });
        }

        res.json({ 
            message: 'Acta archivada exitosamente',
            acta_id: actaId
        });
    } catch (error) {
        console.error('Error al archivar acta:', error);

        if (error.message.includes('Solo el profesor')) {
            return res.status(403).json({ message: error.message });
        }

        if (error.message.includes('Solo se pueden archivar')) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al archivar acta' });
    }
};
