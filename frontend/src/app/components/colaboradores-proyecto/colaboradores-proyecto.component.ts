import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../services/notification.service';
import { ColaboradoresExternosService, ColaboradorExterno, ColaboradorProyecto } from '../../services/colaboradores-externos.service';

@Component({
  selector: 'app-colaboradores-proyecto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './colaboradores-proyecto.component.html',
  styleUrls: ['./colaboradores-proyecto.component.scss']
})
export class ColaboradoresProyectoComponent implements OnInit {
  @Input() proyectoId!: number;

  private colaboradoresService = inject(ColaboradoresExternosService);
  private snackBar = inject(MatSnackBar);

  colaboradores = signal<ColaboradorProyecto[]>([]);
  colaboradoresDisponibles = signal<ColaboradorExterno[]>([]);
  cargando = signal(false);
  mostrarFormulario = signal(false);
  
  displayedColumns = ['colaborador', 'entidad', 'rol', 'fecha_inicio', 'puede_evaluar', 'estado', 'acciones'];

  nuevaAsignacion = {
    colaborador_id: 0,
    rol_en_proyecto: 'Supervisor de Empresa',
    descripcion_rol: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    horas_dedicadas: 4,
    frecuencia_interaccion: 'semanal',
    puede_evaluar: true
  };

  rolesDisponibles = [
    'Supervisor de Empresa',
    'Mentor',
    'Asesor Técnico',
    'Evaluador Externo',
    'Coach',
    'Consultor',
    'Otro'
  ];

  frecuencias = [
    { value: 'diaria', label: 'Diaria' },
    { value: 'semanal', label: 'Semanal' },
    { value: 'quincenal', label: 'Quincenal' },
    { value: 'mensual', label: 'Mensual' },
    { value: 'eventual', label: 'Eventual' }
  ];

  ngOnInit() {
    if (this.proyectoId) {
      this.cargarColaboradores();
    }
  }

  cargarColaboradores() {
    this.cargando.set(true);
    this.colaboradoresService.obtenerColaboradoresDeProyecto(this.proyectoId, true).subscribe({
      next: (response: any) => {
        this.colaboradores.set(response.colaboradores);
        this.cargando.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar colaboradores:', error);
        this.snackBar.open('Error al cargar colaboradores del proyecto', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  cargarColaboradoresDisponibles() {
    this.colaboradoresService.obtenerColaboradores({ activo: true, verificado: true } as any).subscribe({
      next: (response: any) => {
        // Filtrar colaboradores ya asignados
        const idsAsignados = this.colaboradores().map((c: any) => c.colaborador_id);
        const disponibles = response.colaboradores.filter((c: any) => !idsAsignados.includes(c.id!));
        this.colaboradoresDisponibles.set(disponibles);
      },
      error: (error: any) => {
        console.error('Error al cargar colaboradores disponibles:', error);
      }
    });
  }

  toggleFormulario() {
    if (!this.mostrarFormulario()) {
      this.cargarColaboradoresDisponibles();
    }
    this.mostrarFormulario.set(!this.mostrarFormulario());
    if (!this.mostrarFormulario()) {
      this.resetearFormulario();
    }
  }

  asignarColaborador() {
    if (!this.nuevaAsignacion.colaborador_id || !this.nuevaAsignacion.rol_en_proyecto) {
      this.snackBar.open('Complete los campos obligatorios', 'Cerrar', { duration: 3000 });
      return;
    }

    this.cargando.set(true);
    this.colaboradoresService.asignarColaboradorAProyecto({
      proyecto_id: this.proyectoId,
      ...this.nuevaAsignacion
    }).subscribe({
      next: (response: any) => {
        this.snackBar.open('Colaborador asignado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarColaboradores();
        this.toggleFormulario();
      },
      error: (error: any) => {
        console.error('Error al asignar colaborador:', error);
        this.snackBar.open('Error al asignar colaborador', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  async desasignarColaborador(colaborador: ColaboradorProyecto): Promise<void> {
    const notificationService = inject(NotificationService);
    
    const confirmed = await notificationService.confirm(
      `¿Desea desasignar a ${colaborador.nombre_completo} del proyecto?`,
      'Desasignar Colaborador',
      'Desasignar',
      'Cancelar'
    );
    if (!confirmed) return;

    const motivo = await notificationService.prompt(
      'Motivo de la desasignación:',
      'Motivo de Desasignación',
      '',
      'Aceptar',
      'Cancelar'
    );
    if (!motivo) return;

    this.cargando.set(true);
    this.colaboradoresService.desasignarColaborador(colaborador.id!, motivo).subscribe({
      next: (response: any) => {
        this.snackBar.open('Colaborador desasignado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarColaboradores();
      },
      error: (error: any) => {
        console.error('Error al desasignar colaborador:', error);
        this.snackBar.open('Error al desasignar colaborador', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  resetearFormulario() {
    this.nuevaAsignacion = {
      colaborador_id: 0,
      rol_en_proyecto: 'Supervisor de Empresa',
      descripcion_rol: '',
      fecha_inicio: new Date().toISOString().split('T')[0],
      horas_dedicadas: 4,
      frecuencia_interaccion: 'semanal',
      puede_evaluar: true
    };
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-CL');
  }
}

