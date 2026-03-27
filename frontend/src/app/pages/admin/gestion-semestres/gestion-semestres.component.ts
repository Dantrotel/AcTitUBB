import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-gestion-semestres',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-semestres.component.html',
  styleUrls: ['./gestion-semestres.component.scss']
})
export class GestionSemestresComponent implements OnInit {
  semestres: any[] = [];
  loading = true;
  error = '';
  currentYear = new Date().getFullYear();

  // Formulario
  mostrarFormulario = false;
  modoEdicion = false;
  semestreeditandoId: number | null = null;
  form = { nombre: '', anio: new Date().getFullYear(), numero: 1, fecha_inicio: '', fecha_fin: '' };
  procesando = false;

  // Modal historial
  mostrarHistorial = false;
  semestreHistorial: any = null;
  historial: any[] = [];
  loadingHistorial = false;

  // Generar inscripciones siguiente semestre
  generandoInscripciones = false;

  resultadosValidos = ['en_curso', 'aprobado', 'reprobado', 'retirado'];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarSemestres();
  }

  cargarSemestres(): void {
    this.loading = true;
    this.apiService.getSemestres().subscribe({
      next: (res: any) => {
        this.semestres = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los semestres';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirFormularioNuevo(): void {
    this.modoEdicion = false;
    this.semestreeditandoId = null;
    this.form = { nombre: '', anio: new Date().getFullYear(), numero: 1, fecha_inicio: '', fecha_fin: '' };
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(s: any): void {
    this.modoEdicion = true;
    this.semestreeditandoId = s.id;
    this.form = {
      nombre: s.nombre,
      anio: s.año,
      numero: s.numero,
      fecha_inicio: s.fecha_inicio?.substring(0, 10) ?? '',
      fecha_fin: s.fecha_fin?.substring(0, 10) ?? ''
    };
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
  }

  guardar(): void {
    if (!this.form.nombre || !this.form.fecha_inicio || !this.form.fecha_fin) {
      this.notificationService.error('Campos incompletos', 'Los campos Nombre, Fecha de inicio y Fecha de fin son obligatorios.');
      return;
    }
    this.procesando = true;
    const payload = { ...this.form, año: this.form.anio };
    const observable = this.modoEdicion
      ? this.apiService.actualizarSemestre(this.semestreeditandoId!, payload)
      : this.apiService.crearSemestre(payload);

    observable.subscribe({
      next: () => {
        this.notificationService.success(this.modoEdicion ? 'Semestre actualizado' : 'Semestre creado exitosamente');
        this.procesando = false;
        this.cerrarFormulario();
        this.cargarSemestres();
      },
      error: (err: any) => {
        this.notificationService.error('Error al guardar semestre', err.error?.message || 'No fue posible guardar el semestre. Intente nuevamente.');
        this.procesando = false;
      }
    });
  }

  activar(s: any): void {
    this.apiService.activarSemestre(s.id).subscribe({
      next: () => {
        this.notificationService.success(`Semestre ${s.nombre} activado`);
        this.cargarSemestres();
      },
      error: () => this.notificationService.error('Error al activar semestre', 'No fue posible activar el semestre seleccionado. Intente nuevamente.')
    });
  }

  async eliminar(s: any): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Eliminar el semestre ${s.nombre}? Solo es posible si no tiene propuestas.`,
      'Eliminar Semestre', 'Eliminar', 'Cancelar'
    );
    if (!confirmed) return;
    this.apiService.eliminarSemestre(s.id).subscribe({
      next: () => {
        this.notificationService.success('Semestre eliminado');
        this.cargarSemestres();
      },
      error: (err: any) => this.notificationService.error('Error al eliminar semestre', err.error?.message || 'No fue posible eliminar el semestre. Verifique que no tenga propuestas asociadas.')
    });
  }

  verHistorial(s: any): void {
    this.semestreHistorial = s;
    this.mostrarHistorial = true;
    this.historial = [];
    this.loadingHistorial = true;
    this.apiService.getHistorialSemestre(s.id).subscribe({
      next: (res: any) => {
        this.historial = res.data || [];
        this.loadingHistorial = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingHistorial = false;
        this.cdr.detectChanges();
      }
    });
  }

  cerrarHistorial(): void {
    this.mostrarHistorial = false;
    this.semestreHistorial = null;
    this.historial = [];
  }

  async generarInscripcionesSiguiente(): Promise<void> {
    if (this.semestres.length < 2) {
      this.notificationService.error('Semestre destino no encontrado', 'Debe crear el semestre de destino antes de generar las inscripciones.');
      return;
    }
    // Los semestres vienen ordenados DESC, el segundo es el siguiente cronológicamente al historial
    const semestreOrigen = this.semestreHistorial;
    // Buscar el siguiente semestre (orden ascendente respecto al origen)
    const siguientes = this.semestres.filter((s: any) => s.id !== semestreOrigen.id);
    if (siguientes.length === 0) {
      this.notificationService.error('Sin semestre destino disponible', 'No existe otro semestre disponible para recibir las inscripciones generadas.');
      return;
    }
    // Usar el primer semestre de la lista como destino (el más reciente distinto al origen)
    const semestreDestino = siguientes[0];

    const confirmed = await this.notificationService.confirm(
      `¿Generar inscripciones para "${semestreDestino.nombre}" basándose en los resultados de "${semestreOrigen.nombre}"?\n\n• AP aprobado → PT\n• AP reprobado → AP\n• PT reprobado → PT\n• PT aprobado → omitido (finalizó)`,
      'Generar Inscripciones', 'Generar', 'Cancelar'
    );
    if (!confirmed) return;

    this.generandoInscripciones = true;
    this.apiService.generarInscripcionesSiguienteSemestre(semestreOrigen.id, semestreDestino.id).subscribe({
      next: (res: any) => {
        this.notificationService.success(res.message || 'Inscripciones generadas');
        this.generandoInscripciones = false;
      },
      error: (err: any) => {
        this.notificationService.error('Error al generar inscripciones', err.error?.message || 'No fue posible generar las inscripciones. Intente nuevamente.');
        this.generandoInscripciones = false;
      }
    });
  }

  cambiarResultado(semestreId: number, proyectoId: number, resultado: string): void {
    this.apiService.actualizarResultadoProyecto(semestreId, proyectoId, resultado).subscribe({
      next: () => this.notificationService.success('Resultado actualizado', 'El resultado del proyecto ha sido registrado correctamente.'),
      error: () => this.notificationService.error('Error al actualizar resultado', 'No fue posible actualizar el resultado del proyecto. Intente nuevamente.')
    });
  }

  getResultadoClass(resultado: string): string {
    const mapa: Record<string, string> = {
      aprobado: 'badge-aprobado',
      reprobado: 'badge-reprobado',
      retirado: 'badge-retirado',
      en_curso: 'badge-encurso'
    };
    return mapa[resultado] || 'badge-encurso';
  }

  generarNombre(): void {
    if (this.form.anio && this.form.numero) {
      this.form.nombre = `${this.form.anio}-${this.form.numero}`;
    }
  }
}
