-- Tabla para mantener historial completo de versiones de propuestas
-- Cada vez que se edita una propuesta, se guarda una nueva versión

CREATE TABLE IF NOT EXISTS versiones_propuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propuesta_id INT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    
    -- Datos de la versión
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    modalidad ENUM('desarrollo_software', 'investigacion', 'practica') NOT NULL,
    numero_estudiantes INT NOT NULL DEFAULT 1,
    complejidad_estimada ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
    justificacion_complejidad TEXT NULL,
    duracion_estimada_semestres INT NOT NULL DEFAULT 1,
    area_tematica VARCHAR(100) NOT NULL,
    objetivos_generales TEXT NOT NULL,
    objetivos_especificos TEXT NOT NULL,
    metodologia_propuesta TEXT NOT NULL,
    recursos_necesarios TEXT NULL,
    bibliografia TEXT NULL,
    
    -- Archivo de esta versión
    archivo VARCHAR(255) NULL,
    nombre_archivo_original VARCHAR(255) NULL,
    
    -- Metadata
    motivo_cambio ENUM('creacion', 'correccion_solicitada', 'mejora_voluntaria', 'revision_profesor') NOT NULL DEFAULT 'correccion_solicitada',
    comentario_cambio TEXT NULL COMMENT 'Comentario del estudiante sobre qué cambió',
    creado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (propuesta_id) REFERENCES propuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES usuarios(rut),
    INDEX idx_propuesta_version (propuesta_id, version),
    INDEX idx_propuesta_fecha (propuesta_id, created_at),
    UNIQUE KEY unique_propuesta_version (propuesta_id, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

