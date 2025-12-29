import pool from '../src/config/database.js';

async function runMigration() {
  try {
    console.log('🔧 Ejecutando migración: agregar archivo_revision a historial_revisiones_propuestas...');
    
    // Agregar columna archivo_revision
    await pool.execute(`
      ALTER TABLE historial_revisiones_propuestas 
      ADD COLUMN IF NOT EXISTS archivo_revision VARCHAR(255) NULL COMMENT 'Archivo adjunto a esta revisión'
    `);
    console.log('✅ Columna archivo_revision agregada');
    
    // Agregar columna nombre_archivo_original
    await pool.execute(`
      ALTER TABLE historial_revisiones_propuestas 
      ADD COLUMN IF NOT EXISTS nombre_archivo_original VARCHAR(255) NULL COMMENT 'Nombre original del archivo adjunto'
    `);
    console.log('✅ Columna nombre_archivo_original agregada');
    
    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    process.exit(1);
  }
}

runMigration();

