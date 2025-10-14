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
    rol_profesor_id: '', // Cambiado de rol_profesor_id a rol_profesor_id consistente
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
    console.log('🚀 Iniciando carga de datos del componente asignaciones...');
    
    // Cargar en paralelo los datos básicos
    Promise.all([
      this.cargarRolesProfesoresPromise(),
      this.cargarProfesoresPromise()
    ]).then(() => {
      console.log('✅ Datos básicos cargados, procediendo con datos complejos...');
      this.cargarAsignaciones();
      this.cargarProyectos();
      this.cargarEstadisticas();
    }).catch(error => {
      console.error('❌ Error en carga inicial:', error);
    });
  }

  cargarRolesProfesoresPromise(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cargarRolesProfesores();
      // Simplificamos para usar la función existente
      resolve(true);
    });
  }

  cargarProfesoresPromise(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.cargarProfesores();
      resolve(true);
    });
  }

  cargarRolesProfesores() {
    console.log('🔄 Iniciando carga de roles de profesores...');
    this.apiService.getRolesProfesores().subscribe({
      next: (response: any) => {
        console.log('📦 Respuesta completa del servidor:', response);
        this.rolesProfesores = response.data || response || [];
        console.log('✅ Roles de profesores cargados:', this.rolesProfesores);
        console.log('📊 Total de roles:', this.rolesProfesores.length);
        
        if (this.rolesProfesores.length === 0) {
          console.warn('⚠️ No se encontraron roles de profesores');
        }
      },
      error: (err) => {
        console.error('❌ Error cargando roles de profesores:', err);
        console.error('📋 Detalles del error:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        this.error = 'Error al cargar los roles de profesores';
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
    console.log('🔄 Cargando estadísticas de asignaciones de profesores...');
    
    // Usar el método específico para estadísticas de asignaciones-profesores
    this.apiService.getEstadisticasAsignacionesProfesores().subscribe({
      next: (response: any) => {
        console.log('✅ Estadísticas de asignaciones-profesores cargadas:', response);
        this.estadisticasAsignaciones = response.data || response.estadisticas || response;
        this.loadingEstadisticas = false;
      },
      error: (err: any) => {
        console.error('❌ Error cargando estadísticas asignaciones-profesores:', err);
        // Fallback al método anterior
        this.cargarEstadisticasFallback();
      }
    });
  }

  cargarEstadisticasFallback() {
    this.apiService.getEstadisticasAsignaciones().subscribe({
      next: (data: any) => {
        console.log('⚠️ Estadísticas cargadas con fallback:', data);
        this.estadisticasAsignaciones = data.estadisticas || null;
        this.loadingEstadisticas = false;
      },
      error: (err: any) => {
        console.error('❌ Error cargando estadísticas fallback:', err);
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

    // Usar el método específico para asignaciones de profesores
    this.apiService.getAllAsignacionesProfesores().subscribe({
      next: (response: any) => {
        console.log('✅ Asignaciones de profesores cargadas:', response);
        this.asignaciones = response.data || response || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error cargando asignaciones de profesores:', err);
        // Fallback al método anterior si falla
        this.cargarAsignacionesFallback();
      }
    });
  }

  // Método fallback usando el sistema anterior
  cargarAsignacionesFallback(): void {
    console.log('⚠️ Usando método fallback para cargar asignaciones');
    this.apiService.getAsignaciones().subscribe({
      next: (data: any) => {
        this.asignaciones = data;
        this.loading = false;
        console.log('⚠️ Asignaciones cargadas con fallback:', data);
      },
      error: (err) => {
        this.error = 'Error al cargar las asignaciones. Verifique su conexión.';
        this.loading = false;
        console.error('❌ Error cargando asignaciones fallback:', err);
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
    console.log('🔄 Creando asignación profesor-proyecto:', this.nuevaAsignacion);

    // Usar el método específico para crear asignaciones profesor-proyecto
    this.apiService.crearAsignacionProfesorProyecto(this.nuevaAsignacion).subscribe({
      next: (response: any) => {
        console.log('✅ Asignación profesor-proyecto creada:', response);
        alert('Profesor asignado exitosamente al proyecto');
        this.ocultarFormularioAsignacion();
        this.cargarAsignaciones();
        this.cargarEstadisticas();
        this.loadingAsignacion = false;
      },
      error: (err: any) => {
        console.error('❌ Error al crear asignación profesor-proyecto:', err);
        // Fallback al método anterior si falla
        this.crearAsignacionFallback();
      }
    });
  }

  crearAsignacionFallback() {
    this.apiService.asignarProfesorAProyecto(this.nuevaAsignacion).subscribe({
      next: (data: any) => {
        console.log('⚠️ Asignación creada con fallback:', data);
        alert('Profesor asignado exitosamente');
        this.ocultarFormularioAsignacion();
        this.cargarAsignaciones();
        this.cargarEstadisticas();
        this.loadingAsignacion = false;
      },
      error: (err: any) => {
        console.error('❌ Error al crear asignación fallback:', err);
        alert(err.error?.message || 'Error al asignar profesor');
        this.loadingAsignacion = false;
      }
    });
  }

  desasignarProfesor(asignacion: any) {
    const observaciones = prompt('Observaciones sobre la desasignación (opcional):');
    
    if (confirm(`¿Está seguro de desasignar a ${asignacion.profesor_nombre} del proyecto ${asignacion.proyecto_titulo}?`)) {
      console.log('🔄 Desasignando profesor de proyecto:', asignacion);
      
      // Usar el método específico para desasignar profesor-proyecto
      this.apiService.eliminarAsignacionProfesorProyecto(asignacion.id).subscribe({
        next: (response: any) => {
          console.log('✅ Profesor desasignado del proyecto exitosamente:', response);
          alert('Profesor desasignado exitosamente del proyecto');
          this.cargarAsignaciones();
          this.cargarEstadisticas();
        },
        error: (err: any) => {
          console.error('❌ Error al desasignar profesor del proyecto:', err);
          // Fallback al método anterior si falla
          this.desasignarProfesorFallback(asignacion, observaciones);
        }
      });
    }
  }

  desasignarProfesorFallback(asignacion: any, observaciones: string | null) {
    this.apiService.desasignarProfesorDeProyecto(asignacion.id, observaciones || undefined).subscribe({
      next: () => {
        console.log('⚠️ Profesor desasignado con fallback');
        alert('Profesor desasignado exitosamente');
        this.cargarAsignaciones();
        this.cargarEstadisticas();
      },
      error: (err: any) => {
        console.error('❌ Error al desasignar profesor fallback:', err);
        alert(err.error?.message || 'Error al desasignar profesor');
      }
    });
  }

  // ============= MÉTODOS PARA VISTA POR PROYECTO =============

  verAsignacionesProyecto(proyecto: any) {
    this.proyectoSeleccionado = proyecto;
    this.mostrarModalProyecto = true;
    this.cargarAsignacionesProyecto(proyecto.id);
  }

  cargarAsignacionesProyecto(proyectoId: string) {
    console.log('🔄 Cargando asignaciones del proyecto:', proyectoId);
    
    // Usar el método específico para obtener profesores de un proyecto
    this.apiService.getProfesoresProyecto(proyectoId).subscribe({
      next: (response: any) => {
        console.log('✅ Profesores del proyecto cargados:', response);
        this.asignacionesProyecto = response.data || response || [];
      },
      error: (err: any) => {
        console.error('❌ Error cargando profesores del proyecto:', err);
        // Fallback al método anterior
        this.cargarAsignacionesProyectoFallback(proyectoId);
      }
    });
  }

  cargarAsignacionesProyectoFallback(proyectoId: string) {
    this.apiService.getAsignacionesProyecto(proyectoId).subscribe({
      next: (response: any) => {
        console.log('⚠️ Asignaciones del proyecto cargadas con fallback:', response);
        this.asignacionesProyecto = response.asignaciones || [];
      },
      error: (err: any) => {
        console.error('❌ Error cargando asignaciones del proyecto fallback:', err);
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
    // Usar history.back() para volver a la página anterior sin activar guards
    window.history.back();
  }
} 