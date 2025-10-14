import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

interface Disponibilidad {
  id?: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  activa: boolean;
  created_at?: string;
}

@Component({
  selector: 'app-disponibilidades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './disponibilidades.component.html',
  styleUrls: ['./disponibilidades.component.scss']
})
export class DisponibilidadesComponent implements OnInit {
  disponibilidades: Disponibilidad[] = [];
  nuevaDisponibilidad: Disponibilidad = {
    dia_semana: '',
    hora_inicio: '',
    hora_fin: '',
    activa: true
  };
  editandoId: number | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miercoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' },
    { value: 'sabado', label: 'Sábado' }
  ];

  horasDisponibles: string[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.generarHorasDisponibles();
  }

  ngOnInit() {
    this.cargarDisponibilidades();
  }

  private generarHorasDisponibles() {
    // Generar horas de 08:00 a 20:00 cada 30 minutos
    for (let hora = 8; hora <= 20; hora++) {
      for (let minuto of [0, 30]) {
        if (hora === 20 && minuto === 30) break; // No incluir 20:30
        const tiempo = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        this.horasDisponibles.push(tiempo);
      }
    }
  }

  cargarDisponibilidades() {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getDisponibilidades().subscribe({
      next: (response: any) => {
        this.disponibilidades = response.data || response || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar disponibilidades:', error);
        this.errorMessage = 'Error al cargar las disponibilidades';
        this.isLoading = false;
      }
    });
  }

  agregarDisponibilidad() {
    if (!this.validarDisponibilidad(this.nuevaDisponibilidad)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.createDisponibilidad(this.nuevaDisponibilidad).subscribe({
      next: (response: any) => {
        this.successMessage = 'Disponibilidad agregada exitosamente';
        this.cargarDisponibilidades();
        this.limpiarFormulario();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error al crear disponibilidad:', error);
        this.errorMessage = error.error?.message || 'Error al crear la disponibilidad';
        this.isLoading = false;
      }
    });
  }

  editarDisponibilidad(disponibilidad: Disponibilidad) {
    this.editandoId = disponibilidad.id || null;
    this.nuevaDisponibilidad = { ...disponibilidad };
  }

  guardarEdicion() {
    if (!this.validarDisponibilidad(this.nuevaDisponibilidad) || !this.editandoId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.updateDisponibilidad(this.editandoId.toString(), this.nuevaDisponibilidad).subscribe({
      next: (response: any) => {
        this.successMessage = 'Disponibilidad actualizada exitosamente';
        this.cargarDisponibilidades();
        this.cancelarEdicion();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error al actualizar disponibilidad:', error);
        this.errorMessage = error.error?.message || 'Error al actualizar la disponibilidad';
        this.isLoading = false;
      }
    });
  }

  eliminarDisponibilidad(id: number) {
    if (!confirm('¿Estás seguro de eliminar esta disponibilidad?')) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.deleteDisponibilidad(id.toString()).subscribe({
      next: (response: any) => {
        this.successMessage = 'Disponibilidad eliminada exitosamente';
        this.cargarDisponibilidades();
        this.isLoading = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error al eliminar disponibilidad:', error);
        this.errorMessage = error.error?.message || 'Error al eliminar la disponibilidad';
        this.isLoading = false;
      }
    });
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.limpiarFormulario();
  }

  private limpiarFormulario() {
    this.nuevaDisponibilidad = {
      dia_semana: '',
      hora_inicio: '',
      hora_fin: '',
      activa: true
    };
  }

  private validarDisponibilidad(disponibilidad: Disponibilidad): boolean {
    if (!disponibilidad.dia_semana) {
      this.errorMessage = 'Debe seleccionar un día de la semana';
      return false;
    }

    if (!disponibilidad.hora_inicio) {
      this.errorMessage = 'Debe seleccionar una hora de inicio';
      return false;
    }

    if (!disponibilidad.hora_fin) {
      this.errorMessage = 'Debe seleccionar una hora de fin';
      return false;
    }

    if (disponibilidad.hora_inicio >= disponibilidad.hora_fin) {
      this.errorMessage = 'La hora de inicio debe ser menor que la hora de fin';
      return false;
    }

    // Validar que no se traslape con otras disponibilidades del mismo día
    const traslape = this.disponibilidades.some(d => {
      if (d.id === this.editandoId) return false; // Ignorar la misma disponibilidad si estamos editando
      if (d.dia_semana !== disponibilidad.dia_semana) return false;
      
      return (disponibilidad.hora_inicio < d.hora_fin && disponibilidad.hora_fin > d.hora_inicio);
    });

    if (traslape) {
      this.errorMessage = 'Ya existe una disponibilidad que se traslapa con este horario';
      return false;
    }

    return true;
  }

  toggleActiva(disponibilidad: Disponibilidad) {
    if (!disponibilidad.id) return;

    const nuevaDisponibilidad = { ...disponibilidad, activa: !disponibilidad.activa };
    
    this.apiService.updateDisponibilidad(disponibilidad.id.toString(), nuevaDisponibilidad).subscribe({
      next: (response: any) => {
        this.cargarDisponibilidades();
        this.successMessage = `Disponibilidad ${nuevaDisponibilidad.activa ? 'activada' : 'desactivada'}`;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        this.errorMessage = 'Error al cambiar el estado de la disponibilidad';
      }
    });
  }

  getDiaLabel(dia: string): string {
    const diaObj = this.diasSemana.find(d => d.value === dia);
    return diaObj ? diaObj.label : dia;
  }

  calcularDuracion(horaInicio: string, horaFin: string): string {
    const inicio = new Date(`2000-01-01T${horaInicio}:00`);
    const fin = new Date(`2000-01-01T${horaFin}:00`);
    const diferencia = fin.getTime() - inicio.getTime();
    const horas = diferencia / (1000 * 60 * 60);
    
    if (horas === 1) {
      return '1 hora';
    } else if (horas < 1) {
      const minutos = Math.round(horas * 60);
      return `${minutos} min`;
    } else {
      const horasEnteras = Math.floor(horas);
      const minutos = Math.round((horas - horasEnteras) * 60);
      return minutos > 0 ? `${horasEnteras}h ${minutos}min` : `${horasEnteras} horas`;
    }
  }

  volver() {
    // Usar history.back() para volver a la página anterior sin activar guards
    window.history.back();
  }
}