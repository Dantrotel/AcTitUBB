import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-crear-propuesta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-propuesta.html',
  styleUrls: ['./crear-propuesta.scss']
})
export class CrearPropuestaComponent {
  // Campos básicos existentes
  titulo = '';
  descripcion = '';
  archivo: File | null = null;
  isSubmitting = false;

  // Tipo de proyecto
  tipo_proyecto: 'PT' | 'AP' = 'PT';
  continua_ap = false;
  tieneAPCompletado = false; // se detecta al cargar el componente

  // Nuevos campos del modelo
  modalidad = '';
  numero_estudiantes = '';
  duracion_estimada_semestres = '';

  // Estudiantes adicionales
  estudiantes_adicionales: string[] = [];
  mostrarEstudiantesAdicionales = false;

  // Carrera del usuario y opciones de duración
  carreraUsuario: string = '';
  opcionesDuracion: {value: string, label: string}[] = [];

  // Semestre activo
  semestreActivo: { id: number; nombre: string } | null = null;
  cargandoSemestre = true;

  // Guía pre-asignado
  guiaAsignado: { profesor_guia_rut: string; profesor_nombre: string; profesor_email: string } | null = null;
  cargandoGuia = true;

  get esAP()         { return this.tipo_proyecto === 'AP'; }
  get esContinuaAP() { return this.tipo_proyecto === 'PT' && this.continua_ap; }
  /** Los campos extendidos (objetivos, metodología, etc.) solo son obligatorios en PT sin continua_ap */
  get requiereDetalles() { return this.tipo_proyecto === 'PT' && !this.continua_ap; }
  get tieneGuia()        { return this.guiaAsignado !== null; }
  get haySemestreActivo() { return this.semestreActivo !== null; }
  get puedeEnviar()    { return this.tieneGuia && this.haySemestreActivo && !this.cargandoGuia && !this.cargandoSemestre; }

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.obtenerCarreraUsuario();
    this.verificarAPCompletado();
    this.cargarGuia();
    this.cargarSemestreActivo();
  }

  /** Carga el semestre activo con inscripciones abiertas */
  cargarSemestreActivo() {
    this.cargandoSemestre = true;
    this.apiService.getSemestreActivo().subscribe({
      next: (res: any) => {
        this.semestreActivo = res.hayActivo ? res.data : null;
        this.cargandoSemestre = false;
      },
      error: () => {
        this.semestreActivo = null;
        this.cargandoSemestre = false;
      }
    });
  }

  /** Carga el profesor guía pre-asignado al estudiante */
  cargarGuia() {
    this.cargandoGuia = true;
    this.apiService.getMiGuia().subscribe({
      next: (res: any) => {
        this.guiaAsignado = res.tieneGuia ? res.data : null;
        this.cargandoGuia = false;
      },
      error: () => {
        this.guiaAsignado = null;
        this.cargandoGuia = false;
      }
    });
  }

  /** Verifica si el estudiante tiene un AP en etapa 'final_ap' para habilitar continua_ap */
  verificarAPCompletado() {
    this.apiService.getMisProyectos().subscribe({
      next: (response: any) => {
        const proyectos: any[] = response?.projects || [];
        this.tieneAPCompletado = proyectos.some(
          (p: any) => p.tipo_proyecto === 'AP' && p.estado_detallado === 'final_ap'
        );
      },
      error: () => { this.tieneAPCompletado = false; }
    });
  }

  onTipoProyectoChange() {
    // Al cambiar a AP, desactiva continua_ap (solo aplica para PT)
    if (this.tipo_proyecto === 'AP') this.continua_ap = false;
  }

  obtenerCarreraUsuario() {
    // Obtener información del usuario del token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.carreraUsuario = payload.carrera || '';
        this.configurarOpcionesDuracion();
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }
  }

  configurarOpcionesDuracion() {
    // IECI (Ingeniería en Computación e Informática) = solo 1 semestre
    // ICINF (Ingeniería Civil en Informática) = 1 o 2 semestres
    if (this.carreraUsuario.toLowerCase().includes('computación') && 
        !this.carreraUsuario.toLowerCase().includes('civil')) {
      // IECI - Solo 1 semestre
      this.opcionesDuracion = [
        { value: '1', label: '1 Semestre' }
      ];
      this.duracion_estimada_semestres = '1'; // Pre-seleccionar única opción
    } else {
      // ICINF y otras carreras - 1 o 2 semestres
      this.opcionesDuracion = [
        { value: '1', label: '1 Semestre' },
        { value: '2', label: '2 Semestres' }
      ];
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files?.[0] || null;
  }

  onEstudiantesChange() {
    this.actualizarEstudiantesAdicionales();
  }

  private actualizarEstudiantesAdicionales() {
    const numEstudiantes = parseInt(this.numero_estudiantes);
    
    if (numEstudiantes > 1) {
      this.mostrarEstudiantesAdicionales = true;
      // Ajustar el array según el número de estudiantes
      const cantidadAdicionales = numEstudiantes - 1;
      if (this.estudiantes_adicionales.length < cantidadAdicionales) {
        // Agregar campos vacíos
        while (this.estudiantes_adicionales.length < cantidadAdicionales) {
          this.estudiantes_adicionales.push('');
        }
      } else if (this.estudiantes_adicionales.length > cantidadAdicionales) {
        // Remover campos sobrantes
        this.estudiantes_adicionales = this.estudiantes_adicionales.slice(0, cantidadAdicionales);
      }
    } else {
      this.mostrarEstudiantesAdicionales = false;
      this.estudiantes_adicionales = [];
    }
  }

  private validarRUT(rut: string): boolean {
    if (!rut || rut.trim() === '') return false;
    // Formato: 12345678-9
    const rutPattern = /^\d{7,8}-[0-9kK]{1}$/;
    return rutPattern.test(rut);
  }

  private validarFormulario(): string | null {
    // Validaciones básicas
    if (!this.titulo.trim()) return 'El título es obligatorio';
    if (!this.descripcion.trim()) return 'La descripción es obligatoria';
    if (!this.modalidad) return 'Debes seleccionar una modalidad';
    if (!this.numero_estudiantes) return 'Debes especificar el número de estudiantes';
    if (!this.duracion_estimada_semestres) return 'Debes especificar la duración estimada';
    // El archivo no es obligatorio para continua_ap (la documentación ya existe en el AP anterior)
    if (!this.archivo && !this.esContinuaAP) return 'Debes seleccionar un archivo (PDF o Word)';

    // Validar estudiantes adicionales
    if (parseInt(this.numero_estudiantes) > 1) {
      const rutSet = new Set();
      for (let i = 0; i < this.estudiantes_adicionales.length; i++) {
        const rut = this.estudiantes_adicionales[i].trim();
        if (!rut) {
          return `Debes ingresar el RUT del estudiante ${i + 2}`;
        }
        if (!this.validarRUT(rut)) {
          return `El RUT del estudiante ${i + 2} no es válido (formato: 12345678-9)`;
        }
        if (rutSet.has(rut)) {
          return 'No puedes agregar el mismo estudiante dos veces';
        }
        rutSet.add(rut);
      }
    }

    // Validaciones de longitud
    if (this.titulo.length > 255) return 'El título no puede exceder 255 caracteres';
    if (this.descripcion.length > 1000) return 'La descripción no puede exceder 1000 caracteres';

    return null;
  }

  crear() {
    // Verificar semestre activo
    if (!this.semestreActivo) {
      this.notificationService.error('Sin semestre activo', 'No hay un semestre activo. Contacta al administrador.');
      return;
    }

    // Verificar guía asignado
    if (!this.tieneGuia) {
      this.notificationService.error(
        'Sin profesor guía',
        'No tienes un profesor guía asignado. Contacta al administrador antes de crear una propuesta.'
      );
      return;
    }

    // Validar formulario antes de enviar
    const errorValidacion = this.validarFormulario();
    if (errorValidacion) {
      this.notificationService.error('Error de validación', errorValidacion);
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    // Tipo de proyecto y continuación
    formData.append('tipo_proyecto', this.tipo_proyecto);
    if (this.esContinuaAP) formData.append('continua_ap', 'true');

    // Campos básicos
    formData.append('titulo', this.titulo);
    formData.append('descripcion', this.descripcion);
    formData.append('fecha_envio', new Date().toISOString().split('T')[0]);
    if (this.archivo) formData.append('archivo', this.archivo);

    // Campos de configuración
    formData.append('modalidad', this.modalidad);
    formData.append('numero_estudiantes', this.numero_estudiantes);
    formData.append('duracion_estimada_semestres', this.duracion_estimada_semestres);

    // Agregar estudiantes adicionales si existen
    if (this.estudiantes_adicionales.length > 0) {
      const estudiantesLimpios = this.estudiantes_adicionales
        .map(rut => rut.trim())
        .filter(rut => rut !== '');
      formData.append('estudiantes_adicionales', JSON.stringify(estudiantesLimpios));
    }

    this.apiService.createPropuesta(formData).subscribe({
      next: (res: any) => {
        this.notificationService.success('¡Propuesta creada!', 'Tu propuesta ha sido enviada exitosamente');
        this.isSubmitting = false;
        this.router.navigate(['/estudiante']);
      },
      error: (err: any) => {
        const mensaje = err.error?.message || 'Hubo un error al crear la propuesta';
        this.notificationService.error('Error al crear propuesta', mensaje);
        this.isSubmitting = false;
      }
    });
  }

  volver() {
    // Usar history.back() para volver a la página anterior sin activar guards
    window.history.back();
  }

  irAlHome() {
    this.router.navigate(['/estudiante']);
  }

  fechaActual(): Date {
    return new Date();
  }
}
