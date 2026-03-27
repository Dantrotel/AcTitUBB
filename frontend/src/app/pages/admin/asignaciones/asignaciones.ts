import { Component, OnInit, ChangeDetectorRef, NgZone, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

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
    proyecto_id: '' as string | number | null, // String vacío inicial, se convierte a number al enviar
    profesor_rut: '',
    rol_profesor_id: '' as string | number | null, // String vacío inicial, se convierte a number al enviar
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
  tabActiva = 'proyectos'; // 'proyectos', 'estadisticas', 'historial'

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private ngZone: NgZone,
    private appRef: ApplicationRef
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
      this.apiService.getRolesProfesores().subscribe({
        next: (response: any) => {
          this.rolesProfesores = response.data || response || [];
          resolve(true);
        },
        error: (err) => {
          console.error('❌ Error cargando roles de profesores:', err);
          this.error = 'Error al cargar los roles de profesores';
          resolve(true); // resuelve igual para no bloquear la cadena
        }
      });
    });
  }

  cargarProfesoresPromise(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.apiService.getProfesores().subscribe({
        next: (data: any) => {
          const usuarios = Array.isArray(data) ? data : [];
          this.profesores = usuarios.filter((u: any) => {
            const esProfesor = u.rol_nombre?.toLowerCase() === 'profesor' || u.rol_id === 2;
            const esAdmin = u.rol_nombre?.toLowerCase() === 'admin' || u.rol_id === 3;
            return esProfesor || esAdmin;
          });
          resolve(true);
        },
        error: (err) => {
          console.error('Error cargando profesores:', err);
          resolve(true);
        }
      });
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
    this.cdr.detectChanges();
    console.log('🔄 Cargando estadísticas de asignaciones de profesores...');
    
    // Usar el método específico para estadísticas de asignaciones-profesores
    this.apiService.getEstadisticasAsignacionesProfesores().subscribe({
      next: (response: any) => {
        console.log('✅ Estadísticas de asignaciones-profesores cargadas:', response);
        this.estadisticasAsignaciones = response.data || response.estadisticas || response;
        this.loadingEstadisticas = false;
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error cargando estadísticas fallback:', err);
        this.loadingEstadisticas = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarHistorial() {
    this.loadingHistorial = true;
    this.cdr.detectChanges();
    console.log('🔄 Cargando historial de asignaciones...');
    
    this.apiService.getHistorialAsignaciones().subscribe({
      next: (data: any) => {
        console.log('✅ Historial cargado:', data);
        this.historialAsignaciones = data.historial || [];
        this.loadingHistorial = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error cargando historial:', err);
        this.loadingHistorial = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Método público para cargar asignaciones
  cargarAsignaciones(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    // Usar el método específico para asignaciones de profesores
    this.apiService.getAllAsignacionesProfesores().subscribe({
      next: (response: any) => {
        console.log('✅ Asignaciones de profesores cargadas:', response);
        this.asignaciones = response.data || response || [];
        this.loading = false;
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
        console.log('⚠️ Asignaciones cargadas con fallback:', data);
      },
      error: (err) => {
        this.error = 'Error al cargar las asignaciones. Verifique su conexión.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('❌ Error cargando asignaciones fallback:', err);
      }
    });
  }

  // Método para obtener la fecha actual en el footer
  fechaActual(): Date {
    return new Date();
  }

  limpiarFiltros() {
    this.filtroProfesor = '';
    this.filtroEstudiante = '';
    this.filtroEstado = '';
    this.filtroRol = '';
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

  async eliminarAsignacion(asignacion: any): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que quieres eliminar esta asignación? Esta acción no se puede deshacer.',
      'Eliminar Asignación',
      'Eliminar',
      'Cancelar'
    );
    if (!confirmed) return;

    this.apiService.eliminarAsignacion(asignacion.asignacion_id).subscribe({
      next: () => {
        this.notificationService.success('Asignación eliminada correctamente');
        this.cargarAsignaciones();
      },
      error: (err) => {
        console.error('Error al eliminar asignación:', err);
        this.notificationService.error('Error al eliminar asignación', 'No fue posible eliminar la asignación seleccionada. Intente nuevamente.');
      }
    });
  }

  // ============= MÉTODOS PARA NUEVAS ASIGNACIONES CON ROLES =============

  cambiarTab(tab: string) {
    this.tabActiva = tab;
    if (tab === 'historial' && this.historialAsignaciones.length === 0) {
      this.cargarHistorial();
    }
  }

  mostrarFormularioAsignacion() {
    console.log('📋 Abriendo formulario de asignación');
    console.log('📊 Proyectos disponibles:', this.proyectos);
    console.log('👥 Profesores disponibles:', this.profesores);
    console.log('🎭 Roles disponibles:', this.rolesProfesores);
    
    this.mostrarFormulario = true;
    this.nuevaAsignacion = {
      proyecto_id: '',
      profesor_rut: '',
      rol_profesor_id: '',
      observaciones: ''
    };
  }

  // Getter para filtrar roles según la carrera del estudiante
  get rolesFiltrados(): any[] {
    if (!this.nuevaAsignacion.proyecto_id) {
      // Si no hay proyecto seleccionado, mostrar todos menos el de sala
      return this.rolesProfesores.filter(rol => rol.id !== 3);
    }

    const proyectoId = Number(this.nuevaAsignacion.proyecto_id);
    const proyecto = this.proyectos.find(p => 
      (p.proyecto_id || p.id) === proyectoId
    );

    if (!proyecto) {
      return this.rolesProfesores.filter(rol => rol.id !== 3);
    }

    // Si el proyecto es de ICINF (código de carrera ICINF), mostrar todos los roles
    const esICINF = proyecto.codigo_carrera === 'ICINF' || 
                    proyecto.carrera_codigo === 'ICINF' ||
                    proyecto.carrera_nombre?.includes('Civil');

    if (esICINF) {
      // ICINF puede tener Profesor de Sala (rol 3)
      return this.rolesProfesores;
    } else {
      // IECI NO puede tener Profesor de Sala (filtrar rol 3)
      return this.rolesProfesores.filter(rol => rol.id !== 3);
    }
  }

  ocultarFormularioAsignacion() {
    this.mostrarFormulario = false;
  }

  crearAsignacion() {
    console.log('📝 Valores del formulario antes de convertir:', {
      proyecto_id: this.nuevaAsignacion.proyecto_id,
      profesor_rut: this.nuevaAsignacion.profesor_rut,
      rol_profesor_id: this.nuevaAsignacion.rol_profesor_id,
      tipos: {
        proyecto_id: typeof this.nuevaAsignacion.proyecto_id,
        profesor_rut: typeof this.nuevaAsignacion.profesor_rut,
        rol_profesor_id: typeof this.nuevaAsignacion.rol_profesor_id
      }
    });
    
    // Convertir valores del formulario a tipos correctos
    const proyecto_id = this.nuevaAsignacion.proyecto_id ? Number(this.nuevaAsignacion.proyecto_id) : null;
    const rol_profesor_id = this.nuevaAsignacion.rol_profesor_id ? Number(this.nuevaAsignacion.rol_profesor_id) : null;
    
    console.log('🔢 Valores después de convertir:', { proyecto_id, rol_profesor_id });
    
    // Validar después de la conversión
    if (!proyecto_id || !this.nuevaAsignacion.profesor_rut || !rol_profesor_id) {
      console.log('❌ Validación falló:', { proyecto_id, profesor_rut: this.nuevaAsignacion.profesor_rut, rol_profesor_id });
      this.notificationService.warning('Campos incompletos', 'Debe seleccionar el proyecto, el profesor y el rol antes de continuar.');
      return;
    }
    
    // Preparar datos para enviar
    const asignacionData = {
      proyecto_id,
      profesor_rut: this.nuevaAsignacion.profesor_rut,
      rol_profesor_id
    };
    
    this.loadingAsignacion = true;
    this.cdr.detectChanges();
    
    console.log('🔄 Creando asignación profesor-proyecto:', asignacionData);
    this.apiService.asignarProfesorAProyecto(asignacionData).subscribe({
      next: (response: any) => {
        console.log('✅ Asignación profesor-proyecto creada:', response);
        this.notificationService.success('Profesor asignado exitosamente al proyecto');
        this.ocultarFormularioAsignacion();
        this.cargarAsignaciones();
        this.cargarProyectos(); // ✅ Recargar proyectos para actualizar la información del profesor guía
        this.cargarEstadisticas();
        this.loadingAsignacion = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error al crear asignación profesor-proyecto:', err);
        this.notificationService.error('Error al asignar profesor', err.error?.message || err.message || 'No fue posible asignar el profesor al proyecto. Intente nuevamente.');
        this.loadingAsignacion = false;
        this.cdr.detectChanges();
      }
    });
  }

  async desasignarProfesor(asignacion: any): Promise<void> {
    console.log('🎯 Botón desasignar presionado para:', asignacion);
    
    // Ejecutar dentro de NgZone para asegurar que Angular detecte los cambios
    this.ngZone.run(async () => {
      try {
        // Forzar actualización de la UI antes del modal
        this.appRef.tick();
        this.cdr.detectChanges();
        
        // Pequeño delay para asegurar que la UI esté lista
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const confirmed = await this.notificationService.confirm(
          `¿Está seguro de desasignar a ${asignacion.profesor_nombre} del proyecto ${asignacion.proyecto_titulo}?`,
          'Desasignar Profesor',
          'Desasignar',
          'Cancelar'
        );
        
        console.log('📋 Usuario confirmó:', confirmed);
        
        if (!confirmed) {
          console.log('❌ Operación cancelada por el usuario');
          return;
        }

        console.log('🔄 Desasignando profesor de proyecto:', asignacion);
        
        // Mostrar indicador de carga
        this.loadingAsignacion = true;
        this.cdr.detectChanges();
        
        this.apiService.desasignarProfesorDeProyecto(asignacion.proyecto_id, asignacion.profesor_rut).subscribe({
          next: (response: any) => {
            console.log('✅ Profesor desasignado del proyecto exitosamente:', response);
            
            this.ngZone.run(() => {
              this.notificationService.success('Profesor desasignado exitosamente del proyecto');
              
              // Recargar asignaciones
              this.cargarAsignaciones();
              this.cargarEstadisticas();
              
              // Si hay un modal abierto con asignaciones del proyecto, recargarlo también
              if (this.mostrarModalProyecto && this.proyectoSeleccionado) {
                this.cargarAsignacionesProyecto(this.proyectoSeleccionado.id);
              }
              
              // Forzar detección de cambios
              this.loadingAsignacion = false;
              this.cdr.detectChanges();
            });
          },
          error: (err: any) => {
            console.error('❌ Error al desasignar profesor del proyecto:', err);
            this.ngZone.run(() => {
              this.notificationService.error('Error al desasignar profesor', err.error?.message || err.message || 'No fue posible desasignar al profesor del proyecto. Intente nuevamente.');
              this.loadingAsignacion = false;
              this.cdr.detectChanges();
            });
          }
        });
      } catch (error) {
        console.error('❌ Error en desasignarProfesor:', error);
      }
    });
  }

  // ============= MÉTODOS PARA VISTA POR PROYECTO =============

  verAsignacionesProyecto(proyecto: any) {
    this.proyectoSeleccionado = proyecto;
    this.mostrarModalProyecto = true;
    this.cargarAsignacionesProyecto(String(proyecto.id));
  }

  cargarAsignacionesProyecto(proyectoId: string) {
    console.log('🔄 Cargando asignaciones del proyecto:', proyectoId);
    this.apiService.getProfesoresProyecto(proyectoId).subscribe({
      next: (response: any) => {
        console.log('✅ Profesores del proyecto cargados:', response);
        this.asignacionesProyecto = response.data || response || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('❌ Error cargando profesores del proyecto:', err);
        this.asignacionesProyecto = [];
        this.cdr.detectChanges();
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
      'profesor_asignatura': '#ffc107',
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
      const matchEstado = !this.filtroEstado || asignacion.estado === this.filtroEstado;

      return matchProfesor && matchEstudiante && matchRol && matchEstado;
    });
  }

  obtenerClaseEstado(estado: string): string {
    if (!estado) return 'estado-default';
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
    if (!estado) return 'Sin estado';
    const estados: { [key: string]: string } = {
      'propuesta': 'Propuesta',
      'en_desarrollo': 'En Desarrollo',
      'en_revision': 'En Revisión',
      'finalizado': 'Finalizado'
    };
    return estados[estado] || estado;
  }

  contarAsignacionesProyecto(proyectoId: number): number {
    return this.asignaciones.filter(a => Number(a.proyecto_id) === Number(proyectoId)).length;
  }

  getAsignacionesProyecto(proyectoId: number): any[] {
    return this.asignaciones.filter(a => Number(a.proyecto_id) === Number(proyectoId));
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