-- ============================================
-- LIMPIAR SISTEMA DE RESERVAS
-- Elimina todos los datos pero mantiene la estructura
-- ============================================

USE AcTitUBB;

SELECT '🧹 Iniciando limpieza del sistema de reservas...' as Info;

-- ============================================
-- PASO 1: DESACTIVAR FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- PASO 2: LIMPIAR TABLAS (en orden inverso de dependencias)
-- ============================================

-- Limpiar historial de reuniones
DELETE FROM historial_reuniones;
SELECT '✅ Historial de reuniones limpiado' as Estado;

-- Limpiar reuniones del calendario
DELETE FROM reuniones_calendario;
SELECT '✅ Reuniones del calendario limpiadas' as Estado;

-- Limpiar solicitudes de reunión
DELETE FROM solicitudes_reunion;
SELECT '✅ Solicitudes de reunión limpiadas' as Estado;

-- Limpiar disponibilidades de profesores
DELETE FROM disponibilidades;
SELECT '✅ Disponibilidades de profesores limpiadas' as Estado;

-- ============================================
-- PASO 3: RESETEAR AUTO_INCREMENT
-- ============================================

ALTER TABLE historial_reuniones AUTO_INCREMENT = 1;
ALTER TABLE reuniones_calendario AUTO_INCREMENT = 1;
ALTER TABLE solicitudes_reunion AUTO_INCREMENT = 1;
ALTER TABLE disponibilidades AUTO_INCREMENT = 1;

SELECT '✅ Contadores AUTO_INCREMENT reseteados' as Estado;

-- ============================================
-- PASO 4: REACTIVAR FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT '✅ Sistema de reservas limpiado exitosamente!' as Resultado;

SELECT '📊 ESTADO FINAL DE LAS TABLAS:' as Info;

SELECT 
    'disponibilidades' as tabla,
    COUNT(*) as registros,
    AUTO_INCREMENT as next_id
FROM disponibilidades, 
     (SELECT AUTO_INCREMENT FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA='AcTitUBB' AND TABLE_NAME='disponibilidades') as ai
UNION ALL
SELECT 
    'solicitudes_reunion',
    COUNT(*),
    (SELECT AUTO_INCREMENT FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA='AcTitUBB' AND TABLE_NAME='solicitudes_reunion')
FROM solicitudes_reunion
UNION ALL
SELECT 
    'reuniones_calendario',
    COUNT(*),
    (SELECT AUTO_INCREMENT FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA='AcTitUBB' AND TABLE_NAME='reuniones_calendario')
FROM reuniones_calendario
UNION ALL
SELECT 
    'historial_reuniones',
    COUNT(*),
    (SELECT AUTO_INCREMENT FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA='AcTitUBB' AND TABLE_NAME='historial_reuniones')
FROM historial_reuniones;

SELECT '
🎉 SISTEMA LIMPIO Y LISTO PARA USAR
================================
✅ Todas las disponibilidades eliminadas
✅ Todas las solicitudes eliminadas
✅ Todas las reuniones eliminadas
✅ Todo el historial eliminado
✅ IDs reseteados a 1

Ahora puedes:
1. Publicar nuevas disponibilidades
2. Crear nuevas reservas
3. Todo empezará desde cero
' as Resumen;
