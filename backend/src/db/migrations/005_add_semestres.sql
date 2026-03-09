-- ============================================================
-- Migración 005: Sistema de Semestres Académicos
-- Cada inscripción (propuesta/proyecto) queda ligada a un semestre.
-- El resultado del proyecto determina si el alumno aprobó o reprobó.
-- ============================================================

-- 1. Tabla de semestres
CREATE TABLE IF NOT EXISTS semestres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE,
    año INT NOT NULL,
    numero TINYINT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activo (activo),
    CONSTRAINT chk_semestre_num CHECK (numero IN (1, 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Agregar semestre_id a propuestas
ALTER TABLE propuestas
    ADD COLUMN IF NOT EXISTS semestre_id INT NULL AFTER nombre_archivo_original,
    ADD CONSTRAINT fk_propuestas_semestre FOREIGN KEY (semestre_id) REFERENCES semestres(id);

-- 3. Agregar semestre_id y resultado a proyectos
ALTER TABLE proyectos
    ADD COLUMN IF NOT EXISTS semestre_id INT NULL AFTER ap_origen_id,
    ADD COLUMN IF NOT EXISTS resultado ENUM('en_curso','aprobado','reprobado','retirado') DEFAULT 'en_curso' AFTER semestre_id,
    ADD CONSTRAINT fk_proyectos_semestre FOREIGN KEY (semestre_id) REFERENCES semestres(id);
