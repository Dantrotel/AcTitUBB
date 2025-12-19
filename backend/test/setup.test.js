/**
 * Setup y configuración para tests
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno de prueba
dotenv.config({ path: join(__dirname, '../.env.test') });

// Configuración global para tests
export const testConfig = {
  apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1',
  dbHost: process.env.DB_HOST || 'localhost',
  dbUser: process.env.DB_USER || 'test_user',
  dbPassword: process.env.DB_PASSWORD || 'test_password',
  dbName: process.env.DB_NAME || 'actitubb_test',
  jwtSecret: process.env.JWT_SECRET || 'test_secret_key'
};

// Usuarios de prueba
export const testUsers = {
  admin: {
    rut: '33333333-3',
    email: 'admin@ubiobio.cl',
    password: '1234',
    rol_id: 3
  },
  profesor: {
    rut: '12345678-9',
    email: 'juan.perez@ubiobio.cl',
    password: '1234',
    rol_id: 2
  },
  estudiante: {
    rut: '20111222-3',
    email: 'luis.morales@alumnos.ubiobio.cl',
    password: '1234',
    rol_id: 1
  }
};

// Helper para esperar
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Limpiar base de datos de prueba
export const cleanTestDatabase = async (pool) => {
  const tables = [
    'notificaciones_proyecto',
    'historial_asignaciones',
    'disponibilidad_horarios',
    'solicitudes_reunion',
    'participantes_reuniones',
    'reuniones',
    'hitos_cronograma',
    'cronogramas_proyecto',
    'avances',
    'hitos_proyecto',
    'comision_evaluadora',
    'solicitudes_extension',
    'documentos_proyecto',
    'estudiantes_proyectos',
    'asignaciones_proyectos',
    'proyectos',
    'propuestas',
    'fechas',
    'estudiantes_carreras',
    'profesores_departamentos'
  ];

  for (const table of tables) {
    try {
      await pool.query(`DELETE FROM ${table}`);
    } catch (error) {
      // Tabla no existe o está vacía
    }
  }
};
