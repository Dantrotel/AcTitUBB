import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

interface Hito {
  id: number;
  nombre_hito: string;
  descripcion: string;
  tipo_hito: string;
  fecha_limite: string;
  estado: string;
  estado_real?: string;
  peso_en_proyecto: number;
  tiene_entrega: boolean;
  estudiante_nombre?: string;
  entrega?: Entrega;
}

interface Entrega {
  id: number;
  hito_id: number;
  estudiante_rut: string;
  estudiante_nombre?: string;
  archivo_nombre: string;
  archivo_url: string;
  comentarios_estudiante: string;
  fecha_entrega: string;
  estado: 'pendiente_revision' | 'aprobado' | 'requiere_correcciones';
  comentarios_profesor?: string;
  fecha_revision?: string;
  archivo_retroalimentacion?: string;
  nombre_archivo_retroalimentacion?: string;
}

@Component({
  selector: 'app-revision-hitos-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revision-hitos-profesor.component.html',
  styleUrls: ['./revision-hitos-profesor.component.scss']
})
export class RevisionHitosProfesorComponent implements OnInit, OnChanges {
  @Input() projectId!: string;
  @Input() cronogramaId!: string;

  hitos: Hito[] = [];

  // Inline review state
  hitoEnRevisionId: number | null = null;
  comentariosProfesor = '';
  estadoRevision: 'aprobado' | 'revisado' | 'rechazado' = 'revisado';
  archivoRevision: File | null = null;
  archivoRevisionNombre = '';

  // Filters
  filtroEstado = '';
  filtroTipo = '';

  cargando = false;
  enviando = false;
  mensajeError = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (this.cronogramaId) this.cargarHitos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cronogramaId']?.currentValue) {
      this.cargarHitos();
    }
  }

  cargarHitos() {
    if (!this.cronogramaId) return;
    this.cargando = true;
    this.mensajeError = '';

    this.apiService.getHitosCronograma(this.cronogramaId).subscribe({
      next: (response: any) => {
        const raw: any[] = response.hitos || response.data || [];
        this.hitos = raw.map(h => this.mapearHito(h));
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar hitos:', error);
        this.mensajeError = 'Error al cargar los hitos del proyecto';
        this.cargando = false;
      }
    });
  }

  private mapearHito(h: any): Hito {
    const estadosConEntrega = ['entregado', 'revisado', 'aprobado', 'rechazado'];
    const tieneEntrega = estadosConEntrega.includes(h.estado) || !!h.archivo_entrega;

    let estadoEntrega: 'pendiente_revision' | 'aprobado' | 'requiere_correcciones' = 'pendiente_revision';
    if (h.estado === 'aprobado' || h.estado === 'revisado') estadoEntrega = 'aprobado';
    else if (h.estado === 'rechazado') estadoEntrega = 'requiere_correcciones';

    return {
      ...h,
      tiene_entrega: tieneEntrega,
      entrega: tieneEntrega ? {
        id: h.id,
        hito_id: h.id,
        estudiante_rut: '',
        estudiante_nombre: h.estudiante_nombre,
        archivo_nombre: h.nombre_archivo_original || h.archivo_entrega || '',
        archivo_url: h.archivo_entrega || '',
        comentarios_estudiante: h.comentarios_estudiante || '',
        fecha_entrega: h.fecha_entrega || '',
        estado: estadoEntrega,
        comentarios_profesor: h.comentarios_profesor || '',
        fecha_revision: h.fecha_revision,
        archivo_retroalimentacion: h.archivo_retroalimentacion || '',
        nombre_archivo_retroalimentacion: h.nombre_archivo_retroalimentacion || '',
      } : undefined,
    };
  }

  get hitosFiltrados(): Hito[] {
    return this.hitos.filter(hito => {
      let ok = true;
      if (this.filtroEstado === 'con_entrega') ok = ok && hito.tiene_entrega;
      else if (this.filtroEstado === 'sin_entrega') ok = ok && !hito.tiene_entrega;
      else if (this.filtroEstado === 'pendiente_revision') ok = ok && hito.entrega?.estado === 'pendiente_revision';
      else if (this.filtroEstado === 'aprobado') ok = ok && hito.entrega?.estado === 'aprobado';
      else if (this.filtroEstado === 'requiere_correcciones') ok = ok && hito.entrega?.estado === 'requiere_correcciones';
      if (this.filtroTipo) ok = ok && hito.tipo_hito === this.filtroTipo;
      return ok;
    });
  }

  get historialHitos(): Hito[] {
    return this.hitos.filter(h => ['aprobado', 'rechazado', 'revisado'].includes(h.estado));
  }

  toggleRevision(hito: Hito) {
    if (this.hitoEnRevisionId === hito.id) {
      this.cerrarRevision();
      return;
    }
    this.hitoEnRevisionId = hito.id;
    this.comentariosProfesor = hito.entrega?.comentarios_profesor || '';
    this.estadoRevision = 'revisado';
  }

  cerrarRevision() {
    this.hitoEnRevisionId = null;
    this.comentariosProfesor = '';
    this.estadoRevision = 'revisado';
    this.archivoRevision = null;
    this.archivoRevisionNombre = '';
  }

  onArchivoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'doc', 'docx'].includes(ext || '')) {
      alert('Solo se permiten archivos PDF o Word (.pdf, .doc, .docx)');
      input.value = '';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar los 10 MB');
      input.value = '';
      return;
    }
    this.archivoRevision = file;
    this.archivoRevisionNombre = file.name;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    const fakeEvent = { target: { files: [file], value: '' } } as unknown as Event;
    this.onArchivoChange(fakeEvent);
  }

  eliminarArchivoRevision() {
    this.archivoRevision = null;
    this.archivoRevisionNombre = '';
  }

  enviarRevision(estado: 'aprobado' | 'revisado' | 'rechazado') {
    if (!this.hitoEnRevisionId) return;
    if (!this.comentariosProfesor.trim()) {
      alert('Por favor, ingresa retroalimentación para el estudiante');
      return;
    }
    this.enviando = true;

    let payload: FormData | { comentarios_profesor: string; estado: string };
    if (this.archivoRevision) {
      const fd = new FormData();
      fd.append('comentarios_profesor', this.comentariosProfesor);
      fd.append('estado', estado);
      fd.append('archivo_revision', this.archivoRevision, this.archivoRevisionNombre);
      payload = fd;
    } else {
      payload = { comentarios_profesor: this.comentariosProfesor, estado };
    }

    this.apiService.revisarHitoCompleto(this.hitoEnRevisionId.toString(), payload).subscribe({
      next: () => {
        this.enviando = false;
        this.cerrarRevision();
        this.cargarHitos();
      },
      error: (err) => {
        console.error('Error al enviar revisión:', err);
        alert('Error al guardar: ' + (err.error?.message || 'Error desconocido'));
        this.enviando = false;
      }
    });
  }

  descargarRetroalimentacion(hito: Hito) {
    const archivo = hito.entrega?.archivo_retroalimentacion;
    if (!archivo) { alert('No hay documento de retroalimentación disponible'); return; }
    const nombre = archivo.split('/').pop() || archivo;
    this.apiService.descargarArchivo(nombre).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = hito.entrega!.nombre_archivo_retroalimentacion || nombre;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error al descargar el documento de retroalimentación')
    });
  }

  descargarEntrega(hito: Hito) {
    const archivo = hito.entrega?.archivo_url;
    if (!archivo) { alert('No hay archivo disponible'); return; }
    const nombre = archivo.split('/').pop() || archivo;
    this.apiService.descargarArchivo(nombre).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = hito.entrega!.archivo_nombre || nombre;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error al descargar el archivo')
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatearFechaHora(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  obtenerIconoTipo(tipo: string): string {
    const m: Record<string, string> = {
      entrega_documento: 'fa-file-alt', revision_avance: 'fa-search',
      reunion_seguimiento: 'fa-users', defensa: 'fa-award'
    };
    return m[tipo] || 'fa-tasks';
  }

  obtenerClaseEstado(estado: string): string {
    const m: Record<string, string> = {
      pendiente_revision: 'badge-warning', aprobado: 'badge-success',
      requiere_correcciones: 'badge-danger', sin_entrega: 'badge-secondary'
    };
    return m[estado] || 'badge-secondary';
  }

  obtenerTextoEstado(hito: Hito): string {
    if (!hito.tiene_entrega) return 'Sin entrega';
    const m: Record<string, string> = {
      pendiente_revision: 'Pendiente de revisión',
      aprobado: 'Aprobado',
      requiere_correcciones: 'Requiere correcciones'
    };
    return hito.entrega ? (m[hito.entrega.estado] || hito.entrega.estado) : 'Sin entrega';
  }

  esVencido(fecha: string): boolean {
    return new Date(fecha) < new Date();
  }

  contarEntregasPendientes(): number {
    return this.hitos.filter(h => h.entrega?.estado === 'pendiente_revision').length;
  }

  contarEntregasAprobadas(): number {
    return this.hitos.filter(h => h.entrega?.estado === 'aprobado').length;
  }

  contarRequierenCorreccion(): number {
    return this.hitos.filter(h => h.entrega?.estado === 'requiere_correcciones').length;
  }

  calcularProgresoGeneral(): number {
    if (this.hitos.length === 0) return 0;
    const completados = this.hitos.filter(h => h.entrega?.estado === 'aprobado').length;
    return Math.round((completados / this.hitos.length) * 100);
  }
}
