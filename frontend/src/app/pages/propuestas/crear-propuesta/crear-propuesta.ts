import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { Router } from '@angular/router';

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

  // Nuevos campos del modelo mejorado
  modalidad = '';
  numero_estudiantes = '';
  complejidad_estimada = '';
  duracion_estimada_semestres = '';
  justificacion_complejidad = '';
  area_tematica = '';
  objetivos_generales = '';
  objetivos_especificos = '';
  metodologia_propuesta = '';
  recursos_necesarios = '';
  bibliografia = '';

  // Variables de control para validaciones
  mostrarJustificacionComplejidad = false;

  constructor(private apiService: ApiService, private router: Router) {}

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.archivo = input.files?.[0] || null;
  }

  onEstudiantesChange() {
    this.validarJustificacionComplejidad();
  }

  onComplejidadChange() {
    this.validarJustificacionComplejidad();
  }

  private validarJustificacionComplejidad() {
    // Mostrar justificación si hay 2 estudiantes y complejidad baja
    this.mostrarJustificacionComplejidad = 
      this.numero_estudiantes === '2' && this.complejidad_estimada === 'baja';
    
    // Limpiar justificación si no es necesaria
    if (!this.mostrarJustificacionComplejidad) {
      this.justificacion_complejidad = '';
    }
  }

  private validarFormulario(): string | null {
    // Validaciones básicas
    if (!this.titulo.trim()) return 'El título es obligatorio';
    if (!this.descripcion.trim()) return 'La descripción es obligatoria';
    if (!this.modalidad) return 'Debes seleccionar una modalidad';
    if (!this.numero_estudiantes) return 'Debes especificar el número de estudiantes';
    if (!this.complejidad_estimada) return 'Debes seleccionar la complejidad estimada';
    if (!this.duracion_estimada_semestres) return 'Debes especificar la duración estimada';
    if (!this.area_tematica.trim()) return 'El área temática es obligatoria';
    if (!this.objetivos_generales.trim()) return 'Los objetivos generales son obligatorios';
    if (!this.objetivos_especificos.trim()) return 'Los objetivos específicos son obligatorios';
    if (!this.metodologia_propuesta.trim()) return 'La metodología propuesta es obligatoria';
    if (!this.archivo) return 'Debes seleccionar un archivo (PDF o Word)';

    // Validación específica de justificación
    if (this.mostrarJustificacionComplejidad && !this.justificacion_complejidad.trim()) {
      return 'Debes justificar por qué este proyecto requiere 2 estudiantes siendo de complejidad baja';
    }

    // Validaciones de longitud
    if (this.titulo.length > 255) return 'El título no puede exceder 255 caracteres';
    if (this.descripcion.length > 1000) return 'La descripción no puede exceder 1000 caracteres';
    if (this.area_tematica.length > 100) return 'El área temática no puede exceder 100 caracteres';

    return null;
  }

  crear() {
    // Validar formulario antes de enviar
    const errorValidacion = this.validarFormulario();
    if (errorValidacion) {
      alert(errorValidacion);
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    
    // Campos básicos
    formData.append('titulo', this.titulo);
    formData.append('descripcion', this.descripcion);
    formData.append('fecha_envio', new Date().toISOString().split('T')[0]);
    formData.append('archivo', this.archivo!);

    // Nuevos campos
    formData.append('modalidad', this.modalidad);
    formData.append('numero_estudiantes', this.numero_estudiantes);
    formData.append('complejidad_estimada', this.complejidad_estimada);
    formData.append('duracion_estimada_semestres', this.duracion_estimada_semestres);
    formData.append('area_tematica', this.area_tematica);
    formData.append('objetivos_generales', this.objetivos_generales);
    formData.append('objetivos_especificos', this.objetivos_especificos);
    formData.append('metodologia_propuesta', this.metodologia_propuesta);

    // Campos opcionales (solo si tienen contenido)
    if (this.justificacion_complejidad) {
      formData.append('justificacion_complejidad', this.justificacion_complejidad);
    }
    if (this.recursos_necesarios) {
      formData.append('recursos_necesarios', this.recursos_necesarios);
    }
    if (this.bibliografia) {
      formData.append('bibliografia', this.bibliografia);
    }

    this.apiService.createPropuesta(formData).subscribe({
      next: (res: any) => {
        console.log('Propuesta creada:', res);
        alert('Propuesta creada con éxito');
        this.isSubmitting = false;
        this.router.navigate(['/estudiante']);
      },
      error: (err: any) => {
        console.error('Error:', err);
        const mensaje = err.error?.message || 'Hubo un error al crear la propuesta';
        alert(mensaje);
        this.isSubmitting = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/estudiante']);
  }

  fechaActual(): Date {
    return new Date();
  }
}
