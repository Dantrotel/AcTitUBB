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
  userRut: string = '';
  userRolId: number = 0;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
  const token = localStorage.getItem('token');
  let rut = '';
  let rolId = 0;

  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    rut = payload.rut;
    rolId = payload.rol_id;
  }

  this.apiService.getPropuestas().subscribe((data) => {
    this.propuestas = (data as any[]).map((propuesta) => {
      propuesta.puedeEditar = propuesta.estudiante_rut === rut;
      propuesta.puedeEliminar = propuesta.estudiante_rut === rut
      return propuesta;
    });
  });
}


  irAEditar(id: number) {
    this.router.navigate(['propuestas/editar-propuesta/', id]);
  }

  verdetalle(id: number) {
    this.router.navigate(['propuestas/ver-detalle', id]);
  }

  eliminarPropuesta(id: number) {
    this.apiService.deletePropuesta(id.toString()).subscribe({
      next: (res: any) => {
        console.log('Propuesta eliminada:', res);
        this.propuestas = this.propuestas.filter(p => p.id !== id);
      },
      error: (err: any) => console.error('Error al eliminar propuesta:', err)
    });
  }
}
