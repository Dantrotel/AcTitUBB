import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-retroalimentacion-estudiante',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './retroalimentacion-estudiante.component.html',
  styleUrls: ['./retroalimentacion-estudiante.component.scss']
})
export class RetroalimentacionEstudianteComponent implements OnInit, OnChanges {
  @Input() projectId!: string;
  @Input() cronogramaId!: string;

  hitos: any[] = [];
  revisionesInformante: any[] = [];
  cargando = false;
  error = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (this.projectId) this.cargarDatos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['projectId'] || changes['cronogramaId']) && this.projectId) {
      this.cargarDatos();
    }
  }

  cargarDatos() {
    this.cargando = true;
    this.error = '';

    let hitosLoaded = false;
    let informanteLoaded = false;

    const checkDone = () => {
      if (hitosLoaded && informanteLoaded) this.cargando = false;
    };

    if (this.cronogramaId) {
      this.apiService.getHitosCronograma(this.cronogramaId).subscribe({
        next: (res: any) => {
          const todos = res?.hitos || res?.data || [];
          // Solo hitos que el alumno ya entregó
          this.hitos = todos.filter((h: any) =>
            h.estado && h.estado !== 'pendiente' && h.estado !== 'sin_entrega'
          );
          hitosLoaded = true;
          checkDone();
        },
        error: () => { hitosLoaded = true; checkDone(); }
      });
    } else {
      hitosLoaded = true;
    }

    this.apiService.getRevisionesInformanteProyecto(this.projectId).subscribe({
      next: (res: any) => {
        this.revisionesInformante = res?.data || [];
        informanteLoaded = true;
        checkDone();
      },
      error: () => { informanteLoaded = true; checkDone(); }
    });
  }

  tieneCorreccionesInformante(): boolean {
    return this.revisionesInformante.some(r => r.estado === 'rechazado');
  }

  getRevisionesInformanteParaHito(hitoId: number): any[] {
    return this.revisionesInformante.filter(r => r.hito_id === hitoId);
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'Pendiente',
      entregado: 'Entregado — en revisión',
      pendiente_revision: 'Pendiente de revisión',
      revisado: 'Con correcciones',
      rechazado: 'Correcciones solicitadas',
      aprobado: 'Aprobado'
    };
    return map[estado] || estado;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
