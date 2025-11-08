import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CronogramaCompletoComponent } from '../../components/cronograma-completo/cronograma-completo.component';
import { DocumentosProyectoComponent } from '../../components/documentos-proyecto/documentos-proyecto.component';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-proyecto-cronograma',
  standalone: true,
  imports: [CommonModule, RouterModule, CronogramaCompletoComponent, DocumentosProyectoComponent],
  templateUrl: './proyecto-cronograma.component.html',
  styleUrl: './proyecto-cronograma.component.scss'
})
export class ProyectoCronogramaComponent implements OnInit {
  projectId!: string;
  cronogramaId!: string;
  userRole!: string;
  userRut!: string;
  tabActiva = 'cronograma';
  
  proyecto: any = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    // Obtener parámetros de la ruta
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    
    // Obtener datos del usuario desde el servicio de autenticación
    // Esto debería venir de tu servicio de autenticación existente
    this.userRole = localStorage.getItem('rol_id') || '1';
    this.userRut = localStorage.getItem('rut') || '';

    this.cargarProyecto();
    this.obtenerCronograma();
  }

  cargarProyecto() {
    this.apiService.getDashboardProyecto(this.projectId).subscribe({
      next: (response: any) => {
        this.proyecto = response.data;
      },
      error: (error: any) => {
        console.error('Error al cargar proyecto:', error);
      }
    });
  }

  obtenerCronograma() {
    this.apiService.obtenerCronograma(this.projectId).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.cronogramaId = response.data.id;
        }
      },
      error: (error: any) => {
        console.error('Error al obtener cronograma:', error);
      }
    });
  }

  cambiarTab(tab: string) {
    this.tabActiva = tab;
  }

  mostrarAccionesFlotantes(): boolean {
    return this.tabActiva === 'cronograma';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CL');
  }
}