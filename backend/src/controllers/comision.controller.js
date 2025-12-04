import * as comisionModel from '../models/comision.model.js';

/**
 * Obtener comisión evaluadora de un proyecto
 */
export const obtenerComision = async (req, res) => {
    try {
        const { proyectoId } = req.params;

        if (!proyectoId) {
            return res.status(400).json({ message: 'ID de proyecto requerido' });
        }

        const comision = await comisionModel.obtenerComisionPorProyecto(proyectoId);
        const estado = await comisionModel.verificarComisionCompleta(proyectoId);

        res.json({
            comision,
            estado_comision: estado
        });
    } catch (error) {
        console.error('Error al obtener comisión:', error);
        res.status(500).json({ message: 'Error al obtener comisión evaluadora' });
    }
};

/**
 * Agregar miembro a la comisión
 */
export const agregarMiembro = async (req, res) => {
    try {
        const { proyecto_id, profesor_rut, rol_comision, observaciones } = req.body;
        const asignado_por = req.user?.rut || req.rut;
        const rol_id = String(req.user?.role_id || req.rol_id);

        // Solo admin y superadmin pueden gestionar comisiones
        if (rol_id !== '3' && rol_id !== '4') {
            return res.status(403).json({ message: 'Solo administradores pueden gestionar comisiones' });
        }

        // Validaciones
        if (!proyecto_id || !profesor_rut || !rol_comision) {
            return res.status(400).json({ 
                message: 'Faltan datos requeridos: proyecto_id, profesor_rut, rol_comision' 
            });
        }

        const rolesValidos = ['presidente', 'secretario', 'vocal', 'suplente'];
        if (!rolesValidos.includes(rol_comision)) {
            return res.status(400).json({ 
                message: 'Rol inválido. Debe ser: presidente, secretario, vocal o suplente' 
            });
        }

        const comisionId = await comisionModel.agregarMiembroComision({
            proyecto_id,
            profesor_rut,
            rol_comision,
            observaciones,
            asignado_por
        });

        const comision = await comisionModel.obtenerComisionPorProyecto(proyecto_id);
        const estado = await comisionModel.verificarComisionCompleta(proyecto_id);

        res.status(201).json({
            message: 'Miembro agregado exitosamente a la comisión',
            comision_id: comisionId,
            comision,
            estado_comision: estado
        });
    } catch (error) {
        console.error('Error al agregar miembro:', error);
        
        if (error.message.includes('Ya existe')) {
            return res.status(409).json({ message: error.message });
        }
        
        if (error.message.includes('no existe') || error.message.includes('no tiene rol')) {
            return res.status(404).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al agregar miembro a la comisión' });
    }
};

/**
 * Remover miembro de la comisión
 */
export const removerMiembro = async (req, res) => {
    try {
        const { comisionId } = req.params;
        const removido_por = req.user?.rut || req.rut;
        const rol_id = String(req.user?.role_id || req.rol_id);

        // Solo admin y superadmin pueden remover
        if (rol_id !== '3' && rol_id !== '4') {
            return res.status(403).json({ message: 'Solo administradores pueden remover miembros' });
        }

        if (!comisionId) {
            return res.status(400).json({ message: 'ID de comisión requerido' });
        }

        const resultado = await comisionModel.removerMiembroComision(comisionId, removido_por);

        if (!resultado) {
            return res.status(404).json({ message: 'Miembro de comisión no encontrado o ya removido' });
        }

        res.json({ 
            message: 'Miembro removido exitosamente de la comisión',
            comision_id: comisionId
        });
    } catch (error) {
        console.error('Error al remover miembro:', error);
        res.status(500).json({ message: 'Error al remover miembro de la comisión' });
    }
};

/**
 * Actualizar rol de un miembro
 */
export const actualizarRol = async (req, res) => {
    try {
        const { comisionId } = req.params;
        const { nuevo_rol } = req.body;
        const rol_id = String(req.user?.role_id || req.rol_id);

        // Solo admin y superadmin pueden actualizar roles
        if (rol_id !== '3' && rol_id !== '4') {
            return res.status(403).json({ message: 'Solo administradores pueden actualizar roles' });
        }

        if (!nuevo_rol) {
            return res.status(400).json({ message: 'Nuevo rol requerido' });
        }

        const rolesValidos = ['presidente', 'secretario', 'vocal', 'suplente'];
        if (!rolesValidos.includes(nuevo_rol)) {
            return res.status(400).json({ 
                message: 'Rol inválido. Debe ser: presidente, secretario, vocal o suplente' 
            });
        }

        const resultado = await comisionModel.actualizarRolMiembro(comisionId, nuevo_rol);

        if (!resultado) {
            return res.status(404).json({ message: 'Miembro no encontrado' });
        }

        res.json({ 
            message: 'Rol actualizado exitosamente',
            comision_id: comisionId,
            nuevo_rol
        });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        
        if (error.message.includes('Ya existe')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(500).json({ message: 'Error al actualizar rol del miembro' });
    }
};

/**
 * Obtener todos los proyectos con estado de comisión (admin)
 */
export const obtenerProyectosConComision = async (req, res) => {
    try {
        const rol_id = String(req.user?.role_id || req.rol_id);

        // Solo admin y superadmin pueden ver todos los proyectos
        if (rol_id !== '3' && rol_id !== '4') {
            return res.status(403).json({ message: 'Solo administradores pueden acceder a este recurso' });
        }

        const proyectos = await comisionModel.obtenerProyectosConComision();

        res.json({
            total: proyectos.length,
            proyectos
        });
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ message: 'Error al obtener proyectos con comisión' });
    }
};

/**
 * Obtener profesores disponibles para asignar a comisión
 */
export const obtenerProfesoresDisponibles = async (req, res) => {
    try {
        const { proyectoId } = req.params;
        const rol_id = String(req.user?.role_id || req.rol_id);

        // Solo admin y superadmin pueden ver profesores disponibles
        if (rol_id !== '3' && rol_id !== '4') {
            return res.status(403).json({ message: 'Solo administradores pueden acceder a este recurso' });
        }

        if (!proyectoId) {
            return res.status(400).json({ message: 'ID de proyecto requerido' });
        }

        const profesores = await comisionModel.obtenerProfesoresDisponibles(proyectoId);

        res.json({
            total: profesores.length,
            profesores
        });
    } catch (error) {
        console.error('Error al obtener profesores:', error);
        res.status(500).json({ message: 'Error al obtener profesores disponibles' });
    }
};
