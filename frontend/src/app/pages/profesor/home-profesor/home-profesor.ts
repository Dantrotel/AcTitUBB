import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

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
export class HomeProfesor {
  // Datos del profesor (deberían venir del servicio de autenticación)
  profesor = {
    nombre: 'Nombre del Profesor',
    correo: 'profesor@ubiobio.cl',
    departamento: 'Departamento de Informática'
  };

  // Opciones del panel del profesor
  opciones = [
    {
      titulo: 'Propuestas Asignadas',
      icono: 'assignment_turned_in',
      descripcion: 'Revisa las propuestas que estás evaluando',
      ruta: '/propuestas/asignadas'
    },
    {
      titulo: 'Ver Todas las Propuestas',
      icono: 'visibility',
      descripcion: 'Consulta el listado completo de propuestas',
      ruta: 'profesor/propuestas/todas'
    }
  ];

  constructor(private router: Router) {}

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
