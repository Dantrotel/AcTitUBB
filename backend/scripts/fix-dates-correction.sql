-- ======================================================================
-- Script de CORRECCIÓN: revertir el +15 meses extra y aplicar cambios faltantes
-- El script original se ejecutó 2 veces parcialmente, aplicando +30 meses
-- en lugar de +15. Este script revierte -15 meses y aplica los cambios restantes.
-- ======================================================================

SET SQL_SAFE_UPDATES = 0;

-- =====================================================
-- PASO 1: Revertir -15 meses en tablas que se desplazaron doble
-- =====================================================

-- 1a. Propuestas aprobadas: van de +30 a +15
UPDATE propuestas SET fecha_envio = DATE_ADD(fecha_envio, INTERVAL -15 MONTH) WHERE estado_id = 4;

-- 1b. Proyectos: revertir -15 meses
UPDATE proyectos SET
  fecha_inicio = DATE_ADD(fecha_inicio, INTERVAL -15 MONTH),
  fecha_entrega_estimada = DATE_ADD(fecha_entrega_estimada, INTERVAL -15 MONTH),
  ultima_actividad_fecha = DATE_ADD(ultima_actividad_fecha, INTERVAL -15 MONTH);

-- 1c. Cronogramas
UPDATE cronogramas_proyecto SET
  fecha_inicio = DATE_ADD(fecha_inicio, INTERVAL -15 MONTH),
  fecha_fin_estimada = DATE_ADD(fecha_fin_estimada, INTERVAL -15 MONTH);

-- 1d. Hitos proyecto
UPDATE hitos_proyecto SET
  fecha_objetivo = DATE_ADD(fecha_objetivo, INTERVAL -15 MONTH);

-- 1e. Hitos cronograma
UPDATE hitos_cronograma SET
  fecha_limite = DATE_ADD(fecha_limite, INTERVAL -15 MONTH);

-- 1f. Avances
UPDATE avances SET
  fecha_envio = DATE_ADD(fecha_envio, INTERVAL -15 MONTH);

-- 1g. Reuniones calendario
UPDATE reuniones_calendario SET
  fecha = DATE_ADD(fecha, INTERVAL -15 MONTH);

-- 1h. Solicitudes reunion
UPDATE solicitudes_reunion SET
  fecha_propuesta = DATE_ADD(fecha_propuesta, INTERVAL -15 MONTH);

-- =====================================================
-- PASO 2: Aplicar los cambios que faltaron (fechas, periodos, asignaciones)
-- =====================================================

-- 2a. Fechas académicas
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

-- 2b. Periodos propuestas
UPDATE periodos_propuestas SET
  nombre = 'Período de Propuestas 2026',
  fecha_inicio = '2026-03-01',
  fecha_fin = '2026-12-31'
WHERE id = 1;

-- 2c. Asignaciones propuestas
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-06-20 10:00:00' WHERE id = 1;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-06-25 09:30:00' WHERE id = 2;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-07-07 11:00:00' WHERE id = 3;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-07-15 10:00:00' WHERE id = 4;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-07-21 14:00:00' WHERE id = 5;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-08-06 09:00:00' WHERE id = 6;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-08-15 10:30:00' WHERE id = 7;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2025-08-25 11:00:00' WHERE id = 8;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-10 09:00:00' WHERE id = 9;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-14 10:00:00' WHERE id = 10;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-19 11:00:00' WHERE id = 11;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-22 09:30:00' WHERE id = 12;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-10 14:00:00' WHERE id = 13;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-02-12 10:00:00' WHERE id = 14;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-01-15 09:00:00' WHERE id = 15;
UPDATE asignaciones_propuestas SET fecha_asignacion = '2026-01-20 10:00:00' WHERE id = 16;

-- 2d. Asignaciones proyectos
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-06-28 10:00:00' WHERE id IN (1, 2, 3);
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-07-12 10:00:00' WHERE id IN (4, 5, 6);
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-07-29 10:00:00' WHERE id IN (7, 8, 9);
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-08-07 10:00:00' WHERE id IN (10, 11, 12);
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-08-12 10:00:00' WHERE id IN (13, 14, 15);
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-08-29 10:00:00' WHERE id IN (16, 17, 18);
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-09-08 10:00:00' WHERE id IN (19, 20, 21);
UPDATE asignaciones_proyectos SET fecha_asignacion = '2025-09-18 10:00:00' WHERE id IN (22, 23, 24);

-- 2e. Actividad del sistema
UPDATE actividad_sistema SET timestamp = '2025-11-15 08:30:00' WHERE id = 1;
UPDATE actividad_sistema SET timestamp = '2025-06-15 14:20:00' WHERE id = 2;
UPDATE actividad_sistema SET timestamp = '2025-06-25 10:00:00' WHERE id = 3;
UPDATE actividad_sistema SET timestamp = '2025-06-30 11:00:00' WHERE id = 4;
UPDATE actividad_sistema SET timestamp = '2025-08-15 16:00:00' WHERE id = 5;
UPDATE actividad_sistema SET timestamp = '2025-08-20 10:30:00' WHERE id = 6;
UPDATE actividad_sistema SET timestamp = '2025-11-20 09:00:00' WHERE id = 7;
UPDATE actividad_sistema SET timestamp = '2025-06-20 15:00:00' WHERE id = 8;
UPDATE actividad_sistema SET timestamp = '2026-02-15 14:00:00' WHERE id = 9;
UPDATE actividad_sistema SET timestamp = '2026-03-01 08:00:00' WHERE id = 10;

SET SQL_SAFE_UPDATES = 1;
