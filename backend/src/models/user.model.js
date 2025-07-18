import { pool } from '../db/connectionDB.js';

const createPerson = async (rut, nombre, email, password) => {
    let nombreRol;
    if (email.endsWith('@alumnos.ubiobio.cl')) {
        nombreRol = 'estudiante';
    } else if (email.endsWith('@ubiobio.cl')) {
        nombreRol = 'profesor';
    } else {
        throw new Error('Email no pertenece a la organización');
    }

    const [roles] = await pool.execute(
        `SELECT id FROM Roles WHERE nombre = ?`,
        [nombreRol]
    );

    if (roles.length === 0) {
        throw new Error(`Rol ${nombreRol} no encontrado`);
    }

    const rol_id = roles[0].id;

    const [result] = await pool.execute(
        `INSERT INTO Usuarios (rut, nombre, email, password, rol_id, confirmado) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [rut, nombre, email, password, rol_id, false]
        );
        return { email, nombre, rol_id };
};

const findPersonByEmail = async (email) => {
    const [rows] = await pool.execute(
        `SELECT rut, nombre, email, password, rol_id FROM Usuarios WHERE email = ?`,
        [email]
    );
    return rows[0];
};

const findPersonByRut = async (rut) => {
    const [rows] = await pool.execute(
        `SELECT rut, nombre, email, password, rol_id FROM Usuarios WHERE rut = ?`,
        [rut]
    );
    return rows[0];
};

const findpersonAll = async () => {
    const [rows] = await pool.execute(`SELECT * FROM Usuarios`);
    return rows;
};

export const UserModel = {
    createPerson,
    findPersonByEmail,
    findPersonByRut,
    findpersonAll,
};
