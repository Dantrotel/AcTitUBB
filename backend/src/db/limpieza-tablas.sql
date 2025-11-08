-- ============================================
-- LIMPIEZA DE TABLAS NO UTILIZADAS
-- Base de datos: AcTitUBB
-- Fecha: 2025-11-03
-- ============================================

USE AcTitUBB;

-- Mensaje de advertencia
SELECT '⚠️  ADVERTENCIA: Este script eliminará tablas que no se están usando.' as Mensaje;
SELECT 'Asegúrate de tener un backup antes de continuar.' as Advertencia;

-- ============================================
-- PASO 1: ELIMINAR TABLAS VACÍAS NO USADAS
-- ============================================

-- Tabla: bloqueos_horarios (0 registros, no usada en código)
DROP TABLE IF EXISTS bloqueos_horarios;
SELECT '✅ Tabla bloqueos_horarios eliminada' as Estado;

-- Tabla: configuracion_alertas (0 registros, no usada en código)
DROP TABLE IF EXISTS configuracion_alertas;
SELECT '✅ Tabla configuracion_alertas eliminada' as Estado;

-- Tabla: cronogramas_proyecto (0 registros, no usada en código)
DROP TABLE IF EXISTS cronogramas_proyecto;
SELECT '✅ Tabla cronogramas_proyecto eliminada' as Estado;

-- Tabla: historial_asignaciones (0 registros, no usada en código)
DROP TABLE IF EXISTS historial_asignaciones;
SELECT '✅ Tabla historial_asignaciones eliminada' as Estado;

-- Tabla: hitos_cronograma (0 registros, no usada en código)
DROP TABLE IF EXISTS hitos_cronograma;
SELECT '✅ Tabla hitos_cronograma eliminada' as Estado;

-- Tabla: notificaciones_proyecto (0 registros, no usada en código)
DROP TABLE IF EXISTS notificaciones_proyecto;
SELECT '✅ Tabla notificaciones_proyecto eliminada' as Estado;

-- Tabla: participantes_reuniones (0 registros, no usada en código)
DROP TABLE IF EXISTS participantes_reuniones;
SELECT '✅ Tabla participantes_reuniones eliminada' as Estado;

-- Tabla: reuniones (0 registros, duplicada - usamos reuniones_calendario)
DROP TABLE IF EXISTS reuniones;
SELECT '✅ Tabla reuniones eliminada (duplicada)' as Estado;

-- ============================================
-- PASO 2: ELIMINAR TABLA DEL SISTEMA ANTIGUO
-- ============================================

-- Tabla: configuracion_matching (sistema antiguo de matching - ya no se usa)
DROP TABLE IF EXISTS configuracion_matching;
SELECT '✅ Tabla configuracion_matching eliminada (sistema antiguo)' as Estado;

-- ============================================
-- PASO 3: VERIFICACIÓN FINAL
-- ============================================

SELECT '✅ Limpieza completada exitosamente!' as Resultado;

-- Mostrar tablas restantes
SELECT 'TABLAS ACTIVAS EN LA BASE DE DATOS:' as Info;
SHOW TABLES;

-- Verificar que las tablas importantes siguen existiendo
SELECT 'VERIFICACIÓN DE TABLAS CRÍTICAS:' as Info;

SELECT 
    'usuarios' as tabla,
    COUNT(*) as registros,
    CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END as estado
FROM usuarios
UNION ALL
SELECT 'proyectos', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END FROM proyectos
UNION ALL
SELECT 'propuestas', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END FROM propuestas
UNION ALL
SELECT 'disponibilidades', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END FROM disponibilidades
UNION ALL
SELECT 'solicitudes_reunion', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END FROM solicitudes_reunion
UNION ALL
SELECT 'reuniones_calendario', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END FROM reuniones_calendario
UNION ALL
SELECT 'asignaciones_proyectos', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END FROM asignaciones_proyectos
UNION ALL
SELECT 'fechas_importantes', COUNT(*), CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END FROM fechas_importantes;

SELECT '
📊 RESUMEN DE LIMPIEZA:
- 9 tablas eliminadas (vacías y no usadas)
- Sistema de reservas funcionando con:
  * disponibilidades
  * solicitudes_reunion
  * reuniones_calendario
  * historial_reuniones
  
✅ Base de datos optimizada y lista para usar
' as Resumen;
