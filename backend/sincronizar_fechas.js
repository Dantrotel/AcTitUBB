import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'AcTitUBB',
  port: 3306
});

async function sincronizar() {
  try {
    console.log('🔄 SINCRONIZANDO FECHAS DE PROPUESTAS ENTRE TABLAS...\n');

    // 1. Verificar estado actual
    const [fechasCalendario] = await pool.execute(`
      SELECT id, titulo, fecha, tipo_fecha, es_global
      FROM fechas_calendario
      WHERE tipo_fecha = 'entrega_propuesta'
      ORDER BY fecha DESC
    `);

    const [fechasImportantes] = await pool.execute(`
      SELECT id, titulo, fecha_limite, tipo_fecha, es_global, habilitada, proyecto_id
      FROM fechas_importantes
      WHERE tipo_fecha = 'entrega_propuesta'
      ORDER BY fecha_limite DESC
    `);

    console.log('📊 ESTADO ACTUAL:');
    console.log(`- Fechas en fechas_calendario: ${fechasCalendario.length}`);
    console.log(`- Fechas en fechas_importantes: ${fechasImportantes.length}\n`);

    // 2. Buscar fechas en fechas_calendario con es_global=true que NO estén en fechas_importantes
    console.log('🔍 Buscando fechas globales que falten en fechas_importantes...\n');

    for (const fechaCal of fechasCalendario) {
      if (fechaCal.es_global) {
        // Buscar si existe en fechas_importantes
        const existe = fechasImportantes.some(fi => 
          fi.titulo === fechaCal.titulo && 
          new Date(fi.fecha_limite).toISOString().split('T')[0] === new Date(fechaCal.fecha).toISOString().split('T')[0]
        );

        if (!existe) {
          console.log(`⚠️  Falta sincronizar: "${fechaCal.titulo}" (${fechaCal.fecha})`);
          console.log(`   Creando en fechas_importantes...`);

          await pool.execute(`
            INSERT INTO fechas_importantes 
            (tipo_fecha, titulo, descripcion, fecha_limite, es_global, proyecto_id, habilitada, permite_extension)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            'entrega_propuesta',
            fechaCal.titulo,
            'Sincronizada desde Calendario Global',
            fechaCal.fecha,
            true,
            null,
            false, // Por defecto deshabilitada hasta que admin la habilite
            true
          ]);

          console.log(`   ✅ Sincronizada correctamente\n`);
        } else {
          console.log(`✅ "${fechaCal.titulo}" ya existe en ambas tablas`);
        }
      }
    }

    // 3. Mostrar resultado final
    console.log('\n📊 RESULTADO FINAL:');
    
    const [fechasCalFinal] = await pool.execute(`
      SELECT COUNT(*) as total FROM fechas_calendario WHERE tipo_fecha = 'entrega_propuesta' AND es_global = TRUE
    `);
    
    const [fechasImpFinal] = await pool.execute(`
      SELECT COUNT(*) as total FROM fechas_importantes WHERE tipo_fecha = 'entrega_propuesta' AND es_global = TRUE AND proyecto_id IS NULL
    `);

    console.log(`✅ Fechas globales en fechas_calendario: ${fechasCalFinal[0].total}`);
    console.log(`✅ Fechas globales en fechas_importantes: ${fechasImpFinal[0].total}`);
    
    if (fechasCalFinal[0].total === fechasImpFinal[0].total) {
      console.log('\n🎉 SINCRONIZACIÓN COMPLETA: Todas las fechas están en ambas tablas');
    } else {
      console.log('\n⚠️  Todavía hay diferencias entre las tablas');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

sincronizar();
