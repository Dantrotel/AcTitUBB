import { Component, Inject, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>upload</mat-icon>
      Subir Nueva Versión
    </h2>

    <mat-dialog-content>
      <form [formGroup]="formulario" class="upload-form">
        <!-- Área de carga de archivo -->
        <div class="file-upload-area" 
             [class.drag-over]="dragOver()"
             (dragover)="onDragOver($event)"
             (dragleave)="onDragLeave($event)"
             (drop)="onDrop($event)"
             (click)="fileInput.click()">
          
          @if (!archivoSeleccionado()) {
            <div class="upload-placeholder">
              <mat-icon>cloud_upload</mat-icon>
              <p>Arrastra un archivo aquí o haz clic para seleccionar</p>
              <span class="file-types">Archivos permitidos: PDF, DOCX, DOC (Máx. 50MB)</span>
            </div>
          } @else {
            <div class="file-selected">
              <mat-icon>insert_drive_file</mat-icon>
              <div class="file-info">
                <strong>{{ archivoSeleccionado()?.name }}</strong>
                <span>{{ formatearTamano(archivoSeleccionado()?.size || 0) }}</span>
              </div>
              <button mat-icon-button type="button" (click)="removerArchivo($event)">
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

        <!-- Tipo de versión (solo para profesores) -->
        @if (esProfesor) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Tipo de Versión</mat-label>
            <mat-select formControlName="tipo_version">
              <mat-option value="profesor_revision">Revisión con Anotaciones</mat-option>
              <mat-option value="profesor_comentarios">Solo Comentarios</mat-option>
            </mat-select>
            <mat-hint>Selecciona si subes un archivo anotado o solo comentarios</mat-hint>
          </mat-form-field>
        }

        <!-- Descripción de cambios -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción de Cambios</mat-label>
          <textarea matInput 
                    formControlName="descripcion_cambios"
                    rows="3"
                    placeholder="Describe los cambios realizados en esta versión"></textarea>
          @if (esEstudiante) {
            <mat-hint>Ejemplo: Correcciones al capítulo 2, nuevas referencias agregadas</mat-hint>
          }
        </mat-form-field>

        <!-- Cambios principales (opcional) -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Resumen de Cambios Principales (Opcional)</mat-label>
          <textarea matInput 
                    formControlName="cambios_principales"
                    rows="2"
                    placeholder="Lista breve de los cambios más importantes"></textarea>
          <mat-hint>Ejemplo: 1. Marco teórico ampliado, 2. Metodología corregida</mat-hint>
        </mat-form-field>

        <!-- Comentarios generales (solo profesores) -->
        @if (esProfesor) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Comentarios Generales</mat-label>
            <textarea matInput 
                      formControlName="comentarios_generales"
                      rows="4"
                      placeholder="Escribe tus comentarios generales sobre el documento"></textarea>
            <mat-hint>Feedback general que verá el estudiante</mat-hint>
          </mat-form-field>
        }

        <!-- Barra de progreso -->
        @if (subiendo()) {
          <div class="progress-container">
            <mat-progress-bar mode="indeterminate"></mat-progress-bar>
            <p>Subiendo archivo...</p>
          </div>
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar()" [disabled]="subiendo()">
        Cancelar
      </button>
      <button mat-raised-button 
              color="primary" 
              (click)="subirVersion()"
              [disabled]="!formulario.valid || !archivoSeleccionado() || subiendo()">
        <mat-icon>upload</mat-icon>
        Subir Versión
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    mat-dialog-content {
      min-width: 500px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .upload-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 10px 0;
    }

    .file-upload-area {
      border: 2px dashed #ccc;
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;

      &:hover {
        border-color: #2196F3;
        background: #f5f5f5;
      }

      &.drag-over {
        border-color: #2196F3;
        background: #e3f2fd;
        transform: scale(1.02);
      }
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #2196F3;
      }

      p {
        margin: 0;
        font-size: 16px;
        color: #333;
      }

      .file-types {
        font-size: 12px;
        color: #999;
      }
    }

    .file-selected {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      background: white;
      border-radius: 8px;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #2196F3;
      }

      .file-info {
        flex: 1;
        text-align: left;
        
        strong {
          display: block;
          margin-bottom: 5px;
          color: #333;
        }

        span {
          color: #999;
          font-size: 12px;
        }
      }
    }

    .full-width {
      width: 100%;
    }

    .progress-container {
      padding: 20px;
      text-align: center;

      p {
        margin-top: 10px;
        color: #666;
      }
    }

    mat-dialog-actions {
      padding: 20px 24px;
      margin: 0;
      gap: 10px;
    }

    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: auto;
        width: 100%;
      }

      .file-upload-area {
        padding: 20px;
      }
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
    this.esProfesor = ['profesor_guia', 'profesor_informante'].includes(data.rolUsuario);

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
    if (files && files.length > 0) {
      this.procesarArchivo(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0]);
    }
  }

  procesarArchivo(file: File) {
    // Validar tipo de archivo
    const tiposPermitidos = ['application/pdf', 'application/msword', 
                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!tiposPermitidos.includes(file.type)) {
      this.snackBar.open('Solo se permiten archivos PDF y DOCX', 'Cerrar', { duration: 3000 });
      return;
    }

    // Validar tamaño (50MB)
    const tamanoMaximo = 50 * 1024 * 1024;
    if (file.size > tamanoMaximo) {
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
    if (!this.formulario.valid || !this.archivoSeleccionado()) {
      return;
    }

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
      next: (response) => {
        this.snackBar.open('Versión subida exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
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
