-- ============================================
-- SISTEMA DE GESTIÓN DE DOCUMENTOS DEL PROYECTO
-- ============================================

-- Crear tabla de documentos del proyecto
CREATE TABLE IF NOT EXISTS documentos_proyecto (
    id INT PRIMARY KEY AUTO_INCREMENT,
    proyecto_id INT NOT NULL,
    tipo_documento ENUM(
        'propuesta_final',
        'informe_avance',
        'borrador_final',
        'documento_final',
        'formulario',
        'acta_reunion',
        'otro'
    ) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tamanio_bytes INT,
    mime_type VARCHAR(100),
    version INT DEFAULT 1,
    subido_por VARCHAR(10) NOT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('borrador', 'en_revision', 'aprobado', 'rechazado', 'archivado') DEFAULT 'borrador',
    comentarios TEXT,
    revisado_por VARCHAR(10),
    fecha_revision DATETIME,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES usuarios(rut),
    FOREIGN KEY (revisado_por) REFERENCES usuarios(rut),
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_tipo (tipo_documento),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Comentarios de la tabla
ALTER TABLE documentos_proyecto 
    COMMENT = 'Gestión de documentos asociados a proyectos de titulación';

-- Insertar algunos documentos de ejemplo (opcional, comentado)
-- INSERT INTO documentos_proyecto (proyecto_id, tipo_documento, nombre_archivo, nombre_original, ruta_archivo, subido_por, estado)
-- VALUES (1, 'propuesta_final', '1730000000-123456789.pdf', 'Propuesta_Final_v1.pdf', 'uploads/documentos/1730000000-123456789.pdf', '12345678-9', 'aprobado');

SELECT 'Tabla documentos_proyecto creada exitosamente' as resultado;
