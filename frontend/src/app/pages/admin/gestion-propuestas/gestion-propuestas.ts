import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';
import { NavbarComponent } from '../../../components/navbar/navbar.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
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
  userName = '';
  
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
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.nombre || 'Jefe de Curso';
    }
    this.cargarPropuestas();
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

  // Método público para cargar propuestas
  cargarPropuestas(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.apiService.getPropuestas().subscribe({
      next: (data: any) => {
        // Log detallado de la primera propuesta para ver la estructura
        if (data.length > 0) {
        }
        this.propuestas = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar las propuestas';
        this.loading = false;
        this.cdr.detectChanges();
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

  async eliminarPropuesta(id: number) {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que quieres eliminar esta propuesta? Esta acción no se puede deshacer.',
      'Eliminar Propuesta',
      'Eliminar',
      'Cancelar'
    );
    
    if (!confirmed) return;
    
    this.apiService.deletePropuesta(id.toString()).subscribe({
      next: () => {
        this.notificationService.success('Propuesta eliminada exitosamente');
        this.cargarPropuestas(); // Recargar la lista
      },
      error: (err) => {
        this.notificationService.error('Error al eliminar la propuesta');
      }
    });
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
    // Las evaluaciones fueron eliminadas del sistema
  }

  cerrarModalEvaluacion() {
    this.mostrarModalEvaluacion = false;
    this.propuestaSeleccionada = null;
    this.evaluaciones = [];
    this.limpiarFormularioEvaluacion();
  }

  // Las evaluaciones fueron eliminadas del sistema
  // cargarEvaluaciones() {
  //   if (!this.propuestaSeleccionada?.id) return;
  //   // Método deshabilitado
  // }

  // Las evaluaciones fueron eliminadas del sistema
  // crearEvaluacion() {
  //   Método deshabilitado
  // }

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

  // Las evaluaciones fueron eliminadas del sistema
  // eliminarEvaluacion(evaluacionId: string) {
  //   Método deshabilitado
  // }

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