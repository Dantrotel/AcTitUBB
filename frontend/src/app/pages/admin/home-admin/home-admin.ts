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
  loading = true;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
    this.cargarEstadisticas();
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

  private cargarEstadisticas(): void {
    this.loading = true;
    
    this.apiService.getEstadisticas().subscribe({
      next: (data: any) => {
        this.estadisticas = {
          totalPropuestas: data.propuestas.total_propuestas || 0,
          propuestasPendientes: data.propuestas.propuestas_pendientes || 0,
          propuestasEnRevision: data.propuestas.propuestas_en_revision || 0,
          propuestasAprobadas: data.propuestas.propuestas_aprobadas || 0,
          totalEstudiantes: data.usuarios.total_estudiantes || 0,
          totalProfesores: data.usuarios.total_profesores || 0
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.loading = false;
      }
    });
  }

  // Navegación a diferentes secciones
  irAGestionPropuestas() {
    this.router.navigate(['/admin/propuestas']);
  }

  irAGestionUsuarios() {
    this.router.navigate(['/admin/usuarios']);
  }

  irAGestionProfesores() {
    this.router.navigate(['/admin/profesores']);
  }

  irAAsignaciones() {
    this.router.navigate(['/admin/asignaciones']);
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  fechaActual(): Date {
    return new Date();
  }
} 