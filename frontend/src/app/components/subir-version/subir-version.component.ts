import { Component, Inject, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VersionesPlantillasService } from '../../services/versiones-plantillas.service';

interface DialogData {
  avanceId: number;
  proyectoId: number;
  rolUsuario: string;
}

@Component({
  selector: 'app-subir-version',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  template: `
    <div class="dialog-header">
      <h2>
        <i class="fas fa-upload"></i>
        Subir Nueva Versión
      </h2>
      <button class="btn-close" (click)="cerrar()" [disabled]="subiendo()">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div mat-dialog-content class="dialog-body">
      <form [formGroup]="formulario" class="upload-form">
        <!-- Área de carga -->
        <div
          class="file-upload-area"
          [class.drag-over]="dragOver()"
          [class.has-file]="archivoSeleccionado()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="fileInput.click()"
        >
          @if (!archivoSeleccionado()) {
            <div class="upload-placeholder">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Arrastra un archivo aquí o haz clic para seleccionar</p>
              <span class="file-types">Archivos permitidos: PDF, DOCX, DOC (Máx. 50MB)</span>
            </div>
          } @else {
            <div class="file-selected">
              <i class="fas fa-file-alt file-icon"></i>
              <div class="file-info">
                <strong>{{ archivoSeleccionado()?.name }}</strong>
                <span>{{ formatearTamano(archivoSeleccionado()?.size || 0) }}</span>
              </div>
              <button type="button" class="btn-remove" (click)="removerArchivo($event)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          }
          <input #fileInput type="file" hidden accept=".pdf,.doc,.docx" (change)="onFileSelected($event)" />
        </div>

        <!-- Tipo de versión (solo profesores) -->
        @if (esProfesor) {
          <div class="form-group">
            <label class="form-label">Tipo de Versión</label>
            <select class="form-input" formControlName="tipo_version">
              <option value="profesor_revision">Revisión con Anotaciones</option>
              <option value="profesor_comentarios">Solo Comentarios</option>
            </select>
            <span class="form-hint">Selecciona si subes un archivo anotado o solo comentarios</span>
          </div>
        }

        <!-- Descripción de cambios -->
        <div class="form-group">
          <label class="form-label">Descripción de Cambios <span class="required">*</span></label>
          <textarea
            class="form-input"
            formControlName="descripcion_cambios"
            rows="3"
            placeholder="Describe los cambios realizados en esta versión"
          ></textarea>
          @if (esEstudiante) {
            <span class="form-hint">Ejemplo: Correcciones al capítulo 2, nuevas referencias agregadas</span>
          }
        </div>

        <!-- Cambios principales -->
        <div class="form-group">
          <label class="form-label">Resumen de Cambios Principales (Opcional)</label>
          <textarea
            class="form-input"
            formControlName="cambios_principales"
            rows="2"
            placeholder="Lista breve de los cambios más importantes"
          ></textarea>
          <span class="form-hint">Ejemplo: 1. Marco teórico ampliado, 2. Metodología corregida</span>
        </div>

        <!-- Comentarios generales (profesores) -->
        @if (esProfesor) {
          <div class="form-group">
            <label class="form-label">Comentarios Generales</label>
            <textarea
              class="form-input"
              formControlName="comentarios_generales"
              rows="4"
              placeholder="Escribe tus comentarios generales sobre el documento"
            ></textarea>
            <span class="form-hint">Feedback general que verá el estudiante</span>
          </div>
        }

        <!-- Barra de progreso -->
        @if (subiendo()) {
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <p>Subiendo archivo...</p>
          </div>
        }
      </form>
    </div>

    <div mat-dialog-actions class="dialog-footer">
      <button class="btn btn-ghost" (click)="cerrar()" [disabled]="subiendo()">
        Cancelar
      </button>
      <button
        class="btn btn-primary"
        (click)="subirVersion()"
        [disabled]="!formulario.valid || !archivoSeleccionado() || subiendo()"
      >
        @if (subiendo()) {
          <span class="spinner-sm"></span>
        } @else {
          <i class="fas fa-upload"></i>
        }
        Subir Versión
      </button>
    </div>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: linear-gradient(135deg, #004b8d 0%, #0066cc 100%);
      color: #fff;

      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }

    .btn-close {
      background: rgba(255,255,255,0.15);
      border: none;
      color: #fff;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;

      &:hover:not(:disabled) { background: rgba(255,255,255,0.25); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .dialog-body {
      min-width: 500px;
      max-height: 68vh;
      overflow-y: auto;
      padding: 20px 24px !important;

      &::-webkit-scrollbar { width: 5px; }
      &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    }

    .upload-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .file-upload-area {
      border: 2px dashed #ccc;
      border-radius: 12px;
      padding: 36px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.25s;
      background: #fafafa;

      &:hover { border-color: #004b8d; background: #f0f7ff; }
      &.drag-over { border-color: #004b8d; background: #ddeeff; transform: scale(1.01); }
      &.has-file { border-style: solid; border-color: #004b8d; background: #f0f7ff; padding: 16px 20px; }
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      color: #555;

      i { font-size: 52px; color: #004b8d; }
      p { margin: 0; font-size: 15px; }
      .file-types { font-size: 12px; color: #aaa; }
    }

    .file-selected {
      display: flex;
      align-items: center;
      gap: 14px;
      text-align: left;
    }

    .file-icon {
      font-size: 40px;
      color: #004b8d;
      flex-shrink: 0;
    }

    .file-info {
      flex: 1;
      strong { display: block; font-size: 14px; color: #333; margin-bottom: 3px; }
      span { font-size: 12px; color: #999; }
    }

    .btn-remove {
      background: transparent;
      border: 1px solid #ffcdd2;
      color: #e53935;
      width: 30px;
      height: 30px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s;

      &:hover { background: #ffebee; }
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
      padding: 9px 12px;
      font-size: 13px;
      outline: none;
      background: #fff;
      transition: border-color 0.2s;
      font-family: inherit;

      &:focus { border-color: #004b8d; }
    }

    select.form-input { cursor: pointer; }
    textarea.form-input { resize: vertical; }

    .form-hint { font-size: 11px; color: #aaa; }

    .progress-container {
      text-align: center;
      p { margin: 10px 0 0 0; font-size: 13px; color: #666; }
    }

    .progress-bar {
      height: 6px;
      background: #e0e0e0;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      width: 60%;
      background: linear-gradient(90deg, #004b8d, #0066cc);
      border-radius: 3px;
      animation: progress-anim 1.5s ease-in-out infinite;
    }

    @keyframes progress-anim {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }

    .dialog-footer {
      padding: 14px 24px !important;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      border-top: 1px solid #eee;
      margin: 0 !important;
      min-height: unset !important;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 7px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-primary { background: #004b8d; color: #fff; &:hover:not(:disabled) { background: #003a6e; } }
    .btn-ghost { background: transparent; color: #555; border: 1px solid #ddd; &:hover:not(:disabled) { background: #f5f5f5; } }

    .spinner-sm {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .dialog-body { min-width: auto; width: 100%; }
      .file-upload-area { padding: 24px; }
    }
  `]
})
export class SubirVersionComponent {
  private fb = inject(FormBuilder);
  private versionesService = inject(VersionesPlantillasService);
  private snackBar = inject(MatSnackBar);

  formulario: FormGroup;
  archivoSeleccionado = signal<File | null>(null);
  dragOver = signal(false);
  subiendo = signal(false);

  esEstudiante: boolean;
  esProfesor: boolean;

  constructor(
    public dialogRef: MatDialogRef<SubirVersionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.esEstudiante = data.rolUsuario === 'estudiante';
    this.esProfesor = ['profesor_guia', 'profesor_asignatura'].includes(data.rolUsuario);

    this.formulario = this.fb.group({
      tipo_version: [this.esEstudiante ? 'estudiante' : 'profesor_revision'],
      descripcion_cambios: ['', Validators.required],
      cambios_principales: [''],
      comentarios_generales: ['']
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.procesarArchivo(files[0]);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.procesarArchivo(input.files[0]);
  }

  procesarArchivo(file: File) {
    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!tiposPermitidos.includes(file.type)) {
      this.snackBar.open('Solo se permiten archivos PDF y DOCX', 'Cerrar', { duration: 3000 });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      this.snackBar.open('El archivo no debe superar los 50MB', 'Cerrar', { duration: 3000 });
      return;
    }
    this.archivoSeleccionado.set(file);
  }

  removerArchivo(event: Event) {
    event.stopPropagation();
    this.archivoSeleccionado.set(null);
  }

  subirVersion() {
    if (!this.formulario.valid || !this.archivoSeleccionado()) return;

    this.subiendo.set(true);

    const formData = this.versionesService.crearFormDataVersion({
      avance_id: this.data.avanceId,
      proyecto_id: this.data.proyectoId,
      tipo_version: this.formulario.value.tipo_version,
      archivo: this.archivoSeleccionado()!,
      descripcion_cambios: this.formulario.value.descripcion_cambios,
      cambios_principales: this.formulario.value.cambios_principales,
      comentarios_generales: this.formulario.value.comentarios_generales
    });

    this.versionesService.subirVersion(formData).subscribe({
      next: () => {
        this.snackBar.open('Versión subida exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('Error al subir versión', 'Cerrar', { duration: 3000 });
        this.subiendo.set(false);
      }
    });
  }

  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  cerrar() {
    this.dialogRef.close();
  }
}
