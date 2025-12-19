/**
 * Tests de Autenticación
 * Prueba el login, registro y gestión de tokens
 */
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { testConfig, testUsers } from './setup.test.js';

describe('Autenticación - Login y Tokens', () => {
  let accessToken = null;
  let refreshToken = null;

  it('Debe permitir login con credenciales válidas', async () => {
    const response = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.admin.email,
        password: testUsers.admin.password
      })
    });

    const data = await response.json();
    
    assert.strictEqual(response.status, 200, 'Debe retornar status 200');
    assert.ok(data.accessToken, 'Debe retornar accessToken');
    assert.ok(data.refreshToken, 'Debe retornar refreshToken');
    assert.ok(data.usuario, 'Debe retornar datos del usuario');
    assert.strictEqual(data.usuario.email, testUsers.admin.email);
    
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  it('Debe rechazar login con credenciales inválidas', async () => {
    const response = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.admin.email,
        password: 'wrongpassword'
      })
    });

    assert.strictEqual(response.status, 401, 'Debe retornar status 401');
  });

  it('Debe rechazar login con email inexistente', async () => {
    const response = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'noexiste@ubiobio.cl',
        password: testUsers.admin.password
      })
    });

    assert.strictEqual(response.status, 404, 'Debe retornar status 404');
  });

  it('Debe proteger rutas que requieren autenticación', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'GET'
    });

    assert.strictEqual(response.status, 401, 'Debe retornar status 401 sin token');
  });

  it('Debe permitir acceso con token válido', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    assert.ok(response.status === 200 || response.status === 404, 
      'Debe permitir acceso con token válido');
  });

  it('Debe rechazar token inválido', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer token_invalido_12345'
      }
    });

    assert.strictEqual(response.status, 401, 'Debe rechazar token inválido');
  });
});

describe('Autenticación - Roles y Permisos', () => {
  let adminToken = null;
  let profesorToken = null;
  let estudianteToken = null;

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

    // Login profesor
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

    // Login estudiante
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

  it('Admin debe poder acceder a rutas administrativas', async () => {
    const response = await fetch(`${testConfig.apiUrl}/admin/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });

    assert.ok(response.status === 200, 'Admin debe acceder a /admin/roles');
  });

  it('Profesor NO debe poder acceder a rutas administrativas', async () => {
    const response = await fetch(`${testConfig.apiUrl}/admin/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${profesorToken}`
      }
    });

    assert.strictEqual(response.status, 403, 'Profesor debe recibir 403 en /admin/roles');
  });

  it('Estudiante NO debe poder acceder a rutas administrativas', async () => {
    const response = await fetch(`${testConfig.apiUrl}/admin/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`
      }
    });

    assert.strictEqual(response.status, 403, 'Estudiante debe recibir 403 en /admin/roles');
  });

  it('Estudiante debe poder crear propuestas', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titulo: 'Test Propuesta',
        descripcion: 'Descripción de prueba',
        objetivos: 'Objetivos de prueba',
        metodologia: 'Metodología de prueba',
        palabras_clave: 'test, prueba'
      })
    });

    assert.ok(response.status === 201 || response.status === 200, 
      'Estudiante debe poder crear propuestas');
  });
});
