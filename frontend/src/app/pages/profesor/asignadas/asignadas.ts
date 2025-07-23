import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, MatCardModule, RouterModule],
  selector: 'asignadas',
  templateUrl: './asignadas.html',
  styleUrls: ['./asignadas.scss']
})
export class PropuestasAsignadasComponent implements OnInit {
  propuestas: any[] = [];
  loading = true;
  error = '';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarPropuestasAsignadas();
  }

  private cargarPropuestasAsignadas(): void {
    const profesorId = localStorage.getItem('userId');

    if (!profesorId) {
      this.error = 'No se encontró el ID del profesor';
      this.loading = false;
      return;
    }

    this.api.getPropuestasAsignadasProfesor(profesorId).subscribe(
      (data: any) => {
        this.propuestas = data;
        this.loading = false;
      },
      (err) => {
        console.error('Error al cargar propuestas:', err);
        this.error = 'No se pudieron cargar las propuestas';
        this.loading = false;
      }
    );
  }
}
