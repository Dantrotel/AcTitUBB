import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { NotificationService } from '../../services/notification.service';

interface Profesor {
  rut: string;
  nombre: string;
  email: string;
  rol_nombre?: string;
  proyecto_id?: number;
  proyecto_titulo?: string;
}

interface Proyecto {
  id: number;
  titulo: string;
  rol_profesor?: string;
}

interface SolicitudReunion {
  id?: number;
  proyecto_id?: number;
  proyecto_titulo?: string;
  profesor_rut?: string;
  profesor_nombre?: string;
  estudiante_rut?: string;
  estudiante_nombre?: string;
  fecha_propuesta: string;
  hora_propuesta: string;
  duracion_minutos: number;
  tipo_reunion: string;
  descripcion?: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada';
  created_at?: string;
  comentarios_profesor?: string;
}

interface HorarioDisponible {
  id: number;
  profesor_rut: string;
  profesor_nombre: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  fecha_propuesta: string;
  activo: boolean;
  reservado: boolean;
}

@Component({
  selector: 'app-solicitudes-reunion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes-reunion.component.html',
  styleUrls: ['./solicitudes-reunion.component.scss']
})
export class SolicitudesReunionComponent implements OnInit {
  // Listas principales
  profesores: Profesor[] = [];
  solicitudes: SolicitudReunion[] = [];
  horariosDisponibles: HorarioDisponible[] = [];
  
  // Estado de la UI
  profesorSeleccionado: Profesor | null = null;
  proyectoActual: Proyecto | null = null;
  mostrarHorarios = false;
  isLoading = false;
  isCargandoHorarios = false;
  errorMessage = '';
  successMessage = '';
  
  // Rol del usuario
  userRole: string = '';
  
  // Filtros
  diasAdelante = 14;

  // Propiedades computadas para filtros
  get solicitudesPendientes(): SolicitudReunion[] {
    return this.solicitudes.filter(s => s.estado === 'pendiente');
  }

  get solicitudesHistorial(): SolicitudReunion[] {
    return this.solicitudes.filter(s => s.estado !== 'pendiente');
  }

  get countPendientes(): number {
    return this.solicitudesPendientes.length;
  }

  get haySolicitudesPendientes(): boolean {
    return this.countPendientes > 0;
  }

  get haySolicitudesHistorial(): boolean {
    return this.solicitudesHistorial.length > 0;
  }

  // Formulario de nueva reserva
  nuevaReserva = {
    disponibilidad_id: 0,
    proyecto_id: 0,
    fecha_propuesta: '',
    hora_inicio_bloque: '',
    hora_fin_bloque: '',
    tipo_reunion: 'seguimiento',
    descripcion: ''
  };

  // Opciones
  tiposReunion = [
    { value: 'seguimiento', label: 'Seguimiento de proyecto' },
    { value: 'revision_avance', label: 'Revisión de avances' },
    { value: 'orientacion', label: 'Orientación metodológica' },
    { value: 'defensa_parcial', label: 'Defensa parcial' },
    { value: 'otra', label: 'Otra' }
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    // Obtener rol del usuario desde localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      const roleId = user.rol_id || user.role_id;
      this.userRole = roleId === 1 ? 'estudiante' : 
                    roleId === 2 ? 'profesor' : 'admin';
      console.log('👤 User Role detectado:', this.userRole, '(rol_id:', roleId, ')');
    }
  }

  ngOnInit() {
    // Cargar profesores solo para estudiantes
    if (this.userRole === 'estudiante') {
      this.cargarProfesores();
    }
    this.cargarSolicitudes();
  }

  // ==========================================
  // CARGA DE DATOS
  // ==========================================

  cargarProfesores() {
    this.isLoading = true;
    this.apiService.getProfesoresAsignados().subscribe({
      next: (response: any) => {
        console.log('Profesores asignados:', response);
        this.profesores = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar profesores:', error);
        this.errorMessage = 'Error al cargar la lista de profesores';
        this.isLoading = false;
      }
    });
  }

  cargarSolicitudes() {
    console.log('🔄 Cargando solicitudes...');
    this.isLoading = true;
    this.apiService.getMisSolicitudes().subscribe({
      next: (response: any) => {
        console.log('✅ Mis solicitudes (raw):', response);
        this.solicitudes = response.data || [];
        this.isLoading = false;
        
        // Debug: Verificar fecha_propuesta de cada solicitud
        this.solicitudes.forEach((sol, index) => {
          console.log(`Solicitud ${index}:`, {
            id: sol.id,
            fecha_propuesta: sol.fecha_propuesta,
            hora_propuesta: sol.hora_propuesta,
            estado: sol.estado
          });
        });
        
        console.log('📊 Total de solicitudes:', this.solicitudes.length);
        this.cdr.detectChanges(); // Force UI update
      },
      error: (error) => {
        console.error('❌ Error al cargar solicitudes:', error);
        this.isLoading = false;
        this.errorMessage = 'Error al cargar las solicitudes';
        this.cdr.detectChanges(); // Force UI update on error
      }
    });
  }

  cargarHorariosDisponibles(profesorRut: string) {
    console.log('🔄 Cargando horarios disponibles para:', profesorRut);
    this.isCargandoHorarios = true;
    this.errorMessage = '';
    this.horariosDisponibles = [];
    this.cdr.detectChanges();

    this.apiService.getHorariosDisponibles(profesorRut, this.diasAdelante).subscribe({
      next: (response: any) => {
        console.log('✅ Horarios disponibles recibidos:', response);
        this.horariosDisponibles = response.data || [];
        this.proyectoActual = response.proyecto || null;
        this.mostrarHorarios = true;
        this.isCargandoHorarios = false;
        console.log('📊 Total horarios:', this.horariosDisponibles.length);

        if (this.horariosDisponibles.length === 0) {
          this.errorMessage = `${this.profesorSeleccionado?.nombre} no tiene horarios disponibles en los próximos ${this.diasAdelante} días.`;
        }
        
        this.cdr.detectChanges(); // Force UI update
      },
      error: (error) => {
        console.error('❌ Error al cargar horarios:', error);
        this.errorMessage = error.error?.message || 'Error al cargar horarios disponibles';
        this.isCargandoHorarios = false;
        this.mostrarHorarios = false;
        this.cdr.detectChanges(); // Force UI update on error
      }
    });
  }

  // ==========================================
  // EVENTOS DE SELECCIÓN
  // ==========================================

  onProfesorChange() {
    const profesorRut = (document.getElementById('profesor') as HTMLSelectElement)?.value;
    
    if (!profesorRut) {
      this.profesorSeleccionado = null;
      this.mostrarHorarios = false;
      this.horariosDisponibles = [];
      return;
    }

    this.profesorSeleccionado = this.profesores.find(p => p.rut === profesorRut) || null;
    
    if (this.profesorSeleccionado) {
      this.cargarHorariosDisponibles(this.profesorSeleccionado.rut);
    }
  }

  // ==========================================
  // RESERVAR HORARIO
  // ==========================================

  async seleccionarHorario(horario: HorarioDisponible): Promise<void> {
    if (!this.proyectoActual) {
      this.errorMessage = 'No se pudo identificar el proyecto';
      return;
    }

    if (horario.reservado) {
      this.errorMessage = 'Este horario ya está reservado';
      return;
    }

    // Confirmar reserva
    const confirmacion = await this.notificationService.confirm(
      `Profesor: ${this.profesorSeleccionado?.nombre || 'Profesor'}\nFecha: ${this.formatearFecha(horario.fecha_propuesta)}\nHora: ${this.formatearHora(horario.hora_inicio)} - ${this.formatearHora(horario.hora_fin)}\nDía: ${this.capitalizarDia(horario.dia_semana)}`,
      '¿Deseas reservar este horario?',
      'Reservar',
      'Cancelar'
    );

    if (!confirmacion) return;

    this.isLoading = true;
    this.errorMessage = '';

    const reservaData = {
      disponibilidad_id: horario.id,
      proyecto_id: this.proyectoActual.id,
      fecha_propuesta: horario.fecha_propuesta,
      hora_inicio_bloque: horario.hora_inicio,
      hora_fin_bloque: horario.hora_fin,
      tipo_reunion: this.nuevaReserva.tipo_reunion,
      descripcion: this.nuevaReserva.descripcion || `Reunión de ${this.nuevaReserva.tipo_reunion}`
    };

    this.apiService.reservarHorario(reservaData).subscribe({
      next: (response: any) => {
        console.log('Reserva exitosa:', response);
        this.successMessage = '✅ Horario reservado exitosamente. El profesor debe aceptar la solicitud.';
        
        // Recargar datos
        this.cargarSolicitudes();
        if (this.profesorSeleccionado) {
          this.cargarHorariosDisponibles(this.profesorSeleccionado.rut);
        }
        
        // Limpiar formulario
        this.nuevaReserva.descripcion = '';
        this.nuevaReserva.tipo_reunion = 'seguimiento';
        
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        console.error('Error al reservar:', error);
        this.errorMessage = error.error?.message || 'Error al reservar el horario';
        this.isLoading = false;
      }
    });
  }

  // ==========================================
  // CANCELAR RESERVA
  // ==========================================

  async cancelarReserva(solicitudId: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de cancelar esta reserva? El horario quedará disponible nuevamente.',
      'Confirmar cancelación',
      'Sí, cancelar',
      'No'
    );
    
    if (!confirmed) return;

    this.isLoading = true;
    this.apiService.cancelarReserva(solicitudId).subscribe({
      next: (response: any) => {
        this.successMessage = 'Reserva cancelada exitosamente';
        this.cargarSolicitudes();
        
        if (this.profesorSeleccionado) {
          this.cargarHorariosDisponibles(this.profesorSeleccionado.rut);
        }
        
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error al cancelar:', error);
        this.errorMessage = error.error?.message || 'Error al cancelar la reserva';
        this.isLoading = false;
      }
    });
  }

  // ==========================================
  // RESPONDER SOLICITUD (PROFESOR)
  // ==========================================

  async responderSolicitud(solicitudId: number, respuesta: 'aceptar' | 'rechazar'): Promise<void> {
    let comentarios = '';
    if (respuesta === 'rechazar') {
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

    this.isLoading = true;
    this.apiService.responderSolicitudReunion(solicitudId.toString(), { respuesta, comentarios }).subscribe({
      next: (response: any) => {
        this.successMessage = respuesta === 'aceptar' ? 
          '✅ Solicitud aceptada. La reunión se ha agregado al calendario.' :
          '❌ Solicitud rechazada.';
        this.cargarSolicitudes();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        console.error('Error al responder solicitud:', error);
        this.errorMessage = error.error?.message || 'Error al responder la solicitud';
        this.isLoading = false;
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

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
    if (!fecha) return 'Fecha no disponible';
    try {
      // Si viene en formato ISO (2025-11-05T03:00:00.000Z), extraer solo la fecha
      let fechaStr = fecha;
      if (fecha.includes('T')) {
        fechaStr = fecha.split('T')[0]; // Extraer "2025-11-05"
      }
      
      // Parsear manualmente para evitar problemas de timezone
      const [year, month, day] = fechaStr.split('-').map(Number);
      if (!year || !month || !day) return 'Fecha inválida';
      const date = new Date(year, month - 1, day); // month es 0-indexed
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formateando fecha:', fecha, error);
      return 'Fecha inválida';
    }
  }

  formatearFechaCorta(fecha: string): string {
    if (!fecha) return 'N/A';
    try {
      // Si viene en formato ISO (2025-11-05T03:00:00.000Z), extraer solo la fecha
      let fechaStr = fecha;
      if (fecha.includes('T')) {
        fechaStr = fecha.split('T')[0]; // Extraer "2025-11-05"
      }
      
      // Parsear manualmente para evitar problemas de timezone
      const [year, month, day] = fechaStr.split('-').map(Number);
      if (!year || !month || !day) return 'N/A';
      const date = new Date(year, month - 1, day); // month es 0-indexed
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    } catch (error) {
      console.error('Error formateando fecha corta:', fecha, error);
      return 'N/A';
    }
  }

  formatearHora(hora: string): string {
    return hora.slice(0, 5); // HH:MM
  }

  capitalizarDia(dia: string): string {
    return dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase();
  }

  getDiaClass(dia: string): string {
    const dias: { [key: string]: string } = {
      'lunes': 'dia-lunes',
      'martes': 'dia-martes',
      'miercoles': 'dia-miercoles',
      'jueves': 'dia-jueves',
      'viernes': 'dia-viernes',
      'sabado': 'dia-sabado',
      'domingo': 'dia-domingo'
    };
    return dias[dia.toLowerCase()] || '';
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'pendiente': return '⏳';
      case 'aceptada_profesor': return '👨‍🏫';
      case 'aceptada_estudiante': return '🎓';
      case 'confirmada': return '✅';
      case 'rechazada': return '❌';
      case 'cancelada': return '🚫';
      default: return '❓';
    }
  }

  getEstadoIconClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'fas fa-clock';
      case 'aceptada_profesor': return 'fas fa-user-check';
      case 'aceptada_estudiante': return 'fas fa-user-graduate';
      case 'confirmada': return 'fas fa-check-circle';
      case 'rechazada': return 'fas fa-times-circle';
      case 'cancelada': return 'fas fa-ban';
      default: return 'fas fa-question-circle';
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  trackById(index: number, item: any): number {
    return item.id || index;
  }

  volver() {
    window.history.back();
  }
}