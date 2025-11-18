import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-fechas-importantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fechas-importantes.component.html',
  styleUrls: ['./fechas-importantes.component.scss']
})
export class FechasImportantesComponent implements OnInit {
  fechas: any[] = [];
  proyectos: any[] = [];
  mostrarFormulario = false;
  fechaSeleccionada: any = null;
  cargando = false;

  // Formulario
  nuevaFecha = {
    titulo: '',
    descripcion: '',
    fecha_limite: '',
    tipo_fecha: 'entrega',
    proyecto_id: '',
    prioridad: 'media'
  };

  tiposFecha = [
    { value: 'entrega', label: 'Entrega' },
    { value: 'revision', label: 'Revisión' },
    { value: 'presentacion', label: 'Presentación' },
    { value: 'reunion', label: 'Reunión' },
    { value: 'evaluacion', label: 'Evaluación' }
  ];

  prioridades = [
    { value: 'baja', label: 'Baja' },
    { value: 'media', label: 'Media' },
    { value: 'alta', label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarProyectos();
  }

  cargarProyectos() {
    this.apiService.getAllProyectos().subscribe({
      next: (response: any) => {
        this.proyectos = response.data || response;
        if (!Array.isArray(this.proyectos)) {
          this.proyectos = [];
        }
        // Cargar fechas DESPUÉS de tener los proyectos
        this.cargarFechasImportantes();
      },
      error: (error) => {
        console.error('Error al cargar proyectos:', error);
        this.proyectos = [];
        this.cargando = false;
      }
    });
  }

  cargarFechasImportantes() {
    if (this.proyectos.length === 0) {
      this.cargando = false;
      return;
    }

    this.cargando = true;
    this.fechas = [];
    
    const promesas = this.proyectos.map(proyecto => 
      this.apiService.getFechasImportantesProyecto(proyecto.id).toPromise()
    );

    Promise.all(promesas).then(resultados => {
      resultados.forEach((resultado: any, index) => {
        if (resultado?.data) {
          const fechasProyecto = resultado.data.map((fecha: any) => ({
            ...fecha,
            proyecto_nombre: this.proyectos[index].titulo
          }));
          this.fechas = [...this.fechas, ...fechasProyecto];
        }
      });
      this.fechas.sort((a, b) => new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime());
      this.cargando = false;
    }).catch(error => {
      console.error('Error al cargar fechas importantes:', error);
      this.cargando = false;
    });
  }

  mostrarFormularioCrear() {
    this.fechaSeleccionada = null;
    this.nuevaFecha = {
      titulo: '',
      descripcion: '',
      fecha_limite: '',
      tipo_fecha: 'entrega',
      proyecto_id: '',
      prioridad: 'media'
    };
    this.mostrarFormulario = true;
  }

  editarFecha(fecha: any) {
    this.fechaSeleccionada = fecha;
    this.nuevaFecha = {
      titulo: fecha.titulo,
      descripcion: fecha.descripcion,
      fecha_limite: fecha.fecha_limite?.split('T')[0] || '',
      tipo_fecha: fecha.tipo_fecha,
      proyecto_id: fecha.proyecto_id,
      prioridad: fecha.prioridad || 'media'
    };
    this.mostrarFormulario = true;
  }

  guardarFecha() {
    if (!this.validarFormulario()) return;

    this.cargando = true;

    const fechaData = {
      ...this.nuevaFecha,
      fecha_limite: this.nuevaFecha.fecha_limite + 'T23:59:59'
    };

    const operacion = this.fechaSeleccionada 
      ? this.apiService.actualizarFechaImportante(this.nuevaFecha.proyecto_id, this.fechaSeleccionada.id, fechaData)
      : this.apiService.crearFechaImportante(this.nuevaFecha.proyecto_id, fechaData);

    operacion.subscribe({
      next: () => {
        this.mostrarFormulario = false;
        this.cargarFechasImportantes();
      },
      error: (error) => {
        console.error('Error al guardar fecha:', error);
        alert('Error al guardar la fecha. Por favor intente nuevamente.');
        this.cargando = false;
      }
    });
  }

  completarFecha(fecha: any) {
    if (confirm('¿Marcar esta fecha como completada?')) {
      this.apiService.marcarFechaCompletada(fecha.proyecto_id, fecha.id, true).subscribe({
        next: () => {
          this.cargarFechasImportantes();
        },
        error: (error) => {
          console.error('Error al completar fecha:', error);
          alert('Error al completar la fecha. Por favor intente nuevamente.');
        }
      });
    }
  }

  eliminarFecha(fecha: any) {
    if (confirm(`¿Estás seguro de eliminar la fecha "${fecha.titulo}"?`)) {
      this.apiService.eliminarFechaImportante(fecha.proyecto_id, fecha.id).subscribe({
        next: () => {
          this.cargarFechasImportantes();
        },
        error: (error) => {
          console.error('Error al eliminar fecha:', error);
          alert('Error al eliminar la fecha. Por favor intente nuevamente.');
        }
      });
    }
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.fechaSeleccionada = null;
  }

  validarFormulario(): boolean {
    if (!this.nuevaFecha.titulo.trim()) {
      alert('El título es obligatorio');
      return false;
    }
    if (!this.nuevaFecha.fecha_limite) {
      alert('La fecha límite es obligatoria');
      return false;
    }
    if (!this.nuevaFecha.proyecto_id) {
      alert('Debe seleccionar un proyecto');
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

  trackById(index: number, item: any): any {
    return item ? item.id : index;
  }
}