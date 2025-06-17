import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-crear-propuesta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-propuesta.html',
  styleUrls: ['./crear-propuesta.scss']
})
export class CrearPropuestaComponent {
  titulo = '';
  descripcion = '';

  constructor(private apiService: ApiService) {}

  crear() {
    const propuesta = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      fecha_envio: new Date().toISOString().split('T')[0]
    };
    this.apiService.createPropuesta(propuesta).subscribe({
      next: (res: any) => console.log('Propuesta creada:', res),
      error: (err: any) => console.error('Error:', err)
    });
  }
}

