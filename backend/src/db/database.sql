CREATE DATABASE IF NOT EXISTS actitubb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
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
    debe_cambiar_password BOOLEAN DEFAULT FALSE COMMENT 'Indica si el usuario debe cambiar su contraseña en el próximo login (contraseña temporal)',
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
    fecha_envio DATE NOT NULL,
    fecha_revision TIMESTAMP NULL,
    fecha_aprobacion DATE NULL,
    proyecto_id INT NULL, -- Se llena cuando se aprueba y se crea el proyecto
    archivo VARCHAR(255),
    nombre_archivo_original VARCHAR(255),
    
    -- NUEVOS CAMPOS MEJORADOS
    modalidad ENUM('desarrollo_software', 'investigacion', 'practica' ) NOT NULL,
    numero_estudiantes INT NOT NULL DEFAULT 1 CHECK (numero_estudiantes in (1, 2, 3)),
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

-- Tabla para vincular múltiples estudiantes a una propuesta
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

-- Tabla de Asignaciones de Profesores a Propuestas (Revisión inicial)
-- Permite asociar múltiples profesores revisores a una propuesta antes de convertirse en proyecto
CREATE TABLE IF NOT EXISTS asignaciones_propuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propuesta_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    rol_revision ENUM('revisor_principal', 'revisor_secundario', 'informante') DEFAULT 'revisor_principal',
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP NULL,
    estado_revision ENUM('pendiente', 'en_revision', 'revisado') DEFAULT 'pendiente',
    decision ENUM('aprobar', 'rechazar', 'solicitar_correcciones') NULL COMMENT 'Decisión del profesor sobre la propuesta',
    comentarios_revision TEXT NULL COMMENT 'Comentarios detallados del profesor sobre la propuesta',
    activo BOOLEAN DEFAULT TRUE,
    asignado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del admin que realizó la asignación',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (propuesta_id) REFERENCES propuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (asignado_por) REFERENCES usuarios(rut),
    UNIQUE KEY unique_asignacion_activa (propuesta_id, profesor_rut, activo),
    INDEX idx_propuesta_estado (propuesta_id, estado_revision),
    INDEX idx_profesor_propuestas (profesor_rut, estado_revision)
);

-- Tabla de Historial de Revisiones de Propuestas (para auditoría)
CREATE TABLE IF NOT EXISTS historial_revisiones_propuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_id INT NOT NULL,
    propuesta_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    accion ENUM('asignado', 'revision_iniciada', 'comentario_agregado', 'decision_tomada', 'desasignado') NOT NULL,
    decision ENUM('aprobar', 'rechazar', 'solicitar_correcciones') NULL,
    comentarios TEXT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    realizado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'RUT de quien realizó la acción (puede ser el mismo profesor)',
    FOREIGN KEY (asignacion_id) REFERENCES asignaciones_propuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (propuesta_id) REFERENCES propuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (realizado_por) REFERENCES usuarios(rut),
    INDEX idx_historial_propuesta (propuesta_id),
    INDEX idx_historial_profesor (profesor_rut),
    INDEX idx_historial_fecha (fecha_accion),
    INDEX idx_historial_accion (accion)
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
    
    -- CAMPOS ROBUSTOS PARA GESTIÓN COMPLETA
    -- Información extendida del proyecto
    objetivo_general TEXT,
    objetivos_especificos TEXT,
    metodologia TEXT,
    recursos_requeridos TEXT,
    bibliografia TEXT,
    
    -- Gestión de progreso
    porcentaje_avance DECIMAL(5,2) DEFAULT 0.00 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    
    -- Gestión de estado detallado
    estado_detallado ENUM('inicializacion', 'planificacion', 'desarrollo_fase1', 'desarrollo_fase2', 'testing', 'documentacion', 'revision_final', 'preparacion_defensa', 'defendido', 'cerrado') DEFAULT 'inicializacion',
    prioridad ENUM('baja', 'media', 'alta', 'critica') DEFAULT 'media',
    riesgo_nivel ENUM('bajo', 'medio', 'alto') DEFAULT 'medio',
    
    -- Gestión de archivos y entregas
    documento_proyecto VARCHAR(255) NULL, -- Documento principal del proyecto
    documento_final VARCHAR(255) NULL, -- Documento final/memoria
    presentacion VARCHAR(255) NULL, -- Archivo de presentación
    codigo_fuente VARCHAR(255) NULL, -- Link o archivo del código fuente
    
    -- Observaciones y seguimiento
    observaciones_profesor TEXT NULL,
    observaciones_estudiante TEXT NULL,
    ultimo_avance_fecha DATE NULL,
    proximo_hito_fecha DATE NULL,
    tiempo_dedicado_horas INT DEFAULT 0,
    
    -- Control de abandono según reglamento
    ultima_actividad_fecha DATE NULL COMMENT 'Última fecha de actividad real (avance, reunión, entrega)',
    umbral_dias_riesgo INT DEFAULT 30 COMMENT 'Días sin actividad para marcar como en_riesgo',
    umbral_dias_abandono INT DEFAULT 60 COMMENT 'Días sin actividad para considerar abandono',
    alerta_inactividad_enviada BOOLEAN DEFAULT FALSE COMMENT 'Si ya se envió alerta de inactividad',
    fecha_alerta_inactividad TIMESTAMP NULL COMMENT 'Fecha en que se envió la última alerta',
    
    -- Configuración de modalidad (heredada de propuesta)
    modalidad ENUM('desarrollo_software', 'investigacion', 'practica') NOT NULL,
    complejidad ENUM('baja', 'media', 'alta') NOT NULL,
    duracion_semestres INT NOT NULL DEFAULT 1,
    
    -- Control de versiones y auditoría
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
-- MOVIDA AQUÍ para respetar el orden de dependencias
CREATE TABLE IF NOT EXISTS asignaciones_proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    rol_profesor_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_desasignacion TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    observaciones TEXT NULL,
    asignado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- RUT del admin que hizo la asignación
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (rol_profesor_id) REFERENCES roles_profesores(id),
    FOREIGN KEY (asignado_por) REFERENCES usuarios(rut),
    INDEX idx_proyecto_activo (proyecto_id, activo),
    INDEX idx_profesor_activo (profesor_rut, activo),
    INDEX idx_rol_activo (rol_profesor_id, activo)
);

-- Índice único parcial: solo permite una asignación activa por proyecto y rol
-- Esto previene duplicados cuando activo=TRUE, pero permite múltiples registros inactivos (historial)
CREATE UNIQUE INDEX unique_asignacion_activa ON asignaciones_proyectos (proyecto_id, rol_profesor_id) 
WHERE activo = TRUE;

-- Tabla de Historial de Asignaciones (para auditoría)
CREATE TABLE IF NOT EXISTS historial_asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    rol_profesor_id INT NOT NULL,
    accion ENUM('asignado', 'desasignado', 'modificado') NOT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    realizado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- RUT del admin que realizó la acción
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

-- Tabla para vincular múltiples estudiantes a un proyecto
-- MOVIDA AQUÍ para respetar el orden de dependencias
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
    
    -- Plazo del Informante (15 días hábiles según reglamento)
    fecha_entrega_estudiante DATE NULL COMMENT 'Fecha real en que el estudiante entregó (para entrega_final)',
    fecha_limite_informante DATE NULL COMMENT 'Fecha límite para que el profesor Informante evalúe (entrega + 15 días hábiles)',
    dias_habiles_informante INT DEFAULT 15 COMMENT 'Días hábiles que tiene el informante para evaluar',
    informante_notificado BOOLEAN DEFAULT FALSE COMMENT 'Si se notificó al informante sobre la entrega',
    fecha_notificacion_informante TIMESTAMP NULL COMMENT 'Fecha en que se notificó al informante',
    
    -- Archivos y entregables asociados al hito
    archivo_entregable VARCHAR(255) NULL,
    comentarios_estudiante TEXT NULL,
    comentarios_profesor TEXT NULL,
    calificacion DECIMAL(3,1) NULL CHECK (calificacion >= 1.0 AND calificacion <= 7.0),
    
    -- Control de dependencias
    hito_predecesor_id INT NULL,
    es_critico BOOLEAN DEFAULT FALSE,
    
    -- Auditoría y seguimiento
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
-- Combina todos los campos necesarios para ambos propósitos

CREATE TABLE IF NOT EXISTS fechas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Información básica
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Rango de fechas (período)
    fecha_inicio DATE NULL COMMENT 'Fecha de inicio del período (opcional)',
    hora_inicio TIME DEFAULT '00:00:00' COMMENT 'Hora de inicio del período',
    fecha DATE NOT NULL COMMENT 'Fecha fin/límite del período (obligatorio)',
    hora_limite TIME DEFAULT '23:59:59' COMMENT 'Hora límite para entregas (por defecto fin del día)',
    
    -- Tipo y categorización
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
    
    -- Control de períodos (para fechas importantes)
    habilitada BOOLEAN DEFAULT TRUE COMMENT 'Controla si el período está activo para recibir entregas',
    permite_extension BOOLEAN DEFAULT TRUE COMMENT 'Si permite solicitar extensión después de la fecha límite',
    requiere_entrega BOOLEAN DEFAULT FALSE COMMENT 'Si requiere entrega de archivos/documentos',
    
    -- Estado de completitud
    completada BOOLEAN DEFAULT FALSE,
    fecha_realizada DATE NULL COMMENT 'Fecha en que se completó el evento',
    notas TEXT,
    
    -- Relaciones
    proyecto_id INT NULL COMMENT 'NULL para fechas globales, ID del proyecto para fechas específicas',
    creado_por_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del que creó la fecha (admin o profesor)',
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'RUT del profesor (para fechas específicas profesor-estudiante)',
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'RUT del estudiante (para fechas específicas)',
    
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut),
    
    -- Índices para mejorar performance
    INDEX idx_fecha (fecha),
    INDEX idx_tipo_fecha (tipo_fecha),
    INDEX idx_es_global (es_global),
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_activa (activa),
    INDEX idx_habilitada (habilitada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Tabla de Cronogramas de Proyecto (acordados entre guía y estudiante)
CREATE TABLE IF NOT EXISTS cronogramas_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    nombre_cronograma VARCHAR(255) NOT NULL DEFAULT 'Cronograma Principal',
    descripcion TEXT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_por_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- Profesor guía que creó el cronograma
    aprobado_por_estudiante BOOLEAN DEFAULT FALSE,
    fecha_aprobacion_estudiante TIMESTAMP NULL,
    
    -- Configuración de alertas
    alertas_activas BOOLEAN DEFAULT TRUE,
    dias_alerta_previa INT DEFAULT 3, -- Días antes de enviar alerta
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (creado_por_rut) REFERENCES usuarios(rut),
    
    INDEX idx_proyecto_activo (proyecto_id, activo),
    INDEX idx_fechas_cronograma (fecha_inicio, fecha_fin_estimada)
);

-- Tabla de Hitos del Cronograma (entregas específicas)
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
    
    -- Archivos y retroalimentación
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

-- Tabla de Notificaciones y Alertas Automáticas
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
    
    -- Configuración de envío
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

-- Tabla de Configuración de Alertas por Proyecto
CREATE TABLE IF NOT EXISTS configuracion_alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- Profesor que configura las alertas
    
    -- Configuración de días de alerta
    dias_alerta_entregas INT DEFAULT 3,
    dias_alerta_reuniones INT DEFAULT 1,
    dias_alerta_defensas INT DEFAULT 7,
    
    -- Tipos de alerta activos
    alertas_entregas BOOLEAN DEFAULT TRUE,
    alertas_reuniones BOOLEAN DEFAULT TRUE,
    alertas_retrasos BOOLEAN DEFAULT TRUE,
    alertas_hitos BOOLEAN DEFAULT TRUE,
    
    -- Configuración de envío
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

-- Crear indices para mejorar rendimiento
CREATE INDEX idx_propuestas_estudiante ON propuestas(estudiante_rut);
CREATE INDEX idx_propuestas_estado ON propuestas(estado_id);
CREATE INDEX idx_propuestas_fecha_envio ON propuestas(fecha_envio);
CREATE INDEX idx_proyectos_estudiante ON proyectos(estudiante_rut);
CREATE INDEX idx_proyectos_estado ON proyectos(estado_id);

-- Tabla de Disponibilidad de Horarios
CREATE TABLE IF NOT EXISTS disponibilidad_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
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

-- Tabla de Solicitudes de Reunión
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
    acta_reunion TEXT NULL, -- Resumen de la reunión
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

-- Tabla de Historial de Reuniones (para auditoría y dashboard)
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
    realizado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL, -- RUT de quien realizó la acción
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

-- Tabla de Alertas de Abandono/Inactividad (Reglamento)
CREATE TABLE IF NOT EXISTS alertas_abandono (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    tipo_alerta ENUM('inactividad_detectada', 'riesgo_abandono', 'abandono_potencial', 'reactivacion') NOT NULL,
    dias_sin_actividad INT NOT NULL COMMENT 'Días sin actividad al momento de la alerta',
    fecha_ultima_actividad DATE NULL COMMENT 'Fecha de la última actividad registrada',
    nivel_severidad ENUM('leve', 'moderado', 'grave', 'critico') NOT NULL,
    mensaje TEXT NOT NULL COMMENT 'Mensaje de la alerta',
    accion_sugerida TEXT NULL COMMENT 'Acción recomendada según reglamento',
    notificados TEXT NULL COMMENT 'RUTs de usuarios notificados (JSON array)',
    fecha_alerta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    alerta_atendida BOOLEAN DEFAULT FALSE,
    fecha_atencion TIMESTAMP NULL,
    atendida_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    observaciones_atencion TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (atendida_por) REFERENCES usuarios(rut),
    INDEX idx_alerta_proyecto (proyecto_id, fecha_alerta),
    INDEX idx_alerta_tipo (tipo_alerta, nivel_severidad),
    INDEX idx_alerta_pendiente (alerta_atendida, fecha_alerta)
);

-- Tabla de Bloqueos de Horarios (para vacaciones, feriados, etc.)
CREATE TABLE IF NOT EXISTS bloqueos_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    hora_inicio TIME NULL, -- NULL significa todo el día
    hora_fin TIME NULL,
    motivo VARCHAR(255) NOT NULL,
    tipo ENUM('vacaciones', 'licencia', 'feriado', 'personal', 'academico') DEFAULT 'personal',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    INDEX idx_bloqueo_usuario_fecha (usuario_rut, fecha_inicio, fecha_fin)
);

-- Tabla de Días Feriados (para cálculo de días hábiles)
CREATE TABLE IF NOT EXISTS dias_feriados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL COMMENT 'Nombre del feriado',
    tipo ENUM('nacional', 'regional', 'institucional') DEFAULT 'nacional',
    es_inamovible BOOLEAN DEFAULT TRUE COMMENT 'Si el feriado no se puede mover (ej: 25 de diciembre)',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha_feriado (fecha, activo),
    INDEX idx_tipo_feriado (tipo, activo)
);

-- Tabla de Configuración del Sistema de Matching
CREATE TABLE IF NOT EXISTS configuracion_matching (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(50) NOT NULL UNIQUE,
    valor VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo ENUM('entero', 'decimal', 'booleano', 'texto') DEFAULT 'texto',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar configuraciones por defecto para el sistema de matching
-- ===== TABLAS ADICIONALES: COMISIÓN EVALUADORA, EXTENSIONES Y ACTAS =====

-- Tabla de Comisión Evaluadora (Tribunal)
-- Puede actuar tanto en fase de propuesta (evaluación inicial) como en fase de proyecto (defensa final)
CREATE TABLE IF NOT EXISTS comision_evaluadora (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propuesta_id INT NULL COMMENT 'ID de la propuesta (para evaluación inicial)',
    proyecto_id INT NULL COMMENT 'ID del proyecto (para evaluación final/defensa)',
    fase_evaluacion ENUM('propuesta', 'proyecto', 'defensa_final') NOT NULL COMMENT 'Fase en la que actúa la comisión',
    profesor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    rol_comision ENUM('presidente', 'secretario', 'vocal', 'informante', 'suplente') NOT NULL,
    fecha_designacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_remocion TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    observaciones TEXT NULL,
    voto ENUM('aprobar', 'rechazar', 'aprobar_con_modificaciones') NULL COMMENT 'Voto del miembro de la comisión',
    comentarios_evaluacion TEXT NULL COMMENT 'Comentarios de evaluación del profesor',
    asignado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del admin que realizó la asignación',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (propuesta_id) REFERENCES propuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (asignado_por) REFERENCES usuarios(rut),
    UNIQUE KEY unique_comision_propuesta (propuesta_id, rol_comision, activo),
    UNIQUE KEY unique_comision_proyecto (proyecto_id, rol_comision, activo),
    CHECK (propuesta_id IS NOT NULL OR proyecto_id IS NOT NULL),
    INDEX idx_comision_propuesta (propuesta_id, activo),
    INDEX idx_comision_proyecto (proyecto_id, activo),
    INDEX idx_comision_profesor (profesor_rut, activo),
    INDEX idx_comision_fase (fase_evaluacion, activo)
);

-- Tabla de Solicitudes de Extensión/Prórroga
CREATE TABLE IF NOT EXISTS solicitudes_extension (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    fecha_importante_id INT NULL, -- NULL si es extensión general del proyecto
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

-- Tabla de Actas de Reunión
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
    -- Estado y auditoría
    estado ENUM('borrador', 'pendiente_firma', 'firmada', 'archivada') DEFAULT 'borrador',
    creado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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

-- Tabla de Historial de Extensiones (para auditoría)
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
-- ESTRUCTURA ACAD�MICA: FACULTADES, DEPARTAMENTOS, CARRERAS
-- ============================================

-- Tabla de Facultades
CREATE TABLE IF NOT EXISTS facultades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    descripcion TEXT,
    decano_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'RUT del profesor que es decano',
    telefono VARCHAR(20),
    email VARCHAR(100),
    ubicacion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
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
    titulo_profesional VARCHAR(255) NOT NULL COMMENT 'Ej: Ingeniero Civil en Informática',
    grado_academico VARCHAR(100) COMMENT 'Ej: Licenciado en Ciencias de la Ingeniería',
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

-- Tabla de Jefes de Carrera (relación N:M - un profesor puede ser jefe de múltiples carreras)
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

-- Tabla de Profesores-Departamentos (relación N:M)
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

-- Tabla de Estudiantes-Carreras (relación N:M)
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
    es_carrera_principal BOOLEAN DEFAULT TRUE COMMENT 'Para estudiantes con doble titulación',
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

-- Tabla de Departamentos-Carreras (relación N:M directa)
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




-- Vistas útiles
-- Vistas utiles para consultas frecuentes
CREATE OR REPLACE VIEW vista_profesores_departamentos AS
SELECT 
    u.rut,
    u.nombre AS profesor_nombre,
    u.email,
    d.nombre AS departamento_nombre,
    d.codigo AS departamento_codigo,
    pd.es_principal,
    f.nombre AS facultad_nombre
FROM profesores_departamentos pd
INNER JOIN usuarios u ON pd.profesor_rut = u.rut
INNER JOIN departamentos d ON pd.departamento_id = d.id
INNER JOIN facultades f ON d.facultad_id = f.id
WHERE u.rol_id = 2 AND pd.activo = TRUE;

CREATE OR REPLACE VIEW vista_jefes_carreras AS
SELECT 
    u.rut,
    u.nombre AS profesor_nombre,
    u.email,
    c.nombre AS carrera_nombre,
    c.codigo AS carrera_codigo,
    f.nombre AS facultad_nombre,
    jc.fecha_inicio,
    jc.fecha_fin
FROM usuarios u
INNER JOIN jefes_carreras jc ON u.rut = jc.profesor_rut
INNER JOIN carreras c ON jc.carrera_id = c.id
INNER JOIN facultades f ON c.facultad_id = f.id
WHERE u.rol_id = 2 AND jc.activo = TRUE;

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

-- Vista de Proyectos en Riesgo por Inactividad (Reglamento)
CREATE OR REPLACE VIEW vista_proyectos_riesgo_abandono AS
SELECT 
    p.id AS proyecto_id,
    p.titulo,
    p.estudiante_rut,
    u.nombre AS estudiante_nombre,
    u.email AS estudiante_email,
    p.estado_id,
    ep.nombre AS estado_nombre,
    p.ultima_actividad_fecha,
    CASE 
        WHEN p.ultima_actividad_fecha IS NOT NULL 
        THEN DATEDIFF(CURRENT_DATE, p.ultima_actividad_fecha)
        ELSE NULL 
    END AS dias_sin_actividad,
    p.umbral_dias_riesgo,
    p.umbral_dias_abandono,
    CASE 
        WHEN p.ultima_actividad_fecha IS NULL THEN 'sin_actividad_registrada'
        WHEN DATEDIFF(CURRENT_DATE, p.ultima_actividad_fecha) >= p.umbral_dias_abandono THEN 'abandono_potencial'
        WHEN DATEDIFF(CURRENT_DATE, p.ultima_actividad_fecha) >= p.umbral_dias_riesgo THEN 'en_riesgo'
        WHEN DATEDIFF(CURRENT_DATE, p.ultima_actividad_fecha) >= (p.umbral_dias_riesgo * 0.7) THEN 'alerta_previa'
        ELSE 'activo'
    END AS nivel_riesgo,
    p.alerta_inactividad_enviada,
    p.fecha_alerta_inactividad,
    p.fecha_inicio,
    DATEDIFF(CURRENT_DATE, p.fecha_inicio) AS dias_desde_inicio,
    (SELECT COUNT(*) FROM avances WHERE proyecto_id = p.id) AS total_avances,
    (SELECT MAX(fecha_envio) FROM avances WHERE proyecto_id = p.id) AS ultimo_avance,
    (SELECT COUNT(*) FROM reuniones_calendario WHERE proyecto_id = p.id AND estado = 'realizada') AS reuniones_realizadas
FROM proyectos p
INNER JOIN usuarios u ON p.estudiante_rut = u.rut
INNER JOIN estados_proyectos ep ON p.estado_id = ep.id
WHERE p.activo = TRUE
    AND ep.nombre NOT IN ('completado', 'defendido', 'cerrado')
    AND (
        p.ultima_actividad_fecha IS NULL 
        OR DATEDIFF(CURRENT_DATE, p.ultima_actividad_fecha) >= (p.umbral_dias_riesgo * 0.7)
    )
ORDER BY CASE WHEN p.ultima_actividad_fecha IS NULL THEN 0 ELSE 1 END, dias_sin_actividad DESC;

-- Vista de Entregas Finales Pendientes de Revisión por Informante
CREATE OR REPLACE VIEW vista_informante_pendientes AS
SELECT 
    h.id AS hito_id,
    h.proyecto_id,
    p.titulo AS proyecto_titulo,
    p.estudiante_rut,
    u.nombre AS estudiante_nombre,
    h.fecha_entrega_estudiante,
    h.fecha_limite_informante,
    DATEDIFF(h.fecha_limite_informante, CURRENT_DATE) AS dias_restantes,
    CASE 
        WHEN h.fecha_limite_informante < CURRENT_DATE THEN 'vencido'
        WHEN DATEDIFF(h.fecha_limite_informante, CURRENT_DATE) <= 3 THEN 'urgente'
        WHEN DATEDIFF(h.fecha_limite_informante, CURRENT_DATE) <= 7 THEN 'proximo'
        ELSE 'en_plazo'
    END AS estado_plazo,
    h.informante_notificado,
    h.fecha_notificacion_informante,
    ap.profesor_rut AS informante_rut,
    ui.nombre AS informante_nombre,
    ui.email AS informante_email,
    h.comentarios_profesor,
    h.estado AS estado_hito
FROM hitos_proyecto h
INNER JOIN proyectos p ON h.proyecto_id = p.id
INNER JOIN usuarios u ON p.estudiante_rut = u.rut
LEFT JOIN asignaciones_proyectos ap ON ap.proyecto_id = p.id 
    AND ap.rol_profesor_id = (SELECT id FROM roles_profesores WHERE nombre = 'Profesor Informante')
    AND ap.activo = TRUE
LEFT JOIN usuarios ui ON ap.profesor_rut = ui.rut
WHERE h.tipo_hito = 'entrega_final'
    AND h.fecha_entrega_estudiante IS NOT NULL
    AND h.estado IN ('completado', 'en_progreso')
    AND (h.fecha_completado IS NULL OR h.comentarios_profesor IS NULL)
ORDER BY h.fecha_limite_informante ASC;

-- ============================================
-- INSERCIÓN DE DATOS INICIALES
-- ============================================

-- Roles de usuarios (con IDs fijos)
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'estudiante', 'Estudiante que desarrolla el proyecto de t�tulo'),
(2, 'profesor', 'Profesor que gu�a o revisa proyectos de t�tulo'),
(3, 'admin', 'Administrador del sistema'),
(4, 'superadmin', 'Administrador con permisos totales del sistema')
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre), 
    descripcion = VALUES(descripcion);

-- Estados de propuestas
INSERT IGNORE INTO estados_propuestas (nombre, descripcion) VALUES
('pendiente', 'Propuesta enviada, esperando asignación de profesor'),
('en_revision', 'Propuesta siendo revisada por profesor'),
('correcciones', 'Propuesta requiere correcciones del estudiante'),
('aprobada', 'Propuesta aprobada, se puede crear proyecto'),
('rechazada', 'Propuesta rechazada');

-- Estados de proyectos
INSERT IGNORE INTO estados_proyectos (nombre, descripcion) VALUES
('esperando_asignacion_profesores', 'Proyecto creado esperando asignación de los 3 roles de profesores'),
('en_desarrollo', 'Proyecto en fase de desarrollo'),
('avance_enviado', 'Avance enviado para revisión'),
('avance_en_revision', 'Avance siendo revisado'),
('avance_con_comentarios', 'Avance con comentarios del profesor'),
('avance_aprobado', 'Avance aprobado'),
('pausado', 'Proyecto pausado temporalmente'),
('completado', 'Proyecto completado'),
('presentado', 'Proyecto presentado'),
('defendido', 'Proyecto defendido exitosamente'),
('retrasado', 'Proyecto con retraso en cronograma'),
('en_riesgo', 'Proyecto en riesgo de no completarse'),
('revision_urgente', 'Proyecto requiere revisión urgente'),
('excelente_progreso', 'Proyecto con excelente progreso');

-- Roles de profesores en proyectos
INSERT IGNORE INTO roles_profesores (nombre, descripcion) VALUES
('Profesor Revisor', 'Profesor que evalúa la propuesta inicial y determina su viabilidad'),
('Profesor Guía', 'Profesor principal que guía el desarrollo completo del proyecto'),
('Profesor Co-Guía', 'Profesor co-guía que apoya en áreas específicas del proyecto'),
('Profesor Informante', 'Profesor que evalúa el informe final y otorga calificación'),
('Profesor de Sala', 'Profesor de sala para la defensa oral del proyecto');

-- Usuarios b�sicos del sistema (contrase�a: 1234)
-- Hash generado con bcrypt, salt rounds = 10
INSERT INTO usuarios (rut, nombre, email, password, rol_id, confirmado) VALUES
('11111111-1', 'Usuario Estudiante', 'estudiante@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1),
('22222222-2', 'Usuario Profesor', 'profesor@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1),
('33333333-3', 'Usuario Admin', 'admin@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 3, 1),
('44444444-4', 'Usuario SuperAdmin', 'superadmin@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 4, 1)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    email = VALUES(email),
    password = VALUES(password),
    rol_id = VALUES(rol_id),
    confirmado = VALUES(confirmado);

-- Asignar usuarios b�sicos a carreras/departamentos (solo si existen las tablas)
-- Nota: Esto se ejecutar� despu�s de crear facultades, departamentos y carreras con datos-prueba.sql
-- Estudiante b�sico en Ingenier�a Civil en Inform�tica (carrera_id: 1)
INSERT IGNORE INTO estudiantes_carreras (estudiante_rut, carrera_id, ano_ingreso, semestre_actual, estado_estudiante, fecha_ingreso, es_carrera_principal)
SELECT '11111111-1', 1, 2021, 7, 'regular', '2021-03-01', TRUE
FROM dual
WHERE EXISTS (SELECT 1 FROM carreras WHERE id = 1);

-- Profesor b�sico en Departamento de Ingenier�a en Sistemas (departamento_id: 1)
INSERT IGNORE INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso)
SELECT '22222222-2', 1, TRUE, '2020-03-01'
FROM dual
WHERE EXISTS (SELECT 1 FROM departamentos WHERE id = 1);

-- Admin como jefe de carrera de Ingenier�a Civil en Inform�tica y Ejecuci�n (carreras 1 y 2)
INSERT IGNORE INTO jefes_carreras (profesor_rut, carrera_id, fecha_inicio, activo)
SELECT '33333333-3', 1, '2023-01-01', TRUE
FROM dual
WHERE EXISTS (SELECT 1 FROM carreras WHERE id = 1);

INSERT IGNORE INTO jefes_carreras (profesor_rut, carrera_id, fecha_inicio, activo)
SELECT '33333333-3', 2, '2023-01-01', TRUE
FROM dual
WHERE EXISTS (SELECT 1 FROM carreras WHERE id = 2);

-- Admin en departamento
INSERT IGNORE INTO profesores_departamentos (profesor_rut, departamento_id, es_principal, fecha_ingreso)
SELECT '33333333-3', 1, TRUE, '2023-01-01'
FROM dual
WHERE EXISTS (SELECT 1 FROM departamentos WHERE id = 1);

-- Configuraciones del sistema de matching
INSERT IGNORE INTO configuracion_matching (clave, valor, descripcion, tipo) VALUES
('duracion_reunion_defecto', '60', 'Duración por defecto de las reuniones en minutos', 'entero'),
('dias_anticipacion_minima', '1', 'Días mínimos de anticipación para agendar reuniones', 'entero'),
('dias_anticipacion_maxima', '30', 'Días máximos de anticipación para agendar reuniones', 'entero'),
('horario_inicio_jornada', '08:00', 'Hora de inicio de la jornada laboral', 'texto'),
('horario_fin_jornada', '18:00', 'Hora de fin de la jornada laboral', 'texto'),
('matching_automatico_activo', 'true', 'Si el matching automático está activo', 'booleano'),
('tiempo_respuesta_horas', '48', 'Tiempo máximo en horas para responder solicitudes', 'entero'),
('permitir_reuniones_sabado', 'false', 'Permitir agendar reuniones los sábados', 'booleano'),
('permitir_reuniones_domingo', 'false', 'Permitir agendar reuniones los domingos', 'booleano'),
-- Configuraciones de control de abandono según reglamento
('dias_sin_actividad_alerta', '30', 'Días sin actividad para enviar alerta de inactividad', 'entero'),
('dias_sin_actividad_riesgo', '45', 'Días sin actividad para marcar proyecto en riesgo', 'entero'),
('dias_sin_actividad_abandono', '60', 'Días sin actividad para considerar abandono potencial', 'entero'),
-- Configuración de plazo del informante según reglamento
('dias_habiles_informante', '15', 'Días hábiles que tiene el profesor Informante para evaluar informe final', 'entero'),
('notificar_informante_auto', 'true', 'Notificar automáticamente al informante cuando se entrega el informe final', 'booleano');

-- ===== SISTEMA DE CHAT INDIVIDUAL =====

-- Tabla de Conversaciones entre dos usuarios
CREATE TABLE IF NOT EXISTS conversaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario1_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    usuario2_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    ultimo_mensaje_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario1_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    FOREIGN KEY (usuario2_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    -- Asegurar que no haya conversaciones duplicadas entre los mismos usuarios
    UNIQUE KEY unique_conversation (LEAST(usuario1_rut, usuario2_rut), GREATEST(usuario1_rut, usuario2_rut)),
    INDEX idx_usuario1 (usuario1_rut),
    INDEX idx_usuario2 (usuario2_rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Mensajes
CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversacion_id INT NOT NULL,
    remitente_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    contenido TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (remitente_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    INDEX idx_conversacion (conversacion_id),
    INDEX idx_remitente (remitente_rut),
    INDEX idx_created_at (created_at),
    INDEX idx_leido (leido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agregar foreign key para ultimo_mensaje_id en conversaciones
ALTER TABLE conversaciones 
ADD CONSTRAINT fk_ultimo_mensaje 
FOREIGN KEY (ultimo_mensaje_id) REFERENCES mensajes(id) ON DELETE SET NULL;

-- Tabla de notificaciones de mensajes no leídos
CREATE TABLE IF NOT EXISTS mensajes_no_leidos (
    usuario_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    conversacion_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 0,
    ultimo_mensaje_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_rut, conversacion_id),
    FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE CASCADE,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE,
    INDEX idx_usuario_no_leidos (usuario_rut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA DE CONFIGURACIÓN DEL SISTEMA
-- =====================================================
-- Almacena parámetros configurables del sistema que pueden ser modificados
-- por el Super Administrador desde el Panel de Configuración
-- Usada por el scheduler de recordatorios automáticos y otras funcionalidades
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id_configuracion INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE COMMENT 'Identificador único de la configuración',
    valor VARCHAR(500) NOT NULL COMMENT 'Valor de la configuración (se convierte según el tipo)',
    tipo ENUM('entero', 'booleano', 'texto') NOT NULL COMMENT 'Tipo de dato del valor',
    descripcion TEXT COMMENT 'Descripción de qué hace esta configuración',
    categoria VARCHAR(50) DEFAULT 'general' COMMENT 'Categoría para agrupar configuraciones (alertas, sistema, validaciones, etc.)',
    modificable BOOLEAN DEFAULT TRUE COMMENT 'Si false, no se puede modificar desde el panel (solo por DB)',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    modificado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'RUT del Super Admin que hizo el último cambio',
    FOREIGN KEY (modificado_por) REFERENCES usuarios(rut),
    INDEX idx_clave (clave),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATOS INICIALES DE CONFIGURACIÓN DEL SISTEMA
-- =====================================================

-- Configuraciones de Alertas y Recordatorios
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria, modificable) VALUES
('dias_sin_actividad_alerta', '30', 'entero', 'Días sin actividad en un proyecto antes de enviar alerta de inactividad', 'alertas', TRUE),
('dias_habiles_informante', '15', 'entero', 'Días máximos que tiene un profesor informante para evaluar (días hábiles)', 'evaluaciones', TRUE),
('UMBRAL_INACTIVIDAD_DIAS', '30', 'entero', '[Alias] Días sin actividad - Usado por panel de configuración', 'alertas', TRUE),
('DIAS_PREVIOS_ALERTA_FECHAS', '2', 'entero', 'Días de anticipación para enviar alertas de fechas límite (48h y 24h)', 'alertas', TRUE),
('PLAZO_EVALUACION_DIAS', '15', 'entero', '[Alias] Plazo evaluación - Usado por panel de configuración', 'evaluaciones', TRUE),
('DIAS_ALERTA_EVALUACION', '3', 'entero', 'Días antes del vencimiento del plazo para alertar sobre evaluación pendiente', 'alertas', TRUE),
('HORA_RECORDATORIO_REUNIONES', '08:00', 'texto', 'Hora del día para enviar recordatorios de reuniones (formato HH:MM)', 'alertas', TRUE),
('HORA_ALERTA_EVALUACIONES', '09:00', 'texto', 'Hora del día para enviar alertas de evaluaciones pendientes (formato HH:MM)', 'alertas', TRUE);

-- Configuraciones de Validaciones y Límites
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria, modificable) VALUES
('MAX_PROYECTOS_POR_PROFESOR', '5', 'entero', 'Número máximo de proyectos simultáneos que puede tener un profesor', 'validaciones', TRUE),
('MAX_ESTUDIANTES_POR_PROPUESTA', '3', 'entero', 'Número máximo de estudiantes en una propuesta grupal', 'validaciones', TRUE),
('MIN_CARACTERES_PROPUESTA', '200', 'entero', 'Mínimo de caracteres requeridos en la descripción de una propuesta', 'validaciones', TRUE),
('DURACION_MAXIMA_PROYECTO_SEMESTRES', '2', 'entero', 'Duración máxima permitida de un proyecto de titulación en semestres', 'validaciones', TRUE);

-- Configuraciones de Notificaciones
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria, modificable) VALUES
('NOTIFICACIONES_EMAIL_ACTIVAS', 'true', 'booleano', 'Si se envían notificaciones por correo electrónico', 'notificaciones', TRUE),
('NOTIFICACIONES_PUSH_ACTIVAS', 'true', 'booleano', 'Si se envían notificaciones push en tiempo real vía WebSocket', 'notificaciones', TRUE),
('NOTIFICACIONES_NAVEGADOR_ACTIVAS', 'true', 'booleano', 'Si se muestran notificaciones del navegador (browser notifications)', 'notificaciones', TRUE);

-- Configuraciones de Flujo de Trabajo
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria, modificable) VALUES
('REQUIERE_APROBACION_JEFE_CARRERA', 'true', 'booleano', 'Si las propuestas requieren aprobación del jefe de carrera antes de asignar profesores', 'flujo', TRUE),
('PERMITE_AUTOASIGNACION_PROFESORES', 'false', 'booleano', 'Si los profesores pueden autoasignarse a propuestas sin aprobación del admin', 'flujo', TRUE),
('PERMITE_MODIFICACION_PROPUESTA_APROBADA', 'false', 'booleano', 'Si se permite modificar una propuesta después de ser aprobada', 'flujo', TRUE);

-- Configuraciones de Sistema
INSERT INTO configuracion_sistema (clave, valor, tipo, descripcion, categoria, modificable) VALUES
('NOMBRE_INSTITUCION', 'Universidad del Bío-Bío', 'texto', 'Nombre de la institución educativa', 'sistema', TRUE),
('EMAIL_SOPORTE', 'soporte@actitubb.cl', 'texto', 'Email de contacto para soporte técnico', 'sistema', TRUE),
('MANTENIMIENTO_ACTIVO', 'false', 'booleano', 'Modo mantenimiento - bloquea acceso a usuarios (excepto Super Admin)', 'sistema', TRUE),
('VERSION_SISTEMA', '1.0.0', 'texto', 'Versión actual del sistema', 'sistema', FALSE);

-- =====================================================
-- TABLA DE ACTIVIDAD DEL SISTEMA
-- =====================================================
-- Almacena el registro de todas las actividades importantes realizadas en el sistema
-- Usado para auditoría, estadísticas y dashboard de actividad en tiempo real
CREATE TABLE IF NOT EXISTS actividad_sistema (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL COMMENT 'Tipo de actividad: login, logout, propuesta_creada, proyecto_aprobado, etc.',
    descripcion TEXT COMMENT 'Descripción detallada de la actividad realizada',
    usuario_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'RUT del usuario que realizó la acción',
    detalles JSON COMMENT 'Detalles adicionales en formato JSON (ej: IP, navegador, datos específicos)',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Momento exacto en que ocurrió la actividad',
    FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut) ON DELETE SET NULL,
    INDEX idx_timestamp (timestamp),
    INDEX idx_tipo (tipo),
    INDEX idx_usuario (usuario_rut),
    INDEX idx_tipo_timestamp (tipo, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SISTEMA DE COLABORADORES EXTERNOS (INVITADOS)
-- =====================================================
-- Para manejar personas externas que participan en proyectos (supervisores de empresas, mentores, etc.)
-- NO requieren correo institucional ni roles en el sistema principal

-- Tabla de Entidades Externas (Empresas, Instituciones, Organizaciones)
CREATE TABLE IF NOT EXISTS entidades_externas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL COMMENT 'Nombre de la empresa/institución',
    razon_social VARCHAR(200) NULL COMMENT 'Razón social completa',
    rut_empresa VARCHAR(12) NULL COMMENT 'RUT de la empresa (formato: 12345678-9)',
    tipo ENUM('empresa_privada', 'empresa_publica', 'institucion_educativa', 'ong', 'organismo_publico', 'otra') NOT NULL DEFAULT 'empresa_privada',
    
    -- Información de contacto
    email_contacto VARCHAR(100) NULL,
    telefono VARCHAR(20) NULL,
    direccion TEXT NULL,
    sitio_web VARCHAR(200) NULL,
    
    -- Información adicional
    descripcion TEXT NULL COMMENT 'Descripción de la entidad',
    area_actividad VARCHAR(100) NULL COMMENT 'Área de actividad (tecnología, salud, educación, etc.)',
    
    -- Control
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_nombre (nombre),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Colaboradores Externos (Personas que trabajan en las entidades)
CREATE TABLE IF NOT EXISTS colaboradores_externos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Información personal (NO requiere RUT institucional)
    nombre_completo VARCHAR(150) NOT NULL,
    rut VARCHAR(12) NULL COMMENT 'RUT opcional (puede ser extranjero sin RUT)',
    email VARCHAR(100) NOT NULL COMMENT 'Email personal o corporativo (NO institucional UBB)',
    telefono VARCHAR(20) NULL,
    
    -- Relación con entidad externa
    entidad_id INT NULL COMMENT 'Empresa/institución a la que pertenece',
    cargo VARCHAR(100) NULL COMMENT 'Cargo en la empresa (ej: Supervisor, Gerente de Proyectos)',
    area_departamento VARCHAR(100) NULL COMMENT 'Área o departamento dentro de la empresa',
    
    -- Información profesional
    especialidad VARCHAR(100) NULL COMMENT 'Especialidad o área de expertise',
    anos_experiencia INT NULL COMMENT 'Años de experiencia profesional',
    linkedin VARCHAR(200) NULL COMMENT 'Perfil de LinkedIn',
    
    -- Tipo de colaboración
    tipo_colaborador ENUM('supervisor_empresa', 'mentor', 'asesor_tecnico', 'cliente', 'evaluador_externo', 'otro') NOT NULL DEFAULT 'supervisor_empresa',
    
    -- Información adicional
    biografia TEXT NULL COMMENT 'Breve biografía o descripción profesional',
    observaciones TEXT NULL,
    
    -- Control
    activo BOOLEAN DEFAULT TRUE COMMENT 'Si el colaborador está activo para nuevas asignaciones',
    verificado BOOLEAN DEFAULT FALSE COMMENT 'Si se ha verificado la identidad del colaborador',
    fecha_verificacion TIMESTAMP NULL,
    verificado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT 'RUT del admin que verificó',
    
    -- Auditoría
    creado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del admin/profesor que registró al colaborador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (entidad_id) REFERENCES entidades_externas(id) ON DELETE SET NULL,
    FOREIGN KEY (creado_por) REFERENCES usuarios(rut),
    FOREIGN KEY (verificado_por) REFERENCES usuarios(rut),
    
    INDEX idx_email (email),
    INDEX idx_entidad (entidad_id),
    INDEX idx_activo (activo),
    INDEX idx_tipo (tipo_colaborador),
    
    -- Email único para evitar duplicados
    UNIQUE KEY unique_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Participación de Colaboradores Externos en Proyectos
CREATE TABLE IF NOT EXISTS colaboradores_proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Referencias
    proyecto_id INT NOT NULL,
    colaborador_id INT NOT NULL,
    
    -- Rol específico en el proyecto
    rol_en_proyecto VARCHAR(100) NOT NULL COMMENT 'Ej: Supervisor de Empresa, Mentor, Asesor Técnico',
    descripcion_rol TEXT NULL COMMENT 'Descripción detallada de sus responsabilidades',
    
    -- Fechas de participación
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL COMMENT 'NULL si aún está activo',
    
    -- Detalles de participación
    horas_dedicadas DECIMAL(6,2) NULL COMMENT 'Horas estimadas/reales dedicadas al proyecto',
    frecuencia_interaccion ENUM('diaria', 'semanal', 'quincenal', 'mensual', 'por_demanda') NULL,
    
    -- Evaluación y retroalimentación
    puede_evaluar BOOLEAN DEFAULT FALSE COMMENT 'Si puede evaluar al estudiante',
    evaluacion_realizada BOOLEAN DEFAULT FALSE,
    comentarios_participacion TEXT NULL,
    
    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    motivo_desvinculacion TEXT NULL COMMENT 'Si se desvinculó, explicar por qué',
    
    -- Auditoría
    asignado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Quién lo asignó al proyecto',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores_externos(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_por) REFERENCES usuarios(rut),
    
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_colaborador (colaborador_id),
    INDEX idx_activo (activo),
    
    -- Un colaborador solo puede tener un rol activo por proyecto
    UNIQUE KEY unique_colaborador_proyecto_activo (proyecto_id, colaborador_id, activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Evaluaciones de Colaboradores Externos
-- Para cuando un supervisor de empresa evalúa el desempeño del estudiante
CREATE TABLE IF NOT EXISTS evaluaciones_colaboradores_externos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Referencias
    colaborador_proyecto_id INT NOT NULL COMMENT 'Relación entre colaborador y proyecto',
    proyecto_id INT NOT NULL,
    colaborador_id INT NOT NULL,
    estudiante_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    
    -- Evaluación
    fecha_evaluacion DATE NOT NULL,
    calificacion DECIMAL(3,1) NULL COMMENT 'Nota de 1.0 a 7.0 (sistema chileno)',
    
    -- Criterios de evaluación
    asistencia_puntualidad INT NULL COMMENT 'Escala 1-10',
    calidad_trabajo INT NULL COMMENT 'Escala 1-10',
    proactividad INT NULL COMMENT 'Escala 1-10',
    trabajo_equipo INT NULL COMMENT 'Escala 1-10',
    comunicacion INT NULL COMMENT 'Escala 1-10',
    cumplimiento_plazos INT NULL COMMENT 'Escala 1-10',
    
    -- Retroalimentación
    fortalezas TEXT NULL,
    areas_mejora TEXT NULL,
    comentarios_generales TEXT NULL,
    recomendaria_estudiante BOOLEAN NULL COMMENT '¿Recomendaría contratar al estudiante?',
    
    -- Archivos adjuntos
    documento_evaluacion VARCHAR(255) NULL COMMENT 'Documento PDF de evaluación formal',
    
    -- Control
    aprobada_por_profesor VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    fecha_aprobacion TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (colaborador_proyecto_id) REFERENCES colaboradores_proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (colaborador_id) REFERENCES colaboradores_externos(id),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (aprobada_por_profesor) REFERENCES usuarios(rut),
    
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_colaborador (colaborador_id),
    INDEX idx_estudiante (estudiante_rut),
    INDEX idx_fecha (fecha_evaluacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SISTEMA DE VERSIONES DE DOCUMENTOS Y PLANTILLAS
-- =====================================================

-- Tabla de Versiones de Documentos/Avances
-- Almacena todas las versiones de archivos subidos (estudiantes y profesores)
CREATE TABLE IF NOT EXISTS versiones_documento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avance_id INT NOT NULL COMMENT 'Referencia al avance/entrega',
    proyecto_id INT NOT NULL,
    
    -- Información de la versión
    numero_version VARCHAR(20) NOT NULL COMMENT 'v1.0, v1.1, v2.0, etc.',
    tipo_version ENUM('estudiante', 'profesor_revision', 'profesor_comentarios', 'version_final') DEFAULT 'estudiante',
    
    -- Archivo
    archivo_nombre VARCHAR(255) NOT NULL,
    archivo_ruta VARCHAR(500) NOT NULL,
    archivo_tamano_kb INT NULL,
    archivo_tipo VARCHAR(100) NULL COMMENT 'application/pdf, application/docx, etc.',
    
    -- Descripción de cambios
    descripcion_cambios TEXT NULL COMMENT 'Qué se modificó en esta versión',
    cambios_principales TEXT NULL COMMENT 'Lista de cambios principales',
    
    -- Autor
    autor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    autor_rol ENUM('estudiante', 'profesor_guia', 'profesor_informante', 'admin') NOT NULL,
    
    -- Comentarios generales del profesor (si es revisión)
    comentarios_generales TEXT NULL COMMENT 'Comentarios generales sobre esta versión',
    
    -- Estado de la versión
    estado ENUM('borrador', 'enviado', 'en_revision', 'revisado', 'aprobado', 'rechazado') DEFAULT 'enviado',
    requiere_correccion BOOLEAN DEFAULT FALSE,
    es_version_final BOOLEAN DEFAULT FALSE COMMENT 'Marca si es la versión final aprobada',
    
    -- Metadatos
    etiquetas VARCHAR(500) NULL COMMENT 'Tags separados por coma',
    visible_para_estudiante BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_revision TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (avance_id) REFERENCES avances(id) ON DELETE CASCADE,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_rut) REFERENCES usuarios(rut),
    
    INDEX idx_avance (avance_id),
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_autor (autor_rut),
    INDEX idx_version (numero_version),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_subida)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Comentarios por Versión
-- Comentarios que profesores o estudiantes dejan sobre una versión específica
CREATE TABLE IF NOT EXISTS comentarios_version (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version_id INT NOT NULL,
    
    -- Autor del comentario
    autor_rut VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    autor_nombre VARCHAR(200) NULL,
    autor_rol ENUM('estudiante', 'profesor_guia', 'profesor_informante', 'admin') NOT NULL,
    
    -- Contenido
    comentario TEXT NOT NULL,
    tipo_comentario ENUM('general', 'sugerencia', 'error', 'aprobacion', 'rechazo') DEFAULT 'general',
    prioridad ENUM('baja', 'media', 'alta') DEFAULT 'media',
    
    -- Referencia específica (opcional)
    seccion_referencia VARCHAR(200) NULL COMMENT 'Capítulo 3, Página 15, etc.',
    
    -- Estado
    resuelto BOOLEAN DEFAULT FALSE,
    fecha_resolucion TIMESTAMP NULL,
    
    -- Respuesta (si aplica)
    respuesta_comentario_id INT NULL COMMENT 'ID del comentario al que responde',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (version_id) REFERENCES versiones_documento(id) ON DELETE CASCADE,
    FOREIGN KEY (autor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (respuesta_comentario_id) REFERENCES comentarios_version(id) ON DELETE SET NULL,
    
    INDEX idx_version (version_id),
    INDEX idx_autor (autor_rut),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Plantillas de Documentos
-- Plantillas que el admin sube para que los estudiantes las descarguen y sigan
CREATE TABLE IF NOT EXISTS plantillas_documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Información de la plantilla
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT NULL,
    tipo_documento ENUM('propuesta', 'informe_avance', 'informe_final', 'presentacion', 'poster', 'acta', 'otro') NOT NULL,
    
    -- Archivo de la plantilla
    archivo_nombre VARCHAR(255) NOT NULL,
    archivo_ruta VARCHAR(500) NOT NULL,
    archivo_tipo VARCHAR(100) NULL COMMENT '.docx, .pdf, .pptx, etc.',
    archivo_tamano_kb INT NULL,
    
    -- Alcance
    carrera_id INT NULL COMMENT 'Si es NULL, aplica para todas las carreras',
    departamento_id INT NULL COMMENT 'Si es NULL, aplica para todos los departamentos',
    facultad_id INT NULL COMMENT 'Si es NULL, aplica para todas las facultades',
    
    -- Metadata
    version_plantilla VARCHAR(20) DEFAULT '1.0',
    formato_requerido VARCHAR(100) NULL COMMENT 'APA, IEEE, Vancouver, etc.',
    instrucciones TEXT NULL COMMENT 'Instrucciones de uso de la plantilla',
    ejemplo_url VARCHAR(500) NULL COMMENT 'URL a ejemplo de uso',
    
    -- Estado
    activa BOOLEAN DEFAULT TRUE,
    obligatoria BOOLEAN DEFAULT FALSE COMMENT 'Si es obligatorio usar esta plantilla',
    orden_visualizacion INT DEFAULT 0,
    
    -- Auditoría
    creado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    actualizado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    descargas INT DEFAULT 0 COMMENT 'Contador de descargas',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (carrera_id) REFERENCES carreras(id) ON DELETE SET NULL,
    FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE SET NULL,
    FOREIGN KEY (facultad_id) REFERENCES facultades(id) ON DELETE SET NULL,
    FOREIGN KEY (creado_por) REFERENCES usuarios(rut),
    FOREIGN KEY (actualizado_por) REFERENCES usuarios(rut),
    
    INDEX idx_tipo (tipo_documento),
    INDEX idx_carrera (carrera_id),
    INDEX idx_activa (activa),
    INDEX idx_orden (orden_visualizacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Resultados Finales de Proyectos
-- Almacena el resultado final y estado de cierre del proyecto
CREATE TABLE IF NOT EXISTS resultados_finales_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL UNIQUE,
    
    -- Estado final
    estado_final ENUM('aprobado', 'aprobado_con_distincion', 'aprobado_con_observaciones', 'reprobado', 'abandonado', 'anulado') NOT NULL,
    
    -- Calificaciones (sin nota numérica, solo observaciones)
    evaluacion_profesor_guia TEXT NULL COMMENT 'Evaluación final del profesor guía',
    evaluacion_profesor_informante TEXT NULL COMMENT 'Evaluación del profesor informante',
    evaluacion_comision TEXT NULL COMMENT 'Evaluación de la comisión',
    
    -- Observaciones finales
    observaciones_finales TEXT NULL,
    recomendaciones TEXT NULL,
    areas_destacadas TEXT NULL,
    
    -- Documentación final
    documento_final VARCHAR(255) NULL COMMENT 'Ruta al documento final aprobado',
    acta_aprobacion VARCHAR(255) NULL COMMENT 'Ruta al acta de aprobación',
    
    -- Menciones y reconocimientos
    mencion_honores BOOLEAN DEFAULT FALSE,
    mencion_excelencia BOOLEAN DEFAULT FALSE,
    publicacion_recomendada BOOLEAN DEFAULT FALSE COMMENT 'Si se recomienda publicar',
    
    -- Fechas importantes
    fecha_aprobacion DATE NULL,
    fecha_cierre TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Auditoría
    cerrado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (cerrado_por) REFERENCES usuarios(rut),
    
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_estado (estado_final),
    INDEX idx_fecha_cierre (fecha_cierre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Historial de Estados del Proyecto
-- Para seguimiento completo de cambios de estado
CREATE TABLE IF NOT EXISTS historial_estados_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    
    estado_anterior VARCHAR(100) NULL,
    estado_nuevo VARCHAR(100) NOT NULL,
    
    motivo TEXT NULL COMMENT 'Razón del cambio de estado',
    observaciones TEXT NULL,
    
    -- Autor del cambio
    cambiado_por VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (cambiado_por) REFERENCES usuarios(rut),
    
    INDEX idx_proyecto (proyecto_id),
    INDEX idx_fecha (fecha_cambio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== BASE DE DATOS CREADA EXITOSAMENTE =====

-- =====================================================
-- MIGRACIÓN: Corrección de restricción unique_asignacion_activa
-- Fecha: 2025-12-19
-- Descripción: Cambiar la restricción UNIQUE para que solo aplique cuando activo=TRUE
--              Esto permite mantener historial de asignaciones inactivas sin conflictos
-- =====================================================

-- IMPORTANTE: Ejecuta estos comandos manualmente en tu base de datos MySQL:

/*
-- Paso 1: Eliminar la restricción UNIQUE antigua
ALTER TABLE asignaciones_proyectos DROP INDEX unique_asignacion_activa;

-- Paso 2: Limpiar duplicados inactivos antes de crear el nuevo índice (opcional)
-- Esto mantiene solo la asignación inactiva más reciente por proyecto y rol
DELETE ap1 FROM asignaciones_proyectos ap1
INNER JOIN asignaciones_proyectos ap2 
WHERE ap1.proyecto_id = ap2.proyecto_id 
  AND ap1.rol_profesor_id = ap2.rol_profesor_id
  AND ap1.activo = FALSE 
  AND ap2.activo = FALSE
  AND ap1.fecha_asignacion < ap2.fecha_asignacion;

-- Paso 3: Crear el nuevo índice único parcial (solo para activo=TRUE)
-- Nota: MySQL 8.0.13+ soporta índices con WHERE. Para versiones anteriores, se mantiene el comportamiento actual.
-- Si tu versión de MySQL no soporta WHERE, comenta esta línea y ejecuta la alternativa del Paso 4
CREATE UNIQUE INDEX unique_asignacion_activa ON asignaciones_proyectos (proyecto_id, rol_profesor_id) 
WHERE activo = TRUE;

-- Paso 4: ALTERNATIVA para MySQL < 8.0.13 (si el Paso 3 falla)
-- Usar un índice funcional con IF
-- ALTER TABLE asignaciones_proyectos 
-- ADD UNIQUE INDEX unique_asignacion_activa (proyecto_id, rol_profesor_id, (IF(activo = TRUE, 1, NULL)));

-- Verificar que el índice se creó correctamente
SHOW INDEX FROM asignaciones_proyectos WHERE Key_name = 'unique_asignacion_activa';
*/
SELECT 'Base de datos AcTitUBB creada exitosamente con estructura academica completa y sistema de versiones' as status;