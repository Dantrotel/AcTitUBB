import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

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

@Component({
  selector: 'app-gestion-periodo-propuestas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-periodo-propuestas.component.html',
  styleUrl: './gestion-periodo-propuestas.component.scss'
})
export class GestionPeriodoPropuestasComponent implements OnInit {
  Math = Math; // Exponer Math para usar en el template
  estadoPeriodo: EstadoPeriodo | null = null;
  todasLasFechas: any[] = []; // Todas las fechas importantes
  loading = false;
  error = '';
  mensaje = '';
  
  // Variables para el modal de edición
  mostrarModalEditar = false;
  fechaEditar: any = {};
  guardando = false;
  
  // Variables para el modal de eliminación
  mostrarModalEliminar = false;
  fechaEliminar: any = null;
  eliminando = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarEstado();
    this.cargarTodasLasFechas();
  }

  cargarEstado() {
    this.loading = true;
    this.error = '';

    this.api.get('/periodo-propuestas/estado').subscribe({
      next: (response: any) => {
        console.log('📦 Estado del período recibido:', response);
        
        // Si no existe período, limpiar el estado
        if (!response || !response.existe || response.existe === false) {
          console.log('⚠️  No hay período configurado, limpiando estado...');
          this.estadoPeriodo = {
            existe: false,
            mensaje: 'No hay período de propuestas configurado'
          };
        } else {
        this.estadoPeriodo = response;
        }
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('❌ Error cargando estado:', error);
        this.error = 'Error al cargar el estado del período de propuestas';
        this.estadoPeriodo = null;
        this.loading = false;
      }
    });
  }

  cargarTodasLasFechas() {
    console.log('🔍 Cargando todas las fechas importantes...');
    this.api.get('/fechas-importantes/globales').subscribe({
      next: (response: any) => {
        console.log('📦 Respuesta del servidor:', response);
        
        // Asegurar que siempre sea un array
        const fechas = response.fechas || response || [];
        
        // Si la respuesta es un objeto vacío o no es un array, limpiar
        if (!Array.isArray(fechas)) {
          console.warn('⚠️  La respuesta no es un array, limpiando fechas...');
          this.todasLasFechas = [];
        } else {
          this.todasLasFechas = fechas;
        }
        
        console.log('✅ Total de fechas cargadas:', this.todasLasFechas.length);
        
        if (this.todasLasFechas.length === 0) {
          console.log('📭 No hay fechas importantes en la base de datos');
        } else {
          console.log('📋 Fechas:', this.todasLasFechas);
        }
      },
      error: (error: any) => {
        console.error('❌ Error cargando fechas:', error);
        this.todasLasFechas = []; // Limpiar en caso de error
      }
    });
  }

  async habilitarPeriodo() {
    if (!this.estadoPeriodo?.id) {
      this.error = 'No hay período configurado para habilitar';
      return;
    }

    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de habilitar el período de propuestas? Los estudiantes podrán crear nuevas propuestas.',
      'Habilitar Período',
      'Habilitar',
      'Cancelar'
    );
    if (!confirmed) return;

    this.loading = true;
    this.error = '';
    this.mensaje = '';

    this.api.put('/periodo-propuestas/habilitar', { 
      fecha_importante_id: this.estadoPeriodo.id 
    }).subscribe({
      next: (response: any) => {
        this.mensaje = response.mensaje || 'Período habilitado correctamente';
        this.cargarEstado();
        this.cargarTodasLasFechas(); // ⭐ AGREGADO: Recargar la lista completa
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = error.error?.message || 'Error al habilitar el período';
        this.loading = false;
      }
    });
  }

  async deshabilitarPeriodo() {
    if (!this.estadoPeriodo?.id) {
      this.error = 'No hay período configurado para deshabilitar';
      return;
    }

    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de deshabilitar el período de propuestas? Los estudiantes NO podrán crear nuevas propuestas.',
      'Deshabilitar Período',
      'Deshabilitar',
      'Cancelar'
    );
    if (!confirmed) return;

    this.loading = true;
    this.error = '';
    this.mensaje = '';

    this.api.put('/periodo-propuestas/deshabilitar', { 
      fecha_importante_id: this.estadoPeriodo.id 
    }).subscribe({
      next: (response: any) => {
        this.mensaje = response.mensaje || 'Período deshabilitado correctamente';
        this.cargarEstado();
        this.cargarTodasLasFechas(); // ⭐ AGREGADO: Recargar la lista completa
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = error.error?.message || 'Error al deshabilitar el período';
        this.loading = false;
      }
    });
  }

  async deshabilitarVencidos() {
    const confirmed = await this.notificationService.confirm(
      '¿Deseas deshabilitar automáticamente todos los períodos vencidos?',
      'Deshabilitar Vencidos',
      'Deshabilitar',
      'Cancelar'
    );
    if (!confirmed) return;

    this.loading = true;
    this.error = '';
    this.mensaje = '';

    this.api.post('/periodo-propuestas/deshabilitar-vencidos', {}).subscribe({
      next: (response: any) => {
        this.mensaje = response.mensaje || 'Períodos vencidos deshabilitados';
        this.cargarEstado();
        this.cargarTodasLasFechas(); // ⭐ AGREGADO: Recargar la lista completa
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = error.error?.message || 'Error al deshabilitar períodos vencidos';
        this.loading = false;
      }
    });
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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

  volver() {
    window.history.back();
  }

  irACalendario() {
    this.router.navigate(['/admin/calendario']);
  }

  getTipoFechaLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'entrega_propuesta': 'Entrega de Propuesta',
      'entrega': 'Entrega',
      'reunion': 'Reunión',
      'hito': 'Hito',
      'deadline': 'Fecha Límite',
      'presentacion': 'Presentación',
      'entrega_avance': 'Entrega de Avance',
      'entrega_final': 'Entrega Final (Informe/Memoria)',
      'defensa': 'Defensa',
      'revision': 'Revisión',
      'global': 'Fecha Global',
      'academica': 'Fecha Académica',
      'otro': 'Otro'
    };
    return tipos[tipo] || tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getTipoFechaIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'entrega_propuesta': 'fas fa-file-upload',
      'entrega': 'fas fa-upload',
      'reunion': 'fas fa-handshake',
      'hito': 'fas fa-flag-checkered',
      'deadline': 'fas fa-clock',
      'presentacion': 'fas fa-presentation',
      'entrega_avance': 'fas fa-file-alt',
      'entrega_final': 'fas fa-file-pdf',
      'defensa': 'fas fa-gavel',
      'revision': 'fas fa-search',
      'otro': 'fas fa-calendar-day'
    };
    return iconos[tipo] || 'fas fa-calendar-day';
  }

  calcularDiasRestantes(fecha: string): number {
    const hoy = new Date();
    const fechaLimite = new Date(fecha);
    const diferencia = fechaLimite.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  getEstadoFecha(fecha: string, habilitada: boolean): string {
    const dias = this.calcularDiasRestantes(fecha);
    if (!habilitada) return 'cerrado';
    if (dias < 0) return 'vencido';
    if (dias === 0) return 'hoy';
    if (dias <= 3) return 'urgente';
    if (dias <= 7) return 'proximo';
    return 'activo';
  }

  // ===========================
  // MÉTODOS PARA EDITAR FECHAS
  // ===========================

  abrirModalEditar(fecha: any) {
    console.log('📝 Abriendo modal de edición para:', fecha);
    
    // Clonar la fecha para editar (evitar modificar el original)
    this.fechaEditar = {
      id: fecha.id,
      titulo: fecha.titulo,
      descripcion: fecha.descripcion || '',
      fecha_limite: this.convertirFechaParaInput(fecha.fecha_limite),
      habilitada: fecha.habilitada !== undefined ? fecha.habilitada : true,
      tipo_fecha: fecha.tipo_fecha || 'entrega_propuesta',
      es_global: fecha.es_global !== undefined ? fecha.es_global : true
    };
    
    console.log('📋 Datos cargados en el modal:', this.fechaEditar);
    
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.fechaEditar = {};
    this.error = '';
  }

  convertirFechaParaInput(fecha: string): string {
    // Convertir fecha ISO a formato YYYY-MM-DD para el input date
    if (!fecha) return '';
    const d = new Date(fecha);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  guardarEdicion() {
    if (!this.fechaEditar.titulo || !this.fechaEditar.fecha_limite) {
      this.error = 'Por favor completa todos los campos obligatorios';
      return;
    }

    this.guardando = true;
    this.error = '';
    this.mensaje = '';

    console.log('💾 Guardando cambios de fecha:', this.fechaEditar);

    // Preparar datos para enviar
    const datosActualizar = {
      titulo: this.fechaEditar.titulo,
      descripcion: this.fechaEditar.descripcion,
      fecha_limite: this.fechaEditar.fecha_limite,
      tipo_fecha: this.fechaEditar.tipo_fecha || 'entrega_propuesta', // Asegurar que siempre se envíe
      es_global: this.fechaEditar.es_global !== undefined ? this.fechaEditar.es_global : true, // Por defecto true
      habilitada: this.fechaEditar.habilitada
    };

    console.log('📤 Enviando datos al backend:', datosActualizar);

    // Usar el endpoint de calendario en lugar de fechas-importantes
    this.api.put(`/calendario/${this.fechaEditar.id}`, datosActualizar).subscribe({
      next: (response: any) => {
        console.log('✅ Fecha actualizada:', response);
        this.mensaje = 'Fecha actualizada correctamente';
        this.cerrarModalEditar();
        this.cargarEstado();
        this.cargarTodasLasFechas();
        this.guardando = false;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('❌ Error al actualizar fecha:', error);
        this.error = error.error?.message || 'Error al actualizar la fecha';
        this.guardando = false;
      }
    });
  }

  // ===========================
  // MÉTODOS PARA ELIMINAR FECHAS
  // ===========================

  confirmarEliminar(fecha: any) {
    console.log('🗑️  Confirmando eliminación de:', fecha);
    this.fechaEliminar = fecha;
    this.mostrarModalEliminar = true;
  }

  cancelarEliminar() {
    this.mostrarModalEliminar = false;
    this.fechaEliminar = null;
  }

  eliminarFecha() {
    if (!this.fechaEliminar || !this.fechaEliminar.id) {
      this.error = 'No se ha seleccionado ninguna fecha para eliminar';
      return;
    }

    this.eliminando = true;
    this.error = '';
    this.mensaje = '';

    console.log('🗑️  Eliminando fecha con ID:', this.fechaEliminar.id);

    // Usar el endpoint de calendario en lugar de fechas-importantes
    this.api.delete(`/calendario/${this.fechaEliminar.id}`).subscribe({
      next: (response: any) => {
        console.log('✅ Fecha eliminada:', response);
        this.mensaje = 'Fecha eliminada correctamente';
        this.cancelarEliminar();
        this.cargarEstado();
        this.cargarTodasLasFechas();
        this.eliminando = false;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('❌ Error al eliminar fecha:', error);
        this.error = error.error?.message || 'Error al eliminar la fecha';
        this.eliminando = false;
      }
    });
  }
}
