import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { NotificationService } from '../../services/notification.service';

interface Reunion {
  id: number;
  solicitud_reunion_id: number;
  proyecto_id: number;
  estudiante_rut: string;
  profesor_rut: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_reunion: string;
  titulo: string;
  descripcion?: string;
  lugar?: string;
  modalidad?: string;
  link_reunion?: string;
  estado: string;
  acta_reunion?: string;
  fecha_realizacion?: string;
  estudiante_nombre?: string;
  profesor_nombre?: string;
  proyecto_titulo?: string;
  comentarios_profesor?: string;
  comentarios_estudiante?: string;
  created_at?: string;
  updated_at?: string;
  // Campos legacy (por compatibilidad)
  motivo?: string;
  confirmacion_estudiante?: boolean;
  confirmacion_profesor?: boolean;
  comentarios?: string;
}

interface SolicitudPendiente {
  id: number;
  estudiante_rut: string;
  profesor_rut: string;
  proyecto_id: number;
  fecha_propuesta: string;
  hora_propuesta: string;
  descripcion: string;
  tipo_reunion: string;
  estado: string;
  created_at: string;
  updated_at?: string;
  estudiante_nombre?: string;
  profesor_nombre?: string;
  proyecto_titulo?: string;
}

interface DashboardData {
  reuniones_hoy: Reunion[];
  reuniones_proximas: Reunion[];
  solicitudes_pendientes: SolicitudPendiente[];
  reuniones_por_confirmar: Reunion[];
  estadisticas: {
    total_reuniones: number;
    reuniones_completadas: number;
    reuniones_canceladas: number;
    disponibilidades_activas: number;
  };
}

@Component({
  selector: 'app-dashboard-reuniones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-reuniones.component.html',
  styleUrls: ['./dashboard-reuniones.component.scss']
})
export class DashboardReunionesComponent implements OnInit {
  dashboardData: DashboardData = {
    reuniones_hoy: [],
    reuniones_proximas: [],
    solicitudes_pendientes: [],
    reuniones_por_confirmar: [],
    estadisticas: {
      total_reuniones: 0,
      reuniones_completadas: 0,
      reuniones_canceladas: 0,
      disponibilidades_activas: 0
    }
  };

  userRole: string = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Obtener rol del usuario desde localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      // El JWT usa 'rol_id', no 'role_id'
      const roleId = user.rol_id || user.role_id;
      this.userRole = roleId === 1 ? 'estudiante' : 
                    roleId === 2 ? 'profesor' : 'admin';
    } else {
    }
  }

  ngOnInit() {
    this.cargarDashboard();
  }

  cargarDashboard() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getDashboardReuniones().subscribe({
      next: (response: any) => {
        const data = response.data || response;
        
        // Mapear la estructura del backend al frontend
        // Backend: { solicitudes: { pendientes: [] }, reuniones: { proximas: [] } }
        // Frontend: { solicitudes_pendientes: [], reuniones_proximas: [] }
        this.dashboardData = {
          reuniones_hoy: data.reuniones_hoy || data.reuniones?.hoy || [],
          reuniones_proximas: data.reuniones_proximas || data.reuniones?.proximas || [],
          solicitudes_pendientes: data.solicitudes_pendientes || data.solicitudes?.pendientes || [],
          reuniones_por_confirmar: data.reuniones_por_confirmar || [],
          estadisticas: data.estadisticas || {
            total_reuniones: 0,
            reuniones_completadas: 0,
            reuniones_canceladas: 0,
            disponibilidades_activas: 0
          }
        };
        // Opcional: logs de depuración seguros (no usar literales sueltos)
        // const resumen = {
        //   solicitudes: this.dashboardData.solicitudes_pendientes.length,
        //   reuniones: this.dashboardData.reuniones_proximas.length
        // };
        // console.debug('Resumen dashboard', resumen);

        // Debug: listar reuniones próximas (si es necesario para depuración)
        if (this.dashboardData.reuniones_proximas.length > 0) {
          this.dashboardData.reuniones_proximas.forEach((reunion, idx) => {
            // console.debug(`Reunión ${idx}`, reunion);
          });
        }

        // Debug: listar solicitudes pendientes
        if (this.dashboardData.solicitudes_pendientes.length > 0) {
          this.dashboardData.solicitudes_pendientes.forEach((sol, idx) => {
            // console.debug(`Solicitud ${idx}`, sol);
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar la información del dashboard';
        this.isLoading = false;
      }
    });
  }

  confirmarReunion(reunionId: number) {
    this.apiService.confirmarReunion(reunionId.toString(), {
      confirmado: true
    }).subscribe({
      next: (response: any) => {
        this.successMessage = 'Reunión confirmada exitosamente';
        this.cargarDashboard();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al confirmar la reunión';
      }
    });
  }

  async cancelarReunion(reunionId: number, motivo?: string): Promise<void> {
    let motivoCancelacion = motivo || '';
    
    if (!motivo) {
      const inputMotivo = await this.notificationService.prompt(
        'Motivo de cancelación (opcional):',
        'Cancelar reunión',
        '',
        'Cancelar',
        'No cancelar'
      );
      
      if (inputMotivo === null) return;
      motivoCancelacion = inputMotivo;
    }
    
    this.apiService.cancelarReunion(reunionId.toString(), {
      motivo: motivoCancelacion
    }).subscribe({
      next: (response: any) => {
        this.successMessage = 'Reunión cancelada exitosamente';
        this.cargarDashboard();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al cancelar la reunión';
      }
    });
  }

  async marcarReunionRealizada(reunionId: number): Promise<void> {
    const acta = await this.notificationService.prompt(
      'Resumen de la reunión (opcional):',
      'Marcar como realizada',
      '',
      'Guardar',
      'Cancelar'
    );
    
    if (acta === null) return;
    
    this.apiService.marcarReunionRealizada(reunionId.toString(), {
      acta_reunion: acta
    }).subscribe({
      next: (response: any) => {
        this.successMessage = 'Reunión marcada como realizada exitosamente';
        this.cargarDashboard();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al actualizar la reunión';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  async responderSolicitud(solicitudId: number, respuesta: 'aceptada' | 'rechazada'): Promise<void> {
    let comentarios = '';
    if (respuesta === 'rechazada') {
      const motivo = await this.notificationService.prompt(
        'Motivo del rechazo:',
        'Rechazar solicitud',
        '',
        'Rechazar',
        'Cancelar'
      );
      
      if (motivo === null) return;
      
      comentarios = motivo;
      if (!comentarios.trim()) {
        this.errorMessage = 'Debe especificar el motivo del rechazo';
        setTimeout(() => this.errorMessage = '', 3000);
        return;
      }
    }

    // El backend espera 'aceptar' o 'rechazar', no 'aceptada' o 'rechazada'
    const respuestaBackend = respuesta === 'aceptada' ? 'aceptar' : 'rechazar';
    
    this.isLoading = true;
    this.apiService.responderSolicitudReunion(solicitudId.toString(), {
      respuesta: respuestaBackend,
      comentarios
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        const mensaje = response.message || `Solicitud ${respuesta} exitosamente`;
        this.successMessage = mensaje;
        
        // Si la reunión fue confirmada, mostrar mensaje especial
        if (response.data?.reunion_confirmada) {
          this.successMessage = '¡Reunión confirmada! Se ha agregado a tu calendario.';
        }
        
        // Recargar inmediatamente para reflejar cambios
        this.cargarDashboard();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al responder la solicitud';
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'programada': return 'status-programada';
      case 'confirmada': return 'status-confirmada';
      case 'completada': return 'status-completada';
      case 'cancelada': return 'status-cancelada';
      case 'pendiente': return 'status-pendiente';
      default: return 'status-default';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'programada': return 'Programada';
      case 'confirmada': return 'Confirmada';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'pendiente': return 'Pendiente';
      default: return estado;
    }
  }

  getUrgenciaClass(urgencia: string): string {
    switch (urgencia) {
      case 'alta': return 'urgencia-alta';
      case 'media': return 'urgencia-media';
      case 'baja': return 'urgencia-baja';
      default: return 'urgencia-media';
    }
  }

  getTipoReunionClass(tipo: string): string {
    // Mapear tipos de reunión a clases de urgencia visuales
    switch (tipo?.toLowerCase()) {
      case 'seguimiento': return 'urgencia-media';
      case 'emergencia': return 'urgencia-alta';
      case 'revision': return 'urgencia-media';
      case 'presentacion': return 'urgencia-alta';
      default: return 'urgencia-baja';
    }
  }

  formatearFecha(fecha: string): string {
    const hoy = new Date();
    const fechaReunion = new Date(fecha);
    
    if (fechaReunion.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    }
    
    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);
    if (fechaReunion.toDateString() === mañana.toDateString()) {
      return 'Mañana';
    }

    return fechaReunion.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    return hora.slice(0, 5);
  }

  esHoy(fecha: string): boolean {
    const hoy = new Date();
    const fechaComparar = new Date(fecha);
    return fechaComparar.toDateString() === hoy.toDateString();
  }

  necesitaConfirmacion(reunion: Reunion): boolean {
    if (this.userRole === 'estudiante') {
      return !reunion.confirmacion_estudiante;
    } else if (this.userRole === 'profesor') {
      return !reunion.confirmacion_profesor;
    }
    return false;
  }

  puedeResponderSolicitud(solicitud: any): boolean {
    if (!solicitud) return false;
    
    // El profesor puede responder si está pendiente o esperando su respuesta
    if (this.userRole === 'profesor') {
      return solicitud.estado === 'pendiente' || 
             solicitud.estado === 'aceptada_estudiante';
    }
    
    // El estudiante puede responder si el profesor ya aceptó
    if (this.userRole === 'estudiante') {
      return solicitud.estado === 'aceptada_profesor';
    }
    
    return false;
  }

  getTiempoRestante(fecha: string, horaInicio: string): string {
    const ahora = new Date();
    const fechaReunion = new Date(`${fecha}T${horaInicio}`);
    const diferencia = fechaReunion.getTime() - ahora.getTime();

    if (diferencia <= 0) {
      return 'En curso o finalizada';
    }

    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    if (horas < 1) {
      return `En ${minutos} minutos`;
    } else if (horas < 24) {
      return `En ${horas}h ${minutos}m`;
    } else {
      const dias = Math.floor(horas / 24);
      return `En ${dias} días`;
    }
  }

  getProgreso(): number {
    const total = this.dashboardData.estadisticas.total_reuniones;
    const completadas = this.dashboardData.estadisticas.reuniones_completadas;
    return total > 0 ? Math.round((completadas / total) * 100) : 0;
  }

  volver() {
    // Usar history.back() para volver a la página anterior sin activar guards
    window.history.back();
  }
}