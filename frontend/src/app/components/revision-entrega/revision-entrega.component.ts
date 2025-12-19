import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { 
  Entrega, 
  RevisionEntregaRequest,
  EVALUACION_CONSTRAINTS 
} from '../../interfaces/hitos-entregas.interface';

@Component({
  selector: 'app-revision-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="modal" [class.show]="mostrarModal" *ngIf="mostrarModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Revisar Entrega</h5>
            <button (click)="cerrarModal()" class="btn-close"></button>
          </div>

          <div class="modal-body" *ngIf="entrega">
            <!-- Información de la entrega -->
            <div class="entrega-info-section">
              <h6>Información de la Entrega</h6>
              <div class="info-grid">
                <div class="info-item">
                  <label>Estudiante:</label>
                  <span>{{ entrega.estudiante_nombre }} ({{ entrega.estudiante_rut }})</span>
                </div>
                <div class="info-item">
                  <label>Archivo:</label>
                  <span>{{ entrega.archivo_nombre }}</span>
                </div>
                <div class="info-item">
                  <label>Fecha de entrega:</label>
                  <span>{{ formatearFecha(entrega.fecha_entrega) }}</span>
                </div>
                <div class="info-item">
                  <label>Versión:</label>
                  <span>v{{ entrega.version }}</span>
                </div>
                <div class="info-item">
                  <label>Entrega final:</label>
                  <span class="badge" [class]="entrega.es_entrega_final ? 'badge-success' : 'badge-secondary'">
                    {{ entrega.es_entrega_final ? 'Sí' : 'No' }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Estado actual:</label>
                  <span class="badge" [class]="'badge-' + entrega.estado">{{ entrega.estado }}</span>
                </div>
              </div>

              <div class="comentarios-estudiante" *ngIf="entrega.comentarios">
                <h6>Comentarios del estudiante:</h6>
                <div class="comentarios-box">{{ entrega.comentarios }}</div>
              </div>

              <!-- Botón para descargar archivo -->
              <div class="archivo-actions">
                <button (click)="descargarArchivo()" class="btn btn-outline-primary">
                  <i class="fas fa-download"></i> Descargar Archivo
                </button>
                <span class="archivo-size">{{ formatearTamano(entrega.archivo_tamano) }}</span>
              </div>
            </div>

            <!-- Formulario de revisión -->
            <form [formGroup]="formRevision" (ngSubmit)="guardarRevision()">
              <div class="revision-section">
                <h6>Revisión</h6>
                
                <div class="row">
                  <div class="col-md-6">
                    <label class="form-label">Estado de la revisión *</label>
                    <select formControlName="estado" class="form-select" 
                            [class.is-invalid]="formRevision.get('estado')?.invalid && formRevision.get('estado')?.touched">
                      <option value="">Seleccionar estado</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="rechazado">Rechazado</option>
                      <option value="reentrega_requerida">Reentrega requerida</option>
                    </select>
                    <div class="invalid-feedback" *ngIf="formRevision.get('estado')?.invalid && formRevision.get('estado')?.touched">
                      Debe seleccionar un estado para la revisión
                    </div>
                  </div>

                  <div class="col-md-6" *ngIf="mostrarCalificacion()">
                    <label class="form-label">Calificación (0-100)</label>
                    <input type="number" formControlName="calificacion" class="form-control"
                           min="0" max="100" step="0.5"
                           [class.is-invalid]="formRevision.get('calificacion')?.invalid && formRevision.get('calificacion')?.touched">
                    <div class="invalid-feedback" *ngIf="formRevision.get('calificacion')?.invalid && formRevision.get('calificacion')?.touched">
                      La calificación debe estar entre 0 y 100
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Retroalimentación *</label>
                  <textarea formControlName="retroalimentacion" class="form-control" rows="4"
                            [attr.maxlength]="EVALUACION_CONSTRAINTS.COMENTARIO_MAX_LENGTH"
                            [class.is-invalid]="formRevision.get('retroalimentacion')?.invalid && formRevision.get('retroalimentacion')?.touched"
                            placeholder="Proporcione comentarios detallados sobre la entrega..."></textarea>
                  <div class="form-text">
                    {{ obtenerLongitudRetroalimentacion() }}/{{ EVALUACION_CONSTRAINTS.COMENTARIO_MAX_LENGTH }} caracteres
                  </div>
                  <div class="invalid-feedback" *ngIf="formRevision.get('retroalimentacion')?.invalid && formRevision.get('retroalimentacion')?.touched">
                    La retroalimentación es requerida
                  </div>
                </div>

                <!-- Criterios de evaluación adicionales -->
                <div class="criterios-section" *ngIf="mostrarCalificacion()">
                  <h6>Criterios de Evaluación</h6>
                  <div class="criterios-grid">
                    <div class="criterio-item">
                      <label>Cumplimiento de requisitos</label>
                      <select [(ngModel)]="criterios.cumplimiento" name="cumplimiento" class="form-select">
                        <option value="">No evaluado</option>
                        <option value="excelente">Excelente (90-100%)</option>
                        <option value="bueno">Bueno (70-89%)</option>
                        <option value="regular">Regular (50-69%)</option>
                        <option value="deficiente">Deficiente (0-49%)</option>
                      </select>
                    </div>
                    <div class="criterio-item">
                      <label>Calidad del trabajo</label>
                      <select [(ngModel)]="criterios.calidad" name="calidad" class="form-select">
                        <option value="">No evaluado</option>
                        <option value="excelente">Excelente</option>
                        <option value="bueno">Bueno</option>
                        <option value="regular">Regular</option>
                        <option value="deficiente">Deficiente</option>
                      </select>
                    </div>
                    <div class="criterio-item">
                      <label>Puntualidad</label>
                      <select [(ngModel)]="criterios.puntualidad" name="puntualidad" class="form-select">
                        <option value="">No evaluado</option>
                        <option value="puntual">Entregado a tiempo</option>
                        <option value="tardio">Entregado con retraso</option>
                        <option value="muy_tardio">Entregado muy tarde</option>
                      </select>
                    </div>
                    <div class="criterio-item">
                      <label>Presentación</label>
                      <select [(ngModel)]="criterios.presentacion" name="presentacion" class="form-select">
                        <option value="">No evaluado</option>
                        <option value="excelente">Excelente</option>
                        <option value="bueno">Bueno</option>
                        <option value="regular">Regular</option>
                        <option value="deficiente">Deficiente</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Plantillas de retroalimentación -->
                <div class="plantillas-section">
                  <h6>Plantillas de Retroalimentación</h6>
                  <div class="plantillas-botones">
                    <button type="button" (click)="aplicarPlantilla('aprobado')" class="btn btn-sm btn-outline-success">
                      Trabajo Aprobado
                    </button>
                    <button type="button" (click)="aplicarPlantilla('reentrega')" class="btn btn-sm btn-outline-warning">
                      Necesita Reentrega
                    </button>
                    <button type="button" (click)="aplicarPlantilla('rechazado')" class="btn btn-sm btn-outline-danger">
                      Trabajo Rechazado
                    </button>
                  </div>
                </div>

                <div class="alert alert-danger" *ngIf="erroresValidacion.length > 0">
                  <ul class="mb-0">
                    <li *ngFor="let error of erroresValidacion">{{ error }}</li>
                  </ul>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" (click)="cerrarModal()" class="btn btn-secondary">Cancelar</button>
                <button type="submit" [disabled]="formRevision.invalid || guardandoRevision" class="btn btn-primary">
                  <span *ngIf="guardandoRevision" class="spinner-border spinner-border-sm me-2"></span>
                  Guardar Revisión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './revision-entrega.component.scss'
})
export class RevisionEntregaComponent implements OnInit {
  @Input() entrega: Entrega | null = null;
  @Input() mostrarModal = false;
  @Output() modalCerrado = new EventEmitter<void>();
  @Output() revisionGuardada = new EventEmitter<void>();

  formRevision: FormGroup;
  criterios = {
    cumplimiento: '',
    calidad: '',
    puntualidad: '',
    presentacion: ''
  };
  
  erroresValidacion: string[] = [];
  guardandoRevision = false;
  
  readonly EVALUACION_CONSTRAINTS = EVALUACION_CONSTRAINTS;

  private plantillasRetroalimentacion = {
    aprobado: `Excelente trabajo. La entrega cumple con todos los requisitos establecidos y demuestra un buen dominio de los conceptos. 

Aspectos destacados:
- Cumplimiento completo de los requisitos
- Buena calidad en la presentación
- Entrega puntual

¡Felicitaciones!`,
    
    reentrega: `El trabajo presenta algunos aspectos que necesitan ser mejorados antes de la aprobación.

Aspectos a corregir:
- [Especificar aspectos específicos a mejorar]
- [Agregar recomendaciones concretas]

Por favor, realice las correcciones necesarias y vuelva a entregar. Tiene [X días] para realizar la reentrega.`,
    
    rechazado: `Lamentablemente, la entrega no cumple con los requisitos mínimos establecidos.

Principales problemas identificados:
- [Detallar problemas específicos]
- [Explicar por qué no cumple con los requisitos]

Recomendaciones para futuras entregas:
- [Proporcionar orientación constructiva]

Le sugiero que se acerque durante las horas de consulta para aclarar dudas.`
  };

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.formRevision = this.fb.group({
      estado: ['', [Validators.required]],
      calificacion: [null, [Validators.min(0), Validators.max(100)]],
      retroalimentacion: ['', [Validators.required, Validators.maxLength(EVALUACION_CONSTRAINTS.COMENTARIO_MAX_LENGTH)]]
    });
  }

  ngOnInit() {
    // Establecer validador condicional para calificación
    this.formRevision.get('estado')?.valueChanges.subscribe(estado => {
      const calificacionControl = this.formRevision.get('calificacion');
      if (estado === 'aprobado') {
        calificacionControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
      } else {
        calificacionControl?.setValidators([Validators.min(0), Validators.max(100)]);
      }
      calificacionControl?.updateValueAndValidity();
    });
  }

  mostrarCalificacion(): boolean {
    const estado = this.formRevision.get('estado')?.value;
    return estado === 'aprobado' || estado === 'rechazado';
  }

  obtenerLongitudRetroalimentacion(): number {
    return this.formRevision.get('retroalimentacion')?.value?.length || 0;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  descargarArchivo() {
    if (this.entrega?.archivo_url) {
      window.open(this.entrega.archivo_url, '_blank');
    }
  }

  aplicarPlantilla(tipo: 'aprobado' | 'reentrega' | 'rechazado') {
    const plantilla = this.plantillasRetroalimentacion[tipo];
    this.formRevision.patchValue({
      retroalimentacion: plantilla
    });

    // Establecer estado correspondiente
    if (tipo === 'aprobado') {
      this.formRevision.patchValue({ estado: 'aprobado' });
    } else if (tipo === 'reentrega') {
      this.formRevision.patchValue({ estado: 'reentrega_requerida' });
    } else if (tipo === 'rechazado') {
      this.formRevision.patchValue({ estado: 'rechazado' });
    }
  }

  guardarRevision() {
    if (this.formRevision.invalid || !this.entrega) return;

    this.erroresValidacion = [];
    
    // Validaciones adicionales
    const datosRevision = this.formRevision.value;
    if (datosRevision.estado === 'aprobado' && (!datosRevision.calificacion || datosRevision.calificacion < 0)) {
      this.erroresValidacion.push('Para aprobar una entrega debe asignar una calificación válida');
      return;
    }

    if (datosRevision.retroalimentacion.trim().length < 10) {
      this.erroresValidacion.push('La retroalimentación debe tener al menos 10 caracteres');
      return;
    }

    this.guardandoRevision = true;

    // Preparar datos para envío incluyendo criterios
    const revisionCompleta: RevisionEntregaRequest & { criterios?: any } = {
      ...datosRevision,
      criterios: this.criterios
    };

    this.apiService.revisarHito(this.entrega.id, revisionCompleta).subscribe({
      next: () => {
        this.revisionGuardada.emit();
        this.cerrarModal();
      },
      error: (error: any) => {
        this.erroresValidacion = ['Error al guardar la revisión. Intente nuevamente.'];
      },
      complete: () => {
        this.guardandoRevision = false;
      }
    });
  }

  cerrarModal() {
    this.modalCerrado.emit();
    this.formRevision.reset();
    this.criterios = {
      cumplimiento: '',
      calidad: '',
      puntualidad: '',
      presentacion: ''
    };
    this.erroresValidacion = [];
  }
}