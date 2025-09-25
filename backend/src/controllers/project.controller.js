import { ProjectService } from '../services/project.service.js';

const createProject = async (req, res) => {
    try {
        const { titulo, descripcion } = req.body;

        const estudianteId = req.rut;
       
        const project = await ProjectService.createProject(titulo, descripcion, estudianteId);
        res.status(201).json(project);
    } catch 
    (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtener proyectos con control de permisos
const getProjects = async (req, res) => {
    try {
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        const projects = await ProjectService.obtenerProyectosPorPermisos(usuario_rut, rol_usuario);
        res.status(200).json({
            total: projects.length,
            projects: projects,
            usuario_rol: rol_usuario
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener proyecto específico con control de permisos
const getDetailProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (!projectId || isNaN(parseInt(projectId))) {
            return res.status(400).json({ message: 'ID de proyecto inválido' });
        }

        const project = await ProjectService.obtenerProyectoPorIdConPermisos(
            parseInt(projectId), 
            usuario_rut, 
            rol_usuario
        );

        if (!project) {
            return res.status(404).json({ 
                message: 'Proyecto no encontrado o no tienes permisos para verlo' 
            });
        }

        res.status(200).json(project);
    } catch (error) {
        console.error('Error al obtener proyecto:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Solo administradores pueden eliminar proyectos
        if (rol_usuario !== 'admin') {
            return res.status(403).json({ 
                message: 'Solo los administradores pueden eliminar proyectos' 
            });
        }

        const project = await ProjectService.deleteProject(projectId);
        res.status(200).json({ message: 'Proyecto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener proyectos del estudiante autenticado
const getMisProyectos = async (req, res) => {
    try {
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (rol_usuario !== 'estudiante') {
            return res.status(403).json({ message: 'Solo estudiantes pueden acceder a esta ruta' });
        }

        const projects = await ProjectService.obtenerProyectosPorPermisos(usuario_rut, rol_usuario);
        res.status(200).json({
            total: projects.length,
            projects: projects
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener proyectos asignados al profesor autenticado
const getProyectosAsignados = async (req, res) => {
    try {
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.rol;

        if (!usuario_rut) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        if (rol_usuario !== 'profesor') {
            return res.status(403).json({ message: 'Solo profesores pueden acceder a esta ruta' });
        }

        const projects = await ProjectService.obtenerProyectosPorPermisos(usuario_rut, rol_usuario);
        res.status(200).json({
            total: projects.length,
            projects: projects
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener proyecto con información completa (fechas importantes y profesores)
const getProyectoCompleto = async (req, res) => {
    try {
        const { projectId } = req.params;
        const usuario_rut = req.user?.rut;
        const rol_usuario = req.user?.role_id;

        if (!usuario_rut || !rol_usuario) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }

        // Verificar permisos
        const puedeVer = await ProjectService.puedeVerProyecto(projectId, usuario_rut, rol_usuario);
        if (!puedeVer) {
            return res.status(403).json({ message: 'No tienes permisos para ver este proyecto' });
        }

        const proyectoCompleto = await ProjectService.obtenerProyectoCompleto(projectId);
        
        if (!proyectoCompleto) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        res.status(200).json({
            success: true,
            data: proyectoCompleto
        });
    } catch (error) {
        console.error('Error al obtener proyecto completo:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

export const ProjectController = {
    createProject,
    getProjects,
    getDetailProject,
    deleteProject,
    getMisProyectos,
    getProyectosAsignados,
    getProyectoCompleto
};