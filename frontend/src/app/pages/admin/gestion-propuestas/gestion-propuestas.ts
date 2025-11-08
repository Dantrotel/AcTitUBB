import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'gestion-propuestas',
  templateUrl: './gestion-propuestas.html',
  styleUrls: ['./gestion-propuestas.scss']
})
export class GestionPropuestasComponent implements OnInit {
  propuestas: any[] = [];
  loading = true;
  error = '';
  filtroEstado = '';
  filtroEstudiante = '';
  filtroProfesor = '';
  
  // Evaluaciones
  mostrarModalEvaluacion = false;
  propuestaSeleccionada: any = null;
  evaluaciones: any[] = [];
  evaluacionForm = {
    tipo: 'avance',
    fecha: '',
    nota: '',
    comentarios: '',
    criterios: {
      cumplimiento_objetivos: '',
      calidad_trabajo: '',
      presentacion: '',
      documentacion: ''
    }
  };
  editandoEvaluacion = false;
  evaluacionEditId: string | null = null;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarPropuestas();
  }

  // Método público para cargar propuestas
  cargarPropuestas(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getPropuestas().subscribe({
      next: (data: any) => {
        console.log('🔍 Admin - Propuestas cargadas:', data);
        // Log detallado de la primera propuesta para ver la estructura
        if (data.length > 0) {
          console.log('🔍 Admin - Estructura de la primera propuesta:', JSON.stringify(data[0], null, 2));
        }
        this.propuestas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('🔍 Admin - Error al cargar propuestas:', err);
        this.error = 'Error al cargar las propuestas';
        this.loading = false;
      }
    });
  }

  // Método para obtener la fecha actual en el footer
  fechaActual(): Date {
    return new Date();
  }

  // Filtros
  get propuestasFiltradas(): any[] {
    let filtradas = this.propuestas;

    if (this.filtroEstado) {
      filtradas = filtradas.filter(p => p.estado === this.filtroEstado);
    }

    if (this.filtroEstudiante) {
      filtradas = filtradas.filter(p => 
        p.nombre_estudiante?.toLowerCase().includes(this.filtroEstudiante.toLowerCase()) ||
        p.estudiante_rut?.includes(this.filtroEstudiante)
      );
    }

    if (this.filtroProfesor) {
      filtradas = filtradas.filter(p => 
        p.nombre_profesor?.toLowerCase().includes(this.filtroProfesor.toLowerCase()) ||
        p.profesor_rut?.includes(this.filtroProfesor)
      );
    }

    return filtradas;
  }

  // Navegación
  verDetalle(id: number) {
    this.router.navigate(['/propuestas/ver-detalle', id], {
      queryParams: { from: '/admin/propuestas' }
    });
  }

  editarPropuesta(id: number) {
    this.router.navigate(['/propuestas/editar-propuesta', id]);
  }

  asignarProfesor(id: number) {
    this.router.navigate(['/admin/asignar-profesor', id]);
  }

  eliminarPropuesta(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta propuesta? Esta acción no se puede deshacer.')) {
      this.apiService.deletePropuesta(id.toString()).subscribe({
        next: () => {
          console.log('Propuesta eliminada exitosamente');
          this.cargarPropuestas(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar propuesta:', err);
          alert('Error al eliminar la propuesta');
        }
      });
    }
  }

  volver() {
    // Usar history.back() para volver a la p�gina anterior sin activar guards
    window.history.back();
  }

  limpiarFiltros() {
    this.filtroEstado = '';
    this.filtroEstudiante = '';
    this.filtroProfesor = '';
  }

  obtenerEstadoDisplay(estado: string | undefined): string {
    if (!estado) return 'Sin Estado';
    
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

  // ===== GESTIÓN DE EVALUACIONES =====
  
  abrirModalEvaluaciones(propuesta: any) {
    this.propuestaSeleccionada = propuesta;
    this.mostrarModalEvaluacion = true;
    this.cargarEvaluaciones();
  }

  cerrarModalEvaluacion() {
    this.mostrarModalEvaluacion = false;
    this.propuestaSeleccionada = null;
    this.evaluaciones = [];
    this.limpiarFormularioEvaluacion();
  }

  cargarEvaluaciones() {
    if (!this.propuestaSeleccionada?.id) return;

    this.apiService.getEvaluacionesProyecto(this.propuestaSeleccionada.id.toString()).subscribe({
      next: (data: any) => {
        this.evaluaciones = data;
      },
      error: (err) => {
        console.error('Error al cargar evaluaciones:', err);
        this.error = 'Error al cargar evaluaciones';
      }
    });
  }

  crearEvaluacion() {
    if (!this.propuestaSeleccionada?.id) return;

    const evaluacionData = {
      ...this.evaluacionForm,
      nota: parseFloat(this.evaluacionForm.nota),
      fecha: new Date(this.evaluacionForm.fecha).toISOString()
    };

    if (this.editandoEvaluacion && this.evaluacionEditId) {
      // Actualizar evaluación existente
      this.apiService.actualizarEvaluacionProyecto(
        this.propuestaSeleccionada.id.toString(),
        this.evaluacionEditId,
        evaluacionData
      ).subscribe({
        next: () => {
          this.cargarEvaluaciones();
          this.limpiarFormularioEvaluacion();
          this.editandoEvaluacion = false;
          this.evaluacionEditId = null;
        },
        error: (err) => {
          console.error('Error al actualizar evaluación:', err);
          this.error = 'Error al actualizar evaluación';
        }
      });
    } else {
      // Crear nueva evaluación
      this.apiService.crearEvaluacionProyecto(this.propuestaSeleccionada.id.toString(), evaluacionData).subscribe({
        next: () => {
          this.cargarEvaluaciones();
          this.limpiarFormularioEvaluacion();
        },
        error: (err) => {
          console.error('Error al crear evaluación:', err);
          this.error = 'Error al crear evaluación';
        }
      });
    }
  }

  editarEvaluacion(evaluacion: any) {
    this.evaluacionForm = {
      tipo: evaluacion.tipo,
      fecha: new Date(evaluacion.fecha).toISOString().split('T')[0],
      nota: evaluacion.nota.toString(),
      comentarios: evaluacion.comentarios || '',
      criterios: evaluacion.criterios || {
        cumplimiento_objetivos: '',
        calidad_trabajo: '',
        presentacion: '',
        documentacion: ''
      }
    };
    this.editandoEvaluacion = true;
    this.evaluacionEditId = evaluacion.id;
  }

  eliminarEvaluacion(evaluacionId: string) {
    if (!this.propuestaSeleccionada?.id) return;
    
    if (confirm('¿Estás seguro de eliminar esta evaluación?')) {
      this.apiService.eliminarEvaluacionProyecto(
        this.propuestaSeleccionada.id.toString(),
        evaluacionId
      ).subscribe({
        next: () => {
          this.cargarEvaluaciones();
        },
        error: (err) => {
          console.error('Error al eliminar evaluación:', err);
          this.error = 'Error al eliminar evaluación';
        }
      });
    }
  }

  limpiarFormularioEvaluacion() {
    this.evaluacionForm = {
      tipo: 'avance',
      fecha: '',
      nota: '',
      comentarios: '',
      criterios: {
        cumplimiento_objetivos: '',
        calidad_trabajo: '',
        presentacion: '',
        documentacion: ''
      }
    };
    this.editandoEvaluacion = false;
    this.evaluacionEditId = null;
  }

  obtenerNotaPromedio(): number {
    if (this.evaluaciones.length === 0) return 0;
    const suma = this.evaluaciones.reduce((acc, ev) => acc + parseFloat(ev.nota), 0);
    return Math.round((suma / this.evaluaciones.length) * 10) / 10;
  }

  obtenerColorNota(nota: number): string {
    if (nota >= 5.5) return '#28a745'; // Verde
    if (nota >= 4.0) return '#ffc107'; // Amarillo
    return '#dc3545'; // Rojo
  }

  obtenerTipoEvaluacionDisplay(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'avance': 'Avance',
      'final': 'Final',
      'defensa': 'Defensa',
      'presentacion': 'Presentación'
    };
    return tipos[tipo] || tipo;
  }
} 