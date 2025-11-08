import pkg from 'mysql2/promise';
const { createPool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'actitubb',
    port: process.env.DB_PORT || 3306
});

async function debugDashboard() {
    try {
        const profesor_rut = '98765432-1';
        
        console.log('🔍 DEBUGGING DASHBOARD DEL PROFESOR:', profesor_rut);
        console.log('='.repeat(80));
        
        // 1. Verificar solicitudes en la BD
        console.log('\n📋 SOLICITUDES EN LA BASE DE DATOS:');
        const [solicitudes] = await pool.execute(`
            SELECT 
                sr.*,
                ue.nombre as estudiante_nombre,
                up.nombre as profesor_nombre
            FROM solicitudes_reunion sr
            LEFT JOIN usuarios ue ON sr.estudiante_rut = ue.rut
            LEFT JOIN usuarios up ON sr.profesor_rut = up.rut
            WHERE sr.profesor_rut = ?
            ORDER BY sr.created_at DESC
        `, [profesor_rut]);
        
        console.table(solicitudes.map(s => ({
            id: s.id,
            estudiante: s.estudiante_nombre,
            estado: s.estado,
            fecha: new Date(s.fecha_propuesta).toLocaleDateString(),
            hora: s.hora_propuesta,
            descripcion: s.descripcion.substring(0, 50) + '...'
        })));
        
        console.log(`\n✅ Total de solicitudes: ${solicitudes.length}`);
        console.log(`📊 Por estado:`);
        const porEstado = {};
        solicitudes.forEach(s => {
            porEstado[s.estado] = (porEstado[s.estado] || 0) + 1;
        });
        console.table(porEstado);
        
        // 2. Simular lo que devolvería el endpoint
        console.log('\n🔄 SIMULANDO RESPUESTA DEL ENDPOINT:');
        const dashboardData = {
            solicitudes: {
                pendientes: solicitudes,
                sin_responder: solicitudes.filter(s => s.estado === 'pendiente')
            },
            reuniones: {
                proximas: [],
                todas_programadas: []
            },
            estadisticas: {
                total_reuniones: 0,
                reuniones_completadas: 0,
                reuniones_canceladas: 0,
                disponibilidades_activas: 0
            }
        };
        
        console.log('Estructura devuelta:');
        console.log(JSON.stringify({
            'solicitudes.pendientes.length': dashboardData.solicitudes.pendientes.length,
            'solicitudes.sin_responder.length': dashboardData.solicitudes.sin_responder.length,
            'reuniones.proximas.length': dashboardData.reuniones.proximas.length
        }, null, 2));
        
        // 3. Verificar usuario profesor
        console.log('\n👤 DATOS DEL PROFESOR:');
        const [usuarios] = await pool.execute(
            'SELECT rut, nombre, email, rol_id FROM usuarios WHERE rut = ?',
            [profesor_rut]
        );
        
        if (usuarios.length > 0) {
            console.table(usuarios);
            console.log(`✅ Rol ID: ${usuarios[0].rol_id} (${usuarios[0].rol_id === 2 ? 'PROFESOR ✅' : 'NO ES PROFESOR ❌'})`);
        } else {
            console.log('❌ Usuario no encontrado');
        }
        
        // 4. Verificar token/sesión
        console.log('\n🔐 VERIFICACIÓN DE SESIÓN:');
        console.log('Para que el frontend funcione correctamente:');
        console.log('1. Debes estar logueado con el RUT:', profesor_rut);
        console.log('2. El role_id debe ser 2 (profesor)');
        console.log('3. El token debe ser válido');
        
        console.log('\n' + '='.repeat(80));
        console.log('✅ Debugging completado');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

debugDashboard();
