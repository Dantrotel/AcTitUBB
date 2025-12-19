// Controlador de Reportes
import * as reportesService from '../services/reportes.service.js';
import logger from '../config/logger.js';

/**
 * Generar reporte de cumplimiento por carrera (PDF)
 */
export const generarReporteCumplimientoCarrera = async (req, res) => {
  try {
    const { carrera_id } = req.query;
    
    // Verificar que sea Admin o Super Admin
    if (![3, 4].includes(req.user.rol_id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const pdfBuffer = await reportesService.generarReporteCumplimientoCarreraPDF(carrera_id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-cumplimiento-${Date.now()}.pdf`);
    res.send(pdfBuffer);

    logger.info(`Reporte de cumplimiento generado por ${req.user.rut}`);
  } catch (error) {
    logger.error('Error generando reporte de cumplimiento:', error);
    res.status(500).json({ error: 'Error generando reporte', details: error.message });
  }
};

/**
 * Generar reporte de carga docente (Excel)
 */
export const generarReporteCargaDocente = async (req, res) => {
  try {
    // Verificar que sea Admin o Super Admin
    if (![3, 4].includes(req.user.rol_id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const excelBuffer = await reportesService.generarReporteCargaDocenteExcel();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-carga-docente-${Date.now()}.xlsx`);
    res.send(excelBuffer);

    logger.info(`Reporte de carga docente generado por ${req.user.rut}`);
  } catch (error) {
    logger.error('Error generando reporte de carga docente:', error);
    res.status(500).json({ error: 'Error generando reporte', details: error.message });
  }
};

/**
 * Generar reporte de proyectos finalizados (Excel)
 */
export const generarReporteProyectosFinalizados = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    // Verificar que sea Admin o Super Admin
    if (![3, 4].includes(req.user.rol_id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const excelBuffer = await reportesService.generarReporteProyectosFinalizadosExcel(fecha_inicio, fecha_fin);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=reporte-proyectos-finalizados-${Date.now()}.xlsx`);
    res.send(excelBuffer);

    logger.info(`Reporte de proyectos finalizados generado por ${req.user.rut}`);
  } catch (error) {
    logger.error('Error generando reporte de proyectos finalizados:', error);
    res.status(500).json({ error: 'Error generando reporte', details: error.message });
  }
};

/**
 * Obtener datos para gráficos de tendencias
 */
export const obtenerDatosTendencias = async (req, res) => {
  try {
    const { meses } = req.query;
    const mesesAtras = parseInt(meses) || 6;

    // Verificar que sea Admin o Super Admin
    if (![3, 4].includes(req.user.rol_id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const datos = await reportesService.obtenerDatosTendencias(mesesAtras);

    res.json({
      success: true,
      datos
    });
  } catch (error) {
    logger.error('Error obteniendo datos de tendencias:', error);
    res.status(500).json({ error: 'Error obteniendo datos', details: error.message });
  }
};

export default {
  generarReporteCumplimientoCarrera,
  generarReporteCargaDocente,
  generarReporteProyectosFinalizados,
  obtenerDatosTendencias
};
