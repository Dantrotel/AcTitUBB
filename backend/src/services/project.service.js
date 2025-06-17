import { ProjectModel } from '../models/project.model.js';

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



export const ProjectService = {
    createProject,
    getProjects,
    getDetailProject,
    deleteProject,
};