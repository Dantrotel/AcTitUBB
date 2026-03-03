import { Component, OnInit, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../../services/notification.service';
import { VersionesPlantillasService, PlantillaDocumento } from '../../../services/versiones-plantillas.service';

@Component({
  selector: 'app-gestion-plantillas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="gestion-container">
      <div class="page-header">
        <h1>
          <i class="fas fa-folder-open"></i>
          Gestión de Plantillas
        </h1>
        <button class="btn btn-primary" (click)="mostrarFormularioNueva()">
          <i class="fas fa-plus"></i>
          Nueva Plantilla
        </button>
      </div>

      <!-- Formulario -->
      @if (mostrandoFormulario()) {
        <div class="form-card">
          <div class="form-card-header">
            <h3>
              @if (plantillaEditando()) {
                <i class="fas fa-edit"></i> Editar Plantilla
              } @else {
                <i class="fas fa-plus"></i> Nueva Plantilla
              }
            </h3>
          </div>

          <div class="form-card-body">
            <form [formGroup]="formularioPlantilla" class="plantilla-form">
              <div class="form-row">
                <div class="form-group flex-2">
                  <label class="form-label">Nombre de la Plantilla <span class="required">*</span></label>
                  <input class="form-input" formControlName="nombre" required />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Tipo de Documento <span class="required">*</span></label>
                  <select class="form-input" formControlName="tipo_documento">
                    <option value="">Seleccionar...</option>
                    <option value="propuesta">Propuesta</option>
                    <option value="informe_avance">Informe de Avance</option>
                    <option value="informe_final">Informe Final</option>
                    <option value="presentacion">Presentación</option>
                    <option value="poster">Póster</option>
                    <option value="acta">Acta</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Descripción</label>
                <textarea class="form-input" formControlName="descripcion" rows="2"></textarea>
              </div>

              <!-- Archivo -->
              <div class="file-upload-section">
                <label class="form-label">Archivo de Plantilla *</label>
                <div class="file-input-container">
                  @if (!archivoSeleccionado()) {
                    <button type="button" class="btn btn-outline" (click)="fileInput.click()">
                      <i class="fas fa-upload"></i>
                      Seleccionar Archivo
                    </button>
                    <span class="file-hint">DOCX, PDF (Máx. 50MB)</span>
                  } @else {
                    <div class="file-selected">
                      <i class="fas fa-file-alt file-icon"></i>
                      <span>{{ archivoSeleccionado()?.name }}</span>
                      <button type="button" class="btn-remove" (click)="removerArchivo()">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  }
                  <input #fileInput type="file" hidden accept=".pdf,.doc,.docx" (change)="onFileSelected($event)" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label class="form-label">Versión</label>
                  <input class="form-input" formControlName="version_plantilla" placeholder="1.0" />
                </div>
                <div class="form-group flex-1">
                  <label class="form-label">Formato Requerido</label>
                  <input class="form-input" formControlName="formato_requerido" placeholder="DOCX, PDF" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Instrucciones de Uso</label>
                <textarea class="form-input" formControlName="instrucciones" rows="3"></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">URL de Ejemplo (Opcional)</label>
                <input class="form-input" formControlName="ejemplo_url" type="url" />
              </div>

              <!-- Alcance -->
              <div class="alcance-section">
                <label class="section-label">Alcance de la Plantilla</label>
                <div class="form-row">
                  <div class="form-group flex-1">
                    <label class="form-label">Carrera (opcional)</label>
                    <select class="form-input" formControlName="carrera_id">
                      <option [ngValue]="null">Todas las carreras</option>
                    </select>
                  </div>
                  <div class="form-group flex-1">
                    <label class="form-label">Departamento (opcional)</label>
                    <select class="form-input" formControlName="departamento_id">
                      <option [ngValue]="null">Todos los departamentos</option>
                    </select>
                  </div>
                  <div class="form-group flex-1">
                    <label class="form-label">Facultad (opcional)</label>
                    <select class="form-input" formControlName="facultad_id">
                      <option [ngValue]="null">Todas las facultades</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Obligatoria -->
              <label class="checkbox-label">
                <input type="checkbox" formControlName="obligatoria" class="checkbox-input" />
                <span>Plantilla Obligatoria</span>
              </label>

              @if (subiendo()) {
                <div class="progress-box">
                  <div class="spinner"></div>
                  <p>{{ plantillaEditando() ? 'Actualizando...' : 'Subiendo plantilla...' }}</p>
                </div>
              }
            </form>
          </div>

          <div class="form-card-footer">
            <button class="btn btn-ghost" (click)="cancelarFormulario()" [disabled]="subiendo()">Cancelar</button>
            <button
              class="btn btn-primary"
              (click)="guardarPlantilla()"
              [disabled]="!formularioPlantilla.valid || subiendo() || (!archivoSeleccionado() && !plantillaEditando())"
            >
              <i class="fas fa-save"></i>
              {{ plantillaEditando() ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      }

      <!-- Tabla de plantillas -->
      <div class="table-card">
        @if (cargando()) {
          <div class="loading-wrap">
            <div class="spinner"></div>
            <p>Cargando plantillas...</p>
          </div>
        } @else if (plantillas().length === 0) {
          <div class="empty-state">
            <i class="fas fa-folder-open"></i>
            <h2>No hay plantillas registradas</h2>
            <p>Crea la primera plantilla para que los estudiantes puedan descargarla</p>
          </div>
        } @else {
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Alcance</th>
                  <th>Estado</th>
                  <th>Descargas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (plantilla of plantillas(); track plantilla.id) {
                  <tr>
                    <td>
                      <div class="nombre-cell">
                        <i [class]="getFAIconoTipo(plantilla.tipo_documento)" class="tipo-icon"></i>
                        <div>
                          <strong>{{ plantilla.nombre }}</strong>
                          @if (plantilla.version_plantilla) {
                            <span class="version-badge">v{{ plantilla.version_plantilla }}</span>
                          }
                        </div>
                      </div>
                    </td>
                    <td>{{ getTipoLabel(plantilla.tipo_documento) }}</td>
                    <td>
                      @if (plantilla.carrera_nombre) {
                        <span class="chip chip-alcance">{{ plantilla.carrera_nombre }}</span>
                      } @else if (plantilla.departamento_nombre) {
                        <span class="chip chip-alcance">{{ plantilla.departamento_nombre }}</span>
                      } @else if (plantilla.facultad_nombre) {
                        <span class="chip chip-alcance">{{ plantilla.facultad_nombre }}</span>
                      } @else {
                        <span class="chip chip-global">Global</span>
                      }
                    </td>
                    <td>
                      @if (plantilla.obligatoria) {
                        <span class="chip chip-obligatoria">
                          <i class="fas fa-star"></i> Obligatoria
                        </span>
                      } @else {
                        <span class="chip chip-opcional">Opcional</span>
                      }
                    </td>
                    <td>
                      <div class="descargas-cell">
                        <i class="fas fa-download"></i>
                        {{ plantilla.descargas }}
                      </div>
                    </td>
                    <td>
                      <div class="table-menu" (click)="$event.stopPropagation()">
                        <button class="btn-menu-trigger" (click)="toggleMenu(plantilla.id)">
                          <i class="fas fa-ellipsis-v"></i>
                        </button>
                        @if (menuAbierto() === plantilla.id) {
                          <div class="dropdown-menu">
                            <button class="dropdown-item" (click)="descargarPlantilla(plantilla); closeMenu()">
                              <i class="fas fa-download"></i> Descargar
                            </button>
                            <button class="dropdown-item" (click)="editarPlantilla(plantilla); closeMenu()">
                              <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="dropdown-item danger" (click)="desactivarPlantilla(plantilla); closeMenu()">
                              <i class="fas fa-trash-alt"></i> Desactivar
                            </button>
                          </div>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .gestion-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;

      h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        color: #1a1a2e;
        i { color: #004b8d; }
      }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 9px 18px;
      border-radius: 7px;
      border: none;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-primary { background: #004b8d; color: #fff; &:hover:not(:disabled) { background: #003a6e; } }
    .btn-ghost { background: transparent; color: #555; border: 1px solid #ddd; &:hover:not(:disabled) { background: #f5f5f5; } }
    .btn-outline { background: transparent; color: #004b8d; border: 1px solid #004b8d; &:hover { background: #f0f7ff; } }

    /* Form card */
    .form-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      margin-bottom: 24px;
      overflow: hidden;
    }

    .form-card-header {
      padding: 14px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e8e8e8;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1a1a2e;
        display: flex;
        align-items: center;
        gap: 8px;
        i { color: #004b8d; }
      }
    }

    .form-card-body { padding: 20px; }

    .plantilla-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
      .flex-1 { flex: 1; }
      .flex-2 { flex: 2; }
    }

    .form-group { display: flex; flex-direction: column; gap: 5px; }

    .form-label {
      font-size: 12px;
      font-weight: 600;
      color: #555;
      .required { color: #e53935; }
    }

    .form-input {
      border: 1px solid #ddd;
      border-radius: 7px;
      padding: 8px 12px;
      font-size: 13px;
      outline: none;
      background: #fff;
      transition: border-color 0.2s;
      font-family: inherit;
      &:focus { border-color: #004b8d; }
    }

    select.form-input { cursor: pointer; }
    textarea.form-input { resize: vertical; }

    .file-upload-section { display: flex; flex-direction: column; gap: 6px; }

    .file-input-container {
      display: flex;
      align-items: center;
      gap: 14px;
      .file-hint { color: #aaa; font-size: 12px; }
    }

    .file-selected {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 14px;
      background: #f0f7ff;
      border-radius: 7px;
      border: 1px solid #bbdefb;
      flex: 1;
      .file-icon { color: #004b8d; font-size: 18px; }
      span { flex: 1; font-size: 13px; color: #333; }
    }

    .btn-remove {
      background: transparent;
      border: 1px solid #ffcdd2;
      color: #e53935;
      width: 26px;
      height: 26px;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover { background: #ffebee; }
    }

    .section-label { font-size: 12px; font-weight: 600; color: #555; display: block; margin-bottom: 6px; }
    .alcance-section { display: flex; flex-direction: column; }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 13px;
      color: #333;
      .checkbox-input { width: 16px; height: 16px; accent-color: #004b8d; cursor: pointer; }
    }

    .progress-box {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px;
      background: #f5f5f5;
      border-radius: 8px;
      color: #666;
      font-size: 13px;
    }

    .form-card-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 20px;
      background: #fafafa;
      border-top: 1px solid #eee;
    }

    /* Table card */
    .table-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      overflow: hidden;
    }

    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      color: #666;
      gap: 14px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
      color: #aaa;
      i { font-size: 52px; margin-bottom: 16px; opacity: 0.4; }
      h2 { margin: 0 0 8px 0; color: #666; }
      p { margin: 0; color: #999; font-size: 14px; }
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e0e0e0;
      border-top-color: #004b8d;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .table-wrap { overflow-x: auto; }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f8f9fa;
        padding: 11px 16px;
        text-align: left;
        font-weight: 600;
        color: #555;
        border-bottom: 2px solid #e8e8e8;
        white-space: nowrap;
      }

      td {
        padding: 11px 16px;
        border-bottom: 1px solid #f5f5f5;
        color: #333;
        vertical-align: middle;
      }

      tr:hover td { background: #f9fbff; }
    }

    .nombre-cell {
      display: flex;
      align-items: center;
      gap: 10px;

      .tipo-icon { color: #004b8d; font-size: 18px; flex-shrink: 0; }

      strong { display: block; color: #1a1a2e; }

      .version-badge {
        display: inline-block;
        padding: 2px 7px;
        background: #e3f2fd;
        color: #1565c0;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        margin-left: 6px;
      }
    }

    .descargas-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #666;
      i { color: #aaa; }
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }

    .chip-alcance { background: #e0f2f1; color: #00695c; }
    .chip-global { background: #f3e5f5; color: #6a1b9a; }
    .chip-obligatoria { background: #fff3e0; color: #e65100; }
    .chip-opcional { background: #eceff1; color: #455a64; }

    /* Actions dropdown */
    .table-menu { position: relative; display: inline-block; }

    .btn-menu-trigger {
      background: transparent;
      border: 1px solid #e0e0e0;
      color: #555;
      width: 30px;
      height: 30px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      &:hover { background: #f5f5f5; border-color: #bbb; }
    }

    .dropdown-menu {
      position: absolute;
      top: 34px;
      right: 0;
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      min-width: 160px;
      z-index: 100;
      overflow: hidden;
    }

    .dropdown-item {
      width: 100%;
      background: transparent;
      border: none;
      padding: 9px 14px;
      text-align: left;
      cursor: pointer;
      font-size: 13px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s;

      &:hover { background: #f5f7fa; }
      i { color: #004b8d; width: 14px; }

      &.danger { color: #e53935; &:hover { background: #ffebee; } i { color: #e53935; } }
    }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .form-row { flex-direction: column; }
    }
  `]
})
export class GestionPlantillasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private versionesService = inject(VersionesPlantillasService);
  private snackBar = inject(MatSnackBar);
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
        this.snackBar.open('Error al cargar plantillas', 'Cerrar', { duration: 3000 });
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
        this.snackBar.open('El archivo no debe superar los 50MB', 'Cerrar', { duration: 3000 });
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
      this.snackBar.open('Debes seleccionar un archivo', 'Cerrar', { duration: 3000 });
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
        this.snackBar.open(
          editando ? 'Plantilla actualizada' : 'Plantilla creada exitosamente',
          'Cerrar',
          { duration: 3000 }
        );
        this.cargarPlantillas();
        this.cancelarFormulario();
        this.subiendo.set(false);
      },
      error: () => {
        this.snackBar.open('Error al guardar plantilla', 'Cerrar', { duration: 3000 });
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
        this.snackBar.open('Error al descargar', 'Cerrar', { duration: 3000 });
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
        this.snackBar.open('Plantilla desactivada', 'Cerrar', { duration: 3000 });
        this.cargarPlantillas();
      },
      error: () => {
        this.snackBar.open('Error al desactivar', 'Cerrar', { duration: 3000 });
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
