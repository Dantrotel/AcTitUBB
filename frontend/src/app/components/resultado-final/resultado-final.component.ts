import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { VersionesPlantillasService, ResultadoFinal, HistorialEstado } from '../../services/versiones-plantillas.service';

@Component({
  selector: 'app-resultado-final',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatStepperModule
  ],
  template: `
    <mat-card class="resultado-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>assignment_turned_in</mat-icon>
          Resultado Final del Proyecto
        </mat-card-title>
      </mat-card-header>

      <mat-card-content>
        @if (cargando()) {
          <div class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Cargando información...</p>
          </div>
        } @else if (resultadoExistente()) {
          <!-- Mostrar resultado existente -->
          <div class="resultado-existente">
            <div class="estado-principal">
              <mat-icon [class]="'icon-estado-' + resultadoExistente()!.estado_final">
                {{ getIconoEstado(resultadoExistente()!.estado_final) }}
              </mat-icon>
              <div>
                <h2>{{ getEstadoLabel(resultadoExistente()!.estado_final) }}</h2>
                <span class="fecha">
                  Cerrado el {{ formatearFecha(resultadoExistente()!.fecha_cierre!) }}
                </span>
              </div>
            </div>

            <mat-divider></mat-divider>

            <div class="detalles-resultado">
              <!-- Evaluaciones -->
              <div class="seccion">
                <h3>
                  <mat-icon>school</mat-icon>
                  Evaluaciones
                </h3>
                <div class="evaluaciones-grid">
                  @if (resultadoExistente()!.evaluacion_profesor_guia) {
                    <div class="evaluacion-item">
                      <span class="label">Profesor Guía</span>
                      <span class="nota">{{ resultadoExistente()!.evaluacion_profesor_guia }}</span>
                    </div>
                  }
                  @if (resultadoExistente()!.evaluacion_profesor_informante) {
                    <div class="evaluacion-item">
                      <span class="label">Profesor Informante</span>
                      <span class="nota">{{ resultadoExistente()!.evaluacion_profesor_informante }}</span>
                    </div>
                  }
                  @if (resultadoExistente()!.evaluacion_comision) {
                    <div class="evaluacion-item">
                      <span class="label">Comisión</span>
                      <span class="nota">{{ resultadoExistente()!.evaluacion_comision }}</span>
                    </div>
                  }
                </div>
              </div>

              <!-- Observaciones -->
              @if (resultadoExistente()!.observaciones_finales) {
                <div class="seccion">
                  <h3>
                    <mat-icon>comment</mat-icon>
                    Observaciones Finales
                  </h3>
                  <p>{{ resultadoExistente()!.observaciones_finales }}</p>
                </div>
              }

              <!-- Recomendaciones -->
              @if (resultadoExistente()!.recomendaciones) {
                <div class="seccion">
                  <h3>
                    <mat-icon>lightbulb</mat-icon>
                    Recomendaciones
                  </h3>
                  <p>{{ resultadoExistente()!.recomendaciones }}</p>
                </div>
              }

              <!-- Áreas destacadas -->
              @if (resultadoExistente()!.areas_destacadas) {
                <div class="seccion">
                  <h3>
                    <mat-icon>star</mat-icon>
                    Áreas Destacadas
                  </h3>
                  <p>{{ resultadoExistente()!.areas_destacadas }}</p>
                </div>
              }

              <!-- Menciones -->
              @if (resultadoExistente()!.mencion_honores || resultadoExistente()!.mencion_excelencia || resultadoExistente()!.publicacion_recomendada) {
                <div class="seccion">
                  <h3>
                    <mat-icon>emoji_events</mat-icon>
                    Menciones Especiales
                  </h3>
                  <div class="menciones">
                    @if (resultadoExistente()!.mencion_honores) {
                      <mat-chip class="chip-mencion">
                        <mat-icon>military_tech</mat-icon>
                        Mención Honores
                      </mat-chip>
                    }
                    @if (resultadoExistente()!.mencion_excelencia) {
                      <mat-chip class="chip-mencion">
                        <mat-icon>workspace_premium</mat-icon>
                        Mención Excelencia
                      </mat-chip>
                    }
                    @if (resultadoExistente()!.publicacion_recomendada) {
                      <mat-chip class="chip-mencion">
                        <mat-icon>article</mat-icon>
                        Publicación Recomendada
                      </mat-chip>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Historial de estados -->
            @if (mostrarHistorial()) {
              <mat-divider></mat-divider>

              <div class="historial-section">
                <h3>
                  <mat-icon>history</mat-icon>
                  Historial de Estados
                </h3>
                
                @if (cargandoHistorial()) {
                  <mat-spinner diameter="30"></mat-spinner>
                } @else {
                  <div class="historial-timeline">
                    @for (cambio of historial(); track cambio.id) {
                      <div class="historial-item">
                        <div class="timeline-dot"></div>
                        <div class="historial-content">
                          <strong>{{ cambio.estado_nuevo }}</strong>
                          @if (cambio.estado_anterior) {
                            <span class="cambio">desde {{ cambio.estado_anterior }}</span>
                          }
                          <p>{{ formatearFecha(cambio.fecha_cambio) }}</p>
                          @if (cambio.motivo) {
                            <p class="motivo">{{ cambio.motivo }}</p>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }

            @if (puedeEditar) {
              <div class="acciones-resultado">
                <button mat-button (click)="toggleHistorial()">
                  <mat-icon>{{ mostrarHistorial() ? 'expand_less' : 'expand_more' }}</mat-icon>
                  {{ mostrarHistorial() ? 'Ocultar' : 'Ver' }} Historial
                </button>
              </div>
            }
          </div>
        } @else {
          <!-- Formulario para crear resultado -->
          @if (puedeEditar) {
            <mat-stepper linear #stepper>
              <!-- Paso 1: Estado y Evaluaciones -->
              <mat-step [stepControl]="paso1Form">
                <ng-template matStepLabel>Estado y Evaluaciones</ng-template>
                
                <form [formGroup]="paso1Form" class="step-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Estado Final del Proyecto</mat-label>
                    <mat-select formControlName="estado_final" required>
                      <mat-option value="aprobado">
                        <mat-icon>check_circle</mat-icon>
                        Aprobado
                      </mat-option>
                      <mat-option value="aprobado_con_distincion">
                        <mat-icon>stars</mat-icon>
                        Aprobado con Distinción
                      </mat-option>
                      <mat-option value="aprobado_con_observaciones">
                        <mat-icon>warning</mat-icon>
                        Aprobado con Observaciones
                      </mat-option>
                      <mat-option value="reprobado">
                        <mat-icon>cancel</mat-icon>
                        Reprobado
                      </mat-option>
                      <mat-option value="abandonado">
                        <mat-icon>exit_to_app</mat-icon>
                        Abandonado
                      </mat-option>
                      <mat-option value="anulado">
                        <mat-icon>block</mat-icon>
                        Anulado
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Evaluación Profesor Guía</mat-label>
                      <input matInput 
                             type="number" 
                             formControlName="evaluacion_profesor_guia"
                             min="1" 
                             max="7" 
                             step="0.1">
                      <mat-hint>Nota de 1.0 a 7.0</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Evaluación Profesor Informante</mat-label>
                      <input matInput 
                             type="number" 
                             formControlName="evaluacion_profesor_informante"
                             min="1" 
                             max="7" 
                             step="0.1">
                      <mat-hint>Nota de 1.0 a 7.0</mat-hint>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Evaluación Comisión</mat-label>
                      <input matInput 
                             type="number" 
                             formControlName="evaluacion_comision"
                             min="1" 
                             max="7" 
                             step="0.1">
                      <mat-hint>Nota de 1.0 a 7.0</mat-hint>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Fecha de Aprobación</mat-label>
                    <input matInput 
                           [matDatepicker]="picker" 
                           formControlName="fecha_aprobacion">
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-raised-button color="primary" matStepperNext>
                      Siguiente
                      <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Paso 2: Observaciones y Recomendaciones -->
              <mat-step [stepControl]="paso2Form">
                <ng-template matStepLabel>Observaciones y Recomendaciones</ng-template>
                
                <form [formGroup]="paso2Form" class="step-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Observaciones Finales</mat-label>
                    <textarea matInput 
                              formControlName="observaciones_finales"
                              rows="4"
                              placeholder="Comentarios generales sobre el trabajo..."></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Recomendaciones</mat-label>
                    <textarea matInput 
                              formControlName="recomendaciones"
                              rows="3"
                              placeholder="Sugerencias para el estudiante..."></textarea>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Áreas Destacadas</mat-label>
                    <textarea matInput 
                              formControlName="areas_destacadas"
                              rows="3"
                              placeholder="Aspectos sobresalientes del trabajo..."></textarea>
                  </mat-form-field>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon>
                      Anterior
                    </button>
                    <button mat-raised-button color="primary" matStepperNext>
                      Siguiente
                      <mat-icon>arrow_forward</mat-icon>
                    </button>
                  </div>
                </form>
              </mat-step>

              <!-- Paso 3: Menciones Especiales -->
              <mat-step>
                <ng-template matStepLabel>Menciones Especiales</ng-template>
                
                <form [formGroup]="paso3Form" class="step-form">
                  <div class="menciones-options">
                    <mat-checkbox formControlName="mencion_honores">
                      <div class="checkbox-content">
                        <mat-icon>military_tech</mat-icon>
                        <div>
                          <strong>Mención Honores</strong>
                          <p>Proyecto merece reconocimiento especial</p>
                        </div>
                      </div>
                    </mat-checkbox>

                    <mat-checkbox formControlName="mencion_excelencia">
                      <div class="checkbox-content">
                        <mat-icon>workspace_premium</mat-icon>
                        <div>
                          <strong>Mención Excelencia</strong>
                          <p>Calidad sobresaliente del trabajo</p>
                        </div>
                      </div>
                    </mat-checkbox>

                    <mat-checkbox formControlName="publicacion_recomendada">
                      <div class="checkbox-content">
                        <mat-icon>article</mat-icon>
                        <div>
                          <strong>Publicación Recomendada</strong>
                          <p>Se recomienda publicar en revista científica</p>
                        </div>
                      </div>
                    </mat-checkbox>
                  </div>

                  <div class="step-actions">
                    <button mat-button matStepperPrevious>
                      <mat-icon>arrow_back</mat-icon>
                      Anterior
                    </button>
                    <button mat-raised-button 
                            color="primary" 
                            (click)="guardarResultado()"
                            [disabled]="guardando()">
                      @if (guardando()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        <mat-icon>save</mat-icon>
                      }
                      Guardar Resultado Final
                    </button>
                  </div>
                </form>
              </mat-step>
            </mat-stepper>
          } @else {
            <div class="sin-permiso">
              <mat-icon>lock</mat-icon>
              <p>No tienes permisos para registrar el resultado final</p>
            </div>
          }
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .resultado-card {
      margin: 20px;
    }

    mat-card-header {
      margin-bottom: 20px;

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 24px;
      }
    }

    .loading-container, .sin-permiso {
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

      p {
        color: #666;
      }
    }

    .resultado-existente {
      .estado-principal {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        color: white;
        margin-bottom: 20px;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
        }

        h2 {
          margin: 0 0 5px 0;
          font-size: 28px;
        }

        .fecha {
          opacity: 0.9;
        }
      }

      .icon-estado-aprobado, .icon-estado-aprobado_con_distincion {
        color: #4CAF50;
      }

      .icon-estado-reprobado {
        color: #F44336;
      }
    }

    .detalles-resultado {
      padding: 20px 0;

      .seccion {
        margin-bottom: 30px;

        h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
        }

        p {
          margin: 0;
          line-height: 1.6;
          color: #555;
        }
      }
    }

    .evaluaciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;

      .evaluacion-item {
        padding: 15px;
        background: #f5f5f5;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
          font-weight: 500;
          color: #666;
        }

        .nota {
          font-size: 24px;
          font-weight: bold;
          color: #2196F3;
        }
      }
    }

    .menciones {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .chip-mencion {
        background: #FFD700 !important;
        color: #333 !important;
        font-weight: 500;

        mat-icon {
          color: #FF9800;
        }
      }
    }

    .historial-section {
      padding: 20px 0;

      h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
      }
    }

    .historial-timeline {
      position: relative;
      padding-left: 40px;

      &::before {
        content: '';
        position: absolute;
        left: 10px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: #e0e0e0;
      }

      .historial-item {
        position: relative;
        margin-bottom: 20px;

        .timeline-dot {
          position: absolute;
          left: -35px;
          top: 5px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #2196F3;
          border: 3px solid white;
          box-shadow: 0 0 0 2px #2196F3;
        }

        .historial-content {
          strong {
            display: block;
            color: #333;
            margin-bottom: 5px;
          }

          .cambio {
            color: #999;
            font-size: 13px;
            margin-left: 10px;
          }

          p {
            margin: 5px 0;
            font-size: 13px;
            color: #666;
          }

          .motivo {
            padding: 8px;
            background: #f5f5f5;
            border-radius: 4px;
            margin-top: 8px;
          }
        }
      }
    }

    .step-form {
      padding: 20px 0;

      .form-row {
        display: flex;
        gap: 20px;
      }

      .full-width {
        width: 100%;
      }

      .menciones-options {
        display: flex;
        flex-direction: column;
        gap: 20px;

        mat-checkbox {
          .checkbox-content {
            display: flex;
            align-items: center;
            gap: 15px;

            mat-icon {
              font-size: 40px;
              width: 40px;
              height: 40px;
              color: #FF9800;
            }

            strong {
              display: block;
              margin-bottom: 5px;
            }

            p {
              margin: 0;
              color: #666;
              font-size: 13px;
            }
          }
        }
      }
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      gap: 10px;
    }

    .acciones-resultado {
      margin-top: 20px;
      text-align: center;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }

      .estado-principal {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class ResultadoFinalComponent implements OnInit {
  @Input() proyectoId!: number;
  @Input() puedeEditar = false;

  private fb = inject(FormBuilder);
  private versionesService = inject(VersionesPlantillasService);
  private snackBar = inject(MatSnackBar);

  resultadoExistente = signal<ResultadoFinal | null>(null);
  historial = signal<HistorialEstado[]>([]);
  cargando = signal(true);
  cargandoHistorial = signal(false);
  guardando = signal(false);
  mostrarHistorial = signal(false);

  paso1Form: FormGroup;
  paso2Form: FormGroup;
  paso3Form: FormGroup;

  constructor() {
    this.paso1Form = this.fb.group({
      estado_final: ['', Validators.required],
      evaluacion_profesor_guia: [null, [Validators.min(1), Validators.max(7)]],
      evaluacion_profesor_informante: [null, [Validators.min(1), Validators.max(7)]],
      evaluacion_comision: [null, [Validators.min(1), Validators.max(7)]],
      fecha_aprobacion: [null]
    });

    this.paso2Form = this.fb.group({
      observaciones_finales: [''],
      recomendaciones: [''],
      areas_destacadas: ['']
    });

    this.paso3Form = this.fb.group({
      mencion_honores: [false],
      mencion_excelencia: [false],
      publicacion_recomendada: [false]
    });
  }

  ngOnInit() {
    this.cargarResultado();
  }

  cargarResultado() {
    this.cargando.set(true);
    this.versionesService.obtenerResultadoFinal(this.proyectoId).subscribe({
      next: (response) => {
        this.resultadoExistente.set(response.resultado);
        this.cargando.set(false);
      },
      error: () => {
        this.resultadoExistente.set(null);
        this.cargando.set(false);
      }
    });
  }

  toggleHistorial() {
    const mostrar = !this.mostrarHistorial();
    this.mostrarHistorial.set(mostrar);

    if (mostrar && this.historial().length === 0) {
      this.cargarHistorial();
    }
  }

  cargarHistorial() {
    this.cargandoHistorial.set(true);
    this.versionesService.obtenerHistorialEstados(this.proyectoId).subscribe({
      next: (response) => {
        this.historial.set(response.historial);
        this.cargandoHistorial.set(false);
      },
      error: (error) => {
        this.cargandoHistorial.set(false);
      }
    });
  }

  guardarResultado() {
    if (!this.paso1Form.valid) {
      this.snackBar.open('Completa los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.guardando.set(true);

    const datosResultado = {
      ...this.paso1Form.value,
      ...this.paso2Form.value,
      ...this.paso3Form.value
    };

    this.versionesService.crearResultadoFinal(this.proyectoId, datosResultado).subscribe({
      next: () => {
        this.snackBar.open('Resultado final registrado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarResultado();
        this.guardando.set(false);
      },
      error: (error) => {
        this.snackBar.open('Error al guardar resultado', 'Cerrar', { duration: 3000 });
        this.guardando.set(false);
      }
    });
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      aprobado: 'Aprobado',
      aprobado_con_distincion: 'Aprobado con Distinción',
      aprobado_con_observaciones: 'Aprobado con Observaciones',
      reprobado: 'Reprobado',
      abandonado: 'Abandonado',
      anulado: 'Anulado'
    };
    return labels[estado] || estado;
  }

  getIconoEstado(estado: string): string {
    const iconos: Record<string, string> = {
      aprobado: 'check_circle',
      aprobado_con_distincion: 'stars',
      aprobado_con_observaciones: 'warning',
      reprobado: 'cancel',
      abandonado: 'exit_to_app',
      anulado: 'block'
    };
    return iconos[estado] || 'info';
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
