// Servicio de Reportes - Generación de reportes en PDF y Excel
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { pool } from '../db/connectionDB.js';
import logger from '../config/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generar reporte de cumplimiento por carrera en PDF
 */
export const generarReporteCumplimientoCarreraPDF = async (carreraId = null) => {
  try {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));

    // Encabezado
    doc.fontSize(20).text('Reporte de Cumplimiento por Carrera', { align: 'center' });
    doc.fontSize(10).text(`Fecha: ${new Date().toLocaleDateString('es-CL')}`, { align: 'center' });
    doc.moveDown(2);

    // Obtener datos
    const whereClause = carreraId ? `WHERE c.id_carrera = ${carreraId}` : '';
    const [carreras] = await pool.execute(`
      SELECT 
        c.nombre_carrera,
        COUNT(DISTINCT p.id) as total_proyectos,
        SUM(CASE WHEN p.estado_detallado IN ('defendido', 'cerrado') THEN 1 ELSE 0 END) as proyectos_finalizados,
        SUM(CASE WHEN p.riesgo_nivel = 'alto' THEN 1 ELSE 0 END) as proyectos_riesgo,
        AVG(p.porcentaje_avance) as avance_promedio,
        COUNT(DISTINCT prop.id) as total_propuestas,
        SUM(CASE WHEN prop.estado_id = 2 THEN 1 ELSE 0 END) as propuestas_aprobadas
      FROM carreras c
      LEFT JOIN estudiantes e ON e.carrera_id = c.id_carrera
      LEFT JOIN proyectos p ON p.estudiante_rut = e.id_usuario
      LEFT JOIN propuestas prop ON prop.estudiante_rut = e.id_usuario
      ${whereClause}
      GROUP BY c.id_carrera
      ORDER BY c.nombre_carrera
    `);

    // Tabla de datos
    doc.fontSize(14).text('Estadísticas por Carrera', { underline: true });
    doc.moveDown();

    carreras.forEach((carrera, index) => {
      const cumplimiento = carrera.total_proyectos > 0 
        ? ((carrera.proyectos_finalizados / carrera.total_proyectos) * 100).toFixed(1)
        : 0;

      doc.fontSize(12).text(`${index + 1}. ${carrera.nombre_carrera}`, { bold: true });
      doc.fontSize(10)
        .text(`   Total Proyectos: ${carrera.total_proyectos}`)
        .text(`   Finalizados: ${carrera.proyectos_finalizados} (${cumplimiento}%)`)
        .text(`   En Riesgo: ${carrera.proyectos_riesgo}`)
        .text(`   Avance Promedio: ${parseFloat(carrera.avance_promedio || 0).toFixed(1)}%`)
        .text(`   Propuestas Aprobadas: ${carrera.propuestas_aprobadas}/${carrera.total_propuestas}`);
      doc.moveDown();

      // Nueva página cada 5 carreras
      if ((index + 1) % 5 === 0 && index < carreras.length - 1) {
        doc.addPage();
      }
    });

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', reject);
    });
  } catch (error) {
    logger.error('Error generando reporte PDF:', error);
    throw error;
  }
};

/**
 * Generar reporte de carga docente en Excel
 */
export const generarReporteCargaDocenteExcel = async () => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Carga Docente');

    // Configurar columnas
    worksheet.columns = [
      { header: 'RUT Profesor', key: 'rut', width: 15 },
      { header: 'Nombre Completo', key: 'nombre', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'Total Proyectos', key: 'total_proyectos', width: 15 },
      { header: 'Como Guía', key: 'como_guia', width: 12 },
      { header: 'Como Informante', key: 'como_informante', width: 15 },
      { header: 'Como Co-guía', key: 'como_coguia', width: 12 },
      { header: 'Estado Carga', key: 'estado_carga', width: 15 }
    ];

    // Estilo del encabezado
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Obtener datos
    const [profesores] = await pool.execute(`
      SELECT 
        u.rut,
        CONCAT(u.nombre, ' ', u.apellidos) as nombre_completo,
        u.email,
        d.nombre_departamento,
        COUNT(DISTINCT ap.proyecto_id) as total_proyectos,
        SUM(CASE WHEN rp.nombre = 'Profesor Guía' THEN 1 ELSE 0 END) as como_guia,
        SUM(CASE WHEN rp.nombre = 'Profesor Informante' THEN 1 ELSE 0 END) as como_informante,
        SUM(CASE WHEN rp.nombre = 'Profesor Co-guía' THEN 1 ELSE 0 END) as como_coguia
      FROM usuarios u
      LEFT JOIN profesores_departamentos pd ON pd.profesor_rut = u.rut
      LEFT JOIN departamentos d ON d.id_departamento = pd.departamento_id
      LEFT JOIN asignaciones_proyectos ap ON ap.profesor_rut = u.rut AND ap.activo = TRUE
      LEFT JOIN roles_profesores rp ON rp.id = ap.rol_profesor_id
      WHERE u.rol_id IN (2, 3)
      GROUP BY u.rut
      ORDER BY total_proyectos DESC, nombre_completo
    `);

    // Agregar filas
    profesores.forEach(profesor => {
      const estadoCarga = profesor.total_proyectos > 5 ? 'SOBRECARGADO' :
                         profesor.total_proyectos > 3 ? 'ALTO' :
                         profesor.total_proyectos > 0 ? 'NORMAL' : 'SIN CARGA';

      worksheet.addRow({
        rut: profesor.rut,
        nombre: profesor.nombre_completo,
        email: profesor.email,
        departamento: profesor.nombre_departamento || 'Sin departamento',
        total_proyectos: profesor.total_proyectos,
        como_guia: profesor.como_guia,
        como_informante: profesor.como_informante,
        como_coguia: profesor.como_coguia,
        estado_carga: estadoCarga
      });
    });

    // Colorear según estado de carga
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header
        const estadoCarga = row.getCell('estado_carga').value;
        let fillColor = 'FFFFFFFF';
        
        if (estadoCarga === 'SOBRECARGADO') fillColor = 'FFFF6B6B';
        else if (estadoCarga === 'ALTO') fillColor = 'FFFFD93D';
        else if (estadoCarga === 'NORMAL') fillColor = 'FF6BCF7F';
        
        row.getCell('estado_carga').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: fillColor }
        };
      }
    });

    // Agregar resumen al final
    worksheet.addRow([]);
    worksheet.addRow(['RESUMEN GENERAL']);
    worksheet.addRow(['Total Profesores', profesores.length]);
    worksheet.addRow(['Profesores con Carga', profesores.filter(p => p.total_proyectos > 0).length]);
    worksheet.addRow(['Carga Promedio', (profesores.reduce((sum, p) => sum + p.total_proyectos, 0) / profesores.length).toFixed(2)]);

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    logger.error('Error generando reporte Excel:', error);
    throw error;
  }
};

/**
 * Generar reporte de historial de proyectos finalizados
 */
export const generarReporteProyectosFinalizadosExcel = async (fechaInicio, fechaFin) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Proyectos Finalizados');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Título', key: 'titulo', width: 40 },
      { header: 'Estudiante', key: 'estudiante', width: 30 },
      { header: 'Carrera', key: 'carrera', width: 30 },
      { header: 'Modalidad', key: 'modalidad', width: 15 },
      { header: 'Complejidad', key: 'complejidad', width: 12 },
      { header: 'Fecha Inicio', key: 'fecha_inicio', width: 12 },
      { header: 'Fecha Fin', key: 'fecha_fin', width: 12 },
      { header: 'Duración (días)', key: 'duracion', width: 15 },
      { header: 'Profesor Guía', key: 'profesor_guia', width: 30 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF28A745' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    const whereClause = fechaInicio && fechaFin 
      ? `AND p.fecha_entrega_real BETWEEN '${fechaInicio}' AND '${fechaFin}'`
      : '';

    const [proyectos] = await pool.execute(`
      SELECT 
        p.id,
        p.titulo,
        CONCAT(u.nombre, ' ', u.apellidos) as estudiante_nombre,
        c.nombre_carrera,
        p.modalidad,
        p.complejidad,
        p.fecha_inicio,
        p.fecha_entrega_real,
        DATEDIFF(p.fecha_entrega_real, p.fecha_inicio) as duracion_dias,
        CONCAT(ug.nombre, ' ', ug.apellidos) as profesor_guia
      FROM proyectos p
      INNER JOIN usuarios u ON p.estudiante_rut = u.rut
      INNER JOIN estudiantes e ON e.id_usuario = u.rut
      INNER JOIN carreras c ON c.id_carrera = e.carrera_id
      LEFT JOIN asignaciones_proyectos ap ON ap.proyecto_id = p.id AND ap.activo = TRUE
      LEFT JOIN roles_profesores rp ON rp.id = ap.rol_profesor_id AND rp.nombre = 'Profesor Guía'
      LEFT JOIN usuarios ug ON ug.rut = ap.profesor_rut
      WHERE p.estado_detallado IN ('defendido', 'cerrado')
      ${whereClause}
      ORDER BY p.fecha_entrega_real DESC
    `);

    proyectos.forEach(proyecto => {
      worksheet.addRow({
        id: proyecto.id,
        titulo: proyecto.titulo,
        estudiante: proyecto.estudiante_nombre,
        carrera: proyecto.nombre_carrera,
        modalidad: proyecto.modalidad,
        complejidad: proyecto.complejidad,
        fecha_inicio: proyecto.fecha_inicio,
        fecha_fin: proyecto.fecha_entrega_real,
        duracion: proyecto.duracion_dias,
        profesor_guia: proyecto.profesor_guia || 'No asignado'
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    logger.error('Error generando reporte de proyectos finalizados:', error);
    throw error;
  }
};

/**
 * Obtener datos para gráficos de tendencias
 */
export const obtenerDatosTendencias = async (mesesAtras = 6) => {
  try {
    const [propuestasPorMes] = await pool.execute(`
      SELECT 
        DATE_FORMAT(fecha_envio, '%Y-%m') as mes,
        COUNT(*) as total,
        SUM(CASE WHEN estado_id = 2 THEN 1 ELSE 0 END) as aprobadas,
        SUM(CASE WHEN estado_id = 3 THEN 1 ELSE 0 END) as rechazadas
      FROM propuestas
      WHERE fecha_envio >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY mes
      ORDER BY mes
    `, [mesesAtras]);

    const [proyectosPorMes] = await pool.execute(`
      SELECT 
        DATE_FORMAT(fecha_inicio, '%Y-%m') as mes,
        COUNT(*) as total_iniciados,
        SUM(CASE WHEN estado_detallado IN ('defendido', 'cerrado') THEN 1 ELSE 0 END) as finalizados
      FROM proyectos
      WHERE fecha_inicio >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY mes
      ORDER BY mes
    `, [mesesAtras]);

    return {
      propuestas: propuestasPorMes,
      proyectos: proyectosPorMes
    };
  } catch (error) {
    logger.error('Error obteniendo datos de tendencias:', error);
    throw error;
  }
};

export default {
  generarReporteCumplimientoCarreraPDF,
  generarReporteCargaDocenteExcel,
  generarReporteProyectosFinalizadosExcel,
  obtenerDatosTendencias
};
