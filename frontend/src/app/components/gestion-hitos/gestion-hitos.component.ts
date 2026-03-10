import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api';
import { NotificationService } from '../../services/notification.service';
import {
  Hito,
  Entrega,
  CreateHitoRequest,
  UpdateHitoRequest,
  CreateEntregaRequest,
  validarHito,
  validarEntrega,
  HITO_CONSTRAINTS,
  ENTREGA_CONSTRAINTS
} from '../../interfaces/hitos-entregas.interface';

@Component({
  selector: 'app-gestion-hitos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="gestion-hitos-container">

      <!-- ── Header ─────────────────────────────────────────── -->
      <div class="gh-header">
        <h2 class="gh-title"><i class="fas fa-flag-checkered"></i> Hitos y Entregas</h2>
        <div class="gh-header-right">
          <div class="gh-filters">
            <select [(ngModel)]="filtroEstado" (change)="filtrarHitos()" class="gh-select">
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="en_progreso">En Progreso</option>
              <option value="aprobado">Aprobados</option>
              <option value="retrasado">Retrasados</option>
            </select>
            <select [(ngModel)]="filtroTipo" (change)="filtrarHitos()" class="gh-select">
              <option value="">Todos los tipos</option>
              <option value="entregable">Entregables</option>
              <option value="revision">Revisiones</option>
              <option value="presentacion">Presentaciones</option>
            </select>
          </div>
          <button *ngIf="puedeCrearHitos()" (click)="abrirModalCrearHito()" class="gh-btn-primary">
            <i class="fas fa-plus"></i> Nuevo Hito
          </button>
        </div>
      </div>

      <!-- ── Empty state ──────────────────────────────────── -->
      <div class="gh-empty" *ngIf="hitosFiltrados.length === 0">
        <i class="fas fa-flag"></i>
        <p>No hay hitos registrados para este proyecto</p>
      </div>

      <!-- ── Hitos list ──────────────────────────────────── -->
      <div class="gh-list">
        <div *ngFor="let hito of hitosFiltrados"
             class="hito-card"
             [class.hito-card--pendiente]="hito.estado === 'pendiente'"
             [class.hito-card--en-progreso]="hito.estado === 'en_progreso'"
             [class.hito-card--aprobado]="hito.estado === 'aprobado'"
             [class.hito-card--retrasado]="esHitoRetrasado(hito)">

          <!-- Card header -->
          <div class="hito-card-header">
            <div [class]="'hito-icon-wrap hito-icon-' + hito.tipo_hito">
              <i class="fas fa-file-alt"       *ngIf="hito.tipo_hito === 'entrega_documento'"></i>
              <i class="fas fa-search"         *ngIf="hito.tipo_hito === 'revision_avance'"></i>
              <i class="fas fa-users"          *ngIf="hito.tipo_hito === 'reunion_seguimiento'"></i>
              <i class="fas fa-microphone"     *ngIf="hito.tipo_hito === 'defensa'"></i>
              <i class="fas fa-flag-checkered" *ngIf="hito.tipo_hito === 'entrega_final'"></i>
              <i class="fas fa-flag"           *ngIf="!['entrega_documento','revision_avance','reunion_seguimiento','defensa','entrega_final'].includes(hito.tipo_hito)"></i>
            </div>

            <div class="hito-card-body">
              <div class="hito-card-top">
                <span class="hito-nombre">{{ hito.nombre }}</span>
                <div class="hito-badges">
                  <span [ngClass]="['hito-badge', 'hito-badge-estado-' + hito.estado]">{{ hito.estado }}</span>
                  <span [ngClass]="['hito-badge', 'hito-badge-tipo-' + hito.tipo_hito]">{{ hito.tipo_hito }}</span>
                  <span [ngClass]="['hito-badge', 'hito-badge-prioridad-' + hito.prioridad]" *ngIf="hito.prioridad">{{ hito.prioridad }}</span>
                  <span class="hito-badge hito-badge-critico" *ngIf="hito.obligatorio">
                    <i class="fas fa-exclamation-triangle"></i> Crítico
                  </span>
                </div>
              </div>
              <p class="hito-descripcion" *ngIf="hito.descripcion">{{ hito.descripcion }}</p>
              <div class="hito-meta">
                <span class="hito-meta-item" *ngIf="hito.fecha_inicio">
                  <i class="fas fa-calendar-plus"></i> Inicio: {{ formatearFecha(hito.fecha_inicio) }}
                </span>
                <span class="hito-meta-item" [class.hito-meta-item--vencido]="esHitoRetrasado(hito)">
                  <i class="fas fa-calendar-times"></i> Límite: {{ formatearFecha(hito.fecha_limite) }}
                </span>
                <span class="hito-meta-item">
                  <i class="fas fa-weight-hanging"></i> Peso: {{ hito.peso_porcentual }}%
                </span>
              </div>
            </div>

            <div class="hito-card-actions" *ngIf="puedeEditarHito(hito)">
              <button (click)="editarHito(hito)" class="gh-icon-btn gh-icon-btn--edit" title="Editar">
                <i class="fas fa-pencil-alt"></i>
              </button>
              <button (click)="eliminarHito(hito)" class="gh-icon-btn gh-icon-btn--delete" title="Eliminar">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>

          <!-- Entregas sub-section -->
          <div class="hito-entregas" *ngIf="hito.acepta_entregas">
            <div class="hito-entregas-header">
              <span class="hito-entregas-count">
                <i class="fas fa-paperclip"></i>
                Entregas
                <span class="count-badge">{{ obtenerEntregasHito(hito.id.toString()).length }}/{{ obtenerMaxEntregas(hito) }}</span>
              </span>
              <button *ngIf="puedeSubirEntrega(hito)" (click)="abrirModalSubirEntrega(hito)" class="gh-btn-upload">
                <i class="fas fa-upload"></i> Subir entrega
              </button>
            </div>

            <div class="hito-entregas-body" *ngIf="obtenerEntregasHito(hito.id.toString()).length > 0">
              <div *ngFor="let entrega of obtenerEntregasHito(hito.id.toString())" class="entrega-row">
                <div class="entrega-row-main">
                  <div class="entrega-file-icon"><i class="fas fa-file-alt"></i></div>
                  <div class="entrega-info">
                    <span class="entrega-nombre">{{ entrega.archivo_nombre }}</span>
                    <div class="entrega-meta">
                      <span class="entrega-version">v{{ entrega.version }}</span>
                      <span class="entrega-fecha">{{ formatearFecha(entrega.fecha_entrega) }}</span>
                      <span [ngClass]="['hito-badge', 'hito-badge-estado-' + entrega.estado]">{{ entrega.estado }}</span>
                    </div>
                  </div>
                  <div class="entrega-actions">
                    <button (click)="descargarEntrega(entrega)" class="gh-icon-btn gh-icon-btn--download" title="Descargar">
                      <i class="fas fa-download"></i>
                    </button>
                    <button *ngIf="puedeEliminarEntrega(entrega)" (click)="eliminarEntrega(entrega)"
                            class="gh-icon-btn gh-icon-btn--delete" title="Eliminar">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
                <div class="entrega-retroalimentacion" *ngIf="entrega.retroalimentacion">
                  <i class="fas fa-comment-dots"></i>
                  <span>{{ entrega.retroalimentacion }}</span>
                </div>
              </div>
            </div>

            <div class="hito-sin-entregas" *ngIf="obtenerEntregasHito(hito.id.toString()).length === 0">
              <i class="fas fa-inbox"></i> Aún no hay entregas para este hito
            </div>
          </div>
        </div>
      </div>

      <!-- ── Modal Crear/Editar Hito ───────────────────── -->
      <div class="gh-modal-overlay" *ngIf="mostrarModalHito" (click)="cerrarModalHito()">
        <div class="gh-modal gh-modal--lg" (click)="$event.stopPropagation()">
          <div class="gh-modal-header">
            <h3><i class="fas fa-flag"></i> {{ hitoEditando ? 'Editar Hito' : 'Crear Nuevo Hito' }}</h3>
            <button (click)="cerrarModalHito()" class="gh-modal-close"><i class="fas fa-times"></i></button>
          </div>
          <form [formGroup]="formHito" (ngSubmit)="guardarHito()">
            <div class="gh-modal-body">
              <div class="gh-form-row">
                <div class="gh-form-group">
                  <label class="gh-label">Nombre del Hito <span class="gh-req">*</span></label>
                  <input type="text" formControlName="nombre_hito" class="gh-input"
                         [class.gh-input--invalid]="formHito.get('nombre_hito')?.invalid && formHito.get('nombre_hito')?.touched"
                         placeholder="Ej: Entrega Capítulo 1">
                  <span class="gh-error-msg" *ngIf="formHito.get('nombre_hito')?.invalid && formHito.get('nombre_hito')?.touched">
                    El nombre es requerido (3-100 caracteres)
                  </span>
                </div>
                <div class="gh-form-group">
                  <label class="gh-label">Tipo de Hito <span class="gh-req">*</span></label>
                  <select formControlName="tipo_hito" class="gh-input"
                          [class.gh-input--invalid]="formHito.get('tipo_hito')?.invalid && formHito.get('tipo_hito')?.touched">
                    <option value="">Seleccionar tipo</option>
                    <option value="entrega_documento">📄 Entrega de Documento</option>
                    <option value="revision_avance">🔍 Revisión de Avance</option>
                    <option value="reunion_seguimiento">👥 Reunión de Seguimiento</option>
                    <option value="defensa">🎤 Defensa/Presentación</option>
                    <option value="entrega_final">🏁 Entrega Final (activa revisión de informante)</option>
                  </select>
                </div>
              </div>

              <div class="gh-form-group">
                <label class="gh-label">Descripción</label>
                <textarea formControlName="descripcion" class="gh-input gh-textarea" rows="3"
                          [class.gh-input--invalid]="formHito.get('descripcion')?.invalid && formHito.get('descripcion')?.touched"></textarea>
              </div>

              <div class="gh-form-group">
                <label class="gh-label">Fecha Límite de Entrega <span class="gh-req">*</span></label>
                <input type="datetime-local" formControlName="fecha_limite" class="gh-input"
                       [class.gh-input--invalid]="formHito.get('fecha_limite')?.invalid && formHito.get('fecha_limite')?.touched">
                <span class="gh-hint">Fecha y hora máxima para entregar este hito</span>
              </div>

              <div class="gh-form-row">
                <div class="gh-form-group">
                  <label class="gh-label">Peso en el Proyecto <span class="gh-req">*</span></label>
                  <div class="gh-input-group">
                    <input type="number" formControlName="peso_en_proyecto" class="gh-input"
                           min="0" max="100" step="0.5" placeholder="25"
                           [class.gh-input--invalid]="formHito.get('peso_en_proyecto')?.invalid && formHito.get('peso_en_proyecto')?.touched">
                    <span class="gh-input-addon">%</span>
                  </div>
                  <span class="gh-hint">Importancia relativa del hito (0–100%)</span>
                </div>
                <div class="gh-form-group">
                  <label class="gh-label">Depende de (Opcional)</label>
                  <select formControlName="hito_predecesor_id" class="gh-input">
                    <option [value]="null">Sin dependencia</option>
                    <option *ngFor="let h of hitos" [value]="h.id">{{ h.nombre_hito }}</option>
                  </select>
                  <span class="gh-hint">Hito que debe completarse antes de este</span>
                </div>
              </div>

              <div class="gh-check-row">
                <label class="gh-check-label">
                  <input type="checkbox" formControlName="es_critico" class="gh-check-input" id="checkCritico">
                  <span>
                    <strong><i class="fas fa-exclamation-triangle"></i> Hito Crítico / Obligatorio</strong>
                    <small>Los hitos críticos son obligatorios para aprobar el proyecto y generan alertas automáticas.</small>
                  </span>
                </label>
              </div>

              <div class="gh-alert gh-alert--danger" *ngIf="erroresValidacion.length > 0">
                <ul><li *ngFor="let error of erroresValidacion">{{ error }}</li></ul>
              </div>
            </div>
            <div class="gh-modal-footer">
              <button type="button" (click)="cerrarModalHito()" class="gh-btn-secondary">Cancelar</button>
              <button type="submit" [disabled]="formHito.invalid || guardandoHito" class="gh-btn-primary">
                <i class="fas fa-spinner fa-spin" *ngIf="guardandoHito"></i>
                {{ hitoEditando ? 'Actualizar' : 'Crear' }} Hito
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ── Modal Subir Entrega ────────────────────────── -->
      <div class="gh-modal-overlay" *ngIf="mostrarModalEntrega" (click)="cerrarModalEntrega()">
        <div class="gh-modal" (click)="$event.stopPropagation()">
          <div class="gh-modal-header">
            <h3><i class="fas fa-upload"></i> Subir Entrega</h3>
            <button (click)="cerrarModalEntrega()" class="gh-modal-close"><i class="fas fa-times"></i></button>
          </div>
          <form (ngSubmit)="subirEntrega()">
            <div class="gh-modal-body">
              <div class="gh-hito-ref" *ngIf="hitoSeleccionado">
                <i class="fas fa-flag"></i> {{ hitoSeleccionado.nombre }}
              </div>
              <div class="gh-form-group">
                <label class="gh-label">Archivo <span class="gh-req">*</span></label>
                <input type="file" (change)="seleccionarArchivo($event)" class="gh-input gh-input-file"
                       accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar" required>
                <span class="gh-hint">PDF, DOC, DOCX, PPT, PPTX, ZIP, RAR — Máx. 10 MB</span>
              </div>
              <div class="gh-form-group">
                <label class="gh-label">Comentarios</label>
                <textarea [(ngModel)]="comentariosEntrega" name="comentarios"
                          class="gh-input gh-textarea" rows="3" maxlength="1000"></textarea>
                <span class="gh-hint">{{ comentariosEntrega.length }}/1000 caracteres</span>
              </div>
              <label class="gh-check-label">
                <input type="checkbox" [(ngModel)]="esEntregaFinal" name="final" class="gh-check-input">
                <span><strong>Marcar como entrega final</strong></span>
              </label>
              <div class="gh-alert gh-alert--danger" *ngIf="erroresEntrega.length > 0">
                <ul><li *ngFor="let error of erroresEntrega">{{ error }}</li></ul>
              </div>
            </div>
            <div class="gh-modal-footer">
              <button type="button" (click)="cerrarModalEntrega()" class="gh-btn-secondary">Cancelar</button>
              <button type="submit" [disabled]="!archivoSeleccionado || subiendoEntrega" class="gh-btn-primary">
                <i class="fas fa-spinner fa-spin" *ngIf="subiendoEntrega"></i>
                Subir Entrega
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styleUrl: './gestion-hitos.component.scss'
})
export class GestionHitosComponent implements OnInit, OnChanges {
  @Input() projectId!: string;
  @Input() cronogramaId!: string;
  @Input() userRole!: string; // '1' = estudiante, '2' = profesor, '3' = admin
  @Input() userRut!: string;
  @Output() hitosActualizados = new EventEmitter<void>();

  hitos: any[] = [];
  hitosFiltrados: any[] = [];
  entregas: { [hitoId: string]: Entrega[] } = {};
  
  filtroEstado = '';
  filtroTipo = '';
  
  mostrarModalHito = false;
  mostrarModalEntrega = false;
  hitoEditando: any | null = null;
  hitoSeleccionado: any | null = null;
  
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
    private fb: FormBuilder,
    private notificationService: NotificationService
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
    if (this.cronogramaId) {
      this.cargarHitos();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cronogramaId'] && this.cronogramaId && !changes['cronogramaId'].firstChange) {
      this.cargarHitos();
    }
  }

  // Carga inicial de datos (Sistema Unificado ✅)
  cargarHitos() {
    console.log('🔄 Cargando hitos del cronograma:', this.cronogramaId);
    this.apiService.getHitosCronograma(this.cronogramaId).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta de hitos recibida:', response);
        // El backend devuelve { success: true, hitos: [...] }
        const hitosData = response.hitos || response.data || [];
        console.log('📋 Hitos encontrados:', hitosData.length);
        
        // Normalizar hitos del backend para compatibilidad
        this.hitos = hitosData.map((h: any) => this.apiService.normalizarHito(h));
        console.log('✅ Hitos normalizados:', this.hitos);
        
        this.filtrarHitos();
        this.cargarEntregasParaTodosLosHitos();
      },
      error: (error: any) => {
        console.error('❌ Error al cargar hitos:', error);
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
    // El backend no tiene un endpoint separado para entregas.
    // La entrega está embebida en el propio hito.
    const hito = this.hitos.find(h => h.id.toString() === hitoId);
    if (hito && hito.archivo_entrega && hito.fecha_entrega) {
      this.entregas[hitoId] = [{
        id: hitoId,
        hito_id: hitoId,
        estudiante_rut: '',
        estudiante_nombre: '',
        archivo_nombre: hito.nombre_archivo_original || hito.archivo_entrega,
        archivo_url: hito.archivo_entrega,
        archivo_tamano: 0,
        comentarios: hito.comentarios_estudiante || '',
        fecha_entrega: hito.fecha_entrega,
        estado: hito.estado as any,
        retroalimentacion: hito.comentarios_profesor ?? undefined,
        fecha_revision: hito.updated_at,
        version: 1,
        es_entrega_final: hito.estado === 'aprobado'
      }];
    } else {
      this.entregas[hitoId] = [];
    }
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
    // Al editar, no validar fecha en el pasado (el hito puede tener fecha vencida)
    const errores = validarHito(datosHito);
    this.erroresValidacion = this.hitoEditando
      ? errores.filter(e => !e.includes('pasado'))
      : errores;

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
        this.guardandoHito = false;
        const msg = error?.error?.message || error?.message || 'Error al guardar el hito. Intente nuevamente.';
        this.erroresValidacion = [msg];
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

  async eliminarHito(hito: Hito): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Está seguro de eliminar el hito "${hito.nombre}"?`,
      'Confirmar eliminación',
      'Sí, eliminar',
      'Cancelar'
    );
    
    if (!confirmed) return;

    this.apiService.eliminarHitoCronograma(this.cronogramaId, hito.id.toString()).subscribe({
      next: () => {
        this.cargarHitos();
        this.hitosActualizados.emit();
      },
      error: (error) => {
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

    const hitoId = this.hitoSeleccionado.id.toString();
    this.apiService.entregarHito(hitoId, this.archivoSeleccionado, this.comentariosEntrega).subscribe({
      next: () => {
        this.subiendoEntrega = false;
        this.cerrarModalEntrega();
        this.cargarHitos();
      },
      error: (err: any) => {
        this.subiendoEntrega = false;
        const msg = err?.error?.message || err?.error?.error || 'Error al subir la entrega. Intente nuevamente.';
        this.erroresEntrega = [msg];
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
    const nombre = entrega.archivo_url?.split('/').pop() || entrega.archivo_url;
    if (!nombre) return;
    this.apiService.descargarArchivo(nombre).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = entrega.archivo_nombre || nombre;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.error('Error', 'No se pudo descargar el archivo')
    });
  }

  async eliminarEntrega(entrega: Entrega): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Está seguro de eliminar esta entrega?',
      'Confirmar eliminación',
      'Sí, eliminar',
      'Cancelar'
    );
    
    if (!confirmed) return;

    // El backend no soporta eliminación de entregas individuales.
    alert('La eliminación de entregas no está disponible en el sistema actual.');
  }

}