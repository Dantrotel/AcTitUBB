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

@Component({
  selector: 'app-gestion-periodo-propuestas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-periodo-propuestas.component.html',
  styleUrl: './gestion-periodo-propuestas.component.scss'
})
export class GestionPeriodoPropuestasComponent implements OnInit {
  estadoPeriodo: EstadoPeriodo | null = null;
  loading = false;
  error = '';
  mensaje = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarEstado();
  }

  cargarEstado() {
    this.loading = true;
    this.error = '';

    this.api.get('/periodo-propuestas/estado').subscribe({
      next: (response: any) => {
        this.estadoPeriodo = response;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando estado:', error);
        this.error = 'Error al cargar el estado del período de propuestas';
        this.loading = false;
      }
    });
  }

  habilitarPeriodo() {
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

    this.api.put('/periodo-propuestas/habilitar', { 
      fecha_importante_id: this.estadoPeriodo.id 
    }).subscribe({
      next: (response: any) => {
        this.mensaje = response.mensaje || 'Período habilitado correctamente';
        this.cargarEstado();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = error.error?.message || 'Error al habilitar el período';
        this.loading = false;
      }
    });
  }

  deshabilitarPeriodo() {
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

    this.api.put('/periodo-propuestas/deshabilitar', { 
      fecha_importante_id: this.estadoPeriodo.id 
    }).subscribe({
      next: (response: any) => {
        this.mensaje = response.mensaje || 'Período deshabilitado correctamente';
        this.cargarEstado();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = error.error?.message || 'Error al deshabilitar el período';
        this.loading = false;
      }
    });
  }

  deshabilitarVencidos() {
    if (!confirm('¿Deseas deshabilitar automáticamente todos los períodos vencidos?')) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.mensaje = '';

    this.api.post('/periodo-propuestas/deshabilitar-vencidos', {}).subscribe({
      next: (response: any) => {
        this.mensaje = response.mensaje || 'Períodos vencidos deshabilitados';
        this.cargarEstado();
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
    this.router.navigate(['/admin']);
  }

  irACalendario() {
    this.router.navigate(['/admin/calendario']);
  }
}
