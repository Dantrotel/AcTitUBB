import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  let connection;
  try {
    console.log('🔧 Conectando a la base de datos...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'actitubb'
    });
    
    console.log('✅ Conectado a la base de datos');
    console.log('🔧 Agregando columnas a historial_revisiones_propuestas...');
    
    try {
      await connection.execute(`
        ALTER TABLE historial_revisiones_propuestas 
        ADD COLUMN archivo_revision VARCHAR(255) NULL COMMENT 'Archivo adjunto a esta revisión'
      `);
      console.log('✅ Columna archivo_revision agregada');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Columna archivo_revision ya existe');
      } else {
        throw error;
      }
    }
    
    try {
      await connection.execute(`
        ALTER TABLE historial_revisiones_propuestas 
        ADD COLUMN nombre_archivo_original VARCHAR(255) NULL COMMENT 'Nombre original del archivo adjunto'
      `);
      console.log('✅ Columna nombre_archivo_original agregada');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('⚠️  Columna nombre_archivo_original ya existe');
      } else {
        throw error;
      }
    }
    
    console.log('🎉 Migración completada exitosamente');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

runMigration();

