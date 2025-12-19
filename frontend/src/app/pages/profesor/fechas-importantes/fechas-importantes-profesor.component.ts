import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-fechas-importantes-profesor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fechas-importantes-profesor.component.html',
  styleUrls: ['./fechas-importantes-profesor.component.scss']
})
export class FechasImportantesProfesorComponent implements OnInit {
  proyectosAsignados: any[] = [];
  fechasImportantes: any[] = [];
  mostrarFormulario = false;
  fechaSeleccionada: any = null;
  cargando = false;
  proyectoSeleccionado = '';

  // Formulario para nueva fecha importante
  nuevaFecha = {
    titulo: '',
    descripcion: '',
    fecha_limite: '',
    tipo_fecha: 'entrega',
    proyecto_id: '',
    prioridad: 'media'
  };

  readonly tiposFecha = [
    { value: 'entrega', label: 'Entrega de Avance' },
    { value: 'revision', label: 'Revisión de Documento' },
    { value: 'presentacion', label: 'Presentación' },
    { value: 'reunion', label: 'Reunión de Seguimiento' },

    { value: 'defensa', label: 'Defensa de Tesis' }
  ];

  readonly prioridades = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarProyectosAsignados();
  }

  cargarProyectosAsignados() {
    this.cargando = true;
    // // // console.log('🔍 FechasProfesor - Cargando proyectos asignados...');
    
    // Cargar proyectos donde el profesor es guía o co-guía
    this.apiService.getProyectosAsignados().subscribe({
      next: (response: any) => {
        // // // console.log('🔍 FechasProfesor - Proyectos asignados:', response);
        // El API devuelve { total, projects }
        if (response && response.projects) {
          this.proyectosAsignados = Array.isArray(response.projects) ? response.projects : [];
        } else {
          this.proyectosAsignados = Array.isArray(response) ? response : [];
        }
        this.cdr.detectChanges(); // Forzar detección de cambios
        this.cargarTodasLasFechas();
      },
      error: (error) => {
        // console.error('❌ Error al cargar proyectos del profesor:', error);
        this.proyectosAsignados = [];
        this.cargando = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      }
    });
  }

  cargarTodasLasFechas() {
    if (this.proyectosAsignados.length === 0) {
      this.fechasImportantes = [];
      this.cargando = false;
      return;
    }

    // // // console.log('🔍 FechasProfesor - Cargando fechas de todos los proyectos...');
    this.fechasImportantes = [];

    // Cargar fechas importantes de todos los proyectos asignados
    const promesasFechas = this.proyectosAsignados.map(proyecto => 
      this.apiService.getFechasImportantesProyecto(proyecto.id).toPromise().catch(() => [])
    );

    Promise.all(promesasFechas).then(resultados => {
      this.fechasImportantes = [];
      resultados.forEach((response: any, index) => {
        // Manejar la respuesta del backend: { success: true, data: { fechas_importantes: [...] } }
        let fechas = [];
        if (response && response.success && response.data && response.data.fechas_importantes) {
          fechas = response.data.fechas_importantes;
        } else if (response && Array.isArray(response)) {
          fechas = response;
        }
        
        if (fechas.length > 0) {
          const fechasConProyecto = fechas.map((fecha: any) => ({
            ...fecha,
            proyecto_titulo: this.proyectosAsignados[index]?.titulo || 'Sin título',
            estudiante_nombre: this.proyectosAsignados[index]?.estudiante_nombre || 'Sin asignar'
          }));
          this.fechasImportantes.push(...fechasConProyecto);
        }
      });

      // Ordenar por fecha límite
      this.fechasImportantes.sort((a, b) => 
        new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime()
      );

      // // // console.log('✅ FechasProfesor - Fechas cargadas:', this.fechasImportantes);
      this.cargando = false;
      this.cdr.detectChanges(); // Forzar detección de cambios
    }).catch(error => {
      // console.error('❌ Error cargando fechas:', error);
      this.cargando = false;
      this.cdr.detectChanges(); // Forzar detección de cambios
    });
  }

  cargarFechasDeProyecto(proyectoId: string) {
    if (!proyectoId) {
      this.cargarTodasLasFechas();
      return;
    }

    this.cargando = true;
    this.apiService.getFechasImportantesProyecto(proyectoId).subscribe({
      next: (response: any) => {
        const proyecto = this.proyectosAsignados.find(p => p.id === proyectoId);
        
        // Manejar la respuesta del backend: { success: true, data: { fechas_importantes: [...] } }
        let fechas = [];
        if (response && response.success && response.data && response.data.fechas_importantes) {
          fechas = response.data.fechas_importantes;
        } else if (response && Array.isArray(response)) {
          fechas = response;
        }
        
        this.fechasImportantes = fechas.map((fecha: any) => ({
          ...fecha,
          proyecto_titulo: proyecto?.titulo || 'Sin título',
          estudiante_nombre: proyecto?.estudiante_nombre || 'Sin asignar'
        }));
        this.cargando = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
      error: (error) => {
        // console.error('❌ Error cargando fechas del proyecto:', error);
        this.fechasImportantes = [];
        this.cargando = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      }
    });
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.fechaSeleccionada = null;
    this.limpiarFormulario();
  }

  crearFechaImportante() {
    if (!this.validarFormulario()) return;

    // // // console.log('🔍 FechasProfesor - Creando fecha importante:', this.nuevaFecha);

    // Preparar datos sin proyecto_id (va en la URL)
    const fechaData = {
      titulo: this.nuevaFecha.titulo,
      descripcion: this.nuevaFecha.descripcion,
      fecha_limite: this.nuevaFecha.fecha_limite,
      tipo_fecha: this.nuevaFecha.tipo_fecha
    };

    this.apiService.crearFechaImportante(this.nuevaFecha.proyecto_id, fechaData).subscribe({
      next: (response) => {
        // // // console.log('✅ Fecha importante creada:', response);
        this.notificationService.success('Fecha importante creada exitosamente');
        this.mostrarFormulario = false;
        this.cargarTodasLasFechas();
        this.limpiarFormulario();
      },
      error: (error) => {
        // console.error('❌ Error al crear fecha importante:', error);
        this.notificationService.error('Error al crear la fecha importante', 'Intenta de nuevo');
      }
    });
  }

  editarFecha(fecha: any) {
    this.fechaSeleccionada = fecha;
    // El campo en la BD se llama 'fecha', no 'fecha_limite'
    const fechaValor = fecha.fecha || fecha.fecha_limite;
    this.nuevaFecha = {
      titulo: fecha.titulo,
      descripcion: fecha.descripcion || '',
      fecha_limite: fechaValor ? new Date(fechaValor).toISOString().split('T')[0] : '',
      tipo_fecha: fecha.tipo_fecha,
      proyecto_id: fecha.proyecto_id.toString(),
      prioridad: fecha.prioridad || 'media'
    };
    this.mostrarFormulario = true;
  }

  actualizarFecha() {
    if (!this.validarFormulario()) return;

    this.apiService.actualizarFechaImportante(
      this.fechaSeleccionada.proyecto_id,
      this.fechaSeleccionada.id,
      this.nuevaFecha
    ).subscribe({
      next: (response) => {
        // // // console.log('✅ Fecha importante actualizada:', response);
        this.mostrarFormulario = false;
        this.fechaSeleccionada = null;
        this.cargarTodasLasFechas();
        this.limpiarFormulario();
      },
      error: (error) => {
        // console.error('❌ Error al actualizar fecha importante:', error);
        this.notificationService.error('Error al actualizar la fecha importante', 'Intenta de nuevo');
      }
    });
  }

  async eliminarFecha(fecha: any): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Estás seguro de eliminar la fecha "${fecha.titulo}"?`,
      'Eliminar Fecha',
      'Eliminar',
      'Cancelar'
    );
    if (!confirmed) return;

    this.apiService.eliminarFechaImportante(fecha.proyecto_id, fecha.id).subscribe({
      next: () => {
        this.notificationService.success('Fecha eliminada correctamente');
        this.cargarTodasLasFechas();
      },
      error: (error) => {
        // console.error('❌ Error al eliminar fecha importante:', error);
        this.notificationService.error('Error al eliminar la fecha importante', 'Intenta de nuevo');
      }
    });
  }

  marcarCompletada(fecha: any) {
    const estadoNuevo = !fecha.completada;
    this.apiService.marcarFechaCompletada(fecha.proyecto_id, fecha.id, estadoNuevo).subscribe({
      next: () => {
        fecha.completada = estadoNuevo;
        // console.log(`✅ Fecha ${estadoNuevo ? 'completada' : 'marcada como pendiente'}`);
      },
      error: (error) => {
        // console.error('❌ Error al cambiar estado de la fecha:', error);
        this.notificationService.error('Error al cambiar el estado de la fecha');
      }
    });
  }

  limpiarFormulario() {
    this.nuevaFecha = {
      titulo: '',
      descripcion: '',
      fecha_limite: '',
      tipo_fecha: 'entrega',
      proyecto_id: '',
      prioridad: 'media'
    };
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.fechaSeleccionada = null;
    this.limpiarFormulario();
  }

  validarFormulario(): boolean {
    if (!this.nuevaFecha.titulo.trim()) {
      this.notificationService.warning('El título es obligatorio');
      return false;
    }
    if (!this.nuevaFecha.fecha_limite) {
      this.notificationService.warning('La fecha límite es obligatoria');
      return false;
    }
    if (!this.nuevaFecha.proyecto_id) {
      this.notificationService.warning('Debe seleccionar un proyecto');
      return false;
    }
    return true;
  }

  obtenerClasePrioridad(prioridad: string): string {
    const clases = {
      'baja': 'prioridad-baja',
      'media': 'prioridad-media', 
      'alta': 'prioridad-alta',
      'critica': 'prioridad-critica'
    };
    return clases[prioridad as keyof typeof clases] || 'prioridad-media';
  }

  obtenerIconoTipo(tipo: string): string {
    const iconos = {
      'entrega': 'fas fa-upload',
      'revision': 'fas fa-search',
      'presentacion': 'fas fa-presentation',
      'reunion': 'fas fa-users',

      'defensa': 'fas fa-graduation-cap'
    };
    return iconos[tipo as keyof typeof iconos] || 'fas fa-calendar-alt';
  }

  obtenerClaseEstado(fecha: any): string {
    if (fecha.completada) return 'estado-completada';
    
    const ahora = new Date();
    const fechaLimite = new Date(fecha.fecha_limite);
    const diferenciaDias = Math.ceil((fechaLimite.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diferenciaDias < 0) return 'estado-vencida';
    if (diferenciaDias <= 3) return 'estado-proxima';
    return 'estado-normal';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get fechasProximas(): number {
    return this.fechasImportantes.filter(f => 
      this.diasHastaFecha(f.fecha_limite) <= 3 && !f.completada
    ).length;
  }

  diasHastaFecha(fecha: string): number {
    const ahora = new Date();
    const fechaLimite = new Date(fecha);
    return Math.ceil((fechaLimite.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
  }

  volver() {
    window.history.back();
  }
}