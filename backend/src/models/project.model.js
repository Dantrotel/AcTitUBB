import { pool } from '../db/connectionDB.js';

const createProject = async (titulo, descripcion, estudianteId) => {
    const query = `
        INSERT INTO proyecto (titulo, descripcion, estudiante_id, profesor_id, fecha_inicio)
        VALUES (?, ?, ?, ?, NOW());
    `;

    const [result] = await pool.query(query, [titulo, descripcion, estudianteId]);

    const [rows] = await pool.query(`SELECT * FROM proyecto WHERE id = ?`, [result.insertId]);
    return rows[0];
};

const getProjects = async () => {
    const query = `SELECT * FROM proyecto;`;
    const [rows] = await pool.query(query);
    return rows;
};

const getDetailProject = async (projectId) => {
    const query = `SELECT * FROM proyecto WHERE id = ?;`;
    const [rows] = await pool.query(query, [projectId]);
    return rows[0];
};

const deleteProject = async (projectId) => {
    const query = `DELETE FROM proyecto WHERE id = ?;`;
    await pool.query(query, [projectId]);
};

export const ProjectModel = {
    createProject,
    getProjects,
    getDetailProject,
    deleteProject,
};
