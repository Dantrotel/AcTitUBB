import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

interface SolicitudExtension {
  id: number;
  proyecto_id: number;
  proyecto_titulo: string;
  estudiante_nombre: string;
  solicitante_rut: string;
  fecha_original: string;
  fecha_solicitada: string;
  dias_extension: number;
  motivo: string;
  justificacion_detallada: string;
  documento_respaldo?: string;
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'rechazada';
  created_at: string;
  dias_desde_solicitud?: number;
}

interface Estadisticas {
  total_solicitudes: number;
  pendientes: number;
  en_revision: number;
  aprobadas: number;
  rechazadas: number;
  promedio_dias_extension: number;
  promedio_dias_resolucion: number;
}

@Component({
  selector: 'app-gestion-extensiones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-extensiones.component.html',
  styleUrl: './gestion-extensiones.component.scss'
})
export class GestionExtensionesComponent implements OnInit {
  solicitudes: SolicitudExtension[] = [];
  estadisticas: Estadisticas | null = null;
  
  // Filtros
  estadoFiltro: string = 'pendiente';
  
  // Modal de detalle
  solicitudSeleccionada: SolicitudExtension | null = null;
  mostrarModal = false;
  
  // Modal de aprobación/rechazo
  mostrarModalAccion = false;
  accion: 'aprobar' | 'rechazar' | null = null;
  comentarios = '';
  
  // UI State
  loading = false;
  loadingEstadisticas = false;
  error = '';
  mensaje = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarSolicitudesPendientes();
    this.cargarEstadisticas();
  }

  cargarSolicitudesPendientes() {
    this.loading = true;
    this.error = '';
    
    this.api.get('/extensiones/pendientes').subscribe({
      next: (response: any) => {
        if (response && response.solicitudes) {
          this.solicitudes = response.solicitudes;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando solicitudes:', error);
        this.error = 'Error al cargar las solicitudes pendientes';
        this.loading = false;
      }
    });
  }

  cargarEstadisticas() {
    this.loadingEstadisticas = true;
    
    this.api.get('/extensiones/estadisticas/generales').subscribe({
      next: (response: any) => {
        if (response && response.estadisticas) {
          this.estadisticas = response.estadisticas;
        }
        this.loadingEstadisticas = false;
      },
      error: (error: any) => {
        console.error('Error cargando estadísticas:', error);
        this.loadingEstadisticas = false;
      }
    });
  }

  verDetalle(solicitud: SolicitudExtension) {
    this.solicitudSeleccionada = solicitud;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.solicitudSeleccionada = null;
  }

  async marcarEnRevision(solicitud: SolicitudExtension) {
    const confirmed = await this.notificationService.confirm(
      '¿Marcar esta solicitud como "En Revisión"?',
      'Marcar en Revisión',
      'Marcar',
      'Cancelar'
    );
    if (!confirmed) return;
    
    this.loading = true;
    this.error = '';
      
      this.api.put(`/extensiones/${solicitud.id}/revisar`, {}).subscribe({
        next: () => {
          this.mensaje = 'Solicitud marcada en revisión';
          this.cargarSolicitudesPendientes();
          this.cargarEstadisticas();
          setTimeout(() => this.mensaje = '', 3000);
        },
        error: (error: any) => {
          console.error('Error:', error);
          this.error = error.error?.mensaje || 'Error al marcar en revisión';
          this.loading = false;
        }
      });
  }

  abrirModalAprobar(solicitud: SolicitudExtension) {
    this.solicitudSeleccionada = solicitud;
    this.accion = 'aprobar';
    this.comentarios = '';
    this.mostrarModalAccion = true;
  }

  abrirModalRechazar(solicitud: SolicitudExtension) {
    this.solicitudSeleccionada = solicitud;
    this.accion = 'rechazar';
    this.comentarios = '';
    this.mostrarModalAccion = true;
  }

  cerrarModalAccion() {
    this.mostrarModalAccion = false;
    this.solicitudSeleccionada = null;
    this.accion = null;
    this.comentarios = '';
  }

  confirmarAccion() {
    if (!this.solicitudSeleccionada || !this.accion) return;
    
    // ✅ FIX: Usar this.error en lugar de alert() para mejor UX
    if (this.accion === 'rechazar' && (!this.comentarios || this.comentarios.trim().length < 20)) {
      this.error = 'Debes proporcionar un comentario de al menos 20 caracteres al rechazar una solicitud';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    const endpoint = this.accion === 'aprobar' 
      ? `/extensiones/${this.solicitudSeleccionada.id}/aprobar`
      : `/extensiones/${this.solicitudSeleccionada.id}/rechazar`;
    
    const body = {
      comentarios: this.comentarios.trim() || undefined
    };
    
    this.api.put(endpoint, body).subscribe({
      next: (response: any) => {
        this.mensaje = this.accion === 'aprobar' 
          ? 'Solicitud aprobada correctamente'
          : 'Solicitud rechazada correctamente';
        
        this.cerrarModalAccion();
        this.cargarSolicitudesPendientes();
        this.cargarEstadisticas();
        
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.error = error.error?.mensaje || `Error al ${this.accion} la solicitud`;
        this.loading = false;
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: any = {
      'pendiente': 'badge-warning',
      'en_revision': 'badge-info',
      'aprobada': 'badge-success',
      'rechazada': 'badge-danger'
    };
    return classes[estado] || 'badge-secondary';
  }

  getEstadoLabel(estado: string): string {
    const labels: any = {
      'pendiente': 'Pendiente',
      'en_revision': 'En Revisión',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada'
    };
    return labels[estado] || estado;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearFechaCorta(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  volver() {
    window.history.back();
  }
}
