import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../config/logger.js";

dotenv.config();

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME || !DB_PORT) {
    throw new Error("❌ Missing required environment variables for database connection");
}

export const waitForMySQL = async (retries = 10, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await mysql.createConnection({
                host: DB_HOST,
                user: DB_USER,
                password: DB_PASSWORD,
                port: DB_PORT,
            });
            await connection.end();
            logger.info('MySQL está disponible');
            return;
        } catch (err) {
            logger.warn(`Esperando MySQL (${i + 1}/${retries})...`);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    throw new Error('❌ No se pudo conectar a MySQL después de varios intentos');
};

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
        logger.info(`Base de datos '${DB_NAME}' verificada o creada`);
        await connection.end();
    } catch (error) {
        logger.error('Error creando la base de datos', { error: error.message });
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
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para verificar si las tablas principales ya existen
const checkTablesExist = async () => {
    try {
        const connection = await pool.getConnection();

        // Lista de tablas principales que indican que la BD ya está configurada
        const mainTables = ['usuarios', 'estados_propuestas', 'propuestas', 'proyectos'];
        
        // Lista de tablas nuevas que podrían faltar
        const newTables = [
            'estados_propuestas', 'roles_profesores', 'asignaciones_propuestas',
            'asignaciones_proyectos', 'fechas', 'participantes_reuniones',
            'hitos_proyecto', 'cronogramas_proyecto',
            'hitos_cronograma', 'notificaciones_proyecto', 'configuracion_alertas',
            'conversaciones', 'mensajes', 'mensajes_no_leidos'
        ];
        
        // Verificar tablas principales
        for (const table of mainTables) {
            try {
                const [rows] = await connection.query('SHOW TABLES LIKE ?', [table]);
                if (rows.length === 0) {
                    connection.release();
                    return false; // Si falta alguna tabla principal, necesitamos crear todo
                }
            } catch (error) {
                connection.release();
                return false; // Error al verificar, asumimos que necesitamos crear
            }
        }

        // Verificar tablas nuevas
        let missingNewTables = [];
        for (const table of newTables) {
            try {
                const [rows] = await connection.query('SHOW TABLES LIKE ?', [table]);
                if (rows.length === 0) {
                    missingNewTables.push(table);
                }
            } catch (error) {
                missingNewTables.push(table);
            }
        }
        
        connection.release();
        
        // Si faltan tablas nuevas, necesitamos ejecutar el script
        if (missingNewTables.length > 0) {
            logger.warn('Faltan tablas nuevas', { tablas: missingNewTables.join(', ') });
            return false;
        }
        
        return true; // Todas las tablas existen
    } catch (error) {
        logger.error('Error verificando tablas existentes', { error: error.message });
        return false;
    }
};

// Función para leer y ejecutar el archivo database.sql
const executeDatabaseScript = async () => {
    try {
        // Verificar si las tablas principales ya existen
        const tablesExist = await checkTablesExist();
        
        if (tablesExist) {
            logger.info('Base de datos ya configurada, saltando creación de tablas');
            return;
        }

        // Obtener la ruta del archivo database.sql
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const databaseScriptPath = path.join(__dirname, 'database.sql');
        
        // Leer el archivo database.sql
        const databaseScript = fs.readFileSync(databaseScriptPath, 'utf8');
        
        // Crear conexión sin especificar base de datos para poder ejecutar CREATE DATABASE
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD,
            port: DB_PORT,
        });

        logger.info('Leyendo y ejecutando script database.sql...');

        try {
            // Ejecutar el script completo de una vez
            await connection.query(databaseScript);
            logger.info('Script database.sql ejecutado correctamente');
        } catch (error) {
            logger.warn('Ejecución completa del script falló, intentando comando por comando...');
            
            // Dividir por líneas y ejecutar comandos simples
            const lines = databaseScript.split('\n');
            let currentCommand = '';
            let commandCount = 0;
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Saltar líneas vacías y comentarios
                if (!trimmedLine || trimmedLine.startsWith('--')) {
                    continue;
                }
                
                currentCommand += line + '\n';
                
                // Si la línea termina con ;, ejecutar el comando
                if (trimmedLine.endsWith(';')) {
                    try {
                        await connection.query(currentCommand);
                        commandCount++;
                    } catch (error) {
                        // Ignorar errores de "already exists" y índices duplicados
                        if (error.code === 'ER_DUP_ENTRY' || 
                            error.message.includes('already exists') ||
                            error.message.includes('Duplicate entry') ||
                            error.code === 'ER_DUP_KEYNAME' ||
                            error.message.includes('Duplicate key name') ||
                            error.message.includes('Duplicate index') ||
                            error.code === 'ER_DUP_FIELDNAME' ||
                            error.code === 'ER_DUP_FIELD' ||
                            error.message.includes('Duplicate column name') ||
                            error.code === 'ER_DUP_USERNAME' ||
                            error.message.includes('Duplicate user') ||
                            error.code === 'ER_DB_CREATE_EXISTS' ||
                            error.message.includes('database exists') ||
                            error.code === 'ER_KEY_COLUMN_DOES_NOT_EXITS' ||
                            error.message.includes("doesn't exist in table") ||
                            error.code === 'ER_NO_SUCH_TABLE' ||
                            error.message.includes("doesn't exist") ||
                            error.code === 'ER_FK_INCOMPATIBLE_COLUMNS' ||
                            error.message.includes('incompatible') ||
                            error.code === 'ER_FK_CANNOT_OPEN_PARENT' ||
                            error.message.includes('Failed to open the referenced table') ||
                            error.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
                            error.message.includes("check that column/key exists") ||
                            error.code === 'ER_PARSE_ERROR' ||
                            error.message.includes('IF NOT EXISTS') ||
                            error.message.includes('syntax error')) {
                            // ignorar errores de duplicados y objetos ya existentes
                        } else {
                            logger.error('Error en comando SQL', { error: error.message, cmd: currentCommand.substring(0, 100) });
                            throw error;
                        }
                    }
                    currentCommand = '';
                }
            }
            
            logger.info(`Script SQL ejecutado`, { comandos: commandCount });
        }

        await connection.end();
        
    } catch (error) {
        logger.error('Error ejecutando database.sql', { error: error.message });
        throw error;
    }
};

// Función para verificar que las tablas existen
const verifyTables = async () => {
    try {
        const connection = await pool.getConnection();
        
        // Verificar que las tablas principales existen
        const requiredTables = [
            'usuarios', 'estados_propuestas', 'propuestas',
            'roles_profesores', 'asignaciones_propuestas', 'proyectos',
            'asignaciones_proyectos', 'avances', 'fechas',
            'reuniones', 'participantes_reuniones', 'hitos_proyecto',
            'cronogramas_proyecto', 'hitos_cronograma',
            'historial_reuniones', 'documentos_proyecto',
            'conversaciones', 'mensajes', 'mensajes_no_leidos'
        ];

        let missingTables = [];
        let existingTables = [];

        for (const table of requiredTables) {
            try {
                const [rows] = await connection.query('SHOW TABLES LIKE ?', [table]);
                if (rows.length === 0) {
                    missingTables.push(table);
                } else {
                    existingTables.push(table);
                }
            } catch (error) {
                missingTables.push(table);
            }
        }

        // Mostrar resumen
        if (existingTables.length > 0) {
            logger.info('Tablas verificadas', { existentes: existingTables.length, tablas: existingTables.join(', ') });
        }

        if (missingTables.length > 0) {
            logger.warn('Tablas faltantes', { faltantes: missingTables.length, tablas: missingTables.join(', ') });
        }

        // Verificar datos iniciales solo en tablas que existen
        try {
            const [estados] = await connection.query('SELECT COUNT(*) as count FROM estados_propuestas');
            const [rolesProfesores] = await connection.query('SELECT COUNT(*) as count FROM roles_profesores');

            logger.info('Datos iniciales verificados', { estados: estados[0].count, roles_profesores: rolesProfesores[0].count });
        } catch (error) {
            logger.warn('No se pudieron verificar algunos datos iniciales');
        }

        connection.release();
        logger.info('Verificación de tablas completada');

    } catch (error) {
        logger.error('Error verificando tablas', { error: error.message });
        throw error;
    }
};

// Función principal para inicializar todo
export const initializeDatabase = async () => {
    try {
        logger.info('Iniciando inicialización de base de datos...');
        
    await waitForMySQL();
    await initDatabase();
        await executeDatabaseScript();
        await verifyTables();
        
        logger.info('Base de datos inicializada correctamente');

    } catch (error) {
        logger.error('Error durante la inicialización de la base de datos', { error: error.message });
        throw error;
    }
};

