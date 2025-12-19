import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

interface MiembroComision {
  id: number;
  profesor_rut: string;
  profesor_nombre: string;
  profesor_email: string;
  rol_comision: 'presidente' | 'secretario' | 'vocal' | 'suplente';
  fecha_designacion: string;
  observaciones?: string;
}

interface EstadoComision {
  total_miembros: number;
  tiene_presidente: boolean;
  tiene_secretario: boolean;
  vocales: number;
  completa: boolean;
}

@Component({
  selector: 'app-comision-proyecto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './comision-proyecto.component.html',
  styleUrl: './comision-proyecto.component.scss'
})
export class ComisionProyectoComponent implements OnInit {
  @Input() proyectoId!: number;
  
  comision: MiembroComision[] = [];
  estadoComision: EstadoComision | null = null;
  loading = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    if (this.proyectoId) {
      this.cargarComision();
    }
  }

  cargarComision() {
    this.loading = true;
    this.error = '';
    
    this.api.get(`/comision/proyecto/${this.proyectoId}`).subscribe({
      next: (response: any) => {
        if (response && response.comision) {
          this.comision = response.comision;
          this.estadoComision = response.estado_comision;
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error.error?.mensaje || error.message || 'Error al cargar la comisión';
        this.loading = false;
      }
    });
  }

  getRolLabel(rol: string): string {
    const labels: any = {
      'presidente': 'Presidente',
      'secretario': 'Secretario',
      'vocal': 'Vocal',
      'suplente': 'Suplente'
    };
    return labels[rol] || rol;
  }

  getRolClass(rol: string): string {
    return `badge-${rol}`;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
