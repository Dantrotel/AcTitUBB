import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-revision-hitos-informante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revision-hitos-informante.component.html',
  styleUrls: ['./revision-hitos-informante.component.scss']
})
export class RevisionHitosInformanteComponent implements OnInit {

  revisiones: any[] = [];
  cargando = false;
  enviando = false;
  mensajeError = '';

  // Estado de revisión en línea
  revisionAbiertaId: number | null = null;
  comentarios = '';
  estadoRevision: 'aprobado' | 'rechazado' = 'aprobado';
  archivoRevision: File | null = null;
  archivoRevisionNombre = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarRevisiones();
  }

  cargarRevisiones() {
    this.cargando = true;
    this.mensajeError = '';
    this.apiService.getRevisionesInformante().subscribe({
      next: (res: any) => {
        this.revisiones = res?.data || [];
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'Error al cargar las revisiones';
        this.cargando = false;
      }
    });
  }

  get pendientes() { return this.revisiones.filter(r => r.estado === 'pendiente'); }
  get completadas() { return this.revisiones.filter(r => r.estado !== 'pendiente'); }

  toggleRevision(revision: any) {
    if (this.revisionAbiertaId === revision.id) {
      this.cerrarRevision();
      return;
    }
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

  enviarRevision(estado: 'aprobado' | 'rechazado') {
    if (!this.revisionAbiertaId) return;
    if (!this.comentarios.trim()) {
      alert('Por favor ingresa un comentario para el estudiante');
      return;
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
      },
      error: (err) => {
        alert('Error al enviar revisión: ' + (err.error?.message || 'Error desconocido'));
        this.enviando = false;
      }
    });
  }

  descargarDocumento(revision: any) {
    const archivo = revision.archivo_entrega;
    if (!archivo) { alert('No hay documento disponible'); return; }
    const nombre = archivo.split('/').pop() || archivo;
    this.apiService.descargarArchivo(nombre).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = revision.nombre_archivo_original || nombre;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); window.URL.revokeObjectURL(url);
      },
      error: () => alert('Error al descargar el documento')
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
