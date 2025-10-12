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
  rolesProfesores: any[] = [];
  profesores: any[] = [];
  proyectos: any[] = [];
  estadisticasAsignaciones: any = null;
  historialAsignaciones: any[] = [];
  
  loading = true;
  error = '';
  filtroProfesor = '';
  filtroEstudiante = '';
  filtroEstado = '';
  filtroRol = '';
  
  // Estados de carga específicos
  loadingEstadisticas = false;
  loadingHistorial = false;
  loadingAsignacion = false;
  
  // Formulario para nueva asignación
  mostrarFormulario = false;
  nuevaAsignacion = {
    proyecto_id: '',
    profesor_rut: '',
    rol_profesor_id: '',
    observaciones: ''
  };

  // Modal de vista de asignaciones por proyecto
  mostrarModalProyecto = false;
  proyectoSeleccionado: any = null;
  asignacionesProyecto: any[] = [];

  // Propiedades para filtros de proyectos
  proyectosFiltrados: any[] = [];
  filtroProyectos: string = '';
  filtroEstadoProyecto: string = '';

  // Tabs
  tabActiva = 'asignaciones'; // 'asignaciones', 'proyectos', 'estadisticas', 'historial'

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.cargarAsignaciones();
    this.cargarRolesProfesores();
    this.cargarProfesores();
    this.cargarProyectos();
    this.cargarEstadisticas();
  }

  cargarRolesProfesores() {
    this.apiService.getRolesProfesores().subscribe({
      next: (data: any) => {
        this.rolesProfesores = data.roles || [];
      },
      error: (err) => {
        console.error('Error cargando roles de profesores:', err);
      }
    });
  }

  cargarProfesores() {
    this.apiService.getProfesores().subscribe({
      next: (data: any) => {
        this.profesores = data || [];
      },
      error: (err) => {
        console.error('Error cargando profesores:', err);
      }
    });
  }

  cargarProyectos() {
    // Usar el endpoint correcto de proyectos para admin
    this.apiService.getAllProyectos().subscribe({
      next: (response: any) => {
        console.log('✅ Proyectos cargados:', response);
        if (response && response.projects) {
          this.proyectos = response.projects;
        } else {
          this.proyectos = Array.isArray(response) ? response : [];
        }
        this.proyectosFiltrados = [...this.proyectos];
      },
      error: (err: any) => {
        console.error('❌ Error cargando proyectos:', err);
        // Fallback a propuestas si no hay proyectos
        this.cargarProyectosFallback();
      }
    });
  }

  cargarProyectosFallback() {
    this.apiService.getPropuestas().subscribe({
      next: (data: any) => {
        this.proyectos = (data || []).filter((p: any) => p.estado === 'aprobada');
        console.log('⚠️ Usando propuestas como fallback para proyectos:', this.proyectos.length);
      },
      error: (err: any) => {
        console.error('❌ Error cargando propuestas fallback:', err);
        this.proyectos = [];
      }
    });
  }

  cargarEstadisticas() {
    this.loadingEstadisticas = true;
    console.log('🔄 Cargando estadísticas de asignaciones...');
    
    this.apiService.getEstadisticasAsignaciones().subscribe({
      next: (data: any) => {
        console.log('✅ Estadísticas cargadas:', data);
        this.estadisticasAsignaciones = data.estadisticas || null;
        this.loadingEstadisticas = false;
      },
      error: (err: any) => {
        console.error('❌ Error cargando estadísticas:', err);
        this.loadingEstadisticas = false;
      }
    });
  }

  cargarHistorial() {
    this.loadingHistorial = true;
    console.log('🔄 Cargando historial de asignaciones...');
    
    this.apiService.getHistorialAsignaciones().subscribe({
      next: (data: any) => {
        console.log('✅ Historial cargado:', data);
        this.historialAsignaciones = data.historial || [];
        this.loadingHistorial = false;
      },
      error: (err: any) => {
        console.error('❌ Error cargando historial:', err);
        this.loadingHistorial = false;
      }
    });
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

  // ============= MÉTODOS PARA NUEVAS ASIGNACIONES CON ROLES =============

  cambiarTab(tab: string) {
    this.tabActiva = tab;
    if (tab === 'historial' && this.historialAsignaciones.length === 0) {
      this.cargarHistorial();
    }
  }

  mostrarFormularioAsignacion() {
    this.mostrarFormulario = true;
    this.nuevaAsignacion = {
      proyecto_id: '',
      profesor_rut: '',
      rol_profesor_id: '',
      observaciones: ''
    };
  }

  ocultarFormularioAsignacion() {
    this.mostrarFormulario = false;
  }

  crearAsignacion() {
    if (!this.nuevaAsignacion.proyecto_id || !this.nuevaAsignacion.profesor_rut || !this.nuevaAsignacion.rol_profesor_id) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    this.loadingAsignacion = true;
    console.log('🔄 Creando asignación:', this.nuevaAsignacion);

    this.apiService.asignarProfesorAProyecto(this.nuevaAsignacion).subscribe({
      next: (data: any) => {
        console.log('✅ Asignación creada:', data);
        alert('Profesor asignado exitosamente');
        this.ocultarFormularioAsignacion();
        this.cargarAsignaciones();
        this.cargarEstadisticas();
        this.loadingAsignacion = false;
      },
      error: (err: any) => {
        console.error('❌ Error al crear asignación:', err);
        alert(err.error?.message || 'Error al asignar profesor');
        this.loadingAsignacion = false;
      }
    });
  }

  desasignarProfesor(asignacion: any) {
    const observaciones = prompt('Observaciones sobre la desasignación (opcional):');
    
    if (confirm(`¿Está seguro de desasignar a ${asignacion.profesor_nombre} del rol ${asignacion.rol_nombre}?`)) {
      console.log('🔄 Desasignando profesor:', asignacion);
      
      this.apiService.desasignarProfesorDeProyecto(asignacion.id, observaciones || undefined).subscribe({
        next: () => {
          console.log('✅ Profesor desasignado exitosamente');
          alert('Profesor desasignado exitosamente');
          this.cargarAsignaciones();
          this.cargarEstadisticas();
        },
        error: (err: any) => {
          console.error('❌ Error al desasignar profesor:', err);
          alert(err.error?.message || 'Error al desasignar profesor');
        }
      });
    }
  }

  // ============= MÉTODOS PARA VISTA POR PROYECTO =============

  verAsignacionesProyecto(proyecto: any) {
    this.proyectoSeleccionado = proyecto;
    this.mostrarModalProyecto = true;
    this.cargarAsignacionesProyecto(proyecto.id);
  }

  cargarAsignacionesProyecto(proyectoId: string) {
    console.log('🔄 Cargando asignaciones del proyecto:', proyectoId);
    
    this.apiService.getAsignacionesProyecto(proyectoId).subscribe({
      next: (response: any) => {
        console.log('✅ Asignaciones del proyecto cargadas:', response);
        this.asignacionesProyecto = response.asignaciones || [];
      },
      error: (err: any) => {
        console.error('❌ Error cargando asignaciones del proyecto:', err);
        this.asignacionesProyecto = [];
      }
    });
  }

  cerrarModalProyecto() {
    this.mostrarModalProyecto = false;
    this.proyectoSeleccionado = null;
    this.asignacionesProyecto = [];
  }

  // ============= MÉTODOS DE UTILIDAD =============

  getRolColor(rolNombre: string): string {
    const colores: any = {
      'profesor_revisor': '#6c757d',
      'profesor_guia': '#007bff',
      'profesor_co_guia': '#28a745',
      'profesor_informante': '#ffc107',
      'profesor_sala': '#dc3545',
      'profesor_corrector': '#17a2b8',
      'profesor_externo': '#6f42c1'
    };
    return colores[rolNombre] || '#6c757d';
  }

  filtrarAsignaciones() {
    return this.asignaciones.filter((asignacion: any) => {
      const matchProfesor = !this.filtroProfesor || 
        asignacion.profesor_nombre?.toLowerCase().includes(this.filtroProfesor.toLowerCase());
      const matchEstudiante = !this.filtroEstudiante || 
        asignacion.proyecto_titulo?.toLowerCase().includes(this.filtroEstudiante.toLowerCase());
      const matchRol = !this.filtroRol || asignacion.rol_nombre === this.filtroRol;
      
      return matchProfesor && matchEstudiante && matchRol;
    });
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

  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  // Métodos para proyectos
  aplicarFiltroProyectos() {
    this.proyectosFiltrados = this.proyectos.filter(proyecto => {
      const cumpleFiltroTexto = !this.filtroProyectos || 
        proyecto.titulo?.toLowerCase().includes(this.filtroProyectos.toLowerCase()) ||
        proyecto.descripcion?.toLowerCase().includes(this.filtroProyectos.toLowerCase()) ||
        proyecto.estudiante_nombre?.toLowerCase().includes(this.filtroProyectos.toLowerCase());
      
      const cumpleFiltroEstado = !this.filtroEstadoProyecto || 
        proyecto.estado === this.filtroEstadoProyecto;
      
      return cumpleFiltroTexto && cumpleFiltroEstado;
    });
  }

  getEstadoDisplay(estado: string): string {
    const estados: { [key: string]: string } = {
      'propuesta': 'Propuesta',
      'en_desarrollo': 'En Desarrollo',
      'en_revision': 'En Revisión',
      'finalizado': 'Finalizado'
    };
    return estados[estado] || estado;
  }

  contarAsignacionesProyecto(proyectoId: number): number {
    return this.asignaciones.filter(a => a.proyecto_id === proyectoId).length;
  }

  getAsignacionesProyecto(proyectoId: number): any[] {
    return this.asignaciones.filter(a => a.proyecto_id === proyectoId);
  }

  asignarProfesorAProyecto(proyecto: any) {
    this.nuevaAsignacion.proyecto_id = proyecto.id;
    this.mostrarFormularioAsignacion();
  }

  formatRolName(rolName: string): string {
    return rolName.replace('profesor_', '').replace('_', ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  volver() {
    this.router.navigate(['/admin']);
  }
} 