import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-lista-propuestas-profesor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-propuestas.html',
  styleUrls: ['./lista-propuestas.scss'],
})
export class ListaPropuestasProfesorComponent implements OnInit {
  propuestas: any[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit() {
    this.api.getPropuestas().subscribe({
      next: (data: any) => this.propuestas = data,
      error: (err) => console.error('Error cargando propuestas:', err),
    });
  }

  asignarse(id: number) {
    this.api.asignarPropuesta(id.toString(), {}).subscribe({
      next: () => {
        alert('Te has asignado esta propuesta');
        this.ngOnInit(); // Recargar lista
      },
      error: (err) => console.error('Error al asignarse:', err)
    });
  }

  verAsignadas() {
    this.router.navigate(['/profesor/propuestas-asignadas']);
  }

  verDetalle(id: number) {
    this.router.navigate(['/profesor/propuesta', id]);
  }
}
