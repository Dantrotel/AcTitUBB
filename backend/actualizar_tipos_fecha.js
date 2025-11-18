/**
 * Script para actualizar los tipos de fecha en la base de datos
 * Ejecutar con: node actualizar_tipos_fecha.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'actitubb',
  port: process.env.DB_PORT || 3306
};

async function actualizarTiposFecha() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(config);
    console.log('✅ Conexión establecida');

    // 1. Actualizar tabla fechas_calendario
    console.log('\n📊 Actualizando tabla fechas_calendario...');
    await connection.execute(`
      ALTER TABLE fechas_calendario 
      MODIFY COLUMN tipo_fecha ENUM(
        'academica',
        'inicio_semestre',
        'fin_semestre',
        'feriado',
        'receso',
        'entrega_propuesta',
        'revision_propuesta',
        'entrega',
        'entrega_avance',
        'entrega_parcial',
        'entrega_final',
        'evaluacion',
        'revision',
        'presentacion',
        'defensa',
        'defensa_parcial',
        'reunion',
        'seguimiento',
        'orientacion',
        'hito',
        'deadline',
        'plazo_extension',
        'global',
        'otro'
      ) DEFAULT 'otro' COMMENT 'Tipo de fecha para clasificación y visualización'
    `);
    console.log('✅ Tabla fechas_calendario actualizada');

    // 2. Actualizar tabla fechas_importantes
    console.log('\n📊 Actualizando tabla fechas_importantes...');
    await connection.execute(`
      ALTER TABLE fechas_importantes 
      MODIFY COLUMN tipo_fecha ENUM(
        'entrega_propuesta',
        'revision_propuesta',
        'entrega',
        'entrega_avance',
        'entrega_parcial',
        'entrega_final',
        'evaluacion',
        'revision',
        'revision_parcial',
        'presentacion',
        'defensa',
        'defensa_parcial',
        'reunion',
        'seguimiento',
        'orientacion',
        'hito',
        'deadline',
        'plazo_extension',
        'otro'
      ) DEFAULT 'otro' COMMENT 'Tipo de fecha importante asociada al proyecto'
    `);
    console.log('✅ Tabla fechas_importantes actualizada');

    // 3. Crear índices si no existen
    console.log('\n📊 Creando índices para mejor rendimiento...');
    try {
      await connection.execute(`
        CREATE INDEX idx_fechas_calendario_tipo_fecha 
        ON fechas_calendario(tipo_fecha, fecha)
      `);
      console.log('✅ Índice idx_fechas_calendario_tipo_fecha creado');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Índice idx_fechas_calendario_tipo_fecha ya existe');
      } else {
        throw error;
      }
    }

    try {
      await connection.execute(`
        CREATE INDEX idx_fechas_importantes_tipo_fecha 
        ON fechas_importantes(tipo_fecha, fecha_limite)
      `);
      console.log('✅ Índice idx_fechas_importantes_tipo_fecha creado');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('ℹ️  Índice idx_fechas_importantes_tipo_fecha ya existe');
      } else {
        throw error;
      }
    }

    // 4. Insertar fechas de ejemplo para 2025
    console.log('\n📅 Insertando fechas de ejemplo para 2025...');
    
    const fechasEjemplo = [
      // Fechas Académicas
      ['Inicio Semestre 1-2025', 'Inicio del primer semestre académico 2025', '2025-03-01', 'inicio_semestre'],
      ['Fin Semestre 1-2025', 'Finalización del primer semestre académico 2025', '2025-07-15', 'fin_semestre'],
      ['Día del Trabajo', 'Feriado nacional - No hay actividades académicas', '2025-05-01', 'feriado'],
      ['Receso Invernal', 'Semana de receso académico', '2025-07-16', 'receso'],
      
      // Fechas de Propuestas
      ['Apertura Período Propuestas', 'Inicio del período para envío de propuestas de título', '2025-03-10', 'entrega_propuesta'],
      ['Cierre Período Propuestas', 'Fecha límite para envío de propuestas de título', '2025-04-15', 'entrega_propuesta'],
      ['Inicio Revisión Propuestas', 'Profesores comienzan revisión de propuestas', '2025-04-16', 'revision_propuesta'],
      
      // Fechas de Entregas y Avances
      ['Primera Entrega de Avance', 'Fecha límite para primera entrega de avance de proyectos', '2025-04-30', 'entrega_avance'],
      ['Segunda Entrega de Avance', 'Fecha límite para segunda entrega de avance de proyectos', '2025-05-31', 'entrega_avance'],
      ['Entrega Parcial', 'Fecha límite para entrega parcial de proyectos', '2025-06-15', 'entrega_parcial'],
      ['Entrega Final/Memoria', 'Fecha límite para entrega de documento final/memoria', '2025-06-30', 'entrega_final'],
      
      // Fechas de Evaluaciones y Defensas
      ['Evaluación Primer Avance', 'Período de evaluación del primer avance', '2025-05-05', 'evaluacion'],
      ['Presentación Intermedia', 'Presentaciones intermedias de proyectos', '2025-06-01', 'presentacion'],
      ['Defensas Parciales', 'Semana de defensas parciales', '2025-06-20', 'defensa_parcial'],
      ['Defensas Finales', 'Semana de defensas finales de título', '2025-07-08', 'defensa']
    ];

    for (const [titulo, descripcion, fecha, tipo_fecha] of fechasEjemplo) {
      try {
        await connection.execute(`
          INSERT IGNORE INTO fechas_calendario 
            (titulo, descripcion, fecha, tipo_fecha, es_global, creado_por_rut, activa) 
          VALUES (?, ?, ?, ?, TRUE, '11111111-1', TRUE)
        `, [titulo, descripcion, fecha, tipo_fecha]);
        console.log(`  ✅ ${titulo}`);
      } catch (error) {
        console.log(`  ⚠️  ${titulo} - ${error.message}`);
      }
    }

    // 5. Mostrar resumen
    console.log('\n📊 Resumen de actualización:');
    const [tipos] = await connection.execute(`
      SELECT 
        tipo_fecha,
        COUNT(*) as cantidad
      FROM fechas_calendario 
      WHERE es_global = TRUE AND activa = TRUE
      GROUP BY tipo_fecha
      ORDER BY tipo_fecha
    `);

    console.log('\n📈 Fechas globales por tipo:');
    console.table(tipos);

    const [total] = await connection.execute(`
      SELECT 
        COUNT(*) as total_fechas_globales,
        COUNT(DISTINCT tipo_fecha) as tipos_diferentes
      FROM fechas_calendario 
      WHERE es_global = TRUE AND activa = TRUE
    `);

    console.log('\n✨ Actualización completada exitosamente!');
    console.log(`   - Total de fechas globales: ${total[0].total_fechas_globales}`);
    console.log(`   - Tipos diferentes: ${total[0].tipos_diferentes}`);

  } catch (error) {
    console.error('\n❌ Error durante la actualización:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la actualización
actualizarTiposFecha()
  .then(() => {
    console.log('\n🎉 Proceso completado!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
