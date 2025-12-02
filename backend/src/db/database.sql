Create database actitubb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE actitubb;

-- Tabla de Roles de Usuarios
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Usuarios (Estudiantes y Profesores)
CREATE TABLE IF NOT EXISTS usuarios (
    rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL PRIMARY KEY UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    confirmado BOOLEAN DEFAULT FALSE,
    debe_cambiar_password BOOLEAN DEFAULT FALSE COMMENT 'Indica si el usuario debe cambiar su contraseÃ±a en el prÃ³ximo login (contraseÃ±a temporal)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Estados para Propuestas
CREATE TABLE IF NOT EXISTS estados_propuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Estados de Proyectos
CREATE TABLE IF NOT EXISTS estados_proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Propuestas (Fase inicial)
CREATE TABLE IF NOT EXISTS propuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    estado_id INT NOT NULL DEFAULT 1, -- Referencia al ID del estado en estados_propuestas
    comentarios_profesor TEXT,
    fecha_envio DATE NOT NULL,
    fecha_revision TIMESTAMP NULL,
    fecha_aprobacion DATE NULL,
    proyecto_id INT NULL, -- Se llena cuando se aprueba y se crea el proyecto
    archivo VARCHAR(255),
    nombre_archivo_original VARCHAR(255),
    
    -- NUEVOS CAMPOS MEJORADOS
    modalidad ENUM('desarrollo_software', 'investigacion') NOT NULL,
    numero_estudiantes INT NOT NULL DEFAULT 1 CHECK (numero_estudiantes BETWEEN 1 AND 2),
    complejidad_estimada ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
    justificacion_complejidad TEXT NULL,
    duracion_estimada_semestres INT NOT NULL DEFAULT 1 CHECK (duracion_estimada_semestres BETWEEN 1 AND 2),
    area_tematica VARCHAR(100) NOT NULL,
    objetivos_generales TEXT NOT NULL,
    objetivos_especificos TEXT NOT NULL,
    metodologia_propuesta TEXT NOT NULL,
    recursos_necesarios TEXT NULL,
    bibliografia TEXT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (estado_id) REFERENCES estados_propuestas(id)
);

-- Tabla para vincular mÃºltiples estudiantes a una propuesta
CREATE TABLE IF NOT EXISTS estudiantes_propuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propuesta_id INT NOT NULL,
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    es_creador BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 1,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propuesta_id) REFERENCES propuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    UNIQUE KEY unique_estudiante_propuesta (propuesta_id, estudiante_rut),
    INDEX idx_propuesta_estudiante (propuesta_id),
    INDEX idx_estudiante_propuestas (estudiante_rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de Roles de Profesores en Proyectos
CREATE TABLE IF NOT EXISTS roles_profesores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Asignaciones de Profesores a Propuestas
CREATE TABLE IF NOT EXISTS asignaciones_propuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propuesta_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (propuesta_id) REFERENCES propuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    UNIQUE KEY unique_asignacion (propuesta_id, profesor_rut)
);

-- Tabla de Proyectos (Fase de desarrollo)
CREATE TABLE IF NOT EXISTS proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    propuesta_id INT NOT NULL, -- Referencia a la propuesta original
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    estado_id INT NOT NULL DEFAULT 1, -- Referencia al ID del estado en estados_proyectos
    fecha_inicio DATE NOT NULL,
    fecha_entrega_estimada DATE,
    fecha_entrega_real DATE,
    fecha_defensa DATE,
    
    -- CAMPOS ROBUSTOS PARA GESTIÃ“N COMPLETA
    -- InformaciÃ³n extendida del proyecto
    objetivo_general TEXT,
    objetivos_especificos TEXT,
    metodologia TEXT,
    recursos_requeridos TEXT,
    bibliografia TEXT,
    
    -- GestiÃ³n de progreso y calificaciones
    porcentaje_avance DECIMAL(5,2) DEFAULT 0.00 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    nota_propuesta DECIMAL(3,1) NULL CHECK (nota_propuesta >= 1.0 AND nota_propuesta <= 7.0),
    nota_proyecto DECIMAL(3,1) NULL CHECK (nota_proyecto >= 1.0 AND nota_proyecto <= 7.0),
    nota_defensa DECIMAL(3,1) NULL CHECK (nota_defensa >= 1.0 AND nota_defensa <= 7.0),
    nota_final DECIMAL(3,1) NULL CHECK (nota_final >= 1.0 AND nota_final <= 7.0),
    
    -- GestiÃ³n de estado detallado
    estado_detallado ENUM('inicializacion', 'planificacion', 'desarrollo_fase1', 'desarrollo_fase2', 'testing', 'documentacion', 'revision_final', 'preparacion_defensa', 'defendido', 'cerrado') DEFAULT 'inicializacion',
    prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    riesgo_nivel ENUM('bajo', 'medio', 'alto') DEFAULT 'medio',
    
    -- GestiÃ³n de archivos y entregas
    documento_proyecto VARCHAR(255) NULL, -- Documento principal del proyecto
    documento_final VARCHAR(255) NULL, -- Documento final/memoria
    presentacion VARCHAR(255) NULL, -- Archivo de presentaciÃ³n
    codigo_fuente VARCHAR(255) NULL, -- Link o archivo del cÃ³digo fuente
    
    -- Observaciones y seguimiento
    observaciones_profesor TEXT NULL,
    observaciones_estudiante TEXT NULL,
    ultimo_avance_fecha DATE NULL,
    proximo_hito_fecha DATE NULL,
    tiempo_dedicado_horas INT DEFAULT 0,
    
    -- ConfiguraciÃ³n de modalidad (heredada de propuesta)
    modalidad ENUM('desarrollo_software', 'investigacion') NOT NULL,
    complejidad ENUM('baja', 'media', 'alta') NOT NULL,
    duracion_semestres INT NOT NULL DEFAULT 1,
    
    -- Control de versiones y auditorÃ­a
    version_actual VARCHAR(10) DEFAULT '1.0',
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (propuesta_id) REFERENCES propuestas(id),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (estado_id) REFERENCES estados_proyectos(id)
);

-- Tabla de Asignaciones de Profesores a Proyectos (UNIFICADA)
-- MOVIDA AQUÃ para respetar el orden de dependencias
CREATE TABLE IF NOT EXISTS asignaciones_proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    rol_profesor_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_desasignacion TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    observaciones TEXT NULL,
    asignado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- RUT del admin que hizo la asignaciÃ³n
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (rol_profesor_id) REFERENCES roles_profesores(id),
    FOREIGN KEY (asignado_por) REFERENCES usuarios(rut),
    UNIQUE KEY unique_asignacion_activa (proyecto_id, rol_profesor_id, activo),
    INDEX idx_proyecto_activo (proyecto_id, activo),
    INDEX idx_profesor_activo (profesor_rut, activo),
    INDEX idx_rol_activo (rol_profesor_id, activo)
);

-- Tabla de Historial de Asignaciones (para auditorÃ­a)
CREATE TABLE IF NOT EXISTS historial_asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    rol_profesor_id INT NOT NULL,
    accion ENUM('asignado', 'desasignado', 'modificado') NOT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    realizado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- RUT del admin que realizÃ³ la acciÃ³n
    observaciones TEXT NULL,
    FOREIGN KEY (asignacion_id) REFERENCES asignaciones_proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (rol_profesor_id) REFERENCES roles_profesores(id),
    FOREIGN KEY (realizado_por) REFERENCES usuarios(rut),
    INDEX idx_proyecto_historial (proyecto_id),
    INDEX idx_profesor_historial (profesor_rut),
    INDEX idx_fecha_historial (fecha_accion)
);

-- Tabla para vincular mÃºltiples estudiantes a un proyecto
-- MOVIDA AQUÃ para respetar el orden de dependencias
CREATE TABLE IF NOT EXISTS estudiantes_proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    es_creador BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 1,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    UNIQUE KEY unique_estudiante_proyecto (proyecto_id, estudiante_rut),
    INDEX idx_proyecto_estudiante (proyecto_id),
    INDEX idx_estudiante_proyectos (estudiante_rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de Hitos del Proyecto
CREATE TABLE IF NOT EXISTS hitos_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_hito ENUM('inicio', 'planificacion', 'desarrollo', 'entrega_parcial', 'revision', 'testing', 'documentacion', 'entrega_final', 'defensa', 'cierre') NOT NULL,
    fecha_objetivo DATE NOT NULL,
    fecha_completado DATE NULL,
    estado ENUM('pendiente', 'en_progreso', 'completado', 'retrasado', 'cancelado') DEFAULT 'pendiente',
    porcentaje_completado DECIMAL(5,2) DEFAULT 0.00 CHECK (porcentaje_completado >= 0 AND porcentaje_completado <= 100),
    peso_en_proyecto DECIMAL(4,1) DEFAULT 10.0 CHECK (peso_en_proyecto >= 0 AND peso_en_proyecto <= 100),
    
    -- Archivos y entregables asociados al hito
    archivo_entregable VARCHAR(255) NULL,
    comentarios_estudiante TEXT NULL,
    comentarios_profesor TEXT NULL,
    calificacion DECIMAL(3,1) NULL CHECK (calificacion >= 1.0 AND calificacion <= 7.0),
    
    -- Control de dependencias
    hito_predecesor_id INT NULL,
    es_critico BOOLEAN DEFAULT FALSE,
    
    -- AuditorÃ­a y seguimiento
    creado_por_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    actualizado_por_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (hito_predecesor_id) REFERENCES hitos_proyecto(id) ON DELETE SET NULL,
    FOREIGN KEY (creado_por_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (actualizado_por_rut) REFERENCES usuarios(rut),
    
    INDEX idx_proyecto_estado (proyecto_id, estado),
    INDEX idx_fecha_objetivo (fecha_objetivo),
    INDEX idx_tipo_estado (tipo_hito, estado)
);

-- Tabla de Avances del Proyecto
CREATE TABLE IF NOT EXISTS avances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    archivo VARCHAR(255),
    estado_id INT NOT NULL DEFAULT 1, -- Referencia al ID del estado
    comentarios_profesor TEXT,
    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP NULL,
    profesor_revisor VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_revisor) REFERENCES usuarios(rut)
);

-- Tabla de Fechas Importantes del Calendario
-- ============================================
-- TABLA UNIFICADA DE FECHAS
-- ============================================
-- Esta tabla reemplaza a fechas_calendario y fechas_importantes
-- Combina todos los campos necesarios para ambos propÃ³sitos

CREATE TABLE IF NOT EXISTS fechas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- InformaciÃ³n bÃ¡sica
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL COMMENT 'Fecha principal del evento',
    
    -- Tipo y categorizaciÃ³n
    tipo_fecha ENUM(
        'entrega_propuesta', 
        'entrega', 
        'entrega_avance', 
        'entrega_final',
        'reunion', 
        'hito', 
        'deadline', 
        'presentacion', 
        'defensa', 
        'revision',
        'academica',
        'global',
        'otro'
    ) DEFAULT 'otro',
    
    -- Visibilidad y alcance
    es_global BOOLEAN DEFAULT FALSE COMMENT 'Si es true, visible para todos (fechas del admin)',
    activa BOOLEAN DEFAULT TRUE COMMENT 'Para soft delete (solo fechas de calendario)',
    
    -- Control de perÃ­odos (para fechas importantes)
    habilitada BOOLEAN DEFAULT TRUE COMMENT 'Controla si el perÃ­odo estÃ¡ activo para recibir entregas',
    permite_extension BOOLEAN DEFAULT TRUE COMMENT 'Si permite solicitar extensiÃ³n despuÃ©s de la fecha lÃ­mite',
    requiere_entrega BOOLEAN DEFAULT FALSE COMMENT 'Si requiere entrega de archivos/documentos',
    
    -- Estado de completitud
    completada BOOLEAN DEFAULT FALSE,
    fecha_realizada DATE NULL COMMENT 'Fecha en que se completÃ³ el evento',
    notas TEXT,
    
    -- Relaciones
    proyecto_id INT NULL COMMENT 'NULL para fechas globales, ID del proyecto para fechas especÃ­ficas',
    creado_por_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del que creÃ³ la fecha (admin o profesor)',
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'RUT del profesor (para fechas especÃ­ficas profesor-estudiante)',
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'RUT del estudiante (para fechas especÃ­ficas)',
    
    -- AuditorÃ­a
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut),
    
    -- Ãndices para mejorar performance
    INDEX idx_fecha (fecha),
    INDEX idx_tipo_fecha (tipo_fecha),
    INDEX idx_es_global (es_global),
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_activa (activa),
    INDEX idx_habilitada (habilitada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- NOTA: MIGRACIÃ“N DE DATOS
-- ============================================
-- Si estÃ¡s migrando desde una base de datos existente con fechas_calendario
-- y fechas_importantes, ejecuta el script: migrate_to_unified_fechas.sql
-- 
-- Este archivo (database.sql) estÃ¡ diseÃ±ado para crear la base de datos desde cero.
-- ============================================

-- ============================================
-- NOTA: Las tablas fechas_calendario y fechas_importantes fueron reemplazadas
-- por la tabla unificada 'fechas' (definida arriba)
-- ============================================

-- Tabla de Cronogramas de Proyecto (acordados entre guÃ­a y estudiante)
CREATE TABLE IF NOT EXISTS cronogramas_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    nombre_cronograma VARCHAR(255) NOT NULL DEFAULT 'Cronograma Principal',
    descripcion TEXT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_por_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- Profesor guÃ­a que creÃ³ el cronograma
    aprobado_por_estudiante BOOLEAN DEFAULT FALSE,
    fecha_aprobacion_estudiante TIMESTAMP NULL,
    
    -- ConfiguraciÃ³n de alertas
    alertas_activas BOOLEAN DEFAULT TRUE,
    dias_alerta_previa INT DEFAULT 3, -- DÃ­as antes de enviar alerta
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por_rut) REFERENCES usuarios(rut),
    
    INDEX idx_proyecto_activo (proyecto_id, activo),
    INDEX idx_fechas_cronograma (fecha_inicio, fecha_fin_estimada)
);

-- Tabla de Hitos del Cronograma (entregas especÃ­ficas)
CREATE TABLE IF NOT EXISTS hitos_cronograma (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cronograma_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    nombre_hito VARCHAR(255) NOT NULL,
    descripcion TEXT NULL,
    tipo_hito ENUM('entrega_documento', 'revision_avance', 'reunion_seguimiento', 'defensa') NOT NULL,
    
    -- Fechas
    fecha_limite DATE NOT NULL,
    fecha_entrega TIMESTAMP NULL,
    
    -- Estado
    estado ENUM('pendiente', 'en_progreso', 'entregado', 'revisado', 'aprobado', 'rechazado', 'retrasado') DEFAULT 'pendiente',
    porcentaje_avance DECIMAL(5,2) DEFAULT 0.00 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    
    -- Archivos y retroalimentaciÃ³n
    archivo_entrega VARCHAR(255) NULL,
    nombre_archivo_original VARCHAR(255) NULL,
    comentarios_estudiante TEXT NULL,
    comentarios_profesor TEXT NULL,
    calificacion DECIMAL(3,1) NULL CHECK (calificacion >= 1.0 AND calificacion <= 7.0),
    
    -- Control de cumplimiento
    cumplido_en_fecha BOOLEAN NULL, -- NULL si no entregado, TRUE/FALSE si entregado
    dias_retraso INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cronograma_id) REFERENCES cronogramas_proyecto(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    
    INDEX idx_cronograma_fecha (cronograma_id, fecha_limite),
    INDEX idx_proyecto_estado (proyecto_id, estado),
    INDEX idx_fecha_limite (fecha_limite),
    INDEX idx_estado_fecha (estado, fecha_limite)
);

-- Tabla de Notificaciones y Alertas AutomÃ¡ticas
CREATE TABLE IF NOT EXISTS notificaciones_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    hito_cronograma_id INT NULL,
    tipo_notificacion ENUM('fecha_limite_proxima', 'entrega_retrasada', 'revision_pendiente', 'cronograma_modificado', 'nueva_entrega', 'proyecto_creado') NOT NULL,
    
    -- Destinatarios
    destinatario_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    rol_destinatario ENUM('estudiante', 'profesor_guia', 'profesor_revisor', 'admin') NOT NULL,
    
    -- Contenido
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    
    -- Estado
    leida BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP NULL,
    activa BOOLEAN DEFAULT TRUE,
    
    -- ConfiguraciÃ³n de envÃ­o
    enviar_email BOOLEAN DEFAULT TRUE,
    email_enviado BOOLEAN DEFAULT FALSE,
    fecha_envio_email TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (hito_cronograma_id) REFERENCES hitos_cronograma(id) ON DELETE CASCADE,
    FOREIGN KEY (destinatario_rut) REFERENCES usuarios(rut),
    
    INDEX idx_destinatario_activa (destinatario_rut, activa),
    INDEX idx_proyecto_tipo (proyecto_id, tipo_notificacion),
    INDEX idx_fecha_creacion (created_at),
    INDEX idx_no_leidas (destinatario_rut, leida, activa)
);

-- Tabla de ConfiguraciÃ³n de Alertas por Proyecto
CREATE TABLE IF NOT EXISTS configuracion_alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- Profesor que configura las alertas
    
    -- ConfiguraciÃ³n de dÃ­as de alerta
    dias_alerta_entregas INT DEFAULT 3,
    dias_alerta_reuniones INT DEFAULT 1,
    dias_alerta_defensas INT DEFAULT 7,
    
    -- Tipos de alerta activos
    alertas_entregas BOOLEAN DEFAULT TRUE,
    alertas_reuniones BOOLEAN DEFAULT TRUE,
    alertas_retrasos BOOLEAN DEFAULT TRUE,
    alertas_hitos BOOLEAN DEFAULT TRUE,
    
    -- ConfiguraciÃ³n de envÃ­o
    enviar_email_estudiante BOOLEAN DEFAULT TRUE,
    enviar_email_profesor BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    
    UNIQUE KEY unique_config_proyecto (proyecto_id)
);

-- Tabla de Reuniones
CREATE TABLE IF NOT EXISTS reuniones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    lugar VARCHAR(100),
    tipo ENUM('revision_avance', 'orientacion', 'defensa', 'otra') DEFAULT 'otra',
    estado ENUM('programada', 'realizada', 'cancelada') DEFAULT 'programada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

-- Tabla de Participantes en Reuniones
CREATE TABLE IF NOT EXISTS participantes_reuniones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reunion_id INT NOT NULL,
    usuario_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    rol ENUM('organizador', 'participante', 'invitado') DEFAULT 'participante',
    confirmado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (reunion_id) REFERENCES reuniones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut),
    UNIQUE KEY unique_participante (reunion_id, usuario_rut)
);

-- Insertar datos iniciales

-- Roles de usuarios
INSERT IGNORE INTO roles (nombre, descripcion) VALUES
('estudiante', 'Estudiante que desarrolla el proyecto de tÃ­tulo'),
('profesor', 'Profesor que guÃ­a o revisa proyectos de tÃ­tulo'),
('admin', 'Administrador del sistema'),
('superadmin', 'Administrador con permisos totales del sistema');

-- Estados de propuestas
INSERT IGNORE INTO estados_propuestas (nombre, descripcion) VALUES
('pendiente', 'Propuesta enviada, esperando asignaciÃ³n de profesor'),
('en_revision', 'Propuesta siendo revisada por profesor'),
('correcciones', 'Propuesta requiere correcciones del estudiante'),
('aprobada', 'Propuesta aprobada, se puede crear proyecto'),
('rechazada', 'Propuesta rechazada');

-- Estados de proyectos
INSERT IGNORE INTO estados_proyectos (nombre, descripcion) VALUES
('esperando_asignacion_profesores', 'Proyecto creado esperando asignaciÃ³n de los 3 roles de profesores'),
('en_desarrollo', 'Proyecto en fase de desarrollo'),
('avance_enviado', 'Avance enviado para revisiÃ³n'),
('avance_en_revision', 'Avance siendo revisado'),
('avance_con_comentarios', 'Avance con comentarios del profesor'),
('avance_aprobado', 'Avance aprobado'),
('pausado', 'Proyecto pausado temporalmente'),
('completado', 'Proyecto completado'),
('presentado', 'Proyecto presentado'),
('defendido', 'Proyecto defendido exitosamente'),
('retrasado', 'Proyecto con retraso en cronograma'),
('en_riesgo', 'Proyecto en riesgo de no completarse'),
('revision_urgente', 'Proyecto requiere revisiÃ³n urgente'),
('excelente_progreso', 'Proyecto con excelente progreso');

-- Roles de profesores en proyectos
INSERT IGNORE INTO roles_profesores (nombre, descripcion) VALUES
('Profesor Revisor', 'Profesor que evalÃºa la propuesta inicial y determina su viabilidad'),
('Profesor GuÃ­a', 'Profesor principal que guÃ­a el desarrollo completo del proyecto'),
('Profesor Co-GuÃ­a', 'Profesor co-guÃ­a que apoya en Ã¡reas especÃ­ficas del proyecto'),
('Profesor Informante', 'Profesor que evalÃºa el informe final y otorga calificaciÃ³n'),
('Profesor de Sala', 'Profesor de sala para la defensa oral del proyecto');

-- Usuarios de prueba (contraseÃ±a: 1234)
-- Hash generado con bcrypt, salt rounds = 10
INSERT IGNORE INTO usuarios (rut, nombre, email, password, rol_id, confirmado) VALUES
('12345678-9', 'Ana Estudiante', 'daniel.aguayo2001@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1),
('98765432-1', 'Carlos Profesor', 'sincorreo@sincorreo.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1),
('11111111-1', 'MarÃ­a Administradora', 'sincorreoadm@sincorreo.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 3, 1),
('12345678-0', 'admin supremo', 'admin.supremo@sincorreo.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 4, 1);

-- Crear Ã­ndices para mejorar rendimiento
-- Nota: Los errores de Ã­ndices duplicados serÃ¡n ignorados por el sistema de conexiÃ³n
CREATE INDEX idx_propuestas_estudiante ON propuestas(estudiante_rut);
CREATE INDEX idx_propuestas_estado ON propuestas(estado_id);
CREATE INDEX idx_propuestas_fecha_envio ON propuestas(fecha_envio);
CREATE INDEX idx_proyectos_estudiante ON proyectos(estudiante_rut);
CREATE INDEX idx_proyectos_estado ON proyectos(estado_id);

    usuario_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    dia_semana ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    INDEX idx_disponibilidad_usuario (usuario_rut, activo),
    INDEX idx_disponibilidad_dia (dia_semana, activo)
);

-- Tabla de Solicitudes de ReuniÃ³n
CREATE TABLE IF NOT EXISTS solicitudes_reunion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    fecha_propuesta DATE NOT NULL,
    hora_propuesta TIME NOT NULL,
    duracion_minutos INT DEFAULT 60,
    tipo_reunion ENUM('seguimiento', 'revision_avance', 'orientacion', 'defensa_parcial', 'otra') DEFAULT 'seguimiento',
    descripcion TEXT,
    estado ENUM('pendiente', 'aceptada_profesor', 'aceptada_estudiante', 'confirmada', 'rechazada', 'cancelada') DEFAULT 'pendiente',
    creado_por ENUM('profesor', 'estudiante', 'sistema') DEFAULT 'sistema',
    fecha_respuesta_profesor TIMESTAMP NULL,
    fecha_respuesta_estudiante TIMESTAMP NULL,
    comentarios_profesor TEXT,
    comentarios_estudiante TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut),
    INDEX idx_solicitud_proyecto (proyecto_id, estado),
    INDEX idx_solicitud_profesor (profesor_rut, estado),
    INDEX idx_solicitud_estudiante (estudiante_rut, estado),
    INDEX idx_solicitud_fecha (fecha_propuesta, hora_propuesta)
);

-- Tabla de Reuniones Confirmadas
CREATE TABLE IF NOT EXISTS reuniones_calendario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_reunion_id INT NULL, -- Ahora puede ser NULL para reuniones creadas directamente
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo_reunion ENUM('seguimiento', 'revision_avance', 'orientacion', 'defensa_parcial', 'otra') DEFAULT 'seguimiento',
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    lugar VARCHAR(100),
    modalidad ENUM('presencial', 'virtual', 'hibrida') DEFAULT 'presencial',
    link_reunion VARCHAR(500) NULL, -- Para reuniones virtuales
    estado ENUM('programada', 'realizada', 'cancelada') DEFAULT 'programada',
    motivo_cancelacion TEXT NULL,
    acta_reunion TEXT NULL, -- Resumen de la reuniÃ³n
    fecha_realizacion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_reunion_id) REFERENCES solicitudes_reunion(id),
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut),
    INDEX idx_reunion_fecha (fecha, hora_inicio),
    INDEX idx_reunion_profesor (profesor_rut, fecha),
    INDEX idx_reunion_estudiante (estudiante_rut, fecha),
    INDEX idx_reunion_proyecto (proyecto_id, estado),
    INDEX idx_reunion_estado (estado)
);

-- Tabla de Historial de Reuniones (para auditorÃ­a y dashboard)
CREATE TABLE IF NOT EXISTS historial_reuniones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reunion_id INT NULL, -- NULL si la solicitud fue rechazada
    solicitud_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    fecha_propuesta DATE NOT NULL,
    hora_propuesta TIME NOT NULL,
    tipo_reunion VARCHAR(50) NOT NULL,
    accion ENUM('solicitud_creada', 'aceptada_profesor', 'aceptada_estudiante', 'confirmada', 'rechazada', 'cancelada', 'realizada') NOT NULL,
    realizado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- RUT de quien realizÃ³ la acciÃ³n
    comentarios TEXT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reunion_id) REFERENCES reuniones_calendario(id) ON DELETE SET NULL,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes_reunion(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (realizado_por) REFERENCES usuarios(rut),
    INDEX idx_historial_reunion (reunion_id),
    INDEX idx_historial_proyecto (proyecto_id),
    INDEX idx_historial_fecha (fecha_accion),
    INDEX idx_historial_accion (accion)
);

-- Tabla de Bloqueos de Horarios (para vacaciones, feriados, etc.)
CREATE TABLE IF NOT EXISTS bloqueos_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    hora_inicio TIME NULL, -- NULL significa todo el dÃ­a
    hora_fin TIME NULL,
    motivo VARCHAR(255) NOT NULL,
    tipo ENUM('vacaciones', 'licencia', 'feriado', 'personal', 'academico') DEFAULT 'personal',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    INDEX idx_bloqueo_usuario_fecha (usuario_rut, fecha_inicio, fecha_fin)
);

-- Tabla de ConfiguraciÃ³n del Sistema de Matching
CREATE TABLE IF NOT EXISTS configuracion_matching (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(50) NOT NULL UNIQUE,
    valor VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo ENUM('entero', 'decimal', 'booleano', 'texto') DEFAULT 'texto',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar configuraciones por defecto para el sistema de matching
INSERT IGNORE INTO configuracion_matching (clave, valor, descripcion, tipo) VALUES
('duracion_reunion_defecto', '60', 'DuraciÃ³n por defecto de las reuniones en minutos', 'entero'),
('dias_anticipacion_minima', '1', 'DÃ­as mÃ­nimos de anticipaciÃ³n para agendar reuniones', 'entero'),
('dias_anticipacion_maxima', '30', 'DÃ­as mÃ¡ximos de anticipaciÃ³n para agendar reuniones', 'entero'),
('horario_inicio_jornada', '08:00', 'Hora de inicio de la jornada laboral', 'texto'),
('horario_fin_jornada', '18:00', 'Hora de fin de la jornada laboral', 'texto'),
('matching_automatico_activo', 'true', 'Si el matching automÃ¡tico estÃ¡ activo', 'booleano'),
('tiempo_respuesta_horas', '48', 'Tiempo mÃ¡ximo en horas para responder solicitudes', 'entero'),
('permitir_reuniones_sabado', 'false', 'Permitir agendar reuniones los sÃ¡bados', 'booleano'),
('permitir_reuniones_domingo', 'false', 'Permitir agendar reuniones los domingos', 'booleano');

-- ===== TABLAS ADICIONALES: COMISIÃ“N EVALUADORA, EXTENSIONES Y ACTAS =====

-- Tabla de ComisiÃ³n Evaluadora (Tribunal)
CREATE TABLE IF NOT EXISTS comision_evaluadora (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    rol_comision ENUM('presidente', 'secretario', 'vocal', 'suplente') NOT NULL,
    fecha_designacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_remocion TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    observaciones TEXT NULL,
    asignado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- RUT del admin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (asignado_por) REFERENCES usuarios(rut),
    UNIQUE KEY unique_comision_rol (proyecto_id, rol_comision, activo),
    INDEX idx_comision_proyecto (proyecto_id, activo),
    INDEX idx_comision_profesor (profesor_rut, activo)
);

-- Tabla de Solicitudes de ExtensiÃ³n/PrÃ³rroga
CREATE TABLE IF NOT EXISTS solicitudes_extension (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    fecha_importante_id INT NULL, -- NULL si es extensiÃ³n general del proyecto
    solicitante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    fecha_original DATE NOT NULL,
    fecha_solicitada DATE NOT NULL,
    dias_extension INT GENERATED ALWAYS AS (DATEDIFF(fecha_solicitada, fecha_original)) STORED,
    motivo TEXT NOT NULL,
    justificacion_detallada TEXT NOT NULL,
    documento_respaldo VARCHAR(255) NULL,
    estado ENUM('pendiente', 'en_revision', 'aprobada', 'rechazada') DEFAULT 'pendiente',
    aprobado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    fecha_revision TIMESTAMP NULL,
    fecha_resolucion TIMESTAMP NULL,
    comentarios_revision TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (fecha_importante_id) REFERENCES fechas(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitante_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (aprobado_por) REFERENCES usuarios(rut),
    INDEX idx_extension_proyecto (proyecto_id, estado),
    INDEX idx_extension_solicitante (solicitante_rut),
    INDEX idx_extension_estado (estado),
    INDEX idx_extension_fecha (created_at)
);

-- Tabla de Actas de ReuniÃ³n
CREATE TABLE IF NOT EXISTS actas_reunion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reunion_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    numero_acta VARCHAR(20) NOT NULL, -- Ej: ACT-001-2025
    fecha_reunion DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    lugar VARCHAR(255) NULL,
    -- Contenido del acta
    asistentes TEXT NOT NULL, -- JSON con lista de asistentes
    objetivo TEXT NOT NULL,
    temas_tratados TEXT NOT NULL,
    acuerdos TEXT NOT NULL,
    tareas_asignadas TEXT NULL,
    proximos_pasos TEXT NULL,
    observaciones TEXT NULL,
    -- Firmas digitales
    firma_estudiante BOOLEAN DEFAULT FALSE,
    fecha_firma_estudiante TIMESTAMP NULL,
    firma_profesor BOOLEAN DEFAULT FALSE,
    fecha_firma_profesor TIMESTAMP NULL,
    -- Archivo del acta (opcional, si se genera PDF)
    archivo_acta VARCHAR(255) NULL,
    -- Estado y auditorÃ­a
    estado ENUM('borrador', 'pendiente_firma', 'firmada', 'archivada') DEFAULT 'borrador',
    creado_por VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reunion_id) REFERENCES reuniones_calendario(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por) REFERENCES usuarios(rut),
    UNIQUE KEY unique_numero_acta (numero_acta),
    INDEX idx_acta_reunion (reunion_id),
    INDEX idx_acta_proyecto (proyecto_id, estado),
    INDEX idx_acta_fecha (fecha_reunion),
    INDEX idx_acta_estado (estado)
);

-- Tabla de Historial de Extensiones (para auditorÃ­a)
CREATE TABLE IF NOT EXISTS historial_extensiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    accion ENUM('solicitud_creada', 'en_revision', 'aprobada', 'rechazada', 'modificada') NOT NULL,
    realizado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    comentarios TEXT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes_extension(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (realizado_por) REFERENCES usuarios(rut),
    INDEX idx_historial_solicitud (solicitud_id),
    INDEX idx_historial_proyecto (proyecto_id),
    INDEX idx_historial_fecha (fecha_accion)
);

-- ============================================
-- ESTRUCTURA ACADÃ‰MICA: FACULTADES, DEPARTAMENTOS, CARRERAS
-- ============================================

-- Convertir tablas a UTF8MB4 para compatibilidad
SET FOREIGN_KEY_CHECKS = 0;
ALTER TABLE usuarios CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE propuestas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE proyectos CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE asignaciones_proyectos CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE asignaciones_propuestas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE estudiantes_propuestas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE estudiantes_proyectos CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE avances CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE hitos_cronograma CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE hitos_proyecto CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE fechas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE cronogramas_proyecto CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE notificaciones_proyecto CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ============================================
-- ESTRUCTURA ACADÃ‰MICA: FACULTADES, DEPARTAMENTOS, CARRERAS
-- ============================================

-- Agregar rol de Super Administrador
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Departamentos
CREATE TABLE IF NOT EXISTS departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facultad_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descripcion TEXT,
    jefe_departamento_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'RUT del profesor que es jefe de departamento',
    telefono VARCHAR(20),
    email VARCHAR(100),
    ubicacion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (facultad_id) REFERENCES facultades(id) ON DELETE RESTRICT,
    INDEX idx_facultad (facultad_id),
    INDEX idx_codigo (codigo),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Carreras
CREATE TABLE IF NOT EXISTS carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facultad_id INT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    titulo_profesional VARCHAR(255) NOT NULL COMMENT 'Ej: Ingeniero Civil en InformÃ¡tica',
    grado_academico VARCHAR(100) COMMENT 'Ej: Licenciado en Ciencias de la IngenierÃ­a',
    duracion_semestres INT NOT NULL DEFAULT 10,
    jefe_carrera_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'DEPRECATED: Usar tabla jefes_carreras',
    descripcion TEXT,
    modalidad ENUM('presencial', 'semipresencial', 'online') DEFAULT 'presencial',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (facultad_id) REFERENCES facultades(id) ON DELETE RESTRICT,
    INDEX idx_facultad (facultad_id),
    INDEX idx_codigo (codigo),
    INDEX idx_jefe_carrera (jefe_carrera_rut),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Jefes de Carrera (relaciÃ³n N:M - un profesor puede ser jefe de mÃºltiples carreras)
CREATE TABLE IF NOT EXISTS jefes_carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    carrera_id INT NOT NULL,
    fecha_inicio DATE NOT NULL DEFAULT (CURRENT_DATE),
    fecha_fin DATE NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE CASCADE,
    UNIQUE KEY unique_jefe_carrera (profesor_rut, carrera_id),
    INDEX idx_profesor (profesor_rut, activo),
    INDEX idx_carrera (carrera_id, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Profesores-Departamentos (relaciÃ³n N:M)
CREATE TABLE IF NOT EXISTS profesores_departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    departamento_id INT NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE COMMENT 'Indica si es su departamento principal',
    fecha_ingreso DATE,
    fecha_salida DATE NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_profesor_departamento (profesor_rut, departamento_id),
    INDEX idx_profesor (profesor_rut),
    INDEX idx_departamento (departamento_id),
    INDEX idx_principal (es_principal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Estudiantes-Carreras (relaciÃ³n N:M)
CREATE TABLE IF NOT EXISTS estudiantes_carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    carrera_id INT NOT NULL,
    ano_ingreso INT NOT NULL,
    semestre_actual INT DEFAULT 1,
    estado_estudiante ENUM('regular', 'congelado', 'egresado', 'retirado', 'titulado') DEFAULT 'regular',
    fecha_ingreso DATE NOT NULL,
    fecha_egreso DATE NULL,
    fecha_titulacion DATE NULL,
    promedio_acumulado DECIMAL(3,2) NULL,
    creditos_aprobados INT DEFAULT 0,
    es_carrera_principal BOOLEAN DEFAULT TRUE COMMENT 'Para estudiantes con doble titulaciÃ³n',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_estudiante_carrera (estudiante_rut, carrera_id),
    INDEX idx_estudiante (estudiante_rut),
    INDEX idx_carrera (carrera_id),
    INDEX idx_ano_ingreso (ano_ingreso),
    INDEX idx_estado (estado_estudiante)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Departamentos-Carreras (relaciÃ³n N:M directa)
CREATE TABLE IF NOT EXISTS departamentos_carreras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    departamento_id INT NOT NULL,
    carrera_id INT NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE COMMENT 'Indica si es el departamento principal de la carrera',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE CASCADE,
    UNIQUE KEY unique_departamento_carrera (departamento_id, carrera_id),
    INDEX idx_departamento (departamento_id, activo),
    INDEX idx_carrera (carrera_id, activo),
    INDEX idx_principal (es_principal, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar foreign keys condicionales
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'departamentos' AND CONSTRAINT_NAME = 'fk_departamentos_jefe');
SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE departamentos ADD CONSTRAINT fk_departamentos_jefe FOREIGN KEY (jefe_departamento_rut) REFERENCES usuarios(rut) ON DELETE SET NULL',
    'SELECT ''FK fk_departamentos_jefe ya existe'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'carreras' AND CONSTRAINT_NAME = 'fk_carreras_jefe');
SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE carreras ADD CONSTRAINT fk_carreras_jefe FOREIGN KEY (jefe_carrera_rut) REFERENCES usuarios(rut) ON DELETE SET NULL',
    'SELECT ''FK fk_carreras_jefe ya existe'' AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrar datos existentes de jefe_carrera_rut a la nueva tabla jefes_carreras
INSERT INTO jefes_carreras (profesor_rut, carrera_id, activo)
SELECT jefe_carrera_rut, id, TRUE
FROM carreras
WHERE jefe_carrera_rut IS NOT NULL
ON DUPLICATE KEY UPDATE activo = TRUE;

-- Limpiar datos anteriores para evitar conflictos de FK (orden: de hijo a padre)
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM departamentos_carreras;
DELETE FROM carreras;
DELETE FROM departamentos;
DELETE FROM facultades;
SET FOREIGN_KEY_CHECKS = 1;

-- Reiniciar auto_increment
ALTER TABLE facultades AUTO_INCREMENT = 1;
ALTER TABLE departamentos AUTO_INCREMENT = 1;
ALTER TABLE carreras AUTO_INCREMENT = 1;


-- Vistas Ãºtiles
CREATE OR REPLACE VIEW vista_profesores_departamentos AS
SELECT 
    u.rut,
    u.nombre AS profesor_nombre,
    u.email,
    d.nombre AS departamento_nombre,
    d.codigo AS departamento_codigo,
-- Vistas Ãºtiles
INNER JOIN jefes_carreras jc ON u.rut = jc.profesor_rut
INNER JOIN carreras c ON jc.carrera_id = c.id
INNER JOIN facultades f ON c.facultad_id = f.id
WHERE u.rol_id = 3 AND jc.activo = TRUE;

CREATE OR REPLACE VIEW vista_departamentos_por_carrera AS
SELECT 
    c.id AS carrera_id,
    c.nombre AS carrera_nombre,
    c.codigo AS carrera_codigo,
    d.id AS departamento_id,
    d.nombre AS departamento_nombre,
    d.codigo AS departamento_codigo,
    dc.es_principal,
    f.nombre AS facultad_nombre
FROM departamentos_carreras dc
INNER JOIN carreras c ON dc.carrera_id = c.id
INNER JOIN departamentos d ON dc.departamento_id = d.id
INNER JOIN facultades f ON d.facultad_id = f.id
WHERE dc.activo = TRUE
ORDER BY c.nombre, dc.es_principal DESC, d.nombre;

CREATE OR REPLACE VIEW vista_carreras_por_departamento AS
SELECT 
    d.id AS departamento_id,
    d.nombre AS departamento_nombre,
    d.codigo AS departamento_codigo,
    c.id AS carrera_id,
    c.nombre AS carrera_nombre,
    c.codigo AS carrera_codigo,
    dc.es_principal,
    f.nombre AS facultad_nombre
FROM departamentos_carreras dc
INNER JOIN departamentos d ON dc.departamento_id = d.id
INNER JOIN carreras c ON dc.carrera_id = c.id
INNER JOIN facultades f ON c.facultad_id = f.id
WHERE dc.activo = TRUE
ORDER BY d.nombre, dc.es_principal DESC, c.nombre;

-- ===== BASE DE DATOS CREADA EXITOSAMENTE =====
SELECT 'Base de datos AcTitUBB creada exitosamente con estructura acadÃ©mica completa' as status;

ORDER BY d.nombre, dc.es_principal DESC, c.nombre;