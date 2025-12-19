-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: actitubb
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actas_reunion`
--

DROP TABLE IF EXISTS `actas_reunion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actas_reunion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reunion_id` int NOT NULL,
  `proyecto_id` int NOT NULL,
  `numero_acta` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_reunion` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `lugar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `asistentes` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `objetivo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `temas_tratados` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `acuerdos` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tareas_asignadas` text COLLATE utf8mb4_unicode_ci,
  `proximos_pasos` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `firma_estudiante` tinyint(1) DEFAULT '0',
  `fecha_firma_estudiante` timestamp NULL DEFAULT NULL,
  `firma_profesor` tinyint(1) DEFAULT '0',
  `fecha_firma_profesor` timestamp NULL DEFAULT NULL,
  `archivo_acta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('borrador','pendiente_firma','firmada','archivada') COLLATE utf8mb4_unicode_ci DEFAULT 'borrador',
  `creado_por` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_numero_acta` (`numero_acta`),
  KEY `creado_por` (`creado_por`),
  KEY `idx_acta_reunion` (`reunion_id`),
  KEY `idx_acta_proyecto` (`proyecto_id`,`estado`),
  KEY `idx_acta_fecha` (`fecha_reunion`),
  KEY `idx_acta_estado` (`estado`),
  CONSTRAINT `actas_reunion_ibfk_1` FOREIGN KEY (`reunion_id`) REFERENCES `reuniones_calendario` (`id`) ON DELETE CASCADE,
  CONSTRAINT `actas_reunion_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `actas_reunion_ibfk_3` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actas_reunion`
--

LOCK TABLES `actas_reunion` WRITE;
/*!40000 ALTER TABLE `actas_reunion` DISABLE KEYS */;
/*!40000 ALTER TABLE `actas_reunion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `actividad_sistema`
--

DROP TABLE IF EXISTS `actividad_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividad_sistema` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de actividad: login, logout, propuesta_creada, proyecto_aprobado, etc.',
  `descripcion` text COLLATE utf8mb4_unicode_ci COMMENT 'Descripción detallada de la actividad realizada',
  `usuario_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del usuario que realizó la acción',
  `detalles` json DEFAULT NULL COMMENT 'Detalles adicionales en formato JSON (ej: IP, navegador, datos específicos)',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Momento exacto en que ocurrió la actividad',
  PRIMARY KEY (`id`),
  KEY `idx_timestamp` (`timestamp`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_usuario` (`usuario_rut`),
  KEY `idx_tipo_timestamp` (`tipo`,`timestamp`),
  CONSTRAINT `actividad_sistema_ibfk_1` FOREIGN KEY (`usuario_rut`) REFERENCES `usuarios` (`rut`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividad_sistema`
--

LOCK TABLES `actividad_sistema` WRITE;
/*!40000 ALTER TABLE `actividad_sistema` DISABLE KEYS */;
/*!40000 ALTER TABLE `actividad_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alertas_abandono`
--

DROP TABLE IF EXISTS `alertas_abandono`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertas_abandono` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `tipo_alerta` enum('inactividad_detectada','riesgo_abandono','abandono_potencial','reactivacion') COLLATE utf8mb4_unicode_ci NOT NULL,
  `dias_sin_actividad` int NOT NULL COMMENT 'Días sin actividad al momento de la alerta',
  `fecha_ultima_actividad` date DEFAULT NULL COMMENT 'Fecha de la última actividad registrada',
  `nivel_severidad` enum('leve','moderado','grave','critico') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mensaje de la alerta',
  `accion_sugerida` text COLLATE utf8mb4_unicode_ci COMMENT 'Acción recomendada según reglamento',
  `notificados` text COLLATE utf8mb4_unicode_ci COMMENT 'RUTs de usuarios notificados (JSON array)',
  `fecha_alerta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `alerta_atendida` tinyint(1) DEFAULT '0',
  `fecha_atencion` timestamp NULL DEFAULT NULL,
  `atendida_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones_atencion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `atendida_por` (`atendida_por`),
  KEY `idx_alerta_proyecto` (`proyecto_id`,`fecha_alerta`),
  KEY `idx_alerta_tipo` (`tipo_alerta`,`nivel_severidad`),
  KEY `idx_alerta_pendiente` (`alerta_atendida`,`fecha_alerta`),
  CONSTRAINT `alertas_abandono_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alertas_abandono_ibfk_2` FOREIGN KEY (`atendida_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas_abandono`
--

LOCK TABLES `alertas_abandono` WRITE;
/*!40000 ALTER TABLE `alertas_abandono` DISABLE KEYS */;
/*!40000 ALTER TABLE `alertas_abandono` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones_propuestas`
--

DROP TABLE IF EXISTS `asignaciones_propuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones_propuestas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `propuesta_id` int NOT NULL,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asignacion` (`propuesta_id`,`profesor_rut`),
  KEY `profesor_rut` (`profesor_rut`),
  KEY `idx_asignaciones_propuesta` (`propuesta_id`),
  CONSTRAINT `asignaciones_propuestas_ibfk_1` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_propuestas_ibfk_2` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_propuestas`
--

LOCK TABLES `asignaciones_propuestas` WRITE;
/*!40000 ALTER TABLE `asignaciones_propuestas` DISABLE KEYS */;
/*!40000 ALTER TABLE `asignaciones_propuestas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones_proyectos`
--

DROP TABLE IF EXISTS `asignaciones_proyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones_proyectos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_profesor_id` int NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_desasignacion` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `asignado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asignacion_activa` (`proyecto_id`,`rol_profesor_id`,`activo`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_proyecto_activo` (`proyecto_id`,`activo`),
  KEY `idx_profesor_activo` (`profesor_rut`,`activo`),
  KEY `idx_rol_activo` (`rol_profesor_id`,`activo`),
  KEY `idx_asignaciones_proyecto` (`proyecto_id`),
  CONSTRAINT `asignaciones_proyectos_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_proyectos_ibfk_2` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `asignaciones_proyectos_ibfk_3` FOREIGN KEY (`rol_profesor_id`) REFERENCES `roles_profesores` (`id`),
  CONSTRAINT `asignaciones_proyectos_ibfk_4` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_proyectos`
--

LOCK TABLES `asignaciones_proyectos` WRITE;
/*!40000 ALTER TABLE `asignaciones_proyectos` DISABLE KEYS */;
/*!40000 ALTER TABLE `asignaciones_proyectos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avances`
--

DROP TABLE IF EXISTS `avances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_id` int NOT NULL DEFAULT '1',
  `comentarios_profesor` text COLLATE utf8mb4_unicode_ci,
  `fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `profesor_revisor` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `profesor_revisor` (`profesor_revisor`),
  KEY `idx_avances_proyecto` (`proyecto_id`),
  KEY `idx_avances_estado` (`estado_id`),
  CONSTRAINT `avances_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `avances_ibfk_2` FOREIGN KEY (`profesor_revisor`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avances`
--

LOCK TABLES `avances` WRITE;
/*!40000 ALTER TABLE `avances` DISABLE KEYS */;
/*!40000 ALTER TABLE `avances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bloqueos_horarios`
--

DROP TABLE IF EXISTS `bloqueos_horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bloqueos_horarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('vacaciones','licencia','feriado','personal','academico') COLLATE utf8mb4_unicode_ci DEFAULT 'personal',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bloqueo_usuario_fecha` (`usuario_rut`,`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `bloqueos_horarios_ibfk_1` FOREIGN KEY (`usuario_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bloqueos_horarios`
--

LOCK TABLES `bloqueos_horarios` WRITE;
/*!40000 ALTER TABLE `bloqueos_horarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `bloqueos_horarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carreras`
--

DROP TABLE IF EXISTS `carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carreras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facultad_id` int NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo_profesional` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej: Ingeniero Civil en InformÃ¡tica',
  `grado_academico` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ej: Licenciado en Ciencias de la IngenierÃ­a',
  `duracion_semestres` int NOT NULL DEFAULT '10',
  `jefe_carrera_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'DEPRECATED: Usar tabla jefes_carreras',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `modalidad` enum('presencial','semipresencial','online') COLLATE utf8mb4_unicode_ci DEFAULT 'presencial',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_facultad` (`facultad_id`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_jefe_carrera` (`jefe_carrera_rut`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `carreras_ibfk_1` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_carreras_jefe` FOREIGN KEY (`jefe_carrera_rut`) REFERENCES `usuarios` (`rut`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carreras`
--

LOCK TABLES `carreras` WRITE;
/*!40000 ALTER TABLE `carreras` DISABLE KEYS */;
/*!40000 ALTER TABLE `carreras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colaboradores_externos`
--

DROP TABLE IF EXISTS `colaboradores_externos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colaboradores_externos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_completo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rut` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT opcional (puede ser extranjero sin RUT)',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email personal o corporativo (NO institucional UBB)',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entidad_id` int DEFAULT NULL COMMENT 'Empresa/institución a la que pertenece',
  `cargo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Cargo en la empresa (ej: Supervisor, Gerente de Proyectos)',
  `area_departamento` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Área o departamento dentro de la empresa',
  `especialidad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Especialidad o área de expertise',
  `anos_experiencia` int DEFAULT NULL COMMENT 'Años de experiencia profesional',
  `linkedin` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Perfil de LinkedIn',
  `tipo_colaborador` enum('supervisor_empresa','mentor','asesor_tecnico','cliente','evaluador_externo','otro') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'supervisor_empresa',
  `biografia` text COLLATE utf8mb4_unicode_ci COMMENT 'Breve biografía o descripción profesional',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Si el colaborador está activo para nuevas asignaciones',
  `verificado` tinyint(1) DEFAULT '0' COMMENT 'Si se ha verificado la identidad del colaborador',
  `fecha_verificacion` timestamp NULL DEFAULT NULL,
  `verificado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del admin que verificó',
  `creado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del admin/profesor que registró al colaborador',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`),
  KEY `creado_por` (`creado_por`),
  KEY `verificado_por` (`verificado_por`),
  KEY `idx_email` (`email`),
  KEY `idx_entidad` (`entidad_id`),
  KEY `idx_activo` (`activo`),
  KEY `idx_tipo` (`tipo_colaborador`),
  CONSTRAINT `colaboradores_externos_ibfk_1` FOREIGN KEY (`entidad_id`) REFERENCES `entidades_externas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `colaboradores_externos_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `colaboradores_externos_ibfk_3` FOREIGN KEY (`verificado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colaboradores_externos`
--

LOCK TABLES `colaboradores_externos` WRITE;
/*!40000 ALTER TABLE `colaboradores_externos` DISABLE KEYS */;
/*!40000 ALTER TABLE `colaboradores_externos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colaboradores_proyectos`
--

DROP TABLE IF EXISTS `colaboradores_proyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colaboradores_proyectos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `colaborador_id` int NOT NULL,
  `rol_en_proyecto` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej: Supervisor de Empresa, Mentor, Asesor Técnico',
  `descripcion_rol` text COLLATE utf8mb4_unicode_ci COMMENT 'Descripción detallada de sus responsabilidades',
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL COMMENT 'NULL si aún está activo',
  `horas_dedicadas` decimal(6,2) DEFAULT NULL COMMENT 'Horas estimadas/reales dedicadas al proyecto',
  `frecuencia_interaccion` enum('diaria','semanal','quincenal','mensual','por_demanda') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `puede_evaluar` tinyint(1) DEFAULT '0' COMMENT 'Si puede evaluar al estudiante',
  `evaluacion_realizada` tinyint(1) DEFAULT '0',
  `comentarios_participacion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `motivo_desvinculacion` text COLLATE utf8mb4_unicode_ci COMMENT 'Si se desvinculó, explicar por qué',
  `asignado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Quién lo asignó al proyecto',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_colaborador_proyecto_activo` (`proyecto_id`,`colaborador_id`,`activo`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_proyecto` (`proyecto_id`),
  KEY `idx_colaborador` (`colaborador_id`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `colaboradores_proyectos_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `colaboradores_proyectos_ibfk_2` FOREIGN KEY (`colaborador_id`) REFERENCES `colaboradores_externos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `colaboradores_proyectos_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colaboradores_proyectos`
--

LOCK TABLES `colaboradores_proyectos` WRITE;
/*!40000 ALTER TABLE `colaboradores_proyectos` DISABLE KEYS */;
/*!40000 ALTER TABLE `colaboradores_proyectos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comentarios_version`
--

DROP TABLE IF EXISTS `comentarios_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comentarios_version` (
  `id` int NOT NULL AUTO_INCREMENT,
  `version_id` int NOT NULL,
  `autor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor_nombre` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `autor_rol` enum('estudiante','profesor_guia','profesor_informante','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentario` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_comentario` enum('general','sugerencia','error','aprobacion','rechazo') COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `prioridad` enum('baja','media','alta') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `seccion_referencia` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Cap├¡tulo 3, P├ígina 15, etc.',
  `resuelto` tinyint(1) DEFAULT '0',
  `fecha_resolucion` timestamp NULL DEFAULT NULL,
  `respuesta_comentario_id` int DEFAULT NULL COMMENT 'ID del comentario al que responde',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `respuesta_comentario_id` (`respuesta_comentario_id`),
  KEY `idx_version` (`version_id`),
  KEY `idx_autor` (`autor_rut`),
  KEY `idx_fecha` (`created_at`),
  CONSTRAINT `comentarios_version_ibfk_1` FOREIGN KEY (`version_id`) REFERENCES `versiones_documento` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comentarios_version_ibfk_2` FOREIGN KEY (`autor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `comentarios_version_ibfk_3` FOREIGN KEY (`respuesta_comentario_id`) REFERENCES `comentarios_version` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comentarios_version`
--

LOCK TABLES `comentarios_version` WRITE;
/*!40000 ALTER TABLE `comentarios_version` DISABLE KEYS */;
/*!40000 ALTER TABLE `comentarios_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comision_evaluadora`
--

DROP TABLE IF EXISTS `comision_evaluadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comision_evaluadora` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_comision` enum('presidente','secretario','vocal','suplente') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_designacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_remocion` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `asignado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_comision_rol` (`proyecto_id`,`rol_comision`,`activo`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_comision_proyecto` (`proyecto_id`,`activo`),
  KEY `idx_comision_profesor` (`profesor_rut`,`activo`),
  CONSTRAINT `comision_evaluadora_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comision_evaluadora_ibfk_2` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `comision_evaluadora_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comision_evaluadora`
--

LOCK TABLES `comision_evaluadora` WRITE;
/*!40000 ALTER TABLE `comision_evaluadora` DISABLE KEYS */;
/*!40000 ALTER TABLE `comision_evaluadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_alertas`
--

DROP TABLE IF EXISTS `configuracion_alertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_alertas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dias_alerta_entregas` int DEFAULT '3',
  `dias_alerta_reuniones` int DEFAULT '1',
  `dias_alerta_defensas` int DEFAULT '7',
  `alertas_entregas` tinyint(1) DEFAULT '1',
  `alertas_reuniones` tinyint(1) DEFAULT '1',
  `alertas_retrasos` tinyint(1) DEFAULT '1',
  `alertas_hitos` tinyint(1) DEFAULT '1',
  `enviar_email_estudiante` tinyint(1) DEFAULT '1',
  `enviar_email_profesor` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_config_proyecto` (`proyecto_id`),
  KEY `profesor_rut` (`profesor_rut`),
  CONSTRAINT `configuracion_alertas_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `configuracion_alertas_ibfk_2` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_alertas`
--

LOCK TABLES `configuracion_alertas` WRITE;
/*!40000 ALTER TABLE `configuracion_alertas` DISABLE KEYS */;
/*!40000 ALTER TABLE `configuracion_alertas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_matching`
--

DROP TABLE IF EXISTS `configuracion_matching`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_matching` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tipo` enum('entero','decimal','booleano','texto') COLLATE utf8mb4_unicode_ci DEFAULT 'texto',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=300 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_matching`
--

LOCK TABLES `configuracion_matching` WRITE;
/*!40000 ALTER TABLE `configuracion_matching` DISABLE KEYS */;
INSERT INTO `configuracion_matching` VALUES (1,'duracion_reunion_defecto','60','DuraciÃ³n por defecto de las reuniones en minutos','entero','2025-12-01 19:45:53'),(2,'dias_anticipacion_minima','1','DÃ­as mÃ­nimos de anticipaciÃ³n para agendar reuniones','entero','2025-12-01 19:45:53'),(3,'dias_anticipacion_maxima','30','DÃ­as mÃ¡ximos de anticipaciÃ³n para agendar reuniones','entero','2025-12-01 19:45:53'),(4,'horario_inicio_jornada','08:00','Hora de inicio de la jornada laboral','texto','2025-12-01 19:45:53'),(5,'horario_fin_jornada','18:00','Hora de fin de la jornada laboral','texto','2025-12-01 19:45:53'),(6,'matching_automatico_activo','true','Si el matching automÃ¡tico estÃ¡ activo','booleano','2025-12-01 19:45:53'),(7,'tiempo_respuesta_horas','48','Tiempo mÃ¡ximo en horas para responder solicitudes','entero','2025-12-01 19:45:53'),(8,'permitir_reuniones_sabado','false','Permitir agendar reuniones los sÃ¡bados','booleano','2025-12-01 19:45:53'),(9,'permitir_reuniones_domingo','false','Permitir agendar reuniones los domingos','booleano','2025-12-01 19:45:53'),(272,'dias_sin_actividad_alerta','30','Días sin actividad para enviar alerta de inactividad','entero','2025-12-18 03:32:17'),(273,'dias_sin_actividad_riesgo','45','Días sin actividad para marcar proyecto en riesgo','entero','2025-12-18 03:32:17'),(274,'dias_sin_actividad_abandono','60','Días sin actividad para considerar abandono potencial','entero','2025-12-18 03:32:17'),(275,'dias_habiles_informante','15','Días hábiles que tiene el profesor Informante para evaluar informe final','entero','2025-12-18 03:32:17'),(276,'notificar_informante_auto','true','Notificar automáticamente al informante cuando se entrega el informe final','booleano','2025-12-18 03:32:17');
/*!40000 ALTER TABLE `configuracion_matching` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_sistema`
--

DROP TABLE IF EXISTS `configuracion_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_sistema` (
  `id_configuracion` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identificador único de la configuración',
  `valor` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Valor de la configuración (se convierte según el tipo)',
  `tipo` enum('entero','booleano','texto') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de dato del valor',
  `descripcion` text COLLATE utf8mb4_unicode_ci COMMENT 'Descripción de qué hace esta configuración',
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'general' COMMENT 'Categoría para agrupar configuraciones (alertas, sistema, validaciones, etc.)',
  `modificable` tinyint(1) DEFAULT '1' COMMENT 'Si false, no se puede modificar desde el panel (solo por DB)',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modificado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del Super Admin que hizo el último cambio',
  PRIMARY KEY (`id_configuracion`),
  UNIQUE KEY `clave` (`clave`),
  KEY `modificado_por` (`modificado_por`),
  KEY `idx_clave` (`clave`),
  KEY `idx_categoria` (`categoria`),
  CONSTRAINT `configuracion_sistema_ibfk_1` FOREIGN KEY (`modificado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES (1,'dias_sin_actividad_alerta','30','entero','Días sin actividad en un proyecto antes de enviar alerta de inactividad','alertas',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(2,'dias_habiles_informante','15','entero','Días máximos que tiene un profesor informante para evaluar (días hábiles)','evaluaciones',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(3,'UMBRAL_INACTIVIDAD_DIAS','30','entero','[Alias] Días sin actividad - Usado por panel de configuración','alertas',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(4,'DIAS_PREVIOS_ALERTA_FECHAS','2','entero','Días de anticipación para enviar alertas de fechas límite (48h y 24h)','alertas',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(5,'PLAZO_EVALUACION_DIAS','15','entero','[Alias] Plazo evaluación - Usado por panel de configuración','evaluaciones',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(6,'DIAS_ALERTA_EVALUACION','3','entero','Días antes del vencimiento del plazo para alertar sobre evaluación pendiente','alertas',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(7,'HORA_RECORDATORIO_REUNIONES','08:00','texto','Hora del día para enviar recordatorios de reuniones (formato HH:MM)','alertas',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(8,'HORA_ALERTA_EVALUACIONES','09:00','texto','Hora del día para enviar alertas de evaluaciones pendientes (formato HH:MM)','alertas',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(9,'MAX_PROYECTOS_POR_PROFESOR','5','entero','Número máximo de proyectos simultáneos que puede tener un profesor','validaciones',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(10,'MAX_ESTUDIANTES_POR_PROPUESTA','3','entero','Número máximo de estudiantes en una propuesta grupal','validaciones',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(11,'MIN_CARACTERES_PROPUESTA','200','entero','Mínimo de caracteres requeridos en la descripción de una propuesta','validaciones',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(12,'DURACION_MAXIMA_PROYECTO_SEMESTRES','2','entero','Duración máxima permitida de un proyecto de titulación en semestres','validaciones',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(13,'NOTIFICACIONES_EMAIL_ACTIVAS','true','booleano','Si se envían notificaciones por correo electrónico','notificaciones',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(14,'NOTIFICACIONES_PUSH_ACTIVAS','true','booleano','Si se envían notificaciones push en tiempo real vía WebSocket','notificaciones',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(15,'NOTIFICACIONES_NAVEGADOR_ACTIVAS','true','booleano','Si se muestran notificaciones del navegador (browser notifications)','notificaciones',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(16,'REQUIERE_APROBACION_JEFE_CARRERA','true','booleano','Si las propuestas requieren aprobación del jefe de carrera antes de asignar profesores','flujo',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(17,'PERMITE_AUTOASIGNACION_PROFESORES','false','booleano','Si los profesores pueden autoasignarse a propuestas sin aprobación del admin','flujo',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(18,'PERMITE_MODIFICACION_PROPUESTA_APROBADA','false','booleano','Si se permite modificar una propuesta después de ser aprobada','flujo',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(19,'NOMBRE_INSTITUCION','Universidad del Bío-Bío','texto','Nombre de la institución educativa','sistema',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(20,'EMAIL_SOPORTE','soporte@actitubb.cl','texto','Email de contacto para soporte técnico','sistema',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(21,'MANTENIMIENTO_ACTIVO','false','booleano','Modo mantenimiento - bloquea acceso a usuarios (excepto Super Admin)','sistema',1,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL),(22,'VERSION_SISTEMA','1.0.0','texto','Versión actual del sistema','sistema',0,'2025-12-18 03:32:17','2025-12-18 03:32:17',NULL);
/*!40000 ALTER TABLE `configuracion_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cronogramas_proyecto`
--

DROP TABLE IF EXISTS `cronogramas_proyecto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cronogramas_proyecto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `nombre_cronograma` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Cronograma Principal',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha_inicio` date NOT NULL,
  `fecha_fin_estimada` date NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `creado_por_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aprobado_por_estudiante` tinyint(1) DEFAULT '0',
  `fecha_aprobacion_estudiante` timestamp NULL DEFAULT NULL,
  `alertas_activas` tinyint(1) DEFAULT '1',
  `dias_alerta_previa` int DEFAULT '3',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creado_por_rut` (`creado_por_rut`),
  KEY `idx_proyecto_activo` (`proyecto_id`,`activo`),
  KEY `idx_fechas_cronograma` (`fecha_inicio`,`fecha_fin_estimada`),
  CONSTRAINT `cronogramas_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cronogramas_proyecto_ibfk_2` FOREIGN KEY (`creado_por_rut`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cronogramas_proyecto`
--

LOCK TABLES `cronogramas_proyecto` WRITE;
/*!40000 ALTER TABLE `cronogramas_proyecto` DISABLE KEYS */;
/*!40000 ALTER TABLE `cronogramas_proyecto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamentos`
--

DROP TABLE IF EXISTS `departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facultad_id` int NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `jefe_departamento_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del profesor que es jefe de departamento',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_facultad` (`facultad_id`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_activo` (`activo`),
  KEY `fk_departamentos_jefe` (`jefe_departamento_rut`),
  CONSTRAINT `departamentos_ibfk_1` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_departamentos_jefe` FOREIGN KEY (`jefe_departamento_rut`) REFERENCES `usuarios` (`rut`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `departamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamentos_carreras`
--

DROP TABLE IF EXISTS `departamentos_carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamentos_carreras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `departamento_id` int NOT NULL,
  `carrera_id` int NOT NULL,
  `es_principal` tinyint(1) DEFAULT '0' COMMENT 'Indica si es el departamento principal de la carrera',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_departamento_carrera` (`departamento_id`,`carrera_id`),
  KEY `idx_departamento` (`departamento_id`,`activo`),
  KEY `idx_carrera` (`carrera_id`,`activo`),
  KEY `idx_principal` (`es_principal`,`activo`),
  CONSTRAINT `departamentos_carreras_ibfk_1` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `departamentos_carreras_ibfk_2` FOREIGN KEY (`carrera_id`) REFERENCES `carreras` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos_carreras`
--

LOCK TABLES `departamentos_carreras` WRITE;
/*!40000 ALTER TABLE `departamentos_carreras` DISABLE KEYS */;
/*!40000 ALTER TABLE `departamentos_carreras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dias_feriados`
--

DROP TABLE IF EXISTS `dias_feriados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `dias_feriados` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre del feriado',
  `tipo` enum('nacional','regional','institucional') COLLATE utf8mb4_unicode_ci DEFAULT 'nacional',
  `es_inamovible` tinyint(1) DEFAULT '1' COMMENT 'Si el feriado no se puede mover (ej: 25 de diciembre)',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fecha` (`fecha`),
  KEY `idx_fecha_feriado` (`fecha`,`activo`),
  KEY `idx_tipo_feriado` (`tipo`,`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dias_feriados`
--

LOCK TABLES `dias_feriados` WRITE;
/*!40000 ALTER TABLE `dias_feriados` DISABLE KEYS */;
/*!40000 ALTER TABLE `dias_feriados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidad_horarios`
--

DROP TABLE IF EXISTS `disponibilidad_horarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidad_horarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_disponibilidad_usuario` (`usuario_rut`,`activo`),
  KEY `idx_disponibilidad_dia` (`dia_semana`,`activo`),
  CONSTRAINT `disponibilidad_horarios_ibfk_1` FOREIGN KEY (`usuario_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad_horarios`
--

LOCK TABLES `disponibilidad_horarios` WRITE;
/*!40000 ALTER TABLE `disponibilidad_horarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `disponibilidad_horarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `disponibilidades`
--

DROP TABLE IF EXISTS `disponibilidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `disponibilidades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_disponibilidad_usuario` (`usuario_rut`,`activo`),
  KEY `idx_disponibilidad_dia` (`dia_semana`,`activo`),
  CONSTRAINT `disponibilidades_ibfk_1` FOREIGN KEY (`usuario_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidades`
--

LOCK TABLES `disponibilidades` WRITE;
/*!40000 ALTER TABLE `disponibilidades` DISABLE KEYS */;
/*!40000 ALTER TABLE `disponibilidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entidades_externas`
--

DROP TABLE IF EXISTS `entidades_externas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entidades_externas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la empresa/institución',
  `razon_social` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Razón social completa',
  `rut_empresa` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT de la empresa (formato: 12345678-9)',
  `tipo` enum('empresa_privada','empresa_publica','institucion_educativa','ong','organismo_publico','otra') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'empresa_privada',
  `email_contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `sitio_web` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci COMMENT 'Descripción de la entidad',
  `area_actividad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Área de actividad (tecnología, salud, educación, etc.)',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entidades_externas`
--

LOCK TABLES `entidades_externas` WRITE;
/*!40000 ALTER TABLE `entidades_externas` DISABLE KEYS */;
/*!40000 ALTER TABLE `entidades_externas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_propuestas`
--

DROP TABLE IF EXISTS `estados_propuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_propuestas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_propuestas`
--

LOCK TABLES `estados_propuestas` WRITE;
/*!40000 ALTER TABLE `estados_propuestas` DISABLE KEYS */;
INSERT INTO `estados_propuestas` VALUES (1,'pendiente','Propuesta enviada, esperando asignaciÃ³n de profesor','2025-12-01 19:45:53'),(2,'en_revision','Propuesta siendo revisada por profesor','2025-12-01 19:45:53'),(3,'correcciones','Propuesta requiere correcciones del estudiante','2025-12-01 19:45:53'),(4,'aprobada','Propuesta aprobada, se puede crear proyecto','2025-12-01 19:45:53'),(5,'rechazada','Propuesta rechazada','2025-12-01 19:45:53');
/*!40000 ALTER TABLE `estados_propuestas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_proyectos`
--

DROP TABLE IF EXISTS `estados_proyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_proyectos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=450 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_proyectos`
--

LOCK TABLES `estados_proyectos` WRITE;
/*!40000 ALTER TABLE `estados_proyectos` DISABLE KEYS */;
INSERT INTO `estados_proyectos` VALUES (1,'esperando_asignacion_profesores','Proyecto creado esperando asignaciÃ³n de los 3 roles de profesores','2025-12-01 19:45:53'),(2,'en_desarrollo','Proyecto en fase de desarrollo','2025-12-01 19:45:53'),(3,'avance_enviado','Avance enviado para revisiÃ³n','2025-12-01 19:45:53'),(4,'avance_en_revision','Avance siendo revisado','2025-12-01 19:45:53'),(5,'avance_con_comentarios','Avance con comentarios del profesor','2025-12-01 19:45:53'),(6,'avance_aprobado','Avance aprobado','2025-12-01 19:45:53'),(7,'pausado','Proyecto pausado temporalmente','2025-12-01 19:45:53'),(8,'completado','Proyecto completado','2025-12-01 19:45:53'),(9,'presentado','Proyecto presentado','2025-12-01 19:45:53'),(10,'defendido','Proyecto defendido exitosamente','2025-12-01 19:45:53'),(11,'retrasado','Proyecto con retraso en cronograma','2025-12-01 19:45:53'),(12,'en_riesgo','Proyecto en riesgo de no completarse','2025-12-01 19:45:53'),(13,'revision_urgente','Proyecto requiere revisiÃ³n urgente','2025-12-01 19:45:53'),(14,'excelente_progreso','Proyecto con excelente progreso','2025-12-01 19:45:53');
/*!40000 ALTER TABLE `estados_proyectos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiantes_carreras`
--

DROP TABLE IF EXISTS `estudiantes_carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiantes_carreras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `carrera_id` int NOT NULL,
  `ano_ingreso` int NOT NULL,
  `semestre_actual` int DEFAULT '1',
  `estado_estudiante` enum('regular','congelado','egresado','retirado','titulado') COLLATE utf8mb4_unicode_ci DEFAULT 'regular',
  `fecha_ingreso` date NOT NULL,
  `fecha_egreso` date DEFAULT NULL,
  `fecha_titulacion` date DEFAULT NULL,
  `promedio_acumulado` decimal(3,2) DEFAULT NULL,
  `creditos_aprobados` int DEFAULT '0',
  `es_carrera_principal` tinyint(1) DEFAULT '1' COMMENT 'Para estudiantes con doble titulaciÃ³n',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_estudiante_carrera` (`estudiante_rut`,`carrera_id`),
  KEY `idx_estudiante` (`estudiante_rut`),
  KEY `idx_carrera` (`carrera_id`),
  KEY `idx_ano_ingreso` (`ano_ingreso`),
  KEY `idx_estado` (`estado_estudiante`),
  CONSTRAINT `estudiantes_carreras_ibfk_1` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `estudiantes_carreras_ibfk_2` FOREIGN KEY (`carrera_id`) REFERENCES `carreras` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes_carreras`
--

LOCK TABLES `estudiantes_carreras` WRITE;
/*!40000 ALTER TABLE `estudiantes_carreras` DISABLE KEYS */;
/*!40000 ALTER TABLE `estudiantes_carreras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiantes_propuestas`
--

DROP TABLE IF EXISTS `estudiantes_propuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiantes_propuestas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `propuesta_id` int NOT NULL,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_creador` tinyint(1) DEFAULT '0',
  `orden` int DEFAULT '1',
  `fecha_agregado` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_estudiante_propuesta` (`propuesta_id`,`estudiante_rut`),
  KEY `idx_propuesta_estudiante` (`propuesta_id`),
  KEY `idx_estudiante_propuestas` (`estudiante_rut`),
  CONSTRAINT `estudiantes_propuestas_ibfk_1` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `estudiantes_propuestas_ibfk_2` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes_propuestas`
--

LOCK TABLES `estudiantes_propuestas` WRITE;
/*!40000 ALTER TABLE `estudiantes_propuestas` DISABLE KEYS */;
/*!40000 ALTER TABLE `estudiantes_propuestas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiantes_proyectos`
--

DROP TABLE IF EXISTS `estudiantes_proyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiantes_proyectos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_creador` tinyint(1) DEFAULT '0',
  `orden` int DEFAULT '1',
  `fecha_agregado` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_estudiante_proyecto` (`proyecto_id`,`estudiante_rut`),
  KEY `idx_proyecto_estudiante` (`proyecto_id`),
  KEY `idx_estudiante_proyectos` (`estudiante_rut`),
  CONSTRAINT `estudiantes_proyectos_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `estudiantes_proyectos_ibfk_2` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes_proyectos`
--

LOCK TABLES `estudiantes_proyectos` WRITE;
/*!40000 ALTER TABLE `estudiantes_proyectos` DISABLE KEYS */;
/*!40000 ALTER TABLE `estudiantes_proyectos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluaciones_colaboradores_externos`
--

DROP TABLE IF EXISTS `evaluaciones_colaboradores_externos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluaciones_colaboradores_externos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `colaborador_proyecto_id` int NOT NULL COMMENT 'Relación entre colaborador y proyecto',
  `proyecto_id` int NOT NULL,
  `colaborador_id` int NOT NULL,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_evaluacion` date NOT NULL,
  `calificacion` decimal(3,1) DEFAULT NULL COMMENT 'Nota de 1.0 a 7.0 (sistema chileno)',
  `asistencia_puntualidad` int DEFAULT NULL COMMENT 'Escala 1-10',
  `calidad_trabajo` int DEFAULT NULL COMMENT 'Escala 1-10',
  `proactividad` int DEFAULT NULL COMMENT 'Escala 1-10',
  `trabajo_equipo` int DEFAULT NULL COMMENT 'Escala 1-10',
  `comunicacion` int DEFAULT NULL COMMENT 'Escala 1-10',
  `cumplimiento_plazos` int DEFAULT NULL COMMENT 'Escala 1-10',
  `fortalezas` text COLLATE utf8mb4_unicode_ci,
  `areas_mejora` text COLLATE utf8mb4_unicode_ci,
  `comentarios_generales` text COLLATE utf8mb4_unicode_ci,
  `recomendaria_estudiante` tinyint(1) DEFAULT NULL COMMENT '¿Recomendaría contratar al estudiante?',
  `documento_evaluacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Documento PDF de evaluación formal',
  `aprobada_por_profesor` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `colaborador_proyecto_id` (`colaborador_proyecto_id`),
  KEY `aprobada_por_profesor` (`aprobada_por_profesor`),
  KEY `idx_proyecto` (`proyecto_id`),
  KEY `idx_colaborador` (`colaborador_id`),
  KEY `idx_estudiante` (`estudiante_rut`),
  KEY `idx_fecha` (`fecha_evaluacion`),
  CONSTRAINT `evaluaciones_colaboradores_externos_ibfk_1` FOREIGN KEY (`colaborador_proyecto_id`) REFERENCES `colaboradores_proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluaciones_colaboradores_externos_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluaciones_colaboradores_externos_ibfk_3` FOREIGN KEY (`colaborador_id`) REFERENCES `colaboradores_externos` (`id`),
  CONSTRAINT `evaluaciones_colaboradores_externos_ibfk_4` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `evaluaciones_colaboradores_externos_ibfk_5` FOREIGN KEY (`aprobada_por_profesor`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones_colaboradores_externos`
--

LOCK TABLES `evaluaciones_colaboradores_externos` WRITE;
/*!40000 ALTER TABLE `evaluaciones_colaboradores_externos` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluaciones_colaboradores_externos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluaciones_proyecto`
--

DROP TABLE IF EXISTS `evaluaciones_proyecto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluaciones_proyecto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `profesor_rut` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_evaluador` enum('guia','informante','comision') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nota` decimal(3,1) NOT NULL,
  `comentarios` text COLLATE utf8mb4_unicode_ci,
  `fecha_evaluacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `evaluacion_unica` (`proyecto_id`,`profesor_rut`,`rol_evaluador`),
  KEY `profesor_rut` (`profesor_rut`),
  CONSTRAINT `evaluaciones_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluaciones_proyecto_ibfk_2` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones_proyecto`
--

LOCK TABLES `evaluaciones_proyecto` WRITE;
/*!40000 ALTER TABLE `evaluaciones_proyecto` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluaciones_proyecto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facultades`
--

DROP TABLE IF EXISTS `facultades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facultades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facultades`
--

LOCK TABLES `facultades` WRITE;
/*!40000 ALTER TABLE `facultades` DISABLE KEYS */;
/*!40000 ALTER TABLE `facultades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fechas`
--

DROP TABLE IF EXISTS `fechas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fechas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha` date NOT NULL COMMENT 'Fecha principal del evento',
  `tipo_fecha` enum('entrega_propuesta','entrega','entrega_avance','entrega_final','reunion','hito','deadline','presentacion','defensa','revision','academica','global','otro') COLLATE utf8mb4_unicode_ci DEFAULT 'otro',
  `es_global` tinyint(1) DEFAULT '0' COMMENT 'Si es true, visible para todos (fechas del admin)',
  `activa` tinyint(1) DEFAULT '1' COMMENT 'Para soft delete (solo fechas de calendario)',
  `habilitada` tinyint(1) DEFAULT '1' COMMENT 'Controla si el perÃ­odo estÃ¡ activo para recibir entregas',
  `permite_extension` tinyint(1) DEFAULT '1' COMMENT 'Si permite solicitar extensiÃ³n despuÃ©s de la fecha lÃ­mite',
  `requiere_entrega` tinyint(1) DEFAULT '0' COMMENT 'Si requiere entrega de archivos/documentos',
  `completada` tinyint(1) DEFAULT '0',
  `fecha_realizada` date DEFAULT NULL COMMENT 'Fecha en que se completÃ³ el evento',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `proyecto_id` int DEFAULT NULL COMMENT 'NULL para fechas globales, ID del proyecto para fechas especÃ­ficas',
  `creado_por_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del que creÃ³ la fecha (admin o profesor)',
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del profesor (para fechas especÃ­ficas profesor-estudiante)',
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del estudiante (para fechas especÃ­ficas)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `creado_por_rut` (`creado_por_rut`),
  KEY `profesor_rut` (`profesor_rut`),
  KEY `estudiante_rut` (`estudiante_rut`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_tipo_fecha` (`tipo_fecha`),
  KEY `idx_es_global` (`es_global`),
  KEY `idx_proyecto` (`proyecto_id`),
  KEY `idx_activa` (`activa`),
  KEY `idx_habilitada` (`habilitada`),
  CONSTRAINT `fechas_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fechas_ibfk_2` FOREIGN KEY (`creado_por_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `fechas_ibfk_3` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `fechas_ibfk_4` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fechas`
--

LOCK TABLES `fechas` WRITE;
/*!40000 ALTER TABLE `fechas` DISABLE KEYS */;
/*!40000 ALTER TABLE `fechas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_asignaciones`
--

DROP TABLE IF EXISTS `historial_asignaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_asignaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asignacion_id` int NOT NULL,
  `proyecto_id` int NOT NULL,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_profesor_id` int NOT NULL,
  `accion` enum('asignado','desasignado','modificado') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_accion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `realizado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `asignacion_id` (`asignacion_id`),
  KEY `rol_profesor_id` (`rol_profesor_id`),
  KEY `realizado_por` (`realizado_por`),
  KEY `idx_proyecto_historial` (`proyecto_id`),
  KEY `idx_profesor_historial` (`profesor_rut`),
  KEY `idx_fecha_historial` (`fecha_accion`),
  CONSTRAINT `historial_asignaciones_ibfk_1` FOREIGN KEY (`asignacion_id`) REFERENCES `asignaciones_proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_asignaciones_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_asignaciones_ibfk_3` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `historial_asignaciones_ibfk_4` FOREIGN KEY (`rol_profesor_id`) REFERENCES `roles_profesores` (`id`),
  CONSTRAINT `historial_asignaciones_ibfk_5` FOREIGN KEY (`realizado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_asignaciones`
--

LOCK TABLES `historial_asignaciones` WRITE;
/*!40000 ALTER TABLE `historial_asignaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_asignaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_estados_proyecto`
--

DROP TABLE IF EXISTS `historial_estados_proyecto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_estados_proyecto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `estado_anterior` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_nuevo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci COMMENT 'Raz├│n del cambio de estado',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `cambiado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_cambio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cambiado_por` (`cambiado_por`),
  KEY `idx_proyecto` (`proyecto_id`),
  KEY `idx_fecha` (`fecha_cambio`),
  CONSTRAINT `historial_estados_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_estados_proyecto_ibfk_2` FOREIGN KEY (`cambiado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_estados_proyecto`
--

LOCK TABLES `historial_estados_proyecto` WRITE;
/*!40000 ALTER TABLE `historial_estados_proyecto` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_estados_proyecto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_extensiones`
--

DROP TABLE IF EXISTS `historial_extensiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_extensiones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `solicitud_id` int NOT NULL,
  `proyecto_id` int NOT NULL,
  `accion` enum('solicitud_creada','en_revision','aprobada','rechazada','modificada') COLLATE utf8mb4_unicode_ci NOT NULL,
  `realizado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentarios` text COLLATE utf8mb4_unicode_ci,
  `fecha_accion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `realizado_por` (`realizado_por`),
  KEY `idx_historial_solicitud` (`solicitud_id`),
  KEY `idx_historial_proyecto` (`proyecto_id`),
  KEY `idx_historial_fecha` (`fecha_accion`),
  CONSTRAINT `historial_extensiones_ibfk_1` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_extension` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_extensiones_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_extensiones_ibfk_3` FOREIGN KEY (`realizado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_extensiones`
--

LOCK TABLES `historial_extensiones` WRITE;
/*!40000 ALTER TABLE `historial_extensiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_extensiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_reuniones`
--

DROP TABLE IF EXISTS `historial_reuniones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_reuniones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reunion_id` int DEFAULT NULL,
  `solicitud_id` int NOT NULL,
  `proyecto_id` int NOT NULL,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_propuesta` date NOT NULL,
  `hora_propuesta` time NOT NULL,
  `tipo_reunion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` enum('solicitud_creada','aceptada_profesor','aceptada_estudiante','confirmada','rechazada','cancelada','realizada') COLLATE utf8mb4_unicode_ci NOT NULL,
  `realizado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentarios` text COLLATE utf8mb4_unicode_ci,
  `fecha_accion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `solicitud_id` (`solicitud_id`),
  KEY `profesor_rut` (`profesor_rut`),
  KEY `estudiante_rut` (`estudiante_rut`),
  KEY `realizado_por` (`realizado_por`),
  KEY `idx_historial_reunion` (`reunion_id`),
  KEY `idx_historial_proyecto` (`proyecto_id`),
  KEY `idx_historial_fecha` (`fecha_accion`),
  KEY `idx_historial_accion` (`accion`),
  CONSTRAINT `historial_reuniones_ibfk_1` FOREIGN KEY (`reunion_id`) REFERENCES `reuniones_calendario` (`id`) ON DELETE SET NULL,
  CONSTRAINT `historial_reuniones_ibfk_2` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_reunion` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_reuniones_ibfk_3` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_reuniones_ibfk_4` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `historial_reuniones_ibfk_5` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `historial_reuniones_ibfk_6` FOREIGN KEY (`realizado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_reuniones`
--

LOCK TABLES `historial_reuniones` WRITE;
/*!40000 ALTER TABLE `historial_reuniones` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_reuniones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_revisiones_propuestas`
--

DROP TABLE IF EXISTS `historial_revisiones_propuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_revisiones_propuestas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `asignacion_id` int NOT NULL,
  `propuesta_id` int NOT NULL,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` enum('asignado','revision_iniciada','comentario_agregado','decision_tomada','desasignado') COLLATE utf8mb4_unicode_ci NOT NULL,
  `decision` enum('aprobar','rechazar','solicitar_correcciones') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comentarios` text COLLATE utf8mb4_unicode_ci,
  `fecha_accion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `realizado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT de quien realizó la acción (puede ser el mismo profesor)',
  PRIMARY KEY (`id`),
  KEY `asignacion_id` (`asignacion_id`),
  KEY `realizado_por` (`realizado_por`),
  KEY `idx_historial_propuesta` (`propuesta_id`),
  KEY `idx_historial_profesor` (`profesor_rut`),
  KEY `idx_historial_fecha` (`fecha_accion`),
  KEY `idx_historial_accion` (`accion`),
  CONSTRAINT `historial_revisiones_propuestas_ibfk_1` FOREIGN KEY (`asignacion_id`) REFERENCES `asignaciones_propuestas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_revisiones_propuestas_ibfk_2` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_revisiones_propuestas_ibfk_3` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `historial_revisiones_propuestas_ibfk_4` FOREIGN KEY (`realizado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_revisiones_propuestas`
--

LOCK TABLES `historial_revisiones_propuestas` WRITE;
/*!40000 ALTER TABLE `historial_revisiones_propuestas` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_revisiones_propuestas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hitos_cronograma`
--

DROP TABLE IF EXISTS `hitos_cronograma`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hitos_cronograma` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cronograma_id` int NOT NULL,
  `proyecto_id` int NOT NULL,
  `nombre_hito` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tipo_hito` enum('entrega_documento','revision_avance','reunion_seguimiento','defensa') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_limite` date NOT NULL,
  `fecha_entrega` timestamp NULL DEFAULT NULL,
  `estado` enum('pendiente','en_progreso','entregado','revisado','aprobado','rechazado','retrasado') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `porcentaje_avance` decimal(5,2) DEFAULT '0.00',
  `archivo_entrega` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_archivo_original` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comentarios_estudiante` text COLLATE utf8mb4_unicode_ci,
  `comentarios_profesor` text COLLATE utf8mb4_unicode_ci,
  `calificacion` decimal(3,1) DEFAULT NULL,
  `cumplido_en_fecha` tinyint(1) DEFAULT NULL,
  `dias_retraso` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cronograma_fecha` (`cronograma_id`,`fecha_limite`),
  KEY `idx_proyecto_estado` (`proyecto_id`,`estado`),
  KEY `idx_fecha_limite` (`fecha_limite`),
  KEY `idx_estado_fecha` (`estado`,`fecha_limite`),
  CONSTRAINT `hitos_cronograma_ibfk_1` FOREIGN KEY (`cronograma_id`) REFERENCES `cronogramas_proyecto` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hitos_cronograma_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hitos_cronograma_chk_1` CHECK (((`porcentaje_avance` >= 0) and (`porcentaje_avance` <= 100))),
  CONSTRAINT `hitos_cronograma_chk_2` CHECK (((`calificacion` >= 1.0) and (`calificacion` <= 7.0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hitos_cronograma`
--

LOCK TABLES `hitos_cronograma` WRITE;
/*!40000 ALTER TABLE `hitos_cronograma` DISABLE KEYS */;
/*!40000 ALTER TABLE `hitos_cronograma` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hitos_proyecto`
--

DROP TABLE IF EXISTS `hitos_proyecto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hitos_proyecto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tipo_hito` enum('inicio','planificacion','desarrollo','entrega_parcial','revision','testing','documentacion','entrega_final','defensa','cierre') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_objetivo` date NOT NULL,
  `fecha_completado` date DEFAULT NULL,
  `estado` enum('pendiente','en_progreso','completado','retrasado','cancelado') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `porcentaje_completado` decimal(5,2) DEFAULT '0.00',
  `peso_en_proyecto` decimal(4,1) DEFAULT '10.0',
  `archivo_entregable` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comentarios_estudiante` text COLLATE utf8mb4_unicode_ci,
  `comentarios_profesor` text COLLATE utf8mb4_unicode_ci,
  `calificacion` decimal(3,1) DEFAULT NULL,
  `hito_predecesor_id` int DEFAULT NULL,
  `es_critico` tinyint(1) DEFAULT '0',
  `creado_por_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `actualizado_por_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fecha_entrega_estudiante` date DEFAULT NULL,
  `fecha_limite_informante` date DEFAULT NULL,
  `informante_notificado` tinyint(1) DEFAULT '0',
  `fecha_notificacion_informante` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hito_predecesor_id` (`hito_predecesor_id`),
  KEY `creado_por_rut` (`creado_por_rut`),
  KEY `actualizado_por_rut` (`actualizado_por_rut`),
  KEY `idx_proyecto_estado` (`proyecto_id`,`estado`),
  KEY `idx_fecha_objetivo` (`fecha_objetivo`),
  KEY `idx_tipo_estado` (`tipo_hito`,`estado`),
  KEY `idx_hitos_proyecto_estado` (`proyecto_id`,`estado`),
  KEY `idx_hitos_fecha_objetivo` (`fecha_objetivo`),
  CONSTRAINT `hitos_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hitos_proyecto_ibfk_2` FOREIGN KEY (`hito_predecesor_id`) REFERENCES `hitos_proyecto` (`id`) ON DELETE SET NULL,
  CONSTRAINT `hitos_proyecto_ibfk_3` FOREIGN KEY (`creado_por_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `hitos_proyecto_ibfk_4` FOREIGN KEY (`actualizado_por_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `hitos_proyecto_chk_1` CHECK (((`porcentaje_completado` >= 0) and (`porcentaje_completado` <= 100))),
  CONSTRAINT `hitos_proyecto_chk_2` CHECK (((`peso_en_proyecto` >= 0) and (`peso_en_proyecto` <= 100))),
  CONSTRAINT `hitos_proyecto_chk_3` CHECK (((`calificacion` >= 1.0) and (`calificacion` <= 7.0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hitos_proyecto`
--

LOCK TABLES `hitos_proyecto` WRITE;
/*!40000 ALTER TABLE `hitos_proyecto` DISABLE KEYS */;
/*!40000 ALTER TABLE `hitos_proyecto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jefes_carreras`
--

DROP TABLE IF EXISTS `jefes_carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jefes_carreras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `carrera_id` int NOT NULL,
  `fecha_inicio` date NOT NULL DEFAULT (curdate()),
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_jefe_carrera` (`profesor_rut`,`carrera_id`),
  KEY `idx_profesor` (`profesor_rut`,`activo`),
  KEY `idx_carrera` (`carrera_id`,`activo`),
  CONSTRAINT `jefes_carreras_ibfk_1` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `jefes_carreras_ibfk_2` FOREIGN KEY (`carrera_id`) REFERENCES `carreras` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jefes_carreras`
--

LOCK TABLES `jefes_carreras` WRITE;
/*!40000 ALTER TABLE `jefes_carreras` DISABLE KEYS */;
INSERT INTO `jefes_carreras` VALUES (1,'98765432-1',201,'2025-12-01',NULL,1,'2025-12-01 21:36:52','2025-12-01 21:36:52'),(7,'11111111-1',10,'2025-12-01',NULL,1,'2025-12-02 02:37:26','2025-12-02 02:37:26'),(8,'11111111-1',9,'2025-12-01',NULL,1,'2025-12-02 02:37:31','2025-12-02 02:37:31');
/*!40000 ALTER TABLE `jefes_carreras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones_proyecto`
--

DROP TABLE IF EXISTS `notificaciones_proyecto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones_proyecto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `hito_cronograma_id` int DEFAULT NULL,
  `tipo_notificacion` enum('fecha_limite_proxima','entrega_retrasada','revision_pendiente','cronograma_modificado','nueva_entrega','proyecto_creado') COLLATE utf8mb4_unicode_ci NOT NULL,
  `destinatario_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_destinatario` enum('estudiante','profesor_guia','profesor_revisor','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `leida` tinyint(1) DEFAULT '0',
  `fecha_lectura` timestamp NULL DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `enviar_email` tinyint(1) DEFAULT '1',
  `email_enviado` tinyint(1) DEFAULT '0',
  `fecha_envio_email` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `hito_cronograma_id` (`hito_cronograma_id`),
  KEY `idx_destinatario_activa` (`destinatario_rut`,`activa`),
  KEY `idx_proyecto_tipo` (`proyecto_id`,`tipo_notificacion`),
  KEY `idx_fecha_creacion` (`created_at`),
  KEY `idx_no_leidas` (`destinatario_rut`,`leida`,`activa`),
  CONSTRAINT `notificaciones_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notificaciones_proyecto_ibfk_2` FOREIGN KEY (`hito_cronograma_id`) REFERENCES `hitos_cronograma` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notificaciones_proyecto_ibfk_3` FOREIGN KEY (`destinatario_rut`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones_proyecto`
--

LOCK TABLES `notificaciones_proyecto` WRITE;
/*!40000 ALTER TABLE `notificaciones_proyecto` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones_proyecto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `participantes_reuniones`
--

DROP TABLE IF EXISTS `participantes_reuniones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `participantes_reuniones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reunion_id` int NOT NULL,
  `usuario_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol` enum('organizador','participante','invitado') COLLATE utf8mb4_unicode_ci DEFAULT 'participante',
  `confirmado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participante` (`reunion_id`,`usuario_rut`),
  KEY `usuario_rut` (`usuario_rut`),
  CONSTRAINT `participantes_reuniones_ibfk_1` FOREIGN KEY (`reunion_id`) REFERENCES `reuniones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `participantes_reuniones_ibfk_2` FOREIGN KEY (`usuario_rut`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participantes_reuniones`
--

LOCK TABLES `participantes_reuniones` WRITE;
/*!40000 ALTER TABLE `participantes_reuniones` DISABLE KEYS */;
/*!40000 ALTER TABLE `participantes_reuniones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plantillas_documentos`
--

DROP TABLE IF EXISTS `plantillas_documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plantillas_documentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `tipo_documento` enum('propuesta','informe_avance','informe_final','presentacion','poster','acta','otro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_ruta` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_tipo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '.docx, .pdf, .pptx, etc.',
  `archivo_tamano_kb` int DEFAULT NULL,
  `carrera_id` int DEFAULT NULL COMMENT 'Si es NULL, aplica para todas las carreras',
  `departamento_id` int DEFAULT NULL COMMENT 'Si es NULL, aplica para todos los departamentos',
  `facultad_id` int DEFAULT NULL COMMENT 'Si es NULL, aplica para todas las facultades',
  `version_plantilla` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT '1.0',
  `formato_requerido` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'APA, IEEE, Vancouver, etc.',
  `instrucciones` text COLLATE utf8mb4_unicode_ci COMMENT 'Instrucciones de uso de la plantilla',
  `ejemplo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL a ejemplo de uso',
  `activa` tinyint(1) DEFAULT '1',
  `obligatoria` tinyint(1) DEFAULT '0' COMMENT 'Si es obligatorio usar esta plantilla',
  `orden_visualizacion` int DEFAULT '0',
  `creado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `actualizado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descargas` int DEFAULT '0' COMMENT 'Contador de descargas',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `departamento_id` (`departamento_id`),
  KEY `facultad_id` (`facultad_id`),
  KEY `creado_por` (`creado_por`),
  KEY `actualizado_por` (`actualizado_por`),
  KEY `idx_tipo` (`tipo_documento`),
  KEY `idx_carrera` (`carrera_id`),
  KEY `idx_activa` (`activa`),
  KEY `idx_orden` (`orden_visualizacion`),
  CONSTRAINT `plantillas_documentos_ibfk_1` FOREIGN KEY (`carrera_id`) REFERENCES `carreras` (`id`) ON DELETE SET NULL,
  CONSTRAINT `plantillas_documentos_ibfk_2` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `plantillas_documentos_ibfk_3` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `plantillas_documentos_ibfk_4` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `plantillas_documentos_ibfk_5` FOREIGN KEY (`actualizado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantillas_documentos`
--

LOCK TABLES `plantillas_documentos` WRITE;
/*!40000 ALTER TABLE `plantillas_documentos` DISABLE KEYS */;
INSERT INTO `plantillas_documentos` VALUES (1,'Plantilla Informe Final UBB','Plantilla oficial para informes finales de titulaci├│n seg├║n normas UBB','informe_final','plantilla_informe_final_ubb.docx','uploads/plantillas/plantilla_informe_final_ubb.docx','.docx',NULL,NULL,NULL,NULL,'1.0',NULL,NULL,NULL,1,1,0,'11111111-1',NULL,0,'2025-12-17 21:28:50','2025-12-17 21:28:50'),(2,'Plantilla Propuesta de Proyecto','Plantilla para propuestas de proyecto de titulaci├│n','propuesta','plantilla_propuesta_ubb.docx','uploads/plantillas/plantilla_propuesta_ubb.docx','.docx',NULL,NULL,NULL,NULL,'1.0',NULL,NULL,NULL,1,0,0,'11111111-1',NULL,0,'2025-12-17 21:28:50','2025-12-17 21:28:50');
/*!40000 ALTER TABLE `plantillas_documentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `profesores_departamentos`
--

DROP TABLE IF EXISTS `profesores_departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profesores_departamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `departamento_id` int NOT NULL,
  `es_principal` tinyint(1) DEFAULT '0' COMMENT 'Indica si es su departamento principal',
  `fecha_ingreso` date DEFAULT NULL,
  `fecha_salida` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_profesor_departamento` (`profesor_rut`,`departamento_id`),
  KEY `idx_profesor` (`profesor_rut`),
  KEY `idx_departamento` (`departamento_id`),
  KEY `idx_principal` (`es_principal`),
  CONSTRAINT `profesores_departamentos_ibfk_1` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `profesores_departamentos_ibfk_2` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profesores_departamentos`
--

LOCK TABLES `profesores_departamentos` WRITE;
/*!40000 ALTER TABLE `profesores_departamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `profesores_departamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `propuestas`
--

DROP TABLE IF EXISTS `propuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `propuestas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_id` int NOT NULL DEFAULT '1',
  `comentarios_profesor` text COLLATE utf8mb4_unicode_ci,
  `fecha_envio` date NOT NULL,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `fecha_aprobacion` date DEFAULT NULL,
  `proyecto_id` int DEFAULT NULL,
  `archivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_archivo_original` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modalidad` enum('desarrollo_software','investigacion') COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_estudiantes` int NOT NULL DEFAULT '1',
  `complejidad_estimada` enum('baja','media','alta') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'media',
  `justificacion_complejidad` text COLLATE utf8mb4_unicode_ci,
  `duracion_estimada_semestres` int NOT NULL DEFAULT '1',
  `area_tematica` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `objetivos_generales` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `objetivos_especificos` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `metodologia_propuesta` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `recursos_necesarios` text COLLATE utf8mb4_unicode_ci,
  `bibliografia` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_propuestas_estudiante` (`estudiante_rut`),
  KEY `idx_propuestas_estado` (`estado_id`),
  KEY `idx_propuestas_fecha_envio` (`fecha_envio`),
  CONSTRAINT `propuestas_ibfk_1` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `propuestas_ibfk_2` FOREIGN KEY (`estado_id`) REFERENCES `estados_propuestas` (`id`),
  CONSTRAINT `propuestas_chk_1` CHECK ((`numero_estudiantes` between 1 and 2)),
  CONSTRAINT `propuestas_chk_2` CHECK ((`duracion_estimada_semestres` between 1 and 2))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propuestas`
--

LOCK TABLES `propuestas` WRITE;
/*!40000 ALTER TABLE `propuestas` DISABLE KEYS */;
/*!40000 ALTER TABLE `propuestas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proyectos`
--

DROP TABLE IF EXISTS `proyectos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proyectos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `propuesta_id` int NOT NULL,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_id` int NOT NULL DEFAULT '1',
  `fecha_inicio` date NOT NULL,
  `fecha_entrega_estimada` date DEFAULT NULL,
  `fecha_entrega_real` date DEFAULT NULL,
  `fecha_defensa` date DEFAULT NULL,
  `objetivo_general` text COLLATE utf8mb4_unicode_ci,
  `objetivos_especificos` text COLLATE utf8mb4_unicode_ci,
  `metodologia` text COLLATE utf8mb4_unicode_ci,
  `recursos_requeridos` text COLLATE utf8mb4_unicode_ci,
  `bibliografia` text COLLATE utf8mb4_unicode_ci,
  `porcentaje_avance` decimal(5,2) DEFAULT '0.00',
  `nota_propuesta` decimal(3,1) DEFAULT NULL,
  `nota_proyecto` decimal(3,1) DEFAULT NULL,
  `nota_defensa` decimal(3,1) DEFAULT NULL,
  `nota_final` decimal(3,1) DEFAULT NULL,
  `estado_detallado` enum('inicializacion','planificacion','desarrollo_fase1','desarrollo_fase2','testing','documentacion','revision_final','preparacion_defensa','defendido','cerrado') COLLATE utf8mb4_unicode_ci DEFAULT 'inicializacion',
  `prioridad` enum('baja','media','alta','critica') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `riesgo_nivel` enum('bajo','medio','alto') COLLATE utf8mb4_unicode_ci DEFAULT 'medio',
  `documento_proyecto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documento_final` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `codigo_fuente` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones_profesor` text COLLATE utf8mb4_unicode_ci,
  `observaciones_estudiante` text COLLATE utf8mb4_unicode_ci,
  `ultimo_avance_fecha` date DEFAULT NULL,
  `proximo_hito_fecha` date DEFAULT NULL,
  `tiempo_dedicado_horas` int DEFAULT '0',
  `modalidad` enum('desarrollo_software','investigacion') COLLATE utf8mb4_unicode_ci NOT NULL,
  `complejidad` enum('baja','media','alta') COLLATE utf8mb4_unicode_ci NOT NULL,
  `duracion_semestres` int NOT NULL DEFAULT '1',
  `version_actual` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT '1.0',
  `ultima_actividad` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ultima_actividad_fecha` date DEFAULT NULL,
  `umbral_dias_riesgo` int DEFAULT '30',
  `umbral_dias_abandono` int DEFAULT '60',
  `alerta_inactividad_enviada` tinyint(1) DEFAULT '0',
  `fecha_alerta_inactividad` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `propuesta_id` (`propuesta_id`),
  KEY `idx_proyectos_estudiante` (`estudiante_rut`),
  KEY `idx_proyectos_estado` (`estado_id`),
  KEY `idx_proyectos_estado_detallado` (`estado_detallado`),
  KEY `idx_proyectos_modalidad` (`modalidad`),
  KEY `idx_proyectos_porcentaje_avance` (`porcentaje_avance`),
  KEY `idx_proyectos_activo` (`activo`),
  CONSTRAINT `proyectos_ibfk_1` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`),
  CONSTRAINT `proyectos_ibfk_2` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `proyectos_ibfk_3` FOREIGN KEY (`estado_id`) REFERENCES `estados_proyectos` (`id`),
  CONSTRAINT `proyectos_chk_1` CHECK (((`porcentaje_avance` >= 0) and (`porcentaje_avance` <= 100))),
  CONSTRAINT `proyectos_chk_2` CHECK (((`nota_propuesta` >= 1.0) and (`nota_propuesta` <= 7.0))),
  CONSTRAINT `proyectos_chk_3` CHECK (((`nota_proyecto` >= 1.0) and (`nota_proyecto` <= 7.0))),
  CONSTRAINT `proyectos_chk_4` CHECK (((`nota_defensa` >= 1.0) and (`nota_defensa` <= 7.0))),
  CONSTRAINT `proyectos_chk_5` CHECK (((`nota_final` >= 1.0) and (`nota_final` <= 7.0)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proyectos`
--

LOCK TABLES `proyectos` WRITE;
/*!40000 ALTER TABLE `proyectos` DISABLE KEYS */;
/*!40000 ALTER TABLE `proyectos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resultados_finales_proyecto`
--

DROP TABLE IF EXISTS `resultados_finales_proyecto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resultados_finales_proyecto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `estado_final` enum('aprobado','aprobado_con_distincion','aprobado_con_observaciones','reprobado','abandonado','anulado') COLLATE utf8mb4_unicode_ci NOT NULL,
  `evaluacion_profesor_guia` text COLLATE utf8mb4_unicode_ci COMMENT 'Evaluaci├│n final del profesor gu├¡a',
  `evaluacion_profesor_informante` text COLLATE utf8mb4_unicode_ci COMMENT 'Evaluaci├│n del profesor informante',
  `evaluacion_comision` text COLLATE utf8mb4_unicode_ci COMMENT 'Evaluaci├│n de la comisi├│n',
  `observaciones_finales` text COLLATE utf8mb4_unicode_ci,
  `recomendaciones` text COLLATE utf8mb4_unicode_ci,
  `areas_destacadas` text COLLATE utf8mb4_unicode_ci,
  `documento_final` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta al documento final aprobado',
  `acta_aprobacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta al acta de aprobaci├│n',
  `mencion_honores` tinyint(1) DEFAULT '0',
  `mencion_excelencia` tinyint(1) DEFAULT '0',
  `publicacion_recomendada` tinyint(1) DEFAULT '0' COMMENT 'Si se recomienda publicar',
  `fecha_aprobacion` date DEFAULT NULL,
  `fecha_cierre` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cerrado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `proyecto_id` (`proyecto_id`),
  KEY `cerrado_por` (`cerrado_por`),
  KEY `idx_proyecto` (`proyecto_id`),
  KEY `idx_estado` (`estado_final`),
  KEY `idx_fecha_cierre` (`fecha_cierre`),
  CONSTRAINT `resultados_finales_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resultados_finales_proyecto_ibfk_2` FOREIGN KEY (`cerrado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resultados_finales_proyecto`
--

LOCK TABLES `resultados_finales_proyecto` WRITE;
/*!40000 ALTER TABLE `resultados_finales_proyecto` DISABLE KEYS */;
/*!40000 ALTER TABLE `resultados_finales_proyecto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reuniones`
--

DROP TABLE IF EXISTS `reuniones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reuniones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `lugar` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` enum('revision_avance','orientacion','defensa','otra') COLLATE utf8mb4_unicode_ci DEFAULT 'otra',
  `estado` enum('programada','realizada','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'programada',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reuniones_proyecto` (`proyecto_id`),
  CONSTRAINT `reuniones_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reuniones`
--

LOCK TABLES `reuniones` WRITE;
/*!40000 ALTER TABLE `reuniones` DISABLE KEYS */;
/*!40000 ALTER TABLE `reuniones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reuniones_calendario`
--

DROP TABLE IF EXISTS `reuniones_calendario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reuniones_calendario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `solicitud_reunion_id` int DEFAULT NULL,
  `proyecto_id` int NOT NULL,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `tipo_reunion` enum('seguimiento','revision_avance','orientacion','defensa_parcial','otra') COLLATE utf8mb4_unicode_ci DEFAULT 'seguimiento',
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `lugar` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modalidad` enum('presencial','virtual','hibrida') COLLATE utf8mb4_unicode_ci DEFAULT 'presencial',
  `link_reunion` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('programada','realizada','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'programada',
  `motivo_cancelacion` text COLLATE utf8mb4_unicode_ci,
  `acta_reunion` text COLLATE utf8mb4_unicode_ci,
  `fecha_realizacion` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `solicitud_reunion_id` (`solicitud_reunion_id`),
  KEY `idx_reunion_fecha` (`fecha`,`hora_inicio`),
  KEY `idx_reunion_profesor` (`profesor_rut`,`fecha`),
  KEY `idx_reunion_estudiante` (`estudiante_rut`,`fecha`),
  KEY `idx_reunion_proyecto` (`proyecto_id`,`estado`),
  KEY `idx_reunion_estado` (`estado`),
  CONSTRAINT `reuniones_calendario_ibfk_1` FOREIGN KEY (`solicitud_reunion_id`) REFERENCES `solicitudes_reunion` (`id`),
  CONSTRAINT `reuniones_calendario_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reuniones_calendario_ibfk_3` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `reuniones_calendario_ibfk_4` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reuniones_calendario`
--

LOCK TABLES `reuniones_calendario` WRITE;
/*!40000 ALTER TABLE `reuniones_calendario` DISABLE KEYS */;
/*!40000 ALTER TABLE `reuniones_calendario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'estudiante','Estudiante que desarrolla el proyecto de tÃ­tulo','2025-12-01 19:45:53','2025-12-01 19:45:53'),(2,'profesor','Profesor que guÃ­a o revisa proyectos de tÃ­tulo','2025-12-01 19:45:53','2025-12-01 19:45:53'),(3,'admin','Jefe de Carrera - Administrador de una carrera especÃ­fica','2025-12-01 19:45:53','2025-12-01 19:45:54'),(4,'Super Administrador','Administrador principal del sistema con acceso total','2025-12-01 19:45:53','2025-12-01 19:45:54'),(5,'superadmin','Administrador con permisos totales del sistema','2025-12-01 19:48:52','2025-12-01 19:48:52');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles_profesores`
--

DROP TABLE IF EXISTS `roles_profesores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles_profesores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  UNIQUE KEY `codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=162 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_profesores`
--

LOCK TABLES `roles_profesores` WRITE;
/*!40000 ALTER TABLE `roles_profesores` DISABLE KEYS */;
INSERT INTO `roles_profesores` VALUES (1,NULL,'Profesor Revisor','Profesor que evalÃºa la propuesta inicial y determina su viabilidad','2025-12-01 19:45:53'),(2,NULL,'Profesor GuÃ­a','Profesor principal que guÃ­a el desarrollo completo del proyecto','2025-12-01 19:45:53'),(3,NULL,'Profesor Co-GuÃ­a','Profesor co-guÃ­a que apoya en Ã¡reas especÃ­ficas del proyecto','2025-12-01 19:45:53'),(4,NULL,'Profesor Informante','Profesor que evalÃºa el informe final y otorga calificaciÃ³n','2025-12-01 19:45:53'),(5,NULL,'Profesor de Sala','Profesor de sala para la defensa oral del proyecto','2025-12-01 19:45:53'),(152,NULL,'Profesor Guía','Profesor principal que guía el desarrollo completo del proyecto','2025-12-18 03:32:17'),(153,NULL,'Profesor Co-Guía','Profesor co-guía que apoya en áreas específicas del proyecto','2025-12-18 03:32:17');
/*!40000 ALTER TABLE `roles_profesores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_extension`
--

DROP TABLE IF EXISTS `solicitudes_extension`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_extension` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `fecha_importante_id` int DEFAULT NULL,
  `solicitante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_original` date NOT NULL,
  `fecha_solicitada` date NOT NULL,
  `dias_extension` int GENERATED ALWAYS AS ((to_days(`fecha_solicitada`) - to_days(`fecha_original`))) STORED,
  `motivo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `justificacion_detallada` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `documento_respaldo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('pendiente','en_revision','aprobada','rechazada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `aprobado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `fecha_resolucion` timestamp NULL DEFAULT NULL,
  `comentarios_revision` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fecha_importante_id` (`fecha_importante_id`),
  KEY `aprobado_por` (`aprobado_por`),
  KEY `idx_extension_proyecto` (`proyecto_id`,`estado`),
  KEY `idx_extension_solicitante` (`solicitante_rut`),
  KEY `idx_extension_estado` (`estado`),
  KEY `idx_extension_fecha` (`created_at`),
  CONSTRAINT `solicitudes_extension_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `solicitudes_extension_ibfk_2` FOREIGN KEY (`fecha_importante_id`) REFERENCES `fechas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `solicitudes_extension_ibfk_3` FOREIGN KEY (`solicitante_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `solicitudes_extension_ibfk_4` FOREIGN KEY (`aprobado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_extension`
--

LOCK TABLES `solicitudes_extension` WRITE;
/*!40000 ALTER TABLE `solicitudes_extension` DISABLE KEYS */;
/*!40000 ALTER TABLE `solicitudes_extension` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_reunion`
--

DROP TABLE IF EXISTS `solicitudes_reunion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_reunion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_propuesta` date NOT NULL,
  `hora_propuesta` time NOT NULL,
  `duracion_minutos` int DEFAULT '60',
  `tipo_reunion` enum('seguimiento','revision_avance','orientacion','defensa_parcial','otra') COLLATE utf8mb4_unicode_ci DEFAULT 'seguimiento',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('pendiente','aceptada_profesor','aceptada_estudiante','confirmada','rechazada','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `creado_por` enum('profesor','estudiante','sistema') COLLATE utf8mb4_unicode_ci DEFAULT 'sistema',
  `fecha_respuesta_profesor` timestamp NULL DEFAULT NULL,
  `fecha_respuesta_estudiante` timestamp NULL DEFAULT NULL,
  `comentarios_profesor` text COLLATE utf8mb4_unicode_ci,
  `comentarios_estudiante` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_solicitud_proyecto` (`proyecto_id`,`estado`),
  KEY `idx_solicitud_profesor` (`profesor_rut`,`estado`),
  KEY `idx_solicitud_estudiante` (`estudiante_rut`,`estado`),
  KEY `idx_solicitud_fecha` (`fecha_propuesta`,`hora_propuesta`),
  CONSTRAINT `solicitudes_reunion_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `solicitudes_reunion_ibfk_2` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `solicitudes_reunion_ibfk_3` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_reunion`
--

LOCK TABLES `solicitudes_reunion` WRITE;
/*!40000 ALTER TABLE `solicitudes_reunion` DISABLE KEYS */;
/*!40000 ALTER TABLE `solicitudes_reunion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokens_blacklist`
--

DROP TABLE IF EXISTS `tokens_blacklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_blacklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `revocado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expira_en` timestamp NOT NULL,
  `usuario_rut` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_hash` (`token_hash`),
  KEY `idx_expiracion` (`expira_en`),
  KEY `idx_token_hash` (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_blacklist`
--

LOCK TABLES `tokens_blacklist` WRITE;
/*!40000 ALTER TABLE `tokens_blacklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_blacklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` int NOT NULL,
  `confirmado` tinyint(1) DEFAULT '0',
  `debe_cambiar_password` tinyint(1) DEFAULT '0' COMMENT 'Indica si el usuario debe cambiar su contraseÃ±a en el prÃ³ximo login (contraseÃ±a temporal)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rut`),
  UNIQUE KEY `rut` (`rut`),
  UNIQUE KEY `email` (`email`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES ('11111111-1','Usuario Estudiante','estudiante@ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',1,1,0,'2025-12-01 19:45:53','2025-12-18 03:32:17'),('12345678-0','admin supremo','admin.supremo@sincorreo.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',4,1,0,'2025-12-01 19:45:53','2025-12-01 19:45:53'),('12345678-9','Ana Estudiante','daniel.aguayo2001@alumnos.ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',1,1,0,'2025-12-01 19:45:53','2025-12-01 22:01:16'),('22222222-2','Usuario Profesor','profesor@ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',2,1,0,'2025-12-18 03:32:17','2025-12-18 03:32:17'),('33333333-3','Usuario Admin','admin@ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',3,1,0,'2025-12-18 03:32:17','2025-12-18 03:32:17'),('44444444-4','Usuario SuperAdmin','superadmin@ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',4,1,0,'2025-12-18 03:32:17','2025-12-18 03:32:17'),('98765432-1','Carlos Profesor','sincorreo@sincorreo.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',2,1,0,'2025-12-01 19:45:53','2025-12-02 05:26:33');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `versiones_documento`
--

DROP TABLE IF EXISTS `versiones_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `versiones_documento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `avance_id` int NOT NULL COMMENT 'Referencia al avance/entrega',
  `proyecto_id` int NOT NULL,
  `numero_version` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'v1.0, v1.1, v2.0, etc.',
  `tipo_version` enum('estudiante','profesor_revision','profesor_comentarios','version_final') COLLATE utf8mb4_unicode_ci DEFAULT 'estudiante',
  `archivo_nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_ruta` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_tamano_kb` int DEFAULT NULL,
  `archivo_tipo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'application/pdf, application/docx, etc.',
  `descripcion_cambios` text COLLATE utf8mb4_unicode_ci COMMENT 'Qu├® se modific├│ en esta versi├│n',
  `cambios_principales` text COLLATE utf8mb4_unicode_ci COMMENT 'Lista de cambios principales',
  `autor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor_rol` enum('estudiante','profesor_guia','profesor_informante','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentarios_generales` text COLLATE utf8mb4_unicode_ci COMMENT 'Comentarios generales sobre esta versi├│n',
  `estado` enum('borrador','enviado','en_revision','revisado','aprobado','rechazado') COLLATE utf8mb4_unicode_ci DEFAULT 'enviado',
  `requiere_correccion` tinyint(1) DEFAULT '0',
  `es_version_final` tinyint(1) DEFAULT '0' COMMENT 'Marca si es la versi├│n final aprobada',
  `etiquetas` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tags separados por coma',
  `visible_para_estudiante` tinyint(1) DEFAULT '1',
  `fecha_subida` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_avance` (`avance_id`),
  KEY `idx_proyecto` (`proyecto_id`),
  KEY `idx_autor` (`autor_rut`),
  KEY `idx_version` (`numero_version`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha` (`fecha_subida`),
  CONSTRAINT `versiones_documento_ibfk_1` FOREIGN KEY (`avance_id`) REFERENCES `avances` (`id`) ON DELETE CASCADE,
  CONSTRAINT `versiones_documento_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `versiones_documento_ibfk_3` FOREIGN KEY (`autor_rut`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `versiones_documento`
--

LOCK TABLES `versiones_documento` WRITE;
/*!40000 ALTER TABLE `versiones_documento` DISABLE KEYS */;
/*!40000 ALTER TABLE `versiones_documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vista_carreras_por_departamento`
--

DROP TABLE IF EXISTS `vista_carreras_por_departamento`;
/*!50001 DROP VIEW IF EXISTS `vista_carreras_por_departamento`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_carreras_por_departamento` AS SELECT 
 1 AS `departamento_id`,
 1 AS `departamento_nombre`,
 1 AS `departamento_codigo`,
 1 AS `carrera_id`,
 1 AS `carrera_nombre`,
 1 AS `carrera_codigo`,
 1 AS `es_principal`,
 1 AS `facultad_nombre`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_departamentos_por_carrera`
--

DROP TABLE IF EXISTS `vista_departamentos_por_carrera`;
/*!50001 DROP VIEW IF EXISTS `vista_departamentos_por_carrera`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_departamentos_por_carrera` AS SELECT 
 1 AS `carrera_id`,
 1 AS `carrera_nombre`,
 1 AS `carrera_codigo`,
 1 AS `departamento_id`,
 1 AS `departamento_nombre`,
 1 AS `departamento_codigo`,
 1 AS `es_principal`,
 1 AS `facultad_nombre`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_estudiantes_carreras`
--

DROP TABLE IF EXISTS `vista_estudiantes_carreras`;
/*!50001 DROP VIEW IF EXISTS `vista_estudiantes_carreras`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_estudiantes_carreras` AS SELECT 
 1 AS `rut`,
 1 AS `estudiante_nombre`,
 1 AS `email`,
 1 AS `carrera_nombre`,
 1 AS `carrera_codigo`,
 1 AS `titulo_profesional`,
 1 AS `facultad_nombre`,
 1 AS `ano_ingreso`,
 1 AS `semestre_actual`,
 1 AS `estado_estudiante`,
 1 AS `promedio_acumulado`,
 1 AS `es_carrera_principal`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_informante_pendientes`
--

DROP TABLE IF EXISTS `vista_informante_pendientes`;
/*!50001 DROP VIEW IF EXISTS `vista_informante_pendientes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_informante_pendientes` AS SELECT 
 1 AS `hito_id`,
 1 AS `proyecto_id`,
 1 AS `proyecto_titulo`,
 1 AS `estudiante_rut`,
 1 AS `estudiante_nombre`,
 1 AS `fecha_entrega_estudiante`,
 1 AS `fecha_limite_informante`,
 1 AS `dias_restantes`,
 1 AS `estado_plazo`,
 1 AS `informante_notificado`,
 1 AS `fecha_notificacion_informante`,
 1 AS `informante_rut`,
 1 AS `informante_nombre`,
 1 AS `informante_email`,
 1 AS `comentarios_profesor`,
 1 AS `estado_hito`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_jefes_carrera`
--

DROP TABLE IF EXISTS `vista_jefes_carrera`;
/*!50001 DROP VIEW IF EXISTS `vista_jefes_carrera`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_jefes_carrera` AS SELECT 
 1 AS `rut`,
 1 AS `jefe_nombre`,
 1 AS `email`,
 1 AS `carrera_nombre`,
 1 AS `carrera_codigo`,
 1 AS `facultad_nombre`,
 1 AS `fecha_inicio`,
 1 AS `fecha_fin`,
 1 AS `activo`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_jefes_carreras`
--

DROP TABLE IF EXISTS `vista_jefes_carreras`;
/*!50001 DROP VIEW IF EXISTS `vista_jefes_carreras`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_jefes_carreras` AS SELECT 
 1 AS `rut`,
 1 AS `profesor_nombre`,
 1 AS `email`,
 1 AS `carrera_nombre`,
 1 AS `carrera_codigo`,
 1 AS `facultad_nombre`,
 1 AS `fecha_inicio`,
 1 AS `fecha_fin`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_profesores_departamentos`
--

DROP TABLE IF EXISTS `vista_profesores_departamentos`;
/*!50001 DROP VIEW IF EXISTS `vista_profesores_departamentos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_profesores_departamentos` AS SELECT 
 1 AS `rut`,
 1 AS `profesor_nombre`,
 1 AS `email`,
 1 AS `departamento_nombre`,
 1 AS `departamento_codigo`,
 1 AS `es_principal`,
 1 AS `facultad_nombre`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_proyectos_riesgo_abandono`
--

DROP TABLE IF EXISTS `vista_proyectos_riesgo_abandono`;
/*!50001 DROP VIEW IF EXISTS `vista_proyectos_riesgo_abandono`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_proyectos_riesgo_abandono` AS SELECT 
 1 AS `proyecto_id`,
 1 AS `titulo`,
 1 AS `estudiante_rut`,
 1 AS `estudiante_nombre`,
 1 AS `estudiante_email`,
 1 AS `estado_id`,
 1 AS `estado_nombre`,
 1 AS `ultima_actividad_fecha`,
 1 AS `dias_sin_actividad`,
 1 AS `umbral_dias_riesgo`,
 1 AS `umbral_dias_abandono`,
 1 AS `nivel_riesgo`,
 1 AS `alerta_inactividad_enviada`,
 1 AS `fecha_alerta_inactividad`,
 1 AS `fecha_inicio`,
 1 AS `dias_desde_inicio`,
 1 AS `total_avances`,
 1 AS `ultimo_avance`,
 1 AS `reuniones_realizadas`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vista_carreras_por_departamento`
--

/*!50001 DROP VIEW IF EXISTS `vista_carreras_por_departamento`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_carreras_por_departamento` AS select `d`.`id` AS `departamento_id`,`d`.`nombre` AS `departamento_nombre`,`d`.`codigo` AS `departamento_codigo`,`c`.`id` AS `carrera_id`,`c`.`nombre` AS `carrera_nombre`,`c`.`codigo` AS `carrera_codigo`,`dc`.`es_principal` AS `es_principal`,`f`.`nombre` AS `facultad_nombre` from (((`departamentos_carreras` `dc` join `departamentos` `d` on((`dc`.`departamento_id` = `d`.`id`))) join `carreras` `c` on((`dc`.`carrera_id` = `c`.`id`))) join `facultades` `f` on((`c`.`facultad_id` = `f`.`id`))) where (`dc`.`activo` = true) order by `d`.`nombre`,`dc`.`es_principal` desc,`c`.`nombre` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_departamentos_por_carrera`
--

/*!50001 DROP VIEW IF EXISTS `vista_departamentos_por_carrera`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_departamentos_por_carrera` AS select `c`.`id` AS `carrera_id`,`c`.`nombre` AS `carrera_nombre`,`c`.`codigo` AS `carrera_codigo`,`d`.`id` AS `departamento_id`,`d`.`nombre` AS `departamento_nombre`,`d`.`codigo` AS `departamento_codigo`,`dc`.`es_principal` AS `es_principal`,`f`.`nombre` AS `facultad_nombre` from (((`departamentos_carreras` `dc` join `carreras` `c` on((`dc`.`carrera_id` = `c`.`id`))) join `departamentos` `d` on((`dc`.`departamento_id` = `d`.`id`))) join `facultades` `f` on((`d`.`facultad_id` = `f`.`id`))) where (`dc`.`activo` = true) order by `c`.`nombre`,`dc`.`es_principal` desc,`d`.`nombre` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_estudiantes_carreras`
--

/*!50001 DROP VIEW IF EXISTS `vista_estudiantes_carreras`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_estudiantes_carreras` AS select `u`.`rut` AS `rut`,`u`.`nombre` AS `estudiante_nombre`,`u`.`email` AS `email`,`c`.`nombre` AS `carrera_nombre`,`c`.`codigo` AS `carrera_codigo`,`c`.`titulo_profesional` AS `titulo_profesional`,`f`.`nombre` AS `facultad_nombre`,`ec`.`ano_ingreso` AS `ano_ingreso`,`ec`.`semestre_actual` AS `semestre_actual`,`ec`.`estado_estudiante` AS `estado_estudiante`,`ec`.`promedio_acumulado` AS `promedio_acumulado`,`ec`.`es_carrera_principal` AS `es_carrera_principal` from (((`usuarios` `u` join `estudiantes_carreras` `ec` on((`u`.`rut` = `ec`.`estudiante_rut`))) join `carreras` `c` on((`ec`.`carrera_id` = `c`.`id`))) join `facultades` `f` on((`c`.`facultad_id` = `f`.`id`))) where (`u`.`rol_id` = 1) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_informante_pendientes`
--

/*!50001 DROP VIEW IF EXISTS `vista_informante_pendientes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_informante_pendientes` AS select `h`.`id` AS `hito_id`,`h`.`proyecto_id` AS `proyecto_id`,`p`.`titulo` AS `proyecto_titulo`,`p`.`estudiante_rut` AS `estudiante_rut`,`u`.`nombre` AS `estudiante_nombre`,`h`.`fecha_entrega_estudiante` AS `fecha_entrega_estudiante`,`h`.`fecha_limite_informante` AS `fecha_limite_informante`,(to_days(`h`.`fecha_limite_informante`) - to_days(curdate())) AS `dias_restantes`,(case when (`h`.`fecha_limite_informante` < curdate()) then 'vencido' when ((to_days(`h`.`fecha_limite_informante`) - to_days(curdate())) <= 3) then 'urgente' when ((to_days(`h`.`fecha_limite_informante`) - to_days(curdate())) <= 7) then 'proximo' else 'en_plazo' end) AS `estado_plazo`,`h`.`informante_notificado` AS `informante_notificado`,`h`.`fecha_notificacion_informante` AS `fecha_notificacion_informante`,`ap`.`profesor_rut` AS `informante_rut`,`ui`.`nombre` AS `informante_nombre`,`ui`.`email` AS `informante_email`,`h`.`comentarios_profesor` AS `comentarios_profesor`,`h`.`estado` AS `estado_hito` from ((((`hitos_proyecto` `h` join `proyectos` `p` on((`h`.`proyecto_id` = `p`.`id`))) join `usuarios` `u` on((`p`.`estudiante_rut` = `u`.`rut`))) left join `asignaciones_proyectos` `ap` on(((`ap`.`proyecto_id` = `p`.`id`) and (`ap`.`rol_profesor_id` = (select `roles_profesores`.`id` from `roles_profesores` where (`roles_profesores`.`nombre` = 'Profesor Informante'))) and (`ap`.`activo` = true)))) left join `usuarios` `ui` on((`ap`.`profesor_rut` = `ui`.`rut`))) where ((`h`.`tipo_hito` = 'entrega_final') and (`h`.`fecha_entrega_estudiante` is not null) and (`h`.`estado` in ('completado','en_progreso')) and ((`h`.`fecha_completado` is null) or (`h`.`comentarios_profesor` is null))) order by `h`.`fecha_limite_informante` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_jefes_carrera`
--

/*!50001 DROP VIEW IF EXISTS `vista_jefes_carrera`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_jefes_carrera` AS select `u`.`rut` AS `rut`,`u`.`nombre` AS `jefe_nombre`,`u`.`email` AS `email`,`c`.`nombre` AS `carrera_nombre`,`c`.`codigo` AS `carrera_codigo`,`f`.`nombre` AS `facultad_nombre`,`jc`.`fecha_inicio` AS `fecha_inicio`,`jc`.`fecha_fin` AS `fecha_fin`,`jc`.`activo` AS `activo` from (((`usuarios` `u` join `jefes_carreras` `jc` on((`u`.`rut` = `jc`.`profesor_rut`))) join `carreras` `c` on((`jc`.`carrera_id` = `c`.`id`))) join `facultades` `f` on((`c`.`facultad_id` = `f`.`id`))) where ((`u`.`rol_id` = 3) and (`jc`.`activo` = true)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_jefes_carreras`
--

/*!50001 DROP VIEW IF EXISTS `vista_jefes_carreras`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_jefes_carreras` AS select `u`.`rut` AS `rut`,`u`.`nombre` AS `profesor_nombre`,`u`.`email` AS `email`,`c`.`nombre` AS `carrera_nombre`,`c`.`codigo` AS `carrera_codigo`,`f`.`nombre` AS `facultad_nombre`,`jc`.`fecha_inicio` AS `fecha_inicio`,`jc`.`fecha_fin` AS `fecha_fin` from (((`usuarios` `u` join `jefes_carreras` `jc` on((`u`.`rut` = `jc`.`profesor_rut`))) join `carreras` `c` on((`jc`.`carrera_id` = `c`.`id`))) join `facultades` `f` on((`c`.`facultad_id` = `f`.`id`))) where ((`u`.`rol_id` = 2) and (`jc`.`activo` = true)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_profesores_departamentos`
--

/*!50001 DROP VIEW IF EXISTS `vista_profesores_departamentos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_profesores_departamentos` AS select `u`.`rut` AS `rut`,`u`.`nombre` AS `profesor_nombre`,`u`.`email` AS `email`,`d`.`nombre` AS `departamento_nombre`,`d`.`codigo` AS `departamento_codigo`,`pd`.`es_principal` AS `es_principal`,`f`.`nombre` AS `facultad_nombre` from (((`profesores_departamentos` `pd` join `usuarios` `u` on((`pd`.`profesor_rut` = `u`.`rut`))) join `departamentos` `d` on((`pd`.`departamento_id` = `d`.`id`))) join `facultades` `f` on((`d`.`facultad_id` = `f`.`id`))) where ((`u`.`rol_id` = 2) and (`pd`.`activo` = true)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_proyectos_riesgo_abandono`
--

/*!50001 DROP VIEW IF EXISTS `vista_proyectos_riesgo_abandono`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_proyectos_riesgo_abandono` AS select `p`.`id` AS `proyecto_id`,`p`.`titulo` AS `titulo`,`p`.`estudiante_rut` AS `estudiante_rut`,`u`.`nombre` AS `estudiante_nombre`,`u`.`email` AS `estudiante_email`,`p`.`estado_id` AS `estado_id`,`ep`.`nombre` AS `estado_nombre`,`p`.`ultima_actividad_fecha` AS `ultima_actividad_fecha`,(case when (`p`.`ultima_actividad_fecha` is not null) then (to_days(curdate()) - to_days(`p`.`ultima_actividad_fecha`)) else NULL end) AS `dias_sin_actividad`,`p`.`umbral_dias_riesgo` AS `umbral_dias_riesgo`,`p`.`umbral_dias_abandono` AS `umbral_dias_abandono`,(case when (`p`.`ultima_actividad_fecha` is null) then 'sin_actividad_registrada' when ((to_days(curdate()) - to_days(`p`.`ultima_actividad_fecha`)) >= `p`.`umbral_dias_abandono`) then 'abandono_potencial' when ((to_days(curdate()) - to_days(`p`.`ultima_actividad_fecha`)) >= `p`.`umbral_dias_riesgo`) then 'en_riesgo' when ((to_days(curdate()) - to_days(`p`.`ultima_actividad_fecha`)) >= (`p`.`umbral_dias_riesgo` * 0.7)) then 'alerta_previa' else 'activo' end) AS `nivel_riesgo`,`p`.`alerta_inactividad_enviada` AS `alerta_inactividad_enviada`,`p`.`fecha_alerta_inactividad` AS `fecha_alerta_inactividad`,`p`.`fecha_inicio` AS `fecha_inicio`,(to_days(curdate()) - to_days(`p`.`fecha_inicio`)) AS `dias_desde_inicio`,(select count(0) from `avances` where (`avances`.`proyecto_id` = `p`.`id`)) AS `total_avances`,(select max(`avances`.`fecha_envio`) from `avances` where (`avances`.`proyecto_id` = `p`.`id`)) AS `ultimo_avance`,(select count(0) from `reuniones_calendario` where ((`reuniones_calendario`.`proyecto_id` = `p`.`id`) and (`reuniones_calendario`.`estado` = 'realizada'))) AS `reuniones_realizadas` from ((`proyectos` `p` join `usuarios` `u` on((`p`.`estudiante_rut` = `u`.`rut`))) join `estados_proyectos` `ep` on((`p`.`estado_id` = `ep`.`id`))) where ((`p`.`activo` = true) and (`ep`.`nombre` not in ('completado','defendido','cerrado')) and ((`p`.`ultima_actividad_fecha` is null) or ((to_days(curdate()) - to_days(`p`.`ultima_actividad_fecha`)) >= (`p`.`umbral_dias_riesgo` * 0.7)))) order by (case when (`p`.`ultima_actividad_fecha` is null) then 0 else 1 end),(case when (`p`.`ultima_actividad_fecha` is not null) then (to_days(curdate()) - to_days(`p`.`ultima_actividad_fecha`)) else NULL end) desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-18  2:00:01
