-- MySQL dump 10.13  Distrib 8.0.45, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: actitubb
-- ------------------------------------------------------
-- Server version	8.0.45-0ubuntu0.22.04.1

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividad_sistema`
--

LOCK TABLES `actividad_sistema` WRITE;
/*!40000 ALTER TABLE `actividad_sistema` DISABLE KEYS */;
INSERT INTO `actividad_sistema` VALUES (1,'login','Inicio de sesión exitoso','20111111-1','{\"ip\": \"192.168.1.1\"}','2025-11-15 08:30:00'),(2,'propuesta_creada','Propuesta \"Sistema de Gestión\" creada','20111111-1','{\"propuesta_id\": 1}','2025-06-15 14:20:00'),(3,'propuesta_aprobada','Propuesta 1 aprobada por profesor','10111111-1','{\"propuesta_id\": 1}','2025-06-25 10:00:00'),(4,'proyecto_creado','Proyecto 1 creado desde propuesta aprobada','33333333-3','{\"proyecto_id\": 1}','2025-06-30 11:00:00'),(5,'avance_enviado','Avance 1 enviado al proyecto 1','20111111-1','{\"avance_id\": 1}','2025-08-15 16:00:00'),(6,'avance_revisado','Avance 1 revisado y aprobado','10111111-1','{\"avance_id\": 1}','2025-08-20 10:30:00'),(7,'login','Inicio de sesión exitoso','20333333-3','{\"ip\": \"192.168.1.5\"}','2025-11-20 09:00:00'),(8,'propuesta_creada','Propuesta \"App Cultivos\" creada','20333333-3','{\"propuesta_id\": 2}','2025-06-20 15:00:00'),(9,'reunion_agendada','Reunión agendada para proyecto 4','10444444-4','{\"reunion_id\": 5}','2026-02-15 14:00:00'),(10,'login','Inicio de sesión exitoso','33333333-3','{\"ip\": \"192.168.0.1\"}','2026-03-01 08:00:00');
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
  `tipo_archivo` enum('propuesta_inicial','revision_profesor','correccion_estudiante') COLLATE utf8mb4_unicode_ci NOT NULL,
  `archivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_archivo_original` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subido_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` int NOT NULL DEFAULT '1',
  `comentario` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subido_por` (`subido_por`),
  KEY `idx_propuesta` (`propuesta_id`),
  KEY `idx_version` (`propuesta_id`,`version`),
  KEY `idx_tipo` (`tipo_archivo`),
  CONSTRAINT `archivos_propuesta_ibfk_1` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `archivos_propuesta_ibfk_2` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archivos_propuesta`
--

LOCK TABLES `archivos_propuesta` WRITE;
/*!40000 ALTER TABLE `archivos_propuesta` DISABLE KEYS */;
INSERT INTO `archivos_propuesta` VALUES (1,21,'propuesta_inicial','1773158933265-90303636.pdf','uncharter.pdf','26100000-1',1,'Versión inicial de la propuesta','2026-03-10 16:08:53'),(2,21,'revision_profesor','1773159227817-185871666.pdf','lista-de-conectores.pdf','12300000-3',2,'Está como el loly','2026-03-10 16:13:47'),(3,21,'correccion_estudiante','1773159261297-893095811.pdf','uncharter.pdf','26100000-1',3,'Corrección del estudiante','2026-03-10 16:14:21'),(4,22,'propuesta_inicial','1773186531891-244504689.pdf','Fundo el Peumo - BÃ­o BÃ­o02Marzo.pdf','20695510-4',1,'Versión inicial de la propuesta','2026-03-10 23:48:51'),(5,22,'revision_profesor','1773187183223-719286925.pdf','CONTRATO_OBRA 2026_,INQUUS-DANIEL AGUAYO.pdf','12300000-3',2,'wewewewewewewewewewewewewewewewewe','2026-03-10 23:59:43'),(6,22,'correccion_estudiante','1773187419271-738601852.pdf','DDACs Paper - DRAFT 1.pdf','20695510-4',3,'Corrección del estudiante','2026-03-11 00:03:39'),(7,23,'propuesta_inicial','1774229490299-345130861.pdf','ExportedClientDocument-4.pdf','11111111-1',1,'Versión inicial de la propuesta','2026-03-23 01:31:30'),(8,23,'correccion_estudiante','1774229686648-426280308.pdf','corporativo-2.pptx.pdf','11111111-1',2,'Corrección del estudiante','2026-03-23 01:34:46');
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_propuestas`
--

LOCK TABLES `asignaciones_propuestas` WRITE;
/*!40000 ALTER TABLE `asignaciones_propuestas` DISABLE KEYS */;
INSERT INTO `asignaciones_propuestas` VALUES (1,1,'10111111-1','revisor_principal','2025-06-20 10:00:00',NULL,'revisado','aprobar','Propuesta sólida con objetivos claros y metodología bien definida. Aprobada.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(2,2,'10222222-2','revisor_principal','2025-06-25 09:30:00',NULL,'revisado','aprobar','Excelente propuesta con innovación tecnológica significativa. Aprobada.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(3,3,'10333333-3','revisor_principal','2025-07-07 11:00:00',NULL,'revisado','aprobar','Propuesta bien fundamentada. Aprobada con observaciones menores.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,4,'10444444-4','revisor_principal','2025-07-15 10:00:00',NULL,'revisado','aprobar','Alcance adecuado para el plazo establecido. Aprobada.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(5,5,'10555555-5','revisor_principal','2025-07-21 14:00:00',NULL,'revisado','aprobar','Propuesta innovadora con impacto social positivo. Aprobada.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,6,'10666666-6','revisor_principal','2025-08-06 09:00:00',NULL,'revisado','aprobar','Gran impacto social y técnica robusta. Aprobada.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(7,7,'10777777-7','revisor_principal','2025-08-15 10:30:00',NULL,'revisado','aprobar','Desafío técnico bien planteado. Aprobada.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(8,8,'10888888-8','revisor_principal','2025-08-25 11:00:00',NULL,'revisado','aprobar','Solución práctica con mercado definido. Aprobada.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(9,9,'10999999-9','revisor_principal','2026-02-10 09:00:00',NULL,'en_revision',NULL,NULL,1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(10,10,'11000000-0','revisor_principal','2026-02-14 10:00:00',NULL,'en_revision',NULL,NULL,1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(11,11,'11100000-K','revisor_principal','2026-02-19 11:00:00',NULL,'en_revision',NULL,NULL,1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(12,12,'11200000-1','revisor_principal','2026-02-22 09:30:00',NULL,'en_revision',NULL,NULL,1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(13,16,'11300000-2','revisor_principal','2026-02-10 14:00:00',NULL,'revisado','solicitar_correcciones','Falta justificación técnica del stack elegido. Requiere correcciones.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(14,17,'11400000-3','revisor_principal','2026-02-12 10:00:00',NULL,'revisado','solicitar_correcciones','El alcance es muy amplio para un semestre. Reducir scope.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(15,18,'11500000-4','revisor_principal','2026-01-15 09:00:00',NULL,'revisado','rechazar','No cumple con los requisitos mínimos de complejidad técnica.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(16,19,'11600000-5','revisor_principal','2026-01-20 10:00:00',NULL,'revisado','rechazar','No constituye un proyecto de titulación válido.',1,'33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(17,12,'10222222-2','revisor_principal','2026-03-04 13:09:32',NULL,'pendiente',NULL,NULL,1,'33333333-3','2026-03-04 13:09:32','2026-03-04 13:09:32'),(18,20,'10111111-1','revisor_principal','2026-03-04 13:10:22',NULL,'pendiente',NULL,NULL,1,'33333333-3','2026-03-04 13:10:22','2026-03-04 13:10:22'),(19,20,'10222222-2','revisor_principal','2026-03-09 18:20:16',NULL,'pendiente',NULL,NULL,1,'33333333-3','2026-03-09 18:20:16','2026-03-09 18:20:16'),(20,21,'12300000-3','revisor_principal','2026-03-10 16:10:18',NULL,'pendiente',NULL,NULL,1,'33333333-3','2026-03-10 16:10:18','2026-03-10 16:10:18'),(21,22,'12300000-3','revisor_principal','2026-03-10 23:49:30',NULL,'pendiente',NULL,NULL,1,'33333333-3','2026-03-10 23:49:30','2026-03-10 23:49:30'),(23,23,'10222222-2','revisor_principal','2026-03-23 01:31:54',NULL,'pendiente',NULL,NULL,1,'33333333-3','2026-03-23 01:31:54','2026-03-23 01:31:54');
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
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_proyectos`
--

LOCK TABLES `asignaciones_proyectos` WRITE;
/*!40000 ALTER TABLE `asignaciones_proyectos` DISABLE KEYS */;
INSERT INTO `asignaciones_proyectos` VALUES (1,1,'10111111-1',2,'2025-06-28 10:00:00','2026-03-09 18:13:37',0,'Profesor Guía asignado por experiencia en ingeniería de software','33333333-3','2026-03-03 18:36:30','2026-03-09 18:13:37'),(2,1,'10222222-2',4,'2025-06-28 10:00:00',NULL,1,'Profesor Informante asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(3,1,'10333333-3',1,'2025-06-28 10:00:00',NULL,1,'Profesor Revisor asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,2,'10222222-2',2,'2025-07-12 10:00:00','2026-03-09 18:40:51',0,'Profesor Guía con experiencia en IoT','33333333-3','2026-03-03 18:36:30','2026-03-09 18:40:51'),(5,2,'10444444-4',4,'2025-07-12 10:00:00',NULL,1,'Profesor Informante asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,2,'10555555-5',1,'2025-07-12 10:00:00',NULL,1,'Profesor Revisor asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(7,3,'10333333-3',2,'2025-07-29 10:00:00',NULL,1,'Profesor Guía con experiencia en ML','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(8,3,'10666666-6',4,'2025-07-29 10:00:00',NULL,1,'Profesor Informante asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(9,3,'10777777-7',1,'2025-07-29 10:00:00',NULL,1,'Profesor Revisor asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(10,4,'10444444-4',2,'2025-08-07 10:00:00',NULL,1,'Profesor Guía con experiencia en sistemas empresariales','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(11,4,'10888888-8',4,'2025-08-07 10:00:00',NULL,1,'Profesor Informante asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(12,4,'10999999-9',1,'2025-08-07 10:00:00',NULL,1,'Profesor Revisor asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(13,5,'10555555-5',2,'2025-08-12 10:00:00',NULL,1,'Profesor Guía con experiencia en IA','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(14,5,'11000000-0',4,'2025-08-12 10:00:00',NULL,1,'Profesor Informante asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(15,5,'11100000-K',1,'2025-08-12 10:00:00',NULL,1,'Profesor Revisor asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(16,6,'10666666-6',2,'2025-08-29 10:00:00','2026-03-09 18:08:28',0,'Profesor Guía con experiencia en salud digital','33333333-3','2026-03-03 18:36:30','2026-03-09 18:08:28'),(17,6,'11200000-1',4,'2025-08-29 10:00:00',NULL,1,'Profesor Informante asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(18,6,'11300000-2',1,'2025-08-29 10:00:00',NULL,1,'Profesor Revisor asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(19,7,'10777777-7',2,'2025-09-08 10:00:00',NULL,1,'Profesor Guía con experiencia en seguridad','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(20,7,'11400000-3',4,'2025-09-08 10:00:00',NULL,1,'Profesor Informante asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(21,7,'11500000-4',1,'2025-09-08 10:00:00',NULL,1,'Profesor Revisor asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(22,8,'10888888-8',2,'2025-09-18 10:00:00','2026-03-05 14:20:34',0,'Profesor Guía con experiencia en apps móviles','33333333-3','2026-03-03 18:36:30','2026-03-05 14:20:34'),(23,8,'11600000-5',4,'2025-09-18 10:00:00',NULL,1,'Profesor Informante asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(24,8,'11700000-6',1,'2025-09-18 10:00:00',NULL,1,'Profesor Revisor asignado','33333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(25,8,'10222222-2',2,'2026-03-05 14:20:34',NULL,1,NULL,'33333333-3','2026-03-05 14:20:34','2026-03-05 14:20:34'),(26,6,'11100000-K',2,'2026-03-09 18:08:28',NULL,1,NULL,'33333333-3','2026-03-09 18:08:28','2026-03-09 18:08:28'),(27,1,'11100000-K',2,'2026-03-09 18:13:37',NULL,1,NULL,'33333333-3','2026-03-09 18:13:37','2026-03-09 18:13:37'),(28,2,'11000000-0',2,'2026-03-09 18:40:51',NULL,1,NULL,'33333333-3','2026-03-09 18:40:51','2026-03-09 18:40:51'),(29,9,'12200000-2',2,'2026-03-10 16:15:14',NULL,1,NULL,'33333333-3','2026-03-10 16:15:14','2026-03-10 16:15:14'),(30,10,'12200000-2',2,'2026-03-11 00:04:01',NULL,1,NULL,'33333333-3','2026-03-11 00:04:01','2026-03-11 00:04:01'),(31,10,'10222222-2',4,'2026-03-11 00:06:11',NULL,1,NULL,'33333333-3','2026-03-11 00:06:11','2026-03-11 00:06:11'),(32,11,'12200000-2',2,'2026-03-23 01:35:25','2026-03-23 01:37:02',0,NULL,'33333333-3','2026-03-23 01:35:25','2026-03-23 01:37:02'),(33,11,'10111111-1',2,'2026-03-23 01:37:02',NULL,1,NULL,'33333333-3','2026-03-23 01:37:02','2026-03-23 01:37:02'),(34,11,'11100000-K',4,'2026-03-23 01:41:40',NULL,1,NULL,'33333333-3','2026-03-23 01:41:40','2026-03-23 01:41:40');
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avances`
--

LOCK TABLES `avances` WRITE;
/*!40000 ALTER TABLE `avances` DISABLE KEYS */;
INSERT INTO `avances` VALUES (1,1,'Avance 1 - Diseño de Base de Datos','Se completó el modelo entidad-relación y la creación de la base de datos con todas las tablas necesarias.',NULL,4,'Excelente trabajo en el diseño. El modelo está bien normalizado.','2025-08-15 00:00:00',NULL,'10111111-1','2026-03-03 18:36:30','2026-03-04 12:20:43'),(2,1,'Avance 2 - Backend API REST','Se implementaron los endpoints principales del backend con autenticación JWT.',NULL,4,'Buena implementación. Considerar agregar más validaciones de entrada.','2025-10-01 00:00:00',NULL,'10111111-1','2026-03-03 18:36:30','2026-03-04 12:20:43'),(3,1,'Avance 3 - Frontend React','Se desarrollaron los módulos principales del frontend con componentes reutilizables.',NULL,2,NULL,'2025-12-15 00:00:00',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,2,'Avance 1 - Arquitectura del Sistema','Definición de la arquitectura IoT y selección de sensores para el prototipo inicial.',NULL,4,'Buen análisis de alternativas tecnológicas.','2025-09-01 00:00:00',NULL,'10222222-2','2026-03-03 18:36:30','2026-03-04 12:20:43'),(5,2,'Avance 2 - Integración de Sensores','Implementación de la lectura de datos de temperatura, humedad y pH del suelo.',NULL,2,NULL,'2025-11-20 00:00:00',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,3,'Avance 1 - Estado del Arte','Revisión bibliográfica sobre sistemas adaptativos de aprendizaje y algoritmos de ML aplicados.',NULL,4,'Revisión exhaustiva. Incorporar fuentes más recientes (2022-2024).','2025-09-20 00:00:00',NULL,'10333333-3','2026-03-03 18:36:30','2026-03-04 12:20:43'),(7,4,'Avance 1 - Análisis de Requerimientos','Levantamiento de requerimientos con 3 PYMES de la región para validar el producto.',NULL,4,'Muy buen trabajo de campo. Los requerimientos están bien documentados.','2025-09-15 00:00:00',NULL,'10444444-4','2026-03-03 18:36:30','2026-03-04 12:20:43'),(8,4,'Avance 2 - Módulo QR y Escáner','Implementación del módulo de generación y lectura de códigos QR integrado al inventario.',NULL,4,'Funcionalidad correcta. Agregar soporte para múltiples formatos de código.','2025-11-01 00:00:00',NULL,'10444444-4','2026-03-03 18:36:30','2026-03-04 12:20:43'),(9,4,'Avance 3 - Sistema de Alertas','Implementación del sistema de notificaciones y alertas de stock mínimo.',NULL,4,'Excelente implementación. Listo para testing con usuarios reales.','2026-01-01 00:00:00',NULL,'10444444-4','2026-03-03 18:36:30','2026-03-04 12:20:43'),(10,5,'Avance 1 - Modelo NLP Base','Entrenamiento del modelo base de procesamiento de lenguaje natural con corpus municipal.',NULL,4,'Métricas de precisión aceptables. Continuar con fine-tuning.','2025-10-01 00:00:00',NULL,'10555555-5','2026-03-03 18:36:30','2026-03-04 12:20:43'),(11,5,'Avance 2 - Integración con Sistema Municipal','Conexión del chatbot con el sistema de trámites del municipio piloto.',NULL,2,NULL,'2025-12-10 00:00:00',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(12,6,'Avance 1 - Diseño de Arquitectura','Diseño de la arquitectura del sistema con foco en baja conectividad.',NULL,2,NULL,'2025-10-20 00:00:00',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(13,7,'Avance 1 - Investigación Tecnológica','Evaluación de bibliotecas de reconocimiento facial: OpenCV, DeepFace, FaceNet.',NULL,4,'Análisis comparativo muy completo. Buena elección de tecnología.','2025-10-25 00:00:00',NULL,'10777777-7','2026-03-03 18:36:30','2026-03-04 12:20:43'),(14,7,'Avance 2 - Prototipo Reconocimiento Facial','Prototipo funcional de reconocimiento facial con 95% de precisión en condiciones controladas.',NULL,2,NULL,'2026-01-01 00:00:00',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(15,8,'Avance 1 - Diseño UX/UI','Diseño de interfaces y flujos de usuario validados con 20 estudiantes de la universidad.',NULL,4,'Excelente trabajo de UX. Las pantallas son intuitivas y bien diseñadas.','2025-11-01 00:00:00',NULL,'10888888-8','2026-03-03 18:36:30','2026-03-04 12:20:43'),(16,8,'Avance 2 - Backend y Geolocalización','Implementación del backend y módulo de geolocalización con algoritmo de matching.',NULL,2,NULL,'2026-01-15 00:00:00',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43');
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
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo_profesional` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ej: Ingeniero Civil en Informática',
  `grado_academico` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ej: Licenciado en Ciencias de la Ingeniería',
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carreras`
--

LOCK TABLES `carreras` WRITE;
/*!40000 ALTER TABLE `carreras` DISABLE KEYS */;
INSERT INTO `carreras` VALUES (1,1,'Ingeniería Civil en Informática','ICINF','Ingeniero Civil en Informática','Licenciado en Ciencias de la Ingeniería',10,'33333333-3',NULL,'presencial',1,'2026-03-03 18:36:30','2026-03-10 13:50:10'),(2,1,'Ingeniería de Ejecución en Computación e Informática','IECI','Ingeniero de Ejecución en Computación e Informática',NULL,8,'33333333-3',NULL,'presencial',1,'2026-03-03 18:36:30','2026-03-03 20:32:48');
/*!40000 ALTER TABLE `carreras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `co_guias_estudiantes`
--

DROP TABLE IF EXISTS `co_guias_estudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `co_guias_estudiantes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `profesor_co_guia_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `asignado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_desasignacion` timestamp NULL DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_co_guia_estudiante` (`estudiante_rut`,`activo`),
  KEY `idx_co_guia_profesor` (`profesor_co_guia_rut`,`activo`),
  CONSTRAINT `co_guias_estudiantes_ibfk_1` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `co_guias_estudiantes_ibfk_2` FOREIGN KEY (`profesor_co_guia_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `co_guias_estudiantes_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `co_guias_estudiantes`
--

LOCK TABLES `co_guias_estudiantes` WRITE;
/*!40000 ALTER TABLE `co_guias_estudiantes` DISABLE KEYS */;
INSERT INTO `co_guias_estudiantes` VALUES (1,'20695510-4','12200000-2','33333333-3',0,'2026-03-11 19:49:58','2026-03-11 19:50:01',NULL,'2026-03-11 19:49:58','2026-03-11 19:50:01'),(2,'20695510-4','10222222-2','33333333-3',1,'2026-03-11 19:50:01',NULL,NULL,'2026-03-11 19:50:01','2026-03-11 19:50:01');
/*!40000 ALTER TABLE `co_guias_estudiantes` ENABLE KEYS */;
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
  `autor_rol` enum('estudiante','profesor_guia','profesor_asignatura','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentario` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_comentario` enum('general','sugerencia','error','aprobacion','rechazo') COLLATE utf8mb4_unicode_ci DEFAULT 'general',
  `prioridad` enum('baja','media','alta') COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `seccion_referencia` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Capítulo 3, Página 15, etc.',
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_alertas`
--

LOCK TABLES `configuracion_alertas` WRITE;
/*!40000 ALTER TABLE `configuracion_alertas` DISABLE KEYS */;
INSERT INTO `configuracion_alertas` VALUES (1,1,'10111111-1',5,2,10,1,1,1,1,1,1,'2026-03-03 18:36:31','2026-03-03 18:36:31'),(2,2,'10222222-2',5,2,10,1,1,1,1,1,1,'2026-03-03 18:36:31','2026-03-03 18:36:31'),(3,3,'10333333-3',7,1,14,1,1,1,1,1,1,'2026-03-03 18:36:31','2026-03-03 18:36:31'),(4,4,'10444444-4',3,1,7,1,1,1,1,1,1,'2026-03-03 18:36:31','2026-03-03 18:36:31'),(5,5,'10555555-5',5,2,10,1,1,1,1,1,1,'2026-03-03 18:36:31','2026-03-03 18:36:31'),(6,6,'10666666-6',7,2,14,1,1,1,1,1,1,'2026-03-03 18:36:31','2026-03-03 18:36:31'),(7,7,'10777777-7',5,1,10,1,1,1,1,1,1,'2026-03-03 18:36:31','2026-03-03 18:36:31'),(8,8,'10888888-8',5,2,7,1,1,1,1,1,1,'2026-03-03 18:36:31','2026-03-03 18:36:31');
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_matching`
--

LOCK TABLES `configuracion_matching` WRITE;
/*!40000 ALTER TABLE `configuracion_matching` DISABLE KEYS */;
INSERT INTO `configuracion_matching` VALUES (1,'duracion_reunion_defecto','60','Duración por defecto de las reuniones en minutos','entero','2026-03-03 17:28:57'),(2,'dias_anticipacion_minima','1','Días mínimos de anticipación para agendar reuniones','entero','2026-03-03 17:28:57'),(3,'dias_anticipacion_maxima','30','Días máximos de anticipación para agendar reuniones','entero','2026-03-03 17:28:57'),(4,'horario_inicio_jornada','08:00','Hora de inicio de la jornada laboral','texto','2026-03-03 17:28:57'),(5,'horario_fin_jornada','18:00','Hora de fin de la jornada laboral','texto','2026-03-03 17:28:57'),(6,'matching_automatico_activo','true','Si el matching automático está activo','booleano','2026-03-03 17:28:57'),(7,'tiempo_respuesta_horas','48','Tiempo máximo en horas para responder solicitudes','entero','2026-03-03 17:28:57'),(8,'permitir_reuniones_sabado','false','Permitir agendar reuniones los sábados','booleano','2026-03-03 17:28:57'),(9,'permitir_reuniones_domingo','false','Permitir agendar reuniones los domingos','booleano','2026-03-03 17:28:57'),(10,'dias_sin_actividad_alerta','30','Días sin actividad para enviar alerta de inactividad','entero','2026-03-03 17:28:57'),(11,'dias_sin_actividad_riesgo','45','Días sin actividad para marcar proyecto en riesgo','entero','2026-03-03 17:28:57'),(12,'dias_sin_actividad_abandono','60','Días sin actividad para considerar abandono potencial','entero','2026-03-03 17:28:57'),(13,'dias_habiles_informante','15','Días hábiles que tiene el profesor Informante para evaluar informe final','entero','2026-03-03 17:28:57'),(14,'notificar_informante_auto','true','Notificar automáticamente al informante cuando se entrega el informe final','booleano','2026-03-03 17:28:57');
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_sistema`
--

LOCK TABLES `configuracion_sistema` WRITE;
/*!40000 ALTER TABLE `configuracion_sistema` DISABLE KEYS */;
INSERT INTO `configuracion_sistema` VALUES (1,'dias_sin_actividad_alerta','30','entero','Días sin actividad en un proyecto antes de enviar alerta de inactividad','alertas',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(2,'UMBRAL_INACTIVIDAD_DIAS','30','entero','[Alias] Días sin actividad - Usado por panel de configuración','alertas',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(3,'DIAS_PREVIOS_ALERTA_FECHAS','2','entero','Días de anticipación para enviar alertas de fechas límite (48h y 24h)','alertas',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(4,'HORA_RECORDATORIO_REUNIONES','08:00','texto','Hora del día para enviar recordatorios de reuniones (formato HH:MM)','alertas',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(5,'MAX_PROYECTOS_POR_PROFESOR','5','entero','Número máximo de proyectos simultáneos que puede tener un profesor','validaciones',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(6,'MAX_ESTUDIANTES_POR_PROPUESTA','3','entero','Número máximo de estudiantes en una propuesta grupal','validaciones',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(7,'MIN_CARACTERES_PROPUESTA','200','entero','Mínimo de caracteres requeridos en la descripción de una propuesta','validaciones',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(8,'DURACION_MAXIMA_PROYECTO_SEMESTRES','2','entero','Duración máxima permitida de un proyecto de titulación en semestres','validaciones',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(9,'NOTIFICACIONES_EMAIL_ACTIVAS','true','booleano','Si se envían notificaciones por correo electrónico','notificaciones',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(10,'NOTIFICACIONES_PUSH_ACTIVAS','true','booleano','Si se envían notificaciones push en tiempo real vía WebSocket','notificaciones',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(11,'NOTIFICACIONES_NAVEGADOR_ACTIVAS','true','booleano','Si se muestran notificaciones del navegador (browser notifications)','notificaciones',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(12,'REQUIERE_APROBACION_JEFE_CARRERA','true','booleano','Si las propuestas requieren aprobación del jefe de carrera antes de asignar profesores','flujo',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(13,'PERMITE_AUTOASIGNACION_PROFESORES','false','booleano','Si los profesores pueden autoasignarse a propuestas sin aprobación del admin','flujo',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(14,'PERMITE_MODIFICACION_PROPUESTA_APROBADA','false','booleano','Si se permite modificar una propuesta después de ser aprobada','flujo',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(15,'NOMBRE_INSTITUCION','Universidad del Bío-Bío','texto','Nombre de la institución educativa','sistema',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(16,'EMAIL_SOPORTE','soporte@actitubb.cl','texto','Email de contacto para soporte técnico','sistema',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(17,'MANTENIMIENTO_ACTIVO','false','booleano','Modo mantenimiento - bloquea acceso a usuarios (excepto Super Admin)','sistema',1,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL),(18,'VERSION_SISTEMA','1.0.0','texto','Versión actual del sistema','sistema',0,'2026-03-03 17:28:57','2026-03-03 17:28:57',NULL);
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
  KEY `fk_conversacion_ultimo_mensaje` (`ultimo_mensaje_id`),
  CONSTRAINT `conversaciones_ibfk_1` FOREIGN KEY (`usuario1_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `conversaciones_ibfk_2` FOREIGN KEY (`usuario2_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `fk_conversacion_ultimo_mensaje` FOREIGN KEY (`ultimo_mensaje_id`) REFERENCES `mensajes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ultimo_mensaje` FOREIGN KEY (`ultimo_mensaje_id`) REFERENCES `mensajes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversaciones`
--

LOCK TABLES `conversaciones` WRITE;
/*!40000 ALTER TABLE `conversaciones` DISABLE KEYS */;
INSERT INTO `conversaciones` VALUES (1,'10111111-1','20111111-1',4,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(2,'10222222-2','20333333-3',6,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(3,'10444444-4','20777777-7',8,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(4,'10777777-7','23333333-3',10,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(5,'10888888-8','23555555-5',12,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(6,'12200000-2','20695510-4',16,'2026-03-11 00:18:29','2026-03-11 00:24:43');
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cronogramas_proyecto`
--

LOCK TABLES `cronogramas_proyecto` WRITE;
/*!40000 ALTER TABLE `cronogramas_proyecto` DISABLE KEYS */;
INSERT INTO `cronogramas_proyecto` VALUES (1,1,'Cronograma Principal P1',NULL,'2025-07-01','2026-02-28',1,'10111111-1',1,NULL,1,3,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(2,2,'Cronograma Principal P2',NULL,'2025-07-15','2026-03-15',1,'10222222-2',1,NULL,1,3,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(3,3,'Cronograma Principal P3',NULL,'2025-08-01','2026-04-15',1,'10333333-3',0,NULL,1,3,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,4,'Cronograma Principal P4',NULL,'2025-08-10','2026-03-30',1,'10444444-4',1,NULL,1,3,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(5,5,'Cronograma Principal P5',NULL,'2025-08-15','2026-04-30',1,'10555555-5',1,NULL,1,3,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,6,'Cronograma Principal P6',NULL,'2025-09-01','2026-05-28',1,'10666666-6',0,NULL,1,3,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(7,7,'Cronograma Principal P7',NULL,'2025-09-10','2026-05-28',1,'10777777-7',1,NULL,1,3,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(8,8,'Cronograma Principal P8',NULL,'2025-09-20','2026-04-30',1,'10888888-8',1,NULL,1,3,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(9,9,'Cronograma - Anteproyecto Bonito','Cronograma principal del proyecto de titulación','2026-03-10','2026-09-10',1,'12200000-2',0,NULL,1,3,'2026-03-10 16:54:24','2026-03-10 16:54:24'),(10,10,'Cronograma - Proyecto weno weno','Cronograma principal del proyecto de titulación','2026-03-11','2026-09-11',1,'12200000-2',0,NULL,1,3,'2026-03-11 00:06:40','2026-03-11 00:06:40'),(11,11,'Cronograma - prueba video para defensa de proyecto de titulo','Cronograma principal del proyecto de titulación','2026-03-23','2026-09-23',1,'10111111-1',0,NULL,1,3,'2026-03-23 01:37:26','2026-03-23 01:37:26');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
INSERT INTO `departamentos` VALUES (1,1,'Departamento de Sistemas de Información','DSI','Departamento encargado de las carreras de informática',NULL,NULL,NULL,NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30');
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
INSERT INTO `departamentos_carreras` VALUES (1,1,1,1,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(2,1,2,1,1,'2026-03-03 18:36:30','2026-03-03 18:36:30');
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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `disponibilidad_horarios`
--

LOCK TABLES `disponibilidad_horarios` WRITE;
/*!40000 ALTER TABLE `disponibilidad_horarios` DISABLE KEYS */;
INSERT INTO `disponibilidad_horarios` VALUES (1,'10111111-1','lunes','09:00:00','12:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(2,'10111111-1','miercoles','14:00:00','17:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(3,'10222222-2','martes','09:00:00','12:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(4,'10222222-2','jueves','14:00:00','17:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(5,'10333333-3','lunes','14:00:00','17:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(6,'10333333-3','viernes','09:00:00','12:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(7,'10444444-4','miercoles','09:00:00','12:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(8,'10444444-4','viernes','14:00:00','17:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(9,'10555555-5','martes','14:00:00','17:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(10,'10555555-5','jueves','09:00:00','12:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(11,'10666666-6','lunes','09:00:00','11:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(12,'10666666-6','miercoles','15:00:00','17:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(13,'10777777-7','martes','10:00:00','12:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(14,'10777777-7','jueves','15:00:00','17:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(15,'10888888-8','lunes','14:00:00','16:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(16,'10888888-8','viernes','10:00:00','12:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(17,'10999999-9','miercoles','09:00:00','11:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(18,'10999999-9','viernes','14:00:00','16:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(19,'11000000-0','martes','09:00:00','11:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(20,'11000000-0','jueves','14:00:00','16:00:00',1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(21,'12200000-2','martes','09:00:00','20:00:00',1,'2026-03-11 00:23:26','2026-03-11 00:23:26');
/*!40000 ALTER TABLE `disponibilidad_horarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_proyecto`
--

DROP TABLE IF EXISTS `documentos_proyecto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_proyecto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proyecto_id` int NOT NULL,
  `tipo_documento` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'propuesta_final, informe_avance, borrador_final, documento_final, formulario, acta_reunion, otro',
  `nombre_archivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre generado en el servidor',
  `nombre_original` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nombre original del archivo subido',
  `ruta_archivo` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ruta física del archivo',
  `tamanio_bytes` bigint DEFAULT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subido_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` int NOT NULL DEFAULT '1',
  `estado` enum('borrador','en_revision','aprobado','rechazado','archivado') COLLATE utf8mb4_unicode_ci DEFAULT 'borrador',
  `comentarios` text COLLATE utf8mb4_unicode_ci,
  `revisado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `fecha_subida` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `revisado_por` (`revisado_por`),
  KEY `idx_proyecto` (`proyecto_id`),
  KEY `idx_tipo` (`tipo_documento`),
  KEY `idx_estado` (`estado`),
  KEY `idx_subidor` (`subido_por`),
  KEY `idx_fecha` (`fecha_subida`),
  CONSTRAINT `documentos_proyecto_ibfk_1` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documentos_proyecto_ibfk_2` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `documentos_proyecto_ibfk_3` FOREIGN KEY (`revisado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_proyecto`
--

LOCK TABLES `documentos_proyecto` WRITE;
/*!40000 ALTER TABLE `documentos_proyecto` DISABLE KEYS */;
INSERT INTO `documentos_proyecto` VALUES (1,1,'propuesta_final','prop_p1_v1.pdf','Propuesta_SistemaGestion_v1.pdf','uploads/proyectos/1/',NULL,NULL,'20111111-1',1,'aprobado',NULL,NULL,NULL,'2026-03-03 18:36:31','2026-03-03 18:36:31','2026-03-03 18:36:31'),(2,1,'informe_avance','avance1_p1.pdf','Informe_Avance1_BD.pdf','uploads/proyectos/1/',NULL,NULL,'20111111-1',1,'aprobado',NULL,NULL,NULL,'2026-03-03 18:36:31','2026-03-03 18:36:31','2026-03-03 18:36:31'),(3,1,'informe_avance','avance2_p1.pdf','Informe_Avance2_Backend.pdf','uploads/proyectos/1/',NULL,NULL,'20111111-1',2,'aprobado',NULL,NULL,NULL,'2026-03-03 18:36:31','2026-03-03 18:36:31','2026-03-03 18:36:31'),(4,2,'propuesta_final','prop_p2_v1.pdf','Propuesta_AppCultivos_v1.pdf','uploads/proyectos/2/',NULL,NULL,'20333333-3',1,'aprobado',NULL,NULL,NULL,'2026-03-03 18:36:31','2026-03-03 18:36:31','2026-03-03 18:36:31'),(5,4,'propuesta_final','prop_p4_v1.pdf','Propuesta_InventarioQR_v1.pdf','uploads/proyectos/4/',NULL,NULL,'20777777-7',1,'aprobado',NULL,NULL,NULL,'2026-03-03 18:36:31','2026-03-03 18:36:31','2026-03-03 18:36:31'),(6,4,'informe_avance','avance1_p4.pdf','Informe_Requerimientos_PYME.pdf','uploads/proyectos/4/',NULL,NULL,'20777777-7',1,'aprobado',NULL,NULL,NULL,'2026-03-03 18:36:31','2026-03-03 18:36:31','2026-03-03 18:36:31'),(7,4,'informe_avance','avance2_p4.pdf','Informe_ModuloQR.pdf','uploads/proyectos/4/',NULL,NULL,'20777777-7',2,'aprobado',NULL,NULL,NULL,'2026-03-03 18:36:31','2026-03-03 18:36:31','2026-03-03 18:36:31'),(8,7,'informe_avance','avance1_p7.pdf','Analisis_Tecnologias_Biometricas.pdf','uploads/proyectos/7/',NULL,NULL,'23333333-3',1,'aprobado',NULL,NULL,NULL,'2026-03-03 18:36:31','2026-03-03 18:36:31','2026-03-03 18:36:31'),(9,8,'informe_avance','avance1_p8.pdf','Prototipos_UX_Carpooling.pdf','uploads/proyectos/8/',NULL,NULL,'23555555-5',1,'aprobado',NULL,NULL,NULL,'2026-03-03 18:36:31','2026-03-03 18:36:31','2026-03-03 18:36:31');
/*!40000 ALTER TABLE `documentos_proyecto` ENABLE KEYS */;
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
  `nombre` varchar(50) NOT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_propuestas`
--

LOCK TABLES `estados_propuestas` WRITE;
/*!40000 ALTER TABLE `estados_propuestas` DISABLE KEYS */;
INSERT INTO `estados_propuestas` VALUES (1,'pendiente','Propuesta enviada, esperando asignación de profesor','2026-03-03 17:28:57'),(2,'en_revision','Propuesta siendo revisada por profesor','2026-03-03 17:28:57'),(3,'correcciones','Propuesta requiere correcciones del estudiante','2026-03-03 17:28:57'),(4,'aprobada','Propuesta aprobada, se puede crear proyecto','2026-03-03 17:28:57'),(5,'rechazada','Propuesta rechazada','2026-03-03 17:28:57');
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_proyectos`
--

LOCK TABLES `estados_proyectos` WRITE;
/*!40000 ALTER TABLE `estados_proyectos` DISABLE KEYS */;
INSERT INTO `estados_proyectos` VALUES (1,'esperando_asignacion_profesores','Proyecto creado esperando asignación de los 3 roles de profesores','2026-03-03 17:28:57'),(2,'en_desarrollo','Proyecto en fase de desarrollo','2026-03-03 17:28:57'),(3,'avance_enviado','Avance enviado para revisión','2026-03-03 17:28:57'),(4,'avance_en_revision','Avance siendo revisado','2026-03-03 17:28:57'),(5,'avance_con_comentarios','Avance con comentarios del profesor','2026-03-03 17:28:57'),(6,'avance_aprobado','Avance aprobado','2026-03-03 17:28:57'),(7,'pausado','Proyecto pausado temporalmente','2026-03-03 17:28:57'),(8,'completado','Proyecto completado','2026-03-03 17:28:57'),(9,'presentado','Proyecto presentado','2026-03-03 17:28:57'),(10,'defendido','Proyecto defendido exitosamente','2026-03-03 17:28:57'),(11,'retrasado','Proyecto con retraso en cronograma','2026-03-03 17:28:57'),(12,'en_riesgo','Proyecto en riesgo de no completarse','2026-03-03 17:28:57'),(13,'revision_urgente','Proyecto requiere revisión urgente','2026-03-03 17:28:57'),(14,'excelente_progreso','Proyecto con excelente progreso','2026-03-03 17:28:57');
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
  `es_carrera_principal` tinyint(1) DEFAULT '1' COMMENT 'Para estudiantes con doble titulación',
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
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes_carreras`
--

LOCK TABLES `estudiantes_carreras` WRITE;
/*!40000 ALTER TABLE `estudiantes_carreras` DISABLE KEYS */;
INSERT INTO `estudiantes_carreras` VALUES (1,'20111111-1',1,2020,9,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(2,'20222222-2',1,2020,9,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(3,'20333333-3',1,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(4,'20444444-4',1,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(5,'20555555-5',1,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(6,'20666666-6',1,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(7,'20777777-7',1,2020,9,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(8,'20888888-8',1,2020,9,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(9,'20999999-9',1,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(10,'21000000-0',1,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(11,'21100000-K',1,2020,9,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(12,'21200000-1',1,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(13,'21300000-2',1,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(14,'21400000-3',1,2020,9,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(15,'21500000-4',1,2020,9,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(16,'21600000-5',1,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(17,'21700000-6',1,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(18,'21800000-7',1,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(19,'21900000-8',1,2020,9,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(20,'22000000-9',1,2020,9,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(21,'22100000-K',1,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(22,'22200000-0',1,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(23,'22300000-1',1,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(24,'22400000-2',1,2020,9,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(25,'22500000-3',1,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(26,'23111111-1',2,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(27,'23222222-2',2,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(28,'23333333-3',2,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(29,'23444444-4',2,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(30,'23555555-5',2,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(31,'23666666-6',2,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(32,'23777777-7',2,2020,8,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(33,'23888888-8',2,2020,8,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(34,'23999999-9',2,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(35,'24000000-0',2,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(36,'24100000-K',2,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(37,'24200000-1',2,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(38,'24300000-2',2,2020,8,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(39,'24400000-3',2,2020,8,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(40,'24500000-4',2,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(41,'24600000-5',2,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(42,'24700000-6',2,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(43,'24800000-7',2,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(44,'24900000-8',2,2020,8,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(45,'25000000-9',2,2020,8,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(46,'25100000-K',2,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(47,'25200000-0',2,2022,5,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(48,'25300000-1',2,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(49,'25400000-2',2,2021,7,'regular','2021-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(50,'25500000-3',2,2020,8,'regular','2020-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(51,'11111111-1',2,2026,1,'regular','2026-03-09',NULL,NULL,NULL,0,1,NULL,'2026-03-09 18:44:50','2026-03-09 18:44:50'),(52,'26100000-1',1,2022,1,'regular','2022-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-10 15:09:36','2026-03-10 15:09:36'),(54,'20695510-4',2,2026,1,'regular','2026-03-10',NULL,NULL,NULL,0,1,NULL,'2026-03-10 23:42:43','2026-03-10 23:42:43'),(55,'26111111-1',1,2023,7,'regular','2023-03-01',NULL,NULL,NULL,0,1,NULL,'2026-03-11 17:45:31','2026-03-11 17:45:31');
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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes_propuestas`
--

LOCK TABLES `estudiantes_propuestas` WRITE;
/*!40000 ALTER TABLE `estudiantes_propuestas` DISABLE KEYS */;
INSERT INTO `estudiantes_propuestas` VALUES (1,1,'20111111-1',1,1,'2026-03-03 18:36:30'),(2,1,'20222222-2',0,2,'2026-03-03 18:36:30'),(3,2,'20333333-3',1,1,'2026-03-03 18:36:30'),(4,2,'20444444-4',0,2,'2026-03-03 18:36:30'),(5,3,'20555555-5',1,1,'2026-03-03 18:36:30'),(6,4,'20777777-7',1,1,'2026-03-03 18:36:30'),(7,4,'20888888-8',0,2,'2026-03-03 18:36:30'),(8,5,'20999999-9',1,1,'2026-03-03 18:36:30'),(9,6,'23111111-1',1,1,'2026-03-03 18:36:30'),(10,6,'23222222-2',0,2,'2026-03-03 18:36:30'),(11,7,'23333333-3',1,1,'2026-03-03 18:36:30'),(12,7,'23444444-4',0,2,'2026-03-03 18:36:30'),(13,8,'23555555-5',1,1,'2026-03-03 18:36:30'),(14,8,'23666666-6',0,2,'2026-03-03 18:36:30'),(15,9,'21100000-K',1,1,'2026-03-03 18:36:30'),(16,9,'21200000-1',0,2,'2026-03-03 18:36:30'),(17,10,'21300000-2',1,1,'2026-03-03 18:36:30'),(18,11,'24100000-K',1,1,'2026-03-03 18:36:30'),(19,11,'24200000-1',0,2,'2026-03-03 18:36:30'),(20,12,'24300000-2',1,1,'2026-03-03 18:36:30'),(21,12,'24400000-3',0,2,'2026-03-03 18:36:30'),(22,13,'21500000-4',1,1,'2026-03-03 18:36:30'),(23,13,'21600000-5',0,2,'2026-03-03 18:36:30'),(24,14,'21700000-6',1,1,'2026-03-03 18:36:30'),(25,15,'22300000-1',1,1,'2026-03-03 18:36:30'),(26,15,'22400000-2',0,2,'2026-03-03 18:36:30'),(27,16,'24500000-4',1,1,'2026-03-03 18:36:30'),(28,17,'24700000-6',1,1,'2026-03-03 18:36:30'),(29,17,'24800000-7',0,2,'2026-03-03 18:36:30'),(30,18,'22100000-K',1,1,'2026-03-03 18:36:30'),(31,19,'24900000-8',1,1,'2026-03-03 18:36:30'),(32,20,'25500000-3',1,1,'2026-03-03 18:36:30'),(33,21,'26100000-1',1,1,'2026-03-10 16:08:53'),(34,22,'20695510-4',1,1,'2026-03-10 23:48:51'),(35,23,'11111111-1',1,1,'2026-03-23 01:31:30');
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes_proyectos`
--

LOCK TABLES `estudiantes_proyectos` WRITE;
/*!40000 ALTER TABLE `estudiantes_proyectos` DISABLE KEYS */;
INSERT INTO `estudiantes_proyectos` VALUES (1,1,'20111111-1',1,1,'2026-03-03 18:36:30'),(2,1,'20222222-2',0,2,'2026-03-03 18:36:30'),(3,2,'20333333-3',1,1,'2026-03-03 18:36:30'),(4,2,'20444444-4',0,2,'2026-03-03 18:36:30'),(5,3,'20555555-5',1,1,'2026-03-03 18:36:30'),(6,4,'20777777-7',1,1,'2026-03-03 18:36:30'),(7,4,'20888888-8',0,2,'2026-03-03 18:36:30'),(8,5,'20999999-9',1,1,'2026-03-03 18:36:30'),(9,6,'23111111-1',1,1,'2026-03-03 18:36:30'),(10,6,'23222222-2',0,2,'2026-03-03 18:36:30'),(11,7,'23333333-3',1,1,'2026-03-03 18:36:30'),(12,7,'23444444-4',0,2,'2026-03-03 18:36:30'),(13,8,'23555555-5',1,1,'2026-03-03 18:36:30'),(14,8,'23666666-6',0,2,'2026-03-03 18:36:30'),(15,9,'26100000-1',1,1,'2026-03-10 16:15:14'),(16,10,'20695510-4',1,1,'2026-03-11 00:04:01'),(17,11,'11111111-1',1,1,'2026-03-23 01:35:25');
/*!40000 ALTER TABLE `estudiantes_proyectos` ENABLE KEYS */;
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
  `decano_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'RUT del profesor que es decano',
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
INSERT INTO `facultades` VALUES (1,'Facultad de Ciencias Empresariales','FCE','Facultad de Ciencias Empresariales de la Universidad del Bío-Bío',NULL,NULL,NULL,NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30');
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
  `fecha_inicio` date DEFAULT NULL COMMENT 'Fecha de inicio del período (opcional)',
  `hora_inicio` time DEFAULT '00:00:00' COMMENT 'Hora de inicio del período',
  `fecha` date NOT NULL COMMENT 'Fecha fin/límite del período (obligatorio)',
  `hora_limite` time DEFAULT '23:59:59' COMMENT 'Hora límite para entregas (por defecto fin del día)',
  `tipo_fecha` enum('entrega_propuesta','entrega','entrega_avance','entrega_final','reunion','hito','deadline','presentacion','defensa','revision','academica','global','otro') COLLATE utf8mb4_unicode_ci DEFAULT 'otro',
  `es_global` tinyint(1) DEFAULT '0' COMMENT 'Si es true, visible para todos (fechas del admin)',
  `activa` tinyint(1) DEFAULT '1' COMMENT 'Para soft delete (solo fechas de calendario)',
  `habilitada` tinyint(1) DEFAULT '1' COMMENT 'Controla si el período está activo para recibir entregas',
  `permite_extension` tinyint(1) DEFAULT '1' COMMENT 'Si permite solicitar extensión después de la fecha límite',
  `requiere_entrega` tinyint(1) DEFAULT '0' COMMENT 'Si requiere entrega de archivos/documentos',
  `completada` tinyint(1) DEFAULT '0',
  `fecha_realizada` date DEFAULT NULL COMMENT 'Fecha en que se completó el evento',
  `notas` text COLLATE utf8mb4_unicode_ci,
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fechas`
--

LOCK TABLES `fechas` WRITE;
/*!40000 ALTER TABLE `fechas` DISABLE KEYS */;
INSERT INTO `fechas` VALUES (1,'Cierre envío propuestas 2025-2','Fecha límite para envío de propuestas segundo semestre 2025',NULL,'00:00:00','2025-10-31','23:59:59','entrega_propuesta',1,1,0,1,1,0,NULL,NULL,NULL,'33333333-3',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(2,'Cierre envío propuestas 2026-1','Fecha límite para envío de propuestas primer semestre 2026',NULL,'00:00:00','2026-05-31','23:59:59','entrega_propuesta',1,1,1,1,1,0,NULL,NULL,NULL,'33333333-3',NULL,NULL,'2026-03-03 18:36:30','2026-03-05 14:52:40'),(3,'Defensa Oral Julio 2026','Período de defensas orales de proyectos semestre 2026-1',NULL,'00:00:00','2026-07-20','23:59:59','defensa',1,1,0,1,0,0,NULL,NULL,NULL,'33333333-3',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,'Entrega Informe Final 2026-1','Fecha límite entrega informe final proyectos 2026-1',NULL,'00:00:00','2026-07-15','23:59:59','entrega_final',1,1,0,1,1,0,NULL,NULL,NULL,'33333333-3',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(5,'Inicio período titulación 2026-1','Apertura del sistema para nuevas propuestas de titulación 2026',NULL,'00:00:00','2026-03-01','23:59:59','academica',1,1,0,1,0,0,NULL,NULL,NULL,'33333333-3',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,'Entrega 1','apurate',NULL,'00:00:00','2026-03-11','23:59:59','entrega',0,1,1,1,0,1,'2026-03-10',NULL,9,'12200000-2',NULL,NULL,'2026-03-10 16:17:34','2026-03-10 16:18:07');
/*!40000 ALTER TABLE `fechas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guias_estudiantes`
--

DROP TABLE IF EXISTS `guias_estudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guias_estudiantes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estudiante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `profesor_guia_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `asignado_por` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_desasignacion` timestamp NULL DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `asignado_por` (`asignado_por`),
  KEY `idx_guia_estudiante` (`estudiante_rut`,`activo`),
  KEY `idx_guia_profesor` (`profesor_guia_rut`,`activo`),
  CONSTRAINT `guias_estudiantes_ibfk_1` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `guias_estudiantes_ibfk_2` FOREIGN KEY (`profesor_guia_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `guias_estudiantes_ibfk_3` FOREIGN KEY (`asignado_por`) REFERENCES `usuarios` (`rut`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guias_estudiantes`
--

LOCK TABLES `guias_estudiantes` WRITE;
/*!40000 ALTER TABLE `guias_estudiantes` DISABLE KEYS */;
INSERT INTO `guias_estudiantes` VALUES (1,'23111111-1','11100000-K','33333333-3',1,'2026-03-09 18:08:28',NULL,NULL,'2026-03-09 18:08:28','2026-03-09 18:08:28'),(2,'20111111-1','11100000-K','33333333-3',1,'2026-03-09 18:13:37',NULL,NULL,'2026-03-09 18:13:37','2026-03-09 18:13:37'),(3,'23222222-2','11100000-K','33333333-3',1,'2026-03-09 18:13:42',NULL,NULL,'2026-03-09 18:13:42','2026-03-09 18:13:42'),(4,'20222222-2','11100000-K','33333333-3',1,'2026-03-09 18:13:48',NULL,NULL,'2026-03-09 18:13:48','2026-03-09 18:13:48'),(5,'25500000-3','11100000-K','33333333-3',1,'2026-03-09 18:15:33',NULL,NULL,'2026-03-09 18:15:33','2026-03-09 18:15:33'),(6,'20333333-3','11000000-0','33333333-3',1,'2026-03-09 18:40:51',NULL,NULL,'2026-03-09 18:40:51','2026-03-09 18:40:51'),(7,'11111111-1','11000000-0','33333333-3',0,'2026-03-09 18:45:05','2026-03-23 01:29:10',NULL,'2026-03-09 18:45:05','2026-03-23 01:29:10'),(8,'26100000-1','12200000-2','33333333-3',1,'2026-03-10 15:56:13',NULL,NULL,'2026-03-10 15:56:13','2026-03-10 15:56:13'),(9,'20695510-4','12200000-2','33333333-3',1,'2026-03-10 23:46:02',NULL,NULL,'2026-03-10 23:46:02','2026-03-10 23:46:02'),(10,'11111111-1','12200000-2','33333333-3',0,'2026-03-23 01:29:10','2026-03-23 01:37:01',NULL,'2026-03-23 01:29:10','2026-03-23 01:37:01'),(11,'11111111-1','10111111-1','33333333-3',1,'2026-03-23 01:37:02',NULL,NULL,'2026-03-23 01:37:02','2026-03-23 01:37:02');
/*!40000 ALTER TABLE `guias_estudiantes` ENABLE KEYS */;
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
  `estado_anterior` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_nuevo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci COMMENT 'Razón del cambio de estado',
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
  `archivo_revision` varchar(255) DEFAULT NULL COMMENT 'Archivo adjunto a esta revisión',
  `nombre_archivo_original` varchar(255) DEFAULT NULL COMMENT 'Nombre original del archivo adjunto',
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_revisiones_propuestas`
--

LOCK TABLES `historial_revisiones_propuestas` WRITE;
/*!40000 ALTER TABLE `historial_revisiones_propuestas` DISABLE KEYS */;
INSERT INTO `historial_revisiones_propuestas` VALUES (1,17,12,'10222222-2','decision_tomada','solicitar_correcciones','dzdzcxzxczxczxcz dxcfzczczxccsac  lshdfkjsad njdsgaamsd',NULL,NULL,'2026-03-09 18:24:24','10222222-2'),(2,20,21,'12300000-3','decision_tomada','solicitar_correcciones','Está como el loly','1773159227817-185871666.pdf','lista-de-conectores.pdf','2026-03-10 16:13:47','12300000-3'),(3,20,21,'12300000-3','decision_tomada','aprobar','Ahora si poh',NULL,NULL,'2026-03-10 16:15:14','12300000-3'),(4,21,22,'12300000-3','decision_tomada','solicitar_correcciones','wewewewewewewewewewewewewewewewewe','1773187183223-719286925.pdf','CONTRATO_OBRA 2026_,INQUUS-DANIEL AGUAYO.pdf','2026-03-10 23:59:43','12300000-3'),(5,21,22,'12300000-3','decision_tomada','aprobar','dfasdfasdfasdfasdf',NULL,NULL,'2026-03-11 00:04:01','12300000-3'),(6,23,23,'10222222-2','decision_tomada','solicitar_correcciones','debe revisar propuesta',NULL,NULL,'2026-03-23 01:33:42','10222222-2'),(7,23,23,'10222222-2','decision_tomada','aprobar',NULL,NULL,NULL,'2026-03-23 01:35:25','10222222-2');
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
  `tipo_hito` enum('entrega_documento','revision_avance','reunion_seguimiento','defensa','entrega_final') NOT NULL,
  `fecha_limite` date NOT NULL,
  `fecha_entrega` timestamp NULL DEFAULT NULL,
  `estado` enum('pendiente','en_progreso','entregado','revisado','aprobado','rechazado','retrasado') DEFAULT 'pendiente',
  `porcentaje_avance` decimal(5,2) DEFAULT '0.00',
  `archivo_entrega` varchar(255) DEFAULT NULL,
  `nombre_archivo_original` varchar(255) DEFAULT NULL,
  `comentarios_estudiante` text,
  `comentarios_profesor` text,
  `calificacion` decimal(3,1) DEFAULT NULL,
  `archivo_retroalimentacion` varchar(255) DEFAULT NULL,
  `nombre_archivo_retroalimentacion` varchar(255) DEFAULT NULL,
  `peso_en_proyecto` decimal(5,2) DEFAULT '0.00',
  `es_critico` tinyint(1) DEFAULT '0',
  `hito_predecesor_id` int DEFAULT NULL,
  `creado_por_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_por_rol` enum('guia','informante','admin') DEFAULT 'guia',
  `actualizado_por_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cumplido_en_fecha` tinyint(1) DEFAULT NULL,
  `dias_retraso` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `hito_predecesor_id` (`hito_predecesor_id`),
  KEY `creado_por_rut` (`creado_por_rut`),
  KEY `idx_cronograma_fecha` (`cronograma_id`,`fecha_limite`),
  KEY `idx_proyecto_estado` (`proyecto_id`,`estado`),
  KEY `idx_fecha_limite` (`fecha_limite`),
  KEY `idx_estado_fecha` (`estado`,`fecha_limite`),
  CONSTRAINT `hitos_cronograma_ibfk_1` FOREIGN KEY (`cronograma_id`) REFERENCES `cronogramas_proyecto` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hitos_cronograma_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `hitos_cronograma_ibfk_3` FOREIGN KEY (`hito_predecesor_id`) REFERENCES `hitos_cronograma` (`id`) ON DELETE SET NULL,
  CONSTRAINT `hitos_cronograma_ibfk_4` FOREIGN KEY (`creado_por_rut`) REFERENCES `usuarios` (`rut`) ON DELETE SET NULL,
  CONSTRAINT `hitos_cronograma_chk_1` CHECK (((`porcentaje_avance` >= 0) and (`porcentaje_avance` <= 100))),
  CONSTRAINT `hitos_cronograma_chk_2` CHECK (((`calificacion` >= 1.0) and (`calificacion` <= 7.0))),
  CONSTRAINT `hitos_cronograma_chk_3` CHECK (((`peso_en_proyecto` >= 0) and (`peso_en_proyecto` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hitos_cronograma`
--

LOCK TABLES `hitos_cronograma` WRITE;
/*!40000 ALTER TABLE `hitos_cronograma` DISABLE KEYS */;
INSERT INTO `hitos_cronograma` VALUES (1,1,1,'Entrega documento de análisis',NULL,'entrega_documento','2025-08-30',NULL,'aprobado',100.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10111111-1','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(2,1,1,'Revisión de avance Backend',NULL,'revision_avance','2025-10-15',NULL,'aprobado',100.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10111111-1','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(3,1,1,'Entrega Frontend completo',NULL,'entrega_documento','2025-12-30',NULL,'en_progreso',70.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10111111-1','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,1,1,'Defensa final',NULL,'defensa','2026-02-28',NULL,'pendiente',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10111111-1','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(5,2,2,'Entrega arquitectura y diseño',NULL,'entrega_documento','2025-09-15',NULL,'aprobado',100.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10222222-2','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,2,2,'Prototipo sensores integrado',NULL,'revision_avance','2025-12-01',NULL,'en_progreso',50.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10222222-2','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(7,2,2,'App móvil funcional',NULL,'entrega_documento','2026-02-15',NULL,'pendiente',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10222222-2','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(8,4,4,'Análisis de requerimientos',NULL,'entrega_documento','2025-09-30',NULL,'aprobado',100.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10444444-4','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(9,4,4,'Módulo QR implementado',NULL,'revision_avance','2025-11-15',NULL,'aprobado',100.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10444444-4','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(10,4,4,'Sistema de alertas',NULL,'revision_avance','2026-01-15',NULL,'aprobado',100.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10444444-4','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(11,4,4,'Testing con usuarios finales',NULL,'revision_avance','2026-02-28',NULL,'en_progreso',60.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10444444-4','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(12,8,8,'Diseño UX validado',NULL,'entrega_documento','2025-11-15',NULL,'aprobado',100.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10888888-8','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(13,8,8,'Backend y matching implementado',NULL,'revision_avance','2026-01-30',NULL,'en_progreso',55.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10888888-8','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(14,8,8,'Defensa final',NULL,'defensa','2026-04-30',NULL,'pendiente',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10888888-8','guia',NULL,NULL,0,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(15,9,9,'jhkggkhjghhhhhh','gjhfgfghjfghfjyf','entrega_documento','2026-03-12','2026-03-10 16:56:34','aprobado',100.00,'1773161794953-163491470.pdf','uncharter.pdf','nvbvbvbvbn','xd',NULL,NULL,NULL,25.00,0,NULL,'12200000-2','guia','12200000-2',1,0,'2026-03-10 16:55:12','2026-03-10 16:57:10'),(16,9,9,'xdd','hfgjhgjhgjh','entrega_documento','2026-03-11',NULL,'pendiente',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10.00,0,NULL,'12200000-2','guia',NULL,NULL,0,'2026-03-10 16:58:33','2026-03-10 16:58:33'),(17,10,10,'entrega 1',NULL,'entrega_documento','2026-03-12','2026-03-11 00:17:13','aprobado',100.00,'1773188233472-409110243.pdf','DDACs Paper - DRAFT 1.pdf','','digaselo a la profe tati :c',NULL,NULL,NULL,25.00,1,NULL,'12200000-2','guia','12200000-2',1,0,'2026-03-11 00:07:01','2026-03-11 00:20:36'),(18,10,10,'entrega final',NULL,'entrega_final','2026-03-18','2026-03-11 00:21:28','aprobado',100.00,'1773188488069-697404782.pdf','DDACs Paper - DRAFT 1.pdf','','xdddd',NULL,NULL,NULL,0.00,1,17,'12200000-2','guia','12200000-2',1,0,'2026-03-11 00:17:46','2026-03-11 00:24:48'),(19,10,10,'hito informante','asdasdasd','revision_avance','2026-03-12','2026-03-11 00:44:40','aprobado',100.00,'1773189880858-765396329.pdf','DDACs Paper - DRAFT 1.pdf','','dfsdfsdfsdf',NULL,NULL,NULL,2.00,0,NULL,'10222222-2','guia','12200000-2',1,0,'2026-03-11 00:41:35','2026-03-11 00:44:50'),(22,10,10,'XDD','FSDFSDFSDF','entrega_final','2026-03-12','2026-03-11 09:42:15','aprobado',100.00,'1773222135926-437970603.pdf','ASIO4ALL v2 Instruction Manual.pdf','','xdd',NULL,NULL,NULL,0.00,1,NULL,'12200000-2','guia','12200000-2',1,0,'2026-03-11 09:38:05','2026-03-11 09:42:40'),(23,10,10,'entrega correcciones','fasdfad','entrega_documento','2026-03-13','2026-03-11 10:33:03','aprobado',100.00,'1773225183429-308989126.pdf','reporte-cumplimiento-3-2.pdf','','aaaaaaaaaaaaaa',NULL,NULL,NULL,0.00,1,NULL,'10222222-2','informante','10222222-2',1,0,'2026-03-11 10:32:47','2026-03-11 10:41:04'),(24,11,11,'entrega 1 ',NULL,'entrega_documento','2026-03-23',NULL,'pendiente',0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,0,NULL,'10111111-1','guia',NULL,NULL,0,'2026-03-23 01:37:54','2026-03-23 01:37:54'),(25,11,11,'entrega final ','','entrega_final','2026-03-26','2026-03-23 01:40:28','aprobado',100.00,'1774230028884-764128123.pdf','IECIPT_2025_2_INF_01_L_Cabrera__1__Aguayo__Daniel-8.pdf','','aprove',NULL,NULL,NULL,0.00,1,24,'10111111-1','guia','10111111-1',1,0,'2026-03-23 01:38:19','2026-03-23 01:41:18'),(26,11,11,'hito informante prueba','','entrega_documento','2026-03-26','2026-03-23 01:43:17','aprobado',100.00,'1774230197772-263330498.pdf','Manual_de_Normas_Graficas_UBB2025-web.pdf','','aprove',NULL,NULL,NULL,0.00,1,NULL,'11100000-K','informante','11100000-K',1,0,'2026-03-23 01:42:45','2026-03-23 01:43:53');
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hitos_proyecto`
--

LOCK TABLES `hitos_proyecto` WRITE;
/*!40000 ALTER TABLE `hitos_proyecto` DISABLE KEYS */;
INSERT INTO `hitos_proyecto` VALUES (1,1,'Análisis y Diseño','Documento de análisis de requerimientos y diseño del sistema','planificacion','2025-08-30',NULL,'completado',100.00,20.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'10111111-1',NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(2,1,'Desarrollo Backend','Implementación completa de la API REST','desarrollo','2025-10-31',NULL,'completado',100.00,30.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'10111111-1',NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(3,1,'Desarrollo Frontend','Implementación completa de la SPA','desarrollo','2026-01-30',NULL,'en_progreso',70.00,30.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'10111111-1',NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,1,'Testing y Documentación','Pruebas de sistema y documentación final','documentacion','2026-02-15',NULL,'pendiente',0.00,10.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,'10111111-1',NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(5,1,'Defensa Oral','Presentación y defensa del proyecto','defensa','2026-02-28',NULL,'pendiente',0.00,10.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'10111111-1',NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,4,'Análisis de Requerimientos','Levantamiento de requerimientos con PYMES','planificacion','2025-09-30',NULL,'completado',100.00,15.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,'10444444-4',NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(7,4,'Módulo QR','Implementación generación y lectura QR','desarrollo','2025-11-15',NULL,'completado',100.00,25.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'10444444-4',NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(8,4,'Sistema de Alertas','Implementación notificaciones y alertas','desarrollo','2026-01-15',NULL,'completado',100.00,25.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,0,'10444444-4',NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(9,4,'Testing','Pruebas de usuario con PYMES reales','revision','2026-02-28',NULL,'en_progreso',60.00,20.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'10444444-4',NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(10,4,'Defensa','Presentación y defensa del proyecto','defensa','2026-03-20',NULL,'pendiente',0.00,15.0,NULL,NULL,15,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'10444444-4',NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43');
/*!40000 ALTER TABLE `hitos_proyecto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inscripciones_ramo`
--

DROP TABLE IF EXISTS `inscripciones_ramo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inscripciones_ramo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estudiante_rut` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `semestre_id` int NOT NULL,
  `tipo_ramo` enum('AP','PT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_estudiante_semestre` (`estudiante_rut`,`semestre_id`),
  KEY `semestre_id` (`semestre_id`),
  CONSTRAINT `inscripciones_ramo_ibfk_1` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE,
  CONSTRAINT `inscripciones_ramo_ibfk_2` FOREIGN KEY (`semestre_id`) REFERENCES `semestres` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripciones_ramo`
--

LOCK TABLES `inscripciones_ramo` WRITE;
/*!40000 ALTER TABLE `inscripciones_ramo` DISABLE KEYS */;
INSERT INTO `inscripciones_ramo` VALUES (1,'23111111-1',1,'AP','2026-03-09 18:13:11','2026-03-09 18:15:03'),(2,'20111111-1',1,'PT','2026-03-09 18:13:39','2026-03-09 18:13:39'),(3,'23222222-2',1,'PT','2026-03-09 18:13:45','2026-03-09 18:13:45'),(4,'20222222-2',1,'AP','2026-03-09 18:13:49','2026-03-09 18:13:49'),(5,'25500000-3',1,'PT','2026-03-09 18:15:36','2026-03-09 18:15:36'),(6,'20333333-3',1,'AP','2026-03-09 18:40:54','2026-03-09 18:40:54'),(7,'11111111-1',1,'PT','2026-03-09 18:45:08','2026-03-10 23:42:43'),(8,'26100000-1',1,'AP','2026-03-10 15:56:22','2026-03-10 15:56:22'),(10,'20695510-4',1,'PT','2026-03-10 23:45:43','2026-03-10 23:45:43'),(11,'26111111-1',1,'PT','2026-03-11 17:45:31','2026-03-11 17:45:31');
/*!40000 ALTER TABLE `inscripciones_ramo` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jefes_carreras`
--

LOCK TABLES `jefes_carreras` WRITE;
/*!40000 ALTER TABLE `jefes_carreras` DISABLE KEYS */;
INSERT INTO `jefes_carreras` VALUES (1,'33333333-3',1,'2026-03-03',NULL,1,'2026-03-03 20:32:43','2026-03-03 20:32:43'),(2,'33333333-3',2,'2026-03-03',NULL,1,'2026-03-03 20:32:48','2026-03-03 20:32:48');
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
  `contenido` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `leido` tinyint(1) DEFAULT '0',
  `fecha_lectura` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversacion` (`conversacion_id`),
  KEY `idx_remitente` (`remitente_rut`),
  KEY `idx_created` (`created_at`),
  CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`remitente_rut`) REFERENCES `usuarios` (`rut`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes`
--

LOCK TABLES `mensajes` WRITE;
/*!40000 ALTER TABLE `mensajes` DISABLE KEYS */;
INSERT INTO `mensajes` VALUES (1,1,'10111111-1','Hola Alejandro, ¿cómo va el desarrollo del frontend?',1,NULL,'2026-03-03 18:36:30'),(2,1,'20111111-1','Hola profesor, vamos al 70%. Tengo una duda sobre la integración con la API.',1,NULL,'2026-03-03 18:36:30'),(3,1,'10111111-1','Claro, agendemos una reunión para revisarlo. ¿Cuándo tienes disponibilidad?',1,NULL,'2026-03-03 18:36:30'),(4,1,'20111111-1','Esta semana el jueves a las 10 am me vendría bien.',0,NULL,'2026-03-03 18:36:30'),(5,2,'10222222-2','Camilo, necesito que me envíes el informe de la integración de sensores.',1,NULL,'2026-03-03 18:36:30'),(6,2,'20333333-3','Listo profesor, se lo envío esta tarde al correo.',1,NULL,'2026-03-03 18:36:30'),(7,3,'10444444-4','Gabriel, excelente trabajo en el módulo de alertas. Procedamos con el testing.',1,NULL,'2026-03-03 18:36:30'),(8,3,'20777777-7','Gracias profesor. Ya coordiné con las 3 PYMES para hacer las pruebas.',0,NULL,'2026-03-03 18:36:30'),(9,4,'10777777-7','Gonzalo, ¿lograron mejorar la precisión del reconocimiento?',1,NULL,'2026-03-03 18:36:30'),(10,4,'23333333-3','Sí profesor, llegamos al 97% con el ajuste de parámetros que sugirió.',0,NULL,'2026-03-03 18:36:30'),(11,5,'10888888-8','Ernesto, los prototipos UX están muy bien diseñados. Sigan así.',1,NULL,'2026-03-03 18:36:30'),(12,5,'23555555-5','Muchas gracias profesor, incorporamos todos los feedbacks de los usuarios.',1,NULL,'2026-03-03 18:36:30'),(13,6,'12200000-2','Hola',1,'2026-03-11 00:24:03','2026-03-11 00:18:32'),(14,6,'20695510-4','Hola profe',1,'2026-03-11 00:24:30','2026-03-11 00:24:06'),(15,6,'20695510-4','Estoy nervioso',1,'2026-03-11 09:24:26','2026-03-11 00:24:39'),(16,6,'20695510-4','Quiero defender luego',1,'2026-03-11 09:24:26','2026-03-11 00:24:43');
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
INSERT INTO `mensajes_no_leidos` VALUES ('10111111-1',1,1,'2026-03-03 18:36:31'),('10444444-4',3,1,'2026-03-03 18:36:31'),('10777777-7',4,1,'2026-03-03 18:36:31');
/*!40000 ALTER TABLE `mensajes_no_leidos` ENABLE KEYS */;
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
  `rol_destinatario` enum('estudiante','profesor_guia','profesor_asignatura','admin') NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones_proyecto`
--

LOCK TABLES `notificaciones_proyecto` WRITE;
/*!40000 ALTER TABLE `notificaciones_proyecto` DISABLE KEYS */;
INSERT INTO `notificaciones_proyecto` VALUES (1,1,NULL,'nueva_entrega','10111111-1','profesor_guia','Nuevo avance enviado - P1','El estudiante Alejandro Muñoz ha enviado el avance 3 del proyecto.',0,NULL,1,1,0,NULL,'2026-03-03 18:36:31'),(2,2,NULL,'fecha_limite_proxima','20333333-3','estudiante','Fecha límite próxima - P2','El hito \"Prototipo sensores integrado\" vence en 15 días.',0,NULL,1,1,0,NULL,'2026-03-03 18:36:31'),(3,4,NULL,'nueva_entrega','10444444-4','profesor_guia','Avance 3 aprobado - P4','El avance del sistema de alertas fue aprobado exitosamente.',1,NULL,1,1,0,NULL,'2026-03-03 18:36:31'),(4,5,NULL,'nueva_entrega','10555555-5','profesor_guia','Nuevo avance enviado - P5','El estudiante Emilio Torres ha enviado el avance 2 del proyecto.',0,NULL,1,1,0,NULL,'2026-03-03 18:36:31'),(5,7,NULL,'nueva_entrega','10777777-7','profesor_guia','Avance 2 recibido - P7','Prototipo de reconocimiento facial enviado para revisión.',0,NULL,1,1,0,NULL,'2026-03-03 18:36:31'),(6,1,NULL,'proyecto_creado','20111111-1','estudiante','¡Proyecto creado exitosamente!','Tu propuesta fue aprobada y el proyecto ha sido creado. ¡Mucho éxito!',1,NULL,1,1,0,NULL,'2026-03-03 18:36:31'),(7,6,NULL,'proyecto_creado','23111111-1','estudiante','¡Proyecto creado exitosamente!','Tu propuesta fue aprobada y el proyecto ha sido creado. ¡Mucho éxito!',1,NULL,1,1,0,NULL,'2026-03-03 18:36:31'),(8,9,NULL,'proyecto_creado','33333333-3','admin','Nuevo Proyecto Creado','Nuevo proyecto creado automáticamente: \"Anteproyecto Bonito\". Requiere asignación de los 3 roles de profesores para activarse.',0,NULL,1,1,0,NULL,'2026-03-10 16:15:14'),(9,10,NULL,'proyecto_creado','33333333-3','admin','Nuevo Proyecto Creado','Nuevo proyecto creado automáticamente: \"Proyecto weno weno\". Requiere asignación de los 3 roles de profesores para activarse.',0,NULL,1,1,0,NULL,'2026-03-11 00:04:01'),(10,11,NULL,'proyecto_creado','33333333-3','admin','Nuevo Proyecto Creado','Nuevo proyecto creado automáticamente: \"prueba video para defensa de proyecto de titulo\". Requiere asignación de los 3 roles de profesores para activarse.',0,NULL,1,1,0,NULL,'2026-03-23 01:35:25');
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `nombre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activo` (`activo`),
  KEY `idx_fechas` (`fecha_inicio`,`fecha_fin`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos_propuestas`
--

LOCK TABLES `periodos_propuestas` WRITE;
/*!40000 ALTER TABLE `periodos_propuestas` DISABLE KEYS */;
INSERT INTO `periodos_propuestas` VALUES (1,'Período de Propuestas 2026','2026-03-01','2026-12-31',1,'2026-03-03 17:28:57','2026-03-04 12:20:43');
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `profesores_departamentos`
--

LOCK TABLES `profesores_departamentos` WRITE;
/*!40000 ALTER TABLE `profesores_departamentos` DISABLE KEYS */;
INSERT INTO `profesores_departamentos` VALUES (1,'10111111-1',1,1,'2010-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(2,'10222222-2',1,1,'2012-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(3,'10333333-3',1,1,'2008-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(4,'10444444-4',1,1,'2015-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(5,'10555555-5',1,1,'2011-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(6,'10666666-6',1,1,'2013-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(7,'10777777-7',1,1,'2009-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(8,'10888888-8',1,1,'2016-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(9,'10999999-9',1,1,'2007-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(10,'11000000-0',1,1,'2018-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(11,'11100000-K',1,1,'2014-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(12,'11200000-1',1,1,'2017-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(13,'11300000-2',1,1,'2006-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(14,'11400000-3',1,1,'2019-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(15,'11500000-4',1,1,'2010-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(16,'11600000-5',1,1,'2021-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(17,'11700000-6',1,1,'2020-03-01',NULL,1,'2026-03-03 18:36:30','2026-03-03 18:36:30'),(18,'12200000-2',1,1,'2026-03-01',NULL,1,'2026-03-10 15:11:07','2026-03-10 15:11:07'),(19,'12300000-3',1,1,'2026-03-01',NULL,1,'2026-03-10 15:11:07','2026-03-10 15:11:07'),(20,'12111111-1',1,1,'2023-03-01',NULL,1,'2026-03-11 17:45:31','2026-03-11 17:45:31'),(21,'12222222-2',1,1,'2023-03-01',NULL,1,'2026-03-11 17:45:31','2026-03-11 17:45:31'),(22,'12333333-3',1,1,'2024-03-01',NULL,1,'2026-03-11 17:45:31','2026-03-11 17:45:31');
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
  `semestre_id` int DEFAULT NULL,
  `modalidad` enum('desarrollo_software','investigacion','practica') NOT NULL,
  `tipo_proyecto` enum('PT','AP') NOT NULL DEFAULT 'PT',
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
  KEY `fk_propuestas_semestre` (`semestre_id`),
  CONSTRAINT `fk_propuestas_semestre` FOREIGN KEY (`semestre_id`) REFERENCES `semestres` (`id`),
  CONSTRAINT `propuestas_ibfk_1` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `propuestas_ibfk_2` FOREIGN KEY (`estado_id`) REFERENCES `estados_propuestas` (`id`),
  CONSTRAINT `propuestas_chk_1` CHECK ((`numero_estudiantes` in (1,2,3))),
  CONSTRAINT `propuestas_chk_2` CHECK ((`duracion_estimada_semestres` between 1 and 2))
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `propuestas`
--

LOCK TABLES `propuestas` WRITE;
/*!40000 ALTER TABLE `propuestas` DISABLE KEYS */;
INSERT INTO `propuestas` VALUES (1,'Sistema de Gestión de Titulaciones Web','Plataforma web para administrar el proceso de titulación de estudiantes universitarios, incluyendo seguimiento de avances y notificaciones automáticas.','20111111-1',4,'2025-06-15',NULL,NULL,1,NULL,NULL,NULL,'desarrollo_software','PT',2,'alta',NULL,2,'Ingeniería de Software','Desarrollar un sistema web integral para la gestión del proceso de titulación universitaria.','Diseñar la base de datos, Implementar backend REST, Desarrollar frontend SPA, Integrar notificaciones.','Metodología ágil Scrum con sprints de 2 semanas.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(2,'App Móvil de Monitoreo de Cultivos','Aplicación móvil para agricultores que permite monitorear condiciones climáticas y del suelo en tiempo real usando sensores IoT.','20333333-3',4,'2025-06-20',NULL,NULL,2,NULL,NULL,NULL,'desarrollo_software','PT',2,'alta',NULL,2,'IoT y Agricultura','Desarrollar una app móvil para monitoreo agrícola con sensores IoT.','Integrar sensores, Crear app React Native, Implementar dashboard.','Metodología iterativa con prototipos funcionales.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(3,'Plataforma E-learning Adaptativa','Sistema de aprendizaje en línea con rutas personalizadas según el rendimiento del estudiante usando algoritmos de machine learning.','20555555-5',4,'2025-07-01',NULL,NULL,3,NULL,NULL,NULL,'desarrollo_software','PT',1,'alta',NULL,2,'Educación y ML','Crear plataforma e-learning con personalización basada en ML.','Diseñar motor de recomendaciones, Implementar LMS, Evaluar con usuarios.','Design Thinking + metodología ágil.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,'Sistema de Inventario con QR','Solución para gestión de inventario usando códigos QR, con alertas de stock y reportes automáticos para PYMES.','20777777-7',4,'2025-07-10',NULL,NULL,4,NULL,NULL,NULL,'desarrollo_software','PT',2,'media',NULL,1,'Gestión Empresarial','Automatizar la gestión de inventario para PYMES mediante códigos QR.','Implementar escáner QR, gestión de stock, sistema de alertas.','Metodología cascada con entregas incrementales.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(5,'Chatbot de Atención Ciudadana','Bot inteligente para municipalidades que responde consultas ciudadanas mediante NLP y se integra con sistemas municipales existentes.','20999999-9',4,'2025-07-15',NULL,NULL,5,NULL,NULL,NULL,'desarrollo_software','PT',1,'alta',NULL,2,'IA y Gobierno Digital','Desarrollar chatbot con NLP para atención ciudadana municipal.','Entrenar modelo NLP, Integrar APIs municipales, Desplegar en producción.','Investigación aplicada con iteraciones de mejora.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,'Plataforma de Telemedicina Rural','Sistema de teleconsultas médicas para zonas rurales con baja conectividad, usando compresión de video adaptativa.','23111111-1',4,'2025-08-01',NULL,NULL,6,NULL,NULL,NULL,'desarrollo_software','PT',2,'alta',NULL,2,'Salud Digital','Facilitar el acceso a atención médica en zonas rurales mediante telemedicina.','Implementar videollamadas adaptativas, gestión de citas, historial médico.','Metodología centrada en el usuario con pruebas en terreno.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(7,'Sistema de Control de Acceso Biométrico','Solución de control de acceso usando reconocimiento facial para empresas medianas, con registro y alertas en tiempo real.','23333333-3',4,'2025-08-10',NULL,NULL,7,NULL,NULL,NULL,'desarrollo_software','PT',2,'alta',NULL,1,'Seguridad Informática','Implementar control de acceso biométrico basado en reconocimiento facial.','Entrenar modelo de reconocimiento facial, integrar hardware, sistema de alertas.','Metodología ágil con foco en seguridad.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(8,'App de Transporte Compartido Universitario','Aplicación para coordinar viajes compartidos entre estudiantes universitarios de una misma zona geográfica.','23555555-5',4,'2025-08-20',NULL,NULL,8,NULL,NULL,NULL,'desarrollo_software','PT',2,'media',NULL,1,'Movilidad Urbana','Reducir costos de transporte estudiantil mediante una app de carpooling universitario.','Geolocalización, matching de rutas, sistema de pagos, calificaciones.','Lean startup con MVP y validación de usuarios.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(9,'Plataforma de Voluntariado Digital','Sistema que conecta voluntarios con organizaciones sociales, gestionando proyectos, horas y certificados digitales.','21100000-K',2,'2026-02-05',NULL,NULL,NULL,NULL,NULL,NULL,'desarrollo_software','PT',2,'media',NULL,1,'Impacto Social','Conectar voluntarios con organizaciones mediante plataforma digital.','Registro de voluntarios, gestión de proyectos, certificación digital.','Metodología ágil Kanban.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(10,'Sistema de Detección de Plagio Académico','Herramienta para detectar plagio en trabajos académicos usando NLP y comparación semántica avanzada.','21300000-2',2,'2026-02-10',NULL,NULL,NULL,NULL,NULL,NULL,'investigacion','PT',1,'alta',NULL,2,'NLP y Educación','Desarrollar sistema robusto de detección de plagio para entornos académicos.','Investigar algoritmos NLP, implementar comparador semántico, validar con corpus.','Investigación empírica con datasets académicos reales.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(11,'Dashboard de Análisis de Redes Sociales','Herramienta de análisis de sentimientos y tendencias en redes sociales para equipos de marketing digital.','24100000-K',2,'2026-02-15',NULL,NULL,NULL,NULL,NULL,NULL,'desarrollo_software','PT',2,'media',NULL,1,'Análisis de Datos','Proveer insights de redes sociales mediante análisis de sentimientos en tiempo real.','Conectar APIs sociales, análisis de sentimientos, visualizaciones interactivas.','Metodología ágil con sprints cortos.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(12,'Sistema de Gestión de Residuos Inteligente','Plataforma IoT para municipalidades que optimiza rutas de recolección de residuos según nivel de llenado de contenedores.','24300000-2',3,'2026-02-18','2026-03-09 18:24:24',NULL,NULL,NULL,NULL,NULL,'desarrollo_software','PT',2,'alta',NULL,2,'Smart City','Optimizar la recolección de residuos urbanos mediante sensores IoT y algoritmos de rutas.','Integrar sensores de nivel, optimizar rutas, reportes de eficiencia.','Metodología iterativa con pilotos municipales.',NULL,NULL,'2026-03-03 18:36:30','2026-03-09 18:24:24'),(13,'Plataforma de Crowdfunding Comunitario','Sistema de financiamiento colectivo para proyectos locales con validación comunitaria y seguimiento transparente.','21500000-4',1,'2026-02-20',NULL,NULL,NULL,NULL,NULL,NULL,'desarrollo_software','PT',2,'media',NULL,1,'Fintech','Democratizar el financiamiento de proyectos locales mediante crowdfunding transparente.','Gestión de campañas, pagos seguros, reportes públicos.','Metodología ágil con foco en experiencia de usuario.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(14,'App de Realidad Aumentada para Museos','Aplicación móvil que enriquece la experiencia museística con contenido AR interactivo y guías virtuales.','21700000-6',1,'2026-02-25',NULL,NULL,NULL,NULL,NULL,NULL,'desarrollo_software','PT',1,'alta',NULL,2,'Cultura Digital','Mejorar la experiencia de visitantes de museos mediante realidad aumentada.','Desarrollar AR markers, contenido multimedia, guía virtual interactiva.','Design Thinking centrado en la experiencia del visitante.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(15,'Sistema de Predicción de Deserción Estudiantil','Modelo de ML para predecir y prevenir la deserción estudiantil universitaria con intervenciones tempranas.','22300000-1',1,'2026-02-28',NULL,NULL,NULL,NULL,NULL,NULL,'investigacion','PT',2,'alta',NULL,2,'ML en Educación','Predecir la deserción estudiantil universitaria para intervenir a tiempo.','Recolectar datos académicos, entrenar modelos, validar predicciones.','Metodología CRISP-DM para minería de datos.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(16,'App de Gestión de Tareas para Equipos','Herramienta colaborativa de gestión de tareas y proyectos para equipos remotos con integración a herramientas populares.','24500000-4',3,'2026-02-05',NULL,NULL,NULL,NULL,NULL,NULL,'desarrollo_software','PT',1,'media',NULL,1,'Productividad','Mejorar la gestión de proyectos en equipos remotos mediante app colaborativa.','Gestión de tareas, notificaciones, integraciones con Slack y GitHub.','Lean startup validando con equipos reales.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(17,'Sistema de Monitoreo de Pacientes Crónicos','Plataforma de seguimiento remoto para pacientes con enfermedades crónicas, con alertas para médicos tratantes.','24700000-6',3,'2026-02-08',NULL,NULL,NULL,NULL,NULL,NULL,'desarrollo_software','PT',2,'alta',NULL,2,'Salud Digital','Mejorar el seguimiento de pacientes crónicos mediante monitoreo remoto continuo.','Registro de signos vitales, alertas automáticas, historial clínico digital.','Metodología centrada en el usuario con validación clínica.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(18,'Blog de Recetas Culinarias','Un blog simple con recetas de cocina y fotos.','22100000-K',5,'2026-01-10',NULL,NULL,NULL,NULL,NULL,NULL,'desarrollo_software','PT',1,'baja',NULL,1,'Entretenimiento','Crear blog de recetas.','Diseñar interfaz, subir recetas.','Sin metodología definida.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(19,'App de Música Personal','Reproductor de música básico para uso personal.','24900000-8',5,'2026-01-15',NULL,NULL,NULL,NULL,NULL,NULL,'desarrollo_software','PT',1,'baja',NULL,1,'Entretenimiento','Crear reproductor de música.','Interfaz, lista de canciones.','Sin metodología definida.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(20,'Investigación sobre Blockchain en Salud','Estudio sobre el uso de tecnología blockchain para asegurar historiales clínicos en hospitales públicos chilenos.','25500000-3',1,'2026-03-01',NULL,NULL,NULL,NULL,NULL,NULL,'investigacion','PT',1,'alta',NULL,2,'Blockchain y Salud','Investigar la viabilidad de blockchain para proteger historiales clínicos.','Revisión bibliográfica, análisis de casos, propuesta de arquitectura.','Metodología de investigación sistemática.',NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:18:06'),(21,'Anteproyecto Bonito','OtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtsea','26100000-1',4,'2026-03-10','2026-03-10 16:15:14','2026-03-10',9,'1773158933265-90303636.pdf','uncharter.pdf',1,'desarrollo_software','PT',1,'media',NULL,2,'','','','',NULL,NULL,'2026-03-10 16:08:53','2026-03-10 16:15:14'),(22,'Proyecto weno weno','Esto es un proyecto wenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenoweno wenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenoweno','20695510-4',4,'2026-03-10','2026-03-11 00:04:01','2026-03-11',10,'1773186531891-244504689.pdf','Fundo el Peumo - BÃ­o BÃ­o02Marzo.pdf',1,'desarrollo_software','PT',1,'media',NULL,1,'','','','',NULL,NULL,'2026-03-10 23:48:51','2026-03-11 00:04:01'),(23,'prueba video para defensa de proyecto de titulo','esta es una prueba para ver si todo sale bien en la defensa de titulo, ','11111111-1',4,'2026-03-23','2026-03-23 01:35:25','2026-03-23',11,'1774229490299-345130861.pdf','ExportedClientDocument-4.pdf',1,'desarrollo_software','PT',1,'media',NULL,1,'','','','',NULL,NULL,'2026-03-23 01:31:30','2026-03-23 01:35:25');
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
  `estado_detallado` enum('inicializacion','planificacion','desarrollo_fase1','desarrollo_fase2','testing','documentacion','revision_final','preparacion_defensa','defendido','cerrado','avance_con_nota','informe_final','defensa_titulo','tramites_finales','acta_secretaria','verificar_deudas','biblioteca_formularios','avance1_ap','defensa_tema_ap','avance2_ap','final_ap') DEFAULT 'inicializacion',
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
  `tipo_proyecto` enum('PT','AP') NOT NULL DEFAULT 'PT',
  `continua_ap` tinyint(1) NOT NULL DEFAULT '0',
  `ap_origen_id` int DEFAULT NULL,
  `semestre_id` int DEFAULT NULL,
  `resultado` enum('en_curso','aprobado','reprobado','retirado') DEFAULT 'en_curso',
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
  KEY `fk_ap_origen` (`ap_origen_id`),
  KEY `fk_proyectos_semestre` (`semestre_id`),
  CONSTRAINT `fk_ap_origen` FOREIGN KEY (`ap_origen_id`) REFERENCES `proyectos` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_proyectos_semestre` FOREIGN KEY (`semestre_id`) REFERENCES `semestres` (`id`),
  CONSTRAINT `proyectos_ibfk_1` FOREIGN KEY (`propuesta_id`) REFERENCES `propuestas` (`id`),
  CONSTRAINT `proyectos_ibfk_2` FOREIGN KEY (`estudiante_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `proyectos_ibfk_3` FOREIGN KEY (`estado_id`) REFERENCES `estados_proyectos` (`id`),
  CONSTRAINT `proyectos_chk_1` CHECK (((`porcentaje_avance` >= 0) and (`porcentaje_avance` <= 100)))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proyectos`
--

LOCK TABLES `proyectos` WRITE;
/*!40000 ALTER TABLE `proyectos` DISABLE KEYS */;
INSERT INTO `proyectos` VALUES (1,'Sistema de Gestión de Titulaciones Web','Plataforma web integral para la gestión del proceso de titulación universitaria.',1,'20111111-1',2,'2025-07-01','2026-02-28',NULL,NULL,'Desarrollar un sistema web integral para la gestión del proceso de titulación universitaria.',NULL,NULL,NULL,NULL,65.00,'desarrollo_fase2','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-03-01',30,60,0,NULL,'desarrollo_software','PT',0,NULL,NULL,'en_curso','alta',2,'1.0','2026-03-04 12:20:43',1,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(2,'App Móvil de Monitoreo de Cultivos','Aplicación móvil para agricultores con monitoreo IoT en tiempo real.',2,'20333333-3',2,'2025-07-15','2026-03-15',NULL,NULL,'Desarrollar app móvil para monitoreo agrícola con sensores IoT.',NULL,NULL,NULL,NULL,45.00,'desarrollo_fase1','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-28',30,60,0,NULL,'desarrollo_software','PT',0,NULL,NULL,'en_curso','alta',2,'1.0','2026-03-04 12:20:43',1,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(3,'Plataforma E-learning Adaptativa','Sistema de aprendizaje en línea con personalización basada en ML.',3,'20555555-5',2,'2025-08-01','2026-04-15',NULL,NULL,'Crear plataforma e-learning con personalización basada en ML.',NULL,NULL,NULL,NULL,30.00,'planificacion','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-25',30,60,0,NULL,'desarrollo_software','PT',0,NULL,NULL,'en_curso','alta',2,'1.0','2026-03-04 12:20:43',1,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,'Sistema de Inventario con QR','Gestión de inventario para PYMES con códigos QR y alertas automáticas.',4,'20777777-7',2,'2025-08-10','2026-03-30',NULL,NULL,'Automatizar gestión de inventario para PYMES mediante códigos QR.',NULL,NULL,NULL,NULL,70.00,'testing','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-03-02',30,60,0,NULL,'desarrollo_software','PT',0,NULL,NULL,'en_curso','media',1,'1.0','2026-03-04 12:20:43',1,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(5,'Chatbot de Atención Ciudadana','Bot inteligente con NLP para municipalidades.',5,'20999999-9',2,'2025-08-15','2026-04-30',NULL,NULL,'Desarrollar chatbot con NLP para atención ciudadana municipal.',NULL,NULL,NULL,NULL,50.00,'desarrollo_fase2','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-28',30,60,0,NULL,'desarrollo_software','PT',0,NULL,NULL,'en_curso','alta',2,'1.0','2026-03-04 12:20:43',1,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,'Plataforma de Telemedicina Rural','Sistema de teleconsultas para zonas rurales con video adaptativo.',6,'23111111-1',2,'2025-09-01','2026-05-28',NULL,NULL,'Facilitar acceso a atención médica en zonas rurales mediante telemedicina.',NULL,NULL,NULL,NULL,25.00,'planificacion','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-20',30,60,1,'2026-03-23 00:00:02','desarrollo_software','PT',0,NULL,NULL,'en_curso','alta',2,'1.0','2026-03-23 00:00:02',1,'2026-03-03 18:36:30','2026-03-23 00:00:02'),(7,'Sistema de Control de Acceso Biométrico','Control de acceso con reconocimiento facial para empresas medianas.',7,'23333333-3',2,'2025-09-10','2026-05-28',NULL,NULL,'Implementar control de acceso biométrico basado en reconocimiento facial.',NULL,NULL,NULL,NULL,40.00,'desarrollo_fase1','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-02-22',30,60,0,NULL,'desarrollo_software','PT',0,NULL,NULL,'en_curso','alta',1,'1.0','2026-03-04 12:20:43',1,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(8,'App de Transporte Compartido Universitario','App de carpooling para estudiantes universitarios.',8,'23555555-5',2,'2025-09-20','2026-04-30',NULL,NULL,'Reducir costos de transporte estudiantil mediante app de carpooling.',NULL,NULL,NULL,NULL,55.00,'desarrollo_fase2','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-03-01',30,60,0,NULL,'desarrollo_software','PT',0,NULL,NULL,'en_curso','media',1,'1.0','2026-03-04 12:20:43',1,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(9,'Anteproyecto Bonito','OtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtseaOtsea',21,'26100000-1',1,'2026-03-10',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,'inicializacion','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-03-10',30,60,0,NULL,'desarrollo_software','PT',0,NULL,1,'en_curso','media',1,'1.0','2026-03-10 16:55:37',1,'2026-03-10 16:15:14','2026-03-10 16:55:37'),(10,'Proyecto weno weno','Esto es un proyecto wenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenoweno wenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenowenoweno',22,'20695510-4',1,'2026-03-11',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,'inicializacion','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-03-11',30,60,0,NULL,'desarrollo_software','PT',0,NULL,1,'aprobado','media',1,'1.0','2026-03-11 00:30:18',1,'2026-03-11 00:04:01','2026-03-11 00:30:18'),(11,'prueba video para defensa de proyecto de titulo','esta es una prueba para ver si todo sale bien en la defensa de titulo, ',23,'11111111-1',1,'2026-03-23',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0.00,'inicializacion','media','medio',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,'2026-03-23',30,60,0,NULL,'desarrollo_software','PT',0,NULL,1,'en_curso','media',1,'1.0','2026-03-23 01:39:00',1,'2026-03-23 01:35:25','2026-03-23 01:39:00');
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
  `observaciones_finales` text COLLATE utf8mb4_unicode_ci,
  `recomendaciones` text COLLATE utf8mb4_unicode_ci,
  `areas_destacadas` text COLLATE utf8mb4_unicode_ci,
  `documento_final` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta al documento final aprobado',
  `acta_aprobacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ruta al acta de aprobación',
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reuniones_calendario`
--

LOCK TABLES `reuniones_calendario` WRITE;
/*!40000 ALTER TABLE `reuniones_calendario` DISABLE KEYS */;
INSERT INTO `reuniones_calendario` VALUES (1,1,1,'10111111-1','20111111-1','2025-08-10','10:00:00','11:00:00','revision_avance','Revisión DB - P1','Revisión del modelo de base de datos','Sala DSI-301','presencial',NULL,'realizada',NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(2,2,1,'10111111-1','20111111-1','2025-10-05','10:00:00','11:00:00','revision_avance','Revisión Backend - P1','Revisión del avance del backend','Sala DSI-301','presencial',NULL,'realizada',NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(3,3,1,'10111111-1','20111111-1','2026-01-01','11:00:00','12:30:00','revision_avance','Revisión Integración - P1','Integración frontend-backend','Microsoft Teams','virtual',NULL,'realizada',NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,4,2,'10222222-2','20333333-3','2025-09-05','09:00:00','10:00:00','revision_avance','Revisión Arquitectura - P2','Arquitectura IoT del sistema','Sala DSI-302','presencial',NULL,'realizada',NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(5,5,4,'10444444-4','20777777-7','2025-09-20','14:00:00','15:00:00','revision_avance','Validación Requerimientos - P4','Validación con PYME piloto','Empresa piloto','presencial',NULL,'realizada',NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,6,4,'10444444-4','20777777-7','2025-11-10','14:00:00','15:00:00','revision_avance','Demo QR - P4','Demostración módulo QR','Sala DSI-303','presencial',NULL,'realizada',NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(7,7,7,'10777777-7','23333333-3','2025-11-01','11:00:00','12:00:00','revision_avance','Análisis Tecnológico - P7','Análisis de tecnologías de reconocimiento facial','Sala DSI-301','presencial',NULL,'realizada',NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(8,8,8,'10888888-8','23555555-5','2025-11-10','15:00:00','16:00:00','revision_avance','Revisión UX - P8','Revisión de prototipos UX de la app','Sala DSI-302','presencial',NULL,'realizada',NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43');
/*!40000 ALTER TABLE `reuniones_calendario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revisiones_informante`
--

DROP TABLE IF EXISTS `revisiones_informante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revisiones_informante` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hito_id` int NOT NULL,
  `proyecto_id` int NOT NULL,
  `informante_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `comentarios` text,
  `calificacion` decimal(3,1) DEFAULT NULL,
  `archivo_retroalimentacion` varchar(255) DEFAULT NULL,
  `nombre_archivo_retroalimentacion` varchar(255) DEFAULT NULL,
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_hito_informante` (`hito_id`,`informante_rut`),
  KEY `proyecto_id` (`proyecto_id`),
  KEY `idx_informante_estado` (`informante_rut`,`estado`),
  CONSTRAINT `revisiones_informante_ibfk_1` FOREIGN KEY (`hito_id`) REFERENCES `hitos_cronograma` (`id`) ON DELETE CASCADE,
  CONSTRAINT `revisiones_informante_ibfk_2` FOREIGN KEY (`proyecto_id`) REFERENCES `proyectos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `revisiones_informante_ibfk_3` FOREIGN KEY (`informante_rut`) REFERENCES `usuarios` (`rut`),
  CONSTRAINT `revisiones_informante_chk_1` CHECK (((`calificacion` >= 1.0) and (`calificacion` <= 7.0)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revisiones_informante`
--

LOCK TABLES `revisiones_informante` WRITE;
/*!40000 ALTER TABLE `revisiones_informante` DISABLE KEYS */;
INSERT INTO `revisiones_informante` VALUES (1,18,10,'10222222-2','rechazado','xddd',NULL,'1773188763326-759194007.pdf','ASIO4ALL v2 Instruction Manual.pdf','2026-03-11 00:26:03','2026-03-11 00:24:48','2026-03-11 00:26:03'),(2,22,10,'10222222-2','aprobado','prueba',NULL,NULL,NULL,'2026-03-11 09:55:13','2026-03-11 09:42:40','2026-03-11 09:55:13');
/*!40000 ALTER TABLE `revisiones_informante` ENABLE KEYS */;
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
INSERT INTO `roles` VALUES (1,'estudiante','Estudiante que desarrolla el proyecto de t�tulo','2026-03-03 17:28:57','2026-03-03 17:28:57'),(2,'profesor','Profesor que gu�a o revisa proyectos de t�tulo','2026-03-03 17:28:57','2026-03-03 17:28:57'),(3,'admin','Administrador del sistema','2026-03-03 17:28:57','2026-03-03 17:28:57'),(4,'superadmin','Administrador con permisos totales del sistema','2026-03-03 17:28:57','2026-03-03 17:28:57');
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_profesores`
--

LOCK TABLES `roles_profesores` WRITE;
/*!40000 ALTER TABLE `roles_profesores` DISABLE KEYS */;
INSERT INTO `roles_profesores` VALUES (1,'Profesor Revisor','Evalúa y revisa la propuesta inicial','2026-03-03 17:28:57'),(2,'Profesor Guía','Guía principal del proyecto de titulación','2026-03-03 17:28:57'),(3,'Profesor de Sala','Participa en la defensa oral (solo ICINF)','2026-03-03 17:28:57'),(4,'Profesor Informante','Profesor informante que apoya el proyecto','2026-03-03 17:28:57');
/*!40000 ALTER TABLE `roles_profesores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `semestres`
--

DROP TABLE IF EXISTS `semestres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semestres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `año` int NOT NULL,
  `numero` tinyint NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `chk_semestre_num` CHECK ((`numero` in (1,2)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semestres`
--

LOCK TABLES `semestres` WRITE;
/*!40000 ALTER TABLE `semestres` DISABLE KEYS */;
INSERT INTO `semestres` VALUES (1,'2026-1',2026,1,'2026-03-09','2026-07-15',1,'2026-03-09 18:09:32','2026-03-09 18:12:09'),(2,'2026-2',2026,2,'2026-04-22','2026-06-18',0,'2026-03-09 18:10:31','2026-03-09 18:12:09'),(3,'2025-2',2025,2,'2025-08-04','2026-03-06',0,'2026-03-09 18:13:03','2026-03-09 18:13:03');
/*!40000 ALTER TABLE `semestres` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_reunion`
--

LOCK TABLES `solicitudes_reunion` WRITE;
/*!40000 ALTER TABLE `solicitudes_reunion` DISABLE KEYS */;
INSERT INTO `solicitudes_reunion` VALUES (1,1,'10111111-1','20111111-1','2025-08-10','10:00:00',60,'revision_avance','Revisión del diseño de base de datos','confirmada','profesor',NULL,NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(2,1,'10111111-1','20111111-1','2025-10-05','10:00:00',60,'revision_avance','Revisión del avance del backend','confirmada','profesor',NULL,NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(3,1,'10111111-1','20111111-1','2026-01-01','11:00:00',90,'revision_avance','Revisión integración frontend-backend','confirmada','sistema',NULL,NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(4,2,'10222222-2','20333333-3','2025-09-05','09:00:00',60,'revision_avance','Revisión arquitectura IoT','confirmada','profesor',NULL,NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(5,4,'10444444-4','20777777-7','2025-09-20','14:00:00',60,'revision_avance','Validación de requerimientos con PYME','confirmada','sistema',NULL,NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(6,4,'10444444-4','20777777-7','2025-11-10','14:00:00',60,'revision_avance','Demo módulo QR','confirmada','sistema',NULL,NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(7,7,'10777777-7','23333333-3','2025-11-01','11:00:00',60,'revision_avance','Presentación análisis tecnológico','confirmada','profesor',NULL,NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43'),(8,8,'10888888-8','23555555-5','2025-11-10','15:00:00',60,'revision_avance','Revisión prototipos UX','confirmada','profesor',NULL,NULL,NULL,NULL,'2026-03-03 18:36:30','2026-03-04 12:20:43');
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
INSERT INTO `usuarios` VALUES ('1000000-9','Otakin','tomy@ubiobio.cl','$2b$10$87cHptPO.mF3nnp8w8OGX.SkpHnR9hYMPFri2jktR.OdwHhjvkIm.',2,0,0,'2026-03-10 15:44:44','2026-03-10 15:44:44'),('10111111-1','Carlos Mendoza Rojas','cmendoza@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('10222222-2','Ana Pérez Fuentes','aperez@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('10333333-3','Roberto Silva Vega','rsilva@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('10444444-4','María Torres Campos','mtorres@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('10555555-5','Javier Morales Soto','jmorales@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('10666666-6','Patricia Vargas Núñez','pvargas@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('10777777-7','Diego Castillo Ríos','dcastillo@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('10888888-8','Claudia Espinoza Mena','cespinoza@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('10999999-9','Fernando Muñoz Lagos','fmunoz@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('11000000-0','Valentina Reyes Paredes','vreyes@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('11100000-K','Andrés Gutiérrez Leal','agutierrez@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('11111111-1','Usuario Estudiante','estudiante@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 17:28:57','2026-03-09 18:44:50'),('11200000-1','Sandra Flores Ibarra','sflores@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('11300000-2','Rodrigo Navarro Cisternas','rnavarro@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('11400000-3','Camila Herrera Bravo','cherrera@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('11500000-4','Marcelo Contreras Pino','mcontreras@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('11600000-5','Isabel Ramírez Donoso','iramirez@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('11700000-6','Pablo Sepúlveda Araya','psepulveda@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('12111111-1','Luisa Fernanda Rojas Andrade','lrojas@ubiobio.cl','$2b$10$4GkiOUfTTSRMSeL2bf5lMuxGpjxOxD9UzzEU2g/GgtkQdzvbX6K4i',2,1,0,'2026-03-11 17:45:31','2026-03-11 17:46:58'),('12200000-2','Alejandra Beatriz Rojas Carvajal','arojas@ubiobio.cl','$2b$10$gsdkS3PnftdCFC3Xy0gJTerBHkcCCs0zKwLNS8OxyeuaASVcaIzM.',2,1,0,'2026-03-10 15:10:57','2026-03-10 15:10:57'),('12222222-2','Tomás Ignacio Peña Carrasco','tpena@ubiobio.cl','$2b$10$4GkiOUfTTSRMSeL2bf5lMuxGpjxOxD9UzzEU2g/GgtkQdzvbX6K4i',2,1,0,'2026-03-11 17:45:31','2026-03-11 17:46:58'),('12300000-3','Mauricio Felipe Salinas Peña','msalinas@ubiobio.cl','$2b$10$gsdkS3PnftdCFC3Xy0gJTerBHkcCCs0zKwLNS8OxyeuaASVcaIzM.',2,1,0,'2026-03-10 15:11:02','2026-03-10 15:11:02'),('12333333-3','Sofía Beatriz Lagos Moya','slagos@ubiobio.cl','$2b$10$4GkiOUfTTSRMSeL2bf5lMuxGpjxOxD9UzzEU2g/GgtkQdzvbX6K4i',2,1,0,'2026-03-11 17:45:31','2026-03-11 17:46:58'),('20111111-1','Alejandro Muñoz Pérez','amunioz.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('20222222-2','Bastián Riquelme Soto','briquelme.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('20333333-3','Camilo Fuentes Lagos','cfuentes.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('20444444-4','Daniela Vega Contreras','dvega.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('20555555-5','Emilio Torres Bravo','etorres.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('20666666-6','Fernanda Silva Núñez','fsilva.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('20695510-4','daniel aguayo','daniel.aguayo2001@alumnos.ubiobio.cl','$2b$10$LJ1.8uCKTagVjRh1wf5lbugD.3Tw5tYUFBdl62RdZkXUVioqOXJNa',1,1,0,'2026-03-10 23:42:41','2026-03-10 23:43:13'),('20777777-7','Gabriel Morales Rojas','gmorales.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('20888888-8','Héctor Castillo Mena','hcastillo.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('20999999-9','Ignacio Espinoza Paredes','iespinoza.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('21000000-0','Javiera Reyes Ibarra','jreyes.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('21100000-K','Kevin Gutiérrez Cisternas','kgutierrez.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('21200000-1','Laura Herrera Donoso','lherrera.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('21300000-2','Matías Navarro Pino','mnavarro.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('21400000-3','Nicole Contreras Araya','ncontreras.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('21500000-4','Osvaldo Ramírez Leal','oramirez.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('21600000-5','Paula Sepúlveda Flores','psepulveda.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('21700000-6','Quintín Vargas Lagos','qvargas.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('21800000-7','Rocío Muñoz Torres','rmunoz.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('21900000-8','Sebastián Riquelme Vega','sriquelme.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('22000000-9','Tamara Fuentes Silva','tfuentes.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('22100000-K','Ulises Torres Morales','utorres.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('22200000-0','Valentina Vega Castillo','vvega.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('22222222-2','Usuario Profesor','profesor@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',2,1,0,'2026-03-03 17:28:57','2026-03-03 18:47:58'),('22300000-1','Wilson Espinoza Reyes','wespinoza.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('22400000-2','Ximena Gutiérrez Navarro','xgutierrez.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('22500000-3','Yolanda Herrera Contreras','yherrera.ici@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('23111111-1','Aaron Ramírez Sepúlveda','aramirez.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-04 13:08:00'),('23222222-2','Bárbara Vargas Muñoz','bvargas.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('23333333-3','César Fuentes Riquelme','cfuentes.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('23444444-4','Dania Torres Lagos','dtorres.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('23555555-5','Ernesto Silva Bravo','esilva.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('23666666-6','Fiorella Morales Núñez','fmorales.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('23777777-7','Gonzalo Castillo Rojas','gcastillo.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('23888888-8','Hilda Espinoza Mena','hespinoza.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('23999999-9','Iván Reyes Paredes','ireyes.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('24000000-0','Josefa Gutiérrez Ibarra','jgutierrez.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('24100000-K','Karina Herrera Cisternas','kherrera.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('24200000-1','Lorenzo Navarro Donoso','lnavarro.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('24300000-2','Mónica Contreras Pino','mcontreras.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('24400000-3','Nicolás Ramírez Araya','nramirez.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('24500000-4','Olga Sepúlveda Leal','osepulveda.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('24600000-5','Pedro Vargas Flores','pvargas.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('24700000-6','Quesia Muñoz Torres','qmunoz.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('24800000-7','Renato Riquelme Vega','rriquelme.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('24900000-8','Sofía Fuentes Silva','sfuentes.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('25000000-9','Tomás Torres Morales','ttorres.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('25100000-K','Úrsula Vega Castillo','uvega.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('25200000-0','Vicente Espinoza Reyes','vespinoza.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('25300000-1','Wanda Gutiérrez Navarro','wgutierrez.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('25400000-2','Xenia Herrera Contreras','xherrera.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('25500000-3','Yerlan Ramírez Sepúlveda','yramirez.ieci@alumnos.ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',1,1,0,'2026-03-03 18:36:30','2026-03-03 18:47:58'),('26100000-1','Tomás Alejandro Bravo Soto','tbravo.ici@alumnos.ubiobio.cl','$2b$10$gsdkS3PnftdCFC3Xy0gJTerBHkcCCs0zKwLNS8OxyeuaASVcaIzM.',1,1,0,'2026-03-10 15:03:42','2026-03-10 15:03:42'),('26111111-1','Mateo Andrés Cifuentes Vera','mcifuentes.ici@alumnos.ubiobio.cl','$2b$10$4GkiOUfTTSRMSeL2bf5lMuxGpjxOxD9UzzEU2g/GgtkQdzvbX6K4i',1,1,0,'2026-03-11 17:45:31','2026-03-11 17:46:58'),('27384550-K','17343944-3','lcabrera@ubiobio.cl','$2b$10$/G2vkTvNeBvgmse0BIc7p.sZo5.B.Q2CugmaENsmbE/h/aDTxP1.C',2,1,0,'2026-03-10 15:41:02','2026-03-10 15:47:14'),('33333333-3','Usuario Admin','admin@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',3,1,0,'2026-03-03 17:28:57','2026-03-03 18:47:58'),('44444444-4','Usuario SuperAdmin','superadmin@ubiobio.cl','$2b$10$hq3o2RpmrzE.fZ2/Zb.Bo.b89kx/hr0Zwi1e.U0CmE5pnsWZx59g2',4,1,0,'2026-03-03 17:28:57','2026-03-03 18:47:58'),('9999999-3','Juan Edgardo','correo@ubiobio.cl','$2b$10$yNId6qLXeMr7KQYOiMvXV.m9X9fiZJC8JQJpto5i22Syf9IGytW3K',2,0,0,'2026-03-10 15:31:51','2026-03-10 15:31:51');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_solicitudes_pendientes`
--

DROP TABLE IF EXISTS `v_solicitudes_pendientes`;
/*!50001 DROP VIEW IF EXISTS `v_solicitudes_pendientes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_solicitudes_pendientes` AS SELECT 
 1 AS `id`,
 1 AS `proyecto_id`,
 1 AS `profesor_rut`,
 1 AS `estudiante_rut`,
 1 AS `fecha_propuesta`,
 1 AS `hora_propuesta`,
 1 AS `duracion_minutos`,
 1 AS `tipo_reunion`,
 1 AS `descripcion`,
 1 AS `estado`,
 1 AS `creado_por`,
 1 AS `fecha_respuesta_profesor`,
 1 AS `comentarios_profesor`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `proyecto_titulo`,
 1 AS `estudiante_nombre`*/;
SET character_set_client = @saved_cs_client;

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
  `descripcion_cambios` text COLLATE utf8mb4_unicode_ci COMMENT 'Qué se modificó en esta versión',
  `cambios_principales` text COLLATE utf8mb4_unicode_ci COMMENT 'Lista de cambios principales',
  `autor_rut` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `autor_rol` enum('estudiante','profesor_guia','profesor_asignatura','admin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `comentarios_generales` text COLLATE utf8mb4_unicode_ci COMMENT 'Comentarios generales sobre esta versión',
  `estado` enum('borrador','enviado','en_revision','revisado','aprobado','rechazado') COLLATE utf8mb4_unicode_ci DEFAULT 'enviado',
  `requiere_correccion` tinyint(1) DEFAULT '0',
  `es_version_final` tinyint(1) DEFAULT '0' COMMENT 'Marca si es la versión final aprobada',
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
-- Final view structure for view `v_solicitudes_pendientes`
--

/*!50001 DROP VIEW IF EXISTS `v_solicitudes_pendientes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`actitubb`@`127.0.0.1` SQL SECURITY DEFINER */
/*!50001 VIEW `v_solicitudes_pendientes` AS select `sr`.`id` AS `id`,`sr`.`proyecto_id` AS `proyecto_id`,`sr`.`profesor_rut` AS `profesor_rut`,`sr`.`estudiante_rut` AS `estudiante_rut`,date_format(`sr`.`fecha_propuesta`,'%Y-%m-%d') AS `fecha_propuesta`,`sr`.`hora_propuesta` AS `hora_propuesta`,`sr`.`duracion_minutos` AS `duracion_minutos`,`sr`.`tipo_reunion` AS `tipo_reunion`,`sr`.`descripcion` AS `descripcion`,`sr`.`estado` AS `estado`,`sr`.`creado_por` AS `creado_por`,`sr`.`fecha_respuesta_profesor` AS `fecha_respuesta_profesor`,`sr`.`comentarios_profesor` AS `comentarios_profesor`,`sr`.`created_at` AS `created_at`,`sr`.`updated_at` AS `updated_at`,`p`.`titulo` AS `proyecto_titulo`,`ue`.`nombre` AS `estudiante_nombre` from ((`solicitudes_reunion` `sr` join `proyectos` `p` on((`sr`.`proyecto_id` = `p`.`id`))) join `usuarios` `ue` on((`sr`.`estudiante_rut` = `ue`.`rut`))) where (`sr`.`estado` = 'pendiente') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

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
/*!50013 DEFINER=`actitubb`@`127.0.0.1` SQL SECURITY DEFINER */
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
/*!50013 DEFINER=`actitubb`@`127.0.0.1` SQL SECURITY DEFINER */
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
/*!50013 DEFINER=`actitubb`@`127.0.0.1` SQL SECURITY DEFINER */
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
/*!50013 DEFINER=`actitubb`@`127.0.0.1` SQL SECURITY DEFINER */
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
/*!50013 DEFINER=`actitubb`@`127.0.0.1` SQL SECURITY DEFINER */
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
/*!50013 DEFINER=`actitubb`@`127.0.0.1` SQL SECURITY DEFINER */
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

-- Dump completed on 2026-03-23  2:00:03
