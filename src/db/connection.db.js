import 'dotenv/config';
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