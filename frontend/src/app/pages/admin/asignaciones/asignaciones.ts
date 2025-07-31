import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'asignaciones',
  templateUrl: './asignaciones.html',
  styleUrls: ['./asignaciones.scss']
})
export class AsignacionesComponent implements OnInit {
  asignaciones: any[] = [];
  loading = true;
  error = '';
  filtroProfesor = '';
  filtroEstudiante = '';
  filtroEstado = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarAsignaciones();
  }

  // Método público para cargar asignaciones
  cargarAsignaciones(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getAsignaciones().subscribe({
      next: (data: any) => {
        this.asignaciones = data;
        this.loading = false;
        console.log('Asignaciones cargadas:', data);
      },
      error: (err) => {
        this.error = 'Error al cargar las asignaciones';
        this.loading = false;
        console.error('Error cargando asignaciones:', err);
      }
    });
  }

  // Método para obtener la fecha actual en el footer
  fechaActual(): Date {
    return new Date();
  }

  // Filtros
  get asignacionesFiltradas(): any[] {
    let filtradas = this.asignaciones;

    if (this.filtroProfesor) {
      filtradas = filtradas.filter(a => 
        a.profesor.toLowerCase().includes(this.filtroProfesor.toLowerCase())
      );
    }

    if (this.filtroEstudiante) {
      filtradas = filtradas.filter(a => 
        a.estudiante.toLowerCase().includes(this.filtroEstudiante.toLowerCase())
      );
    }

    if (this.filtroEstado) {
      filtradas = filtradas.filter(a => a.estado === this.filtroEstado);
    }

    return filtradas;
  }

  // Navegación
  volver() {
    this.router.navigate(['/admin']);
  }

  limpiarFiltros() {
    this.filtroProfesor = '';
    this.filtroEstudiante = '';
    this.filtroEstado = '';
  }

  reasignarProfesor(asignacion: any) {
    // Implementar reasignación de profesor
    console.log('Reasignar profesor:', asignacion);
    this.router.navigate(['/admin/asignar-profesor', asignacion.propuesta_id]);
  }

  verDetalle(asignacion: any) {
    // Implementar vista de detalle
    console.log('Ver detalle asignación:', asignacion);
    this.router.navigate(['/propuestas/ver-detalle', asignacion.propuesta_id], {
      queryParams: { from: '/admin/asignaciones' }
    });
  }

  eliminarAsignacion(asignacion: any) {
    if (confirm('¿Estás seguro de que quieres eliminar esta asignación? Esta acción no se puede deshacer.')) {
      this.apiService.eliminarAsignacion(asignacion.asignacion_id).subscribe({
        next: () => {
          alert('Asignación eliminada correctamente');
          this.cargarAsignaciones(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar asignación:', err);
          alert('Error al eliminar la asignación');
        }
      });
    }
  }

  obtenerClaseEstado(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'estado-pendiente';
      case 'en revisión': return 'estado-revision';
      case 'aprobada': return 'estado-aprobada';
      case 'correcciones': return 'estado-correcciones';
      default: return 'estado-default';
    }
  }

  obtenerClaseProgreso(progreso: number): string {
    if (progreso === 100) return 'progreso-completo';
    if (progreso >= 75) return 'progreso-alto';
    if (progreso >= 50) return 'progreso-medio';
    if (progreso >= 25) return 'progreso-bajo';
    return 'progreso-inicial';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 