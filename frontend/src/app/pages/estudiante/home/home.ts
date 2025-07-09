import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,   MatCardModule,    // Módulo para mat-card y sus componentes relacionados
    MatIconModule,    // Módulo para los iconos
    MatButtonModule,  // Módulo para los botones
    MatTooltipModule ], // Módulo para los tooltips],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})

export class EstudianteHomeComponent {
  // Datos del estudiante (puedes obtenerlos del servicio de autenticación)
  estudiante = {
    nombre: 'Nombre del Estudiante',
    matricula: 'MAT12345',
    carrera: 'Ingeniería de Software'
  };

  // Opciones disponibles
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

  constructor(private router: Router) {}

  navegar(ruta: string) {
    this.router.navigate([ruta]); 
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);

  }
}