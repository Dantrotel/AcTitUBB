import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ver-propuesta',
  templateUrl: './ver-detalle.html',
  styleUrls: ['./ver-detalle.scss']
})
export class VerPropuestaComponent implements OnInit {
  propuesta: any = null;
  loading = true;
  error = '';
  esProfesor = false;
  esEstudiante = false;
  esAdmin = false;
  esSuperAdmin = false;
  userRut = '';
  userRole = '';
  archivosVersionados: any[] = [];
  private notificationService = inject(NotificationService);

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.verificarTipoUsuario();
    this.cargarPropuesta();
  }

  private verificarTipoUsuario(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRut = payload.rut || '';
        this.userRole = payload.rol_id || '';
        // Determinar el tipo de usuario (manejar tanto string como number)
        this.esEstudiante = String(this.userRole) === '1';
        this.esProfesor = String(this.userRole) === '2';
        this.esAdmin = String(this.userRole) === '3';
        this.esSuperAdmin = String(this.userRole) === '4';
      } catch (error) {
      }
    }
  }

  private cargarPropuesta(): void {
    this.loading = true;
    this.error = '';

    const id = this.route.snapshot.paramMap.get('id');
    const fromRoute = this.route.snapshot.queryParamMap.get('from');
    
    if (!id) {
      this.error = 'ID de propuesta no válido';
      this.loading = false;
      return;
    }


    this.api.getPropuestaById(id).subscribe({
      next: (data: any) => {
        this.propuesta = data;
        this.loading = false;
        this.cargarArchivosVersionados(id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 403) {
          this.error = 'No tienes permisos para ver esta propuesta';
        } else {
          this.error = 'No se pudo cargar la propuesta';
        }
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarArchivosVersionados(propuestaId: string): void {
    this.api.get(`/propuestas/${propuestaId}/archivos`).subscribe({
      next: (data: any) => {
        this.archivosVersionados = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
      }
    });
  }

  obtenerEstadoDisplay(estado: string): string {
    const estadosMap: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_revision': 'En Revisión',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'correcciones': 'Correcciones'
    };
    return estadosMap[estado] || estado;
  }

  obtenerClaseEstado(estado: string): string {
    const estadoLower = estado?.toLowerCase();
    if (estadoLower === 'pendiente') return 'estado-pendiente';
    if (estadoLower === 'en_revision' || estadoLower === 'en revisión') return 'estado-en-revision';
    if (estadoLower === 'aprobada') return 'estado-aprobada';
    if (estadoLower === 'rechazada') return 'estado-rechazada';
    if (estadoLower === 'correcciones') return 'estado-correcciones';
    return 'estado-sin-estado';
  }

  descargarArchivo(nombreArchivo: string) {
    if (!nombreArchivo) {
      return;
    }

    this.api.descargarArchivo(nombreArchivo).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // Usar el nombre original si está disponible, sino usar el nombre del archivo
        const nombreDescarga = this.propuesta.nombre_archivo_original || nombreArchivo;
        link.download = nombreDescarga;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.notificationService.error('Error al descargar el archivo');
      }
    });
  }

  asignarme() {
    if (!this.propuesta || !this.esProfesor) {
      this.notificationService.warning('No tienes permisos para realizar esta acción');
      return;
    }

    // Obtener el RUT del profesor desde el token
    const token = localStorage.getItem('token');
    let profesorRut = '';
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        profesorRut = payload.rut || '';
      } catch {
      }
    }

    if (!profesorRut) {
      this.notificationService.error('No se encontró el RUT del profesor');
      return;
    }

    // Aquí se implementaría la lógica para asignar la propuesta al profesor
    this.notificationService.info('Funcionalidad de asignación en desarrollo');
  }

  revisarPropuesta(id: number) {
    this.router.navigate(['/profesor/propuestas/revisar', id]);
  }

  editarPropuesta(id: number) {
    this.router.navigate(['/propuestas/editar-propuesta', id]);
  }

  volver() {
    // Obtener el parámetro 'from' para saber desde dónde viene
    const fromRoute = this.route.snapshot.queryParamMap.get('from');
    
    if (fromRoute) {
      // Si hay un parámetro 'from', usar esa ruta
      this.router.navigate([fromRoute]);
    } else if (window.history.length > 1) {
      // Si no hay parámetro 'from' pero hay historial, volver atrás
      this.location.back();
    } else {
      // Si no hay historial, usar la lógica por defecto según el rol
      if (this.esProfesor) {
        // Para profesores, ir a la página de propuestas asignadas
        this.router.navigate(['/profesor/propuestas/asignadas']);
      } else if (this.esEstudiante) {
        // Para estudiantes, ir a su página principal
        this.router.navigate(['/estudiante']);
      } else {
        // Para otros roles, ir a la página principal
        this.router.navigate(['/']);
      }
    }
  }

  recargarPropuesta() {
    this.cargarPropuesta();
  }

  fechaActual(): Date {
    return new Date();
  }

  // Verificar si el usuario puede editar la propuesta (solo estudiantes que crearon la propuesta)
  puedeEditarPropuesta(): boolean {
    // Si el backend envía el flag puedeEditar, usarlo
    if (this.propuesta && typeof this.propuesta.puedeEditar === 'boolean') {
      return this.propuesta.puedeEditar;
    }
    // Fallback: verificar si es estudiante y (creador o miembro del equipo)
    if (!this.esEstudiante || !this.propuesta) {
      return false;
    }
    const esCreador = this.propuesta.estudiante_rut === this.userRut;
    const esMiembroEquipo = this.propuesta.estudiantes?.some((e: any) => e.rut === this.userRut);
    const perteneceAlEquipo = esCreador || esMiembroEquipo;
    // Solo permitir edición en estados editables
    const estadosEditables = ['pendiente', 'correcciones'];
    const estadoPermiteEdicion = estadosEditables.includes(this.propuesta.estado_nombre);
    return perteneceAlEquipo && estadoPermiteEdicion;
  }

  // Verificar si el usuario puede dejar comentarios (profesor asignado, admin o superadmin)
  puedeDejarComentarios(): boolean {
    // SuperAdmin puede revisar todas las propuestas
    if (this.esSuperAdmin && this.propuesta) {
      return true;
    }
    // Admin puede revisar propuestas de sus carreras (validado por backend)
    if (this.esAdmin && this.propuesta) {
      return true;
    }
    // Profesor solo si está asignado a la propuesta
    return this.esProfesor && this.propuesta && this.propuesta.profesor_rut === this.userRut;
  }

  // Verificar si el administrador o superadmin puede asignar profesores
  puedeAsignarProfesor(): boolean {
    return !!((this.esAdmin || this.esSuperAdmin) && this.propuesta);
  }

  // Verificar si el administrador o superadmin puede eliminar propuestas
  puedeEliminarPropuesta(): boolean {
    return !!((this.esAdmin || this.esSuperAdmin) && this.propuesta);
  }

  // Método para ir a la página de revisión (dejar comentarios)
  dejarComentarios(id: number) {
    // Redirigir según el rol del usuario
    if (this.esSuperAdmin) {
      this.router.navigate(['/super-admin/propuestas/revisar', id]);
    } else if (this.esAdmin) {
      this.router.navigate(['/admin/propuestas/revisar', id]);
    } else if (this.esProfesor) {
      this.router.navigate(['/profesor/propuestas/revisar', id]);
    }
  }

  // Método para asignar profesor (solo admin)
  asignarProfesor(id: number) {
    this.router.navigate(['/admin/asignar-profesor', id]);
  }

  // Método para eliminar propuesta (solo admin)
  async eliminarPropuesta(id: number) {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que quieres eliminar esta propuesta? Esta acción no se puede deshacer.',
      'Confirmar eliminación',
      'Eliminar',
      'Cancelar'
    );
    
    if (confirmed) {
      this.api.deletePropuesta(id.toString()).subscribe({
        next: () => {
          this.notificationService.success('Propuesta eliminada exitosamente');
          this.volver();
        },
        error: (err) => {
          this.notificationService.error('Error al eliminar la propuesta');
        }
      });
    }
  }

  // Método para subir corrección (solo estudiante cuando estado = 'correcciones')
  subirCorreccion(id: number) {
    // Crear un input file temporal para seleccionar archivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Validar tamaño (10MB)
        if (file.size > 10 * 1024 * 1024) {
          this.notificationService.error('El archivo no debe superar los 10MB');
          return;
        }

        // Validar tipo
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
          this.notificationService.error('Solo se permiten archivos PDF, DOC o DOCX');
          return;
        }

        // Crear FormData y subir
        const formData = new FormData();
        formData.append('archivo_revision', file);

        this.api.subirCorreccion(id, formData).subscribe({
          next: () => {
            this.notificationService.success('Corrección subida exitosamente. La propuesta ha sido enviada nuevamente a revisión.');
            this.cargarPropuesta(); // Recargar propuesta
          },
          error: (err) => {
            this.notificationService.error(err.error?.message || 'Error al subir la corrección');
          }
        });
      }
    };

    input.click();
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
}

