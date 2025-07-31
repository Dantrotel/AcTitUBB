import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class EstudianteHomeComponent implements OnInit {
  estudiante: any = {};
  showUserMenu = false;
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
    // Obtener rut del token o del localStorage
    const token = localStorage.getItem('token');
    let rut = '';
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      rut = payload.rut;
    }

    if (rut) {
      this.buscarUserByRut(rut);
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

  buscarUserByRut(rut: string) {
    this.ApiService.buscaruserByrut(rut).subscribe({
      next: (data: any) => {
        this.estudiante = data;
      },
      error: (err) => {
        console.error('Error al obtener usuario:', err);
        this.estudiante.nombre = 'Estudiante';
      }
    });
  }

  fechaActual(): Date {
    return new Date();
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
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }
}
