import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CronogramaCompletoComponent } from '../../components/cronograma-completo/cronograma-completo.component';
import { DocumentosProyectoComponent } from '../../components/documentos-proyecto/documentos-proyecto.component';
import { ColaboradoresProyectoComponent } from '../../components/colaboradores-proyecto/colaboradores-proyecto.component';
import { RevisionHitosProfesorComponent } from '../../components/revision-hitos-profesor/revision-hitos-profesor.component';
import { RevisionHitosInformanteComponent } from '../../components/revision-hitos-informante/revision-hitos-informante.component';
import { RetroalimentacionEstudianteComponent } from '../../components/retroalimentacion-estudiante/retroalimentacion-estudiante.component';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-proyecto-cronograma',
  standalone: true,
  imports: [CommonModule, RouterModule, CronogramaCompletoComponent, DocumentosProyectoComponent, ColaboradoresProyectoComponent, RevisionHitosProfesorComponent, RevisionHitosInformanteComponent, RetroalimentacionEstudianteComponent],
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

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Obtener parámetros de la ruta
    const projectIdStr = this.route.snapshot.paramMap.get('id') || '';
    this.projectId = parseInt(projectIdStr, 10);
    
    // Leer rol y rut desde el payload del JWT guardado al hacer login
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      this.userRole = (userData.rol_id ?? '1').toString();
      this.userRut = userData.rut || '';
    } else {
      this.userRole = '1';
      this.userRut = '';
    }

    // Leer el parámetro 'tab' de la URL para abrir la pestaña correcta
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.tabActiva = params['tab'];
        console.log('📑 Pestaña activa desde URL:', this.tabActiva);
        this.cdr.detectChanges();
      }
    });

    this.cargarProyecto();
    this.obtenerCronograma();
  }

  cargarProyecto() {
    this.apiService.getDashboardProyecto(this.projectId.toString()).subscribe({
      next: (response: any) => {
        this.proyecto = response.data;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar proyecto:', error);
        this.cdr.detectChanges();
      }
    });
  }

  obtenerCronograma() {
    console.log('🔄 Obteniendo cronograma del proyecto:', this.projectId);
    this.apiService.obtenerCronograma(this.projectId.toString()).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta de cronograma recibida:', response);
        // Aceptar diferentes formatos de respuesta del backend
        const cronograma = response?.cronograma || response?.data?.cronograma || response?.data || null;
        console.log('📋 Cronograma extraído:', cronograma);
        if (cronograma && cronograma.id) {
          this.cronogramaId = cronograma.id.toString();
          console.log('✅ CronogramaId asignado:', this.cronogramaId);
        } else {
          console.warn('⚠️ No se encontró cronograma activo');
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('❌ Error al obtener cronograma:', error);
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