import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

interface EstadoPeriodo {
  existe: boolean;
  id?: number;
  titulo?: string;
  descripcion?: string;
  fecha_limite?: string;
  habilitada?: boolean;
  permite_extension?: boolean;
  dias_restantes?: number;
  estado_tiempo?: 'activo' | 'proximo_a_vencer' | 'ultimo_dia' | 'vencido';
  puede_recibir_propuestas?: boolean;
  mensaje?: string;
}

interface Reunion {
  id: number;
  estudiante_rut: string;
  estudiante_nombre?: string;
  profesor_rut: string;
  profesor_nombre?: string;
  fecha: string;
  hora_inicio: string;
  hora_fin?: string;
  estado: string;
  motivo?: string;
  descripcion?: string;
  confirmacion_estudiante?: boolean;
  confirmacion_profesor?: boolean;
}

@Component({
  selector: 'app-calendario-unificado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario-unificado.component.html',
  styleUrl: './calendario-unificado.component.scss'
})
export class CalendarioUnificadoComponent implements OnInit {
  tabActiva: string = 'calendario';
  loading = false;
  error = '';
  mensaje = '';

  tabs = [
    { 
      id: 'calendario', 
      label: 'Calendario Global', 
      icon: 'fas fa-calendar-alt',
      descripcion: 'Fechas globales y eventos académicos'
    },
    { 
      id: 'propuestas', 
      label: 'Período de Propuestas', 
      icon: 'fas fa-calendar-check',
      descripcion: 'Control del período de entrega'
    },
    { 
      id: 'reuniones', 
      label: 'Reuniones', 
      icon: 'fas fa-handshake',
      descripcion: 'Sistema de reuniones'
    }
  ];

  // ===== CALENDARIO GLOBAL =====
  fechasGlobales: any[] = [];
  estadisticasFechas: any = null;
  mostrarFormularioFecha = false;
  guardandoFecha = false;
  nuevaFecha = {
    titulo: '',
    descripcion: '',
    fecha: '',
    tipo_fecha: '',
    es_global: false
  };
  mostrarModalEliminar = false;
  fechaAEliminar: any = null;
  eliminandoFecha = false;

  // ===== PERÍODO DE PROPUESTAS =====
  estadoPeriodo: EstadoPeriodo | null = null;

  // ===== REUNIONES =====
  reuniones: Reunion[] = [];
  reunionesFiltradas: Reunion[] = [];
  filtroEstadoReunion = '';
  busquedaTexto = '';
  
  estadosDisponibles = [
    { value: '', label: 'Todos los estados' },
    { value: 'programada', label: 'Programadas' },
    { value: 'confirmada', label: 'Confirmadas' },
    { value: 'completada', label: 'Completadas' },
    { value: 'cancelada', label: 'Canceladas' }
  ];

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.cargarDatosTab();
  }

  cambiarTab(tabId: string): void {
    this.tabActiva = tabId;
    this.error = '';
    this.mensaje = '';
    this.cargarDatosTab();
  }

  cargarDatosTab(): void {
    switch (this.tabActiva) {
      case 'calendario':
        this.cargarFechasGlobales();
        break;
      case 'propuestas':
        this.cargarEstadoPeriodo();
        break;
      case 'reuniones':
        this.cargarReuniones();
        break;
    }
  }

  volver(): void {
    this.router.navigate(['/admin']);
  }

  // ===========================
  // CALENDARIO GLOBAL
  // ===========================

  cargarFechasGlobales(): void {
    this.loading = true;
    this.error = '';

    Promise.all([
      this.apiService.get('/calendario/admin/globales').toPromise(),
      this.apiService.get('/calendario/admin/estadisticas').toPromise()
    ]).then(([fechasResponse, estadisticasResponse]: any[]) => {
      this.fechasGlobales = fechasResponse || [];
      this.estadisticasFechas = estadisticasResponse || {};
      this.loading = false;
    }).catch((error: any) => {
      console.error('Error al cargar fechas globales:', error);
      this.error = 'Error al cargar las fechas. Asegúrate de que el backend esté corriendo.';
      this.loading = false;
    });
  }

  toggleFormularioFecha(): void {
    this.mostrarFormularioFecha = !this.mostrarFormularioFecha;
    if (!this.mostrarFormularioFecha) {
      this.limpiarFormularioFecha();
    }
  }

  limpiarFormularioFecha(): void {
    this.nuevaFecha = {
      titulo: '',
      descripcion: '',
      fecha: '',
      tipo_fecha: '',
      es_global: false
    };
  }

  crearFechaGlobal(): void {
    if (!this.nuevaFecha.titulo || !this.nuevaFecha.fecha || !this.nuevaFecha.tipo_fecha) {
      this.error = 'Por favor completa todos los campos obligatorios';
      return;
    }

    this.guardandoFecha = true;
    this.error = '';

    this.apiService.post('/calendario/admin/global', this.nuevaFecha).subscribe({
      next: (response: any) => {
        this.mensaje = 'Fecha creada exitosamente';
        
        // Si se creó una fecha de entrega_propuesta con es_global=true, 
        // también se debe recargar el estado del período
        if (this.nuevaFecha.tipo_fecha === 'entrega_propuesta' && this.nuevaFecha.es_global) {
          this.mensaje = '✅ Fecha creada exitosamente y agregada al Período de Propuestas';
          // Recargar estado del período para que aparezca en la pestaña correspondiente
          this.cargarEstadoPeriodo();
        }
        
        this.limpiarFormularioFecha();
        this.mostrarFormularioFecha = false;
        this.cargarFechasGlobales();
        this.guardandoFecha = false;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error al crear fecha:', error);
        if (error.status === 401) {
          this.error = 'No estás autenticado. Por favor inicia sesión nuevamente.';
        } else if (error.status === 403) {
          this.error = 'No tienes permisos para crear fechas globales.';
        } else if (error.status === 400) {
          this.error = error.error?.message || 'Datos inválidos. Verifica los campos.';
        } else {
          this.error = 'Error al crear la fecha. Intenta nuevamente.';
        }
        this.guardandoFecha = false;
      }
    });
  }

  confirmarEliminarFecha(fecha: any): void {
    this.fechaAEliminar = fecha;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar(): void {
    this.fechaAEliminar = null;
    this.mostrarModalEliminar = false;
  }

  eliminarFechaGlobal(): void {
    if (!this.fechaAEliminar) return;

    this.eliminandoFecha = true;
    this.error = '';

    const esEntregaPropuesta = this.fechaAEliminar.tipo_fecha === 'entrega_propuesta';

    this.apiService.delete(`/calendario/${this.fechaAEliminar.id}`).subscribe({
      next: (response: any) => {
        this.mensaje = 'Fecha eliminada exitosamente';
        
        // Si se eliminó una fecha de entrega_propuesta, recargar estado del período
        if (esEntregaPropuesta) {
          this.cargarEstadoPeriodo();
        }
        
        this.cancelarEliminar();
        this.cargarFechasGlobales();
        this.eliminandoFecha = false;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error al eliminar fecha:', error);
        this.error = 'Error al eliminar la fecha. Intenta nuevamente.';
        this.eliminandoFecha = false;
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getIconoTipoFecha(tipo: string): string {
    const iconos: any = {
      // Académicas
      'academica': 'fa-graduation-cap',
      'inicio_semestre': 'fa-calendar-plus',
      'fin_semestre': 'fa-calendar-check',
      'feriado': 'fa-calendar-times',
      'receso': 'fa-umbrella-beach',
      // Propuestas
      'entrega_propuesta': 'fa-file-signature',
      'revision_propuesta': 'fa-file-search',
      // Entregas
      'entrega': 'fa-file-upload',
      'entrega_avance': 'fa-tasks',
      'entrega_parcial': 'fa-file-alt',
      'entrega_final': 'fa-file-invoice',
      // Evaluaciones
      'evaluacion': 'fa-clipboard-check',
      'revision': 'fa-search',
      'presentacion': 'fa-presentation',
      'defensa': 'fa-chalkboard-teacher',
      'defensa_parcial': 'fa-chalkboard',
      // Reuniones
      'reunion': 'fa-handshake',
      'seguimiento': 'fa-user-clock',
      'orientacion': 'fa-comments',
      // Hitos
      'hito': 'fa-flag-checkered',
      'deadline': 'fa-clock',
      'plazo_extension': 'fa-hourglass-half',
      // Otro
      'otro': 'fa-calendar'
    };
    return iconos[tipo] || 'fa-calendar';
  }

  // ===========================
  // PERÍODO DE PROPUESTAS
  // ===========================

  cargarEstadoPeriodo(): void {
    this.loading = true;
    this.error = '';

    this.apiService.get('/periodo-propuestas/estado').subscribe({
      next: (response: any) => {
        this.estadoPeriodo = response;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando estado del período:', error);
        this.error = 'Error al cargar el estado del período de propuestas';
        this.loading = false;
      }
    });
  }

  habilitarPeriodo(): void {
    if (!this.estadoPeriodo?.id) {
      this.error = 'No hay período configurado para habilitar';
      return;
    }

    if (!confirm('¿Estás seguro de habilitar el período de propuestas? Los estudiantes podrán crear nuevas propuestas.')) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.mensaje = '';

    this.apiService.put('/periodo-propuestas/habilitar', { 
      fecha_importante_id: this.estadoPeriodo.id 
    }).subscribe({
      next: (response: any) => {
        this.mensaje = response.mensaje || 'Período habilitado correctamente';
        this.cargarEstadoPeriodo();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = error.error?.message || 'Error al habilitar el período';
        this.loading = false;
      }
    });
  }

  deshabilitarPeriodo(): void {
    if (!this.estadoPeriodo?.id) {
      this.error = 'No hay período configurado para deshabilitar';
      return;
    }

    if (!confirm('¿Estás seguro de deshabilitar el período de propuestas? Los estudiantes NO podrán crear nuevas propuestas.')) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.mensaje = '';

    this.apiService.put('/periodo-propuestas/deshabilitar', { 
      fecha_importante_id: this.estadoPeriodo.id 
    }).subscribe({
      next: (response: any) => {
        this.mensaje = response.mensaje || 'Período deshabilitado correctamente';
        this.cargarEstadoPeriodo();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = error.error?.message || 'Error al deshabilitar el período';
        this.loading = false;
      }
    });
  }

  deshabilitarVencidos(): void {
    if (!confirm('¿Deseas deshabilitar automáticamente todos los períodos vencidos?')) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.mensaje = '';

    this.apiService.post('/periodo-propuestas/deshabilitar-vencidos', {}).subscribe({
      next: (response: any) => {
        this.mensaje = response.mensaje || 'Períodos vencidos deshabilitados';
        this.cargarEstadoPeriodo();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = error.error?.message || 'Error al deshabilitar períodos vencidos';
        this.loading = false;
      }
    });
  }

  getEstadoClass(): string {
    if (!this.estadoPeriodo) return '';
    
    if (!this.estadoPeriodo.habilitada) return 'estado-cerrado';
    
    switch (this.estadoPeriodo.estado_tiempo) {
      case 'activo': return 'estado-activo';
      case 'proximo_a_vencer': return 'estado-proximo';
      case 'ultimo_dia': return 'estado-urgente';
      case 'vencido': return 'estado-vencido';
      default: return '';
    }
  }

  getEstadoLabel(): string {
    if (!this.estadoPeriodo) return '';
    
    if (!this.estadoPeriodo.habilitada) return 'Período Cerrado';
    
    switch (this.estadoPeriodo.estado_tiempo) {
      case 'activo': return 'Período Activo';
      case 'proximo_a_vencer': return '¡Próximo a Vencer!';
      case 'ultimo_dia': return '¡ÚLTIMO DÍA!';
      case 'vencido': return 'Período Vencido';
      default: return 'Estado Desconocido';
    }
  }

  getDiasRestantesTexto(): string {
    if (!this.estadoPeriodo || this.estadoPeriodo.dias_restantes === undefined) return '';
    
    const dias = this.estadoPeriodo.dias_restantes;
    
    if (dias < 0) return `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
    if (dias === 0) return 'Vence HOY';
    if (dias === 1) return 'Vence MAÑANA';
    return `${dias} días restantes`;
  }

  // ===========================
  // REUNIONES
  // ===========================

  cargarReuniones(): void {
    this.loading = true;
    this.error = '';

    this.apiService.get('/reuniones').subscribe({
      next: (response: any) => {
        this.reuniones = response.data || response || [];
        this.aplicarFiltrosReuniones();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar reuniones:', error);
        this.error = 'Error al cargar las reuniones';
        this.loading = false;
      }
    });
  }

  aplicarFiltrosReuniones(): void {
    let reunionesFiltradas = [...this.reuniones];

    // Filtro por estado
    if (this.filtroEstadoReunion) {
      reunionesFiltradas = reunionesFiltradas.filter(r => r.estado === this.filtroEstadoReunion);
    }

    // Filtro por texto
    if (this.busquedaTexto.trim()) {
      const texto = this.busquedaTexto.toLowerCase();
      reunionesFiltradas = reunionesFiltradas.filter(r => {
        const nombreEstudiante = (r.estudiante_nombre || '').toLowerCase();
        const nombreProfesor = (r.profesor_nombre || '').toLowerCase();
        const motivo = (r.motivo || '').toLowerCase();
        
        return nombreEstudiante.includes(texto) || 
               nombreProfesor.includes(texto) || 
               motivo.includes(texto);
      });
    }

    this.reunionesFiltradas = reunionesFiltradas.sort((a, b) => {
      return new Date(b.fecha + 'T' + b.hora_inicio).getTime() - 
             new Date(a.fecha + 'T' + a.hora_inicio).getTime();
    });
  }

  limpiarFiltrosReuniones(): void {
    this.filtroEstadoReunion = '';
    this.busquedaTexto = '';
    this.aplicarFiltrosReuniones();
  }

  getEstadoReunionLabel(estado: string): string {
    const labels: any = {
      'programada': 'Programada',
      'confirmada': 'Confirmada',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'pendiente': 'Pendiente'
    };
    return labels[estado] || estado;
  }

  getEstadoReunionClass(estado: string): string {
    return `estado-${estado}`;
  }

  formatearHora(hora: string): string {
    if (!hora) return 'N/A';
    return hora.slice(0, 5);
  }

  getReunionesFiltradasPorEstado(): Reunion[] {
    return this.reunionesFiltradas;
  }

  calcularEstadisticasReuniones(): any {
    return {
      total: this.reuniones.length,
      programadas: this.reuniones.filter(r => r.estado === 'programada').length,
      confirmadas: this.reuniones.filter(r => r.estado === 'confirmada').length,
      completadas: this.reuniones.filter(r => r.estado === 'completada').length,
      canceladas: this.reuniones.filter(r => r.estado === 'cancelada').length
    };
  }
}
