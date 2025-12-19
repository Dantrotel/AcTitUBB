import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationService } from '../../../services/notification.service';
import { VersionesPlantillasService, PlantillaDocumento } from '../../../services/versiones-plantillas.service';

@Component({
  selector: 'app-gestion-plantillas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  template: `
    <div class="gestion-container">
      <div class="page-header">
        <h1>
          <mat-icon>folder_special</mat-icon>
          Gestión de Plantillas
        </h1>
        <button mat-raised-button color="primary" (click)="mostrarFormularioNueva()">
          <mat-icon>add</mat-icon>
          Nueva Plantilla
        </button>
      </div>

      <!-- Formulario de nueva plantilla -->
      @if (mostrandoFormulario()) {
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>
              @if (plantillaEditando()) {
                <mat-icon>edit</mat-icon>
                Editar Plantilla
              } @else {
                <mat-icon>add</mat-icon>
                Nueva Plantilla
              }
            </mat-card-title>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="formularioPlantilla" class="plantilla-form">
              <div class="form-row">
                <mat-form-field appearance="outline" class="flex-2">
                  <mat-label>Nombre de la Plantilla</mat-label>
                  <input matInput formControlName="nombre" required>
                  <mat-error>El nombre es requerido</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Tipo de Documento</mat-label>
                  <mat-select formControlName="tipo_documento" required>
                    <mat-option value="propuesta">Propuesta</mat-option>
                    <mat-option value="informe_avance">Informe de Avance</mat-option>
                    <mat-option value="informe_final">Informe Final</mat-option>
                    <mat-option value="presentacion">Presentación</mat-option>
                    <mat-option value="poster">Póster</mat-option>
                    <mat-option value="acta">Acta</mat-option>
                    <mat-option value="otro">Otro</mat-option>
                  </mat-select>
                  <mat-error>El tipo es requerido</mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Descripción</mat-label>
                <textarea matInput formControlName="descripcion" rows="2"></textarea>
              </mat-form-field>

              <!-- Archivo -->
              <div class="file-upload-section">
                <label class="file-label">Archivo de Plantilla *</label>
                <div class="file-input-container">
                  @if (!archivoSeleccionado()) {
                    <button mat-raised-button type="button" (click)="fileInput.click()">
                      <mat-icon>upload_file</mat-icon>
                      Seleccionar Archivo
                    </button>
                    <span class="file-hint">DOCX, PDF (Máx. 50MB)</span>
                  } @else {
                    <div class="file-selected">
                      <mat-icon>insert_drive_file</mat-icon>
                      <span>{{ archivoSeleccionado()?.name }}</span>
                      <button mat-icon-button type="button" (click)="removerArchivo()">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  }
                  <input #fileInput 
                         type="file" 
                         hidden 
                         accept=".pdf,.doc,.docx"
                         (change)="onFileSelected($event)">
                </div>
              </div>

              <div class="form-row">
                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Versión</mat-label>
                  <input matInput formControlName="version_plantilla" placeholder="1.0">
                </mat-form-field>

                <mat-form-field appearance="outline" class="flex-1">
                  <mat-label>Formato Requerido</mat-label>
                  <input matInput formControlName="formato_requerido" placeholder="DOCX, PDF">
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Instrucciones de Uso</mat-label>
                <textarea matInput formControlName="instrucciones" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>URL de Ejemplo (Opcional)</mat-label>
                <input matInput formControlName="ejemplo_url" type="url">
              </mat-form-field>

              <!-- Alcance -->
              <div class="alcance-section">
                <label class="section-label">Alcance de la Plantilla</label>
                <div class="form-row">
                  <mat-form-field appearance="outline" class="flex-1">
                    <mat-label>Carrera (opcional)</mat-label>
                    <mat-select formControlName="carrera_id">
                      <mat-option [value]="null">Todas las carreras</mat-option>
                      <!-- TODO: Cargar carreras desde el backend -->
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="flex-1">
                    <mat-label>Departamento (opcional)</mat-label>
                    <mat-select formControlName="departamento_id">
                      <mat-option [value]="null">Todos los departamentos</mat-option>
                      <!-- TODO: Cargar departamentos desde el backend -->
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="flex-1">
                    <mat-label>Facultad (opcional)</mat-label>
                    <mat-select formControlName="facultad_id">
                      <mat-option [value]="null">Todas las facultades</mat-option>
                      <!-- TODO: Cargar facultades desde el backend -->
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <!-- Opciones -->
              <div class="opciones-section">
                <mat-checkbox formControlName="obligatoria">
                  Plantilla Obligatoria
                </mat-checkbox>
              </div>

              @if (subiendo()) {
                <div class="progress-container">
                  <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
                  <p>{{ plantillaEditando() ? 'Actualizando...' : 'Subiendo plantilla...' }}</p>
                </div>
              }
            </form>
          </mat-card-content>

          <mat-card-actions align="end">
            <button mat-button (click)="cancelarFormulario()" [disabled]="subiendo()">
              Cancelar
            </button>
            <button mat-raised-button 
                    color="primary" 
                    (click)="guardarPlantilla()"
                    [disabled]="!formularioPlantilla.valid || subiendo() || (!archivoSeleccionado() && !plantillaEditando())">
              <mat-icon>save</mat-icon>
              {{ plantillaEditando() ? 'Actualizar' : 'Guardar' }}
            </button>
          </mat-card-actions>
        </mat-card>
      }

      <!-- Tabla de plantillas -->
      <mat-card class="table-card">
        @if (cargando()) {
          <div class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Cargando plantillas...</p>
          </div>
        } @else if (plantillas().length === 0) {
          <div class="empty-state">
            <mat-icon>folder_open</mat-icon>
            <h2>No hay plantillas registradas</h2>
            <p>Crea la primera plantilla para que los estudiantes puedan descargarla</p>
          </div>
        } @else {
          <table mat-table [dataSource]="plantillas()" class="plantillas-table">
            <!-- Columna Nombre -->
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let plantilla">
                <div class="nombre-cell">
                  <mat-icon>{{ obtenerIconoTipo(plantilla.tipo_documento) }}</mat-icon>
                  <div>
                    <strong>{{ plantilla.nombre }}</strong>
                    @if (plantilla.version_plantilla) {
                      <span class="version-badge">v{{ plantilla.version_plantilla }}</span>
                    }
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Columna Tipo -->
            <ng-container matColumnDef="tipo">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let plantilla">
                {{ getTipoLabel(plantilla.tipo_documento) }}
              </td>
            </ng-container>

            <!-- Columna Alcance -->
            <ng-container matColumnDef="alcance">
              <th mat-header-cell *matHeaderCellDef>Alcance</th>
              <td mat-cell *matCellDef="let plantilla">
                @if (plantilla.carrera_nombre) {
                  <mat-chip class="chip-alcance">{{ plantilla.carrera_nombre }}</mat-chip>
                } @else if (plantilla.departamento_nombre) {
                  <mat-chip class="chip-alcance">{{ plantilla.departamento_nombre }}</mat-chip>
                } @else if (plantilla.facultad_nombre) {
                  <mat-chip class="chip-alcance">{{ plantilla.facultad_nombre }}</mat-chip>
                } @else {
                  <mat-chip class="chip-global">Global</mat-chip>
                }
              </td>
            </ng-container>

            <!-- Columna Obligatoria -->
            <ng-container matColumnDef="obligatoria">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let plantilla">
                @if (plantilla.obligatoria) {
                  <mat-chip class="chip-obligatoria">
                    <mat-icon>star</mat-icon>
                    Obligatoria
                  </mat-chip>
                } @else {
                  <mat-chip class="chip-opcional">Opcional</mat-chip>
                }
              </td>
            </ng-container>

            <!-- Columna Descargas -->
            <ng-container matColumnDef="descargas">
              <th mat-header-cell *matHeaderCellDef>Descargas</th>
              <td mat-cell *matCellDef="let plantilla">
                <div class="descargas-cell">
                  <mat-icon>download</mat-icon>
                  <span>{{ plantilla.descargas }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Columna Acciones -->
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let plantilla">
                <button mat-icon-button [matMenuTriggerFor]="menu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="descargarPlantilla(plantilla)">
                    <mat-icon>download</mat-icon>
                    Descargar
                  </button>
                  <button mat-menu-item (click)="editarPlantilla(plantilla)">
                    <mat-icon>edit</mat-icon>
                    Editar
                  </button>
                  <button mat-menu-item (click)="desactivarPlantilla(plantilla)">
                    <mat-icon>delete</mat-icon>
                    Desactivar
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columnasTabla"></tr>
            <tr mat-row *matRowDef="let row; columns: columnasTabla;"></tr>
          </table>
        }
      </mat-card>
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
      margin-bottom: 30px;

      h1 {
        display: flex;
        align-items: center;
        gap: 15px;
        margin: 0;
        font-size: 32px;

        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: #2196F3;
        }
      }
    }

    .form-card {
      margin-bottom: 30px;

      mat-card-header {
        margin-bottom: 20px;

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
      }
    }

    .plantilla-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-row {
      display: flex;
      gap: 20px;

      .flex-1 { flex: 1; }
      .flex-2 { flex: 2; }
    }

    .full-width {
      width: 100%;
    }

    .file-upload-section {
      margin: 10px 0;

      .file-label {
        display: block;
        margin-bottom: 10px;
        font-weight: 500;
        color: #333;
      }

      .file-input-container {
        display: flex;
        align-items: center;
        gap: 15px;

        .file-hint {
          color: #999;
          font-size: 13px;
        }
      }

      .file-selected {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 15px;
        background: #f5f5f5;
        border-radius: 6px;
        flex: 1;

        mat-icon {
          color: #2196F3;
        }

        span {
          flex: 1;
          color: #333;
        }
      }
    }

    .alcance-section, .opciones-section {
      margin: 10px 0;

      .section-label {
        display: block;
        margin-bottom: 15px;
        font-weight: 500;
        color: #333;
      }
    }

    .progress-container {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;

      p {
        margin: 0;
        color: #666;
      }
    }

    .table-card {
      overflow-x: auto;
    }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
        margin-bottom: 20px;
      }

      h2 {
        margin: 0 0 10px 0;
        color: #666;
      }

      p {
        margin: 0;
        color: #999;
      }
    }

    .plantillas-table {
      width: 100%;

      .nombre-cell {
        display: flex;
        align-items: center;
        gap: 10px;

        mat-icon {
          color: #2196F3;
        }

        .version-badge {
          display: inline-block;
          padding: 2px 6px;
          background: #E3F2FD;
          color: #1976D2;
          border-radius: 4px;
          font-size: 11px;
          margin-left: 8px;
        }
      }

      .descargas-cell {
        display: flex;
        align-items: center;
        gap: 5px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #999;
        }
      }
    }

    .chip-alcance {
      background: #E0F2F1;
      color: #00796B;
    }

    .chip-global {
      background: #F3E5F5;
      color: #7B1FA2;
    }

    .chip-obligatoria {
      background: #FF9800 !important;
      color: white !important;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .chip-opcional {
      background: #ECEFF1;
      color: #546E7A;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;

        button {
          width: 100%;
        }
      }

      .form-row {
        flex-direction: column;
      }
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

  formularioPlantilla: FormGroup;
  columnasTabla = ['nombre', 'tipo', 'alcance', 'obligatoria', 'descargas', 'acciones'];

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
      error: (error) => {
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
      
      // Validar tamaño
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
    if (!this.formularioPlantilla.valid) {
      return;
    }

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
      error: (error) => {
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
      error: (error) => {
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
      error: (error) => {
        this.snackBar.open('Error al desactivar', 'Cerrar', { duration: 3000 });
      }
    });
  }

  obtenerIconoTipo(tipo: string): string {
    return this.versionesService.obtenerIconoTipoDocumento(tipo);
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
