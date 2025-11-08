import fetch from 'node-fetch';

async function testDashboard() {
    try {
        console.log('🧪 TESTING DASHBOARD ENDPOINT');
        console.log('='.repeat(80));
        
        // Simular request como profesor
        const response = await fetch('http://localhost:3000/api/calendario-matching/dashboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Aquí necesitarías el token real del profesor
                // 'Authorization': 'Bearer <token>'
            }
        });
        
        if (!response.ok) {
            console.log('❌ Error en la respuesta:', response.status, response.statusText);
            const error = await response.text();
            console.log('Detalle:', error);
            return;
        }
        
        const data = await response.json();
        
        console.log('\n✅ RESPUESTA DEL ENDPOINT:');
        console.log('Status:', response.status);
        console.log('\n📊 Estructura de datos:');
        console.log(JSON.stringify({
            usuario: data.usuario,
            'solicitudes.pendientes': data.solicitudes?.pendientes?.length || 0,
            'solicitudes.sin_responder': data.solicitudes?.sin_responder?.length || 0,
            'reuniones.proximas': data.reuniones?.proximas?.length || 0,
            disponibilidades: data.disponibilidades?.length || 0
        }, null, 2));
        
        if (data.solicitudes?.pendientes?.length > 0) {
            console.log('\n📋 SOLICITUDES PENDIENTES:');
            data.solicitudes.pendientes.forEach((sol, idx) => {
                console.log(`\n  Solicitud ${idx + 1}:`);
                console.log('    - ID:', sol.id);
                console.log('    - Estudiante:', sol.estudiante_nombre);
                console.log('    - Descripción:', sol.descripcion?.substring(0, 50) + '...');
                console.log('    - Fecha propuesta:', sol.fecha_propuesta, sol.hora_propuesta);
                console.log('    - Tipo:', sol.tipo_reunion);
                console.log('    - Estado:', sol.estado);
                console.log('    - Created at:', sol.created_at);
            });
        } else {
            console.log('\n⚠️  No hay solicitudes pendientes en la respuesta');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testDashboard();
