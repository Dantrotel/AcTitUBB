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
  
  // Calendario General (Artículos 29-32)
  calendarioGeneral: any = {
    todas_fechas: [],
    por_tipo: {},
    estadisticas: null
  };
  cargandoCalendario = false;
  filtroTipoFecha = '';
  filtroEstadoFecha = '';
  
  // Formulario
  mostrarFormulario = false;
  guardando = false;
  nuevaFecha = {
    titulo: '',
    descripcion: '',
    fecha: '',
    tipo_fecha: '',
    es_global: false
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
    this.cargarCalendarioGeneral();
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
    console.log('🔍 Intentando crear fecha global:', this.nuevaFecha);
    
    if (!this.nuevaFecha.titulo || !this.nuevaFecha.fecha || !this.nuevaFecha.tipo_fecha) {
      console.error('❌ Validación fallida - campos faltantes:', {
        titulo: this.nuevaFecha.titulo,
        fecha: this.nuevaFecha.fecha,
        tipo_fecha: this.nuevaFecha.tipo_fecha
      });
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    console.log('✅ Validación OK, enviando datos...');
    this.guardando = true;
    
    this.apiService.crearFechaGlobal(this.nuevaFecha).subscribe({
      next: (response: any) => {
        console.log('✅ Fecha creada exitosamente:', response);
        alert('Fecha global creada exitosamente');
        this.limpiarFormulario();
        this.mostrarFormulario = false;
        this.cargarDatos(); // Recargar datos
        this.guardando = false;
      },
      error: (error) => {
        console.error('❌ Error al crear fecha:', {
          status: error.status,
          statusText: error.statusText,
          message: error.error?.message,
          error: error
        });
        
        let mensajeError = 'Error desconocido';
        
        if (error.status === 401) {
          mensajeError = 'No estás autenticado. Por favor inicia sesión de nuevo.';
        } else if (error.status === 403) {
          mensajeError = 'No tienes permisos para crear fechas globales (solo administradores).';
        } else if (error.status === 400) {
          mensajeError = error.error?.message || 'Datos inválidos en el formulario.';
        } else if (error.error?.message) {
          mensajeError = error.error.message;
        }
        
        alert('Error al crear la fecha: ' + mensajeError);
        this.guardando = false;
      }
    });
  }

  limpiarFormulario() {
    this.nuevaFecha = {
      titulo: '',
      descripcion: '',
      fecha: '',
      tipo_fecha: '',
      es_global: false
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
      'reunion': 'Reunión',
      'otro': 'Otro',
      // Tipos de fechas importantes de proyectos
      'entrega_final': 'Entrega Final',
      'defensa': 'Defensa',
      'presentacion': 'Presentación',
      'entrega_avance': 'Entrega Avance',
      'revision_parcial': 'Revisión Parcial'
    };
    return labels[tipo] || tipo;
  }

  // ===== MÉTODOS PARA CALENDARIO GENERAL =====

  cargarCalendarioGeneral() {
    this.cargandoCalendario = true;
    
    this.apiService.get('/fechas-importantes/admin/calendario-general').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.calendarioGeneral = response.data;
          console.log('📅 Calendario general cargado:', this.calendarioGeneral);
        }
        this.cargandoCalendario = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar calendario general:', error);
        this.cargandoCalendario = false;
      }
    });
  }

  generarAlertasManual() {
    const confirmacion = confirm('¿Generar alertas automáticas para todas las fechas importantes?\n\nEsto creará notificaciones para fechas próximas (30, 10 días), hoy y vencidas.');
    
    if (!confirmacion) return;

    this.apiService.post('/fechas-importantes/alertas/generar', {}).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert(`✅ Alertas generadas correctamente:\n\n` +
                `• 30 días: ${response.data.alerta_30_dias}\n` +
                `• 10 días: ${response.data.alerta_10_dias}\n` +
                `• Hoy: ${response.data.alerta_hoy}\n` +
                `• Vencidas: ${response.data.alerta_vencida}`);
        }
      },
      error: (error) => {
        console.error('Error al generar alertas:', error);
        alert('❌ Error al generar alertas: ' + (error.error?.message || 'Error desconocido'));
      }
    });
  }

  getFechasFiltradas(): any[] {
    let fechas = this.calendarioGeneral.todas_fechas || [];

    // Filtro por tipo
    if (this.filtroTipoFecha) {
      fechas = fechas.filter((f: any) => f.tipo_fecha === this.filtroTipoFecha);
    }

    // Filtro por estado
    if (this.filtroEstadoFecha) {
      fechas = fechas.filter((f: any) => f.estado === this.filtroEstadoFecha);
    }

    return fechas;
  }

  limpiarFiltrosCalendario() {
    this.filtroTipoFecha = '';
    this.filtroEstadoFecha = '';
  }

  getEstadoLabel(estado: string): string {
    const labels: { [key: string]: string } = {
      'vencida': 'Vencida',
      'hoy': 'Hoy',
      'pendiente': 'Pendiente',
      'completada': 'Completada'
    };
    return labels[estado] || estado;
  }

  formatearDiasRestantes(dias: number): string {
    if (dias === null || dias === undefined) return '-';
    
    if (dias < 0) {
      return `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
    } else if (dias === 0) {
      return '¡HOY!';
    } else if (dias === 1) {
      return 'Mañana';
    } else {
      return `En ${dias} días`;
    }
  }

  getDiasRestantesClase(dias: number): string {
    if (dias === null || dias === undefined) return '';
    
    if (dias < 0) return 'vencido';
    if (dias === 0) return 'hoy';
    if (dias <= 10) return 'urgente';
    if (dias <= 30) return 'proximo';
    return 'normal';
  }

  volver() {
    // Usar history.back() para volver a la página anterior sin activar guards
    window.history.back();
  }

  fechaActual() {
    return new Date();
  }
}