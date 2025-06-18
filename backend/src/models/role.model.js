import { pool } from "../db/connectionDB.js";

// Crear un nuevo rol
const createRole = async (nombre) => {
    const [rows] = await pool.query(
        `
        INSERT INTO Roles (nombre) 
        VALUES (?)
        `,
        [nombre]
    );

    const insertId = rows.insertId;
    const [result] = await pool.query(
        `SELECT id, nombre FROM Roles WHERE id = ?`,
        [insertId]
    );
    return result[0];
};

// Buscar un rol por su nombre
const findRoleByName = async (nombre) => {
    const [rows] = await pool.query(
        `
        SELECT * FROM Roles
        WHERE nombre = ?
        `,
        [nombre]
    );

    return rows[0] || null;
};

// Actualizar un rol por su nombre
const updateRole = async (nombre, newName) => {
    await pool.query(
        `
        UPDATE Roles
        SET nombre = ?
        WHERE nombre = ?
        `,
        [newName, nombre]
    );

    const [rows] = await pool.query(
        `
        SELECT id, nombre FROM Roles
        WHERE nombre = ?
        `,
        [newName]
    );

    return rows[0] || null;
};

// Eliminar un rol por su nombre
const deleteRole = async (nombre) => {
    await pool.query(
        `
        DELETE FROM Roles
        WHERE nombre = ?
        `,
        [nombre]
    );
};

export const RoleModel = {
    createRole,
    findRoleByName,
    updateRole,
    deleteRole
};
