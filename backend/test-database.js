import { initializeDatabase, pool } from './src/db/connectionDB.js';

async function testDatabase() {
    try {
        console.log("🧪 Iniciando prueba de base de datos...");
        
        // Inicializar la base de datos
        await initializeDatabase();
        
        // Probar algunas consultas básicas
        console.log("\n📊 Probando consultas básicas...");
        
        const connection = await pool.getConnection();
        
        // Verificar roles
        const [roles] = await connection.query('SELECT * FROM roles');
        console.log(`✅ Roles encontrados: ${roles.length}`);
        roles.forEach(role => console.log(`   - ${role.nombre}`));
        
        // Verificar estados de propuestas
        try {
            const [estados] = await connection.query('SELECT * FROM estados_propuestas');
            console.log(`✅ Estados de propuestas encontrados: ${estados.length}`);
            estados.forEach(estado => console.log(`   - ${estado.nombre}`));
        } catch (error) {
            console.log(`⚠️  Estados de propuestas: ${error.message}`);
        }
        
        // Verificar roles de profesores
        try {
            const [rolesProfesores] = await connection.query('SELECT * FROM roles_profesores');
            console.log(`✅ Roles de profesores encontrados: ${rolesProfesores.length}`);
            rolesProfesores.forEach(rol => console.log(`   - ${rol.nombre}`));
        } catch (error) {
            console.log(`⚠️  Roles de profesores: ${error.message}`);
        }
        
        // Verificar asignaciones de propuestas
        try {
            const [asignaciones] = await connection.query('SELECT * FROM asignaciones_propuestas');
            console.log(`✅ Asignaciones de propuestas encontradas: ${asignaciones.length}`);
        } catch (error) {
            console.log(`⚠️  Asignaciones de propuestas: ${error.message}`);
        }
        
        // Verificar tablas
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`✅ Tablas encontradas: ${tables.length}`);
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   - ${tableName}`);
        });
        
        // Probar consulta de propuestas (que estaba fallando)
        try {
            const [propuestas] = await connection.query(`
                SELECT p.*, 
                       u.nombre AS nombre_estudiante,
                       GROUP_CONCAT(DISTINCT up.nombre) AS profesores_asignados
                FROM propuestas p
                LEFT JOIN usuarios u ON p.estudiante_rut = u.rut
                LEFT JOIN asignaciones_propuestas ap ON p.id = ap.propuesta_id
                LEFT JOIN usuarios up ON ap.profesor_rut = up.rut
                GROUP BY p.id
                ORDER BY p.fecha_envio DESC
            `);
            console.log(`✅ Consulta de propuestas exitosa: ${propuestas.length} propuestas encontradas`);
        } catch (error) {
            console.log(`❌ Error en consulta de propuestas: ${error.message}`);
        }
        
        connection.release();
        
        console.log("\n🎉 ¡Prueba completada exitosamente!");
        
    } catch (error) {
        console.error("❌ Error durante la prueba:", error);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

// Ejecutar la prueba
testDatabase(); 