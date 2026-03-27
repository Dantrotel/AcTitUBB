-- ============================================================
-- Migración 012: Pre-asignación de Profesor Co-Guía a Estudiante
-- El co-guía se vincula al ESTUDIANTE antes de crear propuesta/proyecto
-- ============================================================

CREATE TABLE IF NOT EXISTS co_guias_estudiantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    profesor_co_guia_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    asignado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_desasignacion TIMESTAMP NULL,
    observaciones TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    FOREIGN KEY (profesor_co_guia_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (asignado_por) REFERENCES usuarios(rut),
    INDEX idx_co_guia_estudiante (estudiante_rut, activo),
    INDEX idx_co_guia_profesor (profesor_co_guia_rut, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
