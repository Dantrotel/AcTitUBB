-- ======================================================================
-- Script para corregir fechas de la BD AcTitUBB
-- Fecha actual: 2026-03-04
-- Estrategia: Desplazar fechas +15 meses para datos coherentes
-- Las propuestas aprobadas quedan en jun-ago 2025 (semestre anterior)
-- Los proyectos activos inician jul-sep 2025, con entregas en mar-jun 2026
-- Las propuestas nuevas (en revisión/pendientes) quedan en feb-mar 2026
-- ======================================================================

SET SQL_SAFE_UPDATES = 0;

-- =====================================================
-- 1. PROPUESTAS - Actualizar fecha_envio
-- =====================================================

-- 1a. Propuestas APROBADAS (estado_id=4, ids 1-8): +15 meses
UPDATE propuestas SET fecha_envio = DATE_ADD(fecha_envio, INTERVAL 15 MONTH) WHERE estado_id = 4;

-- 1b. Propuestas EN_REVISION (estado_id=2, ids 9-12): fechas recientes
UPDATE propuestas SET fecha_envio = '2026-02-05' WHERE id = 9;
UPDATE propuestas SET fecha_envio = '2026-02-10' WHERE id = 10;
UPDATE propuestas SET fecha_envio = '2026-02-15' WHERE id = 11;
UPDATE propuestas SET fecha_envio = '2026-02-18' WHERE id = 12;

-- 1c. Propuestas PENDIENTES (estado_id=1, ids 13-15, 20): muy recientes
UPDATE propuestas SET fecha_envio = '2026-02-20' WHERE id = 13;
UPDATE propuestas SET fecha_envio = '2026-02-25' WHERE id = 14;
UPDATE propuestas SET fecha_envio = '2026-02-28' WHERE id = 15;
UPDATE propuestas SET fecha_envio = '2026-03-01' WHERE id = 20;

-- 1d. Propuestas CORRECCIONES (estado_id=3, ids 16-17): hace 3-4 semanas
UPDATE propuestas SET fecha_envio = '2026-02-05' WHERE id = 16;
UPDATE propuestas SET fecha_envio = '2026-02-08' WHERE id = 17;

-- 1e. Propuestas RECHAZADAS (estado_id=5, ids 18-19): hace 2 meses
UPDATE propuestas SET fecha_envio = '2026-01-10' WHERE id = 18;
UPDATE propuestas SET fecha_envio = '2026-01-15' WHERE id = 19;

-- =====================================================
-- 2. PROYECTOS - Desplazar todas las fechas +15 meses
-- =====================================================
UPDATE proyectos SET
  fecha_inicio = DATE_ADD(fecha_inicio, INTERVAL 15 MONTH),
  fecha_entrega_estimada = DATE_ADD(fecha_entrega_estimada, INTERVAL 15 MONTH),
  ultima_actividad_fecha = DATE_ADD(ultima_actividad_fecha, INTERVAL 15 MONTH);

-- =====================================================
-- 3. CRONOGRAMAS_PROYECTO - +15 meses
-- =====================================================
UPDATE cronogramas_proyecto SET
  fecha_inicio = DATE_ADD(fecha_inicio, INTERVAL 15 MONTH),
  fecha_fin_estimada = DATE_ADD(fecha_fin_estimada, INTERVAL 15 MONTH);

-- =====================================================
-- 4. HITOS_PROYECTO - +15 meses
-- =====================================================
UPDATE hitos_proyecto SET
  fecha_objetivo = DATE_ADD(fecha_objetivo, INTERVAL 15 MONTH);

-- =====================================================
-- 5. HITOS_CRONOGRAMA - +15 meses
-- =====================================================
UPDATE hitos_cronograma SET
  fecha_limite = DATE_ADD(fecha_limite, INTERVAL 15 MONTH);

-- =====================================================
-- 6. AVANCES - +15 meses
-- =====================================================
UPDATE avances SET
  fecha_envio = DATE_ADD(fecha_envio, INTERVAL 15 MONTH);

-- =====================================================
-- 7. REUNIONES_CALENDARIO - +15 meses
-- =====================================================
UPDATE reuniones_calendario SET
  fecha = DATE_ADD(fecha, INTERVAL 15 MONTH);

-- =====================================================
-- 8. SOLICITUDES_REUNION - +15 meses
-- =====================================================
UPDATE solicitudes_reunion SET
  fecha_propuesta = DATE_ADD(fecha_propuesta, INTERVAL 15 MONTH);

-- =====================================================
-- 9. FECHAS (fechas académicas del sistema)
-- =====================================================
UPDATE fechas SET
  titulo = 'Cierre envío propuestas 2025-2',
  descripcion = 'Fecha límite para envío de propuestas segundo semestre 2025',
  fecha = '2025-10-31'
WHERE id = 1;

UPDATE fechas SET
  titulo = 'Cierre envío propuestas 2026-1',
  descripcion = 'Fecha límite para envío de propuestas primer semestre 2026',
  fecha = '2026-05-31'
WHERE id = 2;

UPDATE fechas SET
  titulo = 'Defensa Oral Julio 2026',
  descripcion = 'Período de defensas orales de proyectos semestre 2026-1',
  fecha = '2026-07-20'
WHERE id = 3;

UPDATE fechas SET
  titulo = 'Entrega Informe Final 2026-1',
  descripcion = 'Fecha límite entrega informe final proyectos 2026-1',
  fecha = '2026-07-15'
WHERE id = 4;

UPDATE fechas SET
  titulo = 'Inicio período titulación 2026-1',
  descripcion = 'Apertura del sistema para nuevas propuestas de titulación 2026',
  fecha = '2026-03-01'
WHERE id = 5;

-- =====================================================
-- 10. PERIODOS_PROPUESTAS
-- =====================================================
UPDATE periodos_propuestas SET
  nombre = 'Período de Propuestas 2026',
  fecha_inicio = '2026-03-01',
  fecha_fin = '2026-12-31'
WHERE id = 1;

-- =====================================================
-- 11. ASIGNACIONES_PROPUESTAS - fecha_asignacion
-- Propuestas aprobadas: poco después de su envío
-- Propuestas en revisión/pendiente: recientes
-- =====================================================

-- Propuestas aprobadas (ids 1-8): asignar ~5-10 días después del envío
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-06-20 10:00:00' WHERE id = 1;  -- prop 1
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-06-25 09:30:00' WHERE id = 2;  -- prop 2
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-07-07 11:00:00' WHERE id = 3;  -- prop 3
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-07-15 10:00:00' WHERE id = 4;  -- prop 4
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-07-21 14:00:00' WHERE id = 5;  -- prop 5
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-08-06 09:00:00' WHERE id = 6;  -- prop 6
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-08-15 10:30:00' WHERE id = 7;  -- prop 7
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-08-25 11:00:00' WHERE id = 8;  -- prop 8

-- Propuestas en revisión (ids 9-12): asignadas recientemente
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-10 09:00:00' WHERE id = 9;   -- prop 9
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-14 10:00:00' WHERE id = 10;  -- prop 10
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-19 11:00:00' WHERE id = 11;  -- prop 11
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-22 09:30:00' WHERE id = 12;  -- prop 12

-- Propuestas correcciones (ids 13-14 → propuestas 16-17)
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-10 14:00:00' WHERE id = 13;  -- prop 16
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-12 10:00:00' WHERE id = 14;  -- prop 17

-- Propuestas rechazadas (ids 15-16 → propuestas 18-19)
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-01-15 09:00:00' WHERE id = 15;  -- prop 18
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-01-20 10:00:00' WHERE id = 16;  -- prop 19

-- =====================================================
-- 12. ASIGNACIONES_PROYECTOS - fecha_asignacion
-- Fecha cercana al inicio de cada proyecto
-- =====================================================

-- Proyecto 1 (inicio 2025-07-01): asignados en jul 2025
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-06-28 10:00:00' WHERE id IN (1, 2, 3);

-- Proyecto 2 (inicio 2025-07-15): asignados en jul 2025
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-07-12 10:00:00' WHERE id IN (4, 5, 6);

-- Proyecto 3 (inicio 2025-08-01): asignados en ago 2025
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-07-29 10:00:00' WHERE id IN (7, 8, 9);

-- Proyecto 4 (inicio 2025-08-10): asignados en ago 2025
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-08-07 10:00:00' WHERE id IN (10, 11, 12);

-- Proyecto 5 (inicio 2025-08-15): asignados en ago 2025
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-08-12 10:00:00' WHERE id IN (13, 14, 15);

-- Proyecto 6 (inicio 2025-09-01): asignados en sep 2025
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-08-29 10:00:00' WHERE id IN (16, 17, 18);

-- Proyecto 7 (inicio 2025-09-10): asignados en sep 2025
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-09-08 10:00:00' WHERE id IN (19, 20, 21);

-- Proyecto 8 (inicio 2025-09-20): asignados en sep 2025
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-09-18 10:00:00' WHERE id IN (22, 23, 24);

-- =====================================================
-- 13. ACTIVIDAD_SISTEMA - actualizar timestamps
-- Mover a fechas coherentes recientes
-- =====================================================
UPDATE actividad_sistema SET timestamp = '2025-11-15 08:30:00' WHERE id = 1;  -- login
UPDATE actividad_sistema SET timestamp = '2025-06-15 14:20:00' WHERE id = 2;  -- prop creada
UPDATE actividad_sistema SET timestamp = '2025-06-25 10:00:00' WHERE id = 3;  -- prop aprobada
UPDATE actividad_sistema SET timestamp = '2025-06-30 11:00:00' WHERE id = 4;  -- proyecto creado
UPDATE actividad_sistema SET timestamp = '2025-08-15 16:00:00' WHERE id = 5;  -- avance enviado
UPDATE actividad_sistema SET timestamp = '2025-08-20 10:30:00' WHERE id = 6;  -- avance revisado
UPDATE actividad_sistema SET timestamp = '2025-11-20 09:00:00' WHERE id = 7;  -- login
UPDATE actividad_sistema SET timestamp = '2025-06-20 15:00:00' WHERE id = 8;  -- prop creada
UPDATE actividad_sistema SET timestamp = '2026-02-15 14:00:00' WHERE id = 9;  -- reunion agendada
UPDATE actividad_sistema SET timestamp = '2026-03-01 08:00:00' WHERE id = 10; -- login admin

SET SQL_SAFE_UPDATES = 1;

-- Verificación
SELECT '=== PROPUESTAS ===' as info;
SELECT id, titulo, estado_id, fecha_envio FROM propuestas ORDER BY id;

SELECT '=== PROYECTOS ===' as info;
SELECT id, titulo, fecha_inicio, fecha_entrega_estimada, ultima_actividad_fecha, porcentaje_avance FROM proyectos;

SELECT '=== FECHAS ACADEMICAS ===' as info;
SELECT * FROM fechas;

SELECT '=== PERIODOS ===' as info;
SELECT * FROM periodos_propuestas;
