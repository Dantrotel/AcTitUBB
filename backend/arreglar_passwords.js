/**
 * Script para detectar y arreglar contraseñas en texto plano
 * Las contraseñas hasheadas con bcrypt empiezan con $2a$ o $2b$ y tienen 60 caracteres
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function arreglarPasswordsTextoPlano() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'AcTitUBB',
    port: 3306
  });

  try {
    console.log('🔍 Buscando contraseñas en texto plano...\n');

    // Obtener todos los usuarios
    const [usuarios] = await connection.query(
      'SELECT rut, nombre, email, password FROM usuarios'
    );

    console.log(`📋 Total de usuarios: ${usuarios.length}\n`);

    let hasheadas = 0;
    let textoPlano = 0;
    const usuariosTextoPlano = [];

    for (const usuario of usuarios) {
      // Las contraseñas hasheadas con bcrypt empiezan con $2a$ o $2b$ y tienen 60 caracteres
      const esHasheada = (usuario.password.startsWith('$2a$') || usuario.password.startsWith('$2b$')) 
                         && usuario.password.length === 60;
      
      if (esHasheada) {
        hasheadas++;
        console.log(`✅ ${usuario.nombre} (${usuario.rut}) - Contraseña HASHEADA`);
      } else {
        textoPlano++;
        usuariosTextoPlano.push(usuario);
        console.log(`❌ ${usuario.nombre} (${usuario.rut}) - Contraseña EN TEXTO PLANO: "${usuario.password}"`);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Hasheadas: ${hasheadas}`);
    console.log(`   ❌ Texto plano: ${textoPlano}`);

    if (textoPlano > 0) {
      console.log(`\n⚠️  Encontradas ${textoPlano} contraseñas en texto plano:`);
      
      for (const usuario of usuariosTextoPlano) {
        console.log(`\n🔐 Hasheando contraseña de ${usuario.nombre} (${usuario.rut})...`);
        
        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(usuario.password, salt);
        
        // Actualizar en la base de datos
        await connection.query(
          'UPDATE usuarios SET password = ? WHERE rut = ?',
          [hashedPassword, usuario.rut]
        );
        
        console.log(`   ✅ Contraseña hasheada y actualizada`);
        console.log(`   📝 Password original: ${usuario.password}`);
        console.log(`   📝 Password hasheada: ${hashedPassword.substring(0, 30)}...`);
      }

      console.log(`\n🎉 ¡Todas las contraseñas han sido hasheadas correctamente!`);
      console.log(`\n💡 Los usuarios pueden iniciar sesión con las mismas contraseñas que tenían antes.`);
    } else {
      console.log(`\n✅ ¡Todas las contraseñas ya están hasheadas correctamente!`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

arreglarPasswordsTextoPlano();
