import { Component, signal, afterNextRender, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api';

interface ProfesorCarga {
  rut: string;
  nombre: string;
  email: string;
  guia_icinf: number;
  guia_ieci: number;
  informante_icinf: number;
  informante_ieci: number;
  proyectos_guia: number;
  proyectos_informante: number;
  proyectos_revisor: number;
  proyectos_coguia: number;
  proyectos_sala: number;
  proyectos_corrector: number;
  total_proyectos: number;
}

interface EstadisticasCarga {
  total_profesores: number;
  total_proyectos_activos: number;
  promedio_proyectos_profesor: number;
  max_proyectos_profesor: number;
  min_proyectos_profesor: number;
}

@Component({
  selector: 'app-carga-administrativa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carga-administrativa.html',
  styleUrls: ['./carga-administrativa.scss']
})
export class CargaAdministrativaComponent {
  profesores = signal<ProfesorCarga[]>([]);
  estadisticas = signal<EstadisticasCarga | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly CHART_H = 240;

  maxChartValue = computed(() => {
    const data = this.profesores();
    if (!data.length) return 5;
    const vals = data.flatMap(p => [
      p.guia_icinf || 0, p.guia_ieci || 0,
      p.informante_icinf || 0, p.informante_ieci || 0
    ]);
    return Math.max(1, ...vals);
  });

  yTicks = computed(() => {
    const max = this.maxChartValue();
    const steps = Math.min(max, 5);
    const step = Math.ceil(max / steps) || 1;
    const ticks: number[] = [];
    for (let v = 0; v <= max; v += step) ticks.push(v);
    if (ticks[ticks.length - 1] < max) ticks.push(max);
    return [...new Set(ticks)].reverse();
  });

  constructor(private apiService: ApiService) {
    afterNextRender(() => {
      this.cargarDatos();
    });
  }

  async cargarDatos() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const response = await this.apiService.obtenerCargaProfesores();
      this.profesores.set(response.profesores || []);
      this.estadisticas.set(response.estadisticas || null);
    } catch (error: any) {
      this.error.set('Error al cargar la información de carga administrativa');
    } finally {
      this.loading.set(false);
    }
  }

  barPx(value: number): number {
    const max = this.maxChartValue();
    if (!max || !value) return 0;
    return Math.round((value / max) * this.CHART_H);
  }

  tickPx(tick: number): number {
    const max = this.maxChartValue();
    if (!max) return 0;
    return Math.round((tick / max) * this.CHART_H);
  }

  shortName(nombre: string): string {
    const parts = nombre.trim().split(/\s+/);
    return parts.length <= 2 ? nombre : `${parts[0]} ${parts[1]}`;
  }

  obtenerNivelCarga(total: number): string {
    if (total === 0) return 'sin-carga';
    if (total <= 2) return 'carga-baja';
    if (total <= 5) return 'carga-media';
    return 'carga-alta';
  }

  obtenerTextoNivel(total: number): string {
    if (total === 0) return 'Sin carga';
    if (total <= 2) return 'Carga baja';
    if (total <= 5) return 'Carga media';
    return 'Carga alta';
  }
}

