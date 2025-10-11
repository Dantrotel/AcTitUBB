import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
        this.estadisticasProyectos.totalProyectos = data.projects?.length || 0;
        this.estadisticasProyectos.enDesarrollo = data.projects?.filter((p: any) => 
          p.estado_proyecto?.includes('desarrollo')).length || 0;
        
        // Simular próximos hitos y evaluaciones pendientes
        this.estadisticasProyectos.proximosHitos = Math.floor(Math.random() * 5) + 1;
        this.estadisticasProyectos.evaluacionesPendientes = Math.floor(Math.random() * 3) + 1;
      },
      error: (err: any) => {
        console.error('Error al cargar estadísticas de proyectos:', err);
      }
    });
  }

  cargarProyectosRecientes() {
    // Cargar proyectos recientes del profesor
    this.ApiService.getProyectosAsignados().subscribe({
      next: (data: any) => {
        this.proyectosRecientes = (data.projects || []).slice(0, 3).map((proyecto: any) => ({
          id: proyecto.id,
          titulo: proyecto.titulo,
          estudiante: proyecto.nombre_estudiante,
          estado: proyecto.estado_proyecto,
          porcentaje_avance: proyecto.porcentaje_avance || 0,
          fecha_actualizacion: proyecto.updated_at
        }));
      },
      error: (err: any) => {
        console.error('Error al cargar proyectos recientes:', err);
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
  }

  navegar(ruta: string) {
    this.showUserMenu = false; // Cerrar menú al navegar
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

  getIconoTipoFecha(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'entrega': 'fas fa-upload',
      'reunion': 'fas fa-users',
      'evaluacion': 'fas fa-clipboard-check',
      'presentacion': 'fas fa-presentation',
      'deadline': 'fas fa-clock',
      'revision': 'fas fa-search'
    };
    return iconos[tipo] || 'fas fa-calendar-day';
  }

  fechaActual(): Date {
    return new Date();
  }

  // Nuevos métodos para gestión de proyectos
  navegarAProyectos() {
    this.router.navigate(['/profesor/proyectos']);
  }

  navegarAProyecto(proyectoId: number) {
    this.router.navigate(['/proyectos', proyectoId]);
  }

  navegarAHitos() {
    this.router.navigate(['/profesor/hitos']);
  }

  navegarAEvaluaciones() {
    this.router.navigate(['/profesor/evaluaciones']);
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
}
