import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api';

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const propuestaId = this.route.snapshot.paramMap.get('id');
    if (propuestaId) {
      this.cargarPropuesta(propuestaId);
      this.cargarProfesores();
    }
  }

  private cargarPropuesta(id: string): void {
    this.apiService.getPropuestaById(id).subscribe({
      next: (data: any) => {
        console.log('🔍 Admin - Propuesta cargada:', data);
        this.propuesta = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('🔍 Admin - Error al cargar propuesta:', err);
        this.error = 'Error al cargar la propuesta';
        this.loading = false;
      }
    });
  }

  private cargarProfesores(): void {
    this.apiService.getProfesores().subscribe({
      next: (data: any) => {
        this.profesores = data;
        console.log('Profesores cargados:', data);
      },
      error: (err) => {
        console.error('Error al cargar profesores:', err);
        this.error = 'Error al cargar los profesores';
      }
    });
  }

  asignarProfesor(): void {
    if (!this.profesorSeleccionado) {
      alert('Por favor selecciona un profesor');
      return;
    }

    this.guardando = true;

    const datosAsignacion = {
      propuesta_id: this.propuesta.id,
      profesor_rut: this.profesorSeleccionado
    };

    this.apiService.crearAsignacion(datosAsignacion).subscribe({
      next: (response: any) => {
        console.log('🔍 Admin - Profesor asignado exitosamente:', response);
        this.guardando = false;
        alert('Profesor asignado exitosamente');
        this.volver();
      },
      error: (err) => {
        console.error('🔍 Admin - Error al asignar profesor:', err);
        this.guardando = false;
        alert('Error al asignar el profesor');
      }
    });
  }

  quitarAsignacion(): void {
    if (confirm('¿Estás seguro de que quieres quitar la asignación del profesor?')) {
      this.guardando = true;

      const datosAsignacion = {
        profesor_rut: null
      };

      this.apiService.asignarPropuesta(this.propuesta.id.toString(), datosAsignacion).subscribe({
        next: (response: any) => {
          console.log('🔍 Admin - Asignación removida exitosamente:', response);
          this.guardando = false;
          alert('Asignación removida exitosamente');
          this.volver();
        },
        error: (err) => {
          console.error('🔍 Admin - Error al remover asignación:', err);
          this.guardando = false;
          alert('Error al remover la asignación');
        }
      });
    }
  }

  volver() {
    this.router.navigate(['/admin/propuestas']);
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