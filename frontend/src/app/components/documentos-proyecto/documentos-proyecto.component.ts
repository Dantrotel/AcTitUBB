import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

interface DocumentoHito {
  hito_id: number;
  nombre_hito: string;
  tipo_hito: string;
  hito_estado: string;
  fecha_entrega: string | null;
  archivo_entrega: string | null;
  nombre_archivo_original: string | null;
  comentarios_estudiante: string | null;
  archivo_retroalimentacion: string | null;
  nombre_archivo_retroalimentacion: string | null;
  comentarios_profesor: string | null;
  estudiante_nombre: string;
  estudiante_rut: string;
  profesor_nombre: string | null;
}

interface Documento {
  id: number;
  proyecto_id: number;
  tipo_documento: string;
  nombre_archivo: string;
  nombre_original: string;
  ruta_archivo: string;
  tamanio_bytes: number;
  mime_type: string;
  version: number;
  subido_por: string;
  nombre_subidor: string;
  fecha_subida: string;
  estado: 'borrador' | 'en_revision' | 'aprobado' | 'rechazado' | 'archivado';
  comentarios?: string;
  revisado_por?: string;
  nombre_revisor?: string;
  fecha_revision?: string;
}

@Component({
  selector: 'app-documentos-proyecto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documentos-proyecto.component.html',
  styleUrls: ['./documentos-proyecto.component.scss']
})
export class DocumentosProyectoComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  proyectoId: number = 0;

  // Hito documents
  documentosHitos: DocumentoHito[] = [];
  cargandoHitos = false;
  filtroHitoEstado = '';

  // Other documents
  documentos: Documento[] = [];
  filtroTipo = '';
  filtroEstado = '';
  archivoSeleccionado: File | null = null;
  tipoDocumento = '';
  estadoDocumento = 'borrador';
  comentarios = '';
  cargando = false;
  mostrarFormulario = false;

  correccionDocumentoId: number | null = null;
  archivoCorreccion: File | null = null;
  comentariosCorreccion = '';
  subiendoCorreccion = false;

  userData: any;
  rolId = '';
  esEstudiante = false;
  esProfesor = false;
  esAdmin = false;

  tab: 'hitos' | 'otros' = 'hitos';

  tiposDocumento = [
    { value: 'propuesta_final', label: 'Propuesta Final' },
    { value: 'informe_avance', label: 'Informe de Avance' },
    { value: 'borrador_final', label: 'Borrador Final' },
    { value: 'documento_final', label: 'Documento Final' },
    { value: 'formulario', label: 'Formulario' },
    { value: 'acta_reunion', label: 'Acta de Reunión' },
    { value: 'correccion', label: 'Corrección / Revisión' },
    { value: 'otro', label: 'Otro' }
  ];

  estadosDocumento = [
    { value: 'borrador', label: 'Borrador', color: 'badge-secondary' },
    { value: 'en_revision', label: 'En Revisión', color: 'badge-warning' },
    { value: 'aprobado', label: 'Aprobado', color: 'badge-success' },
    { value: 'rechazado', label: 'Rechazado', color: 'badge-danger' },
    { value: 'archivado', label: 'Archivado', color: 'badge-dark' }
  ];

  tipoHitoIconos: Record<string, string> = {
    entrega_documento: 'fa-file-alt',
    revision_avance: 'fa-search',
    reunion_seguimiento: 'fa-users',
    defensa: 'fa-microphone',
    entrega_final: 'fa-flag-checkered'
  };

  ngOnInit(): void {
    this.proyectoId = Number(this.route.snapshot.paramMap.get('id'));

    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      this.userData = JSON.parse(userDataString);
      this.rolId = String(this.userData.rol_id);
      this.esEstudiante = this.rolId === '1';
      this.esProfesor = this.rolId === '2';
      this.esAdmin = this.rolId === '3' || this.rolId === '4';
    }

    this.cargarDocumentosHitos();
    this.cargarDocumentos();
  }

  cargarDocumentosHitos(): void {
    this.cargandoHitos = true;
    this.apiService.getDocumentosHitos(this.proyectoId).subscribe({
      next: (res: any) => {
        this.documentosHitos = res?.data || [];
        this.cargandoHitos = false;
      },
      error: () => { this.cargandoHitos = false; }
    });
  }

  get documentosHitosFiltrados(): DocumentoHito[] {
    if (!this.filtroHitoEstado) return this.documentosHitos;
    return this.documentosHitos.filter(d => d.hito_estado === this.filtroHitoEstado);
  }

  descargarArchivoHito(nombreArchivo: string, nombreOriginal: string): void {
    const nombre = nombreArchivo.split('/').pop() || nombreArchivo;
    this.apiService.descargarArchivo(nombre).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreOriginal || nombre;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.error('Error al descargar el archivo')
    });
  }

  iconoTipo(tipo: string): string {
    return this.tipoHitoIconos[tipo] || 'fa-flag';
  }

  // ── Otros documentos ────────────────────────────────────

  cargarDocumentos(): void {
    this.cargando = true;
    let url = `/documentos/proyecto/${this.proyectoId}`;
    const params: string[] = [];
    if (this.filtroTipo) params.push(`tipo_documento=${this.filtroTipo}`);
    if (this.filtroEstado) params.push(`estado=${this.filtroEstado}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    this.apiService.get(url).subscribe({
      next: (response: any) => {
        this.documentos = response as Documento[];
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.archivoSeleccionado = input.files[0];
  }

  subirDocumento(): void {
    if (!this.archivoSeleccionado || !this.tipoDocumento) {
      this.notificationService.warning('Selecciona un archivo y tipo de documento');
      return;
    }
    this.cargando = true;
    const fd = new FormData();
    fd.append('archivo', this.archivoSeleccionado);
    fd.append('tipo_documento', this.tipoDocumento);
    fd.append('estado', this.estadoDocumento);
    if (this.comentarios) fd.append('comentarios', this.comentarios);

    this.apiService.post(`/documentos/${this.proyectoId}`, fd).subscribe({
      next: () => {
        this.cargarDocumentos();
        this.resetearFormulario();
        this.mostrarFormulario = false;
        this.cargando = false;
      },
      error: () => {
        this.notificationService.error('Error al subir el documento');
        this.cargando = false;
      }
    });
  }

  descargarDocumento(documentoId: number): void {
    this.apiService.descargarDocumentoProyecto(documentoId).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const doc = this.documentos.find(d => d.id === documentoId);
        a.download = doc?.nombre_original || `documento-${documentoId}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.notificationService.error('Error al descargar el documento')
    });
  }

  async actualizarEstado(documentoId: number, nuevoEstado: string): Promise<void> {
    const comentario = await this.notificationService.prompt(
      'Comentarios (opcional):', 'Actualizar estado', '', 'Guardar', 'Cancelar'
    );
    if (comentario === null) return;
    this.apiService.put(`/documentos/${documentoId}/estado`, {
      estado: nuevoEstado, comentarios: comentario || ''
    }).subscribe({
      next: () => this.cargarDocumentos(),
      error: () => this.notificationService.error('Error al actualizar el estado')
    });
  }

  async eliminarDocumento(documentoId: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de eliminar este documento?', 'Confirmar eliminación', 'Sí, eliminar', 'Cancelar'
    );
    if (!confirmed) return;
    this.apiService.delete(`/documentos/${documentoId}`).subscribe({
      next: () => this.cargarDocumentos(),
      error: () => this.notificationService.error('Error al eliminar el documento')
    });
  }

  resetearFormulario(): void {
    this.archivoSeleccionado = null;
    this.tipoDocumento = '';
    this.estadoDocumento = 'borrador';
    this.comentarios = '';
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.resetearFormulario();
  }

  abrirFormCorreccion(documentoId: number): void {
    this.correccionDocumentoId = this.correccionDocumentoId === documentoId ? null : documentoId;
    this.archivoCorreccion = null;
    this.comentariosCorreccion = '';
  }

  onArchivoCorreccionSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.archivoCorreccion = input.files[0];
  }

  subirCorreccion(docOriginal: Documento): void {
    if (!this.archivoCorreccion) {
      this.notificationService.warning('Selecciona un archivo de corrección');
      return;
    }
    this.subiendoCorreccion = true;
    const fd = new FormData();
    fd.append('archivo', this.archivoCorreccion);
    fd.append('tipo_documento', 'correccion');
    fd.append('estado', 'en_revision');
    fd.append('comentarios',
      `Corrección del documento "${docOriginal.nombre_original}"` +
      (this.comentariosCorreccion ? `: ${this.comentariosCorreccion}` : '')
    );
    this.apiService.post(`/documentos/${this.proyectoId}`, fd).subscribe({
      next: () => {
        this.notificationService.success('Corrección subida exitosamente');
        this.correccionDocumentoId = null;
        this.archivoCorreccion = null;
        this.comentariosCorreccion = '';
        this.subiendoCorreccion = false;
        this.cargarDocumentos();
      },
      error: () => {
        this.notificationService.error('Error al subir la corrección');
        this.subiendoCorreccion = false;
      }
    });
  }

  aplicarFiltros(): void { this.cargarDocumentos(); }
  limpiarFiltros(): void { this.filtroTipo = ''; this.filtroEstado = ''; this.cargarDocumentos(); }

  getEstadoBadgeClass(estado: string): string {
    return this.estadosDocumento.find(e => e.value === estado)?.color || 'badge-secondary';
  }
  getEstadoLabel(estado: string): string {
    return this.estadosDocumento.find(e => e.value === estado)?.label || estado;
  }
  getTipoLabel(tipo: string): string {
    return this.tiposDocumento.find(t => t.value === tipo)?.label || tipo;
  }
  formatearTamanio(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
  puedeEliminarDocumento(documento: Documento): boolean {
    if (this.esAdmin) return true;
    if (this.esEstudiante) return documento.subido_por === this.userData?.rut && documento.estado === 'borrador';
    return false;
  }
}
