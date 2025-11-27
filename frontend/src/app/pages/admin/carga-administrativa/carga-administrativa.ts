import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api';

interface ProfesorCarga {
  rut: string;
  nombre: string;
  email: string;
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
export class CargaAdministrativaComponent implements OnInit {
  profesores = signal<ProfesorCarga[]>([]);
  estadisticas = signal<EstadisticasCarga | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  
  constructor(private apiService: ApiService) {}
  
  async ngOnInit() {
    await this.cargarDatos();
  }
  
  async cargarDatos() {
    try {
      this.loading.set(true);
      this.error.set(null);
      
      const response = await this.apiService.obtenerCargaProfesores();
      
      this.profesores.set(response.profesores || []);
      this.estadisticas.set(response.estadisticas || null);
      
    } catch (error: any) {
      console.error('Error al cargar carga administrativa:', error);
      this.error.set('Error al cargar la información de carga administrativa');
    } finally {
      this.loading.set(false);
    }
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
