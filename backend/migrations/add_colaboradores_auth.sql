-- Migración: Sistema de autenticación y evaluación para colaboradores externos
-- Fecha: 2025-12-29
-- Descripción: Permite a colaboradores externos acceder al sistema y evaluar estudiantes

-- 1. Agregar campos de autenticación a colaboradores_externos
-- Verificar y agregar columnas solo si no existen
SET @dbname = DATABASE();
SET @tablename = 'colaboradores_externos';

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = 'password_hash') > 0,
  'SELECT 1',
  'ALTER TABLE colaboradores_externos ADD COLUMN password_hash VARCHAR(255) NULL COMMENT "Hash de contraseña para acceso al sistema"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = 'token_acceso') > 0,
  'SELECT 1',
  'ALTER TABLE colaboradores_externos ADD COLUMN token_acceso VARCHAR(255) NULL COMMENT "Token único para primer acceso"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = 'fecha_token_expira') > 0,
  'SELECT 1',
  'ALTER TABLE colaboradores_externos ADD COLUMN fecha_token_expira DATETIME NULL COMMENT "Fecha de expiración del token"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = 'ultimo_acceso') > 0,
  'SELECT 1',
  'ALTER TABLE colaboradores_externos ADD COLUMN ultimo_acceso DATETIME NULL COMMENT "Última vez que accedió al sistema"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename
   AND COLUMN_NAME = 'activo_sistema') > 0,
  'SELECT 1',
  'ALTER TABLE colaboradores_externos ADD COLUMN activo_sistema BOOLEAN DEFAULT FALSE COMMENT "Si tiene acceso activo al sistema"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Tabla de evaluaciones de colaboradores externos
CREATE TABLE IF NOT EXISTS evaluaciones_colaboradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colaborador_proyecto_id INT NOT NULL COMMENT 'ID de la relación colaborador-proyecto',
    proyecto_id INT NOT NULL COMMENT 'ID del proyecto evaluado',
    estudiante_rut VARCHAR(10) NOT NULL COMMENT 'RUT del estudiante evaluado',
    
    -- Criterios de evaluación (1-7, escala chilena)
    desempeno_tecnico DECIMAL(2,1) NULL COMMENT 'Calificación de desempeño técnico',
    cumplimiento_plazos DECIMAL(2,1) NULL COMMENT 'Calificación de cumplimiento de plazos',
    comunicacion DECIMAL(2,1) NULL COMMENT 'Calificación de comunicación',
    proactividad DECIMAL(2,1) NULL COMMENT 'Calificación de proactividad',
    trabajo_equipo DECIMAL(2,1) NULL COMMENT 'Calificación de trabajo en equipo',
    resolucion_problemas DECIMAL(2,1) NULL COMMENT 'Calificación de resolución de problemas',
    
    -- Nota final y comentarios
    nota_final DECIMAL(2,1) NULL COMMENT 'Nota final promedio',
    comentarios TEXT NULL COMMENT 'Comentarios y observaciones',
    fortalezas TEXT NULL COMMENT 'Fortalezas identificadas',
    areas_mejora TEXT NULL COMMENT 'Áreas de mejora identificadas',
    
    -- Recomendación
    recomendaria_contratar ENUM('si', 'no', 'tal_vez') NULL COMMENT '¿Recomendaría contratar al estudiante?',
    comentario_recomendacion TEXT NULL COMMENT 'Comentario sobre la recomendación',
    
    -- Metadatos
    fecha_evaluacion DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de la evaluación',
    evaluacion_completada BOOLEAN DEFAULT FALSE COMMENT 'Si la evaluación está completa',
    fecha_completada DATETIME NULL COMMENT 'Fecha en que se completó la evaluación',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (colaborador_proyecto_id) REFERENCES colaboradores_proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    
    INDEX idx_colaborador_proyecto (colaborador_proyecto_id),
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_estudiante (estudiante_rut),
    INDEX idx_fecha_evaluacion (fecha_evaluacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de tokens de acceso para colaboradores
CREATE TABLE IF NOT EXISTS tokens_colaboradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colaborador_id INT NOT NULL COMMENT 'ID del colaborador',
    token VARCHAR(255) NOT NULL COMMENT 'Token único de acceso',
    tipo ENUM('activacion', 'reset_password', 'acceso_temporal') NOT NULL COMMENT 'Tipo de token',
    proyecto_id INT NULL COMMENT 'Proyecto específico al que da acceso (si aplica)',
    usado BOOLEAN DEFAULT FALSE COMMENT 'Si el token ya fue usado',
    fecha_expiracion DATETIME NOT NULL COMMENT 'Fecha de expiración del token',
    fecha_uso DATETIME NULL COMMENT 'Fecha en que se usó el token',
    ip_uso VARCHAR(45) NULL COMMENT 'IP desde donde se usó',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores_externos(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_token (token),
    INDEX idx_colaborador (colaborador_id),
    INDEX idx_token_activo (token, usado, fecha_expiracion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla de notificaciones para colaboradores
CREATE TABLE IF NOT EXISTS notificaciones_colaboradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colaborador_id INT NOT NULL COMMENT 'ID del colaborador',
    tipo ENUM('asignacion_proyecto', 'solicitud_evaluacion', 'recordatorio_evaluacion', 'mensaje_profesor', 'actualizacion_proyecto') NOT NULL,
    titulo VARCHAR(255) NOT NULL COMMENT 'Título de la notificación',
    mensaje TEXT NOT NULL COMMENT 'Contenido de la notificación',
    proyecto_id INT NULL COMMENT 'Proyecto relacionado',
    leida BOOLEAN DEFAULT FALSE COMMENT 'Si la notificación fue leída',
    fecha_leida DATETIME NULL COMMENT 'Fecha en que se leyó',
    url_accion VARCHAR(500) NULL COMMENT 'URL a la que debe dirigirse',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores_externos(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    
    INDEX idx_colaborador_leida (colaborador_id, leida),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Actualizar tabla colaboradores_proyectos para tracking de evaluaciones
SET @tablename2 = 'colaboradores_proyectos';

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename2
   AND COLUMN_NAME = 'evaluacion_solicitada') > 0,
  'SELECT 1',
  'ALTER TABLE colaboradores_proyectos ADD COLUMN evaluacion_solicitada BOOLEAN DEFAULT FALSE COMMENT "Si se solicitó evaluación"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename2
   AND COLUMN_NAME = 'fecha_solicitud_evaluacion') > 0,
  'SELECT 1',
  'ALTER TABLE colaboradores_proyectos ADD COLUMN fecha_solicitud_evaluacion DATETIME NULL COMMENT "Fecha de solicitud de evaluación"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename2
   AND COLUMN_NAME = 'evaluacion_completada') > 0,
  'SELECT 1',
  'ALTER TABLE colaboradores_proyectos ADD COLUMN evaluacion_completada BOOLEAN DEFAULT FALSE COMMENT "Si completó la evaluación"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname
   AND TABLE_NAME = @tablename2
   AND COLUMN_NAME = 'fecha_evaluacion_completada') > 0,
  'SELECT 1',
  'ALTER TABLE colaboradores_proyectos ADD COLUMN fecha_evaluacion_completada DATETIME NULL COMMENT "Fecha en que completó la evaluación"'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

