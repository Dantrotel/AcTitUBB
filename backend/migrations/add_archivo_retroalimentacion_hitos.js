/**
 * Migración: Agrega columnas de archivo de retroalimentación a hitos_cronograma
 * 
 * Ejecutar con: node backend/migrations/add_archivo_retroalimentacion_hitos.js
 * 
 * Permite que el profesor adjunte un documento (PDF/Word) junto a su revisión
 * para proporcionar retroalimentación más detallada al estudiante.
 */

import { pool } from '../src/db/database.js';

const migrate = async () => {
    const connection = await pool.getConnection();
    try {
        console.log('🔄 Iniciando migración: add_archivo_retroalimentacion_hitos...');

        // Verificar si las columnas ya existen
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'hitos_cronograma' 
            AND COLUMN_NAME IN ('archivo_retroalimentacion', 'nombre_archivo_retroalimentacion')
        `);

        const existentes = columns.map(c => c.COLUMN_NAME);

        if (!existentes.includes('archivo_retroalimentacion')) {
            await connection.execute(`
                ALTER TABLE hitos_cronograma 
                ADD COLUMN archivo_retroalimentacion VARCHAR(255) NULL 
                COMMENT 'Nombre de archivo del documento de retroalimentación del profesor'
                AFTER comentarios_profesor
            `);
            console.log('✅ Columna archivo_retroalimentacion agregada');
        } else {
            console.log('⏭️  Columna archivo_retroalimentacion ya existe, omitiendo');
        }

        if (!existentes.includes('nombre_archivo_retroalimentacion')) {
            await connection.execute(`
                ALTER TABLE hitos_cronograma 
                ADD COLUMN nombre_archivo_retroalimentacion VARCHAR(255) NULL 
                COMMENT 'Nombre original del archivo de retroalimentación'
                AFTER archivo_retroalimentacion
            `);
            console.log('✅ Columna nombre_archivo_retroalimentacion agregada');
        } else {
            console.log('⏭️  Columna nombre_archivo_retroalimentacion ya existe, omitiendo');
        }

        console.log('🎉 Migración completada exitosamente');
    } catch (error) {
        console.error('❌ Error en migración:', error.message);
        process.exit(1);
    } finally {
        connection.release();
        await pool.end();
    }
};

migrate();
