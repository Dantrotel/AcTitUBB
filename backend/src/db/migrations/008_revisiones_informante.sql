-- Migración 008: Tabla de revisiones del Profesor Informante
CREATE TABLE IF NOT EXISTS revisiones_informante (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hito_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    informante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    estado ENUM('pendiente', 'aprobado', 'rechazado') DEFAULT 'pendiente',
    comentarios TEXT NULL,
    calificacion DECIMAL(3,1) NULL CHECK (calificacion >= 1.0 AND calificacion <= 7.0),
    archivo_retroalimentacion VARCHAR(255) NULL,
    nombre_archivo_retroalimentacion VARCHAR(255) NULL,
    fecha_revision TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hito_id) REFERENCES hitos_cronograma(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (informante_rut) REFERENCES usuarios(rut),
    UNIQUE KEY unique_hito_informante (hito_id, informante_rut),
    INDEX idx_informante_estado (informante_rut, estado)
);
