import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SocketService } from '../../../services/socket.service';

interface UsuarioActivo {
  rut: string;
  nombre: string;
  rol: string;
  pagina_actual: string;
  conectado_en: string;
  ultima_actividad: string;
}

interface EstadisticasActivos {
  total_usuarios: number;
  por_rol: { [key: string]: number };
  paginas_visitadas: { [key: string]: number };
  usuarios: UsuarioActivo[];
}

interface ActividadReciente {
  id: number;
  tipo: string;
  descripcion: string;
  usuario_rut: string;
  usuario_nombre?: string;
  timestamp: string;
}

interface EstadisticasActividad {
  por_dia: Array<{ fecha: string; cantidad: number }>;
  por_tipo: Array<{ tipo: string; cantidad: number }>;
  horas_pico: Array<{ hora: number; cantidad: number }>;
  tiempo_promedio_sesion: number;
}

@Component({
  selector: 'app-actividad-tiempo-real',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actividad-tiempo-real.component.html',
  styleUrls: ['./actividad-tiempo-real.component.scss']
})
export class ActividadTiempoRealComponent implements OnInit, OnDestroy {
  private apiUrl = environment.apiUrl;
  
  // Datos en tiempo real
  estadisticasActivos: EstadisticasActivos = {
    total_usuarios: 0,
    por_rol: {},
    paginas_visitadas: {},
    usuarios: []
  };
  
  // Actividad reciente
  actividadReciente: ActividadReciente[] = [];
  
  // Estadísticas históricas
  estadisticasHistoricas: EstadisticasActividad | null = null;
  
  // Estados
  cargando = false;
  actualizacionAutomatica = true;
  private intervalo: any;
  
  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {}
  
  ngOnInit(): void {
    this.cargarUsuariosActivos();
    this.cargarActividadReciente();
    this.cargarEstadisticasActividad();
    
    // Suscribirse a actualizaciones en tiempo real vía Socket.io
    this.socketService.on('usuarios-activos-update', (data: EstadisticasActivos) => {
      this.estadisticasActivos = data;
    });
    
    // Actualizar datos cada 30 segundos
    this.intervalo = setInterval(() => {
      if (this.actualizacionAutomatica) {
        this.cargarActividadReciente();
      }
    }, 30000);
  }
  
  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
    this.socketService.off('usuarios-activos-update');
  }
  
  /**
   * Cargar usuarios activos
   */
  cargarUsuariosActivos(): void {
    this.http.get<any>(`${this.apiUrl}/actividad/usuarios-activos`).subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticasActivos = response.estadisticas;
        }
      },
      error: (error) => {
      }
    });
  }
  
  /**
   * Cargar actividad reciente
   */
  cargarActividadReciente(limite: number = 50): void {
    this.http.get<any>(`${this.apiUrl}/actividad/reciente?limite=${limite}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.actividadReciente = response.actividad;
        }
      },
      error: (error) => {
      }
    });
  }
  
  /**
   * Cargar estadísticas de actividad
   */
  cargarEstadisticasActividad(dias: number = 7): void {
    this.cargando = true;
    this.http.get<any>(`${this.apiUrl}/actividad/estadisticas?dias=${dias}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.estadisticasHistoricas = response.estadisticas;
        }
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
      }
    });
  }
  
  /**
   * Alternar actualización automática
   */
  toggleActualizacionAutomatica(): void {
    this.actualizacionAutomatica = !this.actualizacionAutomatica;
  }
  
  /**
   * Refrescar datos manualmente
   */
  refrescarDatos(): void {
    this.cargarUsuariosActivos();
    this.cargarActividadReciente();
    this.cargarEstadisticasActividad();
  }
  
  /**
   * Formatear fecha relativa
   */
  formatearFechaRelativa(fecha: string): string {
    const ahora = new Date();
    const timestamp = new Date(fecha);
    const diff = ahora.getTime() - timestamp.getTime();
    
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);
    
    if (minutos < 1) return 'Hace un momento';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas}h`;
    return `Hace ${dias} días`;
  }
  
  /**
   * Obtener icono para tipo de actividad
   */
  getIconoActividad(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'login': 'fas fa-sign-in-alt',
      'logout': 'fas fa-sign-out-alt',
      'propuesta_creada': 'fas fa-file-alt',
      'proyecto_aprobado': 'fas fa-check-circle',
      'documento_subido': 'fas fa-upload',
      'reunion_agendada': 'fas fa-calendar-plus',
      'avance_registrado': 'fas fa-tasks',
      'evaluacion_realizada': 'fas fa-star'
    };
    
    return iconos[tipo] || 'fas fa-circle';
  }
  
  /**
   * Obtener color para tipo de actividad
   */
  getColorActividad(tipo: string): string {
    const colores: { [key: string]: string } = {
      'login': '#4caf50',
      'logout': '#9e9e9e',
      'propuesta_creada': '#2196f3',
      'proyecto_aprobado': '#4caf50',
      'documento_subido': '#ff9800',
      'reunion_agendada': '#9c27b0',
      'avance_registrado': '#03a9f4',
      'evaluacion_realizada': '#ffc107'
    };
    
    return colores[tipo] || '#607d8b';
  }
  
  /**
   * Formatear tiempo promedio de sesión
   */
  formatearTiempoSesion(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = Math.floor(minutos % 60);
    
    if (horas > 0) {
      return `${horas}h ${mins}min`;
    }
    return `${mins}min`;
  }
  
  /**
   * Obtener claves de objeto
   */
  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
  
  /**
   * Obtener valor máximo de un array de objetos
   */
  getMaxValue(array: any[]): number {
    if (!array || array.length === 0) return 1;
    return Math.max(...array.map(item => item.cantidad));
  }
}
