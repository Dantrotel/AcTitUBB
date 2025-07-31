import { pool } from './src/db/connectionDB.js';

async function diagnoseDatabase() {
    try {
        console.log("🔍 Diagnóstico de la base de datos...");
        
        const connection = await pool.getConnection();
        
        // Verificar todas las tablas
        console.log("\n📋 Tablas existentes:");
        const [tables] = await connection.query('SHOW TABLES');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });
        
        // Verificar estructura de la tabla propuestas
        console.log("\n📝 Estructura de la tabla 'propuestas':");
        try {
            const [columns] = await connection.query('DESCRIBE propuestas');
            columns.forEach(col => {
                console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
            });
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Verificar estructura de la tabla proyectos
        console.log("\n🏗️ Estructura de la tabla 'proyectos':");
        try {
            const [columns] = await connection.query('DESCRIBE proyectos');
            columns.forEach(col => {
                console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
            });
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        // Verificar datos en tablas principales
        console.log("\n📊 Datos en tablas principales:");
        
        try {
            const [roles] = await connection.query('SELECT COUNT(*) as count FROM roles');
            console.log(`   - roles: ${roles[0].count} registros`);
        } catch (error) {
            console.log(`   - roles: ❌ Error - ${error.message}`);
        }
        
        try {
            const [usuarios] = await connection.query('SELECT COUNT(*) as count FROM usuarios');
            console.log(`   - usuarios: ${usuarios[0].count} registros`);
        } catch (error) {
            console.log(`   - usuarios: ❌ Error - ${error.message}`);
        }
        
        try {
            const [propuestas] = await connection.query('SELECT COUNT(*) as count FROM propuestas');
            console.log(`   - propuestas: ${propuestas[0].count} registros`);
        } catch (error) {
            console.log(`   - propuestas: ❌ Error - ${error.message}`);
        }
        
        try {
            const [proyectos] = await connection.query('SELECT COUNT(*) as count FROM proyectos');
            console.log(`   - proyectos: ${proyectos[0].count} registros`);
        } catch (error) {
            console.log(`   - proyectos: ❌ Error - ${error.message}`);
        }
        
        // Verificar índices existentes
        console.log("\n🔍 Índices en tabla 'propuestas':");
        try {
            const [indexes] = await connection.query('SHOW INDEX FROM propuestas');
            indexes.forEach(index => {
                console.log(`   - ${index.Key_name}: ${index.Column_name}`);
            });
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        connection.release();
        
        console.log("\n✅ Diagnóstico completado");
        
    } catch (error) {
        console.error("❌ Error durante el diagnóstico:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

// Ejecutar diagnóstico
diagnoseDatabase(); 