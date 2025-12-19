import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { NotificationService } from '../../services/notification.service';

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
  created_at?: string;
}

interface OpcionReprogramacion {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  disponible: boolean;
}

@Component({
  selector: 'app-gestion-reuniones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-reuniones.component.html',
  styleUrls: ['./gestion-reuniones.component.scss']
})
export class GestionReunionesComponent implements OnInit {
  reuniones: Reunion[] = [];
  reunionesFiltradas: Reunion[] = [];
  opcionesReprogramacion: OpcionReprogramacion[] = [];
  
  // Filtros
  filtroEstado: string = 'todas';
  filtroFecha: string = '';
  busquedaTexto: string = '';
  
  // Estados del componente
  isLoading = false;
  isReprogramando = false;
  showReprogramModal = false;
  reunionSeleccionada: Reunion | null = null;
  
  // Mensajes
  errorMessage = '';
  successMessage = '';
  
  // Datos del usuario
  userRole: string = '';
  
  // Opciones de filtro
  estadosDisponibles = [
    { value: 'todas', label: 'Todas las reuniones' },
    { value: 'programada', label: 'Programadas' },
    { value: 'confirmada', label: 'Confirmadas' },
    { value: 'completada', label: 'Completadas' },
    { value: 'cancelada', label: 'Canceladas' }
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Obtener rol del usuario desde localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.userRole = user.role_id === 1 ? 'estudiante' : 
                    user.role_id === 2 ? 'profesor' : 'admin';
    }
  }

  ngOnInit() {
    this.cargarReuniones();
  }

  cargarReuniones() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getReunionesProgramadas().subscribe({
      next: (response: any) => {
        this.reuniones = response.data || response || [];
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las reuniones';
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros() {
    let reunionesFiltradas = [...this.reuniones];

    // Filtro por estado
    if (this.filtroEstado !== 'todas') {
      reunionesFiltradas = reunionesFiltradas.filter(r => r.estado === this.filtroEstado);
    }

    // Filtro por fecha
    if (this.filtroFecha) {
      reunionesFiltradas = reunionesFiltradas.filter(r => r.fecha === this.filtroFecha);
    }

    // Filtro por texto
    if (this.busquedaTexto.trim()) {
      const texto = this.busquedaTexto.toLowerCase();
      reunionesFiltradas = reunionesFiltradas.filter(r => {
        const nombre = this.userRole === 'estudiante' ? 
          (r.profesor_nombre || '').toLowerCase() : 
          (r.estudiante_nombre || '').toLowerCase();
        const motivo = (r.motivo || '').toLowerCase();
        
        return nombre.includes(texto) || motivo.includes(texto);
      });
    }

    this.reunionesFiltradas = reunionesFiltradas.sort((a, b) => {
      return new Date(b.fecha + 'T' + b.hora_inicio).getTime() - 
             new Date(a.fecha + 'T' + a.hora_inicio).getTime();
    });
  }

  confirmarReunion(reunion: Reunion) {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.confirmarReunion(reunion.id.toString(), {
      confirmado: true
    }).subscribe({
      next: (response: any) => {
        this.successMessage = 'Reunión confirmada exitosamente';
        this.cargarReuniones();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al confirmar la reunión';
        this.isLoading = false;
      }
    });
  }

  async cancelarReunion(reunion: Reunion): Promise<void> {
    const motivo = await this.notificationService.prompt(
      'Motivo de la cancelación (opcional):',
      'Cancelar reunión',
      '',
      'Cancelar reunión',
      'No cancelar'
    );
    
    if (motivo === null) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.cancelarReunion(reunion.id.toString(), {
      motivo: motivo
    }).subscribe({
      next: (response: any) => {
        this.successMessage = 'Reunión cancelada exitosamente';
        this.cargarReuniones();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al cancelar la reunión';
        this.isLoading = false;
      }
    });
  }

  abrirModalReprogramacion(reunion: Reunion) {
    this.reunionSeleccionada = reunion;
    this.showReprogramModal = true;
    this.buscarOpcionesReprogramacion();
  }

  buscarOpcionesReprogramacion() {
    if (!this.reunionSeleccionada) return;

    this.isReprogramando = true;
    this.errorMessage = '';

    // Aquí deberías llamar a un endpoint específico para buscar opciones de reprogramación
    // Por ahora simularemos algunas opciones
    setTimeout(() => {
      this.opcionesReprogramacion = this.generarOpcionesMock();
      this.isReprogramando = false;
    }, 1000);
  }

  generarOpcionesMock(): OpcionReprogramacion[] {
    const opciones: OpcionReprogramacion[] = [];
    const fechaActual = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const fecha = new Date(fechaActual);
      fecha.setDate(fechaActual.getDate() + i);
      
      // Solo días de semana
      if (fecha.getDay() >= 1 && fecha.getDay() <= 5) {
        opciones.push({
          fecha: fecha.toISOString().split('T')[0],
          hora_inicio: '09:00',
          hora_fin: '10:00',
          disponible: Math.random() > 0.3
        });
        
        opciones.push({
          fecha: fecha.toISOString().split('T')[0],
          hora_inicio: '14:00',
          hora_fin: '15:00',
          disponible: Math.random() > 0.3
        });
      }
    }
    
    return opciones.filter(o => o.disponible).slice(0, 6);
  }

  reprogramarReunion(opcion: OpcionReprogramacion) {
    if (!this.reunionSeleccionada) return;

    this.isLoading = true;
    this.errorMessage = '';

    const datosReprogramacion = {
      fecha: opcion.fecha,
      hora_inicio: opcion.hora_inicio,
      hora_fin: opcion.hora_fin,
      motivo_reprogramacion: 'Reprogramación solicitada por el usuario'
    };

    this.apiService.reprogramarReunion(this.reunionSeleccionada.id.toString(), datosReprogramacion).subscribe({
      next: (response: any) => {
        this.successMessage = 'Reunión reprogramada exitosamente';
        this.cerrarModalReprogramacion();
        this.cargarReuniones();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = 'Error al reprogramar la reunión';
        this.isLoading = false;
      }
    });
  }

  cerrarModalReprogramacion() {
    this.showReprogramModal = false;
    this.reunionSeleccionada = null;
    this.opcionesReprogramacion = [];
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'programada': return 'status-programada';
      case 'confirmada': return 'status-confirmada';
      case 'completada': return 'status-completada';
      case 'cancelada': return 'status-cancelada';
      default: return 'status-default';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'programada': return 'Programada';
      case 'confirmada': return 'Confirmada';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
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
    return hora.slice(0, 5);
  }

  esReunionPasada(fecha: string, horaFin: string): boolean {
    const ahora = new Date();
    const fechaReunion = new Date(`${fecha}T${horaFin}`);
    return fechaReunion < ahora;
  }

  esReunionProxima(fecha: string, horaInicio: string): boolean {
    const ahora = new Date();
    const fechaReunion = new Date(`${fecha}T${horaInicio}`);
    const diferencia = fechaReunion.getTime() - ahora.getTime();
    const dosHoras = 2 * 60 * 60 * 1000; // 2 horas en milisegundos
    
    return diferencia > 0 && diferencia <= dosHoras;
  }

  puedeReprogramar(reunion: Reunion): boolean {
    const estados = ['programada', 'confirmada'];
    return estados.includes(reunion.estado) && 
           !this.esReunionPasada(reunion.fecha, reunion.hora_fin);
  }

  puedeConfirmar(reunion: Reunion): boolean {
    if (reunion.estado !== 'programada') return false;
    
    if (this.userRole === 'estudiante') {
      return !reunion.confirmacion_estudiante;
    } else if (this.userRole === 'profesor') {
      return !reunion.confirmacion_profesor;
    }
    
    return false;
  }

  puedeCancelar(reunion: Reunion): boolean {
    const estados = ['programada', 'confirmada'];
    return estados.includes(reunion.estado) && 
           !this.esReunionPasada(reunion.fecha, reunion.hora_fin);
  }

  limpiarFiltros() {
    this.filtroEstado = 'todas';
    this.filtroFecha = '';
    this.busquedaTexto = '';
    this.aplicarFiltros();
  }

  exportarCalendario(reunion: Reunion) {
    const fechaInicio = new Date(`${reunion.fecha}T${reunion.hora_inicio}`);
    const fechaFin = new Date(`${reunion.fecha}T${reunion.hora_fin}`);
    
    const evento = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${fechaInicio.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTEND:${fechaFin.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `SUMMARY:${reunion.motivo}`,
      `DESCRIPTION:Reunión con ${this.userRole === 'estudiante' ? reunion.profesor_nombre : reunion.estudiante_nombre}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([evento], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reunion-${reunion.id}.ics`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  volver() {
    // Usar history.back() para volver a la p�gina anterior sin activar guards
    window.history.back();
  }
}