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

  constructor(
    private apiService: ApiService, 
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.obtenerCarreraUsuario();
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
    if (!this.archivo) return 'Debes seleccionar un archivo (PDF o Word)';

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
    // Validar formulario antes de enviar
    const errorValidacion = this.validarFormulario();
    if (errorValidacion) {
      this.notificationService.error('Error de validación', errorValidacion);
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    
    // Campos básicos
    formData.append('titulo', this.titulo);
    formData.append('descripcion', this.descripcion);
    formData.append('fecha_envio', new Date().toISOString().split('T')[0]);
    formData.append('archivo', this.archivo!);

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
