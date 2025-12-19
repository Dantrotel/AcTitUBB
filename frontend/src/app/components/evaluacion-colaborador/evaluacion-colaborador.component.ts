import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
// TEMPORARILY COMMENTED: import { ColaboradoresExternosService, EvaluacionColaborador, ColaboradorProyecto } from '../../../services/colaboradores-externos.service';

// Temporary stubs to allow compilation
interface EvaluacionColaborador { 
  id?: number; 
  colaborador_proyecto_id: number; 
  proyecto_id: number; 
  colaborador_id: number; 
  estudiante_rut: string; 
  fecha_evaluacion: string; 
  calificacion: number;
  asistencia_puntualidad?: number;
  calidad_trabajo?: number;
  proactividad?: number;
  trabajo_equipo?: number;
  comunicacion?: number;
  cumplimiento_plazos?: number;
  fortalezas?: string;
  areas_mejora?: string;
  comentarios_generales?: string;
  recomendaria_estudiante?: boolean;
}
interface ColaboradorProyecto { 
  id?: number; 
  proyecto_id: number; 
  colaborador_id: number; 
  nombre_completo?: string;
  entidad_nombre?: string;
  rol_en_proyecto?: string;
}
class ColaboradoresExternosService {
  obtenerColaboradoresDeProyecto(proyectoId: number, activo?: boolean) { return { subscribe: () => {} } as any; }
  crearEvaluacion(evaluacion: any) { return { subscribe: () => {} } as any; }
}

@Component({
  selector: 'app-evaluacion-colaborador',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSliderModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatStepperModule
  ],
  templateUrl: './evaluacion-colaborador.component.html',
  styleUrls: ['./evaluacion-colaborador.component.scss']
})
export class EvaluacionColaboradorComponent implements OnInit {
  @Input() proyectoId!: number;
  @Input() estudianteRut!: string;

  private colaboradoresService = inject(ColaboradoresExternosService);
  private snackBar = inject(MatSnackBar);

  colaboradoresEvaluadores = signal<ColaboradorProyecto[]>([]);
  cargando = signal(false);
  guardando = signal(false);

  evaluacion: EvaluacionColaborador = this.getEvaluacionVacia();

  criterios = [
    { campo: 'asistencia_puntualidad', label: 'Asistencia y Puntualidad', icon: 'schedule' },
    { campo: 'calidad_trabajo', label: 'Calidad del Trabajo', icon: 'star' },
    { campo: 'proactividad', label: 'Proactividad e Iniciativa', icon: 'emoji_objects' },
    { campo: 'trabajo_equipo', label: 'Trabajo en Equipo', icon: 'groups' },
    { campo: 'comunicacion', label: 'Comunicación', icon: 'forum' },
    { campo: 'cumplimiento_plazos', label: 'Cumplimiento de Plazos', icon: 'event_available' }
  ];

  ngOnInit() {
    if (this.proyectoId) {
      this.cargarColaboradoresEvaluadores();
    }
  }

  cargarColaboradoresEvaluadores() {
    this.cargando.set(true);
    this.colaboradoresService.obtenerColaboradoresDeProyecto(this.proyectoId, true).subscribe({
      next: (response: any) => {
        // Filtrar solo los que pueden evaluar y no han evaluado
        const evaluadores = response.colaboradores.filter((c: any) => c.puede_evaluar && !c.evaluacion_realizada);
        this.colaboradoresEvaluadores.set(evaluadores);
        this.cargando.set(false);
      },
      error: (error: any) => {
        this.cargando.set(false);
      }
    });
  }

  seleccionarColaborador(colaborador: ColaboradorProyecto) {
    this.evaluacion.colaborador_proyecto_id = colaborador.id!;
    this.evaluacion.colaborador_id = colaborador.colaborador_id;
    this.evaluacion.proyecto_id = this.proyectoId;
    this.evaluacion.estudiante_rut = this.estudianteRut;
  }

  // Helper para acceder a campos dinámicamente
  getCampoValue(campo: string): number {
    return (this.evaluacion as any)[campo] || 5;
  }

  setCampoValue(campo: string, value: number): void {
    (this.evaluacion as any)[campo] = value;
  }

  calcularCalificacion(): number {
    // Calcular promedio de criterios (escala 1-10) y convertir a escala 1.0-7.0
    const criterios = [
      this.evaluacion.asistencia_puntualidad,
      this.evaluacion.calidad_trabajo,
      this.evaluacion.proactividad,
      this.evaluacion.trabajo_equipo,
      this.evaluacion.comunicacion,
      this.evaluacion.cumplimiento_plazos
    ];

    const promedio = criterios.reduce((sum: number, val: number | undefined) => sum + (val || 0), 0) / criterios.length;
    // Convertir escala 1-10 a 1.0-7.0
    const calificacion = 1.0 + ((promedio - 1) / 9) * 6.0;
    return Math.round(calificacion * 10) / 10; // Redondear a 1 decimal
  }

  guardarEvaluacion() {
    // Validaciones
    if (!this.evaluacion.colaborador_proyecto_id) {
      this.snackBar.open('Debe seleccionar un colaborador evaluador', 'Cerrar', { duration: 3000 });
      return;
    }

    const criteriosCompletos = this.criterios.every(c => {
      const valor = (this.evaluacion as any)[c.campo];
      return valor && valor >= 1 && valor <= 10;
    });

    if (!criteriosCompletos) {
      this.snackBar.open('Complete todos los criterios de evaluación (1-10)', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!this.evaluacion.fortalezas || !this.evaluacion.areas_mejora) {
      this.snackBar.open('Complete las fortalezas y áreas de mejora', 'Cerrar', { duration: 3000 });
      return;
    }

    // Calcular calificación final
    this.evaluacion.calificacion = this.calcularCalificacion();
    this.evaluacion.fecha_evaluacion = new Date().toISOString().split('T')[0];

    this.guardando.set(true);
    this.colaboradoresService.crearEvaluacion(this.evaluacion).subscribe({
      next: (response: any) => {
        this.snackBar.open('Evaluación guardada exitosamente', 'Cerrar', { duration: 3000 });
        this.evaluacion = this.getEvaluacionVacia();
        this.cargarColaboradoresEvaluadores();
        this.guardando.set(false);
      },
      error: (error: any) => {
        this.snackBar.open('Error al guardar evaluación', 'Cerrar', { duration: 3000 });
        this.guardando.set(false);
      }
    });
  }

  getEvaluacionVacia(): EvaluacionColaborador {
    return {
      colaborador_proyecto_id: 0,
      proyecto_id: 0,
      colaborador_id: 0,
      estudiante_rut: '',
      fecha_evaluacion: new Date().toISOString().split('T')[0],
      calificacion: 1.0,
      asistencia_puntualidad: 5,
      calidad_trabajo: 5,
      proactividad: 5,
      trabajo_equipo: 5,
      comunicacion: 5,
      cumplimiento_plazos: 5,
      fortalezas: '',
      areas_mejora: '',
      comentarios_generales: '',
      recomendaria_estudiante: true
    };
  }

  formatValue(value: number | undefined): string {
    return value ? value.toFixed(0) : '5';
  }
}
