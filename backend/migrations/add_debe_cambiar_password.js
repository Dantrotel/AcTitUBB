/**
 * Script para agregar campo debe_cambiar_password a la tabla usuarios
 * Este campo se usará para forzar cambio de contraseña después de un reset
 */

import mysql from 'mysql2/promise';

async function agregarCampoDebeConvertirPassword() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'AcTitUBB',
    port: 3306
  });

  try {
    console.log('🔍 Verificando si existe el campo debe_cambiar_password...\n');

    // Verificar si el campo ya existe
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'AcTitUBB' 
      AND TABLE_NAME = 'usuarios' 
      AND COLUMN_NAME = 'debe_cambiar_password'
    `);

    if (columns.length > 0) {
      console.log('✅ El campo debe_cambiar_password ya existe');
    } else {
      console.log('➕ Agregando campo debe_cambiar_password...');
      
      await connection.query(`
        ALTER TABLE usuarios 
        ADD COLUMN debe_cambiar_password BOOLEAN DEFAULT FALSE 
        AFTER confirmado
      `);
      
      console.log('✅ Campo debe_cambiar_password agregado correctamente');
    }

    console.log('\n📋 Estructura actual de la tabla usuarios:');
    const [tableColumns] = await connection.query(`
      DESCRIBE usuarios
    `);
    console.table(tableColumns);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

agregarCampoDebeConvertirPassword();
