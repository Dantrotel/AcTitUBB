import { Component, Inject, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
    MatDialogModule
  ],
  template: `
    <div class="dialog-header">
      <h2>
        <i class="fas fa-comments"></i>
        Comentarios - {{ data.version.numero_version }}
      </h2>
      <button class="btn-close" (click)="cerrar()">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div mat-dialog-content class="dialog-body">
      <!-- Info versión -->
      <div class="version-info">
        <div class="info-row">
          <span class="label">Archivo:</span>
          <span class="value">{{ data.version.archivo_nombre }}</span>
        </div>
        <div class="info-row">
          <span class="label">Estado:</span>
          <span [ngClass]="'chip chip-estado-' + data.version.estado">
            {{ getEstadoLabel(data.version.estado) }}
          </span>
        </div>
      </div>

      <hr class="divider" />

      <!-- Lista de comentarios -->
      <div class="comentarios-container">
        @if (cargando()) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Cargando comentarios...</p>
          </div>
        } @else if (comentarios().length === 0) {
          <div class="empty-state">
            <i class="fas fa-comment-dots"></i>
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
                    <div class="avatar-circle">{{ comentario.autor_nombre.charAt(0).toUpperCase() }}</div>
                    <div>
                      <strong>{{ comentario.autor_nombre }}</strong>
                      <span class="rol">{{ getRolLabel(comentario.autor_rol) }}</span>
                    </div>
                  </div>
                  <div class="comentario-meta">
                    <span [ngClass]="'chip chip-tipo-' + comentario.tipo_comentario">
                      {{ getTipoLabel(comentario.tipo_comentario) }}
                    </span>
                    <span [ngClass]="'chip chip-prioridad-' + comentario.prioridad">
                      <i [class]="getPrioridadIcon(comentario.prioridad)"></i>
                      {{ comentario.prioridad }}
                    </span>
                  </div>
                </div>

                <div class="comentario-content">
                  @if (comentario.seccion_referencia) {
                    <div class="seccion-ref">
                      <i class="fas fa-map-marker-alt"></i>
                      <span>{{ comentario.seccion_referencia }}</span>
                    </div>
                  }
                  <p class="comentario-texto">{{ comentario.comentario }}</p>
                </div>

                <div class="comentario-footer">
                  <span class="fecha">{{ formatearFecha(comentario.created_at) }}</span>
                  @if (puedeComentarComputed() && !comentario.resuelto) {
                    <button class="btn btn-sm btn-outline-success" (click)="resolverComentario(comentario)">
                      <i class="fas fa-check-circle"></i>
                      Marcar como Resuelto
                    </button>
                  }
                  @if (comentario.resuelto) {
                    <span class="chip chip-resuelto">
                      <i class="fas fa-check-circle"></i> Resuelto
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Formulario nuevo comentario -->
      @if (puedeComentarComputed() && mostrarFormulario()) {
        <hr class="divider" />
        <div class="nuevo-comentario">
          <h3>
            <i class="fas fa-comment-medical"></i>
            Agregar Comentario
          </h3>

          <form [formGroup]="formularioComentario" class="comentario-form">
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Tipo de Comentario</label>
                <select class="form-input" formControlName="tipo_comentario">
                  <option value="general">General</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="error">Error / Corrección</option>
                  <option value="aprobacion">Aprobación</option>
                  <option value="rechazo">Rechazo</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Prioridad</label>
                <select class="form-input" formControlName="prioridad">
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Sección Referenciada (Opcional)</label>
              <input
                class="form-input"
                type="text"
                formControlName="seccion_referencia"
                placeholder='Ej: "Capítulo 3", "Página 15", "Introducción"'
              />
              <span class="form-hint">Indica la sección específica del documento</span>
            </div>

            <div class="form-group">
              <label class="form-label">Comentario <span class="required">*</span></label>
              <textarea
                class="form-input"
                formControlName="comentario"
                rows="4"
                placeholder="Escribe tu comentario aquí..."
              ></textarea>
              <span class="form-hint">{{ formularioComentario.get('comentario')?.value?.length || 0 }} caracteres</span>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-ghost" (click)="ocultarFormulario()">
                Cancelar
              </button>
              <button
                type="button"
                class="btn btn-primary"
                (click)="agregarComentario()"
                [disabled]="!formularioComentario.valid || enviando()"
              >
                @if (enviando()) {
                  <span class="spinner-sm"></span>
                } @else {
                  <i class="fas fa-paper-plane"></i>
                }
                Enviar Comentario
              </button>
            </div>
          </form>
        </div>
      }

      @if (puedeComentarComputed() && !mostrarFormulario()) {
        <div class="btn-agregar-wrap">
          <button class="btn btn-primary btn-block" (click)="mostrarFormularioAgregar()">
            <i class="fas fa-comment-medical"></i>
            Agregar Comentario
          </button>
        </div>
      }
    </div>

    <div mat-dialog-actions class="dialog-footer">
      <button class="btn btn-ghost" (click)="cerrar()">Cerrar</button>
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

      &:hover { background: rgba(255,255,255,0.25); }
    }

    .dialog-body {
      min-width: 680px;
      max-height: 72vh;
      overflow-y: auto;
      padding: 0 !important;

      &::-webkit-scrollbar { width: 5px; }
      &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    }

    .version-info {
      padding: 16px 24px;
      background: #f8f9fa;
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }

    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;

      .label { font-weight: 500; color: #666; font-size: 13px; }
      .value { color: #333; font-size: 13px; }
    }

    .divider {
      border: none;
      border-top: 1px solid #eee;
      margin: 0;
    }

    .comentarios-container {
      padding: 20px 24px;
      min-height: 160px;
    }

    .loading, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
      color: #aaa;

      i { font-size: 48px; margin-bottom: 12px; }
      p { margin: 0 0 6px 0; color: #777; }
      .hint { font-size: 13px; }
    }

    .spinner {
      width: 36px;
      height: 36px;
      border: 3px solid #e0e0e0;
      border-top-color: #004b8d;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 12px;
    }

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

    .comentarios-lista {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .comentario-item {
      padding: 14px 16px;
      border: 1px solid #e8e8e8;
      border-radius: 10px;
      background: #fff;
      transition: box-shadow 0.2s;

      &:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      &.resuelto { opacity: 0.65; background: #fafafa; }
    }

    .comentario-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .autor-info {
      display: flex;
      align-items: center;
      gap: 10px;

      strong { display: block; font-size: 13px; color: #222; }
      .rol { font-size: 11px; color: #999; }
    }

    .avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: linear-gradient(135deg, #004b8d, #0066cc);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .comentario-meta {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
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

    .chip-resuelto { background: #e8f5e9; color: #2e7d32; }
    .chip-tipo-general { background: #e3f2fd; color: #1565c0; }
    .chip-tipo-sugerencia { background: #fff3e0; color: #e65100; }
    .chip-tipo-error { background: #ffebee; color: #b71c1c; }
    .chip-tipo-aprobacion { background: #e8f5e9; color: #2e7d32; }
    .chip-tipo-rechazo { background: #fce4ec; color: #880e4f; }
    .chip-prioridad-baja { background: #e8f5e9; color: #2e7d32; }
    .chip-prioridad-media { background: #fff3e0; color: #e65100; }
    .chip-prioridad-alta { background: #ffebee; color: #b71c1c; }
    .chip-estado-borrador { background: #eceff1; color: #455a64; }
    .chip-estado-enviado { background: #e3f2fd; color: #1565c0; }
    .chip-estado-en_revision { background: #fff3e0; color: #e65100; }
    .chip-estado-revisado { background: #e0f2f1; color: #00695c; }
    .chip-estado-aprobado { background: #e8f5e9; color: #2e7d32; }
    .chip-estado-rechazado { background: #ffebee; color: #b71c1c; }

    .comentario-content {
      margin: 10px 0;

      .seccion-ref {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #777;
        font-size: 12px;
        margin-bottom: 6px;
        i { color: #004b8d; }
      }

      .comentario-texto {
        margin: 0;
        line-height: 1.6;
        color: #333;
        font-size: 14px;
      }
    }

    .comentario-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 10px;
      .fecha { font-size: 11px; color: #bbb; }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: 7px;
      border: none;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .btn-primary { background: #004b8d; color: #fff; &:hover:not(:disabled) { background: #003a6e; } }
    .btn-ghost { background: transparent; color: #555; border: 1px solid #ddd; &:hover { background: #f5f5f5; } }
    .btn-sm { padding: 4px 12px; font-size: 12px; }
    .btn-block { width: calc(100% - 48px); justify-content: center; }
    .btn-outline-success { background: transparent; color: #2e7d32; border: 1px solid #a5d6a7; &:hover { background: #e8f5e9; } }

    .nuevo-comentario {
      padding: 20px 24px;
      background: #f9f9f9;

      h3 {
        margin: 0 0 18px 0;
        font-size: 15px;
        font-weight: 600;
        color: #333;
        display: flex;
        align-items: center;
        gap: 8px;
        i { color: #004b8d; }
      }
    }

    .comentario-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-row {
      display: flex;
      gap: 14px;
    }

    .flex-1 { flex: 1; }

    .form-group { display: flex; flex-direction: column; gap: 4px; }

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
    textarea.form-input { resize: vertical; min-height: 90px; }

    .form-hint { font-size: 11px; color: #aaa; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding-top: 4px;
    }

    .btn-agregar-wrap {
      padding: 16px 24px;
      display: flex;
      justify-content: center;
    }

    .dialog-footer {
      padding: 14px 24px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid #eee;
      margin: 0 !important;
      min-height: unset !important;
    }

    @media (max-width: 768px) {
      .dialog-body { min-width: auto; width: 100%; }
      .form-row { flex-direction: column; }
      .comentario-header { flex-direction: column; }
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
      error: () => {
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
    this.formularioComentario.reset({ tipo_comentario: 'general', prioridad: 'media' });
  }

  agregarComentario() {
    if (!this.formularioComentario.valid) return;

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
      error: () => {
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
      error: () => {
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
      baja: 'fas fa-arrow-down',
      media: 'fas fa-minus',
      alta: 'fas fa-arrow-up'
    };
    return icons[prioridad] || 'fas fa-minus';
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
