/**
 * Tests de Funcionalidades de Admin
 * Prueba creación de usuarios, asignaciones y gestión administrativa
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { testConfig, testUsers } from './setup.test.js';

describe('Admin - Gestión de Usuarios', () => {
  let adminToken = null;
  const nuevoUsuarioRut = `${Date.now().toString().slice(-8)}-K`;

  before(async () => {
    const response = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.admin.email,
        password: testUsers.admin.password
      })
    });
    const data = await response.json();
    adminToken = data.accessToken;
  });

  it('Admin debe poder listar roles', async () => {
    const response = await fetch(`${testConfig.apiUrl}/admin/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();
    
    assert.strictEqual(response.status, 200, 'Debe retornar status 200');
    assert.ok(Array.isArray(data) || Array.isArray(data.roles), 
      'Debe retornar array de roles');
  });

  it('Admin debe poder crear nuevo usuario', async () => {
    const nuevoUsuario = {
      rut: nuevoUsuarioRut,
      nombre: 'Usuario Test Temporal',
      email: `test${Date.now()}@ubiobio.cl`,
      password: '1234',
      rol_id: 2, // Profesor
      confirmado: true
    };

    const response = await fetch(`${testConfig.apiUrl}/admin/usuarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevoUsuario)
    });

    assert.ok(response.status === 201 || response.status === 200, 
      'Debe crear usuario exitosamente');
  });

  it('Admin debe rechazar RUT duplicado', async () => {
    const usuarioDuplicado = {
      rut: testUsers.profesor.rut, // RUT existente
      nombre: 'Intento Duplicado',
      email: `nuevo${Date.now()}@ubiobio.cl`,
      password: '1234',
      rol_id: 2,
      confirmado: true
    };

    const response = await fetch(`${testConfig.apiUrl}/admin/usuarios`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(usuarioDuplicado)
    });

    assert.ok(response.status >= 400, 'Debe rechazar RUT duplicado');
  });

  it('Admin debe poder actualizar usuario', async () => {
    const response = await fetch(`${testConfig.apiUrl}/admin/usuarios/${nuevoUsuarioRut}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: 'Usuario Test Actualizado',
        email: `actualizado${Date.now()}@ubiobio.cl`
      })
    });

    assert.ok(response.status === 200 || response.status === 204, 
      'Debe actualizar usuario exitosamente');
  });

  it('Admin debe listar departamentos', async () => {
    const response = await fetch(`${testConfig.apiUrl}/admin/departamentos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    const data = await response.json();
    
    assert.strictEqual(response.status, 200, 'Debe retornar status 200');
    assert.ok(data, 'Debe retornar datos de departamentos');
  });
});

describe('Admin - Asignaciones', () => {
  let adminToken = null;
  let estudianteToken = null;
  let propuestaId = null;

  before(async () => {
    // Login admin
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

    // Login estudiante y crear propuesta
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

    // Crear propuesta
    const propRes = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titulo: 'Propuesta para Test de Asignaciones',
        descripcion: 'Descripción para pruebas de asignación',
        objetivos: 'Objetivos de prueba',
        metodologia: 'Metodología de prueba',
        palabras_clave: 'test, asignacion'
      })
    });
    const propData = await propRes.json();
    propuestaId = propData.propuesta?.id || propData.id;
  });

  it('Admin debe poder asignar profesor guía', async () => {
    if (!propuestaId) {
      
      return;
    }

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
      'Debe asignar profesor guía exitosamente');
  });

  it('Admin debe rechazar asignación con RUT inválido', async () => {
    if (!propuestaId) {
      
      return;
    }

    const response = await fetch(`${testConfig.apiUrl}/admin/asignaciones`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        propuesta_id: propuestaId,
        profesor_rut: '99999999-9', // RUT inexistente
        rol_profesor_id: 2
      })
    });

    assert.ok(response.status >= 400, 'Debe rechazar RUT inexistente');
  });
});
