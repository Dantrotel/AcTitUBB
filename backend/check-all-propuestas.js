// Script para verificar TODAS las propuestas y su tamaño
import mysql from 'mysql2/promise';

async function verificarTodas() {
  const conexion = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'actitubb'
  });

  

  const [propuestas] = await conexion.execute(`
    SELECT 
      id, 
      titulo,
      LENGTH(descripcion) as len_desc,
      LENGTH(objetivos_generales) as len_obj_gen,
      LENGTH(objetivos_especificos) as len_obj_esp,
      LENGTH(metodologia_propuesta) as len_met,
      LEFT(titulo, 80) as titulo_preview
    FROM propuestas
    ORDER BY id
  `);

  

  propuestas.forEach(p => {
    const maxLen = Math.max(p.len_desc, p.len_obj_gen, p.len_obj_esp, p.len_met);
    const status = maxLen > 5000 ? '🔴 CORRUPTA' : maxLen > 1000 ? '⚠️  LARGA' : '✅ OK';
    
    
    
    
    
    
    
  });

  // Ver si hay propuestas con NULL o valores extraños
  const [nulls] = await conexion.execute(`
    SELECT id, titulo,
           descripcion IS NULL as desc_null,
           objetivos_generales IS NULL as obj_gen_null
    FROM propuestas
    WHERE descripcion IS NULL 
       OR objetivos_generales IS NULL
       OR objetivos_especificos IS NULL
       OR metodologia_propuesta IS NULL
  `);

  if (nulls.length > 0) {
    
  }

  await conexion.end();
}

verificarTodas().catch(console.error);
