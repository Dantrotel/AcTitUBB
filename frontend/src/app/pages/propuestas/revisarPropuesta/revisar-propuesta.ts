import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-revisar-propuesta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './revisar-propuesta.html',
  styleUrls: ['./revisar-propuesta.scss']
})
export class RevisarPropuestaComponent implements OnInit {
  propuestaId!: string;
  propuesta: any = null;
  comentarios = '';
  estado = '';
  estados = ['pendiente', 'correcciones', 'aprobada', 'rechazada'];
  error = '';
  esProfesor = false;
  esAdmin = false;
  esSuperAdmin = false;
  puedeRevisar = false;
  
  // Archivo revisado
  archivoRevisado: File | null = null;
  archivoError = '';
  isDragOver = false;
  
  // Historial de revisiones
  historialRevisiones: any[] = [];
  mostrarHistorial = false;
  cargandoHistorial = false;
  
  // Archivos versionados
  archivosVersionados: any[] = [];

  private notificationService = inject(NotificationService);

  constructor(private route: ActivatedRoute, private api: ApiService, public router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.propuestaId = this.route.snapshot.paramMap.get('id') || '';
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      this.esProfesor = userData && userData.rol_id === 2;
      this.esAdmin = userData && userData.rol_id === 3;
      this.esSuperAdmin = userData && userData.rol_id === 4;
    }
    
    // Permitir acceso a profesores, admins y superadmins
    this.puedeRevisar = this.esProfesor || this.esAdmin || this.esSuperAdmin;
    
    if (!this.puedeRevisar) {
      this.error = 'Acceso denegado: solo profesores, administradores y super administradores pueden revisar propuestas.';
      return;
    }

    this.api.getPropuestaById(this.propuestaId).subscribe({
      next: (data: any) => {
        this.propuesta = data;
        this.estado = data.estado;
        this.comentarios = data.comentarios_profesor || '';
        this.cargarHistorialRevisiones();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar la propuesta.';
        this.cdr.detectChanges();
      }
    });
  }

  guardarRevision() {
    // Validar que se haya seleccionado un estado
    if (!this.estado) {
      this.notificationService.warning('Debes seleccionar un estado.');
      return;
    }
    
    // Los comentarios son opcionales cuando el estado es 'aprobada'
    if (this.estado !== 'aprobada' && (!this.comentarios || this.comentarios.trim().length === 0)) {
      this.notificationService.warning('Debes ingresar comentarios cuando el estado no es "aprobada".');
      return;
    }
    
    const formData = new FormData();
    // Solo agregar comentarios si existen
    if (this.comentarios && this.comentarios.trim().length > 0) {
      formData.append('comentarios_profesor', this.comentarios.trim());
    }
    formData.append('estado', this.estado);
    
    if (this.archivoRevisado) {
      formData.append('archivo_revision', this.archivoRevisado);
    }
    
    this.api.revisarPropuestaConArchivo(this.propuestaId, formData).subscribe({
      next: (response: any) => {
        if (this.estado === 'aprobada') {
          // Propuesta aprobada - mostrar mensaje sobre proyecto creado
          if (response.proyecto_creado && response.proyecto_id) {
            this.notificationService.success(
              `Se ha creado automáticamente el proyecto con ID: ${response.proyecto_id}. El proyecto está en estado "Esperando Asignación de Profesores". Los administradores deben asignar los 3 roles (Profesor Guía, Revisor e Informante) para activarlo.`,
              '✅ Propuesta Aprobada',
              8000
            );
          } else {
            this.notificationService.success('Se ha iniciado el proceso de creación automática del proyecto.', '✅ Propuesta Aprobada');
          }
        } else {
          this.notificationService.success('Revisión guardada correctamente');
        }
        
        // Redirigir según el rol del usuario
        if (this.esSuperAdmin) {
          this.router.navigate(['/super-admin']);
        } else if (this.esAdmin) {
          this.router.navigate(['/admin/propuestas']);
        } else if (this.esProfesor) {
          this.router.navigate(['/profesor/propuestas/asignadas']);
        }
      },
      error: () => this.notificationService.error('No se pudo guardar la revisión')
    });
  }

  // ===== MANEJO DE ARCHIVOS =====
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.validarYAsignarArchivo(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validarYAsignarArchivo(files[0]);
    }
  }

  private validarYAsignarArchivo(file: File): void {
    this.archivoError = '';

    // Validar tipo de archivo
    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!tiposPermitidos.includes(file.type)) {
      this.archivoError = 'Solo se permiten archivos PDF o Word (.doc, .docx)';
      return;
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.archivoError = 'El archivo no debe superar los 10MB';
      return;
    }

    this.archivoRevisado = file;
  }

  removerArchivo(): void {
    this.archivoRevisado = null;
    this.archivoError = '';
  }

  // ===== HISTORIAL DE REVISIONES =====
  cargarHistorialRevisiones(): void {
    this.cargandoHistorial = true;
    this.api.get(`/propuestas/${this.propuestaId}/historial-revisiones`).subscribe({
      next: (data: any) => {
        this.historialRevisiones = data || [];
        this.cargandoHistorial = false;
        this.cargarArchivosVersionados();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarArchivosVersionados(): void {
    this.api.get(`/propuestas/${this.propuestaId}/archivos`).subscribe({
      next: (data: any) => {
        this.archivosVersionados = data || [];
      },
      error: (err) => {
      }
    });
  }

  toggleHistorial(): void {
    this.mostrarHistorial = !this.mostrarHistorial;
    if (this.mostrarHistorial && this.historialRevisiones.length === 0) {
      this.cargarHistorialRevisiones();
    }
  }

  descargarArchivoRevision(revision: any): void {
    if (!revision.archivo_revision) {
      this.notificationService.warning('Esta revisión no tiene archivo adjunto');
      return;
    }

    this.api.descargarArchivo(revision.archivo_revision).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = revision.nombre_archivo_original || revision.archivo_revision;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.notificationService.error('Error al descargar el archivo');
      }
    });
  }

  descargarArchivoVersionado(archivoId: number, nombreOriginal: string): void {
    this.api.descargarArchivoVersionado(archivoId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreOriginal;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.notificationService.error('Error al descargar el archivo');
      }
    });
  }

  obtenerTipoArchivoLabel(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'propuesta_inicial': 'Propuesta Inicial',
      'revision_profesor': 'Revisión del Profesor',
      'correccion_estudiante': 'Corrección del Estudiante'
    };
    return tipos[tipo] || tipo;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerNombreEstado(estado: string): string {
    const estadosMap: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_revision': 'En Revisión',
      'correcciones': 'Correcciones Solicitadas',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada'
    };
    return estadosMap[estado] || estado;
  }
}
