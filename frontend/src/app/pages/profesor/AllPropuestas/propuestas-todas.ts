import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './../../../services/api';
import { Router } from '@angular/router';

// Importar Angular Material necesarios para tarjetas y ripple
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-propuestas-todas',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatRippleModule],
  templateUrl: './propuestas-todas.html',
  styleUrls: ['./propuestas-todas.scss']
})
export class PropuestasTodas implements OnInit {
  propuestas: any[] = [];

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.apiService.getPropuestas().subscribe({
      next: (res: any) => {
        this.propuestas = res.propuestas || res || [];
      },
      error: (err: any) => {
        console.error('Error al cargar propuestas:', err);
      }
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['/propuestas/ver-detalle', id]);
  }
}
