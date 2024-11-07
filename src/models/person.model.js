import e from 'express';
import {db} from '../db/connection.db.js';

const createPerson = async (rut, nombre, email, password) => {

    let nombreRol;
    if (email.endsWith('@alumnos.ubiobio.cl')) {
        nombreRol = 'estudiante';
    } else if (email.endsWith('@ubiobio.cl')) {
        nombreRol = 'profesor';
    }

    const queryRol =  await db.query(`SELECT id FROM roles WHERE nombre = $1`, [nombreRol]);
    if (queryRol.rows.length === 0) {
        throw new Error(`Rol ${nombreRol} no encontrado`);
    }

    const rol_id = queryRol.rows[0].id;

    const query = {
        text: `
            INSERT INTO person ( rut, nombre, email, password, rol_id) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING email, nombre, rol_id;
        `,
        values: [rut, nombre, email, password, rol_id],
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

const findpersonAll = async () => {
    const query = {
        text: `
            SELECT * FROM person;
        `,
    };

    const {rows} = await db.query(query);
    return rows;
}

export const UserModel ={
    createPerson,
    findPersonByEmail,
    findPersonByRut,
    findpersonAll,

};