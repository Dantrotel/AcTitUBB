-- ====================================================================
-- SOPORTE PARA MÚLTIPLES ESTUDIANTES EN PROPUESTAS Y PROYECTOS
-- ====================================================================
-- Permite que 2 o 3 estudiantes trabajen juntos en una propuesta/proyecto

-- Tabla para vincular múltiples estudiantes a una propuesta
CREATE TABLE IF NOT EXISTS estudiantes_propuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propuesta_id INT NOT NULL,
    estudiante_rut VARCHAR(10) COLLATE utf8mb4_0900_ai_ci NOT NULL,
    es_creador BOOLEAN DEFAULT FALSE, -- TRUE para el estudiante que creó la propuesta
    orden INT DEFAULT 1, -- 1 = creador, 2 = segundo estudiante, 3 = tercer estudiante
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propuesta_id) REFERENCES propuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    UNIQUE KEY unique_estudiante_propuesta (propuesta_id, estudiante_rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla para vincular múltiples estudiantes a un proyecto
CREATE TABLE IF NOT EXISTS estudiantes_proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    estudiante_rut VARCHAR(10) COLLATE utf8mb4_0900_ai_ci NOT NULL,
    es_creador BOOLEAN DEFAULT FALSE, -- TRUE para el estudiante original
    orden INT DEFAULT 1, -- 1 = creador, 2 = segundo estudiante, 3 = tercer estudiante
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    UNIQUE KEY unique_estudiante_proyecto (proyecto_id, estudiante_rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Migrar datos existentes: Agregar estudiantes actuales a las nuevas tablas
-- Para propuestas existentes
INSERT INTO estudiantes_propuestas (propuesta_id, estudiante_rut, es_creador, orden)
SELECT id, estudiante_rut, TRUE, 1
FROM propuestas
WHERE estudiante_rut IS NOT NULL
ON DUPLICATE KEY UPDATE es_creador = TRUE;

-- Para proyectos existentes
INSERT INTO estudiantes_proyectos (proyecto_id, estudiante_rut, es_creador, orden)
SELECT id, estudiante_rut, TRUE, 1
FROM proyectos
WHERE estudiante_rut IS NOT NULL
ON DUPLICATE KEY UPDATE es_creador = TRUE;

-- Índices para mejorar rendimiento
CREATE INDEX idx_propuesta_estudiante ON estudiantes_propuestas(propuesta_id);
CREATE INDEX idx_proyecto_estudiante ON estudiantes_proyectos(proyecto_id);
CREATE INDEX idx_estudiante_propuestas ON estudiantes_propuestas(estudiante_rut);
CREATE INDEX idx_estudiante_proyectos ON estudiantes_proyectos(estudiante_rut);

-- ====================================================================
-- VERIFICACIÓN
-- ====================================================================
SELECT 'Tablas creadas exitosamente' AS resultado;
SELECT COUNT(*) AS propuestas_migradas FROM estudiantes_propuestas;
SELECT COUNT(*) AS proyectos_migrados FROM estudiantes_proyectos;
