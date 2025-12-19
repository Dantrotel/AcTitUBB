import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api';

interface FechaImportante {
  id: number;
  tipo_fecha: string;
  titulo?: string;
  descripcion: string;
  fecha_limite: string;
  permite_extension?: boolean;
  requiere_entrega?: boolean;
  completada?: boolean;
}

@Component({
  selector: 'app-solicitar-extension',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-extension.component.html',
  styleUrl: './solicitar-extension.component.scss'
})
export class SolicitarExtensionComponent implements OnInit {
  proyectoId: number = 0;
  proyectoTitulo: string = '';
  
  fechasDisponibles: FechaImportante[] = [];
  
  // Formulario
  fechaImportanteId: number | null = null;
  fechaOriginal: string = '';
  fechaSolicitada: string = '';
  motivo: string = '';
  justificacionDetallada: string = '';
  archivoSeleccionado: File | null = null;
  
  // UI State
  loading = false;
  loadingFechas = false;
  error = '';
  mensaje = '';
  
  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Obtener parámetros de la ruta y query params
    this.route.params.subscribe(params => {
      if (params['proyectoId']) {
        this.proyectoId = +params['proyectoId'];
      }
    });

    // Obtener query params (para prellenar desde fechas-limite)
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['proyectoId']) {
        this.proyectoId = +queryParams['proyectoId'];
      }
      
      // Si viene con fechaImportanteId, prellenar
      if (queryParams['fechaImportanteId']) {
        this.fechaImportanteId = +queryParams['fechaImportanteId'];
      }
    });

    // Si aún no tiene proyectoId, intentar obtener del localStorage
    if (!this.proyectoId) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.proyecto_id) {
          this.proyectoId = user.proyecto_id;
        }
      }
    }

    // Cargar fechas del proyecto
    if (this.proyectoId) {
      this.cargarFechasProyecto();
    }
  }

  cargarFechasProyecto() {
    this.loadingFechas = true;
    this.error = '';
    
    // Usar el método correcto del ApiService
    this.api.getFechasImportantesProyecto(this.proyectoId.toString()).subscribe({
      next: (response: any) => {
        // Manejar respuesta: { success: true, data: { fechas_importantes: [...] } }
        let fechas = [];
        if (response && response.success && response.data && response.data.fechas_importantes) {
          fechas = response.data.fechas_importantes;
        } else if (response && Array.isArray(response)) {
          fechas = response;
        }
        
        this.fechasDisponibles = fechas.filter((f: FechaImportante) => {
          // Solo mostrar fechas futuras o próximas que permitan extensión
          const fechaLimite = new Date(f.fecha_limite);
          const hoy = new Date();
          return fechaLimite >= hoy && f.permite_extension;
        });
        
        this.loadingFechas = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error cargando fechas:', error);
        this.error = 'Error al cargar las fechas del proyecto';
        this.loadingFechas = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFechaSeleccionada() {
    if (this.fechaImportanteId) {
      const fechaSeleccionada = this.fechasDisponibles.find(f => f.id === this.fechaImportanteId);
      if (fechaSeleccionada) {
        this.fechaOriginal = fechaSeleccionada.fecha_limite;
        // Establecer fecha mínima como el día siguiente a la fecha original
        const minDate = new Date(this.fechaOriginal);
        minDate.setDate(minDate.getDate() + 1);
      }
    }
  }

  onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.error = 'Tipo de archivo no permitido. Solo se aceptan: PDF, DOC, DOCX, JPG, PNG';
        event.target.value = '';
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'El archivo no debe superar los 5MB';
        event.target.value = '';
        return;
      }
      
      this.archivoSeleccionado = file;
      this.error = '';
    }
  }

  validarFormulario(): boolean {
    if (!this.fechaImportanteId) {
      this.error = 'Debe seleccionar una fecha importante';
      return false;
    }
    
    if (!this.fechaSolicitada) {
      this.error = 'Debe ingresar la nueva fecha solicitada';
      return false;
    }
    
    // Validar que la fecha solicitada sea posterior a la original
    const fechaOrig = new Date(this.fechaOriginal);
    const fechaSol = new Date(this.fechaSolicitada);
    
    if (fechaSol <= fechaOrig) {
      this.error = 'La fecha solicitada debe ser posterior a la fecha original';
      return false;
    }
    
    if (!this.motivo || this.motivo.trim().length < 10) {
      this.error = 'El motivo debe tener al menos 10 caracteres';
      return false;
    }
    
    if (!this.justificacionDetallada || this.justificacionDetallada.trim().length < 50) {
      this.error = 'La justificación debe tener al menos 50 caracteres';
      return false;
    }
    
    return true;
  }

  async solicitarExtension() {
    if (!this.validarFormulario()) {
      return;
    }
    
    this.loading = true;
    this.error = '';
    this.mensaje = '';
    
    try {
      const formData = new FormData();
      formData.append('proyecto_id', this.proyectoId.toString());
      if (this.fechaImportanteId) {
        formData.append('fecha_importante_id', this.fechaImportanteId.toString());
      }
      formData.append('fecha_original', this.fechaOriginal);
      formData.append('fecha_solicitada', this.fechaSolicitada);
      formData.append('motivo', this.motivo.trim());
      formData.append('justificacion_detallada', this.justificacionDetallada.trim());
      
      if (this.archivoSeleccionado) {
        formData.append('documento_respaldo', this.archivoSeleccionado);
      }
      
      this.api.post('/extensiones/', formData).subscribe({
        next: (response: any) => {
          this.mensaje = 'Solicitud de extensión enviada correctamente. Será revisada por el administrador.';
          this.loading = false;
          
          // Limpiar formulario
          setTimeout(() => {
            this.limpiarFormulario();
            this.router.navigate(['/estudiante/proyecto']);
          }, 2000);
        },
        error: (error: any) => {
          console.error('Error enviando solicitud:', error);
          this.error = error.error?.mensaje || 'Error al enviar la solicitud de extensión';
          this.loading = false;
        }
      });
    } catch (error: any) {
      console.error('Error:', error);
      this.error = 'Error inesperado al enviar la solicitud';
      this.loading = false;
    }
  }

  limpiarFormulario() {
    this.fechaImportanteId = null;
    this.fechaOriginal = '';
    this.fechaSolicitada = '';
    this.motivo = '';
    this.justificacionDetallada = '';
    this.archivoSeleccionado = null;
    const fileInput = document.getElementById('archivo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  calcularDiasExtension(): number {
    if (this.fechaOriginal && this.fechaSolicitada) {
      const fechaOrig = new Date(this.fechaOriginal);
      const fechaSol = new Date(this.fechaSolicitada);
      const diffTime = Math.abs(fechaSol.getTime() - fechaOrig.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  volver() {
    window.history.back();
  }
}
