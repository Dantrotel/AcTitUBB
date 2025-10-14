import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'gestion-propuestas',
  templateUrl: './gestion-propuestas.html',
  styleUrls: ['./gestion-propuestas.scss']
})
export class GestionPropuestasComponent implements OnInit {
  propuestas: any[] = [];
  loading = true;
  error = '';
  filtroEstado = '';
  filtroEstudiante = '';
  filtroProfesor = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarPropuestas();
  }

  // Método público para cargar propuestas
  cargarPropuestas(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getPropuestas().subscribe({
      next: (data: any) => {
        console.log('🔍 Admin - Propuestas cargadas:', data);
        // Log detallado de la primera propuesta para ver la estructura
        if (data.length > 0) {
          console.log('🔍 Admin - Estructura de la primera propuesta:', JSON.stringify(data[0], null, 2));
        }
        this.propuestas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('🔍 Admin - Error al cargar propuestas:', err);
        this.error = 'Error al cargar las propuestas';
        this.loading = false;
      }
    });
  }

  // Método para obtener la fecha actual en el footer
  fechaActual(): Date {
    return new Date();
  }

  // Filtros
  get propuestasFiltradas(): any[] {
    let filtradas = this.propuestas;

    if (this.filtroEstado) {
      filtradas = filtradas.filter(p => p.estado === this.filtroEstado);
    }

    if (this.filtroEstudiante) {
      filtradas = filtradas.filter(p => 
        p.nombre_estudiante?.toLowerCase().includes(this.filtroEstudiante.toLowerCase()) ||
        p.estudiante_rut?.includes(this.filtroEstudiante)
      );
    }

    if (this.filtroProfesor) {
      filtradas = filtradas.filter(p => 
        p.nombre_profesor?.toLowerCase().includes(this.filtroProfesor.toLowerCase()) ||
        p.profesor_rut?.includes(this.filtroProfesor)
      );
    }

    return filtradas;
  }

  // Navegación
  verDetalle(id: number) {
    this.router.navigate(['/propuestas/ver-detalle', id], {
      queryParams: { from: '/admin/propuestas' }
    });
  }

  editarPropuesta(id: number) {
    this.router.navigate(['/propuestas/editar-propuesta', id]);
  }

  asignarProfesor(id: number) {
    this.router.navigate(['/admin/asignar-profesor', id]);
  }

  eliminarPropuesta(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta propuesta? Esta acción no se puede deshacer.')) {
      this.apiService.deletePropuesta(id.toString()).subscribe({
        next: () => {
          console.log('Propuesta eliminada exitosamente');
          this.cargarPropuestas(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar propuesta:', err);
          alert('Error al eliminar la propuesta');
        }
      });
    }
  }

  volver() {
    // Usar history.back() para volver a la p�gina anterior sin activar guards
    window.history.back();
  }

  limpiarFiltros() {
    this.filtroEstado = '';
    this.filtroEstudiante = '';
    this.filtroProfesor = '';
  }

  obtenerEstadoDisplay(estado: string | undefined): string {
    if (!estado) return 'Sin Estado';
    
    const estadosMap: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_revision': 'En Revisión',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'correcciones': 'Correcciones'
    };
    return estadosMap[estado] || estado;
  }

  obtenerClaseEstado(estado: string | undefined): string {
    if (!estado) return 'estado-sin-estado';
    
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'pendiente') return 'estado-pendiente';
    if (estadoLower === 'en_revision') return 'estado-revision';
    if (estadoLower === 'aprobada') return 'estado-aprobada';
    if (estadoLower === 'rechazada') return 'estado-rechazada';
    if (estadoLower === 'correcciones') return 'estado-correcciones';
    return 'estado-sin-estado';
  }

  formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
} 