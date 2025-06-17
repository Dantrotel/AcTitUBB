import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-listar-propuestas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-propuestas.html',
  styleUrls: ['./lista-propuestas.scss']
})
export class ListarPropuestasComponent implements OnInit {
  propuestas: any[] = [];
  constructor(private apiService: ApiService, private router: Router) {}


  ngOnInit(): void {
    this.apiService.getPropuestas().subscribe((data) => {
      this.propuestas = data as any[];
    });
  }

   irAEditar(id: number) {
    this.router.navigate(['propuestas/editar-propuesta/', id]);
  }

  verdetalle(id: number) {
    this.router.navigate(['propuestas/', id]);
  }

  eliminarPropuesta(id: number) {
    this.apiService.deletePropuesta(id.toString()).subscribe({
      next: (res: any) => {
        console.log('Propuesta eliminada:', res);
        // Actualizar la lista de propuestas después de eliminar
        this.propuestas = this.propuestas.filter(p => p.id !== id);
      },
      error: (err: any) => console.error('Error al eliminar propuesta:', err)
    });
  }

}
