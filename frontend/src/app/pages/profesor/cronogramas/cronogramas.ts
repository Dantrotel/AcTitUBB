import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-cronogramas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatChipsModule,
    MatBadgeModule
  ],
  templateUrl: './cronogramas.html',
  styleUrls: ['./cronogramas.scss']
})
export class CronogramasComponent implements OnInit {
  // Propiedades del componente
  proyectosAsignados: any[] = [];
  proyectoSeleccionado: any = null;
  cronogramas: any[] = [];
  cronogramaSeleccionado: any = null;
  cronogramaActivo: any = null;
  hitosCronograma: any[] = [];
  showModalCronograma: boolean = false;
  showModalHito: boolean = false;
  mostrarModalCronograma: boolean = false;
  mostrarModalHito: boolean = false;
  mostrarModalRevision: boolean = false;
  editandoCronograma: boolean = false;
  editandoHito: boolean = false;
  cargando: boolean = false;
  loading: boolean = false;
  error: string = '';
  success: string = '';
  
  // Formularios
  nuevoCronograma: any = {
    nombre: '',
    descripcion: '',
    fechaInicio: null,
    fechaFin: null
  };
  
  nuevoHito: any = {
    nombre: '',
    descripcion: '',
    fechaLimite: null,
    tipo: 'tarea',
    estado: 'pendiente',
    archivo: null
  };
  
  revisionHito: any = {
    comentarios_profesor: '',
    calificacion: null,
    estado: ''
  };
  
  cronogramaEditando: any = {};
  hitoEditando: any = {};
  
  // Propiedades para archivos
  archivoSeleccionado: File | null = null;
  maxFileSize: number = 10 * 1024 * 1024; // 10MB
  tiposArchivo: string[] = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit() {
    this.cargarProyectosAsignados();
  }

  async cargarProyectosAsignados() {
    try {
      this.cargando = true;
      this.error = '';
      const response = await this.apiService.getProyectosAsignados().toPromise();
      this.proyectosAsignados = response as any[];
    } catch (error: any) {
      this.error = 'Error al cargar proyectos: ' + (error.error?.message || error.message);
    } finally {
      this.cargando = false;
    }
  }

  async seleccionarProyecto(proyecto: any) {
    this.proyectoSeleccionado = proyecto;
    await this.cargarCronogramas();
  }

  async cargarCronogramas() {
    if (!this.proyectoSeleccionado) return;
    
    try {
      this.cargando = true;
      this.error = '';
      const response = await this.apiService.obtenerCronograma(this.proyectoSeleccionado.id).toPromise();
      this.cronogramas = response as any[];
    } catch (error: any) {
      this.error = 'Error al cargar cronogramas: ' + (error.error?.message || error.message);
    } finally {
      this.cargando = false;
    }
  }

  abrirModalCronograma() {
    this.showModalCronograma = true;
    this.editandoCronograma = false;
    this.nuevoCronograma = {
      nombre: '',
      descripcion: '',
      fechaInicio: null,
      fechaFin: null
    };
  }

  cerrarModalCronograma() {
    this.showModalCronograma = false;
    this.editandoCronograma = false;
    this.limpiarMensajes();
  }

  async guardarCronograma() {
    if (!this.validarCronograma()) return;

    try {
      this.cargando = true;
      this.error = '';
      
      const cronogramaData = {
        ...this.nuevoCronograma,
        proyectoId: this.proyectoSeleccionado.id
      };

      if (this.editandoCronograma) {
        // TODO: Implementar actualización cuando la API lo soporte
        this.error = 'Función de edición no disponible aún';
        return;
      } else {
        await this.apiService.crearCronograma(this.proyectoSeleccionado.id, cronogramaData).toPromise();
        this.success = 'Cronograma creado exitosamente';
      }
      
      await this.cargarCronogramas();
      this.cerrarModalCronograma();
    } catch (error: any) {
      this.error = 'Error al guardar cronograma: ' + (error.error?.message || error.message);
    } finally {
      this.cargando = false;
    }
  }

  editarCronograma(cronograma: any) {
    this.cronogramaEditando = { ...cronograma };
    this.nuevoCronograma = { ...cronograma };
    this.editandoCronograma = true;
    this.showModalCronograma = true;
  }

  async eliminarCronograma(cronogramId: number) {
    if (!confirm('¿Está seguro de eliminar este cronograma?')) return;

    try {
      this.cargando = true;
      this.error = '';
      // TODO: Implementar eliminación cuando la API lo soporte
      this.error = 'Función de eliminación no disponible aún';
    } catch (error: any) {
      this.error = 'Error al eliminar cronograma: ' + (error.error?.message || error.message);
    } finally {
      this.cargando = false;
    }
  }

  seleccionarCronograma(cronograma: any) {
    this.cronogramaSeleccionado = cronograma;
  }

  abrirModalHito() {
    this.showModalHito = true;
    this.editandoHito = false;
    this.nuevoHito = {
      nombre: '',
      descripcion: '',
      fechaLimite: null,
      tipo: 'tarea',
      estado: 'pendiente',
      archivo: null
    };
    this.archivoSeleccionado = null;
  }

  cerrarModalHito() {
    this.showModalHito = false;
    this.editandoHito = false;
    this.archivoSeleccionado = null;
    this.limpiarMensajes();
  }

  async guardarHito() {
    if (!this.validarHito()) return;

    try {
      this.cargando = true;
      this.error = '';
      
      const formData = new FormData();
      formData.append('nombre', this.nuevoHito.nombre);
      formData.append('descripcion', this.nuevoHito.descripcion);
      formData.append('fechaLimite', this.nuevoHito.fechaLimite);
      formData.append('tipo', this.nuevoHito.tipo);
      formData.append('estado', this.nuevoHito.estado);
      
      if (this.archivoSeleccionado) {
        formData.append('archivo', this.archivoSeleccionado);
      }

      if (this.editandoHito) {
        // TODO: Implementar actualización cuando la API lo soporte
        this.error = 'Función de edición de hitos no disponible aún';
        return;
      } else {
        await this.apiService.crearHitoCronograma(this.cronogramaSeleccionado.id, formData).toPromise();
        this.success = 'Hito creado exitosamente';
      }
      
      await this.cargarCronogramas();
      this.cerrarModalHito();
    } catch (error: any) {
      this.error = 'Error al guardar hito: ' + (error.error?.message || error.message);
    } finally {
      this.cargando = false;
    }
  }

  editarHito(hito: any) {
    this.hitoEditando = { ...hito };
    this.nuevoHito = { ...hito };
    this.editandoHito = true;
    this.showModalHito = true;
  }

  async eliminarHito(hitoId: number) {
    if (!confirm('¿Está seguro de eliminar este hito?')) return;

    try {
      this.cargando = true;
      this.error = '';
      // TODO: Implementar eliminación cuando la API lo soporte
      this.error = 'Función de eliminación de hitos no disponible aún';
    } catch (error: any) {
      this.error = 'Error al eliminar hito: ' + (error.error?.message || error.message);
    } finally {
      this.cargando = false;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > this.maxFileSize) {
        this.error = 'El archivo es demasiado grande. Máximo 10MB.';
        return;
      }
      
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.tiposArchivo.includes(extension)) {
        this.error = 'Tipo de archivo no permitido. Tipos permitidos: ' + this.tiposArchivo.join(', ');
        return;
      }
      
      this.archivoSeleccionado = file;
      this.error = '';
    }
  }

  async descargarArchivo(nombreArchivo: string, hitoId?: number) {
    try {
      this.cargando = true;
      this.loading = true;
      this.error = '';
      // TODO: Implementar descarga cuando la API lo soporte
      window.open(`/api/v1/cronogramas/hitos/archivo/${nombreArchivo}`, '_blank');
      this.success = 'Descargando archivo...';
    } catch (error: any) {
      this.error = 'Error al descargar archivo: ' + (error.error?.message || error.message);
    } finally {
      this.cargando = false;
      this.loading = false;
    }
  }

  validarCronograma(): boolean {
    if (!this.nuevoCronograma.nombre?.trim()) {
      this.error = 'El nombre del cronograma es requerido';
      return false;
    }
    if (!this.nuevoCronograma.fechaInicio) {
      this.error = 'La fecha de inicio es requerida';
      return false;
    }
    if (!this.nuevoCronograma.fechaFin) {
      this.error = 'La fecha de fin es requerida';
      return false;
    }
    if (new Date(this.nuevoCronograma.fechaInicio) >= new Date(this.nuevoCronograma.fechaFin)) {
      this.error = 'La fecha de inicio debe ser anterior a la fecha de fin';
      return false;
    }
    return true;
  }

  validarHito(): boolean {
    if (!this.nuevoHito.nombre?.trim()) {
      this.error = 'El nombre del hito es requerido';
      return false;
    }
    if (!this.nuevoHito.fechaLimite) {
      this.error = 'La fecha límite es requerida';
      return false;
    }
    if (!this.cronogramaSeleccionado) {
      this.error = 'Debe seleccionar un cronograma';
      return false;
    }
    return true;
  }

  limpiarMensajes() {
    this.error = '';
    this.success = '';
  }

  volver() {
    this.router.navigate(['/profesor']);
  }

  // Métodos adicionales requeridos por el template
  cerrarModal() {
    this.mostrarModalCronograma = false;
    this.mostrarModalHito = false;
    this.mostrarModalRevision = false;
    this.showModalCronograma = false;
    this.showModalHito = false;
    this.limpiarMensajes();
  }

  async crearCronograma() {
    if (!this.nuevoCronograma.nombre_cronograma?.trim()) {
      this.error = 'El nombre del cronograma es requerido';
      return;
    }

    try {
      this.loading = true;
      this.cargando = true;
      this.error = '';
      
      const cronogramaData = {
        ...this.nuevoCronograma,
        proyecto_id: this.proyectoSeleccionado.id
      };

      await this.apiService.crearCronograma(this.proyectoSeleccionado.id, cronogramaData).toPromise();
      this.success = 'Cronograma creado exitosamente';
      
      await this.cargarCronogramas();
      this.cerrarModal();
    } catch (error: any) {
      this.error = 'Error al crear cronograma: ' + (error.error?.message || error.message);
    } finally {
      this.loading = false;
      this.cargando = false;
    }
  }

  async crearHito() {
    if (!this.nuevoHito.nombre_hito?.trim()) {
      this.error = 'El nombre del hito es requerido';
      return;
    }

    if (!this.nuevoHito.fecha_limite) {
      this.error = 'La fecha límite es requerida';
      return;
    }

    try {
      this.loading = true;
      this.cargando = true;
      this.error = '';
      
      const formData = new FormData();
      formData.append('nombre_hito', this.nuevoHito.nombre_hito);
      formData.append('descripcion', this.nuevoHito.descripcion || '');
      formData.append('fecha_limite', this.nuevoHito.fecha_limite);
      formData.append('tipo_hito', this.nuevoHito.tipo_hito || 'entrega');
      
      if (this.archivoSeleccionado) {
        formData.append('archivo', this.archivoSeleccionado);
      }

      await this.apiService.crearHitoCronograma(this.cronogramaActivo.id, formData).toPromise();
      this.success = 'Hito creado exitosamente';
      
      await this.cargarCronogramas();
      this.cerrarModal();
    } catch (error: any) {
      this.error = 'Error al crear hito: ' + (error.error?.message || error.message);
    } finally {
      this.loading = false;
      this.cargando = false;
    }
  }

  abrirModalRevision(hito: any) {
    this.hitoEditando = hito;
    this.revisionHito = {
      comentarios_profesor: '',
      calificacion: null,
      estado: 'aprobado'
    };
    this.mostrarModalRevision = true;
  }

  async revisarHito() {
    if (!this.revisionHito.comentarios_profesor?.trim()) {
      this.error = 'Los comentarios son requeridos';
      return;
    }

    if (!this.revisionHito.estado) {
      this.error = 'El estado es requerido';
      return;
    }

    try {
      this.loading = true;
      this.cargando = true;
      this.error = '';
      
      await this.apiService.revisarHito(
        this.hitoEditando.id, 
        this.revisionHito
      ).toPromise();
      
      this.success = 'Revisión guardada exitosamente';
      
      await this.cargarCronogramas();
      this.cerrarModal();
    } catch (error: any) {
      this.error = 'Error al guardar revisión: ' + (error.error?.message || error.message);
    } finally {
      this.loading = false;
      this.cargando = false;
    }
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  obtenerIconoTipoHito(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'entrega': 'fas fa-upload',
      'revision': 'fas fa-search',
      'presentacion': 'fas fa-presentation',
      'evaluacion': 'fas fa-check-circle',
      'reunion': 'fas fa-users'
    };
    return iconos[tipo] || 'fas fa-flag';
  }

  obtenerClaseEstado(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'badge-warning',
      'en_progreso': 'badge-info',
      'entregado': 'badge-primary',
      'aprobado': 'badge-success',
      'rechazado': 'badge-danger',
      'correcciones': 'badge-warning'
    };
    return clases[estado] || 'badge-secondary';
  }
}
