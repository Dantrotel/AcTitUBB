import 'dotenv/config';
import e from 'express';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const db = new Pool({
    allowExitOnIdle: true,
    connectionString: connectionString,
});

try {
    await db.query('SELECT NOW()');
    console.log('Database connected');
} catch (error) {
    console.error('Error connecting to the database:', error);
}

async function createRolesAndUsers(){
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL
            );
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS person (
                rut VARCHAR(12) PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL,
                email VARCHAR(50) NOT NULL,
                password VARCHAR(100) NOT NULL,
                rol_id INTEGER REFERENCES roles(id)
            );
        `);

        const rolesExist = await db.query(`SELECT COUNT(*) FROM roles`);
        if (parseInt(rolesExist.rows[0].count) === 0) {
            await db.query(`
                INSERT INTO roles (nombre)
                VALUES ('admin'), ('estudiante'), ('profesor'), ('jefe de carrera');
            `);
            console.log('Roles created');
        } else {
            console.log('Roles already exist');
        }

        // Verificar si el usuario admin ya existe
        const adminUser = await db.query(`SELECT * FROM person WHERE email = 'admin@ubiobio.cl'`);
        if (adminUser.rows.length === 0) {
            await db.query(`
                INSERT INTO person (rut, nombre, email, password, rol_id)
                VALUES ('12345678-9', 'admin', 'admin@ubiobio.cl', 'admin', 
                    (SELECT id FROM roles WHERE nombre = 'admin'));
            `);
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }
    } catch (error) {
        console.error('Error creating roles:', error);
    }
}

export default createRolesAndUsers;