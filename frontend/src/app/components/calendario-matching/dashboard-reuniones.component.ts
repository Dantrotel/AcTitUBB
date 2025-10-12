import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

interface Reunion {
  id: number;
  estudiante_rut: string;
  profesor_rut: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  motivo: string;
  confirmacion_estudiante: boolean;
  confirmacion_profesor: boolean;
  estudiante_nombre?: string;
  profesor_nombre?: string;
  comentarios?: string;
}

interface SolicitudPendiente {
  id: number;
  estudiante_rut: string;
  profesor_rut: string;
  motivo: string;
  urgencia: string;
  estado: string;
  fecha_solicitud: string;
  estudiante_nombre?: string;
  profesor_nombre?: string;
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

  constructor(private apiService: ApiService) {
    // Obtener rol del usuario desde localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.userRole = user.role_id === 1 ? 'estudiante' : 
                    user.role_id === 2 ? 'profesor' : 'admin';
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
        this.dashboardData = response.data || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar dashboard:', error);
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
        console.error('Error al confirmar reunión:', error);
        this.errorMessage = 'Error al confirmar la reunión';
      }
    });
  }

  cancelarReunion(reunionId: number, motivo?: string) {
    const motivoCancelacion = motivo || prompt('Motivo de cancelación (opcional):') || '';
    
    this.apiService.cancelarReunion(reunionId.toString(), {
      motivo: motivoCancelacion
    }).subscribe({
      next: (response: any) => {
        this.successMessage = 'Reunión cancelada exitosamente';
        this.cargarDashboard();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error al cancelar reunión:', error);
        this.errorMessage = 'Error al cancelar la reunión';
      }
    });
  }

  responderSolicitud(solicitudId: number, respuesta: 'aceptada' | 'rechazada') {
    let comentarios = '';
    if (respuesta === 'rechazada') {
      comentarios = prompt('Motivo del rechazo:') || '';
      if (!comentarios.trim()) {
        this.errorMessage = 'Debe especificar el motivo del rechazo';
        return;
      }
    }

    this.apiService.responderSolicitudReunion(solicitudId.toString(), {
      respuesta,
      comentarios
    }).subscribe({
      next: (response: any) => {
        this.successMessage = `Solicitud ${respuesta} exitosamente`;
        this.cargarDashboard();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error al responder solicitud:', error);
        this.errorMessage = 'Error al responder la solicitud';
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

  puedeResponderSolicitud(solicitud: SolicitudPendiente): boolean {
    return this.userRole === 'profesor' && solicitud.estado === 'pendiente';
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
}