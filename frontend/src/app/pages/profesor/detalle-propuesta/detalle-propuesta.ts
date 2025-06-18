import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-detalle-propuesta-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-propuesta.html',
  styleUrls: ['./detalle-propuesta.scss'],
})
export class DetallePropuestaProfesorComponent implements OnInit {
  propuestaId!: number;
  propuesta: any = {};
  comentario: string = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit() {
    this.propuestaId = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getPropuestaById(this.propuestaId.toString()).subscribe({
      next: (data) => this.propuesta = data,
      error: (err) => console.error('Error al cargar propuesta:', err)
    });
  }

  guardarRevision(nuevoEstado: string) {
  const payload = {
    comentario: this.comentario,
    estado: nuevoEstado
  };

  this.api.revisarPropuesta(this.propuestaId.toString(), payload).subscribe({
    next: () => {
      alert('Comentario y estado guardados correctamente');
      this.comentario = '';
      this.ngOnInit(); // Recarga los datos
    },
    error: (err) => console.error('Error al guardar revisión:', err)
  });
}

}
