import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME || !DB_PORT) {
    throw new Error("❌ Missing required environment variables for database connection");
}

// Paso 1: Crear la base de datos si no existe
const initDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            port: DB_PORT,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
        console.log(`✅ Base de datos '${DB_NAME}' verificada o creada.`);
        await connection.end();
    } catch (error) {
        console.error("❌ Error creando la base de datos:", error);
        throw error;
    }
};

// Paso 2: Crear el pool de conexión
export const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
});

// Paso 3: Crear tablas si no existen
export const createTables = async () => {
    try {
        const connection = await pool.getConnection();

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL UNIQUE
            ); 
        `);

        // Insertar roles por defecto si no existen
        const [roles] = await connection.query(`SELECT * FROM Roles;`);
        if (roles.length === 0) {
            await connection.query(`
                INSERT INTO Roles (nombre) VALUES 
                ('estudiante'), 
                ('profesor'), 
                ('admin');
            `);
            console.log("✅ Roles por defecto insertados correctamente");
        }

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Usuarios (
                Rut VARCHAR(10) NOT NULL PRIMARY KEY UNIQUE,
                nombre VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                rol_id INT NOT NULL,
                FOREIGN KEY (rol_id) REFERENCES Roles(id)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Estados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(50) NOT NULL UNIQUE
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Proyectos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                Titulo VARCHAR(100) NOT NULL,
                descripcion TEXT,
                estado VARCHAR(20) NOT NULL,
                fecha_entrega DATE NOT NULL,
                fecha_inicio DATE,
                estudiante VARCHAR(10) NOT NULL,
                FOREIGN KEY (estudiante) REFERENCES Usuarios(Rut),
                FOREIGN KEY (estado) REFERENCES Estados(nombre)
            );
        `);

       await connection.query(`
            CREATE TABLE IF NOT EXISTS Profesores (
                Rut VARCHAR(10) NOT NULL PRIMARY KEY UNIQUE,
                nombre VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                proyecto_id INT NOT NULL,
                profesor_id VARCHAR(10) NOT NULL,
                FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id),
                FOREIGN KEY (Rut) REFERENCES Usuarios(Rut),
                FOREIGN KEY (profesor_id) REFERENCES Usuarios(Rut)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Reuniones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                proyecto_id INT NOT NULL,
                fecha DATE NOT NULL,
                hora TIME NOT NULL,
                lugar VARCHAR(100) NOT NULL,
                FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS Avances (
                id INT AUTO_INCREMENT PRIMARY KEY,
                proyecto_id INT NOT NULL,
                fecha DATE NOT NULL,
                descripcion TEXT NOT NULL,
                FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id)
            );
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS AsignacionProfesores (
                id INT AUTO_INCREMENT PRIMARY KEY,
                proyecto_id INT NOT NULL,
                profesor_id VARCHAR(10) NOT NULL,
                FOREIGN KEY (proyecto_id) REFERENCES Proyectos(id),
                FOREIGN KEY (profesor_id) REFERENCES Profesores(Rut)
            );
        `);

        await connection.query(`CREATE TABLE IF NOT EXISTS Propuestas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(255) NOT NULL,
            descripcion TEXT NOT NULL,
            estudiante_rut VARCHAR(12) NOT NULL,
            profesor_rut VARCHAR(12),
            estado ENUM('pendiente', 'correcciones', 'aprobada', 'rechazada') DEFAULT 'pendiente',
            comentarios_profesor TEXT,
            fecha_envio DATE NOT NULL,
            fecha_revision DATETIME,
            asignado_por VARCHAR(12),
            archivo VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
        `);

        connection.release();
        console.log("✅ Tablas creadas/verificadas correctamente");
        console.log("✅ Base de datos inicializada correctamente");
    } catch (error) {
        console.error("❌ Error creando/verificando las tablas:", error);
        throw error;
    }
};


// Función principal para inicializar todo
export const initializeDatabase = async () => {
    await initDatabase();
    await createTables();
};
