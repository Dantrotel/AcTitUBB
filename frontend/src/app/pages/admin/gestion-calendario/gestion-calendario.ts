import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-gestion-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-calendario.html',
  styleUrls: ['./gestion-calendario.scss']
})
export class GestionCalendarioComponent implements OnInit {
  loading = false;
  error = '';
  fechasGlobales: any[] = [];
  estadisticas: any = null;
  
  // Fechas importantes de proyectos
  fechasImportantes: any[] = [];
  loadingFechasImportantes = false;
  mostrarFechasImportantes = false;
  
  // Formulario
  mostrarFormulario = false;
  guardando = false;
  nuevaFecha = {
    titulo: '',
    descripcion: '',
    fecha: '',
    tipo_fecha: ''
  };

  // Modal de eliminación
  mostrarModalEliminar = false;
  fechaAEliminar: any = null;
  eliminando = false;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargarFechas();
    this.cargarEstadisticas();
    this.cargarFechasImportantes();
  }

  cargarFechas() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getFechasGlobales().subscribe({
      next: (response: any) => {
        console.log('Fechas globales:', response);
        this.fechasGlobales = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar fechas:', error);
        this.error = 'Error al cargar las fechas globales';
        this.loading = false;
      }
    });
  }

  cargarEstadisticas() {
    this.apiService.getEstadisticasFechas().subscribe({
      next: (response: any) => {
        console.log('Estadísticas:', response);
        this.estadisticas = response;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  cargarFechasImportantes() {
    this.loadingFechasImportantes = true;
    
    this.apiService.getFechasImportantesTodosProyectos().subscribe({
      next: (response: any) => {
        console.log('Fechas importantes de todos los proyectos:', response);
        if (response.success && response.data) {
          this.fechasImportantes = response.data;
        } else {
          this.fechasImportantes = [];
        }
        this.loadingFechasImportantes = false;
      },
      error: (error) => {
        console.error('Error al cargar fechas importantes:', error);
        this.fechasImportantes = [];
        this.loadingFechasImportantes = false;
      }
    });
  }

  toggleFechasImportantes() {
    this.mostrarFechasImportantes = !this.mostrarFechasImportantes;
    if (this.mostrarFechasImportantes && this.fechasImportantes.length === 0) {
      this.cargarFechasImportantes();
    }
  }

  formatearTipoFecha(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'entrega': 'Entrega',
      'reunion': 'Reunión',
      'evaluacion': 'Evaluación',
      'hito': 'Hito',
      'deadline': 'Fecha límite',
      'presentacion': 'Presentación',
      'entrega_avance': 'Entrega de Avance',
      'entrega_final': 'Entrega Final',
      'defensa': 'Defensa'
    };
    return tipos[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
  }

  formatearEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'vencida': 'Vencida',
      'hoy': 'Hoy',
      'completada': 'Completada'
    };
    return estados[estado] || estado.charAt(0).toUpperCase() + estado.slice(1);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  obtenerTextoTiempo(dias: number): string {
    if (dias < 0) {
      return `${Math.abs(dias)} días atrasada`;
    } else if (dias === 0) {
      return 'Hoy';
    } else if (dias === 1) {
      return 'Mañana';
    } else {
      return `en ${dias} días`;
    }
  }

  crearFecha() {
    if (!this.nuevaFecha.titulo || !this.nuevaFecha.fecha || !this.nuevaFecha.tipo_fecha) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    this.guardando = true;
    
    this.apiService.crearFechaGlobal(this.nuevaFecha).subscribe({
      next: (response: any) => {
        console.log('Fecha creada:', response);
        alert('Fecha global creada exitosamente');
        this.limpiarFormulario();
        this.mostrarFormulario = false;
        this.cargarDatos(); // Recargar datos
        this.guardando = false;
      },
      error: (error) => {
        console.error('Error al crear fecha:', error);
        alert('Error al crear la fecha: ' + (error.error?.message || 'Error desconocido'));
        this.guardando = false;
      }
    });
  }

  limpiarFormulario() {
    this.nuevaFecha = {
      titulo: '',
      descripcion: '',
      fecha: '',
      tipo_fecha: ''
    };
  }

  editarFecha(fecha: any) {
    // Por ahora mostrar la información de la fecha
    alert(`Editar fecha: ${fecha.titulo}\nFecha: ${fecha.fecha}\nTipo: ${fecha.tipo_fecha}`);
    // TODO: Implementar modal de edición
  }

  confirmarEliminar(fecha: any) {
    this.fechaAEliminar = fecha;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar() {
    this.fechaAEliminar = null;
    this.mostrarModalEliminar = false;
    this.eliminando = false;
  }

  eliminarFecha() {
    if (!this.fechaAEliminar) return;

    this.eliminando = true;
    
    this.apiService.eliminarFecha(this.fechaAEliminar.id).subscribe({
      next: (response: any) => {
        console.log('Fecha eliminada:', response);
        alert('Fecha eliminada exitosamente');
        this.cancelarEliminar();
        this.cargarDatos(); // Recargar datos
      },
      error: (error) => {
        console.error('Error al eliminar fecha:', error);
        alert('Error al eliminar la fecha: ' + (error.error?.message || 'Error desconocido'));
        this.eliminando = false;
      }
    });
  }

  getIconoTipoFecha(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'global': 'fas fa-globe',
      'academica': 'fas fa-graduation-cap',
      'entrega': 'fas fa-clock',
      'revision': 'fas fa-search',
      'defensa': 'fas fa-gavel',
      'reunion': 'fas fa-users',
      'otro': 'fas fa-calendar-day'
    };
    return iconos[tipo] || 'fas fa-calendar-day';
  }

  getTipoFechaLabel(tipo: string): string {
    const labels: { [key: string]: string } = {
      'global': 'Global',
      'academica': 'Académica',
      'entrega': 'Entrega',
      'revision': 'Revisión',
      'defensa': 'Defensa',
      'reunion': 'Reunión',
      'otro': 'Otro'
    };
    return labels[tipo] || 'Otro';
  }

  volver() {
    // Usar history.back() para volver a la p�gina anterior sin activar guards
    window.history.back();
  }

  fechaActual() {
    return new Date();
  }
}