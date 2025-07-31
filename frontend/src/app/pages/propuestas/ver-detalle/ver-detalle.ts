import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ApiService } from '../../../services/api';
import { ActivatedRoute, Router } from '@angular/router';

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
  userRut = '';
  userRole = '';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
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
        
        console.log('🔍 Token payload:', payload);
        console.log('🔍 User RUT:', this.userRut);
        console.log('🔍 User Role:', this.userRole);
        
        // Determinar el tipo de usuario (manejar tanto string como number)
        this.esEstudiante = String(this.userRole) === '1';
        this.esProfesor = String(this.userRole) === '2';
        this.esAdmin = String(this.userRole) === '3';
        
        console.log('🔍 Tipo de usuario:', {
          esEstudiante: this.esEstudiante,
          esProfesor: this.esProfesor,
          esAdmin: this.esAdmin
        });
      } catch (error) {
        console.error('Error al decodificar token:', error);
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

    console.log('🔍 Frontend - Iniciando carga de propuesta ID:', id);
    console.log('🔍 Frontend - User RUT:', this.userRut);
    console.log('🔍 Frontend - User Role:', this.userRole);
    console.log('🔍 Frontend - From route:', fromRoute);

    this.api.getPropuestaById(id).subscribe({
      next: (data: any) => {
        console.log('🔍 Frontend - Propuesta obtenida exitosamente:', data);
        this.propuesta = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('🔍 Frontend - Error al cargar propuesta:', err);
        if (err.status === 403) {
          this.error = 'No tienes permisos para ver esta propuesta';
        } else {
          this.error = 'No se pudo cargar la propuesta';
        }
        this.loading = false;
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
      console.error('No hay archivo para descargar');
      return;
    }

    this.api.descargarArchivo(nombreArchivo).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar archivo:', err);
        alert('Error al descargar el archivo');
      }
    });
  }

  asignarme() {
    if (!this.propuesta || !this.esProfesor) {
      alert('No tienes permisos para realizar esta acción');
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
        console.error('Error al decodificar token');
      }
    }

    if (!profesorRut) {
      alert('No se encontró el RUT del profesor');
      return;
    }

    // Aquí se implementaría la lógica para asignar la propuesta al profesor
    console.log('Asignando propuesta', this.propuesta.id, 'al profesor', profesorRut);
    alert('Funcionalidad de asignación en desarrollo');
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
    const puedeEditar = this.esEstudiante && this.propuesta && this.propuesta.estudiante_rut === this.userRut;
    console.log('🔍 Puede editar propuesta:', {
      esEstudiante: this.esEstudiante,
      estudianteRut: this.propuesta?.estudiante_rut,
      userRut: this.userRut,
      puedeEditar: puedeEditar
    });
    return puedeEditar;
  }

  // Verificar si el profesor puede dejar comentarios (solo si la propuesta está asignada a él)
  puedeDejarComentarios(): boolean {
    const puedeComentar = this.esProfesor && this.propuesta && this.propuesta.profesor_rut === this.userRut;
    console.log('🔍 Puede dejar comentarios:', {
      esProfesor: this.esProfesor,
      profesorRut: this.propuesta?.profesor_rut,
      userRut: this.userRut,
      puedeComentar: puedeComentar
    });
    return puedeComentar;
  }

  // Verificar si el administrador puede asignar profesores
  puedeAsignarProfesor(): boolean {
    return this.esAdmin && this.propuesta;
  }

  // Verificar si el administrador puede eliminar propuestas
  puedeEliminarPropuesta(): boolean {
    return this.esAdmin && this.propuesta;
  }

  // Método para ir a la página de revisión (dejar comentarios)
  dejarComentarios(id: number) {
    this.router.navigate(['/profesor/propuestas/revisar', id]);
  }

  // Método para asignar profesor (solo admin)
  asignarProfesor(id: number) {
    this.router.navigate(['/admin/asignar-profesor', id]);
  }

  // Método para eliminar propuesta (solo admin)
  eliminarPropuesta(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta propuesta? Esta acción no se puede deshacer.')) {
      this.api.deletePropuesta(id.toString()).subscribe({
        next: () => {
          console.log('Propuesta eliminada exitosamente');
          alert('Propuesta eliminada exitosamente');
          this.volver();
        },
        error: (err) => {
          console.error('Error al eliminar propuesta:', err);
          alert('Error al eliminar la propuesta');
        }
      });
    }
  }
}

