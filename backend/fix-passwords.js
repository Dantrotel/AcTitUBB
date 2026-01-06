import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';

const PASSWORDS = {
  admin: 'Admin123!',
  profesor: 'Profe123!',
  estudiante: 'Estudiante123!'
};

async function updatePasswords() {
  try {
    console.log('🔐 Generando hashes bcrypt...\n');
    
    // Generar hashes
    const adminHash = await bcrypt.hash(PASSWORDS.admin, 10);
    const profesorHash = await bcrypt.hash(PASSWORDS.profesor, 10);
    const estudianteHash = await bcrypt.hash(PASSWORDS.estudiante, 10);
    
    console.log('✅ Hashes generados:');
    console.log(`Admin123!     -> ${adminHash}`);
    console.log(`Profe123!     -> ${profesorHash}`);
    console.log(`Estudiante123! -> ${estudianteHash}\n`);
    
    // Conectar a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'actitubb',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('📊 Conectado a la base de datos\n');
    
    // Actualizar contraseñas
    const [result1] = await connection.execute(
      'UPDATE usuarios SET password = ? WHERE rol_id IN (3, 4)',
      [adminHash]
    );
    console.log(`✅ Actualizados ${result1.affectedRows} admins/super-admins`);
    
    const [result2] = await connection.execute(
      'UPDATE usuarios SET password = ? WHERE rol_id = 2',
      [profesorHash]
    );
    console.log(`✅ Actualizados ${result2.affectedRows} profesores`);
    
    const [result3] = await connection.execute(
      'UPDATE usuarios SET password = ? WHERE rol_id = 1',
      [estudianteHash]
    );
    console.log(`✅ Actualizados ${result3.affectedRows} estudiantes\n`);
    
    // Mostrar algunos usuarios de ejemplo
    const [users] = await connection.execute(`
      SELECT rut, nombre, email, 
             CASE rol_id 
               WHEN 1 THEN 'Estudiante' 
               WHEN 2 THEN 'Profesor' 
               WHEN 3 THEN 'Admin' 
               WHEN 4 THEN 'Super Admin' 
             END as rol
      FROM usuarios 
      LIMIT 10
    `);
    
    console.log('📋 Usuarios de ejemplo (todos con contraseñas actualizadas):');
    console.log('━'.repeat(80));
    users.forEach(u => {
      const password = u.rol === 'Estudiante' ? 'Estudiante123!' : 
                      u.rol === 'Profesor' ? 'Profe123!' : 'Admin123!';
      console.log(`${u.rut.padEnd(12)} | ${u.nombre.padEnd(30)} | ${password}`);
    });
    console.log('━'.repeat(80));
    
    console.log('\n✨ ¡Contraseñas actualizadas correctamente!\n');
    console.log('Puedes iniciar sesión con:');
    console.log('  📧 Email de cualquier usuario');
    console.log('  🔑 Contraseña según el rol:');
    console.log('     - Super Admin / Admin: Admin123!');
    console.log('     - Profesor: Profe123!');
    console.log('     - Estudiante: Estudiante123!\n');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePasswords();
