import e from 'express';
import {db} from '../db/connection.db.js';

const createPerson = async (rut, nombre, apellido, email, telefono, password, rol_id) => {
    const query = {
        text: `
            INSERT INTO person ( rut, nombre, apellido, email, telefono, password, rol_id) 
            VALUES ($1, $2, $3)
            RETURNING email, nombre, apellido;
        `,
        values: [rut, nombre, apellido, email, telefono, password, rol_id],
    };

    const {rows} = await db.query(query);
    return rows[0];
};

const findPersonByEmail = async (email) => {
    const query = {
        text: `
            SELECT * FROM person
            WHERE email = $1;
        `,
        values: [email],
    };

    const {rows} = await db.query(query);
    return rows[0];
};

const findPersonByRut = async (rut) => {
    const query = {
        text: `
            SELECT * FROM person
            WHERE rut = $1;
        `,
        values: [rut],
    };

    const {rows} = await db.query(query);
    return rows[0];
};

export const UserModel ={
    createPerson,
    findPersonByEmail,
    findPersonByRut
    
};