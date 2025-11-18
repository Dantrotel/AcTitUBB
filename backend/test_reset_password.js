/**
 * Script de prueba para el endpoint de reseteo de contraseña
 * Ejecutar con: node test_reset_password.js
 */

import mysql from 'mysql2/promise';

async function testResetPassword() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'AcTitUBB',
    port: 3306
  });

  try {
    console.log('🔍 Buscando usuarios para probar...\n');

    // Obtener algunos usuarios
    const [usuarios] = await connection.query(
      'SELECT rut, nombre, email, password FROM usuarios LIMIT 5'
    );

    console.log('📋 Usuarios encontrados:');
    usuarios.forEach((u, i) => {
      console.log(`${i + 1}. ${u.nombre} (${u.rut})`);
      console.log(`   Email: ${u.email}`);
      console.log(`   Password actual: ${u.password.substring(0, 20)}...`);
    });

    console.log('\n💡 Para probar el reseteo de contraseña:');
    console.log('1. Copia un RUT de la lista');
    console.log('2. En el navegador, abre la consola de DevTools');
    console.log('3. Ve a Network tab');
    console.log('4. Haz click en "Resetear Contraseña" de un usuario');
    console.log('5. Verifica la petición HTTP en Network tab');
    console.log('6. Revisa si hay errores 401 (no autenticado) o 403 (no autorizado)');
    console.log('7. Revisa la consola del navegador para logs de JavaScript');

    console.log('\n✅ Estructura de la petición esperada:');
    console.log('POST /api/admin/usuarios/:rut/reset-password');
    console.log('Headers: { Authorization: Bearer <token> }');
    console.log('Body: { nueva_password: "PasswordTemporal123" }');

    console.log('\n🔐 Verificando campo password en tabla usuarios:');
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM usuarios WHERE Field = 'password'"
    );
    console.log('Campo password:', columns[0]);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

testResetPassword();
