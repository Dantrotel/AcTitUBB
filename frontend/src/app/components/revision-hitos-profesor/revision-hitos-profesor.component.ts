import { Component, OnInit, Input } from '@angular/core';
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
  peso_en_proyecto: number;
  tiene_entrega: boolean;
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
}

@Component({
  selector: 'app-revision-hitos-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revision-hitos-profesor.component.html',
  styleUrls: ['./revision-hitos-profesor.component.scss']
})
export class RevisionHitosProfesorComponent implements OnInit {
  @Input() projectId!: string;
  @Input() cronogramaId!: string;

  hitos: Hito[] = [];
  hitoSeleccionado: Hito | null = null;
  entregaEnRevision: Entrega | null = null;
  
  // Formulario de revisión
  mostrarModalRevision = false;
  comentariosProfesor: string = '';
  estadoRevision: 'aprobado' | 'requiere_correcciones' = 'aprobado';
  
  // Filtros
  filtroEstado: string = '';
  filtroTipo: string = '';
  
  cargando = false;
  mensajeError = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarHitos();
  }

  cargarHitos() {
    if (!this.cronogramaId) {
      console.warn('No se ha proporcionado cronogramaId');
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    
    this.apiService.getHitosCronograma(this.cronogramaId).subscribe({
      next: (response: any) => {
        const hitos = response.hitos || response.data || [];
        // Ordenar por fecha límite
        this.hitos = hitos.sort((a: Hito, b: Hito) => 
          new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime()
        );
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar hitos:', error);
        this.mensajeError = 'Error al cargar los hitos del proyecto';
        this.cargando = false;
      }
    });
  }

  get hitosFiltrados(): Hito[] {
    return this.hitos.filter(hito => {
      let cumpleFiltro = true;
      
      if (this.filtroEstado) {
        if (this.filtroEstado === 'con_entrega') {
          cumpleFiltro = cumpleFiltro && hito.tiene_entrega;
        } else if (this.filtroEstado === 'sin_entrega') {
          cumpleFiltro = cumpleFiltro && !hito.tiene_entrega;
        } else if (this.filtroEstado === 'pendiente_revision') {
          cumpleFiltro = cumpleFiltro && hito.entrega?.estado === 'pendiente_revision';
        }
      }
      
      if (this.filtroTipo) {
        cumpleFiltro = cumpleFiltro && hito.tipo_hito === this.filtroTipo;
      }
      
      return cumpleFiltro;
    });
  }

  abrirRevision(hito: Hito) {
    if (!hito.entrega) {
      alert('Este hito no tiene entregas para revisar');
      return;
    }

    this.hitoSeleccionado = hito;
    this.entregaEnRevision = hito.entrega;
    
    // Pre-cargar datos si ya fue revisado
    this.comentariosProfesor = hito.entrega.comentarios_profesor || '';
    this.estadoRevision = hito.entrega.estado === 'aprobado' ? 'aprobado' : 'requiere_correcciones';
    
    this.mostrarModalRevision = true;
  }

  cerrarModalRevision() {
    this.mostrarModalRevision = false;
    this.hitoSeleccionado = null;
    this.entregaEnRevision = null;
    this.comentariosProfesor = '';
    this.estadoRevision = 'aprobado';
  }

  guardarRevision() {
    if (!this.hitoSeleccionado || !this.entregaEnRevision) return;

    if (!this.comentariosProfesor.trim()) {
      alert('Por favor, ingresa comentarios para la revisión');
      return;
    }

    this.cargando = true;
    
    const revisionData = {
      comentarios_profesor: this.comentariosProfesor,
      estado: this.estadoRevision
    };

    this.apiService.revisarHito(this.hitoSeleccionado.id.toString(), revisionData).subscribe({
      next: (response: any) => {
        alert('✅ Revisión guardada exitosamente');
        this.cerrarModalRevision();
        this.cargarHitos(); // Recargar para actualizar el estado
      },
      error: (error) => {
        console.error('Error al guardar revisión:', error);
        alert('❌ Error al guardar la revisión: ' + (error.error?.message || 'Error desconocido'));
        this.cargando = false;
      }
    });
  }

  descargarEntrega(entrega: Entrega) {
    if (!entrega.archivo_url) {
      alert('No hay archivo disponible para descargar');
      return;
    }

    // Extraer el nombre del archivo de la URL
    const archivoNombre = entrega.archivo_url.split('/').pop() || entrega.archivo_nombre;
    
    this.apiService.descargarArchivo(archivoNombre).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = entrega.archivo_nombre;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error al descargar archivo:', error);
        alert('❌ Error al descargar el archivo');
      }
    });
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaCorta(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'entrega_documento': 'fa-file-alt',
      'revision_avance': 'fa-search',
      'reunion_seguimiento': 'fa-users',
      'defensa': 'fa-presentation'
    };
    return iconos[tipo] || 'fa-tasks';
  }

  obtenerClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente_revision': 'badge-warning',
      'aprobado': 'badge-success',
      'requiere_correcciones': 'badge-danger',
      'sin_entrega': 'badge-secondary'
    };
    return clases[estado] || 'badge-secondary';
  }

  obtenerTextoEstado(hito: Hito): string {
    if (!hito.tiene_entrega) {
      return 'Sin entrega';
    }
    
    const estados: { [key: string]: string } = {
      'pendiente_revision': 'Pendiente de revisión',
      'aprobado': 'Aprobado',
      'requiere_correcciones': 'Requiere correcciones'
    };
    
    return hito.entrega ? estados[hito.entrega.estado] || 'Desconocido' : 'Sin entrega';
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
