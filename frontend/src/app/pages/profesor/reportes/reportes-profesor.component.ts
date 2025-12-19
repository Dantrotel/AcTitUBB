import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

interface MetricasProfesor {
  // Propuestas
  totalPropuestasRevisadas: number;
  propuestasAprobadas: number;
  propuestasRechazadas: number;
  propuestasPendientes: number;
  tiempoPromedioRevision: number;
  
  // Proyectos
  proyectosActivos: number;
  proyectosCompletados: number;
  proyectosPorRol: { [key: string]: number };
  
  // Reuniones
  totalReuniones: number;
  reunionesUltimoMes: number;
  horasReunionesTotal: number;
  
  // Carga Académica
  estudiantesAsignados: number;
  horasSemanalesEstimadas: number;
  
  // Fechas Importantes
  fechasProximas: number;
  fechasVencidas: number;
  
  // Disponibilidad
  horasDisponibilidadSemanal: number;
  porcentajeOcupacion: number;
}

interface ProyectoDetalle {
  id: number;
  titulo: string;
  estudiante_nombre: string;
  rol: string;
  estado: string;
  fecha_inicio: string;
  progreso: number;
}

interface PropuestaDetalle {
  id: number;
  titulo: string;
  estudiante_nombre: string;
  estado: string;
  fecha_revision: string;
  comentarios: string;
}

interface ReunionDetalle {
  id: number;
  proyecto_titulo: string;
  estudiante_nombre: string;
  fecha: string;
  duracion: number;
  tipo: string;
}

@Component({
  selector: 'app-reportes-profesor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes-profesor.component.html',
  styleUrls: ['./reportes-profesor.component.scss']
})
export class ReportesProfesorComponent implements OnInit {
  loading = true;
  metricas: MetricasProfesor | null = null;
  proyectos: ProyectoDetalle[] = [];
  propuestas: PropuestaDetalle[] = [];
  reuniones: ReunionDetalle[] = [];
  
  // Filtros
  periodoSeleccionado: 'mes' | 'trimestre' | 'semestre' | 'año' = 'mes';
  
  constructor(
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarReportes();
  }

  cargarReportes() {
    this.loading = true;
    console.log('🔄 Cargando reportes del profesor...');
    
    Promise.all([
      this.cargarMetricas(),
      this.cargarProyectos(),
      this.cargarPropuestas(),
      this.cargarReuniones()
    ]).then(() => {
      this.loading = false;
      this.cdr.detectChanges();
      console.log('✅ Reportes cargados');
    }).catch(error => {
      console.error('❌ Error al cargar reportes:', error);
      this.loading = false;
      this.cdr.detectChanges();
      this.notificationService.error('Error al cargar los reportes', 'Intenta de nuevo');
    });
  }

  async cargarMetricas() {
    try {
      const response = await this.apiService.getMetricasProfesor(this.periodoSeleccionado).toPromise();
      this.metricas = response.data || response;
      console.log('📊 Métricas:', this.metricas);
    } catch (error) {
      console.error('Error al cargar métricas:', error);
      // Datos de ejemplo si falla
      this.metricas = {
        totalPropuestasRevisadas: 0,
        propuestasAprobadas: 0,
        propuestasRechazadas: 0,
        propuestasPendientes: 0,
        tiempoPromedioRevision: 0,
        proyectosActivos: 0,
        proyectosCompletados: 0,
        proyectosPorRol: {},
        totalReuniones: 0,
        reunionesUltimoMes: 0,
        horasReunionesTotal: 0,
        estudiantesAsignados: 0,
        horasSemanalesEstimadas: 0,
        fechasProximas: 0,
        fechasVencidas: 0,
        horasDisponibilidadSemanal: 0,
        porcentajeOcupacion: 0
      };
    }
  }

  async cargarProyectos() {
    try {
      const response: any = await this.apiService.getProyectosAsignados().toPromise();
      const proyectosData = response?.projects || response?.data || [];
      this.proyectos = proyectosData.map((p: any) => ({
        id: p.id,
        titulo: p.titulo,
        estudiante_nombre: p.estudiante_nombre,
        rol: p.rol_profesor || 'Guía',
        estado: p.estado,
        fecha_inicio: p.fecha_inicio,
        progreso: p.progreso || 0
      }));
      console.log('📁 Proyectos:', this.proyectos.length);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      this.proyectos = [];
    }
  }

  async cargarPropuestas() {
    try {
      const response = await this.apiService.getPropuestasRevisadas().toPromise();
      this.propuestas = (response.data || response || []).slice(0, 10);
      console.log('📝 Propuestas:', this.propuestas.length);
    } catch (error) {
      console.error('Error al cargar propuestas:', error);
      this.propuestas = [];
    }
  }

  async cargarReuniones() {
    try {
      const response = await this.apiService.getReunionesProfesor().toPromise();
      this.reuniones = (response.data || response || []).slice(0, 10);
      console.log('👥 Reuniones:', this.reuniones.length);
    } catch (error) {
      console.error('Error al cargar reuniones:', error);
      this.reuniones = [];
    }
  }

  cambiarPeriodo(periodo: 'mes' | 'trimestre' | 'semestre' | 'año') {
    this.periodoSeleccionado = periodo;
    this.cargarReportes();
  }

  getPorcentajeAprobacion(): number {
    if (!this.metricas || this.metricas.totalPropuestasRevisadas === 0) return 0;
    return Math.round((this.metricas.propuestasAprobadas / this.metricas.totalPropuestasRevisadas) * 100);
  }

  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'aprobada': 'success',
      'rechazada': 'danger',
      'pendiente': 'warning',
      'en_desarrollo': 'info',
      'completado': 'success',
      'pausado': 'warning'
    };
    return colores[estado] || 'secondary';
  }

  exportarPDF() {
    this.notificationService.info('Generando reporte PDF...', 'Descarga');
    
    // Crear contenido del PDF
    const content = this.generarContenidoPDF();
    
    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(content);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      
      // Dar tiempo para que se renderice antes de imprimir
      setTimeout(() => {
        ventanaImpresion.print();
        this.notificationService.success('Reporte generado', 'Usa Ctrl+P para imprimir o guardar como PDF');
      }, 500);
    }
  }

  exportarExcel() {
    this.notificationService.info('Generando reporte Excel...', 'Descarga');
    
    try {
      // Crear contenido CSV (compatible con Excel)
      let csv = this.generarContenidoCSV();
      
      // Crear blob y descargar
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte_metricas_profesor_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.notificationService.success('Reporte descargado', 'Archivo CSV generado exitosamente');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      this.notificationService.error('Error al generar el reporte', 'Intenta de nuevo');
    }
  }

  private generarContenidoPDF(): string {
    const fecha = new Date().toLocaleDateString('es-CL');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Métricas - Profesor</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #004b8d;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #004b8d;
            margin: 0;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .metrics-section {
            margin: 30px 0;
          }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 20px 0;
          }
          .metric-card {
            border: 2px solid #004b8d;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .metric-card h3 {
            color: #004b8d;
            font-size: 14px;
            margin: 0 0 10px 0;
          }
          .metric-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #0066cc;
          }
          .metric-card .details {
            font-size: 12px;
            color: #666;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
          }
          th {
            background: #004b8d;
            color: white;
            padding: 12px;
            text-align: left;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background: #f8f9fa;
          }
          .section-title {
            color: #004b8d;
            font-size: 20px;
            margin: 30px 0 15px 0;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 5px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 2px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Reporte de Métricas del Profesor</h1>
          <p><strong>Período:</strong> ${this.periodoSeleccionado.toUpperCase()}</p>
          <p><strong>Fecha de generación:</strong> ${fecha}</p>
        </div>

        <div class="metrics-section">
          <h2 class="section-title">Resumen de Métricas</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <h3>Propuestas Revisadas</h3>
              <div class="value">${this.metricas?.totalPropuestasRevisadas || 0}</div>
              <div class="details">
                ✓ ${this.metricas?.propuestasAprobadas || 0} aprobadas<br>
                ✗ ${this.metricas?.propuestasRechazadas || 0} rechazadas
              </div>
            </div>
            <div class="metric-card">
              <h3>Proyectos Activos</h3>
              <div class="value">${this.metricas?.proyectosActivos || 0}</div>
              <div class="details">
                ✓ ${this.metricas?.proyectosCompletados || 0} completados
              </div>
            </div>
            <div class="metric-card">
              <h3>Reuniones</h3>
              <div class="value">${this.metricas?.totalReuniones || 0}</div>
              <div class="details">
                ⏱ ${this.metricas?.horasReunionesTotal || 0}h totales
              </div>
            </div>
            <div class="metric-card">
              <h3>Estudiantes</h3>
              <div class="value">${this.metricas?.estudiantesAsignados || 0}</div>
              <div class="details">
                ⏰ ${this.metricas?.horasSemanalesEstimadas || 0}h/semana
              </div>
            </div>
            <div class="metric-card">
              <h3>Fechas Próximas</h3>
              <div class="value">${this.metricas?.fechasProximas || 0}</div>
              <div class="details">
                ⚠ ${this.metricas?.fechasVencidas || 0} vencidas
              </div>
            </div>
            <div class="metric-card">
              <h3>Disponibilidad</h3>
              <div class="value">${this.metricas?.horasDisponibilidadSemanal || 0}h</div>
              <div class="details">
                📊 ${this.metricas?.porcentajeOcupacion || 0}% ocupado
              </div>
            </div>
          </div>
        </div>

        ${this.proyectos.length > 0 ? `
        <div>
          <h2 class="section-title">Proyectos Asignados (${this.proyectos.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Estudiante</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Progreso</th>
              </tr>
            </thead>
            <tbody>
              ${this.proyectos.map(p => `
                <tr>
                  <td>${p.titulo}</td>
                  <td>${p.estudiante_nombre}</td>
                  <td>${p.rol}</td>
                  <td>${p.estado}</td>
                  <td>${p.progreso}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${this.propuestas.length > 0 ? `
        <div>
          <h2 class="section-title">Propuestas Revisadas Recientes (${this.propuestas.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Estudiante</th>
                <th>Estado</th>
                <th>Fecha Revisión</th>
              </tr>
            </thead>
            <tbody>
              ${this.propuestas.slice(0, 10).map(p => `
                <tr>
                  <td>${p.titulo}</td>
                  <td>${p.estudiante_nombre}</td>
                  <td>${p.estado}</td>
                  <td>${this.formatearFecha(p.fecha_revision)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="footer">
          <p>AcTitUBB - Sistema de Gestión de Títulos de la Universidad del Bío-Bío</p>
          <p>Documento generado automáticamente el ${fecha}</p>
        </div>
      </body>
      </html>
    `;
  }

  private generarContenidoCSV(): string {
    let csv = '';
    
    // Encabezado
    csv += `REPORTE DE MÉTRICAS DEL PROFESOR\n`;
    csv += `Período: ${this.periodoSeleccionado.toUpperCase()}\n`;
    csv += `Fecha: ${new Date().toLocaleDateString('es-CL')}\n\n`;
    
    // Métricas generales
    csv += `RESUMEN DE MÉTRICAS\n`;
    csv += `Métrica,Valor\n`;
    csv += `Propuestas Revisadas,${this.metricas?.totalPropuestasRevisadas || 0}\n`;
    csv += `Propuestas Aprobadas,${this.metricas?.propuestasAprobadas || 0}\n`;
    csv += `Propuestas Rechazadas,${this.metricas?.propuestasRechazadas || 0}\n`;
    csv += `Proyectos Activos,${this.metricas?.proyectosActivos || 0}\n`;
    csv += `Proyectos Completados,${this.metricas?.proyectosCompletados || 0}\n`;
    csv += `Total Reuniones,${this.metricas?.totalReuniones || 0}\n`;
    csv += `Horas en Reuniones,${this.metricas?.horasReunionesTotal || 0}\n`;
    csv += `Estudiantes Asignados,${this.metricas?.estudiantesAsignados || 0}\n`;
    csv += `Horas Semanales Estimadas,${this.metricas?.horasSemanalesEstimadas || 0}\n`;
    csv += `Fechas Próximas,${this.metricas?.fechasProximas || 0}\n`;
    csv += `Fechas Vencidas,${this.metricas?.fechasVencidas || 0}\n`;
    csv += `Disponibilidad Semanal (h),${this.metricas?.horasDisponibilidadSemanal || 0}\n`;
    csv += `Porcentaje Ocupación,${this.metricas?.porcentajeOcupacion || 0}%\n\n`;
    
    // Proyectos
    if (this.proyectos.length > 0) {
      csv += `\nPROYECTOS ASIGNADOS\n`;
      csv += `Proyecto,Estudiante,Rol,Estado,Progreso\n`;
      this.proyectos.forEach(p => {
        csv += `"${p.titulo}","${p.estudiante_nombre}","${p.rol}","${p.estado}",${p.progreso}%\n`;
      });
    }
    
    // Propuestas
    if (this.propuestas.length > 0) {
      csv += `\nPROPUESTAS REVISADAS\n`;
      csv += `Título,Estudiante,Estado,Fecha Revisión\n`;
      this.propuestas.forEach(p => {
        csv += `"${p.titulo}","${p.estudiante_nombre}","${p.estado}","${this.formatearFecha(p.fecha_revision)}"\n`;
      });
    }
    
    // Reuniones
    if (this.reuniones.length > 0) {
      csv += `\nREUNIONES REALIZADAS\n`;
      csv += `Proyecto,Estudiante,Fecha,Duración,Tipo\n`;
      this.reuniones.forEach(r => {
        csv += `"${r.proyecto_titulo}","${r.estudiante_nombre}","${this.formatearFecha(r.fecha)}","${this.formatearHoras(r.duracion)}","${r.tipo}"\n`;
      });
    }
    
    return csv;
  }

  volver() {
    window.history.back();
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }

  formatearHoras(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (horas === 0) return `${mins}min`;
    if (mins === 0) return `${horas}h`;
    return `${horas}h ${mins}min`;
  }
}

