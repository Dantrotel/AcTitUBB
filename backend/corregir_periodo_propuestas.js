/**
 * Script para marcar fechas de entrega_propuesta como globales
 * Ejecutar con: node corregir_periodo_propuestas.js
 */

import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'actitubb',
  port: process.env.DB_PORT || 3306
};

async function corregirPeriodoPropuestas() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    connection = await mysql.createConnection(config);
    console.log('✅ Conexión establecida\n');

    // 1. Mostrar fechas actuales de entrega_propuesta
    console.log('📊 Fechas de tipo "entrega_propuesta" en fechas_importantes:');
    const [fechasActuales] = await connection.execute(`
      SELECT 
        id,
        titulo,
        tipo_fecha,
        fecha_limite,
        es_global,
        proyecto_id,
        habilitada,
        creado_por
      FROM fechas_importantes
      WHERE tipo_fecha = 'entrega_propuesta'
      ORDER BY fecha_limite DESC
    `);

    if (fechasActuales.length === 0) {
      console.log('⚠️  No hay fechas de tipo "entrega_propuesta" en fechas_importantes');
      console.log('\n💡 SOLUCIÓN: Debes crear una fecha en "Gestión de Calendario" con:');
      console.log('   - Tipo: Entrega de Propuestas');
      console.log('   - Marcar como "Global"');
      console.log('   - Sin proyecto asociado');
      return;
    }

    console.table(fechasActuales.map(f => ({
      ID: f.id,
      Título: f.titulo,
      'Fecha Límite': f.fecha_limite.toISOString().split('T')[0],
      'Es Global': f.es_global ? '✅' : '❌',
      'Proyecto ID': f.proyecto_id || 'NULL',
      'Habilitada': f.habilitada ? '✅' : '❌'
    })));

    // 2. Corregir fechas que no son globales y no tienen proyecto
    console.log('\n🔧 Corrigiendo fechas que deberían ser globales...');
    const [resultado] = await connection.execute(`
      UPDATE fechas_importantes 
      SET es_global = TRUE
      WHERE tipo_fecha = 'entrega_propuesta'
      AND (es_global = FALSE OR es_global IS NULL)
      AND proyecto_id IS NULL
    `);

    if (resultado.affectedRows > 0) {
      console.log(`✅ ${resultado.affectedRows} fecha(s) corregida(s)`);
    } else {
      console.log('ℹ️  No había fechas para corregir');
    }

    // 3. Mostrar el estado final
    console.log('\n📊 Estado final - Fechas que cumplan los requisitos:');
    const [fechasFinales] = await connection.execute(`
      SELECT 
        id,
        titulo,
        descripcion,
        fecha_limite,
        habilitada,
        permite_extension,
        DATEDIFF(fecha_limite, CURDATE()) as dias_restantes,
        CASE 
          WHEN fecha_limite < CURDATE() THEN 'vencido'
          WHEN fecha_limite = CURDATE() THEN 'ultimo_dia'
          WHEN DATEDIFF(fecha_limite, CURDATE()) <= 3 THEN 'proximo_a_vencer'
          ELSE 'activo'
        END as estado_tiempo
      FROM fechas_importantes
      WHERE tipo_fecha = 'entrega_propuesta'
      AND es_global = TRUE
      AND proyecto_id IS NULL
      ORDER BY fecha_limite DESC
    `);

    if (fechasFinales.length > 0) {
      console.log('\n✅ PERIODO DE PROPUESTAS CONFIGURADO:');
      console.table(fechasFinales.map(f => ({
        ID: f.id,
        Título: f.titulo,
        'Fecha Límite': f.fecha_limite.toISOString().split('T')[0],
        'Días Rest.': f.dias_restantes,
        Estado: f.estado_tiempo,
        Habilitada: f.habilitada ? '✅' : '❌'
      })));

      console.log('\n🎉 ¡Listo! Ahora deberías ver el período en:');
      console.log('   Admin → Calendario Unificado → Pestaña "Período de Propuestas"');
    } else {
      console.log('\n⚠️  Aún no hay fechas que cumplan los requisitos.');
      console.log('   Verifica que la fecha tenga:');
      console.log('   - tipo_fecha = "entrega_propuesta"');
      console.log('   - es_global = TRUE');
      console.log('   - proyecto_id = NULL');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

// Ejecutar
corregirPeriodoPropuestas()
  .then(() => {
    console.log('\n✅ Proceso completado!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
