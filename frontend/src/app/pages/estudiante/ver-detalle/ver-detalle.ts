import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api'; // Ajusta si tu path es distinto

@Component({
  selector: 'app-ver-propuesta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-detalle.html',
  styleUrls: ['./ver-detalle.scss']
})
export class VerPropuestaComponent implements OnInit {
  propuestaId!: string;
  propuesta: any = null;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.propuestaId = this.route.snapshot.paramMap.get('id') || '';

    if (this.propuestaId) {
      this.apiService.getPropuestaById(this.propuestaId).subscribe({
        next: (data: any) => {
          this.propuesta = data;
        },
        error: (err: any) => {
          console.error('Error al obtener la propuesta', err);
          this.error = 'No se pudo obtener la propuesta. Verifica el ID.';
        }
      });
    }
  }
}
