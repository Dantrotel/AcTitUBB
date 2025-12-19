import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CronogramaCompletoComponent } from '../../components/cronograma-completo/cronograma-completo.component';
import { DocumentosProyectoComponent } from '../../components/documentos-proyecto/documentos-proyecto.component';
import { HistorialVersionesComponent } from '../../components/historial-versiones/historial-versiones.component';
import { ColaboradoresProyectoComponent } from '../../components/colaboradores-proyecto/colaboradores-proyecto.component';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-proyecto-cronograma',
  standalone: true,
  imports: [CommonModule, RouterModule, CronogramaCompletoComponent, DocumentosProyectoComponent, HistorialVersionesComponent, ColaboradoresProyectoComponent],
  templateUrl: './proyecto-cronograma.component.html',
  styleUrl: './proyecto-cronograma.component.scss'
})
export class ProyectoCronogramaComponent implements OnInit {
  projectId!: number;
  cronogramaId!: string;
  userRole!: string;
  userRut!: string;
  tabActiva = 'cronograma';
  
  proyecto: any = null;
  avances: any[] = [];
  avanceSeleccionado: any = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Obtener parámetros de la ruta
    const projectIdStr = this.route.snapshot.paramMap.get('id') || '';
    this.projectId = parseInt(projectIdStr, 10);
    
    // Obtener datos del usuario desde el servicio de autenticación
    // Esto debería venir de tu servicio de autenticación existente
    this.userRole = localStorage.getItem('rol_id') || '1';
    this.userRut = localStorage.getItem('rut') || '';

    this.cargarProyecto();
    this.obtenerCronograma();
  }

  cargarProyecto() {
    this.apiService.getDashboardProyecto(this.projectId.toString()).subscribe({
      next: (response: any) => {
        this.proyecto = response.data;
        this.cargarAvances();
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar proyecto:', error);
        this.cdr.detectChanges();
      }
    });
  }

  cargarAvances() {
    this.apiService.getAvancesByProyecto(this.projectId.toString()).subscribe({
      next: (response: any) => {
        this.avances = response.data || [];
        if (this.avances.length > 0) {
          this.avanceSeleccionado = this.avances[0];
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar avances:', error);
        this.avances = [];
        this.cdr.detectChanges();
      }
    });
  }

  seleccionarAvance(avance: any) {
    this.avanceSeleccionado = avance;
  }

  obtenerCronograma() {
    this.apiService.obtenerCronograma(this.projectId.toString()).subscribe({
      next: (response: any) => {
        if (response.data) {
          this.cronogramaId = response.data.id;
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al obtener cronograma:', error);
        this.cdr.detectChanges();
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