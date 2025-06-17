import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-actualizar-propuesta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-propuesta.html',
  styleUrls: ['./editar-propuesta.scss']
})
export class ActualizarPropuestaComponent implements OnInit {
  propuestaId!: string;
  propuesta: any = { titulo: '', descripcion: '' };

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.propuestaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.propuestaId) {
      this.apiService.getPropuestaById(this.propuestaId).subscribe({
        next: (data: any) => {
          this.propuesta = data;
        },
        error: (err: any) => {
          console.error('Error al obtener propuesta:', err);
        }
      });
    }
  }
  formatearFechaHoraParaMySQL(date: Date): string {
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

  actualizar() {
     console.log('Propuesta a actualizar:', this.propuesta); 
      const fecha = new Date(this.propuesta.fecha_envio);
      this.propuesta.fecha_envio = this.formatearFechaHoraParaMySQL(fecha);
    if (!this.propuesta.titulo || !this.propuesta.descripcion) {
      alert('Completa todos los campos');
      return;
    }

    this.apiService.updatePropuesta(this.propuestaId, this.propuesta).subscribe({
      next: (res: any) => {
        console.log('Propuesta actualizada:', res);
        alert('Propuesta actualizada con éxito');
      },
      error: (err: any) => {
        console.error('Error al actualizar:', err);
        alert('Error al actualizar la propuesta');
      }
    });
  }
}
