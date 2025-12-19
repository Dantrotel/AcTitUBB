import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'asignar-profesor',
  templateUrl: './asignar-profesor.html',
  styleUrls: ['./asignar-profesor.scss']
})
export class AsignarProfesorComponent implements OnInit {
  propuesta: any = null;
  profesores: any[] = [];
  profesorSeleccionado = '';
  loading = true;
  error = '';
  guardando = false;
  
  // Usuario actual
  usuarioActual: any = null;
  esProfesor = false;
  esAdmin = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.obtenerUsuarioActual();
    const propuestaId = this.route.snapshot.paramMap.get('id');
    if (propuestaId) {
      this.cargarPropuesta(propuestaId);
      this.cargarProfesores();
    }
  }
  
  private obtenerUsuarioActual(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.usuarioActual = payload;
        this.esProfesor = String(payload.rol_id) === '2';
        this.esAdmin = String(payload.rol_id) === '3' || String(payload.rol_id) === '4';
      } catch (error) {
      }
    }
  }

  private cargarPropuesta(id: string): void {
    this.loading = true;
    this.apiService.getPropuestaById(id).subscribe({
      next: (data: any) => {
        
        this.propuesta = data;
        this.loading = false;
        this.cdr.detectChanges();
        
      },
      error: (err) => {
        this.error = 'Error al cargar la propuesta: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  private cargarProfesores(): void {
    this.apiService.getProfesores().subscribe({
      next: (data: any) => {
        const usuarios = Array.isArray(data) ? data : [];
        // Filtrar solo profesores (rol_nombre = 'profesor' o rol_id = 2)
        this.profesores = usuarios.filter((u: any) => 
          u.rol_nombre?.toLowerCase() === 'profesor' || String(u.rol_id) === '2' || u.rol_id === 2
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar los profesores';
        this.cdr.detectChanges();
      }
    });
  }

  async asignarProfesor(): Promise<void> {
    // Si es profesor y no seleccionó ninguno, asignarse a sí mismo
    if (!this.profesorSeleccionado) {
      if (this.esProfesor) {
        return this.asignarmeAMiMismo();
      } else {
        this.notificationService.warning('Por favor selecciona un profesor');
        return;
      }
    }

    this.guardando = true;
    this.cdr.detectChanges();

    const datosAsignacion = {
      propuesta_id: this.propuesta.id,
      profesor_rut: this.profesorSeleccionado
    };

    this.apiService.crearAsignacion(datosAsignacion).subscribe({
      next: (response: any) => {
        this.guardando = false;
        this.notificationService.success('Profesor asignado exitosamente');
        setTimeout(() => this.volver(), 1500);
      },
      error: (err) => {
        
        this.guardando = false;
        
        let errorMsg = 'Error al asignar el profesor';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.status === 0) {
          errorMsg = 'No se pudo conectar al servidor. Verifica que el backend esté ejecutándose.';
        } else if (err.status === 404) {
          errorMsg = 'Propuesta o profesor no encontrado';
        } else if (err.status === 409) {
          errorMsg = 'El profesor ya está asignado a esta propuesta';
        }
        
        this.notificationService.error(errorMsg);
        this.cdr.detectChanges();
      }
    });
  }

  async asignarmeAMiMismo(): Promise<void> {
    
    this.guardando = true;
    this.cdr.detectChanges();

    // Usar el endpoint que toma el RUT del token JWT
    this.apiService.asignarPropuesta(this.propuesta.id.toString(), {}).subscribe({
      next: (response: any) => {
        this.guardando = false;
        this.notificationService.success('Te has asignado exitosamente a esta propuesta');
        setTimeout(() => this.volver(), 1500);
      },
      error: (err) => {
        
        this.guardando = false;
        
        let errorMsg = 'Error al asignarse a la propuesta';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.status === 0) {
          errorMsg = 'No se pudo conectar al servidor. Verifica que el backend esté ejecutándose.';
        } else if (err.status === 400) {
          errorMsg = 'Datos incompletos para la asignación';
        }
        
        this.notificationService.error(errorMsg);
        this.cdr.detectChanges();
      }
    });
  }

  async quitarAsignacion(): Promise<void> {
    // Para quitar una asignación, necesitamos el ID de la asignación
    // Redireccionar a la página de gestión de asignaciones
    this.notificationService.info(
      'Para quitar una asignación, dirígete a la página de "Gestión de Asignaciones"',
      'Información'
    );
    this.router.navigate(['/admin/asignaciones']);
  }

  volver() {
    // Usar history.back() para volver a la p�gina anterior sin activar guards
    window.history.back();
  }

  obtenerEstadoDisplay(estado: string | undefined): string {
    if (!estado) return 'Sin estado';
    
    const estadosMap: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_revision': 'En Revisión',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'correcciones': 'Correcciones'
    };
    return estadosMap[estado] || estado;
  }

  obtenerClaseEstado(estado: string | undefined): string {
    if (!estado) return 'estado-sin-estado';
    
    const estadoLower = estado.toLowerCase();
    if (estadoLower === 'pendiente') return 'estado-pendiente';
    if (estadoLower === 'en_revision') return 'estado-revision';
    if (estadoLower === 'aprobada') return 'estado-aprobada';
    if (estadoLower === 'rechazada') return 'estado-rechazada';
    if (estadoLower === 'correcciones') return 'estado-correcciones';
    return 'estado-sin-estado';
  }

  formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Método para obtener la fecha actual en el footer
  fechaActual(): Date {
    return new Date();
  }
} 