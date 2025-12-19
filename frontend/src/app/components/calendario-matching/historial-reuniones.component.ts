import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

interface HistorialReunion {
  id: number;
  reunion_id?: number;
  solicitud_id: number;
  proyecto_id: number;
  profesor_rut: string;
  estudiante_rut: string;
  fecha_propuesta: string;
  hora_propuesta: string;
  tipo_reunion: string;
  accion: string;
  realizado_por: string;
  comentarios?: string;
  fecha_accion: string;
  proyecto_titulo?: string;
  estudiante_nombre?: string;
  profesor_nombre?: string;
  realizado_por_nombre?: string;
  estado_reunion_actual?: string;
}

@Component({
  selector: 'app-historial-reuniones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-reuniones.component.html',
  styleUrls: ['./historial-reuniones.component.scss']
})
export class HistorialReunionesComponent implements OnInit {
  historial: HistorialReunion[] = [];
  historialFiltrado: HistorialReunion[] = [];
  isLoading = false;
  errorMessage = '';
  
  // Filtros
  filtroAccion: string = 'todas';
  filtroFecha: string = 'todas';
  filtroBusqueda: string = '';

  accionesPosibles = [
    { value: 'todas', label: 'Todas las acciones' },
    { value: 'solicitud_creada', label: 'Solicitudes creadas' },
    { value: 'aceptada_profesor', label: 'Aceptadas por profesor' },
    { value: 'aceptada_estudiante', label: 'Aceptadas por estudiante' },
    { value: 'confirmada', label: 'Confirmadas' },
    { value: 'rechazada', label: 'Rechazadas' },
    { value: 'cancelada', label: 'Canceladas' },
    { value: 'realizada', label: 'Realizadas' }
  ];

  periodosFecha = [
    { value: 'todas', label: 'Todo el historial' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Esta semana' },
    { value: 'mes', label: 'Este mes' },
    { value: 'trimestre', label: 'Últimos 3 meses' }
  ];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarHistorial();
  }

  cargarHistorial() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getHistorialReuniones().subscribe({
      next: (response: any) => {
        this.historial = response.data || response || [];
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar el historial de reuniones';
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros() {
    let resultado = [...this.historial];

    // Filtro por acción
    if (this.filtroAccion !== 'todas') {
      resultado = resultado.filter(h => h.accion === this.filtroAccion);
    }

    // Filtro por fecha
    if (this.filtroFecha !== 'todas') {
      const ahora = new Date();
      resultado = resultado.filter(h => {
        const fechaAccion = new Date(h.fecha_accion);
        
        switch (this.filtroFecha) {
          case 'hoy':
            return fechaAccion.toDateString() === ahora.toDateString();
          case 'semana':
            const inicioSemana = new Date(ahora);
            inicioSemana.setDate(ahora.getDate() - 7);
            return fechaAccion >= inicioSemana;
          case 'mes':
            const inicioMes = new Date(ahora);
            inicioMes.setMonth(ahora.getMonth() - 1);
            return fechaAccion >= inicioMes;
          case 'trimestre':
            const inicioTrimestre = new Date(ahora);
            inicioTrimestre.setMonth(ahora.getMonth() - 3);
            return fechaAccion >= inicioTrimestre;
          default:
            return true;
        }
      });
    }

    // Filtro por búsqueda
    if (this.filtroBusqueda.trim()) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(h =>
        h.proyecto_titulo?.toLowerCase().includes(busqueda) ||
        h.estudiante_nombre?.toLowerCase().includes(busqueda) ||
        h.profesor_nombre?.toLowerCase().includes(busqueda) ||
        h.comentarios?.toLowerCase().includes(busqueda)
      );
    }

    this.historialFiltrado = resultado;
  }

  limpiarFiltros() {
    this.filtroAccion = 'todas';
    this.filtroFecha = 'todas';
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  getAccionClass(accion: string): string {
    switch (accion) {
      case 'solicitud_creada': return 'accion-nueva';
      case 'aceptada_profesor':
      case 'aceptada_estudiante': return 'accion-aceptada';
      case 'confirmada': return 'accion-confirmada';
      case 'rechazada': return 'accion-rechazada';
      case 'cancelada': return 'accion-cancelada';
      case 'realizada': return 'accion-realizada';
      default: return 'accion-default';
    }
  }

  getAccionIcon(accion: string): string {
    switch (accion) {
      case 'solicitud_creada': return 'fa-plus-circle';
      case 'aceptada_profesor':
      case 'aceptada_estudiante': return 'fa-thumbs-up';
      case 'confirmada': return 'fa-check-double';
      case 'rechazada': return 'fa-thumbs-down';
      case 'cancelada': return 'fa-ban';
      case 'realizada': return 'fa-check-circle';
      default: return 'fa-circle';
    }
  }

  getAccionLabel(accion: string): string {
    switch (accion) {
      case 'solicitud_creada': return 'Solicitud Creada';
      case 'aceptada_profesor': return 'Aceptada por Profesor';
      case 'aceptada_estudiante': return 'Aceptada por Estudiante';
      case 'confirmada': return 'Confirmada';
      case 'rechazada': return 'Rechazada';
      case 'cancelada': return 'Cancelada';
      case 'realizada': return 'Realizada';
      default: return accion;
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearHora(hora: string): string {
    return hora ? hora.slice(0, 5) : '';
  }

  volver() {
    window.history.back();
  }

  exportarCSV() {
    // Convertir datos a CSV
    const headers = ['Fecha Acción', 'Acción', 'Proyecto', 'Estudiante', 'Profesor', 'Fecha Reunión', 'Hora', 'Comentarios'];
    const rows = this.historialFiltrado.map(h => [
      this.formatearFecha(h.fecha_accion),
      this.getAccionLabel(h.accion),
      h.proyecto_titulo || '',
      h.estudiante_nombre || '',
      h.profesor_nombre || '',
      h.fecha_propuesta,
      this.formatearHora(h.hora_propuesta),
      h.comentarios || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial-reuniones-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
