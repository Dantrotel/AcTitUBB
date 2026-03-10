-- Migración 010: Eliminar índice único parcial inválido en MySQL
-- MySQL no soporta índices parciales con WHERE clause.
-- Si el índice fue creado sin el WHERE (como índice completo), bloquea reasignaciones
-- porque la fila inactiva (activo=FALSE) sigue ocupando el slot único.

-- Eliminar el índice si existe (puede fallar silenciosamente si no existe)
DROP INDEX IF EXISTS unique_asignacion_activa ON asignaciones_proyectos;

-- La unicidad de asignaciones activas se maneja a nivel de aplicación
-- en la función asignarProfesorAProyecto() en asignaciones-profesores.model.js
