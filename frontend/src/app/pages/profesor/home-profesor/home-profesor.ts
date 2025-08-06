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
  ultimaActividad: string = '';
  showCalendarModal = false;
  fechasCalendario: any[] = [];
  proximasFechas: any[] = [];

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
}
