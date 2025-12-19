import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'gestion-proyectos',
  templateUrl: './gestion-proyectos.component.html',
  styleUrls: ['./gestion-proyectos.component.scss']
})
export class GestionProyectosComponent implements OnInit {
  proyectos: any[] = [];
  loading = true;
  error = '';
  filtroEstado = '';
  filtroEstudiante = '';
  filtroProfesor = '';

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarProyectos();
  }

  // Método público para cargar proyectos
  cargarProyectos(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.apiService.getProyectos().subscribe({
      next: (data: any) => {
        console.log('🔍 Admin - Proyectos cargados:', data);
        // La respuesta viene en formato { total, projects, usuario_rol }
        const proyectos = data.projects || data;
        // Log detallado del primer proyecto para ver la estructura
        if (proyectos.length > 0) {
          console.log('🔍 Admin - Estructura del primer proyecto:', JSON.stringify(proyectos[0], null, 2));
        }
        this.proyectos = proyectos;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('🔍 Admin - Error al cargar proyectos:', err);
        this.error = 'Error al cargar los proyectos';
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
  get proyectosFiltrados(): any[] {
    let filtrados = this.proyectos;

    if (this.filtroEstado) {
      filtrados = filtrados.filter(p => p.estado === this.filtroEstado || p.estado_nombre === this.filtroEstado);
    }

    if (this.filtroEstudiante) {
      filtrados = filtrados.filter(p => 
        p.estudiante_nombre?.toLowerCase().includes(this.filtroEstudiante.toLowerCase()) ||
        p.estudiante_rut?.includes(this.filtroEstudiante)
      );
    }

    if (this.filtroProfesor) {
      filtrados = filtrados.filter(p => 
        p.profesor_guia?.toLowerCase().includes(this.filtroProfesor.toLowerCase()) ||
        p.profesor_rut?.includes(this.filtroProfesor)
      );
    }

    return filtrados;
  }

  // Navegación
  asignarColaborador(id: number) {
    // Navegar directamente a la pestaña de colaboradores del proyecto
    this.router.navigate(['/profesor/proyecto', id], {
      queryParams: { tab: 'colaboradores', from: '/admin/proyectos' }
    });
  }

  verCronograma(id: number) {
    // Navegar directamente a la vista del proyecto con pestaña de cronograma
    this.router.navigate(['/profesor/proyecto', id], {
      queryParams: { tab: 'cronograma', from: '/admin/proyectos' }
    });
  }

  asignarProfesor(id: number) {
    // Navegar a la página de asignaciones con el proyecto pre-seleccionado
    this.router.navigate(['/admin/asignaciones'], {
      queryParams: { proyectoId: id }
    });
  }

  async eliminarProyecto(id: number) {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer y eliminará todos los datos relacionados (colaboradores, fechas, avances, etc.).',
      'Eliminar Proyecto',
      'Eliminar',
      'Cancelar'
    );
    
    if (!confirmed) return;
    
    this.apiService.deleteProyecto(id.toString()).subscribe({
      next: () => {
        console.log('Proyecto eliminado exitosamente');
        this.notificationService.success('Proyecto eliminado exitosamente');
        this.cargarProyectos(); // Recargar la lista
      },
      error: (err) => {
        console.error('Error al eliminar proyecto:', err);
        this.notificationService.error('Error al eliminar el proyecto');
      }
    });
  }

  volver() {
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
      'en_desarrollo': 'En Desarrollo',
      'en_revision': 'En Revisión',
      'finalizado': 'Finalizado',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado',
      'pausado': 'Pausado',
      'cancelado': 'Cancelado'
    };
    return estadosMap[estado] || estado;
  }

  obtenerClaseEstado(estado: string | undefined): string {
    if (!estado) return 'estado-sin-estado';
    
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'en_desarrollo' || estadoLower === 'en desarrollo') return 'estado-desarrollo';
    if (estadoLower === 'en_revision' || estadoLower === 'en revisión') return 'estado-revision';
    if (estadoLower === 'finalizado') return 'estado-finalizado';
    if (estadoLower === 'aprobado') return 'estado-aprobado';
    if (estadoLower === 'rechazado') return 'estado-rechazado';
    if (estadoLower === 'pausado') return 'estado-pausado';
    if (estadoLower === 'cancelado') return 'estado-cancelado';
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

  calcularProgreso(proyecto: any): number {
    // Si el proyecto tiene un campo de progreso, usarlo
    if (proyecto.progreso !== undefined && proyecto.progreso !== null) {
      return proyecto.progreso;
    }
    
    // Si no, calcular basándose en el estado
    const estadoLower = (proyecto.estado || '').toLowerCase();
    if (estadoLower === 'finalizado' || estadoLower === 'aprobado') return 100;
    if (estadoLower === 'en_revision' || estadoLower === 'en revisión') return 80;
    if (estadoLower === 'en_desarrollo' || estadoLower === 'en desarrollo') return 50;
    return 25;
  }

  obtenerColorProgreso(progreso: number): string {
    if (progreso >= 80) return '#28a745'; // Verde
    if (progreso >= 50) return '#ffc107'; // Amarillo
    if (progreso >= 25) return '#17a2b8'; // Azul
    return '#6c757d'; // Gris
  }
}

