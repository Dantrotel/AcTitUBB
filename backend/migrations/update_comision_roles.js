import { pool } from '../src/db/connectionDB.js';
import dotenv from 'dotenv';
dotenv.config();

async function runMigration() {
  try {
    console.log('Actualizando roles de comision segun reglamento...');
    await pool.execute("UPDATE comision_evaluadora SET rol_comision = 'profesor_guia' WHERE rol_comision = 'presidente' AND activo = TRUE");
    console.log('  OK: presidente -> profesor_guia');
    await pool.execute("UPDATE comision_evaluadora SET rol_comision = 'profesor_informante' WHERE rol_comision IN ('secretario', 'informante') AND activo = TRUE");
    console.log('  OK: secretario/informante -> profesor_informante');
    await pool.execute("UPDATE comision_evaluadora SET rol_comision = 'tercer_integrante' WHERE rol_comision IN ('vocal', 'suplente') AND activo = TRUE");
    console.log('  OK: vocal/suplente -> tercer_integrante');
    await pool.execute("ALTER TABLE comision_evaluadora MODIFY COLUMN rol_comision ENUM('profesor_guia', 'profesor_informante', 'tercer_integrante') NOT NULL");
    console.log('  OK: ENUM actualizado');
    console.log('Migracion completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error en migracion:', error.message);
    process.exit(1);
  }
}

runMigration();
