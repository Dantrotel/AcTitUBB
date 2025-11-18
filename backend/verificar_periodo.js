import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'AcTitUBB',
  port: 3306
});

try {
  console.log('=== ESTADO DEL PERÍODO DE PROPUESTAS ===\n');

  const [fechas] = await pool.execute(`
    SELECT 
      id,
      titulo,
      fecha_limite,
      habilitada,
      es_global,
      proyecto_id,
      DATEDIFF(fecha_limite, CURDATE()) as dias_restantes
    FROM fechas_importantes 
    WHERE tipo_fecha = 'entrega_propuesta'
    ORDER BY fecha_limite DESC
    LIMIT 5
  `);

  if (fechas.length === 0) {
    console.log('❌ NO HAY FECHAS DE ENTREGA DE PROPUESTAS CONFIGURADAS\n');
    console.log('El administrador debe:');
    console.log('1. Ir a Calendario Unificado');
    console.log('2. Crear una fecha con tipo "Entrega de Propuestas"');
    console.log('3. Marcar el checkbox "Fecha Global"');
    console.log('4. Habilitar el período desde la pestaña "Período de Propuestas"\n');
  } else {
    console.log(`✅ Encontradas ${fechas.length} fecha(s) de entrega de propuestas:\n`);
    
    fechas.forEach((fecha, index) => {
      console.log(`--- Fecha ${index + 1} ---`);
      console.log(`ID: ${fecha.id}`);
      console.log(`Título: ${fecha.titulo}`);
      console.log(`Fecha límite: ${fecha.fecha_limite.toISOString().split('T')[0]}`);
      console.log(`Habilitada: ${fecha.habilitada ? '✅ SÍ' : '❌ NO'}`);
      console.log(`Es global: ${fecha.es_global ? '✅ SÍ' : '❌ NO'}`);
      console.log(`Proyecto ID: ${fecha.proyecto_id || 'NULL (global)'}`);
      console.log(`Días restantes: ${fecha.dias_restantes}`);
      
      if (!fecha.habilitada) {
        console.log('⚠️  PERÍODO DESHABILITADO - Los estudiantes NO pueden crear propuestas');
      } else if (fecha.dias_restantes < 0) {
        console.log('⚠️  PERÍODO VENCIDO - La fecha límite ya pasó');
      } else {
        console.log('✅ PERÍODO ACTIVO - Los estudiantes pueden crear propuestas');
      }
      console.log('');
    });

    // Verificar cuál es la que se usaría para validación
    const fechaActiva = fechas.find(f => f.es_global && f.proyecto_id === null);
    if (fechaActiva) {
      console.log('--- FECHA QUE SE USA PARA VALIDACIÓN ---');
      console.log(`ID: ${fechaActiva.id}`);
      console.log(`Título: ${fechaActiva.titulo}`);
      console.log(`Estado: ${fechaActiva.habilitada ? '✅ HABILITADA' : '❌ DESHABILITADA'}`);
      console.log(`Resultado: ${
        fechaActiva.habilitada && fechaActiva.dias_restantes >= 0
          ? '✅ Los estudiantes PUEDEN crear propuestas'
          : '❌ Los estudiantes NO PUEDEN crear propuestas'
      }\n`);
    }
  }

  // Intentar crear una propuesta como estudiante (simulación)
  console.log('--- SIMULACIÓN: ¿Puede un estudiante crear una propuesta? ---');
  
  const [result] = await pool.execute(`
    SELECT 
      id,
      titulo,
      fecha_limite,
      permite_extension,
      habilitada,
      DATEDIFF(fecha_limite, CURDATE()) as dias_restantes
    FROM fechas_importantes
    WHERE tipo_fecha = 'entrega_propuesta'
    AND es_global = TRUE
    AND proyecto_id IS NULL
    ORDER BY fecha_limite DESC
    LIMIT 1
  `);

  if (result.length === 0) {
    console.log('❌ NO - No hay período configurado (se permitiría por defecto)');
  } else {
    const fecha = result[0];
    const habilitada = fecha.habilitada;
    const dentroDelPlazo = fecha.dias_restantes >= 0;
    
    console.log(`Habilitada: ${habilitada ? 'SÍ' : 'NO'}`);
    console.log(`Dentro del plazo: ${dentroDelPlazo ? 'SÍ' : 'NO'}`);
    console.log(`Resultado: ${
      habilitada && dentroDelPlazo
        ? '✅ SÍ PUEDE CREAR'
        : '❌ NO PUEDE CREAR'
    }`);
    
    if (!habilitada) {
      console.log('Motivo: El período está deshabilitado por el administrador');
    } else if (!dentroDelPlazo) {
      console.log('Motivo: La fecha límite ya pasó');
    }
  }

} catch (error) {
  console.error('Error:', error.message);
} finally {
  await pool.end();
  process.exit(0);
}
