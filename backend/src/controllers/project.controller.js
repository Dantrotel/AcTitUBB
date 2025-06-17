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

const getProjects = async (req, res) => {
    try {
        const projects = await ProjectService.getProjects();
        res.status(200).json(projects);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getDetailProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await ProjectService.getDetailProject(projectId);
        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await ProjectService.deleteProject(projectId);
        res.status(200).json(project);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}



export const ProjectController = {
    createProject,
    getProjects,
    getDetailProject,
    deleteProject,
};