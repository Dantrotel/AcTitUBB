import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';
import { VersionesPlantillasService, PlantillaDocumento } from '../../../services/versiones-plantillas.service';

@Component({
  selector: 'app-gestion-plantillas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion-plantillas.component.html',
  styleUrl: './gestion-plantillas.component.scss'
})
export class GestionPlantillasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private versionesService = inject(VersionesPlantillasService);
  private notificationService = inject(NotificationService);

  plantillas = signal<PlantillaDocumento[]>([]);
  cargando = signal(true);
  mostrandoFormulario = signal(false);
  subiendo = signal(false);
  archivoSeleccionado = signal<File | null>(null);
  plantillaEditando = signal<PlantillaDocumento | null>(null);
  menuAbierto = signal<number | null>(null);

  formularioPlantilla: FormGroup;

  @HostListener('document:click')
  onDocumentClick() {
    if (this.menuAbierto() !== null) this.menuAbierto.set(null);
  }

  toggleMenu(id: number) {
    this.menuAbierto.update(current => current === id ? null : id);
  }

  closeMenu() {
    this.menuAbierto.set(null);
  }

  constructor() {
    this.formularioPlantilla = this.fb.group({
      nombre: ['', Validators.required],
      tipo_documento: ['', Validators.required],
      descripcion: [''],
      version_plantilla: [''],
      formato_requerido: [''],
      instrucciones: [''],
      ejemplo_url: [''],
      carrera_id: [null],
      departamento_id: [null],
      facultad_id: [null],
      obligatoria: [false]
    });
  }

  ngOnInit() {
    this.cargarPlantillas();
  }

  cargarPlantillas() {
    this.cargando.set(true);
    this.versionesService.obtenerPlantillas().subscribe({
      next: (response) => {
        this.plantillas.set(response.plantillas);
        this.cargando.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar plantillas', 'No fue posible obtener las plantillas. Intente nuevamente.');
        this.cargando.set(false);
      }
    });
  }

  mostrarFormularioNueva() {
    this.plantillaEditando.set(null);
    this.formularioPlantilla.reset({ obligatoria: false });
    this.archivoSeleccionado.set(null);
    this.mostrandoFormulario.set(true);
  }

  editarPlantilla(plantilla: PlantillaDocumento) {
    this.plantillaEditando.set(plantilla);
    this.formularioPlantilla.patchValue(plantilla);
    this.archivoSeleccionado.set(null);
    this.mostrandoFormulario.set(true);
  }

  cancelarFormulario() {
    this.mostrandoFormulario.set(false);
    this.plantillaEditando.set(null);
    this.archivoSeleccionado.set(null);
    this.formularioPlantilla.reset();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.size > 50 * 1024 * 1024) {
        this.notificationService.warning('Archivo demasiado grande', 'El archivo de plantilla no debe superar los 50 MB.');
        return;
      }
      this.archivoSeleccionado.set(file);
    }
  }

  removerArchivo() {
    this.archivoSeleccionado.set(null);
  }

  guardarPlantilla() {
    if (!this.formularioPlantilla.valid) return;

    const editando = this.plantillaEditando();

    if (!editando && !this.archivoSeleccionado()) {
      this.notificationService.warning('Archivo requerido', 'Debe seleccionar un archivo para crear la plantilla.');
      return;
    }

    this.subiendo.set(true);

    const formData = this.versionesService.crearFormDataPlantilla({
      ...this.formularioPlantilla.value,
      archivo: this.archivoSeleccionado()!
    });

    const operacion = editando
      ? this.versionesService.actualizarPlantilla(editando.id, formData)
      : this.versionesService.subirPlantilla(formData);

    operacion.subscribe({
      next: () => {
        this.notificationService.success(
          editando ? 'Plantilla actualizada' : 'Plantilla creada',
          editando ? 'La plantilla ha sido actualizada correctamente.' : 'La plantilla ha sido creada y está disponible para los estudiantes.'
        );
        this.cargarPlantillas();
        this.cancelarFormulario();
        this.subiendo.set(false);
      },
      error: () => {
        this.notificationService.error('Error al guardar plantilla', 'No fue posible guardar la plantilla. Verifique el archivo e intente nuevamente.');
        this.subiendo.set(false);
      }
    });
  }

  descargarPlantilla(plantilla: PlantillaDocumento) {
    this.versionesService.descargarPlantilla(plantilla.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = plantilla.archivo_nombre;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.notificationService.error('Error al descargar plantilla', 'No fue posible descargar el archivo. Intente nuevamente.');
      }
    });
  }

  async desactivarPlantilla(plantilla: PlantillaDocumento) {
    const confirmed = await this.notificationService.confirm(
      `¿Desactivar la plantilla "${plantilla.nombre}"?`,
      'Desactivar Plantilla',
      'Desactivar',
      'Cancelar'
    );

    if (!confirmed) return;

    this.versionesService.desactivarPlantilla(plantilla.id).subscribe({
      next: () => {
        this.notificationService.success('Plantilla desactivada', 'La plantilla ya no estará disponible para los estudiantes.');
        this.cargarPlantillas();
      },
      error: () => {
        this.notificationService.error('Error al desactivar plantilla', 'No fue posible desactivar la plantilla. Intente nuevamente.');
      }
    });
  }

  getFAIconoTipo(tipo: string): string {
    const icons: Record<string, string> = {
      propuesta: 'fas fa-lightbulb',
      informe_avance: 'fas fa-chart-line',
      informe_final: 'fas fa-file-check',
      presentacion: 'fas fa-desktop',
      poster: 'fas fa-image',
      acta: 'fas fa-scroll',
      otro: 'fas fa-file-alt'
    };
    return icons[tipo] || 'fas fa-file-alt';
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      propuesta: 'Propuesta',
      informe_avance: 'Informe de Avance',
      informe_final: 'Informe Final',
      presentacion: 'Presentación',
      poster: 'Póster',
      acta: 'Acta',
      otro: 'Otro'
    };
    return labels[tipo] || tipo;
  }
}
