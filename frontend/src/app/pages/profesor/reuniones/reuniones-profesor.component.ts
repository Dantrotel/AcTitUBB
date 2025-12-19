import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

interface Reunion {
  id: number;
  titulo: string;
  estudiante_nombre: string;
  estudiante_rut: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_reunion: string;
  descripcion?: string;
  estado: 'programada' | 'realizada' | 'cancelada';
  expirada: boolean;
  lugar?: string;
  modalidad?: 'presencial' | 'virtual' | 'hibrida';
  acta_reunion?: string;
  proyecto_titulo?: string;
}

@Component({
  selector: 'app-reuniones-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reuniones-profesor.component.html',
  styleUrls: ['./reuniones-profesor.component.scss']
})
export class ReunionesProfesorComponent implements OnInit {
  // Listas de reuniones
  reunionesExpiradas: Reunion[] = [];
  reunionesProximas: Reunion[] = [];
  reunionesRealizadas: Reunion[] = [];
  reunionesCanceladas: Reunion[] = [];
  
  // Estado de la UI
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Modal para marcar como realizada
  mostrarModalRealizada = false;
  reunionSeleccionada: Reunion | null = null;
  actaReunion = '';
  lugarReunion = '';
  modalidadReunion: 'presencial' | 'virtual' | 'hibrida' = 'presencial';
  
  // Filtros
  filtroActivo: 'expiradas' | 'proximas' | 'realizadas' | 'canceladas' = 'expiradas';

  constructor(
    private api: ApiService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit() {
    this.cargarReuniones();
  }
  
  cargarReuniones() {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.api.getReunionesProgramadas().subscribe({
      next: (response: any) => {
        const todasReuniones = response.data || [];
        
        // Filtrar por categorías
        this.reunionesExpiradas = todasReuniones.filter((r: Reunion) => 
          r.expirada && r.estado === 'programada'
        );
        
        this.reunionesProximas = todasReuniones.filter((r: Reunion) => 
          !r.expirada && r.estado === 'programada'
        );
        
        this.reunionesRealizadas = todasReuniones.filter((r: Reunion) => 
          r.estado === 'realizada'
        );
        
        this.reunionesCanceladas = todasReuniones.filter((r: Reunion) => 
          r.estado === 'cancelada'
        );
        
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error al cargar las reuniones';
        this.isLoading = false;
      }
    });
  }
  
  cambiarFiltro(filtro: 'expiradas' | 'proximas' | 'realizadas' | 'canceladas') {
    this.filtroActivo = filtro;
  }
  
  abrirModalRealizada(reunion: Reunion) {
    this.reunionSeleccionada = reunion;
    this.actaReunion = '';
    this.lugarReunion = reunion.lugar || '';
    this.modalidadReunion = reunion.modalidad || 'presencial';
    this.mostrarModalRealizada = true;
  }
  
  cerrarModal() {
    this.mostrarModalRealizada = false;
    this.reunionSeleccionada = null;
    this.actaReunion = '';
    this.lugarReunion = '';
    this.modalidadReunion = 'presencial';
  }
  
  marcarComoRealizada() {
    if (!this.reunionSeleccionada) return;
    
    if (!this.actaReunion.trim()) {
      this.errorMessage = 'Por favor ingresa un resumen de la reunión';
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const data = {
      acta_reunion: this.actaReunion,
      lugar: this.lugarReunion || undefined,
      modalidad: this.modalidadReunion
    };
    
    this.api.marcarReunionRealizada(this.reunionSeleccionada.id.toString(), data).subscribe({
      next: () => {
        this.successMessage = 'Reunión marcada como realizada exitosamente';
        this.cerrarModal();
        this.cargarReuniones();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al marcar la reunión como realizada';
        this.isLoading = false;
      }
    });
  }
  
  async cancelarReunion(reunion: Reunion) {
    const confirmed = await this.notificationService.confirm(
      `¿Estás seguro de que deseas cancelar la reunión con ${reunion.estudiante_nombre}?`,
      'Cancelar Reunión',
      'Cancelar',
      'Volver'
    );
    
    if (!confirmed) return;
    
    const motivo = await this.notificationService.prompt(
      'Motivo de cancelación (opcional):',
      'Motivo de Cancelación',
      'Reunión no realizada',
      'Aceptar',
      'Omitir'
    );
    
    this.isLoading = true;
    this.errorMessage = '';
    
    const data = {
      motivo: motivo || 'Reunión no realizada'
    };
    
    this.api.cancelarReunion(reunion.id.toString(), data).subscribe({
      next: () => {
        this.successMessage = 'Reunión cancelada exitosamente';
        this.cargarReuniones();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al cancelar la reunión';
        this.isLoading = false;
      }
    });
  }
  
  // Utilidades
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    try {
      let fechaStr = fecha;
      if (fecha.includes('T')) {
        fechaStr = fecha.split('T')[0];
      }
      const [year, month, day] = fechaStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return fecha;
    }
  }
  
  formatearHora(hora: string): string {
    return hora ? hora.slice(0, 5) : '';
  }
  
  getTipoReunionLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'seguimiento': 'Seguimiento',
      'revision_avance': 'Revisión de Avance',
      'orientacion': 'Orientación',
      'defensa_parcial': 'Defensa Parcial',
      'otra': 'Otra'
    };
    return tipos[tipo] || tipo;
  }
  
  getModalidadIcon(modalidad?: string): string {
    switch (modalidad) {
      case 'presencial': return 'fa-building';
      case 'virtual': return 'fa-video';
      case 'hibrida': return 'fa-circle-half-stroke';
      default: return 'fa-question';
    }
  }
  
  getContadorReuniones(): { [key: string]: number } {
    return {
      expiradas: this.reunionesExpiradas.length,
      proximas: this.reunionesProximas.length,
      realizadas: this.reunionesRealizadas.length,
      canceladas: this.reunionesCanceladas.length
    };
  }
}
