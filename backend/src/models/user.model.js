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
        `SELECT id FROM roles WHERE nombre = ?`,
        [nombreRol]
    );

    if (roles.length === 0) {
        throw new Error(`Rol ${nombreRol} no encontrado`);
    }

    const rol_id = roles[0].id;

    const [result] = await pool.execute(
        `INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [rut, nombre, email, password, rol_id, false]
        );
        return { email, nombre, rol_id };
};

const findPersonByEmail = async (email) => {
    const [rows] = await pool.execute(
        `SELECT u.rut, u.nombre, u.email, u.password, u.rol_id, u.confirmado, r.nombre as rol_nombre
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id
         WHERE u.email = ?`,
        [email]
    );
    return rows[0];
};

const findPersonByRut = async (rut) => {
    const [rows] = await pool.execute(
        `SELECT u.rut, u.nombre, u.email, u.password, u.rol_id, u.confirmado, r.nombre as rol_nombre
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id
         WHERE u.rut = ?`,
        [rut]
    );
    return rows[0];
};

const findpersonAll = async () => {
    const [rows] = await pool.execute(`
        SELECT u.rut, u.nombre, u.email, u.confirmado, r.nombre as rol_nombre
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        ORDER BY u.nombre
    `);
    return rows;
};

const confirmarCuentaPorEmail = async (email) =>{
  const query = 'UPDATE usuarios SET confirmado = 1 WHERE email = ?';
  const [result] = await pool.execute(query, [email]);
  return result;
}

const obtenerUsuariosPorRol = async (rolNombre) => {
    const [rows] = await pool.execute(`
        SELECT u.rut, u.nombre, u.email, u.confirmado
        FROM usuarios u
        INNER JOIN roles r ON u.rol_id = r.id
        WHERE r.nombre = ?
        ORDER BY u.nombre
    `, [rolNombre]);
    return rows;
};

const actualizarUsuario = async (rut, { nombre, email }) => {
    const [result] = await pool.execute(
        `UPDATE usuarios SET nombre = ?, email = ?, updated_at = NOW() WHERE rut = ?`,
        [nombre, email, rut]
    );
    return result.affectedRows > 0;
};

const eliminarUsuario = async (rut) => {
    const [result] = await pool.execute(
        `DELETE FROM usuarios WHERE rut = ?`,
        [rut]
    );
    return result.affectedRows > 0;
};

export const UserModel = {
    createPerson,
    findPersonByEmail,
    findPersonByRut,
    findpersonAll,
    confirmarCuentaPorEmail,
    obtenerUsuariosPorRol,
    actualizarUsuario,
    eliminarUsuario
};
