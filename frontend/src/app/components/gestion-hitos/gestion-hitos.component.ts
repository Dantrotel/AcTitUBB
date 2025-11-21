import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { RevisionEntregaComponent } from '../revision-entrega/revision-entrega.component';
import { 
  Hito, 
  Entrega, 
  CreateHitoRequest, 
  UpdateHitoRequest,
  CreateEntregaRequest,
  RevisionEntregaRequest,
  validarHito,
  validarEntrega,
  HITO_CONSTRAINTS,
  ENTREGA_CONSTRAINTS 
} from '../../interfaces/hitos-entregas.interface';

@Component({
  selector: 'app-gestion-hitos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RevisionEntregaComponent],
  template: `
    <div class="gestion-hitos-container">
      <div class="header-section">
        <h2>Gestión de Hitos y Entregas</h2>
        <div class="filter-controls">
          <select [(ngModel)]="filtroEstado" (change)="filtrarHitos()" class="form-select">
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_progreso">En Progreso</option>
            <option value="completado">Completados</option>
            <option value="retrasado">Retrasados</option>
          </select>
          <select [(ngModel)]="filtroTipo" (change)="filtrarHitos()" class="form-select">
            <option value="">Todos los tipos</option>
            <option value="entregable">Entregables</option>
            <option value="revision">Revisiones</option>
            <option value="presentacion">Presentaciones</option>
            <option value="evaluacion">Evaluaciones</option>
          </select>
        </div>
        <button 
          *ngIf="puedeCrearHitos()" 
          (click)="abrirModalCrearHito()" 
          class="btn btn-primary">
          <i class="fas fa-plus"></i> Nuevo Hito
        </button>
      </div>

      <!-- Lista de Hitos -->
      <div class="hitos-grid">
        <div *ngFor="let hito of hitosFiltrados" class="hito-card" [class.retrasado]="esHitoRetrasado(hito)">
          <div class="hito-header">
            <div class="hito-info">
              <h3>{{ hito.nombre }}</h3>
              <span class="hito-tipo badge" [class]="'badge-' + hito.tipo_hito">{{ hito.tipo_hito }}</span>
              <span class="hito-estado badge" [class]="'badge-' + hito.estado">{{ hito.estado }}</span>
              <span class="hito-prioridad badge" [class]="'badge-prioridad-' + hito.prioridad">{{ hito.prioridad }}</span>
            </div>
            <div class="hito-actions" *ngIf="puedeEditarHito(hito)">
              <button (click)="editarHito(hito)" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-edit"></i>
              </button>
              <button (click)="eliminarHito(hito)" class="btn btn-sm btn-outline-danger">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="hito-details">
            <p class="hito-descripcion">{{ hito.descripcion }}</p>
            <div class="hito-fechas">
              <div class="fecha-item">
                <i class="fas fa-calendar-start"></i>
                <span>Inicio: {{ hito.fecha_inicio ? formatearFecha(hito.fecha_inicio) : 'No definido' }}</span>
              </div>
              <div class="fecha-item">
                <i class="fas fa-calendar-times"></i>
                <span>Límite: {{ formatearFecha(hito.fecha_limite) }}</span>
              </div>
            </div>
            <div class="hito-meta">
              <span class="peso">Peso: {{ hito.peso_porcentual }}%</span>
              <span class="obligatorio" *ngIf="hito.obligatorio">
                <i class="fas fa-exclamation-circle"></i> Obligatorio
              </span>
            </div>
          </div>

          <!-- Sección de Entregas -->
          <div class="entregas-section" *ngIf="hito.acepta_entregas">
            <div class="entregas-header">
              <h4>Entregas ({{ obtenerEntregasHito(hito.id.toString()).length }}/{{ obtenerMaxEntregas(hito) }})</h4>
              <button 
                *ngIf="puedeSubirEntrega(hito)" 
                (click)="abrirModalSubirEntrega(hito)" 
                class="btn btn-sm btn-success">
                <i class="fas fa-upload"></i> Subir Entrega
              </button>
            </div>

            <div class="entregas-list">
              <div *ngFor="let entrega of obtenerEntregasHito(hito.id.toString())" class="entrega-item">
                <div class="entrega-info">
                  <div class="entrega-archivo">
                    <i class="fas fa-file"></i>
                    <span>{{ entrega.archivo_nombre }}</span>
                    <small class="texto-muted">v{{ entrega.version }}</small>
                  </div>
                  <div class="entrega-meta">
                    <span class="entrega-fecha">{{ formatearFecha(entrega.fecha_entrega) }}</span>
                    <span class="entrega-estado badge" [class]="'badge-' + entrega.estado">{{ entrega.estado }}</span>
                    <span *ngIf="entrega.calificacion" class="calificacion">{{ entrega.calificacion }}/100</span>
                  </div>
                </div>
                <div class="entrega-actions">
                  <button (click)="descargarEntrega(entrega)" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-download"></i>
                  </button>
                  <button 
                    *ngIf="puedeRevisarEntrega(entrega)" 
                    (click)="abrirModalRevisarEntrega(entrega)" 
                    class="btn btn-sm btn-outline-warning">
                    <i class="fas fa-eye"></i> Revisar
                  </button>
                  <button 
                    *ngIf="puedeEliminarEntrega(entrega)" 
                    (click)="eliminarEntrega(entrega)" 
                    class="btn btn-sm btn-outline-danger">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <div *ngIf="entrega.retroalimentacion" class="entrega-retroalimentacion">
                  <h5>Retroalimentación:</h5>
                  <p>{{ entrega.retroalimentacion }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Crear/Editar Hito -->
      <div class="modal" [class.show]="mostrarModalHito" *ngIf="mostrarModalHito">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ hitoEditando ? 'Editar Hito' : 'Crear Nuevo Hito' }}</h5>
              <button (click)="cerrarModalHito()" class="btn-close"></button>
            </div>
            <form [formGroup]="formHito" (ngSubmit)="guardarHito()">
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-6">
                    <label class="form-label">Nombre del Hito *</label>
                    <input type="text" formControlName="nombre_hito" class="form-control" 
                           [class.is-invalid]="formHito.get('nombre_hito')?.invalid && formHito.get('nombre_hito')?.touched"
                           placeholder="Ej: Entrega Capítulo 1">
                    <div class="invalid-feedback" *ngIf="formHito.get('nombre_hito')?.invalid && formHito.get('nombre_hito')?.touched">
                      El nombre es requerido (3-100 caracteres)
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Tipo de Hito *</label>
                    <select formControlName="tipo_hito" class="form-select" 
                            [class.is-invalid]="formHito.get('tipo_hito')?.invalid && formHito.get('tipo_hito')?.touched">
                      <option value="">Seleccionar tipo</option>
                      <option value="entrega_documento">📄 Entrega de Documento</option>
                      <option value="revision_avance">🔍 Revisión de Avance</option>
                      <option value="reunion_seguimiento">👥 Reunión de Seguimiento</option>
                      <option value="evaluacion">📊 Evaluación</option>
                      <option value="defensa">🎤 Defensa/Presentación</option>
                    </select>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Descripción</label>
                  <textarea formControlName="descripcion" class="form-control" rows="3" 
                            [class.is-invalid]="formHito.get('descripcion')?.invalid && formHito.get('descripcion')?.touched"></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label">Fecha Límite de Entrega *</label>
                  <input type="datetime-local" formControlName="fecha_limite" class="form-control" 
                         [class.is-invalid]="formHito.get('fecha_limite')?.invalid && formHito.get('fecha_limite')?.touched">
                  <div class="form-text">Fecha y hora máxima para entregar este hito</div>
                </div>

                <div class="row">
                  <div class="col-md-6">
                    <label class="form-label">
                      Peso en el Proyecto * 
                      <i class="fas fa-info-circle text-info ms-1" 
                         title="Importancia del hito en el proyecto (0-100%). La suma de todos los hitos debe ser 100%"></i>
                    </label>
                    <div class="input-group">
                      <input type="number" formControlName="peso_en_proyecto" class="form-control" 
                             min="0" max="100" step="0.5" placeholder="25"
                             [class.is-invalid]="formHito.get('peso_en_proyecto')?.invalid && formHito.get('peso_en_proyecto')?.touched">
                      <span class="input-group-text">%</span>
                    </div>
                    <div class="form-text">Peso asignado a este hito del total del proyecto</div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Depende de (Opcional)</label>
                    <select formControlName="hito_predecesor_id" class="form-select">
                      <option [value]="null">Sin dependencia</option>
                      <option *ngFor="let h of hitos" [value]="h.id">
                        {{ h.nombre_hito }}
                      </option>
                    </select>
                    <div class="form-text">Hito que debe completarse antes de este</div>
                  </div>
                </div>

                <div class="row mt-3">
                  <div class="col-md-12">
                    <div class="form-check">
                      <input type="checkbox" formControlName="es_critico" class="form-check-input" id="checkCritico">
                      <label class="form-check-label" for="checkCritico">
                        <i class="fas fa-exclamation-triangle text-danger me-2"></i>
                        <strong>Hito Crítico/Obligatorio</strong>
                      </label>
                    </div>
                    <small class="form-text text-muted d-block mt-1">
                      Los hitos críticos son obligatorios para aprobar el proyecto. 
                      Se resaltan con badge rojo y generan alertas automáticas.
                    </small>
                  </div>
                </div>

                <div class="alert alert-danger" *ngIf="erroresValidacion.length > 0">
                  <ul class="mb-0">
                    <li *ngFor="let error of erroresValidacion">{{ error }}</li>
                  </ul>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" (click)="cerrarModalHito()" class="btn btn-secondary">Cancelar</button>
                <button type="submit" [disabled]="formHito.invalid || guardandoHito" class="btn btn-primary">
                  <span *ngIf="guardandoHito" class="spinner-border spinner-border-sm me-2"></span>
                  {{ hitoEditando ? 'Actualizar' : 'Crear' }} Hito
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Modal Subir Entrega -->
      <div class="modal" [class.show]="mostrarModalEntrega" *ngIf="mostrarModalEntrega">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Subir Entrega - {{ hitoSeleccionado?.nombre }}</h5>
              <button (click)="cerrarModalEntrega()" class="btn-close"></button>
            </div>
            <form (ngSubmit)="subirEntrega()">
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Archivo *</label>
                  <input type="file" (change)="seleccionarArchivo($event)" class="form-control" 
                         accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.png" required>
                  <div class="form-text">
                    Formatos permitidos: PDF, DOC, DOCX, ZIP, RAR, TXT, JPG, PNG (Máx. 50MB)
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label">Comentarios</label>
                  <textarea [(ngModel)]="comentariosEntrega" name="comentarios" class="form-control" 
                            rows="3" maxlength="1000"></textarea>
                  <div class="form-text">{{ comentariosEntrega.length }}/1000 caracteres</div>
                </div>

                <div class="form-check">
                  <input type="checkbox" [(ngModel)]="esEntregaFinal" name="final" class="form-check-input">
                  <label class="form-check-label">Marcar como entrega final</label>
                </div>

                <div class="alert alert-danger" *ngIf="erroresEntrega.length > 0">
                  <ul class="mb-0">
                    <li *ngFor="let error of erroresEntrega">{{ error }}</li>
                  </ul>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" (click)="cerrarModalEntrega()" class="btn btn-secondary">Cancelar</button>
                <button type="submit" [disabled]="!archivoSeleccionado || subiendoEntrega" class="btn btn-primary">
                  <span *ngIf="subiendoEntrega" class="spinner-border spinner-border-sm me-2"></span>
                  Subir Entrega
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Componente de Revisión de Entregas -->
      <app-revision-entrega
        [entrega]="entregaParaRevisar"
        [mostrarModal]="mostrarModalRevision"
        (modalCerrado)="cerrarModalRevision()"
        (revisionGuardada)="onRevisionGuardada()">
      </app-revision-entrega>
    </div>
  `,
  styleUrl: './gestion-hitos.component.scss'
})
export class GestionHitosComponent implements OnInit {
  @Input() projectId!: string;
  @Input() cronogramaId!: string;
  @Input() userRole!: string; // '1' = estudiante, '2' = profesor, '3' = admin
  @Input() userRut!: string;
  @Output() hitosActualizados = new EventEmitter<void>();

  hitos: Hito[] = [];
  hitosFiltrados: Hito[] = [];
  entregas: { [hitoId: string]: Entrega[] } = {};
  
  filtroEstado = '';
  filtroTipo = '';
  
  mostrarModalHito = false;
  mostrarModalEntrega = false;
  mostrarModalRevision = false;
  hitoEditando: Hito | null = null;
  hitoSeleccionado: Hito | null = null;
  entregaParaRevisar: Entrega | null = null;
  
  formHito: FormGroup;
  erroresValidacion: string[] = [];
  guardandoHito = false;
  
  archivoSeleccionado: File | null = null;
  comentariosEntrega = '';
  esEntregaFinal = false;
  erroresEntrega: string[] = [];
  subiendoEntrega = false;

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {
    this.formHito = this.fb.group({
      nombre_hito: ['', [Validators.required, Validators.minLength(HITO_CONSTRAINTS.NOMBRE_MIN_LENGTH), Validators.maxLength(HITO_CONSTRAINTS.NOMBRE_MAX_LENGTH)]],
      descripcion: ['', [Validators.maxLength(HITO_CONSTRAINTS.DESCRIPCION_MAX_LENGTH)]],
      fecha_limite: ['', [Validators.required]],
      peso_en_proyecto: [0, [Validators.required, Validators.min(HITO_CONSTRAINTS.PESO_MIN), Validators.max(HITO_CONSTRAINTS.PESO_MAX)]],
      tipo_hito: ['', [Validators.required]],
      es_critico: [false],
      hito_predecesor_id: [null]
    });
  }

  ngOnInit() {
    this.cargarHitos();
  }

  // Carga inicial de datos (Sistema Unificado ✅)
  cargarHitos() {
    this.apiService.getHitosCronograma(this.cronogramaId).subscribe({
      next: (response: any) => {
        // Normalizar hitos del backend para compatibilidad
        this.hitos = (response.data || []).map((h: any) => this.apiService.normalizarHito(h));
        this.filtrarHitos();
        this.cargarEntregasParaTodosLosHitos();
      },
      error: (error: any) => {
        console.error('Error al cargar hitos:', error);
        this.mostrarError('No se pudieron cargar los hitos del proyecto');
      }
    });
  }

  mostrarError(mensaje: string) {
    // Implementación simple - podrías usar un servicio de toast/notificaciones
    alert(mensaje);
  }

  cargarEntregasParaTodosLosHitos() {
    this.hitos.forEach(hito => {
      if (hito.acepta_entregas) {
        this.cargarEntregasHito(hito.id.toString());
      }
    });
  }

  cargarEntregasHito(hitoId: string) {
    this.apiService.obtenerEntregasHito(this.projectId, this.cronogramaId, hitoId).subscribe({
      next: (response: any) => {
        this.entregas[hitoId] = response.data || [];
      },
      error: (error: any) => {
        console.error(`Error al cargar entregas del hito ${hitoId}:`, error);
      }
    });
  }

  // Métodos de filtrado
  filtrarHitos() {
    this.hitosFiltrados = this.hitos.filter(hito => {
      const cumpleFiltroEstado = !this.filtroEstado || hito.estado === this.filtroEstado;
      const cumpleFiltroTipo = !this.filtroTipo || hito.tipo_hito === this.filtroTipo;
      return cumpleFiltroEstado && cumpleFiltroTipo;
    });
  }

  // Métodos de permisos
  puedeCrearHitos(): boolean {
    return this.userRole === '2' || this.userRole === '3'; // Solo profesores y admins
  }

  puedeEditarHito(hito: Hito): boolean {
    return (this.userRole === '2' || this.userRole === '3') && hito.estado !== 'aprobado';
  }

  puedeSubirEntrega(hito: Hito): boolean {
    if (!hito.acepta_entregas || this.userRole !== '1') return false; // Solo estudiantes
    
    const entregasHito = this.obtenerEntregasHito(hito.id.toString());
    const entregasEstudiante = entregasHito.filter(e => e.estudiante_rut === this.userRut);
    const maxEntregas = this.obtenerMaxEntregas(hito);
    
    return entregasEstudiante.length < maxEntregas && 
           new Date() <= new Date(hito.fecha_limite);
  }

  puedeRevisarEntrega(entrega: Entrega): boolean {
    return (this.userRole === '2' || this.userRole === '3') && entrega.estado === 'entregado';
  }

  puedeEliminarEntrega(entrega: Entrega): boolean {
    return entrega.estudiante_rut === this.userRut && entrega.estado === 'entregado';
  }

  // Métodos auxiliares
  obtenerEntregasHito(hitoId: string): Entrega[] {
    return this.entregas[hitoId] || [];
  }

  obtenerMaxEntregas(hito: Hito): number {
    // Por defecto permitir 3 entregas si no está definido
    return 3;
  }

  esHitoRetrasado(hito: Hito): boolean {
    return new Date() > new Date(hito.fecha_limite) && hito.estado !== 'aprobado' && hito.estado !== 'entregado';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Gestión de hitos
  abrirModalCrearHito() {
    this.hitoEditando = null;
    this.formHito.reset({
      peso_en_proyecto: 0,
      es_critico: false,
      hito_predecesor_id: null
    });
    this.erroresValidacion = [];
    this.mostrarModalHito = true;
  }

  editarHito(hito: Hito) {
    this.hitoEditando = hito;
    this.formHito.patchValue({
      nombre_hito: hito.nombre_hito,
      descripcion: hito.descripcion,
      fecha_limite: this.formatearFechaParaInput(hito.fecha_limite),
      peso_en_proyecto: hito.peso_en_proyecto,
      tipo_hito: hito.tipo_hito,
      es_critico: hito.es_critico,
      hito_predecesor_id: hito.hito_predecesor_id
    });
    this.erroresValidacion = [];
    this.mostrarModalHito = true;
  }

  formatearFechaParaInput(fecha: string): string {
    return new Date(fecha).toISOString().slice(0, 16);
  }

  guardarHito() {
    if (this.formHito.invalid) return;

    const datosHito = this.formHito.value;
    this.erroresValidacion = validarHito(datosHito);
    
    if (this.erroresValidacion.length > 0) return;

    this.guardandoHito = true;

    const observable = this.hitoEditando
      ? this.apiService.actualizarHitoCronograma(this.cronogramaId, this.hitoEditando.id.toString(), datosHito)
      : this.apiService.crearHitoCronograma(this.cronogramaId, datosHito);

    observable.subscribe({
      next: () => {
        this.cerrarModalHito();
        this.cargarHitos();
        this.hitosActualizados.emit();
      },
      error: (error) => {
        console.error('Error al guardar hito:', error);
        this.erroresValidacion = ['Error al guardar el hito. Intente nuevamente.'];
      },
      complete: () => {
        this.guardandoHito = false;
      }
    });
  }

  cerrarModalHito() {
    this.mostrarModalHito = false;
    this.hitoEditando = null;
    this.erroresValidacion = [];
  }

  eliminarHito(hito: Hito) {
    if (!confirm(`¿Está seguro de eliminar el hito "${hito.nombre}"?`)) return;

    this.apiService.eliminarHitoCronograma(this.cronogramaId, hito.id.toString()).subscribe({
      next: () => {
        this.cargarHitos();
        this.hitosActualizados.emit();
      },
      error: (error) => {
        console.error('Error al eliminar hito:', error);
        alert('Error al eliminar el hito');
      }
    });
  }

  // Gestión de entregas
  abrirModalSubirEntrega(hito: Hito) {
    this.hitoSeleccionado = hito;
    this.archivoSeleccionado = null;
    this.comentariosEntrega = '';
    this.esEntregaFinal = false;
    this.erroresEntrega = [];
    this.mostrarModalEntrega = true;
  }

  seleccionarArchivo(event: any) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    this.erroresEntrega = validarEntrega(archivo, this.comentariosEntrega);
    if (this.erroresEntrega.length === 0) {
      this.archivoSeleccionado = archivo;
    }
  }

  subirEntrega() {
    if (!this.archivoSeleccionado || !this.hitoSeleccionado) return;

    this.erroresEntrega = validarEntrega(this.archivoSeleccionado, this.comentariosEntrega);
    if (this.erroresEntrega.length > 0) return;

    this.subiendoEntrega = true;

    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    formData.append('comentarios', this.comentariosEntrega);
    formData.append('es_entrega_final', this.esEntregaFinal.toString());

    this.apiService.crearEntregaHito(
      this.projectId, 
      this.cronogramaId, 
      this.hitoSeleccionado.id.toString(), 
      formData
    ).subscribe({
      next: () => {
        this.cerrarModalEntrega();
        this.cargarEntregasHito(this.hitoSeleccionado!.id.toString());
      },
      error: (error) => {
        console.error('Error al subir entrega:', error);
        this.erroresEntrega = ['Error al subir la entrega. Intente nuevamente.'];
      },
      complete: () => {
        this.subiendoEntrega = false;
      }
    });
  }

  cerrarModalEntrega() {
    this.mostrarModalEntrega = false;
    this.hitoSeleccionado = null;
    this.archivoSeleccionado = null;
    this.erroresEntrega = [];
  }

  descargarEntrega(entrega: Entrega) {
    window.open(entrega.archivo_url, '_blank');
  }

  eliminarEntrega(entrega: Entrega) {
    if (!confirm('¿Está seguro de eliminar esta entrega?')) return;

    this.apiService.eliminarEntregaHito(
      this.projectId, 
      this.cronogramaId, 
      entrega.hito_id, 
      entrega.id
    ).subscribe({
      next: () => {
        this.cargarEntregasHito(entrega.hito_id);
      },
      error: (error) => {
        console.error('Error al eliminar entrega:', error);
        alert('Error al eliminar la entrega');
      }
    });
  }

  abrirModalRevisarEntrega(entrega: Entrega) {
    this.entregaParaRevisar = entrega;
    this.mostrarModalRevision = true;
  }

  cerrarModalRevision() {
    this.mostrarModalRevision = false;
    this.entregaParaRevisar = null;
  }

  onRevisionGuardada() {
    if (this.entregaParaRevisar) {
      this.cargarEntregasHito(this.entregaParaRevisar.hito_id);
    }
  }
}