import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'AcTitUBB',
  port: 3306
});

async function sincronizarBidireccional() {
  try {
    console.log('🔄 SINCRONIZACIÓN BIDIRECCIONAL DE FECHAS DE PROPUESTAS\n');
    console.log('='.repeat(60) + '\n');

    // 1. Obtener fechas de ambas tablas
    const [fechasCalendario] = await pool.execute(`
      SELECT id, titulo, fecha, tipo_fecha, es_global, activa, descripcion
      FROM fechas_calendario
      WHERE tipo_fecha = 'entrega_propuesta'
      ORDER BY fecha DESC
    `);

    const [fechasImportantes] = await pool.execute(`
      SELECT id, titulo, fecha_limite, tipo_fecha, es_global, habilitada, proyecto_id, descripcion
      FROM fechas_importantes
      WHERE tipo_fecha = 'entrega_propuesta' 
      AND es_global = TRUE 
      AND proyecto_id IS NULL
      ORDER BY fecha_limite DESC
    `);

    console.log('📊 ESTADO ACTUAL:');
    console.log(`   fechas_calendario: ${fechasCalendario.length} fecha(s)`);
    console.log(`   fechas_importantes: ${fechasImportantes.length} fecha(s)\n`);

    let agregadas = 0;

    // 2. Sincronizar de fechas_importantes → fechas_calendario
    console.log('➡️  Sincronizando: fechas_importantes → fechas_calendario\n');
    
    for (const fechaImp of fechasImportantes) {
      const fecha = new Date(fechaImp.fecha_limite).toISOString().split('T')[0];
      
      // Buscar si existe en fechas_calendario
      const existe = fechasCalendario.some(fc => 
        fc.titulo === fechaImp.titulo && 
        new Date(fc.fecha).toISOString().split('T')[0] === fecha &&
        fc.activa === 1
      );

      if (!existe) {
        console.log(`   ⚠️  Falta: "${fechaImp.titulo}" (${fecha})`);
        console.log(`   📝 Creando en fechas_calendario...`);

        await pool.execute(`
          INSERT INTO fechas_calendario 
          (tipo_fecha, titulo, descripcion, fecha, es_global, creado_por_rut, activa)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          'entrega',
          fechaImp.titulo,
          fechaImp.descripcion || 'Sincronizada desde Período de Propuestas',
          fecha,
          true,
          '11111111-1', // RUT del admin
          true
        ]);

        console.log(`   ✅ Agregada\n`);
        agregadas++;
      } else {
        console.log(`   ✅ "${fechaImp.titulo}" ya existe`);
      }
    }

    // 3. Sincronizar de fechas_calendario → fechas_importantes
    console.log('\n⬅️  Sincronizando: fechas_calendario → fechas_importantes\n');
    
    for (const fechaCal of fechasCalendario) {
      if (fechaCal.es_global && fechaCal.activa) {
        const fecha = new Date(fechaCal.fecha).toISOString().split('T')[0];
        
        // Buscar si existe en fechas_importantes
        const existe = fechasImportantes.some(fi => 
          fi.titulo === fechaCal.titulo && 
          new Date(fi.fecha_limite).toISOString().split('T')[0] === fecha
        );

        if (!existe) {
          console.log(`   ⚠️  Falta: "${fechaCal.titulo}" (${fecha})`);
          console.log(`   📝 Creando en fechas_importantes...`);

          await pool.execute(`
            INSERT INTO fechas_importantes 
            (tipo_fecha, titulo, descripcion, fecha_limite, es_global, proyecto_id, habilitada, permite_extension)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            'entrega_propuesta',
            fechaCal.titulo,
            fechaCal.descripcion || 'Sincronizada desde Calendario Global',
            fecha,
            true,
            null,
            false, // Por defecto deshabilitada
            true
          ]);

          console.log(`   ✅ Agregada\n`);
          agregadas++;
        } else {
          console.log(`   ✅ "${fechaCal.titulo}" ya existe`);
        }
      }
    }

    // 4. Resultado final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTADO FINAL:\n');
    
    const [calFinal] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM fechas_calendario 
      WHERE tipo_fecha IN ('entrega', 'entrega_propuesta')
      AND es_global = TRUE 
      AND activa = TRUE
    `);
    
    const [impFinal] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM fechas_importantes 
      WHERE tipo_fecha = 'entrega_propuesta' 
      AND es_global = TRUE 
      AND proyecto_id IS NULL
    `);

    console.log(`   ✅ fechas_calendario: ${calFinal[0].total} fecha(s) activa(s)`);
    console.log(`   ✅ fechas_importantes: ${impFinal[0].total} fecha(s)\n`);

    if (agregadas > 0) {
      console.log(`🎉 Sincronización completa: ${agregadas} fecha(s) agregada(s)\n`);
    } else {
      console.log(`✨ Las tablas ya estaban sincronizadas\n`);
    }

    // 5. Mostrar lista de fechas sincronizadas
    console.log('📋 FECHAS SINCRONIZADAS:\n');
    
    const [fechasSincronizadas] = await pool.execute(`
      SELECT 
        fc.titulo,
        fc.fecha,
        fc.es_global,
        fi.habilitada,
        DATEDIFF(fc.fecha, CURDATE()) as dias_restantes
      FROM fechas_calendario fc
      INNER JOIN fechas_importantes fi 
        ON fc.titulo = fi.titulo 
        AND DATE(fc.fecha) = DATE(fi.fecha_limite)
      WHERE fc.tipo_fecha IN ('entrega', 'entrega_propuesta')
      AND fc.es_global = TRUE
      AND fc.activa = TRUE
      AND fi.tipo_fecha = 'entrega_propuesta'
      AND fi.es_global = TRUE
      AND fi.proyecto_id IS NULL
      ORDER BY fc.fecha DESC
    `);

    if (fechasSincronizadas.length > 0) {
      fechasSincronizadas.forEach((f, i) => {
        console.log(`   ${i + 1}. "${f.titulo}"`);
        console.log(`      📅 Fecha: ${f.fecha}`);
        console.log(`      🌐 Global: ${f.es_global ? 'SÍ' : 'NO'}`);
        console.log(`      🔓 Habilitada: ${f.habilitada ? 'SÍ' : 'NO'}`);
        console.log(`      ⏰ Días restantes: ${f.dias_restantes}`);
        console.log('');
      });
    } else {
      console.log('   ⚠️  No hay fechas sincronizadas\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

sincronizarBidireccional();
