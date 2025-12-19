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
    

    // Verificar si el campo ya existe
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'AcTitUBB' 
      AND TABLE_NAME = 'usuarios' 
      AND COLUMN_NAME = 'debe_cambiar_password'
    `);

    if (columns.length > 0) {
      
    } else {
      
      
      await connection.query(`
        ALTER TABLE usuarios 
        ADD COLUMN debe_cambiar_password BOOLEAN DEFAULT FALSE 
        AFTER confirmado
      `);
      
      
    }

    
    const [tableColumns] = await connection.query(`
      DESCRIBE usuarios
    `);
    console.table(tableColumns);

  } catch (error) {
    
  } finally {
    await connection.end();
  }
}

agregarCampoDebeConvertirPassword();
