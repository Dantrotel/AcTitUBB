import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'home-admin',
  templateUrl: './home-admin.html',
  styleUrls: ['./home-admin.scss']
})
export class HomeAdminComponent implements OnInit {
  Math = Math;
  userRut = '';
  userName = '';
  userRole = '';
  estadisticas = {
    totalPropuestas: 0,
    propuestasPendientes: 0,
    propuestasEnRevision: 0,
    propuestasAprobadas: 0,
    totalEstudiantes: 0,
    totalProfesores: 0
  };

  // Sistema de notificaciones
  notificaciones: any[] = [];
  notificacionesNoLeidas = 0;
  mostrarPanelNotificaciones = false;
  showUserMenu = false;
  
  // Dashboard analytics
  dashboard: any = null;
  loadingDashboard = false;

  // Monitoreo regulatorio
  proyectosRiesgo: any[] = [];
  informantesPendientes: any[] = [];
  alertasAbandono: any[] = [];
  loadingRegulatorio = false;
  
  // Control de modales
  mostrarModalProyectosRiesgo = false;
  mostrarModalInformantesPendientes = false;
  mostrarModalAlertasAbandono = false;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
    this.cargarDashboard(); // Dashboard unificado con todas las estadísticas
    this.cargarNotificaciones();
    this.generarNotificacionesEspeciales();
    this.cargarDatosRegulatorios();
  }
  
  async cargarDatosRegulatorios() {
    this.loadingRegulatorio = true;
    try {
      // Cargar proyectos en riesgo
      const riesgoResponse = await this.apiService.getProyectosRiesgo();
      if (riesgoResponse && riesgoResponse.success) {
        this.proyectosRiesgo = riesgoResponse.proyectos || [];
      }

      // Cargar informantes pendientes
      const informantesResponse = await this.apiService.getInformantesPendientes();
      if (informantesResponse && informantesResponse.success) {
        this.informantesPendientes = informantesResponse.entregas || [];
      }

      // Cargar alertas de abandono
      const alertasResponse = await this.apiService.getAlertasAbandono();
      if (alertasResponse && alertasResponse.success) {
        this.alertasAbandono = alertasResponse.alertas || [];
      }
    } catch (error) {
      console.error('Error al cargar datos regulatorios:', error);
    } finally {
      this.loadingRegulatorio = false;
    }
  }
  
  async cargarDashboard() {
    this.loadingDashboard = true;
    try {
      const response = await this.apiService.getDashboardAdmin();
      if (response && response.success) {
        this.dashboard = response.data;
      }
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      this.loadingDashboard = false;
    }
  }

  private obtenerDatosUsuario(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRut = payload.rut || '';
        this.userName = payload.nombre || '';
        this.userRole = payload.rol_id || '';
        
        console.log('🔍 Admin - Datos usuario:', {
          rut: this.userRut,
          nombre: this.userName,
          rol: this.userRole
        });
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }

  // DEPRECATED: Ahora se usa el dashboard unificado
  // private cargarEstadisticas(): void {
  //   this.loading = true;
  //   
  //   this.apiService.getEstadisticas().subscribe({
  //     next: (data: any) => {
  //       this.estadisticas = {
  //         totalPropuestas: data.propuestas.total_propuestas || 0,
  //         propuestasPendientes: data.propuestas.propuestas_pendientes || 0,
  //         propuestasEnRevision: data.propuestas.propuestas_en_revision || 0,
  //         propuestasAprobadas: data.propuestas.propuestas_aprobadas || 0,
  //         totalEstudiantes: data.usuarios.total_estudiantes || 0,
  //         totalProfesores: data.usuarios.total_profesores || 0
  //       };
  //       this.loading = false;
  //     },
  //     error: (error) => {
  //       console.error('Error al cargar estadísticas:', error);
  //       this.loading = false;
  //     }
  //   });
  // }

  // Navegación a diferentes secciones
  irAGestionPropuestas(): void {
    this.router.navigate(['/admin/propuestas']);
  }

  irAGestionUsuarios(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  irAAsignaciones(): void {
    this.router.navigate(['/admin/asignaciones']);
  }

  irAGestionCalendario(): void {
    this.router.navigate(['/admin/calendario']);
  }

  irAGestionPeriodoPropuestas(): void {
    this.router.navigate(['/admin/gestion-periodo-propuestas']);
  }

  irAFechasImportantes(): void {
    this.router.navigate(['/admin/fechas-importantes']);
  }

  irACalendarioMatching(): void {
    this.router.navigate(['/calendario-matching/dashboard']);
  }

  irACalendarioUnificado(): void {
    this.router.navigate(['/admin/calendario-unificado']);
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  fechaActual(): Date {
    return new Date();
  }

  // ===== SISTEMA DE NOTIFICACIONES =====
  
  cargarNotificaciones(): void {
    // Generar notificaciones basadas en estadísticas y actividad reciente
    this.notificaciones = [];
    
    // Notificaciones basadas en propuestas pendientes
    if (this.estadisticas.propuestasPendientes > 0) {
      this.notificaciones.push({
        id: 'propuestas_pendientes',
        tipo: 'warning',
        titulo: 'Propuestas Pendientes',
        mensaje: `Tienes ${this.estadisticas.propuestasPendientes} propuesta(s) pendiente(s) de revisión`,
        fecha: new Date(),
        leida: false,
        accion: () => this.irAGestionPropuestas()
      });
    }

    // Notificaciones de propuestas en revisión
    if (this.estadisticas.propuestasEnRevision > 0) {
      this.notificaciones.push({
        id: 'propuestas_revision',
        tipo: 'info',
        titulo: 'Propuestas en Revisión',
        mensaje: `${this.estadisticas.propuestasEnRevision} propuesta(s) están siendo revisadas`,
        fecha: new Date(),
        leida: false,
        accion: () => this.irAGestionPropuestas()
      });
    }

    this.calcularNotificacionesNoLeidas();
  }

  generarNotificacionesEspeciales(): void {
    // Notificaciones especiales basadas en fechas y plazos
    const hoy = new Date();
    const esFinDeMes = hoy.getDate() > 25;
    const esInicioSemestre = hoy.getMonth() === 2 || hoy.getMonth() === 7; // Marzo y Agosto

    if (esFinDeMes) {
      this.notificaciones.unshift({
        id: 'fin_mes',
        tipo: 'info',
        titulo: 'Fin de Mes',
        mensaje: 'Recuerda revisar los reportes mensuales y actualizar estadísticas',
        fecha: new Date(),
        leida: false,
        accion: () => this.cargarDashboard()
      });
    }

    if (esInicioSemestre) {
      this.notificaciones.unshift({
        id: 'inicio_semestre',
        tipo: 'success',
        titulo: 'Inicio de Semestre',
        mensaje: 'Nuevo semestre académico - Revisar configuraciones del sistema',
        fecha: new Date(),
        leida: false,
        accion: () => this.irAGestionCalendario()
      });
    }

    this.calcularNotificacionesNoLeidas();
  }

  togglePanelNotificaciones(): void {
    this.mostrarPanelNotificaciones = !this.mostrarPanelNotificaciones;
    if (this.mostrarPanelNotificaciones) {
      this.showUserMenu = false;
    }
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.mostrarPanelNotificaciones = false;
    }
  }

  marcarComoLeida(notificacion: any): void {
    notificacion.leida = true;
    this.calcularNotificacionesNoLeidas();
    
    // Ejecutar acción si existe
    if (notificacion.accion) {
      notificacion.accion();
    }
  }

  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach(notif => notif.leida = true);
    this.calcularNotificacionesNoLeidas();
  }

  eliminarNotificacion(notificacionId: string): void {
    this.notificaciones = this.notificaciones.filter(notif => notif.id !== notificacionId);
    this.calcularNotificacionesNoLeidas();
  }

  private calcularNotificacionesNoLeidas(): void {
    this.notificacionesNoLeidas = this.notificaciones.filter(notif => !notif.leida).length;
  }

  obtenerIconoNotificacion(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'info': 'fas fa-info-circle',
      'warning': 'fas fa-exclamation-triangle',
      'success': 'fas fa-check-circle',
      'error': 'fas fa-times-circle'
    };
    return iconos[tipo] || 'fas fa-bell';
  }

  obtenerColorNotificacion(tipo: string): string {
    const colores: { [key: string]: string } = {
      'info': '#17a2b8',
      'warning': '#ffc107',
      'success': '#28a745',
      'error': '#dc3545'
    };
    return colores[tipo] || '#6c757d';
  }

  formatearTiempoNotificacion(fecha: Date): string {
    const ahora = new Date();
    const diff = Math.floor((ahora.getTime() - fecha.getTime()) / 1000); // Segundos

    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  }

  // ===== MÉTODOS DE MONITOREO REGULATORIO =====

  contarPorRiesgo(nivel: string): number {
    return this.proyectosRiesgo.filter(p => p.nivel_riesgo === nivel).length;
  }

  contarPorPlazo(estado: string): number {
    return this.informantesPendientes.filter(i => i.estado_plazo === estado).length;
  }

  contarPorSeveridad(severidad: string): number {
    return this.alertasAbandono.filter(a => a.nivel_severidad === severidad).length;
  }

  verProyectosRiesgo(): void {
    this.mostrarModalProyectosRiesgo = true;
    console.log('📊 Mostrando modal de proyectos en riesgo:', this.proyectosRiesgo);
  }
  
  cerrarModalProyectosRiesgo(): void {
    this.mostrarModalProyectosRiesgo = false;
  }

  verInformantesPendientes(): void {
    this.mostrarModalInformantesPendientes = true;
    console.log('📋 Mostrando modal de informantes pendientes:', this.informantesPendientes);
  }
  
  cerrarModalInformantesPendientes(): void {
    this.mostrarModalInformantesPendientes = false;
  }

  verAlertasAbandono(): void {
    this.mostrarModalAlertasAbandono = true;
    console.log('📢 Mostrando modal de alertas de abandono:', this.alertasAbandono);
  }
  
  cerrarModalAlertasAbandono(): void {
    this.mostrarModalAlertasAbandono = false;
  }

  // TrackBy functions para evitar re-renderizado innecesario
  trackByProyectoId(index: number, item: any): any {
    return item.proyecto_id || index;
  }

  trackByHitoId(index: number, item: any): any {
    return item.hito_id || item.id || index;
  }

  trackByAlertaId(index: number, item: any): any {
    return item.id || index;
  }
} 