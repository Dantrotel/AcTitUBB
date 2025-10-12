import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api';
import { CalendarModalComponent } from '../../../components/calendar-modal/calendar-modal.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CalendarModalComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class EstudianteHomeComponent implements OnInit, OnDestroy {
  estudiante: any = {};
  showUserMenu = false;
  showCalendarioMenu = false;
  propuestas: any[] = [];
  ultimaPropuesta: any = null;
  progresoProyecto = 0;
  proximasFechas: any[] = [];
  estadisticas = {
    totalPropuestas: 0,
    enRevision: 0,
    aprobadas: 0,
    diasRestantes: 0
  };
  showCalendarModal = false;
  
  // Estados de carga y errores
  loadingPropuestas = false;
  loadingEstudiante = false;
  errorMensaje = '';
  hasError = false;

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

  constructor(private router: Router, private ApiService: ApiService) {}

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

  buscarUserByRut(rut: string) {
    this.loadingEstudiante = true;
    this.ApiService.buscaruserByrut(rut).subscribe({
      next: (data: any) => {
        this.estudiante = data;
        this.loadingEstudiante = false;
        console.log('✅ Datos del estudiante cargados:', this.estudiante);
      },
      error: (err) => {
        console.error('Error al obtener usuario:', err);
        this.estudiante.nombre = 'Estudiante';
        this.loadingEstudiante = false;
        this.mostrarError('No se pudo cargar la información del usuario');
      }
    });
  }

  cargarPropuestas(rut: string) {
    this.loadingPropuestas = true;
    // Usar el nuevo endpoint específico para estudiantes
    this.ApiService.getMisPropuestas().subscribe({
      next: (data: any) => {
        this.propuestas = Array.isArray(data) ? data : [];
        this.loadingPropuestas = false;
        console.log('✅ Propuestas del estudiante cargadas:', this.propuestas);
        
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
        // Fallback al método anterior en caso de error
        this.cargarPropuestasFallback(rut);
      }
    });
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
        console.log('Fechas próximas del backend:', response);
        
        if (Array.isArray(response) && response.length > 0) {
          this.proximasFechas = response.map((fecha: any) => ({
            titulo: fecha.titulo,
            fecha: new Date(fecha.fecha),
            icono: this.getIconoTipoFecha(fecha.tipo_fecha),
            esDelBackend: true,
            creador: fecha.tipo_creador || (fecha.es_global ? 'Admin' : 'Profesor')
          }));
          console.log('✅ Fechas cargadas desde BD:', this.proximasFechas.length);
        } else {
          this.proximasFechas = [];
          console.log('ℹ️  No hay fechas en la base de datos');
        }
      },
      error: (error) => {
        console.error('Error al cargar fechas próximas:', error);
        // NO generar fechas dummy - solo dejar vacío
        this.proximasFechas = [];
        console.log('⚠️  Error cargando fechas, lista vacía');
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

  navegarAUltimaPropuesta() {
    if (this.ultimaPropuesta) {
      this.router.navigate(['/propuestas/ver-detalle', this.ultimaPropuesta.id]);
    } else {
      this.router.navigate(['/propuestas/crear']);
    }
  }

  abrirCalendario() {
    console.log('Abriendo calendario con propuestas:', this.propuestas);
    this.showCalendarModal = true;
  }

  cerrarCalendario() {
    this.showCalendarModal = false;
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

  cerrarSesion() {
    this.showUserMenu = false;
    this.ApiService.logout();
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
}
