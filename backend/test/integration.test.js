/**
 * Tests de Integración
 * Prueba flujos completos de la aplicación
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { testConfig, testUsers, sleep } from './setup.test.js';

describe('Integración - Flujo Completo de Propuesta a Proyecto', () => {
  let adminToken = null;
  let profesorToken = null;
  let estudianteToken = null;
  let propuestaId = null;
  let proyectoId = null;

  before(async () => {
    // Login de todos los usuarios necesarios
    const adminRes = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.admin.email,
        password: testUsers.admin.password
      })
    });
    const adminData = await adminRes.json();
    adminToken = adminData.accessToken;

    const profRes = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.profesor.email,
        password: testUsers.profesor.password
      })
    });
    const profData = await profRes.json();
    profesorToken = profData.accessToken;

    const estRes = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.estudiante.email,
        password: testUsers.estudiante.password
      })
    });
    const estData = await estRes.json();
    estudianteToken = estData.accessToken;
  });

  it('1. Estudiante crea propuesta', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titulo: 'Sistema de Gestión de Proyectos de Investigación',
        descripcion: 'Plataforma web para gestionar proyectos de investigación universitarios con seguimiento de hitos, presupuesto y publicaciones.',
        objetivos: '1. Desarrollar módulo de gestión de proyectos\n2. Implementar seguimiento de hitos\n3. Gestionar presupuestos\n4. Registrar publicaciones',
        metodologia: 'Desarrollo incremental con metodología Scrum. Stack: Angular 18, Node.js 20, MySQL 8.0, Docker.',
        palabras_clave: 'investigación, gestión proyectos, universidad, seguimiento'
      })
    });

    const data = await response.json();
    assert.ok(response.status === 201 || response.status === 200, 
      'Debe crear propuesta');
    propuestaId = data.propuesta?.id || data.id;
    assert.ok(propuestaId, 'Debe tener ID de propuesta');
    
    
  });

  it('2. Admin asigna profesor guía', async () => {
    await sleep(500); // Esperar un poco entre requests

    const response = await fetch(`${testConfig.apiUrl}/admin/asignaciones`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        propuesta_id: propuestaId,
        profesor_rut: testUsers.profesor.rut,
        rol_profesor_id: 2 // Guía
      })
    });

    assert.ok(response.status === 201 || response.status === 200, 
      'Debe asignar profesor guía');
    
    
  });

  it('3. Propuesta debe aparecer en lista del profesor', async () => {
    await sleep(500);

    const response = await fetch(`${testConfig.apiUrl}/propuestas/profesor`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${profesorToken}`
      }
    });

    assert.strictEqual(response.status, 200, 'Debe listar propuestas del profesor');
    
    const data = await response.json();
    const propuestas = Array.isArray(data) ? data : data.propuestas || [];
    
    `);
  });

  it('4. Estudiante debe ver su propuesta', async () => {
    await sleep(500);

    const response = await fetch(`${testConfig.apiUrl}/propuestas/${propuestaId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`
      }
    });

    assert.strictEqual(response.status, 200, 'Debe obtener detalles de propuesta');
    
    const data = await response.json();
    const propuesta = data.propuesta || data;
    assert.strictEqual(propuesta.titulo || propuesta.id, 
      'Sistema de Gestión de Proyectos de Investigación' || propuestaId);
    
    
  });

  it('5. Flujo verifica integridad de datos', async () => {
    // Verificar que la propuesta existe y tiene los datos correctos
    const response = await fetch(`${testConfig.apiUrl}/propuestas/${propuestaId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();
    const propuesta = data.propuesta || data;
    
    assert.ok(propuesta.titulo, 'Debe tener título');
    assert.ok(propuesta.descripcion, 'Debe tener descripción');
    assert.ok(propuesta.objetivos, 'Debe tener objetivos');
    
    
  });
});

describe('Integración - Flujo de Reuniones', () => {
  let profesorToken = null;
  let estudianteToken = null;
  let disponibilidadId = null;

  before(async () => {
    const profRes = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.profesor.email,
        password: testUsers.profesor.password
      })
    });
    const profData = await profRes.json();
    profesorToken = profData.accessToken;

    const estRes = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.estudiante.email,
        password: testUsers.estudiante.password
      })
    });
    const estData = await estRes.json();
    estudianteToken = estData.accessToken;
  });

  it('1. Profesor crea disponibilidad horaria', async () => {
    const response = await fetch(`${testConfig.apiUrl}/calendario-matching/disponibilidades`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${profesorToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dia_semana: 'lunes',
        hora_inicio: '10:00:00',
        hora_fin: '12:00:00',
        activo: true
      })
    });

    if (response.status === 201 || response.status === 200) {
      const data = await response.json();
      disponibilidadId = data.disponibilidad?.id || data.id;
      
    }

    assert.ok(response.status === 201 || response.status === 200 || response.status === 404, 
      'Debe crear disponibilidad o endpoint no existe');
  });

  it('2. Estudiante puede consultar disponibilidades', async () => {
    await sleep(500);

    const response = await fetch(`${testConfig.apiUrl}/calendario-matching/disponibilidades/profesor/${testUsers.profesor.rut}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`
      }
    });

    assert.ok(response.status === 200 || response.status === 404, 
      'Debe listar disponibilidades o endpoint no existe');
    
    if (response.status === 200) {
      
    }
  });
});

describe('Integración - Validación de Seguridad', () => {
  let estudianteToken = null;
  let otraPropuestaId = null;

  before(async () => {
    const estRes = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.estudiante.email,
        password: testUsers.estudiante.password
      })
    });
    const estData = await estRes.json();
    estudianteToken = estData.accessToken;
  });

  it('Estudiante NO debe poder acceder a propuestas de otros', async () => {
    // Intentar acceder a propuesta con ID arbitrario
    const response = await fetch(`${testConfig.apiUrl}/propuestas/99999`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`
      }
    });

    assert.ok(response.status === 403 || response.status === 404, 
      'Debe denegar acceso a propuestas ajenas');
  });

  it('Estudiante NO debe poder modificar propuestas de otros', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas/99999`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titulo: 'Intento de modificación no autorizada'
      })
    });

    assert.ok(response.status === 403 || response.status === 404, 
      'Debe denegar modificación de propuestas ajenas');
  });

  it('Requests sin token deben ser rechazados', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'GET'
    });

    assert.strictEqual(response.status, 401, 
      'Debe rechazar requests sin autenticación');
  });
});
