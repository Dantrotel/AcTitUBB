import { pool } from './src/db/connectionDB.js';

const insertTestData = async () => {
  try {
    console.log('Insertando datos de prueba...');

    // Insertar usuarios de prueba
    const usuarios = [
      {
        rut: '12345678-9',
        nombre: 'Juan Pérez',
        email: 'juan.perez@alumnos.ubiobio.cl',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        rol_id: 1, // estudiante
        confirmado: true
      },
      {
        rut: '98765432-1',
        nombre: 'María García',
        email: 'maria.garcia@ubiobio.cl',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        rol_id: 2, // profesor
        confirmado: true
      },
      {
        rut: '11111111-1',
        nombre: 'Carlos Silva',
        email: 'carlos.silva@ubiobio.cl',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        rol_id: 2, // profesor
        confirmado: true
      },
      {
        rut: '22222222-2',
        nombre: 'Ana López',
        email: 'ana.lopez@alumnos.ubiobio.cl',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        rol_id: 1, // estudiante
        confirmado: true
      }
    ];

    // Insertar usuarios
    for (const usuario of usuarios) {
      try {
        await pool.execute(
          'INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) VALUES (?, ?, ?, ?, ?, ?)',
          [usuario.rut, usuario.nombre, usuario.email, usuario.password, usuario.rol_id, usuario.confirmado]
        );
        console.log(`Usuario insertado: ${usuario.nombre}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`Usuario ya existe: ${usuario.nombre}`);
        } else {
          console.error(`Error insertando usuario ${usuario.nombre}:`, error.message);
        }
      }
    }

    // Insertar propuestas de prueba
    const propuestas = [
      {
        titulo: 'Sistema de Gestión de Biblioteca',
        descripcion: 'Desarrollo de un sistema web para la gestión de préstamos y devoluciones de libros en la biblioteca universitaria.',
        estudiante_rut: '12345678-9',
        fecha_envio: '2024-01-15 10:30:00',
        estado_id: 1 // Pendiente
      },
      {
        titulo: 'Aplicación Móvil de Delivery',
        descripcion: 'Creación de una aplicación móvil para pedidos de comida con sistema de geolocalización y pagos en línea.',
        estudiante_rut: '22222222-2',
        fecha_envio: '2024-01-10 14:20:00',
        estado_id: 2 // En Revisión
      },
      {
        titulo: 'Sistema de Monitoreo IoT',
        descripcion: 'Implementación de un sistema de monitoreo de sensores IoT para control de temperatura y humedad en laboratorios.',
        estudiante_rut: '12345678-9',
        fecha_envio: '2024-01-20 09:15:00',
        estado_id: 1 // Pendiente
      },
      {
        titulo: 'Plataforma de E-learning',
        descripcion: 'Desarrollo de una plataforma educativa online con videoconferencias, tareas y evaluaciones.',
        estudiante_rut: '22222222-2',
        fecha_envio: '2024-01-05 16:45:00',
        estado_id: 3 // Aprobada
      }
    ];

    // Insertar propuestas
    for (const propuesta of propuestas) {
      try {
        const [result] = await pool.execute(
          'INSERT INTO propuestas (titulo, descripcion, estudiante_rut, fecha_envio, estado_id) VALUES (?, ?, ?, ?, ?)',
          [propuesta.titulo, propuesta.descripcion, propuesta.estudiante_rut, propuesta.fecha_envio, propuesta.estado_id]
        );
        console.log(`Propuesta insertada: ${propuesta.titulo} (ID: ${result.insertId})`);

        // Asignar profesor a algunas propuestas
        if (propuesta.titulo === 'Sistema de Gestión de Biblioteca') {
          await pool.execute(
            'INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut, fecha_asignacion) VALUES (?, ?, NOW())',
            [result.insertId, '98765432-1']
          );
          console.log(`Profesor asignado a: ${propuesta.titulo}`);
        }

        if (propuesta.titulo === 'Aplicación Móvil de Delivery') {
          await pool.execute(
            'INSERT INTO asignaciones_propuestas (propuesta_id, profesor_rut, fecha_asignacion) VALUES (?, ?, NOW())',
            [result.insertId, '11111111-1']
          );
          console.log(`Profesor asignado a: ${propuesta.titulo}`);
        }

      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`Propuesta ya existe: ${propuesta.titulo}`);
        } else {
          console.error(`Error insertando propuesta ${propuesta.titulo}:`, error.message);
        }
      }
    }

    console.log('Datos de prueba insertados correctamente');
    process.exit(0);

  } catch (error) {
    console.error('Error insertando datos de prueba:', error);
    process.exit(1);
  }
};

insertTestData(); 