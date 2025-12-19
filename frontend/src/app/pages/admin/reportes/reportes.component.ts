import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Carrera {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  
  // Datos para el formulario
  carreras: Carrera[] = [];
  carreraSeleccionada: number | null = null;
  fechaInicio: string = '';
  fechaFin: string = '';
  mesesTendencias: number = 6;
  
  // Estados de carga
  cargandoReporte = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  
  // Datos de tendencias para gráficos
  datosTendencias: any = null;
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.cargarCarreras();
  }
  
  /**
   * Cargar lista de carreras
   */
  cargarCarreras(): void {
    this.http.get<any>(`${this.apiUrl}/estructura/carreras`).subscribe({
      next: (response) => {
        this.carreras = response.carreras || [];
      },
      error: (error) => {
      }
    });
  }
  
  /**
   * Generar reporte de cumplimiento por carrera (PDF)
   */
  generarReporteCumplimientoCarrera(): void {
    if (!this.carreraSeleccionada) {
      this.mostrarError('Debe seleccionar una carrera');
      return;
    }
    
    this.cargandoReporte = true;
    this.limpiarMensajes();
    
    this.http.get(
      `${this.apiUrl}/reportes/cumplimiento-carrera?carrera_id=${this.carreraSeleccionada}`,
      { responseType: 'blob', observe: 'response' }
    ).subscribe({
      next: (response) => {
        this.descargarArchivo(response.body!, 'reporte-cumplimiento.pdf');
        this.mostrarExito('Reporte PDF generado exitosamente');
        this.cargandoReporte = false;
      },
      error: (error) => {
        this.mostrarError('Error generando reporte de cumplimiento');
        this.cargandoReporte = false;
      }
    });
  }
  
  /**
   * Generar reporte de carga docente (Excel)
   */
  generarReporteCargaDocente(): void {
    this.cargandoReporte = true;
    this.limpiarMensajes();
    
    this.http.get(
      `${this.apiUrl}/reportes/carga-docente`,
      { responseType: 'blob', observe: 'response' }
    ).subscribe({
      next: (response) => {
        this.descargarArchivo(response.body!, 'reporte-carga-docente.xlsx');
        this.mostrarExito('Reporte Excel generado exitosamente');
        this.cargandoReporte = false;
      },
      error: (error) => {
        this.mostrarError('Error generando reporte de carga docente');
        this.cargandoReporte = false;
      }
    });
  }
  
  /**
   * Generar reporte de proyectos finalizados (Excel)
   */
  generarReporteProyectosFinalizados(): void {
    this.cargandoReporte = true;
    this.limpiarMensajes();
    
    let url = `${this.apiUrl}/reportes/proyectos-finalizados`;
    const params: string[] = [];
    
    if (this.fechaInicio) {
      params.push(`fecha_inicio=${this.fechaInicio}`);
    }
    if (this.fechaFin) {
      params.push(`fecha_fin=${this.fechaFin}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    this.http.get(url, { responseType: 'blob', observe: 'response' }).subscribe({
      next: (response) => {
        this.descargarArchivo(response.body!, 'reporte-proyectos-finalizados.xlsx');
        this.mostrarExito('Reporte Excel generado exitosamente');
        this.cargandoReporte = false;
      },
      error: (error) => {
        this.mostrarError('Error generando reporte de proyectos finalizados');
        this.cargandoReporte = false;
      }
    });
  }
  
  /**
   * Cargar datos de tendencias
   */
  cargarDatosTendencias(): void {
    this.cargandoReporte = true;
    this.limpiarMensajes();
    
    this.http.get<any>(
      `${this.apiUrl}/reportes/tendencias?meses=${this.mesesTendencias}`
    ).subscribe({
      next: (response) => {
        this.datosTendencias = response;
        this.mostrarExito('Datos de tendencias cargados');
        this.cargandoReporte = false;
      },
      error: (error) => {
        this.mostrarError('Error cargando datos de tendencias');
        this.cargandoReporte = false;
      }
    });
  }
  
  /**
   * Descargar archivo blob
   */
  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }
  
  /**
   * Mostrar mensaje de éxito
   */
  private mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    setTimeout(() => {
      this.mensajeExito = '';
    }, 5000);
  }
  
  /**
   * Mostrar mensaje de error
   */
  private mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    setTimeout(() => {
      this.mensajeError = '';
    }, 5000);
  }
  
  /**
   * Limpiar mensajes
   */
  private limpiarMensajes(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }
}
