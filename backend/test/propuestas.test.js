/**
 * Tests de Propuestas
 * Prueba CRUD completo de propuestas
 */
import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { testConfig, testUsers } from './setup.test.js';

describe('Propuestas - CRUD Completo', () => {
  let estudianteToken = null;
  let propuestaId = null;

  before(async () => {
    const response = await fetch(`${testConfig.apiUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUsers.estudiante.email,
        password: testUsers.estudiante.password
      })
    });
    const data = await response.json();
    estudianteToken = data.accessToken;
  });

  it('Debe crear una propuesta válida', async () => {
    const propuesta = {
      titulo: 'Sistema de Gestión de Inventario para PYMES',
      descripcion: 'Desarrollo de un sistema web completo para gestión de inventario, ventas y compras.',
      objetivos: '1. Implementar módulo de inventario\n2. Desarrollar módulo de ventas\n3. Crear reportes',
      metodologia: 'Metodología ágil Scrum con sprints de 2 semanas. Stack: Angular, Node.js, MySQL.',
      palabras_clave: 'gestión, inventario, PYME, web'
    };

    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(propuesta)
    });

    const data = await response.json();
    
    assert.ok(response.status === 201 || response.status === 200, 
      'Debe retornar status 201 o 200');
    assert.ok(data.propuesta || data.id, 'Debe retornar datos de la propuesta');
    
    propuestaId = data.propuesta?.id || data.id;
    assert.ok(propuestaId, 'Debe retornar ID de propuesta');
  });

  it('Debe rechazar propuesta sin título', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        descripcion: 'Solo descripción',
        objetivos: 'Solo objetivos',
        metodologia: 'Solo metodología'
      })
    });

    assert.ok(response.status >= 400, 'Debe rechazar propuesta sin título');
  });

  it('Debe listar propuestas del estudiante', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`
      }
    });

    const data = await response.json();
    
    assert.strictEqual(response.status, 200, 'Debe retornar status 200');
    assert.ok(Array.isArray(data) || Array.isArray(data.propuestas), 
      'Debe retornar array de propuestas');
  });

  it('Debe obtener detalles de una propuesta específica', async () => {
    if (!propuestaId) {
      
      return;
    }

    const response = await fetch(`${testConfig.apiUrl}/propuestas/${propuestaId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`
      }
    });

    const data = await response.json();
    
    assert.strictEqual(response.status, 200, 'Debe retornar status 200');
    assert.ok(data.propuesta || data.id, 'Debe retornar datos de propuesta');
  });

  it('Debe actualizar una propuesta', async () => {
    if (!propuestaId) {
      
      return;
    }

    const response = await fetch(`${testConfig.apiUrl}/propuestas/${propuestaId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titulo: 'Sistema de Gestión de Inventario para PYMES - Actualizado',
        descripcion: 'Descripción actualizada',
        objetivos: 'Objetivos actualizados',
        metodologia: 'Metodología actualizada',
        palabras_clave: 'nuevas, palabras, clave'
      })
    });

    assert.ok(response.status === 200 || response.status === 204, 
      'Debe actualizar la propuesta exitosamente');
  });
});

describe('Propuestas - Estados y Validaciones', () => {
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

    // Crear propuesta de prueba
    const propRes = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titulo: 'Propuesta de Test para Estados',
        descripcion: 'Descripción test',
        objetivos: 'Objetivos test',
        metodologia: 'Metodología test',
        palabras_clave: 'test'
      })
    });
    const propData = await propRes.json();
    propuestaId = propData.propuesta?.id || propData.id;
  });

  it('Debe rechazar título muy corto', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titulo: 'ABC',
        descripcion: 'Descripción válida larga para pasar validación',
        objetivos: 'Objetivos válidos largos',
        metodologia: 'Metodología válida larga',
        palabras_clave: 'test'
      })
    });

    assert.ok(response.status >= 400, 'Debe rechazar título muy corto');
  });

  it('Debe validar palabras clave', async () => {
    const response = await fetch(`${testConfig.apiUrl}/propuestas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${estudianteToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titulo: 'Título válido para test de palabras clave',
        descripcion: 'Descripción válida larga para pasar validación',
        objetivos: 'Objetivos válidos largos',
        metodologia: 'Metodología válida larga',
        palabras_clave: ''
      })
    });

    assert.ok(response.status >= 400, 'Debe validar palabras clave requeridas');
  });
});
