-- Crear tabla para versiones de archivos de propuestas
CREATE TABLE IF NOT EXISTS archivos_propuesta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propuesta_id INT NOT NULL,
    tipo_archivo ENUM('propuesta_inicial', 'revision_profesor', 'correccion_estudiante') NOT NULL,
    archivo VARCHAR(255) NOT NULL,
    nombre_archivo_original VARCHAR(255) NOT NULL,
    subido_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    version INT NOT NULL DEFAULT 1,
    comentario TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propuesta_id) REFERENCES propuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES usuarios(rut),
    INDEX idx_propuesta (propuesta_id),
    INDEX idx_version (propuesta_id, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar columna comentarios a propuestas si no existe
ALTER TABLE propuestas ADD COLUMN IF NOT EXISTS comentarios TEXT NULL COMMENT 'Comentarios del profesor sobre la propuesta';

-- Agregar columnas para tracking de archivos de revisión en la tabla propuestas
ALTER TABLE propuestas ADD COLUMN IF NOT EXISTS archivo_revision VARCHAR(255) NULL;
ALTER TABLE propuestas ADD COLUMN IF NOT EXISTS nombre_archivo_revision_original VARCHAR(255) NULL;
