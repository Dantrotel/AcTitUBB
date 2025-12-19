import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-actualizar-propuesta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-propuesta.html',
  styleUrls: ['./editar-propuesta.scss']
})
export class ActualizarPropuestaComponent implements OnInit {
  propuestaId!: string;
  propuesta: any = { 
    titulo: '', 
    descripcion: '',
    modalidad: '',
    numero_estudiantes: '',
    complejidad_estimada: '',
    duracion_estimada_semestres: '',
    justificacion_complejidad: '',
    area_tematica: '',
    objetivos_generales: '',
    objetivos_especificos: '',
    metodologia_propuesta: '',
    recursos_necesarios: '',
    bibliografia: ''
  };
  userRut = '';
  error = '';
  loading = true;
  saving = false;
  
  // Toast notifications
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  // File management
  nuevoArchivo: File | null = null;
  isDragOver = false;
  archivoError = '';

  // Variables de control para validaciones
  mostrarJustificacionComplejidad = false;
  
  // Estudiantes adicionales
  estudiantes_adicionales: string[] = [];
  mostrarEstudiantesAdicionales = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.verificarToken();
    this.obtenerDatosUsuario();
    this.propuestaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.propuestaId) {
      this.cargarPropuesta();
    }
  }

  private verificarToken(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.mostrarToast('No hay sesión activa. Por favor, inicia sesión.', 'error');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    // Verificar si el token ha expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expTime = payload.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      
      if (currentTime > expTime) {
        this.mostrarToast('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
        localStorage.removeItem('token');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    } catch (error) {
      this.mostrarToast('Token inválido. Por favor, inicia sesión nuevamente.', 'error');
      localStorage.removeItem('token');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  private obtenerDatosUsuario(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRut = payload.rut || '';
      } catch {
      }
    }
  }

  private cargarPropuesta(): void {
    this.loading = true;
    this.error = '';
    
    this.apiService.getPropuestaById(this.propuestaId).subscribe({
      next: (data: any) => {
        // Verificar permisos antes de permitir edición
        if (!this.puedeEditarPropuesta(data)) {
          this.error = 'No tienes permisos para editar esta propuesta';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }
        
        this.propuesta = data;
        
        // Cargar estudiantes adicionales si existen
        if (data.estudiantes && Array.isArray(data.estudiantes)) {
          // Filtrar estudiantes que no sean el creador
          const estudiantesNoCreador = data.estudiantes.filter((e: any) => !e.es_creador);
          this.estudiantes_adicionales = estudiantesNoCreador.map((e: any) => e.rut);
          this.mostrarEstudiantesAdicionales = this.estudiantes_adicionales.length > 0;
        }
        
        // Validar justificación de complejidad al cargar
        this.validarJustificacionComplejidad();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'No se pudo cargar la propuesta';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onEstudiantesChange() {
    this.actualizarEstudiantesAdicionales();
    this.validarJustificacionComplejidad();
  }
  
  actualizarEstudiantesAdicionales() {
    const numEstudiantes = parseInt(this.propuesta.numero_estudiantes);
    
    if (numEstudiantes > 1) {
      this.mostrarEstudiantesAdicionales = true;
      const cantidadAdicionales = numEstudiantes - 1;
      
      // Ajustar tamaño del array
      if (this.estudiantes_adicionales.length < cantidadAdicionales) {
        // Agregar campos vacíos
        while (this.estudiantes_adicionales.length < cantidadAdicionales) {
          this.estudiantes_adicionales.push('');
        }
      } else if (this.estudiantes_adicionales.length > cantidadAdicionales) {
        // Reducir el array
        this.estudiantes_adicionales = this.estudiantes_adicionales.slice(0, cantidadAdicionales);
      }
    } else {
      this.mostrarEstudiantesAdicionales = false;
      this.estudiantes_adicionales = [];
    }
  }
  
  validarRUT(rut: string): boolean {
    const rutPattern = /^\d{7,8}-[0-9kK]{1}$/;
    return rutPattern.test(rut);
  }

  onComplejidadChange() {
    this.validarJustificacionComplejidad();
  }

  private validarJustificacionComplejidad() {
    // Mostrar justificación si hay 2 estudiantes y complejidad baja
    this.mostrarJustificacionComplejidad = 
      this.propuesta.numero_estudiantes === '2' && this.propuesta.complejidad_estimada === 'baja';
    
    // Limpiar justificación si no es necesaria
    if (!this.mostrarJustificacionComplejidad) {
      this.propuesta.justificacion_complejidad = '';
    }
  }

  private validarFormulario(): string | null {
    // Validaciones básicas
    if (!this.propuesta.titulo?.trim()) return 'El título es obligatorio';
    if (!this.propuesta.descripcion?.trim()) return 'La descripción es obligatoria';
    if (!this.propuesta.modalidad) return 'Debes seleccionar una modalidad';
    if (!this.propuesta.numero_estudiantes) return 'Debes especificar el número de estudiantes';
    if (!this.propuesta.complejidad_estimada) return 'Debes seleccionar la complejidad estimada';
    if (!this.propuesta.duracion_estimada_semestres) return 'Debes especificar la duración estimada';
    if (!this.propuesta.area_tematica?.trim()) return 'El área temática es obligatoria';
    if (!this.propuesta.objetivos_generales?.trim()) return 'Los objetivos generales son obligatorios';
    if (!this.propuesta.objetivos_especificos?.trim()) return 'Los objetivos específicos son obligatorios';
    if (!this.propuesta.metodologia_propuesta?.trim()) return 'La metodología propuesta es obligatoria';

    // Validación específica de justificación
    if (this.mostrarJustificacionComplejidad && !this.propuesta.justificacion_complejidad?.trim()) {
      return 'Debes justificar por qué este proyecto requiere 2 estudiantes siendo de complejidad baja';
    }

    // Validaciones de longitud
    if (this.propuesta.titulo.length > 255) return 'El título no puede exceder 255 caracteres';
    if (this.propuesta.descripcion.length > 1000) return 'La descripción no puede exceder 1000 caracteres';
    if (this.propuesta.area_tematica.length > 100) return 'El área temática no puede exceder 100 caracteres';

    // Validar estudiantes adicionales
    if (parseInt(this.propuesta.numero_estudiantes) > 1) {
      const rutSet = new Set();
      
      for (let i = 0; i < this.estudiantes_adicionales.length; i++) {
        const rut = this.estudiantes_adicionales[i]?.trim();
        
        if (!rut) {
          return `Debes ingresar el RUT del Estudiante ${i + 2}`;
        }
        
        if (!this.validarRUT(rut)) {
          return `El RUT del Estudiante ${i + 2} no es válido. Formato: 12345678-9`;
        }
        
        if (rutSet.has(rut)) {
          return `El RUT del Estudiante ${i + 2} está duplicado`;
        }
        
        rutSet.add(rut);
      }
    }

    return null;
  }

  private puedeEditarPropuesta(propuesta: any): boolean {
    // Si el backend envía el flag puedeEditar, usarlo
    if (typeof propuesta.puedeEditar === 'boolean') {
      return propuesta.puedeEditar;
    }
    
    // Verificar si es creador o miembro del equipo
    const esCreador = propuesta.estudiante_rut === this.userRut;
    const esMiembroEquipo = propuesta.estudiantes?.some((e: any) => e.rut === this.userRut);
    const perteneceAlEquipo = esCreador || esMiembroEquipo;
    
    // Solo permitir edición en estados editables
    const estadosEditables = ['pendiente', 'correcciones'];
    const estadoPermiteEdicion = estadosEditables.includes(propuesta.estado_nombre);
    
    return perteneceAlEquipo && estadoPermiteEdicion;
  }

  formatearFechaHoraParaMySQL(date: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
           `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  formatearFecha(fecha: string | Date): string {
    if (!fecha) return 'No disponible';
    
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearTamanioArchivo(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  obtenerEstadoDisplay(estado: string): string {
    const estadosMap: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_revision': 'En Revisión',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'correcciones': 'Correcciones'
    };
    return estadosMap[estado?.toLowerCase()] || estado || 'Sin estado';
  }

  // File management methods
  async eliminarArchivo() {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que quieres eliminar el archivo actual? Esta acción no se puede deshacer.',
      'Eliminar Archivo',
      'Eliminar',
      'Cancelar'
    );
    if (!confirmed) return;
    
    this.propuesta.archivo = null;
    this.mostrarToast('Archivo eliminado. Recuerda guardar los cambios.', 'success');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validarYSeleccionarArchivo(files[0]);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.validarYSeleccionarArchivo(file);
    }
  }

  private validarYSeleccionarArchivo(file: File) {
    this.archivoError = '';
    
    // Validar tipo de archivo
    const tiposPermitidos = ['.pdf', '.doc', '.docx', '.txt'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!tiposPermitidos.includes(extension)) {
      this.archivoError = 'Tipo de archivo no permitido. Solo se aceptan PDF, DOC, DOCX y TXT.';
      return;
    }
    
    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB en bytes
    if (file.size > maxSize) {
      this.archivoError = 'El archivo es demasiado grande. El tamaño máximo es 10MB.';
      return;
    }
    
    this.nuevoArchivo = file;
    this.mostrarToast('Archivo seleccionado correctamente', 'success');
  }

  removerNuevoArchivo() {
    this.nuevoArchivo = null;
    this.archivoError = '';
  }

  actualizar() {
    
    // Validar formulario antes de enviar
    const errorValidacion = this.validarFormulario();
    if (errorValidacion) {
      this.mostrarToast(errorValidacion, 'error');
      return;
    }

    this.saving = true;
    const fecha = new Date(this.propuesta.fecha_envio);
    this.propuesta.fecha_envio = this.formatearFechaHoraParaMySQL(fecha);

    // Si hay un nuevo archivo, enviar con FormData
    if (this.nuevoArchivo) {
      this.actualizarPropuestaConArchivo();
    } else {
      // Si no hay archivo nuevo, enviar solo los datos
      this.actualizarPropuestaSinArchivo();
    }
  }

  private actualizarPropuestaConArchivo() {
    const formData = new FormData();
    
    // Agregar todos los datos de la propuesta
    formData.append('titulo', this.propuesta.titulo);
    formData.append('descripcion', this.propuesta.descripcion);
    formData.append('modalidad', this.propuesta.modalidad);
    formData.append('numero_estudiantes', this.propuesta.numero_estudiantes);
    formData.append('complejidad_estimada', this.propuesta.complejidad_estimada);
    formData.append('duracion_estimada_semestres', this.propuesta.duracion_estimada_semestres);
    formData.append('area_tematica', this.propuesta.area_tematica);
    formData.append('objetivos_generales', this.propuesta.objetivos_generales);
    formData.append('objetivos_especificos', this.propuesta.objetivos_especificos);
    formData.append('metodologia_propuesta', this.propuesta.metodologia_propuesta);

    // Campos opcionales (solo si tienen contenido)
    if (this.propuesta.justificacion_complejidad) {
      formData.append('justificacion_complejidad', this.propuesta.justificacion_complejidad);
    }
    if (this.propuesta.recursos_necesarios) {
      formData.append('recursos_necesarios', this.propuesta.recursos_necesarios);
    }
    if (this.propuesta.bibliografia) {
      formData.append('bibliografia', this.propuesta.bibliografia);
    }
    
    // Agregar estudiantes adicionales
    if (this.estudiantes_adicionales.length > 0) {
      const estudiantesLimpios = this.estudiantes_adicionales
        .map(rut => rut.trim())
        .filter(rut => rut !== '');
      formData.append('estudiantes_adicionales', JSON.stringify(estudiantesLimpios));
    }
    
    // Agregar el archivo
    if (this.nuevoArchivo) {
      formData.append('archivo', this.nuevoArchivo);
    }

    this.mostrarToast('Actualizando propuesta con archivo...', 'success');

    this.apiService.updatePropuestaWithFile(this.propuestaId, formData).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.mostrarToast('Propuesta actualizada con éxito', 'success');
        
        // Limpiar archivo temporal
        this.nuevoArchivo = null;
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          this.volver();
        }, 2000);
      },
      error: (err: any) => {
        this.manejarErrorActualizacion(err);
      }
    });
  }

  private actualizarPropuestaSinArchivo() {
    // Enviar todos los datos sin archivo
    const estudiantesLimpios = this.estudiantes_adicionales
      .map(rut => rut.trim())
      .filter(rut => rut !== '');
    
    const datosActualizacion = {
      titulo: this.propuesta.titulo,
      descripcion: this.propuesta.descripcion,
      modalidad: this.propuesta.modalidad,
      numero_estudiantes: this.propuesta.numero_estudiantes,
      complejidad_estimada: this.propuesta.complejidad_estimada,
      duracion_estimada_semestres: this.propuesta.duracion_estimada_semestres,
      area_tematica: this.propuesta.area_tematica,
      objetivos_generales: this.propuesta.objetivos_generales,
      objetivos_especificos: this.propuesta.objetivos_especificos,
      metodologia_propuesta: this.propuesta.metodologia_propuesta,
      justificacion_complejidad: this.propuesta.justificacion_complejidad || '',
      recursos_necesarios: this.propuesta.recursos_necesarios || '',
      bibliografia: this.propuesta.bibliografia || '',
      estudiantes_adicionales: estudiantesLimpios
    };

    this.apiService.updatePropuesta(this.propuestaId, datosActualizacion).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.mostrarToast('Propuesta actualizada con éxito', 'success');
        
        // Redirigir después de un breve delay
        setTimeout(() => {
          this.volver();
        }, 2000);
      },
      error: (err: any) => {
        this.manejarErrorActualizacion(err);
      }
    });
  }

  private manejarErrorActualizacion(err: any) {
    this.saving = false;
    
    if (err.status === 401) {
      this.mostrarToast('Sesión expirada. Por favor, inicia sesión nuevamente.', 'error');
      setTimeout(() => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }, 3000);
    } else if (err.status === 403) {
      this.mostrarToast('No tienes permisos para actualizar esta propuesta', 'error');
    } else if (err.status === 400) {
      this.mostrarToast('Error en los datos enviados. Verifica la información.', 'error');
    } else {
      this.mostrarToast('Error al actualizar la propuesta', 'error');
    }
  }

  recargarPropuesta() {
    this.cargarPropuesta();
  }

  descargarArchivo(nombreArchivo: string) {
    if (!nombreArchivo) {
      this.mostrarToast('No hay archivo para descargar', 'error');
      return;
    }

    this.apiService.descargarArchivo(nombreArchivo).subscribe({
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
        this.mostrarToast('Archivo descargado exitosamente', 'success');
      },
      error: (err) => {
        this.mostrarToast('Error al descargar el archivo', 'error');
      }
    });
  }

  volver() {
    this.location.back();
  }

  // Toast notifications
  mostrarToast(mensaje: string, tipo: 'success' | 'error') {
    this.toastMessage = mensaje;
    this.toastType = tipo;
    this.showToast = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.cerrarToast();
    }, 5000);
  }

  cerrarToast() {
    this.showToast = false;
  }
}
