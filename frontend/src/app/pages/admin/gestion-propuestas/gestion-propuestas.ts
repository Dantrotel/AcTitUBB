import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';
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
  userName = '';
  viewMode: 'admin' | 'superadmin' = 'admin';
  backRoute = '/admin';
  
  propuestaSeleccionada: any = null;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Obtener viewMode de la ruta
    this.viewMode = this.route.snapshot.data['viewMode'] || 'admin';
    this.backRoute = this.route.snapshot.data['backRoute'] || '/admin';
    
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.nombre || (this.viewMode === 'superadmin' ? 'Super Administrador' : 'Jefe de Curso');
    }
    this.cargarPropuestas();
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

  // Método público para cargar propuestas
  cargarPropuestas(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.apiService.getPropuestas().subscribe({
      next: (data: any) => {
        // Log detallado de la primera propuesta para ver la estructura
        if (data.length > 0) {
        }
        this.propuestas = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar las propuestas';
        this.loading = false;
        this.cdr.detectChanges();
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

  async eliminarPropuesta(id: number) {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que quieres eliminar esta propuesta? Esta acción no se puede deshacer.',
      'Eliminar Propuesta',
      'Eliminar',
      'Cancelar'
    );
    
    if (!confirmed) return;
    
    this.apiService.deletePropuesta(id.toString()).subscribe({
      next: () => {
        this.notificationService.success('Propuesta eliminada exitosamente');
        this.cargarPropuestas(); // Recargar la lista
      },
      error: (err) => {
        this.notificationService.error('Error al eliminar la propuesta');
      }
    });
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
