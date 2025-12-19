import { Component, Inject, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VersionesPlantillasService, ComentarioVersion, VersionDocumento } from '../../services/versiones-plantillas.service';

interface DialogData {
  versionId: number;
  version: VersionDocumento;
  rolUsuario: string;
}

@Component({
  selector: 'app-comentarios-version',
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
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>comment</mat-icon>
      Comentarios - {{ data.version.numero_version }}
    </h2>

    <mat-dialog-content>
      <!-- Información de la versión -->
      <div class="version-info">
        <div class="info-row">
          <span class="label">Archivo:</span>
          <span class="value">{{ data.version.archivo_nombre }}</span>
        </div>
        <div class="info-row">
          <span class="label">Estado:</span>
          <mat-chip [class]="'chip-estado-' + data.version.estado">
            {{ getEstadoLabel(data.version.estado) }}
          </mat-chip>
        </div>
      </div>

      <mat-divider></mat-divider>

      <!-- Lista de comentarios -->
      <div class="comentarios-container">
        @if (cargando()) {
          <div class="loading">
            <mat-spinner diameter="40"></mat-spinner>
            <p>Cargando comentarios...</p>
          </div>
        } @else if (comentarios().length === 0) {
          <div class="empty-state">
            <mat-icon>chat_bubble_outline</mat-icon>
            <p>No hay comentarios aún</p>
            @if (puedeComentarComputed()) {
              <span class="hint">Sé el primero en agregar un comentario</span>
            }
          </div>
        } @else {
          <div class="comentarios-lista">
            @for (comentario of comentarios(); track comentario.id) {
              <div class="comentario-item" [class.resuelto]="comentario.resuelto">
                <div class="comentario-header">
                  <div class="autor-info">
                    <mat-icon class="avatar-icon">account_circle</mat-icon>
                    <div>
                      <strong>{{ comentario.autor_nombre }}</strong>
                      <span class="rol">{{ getRolLabel(comentario.autor_rol) }}</span>
                    </div>
                  </div>
                  <div class="comentario-meta">
                    <mat-chip [class]="'chip-tipo-' + comentario.tipo_comentario" class="small-chip">
                      {{ getTipoLabel(comentario.tipo_comentario) }}
                    </mat-chip>
                    <mat-chip [class]="'chip-prioridad-' + comentario.prioridad" class="small-chip">
                      <mat-icon>{{ getPrioridadIcon(comentario.prioridad) }}</mat-icon>
                      {{ comentario.prioridad }}
                    </mat-chip>
                  </div>
                </div>

                <div class="comentario-content">
                  @if (comentario.seccion_referencia) {
                    <div class="seccion-ref">
                      <mat-icon>location_on</mat-icon>
                      <span>{{ comentario.seccion_referencia }}</span>
                    </div>
                  }
                  <p class="comentario-texto">{{ comentario.comentario }}</p>
                </div>

                <div class="comentario-footer">
                  <span class="fecha">{{ formatearFecha(comentario.created_at) }}</span>
                  @if (puedeComentarComputed() && !comentario.resuelto) {
                    <button mat-button (click)="resolverComentario(comentario)" class="btn-resolver">
                      <mat-icon>check_circle</mat-icon>
                      Marcar como Resuelto
                    </button>
                  }
                  @if (comentario.resuelto) {
                    <mat-chip class="chip-resuelto">
                      <mat-icon>check_circle</mat-icon>
                      Resuelto
                    </mat-chip>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Formulario para nuevo comentario (solo profesores) -->
      @if (puedeComentarComputed() && mostrarFormulario()) {
        <mat-divider></mat-divider>
        
        <div class="nuevo-comentario">
          <h3>
            <mat-icon>add_comment</mat-icon>
            Agregar Comentario
          </h3>

          <form [formGroup]="formularioComentario" class="comentario-form">
            <div class="form-row">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Tipo de Comentario</mat-label>
                <mat-select formControlName="tipo_comentario">
                  <mat-option value="general">General</mat-option>
                  <mat-option value="sugerencia">Sugerencia</mat-option>
                  <mat-option value="error">Error / Corrección</mat-option>
                  <mat-option value="aprobacion">Aprobación</mat-option>
                  <mat-option value="rechazo">Rechazo</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Prioridad</mat-label>
                <mat-select formControlName="prioridad">
                  <mat-option value="baja">
                    <mat-icon>arrow_downward</mat-icon>
                    Baja
                  </mat-option>
                  <mat-option value="media">
                    <mat-icon>remove</mat-icon>
                    Media
                  </mat-option>
                  <mat-option value="alta">
                    <mat-icon>arrow_upward</mat-icon>
                    Alta
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Sección Referenciada (Opcional)</mat-label>
              <input matInput 
                     formControlName="seccion_referencia"
                     placeholder='Ej: "Capítulo 3", "Página 15", "Introducción"'>
              <mat-hint>Indica la sección específica del documento</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Comentario</mat-label>
              <textarea matInput 
                        formControlName="comentario"
                        rows="4"
                        placeholder="Escribe tu comentario aquí..."
                        required></textarea>
              <mat-hint>{{ formularioComentario.get('comentario')?.value?.length || 0 }} caracteres</mat-hint>
            </mat-form-field>

            <div class="form-actions">
              <button mat-button type="button" (click)="ocultarFormulario()">
                Cancelar
              </button>
              <button mat-raised-button 
                      color="primary" 
                      (click)="agregarComentario()"
                      [disabled]="!formularioComentario.valid || enviando()">
                @if (enviando()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <mat-icon>send</mat-icon>
                }
                Enviar Comentario
              </button>
            </div>
          </form>
        </div>
      }

      @if (puedeComentarComputed() && !mostrarFormulario()) {
        <button mat-raised-button color="primary" class="btn-agregar" (click)="mostrarFormularioAgregar()">
          <mat-icon>add_comment</mat-icon>
          Agregar Comentario
        </button>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cerrar()">Cerrar</button>
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
      min-width: 700px;
      max-height: 80vh;
      overflow-y: auto;
      padding: 0 !important;
    }

    .version-info {
      padding: 20px 24px;
      background: #f5f5f5;

      .info-row {
        display: flex;
        gap: 10px;
        margin-bottom: 8px;

        .label {
          font-weight: 500;
          color: #666;
        }

        .value {
          color: #333;
        }
      }
    }

    .comentarios-container {
      padding: 20px 24px;
      min-height: 200px;
    }

    .loading, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #ccc;
        margin-bottom: 15px;
      }

      p {
        margin: 10px 0;
        color: #666;
      }

      .hint {
        font-size: 14px;
        color: #999;
      }
    }

    .comentarios-lista {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .comentario-item {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: white;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      &.resuelto {
        opacity: 0.7;
        background: #f9f9f9;
      }
    }

    .comentario-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 12px;
    }

    .autor-info {
      display: flex;
      align-items: center;
      gap: 10px;

      .avatar-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: #666;
      }

      strong {
        display: block;
        margin-bottom: 2px;
      }

      .rol {
        font-size: 12px;
        color: #999;
      }
    }

    .comentario-meta {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .small-chip {
      height: 24px;
      font-size: 11px;
      
      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .comentario-content {
      margin: 12px 0;

      .seccion-ref {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #666;
        font-size: 13px;
        margin-bottom: 8px;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
      }

      .comentario-texto {
        margin: 0;
        line-height: 1.6;
        color: #333;
      }
    }

    .comentario-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;

      .fecha {
        font-size: 12px;
        color: #999;
      }

      .btn-resolver {
        mat-icon {
          margin-right: 4px;
        }
      }
    }

    .chip-resuelto {
      background: #E8F5E9 !important;
      color: #388E3C !important;
    }

    .chip-tipo-general { background: #E3F2FD; color: #1976D2; }
    .chip-tipo-sugerencia { background: #FFF3E0; color: #F57C00; }
    .chip-tipo-error { background: #FFEBEE; color: #C62828; }
    .chip-tipo-aprobacion { background: #E8F5E9; color: #388E3C; }
    .chip-tipo-rechazo { background: #FCE4EC; color: #C2185B; }

    .chip-prioridad-baja { background: #E8F5E9; color: #388E3C; }
    .chip-prioridad-media { background: #FFF3E0; color: #F57C00; }
    .chip-prioridad-alta { background: #FFEBEE; color: #C62828; }

    .chip-estado-borrador { background: #ECEFF1; color: #546E7A; }
    .chip-estado-enviado { background: #E3F2FD; color: #1976D2; }
    .chip-estado-en_revision { background: #FFF3E0; color: #F57C00; }
    .chip-estado-revisado { background: #E0F2F1; color: #00796B; }
    .chip-estado-aprobado { background: #E8F5E9; color: #388E3C; }
    .chip-estado-rechazado { background: #FFEBEE; color: #C62828; }

    .nuevo-comentario {
      padding: 20px 24px;
      background: #f9f9f9;

      h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 20px 0;
        color: #333;
      }
    }

    .comentario-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .flex-1 {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 10px;
    }

    .btn-agregar {
      margin: 20px 24px;
      width: calc(100% - 48px);
    }

    mat-dialog-actions {
      padding: 20px 24px;
      margin: 0;
    }

    @media (max-width: 768px) {
      mat-dialog-content {
        min-width: auto;
        width: 100%;
      }

      .form-row {
        flex-direction: column;
      }

      .comentario-header {
        flex-direction: column;
        gap: 10px;
      }
    }
  `]
})
export class ComentariosVersionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private versionesService = inject(VersionesPlantillasService);
  private snackBar = inject(MatSnackBar);

  comentarios = signal<ComentarioVersion[]>([]);
  cargando = signal(true);
  enviando = signal(false);
  mostrarFormulario = signal(false);

  formularioComentario: FormGroup;

  puedeComentarComputed = computed(() => {
    return ['profesor_guia', 'profesor_informante', 'admin'].includes(this.data.rolUsuario);
  });

  constructor(
    public dialogRef: MatDialogRef<ComentariosVersionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.formularioComentario = this.fb.group({
      comentario: ['', Validators.required],
      tipo_comentario: ['general', Validators.required],
      prioridad: ['media', Validators.required],
      seccion_referencia: ['']
    });
  }

  ngOnInit() {
    this.cargarComentarios();
  }

  cargarComentarios() {
    this.cargando.set(true);
    this.versionesService.obtenerComentarios(this.data.versionId).subscribe({
      next: (response) => {
        this.comentarios.set(response.comentarios);
        this.cargando.set(false);
      },
      error: (error) => {
        this.snackBar.open('Error al cargar comentarios', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  mostrarFormularioAgregar() {
    this.mostrarFormulario.set(true);
  }

  ocultarFormulario() {
    this.mostrarFormulario.set(false);
    this.formularioComentario.reset({
      tipo_comentario: 'general',
      prioridad: 'media'
    });
  }

  agregarComentario() {
    if (!this.formularioComentario.valid) {
      return;
    }

    this.enviando.set(true);

    this.versionesService.crearComentario(
      this.data.versionId,
      this.formularioComentario.value
    ).subscribe({
      next: () => {
        this.snackBar.open('Comentario agregado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarComentarios();
        this.ocultarFormulario();
        this.enviando.set(false);
      },
      error: (error) => {
        this.snackBar.open('Error al agregar comentario', 'Cerrar', { duration: 3000 });
        this.enviando.set(false);
      }
    });
  }

  resolverComentario(comentario: ComentarioVersion) {
    this.versionesService.resolverComentario(comentario.id).subscribe({
      next: () => {
        this.snackBar.open('Comentario marcado como resuelto', 'Cerrar', { duration: 2000 });
        this.cargarComentarios();
      },
      error: (error) => {
        this.snackBar.open('Error al resolver comentario', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      general: 'General',
      sugerencia: 'Sugerencia',
      error: 'Error',
      aprobacion: 'Aprobación',
      rechazo: 'Rechazo'
    };
    return labels[tipo] || tipo;
  }

  getRolLabel(rol: string): string {
    const labels: Record<string, string> = {
      estudiante: 'Estudiante',
      profesor_guia: 'Profesor Guía',
      profesor_informante: 'Profesor Informante',
      admin: 'Administrador'
    };
    return labels[rol] || rol;
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      borrador: 'Borrador',
      enviado: 'Enviado',
      en_revision: 'En Revisión',
      revisado: 'Revisado',
      aprobado: 'Aprobado',
      rechazado: 'Rechazado'
    };
    return labels[estado] || estado;
  }

  getPrioridadIcon(prioridad: string): string {
    const icons: Record<string, string> = {
      baja: 'arrow_downward',
      media: 'remove',
      alta: 'arrow_upward'
    };
    return icons[prioridad] || 'remove';
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
