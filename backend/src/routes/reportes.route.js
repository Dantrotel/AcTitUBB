// Rutas de Reportes
import express from 'express';
import * as reportesController from '../controllers/reportes.controller.js';
import { verifySession } from '../middlewares/verifySession.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifySession);

// Generar reporte de cumplimiento por carrera (PDF)
router.get('/cumplimiento-carrera', reportesController.generarReporteCumplimientoCarrera);

// Generar reporte de carga docente (Excel)
router.get('/carga-docente', reportesController.generarReporteCargaDocente);

// Generar reporte de proyectos finalizados (Excel)
router.get('/proyectos-finalizados', reportesController.generarReporteProyectosFinalizados);

// Obtener datos para gráficos de tendencias
router.get('/tendencias', reportesController.obtenerDatosTendencias);

export default router;
