import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

interface Profesor {
  rut: string;
  nombre: string;
  email: string;
}

interface SolicitudReunion {
  id?: number;
  profesor_rut: string;
  motivo: string;
  duracion_minutos: number;
  urgencia: 'baja' | 'media' | 'alta';
  estado: string;
  fecha_solicitud?: string;
  comentarios_adicionales?: string;
  profesor_nombre?: string;
}

interface OpcionReunion {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  probabilidad_exito: number;
}

@Component({
  selector: 'app-solicitudes-reunion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-reunion.component.html',
  styleUrls: ['./solicitudes-reunion.component.scss']
})
export class SolicitudesReunionComponent implements OnInit {
  profesores: Profesor[] = [];
  solicitudes: SolicitudReunion[] = [];
  opcionesReunion: OpcionReunion[] = [];
  
  nuevaSolicitud: SolicitudReunion = {
    profesor_rut: '',
    motivo: '',
    duracion_minutos: 60,
    urgencia: 'media',
    estado: 'pendiente',
    comentarios_adicionales: ''
  };

  mostrarOpciones = false;
  profesorSeleccionado: Profesor | null = null;
  isLoading = false;
  isBuscandoOpciones = false;
  errorMessage = '';
  successMessage = '';

  motivosComunes = [
    'Reunión de seguimiento de proyecto',
    'Consulta sobre metodología',
    'Revisión de avances',
    'Planificación de objetivos',
    'Resolución de dudas',
    'Otro (especificar en comentarios)'
  ];

  duracionesDisponibles = [
    { value: 30, label: '30 minutos' },
    { value: 60, label: '1 hora' },
    { value: 90, label: '1 hora 30 minutos' },
    { value: 120, label: '2 horas' }
  ];

  nivelesUrgencia = [
    { value: 'baja', label: 'Baja', color: '#48bb78', description: 'Puede esperar más de una semana' },
    { value: 'media', label: 'Media', color: '#ed8936', description: 'Preferible en esta semana' },
    { value: 'alta', label: 'Alta', color: '#f56565', description: 'Urgente, dentro de 2-3 días' }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarProfesores();
    this.cargarSolicitudes();
  }

  cargarProfesores() {
    this.apiService.getProfesores().subscribe({
      next: (response: any) => {
        this.profesores = response.data || response || [];
      },
      error: (error) => {
        console.error('Error al cargar profesores:', error);
        this.errorMessage = 'Error al cargar la lista de profesores';
      }
    });
  }

  cargarSolicitudes() {
    this.isLoading = true;
    this.apiService.getSolicitudesReunion().subscribe({
      next: (response: any) => {
        this.solicitudes = response.data || response || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes:', error);
        this.errorMessage = 'Error al cargar las solicitudes';
        this.isLoading = false;
      }
    });
  }

  onProfesorChange() {
    this.profesorSeleccionado = this.profesores.find(p => p.rut === this.nuevaSolicitud.profesor_rut) || null;
    this.mostrarOpciones = false;
    this.opcionesReunion = [];
  }

  buscarOpcionesReunion() {
    if (!this.validarSolicitud()) {
      return;
    }

    this.isBuscandoOpciones = true;
    this.errorMessage = '';

    const datosBusqueda = {
      profesor_rut: this.nuevaSolicitud.profesor_rut,
      duracion_minutos: this.nuevaSolicitud.duracion_minutos,
      urgencia: this.nuevaSolicitud.urgencia
    };

    this.apiService.buscarReunion(datosBusqueda).subscribe({
      next: (response: any) => {
        this.opcionesReunion = response.data?.opciones || response.opciones || [];
        this.mostrarOpciones = true;
        this.isBuscandoOpciones = false;
        
        if (this.opcionesReunion.length === 0) {
          this.errorMessage = 'No se encontraron horarios disponibles. Intenta con diferentes parámetros.';
        }
      },
      error: (error) => {
        console.error('Error al buscar opciones:', error);
        this.errorMessage = error.error?.message || 'Error al buscar opciones de reunión';
        this.isBuscandoOpciones = false;
        this.mostrarOpciones = false;
      }
    });
  }

  seleccionarOpcion(opcion: OpcionReunion) {
    this.isLoading = true;
    this.errorMessage = '';

    const solicitudCompleta = {
      ...this.nuevaSolicitud,
      fecha_propuesta: opcion.fecha,
      hora_inicio_propuesta: opcion.hora_inicio,
      hora_fin_propuesta: opcion.hora_fin
    };

    this.apiService.crearSolicitudReunion(solicitudCompleta).subscribe({
      next: (response: any) => {
        this.successMessage = 'Solicitud de reunión enviada exitosamente';
        this.cargarSolicitudes();
        this.limpiarFormulario();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error al crear solicitud:', error);
        this.errorMessage = error.error?.message || 'Error al enviar la solicitud';
        this.isLoading = false;
      }
    });
  }

  cancelarSolicitud(solicitudId: number) {
    if (!confirm('¿Estás seguro de cancelar esta solicitud?')) {
      return;
    }

    this.isLoading = true;
    this.apiService.responderSolicitudReunion(solicitudId.toString(), {
      respuesta: 'cancelada',
      comentarios: 'Cancelada por el estudiante'
    }).subscribe({
      next: (response: any) => {
        this.successMessage = 'Solicitud cancelada exitosamente';
        this.cargarSolicitudes();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error al cancelar solicitud:', error);
        this.errorMessage = 'Error al cancelar la solicitud';
        this.isLoading = false;
      }
    });
  }

  private validarSolicitud(): boolean {
    if (!this.nuevaSolicitud.profesor_rut) {
      this.errorMessage = 'Debe seleccionar un profesor';
      return false;
    }

    if (!this.nuevaSolicitud.motivo.trim()) {
      this.errorMessage = 'Debe especificar el motivo de la reunión';
      return false;
    }

    if (!this.nuevaSolicitud.duracion_minutos) {
      this.errorMessage = 'Debe seleccionar la duración de la reunión';
      return false;
    }

    return true;
  }

  private limpiarFormulario() {
    this.nuevaSolicitud = {
      profesor_rut: '',
      motivo: '',
      duracion_minutos: 60,
      urgencia: 'media',
      estado: 'pendiente',
      comentarios_adicionales: ''
    };
    this.profesorSeleccionado = null;
    this.mostrarOpciones = false;
    this.opcionesReunion = [];
  }

  getUrgenciaInfo(urgencia: string) {
    return this.nivelesUrgencia.find(n => n.value === urgencia) || this.nivelesUrgencia[1];
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'status-pending';
      case 'aceptada': return 'status-accepted';
      case 'rechazada': return 'status-rejected';
      case 'cancelada': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptada': return 'Aceptada';
      case 'rechazada': return 'Rechazada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  }

  getProbabilidadClass(probabilidad: number): string {
    if (probabilidad >= 80) return 'prob-high';
    if (probabilidad >= 60) return 'prob-medium';
    return 'prob-low';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(hora: string): string {
    return hora.slice(0, 5); // HH:MM
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}