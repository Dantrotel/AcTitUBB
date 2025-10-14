import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api';
import { CalendarModalComponent } from '../../../components/calendar-modal/calendar-modal.component';

@Component({
  selector: 'app-home-profesor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CalendarModalComponent
  ],
  templateUrl: './home-profesor.html',
  styleUrls: ['./home-profesor.scss']
})
export class HomeProfesor implements OnInit {
  profesor: any = {};
  showUserMenu = false;
  showCalendarioMenu = false;
  estadisticas: any = {
    totalPropuestas: 0,
    pendientes: 0,
    revisadas: 0
  };
  // Nuevas estadísticas de proyectos
  estadisticasProyectos: any = {
    totalProyectos: 0,
    enDesarrollo: 0,
    proximosHitos: 0,
    evaluacionesPendientes: 0
  };
  ultimaActividad: string = '';
  showCalendarModal = false;
  fechasCalendario: any[] = [];
  proximasFechas: any[] = [];
  // Nuevos datos de proyectos
  proyectosRecientes: any[] = [];
  proximosHitos: any[] = [];
  
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

  // Math para usar en template
  Math = Math;

  constructor(private ApiService: ApiService, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    let rut = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        rut = payload.rut || '';
      } catch {
        rut = '';
      }
    }

    if (rut) {
      this.buscarUserByRut(rut);
    } else {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        this.profesor.nombre = userData.nombre || 'Profesor';
        this.profesor.correo = userData.correo || '';
      } else {
        this.profesor.nombre = 'Profesor';
      }
    }

    this.cargarEstadisticas();
    this.cargarEstadisticasProyectos();
    this.cargarProyectosRecientes();
    this.cargarFechasCalendario();
    this.cargarFechasImportantesProyectos();
    
    // Cargar hitos próximos después de cargar proyectos
    setTimeout(() => {
      this.cargarHitosProximos();
    }, 1000);
  }

  buscarUserByRut(rut: string) {
    this.ApiService.buscaruserByrut(rut).subscribe({
      next: (res: any) => {
        this.profesor = res;
      },
      error: () => {
        this.profesor.nombre = 'Profesor';
      }
    });
  }

  cargarEstadisticas() {
    // Cargar estadísticas del profesor
    this.ApiService.getPropuestas().subscribe({
      next: (data: any) => {
        this.estadisticas.totalPropuestas = data.length || 0;
        this.estadisticas.pendientes = data.filter((p: any) => p.estado === 'Pendiente').length || 0;
        this.estadisticas.revisadas = data.filter((p: any) => p.estado !== 'Pendiente').length || 0;
        
        // Simular última actividad
        this.ultimaActividad = 'Hace 2 días';
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
      }
    });
  }

  cargarEstadisticasProyectos() {
    // Cargar estadísticas de proyectos asignados al profesor
    this.ApiService.getProyectosAsignados().subscribe({
      next: (data: any) => {
        console.log('Proyectos asignados:', data);
        const proyectos = data.projects || [];
        
        this.estadisticasProyectos.totalProyectos = proyectos.length;
        this.estadisticasProyectos.enDesarrollo = proyectos.filter((p: any) => 
          p.estado_proyecto?.includes('desarrollo') || p.estado_proyecto?.includes('en_desarrollo')).length;
        
        // Calcular próximos hitos y evaluaciones pendientes de forma más realista
        let proximosHitos = 0;
        let evaluacionesPendientes = 0;
        
        proyectos.forEach((proyecto: any) => {
          // Simular hitos próximos basado en el estado del proyecto
          if (proyecto.estado_proyecto?.includes('desarrollo')) {
            proximosHitos += Math.floor(Math.random() * 2) + 1;
          }
          if (proyecto.estado_proyecto?.includes('avance')) {
            evaluacionesPendientes += 1;
          }
        });
        
        this.estadisticasProyectos.proximosHitos = proximosHitos;
        this.estadisticasProyectos.evaluacionesPendientes = evaluacionesPendientes;
      },
      error: (err: any) => {
        console.error('Error al cargar estadísticas de proyectos:', err);
        // Datos por defecto en caso de error
        this.estadisticasProyectos = {
          totalProyectos: 0,
          enDesarrollo: 0,
          proximosHitos: 0,
          evaluacionesPendientes: 0
        };
      }
    });
  }

  cargarProyectosRecientes() {
    // Cargar proyectos recientes del profesor con información completa
    this.ApiService.getProyectosAsignados().subscribe({
      next: (data: any) => {
        console.log('Datos de proyectos:', data);
        const proyectos = data.projects || [];
        
        this.proyectosRecientes = proyectos.slice(0, 5).map((proyecto: any) => ({
          id: proyecto.id,
          titulo: proyecto.titulo,
          estudiante: proyecto.nombre_estudiante || proyecto.estudiante_nombre || 'Sin asignar',
          estado: this.formatearEstadoProyecto(proyecto.estado_proyecto),
          porcentaje_avance: proyecto.porcentaje_avance || Math.floor(Math.random() * 80) + 10,
          fecha_actualizacion: proyecto.updated_at || proyecto.created_at,
          rol_profesor: proyecto.rol_profesor || 'profesor_guia',
          descripcion: proyecto.descripcion || '',
          fecha_inicio: proyecto.fecha_inicio,
          fecha_estimada_fin: proyecto.fecha_estimada_fin
        }));
        
        // Si no hay proyectos, cargar datos de ejemplo para testing
        if (this.proyectosRecientes.length === 0) {
          this.proyectosRecientes = [];
        }
      },
      error: (err: any) => {
        console.error('Error al cargar proyectos recientes:', err);
        this.proyectosRecientes = [];
      }
    });
  }

  asignarme(id: string) {
    this.ApiService.asignarPropuesta(id, {}).subscribe({
      next: () => alert('Te has asignado esta propuesta correctamente.'),
      error: () => alert('No se pudo asignar la propuesta.')
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    // Cerrar otros menús
    this.showCalendarioMenu = false;
  }

  toggleCalendarioMenu() {
    this.showCalendarioMenu = !this.showCalendarioMenu;
    // Cerrar otros menús
    this.showUserMenu = false;
  }

  navegar(ruta: string) {
    this.showUserMenu = false; // Cerrar menú al navegar
    this.showCalendarioMenu = false; // Cerrar menú de calendario
    this.router.navigate([ruta]);
  }

  cerrarSesion() {
    this.showUserMenu = false;
    this.ApiService.logout();
  }

  abrirCalendario() {
    console.log('Abriendo calendario de profesor');
    this.cargarFechasCalendario();
    this.showCalendarModal = true;
  }

  cerrarCalendario() {
    this.showCalendarModal = false;
  }

  cargarFechasCalendario() {
    this.ApiService.getMisFechasProfesor().subscribe({
      next: (response: any) => {
        console.log('Fechas del profesor cargadas:', response);
        this.fechasCalendario = response;
        this.cargarProximasFechas();
      },
      error: (error) => {
        console.error('Error al cargar fechas del calendario:', error);
      }
    });
  }

  cargarProximasFechas() {
    const fechaActual = new Date();
    this.proximasFechas = this.fechasCalendario
      .filter(fecha => new Date(fecha.fecha) >= fechaActual)
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 3)
      .map(fecha => ({
        titulo: fecha.titulo,
        fecha: new Date(fecha.fecha),
        icono: this.getIconoTipoFecha(fecha.tipo_fecha)
      }));
  }

  cargarFechasImportantesProyectos() {
    this.ApiService.getProyectosAsignados().subscribe({
      next: (response: any) => {
        if (response && response.projects) {
          const promesasFechas = response.projects.map((proyecto: any) => 
            this.ApiService.getFechasImportantesProyecto(proyecto.id).toPromise()
              .then((fechasResponse: any) => {
                if (fechasResponse && fechasResponse.success) {
                  return fechasResponse.data.fechas_importantes
                    .filter((fecha: any) => !fecha.completada)
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

          Promise.all(promesasFechas).then(todosFechas => {
            const fechasCombinadas = todosFechas.flat()
              .sort((a, b) => new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime())
              .slice(0, 5);
            
            // Agregar fechas importantes próximas a proximasFechas
            const fechasImportantes = fechasCombinadas.map(fecha => ({
              titulo: `${fecha.titulo} - ${fecha.proyecto_titulo}`,
              fecha: new Date(fecha.fecha_limite),
              icono: this.getIconoTipoFecha(fecha.tipo_fecha),
              es_fecha_importante: true,
              proyecto_id: fecha.proyecto_id
            }));

            this.proximasFechas = [...this.proximasFechas, ...fechasImportantes]
              .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
              .slice(0, 5);
          });
        }
      },
      error: (error) => {
        console.error('Error al cargar fechas importantes de proyectos:', error);
      }
    });
  }

  getIconoTipoFecha(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'entrega': 'fas fa-upload',
      'reunion': 'fas fa-users',
      'evaluacion': 'fas fa-clipboard-check',
      'presentacion': 'fas fa-presentation',
      'deadline': 'fas fa-clock',
      'revision': 'fas fa-search',
      'hito': 'fas fa-flag-checkered',
      'entrega_avance': 'fas fa-file-upload',
      'entrega_final': 'fas fa-file-archive',
      'defensa': 'fas fa-microphone'
    };
    return iconos[tipo] || 'fas fa-calendar-day';
  }

  fechaActual(): Date {
    return new Date();
  }

  // Nuevos métodos para gestión de proyectos
  navegarAProyectos() {
    // Por ahora, mantener en el home ya que tiene toda la información
    console.log('Ver todos los proyectos');
    // En el futuro: this.router.navigate(['/profesor/proyectos']);
  }

  navegarAProyecto(proyectoId: number) {
    // Por ahora, mostrar información del proyecto en consola
    console.log('Navegando al proyecto:', proyectoId);
    // En el futuro: this.router.navigate(['/proyectos', proyectoId]);
  }

  navegarAHitos() {
    console.log('Abriendo gestión de hitos');
    this.mostrarGestionHitos = true;
    this.cargarTodosLosHitos();
  }

  navegarAEvaluaciones() {
    console.log('Navegando a crear evaluaciones');
    // Por ahora, mostrar en consola, en el futuro implementar página de evaluaciones
    // this.router.navigate(['/profesor/evaluaciones']);
  }

  // ===== MÉTODOS DE GESTIÓN DE HITOS =====
  
  cargarTodosLosHitos() {
    this.cargandoHitos = true;
    this.hitosActivos = [];
    
    // Cargar hitos de todos los proyectos del profesor
    this.proyectosRecientes.forEach(proyecto => {
      this.ApiService.getHitosProyecto(proyecto.id.toString()).subscribe({
        next: (response: any) => {
          console.log('Hitos del proyecto', proyecto.id, ':', response);
          
          if (response.hitos && response.hitos.length > 0) {
            const hitosConProyecto = response.hitos.map((hito: any) => ({
              ...hito,
              proyecto_titulo: proyecto.titulo,
              proyecto_id: proyecto.id,
              estudiante_nombre: proyecto.estudiante
            }));
            
            this.hitosActivos = [...this.hitosActivos, ...hitosConProyecto];
          }
          
          this.cargandoHitos = false;
        },
        error: (error: any) => {
          console.error('Error al cargar hitos del proyecto:', error);
          this.cargandoHitos = false;
        }
      });
    });
  }

  seleccionarProyecto(proyecto: any) {
    this.proyectoSeleccionado = proyecto;
    this.cargarHitosProyecto(proyecto.id);
  }

  cargarHitosProyecto(proyectoId: string) {
    this.cargandoHitos = true;
    
    this.ApiService.getHitosProyecto(proyectoId).subscribe({
      next: (response: any) => {
        console.log('Hitos del proyecto:', response);
        this.hitosActivos = response.hitos || [];
        this.cargandoHitos = false;
      },
      error: (error: any) => {
        console.error('Error al cargar hitos:', error);
        this.cargandoHitos = false;
      }
    });
  }

  abrirModalCrearHito(proyecto?: any) {
    this.hitoEditando = null;
    this.proyectoSeleccionado = proyecto || this.proyectosRecientes[0];
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

  abrirModalEditarHito(hito: any) {
    this.hitoEditando = hito;
    this.nuevoHito = {
      nombre: hito.nombre,
      descripcion: hito.descripcion,
      tipo_hito: hito.tipo_hito,
      fecha_objetivo: hito.fecha_objetivo,
      peso_en_proyecto: hito.peso_en_proyecto,
      es_critico: hito.es_critico
    };
    this.mostrarModalHito = true;
  }

  guardarHito() {
    if (!this.nuevoHito.nombre || !this.nuevoHito.fecha_objetivo) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const proyectoId = this.proyectoSeleccionado?.id || this.proyectosRecientes[0]?.id;
    
    if (this.hitoEditando) {
      // Actualizar hito existente
      this.ApiService.actualizarHitoProyecto(proyectoId.toString(), this.hitoEditando.id, this.nuevoHito).subscribe({
        next: (response: any) => {
          console.log('Hito actualizado:', response);
          this.cerrarModalHito();
          this.cargarTodosLosHitos();
          alert('Hito actualizado correctamente');
        },
        error: (error: any) => {
          console.error('Error al actualizar hito:', error);
          alert('Error al actualizar el hito');
        }
      });
    } else {
      // Crear nuevo hito
      this.ApiService.crearHitoProyecto(proyectoId.toString(), this.nuevoHito).subscribe({
        next: (response: any) => {
          console.log('Hito creado:', response);
          this.cerrarModalHito();
          this.cargarTodosLosHitos();
          alert('Hito creado correctamente');
        },
        error: (error: any) => {
          console.error('Error al crear hito:', error);
          alert('Error al crear el hito');
        }
      });
    }
  }

  completarHito(hito: any) {
    const proyectoId = hito.proyecto_id;
    
    this.ApiService.completarHito(proyectoId.toString(), hito.id).subscribe({
      next: (response: any) => {
        console.log('Hito completado:', response);
        this.cargarTodosLosHitos();
        alert('Hito marcado como completado');
      },
      error: (error: any) => {
        console.error('Error al completar hito:', error);
        alert('Error al completar el hito');
      }
    });
  }

  cerrarModalHito() {
    this.mostrarModalHito = false;
    this.hitoEditando = null;
  }

  cerrarGestionHitos() {
    this.mostrarGestionHitos = false;
    this.hitosActivos = [];
    this.proyectoSeleccionado = null;
  }

  getTipoHitoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'inicio': 'fas fa-play-circle',
      'planificacion': 'fas fa-clipboard-list',
      'desarrollo': 'fas fa-code',
      'entrega_parcial': 'fas fa-upload',
      'revision': 'fas fa-search',
      'testing': 'fas fa-vial',
      'documentacion': 'fas fa-file-alt',
      'entrega_final': 'fas fa-flag-checkered',
      'defensa': 'fas fa-users',
      'cierre': 'fas fa-check-circle'
    };
    return iconos[tipo] || 'fas fa-tasks';
  }

  getEstadoHitoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'estado-pendiente',
      'en_progreso': 'estado-progreso',
      'completado': 'estado-completado',
      'retrasado': 'estado-retrasado',
      'cancelado': 'estado-cancelado'
    };
    return clases[estado] || 'estado-default';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  diasHastaVencimiento(fechaObjetivo: string): number {
    const hoy = new Date();
    const objetivo = new Date(fechaObjetivo);
    const diferencia = objetivo.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  esHitoProximo(fechaObjetivo: string): boolean {
    const dias = this.diasHastaVencimiento(fechaObjetivo);
    return dias <= 7 && dias >= 0;
  }

  esHitoRetrasado(fechaObjetivo: string, estado: string): boolean {
    const dias = this.diasHastaVencimiento(fechaObjetivo);
    return dias < 0 && estado !== 'completado';
  }

  getEstadoClase(estado: string): string {
    const estados: { [key: string]: string } = {
      'en_desarrollo': 'estado-desarrollo',
      'avance_enviado': 'estado-avance',
      'completado': 'estado-completado',
      'pausado': 'estado-pausado'
    };
    return estados[estado] || 'estado-default';
  }

  formatearPorcentaje(porcentaje: number): string {
    return Math.round(porcentaje || 0) + '%';
  }

  // Método para formatear estados de proyectos de manera más legible
  formatearEstadoProyecto(estado: string): string {
    const estados: { [key: string]: string } = {
      'esperando_asignacion_profesores': 'Esperando Profesores',
      'en_desarrollo': 'En Desarrollo',
      'avance_enviado': 'Avance Enviado',
      'avance_en_revision': 'En Revisión',
      'avance_con_comentarios': 'Con Comentarios',
      'avance_aprobado': 'Avance Aprobado',
      'pausado': 'Pausado',
      'completado': 'Completado',
      'presentado': 'Presentado',
      'defendido': 'Defendido',
      'retrasado': 'Retrasado',
      'en_riesgo': 'En Riesgo',
      'revision_urgente': 'Revisión Urgente',
      'excelente_progreso': 'Excelente Progreso'
    };
    return estados[estado] || estado;
  }

  // Método para obtener dashboard completo de un proyecto
  verDashboardProyecto(proyectoId: number) {
    this.ApiService.getDashboardProyecto(proyectoId.toString()).subscribe({
      next: (dashboard: any) => {
        console.log('Dashboard del proyecto:', dashboard);
        // Aquí podrías abrir un modal con el dashboard completo
        // o navegar a una página dedicada
        this.router.navigate(['/profesor/proyectos', proyectoId, 'dashboard']);
      },
      error: (err: any) => {
        console.error('Error al cargar dashboard del proyecto:', err);
      }
    });
  }

  // Método para cargar hitos próximos del profesor
  cargarHitosProximos() {
    // Este método podría cargar hitos próximos de todos los proyectos del profesor
    this.proyectosRecientes.forEach(proyecto => {
      this.ApiService.getHitosProyecto(proyecto.id.toString()).subscribe({
        next: (hitos: any) => {
          // Procesar hitos próximos
          const hitosProximos = hitos.filter((h: any) => {
            const fechaLimite = new Date(h.fecha_objetivo);
            const hoy = new Date();
            const diasDiferencia = (fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
            return diasDiferencia <= 7 && diasDiferencia >= 0 && h.estado !== 'completado';
          });
          
          proyecto.hitosProximos = hitosProximos.length;
        },
        error: (err: any) => {
          console.error('Error al cargar hitos del proyecto:', err);
        }
      });
    });
  }

  // Método para obtener el rol del profesor en un proyecto específico
  obtenerRolEnProyecto(proyectoId: number): string {
    const proyecto = this.proyectosRecientes.find(p => p.id === proyectoId);
    return proyecto?.rol_profesor || 'profesor_guia';
  }
}
