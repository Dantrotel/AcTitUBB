-- ============================================================
-- Migración 006: Inscripciones de Ramo por Semestre
-- Cada estudiante declara qué ramo (AP o PT) está cursando
-- en el semestre activo al momento de registrarse.
-- El admin puede cambiar esto entre semestres.
-- ============================================================

CREATE TABLE IF NOT EXISTS inscripciones_ramo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_rut VARCHAR(10) NOT NULL,
    semestre_id INT NOT NULL,
    tipo_ramo ENUM('AP','PT') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_estudiante_semestre (estudiante_rut, semestre_id),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    FOREIGN KEY (semestre_id) REFERENCES semestres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
