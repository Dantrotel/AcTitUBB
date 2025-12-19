// Script para limpiar datos corruptos en propuestas
import mysql from 'mysql2/promise';

async function limpiarDatos() {
  const conexion = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'actitubb'
  });

  

  // Ver propuestas corruptas
  const [propuestas] = await conexion.execute(`
    SELECT id, titulo, 
           LENGTH(descripcion) as len_desc,
           LENGTH(objetivos_generales) as len_obj_gen,
           LEFT(descripcion, 50) as preview
    FROM propuestas
    WHERE LENGTH(descripcion) > 10000 OR LENGTH(objetivos_generales) > 10000
  `);

  

  if (propuestas.length > 0) {
    
    
    // Limpiar campos con más de 100 "A" consecutivas
    await conexion.execute(`
      UPDATE propuestas
      SET 
        descripcion = CASE 
          WHEN descripcion REGEXP 'A{100,}' THEN 'Descripción pendiente de completar'
          ELSE descripcion
        END,
        objetivos_generales = CASE 
          WHEN objetivos_generales REGEXP 'A{100,}' THEN 'Objetivos generales pendientes'
          ELSE objetivos_generales
        END,
        objetivos_especificos = CASE 
          WHEN objetivos_especificos REGEXP 'A{100,}' THEN 'Objetivos específicos pendientes'
          ELSE objetivos_especificos
        END,
        metodologia_propuesta = CASE 
          WHEN metodologia_propuesta REGEXP 'A{100,}' THEN 'Metodología pendiente'
          ELSE metodologia_propuesta
        END,
        recursos_necesarios = CASE 
          WHEN recursos_necesarios REGEXP 'A{100,}' THEN 'Recursos pendientes'
          ELSE recursos_necesarios
        END,
        bibliografia = CASE 
          WHEN bibliografia REGEXP 'A{100,}' THEN 'Bibliografía pendiente'
          ELSE bibliografia
        END
      WHERE descripcion REGEXP 'A{100,}' 
         OR objetivos_generales REGEXP 'A{100,}'
         OR objetivos_especificos REGEXP 'A{100,}'
         OR metodologia_propuesta REGEXP 'A{100,}'
         OR recursos_necesarios REGEXP 'A{100,}'
         OR bibliografia REGEXP 'A{100,}'
    `);

    

    // Verificar después de limpiar
    const [verificacion] = await conexion.execute(`
      SELECT id, titulo, 
             LENGTH(descripcion) as len_desc,
             descripcion
      FROM propuestas
      WHERE id IN (${propuestas.map(p => p.id).join(',')})
    `);

    
  } else {
    
  }

  await conexion.end();
}

limpiarDatos().catch(console.error);
