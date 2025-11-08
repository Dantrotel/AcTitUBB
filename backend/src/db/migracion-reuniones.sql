-- Migración para actualizar sistema de reuniones
-- Fecha: 2025-10-26
-- Descripción: Actualizar estados y crear tabla de historial

USE actitubb;

-- 1. Actualizar tabla reuniones_calendario
ALTER TABLE reuniones_calendario 
    MODIFY COLUMN solicitud_reunion_id INT NULL;

ALTER TABLE reuniones_calendario 
    MODIFY COLUMN estado ENUM('programada', 'realizada', 'cancelada') DEFAULT 'programada';

ALTER TABLE reuniones_calendario 
    ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT NULL AFTER estado;

-- Eliminar índices únicos que impedían múltiples reuniones
ALTER TABLE reuniones_calendario 
    DROP INDEX IF EXISTS unique_profesor_fecha_hora;

ALTER TABLE reuniones_calendario 
    DROP INDEX IF EXISTS unique_estudiante_fecha_hora;

-- Agregar índice para optimizar búsquedas por estado
ALTER TABLE reuniones_calendario 
    ADD INDEX IF NOT EXISTS idx_reunion_estado (estado);

-- 2. Crear tabla de historial de reuniones si no existe
CREATE TABLE IF NOT EXISTS historial_reuniones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reunion_id INT NULL,
    solicitud_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) NOT NULL,
    estudiante_rut VARCHAR(10) NOT NULL,
    fecha_propuesta DATE NOT NULL,
    hora_propuesta TIME NOT NULL,
    tipo_reunion VARCHAR(50) NOT NULL,
    accion ENUM('solicitud_creada', 'aceptada_profesor', 'aceptada_estudiante', 'confirmada', 'rechazada', 'cancelada', 'realizada') NOT NULL,
    realizado_por VARCHAR(10) NOT NULL,
    comentarios TEXT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reunion_id) REFERENCES reuniones_calendario(id) ON DELETE SET NULL,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes_reunion(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (realizado_por) REFERENCES usuarios(rut),
    INDEX idx_historial_reunion (reunion_id),
    INDEX idx_historial_proyecto (proyecto_id),
    INDEX idx_historial_fecha (fecha_accion),
    INDEX idx_historial_accion (accion)
);

-- 3. Actualizar reuniones existentes a estado 'programada' si tienen estados no válidos
UPDATE reuniones_calendario 
SET estado = 'programada' 
WHERE estado NOT IN ('programada', 'realizada', 'cancelada');

SELECT 'Migración completada exitosamente' as status;
