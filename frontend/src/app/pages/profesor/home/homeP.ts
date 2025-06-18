import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  templateUrl: './homeP.html',
  styleUrls: ['./homeP.scss']
})
export class HomeProfesorComponent implements OnInit {
  profesor = {
    nombre: 'Nombre del Profesor',
    email: 'profesor@ubiobio.cl'
  };

  opciones = [
    {
      titulo: 'Mis Propuestas',
      icono: 'assignment',
      descripcion: 'Propuestas que has elegido revisar',
      ruta: 'propuestas/asignadas'
    },
    {
      titulo: 'Propuestas Disponibles',
      icono: 'playlist_add',
      descripcion: 'Propuestas sin profesor asignado',
      ruta: 'propuestas/disponibles'
    }
  ];

  constructor(private router: Router, private apiService: ApiService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }

    // Aquí puedes hacer la consulta de datos del profesor si es necesario
    // Ej: this.apiService.getProfesorInfo(token).subscribe(...)
    this.apiService.getPropuestas().subscribe({
      next: (data: any) => console.log('Propuestas cargadas:', data),
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
