import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { CalendarModalComponent } from '../../../components/calendar-modal/calendar-modal.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModalComponent
  ],
  templateUrl: './estudiante-home.component.html',
  styleUrls: ['./estudiante-home.component.scss']
})
export class EstudianteHomeComponent implements OnInit, OnDestroy {
  estudiante: any = {};
  showUserMenu = false;
  showCalendarioMenu = false;
  propuestas: any[] = [];
  ultimaPropuesta: any = null;
  proyectos: any[] = [];
  proyectoActivo: any = null;
  progresoProyecto = 0;
  proximasFechas: any[] = [];
  estadisticas = {
    totalPropuestas: 0,
    enRevision: 0,
    aprobadas: 0,
    diasRestantes: 0
  };
  showCalendarModal = false;
  showHitosModal = false;
  hitosProyecto: any[] = [];
  loadingHitos = false;
  
  // Hitos - gestión avanzada
  hitoSeleccionado: any = null;
  showModalEntregarHito = false;
  archivoHitoSeleccionado: File | null = null;
  comentarioEntrega = '';
  comentariosEntregaHito = '';
  erroresValidacionHito: string[] = [];
  loadingEntrega = false;
  proyectoSeleccionado: any = null;
  errorCargaHitos = '';
  
  // Fechas importantes
  fechasImportantes: any[] = [];
  fechasProximas: any[] = [];
  loadingFechas = false;
  
  // Estados de carga y errores
  loadingPropuestas = false;
  loadingEstudiante = false;
  loadingProyectos = false;
  errorMensaje = '';
  hasError = false;

  // Dashboard data
  dashboard: any = null;
  loadingDashboard = false;

  // Exponer Math para usar en template
  Math = Math;

  // Timer para verificación periódica del token
  private tokenCheckInterval: any;
  
  opciones = [
    { 
      titulo: 'Crear Propuesta', 
      icono: 'add_circle', 
      descripcion: 'Crea una nueva propuesta de proyecto', 
      ruta: 'propuestas/crear' 
    },
    { 
      titulo: 'Ver Propuestas', 
      icono: 'visibility', 
      descripcion: 'Consulta tus propuestas enviadas', 
      ruta: 'propuestas/listar-propuesta' 
    }
  ];

  constructor(
    private router: Router,
    private ApiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

   ngOnInit() {
    // Verificar autenticación antes de cargar datos
    if (!this.ApiService.checkTokenAndRedirect()) {
      return; // Si el token expiró, ya se redirigió al login
    }

    // Iniciar verificación periódica del token cada 5 minutos
    this.startTokenCheck();

    // Obtener rut del token o del localStorage
    const token = localStorage.getItem('token');
    let rut = '';
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      rut = payload.rut;
    }

    if (rut) {
      this.buscarUserByRut(rut);
      this.cargarPropuestas(rut);
      this.cargarProyectos();
      this.cargarDashboard();
    } else {
      // Fallback
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        this.estudiante.nombre = userData.nombre || 'Estudiante';
        this.estudiante.matricula = userData.matricula || '';
        this.estudiante.carrera = userData.carrera || '';
      } else {
        this.estudiante.nombre = 'Estudiante';
      }
    }
  }

  ngOnDestroy() {
    // Limpiar el timer cuando el componente se destruye
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }

  private startTokenCheck() {
    // Verificar token cada 5 minutos (300000 ms)
    this.tokenCheckInterval = setInterval(() => {
      if (!this.ApiService.isAuthenticated()) {
        console.warn('Token expirado durante verificación periódica');
        this.ApiService.logout();
      }
    }, 300000); // 5 minutos
  }

  async cargarDashboard() {
    try {
      this.loadingDashboard = true;
      const response = await this.ApiService.getDashboardEstudiante();
      if (response && response.success) {
        // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.dashboard = response.data;
          console.log('✅ Dashboard estudiante cargado:', this.dashboard);
          this.cdr.detectChanges();
        }, 0);
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      this.loadingDashboard = false;
      this.cdr.detectChanges();
    }
  }

  buscarUserByRut(rut: string) {
    this.loadingEstudiante = true;
    console.log('🔍 Buscando usuario con RUT:', rut);
    
    this.ApiService.buscaruserByrut(rut).subscribe({
      next: (data: any) => {
        console.log('✅ Respuesta del servidor:', data);
        this.estudiante = data;
        this.loadingEstudiante = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al obtener usuario:', err);
        this.estudiante.nombre = 'Estudiante';
        this.loadingEstudiante = false;
        this.cdr.detectChanges();
        this.mostrarError('No se pudo cargar la información del usuario');
      },
      complete: () => {
        console.log('✅ Observable completado - loadingEstudiante:', this.loadingEstudiante);
        // Asegurar que el flag se resetee incluso si hay problemas
        setTimeout(() => {
          if (this.loadingEstudiante) {
            console.warn('⚠️ Forcing loadingEstudiante to false');
            this.loadingEstudiante = false;
            this.cdr.detectChanges();
          }
        }, 5000); // Timeout de seguridad de 5 segundos
      }
    });
  }

  cargarPropuestas(rut: string) {
    this.loadingPropuestas = true;
    console.log('🔍 Cargando propuestas...');
    
    // Timeout de seguridad
    setTimeout(() => {
      if (this.loadingPropuestas) {
        console.warn('⚠️ Forcing loadingPropuestas to false');
        this.loadingPropuestas = false;
        this.cdr.detectChanges();
      }
    }, 5000);
    
    // Usar el nuevo endpoint específico para estudiantes
    this.ApiService.getMisPropuestas().subscribe({
      next: (data: any) => {
        this.propuestas = Array.isArray(data) ? data : [];
        this.loadingPropuestas = false;
        this.cdr.detectChanges();
        console.log('✅ Propuestas cargadas:', this.propuestas.length);
        // // // // // // // // // // console.log('✅ Propuestas del estudiante cargadas:', this.propuestas);
        
        // Debug información del profesor
        if (this.propuestas.length > 0) {
          console.log('🔍 Primera propuesta completa:', this.propuestas[0]);
          console.log('🔍 Campos relacionados al profesor:');
          console.log('  - profesor_rut:', this.propuestas[0].profesor_rut);
          console.log('  - profesor_nombre:', this.propuestas[0].profesor_nombre);
          console.log('  - nombre_profesor:', this.propuestas[0].nombre_profesor);
          console.log('  - profesor_email:', this.propuestas[0].profesor_email);
        }
        
        this.calcularEstadisticas();
        this.obtenerUltimaPropuesta();
        this.calcularProgresoProyecto();
        this.generarProximasFechas();
      },
      error: (err) => {
        console.error('Error al cargar propuestas del estudiante:', err);
        this.loadingPropuestas = false;
        this.propuestas = [];
        this.cdr.detectChanges();
        this.mostrarError('No se pudieron cargar las propuestas');
      }
    });
  }

  cargarProyectos() {
    this.loadingProyectos = true;
    console.log('🔍 Cargando proyectos...');
    
    // Timeout de seguridad
    setTimeout(() => {
      if (this.loadingProyectos) {
        console.warn('⚠️ Forcing loadingProyectos to false');
        this.loadingProyectos = false;
        this.cdr.detectChanges();
      }
    }, 5000);
    
    this.ApiService.getMisProyectos().subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta proyectos:', response);
        this.loadingProyectos = false;
        this.cdr.detectChanges();
        
        if (response && response.projects) {
          this.proyectos = response.projects;
          console.log('📁 Proyectos cargados:', this.proyectos.length);
          
          // Encontrar proyecto activo (el más reciente o el único)
          if (this.proyectos.length > 0) {
            this.proyectoActivo = this.proyectos[0];
            console.log('🎯 Proyecto activo:', this.proyectoActivo);
            this.cargarDashboardProyecto();
            this.cargarFechasImportantes();
          }
        } else {
          this.proyectos = [];
          console.log('📭 No se encontraron proyectos');
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar proyectos:', error);
        console.error('❌ Detalles del error:', error.status, error.message);
        this.loadingProyectos = false;
        this.cdr.detectChanges();
        this.proyectos = [];
        this.mostrarError('No se pudieron cargar los proyectos');
      },
      complete: () => {
        console.log('✅ Observable getMisProyectos completado - loadingProyectos:', this.loadingProyectos);
      }
    });
  }

  cargarDashboardProyecto() {
    if (!this.proyectoActivo?.id) {
      // // // // // // // // // // console.log('⚠️ No hay proyecto activo para cargar dashboard');
      return;
    }

    // // // // // // // // // // console.log('🔄 Cargando dashboard del proyecto:', this.proyectoActivo.id);
    
    this.ApiService.getDashboardProyecto(this.proyectoActivo.id).subscribe({
      next: (response: any) => {
        // // // // // // // // // // console.log('✅ Dashboard del proyecto cargado:', response);
        
        if (response.success && response.data) {
          // Actualizar datos del proyecto con información del dashboard
          this.proyectoActivo = {
            ...this.proyectoActivo,
            ...response.data.proyecto,
            hitos_total: response.data.hitos_total,
            hitos_completados: response.data.hitos_completados,
            porcentaje_avance: response.data.progreso
          };
          this.calcularProgresoProyectoReal();
          // // // // // // // // // // console.log('🎯 Proyecto activo actualizado:', this.proyectoActivo);
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar dashboard:', error);
        // No mostrar error crítico, el componente puede funcionar sin dashboard
      }
    });
  }

  cargarFechasImportantes() {
    this.fechasImportantes = [];
    this.fechasProximas = [];
    this.loadingFechas = false;
  }

  calcularProgresoProyectoReal() {
    if (!this.proyectoActivo) {
      this.progresoProyecto = 0;
      return;
    }

    // Si tiene información de hitos, calcular basado en eso
    if (this.proyectoActivo.hitos_total && this.proyectoActivo.hitos_total > 0) {
      // ✅ FIX: Validar casos edge (null, undefined, mayor a 100%)
      const hitosCompletados = this.proyectoActivo.hitos_completados || 0;
      const hitosTotal = this.proyectoActivo.hitos_total || 1;
      const porcentajeHitos = (hitosCompletados / hitosTotal) * 100;
      // Asegurar que el progreso nunca exceda 100%
      this.progresoProyecto = Math.min(100, Math.max(0, Math.round(porcentajeHitos)));
      // // console.log(`📊 Progreso basado en hitos: ${this.progresoProyecto}% (${hitosCompletados}/${hitosTotal})`);
    } else {
      // Fallback al método anterior basado en propuestas
      this.calcularProgresoProyecto();
    }
  }

  // Método fallback por si el nuevo endpoint falla
  private cargarPropuestasFallback(rut: string) {
    console.warn('⚠️ Usando método fallback para cargar propuestas');
    this.ApiService.getPropuestas().subscribe({
      next: (data: any) => {
        const todasLasPropuestas = Array.isArray(data) ? data : [];
        this.propuestas = todasLasPropuestas.filter(propuesta => {
          return propuesta.estudiante_rut === rut;
        });
        
        this.calcularEstadisticas();
        this.obtenerUltimaPropuesta();
        this.calcularProgresoProyecto();
        this.generarProximasFechas();
      },
      error: (err) => {
        console.error('Error en método fallback:', err);
        this.mostrarError('No se pudieron cargar las propuestas. Intenta recargar la página.');
        // Mostrar interfaz vacía pero funcional
        this.propuestas = [];
        this.calcularEstadisticas();
        this.obtenerUltimaPropuesta();
        this.calcularProgresoProyecto();
        this.generarProximasFechas();
      }
    });
  }

  calcularEstadisticas() {
    this.estadisticas.totalPropuestas = this.propuestas.length;
    
    // Usar estado_id para mayor precisión (según orden correcto en BD)
    this.estadisticas.enRevision = this.propuestas.filter(p => 
      p.estado_id === 1 || p.estado_id === 2 // Pendiente o En revisión
    ).length;
    
    this.estadisticas.aprobadas = this.propuestas.filter(p => 
      p.estado_id === 4 // Aprobada
    ).length;
    
    // Calcular días restantes hasta el final del año académico
    const hoy = new Date();
    const finAno = new Date(hoy.getFullYear(), 11, 31); // 31 de diciembre
    this.estadisticas.diasRestantes = Math.ceil((finAno.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    // Si los días son negativos (año ya terminó), calcular para el próximo año
    if (this.estadisticas.diasRestantes < 0) {
      const finProximoAno = new Date(hoy.getFullYear() + 1, 11, 31);
      this.estadisticas.diasRestantes = Math.ceil((finProximoAno.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  obtenerUltimaPropuesta() {
    if (this.propuestas.length > 0) {
      // Ordenar por fecha de envío y tomar la más reciente
      this.propuestas.sort((a, b) => {
        return new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime();
      });
      this.ultimaPropuesta = this.propuestas[0];
      
      console.log('🔍 Última propuesta seleccionada:', this.ultimaPropuesta);
      console.log('🔍 Info profesor en última propuesta:');
      console.log('  - nombre_profesor:', this.ultimaPropuesta.nombre_profesor);
      console.log('  - profesor_rut:', this.ultimaPropuesta.profesor_rut);
      console.log('  - profesor_email:', this.ultimaPropuesta.profesor_email);
    }
  }

  calcularProgresoProyecto() {
    if (this.propuestas.length === 0) {
      this.progresoProyecto = 0;
      return;
    }

    // Calcular progreso basado en la ÚLTIMA propuesta (la más relevante)
    const ultimaPropuesta = this.ultimaPropuesta || this.propuestas[0];
    
    if (!ultimaPropuesta) {
      this.progresoProyecto = 0;
      return;
    }

    // Calcular progreso basado en estado_id de la última propuesta (orden correcto)
    switch (ultimaPropuesta.estado_id) {
      case 1: // Pendiente
        this.progresoProyecto = 20;
        break;
      case 2: // En revisión
        this.progresoProyecto = 40;
        break;
      case 3: // Correcciones
        this.progresoProyecto = 60;
        break;
      case 4: // Aprobada
        this.progresoProyecto = 100;
        break;
      case 5: // Rechazada
        this.progresoProyecto = 10;
        break;
      default:
        this.progresoProyecto = 15;
    }

    // Bonus de progreso si tiene múltiples propuestas (experiencia)
    if (this.propuestas.length > 1) {
      this.progresoProyecto = Math.min(100, this.progresoProyecto + (this.propuestas.length - 1) * 5);
    }
  }

  generarProximasFechas() {
    // SOLO cargar fechas reales desde la base de datos
    this.ApiService.getFechasProximas(3).subscribe({
      next: (response: any) => {
        // // // // // // // // // // console.log('Fechas próximas del backend:', response);
        
        if (Array.isArray(response) && response.length > 0) {
          this.proximasFechas = response.map((fecha: any) => ({
            titulo: fecha.titulo,
            fecha: new Date(fecha.fecha),
            icono: this.getIconoTipoFecha(fecha.tipo_fecha),
            esDelBackend: true,
            creador: fecha.tipo_creador || (fecha.es_global ? 'Admin' : 'Profesor')
          }));
          // // // // // // // // // // console.log('✅ Fechas cargadas desde BD:', this.proximasFechas.length);
        } else {
          this.proximasFechas = [];
          // // // // // // // // // // console.log('ℹ️  No hay fechas en la base de datos');
        }
      },
      error: (error) => {
        console.error('Error al cargar fechas próximas:', error);
        // NO generar fechas dummy - solo dejar vacío
        this.proximasFechas = [];
        // // // // // // // // // // console.log('⚠️  Error cargando fechas, lista vacía');
      }
    });
  }



  getIconoTipoFecha(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'global': 'fas fa-globe',
      'academica': 'fas fa-graduation-cap',
      'entrega': 'fas fa-clock',
      'revision': 'fas fa-search',
      'defensa': 'fas fa-gavel',
      'reunion': 'fas fa-users',
      'otro': 'fas fa-calendar-day'
    };
    return iconos[tipo] || 'fas fa-calendar-day';
  }

  obtenerFaseProyecto(): string {
    // Si hay proyecto activo, usar información de hitos
    if (this.proyectoActivo) {
      const total = this.proyectoActivo.hitos_total ?? 0;
      const completados = this.proyectoActivo.hitos_completados ?? 0;
      if (total === 0) {
        return 'Proyecto sin hitos definidos';
      }

      const progreso = completados / total;
      if (progreso === 0) {
        return 'Inicio del proyecto';
      } else if (progreso < 0.5) {
        return 'Desarrollo inicial';
      } else if (progreso < 0.8) {
        return 'Desarrollo avanzado';
      } else if (progreso < 1) {
        return 'Finalización';
      } else {
        return 'Proyecto completado';
      }
    }
    
    // Fallback al método original basado en propuestas
    if (this.propuestas.length === 0) return 'Sin iniciar';
    
    const ultimaPropuesta = this.propuestas[0];
    switch (ultimaPropuesta.estado) {
      case 'pendiente':
        return 'Fase 1: Propuesta enviada';
      case 'en_revision':
        return 'Fase 2: En revisión';
      case 'aprobada':
        return 'Fase 3: Aprobada';
      case 'correcciones':
        return 'Fase 3: Correcciones finales';
      case 'rechazada':
        return 'Fase 1: Propuesta rechazada';
      default:
        return 'Fase 1: Propuesta enviada';
    }
  }

  // Método para navegar al dashboard del proyecto (nuevo)
  navegarAProyecto() {
    if (this.proyectoActivo) {
      this.router.navigate(['/estudiante/proyecto', this.proyectoActivo.id]);
    } else if (this.ultimaPropuesta) {
      this.navegarAUltimaPropuesta();
    } else {
      this.router.navigate(['/propuestas/crear']);
    }
  }

  navegarAUltimaPropuesta() {
    if (this.ultimaPropuesta) {
      this.router.navigate(['/propuestas/ver-detalle', this.ultimaPropuesta.id]);
    } else {
      this.router.navigate(['/propuestas/crear']);
    }
  }

  abrirCalendario() {
    this.showCalendarModal = true;
  }

  cerrarCalendario() {
    this.showCalendarModal = false;
  }

  // ===== MÉTODOS PARA GESTIÓN DE HITOS =====

  abrirModalHitos() {
    if (!this.proyectoActivo?.id) {
      this.mostrarError('No hay proyecto activo para mostrar hitos');
      return;
    }
    
    this.showHitosModal = true;
    this.cargarHitosProyecto();
  }

  cerrarModalHitos() {
    this.showHitosModal = false;
    this.hitosProyecto = [];
  }

  cargarHitosProyecto() {
    if (!this.proyectoActivo?.id) return;

    this.loadingHitos = true;

    // Usar el nuevo sistema de cronogramas
    this.ApiService.getCronogramaProyecto(this.proyectoActivo.id).subscribe({
      next: (cronogramaResponse: any) => {
        if (cronogramaResponse && cronogramaResponse.success && cronogramaResponse.cronograma) {
          const cronogramaId = cronogramaResponse.cronograma.id;

          // Obtener hitos del cronograma
          this.ApiService.getHitosCronograma(cronogramaId.toString()).subscribe({
            next: (hitosResponse: any) => {
              this.loadingHitos = false;

              if (hitosResponse && hitosResponse.success && hitosResponse.hitos) {
                this.hitosProyecto = hitosResponse.hitos.map((h: any) => this.normalizarHitoCompleto(h));
              } else {
                this.hitosProyecto = [];
              }
              this.cdr.detectChanges();
            },
            error: (error) => {
              console.error('❌ Error al cargar hitos:', error);
              this.loadingHitos = false;
              this.hitosProyecto = [];
              this.mostrarError('No se pudieron cargar los hitos del cronograma');
              this.cdr.detectChanges();
            }
          });
        } else {
          // Proyecto sin cronograma
          this.loadingHitos = false;
          this.hitosProyecto = [];
          // // // // // // // // // // console.log('📭 Proyecto sin cronograma activo');
          this.cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar cronograma:', error);
        this.loadingHitos = false;
        this.hitosProyecto = [];
        this.mostrarError('No se pudo cargar el cronograma del proyecto');
        this.cdr.detectChanges();
      }
    });
  }

  completarHitoEstudiante(hito: any) {
    // En el nuevo sistema, los hitos se completan mediante entregas
    // Abrir modal para entregar el hito
    this.abrirModalEntregarHito(hito);
  }

  // ===== MÉTODOS AVANZADOS PARA HITOS =====

  // Cargar hitos del proyecto
  cargarHitos(): void {
    if (!this.proyectoActivo?.id) {
      console.error('No hay proyecto activo para cargar hitos');
      return;
    }

    this.loadingHitos = true;
    this.errorCargaHitos = '';

    // Usar el nuevo sistema de cronogramas
    this.ApiService.getCronogramaProyecto(this.proyectoActivo.id).subscribe({
      next: (cronogramaResponse: any) => {
        if (cronogramaResponse && cronogramaResponse.success && cronogramaResponse.cronograma) {
          const cronogramaId = cronogramaResponse.cronograma.id;

          // Obtener hitos del cronograma
          this.ApiService.getHitosCronograma(cronogramaId.toString()).subscribe({
            next: (hitosResponse: any) => {
              if (hitosResponse && hitosResponse.success && hitosResponse.hitos) {
                this.hitosProyecto = hitosResponse.hitos.map((h: any) => this.normalizarHitoCompleto(h));
              } else {
                this.hitosProyecto = [];
                this.errorCargaHitos = 'No se pudieron cargar los hitos';
              }
              this.loadingHitos = false;
              this.cdr.detectChanges();
            },
            error: (error: any) => {
              console.error('Error al cargar hitos del cronograma:', error);
              this.hitosProyecto = [];
              this.errorCargaHitos = 'Error al cargar los hitos';
              this.loadingHitos = false;
              this.cdr.detectChanges();
            }
          });
        } else {
          // Proyecto sin cronograma activo
          this.hitosProyecto = [];
          this.loadingHitos = false;
          this.cdr.detectChanges();
        }
      },
      error: (error: any) => {
        console.error('Error al cargar hitos:', error);
        this.hitosProyecto = [];
        this.errorCargaHitos = 'Error de conexión al cargar los hitos';
        this.loadingHitos = false;
      }
    });
  }

  abrirModalEntregarHito(hito: any) {
    this.hitoSeleccionado = hito;
    this.showModalEntregarHito = true;
    this.comentarioEntrega = '';
    this.archivoHitoSeleccionado = null;
  }

  cerrarModalEntregarHito() {
    this.showModalEntregarHito = false;
    this.hitoSeleccionado = null;
    this.comentarioEntrega = '';
    this.comentariosEntregaHito = '';
    this.archivoHitoSeleccionado = null;
    this.erroresValidacionHito = [];
  }

  onArchivoHitoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoHitoSeleccionado = file;
      this.validarEntregaHito(); // Usar la nueva validación
      // // // // // // // // // // console.log('📎 Archivo seleccionado:', file.name, file.size);
    }
  }

  async entregarHitoCompleto() {
    if (!this.hitoSeleccionado?.id) {
      this.mostrarError('No hay hito seleccionado');
      return;
    }

    // Usar la nueva validación
    if (!this.validarEntregaHito()) {
      return; // Los errores ya están en erroresValidacionHito
    }

    try {
      this.loadingEntrega = true;

      // // // // // // // // // // console.log('🔄 Entregando hito:', this.hitoSeleccionado.titulo || this.hitoSeleccionado.nombre_hito);

      const response = await this.ApiService.entregarHito(
        this.hitoSeleccionado.id, 
        this.archivoHitoSeleccionado!, 
        this.comentariosEntregaHito.trim()
      ).toPromise();
      
      // // // // // // // // // // console.log('✅ Hito entregado exitosamente:', response);
      
      // Recargar hitos y dashboard
      this.cargarHitos();
      this.cargarDashboardProyecto();
      
      this.cerrarModalEntregarHito();
      // // // // // // // // // // console.log('🎉 Entrega completada exitosamente');

    } catch (error: any) {
      console.error('❌ Error al entregar hito:', error);
      this.mostrarError('Error al entregar el hito: ' + (error.error?.message || error.message));
    } finally {
      this.loadingEntrega = false;
    }
  }

  getEstadoHitoCompleto(hito: any): string {
    const estado = hito.estado_real || hito.estado || 'pendiente';
    if (estado === 'aprobado') return 'Aprobado';
    if (estado === 'rechazado') return 'Rechazado';
    if (estado === 'revisado') return 'En Revisión';
    if (estado === 'entregado') return 'Entregado';
    if (estado === 'retrasado' || this.estaVencido(hito.fecha_limite)) return 'Vencido';
    return 'Pendiente';
  }

  getClaseEstadoHito(hito: any): string {
    const estado = this.getEstadoHitoCompleto(hito);
    const clases: { [key: string]: string } = {
      'Aprobado': 'hito-aprobado',
      'Rechazado': 'hito-rechazado',
      'En Revisión': 'hito-revision',
      'Entregado': 'hito-entregado',
      'Vencido': 'hito-vencido',
      'Pendiente': 'hito-pendiente'
    };
    return clases[estado] || 'hito-pendiente';
  }

  estaVencido(fechaLimite: string): boolean {
    if (!fechaLimite) return false;
    const hoy = new Date();
    const limite = new Date(fechaLimite);
    hoy.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);
    return limite < hoy;
  }

  getDiasRestantesHito(fechaLimite: string): number {
    if (!fechaLimite) return 0;
    const hoy = new Date();
    const limite = new Date(fechaLimite);
    hoy.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);
    const diffTime = limite.getTime() - hoy.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getTextoTiempoHito(fechaLimite: string): string {
    const dias = this.getDiasRestantesHito(fechaLimite);
    if (dias < 0) return `Vencido hace ${Math.abs(dias)} día(s)`;
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return 'Vence mañana';
    return `${dias} días restantes`;
  }

  puedeEntregarHito(hito: any): boolean {
    const estado = hito.estado_real || hito.estado || 'pendiente';
    return !['entregado', 'revisado', 'aprobado', 'rechazado'].includes(estado) && !this.estaVencido(hito.fecha_limite);
  }

  getEstadoHito(hito: any): string {
    const estado = hito.estado_real || hito.estado || 'pendiente';
    if (['entregado', 'revisado', 'aprobado'].includes(estado)) return 'Completado';

    const fechaLimite = new Date(hito.fecha_limite);
    const hoy = new Date();

    if (fechaLimite < hoy) {
      return 'Retrasado';
    } else if ((fechaLimite.getTime() - hoy.getTime()) < (7 * 24 * 60 * 60 * 1000)) {
      return 'Próximo';
    } else {
      return 'Pendiente';
    }
  }

  getClassEstadoHito(hito: any): string {
    const estado = this.getEstadoHito(hito);
    switch (estado) {
      case 'Completado': return 'hito-completado';
      case 'Retrasado': return 'hito-retrasado';
      case 'Próximo': return 'hito-proximo';
      default: return 'hito-pendiente';
    }
  }

  // Métodos auxiliares para cálculos del template
  getHitosCompletados(): number {
    return this.hitosProyecto.filter(h => {
      const estado = h.estado_real || h.estado || 'pendiente';
      return ['entregado', 'revisado', 'aprobado'].includes(estado);
    }).length;
  }

  getHitosRetrasados(): number {
    return this.hitosProyecto.filter(h => {
      const estado = h.estado_real || h.estado || 'pendiente';
      return estado === 'retrasado' || (this.estaVencido(h.fecha_limite) && !['entregado', 'revisado', 'aprobado'].includes(estado));
    }).length;
  }

  private normalizarHitoCompleto(hito: any): any {
    const estado = hito.estado_real || hito.estado || 'pendiente';
    return {
      ...hito,
      entregado: ['entregado', 'revisado', 'aprobado', 'rechazado'].includes(estado),
      revisado: ['revisado', 'aprobado', 'rechazado'].includes(estado),
      aprobado: estado === 'aprobado',
      completado: estado === 'aprobado',
      nombre: hito.nombre_hito || hito.nombre,
      archivo_nombre: hito.nombre_archivo_original || hito.archivo_nombre,
      comentarios_entrega: hito.comentarios_estudiante || hito.comentarios_entrega,
      comentarios_revision: hito.comentarios_profesor || hito.comentarios_revision,
      fecha_revision: hito.updated_at || hito.fecha_revision,
      fecha_completado: estado === 'aprobado' ? hito.updated_at : null
    };
  }

  fechaActual(): Date {
    return new Date();
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

  solicitarExtension() {
    this.router.navigate(['/estudiante/solicitar-extension']);
  }

  cerrarSesion() {
    this.showUserMenu = false;
    this.ApiService.logout();
  }

  irAlHome() {
    // Ya estamos en el home de estudiante, solo cerramos menús si están abiertos
    this.showUserMenu = false;
    this.showCalendarioMenu = false;
  }

  // Métodos para estado dinámico
  getEstadoTexto(): string {
    if (!this.ultimaPropuesta) {
      return 'Sin propuestas';
    }

    // Mapear estado_id a texto descriptivo (según orden en BD)
    switch (this.ultimaPropuesta.estado_id) {
      case 1: // Pendiente
        return 'Propuesta pendiente';
      case 2: // En revisión
        return 'En revisión';
      case 3: // Correcciones
        return 'Requiere correcciones';
      case 4: // Aprobada
        return 'Propuesta aprobada';
      case 5: // Rechazada
        return 'Propuesta rechazada';
      default:
        // Fallback usando campo 'estado' si existe
        if (this.ultimaPropuesta.estado) {
          return this.formatearEstado(this.ultimaPropuesta.estado);
        }
        return 'Estado desconocido';
    }
  }

  // Métodos para fechas importantes
  getFechaEstado(fecha: any): string {
    if (fecha.completada) return 'completada';
    
    const hoy = new Date();
    const fechaLimite = new Date(fecha.fecha_limite);
    
    // Normalizar fechas para comparar solo días (sin horas)
    hoy.setHours(0, 0, 0, 0);
    fechaLimite.setHours(0, 0, 0, 0);
    
    if (fechaLimite < hoy) return 'vencida';
    if (fechaLimite.getTime() === hoy.getTime()) return 'hoy';
    return 'pendiente';
  }

  getFechaClaseEstado(fecha: any): string {
    const estado = this.getFechaEstado(fecha);
    return `fecha-${estado}`;
  }

  getDiasRestantesFecha(fecha: any): number {
    if (fecha.completada) return 0;
    
    const hoy = new Date();
    const fechaLimite = new Date(fecha.fecha_limite);
    
    // Normalizar fechas
    hoy.setHours(0, 0, 0, 0);
    fechaLimite.setHours(0, 0, 0, 0);
    
    const diffTime = fechaLimite.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  getTextoTiempoFecha(fecha: any): string {
    if (fecha.completada) return 'Completada';
    
    const dias = this.getDiasRestantesFecha(fecha);
    
    if (dias < 0) return `Vencida hace ${Math.abs(dias)} día(s)`;
    if (dias === 0) return 'Vence hoy';
    if (dias === 1) return 'Vence mañana';
    return `${dias} días restantes`;
  }

  formatearTipoFecha(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'entrega': 'Entrega',
      'reunion': 'Reunión',
      'hito': 'Hito',
      'deadline': 'Fecha límite',
      'presentacion': 'Presentación'
    };
    return tipos[tipo] || tipo.charAt(0).toUpperCase() + tipo.slice(1);
  }

  formatearFechaCompleta(fecha: string): string {
    if (!fecha) return 'Fecha no especificada';
    
    return new Date(fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Método específico para la card (texto más descriptivo)
  getEstadoTextoCard(): string {
    if (!this.ultimaPropuesta) {
      return 'sin información';
    }

    // Mapear estado_id a texto descriptivo para la card (según orden en BD)
    switch (this.ultimaPropuesta.estado_id) {
      case 1: // Pendiente
        return 'pendiente de revisión';
      case 2: // En revisión
        return 'en revisión';
      case 3: // Correcciones
        return 'requiere correcciones';
      case 4: // Aprobada
        return 'aprobada';
      case 5: // Rechazada
        return 'rechazada';
      default:
        // Fallback usando campo 'estado' si existe
        if (this.ultimaPropuesta.estado) {
          return this.formatearEstadoCard(this.ultimaPropuesta.estado);
        }
        return 'en proceso';
    }
  }

  getEstadoClass(): string {
    if (!this.ultimaPropuesta) {
      return 'status-neutral';
    }

    switch (this.ultimaPropuesta.estado_id) {
      case 1: // Pendiente
        return 'status-pending';
      case 2: // En revisión
        return 'status-review';
      case 3: // Correcciones
        return 'status-corrections';
      case 4: // Aprobada
        return 'status-approved';
      case 5: // Rechazada
        return 'status-rejected';
      default:
        return 'status-neutral';
    }
  }

  private formatearEstado(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'pendiente': 'Propuesta pendiente',
      'en_revision': 'En revisión',
      'aprobada': 'Propuesta aprobada',
      'correcciones': 'Requiere correcciones',
      'rechazada': 'Propuesta rechazada'
    };
    return estadoMap[estado] || 'Estado desconocido';
  }

  private formatearEstadoCard(estado: string): string {
    const estadoMap: { [key: string]: string } = {
      'pendiente': 'pendiente de revisión',
      'en_revision': 'en revisión',
      'aprobada': 'aprobada',
      'correcciones': 'requiere correcciones',
      'rechazada': 'rechazada'
    };
    return estadoMap[estado] || 'en proceso';
  }

  // Métodos de manejo de errores
  private mostrarError(mensaje: string) {
    this.hasError = true;
    this.errorMensaje = mensaje;
    console.error('❌ Error:', mensaje);
    
    // Ocultar error después de 8 segundos
    setTimeout(() => {
      this.ocultarError();
    }, 8000);
  }

  ocultarError() {
    this.hasError = false;
    this.errorMensaje = '';
  }

  recargarDatos() {
    this.ocultarError();
    this.ngOnInit();
  }

  // ===========================================
  // MÉTODOS ADICIONALES PARA HITOS
  // ===========================================

  validarEntregaHito(): boolean {
    this.erroresValidacionHito = [];

    if (!this.archivoHitoSeleccionado) {
      this.erroresValidacionHito.push('Debe seleccionar un archivo para entregar');
    } else {
      // Validar tamaño del archivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB en bytes
      if (this.archivoHitoSeleccionado.size > maxSize) {
        this.erroresValidacionHito.push('El archivo no puede superar los 10MB');
      }

      // Validar extensión del archivo
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.rar'];
      const fileName = this.archivoHitoSeleccionado.name.toLowerCase();
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      if (!hasValidExtension) {
        this.erroresValidacionHito.push('Formato de archivo no permitido. Use: PDF, DOC, DOCX, PPT, PPTX, ZIP, RAR');
      }
    }

    // Validar fecha límite si no está vencida
    if (this.hitoSeleccionado && this.estaVencido(this.hitoSeleccionado.fecha_limite)) {
      this.erroresValidacionHito.push('La fecha límite para este hito ya ha vencido');
    }

    return this.erroresValidacionHito.length === 0;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
