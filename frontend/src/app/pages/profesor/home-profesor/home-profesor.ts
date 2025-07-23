import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-home-profesor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './home-profesor.html',
  styleUrls: ['./home-profesor.scss']
})
export class HomeProfesor implements OnInit {
  profesor: any = {};
  opciones = [
    {
      titulo: 'Propuestas Asignadas',
      icono: 'assignment_turned_in',
      descripcion: 'Revisa las propuestas que estás evaluando',
      ruta: 'profesor/propuestas/asignadas'
    },
    {
      titulo: 'Ver Todas las Propuestas',
      icono: 'visibility',
      descripcion: 'Consulta el listado completo de propuestas',
      ruta: 'profesor/propuestas/todas'
    }
  ];

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

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
