import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { CalendarModalComponent } from '../../../components/calendar-modal/calendar-modal.component';

@Component({
  selector: 'app-home-profesor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModalComponent
  ],
  templateUrl: './home-profesor.html',
  styleUrls: ['./home-profesor.scss']
})
export class HomeProfesor implements OnInit {
  // Referencia a Math para usar en el template
  mathHelper = Math;
  
  profesor: any = {};
  showUserMenu = false;
  showCalendarioMenu = false;
  estadisticas: any = {
    totalPropuestas: 0,
    pendientes: 0,
    revisadas: 0
  };
  estadisticasProyectos: any = {
    totalProyectos: 0,
    enDesarrollo: 0,
    proximosHitos: 0
  };
  ultimaActividad: string = '';
  showCalendarModal = false;
  fechasCalendario: any[] = [];
  proximasFechas: any[] = [];
  proyectosRecientes: any[] = [];
  proximosHitos: any[] = [];
  
  // Dashboard analytics
  dashboard: any = null;
  loadingDashboard = false;

  // Reuniones
  reunionesHome: any[] = [];
  reunionesExpiradas: any[] = [];
  loadingReuniones = false;
  
  // Propiedades para gestión de hitos
  mostrarGestionHitos = false;
  hitosActivos: any[] = [];
  proyectoSeleccionado: any = null;
  cargandoHitos = false;
  
  // Modal para crear/editar hito
  mostrarModalHito = false;
  hitoEditando: any = null;
  nuevoHito: any = {
    nombre: '',
    descripcion: '',
    tipo_hito: 'desarrollo',
    fecha_objetivo: '',
    peso_en_proyecto: 10,
    es_critico: false
  };

  constructor(private ApiService: ApiService, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Obtener información del profesor desde token
    let rut = '';
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        rut = payload.rut || '';
      } catch (error) {
        rut = '';
      }
    } else {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        this.profesor.nombre = userData.nombre || 'Profesor';
        this.profesor.correo = userData.correo || '';
      }
    }

    if (rut) {
      this.buscarUserByRut(rut);
    }

    // Cargar datos del dashboard
    this.cargarEstadisticasProyectos();
    this.cargarProyectosRecientes();
    this.cargarFechasCalendario();
    this.cargarFechasImportantesProyectos();
    this.cargarDashboard();
    this.cargarReunionesHome();
    
    // Cargar hitos próximos después de cargar proyectos
    setTimeout(() => {
      this.cargarHitosProximos();
    }, 1000);
  }
  
  async cargarDashboard() {
    this.loadingDashboard = true;
    try {
      const response = await this.ApiService.getDashboardProfesor();
      if (response && response.success) {
        this.dashboard = response.data;
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      this.loadingDashboard = false;
    }
  }

  cargarReunionesHome() {
    this.loadingReuniones = true;
    this.ApiService.getReunionesProgramadas().subscribe({
      next: (response: any) => {
        const todas = response.data || [];
        this.reunionesExpiradas = todas.filter((r: any) => r.expirada && r.estado === 'programada');
        const proximas = todas
          .filter((r: any) => !r.expirada && r.estado === 'programada')
          .sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        // Mostrar máx 4: primero expiradas, luego próximas
        this.reunionesHome = [...this.reunionesExpiradas.slice(0, 2), ...proximas].slice(0, 4);
        this.loadingReuniones = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingReuniones = false; }
    });
  }

  getTipoReunionDisplay(tipo: string): string {
    const tipos: { [k: string]: string } = {
      'avance': 'Avance',
      'revision': 'Revisión',
      'seguimiento': 'Seguimiento',
      'defensa': 'Defensa',
      'entrega': 'Entrega',
      'otro': 'Reunión'
    };
    return tipos[tipo] || tipo || 'Reunión';
  }

  getIconoModalidad(modalidad: string): string {
    if (modalidad === 'virtual') return 'fas fa-video';
    if (modalidad === 'hibrida') return 'fas fa-laptop-house';
    return 'fas fa-map-marker-alt';
  }

  formatHora(hora: string): string {
    if (!hora) return '';
    return hora.substring(0, 5); // HH:MM
  }

  getMesAbrev(fecha: string): string {
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return meses[new Date(fecha).getMonth()] ?? '';
  }

  buscarUserByRut(rut: string) {
    this.ApiService.buscaruserByrut(rut).subscribe({
      next: (user: any) => {
        if (user && user.success) {
          this.profesor = user.data;
        }
      },
      error: (error: any) => {
        console.error('Error al buscar usuario:', error);
      }
    });
  }

  cargarEstadisticasProyectos() {
    // Obtener RUT del profesor
    let profesorRut = '';
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        profesorRut = payload.rut || '';
      } catch (error) {
        profesorRut = '';
      }
    }

    if (!profesorRut) {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        profesorRut = userData.rut || '';
      }
    }

    // Cargar propuestas asignadas al profesor
    if (profesorRut) {
      this.ApiService.getPropuestasAsignadasProfesor(profesorRut).subscribe({
        next: (data: any) => {
          if (data && data.success) {
            this.estadisticas = {
              totalPropuestas: data.data.length || 0,
              pendientes: data.data.filter((p: any) => p.estado === 'pendiente').length || 0,
              revisadas: data.data.filter((p: any) => p.estado === 'revisada').length || 0
            };
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => {
          console.error('Error al cargar estadísticas de propuestas:', err);
        }
      });
    }

    // Cargar proyectos asignados
    this.ApiService.getProyectosAsignados().subscribe({
      next: (response: any) => {
        // ✅ FIX: Backend devuelve { total, projects }, no { success, data }
        if (response && response.projects) {
          const listaProyectos = response.projects || [];
          this.estadisticasProyectos.totalProyectos = listaProyectos.length;
          this.estadisticasProyectos.enDesarrollo = listaProyectos.filter((p: any) => 
            p.estado_proyecto?.includes('desarrollo') || p.estado_proyecto?.includes('en_desarrollo')).length;
          
          // Cargar hitos próximos
          this.cargarHitosProximos();
          
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        this.estadisticasProyectos = {
          totalProyectos: 0,
          enDesarrollo: 0,
          proximosHitos: 0
        };
        console.error('Error al cargar estadísticas de proyectos:', error);
      }
    });
  }

  cargarProyectosRecientes() {
    this.ApiService.getProyectosAsignados().subscribe({
      next: (data: any) => {
        if (data && data.projects && Array.isArray(data.projects)) {
          this.proyectosRecientes = data.projects.slice(0, 5).map((proyecto: any) => ({
            ...proyecto,
            estado_visual: this.getEstadoClase(proyecto.estado_proyecto || 'en_desarrollo')
          }));
          
          // Cargar datos reales para cada proyecto
          this.proyectosRecientes.forEach(proyecto => {
            this.cargarDatosProyecto(proyecto);
          });
        } else {
          console.warn('data.projects no es un array:', data);
          this.proyectosRecientes = [];
        }
      },
      error: (error: any) => {
        console.error('Error al cargar proyectos recientes:', error);
        this.proyectosRecientes = [];
      }
    });
  }

  cargarFechasCalendario() {
    this.ApiService.getMisFechasProfesor().subscribe({
      next: (data: any) => {
        this.fechasCalendario = data?.data || [];
        
        // Filtrar próximas fechas importantes
        const fechasProximas = this.fechasCalendario
          .filter((fecha: any) => new Date(fecha.fecha) >= new Date())
          .sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .slice(0, 5)
          .map((fecha: any) => ({
            titulo: fecha.titulo,
            fecha: new Date(fecha.fecha),
            icono: this.getIconoTipoFecha(fecha.tipo_fecha || 'calendario'),
            es_fecha_importante: false
          }));
        
        this.proximasFechas = fechasProximas;
      },
      error: (error: any) => {
        console.error('Error al cargar fechas del calendario:', error);
        this.fechasCalendario = [];
      }
    });
  }

  getEstadoClase(estado: string): string {
    const estados: { [key: string]: string } = {
      'en_desarrollo': 'estado-desarrollo',
      'completado': 'estado-completado',
      'pausado': 'estado-pausado',
      'cancelado': 'estado-cancelado'
    };
    return estados[estado] || estado;
  }

  cargarDatosProyecto(proyecto: any) {
    this.ApiService.getDashboardProyecto(proyecto.id.toString()).subscribe({
      next: (dashboard: any) => {
        if (dashboard && dashboard.success) {
          proyecto.progreso = dashboard.data.progreso ?? dashboard.data.proyecto?.porcentaje_avance ?? 0;
          proyecto.tiempo_transcurrido = this.calcularTiempoTranscurrido(proyecto.fecha_creacion);
          proyecto.prioridad = this.determinarPrioridad(proyecto, dashboard.data);
        }
      },
      error: () => {
        // Error manejado silenciosamente
      }
    });
  }

  calcularTiempoTranscurrido(fechaActividad: string): string {
    const ahora = new Date();
    const fecha = new Date(fechaActividad);
    const diferencia = ahora.getTime() - fecha.getTime();
    
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias < 1) {
      const horas = Math.floor(diferencia / (1000 * 60 * 60));
      return `${horas}h`;
    } else if (dias === 1) {
      return '1 día';
    } else if (dias < 7) {
      return `${dias} días`;
    } else {
      const semanas = Math.floor(dias / 7);
      return `${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
    }
  }

  determinarPrioridad(proyecto: any, dashboard: any): string {
    const hoy = new Date();
    const fechaLimite = proyecto.fecha_limite ? new Date(proyecto.fecha_limite) : null;
    
    if (fechaLimite) {
      const diasRestantes = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      if (diasRestantes <= 7) return 'alta';
      if (diasRestantes <= 30) return 'media';
    }
    
    return 'baja';
  }

  cargarFechasImportantesProyectos() {
    this.ApiService.getProyectosAsignados().subscribe({
      next: (response: any) => {
        // ✅ FIX: Backend devuelve { total, projects }, no { success, data }
        if (response && response.projects) {
          const promesasFechas = response.projects.map((proyecto: any) => 
            this.ApiService.getFechasImportantesProyecto(proyecto.id).toPromise()
              .then((fechasResponse: any) => {
                if (fechasResponse && fechasResponse.success) {
                  return fechasResponse.data.fechas_importantes
                    .filter((fecha: any) => new Date(fecha.fecha_limite) >= new Date())
                    .map((fecha: any) => ({
                      ...fecha,
                      proyecto_titulo: proyecto.titulo,
                      proyecto_id: proyecto.id
                    }));
                }
                return [];
              })
              .catch(() => [])
          );
          
          Promise.all(promesasFechas).then((fechasCombinadas: any[]) => {
            const fechasImportantes = fechasCombinadas.flat().map(fecha => ({
              id: fecha.id,
              titulo: `${fecha.titulo} - ${fecha.proyecto_titulo}`,
              fecha: new Date(fecha.fecha_limite),
              tipo: fecha.tipo_fecha,
              es_fecha_importante: true,
              proyecto_id: fecha.proyecto_id
            }));
            
            this.proximasFechas = [...this.proximasFechas, ...fechasImportantes]
              .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
              .slice(0, 8);
          });
        }
      },
      error: (error: any) => {
        console.error('Error al cargar fechas importantes:', error);
      }
    });
  }

  cargarHitosProximos() {
    this.ApiService.getProyectosAsignados().subscribe({
      next: (response: any) => {
        // ✅ FIX: Backend devuelve { total, projects }, no { success, data }
        if (response && response.projects) {
          response.projects.forEach((proyecto: any) => {
            // Usar el nuevo sistema de cronogramas
            this.ApiService.getCronogramaProyecto(proyecto.id.toString()).subscribe({
              next: (cronogramaResponse: any) => {
                if (cronogramaResponse && cronogramaResponse.success && cronogramaResponse.cronograma) {
                  const cronogramaId = cronogramaResponse.cronograma.id;
                  
                  // Obtener hitos del cronograma
                  this.ApiService.getHitosCronograma(cronogramaId.toString()).subscribe({
                    next: (hitosResponse: any) => {
                      if (hitosResponse && hitosResponse.success && hitosResponse.hitos) {
                        const hitosProximos = hitosResponse.hitos
                          .filter((hito: any) => {
                            const fechaLimite = new Date(hito.fecha_limite);
                            const hoy = new Date();
                            const diasDiferencia = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                            return diasDiferencia <= 30 && diasDiferencia >= 0 && hito.estado !== 'completado';
                          })
                          .slice(0, 5);
                        
                        this.proximosHitos = [...this.proximosHitos, ...hitosProximos]
                          .sort((a, b) => new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime())
                          .slice(0, 5);
                      }
                    },
                    error: () => {
                      // Error manejado silenciosamente
                    }
                  });
                }
              },
              error: () => {
                // Error manejado silenciosamente - proyecto sin cronograma
              }
            });
          });
        }
      },
      error: (error: any) => {
        console.error('Error al cargar proyectos para hitos:', error);
      }
    });
  }

  getIconoTipoFecha(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'entrega': 'fas fa-upload',
      'reunion': 'fas fa-users',
      'presentacion': 'fas fa-presentation',
      'revision': 'fas fa-search',
      'calendario': 'fas fa-calendar'
    };
    return iconos[tipo] || 'fas fa-calendar';
  }

  fechaActual(): Date {
    return new Date();
  }

  formatearFecha(fecha: string | Date): string {
    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatearPorcentaje(porcentaje: number): string {
    return Math.round(porcentaje || 0) + '%';
  }

  formatearEstadoProyecto(estado: string): string {
    const estados: { [key: string]: string } = {
      'en_desarrollo': 'En Desarrollo',
      'completado': 'Completado',
      'pausado': 'Pausado',
      'cancelado': 'Cancelado',
      'propuesta': 'Propuesta',
      'aprobado': 'Aprobado'
    };
    return estados[estado] || estado;
  }

  navegarAHitos() {
    this.router.navigate(['/profesor/cronogramas']);
  }

  navegarAReportes() {
    this.router.navigate(['/profesor/reportes']);
  }

  navegarAFechasImportantes() {
    this.router.navigate(['/profesor/fechas-importantes']);
  }

  abrirModalCrearHito(proyecto?: any) {
    this.proyectoSeleccionado = proyecto;
    this.hitoEditando = null;
    this.nuevoHito = {
      nombre: '',
      descripcion: '',
      tipo_hito: 'desarrollo',
      fecha_objetivo: '',
      peso_en_proyecto: 10,
      es_critico: false
    };
    this.mostrarModalHito = true;
  }

  cerrarModalHito() {
    this.mostrarModalHito = false;
    this.hitoEditando = null;
    this.proyectoSeleccionado = null;
  }

  guardarHito() {
    if (!this.nuevoHito.nombre || !this.nuevoHito.descripcion || !this.nuevoHito.fecha_limite) {
      return;
    }

    const proyectoId = this.hitoEditando?.proyecto_id || this.proyectoSeleccionado?.id;

    if (!proyectoId) {
      console.error('Error: no se encontró un ID de proyecto válido.');
      return;
    }

    if (this.hitoEditando && this.hitoEditando.id) {
      // Actualizar hito existente
      this.ApiService.actualizarHitoProyecto(
        proyectoId.toString(), 
        this.hitoEditando.id.toString(), 
        this.nuevoHito
      ).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.cargarHitosProximos();
            this.cerrarModalHito();
          }
        },
        error: (error: any) => {
          console.error('Error al actualizar hito:', error);
        }
      });
    } else {
      // Crear nuevo hito
      this.ApiService.crearHitoProyecto(
        proyectoId.toString(), 
        this.nuevoHito
      ).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.cargarHitosProximos();
            this.cerrarModalHito();
          }
        },
        error: (error: any) => {
          console.error('Error al crear hito:', error);
        }
      });
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showCalendarioMenu = false;
  }

  toggleCalendarioMenu() {
    this.showCalendarioMenu = !this.showCalendarioMenu;
    this.showUserMenu = false;
  }

  logout() {
    this.ApiService.logout();
    this.router.navigate(['/login']);
  }

  abrirCalendario() {
    this.showCalendarModal = true;
  }

  cerrarCalendario() {
    this.showCalendarModal = false;
  }

  asignarme(id: string) {
    // Obtener el RUT del profesor desde el token o localStorage
    let profesorRut = '';
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        profesorRut = payload.rut || '';
      } catch (error) {
        profesorRut = '';
      }
    }

    if (!profesorRut) {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        profesorRut = userData.rut || '';
      }
    }

    if (!profesorRut) {
      console.error('Error: No se pudo obtener el RUT del profesor');
      return;
    }

    const profesorData = {
      proyecto_id: id,
      profesor_rut: profesorRut,
      tipo_asignacion: 'guia'
    };

    this.ApiService.asignarProfesorAProyecto(profesorData).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          // Recargar estadísticas y proyectos
          this.cargarEstadisticasProyectos();
          this.cargarProyectosRecientes();
        }
      },
      error: (error: any) => {
        console.error('Error al asignar proyecto:', error);
      }
    });
  }

  // Métodos para dashboard de proyectos
  verDashboardProyecto(proyectoId: number) {
    this.router.navigate(['/profesor/proyecto', proyectoId, 'dashboard']);
  }

  // Métodos para gestión de hitos
  cerrarGestionHitos() {
    this.mostrarGestionHitos = false;
    this.proyectoSeleccionado = null;
  }

  seleccionarProyecto(proyecto: any) {
    this.proyectoSeleccionado = proyecto;
    if (proyecto) {
      this.cargarHitosProximos();
    }
  }

  // Métodos para manejo de hitos
  getEstadoHitoClass(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'estado-pendiente',
      'en_progreso': 'estado-en-progreso',
      'completado': 'estado-completado',
      'retrasado': 'estado-retrasado'
    };
    return estados[estado] || 'estado-pendiente';
  }

  esHitoProximo(fechaObjetivo: string): boolean {
    const fecha = new Date(fechaObjetivo);
    const hoy = new Date();
    const diasDiferencia = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasDiferencia <= 7 && diasDiferencia > 0;
  }

  esHitoRetrasado(fechaObjetivo: string, estado: string): boolean {
    if (estado === 'completado') return false;
    const fecha = new Date(fechaObjetivo);
    const hoy = new Date();
    return fecha < hoy;
  }

  getTipoHitoIcon(tipoHito: string): string {
    const iconos: { [key: string]: string } = {
      'entrega': 'fas fa-upload',
      'presentacion': 'fas fa-presentation',
      'revision': 'fas fa-search',
      'milestone': 'fas fa-flag'
    };
    return iconos[tipoHito] || 'fas fa-circle';
  }

  abrirModalEditarHito(hito: any) {
    this.hitoEditando = { ...hito };
    this.nuevoHito = {
      nombre: hito.nombre,
      descripcion: hito.descripcion,
      fecha_limite: hito.fecha_objetivo,
      tipo_hito: hito.tipo_hito || 'milestone'
    };
    this.mostrarModalHito = true;
  }

  completarHito(hito: any) {
    if (!this.proyectoSeleccionado?.id) return;

    const hitoActualizado = {
      ...hito,
      estado: 'completado',
      fecha_completado: new Date().toISOString()
    };

    this.ApiService.actualizarHitoProyecto(
      this.proyectoSeleccionado.id.toString(),
      hito.id.toString(),
      hitoActualizado
    ).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.cargarHitosProximos();
        }
      },
      error: (error: any) => {
        console.error('Error al completar hito:', error);
      }
    });
  }

  diasHastaVencimiento(fechaObjetivo: string): number {
    const fecha = new Date(fechaObjetivo);
    const hoy = new Date();
    return Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Método para navegación general
  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  // Método para navegar a proyectos
  navegarAProyectos() {
    this.router.navigate(['/profesor/proyectos']);
  }

  // Método para navegar a un proyecto específico
  navegarAProyecto(proyectoId: number) {
    if (!proyectoId) return;
    this.router.navigate(['/profesor/proyecto', proyectoId]);
  }

  // Método para cerrar sesión
  cerrarSesion() {
    this.ApiService.logout();
    this.router.navigate(['/login']);
  }

  irAlHome() {
    // Ya estamos en el home de profesor, solo cerramos menús si están abiertos
    this.showUserMenu = false;
    this.showCalendarioMenu = false;
  }
}