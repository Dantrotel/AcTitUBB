import {db} from '../db/connection.db.js';

const createRole = async (nombre) => {
    const query = {
        text: `
            INSERT INTO role (nombre) 
            VALUES ($1)
            RETURNING id, nombre;
        `,
        values: [nombre],
    };

    const {rows} = await db.query(query);
    return rows[0];
};

const findRoleByName = async (nombre) => {
    const query = {
        text: `
            SELECT * FROM role
            WHERE nombre = $1;
        `,
        values: [nombre],
    };

    const {rows} = await db.query(query);
    return rows[0];
};

const updatedRole = async (nombre, newName) => {
    const query = {
        text: `
            UPDATE role
            SET nombre = $2
            WHERE nombre = $1
            RETURNING id, nombre;
        `,
        values: [nombre, newName],
    };

    const {rows} = await db.query(query);
    return rows[0];
};

const deleteRole = async (nombre) => {
    const query = {
        text: `
            DELETE FROM role
            WHERE nombre = $1;
        `,
        values: [nombre],
    };

    await db.query(query);
};

export const RoleModel ={
    createRole,
    findRoleByName,
    updatedRole,
    deleteRole
};