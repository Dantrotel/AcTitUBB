import { Component, OnInit, inject, signal, Input, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService } from '../../services/notification.service';
import { ColaboradoresExternosService, ColaboradorExterno, ColaboradorProyecto } from '../../services/colaboradores-externos.service';

@Component({
  selector: 'app-colaboradores-proyecto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule
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

  constructor() {
    afterNextRender(() => {
      if (this.proyectoId) {
        this.cargarColaboradores();
      }
    });
  }

  nuevaAsignacion = {
    colaborador_id: 0,
    rol_en_proyecto: 'Supervisor de Empresa',
    descripcion_rol: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    horas_dedicadas: 4,
    frecuencia_interaccion: 'semanal'
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

  ngOnInit() {}

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
      frecuencia_interaccion: 'semanal'
    };
  }

  formatearFecha(fecha: string | undefined): string {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-CL');
  }
}

