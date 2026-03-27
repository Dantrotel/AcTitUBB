import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-revision-hitos-informante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revision-hitos-informante.component.html',
  styleUrls: ['./revision-hitos-informante.component.scss']
})
export class RevisionHitosInformanteComponent implements OnInit, OnChanges {
  @Input() proyectoId: string = '';
  @Input() cronogramaId: string = '';

  // ── Revisiones pendientes ──
  revisiones: any[] = [];
  cargando = false;
  enviando = false;
  mensajeError = '';

  revisionAbiertaId: number | null = null;
  comentarios = '';
  estadoRevision: 'aprobado' | 'rechazado' = 'aprobado';
  archivoRevision: File | null = null;
  archivoRevisionNombre = '';

  // ── Hitos del informante ──
  puedeCrearHitos = false;
  cargandoPermiso = false;
  hitosInformante: any[] = [];
  cargandoHitos = false;

  mostrarFormHito = false;
  guardandoHito = false;
  nuevoHito = { nombre_hito: '', descripcion: '', tipo_hito: 'entrega_documento', fecha_limite: '', peso_en_proyecto: 0, es_critico: false };

  // ── Revisión inline de hitos propios ──
  hitoEnRevisionId: number | null = null;
  comentariosRevision = '';
  archivoRevisionHito: File | null = null;
  archivoRevisionHitoNombre = '';
  enviandoRevisionHito = false;

  constructor(private apiService: ApiService, private notificationService: NotificationService) {}

  ngOnInit() {
    this.cargarRevisiones();
    if (this.proyectoId) this.verificarPermiso();
    if (this.cronogramaId) this.cargarHitosInformante();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['proyectoId']?.currentValue) this.verificarPermiso();
    if (changes['cronogramaId']?.currentValue) this.cargarHitosInformante();
  }

  // ── Revisiones ──────────────────────────────────────────────

  cargarRevisiones() {
    this.cargando = true;
    this.mensajeError = '';
    this.apiService.getRevisionesInformante().subscribe({
      next: (res: any) => { this.revisiones = res?.data || []; this.cargando = false; },
      error: () => { this.mensajeError = 'Error al cargar las revisiones'; this.cargando = false; }
    });
  }

  get pendientes() { return this.revisiones.filter(r => r.estado === 'pendiente'); }
  get completadas() { return this.revisiones.filter(r => r.estado !== 'pendiente'); }

  toggleRevision(revision: any) {
    if (this.revisionAbiertaId === revision.id) { this.cerrarRevision(); return; }
    this.revisionAbiertaId = revision.id;
    this.comentarios = '';
    this.estadoRevision = 'aprobado';
    this.archivoRevision = null;
    this.archivoRevisionNombre = '';
  }

  cerrarRevision() {
    this.revisionAbiertaId = null;
    this.comentarios = '';
    this.archivoRevision = null;
    this.archivoRevisionNombre = '';
  }

  onArchivoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      this.notificationService.warning('Formato no permitido', 'El archivo adjunto debe estar en formato PDF, DOC o DOCX.');
      input.value = ''; return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.notificationService.warning('Archivo demasiado grande', 'El tamaño máximo permitido es 10 MB.');
      input.value = ''; return;
    }
    this.archivoRevision = file;
    this.archivoRevisionNombre = file.name;
  }

  enviarRevision(estado: 'aprobado' | 'rechazado') {
    if (!this.revisionAbiertaId) return;
    if (!this.comentarios.trim()) {
      this.notificationService.warning('Campo requerido', 'Debe ingresar un comentario antes de enviar.'); return;
    }
    this.enviando = true;
    let payload: FormData | any;
    if (this.archivoRevision) {
      const fd = new FormData();
      fd.append('comentarios', this.comentarios);
      fd.append('estado', estado);
      fd.append('archivo_revision', this.archivoRevision, this.archivoRevisionNombre);
      payload = fd;
    } else {
      payload = { comentarios: this.comentarios, estado };
    }
    this.apiService.revisarHitoInformante(String(this.revisionAbiertaId), payload).subscribe({
      next: () => {
        this.enviando = false;
        this.cerrarRevision();
        this.cargarRevisiones();
        // Si aprobó, reverificar permiso para crear hitos
        if (estado === 'aprobado' && this.proyectoId) this.verificarPermiso();
      },
      error: (err) => {
        this.notificationService.error('Error al enviar revisión', err.error?.message || 'No fue posible procesar la revisión.');
        this.enviando = false;
      }
    });
  }

  descargarDocumento(revision: any) {
    const archivo = revision.archivo_entrega;
    if (!archivo) { this.notificationService.warning('Sin documento adjunto', 'Esta entrega no tiene documento disponible.'); return; }
    const nombre = archivo.split('/').pop() || archivo;
    this.apiService.descargarArchivo(nombre).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = revision.nombre_archivo_original || nombre;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.error('Error al descargar', 'No fue posible descargar el documento.')
    });
  }

  // ── Hitos del Informante ────────────────────────────────────

  verificarPermiso() {
    if (!this.proyectoId) return;
    this.cargandoPermiso = true;
    this.apiService.verificarPermisoInformante(this.proyectoId).subscribe({
      next: (res: any) => { this.puedeCrearHitos = res?.puede_crear || false; this.cargandoPermiso = false; },
      error: () => { this.puedeCrearHitos = false; this.cargandoPermiso = false; }
    });
  }

  cargarHitosInformante() {
    if (!this.cronogramaId) return;
    this.cargandoHitos = true;
    this.apiService.getHitosInformante(this.cronogramaId).subscribe({
      next: (res: any) => { this.hitosInformante = res?.hitos || []; this.cargandoHitos = false; },
      error: () => { this.cargandoHitos = false; }
    });
  }

  abrirFormHito() {
    this.nuevoHito = { nombre_hito: '', descripcion: '', tipo_hito: 'entrega_documento', fecha_limite: '', peso_en_proyecto: 0, es_critico: false };
    this.mostrarFormHito = true;
  }

  cancelarFormHito() { this.mostrarFormHito = false; }

  guardarHitoInformante() {
    if (!this.nuevoHito.nombre_hito.trim() || !this.nuevoHito.fecha_limite) {
      this.notificationService.warning('Campos requeridos', 'El nombre y la fecha límite son obligatorios.'); return;
    }
    this.guardandoHito = true;
    this.apiService.crearHitoInformante(this.cronogramaId, this.nuevoHito).subscribe({
      next: () => {
        this.notificationService.success('Hito creado', 'El hito del informante fue creado correctamente.');
        this.mostrarFormHito = false;
        this.guardandoHito = false;
        this.cargarHitosInformante();
      },
      error: (err) => {
        this.notificationService.error('Error al crear hito', err.error?.message || 'No fue posible crear el hito.');
        this.guardandoHito = false;
      }
    });
  }

  // ── Revisión de hitos propios ────────────────────────────────

  get hitosConEntrega() {
    return this.hitosInformante.filter(h => h.estado === 'entregado');
  }

  get historialHitosInformante() {
    return this.hitosInformante.filter(h =>
      ['aprobado', 'revisado', 'rechazado'].includes(h.estado)
    );
  }

  get hitosSinEntrega() {
    return this.hitosInformante.filter(h =>
      !['entregado', 'revisado', 'aprobado', 'rechazado'].includes(h.estado)
    );
  }

  toggleRevisionHito(hito: any) {
    if (this.hitoEnRevisionId === hito.id) { this.cerrarRevisionHito(); return; }
    this.hitoEnRevisionId = hito.id;
    this.comentariosRevision = hito.comentarios_profesor || '';
    this.archivoRevisionHito = null;
    this.archivoRevisionHitoNombre = '';
  }

  cerrarRevisionHito() {
    this.hitoEnRevisionId = null;
    this.comentariosRevision = '';
    this.archivoRevisionHito = null;
    this.archivoRevisionHitoNombre = '';
  }

  onArchivoRevisionHitoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      this.notificationService.warning('Formato no permitido', 'El archivo debe estar en formato PDF, DOC o DOCX.');
      input.value = ''; return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.notificationService.warning('Archivo demasiado grande', 'El tamaño máximo es 10 MB.');
      input.value = ''; return;
    }
    this.archivoRevisionHito = file;
    this.archivoRevisionHitoNombre = file.name;
  }

  enviarRevisionHitoInformante(estado: 'aprobado' | 'revisado' | 'rechazado') {
    if (!this.hitoEnRevisionId) return;
    if (!this.comentariosRevision.trim()) {
      this.notificationService.warning('Campo requerido', 'Debe ingresar retroalimentación antes de enviar.');
      return;
    }
    this.enviandoRevisionHito = true;

    let payload: FormData | any;
    if (this.archivoRevisionHito) {
      const fd = new FormData();
      fd.append('comentarios_profesor', this.comentariosRevision);
      fd.append('estado', estado);
      fd.append('archivo_revision', this.archivoRevisionHito, this.archivoRevisionHitoNombre);
      payload = fd;
    } else {
      payload = { comentarios_profesor: this.comentariosRevision, estado };
    }

    this.apiService.revisarHitoCompleto(String(this.hitoEnRevisionId), payload).subscribe({
      next: () => {
        this.notificationService.success('Revisión enviada', 'La revisión del hito fue guardada correctamente.');
        this.enviandoRevisionHito = false;
        this.cerrarRevisionHito();
        this.cargarHitosInformante();
      },
      error: (err) => {
        this.notificationService.error('Error al revisar', err.error?.message || 'No fue posible guardar la revisión.');
        this.enviandoRevisionHito = false;
      }
    });
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      pendiente: 'badge-warning', aprobado: 'badge-success',
      rechazado: 'badge-danger', entregado: 'badge-info', revisado: 'badge-info'
    };
    return map[estado] || 'badge-warning';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
