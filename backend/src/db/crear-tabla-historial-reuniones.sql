-- ============================================
-- CREAR TABLA historial_reuniones
-- Para registrar todas las acciones sobre solicitudes y reuniones
-- ============================================

USE AcTitUBB;

-- Crear tabla historial_reuniones
CREATE TABLE IF NOT EXISTS historial_reuniones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NULL COMMENT 'ID de la solicitud relacionada',
    proyecto_id INT NULL COMMENT 'ID del proyecto',
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'RUT del profesor',
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'RUT del estudiante',
    fecha_propuesta DATE NULL COMMENT 'Fecha de la reunión propuesta',
    hora_propuesta TIME NULL COMMENT 'Hora de la reunión propuesta',
    tipo_reunion ENUM('seguimiento','revision_avance','orientacion','defensa_parcial','otra') DEFAULT 'seguimiento',
    accion VARCHAR(50) NOT NULL COMMENT 'Acción realizada: reserva_realizada, aceptada, rechazada, cancelada',
    realizado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'RUT de quien realizó la acción',
    comentarios TEXT NULL COMMENT 'Comentarios adicionales',
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Cuándo se realizó la acción',
    
    -- Índices
    INDEX idx_solicitud (solicitud_id),
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_profesor (profesor_rut),
    INDEX idx_estudiante (estudiante_rut),
    INDEX idx_accion (accion),
    INDEX idx_fecha_accion (fecha_accion),
    
    -- Foreign keys
    CONSTRAINT fk_historial_solicitud 
        FOREIGN KEY (solicitud_id) REFERENCES solicitudes_reunion(id) ON DELETE SET NULL,
    CONSTRAINT fk_historial_proyecto 
        FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL,
    CONSTRAINT fk_historial_profesor 
        FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut) ON DELETE SET NULL,
    CONSTRAINT fk_historial_estudiante 
        FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Historial de todas las acciones sobre solicitudes y reuniones';

-- Verificar creación
SELECT '✅ Tabla historial_reuniones creada exitosamente' as Estado;

DESCRIBE historial_reuniones;

SELECT 
    COUNT(*) as total_registros
FROM historial_reuniones;
