import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { ActivatedRoute } from '@angular/router';

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

  proyectoId: number = 0;
  documentos: Documento[] = [];
  filtroTipo: string = '';
  filtroEstado: string = '';
  archivoSeleccionado: File | null = null;
  tipoDocumento: string = '';
  estadoDocumento: string = 'borrador';
  comentarios: string = '';
  cargando: boolean = false;
  mostrarFormulario: boolean = false;
  
  // Información del usuario actual
  userData: any;
  rolId: string = '';
  esEstudiante: boolean = false;
  esProfesor: boolean = false;
  esAdmin: boolean = false;

  tiposDocumento = [
    { value: 'propuesta_final', label: 'Propuesta Final' },
    { value: 'informe_avance', label: 'Informe de Avance' },
    { value: 'borrador_final', label: 'Borrador Final' },
    { value: 'documento_final', label: 'Documento Final' },
    { value: 'formulario', label: 'Formulario' },
    { value: 'acta_reunion', label: 'Acta de Reunión' },
    { value: 'otro', label: 'Otro' }
  ];

  estadosDocumento = [
    { value: 'borrador', label: 'Borrador', color: 'badge-secondary' },
    { value: 'en_revision', label: 'En Revisión', color: 'badge-warning' },
    { value: 'aprobado', label: 'Aprobado', color: 'badge-success' },
    { value: 'rechazado', label: 'Rechazado', color: 'badge-danger' },
    { value: 'archivado', label: 'Archivado', color: 'badge-dark' }
  ];

  ngOnInit(): void {
    this.proyectoId = Number(this.route.snapshot.paramMap.get('id'));
    
    // Obtener información del usuario
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      this.userData = JSON.parse(userDataString);
      this.rolId = this.userData.rol_id;
      this.esEstudiante = this.rolId === '1';
      this.esProfesor = this.rolId === '2';
      this.esAdmin = this.rolId === '3';
    }
    
    this.cargarDocumentos();
  }

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
      error: (error) => {
        console.error('Error al cargar documentos:', error);
        this.cargando = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  subirDocumento(): void {
    if (!this.archivoSeleccionado || !this.tipoDocumento) {
      alert('Selecciona un archivo y tipo de documento');
      return;
    }

    this.cargando = true;
    const formData = new FormData();
    formData.append('archivo', this.archivoSeleccionado);
    formData.append('tipo_documento', this.tipoDocumento);
    formData.append('estado', this.estadoDocumento);
    if (this.comentarios) formData.append('comentarios', this.comentarios);

    this.apiService.post(`/documentos/${this.proyectoId}`, formData).subscribe({
      next: () => {
        this.cargarDocumentos();
        this.resetearFormulario();
        this.mostrarFormulario = false;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al subir documento:', error);
        alert('Error al subir el documento');
        this.cargando = false;
      }
    });
  }

  descargarDocumento(documentoId: number): void {
    window.open(`http://localhost:3000/api/v1/documentos/${documentoId}/download`, '_blank');
  }

  actualizarEstado(documentoId: number, nuevoEstado: string): void {
    const comentario = prompt('Comentarios (opcional):');
    
    this.apiService.put(`/documentos/${documentoId}/estado`, {
      estado: nuevoEstado,
      comentarios: comentario || ''
    }).subscribe({
      next: () => {
        this.cargarDocumentos();
      },
      error: (error) => {
        console.error('Error al actualizar estado:', error);
        alert('Error al actualizar el estado');
      }
    });
  }

  eliminarDocumento(documentoId: number): void {
    if (!confirm('¿Estás seguro de eliminar este documento?')) return;

    this.apiService.delete(`/documentos/${documentoId}`).subscribe({
      next: () => {
        this.cargarDocumentos();
      },
      error: (error) => {
        console.error('Error al eliminar documento:', error);
        alert('Error al eliminar el documento');
      }
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
    if (!this.mostrarFormulario) {
      this.resetearFormulario();
    }
  }

  aplicarFiltros(): void {
    this.cargarDocumentos();
  }

  limpiarFiltros(): void {
    this.filtroTipo = '';
    this.filtroEstado = '';
    this.cargarDocumentos();
  }

  getEstadoBadgeClass(estado: string): string {
    const estadoObj = this.estadosDocumento.find(e => e.value === estado);
    return estadoObj ? estadoObj.color : 'badge-secondary';
  }

  getEstadoLabel(estado: string): string {
    const estadoObj = this.estadosDocumento.find(e => e.value === estado);
    return estadoObj ? estadoObj.label : estado;
  }

  getTipoLabel(tipo: string): string {
    const tipoObj = this.tiposDocumento.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  }

  formatearTamanio(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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

  // Métodos de permisos
  puedeEliminarDocumento(documento: Documento): boolean {
    // Admin puede eliminar cualquier documento
    if (this.esAdmin) return true;
    
    // Estudiante solo puede eliminar sus propios documentos en borrador
    if (this.esEstudiante) {
      return documento.subido_por === this.userData.rut && documento.estado === 'borrador';
    }
    
    // Profesor no puede eliminar documentos
    return false;
  }

  puedeCambiarEstado(): boolean {
    // Solo profesor y admin pueden cambiar estados
    return this.esProfesor || this.esAdmin;
  }

  mostrarBotonesEstado(documento: Documento): boolean {
    // Mostrar botones de cambio de estado solo si tiene permiso
    return this.puedeCambiarEstado();
  }
}
