import { pool } from "../db/connectionDB.js";

// Crear un nuevo rol
const createRole = async (nombre, descripcion = null) => {
    const [rows] = await pool.execute(
        `INSERT INTO roles (nombre, descripcion) VALUES (?, ?)`,
        [nombre, descripcion]
    );

    const insertId = rows.insertId;
    const [result] = await pool.execute(
        `SELECT id, nombre, descripcion FROM roles WHERE id = ?`,
        [insertId]
    );
    return result[0];
};

// Buscar un rol por su nombre
const findRoleByName = async (nombre) => {
    const [rows] = await pool.execute(
        `SELECT * FROM roles WHERE nombre = ?`,
        [nombre]
    );

    return rows[0] || null;
};

// Buscar un rol por su ID
const findRoleById = async (id) => {
    const [rows] = await pool.execute(
        `SELECT * FROM roles WHERE id = ?`,
        [id]
    );

    return rows[0] || null;
};

// Obtener todos los roles
const getAllRoles = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM roles ORDER BY nombre`
    );
    return rows;
};

// Actualizar un rol
const updateRole = async (id, { nombre, descripcion }) => {
    await pool.execute(
        `UPDATE roles SET nombre = ?, descripcion = ?, updated_at = NOW() WHERE id = ?`,
        [nombre, descripcion, id]
    );

    const [rows] = await pool.execute(
        `SELECT id, nombre, descripcion FROM roles WHERE id = ?`,
        [id]
    );

    return rows[0] || null;
};

// Eliminar un rol
const deleteRole = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM roles WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
};

// Roles de profesores en proyectos
const createRoleProfesor = async (nombre, descripcion = null) => {
    const [rows] = await pool.execute(
        `INSERT INTO roles_profesores (nombre, descripcion) VALUES (?, ?)`,
        [nombre, descripcion]
    );

    const insertId = rows.insertId;
    const [result] = await pool.execute(
        `SELECT id, nombre, descripcion FROM roles_profesores WHERE id = ?`,
        [insertId]
    );
    return result[0];
};

const findRoleProfesorByName = async (nombre) => {
    const [rows] = await pool.execute(
        `SELECT * FROM roles_profesores WHERE nombre = ?`,
        [nombre]
    );

    return rows[0] || null;
};

const getAllRolesProfesores = async () => {
    const [rows] = await pool.execute(
        `SELECT * FROM roles_profesores ORDER BY nombre`
    );
    return rows;
};

const updateRoleProfesor = async (id, { nombre, descripcion }) => {
    await pool.execute(
        `UPDATE roles_profesores SET nombre = ?, descripcion = ?, updated_at = NOW() WHERE id = ?`,
        [nombre, descripcion, id]
    );

    const [rows] = await pool.execute(
        `SELECT id, nombre, descripcion FROM roles_profesores WHERE id = ?`,
        [id]
    );

    return rows[0] || null;
};

const deleteRoleProfesor = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM roles_profesores WHERE id = ?`,
        [id]
    );
    return result.affectedRows > 0;
};

export const RoleModel = {
    // Roles de usuarios
    createRole,
    findRoleByName,
    findRoleById,
    getAllRoles,
    updateRole,
    deleteRole,
    
    // Roles de profesores
    createRoleProfesor,
    findRoleProfesorByName,
    getAllRolesProfesores,
    updateRoleProfesor,
    deleteRoleProfesor
};
