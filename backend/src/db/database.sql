Create database actitubb;
USE actitubb;

-- Tabla de Roles de Usuarios
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Asignaciones de Profesores a Proyectos (UNIFICADA)
CREATE TABLE IF NOT EXISTS asignaciones_proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) NOT NULL,
    rol_profesor_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_desasignacion TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    observaciones TEXT NULL,
    asignado_por VARCHAR(10) NOT NULL, -- RUT del admin que hizo la asignación
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (rol_profesor_id) REFERENCES roles_profesores(id),
    FOREIGN KEY (asignado_por) REFERENCES usuarios(rut),
    UNIQUE KEY unique_asignacion_proyecto_rol (proyecto_id, rol_profesor_id),
    INDEX idx_proyecto_activo (proyecto_id, activo),
    INDEX idx_profesor_activo (profesor_rut, activo),
    INDEX idx_rol_activo (rol_profesor_id, activo)
);

-- Tabla de Historial de Asignaciones (para auditoría)
CREATE TABLE IF NOT EXISTS historial_asignaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) NOT NULL,
    rol_profesor_id INT NOT NULL,
    accion ENUM('asignado', 'desasignado', 'modificado') NOT NULL,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    realizado_por VARCHAR(10) NOT NULL, -- RUT del admin que realizó la acción
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

-- Tabla de Usuarios (Estudiantes y Profesores)
CREATE TABLE IF NOT EXISTS usuarios (
    rut VARCHAR(10) NOT NULL PRIMARY KEY UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    confirmado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

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
    estudiante_rut VARCHAR(10) NOT NULL,
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

-- Tabla de Roles de Profesores en Proyectos
CREATE TABLE IF NOT EXISTS roles_profesores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asegurar que la columna codigo existe (por si la tabla ya existía sin esta columna)
ALTER TABLE roles_profesores 
ADD COLUMN IF NOT EXISTS codigo VARCHAR(50) AFTER id;

-- Asegurar que la columna codigo sea UNIQUE (solo si no lo es ya)
-- Nota: Esta línea puede fallar si ya existe el índice, pero es seguro ignorar el error

-- Tabla de Asignaciones de Profesores a Propuestas
CREATE TABLE IF NOT EXISTS asignaciones_propuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propuesta_id INT NOT NULL,
    profesor_rut VARCHAR(10) NOT NULL,
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
    estudiante_rut VARCHAR(10) NOT NULL,
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
    
    -- Gestión de progreso y calificaciones
    porcentaje_avance DECIMAL(5,2) DEFAULT 0.00 CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100),
    nota_propuesta DECIMAL(3,1) NULL CHECK (nota_propuesta >= 1.0 AND nota_propuesta <= 7.0),
    nota_proyecto DECIMAL(3,1) NULL CHECK (nota_proyecto >= 1.0 AND nota_proyecto <= 7.0),
    nota_defensa DECIMAL(3,1) NULL CHECK (nota_defensa >= 1.0 AND nota_defensa <= 7.0),
    nota_final DECIMAL(3,1) NULL CHECK (nota_final >= 1.0 AND nota_final <= 7.0),
    
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
    
    -- Configuración de modalidad (heredada de propuesta)
    modalidad ENUM('desarrollo_software', 'investigacion') NOT NULL,
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
    
    -- Auditoría y seguimiento
    creado_por_rut VARCHAR(10) NOT NULL,
    actualizado_por_rut VARCHAR(10) NULL,
    
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

-- Tabla de Evaluaciones del Proyecto
CREATE TABLE IF NOT EXISTS evaluaciones_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    hito_id INT NULL, -- Puede estar asociado a un hito específico
    tipo_evaluacion ENUM('avance_mensual', 'entrega_parcial', 'revision_semestral', 'evaluacion_final', 'defensa_oral', 'otra') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    
    -- Calificaciones detalladas
    nota_aspecto_tecnico DECIMAL(3,1) NULL CHECK (nota_aspecto_tecnico >= 1.0 AND nota_aspecto_tecnico <= 7.0),
    nota_metodologia DECIMAL(3,1) NULL CHECK (nota_metodologia >= 1.0 AND nota_metodologia <= 7.0),
    nota_documentacion DECIMAL(3,1) NULL CHECK (nota_documentacion >= 1.0 AND nota_documentacion <= 7.0),
    nota_presentacion DECIMAL(3,1) NULL CHECK (nota_presentacion >= 1.0 AND nota_presentacion <= 7.0),
    nota_global DECIMAL(3,1) NULL CHECK (nota_global >= 1.0 AND nota_global <= 7.0),
    
    -- Retroalimentación
    fortalezas TEXT NULL,
    debilidades TEXT NULL,
    recomendaciones TEXT NULL,
    comentarios_generales TEXT NULL,
    
    -- Control de fechas
    fecha_evaluacion DATE NOT NULL,
    fecha_limite DATE NULL,
    
    -- Evaluador
    profesor_evaluador_rut VARCHAR(10) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (hito_id) REFERENCES hitos_proyecto(id) ON DELETE SET NULL,
    FOREIGN KEY (profesor_evaluador_rut) REFERENCES usuarios(rut),
    
    INDEX idx_proyecto_fecha (proyecto_id, fecha_evaluacion),
    INDEX idx_tipo_fecha (tipo_evaluacion, fecha_evaluacion),
    INDEX idx_profesor_fecha (profesor_evaluador_rut, fecha_evaluacion)
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
    profesor_revisor VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_revisor) REFERENCES usuarios(rut)
);

-- Tabla de Fechas Importantes del Calendario
CREATE TABLE IF NOT EXISTS fechas_calendario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    tipo_fecha ENUM('global', 'academica', 'entrega', 'revision', 'defensa', 'reunion', 'otro') DEFAULT 'otro',
    -- Campos para determinar visibilidad
    es_global BOOLEAN DEFAULT FALSE, -- Si es true, la ve todo el mundo (fechas del admin)
    creado_por_rut VARCHAR(10) NOT NULL, -- RUT del que creó la fecha (admin o profesor)
    profesor_rut VARCHAR(10) NULL, -- Si no es global, RUT del profesor (para fechas específicas)
    estudiante_rut VARCHAR(10) NULL, -- Si es específica para un estudiante
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creado_por_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    FOREIGN KEY (estudiante_rut) REFERENCES usuarios(rut)
);

-- Tabla de Fechas Importantes específicas de cada proyecto
CREATE TABLE IF NOT EXISTS fechas_importantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    tipo_fecha ENUM('entrega', 'reunion', 'evaluacion', 'hito', 'deadline', 'presentacion', 'entrega_avance', 'entrega_final', 'defensa', 'revision', 'otro') DEFAULT 'otro',
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_limite DATE NOT NULL,
    completada BOOLEAN DEFAULT FALSE,
    fecha_realizada DATE NULL,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

-- Tabla de Cronogramas de Proyecto (acordados entre guía y estudiante)
CREATE TABLE IF NOT EXISTS cronogramas_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    nombre_cronograma VARCHAR(255) NOT NULL DEFAULT 'Cronograma Principal',
    descripcion TEXT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin_estimada DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_por_rut VARCHAR(10) NOT NULL, -- Profesor guía que creó el cronograma
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
    tipo_hito ENUM('entrega_documento', 'revision_avance', 'reunion_seguimiento', 'evaluacion', 'defensa') NOT NULL,
    
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
    destinatario_rut VARCHAR(10) NOT NULL,
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
    profesor_rut VARCHAR(10) NOT NULL, -- Profesor que configura las alertas
    
    -- Configuración de días de alerta
    dias_alerta_entregas INT DEFAULT 3,
    dias_alerta_reuniones INT DEFAULT 1,
    dias_alerta_defensas INT DEFAULT 7,
    
    -- Tipos de alerta activos
    alertas_entregas BOOLEAN DEFAULT TRUE,
    alertas_reuniones BOOLEAN DEFAULT TRUE,
    alertas_retrasos BOOLEAN DEFAULT TRUE,
    alertas_evaluaciones BOOLEAN DEFAULT TRUE,
    
    -- Configuración de envío
    enviar_email_estudiante BOOLEAN DEFAULT TRUE,
    enviar_email_profesor BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE,
    FOREIGN KEY (profesor_rut) REFERENCES usuarios(rut),
    
    UNIQUE KEY unique_config_proyecto (proyecto_id)
);

-- Tabla de Reuniones de Calendario
CREATE TABLE IF NOT EXISTS fechas_importantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    tipo_fecha ENUM('entrega_avance', 'entrega_final', 'defensa', 'presentacion', 'revision_parcial') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_limite DATE NOT NULL,
    fecha_realizada DATE NULL,
    completada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
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
    usuario_rut VARCHAR(10) NOT NULL,
    rol ENUM('organizador', 'participante', 'invitado') DEFAULT 'participante',
    confirmado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (reunion_id) REFERENCES reuniones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_rut) REFERENCES usuarios(rut),
    UNIQUE KEY unique_participante (reunion_id, usuario_rut)
);

-- Insertar datos iniciales

-- Roles de usuarios
INSERT IGNORE INTO roles (nombre, descripcion) VALUES
('estudiante', 'Estudiante que desarrolla el proyecto de título'),
('profesor', 'Profesor que guía o revisa proyectos de título'),
('admin', 'Administrador del sistema');

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

-- Datos de ejemplo para fechas del calendario (comentado para evitar errores de FK)
-- INSERT INTO fechas_calendario (titulo, descripcion, fecha, tipo_fecha, es_global, creado_por_rut) VALUES
-- ('Inicio Semestre', 'Inicio del semestre académico', '2025-03-01', 'academica', TRUE, '11111111-1'),
-- ('Fecha límite primera entrega', 'Fecha límite para primera entrega de propuestas', '2025-04-15', 'entrega', TRUE, '11111111-1'),
-- ('Semana de defensa', 'Semana destinada para defensas de título', '2025-06-15', 'defensa', TRUE, '11111111-1'),
-- ('Fin Semestre', 'Fin del semestre académico', '2025-07-15', 'academica', TRUE, '11111111-1');

-- Roles de profesores en proyectos
INSERT IGNORE INTO roles_profesores (codigo, nombre, descripcion) VALUES
('profesor_revisor', 'Profesor Revisor', 'Profesor que evalúa la propuesta inicial y determina su viabilidad'),
('profesor_guia', 'Profesor Guía', 'Profesor principal que guía el desarrollo completo del proyecto'),
('profesor_co_guia', 'Profesor Co-Guía', 'Profesor co-guía que apoya en áreas específicas del proyecto'),
('profesor_informante', 'Profesor Informante', 'Profesor que evalúa el informe final y otorga calificación'),
('profesor_sala', 'Profesor de Sala', 'Profesor de sala para la defensa oral del proyecto'),
('profesor_corrector', 'Profesor Corrector', 'Profesor que corrige y evalúa avances parciales'),
('profesor_externo', 'Profesor Externo', 'Profesor externo o de otra institución que participa en la evaluación');

-- Usuarios de prueba (contraseña: 1234)
-- Hash generado con bcrypt, salt rounds = 10
INSERT IGNORE INTO usuarios (rut, nombre, email, password, rol_id, confirmado) VALUES
('12345678-9', 'Ana Estudiante', 'ana.estudiante@alumnos.ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 1, 1),
('98765432-1', 'Carlos Profesor', 'carlos.profesor@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 2, 1),
('11111111-1', 'María Administradora', 'maria.admin@ubiobio.cl', '$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe', 3, 1);

-- Crear índices para mejorar rendimiento
-- Nota: Los errores de índices duplicados serán ignorados por el sistema de conexión
CREATE INDEX idx_propuestas_estudiante ON propuestas(estudiante_rut);
CREATE INDEX idx_propuestas_estado ON propuestas(estado_id);
CREATE INDEX idx_propuestas_fecha_envio ON propuestas(fecha_envio);
CREATE INDEX idx_proyectos_estudiante ON proyectos(estudiante_rut);
CREATE INDEX idx_proyectos_estado ON proyectos(estado_id);
CREATE INDEX idx_avances_proyecto ON avances(proyecto_id);
CREATE INDEX idx_avances_estado ON avances(estado_id);
CREATE INDEX idx_fechas_proyecto ON fechas_importantes(proyecto_id);
CREATE INDEX idx_fechas_calendario_global ON fechas_calendario(es_global, fecha);
CREATE INDEX idx_fechas_calendario_profesor ON fechas_calendario(profesor_rut, fecha);
CREATE INDEX idx_fechas_calendario_estudiante ON fechas_calendario(estudiante_rut, fecha);
CREATE INDEX idx_reuniones_proyecto ON reuniones(proyecto_id);
CREATE INDEX idx_asignaciones_propuesta ON asignaciones_propuestas(propuesta_id);
CREATE INDEX idx_asignaciones_proyecto ON asignaciones_proyectos(proyecto_id);
CREATE INDEX idx_proyectos_estado_detallado ON proyectos(estado_detallado);
CREATE INDEX idx_proyectos_modalidad ON proyectos(modalidad);
CREATE INDEX idx_proyectos_porcentaje_avance ON proyectos(porcentaje_avance);
CREATE INDEX idx_proyectos_activo ON proyectos(activo);
CREATE INDEX idx_hitos_proyecto_estado ON hitos_proyecto(proyecto_id, estado);
CREATE INDEX idx_hitos_fecha_objetivo ON hitos_proyecto(fecha_objetivo);
CREATE INDEX idx_evaluaciones_proyecto ON evaluaciones_proyecto(proyecto_id);

-- ===== SISTEMA DE CALENDARIO CON MATCHING AUTOMÁTICO =====

-- Tabla de Disponibilidades de Usuarios
CREATE TABLE IF NOT EXISTS disponibilidades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_rut VARCHAR(10) NOT NULL,
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
    profesor_rut VARCHAR(10) NOT NULL,
    estudiante_rut VARCHAR(10) NOT NULL,
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
    solicitud_reunion_id INT NOT NULL,
    proyecto_id INT NOT NULL,
    profesor_rut VARCHAR(10) NOT NULL,
    estudiante_rut VARCHAR(10) NOT NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo_reunion ENUM('seguimiento', 'revision_avance', 'orientacion', 'defensa_parcial', 'otra') DEFAULT 'seguimiento',
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    lugar VARCHAR(100),
    modalidad ENUM('presencial', 'virtual', 'hibrida') DEFAULT 'presencial',
    link_reunion VARCHAR(500) NULL, -- Para reuniones virtuales
    estado ENUM('programada', 'en_curso', 'realizada', 'cancelada', 'reprogramada') DEFAULT 'programada',
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
    UNIQUE KEY unique_profesor_fecha_hora (profesor_rut, fecha, hora_inicio),
    UNIQUE KEY unique_estudiante_fecha_hora (estudiante_rut, fecha, hora_inicio)
);

-- Tabla de Bloqueos de Horarios (para vacaciones, feriados, etc.)
CREATE TABLE IF NOT EXISTS bloqueos_horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_rut VARCHAR(10) NOT NULL,
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
INSERT IGNORE INTO configuracion_matching (clave, valor, descripcion, tipo) VALUES
('duracion_reunion_defecto', '60', 'Duración por defecto de las reuniones en minutos', 'entero'),
('dias_anticipacion_minima', '1', 'Días mínimos de anticipación para agendar reuniones', 'entero'),
('dias_anticipacion_maxima', '30', 'Días máximos de anticipación para agendar reuniones', 'entero'),
('horario_inicio_jornada', '08:00', 'Hora de inicio de la jornada laboral', 'texto'),
('horario_fin_jornada', '18:00', 'Hora de fin de la jornada laboral', 'texto'),
('matching_automatico_activo', 'true', 'Si el matching automático está activo', 'booleano'),
('tiempo_respuesta_horas', '48', 'Tiempo máximo en horas para responder solicitudes', 'entero'),
('permitir_reuniones_sabado', 'false', 'Permitir agendar reuniones los sábados', 'booleano'),
('permitir_reuniones_domingo', 'false', 'Permitir agendar reuniones los domingos', 'booleano');

-- =====================================================
-- DATOS DE PRUEBA PARA SISTEMA DE CALENDARIO MATCHING
-- =====================================================

-- 1. Crear propuesta de prueba
INSERT IGNORE INTO propuestas (
    id, titulo, descripcion, estudiante_rut, estado_id, 
    comentarios_profesor, fecha_envio, fecha_aprobacion, proyecto_id
) VALUES (
    1, 
    'Sistema de Gestión de Inventarios',
    'Desarrollo de un sistema web para gestión de inventarios en tiempo real con tecnologías modernas',
    '12345678-9', 
    4, -- Estado: aprobada
    'Excelente propuesta, muy bien estructurada',
    '2025-01-15',
    '2025-01-20',
    1 -- Se creará el proyecto con este ID
);

-- 2. Crear proyecto de prueba
INSERT IGNORE INTO proyectos (
    id, titulo, descripcion, propuesta_id, estudiante_rut, 
    estado_id, fecha_inicio, fecha_entrega_estimada
) VALUES (
    1,
    'Sistema de Gestión de Inventarios',
    'Desarrollo de un sistema web para gestión de inventarios en tiempo real con React y Node.js',
    1, -- Referencia a la propuesta
    '12345678-9', -- Ana Estudiante
    1, -- Estado: en_desarrollo
    '2025-01-21',
    '2025-06-30'
);

-- 3. Asignar profesor guía al proyecto
INSERT IGNORE INTO asignaciones_proyectos (
    proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, activo, asignado_por
) VALUES (
    1, -- Proyecto: Sistema de Gestión de Inventarios
    '98765432-1', -- Carlos Profesor
    2, -- profesor_guia (ID del rol)
    '2025-01-21',
    TRUE,
    '11111111-1' -- Admin que asignó
);

-- 4. Crear disponibilidades de ejemplo

-- Disponibilidades del Profesor Carlos
INSERT IGNORE INTO disponibilidades (usuario_rut, dia_semana, hora_inicio, hora_fin) VALUES
('98765432-1', 'lunes', '09:00', '12:00'),
('98765432-1', 'lunes', '14:00', '17:00'),
('98765432-1', 'martes', '10:00', '13:00'),
('98765432-1', 'miercoles', '09:00', '11:00'),
('98765432-1', 'miercoles', '15:00', '18:00'),
('98765432-1', 'jueves', '08:00', '12:00'),
('98765432-1', 'viernes', '14:00', '16:00');

-- Disponibilidades de la Estudiante Ana
INSERT IGNORE INTO disponibilidades (usuario_rut, dia_semana, hora_inicio, hora_fin) VALUES
('12345678-9', 'lunes', '10:00', '11:00'),
('12345678-9', 'lunes', '15:00', '16:00'),
('12345678-9', 'martes', '11:00', '12:00'),
('12345678-9', 'miercoles', '09:30', '10:30'),
('12345678-9', 'miercoles', '16:00', '17:00'),
('12345678-9', 'jueves', '09:00', '11:00'),
('12345678-9', 'viernes', '14:30', '15:30');

-- 5. Crear ejemplo de bloqueo de horarios (profesor en vacaciones)
INSERT IGNORE INTO bloqueos_horarios (
    usuario_rut, fecha_inicio, fecha_fin, motivo, tipo
) VALUES (
    '98765432-1', 
    '2025-02-10', 
    '2025-02-14', 
    'Vacaciones de verano', 
    'vacaciones'
);

-- 6. Crear una solicitud de reunión de ejemplo
INSERT IGNORE INTO solicitudes_reunion (
    proyecto_id, profesor_rut, estudiante_rut, fecha_propuesta, 
    hora_propuesta, tipo_reunion, descripcion, estado, creado_por
) VALUES (
    1, -- Sistema de Gestión de Inventarios
    '98765432-1', -- Carlos Profesor
    '12345678-9', -- Ana Estudiante
    '2025-02-03', -- Próximo lunes
    '10:30', -- Horario donde ambos están disponibles
    'seguimiento',
    'Primera reunión de seguimiento para definir alcance del proyecto',
    'pendiente',
    'sistema'
);

-- 7. Crear una segunda propuesta y proyecto para más pruebas
INSERT IGNORE INTO propuestas (
    id, titulo, descripcion, estudiante_rut, estado_id, 
    comentarios_profesor, fecha_envio, fecha_aprobacion, proyecto_id
) VALUES (
    2, 
    'Aplicación Móvil de Transporte',
    'Desarrollo de una aplicación móvil para gestión de transporte público',
    '12345678-9', 
    4, -- Estado: aprobada
    'Buena propuesta, innovadora',
    '2025-01-10',
    '2025-01-18',
    2
);

INSERT IGNORE INTO proyectos (
    id, titulo, descripcion, propuesta_id, estudiante_rut, 
    estado_id, fecha_inicio, fecha_entrega_estimada
) VALUES (
    2,
    'Aplicación Móvil de Transporte',
    'App móvil con React Native para gestión de rutas de transporte público',
    2,
    '12345678-9',
    1, -- Estado: en_desarrollo
    '2025-01-19',
    '2025-07-15'
);

-- Asignar mismo profesor a segundo proyecto (diferentes roles)
INSERT IGNORE INTO asignaciones_proyectos (
    proyecto_id, profesor_rut, rol_profesor_id, fecha_asignacion, activo, asignado_por
) VALUES (
    2, -- Aplicación Móvil
    '98765432-1', -- Carlos Profesor
    4, -- profesor_informante (ID del rol)
    '2025-01-19',
    TRUE,
    '11111111-1' -- Admin que asignó
);

-- 8. Crear fechas importantes para los proyectos
INSERT IGNORE INTO fechas_importantes (
    proyecto_id, tipo_fecha, titulo, descripcion, fecha_limite
) VALUES 
(1, 'entrega_avance', 'Primera Entrega', 'Entrega del primer avance del sistema', '2025-03-15'),
(1, 'defensa', 'Defensa Final', 'Defensa final del proyecto de título', '2025-06-20'),
(2, 'entrega_avance', 'Prototipo App', 'Entrega del prototipo funcional', '2025-04-10'),
(2, 'presentacion', 'Presentación Intermedia', 'Presentación de avances a comité', '2025-05-15');

-- ===== VERIFICACIÓN DE DATOS CREADOS =====
SELECT 'Datos de prueba para Sistema de Calendario con Matching creados exitosamente' as status;

