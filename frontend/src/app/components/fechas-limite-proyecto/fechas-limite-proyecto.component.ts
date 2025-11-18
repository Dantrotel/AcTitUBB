import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

interface FechaImportante {
  id: number;
  tipo_fecha: string;
  titulo: string;
  descripcion: string;
  fecha_limite: string;
  fecha_limite_extendida?: string;
  permite_extension: boolean;
  requiere_entrega: boolean;
  completada: boolean;
  fecha_realizada?: string;
  creado_por: string;
  creado_por_nombre: string;
  dias_restantes: number;
  estado: 'vigente' | 'vencida' | 'completada';
  puede_subir?: boolean;
  puede_solicitar_extension?: boolean;
  motivo?: string;
  extension?: {
    estado: string;
    dias_extension: number;
    fecha_solicitada: string;
  };
}

@Component({
  selector: 'app-fechas-limite-proyecto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fechas-limite-proyecto.component.html',
  styleUrl: './fechas-limite-proyecto.component.scss'
})
export class FechasLimiteProyectoComponent implements OnInit {
  @Input() proyectoId!: number;
  
  fechas: FechaImportante[] = [];
  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.proyectoId) {
      this.cargarFechas();
    }
  }

  cargarFechas() {
    this.loading = true;
    this.error = '';

    this.api.get(`/fechas-limite/proyecto/${this.proyectoId}`).subscribe({
      next: (response: any) => {
        if (response && response.fechas) {
          this.fechas = response.fechas;
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando fechas:', error);
        this.error = 'Error al cargar las fechas del proyecto';
        this.loading = false;
      }
    });
  }

  subirArchivos(fecha: FechaImportante) {
    // Navegar a la página de subida de documentos
    this.router.navigate([`/estudiante/proyecto/${this.proyectoId}/documentos`], {
      queryParams: { fechaImportanteId: fecha.id }
    });
  }

  solicitarProrroga(fecha: FechaImportante) {
    // Navegar al formulario de solicitud de extensión con datos prellenados
    this.router.navigate(['/estudiante/solicitar-extension'], {
      queryParams: {
        proyectoId: this.proyectoId,
        fechaImportanteId: fecha.id
      }
    });
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: any = {
      'vigente': 'badge-success',
      'vencida': 'badge-danger',
      'completada': 'badge-info'
    };
    return classes[estado] || 'badge-secondary';
  }

  getEstadoLabel(estado: string): string {
    const labels: any = {
      'vigente': 'Vigente',
      'vencida': 'Vencida',
      'completada': 'Completada'
    };
    return labels[estado] || estado;
  }

  getTipoFechaLabel(tipo: string): string {
    const labels: any = {
      'entrega_avance': 'Entrega de Avance',
      'entrega_final': 'Entrega Final',
      'presentacion': 'Presentación',
      'defensa': 'Defensa',
      'revision': 'Revisión',
      'evaluacion': 'Evaluación',
      'hito': 'Hito',
      'deadline': 'Fecha Límite',
      'otro': 'Otro'
    };
    return labels[tipo] || tipo;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDiasRestantesClass(dias: number, estado: string): string {
    if (estado === 'completada') return 'dias-completada';
    if (dias < 0) return 'dias-vencido';
    if (dias === 0) return 'dias-hoy';
    if (dias <= 3) return 'dias-urgente';
    if (dias <= 7) return 'dias-proximo';
    return 'dias-normal';
  }

  getDiasRestantesTexto(dias: number, estado: string): string {
    if (estado === 'completada') return 'Completada';
    if (dias < 0) return `Vencida hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
    if (dias === 0) return 'Vence HOY';
    if (dias === 1) return 'Vence MAÑANA';
    return `${dias} días restantes`;
  }
}
