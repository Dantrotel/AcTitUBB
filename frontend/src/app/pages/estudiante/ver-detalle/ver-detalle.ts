import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api'; // Ajusta si tu path es distinto
import { saveAs } from 'file-saver'; // Asegúrate de tener instalado file-saver

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
  esProfesor = false; 

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
  this.propuestaId = this.route.snapshot.paramMap.get('id') || '';

   const userDataStr = localStorage.getItem('userData');
  if (userDataStr) {
    const userData = JSON.parse(userDataStr);
    this.esProfesor = userData.rol_id === 2; // O el número que corresponda a profesor
  } else {
    this.esProfesor = false;
  }


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

   descargarArchivo(nombreArchivo: string) {
    this.apiService.descargarArchivo(nombreArchivo).subscribe({
      next: (blob) => {
        saveAs(blob, nombreArchivo);
      },
      error: (err) => {
        console.error('Error al descargar archivo', err);
        alert('Error al descargar archivo');
      }
    });
  }

   asignarme() {
    this.apiService.asignarPropuesta(this.propuestaId, {}).subscribe({
      next: () => alert('Te has asignado esta propuesta correctamente.'),
      error: () => alert('No se pudo asignar la propuesta.')
    });
  }
}

