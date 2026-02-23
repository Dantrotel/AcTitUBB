-- =====================================================
-- MIGRACIÓN: Tablas y vistas faltantes en AcTitUBB
-- =====================================================

-- 1. Tabla documentos_proyecto (usada por documento.model.js)
CREATE TABLE IF NOT EXISTS documentos_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    tipo_documento VARCHAR(100) NOT NULL COMMENT 'propuesta, informe_avance, informe_final, presentacion, otro',
    nombre_archivo VARCHAR(255) NOT NULL COMMENT 'Nombre almacenado en disco',
    nombre_original VARCHAR(255) NOT NULL COMMENT 'Nombre original del archivo subido',
    ruta_archivo VARCHAR(500) NOT NULL,
    tamanio_bytes BIGINT NULL,
    mime_type VARCHAR(100) NULL,
    subido_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    estado VARCHAR(20) DEFAULT 'borrador' COMMENT 'borrador, enviado, en_revision, aprobado, rechazado',
    comentarios TEXT NULL,
    revisado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP NULL,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (subido_por) REFERENCES usuarios(rut),
    FOREIGN KEY (revisado_por) REFERENCES usuarios(rut),
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_tipo (tipo_documento),
    INDEX idx_estado (estado),
    INDEX idx_subido_por (subido_por)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla conversaciones (usada por chat.model.js)
CREATE TABLE IF NOT EXISTS conversaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario1_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    usuario2_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    ultimo_mensaje_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario1_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (usuario2_rut) REFERENCES usuarios(rut),
    UNIQUE KEY unique_conversacion (usuario1_rut, usuario2_rut),
    INDEX idx_usuario1 (usuario1_rut),
    INDEX idx_usuario2 (usuario2_rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla mensajes (usada por chat.model.js)
CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversacion_id INT NOT NULL,
    remitente_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (remitente_rut) REFERENCES usuarios(rut),
    INDEX idx_conversacion (conversacion_id),
    INDEX idx_remitente (remitente_rut),
    INDEX idx_leido (leido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Agregar FK de conversaciones.ultimo_mensaje_id → mensajes.id
ALTER TABLE conversaciones
    ADD CONSTRAINT fk_conversacion_ultimo_mensaje
    FOREIGN KEY (ultimo_mensaje_id) REFERENCES mensajes(id) ON DELETE SET NULL;

-- 5. Tabla mensajes_no_leidos (usada por chat.model.js)
CREATE TABLE IF NOT EXISTS mensajes_no_leidos (
    usuario_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    conversacion_id INT NOT NULL,
    cantidad INT DEFAULT 0,
    ultimo_mensaje_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_rut, conversacion_id),
    FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Vista v_solicitudes_pendientes (usada por sistema-reservas.model.js)
CREATE OR REPLACE VIEW v_solicitudes_pendientes AS
SELECT
    sr.id,
    sr.proyecto_id,
    sr.profesor_rut,
    sr.estudiante_rut,
    DATE_FORMAT(sr.fecha_propuesta, '%Y-%m-%d') AS fecha_propuesta,
    sr.hora_propuesta,
    sr.duracion_minutos,
    sr.tipo_reunion,
    sr.descripcion,
    sr.estado,
    sr.creado_por,
    sr.fecha_respuesta_profesor,
    sr.comentarios_profesor,
    sr.created_at,
    sr.updated_at,
    p.titulo AS proyecto_titulo,
    ue.nombre AS estudiante_nombre
FROM solicitudes_reunion sr
INNER JOIN proyectos p ON sr.proyecto_id = p.id
INNER JOIN usuarios ue ON sr.estudiante_rut = ue.rut
WHERE sr.estado = 'pendiente';

SELECT 'Migración de tablas faltantes aplicada exitosamente' AS status;
