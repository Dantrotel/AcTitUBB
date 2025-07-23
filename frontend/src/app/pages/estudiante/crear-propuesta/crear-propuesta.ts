import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { Router } from '@angular/router';

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
  archivo: File | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files?.[0] || null;
  }

  crear() {
    if (!this.archivo) {
      alert('Debes seleccionar un archivo (PDF o Word)');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', this.titulo);
    formData.append('descripcion', this.descripcion);
    formData.append('fecha_envio', new Date().toISOString().split('T')[0]);
    formData.append('archivo', this.archivo);

    this.apiService.createPropuesta(formData).subscribe({
      next: (res: any) => {
        console.log('Propuesta creada:', res);
        alert('Propuesta creada con éxito');
      },
      error: (err: any) => {
        console.error('Error:', err);
        alert('Hubo un error al crear la propuesta');
      }
    });
  }
   volver() {
    this.router.navigate(['/estudiante']);
  }
}
