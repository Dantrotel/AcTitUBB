import { RoleModel } from "../models/role.model.js";
import { ProjectService } from "../services/project.service.js";

const createRole = async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const role = await RoleModel.findRoleByName(nombre);

        if (role) {
            return res.status(409).json({ message: "Role already exists" });
        }

        const newRole = await RoleModel.createRole(nombre);
        return res.json({ ok: true, message: "New role created", role: newRole });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const findRoleByName = async (req, res) => {
    try {
        const { nombre } = req.params;

        if (!nombre) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const role = await RoleModel.findRoleByName(nombre);

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        return res.json({ ok: true, role });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const updateRole = async (req, res) => {
    try {
        const { nombre } = req.params;
        const { newName } = req.body;

        if (!nombre || !newName) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const role = await RoleModel.findRoleByName(nombre);

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        const updatedRole = await RoleModel.updateRole(nombre, newName);
        return res.json({ ok: true, message: "Role updated", role: updatedRole });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const deleteRole = async (req, res) => {
    try {
        const { nombre } = req.params;

        if (!nombre) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const role = await RoleModel.findRoleByName(nombre);

        if (!role) {
            return res.status(404).json({ message: "Role not found" });
        }

        await RoleModel.deleteRole(nombre);
        return res.json({ ok: true, message: "Role deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ============= CONTROLADORES PARA ROLES DE PROFESORES =============

const getRolesProfesores = async (req, res) => {
    try {
        const roles = await RoleModel.getAllRolesProfesores();
        return res.json({ ok: true, roles });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ============= CONTROLADORES PARA ASIGNACIONES =============

const asignarProfesorAProyecto = async (req, res) => {
    try {
        const { proyecto_id, profesor_rut, rol_profesor_id, observaciones } = req.body;
        const asignado_por = req.user.rut; // Del middleware de autenticación

        if (!proyecto_id || !profesor_rut || !rol_profesor_id) {
            return res.status(400).json({ 
                message: "Faltan campos requeridos: proyecto_id, profesor_rut, rol_profesor_id" 
            });
        }

        const resultado = await RoleModel.asignarProfesorAProyecto(
            proyecto_id, 
            profesor_rut, 
            rol_profesor_id, 
            asignado_por, 
            observaciones
        );

        // Verificar automáticamente si ya se tienen los 3 roles y activar proyecto
        try {
            const proyectoActivado = await ProjectService.verificarYActivarProyectoSiCompleto(proyecto_id);
            if (proyectoActivado) {
                console.log(`🎉 Proyecto ${proyecto_id} activado automáticamente tras asignación completa de roles`);
            }
        } catch (activacionError) {
            console.error('⚠️ Error al verificar/activar proyecto:', activacionError);
            // No afecta la respuesta de la asignación
        }

        return res.json({ 
            ok: true, 
            message: resultado.mensaje,
            asignacion_id: resultado.id 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: error.message || "Error interno del servidor" 
        });
    }
};

const desasignarProfesorDeProyecto = async (req, res) => {
    try {
        const { asignacion_id } = req.params;
        const { observaciones } = req.body;
        const desasignado_por = req.user.rut; // Del middleware de autenticación

        if (!asignacion_id) {
            return res.status(400).json({ 
                message: "ID de asignación requerido" 
            });
        }

        const resultado = await RoleModel.desasignarProfesorDeProyecto(
            asignacion_id, 
            desasignado_por, 
            observaciones
        );

        return res.json({ 
            ok: true, 
            message: resultado.mensaje 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
            message: error.message || "Error interno del servidor" 
        });
    }
};

const getAsignacionesProyecto = async (req, res) => {
    try {
        const { proyecto_id } = req.params;

        if (!proyecto_id) {
            return res.status(400).json({ 
                message: "ID de proyecto requerido" 
            });
        }

        const asignaciones = await RoleModel.getAsignacionesProyecto(proyecto_id);
        return res.json({ 
            ok: true, 
            asignaciones 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

const getProyectosAsignadosProfesor = async (req, res) => {
    try {
        // Si no se proporciona rut, usar el del usuario autenticado
        const profesor_rut = req.params.profesor_rut || req.user.rut;

        const proyectos = await RoleModel.getProyectosAsignadosProfesor(profesor_rut);
        return res.json({ 
            ok: true, 
            projects: proyectos 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

const getEstadisticasAsignaciones = async (req, res) => {
    try {
        const estadisticas = await RoleModel.getEstadisticasAsignaciones();
        return res.json({ 
            ok: true, 
            estadisticas 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

const getHistorialAsignaciones = async (req, res) => {
    try {
        const { proyecto_id, profesor_rut, limite } = req.query;
        
        const historial = await RoleModel.getHistorialAsignaciones(
            proyecto_id, 
            profesor_rut, 
            parseInt(limite) || 50
        );
        
        return res.json({ 
            ok: true, 
            historial 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const roleController = {
    // Roles básicos
    createRole,
    findRoleByName,
    updateRole,
    deleteRole,
    
    // Roles de profesores
    getRolesProfesores,
    
    // Gestión de asignaciones
    asignarProfesorAProyecto,
    desasignarProfesorDeProyecto,
    getAsignacionesProyecto,
    getProyectosAsignadosProfesor,
    getEstadisticasAsignaciones,
    getHistorialAsignaciones
};
