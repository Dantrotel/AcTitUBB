import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

async function runMigration() {
  let connection;
  try {
    console.log('🔧 Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');

    console.log('📄 Leyendo archivo de migración...');
    const sql = readFileSync(join(__dirname, 'add_colaboradores_auth.sql'), 'utf8');
    
    console.log('🔧 Ejecutando migración para sistema de colaboradores...');
    await connection.query(sql);
    console.log('✅ Migración completada exitosamente');
    console.log('');
    console.log('📊 Tablas creadas/modificadas:');
    console.log('  - colaboradores_externos (campos de autenticación)');
    console.log('  - evaluaciones_colaboradores (nueva)');
    console.log('  - tokens_colaboradores (nueva)');
    console.log('  - notificaciones_colaboradores (nueva)');
    console.log('  - colaboradores_proyectos (campos de tracking)');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();

