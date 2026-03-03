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
  `numero_acta` varchar(20) NOT NULL,
  `fecha_reunion` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `lugar` varchar(255) DEFAULT NULL,
  `asistentes` text NOT NULL,
  `objetivo` text NOT NULL,
  `temas_tratados` text NOT NULL,
  `acuerdos` text NOT NULL,
  `tareas_asignadas` text,
  `proximos_pasos` text,
  `observaciones` text,
  `firma_estudiante` tinyint(1) DEFAULT '0',
  `fecha_firma_estudiante` timestamp NULL DEFAULT NULL,
  `firma_profesor` tinyint(1) DEFAULT '0',
  `fecha_firma_profesor` timestamp NULL DEFAULT NULL,
  `archivo_acta` varchar(255) DEFAULT NULL,
  `estado` enum('borrador','pendiente_firma','firmada','archivada') DEFAULT 'borrador',
  `creado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `tipo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de actividad: login, logout, propuesta_creada, proyecto_aprobado, etc.',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descripción detallada de la actividad realizada',
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
  `tipo_alerta` enum('inactividad_detectada','riesgo_abandono','abandono_potencial','reactivacion') NOT NULL,
  `dias_sin_actividad` int NOT NULL COMMENT 'Días sin actividad al momento de la alerta',
  `fecha_ultima_actividad` date DEFAULT NULL COMMENT 'Fecha de la última actividad registrada',
  `nivel_severidad` enum('leve','moderado','grave','critico') NOT NULL,
  `mensaje` text NOT NULL COMMENT 'Mensaje de la alerta',
  `accion_sugerida` text COMMENT 'Acción recomendada según reglamento',
  `notificados` text COMMENT 'RUTs de usuarios notificados (JSON array)',
  `fecha_alerta` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `alerta_atendida` tinyint(1) DEFAULT '0',
  `fecha_atencion` timestamp NULL DEFAULT NULL,
  `atendida_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones_atencion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `atendida_por` (`atendida_por`),
  KEY `idx_alerta_proyecto` (`proyecto_id`,`fecha_alerta`),
  KEY `idx_alerta_tipo` (`tipo_alerta`,`nivel_severidad`),
  KEY `idx_alerta_pendiente` (`alerta_atendida`,`fecha_alerta`),
  CONSTRAINT `alertas_abandono_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `alertas_abandono_ibfk_2` FOREIGN KEY (`atendida_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas_abandono`
--

LOCK TABLES `alertas_abandono` WRITE;
/*!40000 ALTER TABLE `alertas_abandono` DISABLE KEYS */;
/*!40000 ALTER TABLE `alertas_abandono` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `archivos_propuesta`
--

DROP TABLE IF EXISTS `archivos_propuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archivos_propuesta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `propuesta_id` int NOT NULL,
  `tipo_archivo` enum('propuesta_inicial','revision_profesor','correccion_estudiante') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_archivo_original` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subido_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` int NOT NULL DEFAULT '1',
  `comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subido_por` (`subido_por`),
  KEY `idx_propuesta` (`propuesta_id`),
  KEY `idx_version` (`propuesta_id`,`version`),
  KEY `idx_tipo` (`tipo_archivo`),
  CONSTRAINT `archivos_propuesta_ibfk_1` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `archivos_propuesta_ibfk_2` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archivos_propuesta`
--

LOCK TABLES `archivos_propuesta` WRITE;
/*!40000 ALTER TABLE `archivos_propuesta` DISABLE KEYS */;
INSERT INTO `archivos_propuesta` VALUES (3,2,'revision_profesor','1766969039857-507923488.pdf','Certamen 2 IECI-1.pdf','33333333-3',1,'kldjaklñdfalkjsdfkañljfd','2025-12-29 00:43:59'),(4,2,'revision_profesor','1766969100606-240327584.pdf','Informe_Yerko_Cisternas-1.pdf','33333333-3',2,'kldjaklñdfalkjsdfkañljfd','2025-12-29 00:45:00'),(5,2,'revision_profesor','1766969117674-198738259.pdf','Informe_Yerko_Cisternas-1.pdf','33333333-3',3,'kldjaklñdfalkjsdfkañljfd','2025-12-29 00:45:17'),(6,2,'revision_profesor','1766969201977-142302527.pdf','1766115655230-51277754.pdf','33333333-3',4,'kldjaklñdfalkjsdfkañljfd','2025-12-29 00:46:42'),(7,2,'revision_profesor','1766969416399-323570193.pdf','IECI-PT-FINAL-Aguayo- Daniel_TGB.pdf','33333333-3',5,'kldjaklñdfalkjsdfkañljfd','2025-12-29 00:50:16'),(8,2,'revision_profesor','1766969743469-25568191.pdf','ExportedClientDocument.pdf','33333333-3',6,'glñfkgkglñdkfgdfgdfg','2025-12-29 00:55:43'),(9,2,'revision_profesor','1766975231244-196076659.pdf','ExportedClientDocument.pdf','33333333-3',7,'glñfkgkglñdkfgdfgdfg','2025-12-29 02:27:11'),(10,2,'revision_profesor','1766975379446-921269045.pdf','5 Demanda-1.pdf','33333333-3',8,'glñfkgkglñdkfgdfgdfg','2025-12-29 02:29:39'),(11,2,'revision_profesor','1766975477112-577860473.pdf','jhf.pdf','33333333-3',9,'glñfkgkglñdkfgdfgdfg','2025-12-29 02:31:17'),(12,2,'revision_profesor','1766975682946-314394226.pdf','jhf.pdf','33333333-3',10,'glñfkgkglñdkfgdfgdfg','2025-12-29 02:34:42'),(13,2,'correccion_estudiante','1766976169163-619071378.pdf','DIÃLOGO..pdf','11111111-1',11,'Versión anterior antes de corrección','2025-12-29 02:47:43'),(14,2,'correccion_estudiante','1766976463543-378482246.pdf','OK_Montoya_GutiÃ©rrez,_Pablo_Israel_Informe Final (1).pdf','11111111-1',12,'Nueva versión con correcciones','2025-12-29 02:47:43');
/*!40000 ALTER TABLE `archivos_propuesta` ENABLE KEYS */;
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
  `rol_revision` enum('revisor_principal','revisor_secundario','informante') DEFAULT 'revisor_principal',
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `estado_revision` enum('pendiente','en_revision','revisado') DEFAULT 'pendiente',
  `decision` enum('aprobar','rechazar','solicitar_correcciones') DEFAULT NULL COMMENT 'Decisión del profesor sobre la propuesta',
  `comentarios_revision` text COMMENT 'Comentarios detallados del profesor sobre la propuesta',
  `activo` tinyint(1) DEFAULT '1',
  `asignado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del admin que realizó la asignación',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asignacion_activa` (`propuesta_id`,`profesor_rut`,`activo`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_propuesta_estado` (`propuesta_id`,`estado_revision`),
  KEY `idx_profesor_propuestas` (`profesor_rut`,`estado_revision`),
  CONSTRAINT `asignaciones_propuestas_ibfk_1` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_propuestas_ibfk_2` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `asignaciones_propuestas_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_propuestas`
--

LOCK TABLES `asignaciones_propuestas` WRITE;
/*!40000 ALTER TABLE `asignaciones_propuestas` DISABLE KEYS */;
INSERT INTO `asignaciones_propuestas` VALUES (2,2,'33333333-3','revisor_principal','2025-12-28 22:57:04',NULL,'pendiente',NULL,NULL,1,'33333333-3','2025-12-28 22:57:04','2025-12-28 22:57:04');
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
  `observaciones` text,
  `asignado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_proyecto_activo` (`proyecto_id`,`activo`),
  KEY `idx_profesor_activo` (`profesor_rut`,`activo`),
  KEY `idx_rol_activo` (`rol_profesor_id`,`activo`),
  CONSTRAINT `asignaciones_proyectos_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asignaciones_proyectos_ibfk_2` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `asignaciones_proyectos_ibfk_3` FOREIGN KEY (`rol_profesor_id`) REFERENCES `roles_profesores` (`id`),
  CONSTRAINT `asignaciones_proyectos_ibfk_4` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_proyectos`
--

LOCK TABLES `asignaciones_proyectos` WRITE;
/*!40000 ALTER TABLE `asignaciones_proyectos` DISABLE KEYS */;
INSERT INTO `asignaciones_proyectos` VALUES (1,1,'22222222-2',2,'2025-12-29 03:02:51',NULL,1,NULL,'33333333-3','2025-12-29 03:02:51','2025-12-29 03:02:51'),(2,1,'13456789-8',4,'2026-02-24 19:53:16',NULL,1,NULL,'33333333-3','2026-02-24 19:53:16','2026-02-24 19:53:16'),(3,1,'13456789-8',4,'2026-02-24 19:54:10',NULL,1,NULL,'33333333-3','2026-02-24 19:54:10','2026-02-24 19:54:10'),(4,2,'12345678-9',2,'2026-02-24 19:54:10',NULL,1,NULL,'33333333-3','2026-02-24 19:54:10','2026-02-24 19:54:10'),(5,2,'22222222-2',4,'2026-02-24 19:54:10',NULL,1,NULL,'33333333-3','2026-02-24 19:54:10','2026-02-24 19:54:10');
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
  `titulo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `estado_id` int NOT NULL DEFAULT '1',
  `comentarios_profesor` text,
  `fecha_envio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `profesor_revisor` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `proyecto_id` (`proyecto_id`),
  KEY `profesor_revisor` (`profesor_revisor`),
  CONSTRAINT `avances_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `avances_ibfk_2` FOREIGN KEY (`profesor_revisor`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avances`
--

LOCK TABLES `avances` WRITE;
/*!40000 ALTER TABLE `avances` DISABLE KEYS */;
INSERT INTO `avances` VALUES (1,1,'Avance 1 ÔÇô An├ílisis y Dise├▒o de Base de Datos','Se complet├│ el levantamiento de requisitos con la empresa piloto \"Distribuidora El Roble\". Se adjunta documento de requisitos, modelo entidad-relaci├│n y propuesta de arquitectura del sistema.',NULL,6,'Excelente trabajo en el modelado de datos. El diagrama ER est├í bien estructurado y cubre todos los requerimientos levantados. Proceder con la implementaci├│n del m├│dulo de stock seg├║n lo planificado.','2025-04-20 04:00:00','2025-04-25 04:00:00','22222222-2','2026-02-24 19:54:10','2026-02-24 19:54:10'),(2,1,'Avance 2 ÔÇô M├│dulo de Control de Stock','Se implement├│ el m├│dulo completo de control de stock: CRUD de productos, categor├¡as, proveedores, historial de movimientos de inventario y c├ílculo autom├ítico de puntos de reorden. Se adjunta c├│digo fuente y capturas de pantalla.',NULL,6,'Muy buen avance. Las funcionalidades de stock est├ín correctamente implementadas y el c├│digo es limpio. Observaci├│n: mejorar la validaci├│n de entradas en el formulario de ingreso masivo de productos y agregar paginaci├│n en la tabla de historial.','2025-06-05 04:00:00','2025-06-12 04:00:00','22222222-2','2026-02-24 19:54:10','2026-02-24 19:54:10'),(3,2,'Avance 1 ÔÇô An├ílisis, Prototipo y Plan de Desarrollo','Se finaliz├│ el an├ílisis de requerimientos con docentes de 3 escuelas rurales de Santa B├írbara. Se valid├│ el prototipo de interfaz con usuarios reales (8 docentes y 15 estudiantes). Se adjunta informe de an├ílisis, prototipos en Figma y plan de desarrollo detallado.',NULL,5,NULL,'2025-05-20 04:00:00',NULL,'12345678-9','2026-02-24 19:54:10','2026-02-24 19:54:10');
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
  `motivo` varchar(255) NOT NULL,
  `tipo` enum('vacaciones','licencia','feriado','personal','academico') DEFAULT 'personal',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bloqueo_usuario_fecha` (`usuario_rut`,`fecha_inicio`,`fecha_fin`),
  CONSTRAINT `bloqueos_horarios_ibfk_1` FOREIGN KEY (`usuario_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo_profesional` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej: Ingeniero Civil en Informática',
  `grado_academico` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ej: Licenciado en Ciencias de la Ingeniería',
  `duracion_semestres` int NOT NULL DEFAULT '10',
  `jefe_carrera_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'DEPRECATED: Usar tabla jefes_carreras',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `modalidad` enum('presencial','semipresencial','online') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'presencial',
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carreras`
--

LOCK TABLES `carreras` WRITE;
/*!40000 ALTER TABLE `carreras` DISABLE KEYS */;
INSERT INTO `carreras` VALUES (1,1,'Ingenier├¡a Civil en Inform├ítica','ICINF','Ingeniero Civil en Inform├ítica','Licenciado en Ciencias de la Ingenier├¡a',10,'33333333-3','Carrera orientada al desarrollo de software empresarial y sistemas complejos.','presencial',1,'2025-12-28 22:23:04','2026-02-24 19:53:16'),(2,1,'Ingenier├¡a Inform├ítica Empresarial','IIE','Ingeniero en Inform├ítica Empresarial','Licenciado en Inform├ítica',8,'33333333-3','Carrera enfocada en la gesti├│n tecnol├│gica y transformaci├│n digital de empresas.','presencial',1,'2025-12-28 22:23:14','2026-02-24 19:53:16');
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
  `nombre_completo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT opcional (puede ser extranjero sin RUT)',
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email personal o corporativo (NO institucional UBB)',
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entidad_id` int DEFAULT NULL COMMENT 'Empresa/institución a la que pertenece',
  `cargo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Cargo en la empresa (ej: Supervisor, Gerente de Proyectos)',
  `area_departamento` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Área o departamento dentro de la empresa',
  `especialidad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Especialidad o área de expertise',
  `anos_experiencia` int DEFAULT NULL COMMENT 'Años de experiencia profesional',
  `linkedin` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Perfil de LinkedIn',
  `tipo_colaborador` enum('supervisor_empresa','mentor','asesor_tecnico','cliente','evaluador_externo','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'supervisor_empresa',
  `biografia` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Breve biografía o descripción profesional',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1' COMMENT 'Si el colaborador está activo para nuevas asignaciones',
  `verificado` tinyint(1) DEFAULT '0' COMMENT 'Si se ha verificado la identidad del colaborador',
  `fecha_verificacion` timestamp NULL DEFAULT NULL,
  `verificado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del admin que verificó',
  `creado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del admin/profesor que registró al colaborador',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Hash de contraseña para acceso al sistema',
  `token_acceso` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Token único para primer acceso',
  `fecha_token_expira` datetime DEFAULT NULL COMMENT 'Fecha de expiración del token',
  `ultimo_acceso` datetime DEFAULT NULL COMMENT 'Última vez que accedió al sistema',
  `activo_sistema` tinyint(1) DEFAULT '0' COMMENT 'Si tiene acceso activo al sistema',
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colaboradores_externos`
--

LOCK TABLES `colaboradores_externos` WRITE;
/*!40000 ALTER TABLE `colaboradores_externos` DISABLE KEYS */;
INSERT INTO `colaboradores_externos` VALUES (1,'abc',NULL,'abc@dantrottel.cl',NULL,1,NULL,NULL,NULL,NULL,NULL,'supervisor_empresa',NULL,NULL,1,1,'2025-12-29 02:57:21','33333333-3','33333333-3','2025-12-29 02:57:02','2025-12-29 02:57:21',NULL,NULL,NULL,NULL,0);
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
  `rol_en_proyecto` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej: Supervisor de Empresa, Mentor, Asesor Técnico',
  `descripcion_rol` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descripción detallada de sus responsabilidades',
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL COMMENT 'NULL si aún está activo',
  `horas_dedicadas` decimal(6,2) DEFAULT NULL COMMENT 'Horas estimadas/reales dedicadas al proyecto',
  `frecuencia_interaccion` enum('diaria','semanal','quincenal','mensual','por_demanda') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `puede_evaluar` tinyint(1) DEFAULT '0' COMMENT 'Si puede evaluar al estudiante',
  `evaluacion_realizada` tinyint(1) DEFAULT '0',
  `comentarios_participacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `motivo_desvinculacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Si se desvinculó, explicar por qué',
  `asignado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Quién lo asignó al proyecto',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `evaluacion_solicitada` tinyint(1) DEFAULT '0' COMMENT 'Si se solicitó evaluación',
  `fecha_solicitud_evaluacion` datetime DEFAULT NULL COMMENT 'Fecha de solicitud de evaluación',
  `evaluacion_completada` tinyint(1) DEFAULT '0' COMMENT 'Si completó la evaluación',
  `fecha_evaluacion_completada` datetime DEFAULT NULL COMMENT 'Fecha en que completó la evaluación',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_colaborador_proyecto_activo` (`proyecto_id`,`colaborador_id`,`activo`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_proyecto` (`proyecto_id`),
  KEY `idx_colaborador` (`colaborador_id`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `colaboradores_proyectos_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `colaboradores_proyectos_ibfk_2` FOREIGN KEY (`colaborador_id`) REFERENCES `colaboradores_externos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `colaboradores_proyectos_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colaboradores_proyectos`
--

LOCK TABLES `colaboradores_proyectos` WRITE;
/*!40000 ALTER TABLE `colaboradores_proyectos` DISABLE KEYS */;
INSERT INTO `colaboradores_proyectos` VALUES (1,1,1,'Supervisor de Empresa',NULL,'2025-12-29',NULL,4.00,'semanal',1,0,NULL,1,NULL,'33333333-3','2025-12-29 03:09:58','2025-12-29 03:09:58',0,NULL,0,NULL);
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
  `autor_nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `autor_rol` enum('estudiante','profesor_guia','profesor_informante','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentario` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_comentario` enum('general','sugerencia','error','aprobacion','rechazo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `prioridad` enum('baja','media','alta') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `seccion_referencia` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Capítulo 3, Página 15, etc.',
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
  `propuesta_id` int DEFAULT NULL COMMENT 'ID de la propuesta (para evaluación inicial)',
  `proyecto_id` int DEFAULT NULL COMMENT 'ID del proyecto (para evaluación final/defensa)',
  `fase_evaluacion` enum('propuesta','proyecto','defensa_final') NOT NULL COMMENT 'Fase en la que actúa la comisión',
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_comision` enum('presidente','secretario','vocal','informante','suplente') NOT NULL,
  `fecha_designacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_remocion` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `observaciones` text,
  `voto` enum('aprobar','rechazar','aprobar_con_modificaciones') DEFAULT NULL COMMENT 'Voto del miembro de la comisión',
  `comentarios_evaluacion` text COMMENT 'Comentarios de evaluación del profesor',
  `asignado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del admin que realizó la asignación',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_comision_propuesta` (`propuesta_id`,`rol_comision`,`activo`),
  UNIQUE KEY `unique_comision_proyecto` (`proyecto_id`,`rol_comision`,`activo`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_comision_propuesta` (`propuesta_id`,`activo`),
  KEY `idx_comision_proyecto` (`proyecto_id`,`activo`),
  KEY `idx_comision_profesor` (`profesor_rut`,`activo`),
  KEY `idx_comision_fase` (`fase_evaluacion`,`activo`),
  CONSTRAINT `comision_evaluadora_ibfk_1` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comision_evaluadora_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comision_evaluadora_ibfk_3` FOREIGN KEY (`profesor_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `comision_evaluadora_ibfk_4` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `comision_evaluadora_chk_1` CHECK (((`propuesta_id` is not null) or (`proyecto_id` is not null)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `clave` varchar(50) NOT NULL,
  `valor` varchar(255) NOT NULL,
  `descripcion` text,
  `tipo` enum('entero','decimal','booleano','texto') DEFAULT 'texto',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=2779 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_matching`
--

LOCK TABLES `configuracion_matching` WRITE;
/*!40000 ALTER TABLE `configuracion_matching` DISABLE KEYS */;
INSERT INTO `configuracion_matching` VALUES (1,'duracion_reunion_defecto','60','Duración por defecto de las reuniones en minutos','entero','2025-12-28 22:22:06'),(2,'dias_anticipacion_minima','1','Días mínimos de anticipación para agendar reuniones','entero','2025-12-28 22:22:06'),(3,'dias_anticipacion_maxima','30','Días máximos de anticipación para agendar reuniones','entero','2025-12-28 22:22:06'),(4,'horario_inicio_jornada','08:00','Hora de inicio de la jornada laboral','texto','2025-12-28 22:22:06'),(5,'horario_fin_jornada','18:00','Hora de fin de la jornada laboral','texto','2025-12-28 22:22:06'),(6,'matching_automatico_activo','true','Si el matching automático está activo','booleano','2025-12-28 22:22:06'),(7,'tiempo_respuesta_horas','48','Tiempo máximo en horas para responder solicitudes','entero','2025-12-28 22:22:06'),(8,'permitir_reuniones_sabado','false','Permitir agendar reuniones los sábados','booleano','2025-12-28 22:22:06'),(9,'permitir_reuniones_domingo','false','Permitir agendar reuniones los domingos','booleano','2025-12-28 22:22:06'),(10,'dias_sin_actividad_alerta','30','Días sin actividad para enviar alerta de inactividad','entero','2025-12-28 22:22:06'),(11,'dias_sin_actividad_riesgo','45','Días sin actividad para marcar proyecto en riesgo','entero','2025-12-28 22:22:06'),(12,'dias_sin_actividad_abandono','60','Días sin actividad para considerar abandono potencial','entero','2025-12-28 22:22:06'),(13,'dias_habiles_informante','15','Días hábiles que tiene el profesor Informante para evaluar informe final','entero','2025-12-28 22:22:06'),(14,'notificar_informante_auto','true','Notificar automáticamente al informante cuando se entrega el informe final','booleano','2025-12-28 22:22:06');
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
  `clave` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Identificador único de la configuración',
  `valor` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Valor de la configuración (se convierte según el tipo)',
  `tipo` enum('entero','booleano','texto') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de dato del valor',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descripción de qué hace esta configuración',
  `categoria` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'general' COMMENT 'Categoría para agrupar configuraciones (alertas, sistema, validaciones, etc.)',
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
) ENGINE=InnoDB AUTO_INCREMENT=4471 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES (1,'dias_sin_actividad_alerta','30','entero','Días sin actividad en un proyecto antes de enviar alerta de inactividad','alertas',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(2,'dias_habiles_informante','15','entero','Días máximos que tiene un profesor informante para evaluar (días hábiles)','evaluaciones',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(3,'UMBRAL_INACTIVIDAD_DIAS','30','entero','[Alias] Días sin actividad - Usado por panel de configuración','alertas',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(4,'DIAS_PREVIOS_ALERTA_FECHAS','2','entero','Días de anticipación para enviar alertas de fechas límite (48h y 24h)','alertas',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(5,'PLAZO_EVALUACION_DIAS','15','entero','[Alias] Plazo evaluación - Usado por panel de configuración','evaluaciones',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(6,'DIAS_ALERTA_EVALUACION','3','entero','Días antes del vencimiento del plazo para alertar sobre evaluación pendiente','alertas',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(7,'HORA_RECORDATORIO_REUNIONES','08:00','texto','Hora del día para enviar recordatorios de reuniones (formato HH:MM)','alertas',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(8,'HORA_ALERTA_EVALUACIONES','09:00','texto','Hora del día para enviar alertas de evaluaciones pendientes (formato HH:MM)','alertas',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(9,'MAX_PROYECTOS_POR_PROFESOR','5','entero','Número máximo de proyectos simultáneos que puede tener un profesor','validaciones',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(10,'MAX_ESTUDIANTES_POR_PROPUESTA','3','entero','Número máximo de estudiantes en una propuesta grupal','validaciones',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(11,'MIN_CARACTERES_PROPUESTA','200','entero','Mínimo de caracteres requeridos en la descripción de una propuesta','validaciones',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(12,'DURACION_MAXIMA_PROYECTO_SEMESTRES','2','entero','Duración máxima permitida de un proyecto de titulación en semestres','validaciones',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(13,'NOTIFICACIONES_EMAIL_ACTIVAS','true','booleano','Si se envían notificaciones por correo electrónico','notificaciones',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(14,'NOTIFICACIONES_PUSH_ACTIVAS','true','booleano','Si se envían notificaciones push en tiempo real vía WebSocket','notificaciones',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(15,'NOTIFICACIONES_NAVEGADOR_ACTIVAS','true','booleano','Si se muestran notificaciones del navegador (browser notifications)','notificaciones',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(16,'REQUIERE_APROBACION_JEFE_CARRERA','true','booleano','Si las propuestas requieren aprobación del jefe de carrera antes de asignar profesores','flujo',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(17,'PERMITE_AUTOASIGNACION_PROFESORES','false','booleano','Si los profesores pueden autoasignarse a propuestas sin aprobación del admin','flujo',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(18,'PERMITE_MODIFICACION_PROPUESTA_APROBADA','false','booleano','Si se permite modificar una propuesta después de ser aprobada','flujo',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(19,'NOMBRE_INSTITUCION','Universidad del Bío-Bío','texto','Nombre de la institución educativa','sistema',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(20,'EMAIL_SOPORTE','soporte@actitubb.cl','texto','Email de contacto para soporte técnico','sistema',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(21,'MANTENIMIENTO_ACTIVO','false','booleano','Modo mantenimiento - bloquea acceso a usuarios (excepto Super Admin)','sistema',1,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL),(22,'VERSION_SISTEMA','1.0.0','texto','Versión actual del sistema','sistema',0,'2025-12-28 22:22:06','2025-12-28 22:22:06',NULL);
/*!40000 ALTER TABLE `configuracion_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversaciones`
--

DROP TABLE IF EXISTS `conversaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario1_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario2_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ultimo_mensaje_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_conversacion` (`usuario1_rut`,`usuario2_rut`),
  KEY `idx_usuario1` (`usuario1_rut`),
  KEY `idx_usuario2` (`usuario2_rut`),
  KEY `idx_updated` (`updated_at`),
  KEY `fk_ultimo_mensaje` (`ultimo_mensaje_id`),
  CONSTRAINT `conversaciones_ibfk_1` FOREIGN KEY (`usuario1_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `conversaciones_ibfk_2` FOREIGN KEY (`usuario2_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `fk_ultimo_mensaje` FOREIGN KEY (`ultimo_mensaje_id`) REFERENCES `mensajes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversaciones`
--

LOCK TABLES `conversaciones` WRITE;
/*!40000 ALTER TABLE `conversaciones` DISABLE KEYS */;
INSERT INTO `conversaciones` VALUES (1,'11111111-1','22222222-2',2,'2026-02-25 05:02:47','2026-02-26 23:49:41');
/*!40000 ALTER TABLE `conversaciones` ENABLE KEYS */;
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
  `nombre_cronograma` varchar(255) NOT NULL DEFAULT 'Cronograma Principal',
  `descripcion` text,
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cronogramas_proyecto`
--

LOCK TABLES `cronogramas_proyecto` WRITE;
/*!40000 ALTER TABLE `cronogramas_proyecto` DISABLE KEYS */;
INSERT INTO `cronogramas_proyecto` VALUES (1,1,'Cronograma 1er Semestre 2025','Planificaci├│n completa del primer semestre de desarrollo del Sistema de Inventario para PyMES.','2025-03-01','2025-08-31',1,'22222222-2',1,'2025-03-05 13:30:00',1,3,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(2,2,'Cronograma Anual 2025','Planificaci├│n completa del a├▒o 2025 para la Plataforma E-Learning Rural.','2025-03-15','2025-12-15',1,'12345678-9',1,'2025-03-20 12:00:00',1,3,'2026-02-24 19:54:10','2026-02-24 19:54:10');
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
  `nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `jefe_departamento_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del profesor que es jefe de departamento',
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
INSERT INTO `departamentos` VALUES (1,1,'Departamento de Inform├ítica y Computaci├│n','DIC',NULL,NULL,NULL,'dic@ubiobio.cl','Edificio 2, Campus La Castilla',1,'2025-12-28 22:22:48','2026-02-24 19:53:16');
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos_carreras`
--

LOCK TABLES `departamentos_carreras` WRITE;
/*!40000 ALTER TABLE `departamentos_carreras` DISABLE KEYS */;
INSERT INTO `departamentos_carreras` VALUES (1,1,1,0,1,'2025-12-28 22:51:35','2025-12-28 22:51:35'),(2,1,2,0,1,'2025-12-28 22:51:40','2025-12-28 22:51:40');
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
  `nombre` varchar(255) NOT NULL COMMENT 'Nombre del feriado',
  `tipo` enum('nacional','regional','institucional') DEFAULT 'nacional',
  `es_inamovible` tinyint(1) DEFAULT '1' COMMENT 'Si el feriado no se puede mover (ej: 25 de diciembre)',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fecha` (`fecha`),
  KEY `idx_fecha_feriado` (`fecha`,`activo`),
  KEY `idx_tipo_feriado` (`tipo`,`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `dia_semana` enum('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_disponibilidad_usuario` (`usuario_rut`,`activo`),
  KEY `idx_disponibilidad_dia` (`dia_semana`,`activo`),
  CONSTRAINT `disponibilidad_horarios_ibfk_1` FOREIGN KEY (`usuario_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad_horarios`
--

LOCK TABLES `disponibilidad_horarios` WRITE;
/*!40000 ALTER TABLE `disponibilidad_horarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `disponibilidad_horarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entidades_externas`
--

DROP TABLE IF EXISTS `entidades_externas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entidades_externas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre de la empresa/institución',
  `razon_social` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Razón social completa',
  `rut_empresa` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT de la empresa (formato: 12345678-9)',
  `tipo` enum('empresa_privada','empresa_publica','institucion_educativa','ong','organismo_publico','otra') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'empresa_privada',
  `email_contacto` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `sitio_web` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Descripción de la entidad',
  `area_actividad` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Área de actividad (tecnología, salud, educación, etc.)',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entidades_externas`
--

LOCK TABLES `entidades_externas` WRITE;
/*!40000 ALTER TABLE `entidades_externas` DISABLE KEYS */;
INSERT INTO `entidades_externas` VALUES (1,'cge',NULL,NULL,'empresa_privada',NULL,NULL,NULL,NULL,NULL,NULL,1,'2025-12-29 02:56:21','2025-12-29 02:56:21');
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
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=997 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_propuestas`
--

LOCK TABLES `estados_propuestas` WRITE;
/*!40000 ALTER TABLE `estados_propuestas` DISABLE KEYS */;
INSERT INTO `estados_propuestas` VALUES (1,'pendiente','Propuesta enviada, esperando asignación de profesor','2025-12-28 22:22:06'),(2,'en_revision','Propuesta siendo revisada por profesor','2025-12-28 22:22:06'),(3,'correcciones','Propuesta requiere correcciones del estudiante','2025-12-28 22:22:06'),(4,'aprobada','Propuesta aprobada, se puede crear proyecto','2025-12-28 22:22:06'),(5,'rechazada','Propuesta rechazada','2025-12-28 22:22:06');
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
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=2779 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_proyectos`
--

LOCK TABLES `estados_proyectos` WRITE;
/*!40000 ALTER TABLE `estados_proyectos` DISABLE KEYS */;
INSERT INTO `estados_proyectos` VALUES (1,'esperando_asignacion_profesores','Proyecto creado esperando asignación de los 3 roles de profesores','2025-12-28 22:22:06'),(2,'en_desarrollo','Proyecto en fase de desarrollo','2025-12-28 22:22:06'),(3,'avance_enviado','Avance enviado para revisión','2025-12-28 22:22:06'),(4,'avance_en_revision','Avance siendo revisado','2025-12-28 22:22:06'),(5,'avance_con_comentarios','Avance con comentarios del profesor','2025-12-28 22:22:06'),(6,'avance_aprobado','Avance aprobado','2025-12-28 22:22:06'),(7,'pausado','Proyecto pausado temporalmente','2025-12-28 22:22:06'),(8,'completado','Proyecto completado','2025-12-28 22:22:06'),(9,'presentado','Proyecto presentado','2025-12-28 22:22:06'),(10,'defendido','Proyecto defendido exitosamente','2025-12-28 22:22:06'),(11,'retrasado','Proyecto con retraso en cronograma','2025-12-28 22:22:06'),(12,'en_riesgo','Proyecto en riesgo de no completarse','2025-12-28 22:22:06'),(13,'revision_urgente','Proyecto requiere revisión urgente','2025-12-28 22:22:06'),(14,'excelente_progreso','Proyecto con excelente progreso','2025-12-28 22:22:06');
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
  `estado_estudiante` enum('regular','congelado','egresado','retirado','titulado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'regular',
  `fecha_ingreso` date NOT NULL,
  `fecha_egreso` date DEFAULT NULL,
  `fecha_titulacion` date DEFAULT NULL,
  `promedio_acumulado` decimal(3,2) DEFAULT NULL,
  `creditos_aprobados` int DEFAULT '0',
  `es_carrera_principal` tinyint(1) DEFAULT '1' COMMENT 'Para estudiantes con doble titulación',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=210 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes_carreras`
--

LOCK TABLES `estudiantes_carreras` WRITE;
/*!40000 ALTER TABLE `estudiantes_carreras` DISABLE KEYS */;
INSERT INTO `estudiantes_carreras` VALUES (1,'11111111-1',1,2025,1,'regular','2025-12-28',NULL,NULL,NULL,0,1,NULL,'2025-12-28 22:23:32','2025-12-28 22:23:32'),(178,'15234567-3',1,2021,9,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(179,'16789012-4',1,2022,7,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(180,'17890123-5',2,2022,7,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(181,'18901234-6',2,2022,7,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes_propuestas`
--

LOCK TABLES `estudiantes_propuestas` WRITE;
/*!40000 ALTER TABLE `estudiantes_propuestas` DISABLE KEYS */;
INSERT INTO `estudiantes_propuestas` VALUES (2,2,'11111111-1',1,1,'2025-12-28 22:44:10'),(3,2,'15234567-3',0,2,'2026-02-24 19:53:16'),(7,3,'16789012-4',1,1,'2026-02-24 19:54:10'),(8,3,'17890123-5',0,2,'2026-02-24 19:54:10'),(9,3,'18901234-6',0,3,'2026-02-24 19:54:10');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes_proyectos`
--

LOCK TABLES `estudiantes_proyectos` WRITE;
/*!40000 ALTER TABLE `estudiantes_proyectos` DISABLE KEYS */;
INSERT INTO `estudiantes_proyectos` VALUES (1,1,'11111111-1',1,1,'2025-12-29 02:57:59'),(2,1,'15234567-3',0,2,'2026-02-24 19:53:16'),(4,2,'16789012-4',1,1,'2026-02-24 19:54:10'),(5,2,'17890123-5',0,2,'2026-02-24 19:54:10'),(6,2,'18901234-6',0,3,'2026-02-24 19:54:10');
/*!40000 ALTER TABLE `estudiantes_proyectos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `evaluaciones_colaboradores`
--

DROP TABLE IF EXISTS `evaluaciones_colaboradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `evaluaciones_colaboradores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `colaborador_proyecto_id` int NOT NULL COMMENT 'ID de la relación colaborador-proyecto',
  `proyecto_id` int NOT NULL COMMENT 'ID del proyecto evaluado',
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del estudiante evaluado',
  `desempeno_tecnico` decimal(2,1) DEFAULT NULL COMMENT 'Calificación de desempeño técnico',
  `cumplimiento_plazos` decimal(2,1) DEFAULT NULL COMMENT 'Calificación de cumplimiento de plazos',
  `comunicacion` decimal(2,1) DEFAULT NULL COMMENT 'Calificación de comunicación',
  `proactividad` decimal(2,1) DEFAULT NULL COMMENT 'Calificación de proactividad',
  `trabajo_equipo` decimal(2,1) DEFAULT NULL COMMENT 'Calificación de trabajo en equipo',
  `resolucion_problemas` decimal(2,1) DEFAULT NULL COMMENT 'Calificación de resolución de problemas',
  `nota_final` decimal(2,1) DEFAULT NULL COMMENT 'Nota final promedio',
  `comentarios` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Comentarios y observaciones',
  `fortalezas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Fortalezas identificadas',
  `areas_mejora` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Áreas de mejora identificadas',
  `recomendaria_contratar` enum('si','no','tal_vez') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '¿Recomendaría contratar al estudiante?',
  `comentario_recomendacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Comentario sobre la recomendación',
  `fecha_evaluacion` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de la evaluación',
  `evaluacion_completada` tinyint(1) DEFAULT '0' COMMENT 'Si la evaluación está completa',
  `fecha_completada` datetime DEFAULT NULL COMMENT 'Fecha en que se completó la evaluación',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_colaborador_proyecto` (`colaborador_proyecto_id`),
  KEY `idx_proyecto` (`proyecto_id`),
  KEY `idx_estudiante` (`estudiante_rut`),
  KEY `idx_fecha_evaluacion` (`fecha_evaluacion`),
  CONSTRAINT `evaluaciones_colaboradores_ibfk_1` FOREIGN KEY (`colaborador_proyecto_id`) REFERENCES `colaboradores_proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluaciones_colaboradores_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluaciones_colaboradores_ibfk_3` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `evaluaciones_colaboradores`
--

LOCK TABLES `evaluaciones_colaboradores` WRITE;
/*!40000 ALTER TABLE `evaluaciones_colaboradores` DISABLE KEYS */;
/*!40000 ALTER TABLE `evaluaciones_colaboradores` ENABLE KEYS */;
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
  `fortalezas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `areas_mejora` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `comentarios_generales` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `recomendaria_estudiante` tinyint(1) DEFAULT NULL COMMENT '¿Recomendaría contratar al estudiante?',
  `documento_evaluacion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Documento PDF de evaluación formal',
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
-- Table structure for table `facultades`
--

DROP TABLE IF EXISTS `facultades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facultades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `decano_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del profesor que es decano',
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facultades`
--

LOCK TABLES `facultades` WRITE;
/*!40000 ALTER TABLE `facultades` DISABLE KEYS */;
INSERT INTO `facultades` VALUES (1,'Facultad de Ciencias de la Ingenier├¡a','FCI','Facultad dedicada a la formaci├│n de ingenieros en diversas disciplinas.',NULL,NULL,'fci@ubiobio.cl','Campus La Castilla, Concepci├│n',1,'2025-12-28 22:22:42','2026-02-24 19:53:16');
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
  `titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `fecha_inicio` date DEFAULT NULL COMMENT 'Fecha de inicio del período (opcional)',
  `hora_inicio` time DEFAULT '00:00:00' COMMENT 'Hora de inicio del período',
  `fecha` date NOT NULL COMMENT 'Fecha fin/límite del período (obligatorio)',
  `hora_limite` time DEFAULT '23:59:59' COMMENT 'Hora límite para entregas (por defecto fin del día)',
  `tipo_fecha` enum('entrega_propuesta','entrega','entrega_avance','entrega_final','reunion','hito','deadline','presentacion','defensa','revision','academica','global','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'otro',
  `es_global` tinyint(1) DEFAULT '0' COMMENT 'Si es true, visible para todos (fechas del admin)',
  `activa` tinyint(1) DEFAULT '1' COMMENT 'Para soft delete (solo fechas de calendario)',
  `habilitada` tinyint(1) DEFAULT '1' COMMENT 'Controla si el período está activo para recibir entregas',
  `permite_extension` tinyint(1) DEFAULT '1' COMMENT 'Si permite solicitar extensión después de la fecha límite',
  `requiere_entrega` tinyint(1) DEFAULT '0' COMMENT 'Si requiere entrega de archivos/documentos',
  `completada` tinyint(1) DEFAULT '0',
  `fecha_realizada` date DEFAULT NULL COMMENT 'Fecha en que se completó el evento',
  `notas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `proyecto_id` int DEFAULT NULL COMMENT 'NULL para fechas globales, ID del proyecto para fechas específicas',
  `creado_por_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'RUT del que creó la fecha (admin o profesor)',
  `profesor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del profesor (para fechas específicas profesor-estudiante)',
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del estudiante (para fechas específicas)',
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fechas`
--

LOCK TABLES `fechas` WRITE;
/*!40000 ALTER TABLE `fechas` DISABLE KEYS */;
INSERT INTO `fechas` VALUES (1,'holamundo','',NULL,'00:00:00','2025-12-28','19:50:00','entrega_propuesta',1,1,0,1,1,0,NULL,NULL,NULL,'33333333-3',NULL,NULL,'2025-12-28 22:26:23','2025-12-28 22:50:00'),(2,'Entrega Informe Parcial ÔÇô M├│dulo Alertas y Reportes','Entrega del informe de avance 3 con descripci├│n e implementaci├│n del m├│dulo de alertas y reportes.',NULL,'00:00:00','2025-07-25','23:59:59','entrega_avance',0,1,1,1,1,0,NULL,NULL,1,'22222222-2',NULL,NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(3,'Reuni├│n de Seguimiento ÔÇô Semana 20','Reuni├│n quincenal de seguimiento del estado del proyecto de inventario.',NULL,'00:00:00','2025-07-18','23:59:59','reunion',0,1,1,0,0,0,NULL,NULL,1,'22222222-2',NULL,NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(4,'Entrega Avance 2 ÔÇô M├│dulo de Contenidos','Primera entrega importante del m├│dulo de gesti├│n de contenidos educativos.',NULL,'00:00:00','2025-08-01','23:59:59','entrega_avance',0,1,1,1,1,0,NULL,NULL,2,'12345678-9',NULL,NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(5,'Reuni├│n de Revisi├│n de Prototipos','Revisi├│n de los prototipos validados con usuarios y ajuste del plan de desarrollo.',NULL,'00:00:00','2025-07-22','23:59:59','reunion',0,1,1,0,0,0,NULL,NULL,2,'12345678-9',NULL,NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(6,'Fecha L├¡mite Env├¡o de Propuestas ÔÇô 2┬░ Semestre 2025','Fecha l├¡mite para el env├¡o de propuestas de titulaci├│n del segundo semestre del a├▒o 2025.',NULL,'00:00:00','2025-07-31','23:59:59','entrega_propuesta',1,1,0,0,1,0,NULL,NULL,NULL,'33333333-3',NULL,NULL,'2026-02-24 19:54:10','2026-02-24 19:55:00'),(7,'Inicio Per├¡odo de Titulaciones ÔÇô 2┬░ Semestre 2025','Fecha de inicio del per├¡odo oficial de proyectos de titulaci├│n para el segundo semestre 2025.',NULL,'00:00:00','2025-08-04','23:59:59','academica',1,1,0,0,0,0,NULL,NULL,NULL,'33333333-3',NULL,NULL,'2026-02-24 19:54:10','2026-02-24 19:55:00');
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
  `accion` enum('asignado','desasignado','modificado') NOT NULL,
  `fecha_accion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `realizado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `observaciones` text,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `estado_anterior` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_nuevo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Razón del cambio de estado',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
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
  `accion` enum('solicitud_creada','en_revision','aprobada','rechazada','modificada') NOT NULL,
  `realizado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentarios` text,
  `fecha_accion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `realizado_por` (`realizado_por`),
  KEY `idx_historial_solicitud` (`solicitud_id`),
  KEY `idx_historial_proyecto` (`proyecto_id`),
  KEY `idx_historial_fecha` (`fecha_accion`),
  CONSTRAINT `historial_extensiones_ibfk_1` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_extension` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_extensiones_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `historial_extensiones_ibfk_3` FOREIGN KEY (`realizado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `tipo_reunion` varchar(50) NOT NULL,
  `accion` enum('solicitud_creada','aceptada_profesor','aceptada_estudiante','confirmada','rechazada','cancelada','realizada') NOT NULL,
  `realizado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentarios` text,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `accion` enum('asignado','revision_iniciada','comentario_agregado','decision_tomada','desasignado') NOT NULL,
  `decision` enum('aprobar','rechazar','solicitar_correcciones') DEFAULT NULL,
  `comentarios` text,
  `fecha_accion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `realizado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT de quien realizó la acción (puede ser el mismo profesor)',
  `archivo_revision` varchar(255) DEFAULT NULL COMMENT 'Archivo adjunto a esta revisión',
  `nombre_archivo_original` varchar(255) DEFAULT NULL COMMENT 'Nombre original del archivo adjunto',
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_revisiones_propuestas`
--

LOCK TABLES `historial_revisiones_propuestas` WRITE;
/*!40000 ALTER TABLE `historial_revisiones_propuestas` DISABLE KEYS */;
INSERT INTO `historial_revisiones_propuestas` VALUES (1,2,2,'33333333-3','decision_tomada','solicitar_correcciones','glñfkgkglñdkfgdfgdfg','2025-12-29 02:34:42','33333333-3','1766975682946-314394226.pdf','jhf.pdf'),(2,2,2,'33333333-3','decision_tomada','aprobar',NULL,'2025-12-29 02:57:59','33333333-3',NULL,NULL);
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
  `nombre_hito` varchar(255) NOT NULL,
  `descripcion` text,
  `tipo_hito` enum('entrega_documento','revision_avance','reunion_seguimiento','defensa') NOT NULL,
  `fecha_limite` date NOT NULL,
  `fecha_entrega` timestamp NULL DEFAULT NULL,
  `estado` enum('pendiente','en_progreso','entregado','revisado','aprobado','rechazado','retrasado') DEFAULT 'pendiente',
  `porcentaje_avance` decimal(5,2) DEFAULT '0.00',
  `archivo_entrega` varchar(255) DEFAULT NULL,
  `nombre_archivo_original` varchar(255) DEFAULT NULL,
  `comentarios_estudiante` text,
  `comentarios_profesor` text,
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hitos_cronograma`
--

LOCK TABLES `hitos_cronograma` WRITE;
/*!40000 ALTER TABLE `hitos_cronograma` DISABLE KEYS */;
INSERT INTO `hitos_cronograma` VALUES (1,1,1,'Informe de An├ílisis y Dise├▒o','Documento con requisitos, modelo de datos y arquitectura del sistema.','entrega_documento','2025-04-20',NULL,'revisado',100.00,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(2,1,1,'Revisi├│n Avance M├│dulo Stock','Revisi├│n del m├│dulo de control de stock con demostraci├│n funcional.','revision_avance','2025-06-05',NULL,'aprobado',100.00,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(3,1,1,'Informe de Avance ÔÇô Alertas y Reportes','Documento e implementaci├│n del m├│dulo de alertas y reportes gerenciales.','entrega_documento','2025-07-25',NULL,'pendiente',0.00,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(4,1,1,'Reuni├│n Final antes de Defensa','Reuni├│n de preparaci├│n y revisi├│n final del proyecto.','reunion_seguimiento','2025-08-20',NULL,'pendiente',0.00,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(5,2,2,'Informe de An├ílisis y Prototipo','Documento de an├ílisis de requerimientos y prototipos validados.','entrega_documento','2025-05-20',NULL,'aprobado',100.00,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(6,2,2,'Avance M├│dulo de Contenidos','Demostraci├│n funcional del m├│dulo de gesti├│n de contenidos.','revision_avance','2025-08-01',NULL,'pendiente',0.00,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(7,2,2,'Informe M├│dulo Offline','Documento e implementaci├│n del sistema de cach├® y sincronizaci├│n offline.','entrega_documento','2025-10-01',NULL,'pendiente',0.00,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(8,2,2,'Defensa Final','Presentaci├│n oral ante comisi├│n evaluadora.','defensa','2025-12-10',NULL,'pendiente',0.00,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-24 19:54:10','2026-02-24 19:54:10');
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
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `tipo_hito` enum('inicio','planificacion','desarrollo','entrega_parcial','revision','testing','documentacion','entrega_final','defensa','cierre') NOT NULL,
  `fecha_objetivo` date NOT NULL,
  `fecha_completado` date DEFAULT NULL,
  `estado` enum('pendiente','en_progreso','completado','retrasado','cancelado') DEFAULT 'pendiente',
  `porcentaje_completado` decimal(5,2) DEFAULT '0.00',
  `peso_en_proyecto` decimal(4,1) DEFAULT '10.0',
  `fecha_entrega_estudiante` date DEFAULT NULL COMMENT 'Fecha real en que el estudiante entregó (para entrega_final)',
  `fecha_limite_informante` date DEFAULT NULL COMMENT 'Fecha límite para que el profesor Informante evalúe (entrega + 15 días hábiles)',
  `dias_habiles_informante` int DEFAULT '15' COMMENT 'Días hábiles que tiene el informante para evaluar',
  `informante_notificado` tinyint(1) DEFAULT '0' COMMENT 'Si se notificó al informante sobre la entrega',
  `fecha_notificacion_informante` timestamp NULL DEFAULT NULL COMMENT 'Fecha en que se notificó al informante',
  `archivo_entregable` varchar(255) DEFAULT NULL,
  `comentarios_estudiante` text,
  `comentarios_profesor` text,
  `calificacion` decimal(3,1) DEFAULT NULL,
  `hito_predecesor_id` int DEFAULT NULL,
  `es_critico` tinyint(1) DEFAULT '0',
  `creado_por_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `actualizado_por_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `hito_predecesor_id` (`hito_predecesor_id`),
  KEY `creado_por_rut` (`creado_por_rut`),
  KEY `actualizado_por_rut` (`actualizado_por_rut`),
  KEY `idx_proyecto_estado` (`proyecto_id`,`estado`),
  KEY `idx_fecha_objetivo` (`fecha_objetivo`),
  KEY `idx_tipo_estado` (`tipo_hito`,`estado`),
  CONSTRAINT `hitos_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hitos_proyecto_ibfk_2` FOREIGN KEY (`hito_predecesor_id`) REFERENCES `hitos_proyecto` (`id`) ON DELETE SET NULL,
  CONSTRAINT `hitos_proyecto_ibfk_3` FOREIGN KEY (`creado_por_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `hitos_proyecto_ibfk_4` FOREIGN KEY (`actualizado_por_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `hitos_proyecto_chk_1` CHECK (((`porcentaje_completado` >= 0) and (`porcentaje_completado` <= 100))),
  CONSTRAINT `hitos_proyecto_chk_2` CHECK (((`peso_en_proyecto` >= 0) and (`peso_en_proyecto` <= 100))),
  CONSTRAINT `hitos_proyecto_chk_3` CHECK (((`calificacion` >= 1.0) and (`calificacion` <= 7.0)))
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hitos_proyecto`
--

LOCK TABLES `hitos_proyecto` WRITE;
/*!40000 ALTER TABLE `hitos_proyecto` DISABLE KEYS */;
INSERT INTO `hitos_proyecto` VALUES (1,1,'Kickoff y Levantamiento de Requisitos','Reuni├│n inicial con stakeholders y levantamiento de requisitos funcionales y no funcionales del sistema.','inicio','2025-03-15','2025-03-14','completado',100.00,10.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'22222222-2',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(2,1,'Dise├▒o de Base de Datos y Arquitectura','Modelado entidad-relaci├│n, dise├▒o de la arquitectura de 3 capas y definici├│n de tecnolog├¡as a utilizar.','planificacion','2025-04-15','2025-04-13','completado',100.00,15.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'22222222-2',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(3,1,'Implementaci├│n M├│dulo de Stock','Desarrollo del CRUD de productos, registro de movimientos de inventario y c├ílculo autom├ítico de stock m├¡nimo.','desarrollo','2025-05-31','2025-05-28','completado',100.00,20.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'22222222-2',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(4,1,'Implementaci├│n M├│dulo de Alertas y Reportes','Desarrollo del sistema de alertas autom├íticas de reabastecimiento y m├│dulo de reportes gerenciales.','desarrollo','2025-07-15',NULL,'en_progreso',50.00,20.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,'22222222-2',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(5,1,'Pruebas e Integraci├│n','Testing unitario, de integraci├│n y pruebas de aceptaci├│n con usuarios finales de la PyME piloto.','testing','2025-08-10',NULL,'pendiente',0.00,15.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'22222222-2',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(6,1,'Documentaci├│n T├®cnica y de Usuario','Redacci├│n del informe final, manual de usuario y documentaci├│n t├®cnica del sistema.','documentacion','2025-08-22',NULL,'pendiente',0.00,10.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,'22222222-2',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(7,1,'Defensa del Proyecto','Presentaci├│n y defensa oral ante la comisi├│n evaluadora.','defensa','2025-08-31',NULL,'pendiente',0.00,10.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'22222222-2',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(8,2,'An├ílisis de Requerimientos y Planificaci├│n','An├ílisis completo de requerimientos, planificaci├│n del proyecto y definici├│n de tecnolog├¡as.','inicio','2025-04-01','2025-03-30','completado',100.00,10.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'12345678-9',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(9,2,'Prototipo de Interfaz Adaptativa','Dise├▒o y validaci├│n del prototipo de interfaz de usuario adaptativa con pruebas de usabilidad.','planificacion','2025-05-15','2025-05-10','completado',100.00,10.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,'12345678-9',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(10,2,'M├│dulo de Gesti├│n de Contenidos','Implementaci├│n del sistema de carga, organizaci├│n y reproducci├│n de contenidos educativos.','desarrollo','2025-07-01',NULL,'en_progreso',35.00,20.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'12345678-9',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(11,2,'M├│dulo de Cach├® y Soporte Offline','Implementaci├│n del sistema de cach├® local y sincronizaci├│n para funcionamiento sin conectividad.','desarrollo','2025-08-31',NULL,'pendiente',0.00,25.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'12345678-9',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(12,2,'M├│dulo de Evaluaciones','Desarrollo del sistema de pruebas, seguimiento del aprendizaje y generaci├│n de reportes para docentes.','desarrollo','2025-10-15',NULL,'pendiente',0.00,15.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,'12345678-9',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(13,2,'Pruebas en Terreno','Pruebas de campo con estudiantes y docentes de escuelas rurales de la regi├│n.','testing','2025-11-15',NULL,'pendiente',0.00,10.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'12345678-9',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(14,2,'Defensa Final','Presentaci├│n y defensa ante la comisi├│n evaluadora.','defensa','2025-12-10',NULL,'pendiente',0.00,10.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'12345678-9',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10');
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
) ENGINE=InnoDB AUTO_INCREMENT=409 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jefes_carreras`
--

LOCK TABLES `jefes_carreras` WRITE;
/*!40000 ALTER TABLE `jefes_carreras` DISABLE KEYS */;
INSERT INTO `jefes_carreras` VALUES (1,'33333333-3',1,'2025-12-28',NULL,1,'2025-12-28 22:23:21','2025-12-28 22:23:21'),(2,'33333333-3',2,'2025-12-28',NULL,1,'2025-12-28 22:23:24','2025-12-28 22:23:24');
/*!40000 ALTER TABLE `jefes_carreras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes`
--

DROP TABLE IF EXISTS `mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversacion_id` int NOT NULL,
  `remitente_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenido` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `leido` tinyint(1) DEFAULT '0',
  `fecha_lectura` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversacion` (`conversacion_id`),
  KEY `idx_remitente` (`remitente_rut`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`remitente_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes`
--

LOCK TABLES `mensajes` WRITE;
/*!40000 ALTER TABLE `mensajes` DISABLE KEYS */;
INSERT INTO `mensajes` VALUES (1,1,'11111111-1','Hola profe, esto es un test del chat!',1,'2026-02-27 21:49:27','2026-02-25 05:02:47'),(2,1,'11111111-1','hola profe',1,'2026-02-27 21:49:27','2026-02-26 23:49:41');
/*!40000 ALTER TABLE `mensajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes_no_leidos`
--

DROP TABLE IF EXISTS `mensajes_no_leidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes_no_leidos` (
  `usuario_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `conversacion_id` int NOT NULL,
  `cantidad` int DEFAULT '0',
  `ultimo_mensaje_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`usuario_rut`,`conversacion_id`),
  KEY `conversacion_id` (`conversacion_id`),
  KEY `idx_usuario` (`usuario_rut`),
  CONSTRAINT `mensajes_no_leidos_ibfk_1` FOREIGN KEY (`usuario_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_no_leidos_ibfk_2` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes_no_leidos`
--

LOCK TABLES `mensajes_no_leidos` WRITE;
/*!40000 ALTER TABLE `mensajes_no_leidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensajes_no_leidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones_colaboradores`
--

DROP TABLE IF EXISTS `notificaciones_colaboradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones_colaboradores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `colaborador_id` int NOT NULL COMMENT 'ID del colaborador',
  `tipo` enum('asignacion_proyecto','solicitud_evaluacion','recordatorio_evaluacion','mensaje_profesor','actualizacion_proyecto') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Título de la notificación',
  `mensaje` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Contenido de la notificación',
  `proyecto_id` int DEFAULT NULL COMMENT 'Proyecto relacionado',
  `leida` tinyint(1) DEFAULT '0' COMMENT 'Si la notificación fue leída',
  `fecha_leida` datetime DEFAULT NULL COMMENT 'Fecha en que se leyó',
  `url_accion` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL a la que debe dirigirse',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `proyecto_id` (`proyecto_id`),
  KEY `idx_colaborador_leida` (`colaborador_id`,`leida`),
  KEY `idx_fecha` (`created_at`),
  CONSTRAINT `notificaciones_colaboradores_ibfk_1` FOREIGN KEY (`colaborador_id`) REFERENCES `colaboradores_externos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notificaciones_colaboradores_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones_colaboradores`
--

LOCK TABLES `notificaciones_colaboradores` WRITE;
/*!40000 ALTER TABLE `notificaciones_colaboradores` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones_colaboradores` ENABLE KEYS */;
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
  `tipo_notificacion` enum('fecha_limite_proxima','entrega_retrasada','revision_pendiente','cronograma_modificado','nueva_entrega','proyecto_creado') NOT NULL,
  `destinatario_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_destinatario` enum('estudiante','profesor_guia','profesor_revisor','admin') NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones_proyecto`
--

LOCK TABLES `notificaciones_proyecto` WRITE;
/*!40000 ALTER TABLE `notificaciones_proyecto` DISABLE KEYS */;
INSERT INTO `notificaciones_proyecto` VALUES (1,1,NULL,'proyecto_creado','33333333-3','admin','Nuevo Proyecto Creado','Nuevo proyecto creado automáticamente: \"AAAAAAAAAAAAAAAAAA\". Requiere asignación de los 3 roles de profesores para activarse.',0,NULL,1,1,0,NULL,'2025-12-29 02:57:59');
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
  `rol` enum('organizador','participante','invitado') DEFAULT 'participante',
  `confirmado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_participante` (`reunion_id`,`usuario_rut`),
  KEY `usuario_rut` (`usuario_rut`),
  CONSTRAINT `participantes_reuniones_ibfk_1` FOREIGN KEY (`reunion_id`) REFERENCES `reuniones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `participantes_reuniones_ibfk_2` FOREIGN KEY (`usuario_rut`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `participantes_reuniones`
--

LOCK TABLES `participantes_reuniones` WRITE;
/*!40000 ALTER TABLE `participantes_reuniones` DISABLE KEYS */;
/*!40000 ALTER TABLE `participantes_reuniones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodos_propuestas`
--

DROP TABLE IF EXISTS `periodos_propuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodos_propuestas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activo` (`activo`),
  KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`)
) ENGINE=InnoDB AUTO_INCREMENT=202 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos_propuestas`
--

LOCK TABLES `periodos_propuestas` WRITE;
/*!40000 ALTER TABLE `periodos_propuestas` DISABLE KEYS */;
INSERT INTO `periodos_propuestas` VALUES (1,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-28 22:39:08','2025-12-28 22:39:08'),(2,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-28 22:48:37','2025-12-28 22:48:37'),(3,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-28 22:49:18','2025-12-28 22:49:18'),(4,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-28 22:56:29','2025-12-28 22:56:29'),(5,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-28 22:56:41','2025-12-28 22:56:41'),(6,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 00:42:39','2025-12-29 00:42:39'),(7,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 00:42:54','2025-12-29 00:42:54'),(8,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 00:43:17','2025-12-29 00:43:17'),(9,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 00:44:38','2025-12-29 00:44:38'),(10,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 00:44:55','2025-12-29 00:44:55'),(11,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 00:45:57','2025-12-29 00:45:57'),(12,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 00:46:15','2025-12-29 00:46:15'),(13,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 00:47:46','2025-12-29 00:47:46'),(14,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 00:48:01','2025-12-29 00:48:01'),(15,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:25:26','2025-12-29 02:25:26'),(16,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:26:45','2025-12-29 02:26:45'),(17,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:26:56','2025-12-29 02:26:56'),(18,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:27:05','2025-12-29 02:27:05'),(19,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:28:22','2025-12-29 02:28:22'),(20,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:29:15','2025-12-29 02:29:15'),(21,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:29:23','2025-12-29 02:29:23'),(22,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:30:22','2025-12-29 02:30:22'),(23,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:30:35','2025-12-29 02:30:35'),(24,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:30:49','2025-12-29 02:30:49'),(25,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:31:03','2025-12-29 02:31:03'),(26,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:31:14','2025-12-29 02:31:14'),(27,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:32:20','2025-12-29 02:32:20'),(28,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:32:34','2025-12-29 02:32:34'),(29,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:32:38','2025-12-29 02:32:38'),(30,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:33:45','2025-12-29 02:33:45'),(31,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:34:12','2025-12-29 02:34:12'),(32,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:34:34','2025-12-29 02:34:34'),(33,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:44:53','2025-12-29 02:44:53'),(34,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:45:32','2025-12-29 02:45:32'),(35,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:46:06','2025-12-29 02:46:06'),(36,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:46:34','2025-12-29 02:46:34'),(37,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 02:46:57','2025-12-29 02:46:57'),(38,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 03:21:06','2025-12-29 03:21:06'),(39,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2025-12-29 03:23:29','2025-12-29 03:23:29'),(40,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-01-27 17:33:24','2026-01-27 17:33:24'),(41,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-08 21:47:37','2026-02-08 21:47:37'),(42,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 17:48:34','2026-02-22 17:48:34'),(43,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 17:51:26','2026-02-22 17:51:26'),(44,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 17:51:36','2026-02-22 17:51:36'),(45,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 17:52:17','2026-02-22 17:52:17'),(46,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:17:29','2026-02-22 18:17:29'),(47,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:17:33','2026-02-22 18:17:33'),(48,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:17:37','2026-02-22 18:17:37'),(49,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:17:48','2026-02-22 18:17:48'),(50,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:17:53','2026-02-22 18:17:53'),(51,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:17:59','2026-02-22 18:17:59'),(52,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:18:20','2026-02-22 18:18:20'),(53,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:18:25','2026-02-22 18:18:25'),(54,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:19:57','2026-02-22 18:19:57'),(55,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:20:20','2026-02-22 18:20:20'),(56,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:21:03','2026-02-22 18:21:03'),(57,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:21:53','2026-02-22 18:21:53'),(58,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:22:51','2026-02-22 18:22:51'),(59,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:23:32','2026-02-22 18:23:32'),(60,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-22 18:26:15','2026-02-22 18:26:15'),(61,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-23 02:47:28','2026-02-23 02:47:28'),(62,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-23 03:00:47','2026-02-23 03:00:47'),(63,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-23 05:00:08','2026-02-23 05:00:08'),(64,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:24:14','2026-02-24 13:24:14'),(65,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:24:18','2026-02-24 13:24:18'),(66,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:24:37','2026-02-24 13:24:37'),(67,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:24:42','2026-02-24 13:24:42'),(68,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:24:46','2026-02-24 13:24:46'),(69,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:24:50','2026-02-24 13:24:50'),(70,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:02','2026-02-24 13:25:02'),(71,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:07','2026-02-24 13:25:07'),(72,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:10','2026-02-24 13:25:10'),(73,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:14','2026-02-24 13:25:14'),(74,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:18','2026-02-24 13:25:18'),(75,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:24','2026-02-24 13:25:24'),(76,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:29','2026-02-24 13:25:29'),(77,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:32','2026-02-24 13:25:32'),(78,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:36','2026-02-24 13:25:36'),(79,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:41','2026-02-24 13:25:41'),(80,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:47','2026-02-24 13:25:47'),(81,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:53','2026-02-24 13:25:53'),(82,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:25:57','2026-02-24 13:25:57'),(83,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:01','2026-02-24 13:26:01'),(84,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:04','2026-02-24 13:26:04'),(85,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:08','2026-02-24 13:26:08'),(86,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:12','2026-02-24 13:26:12'),(87,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:17','2026-02-24 13:26:17'),(88,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:23','2026-02-24 13:26:23'),(89,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:27','2026-02-24 13:26:27'),(90,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:33','2026-02-24 13:26:33'),(91,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:37','2026-02-24 13:26:37'),(92,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:40','2026-02-24 13:26:40'),(93,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:45','2026-02-24 13:26:45'),(94,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:50','2026-02-24 13:26:50'),(95,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:54','2026-02-24 13:26:54'),(96,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:26:59','2026-02-24 13:26:59'),(97,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:03','2026-02-24 13:27:03'),(98,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:07','2026-02-24 13:27:07'),(99,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:12','2026-02-24 13:27:12'),(100,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:16','2026-02-24 13:27:16'),(101,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:21','2026-02-24 13:27:21'),(102,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:25','2026-02-24 13:27:25'),(103,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:29','2026-02-24 13:27:29'),(104,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:36','2026-02-24 13:27:36'),(105,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:40','2026-02-24 13:27:40'),(106,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:45','2026-02-24 13:27:45'),(107,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:50','2026-02-24 13:27:50'),(108,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:27:59','2026-02-24 13:27:59'),(109,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:28:05','2026-02-24 13:28:05'),(110,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:00','2026-02-24 13:30:00'),(111,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:02','2026-02-24 13:30:02'),(112,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:05','2026-02-24 13:30:05'),(113,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:08','2026-02-24 13:30:08'),(114,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:11','2026-02-24 13:30:11'),(115,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:14','2026-02-24 13:30:14'),(116,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:16','2026-02-24 13:30:16'),(117,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:19','2026-02-24 13:30:19'),(118,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:23','2026-02-24 13:30:23'),(119,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:26','2026-02-24 13:30:26'),(120,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:29','2026-02-24 13:30:29'),(121,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:33','2026-02-24 13:30:33'),(122,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:37','2026-02-24 13:30:37'),(123,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:30:41','2026-02-24 13:30:41'),(124,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:07','2026-02-24 13:31:07'),(125,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:15','2026-02-24 13:31:15'),(126,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:18','2026-02-24 13:31:18'),(127,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:23','2026-02-24 13:31:23'),(128,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:28','2026-02-24 13:31:28'),(129,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:32','2026-02-24 13:31:32'),(130,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:36','2026-02-24 13:31:36'),(131,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:39','2026-02-24 13:31:39'),(132,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:43','2026-02-24 13:31:43'),(133,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:46','2026-02-24 13:31:46'),(134,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:49','2026-02-24 13:31:49'),(135,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:53','2026-02-24 13:31:53'),(136,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:31:59','2026-02-24 13:31:59'),(137,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:32:04','2026-02-24 13:32:04'),(138,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:32:08','2026-02-24 13:32:08'),(139,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:32:13','2026-02-24 13:32:13'),(140,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:32:18','2026-02-24 13:32:18'),(141,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:32:22','2026-02-24 13:32:22'),(142,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:32:25','2026-02-24 13:32:25'),(143,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:33:21','2026-02-24 13:33:21'),(144,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:33:27','2026-02-24 13:33:27'),(145,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:33:34','2026-02-24 13:33:34'),(146,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:37:02','2026-02-24 13:37:02'),(147,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:37:33','2026-02-24 13:37:33'),(148,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:37:39','2026-02-24 13:37:39'),(149,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:37:43','2026-02-24 13:37:43'),(150,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:37:46','2026-02-24 13:37:46'),(151,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:37:49','2026-02-24 13:37:49'),(152,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:37:53','2026-02-24 13:37:53'),(153,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:37:57','2026-02-24 13:37:57'),(154,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:37:59','2026-02-24 13:37:59'),(155,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:02','2026-02-24 13:38:02'),(156,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:05','2026-02-24 13:38:05'),(157,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:07','2026-02-24 13:38:07'),(158,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:10','2026-02-24 13:38:10'),(159,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:12','2026-02-24 13:38:12'),(160,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:15','2026-02-24 13:38:15'),(161,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:25','2026-02-24 13:38:25'),(162,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:28','2026-02-24 13:38:28'),(163,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:30','2026-02-24 13:38:30'),(164,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:33','2026-02-24 13:38:33'),(165,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:35','2026-02-24 13:38:35'),(166,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:38','2026-02-24 13:38:38'),(167,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:40','2026-02-24 13:38:40'),(168,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:43','2026-02-24 13:38:43'),(169,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:46','2026-02-24 13:38:46'),(170,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:49','2026-02-24 13:38:49'),(171,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:52','2026-02-24 13:38:52'),(172,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:55','2026-02-24 13:38:55'),(173,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 13:38:58','2026-02-24 13:38:58'),(174,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 19:33:04','2026-02-24 19:33:04'),(175,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:14:16','2026-02-24 23:14:16'),(176,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:14:19','2026-02-24 23:14:19'),(177,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:15:51','2026-02-24 23:15:51'),(178,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:15:59','2026-02-24 23:15:59'),(179,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:16:20','2026-02-24 23:16:20'),(180,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:16:26','2026-02-24 23:16:26'),(181,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:19:31','2026-02-24 23:19:31'),(182,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:19:39','2026-02-24 23:19:39'),(183,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:19:48','2026-02-24 23:19:48'),(184,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:23:44','2026-02-24 23:23:44'),(185,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:23:51','2026-02-24 23:23:51'),(186,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:23:56','2026-02-24 23:23:56'),(187,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:24:01','2026-02-24 23:24:01'),(188,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:24:08','2026-02-24 23:24:08'),(189,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:24:14','2026-02-24 23:24:14'),(190,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:24:20','2026-02-24 23:24:20'),(191,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:24:36','2026-02-24 23:24:36'),(192,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:24:41','2026-02-24 23:24:41'),(193,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:24:48','2026-02-24 23:24:48'),(194,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:24:56','2026-02-24 23:24:56'),(195,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-24 23:25:04','2026-02-24 23:25:04'),(196,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-25 03:47:17','2026-02-25 03:47:17'),(197,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-25 04:40:47','2026-02-25 04:40:47'),(198,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-25 04:40:59','2026-02-25 04:40:59'),(199,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-25 04:42:10','2026-02-25 04:42:10'),(200,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-25 04:43:41','2026-02-25 04:43:41'),(201,'Período de Desarrollo 2025','2025-01-01','2025-12-31',1,'2026-02-25 04:45:27','2026-02-25 04:45:27');
/*!40000 ALTER TABLE `periodos_propuestas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plantillas_documentos`
--

DROP TABLE IF EXISTS `plantillas_documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plantillas_documentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tipo_documento` enum('propuesta','informe_avance','informe_final','presentacion','poster','acta','otro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_ruta` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_tipo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '.docx, .pdf, .pptx, etc.',
  `archivo_tamano_kb` int DEFAULT NULL,
  `carrera_id` int DEFAULT NULL COMMENT 'Si es NULL, aplica para todas las carreras',
  `departamento_id` int DEFAULT NULL COMMENT 'Si es NULL, aplica para todos los departamentos',
  `facultad_id` int DEFAULT NULL COMMENT 'Si es NULL, aplica para todas las facultades',
  `version_plantilla` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '1.0',
  `formato_requerido` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'APA, IEEE, Vancouver, etc.',
  `instrucciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Instrucciones de uso de la plantilla',
  `ejemplo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL a ejemplo de uso',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plantillas_documentos`
--

LOCK TABLES `plantillas_documentos` WRITE;
/*!40000 ALTER TABLE `plantillas_documentos` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=411 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profesores_departamentos`
--

LOCK TABLES `profesores_departamentos` WRITE;
/*!40000 ALTER TABLE `profesores_departamentos` DISABLE KEYS */;
INSERT INTO `profesores_departamentos` VALUES (1,'22222222-2',1,1,'2025-12-28',NULL,1,'2025-12-28 22:23:45','2025-12-28 22:46:31'),(3,'33333333-3',1,1,'2023-01-01',NULL,1,'2025-12-28 22:32:40','2025-12-28 22:32:40'),(354,'13456789-8',1,1,'2015-03-01',NULL,1,'2026-02-24 19:54:10','2026-02-24 19:54:10'),(355,'12345678-9',1,1,'2020-03-01',NULL,1,'2026-02-24 19:54:10','2026-02-24 19:54:10');
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
  `titulo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_id` int NOT NULL DEFAULT '1',
  `fecha_envio` date NOT NULL,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `fecha_aprobacion` date DEFAULT NULL,
  `proyecto_id` int DEFAULT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `nombre_archivo_original` varchar(255) DEFAULT NULL,
  `modalidad` enum('desarrollo_software','investigacion','practica') NOT NULL,
  `numero_estudiantes` int NOT NULL DEFAULT '1',
  `complejidad_estimada` enum('baja','media','alta') NOT NULL DEFAULT 'media',
  `justificacion_complejidad` text,
  `duracion_estimada_semestres` int NOT NULL DEFAULT '1',
  `area_tematica` varchar(100) NOT NULL,
  `objetivos_generales` text NOT NULL,
  `objetivos_especificos` text NOT NULL,
  `metodologia_propuesta` text NOT NULL,
  `recursos_necesarios` text,
  `bibliografia` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_propuestas_estudiante` (`estudiante_rut`),
  KEY `idx_propuestas_estado` (`estado_id`),
  KEY `idx_propuestas_fecha_envio` (`fecha_envio`),
  CONSTRAINT `propuestas_ibfk_1` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `propuestas_ibfk_2` FOREIGN KEY (`estado_id`) REFERENCES `estados_propuestas` (`id`),
  CONSTRAINT `propuestas_chk_1` CHECK ((`numero_estudiantes` in (1,2,3))),
  CONSTRAINT `propuestas_chk_2` CHECK ((`duracion_estimada_semestres` between 1 and 2))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propuestas`
--

LOCK TABLES `propuestas` WRITE;
/*!40000 ALTER TABLE `propuestas` DISABLE KEYS */;
INSERT INTO `propuestas` VALUES (2,'Sistema Web de Gesti├│n de Inventario para PyMES','Sistema web que permite a peque├▒as y medianas empresas gestionar su inventario de forma eficiente, con control de stock, alertas de reabastecimiento y reportes en tiempo real.','11111111-1',4,'2025-12-28','2025-12-29 02:57:59','2025-12-28',1,'1766976463543-378482246.pdf','OK_Montoya_GutiÃ©rrez,_Pablo_Israel_Informe Final (1).pdf','desarrollo_software',2,'media',NULL,1,'Sistemas de Informaci├│n','Desarrollar un sistema web de gesti├│n de inventario accesible y eficiente para PyMES chilenas.','1. Implementar m├│dulo de control de stock con historial de movimientos.\n2. Crear sistema de alertas autom├íticas de reabastecimiento.\n3. Dise├▒ar panel de reportes gerenciales en tiempo real.','Metodolog├¡a ├ígil SCRUM con sprints de 2 semanas y reuniones de seguimiento semanales.','Servidor de desarrollo, base de datos MySQL, acceso a empresa piloto PyME.',NULL,'2025-12-28 22:44:10','2026-02-24 19:53:16'),(3,'Plataforma de E-Learning para Educaci├│n Rural','Desarrollo de una plataforma educativa en l├¡nea adaptada para zonas rurales con conectividad limitada, que permita a estudiantes de educaci├│n b├ísica y media acceder a contenidos de calidad con soporte offline.','16789012-4',4,'2025-02-15',NULL,'2025-03-01',NULL,NULL,NULL,'desarrollo_software',3,'alta','Alta complejidad por la necesidad de soporte offline robusto, sincronizaci├│n inteligente y adaptaci├│n a m├║ltiples dispositivos en entornos con conectividad limitada o intermitente.',2,'Tecnolog├¡as de la Informaci├│n para la Educaci├│n','Desarrollar una plataforma e-learning funcional para zonas rurales con soporte offline y adaptaci├│n a dispositivos de bajo rendimiento.','1. Implementar sistema de cach├® y descarga offline de contenidos.\n2. Crear motor de sincronizaci├│n incremental para entornos de baja conectividad.\n3. Dise├▒ar interfaz adaptativa para dispositivos de bajo rendimiento.\n4. Integrar sistema de evaluaciones y seguimiento del aprendizaje.','Desarrollo iterativo con entregas mensuales y pruebas de usabilidad con usuarios reales en zonas rurales de la Regi├│n del Biob├¡o.','Servidor de desarrollo, dispositivos m├│viles de bajo rendimiento para pruebas, acceso a escuelas rurales piloto en la Regi├│n del Biob├¡o.',NULL,'2026-02-24 19:54:10','2026-02-24 19:54:10');
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
  `titulo` varchar(255) NOT NULL,
  `descripcion` text NOT NULL,
  `propuesta_id` int NOT NULL,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_id` int NOT NULL DEFAULT '1',
  `fecha_inicio` date NOT NULL,
  `fecha_entrega_estimada` date DEFAULT NULL,
  `fecha_entrega_real` date DEFAULT NULL,
  `fecha_defensa` date DEFAULT NULL,
  `objetivo_general` text,
  `objetivos_especificos` text,
  `metodologia` text,
  `recursos_requeridos` text,
  `bibliografia` text,
  `porcentaje_avance` decimal(5,2) DEFAULT '0.00',
  `estado_detallado` enum('inicializacion','planificacion','desarrollo_fase1','desarrollo_fase2','testing','documentacion','revision_final','preparacion_defensa','defendido','cerrado') DEFAULT 'inicializacion',
  `prioridad` enum('baja','media','alta','critica') DEFAULT 'media',
  `riesgo_nivel` enum('bajo','medio','alto') DEFAULT 'medio',
  `documento_proyecto` varchar(255) DEFAULT NULL,
  `documento_final` varchar(255) DEFAULT NULL,
  `presentacion` varchar(255) DEFAULT NULL,
  `codigo_fuente` varchar(255) DEFAULT NULL,
  `observaciones_profesor` text,
  `observaciones_estudiante` text,
  `ultimo_avance_fecha` date DEFAULT NULL,
  `proximo_hito_fecha` date DEFAULT NULL,
  `tiempo_dedicado_horas` int DEFAULT '0',
  `ultima_actividad_fecha` date DEFAULT NULL COMMENT 'Última fecha de actividad real (avance, reunión, entrega)',
  `umbral_dias_riesgo` int DEFAULT '30' COMMENT 'Días sin actividad para marcar como en_riesgo',
  `umbral_dias_abandono` int DEFAULT '60' COMMENT 'Días sin actividad para considerar abandono',
  `alerta_inactividad_enviada` tinyint(1) DEFAULT '0' COMMENT 'Si ya se envió alerta de inactividad',
  `fecha_alerta_inactividad` timestamp NULL DEFAULT NULL COMMENT 'Fecha en que se envió la última alerta',
  `modalidad` enum('desarrollo_software','investigacion','practica') NOT NULL,
  `complejidad` enum('baja','media','alta') NOT NULL,
  `duracion_semestres` int NOT NULL DEFAULT '1',
  `version_actual` varchar(10) DEFAULT '1.0',
  `ultima_actividad` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `propuesta_id` (`propuesta_id`),
  KEY `idx_proyectos_estudiante` (`estudiante_rut`),
  KEY `idx_proyectos_estado` (`estado_id`),
  CONSTRAINT `proyectos_ibfk_1` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`),
  CONSTRAINT `proyectos_ibfk_2` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `proyectos_ibfk_3` FOREIGN KEY (`estado_id`) REFERENCES `estados_proyectos` (`id`),
  CONSTRAINT `proyectos_chk_1` CHECK (((`porcentaje_avance` >= 0) and (`porcentaje_avance` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proyectos`
--

LOCK TABLES `proyectos` WRITE;
/*!40000 ALTER TABLE `proyectos` DISABLE KEYS */;
INSERT INTO `proyectos` VALUES (1,'Sistema Web de Gesti├│n de Inventario para PyMES','Sistema web que permite a peque├▒as y medianas empresas gestionar su inventario de forma eficiente, con control de stock, alertas de reabastecimiento y reportes en tiempo real.',2,'11111111-1',2,'2025-03-01','2025-08-31',NULL,NULL,'Desarrollar un sistema web de gesti├│n de inventario accesible y eficiente para PyMES chilenas.',NULL,'Metodolog├¡a ├ígil SCRUM con sprints de 2 semanas.',NULL,NULL,42.00,'desarrollo_fase1','media','bajo',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,130,'2025-07-15',30,60,0,NULL,'desarrollo_software','media',1,'1.0','2026-02-24 19:54:10',1,'2025-12-29 02:57:59','2026-02-24 19:54:10'),(2,'Plataforma de E-Learning para Educaci├│n Rural','Plataforma educativa en l├¡nea con soporte offline para zonas rurales con conectividad limitada.',3,'16789012-4',2,'2025-03-15','2025-12-15',NULL,NULL,'Desarrollar una plataforma e-learning funcional para zonas rurales con soporte offline.','1. Sistema de cach├® offline.\n2. Motor de sincronizaci├│n incremental.\n3. UI adaptativa.\n4. Sistema de evaluaciones.','Desarrollo iterativo con sprints de 3 semanas y pruebas en terreno.',NULL,NULL,22.00,'planificacion','alta','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,85,'2025-07-10',30,60,0,NULL,'desarrollo_software','alta',2,'1.0','2026-02-24 19:54:10',1,'2026-02-24 19:54:10','2026-02-24 19:54:10');
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
  `estado_final` enum('aprobado','aprobado_con_distincion','aprobado_con_observaciones','reprobado','abandonado','anulado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `evaluacion_profesor_guia` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Evaluación final del profesor guía',
  `evaluacion_profesor_informante` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Evaluación del profesor informante',
  `evaluacion_comision` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Evaluación de la comisión',
  `observaciones_finales` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `recomendaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `areas_destacadas` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `documento_final` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta al documento final aprobado',
  `acta_aprobacion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta al acta de aprobación',
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
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `lugar` varchar(100) DEFAULT NULL,
  `tipo` enum('revision_avance','orientacion','defensa','otra') DEFAULT 'otra',
  `estado` enum('programada','realizada','cancelada') DEFAULT 'programada',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `proyecto_id` (`proyecto_id`),
  CONSTRAINT `reuniones_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `tipo_reunion` enum('seguimiento','revision_avance','orientacion','defensa_parcial','otra') DEFAULT 'seguimiento',
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `lugar` varchar(100) DEFAULT NULL,
  `modalidad` enum('presencial','virtual','hibrida') DEFAULT 'presencial',
  `link_reunion` varchar(500) DEFAULT NULL,
  `estado` enum('programada','realizada','cancelada') DEFAULT 'programada',
  `motivo_cancelacion` text,
  `acta_reunion` text,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'estudiante','Estudiante que desarrolla el proyecto de t�tulo','2025-12-28 22:22:06','2025-12-28 22:22:06'),(2,'profesor','Profesor que gu�a o revisa proyectos de t�tulo','2025-12-28 22:22:06','2025-12-28 22:22:06'),(3,'admin','Administrador del sistema','2025-12-28 22:22:06','2025-12-28 22:22:06'),(4,'superadmin','Administrador con permisos totales del sistema','2025-12-28 22:22:06','2025-12-28 22:22:06');
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
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=862 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_profesores`
--

LOCK TABLES `roles_profesores` WRITE;
/*!40000 ALTER TABLE `roles_profesores` DISABLE KEYS */;
INSERT INTO `roles_profesores` VALUES (1,'Profesor Revisor','Profesor que evalúa la propuesta inicial y determina su viabilidad','2025-12-28 22:22:06'),(2,'Profesor Guía','Profesor principal que guía el desarrollo completo del proyecto','2025-12-28 22:22:06'),(3,'Profesor Co-Guía','Profesor co-guía que apoya en áreas específicas del proyecto','2025-12-28 22:22:06'),(4,'Profesor Informante','Profesor que evalúa el informe final y otorga calificación','2025-12-28 22:22:06'),(5,'Profesor de Sala','Profesor de sala para la defensa oral del proyecto','2025-12-28 22:22:06');
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
  `motivo` text NOT NULL,
  `justificacion_detallada` text NOT NULL,
  `documento_respaldo` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','en_revision','aprobada','rechazada') DEFAULT 'pendiente',
  `aprobado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `fecha_resolucion` timestamp NULL DEFAULT NULL,
  `comentarios_revision` text,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `tipo_reunion` enum('seguimiento','revision_avance','orientacion','defensa_parcial','otra') DEFAULT 'seguimiento',
  `descripcion` text,
  `estado` enum('pendiente','aceptada_profesor','aceptada_estudiante','confirmada','rechazada','cancelada') DEFAULT 'pendiente',
  `creado_por` enum('profesor','estudiante','sistema') DEFAULT 'sistema',
  `fecha_respuesta_profesor` timestamp NULL DEFAULT NULL,
  `fecha_respuesta_estudiante` timestamp NULL DEFAULT NULL,
  `comentarios_profesor` text,
  `comentarios_estudiante` text,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `token_hash` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `revocado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expira_en` timestamp NOT NULL,
  `usuario_rut` varchar(12) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
-- Table structure for table `tokens_colaboradores`
--

DROP TABLE IF EXISTS `tokens_colaboradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokens_colaboradores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `colaborador_id` int NOT NULL COMMENT 'ID del colaborador',
  `token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Token único de acceso',
  `tipo` enum('activacion','reset_password','acceso_temporal') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tipo de token',
  `proyecto_id` int DEFAULT NULL COMMENT 'Proyecto específico al que da acceso (si aplica)',
  `usado` tinyint(1) DEFAULT '0' COMMENT 'Si el token ya fue usado',
  `fecha_expiracion` datetime NOT NULL COMMENT 'Fecha de expiración del token',
  `fecha_uso` datetime DEFAULT NULL COMMENT 'Fecha en que se usó el token',
  `ip_uso` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP desde donde se usó',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_token` (`token`),
  KEY `proyecto_id` (`proyecto_id`),
  KEY `idx_colaborador` (`colaborador_id`),
  KEY `idx_token_activo` (`token`,`usado`,`fecha_expiracion`),
  CONSTRAINT `tokens_colaboradores_ibfk_1` FOREIGN KEY (`colaborador_id`) REFERENCES `colaboradores_externos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tokens_colaboradores_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokens_colaboradores`
--

LOCK TABLES `tokens_colaboradores` WRITE;
/*!40000 ALTER TABLE `tokens_colaboradores` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokens_colaboradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` int NOT NULL,
  `confirmado` tinyint(1) DEFAULT '0',
  `debe_cambiar_password` tinyint(1) DEFAULT '0' COMMENT 'Indica si el usuario debe cambiar su contraseña en el próximo login (contraseña temporal)',
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
INSERT INTO `usuarios` VALUES ('11111111-1','Usuario Estudiante','estudiante@ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',1,1,0,'2025-12-28 22:22:06','2026-02-22 18:17:29'),('12345678-9','Dra. Carmen Valdivia Torres','carmen.valdivia@ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',2,1,0,'2026-02-24 19:53:16','2026-02-24 19:53:16'),('13456789-8','Dr. Roberto S├ínchez Mu├▒oz','roberto.sanchez@ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',2,1,0,'2026-02-24 19:53:16','2026-02-24 19:53:16'),('15234567-3','Ana Mart├¡nez L├│pez','ana.martinez@alumnos.ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',1,1,0,'2026-02-24 19:53:16','2026-02-24 19:53:16'),('16789012-4','Carlos Fuentes Soto','carlos.fuentes@alumnos.ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',1,1,0,'2026-02-24 19:53:16','2026-02-24 19:53:16'),('17890123-5','Mar├¡a Gonz├ílez P├®rez','maria.gonzalez@alumnos.ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',1,1,0,'2026-02-24 19:53:16','2026-02-24 19:53:16'),('18901234-6','Pedro Rojas Vega','pedro.rojas@alumnos.ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',1,1,0,'2026-02-24 19:53:16','2026-02-24 19:53:16'),('22222222-2','Usuario Profesor','profesor@ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',2,1,0,'2025-12-28 22:22:06','2026-02-22 18:17:29'),('33333333-3','Usuario Admin','admin@ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',3,1,0,'2025-12-28 22:22:06','2026-02-22 18:17:29'),('44444444-4','Usuario SuperAdmin','superadmin@ubiobio.cl','$2y$10$AwscUykc7vcJO4YPWt6HJOyT4WDhuLgHbIEHptXikb4TYHEsdvooe',4,1,0,'2025-12-28 22:22:06','2026-02-22 18:17:29');
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
  `numero_version` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'v1.0, v1.1, v2.0, etc.',
  `tipo_version` enum('estudiante','profesor_revision','profesor_comentarios','version_final') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'estudiante',
  `archivo_nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_ruta` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo_tamano_kb` int DEFAULT NULL,
  `archivo_tipo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'application/pdf, application/docx, etc.',
  `descripcion_cambios` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Qué se modificó en esta versión',
  `cambios_principales` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Lista de cambios principales',
  `autor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor_rol` enum('estudiante','profesor_guia','profesor_informante','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentarios_generales` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Comentarios generales sobre esta versión',
  `estado` enum('borrador','enviado','en_revision','revisado','aprobado','rechazado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'enviado',
  `requiere_correccion` tinyint(1) DEFAULT '0',
  `es_version_final` tinyint(1) DEFAULT '0' COMMENT 'Marca si es la versión final aprobada',
  `etiquetas` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tags separados por coma',
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
-- Table structure for table `versiones_propuestas`
--

DROP TABLE IF EXISTS `versiones_propuestas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `versiones_propuestas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `propuesta_id` int NOT NULL,
  `version` int NOT NULL DEFAULT '1',
  `titulo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `modalidad` enum('desarrollo_software','investigacion','practica') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_estudiantes` int NOT NULL DEFAULT '1',
  `complejidad_estimada` enum('baja','media','alta') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'media',
  `justificacion_complejidad` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `duracion_estimada_semestres` int NOT NULL DEFAULT '1',
  `area_tematica` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `objetivos_generales` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `objetivos_especificos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `metodologia_propuesta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recursos_necesarios` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `bibliografia` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `archivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_archivo_original` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo_cambio` enum('creacion','correccion_solicitada','mejora_voluntaria','revision_profesor') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'correccion_solicitada',
  `comentario_cambio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'Comentario del estudiante sobre qué cambió',
  `creado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_propuesta_version` (`propuesta_id`,`version`),
  KEY `creado_por` (`creado_por`),
  KEY `idx_propuesta_version` (`propuesta_id`,`version`),
  KEY `idx_propuesta_fecha` (`propuesta_id`,`created_at`),
  CONSTRAINT `versiones_propuestas_ibfk_1` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `versiones_propuestas_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `versiones_propuestas`
--

LOCK TABLES `versiones_propuestas` WRITE;
/*!40000 ALTER TABLE `versiones_propuestas` DISABLE KEYS */;
/*!40000 ALTER TABLE `versiones_propuestas` ENABLE KEYS */;
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
/*!50001 VIEW `vista_informante_pendientes` AS select `h`.`id` AS `hito_id`,`h`.`proyecto_id` AS `proyecto_id`,`p`.`titulo` AS `proyecto_titulo`,`p`.`estudiante_rut` AS `estudiante_rut`,`u`.`nombre` AS `estudiante_nombre`,`h`.`fecha_entrega_estudiante` AS `fecha_entrega_estudiante`,`h`.`fecha_limite_informante` AS `fecha_limite_informante`,(to_days(`h`.`fecha_limite_informante`) - to_days(curdate())) AS `dias_restantes`,(case when (`h`.`fecha_limite_informante` < curdate()) then 'vencido' when ((to_days(`h`.`fecha_limite_informante`) - to_days(curdate())) <= 3) then 'urgente' when ((to_days(`h`.`fecha_limite_informante`) - to_days(curdate())) <= 7) then 'proximo' else 'en_plazo' end) AS `estado_plazo`,`h`.`informante_notificado` AS `informante_notificado`,`h`.`fecha_notificacion_informante` AS `fecha_notificacion_informante`,`ap`.`profesor_rut` AS `informante_rut`,`ui`.`nombre` AS `informante_nombre`,`ui`.`email` AS `informante_email`,`h`.`comentarios_profesor` AS `comentarios_profesor`,`h`.`estado` AS `estado_hito` from ((((`hitos_proyecto` `h` join `proyectos` `p` on((`h`.`proyecto_id` = `p`.`id`))) join `usuarios` `u` on((`p`.`estudiante_rut` = `u`.`rut`))) left join `asignaciones_proyectos` `ap` on(((`ap`.`proyecto_id` = `p`.`id`) and (`ap`.`rol_profesor_id` = (select `roles_profesores`.`id` from `roles_profesores` where (`roles_profesores`.`nombre` = 'Profesor de Asignatura'))) and (`ap`.`activo` = true)))) left join `usuarios` `ui` on((`ap`.`profesor_rut` = `ui`.`rut`))) where ((`h`.`tipo_hito` = 'entrega_final') and (`h`.`fecha_entrega_estudiante` is not null) and (`h`.`estado` in ('completado','en_progreso')) and ((`h`.`fecha_completado` is null) or (`h`.`comentarios_profesor` is null))) order by `h`.`fecha_limite_informante` */;
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

-- Dump completed on 2026-03-02  2:00:01
