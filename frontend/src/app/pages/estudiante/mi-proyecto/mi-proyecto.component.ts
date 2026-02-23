import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-mi-proyecto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-proyecto.component.html',
  styleUrls: ['./mi-proyecto.component.scss']
})
export class MiProyectoComponent implements OnInit {
  estado: 'cargando' | 'sin_proyecto' | 'error' = 'cargando';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.apiService.getMisProyectos().subscribe({
      next: (response: any) => {
        const proyectos = response?.projects || [];
        if (proyectos.length > 0) {
          const id = proyectos[0].id;
          // replaceUrl evita que /mi-proyecto quede en el historial
          this.router.navigate(['/estudiante/proyecto', id], { replaceUrl: true });
        } else {
          this.estado = 'sin_proyecto';
        }
      },
      error: () => {
        this.estado = 'error';
      }
    });
  }

  irAlInicio() {
    this.router.navigate(['/estudiante/home']);
  }

  reintentar() {
    this.estado = 'cargando';
    this.ngOnInit();
  }
}
