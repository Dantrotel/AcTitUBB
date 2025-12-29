import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestionHitosComponent } from '../gestion-hitos/gestion-hitos.component';
import { ApiService } from '../../services/api';

interface Cronograma {
  id: string;
  project_id: string;
  nombre: string;
  nombre_cronograma?: string; // Nombre específico del cronograma
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_fin_estimada?: string; // Fecha estimada de finalización
  estado: 'borrador' | 'activo' | 'completado' | 'cancelado';
  peso_total: number;
  creado_por: string;
  creador_nombre?: string; // Nombre del creador
  fecha_creacion: string;
  fecha_actualizacion: string;
}

@Component({
  selector: 'app-cronograma-completo',
  standalone: true,
  imports: [CommonModule, GestionHitosComponent],
  templateUrl: './cronograma-completo.component.html',
  styleUrl: './cronograma-completo.component.scss'
})
export class CronogramaCompletoComponent implements OnInit {
  @Input() projectId!: string;
  @Input() cronogramaId!: string;
  @Input() userRole!: string; // '1' = estudiante, '2' = profesor, '3' = admin
  @Input() userRut!: string;

  cronograma: Cronograma | null = null;
  estadisticas: any = null;
  alertas: any[] = [];
  mostrarTimeline = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarCronograma();
    this.cargarEstadisticas();
    this.verificarAlertas();
  }

  cargarCronograma() {
    console.log('🔄 Cargando cronograma del proyecto:', this.projectId);
    this.apiService.obtenerCronograma(this.projectId).subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta de cronograma recibida:', response);
        // El backend puede devolver { cronograma: {...} } o { data: { cronograma: {...} } }
        this.cronograma = response.cronograma || response.data?.cronograma || null;
        console.log('📋 Cronograma cargado:', this.cronograma);
      },
      error: (error: any) => {
        console.error('❌ Error al cargar cronograma:', error);
        this.cronograma = null;
      }
    });
  }

  crearCronograma() {
    console.log('🔨 Creando cronograma para proyecto:', this.projectId);
    
    // Crear un cronograma básico con fechas por defecto
    const hoy = new Date();
    const fechaFin = new Date();
    fechaFin.setMonth(fechaFin.getMonth() + 6); // 6 meses desde hoy
    
    const cronogramaData = {
      nombre_cronograma: 'Cronograma Principal',
      descripcion: 'Cronograma principal del proyecto de titulación',
      fecha_inicio: hoy.toISOString().split('T')[0],
      fecha_fin_estimada: fechaFin.toISOString().split('T')[0],
      dias_alerta_previa: 3
    };
    
    console.log('📋 Datos del cronograma a crear:', cronogramaData);
    
    this.apiService.crearCronograma(this.projectId, cronogramaData).subscribe({
      next: (response: any) => {
        console.log('✅ Cronograma creado exitosamente:', response);
        alert('✅ Cronograma creado exitosamente. Ahora puedes agregar hitos y entregas.');
        this.cargarCronograma(); // Recargar el cronograma
      },
      error: (error: any) => {
        console.error('❌ Error al crear cronograma:', error);
        const mensaje = error.error?.message || 'Error al crear el cronograma';
        alert('❌ ' + mensaje);
      }
    });
  }

  cargarEstadisticas() {
    // Simulación de estadísticas - en producción vendría del backend
    this.estadisticas = {
      total_hitos: 0,
      hitos_completados: 0,
      hitos_pendientes: 0,
      hitos_retrasados: 0,
      entregas_total: 0,
      entregas_aprobadas: 0,
      entregas_pendientes: 0
    };

    // En una implementación real, esto vendría de un endpoint específico
    // this.apiService.obtenerEstadisticasCronograma(this.cronogramaId).subscribe(...)
  }

  verificarAlertas() {
    // Generar alertas basadas en el estado actual
    this.alertas = [];

    if (this.cronograma?.estado === 'activo') {
      // Verificar hitos próximos a vencer
      this.alertas.push({
        id: 'hitos-proximos',
        tipo: 'warning',
        icono: 'fa-clock',
        titulo: 'Hitos Próximos',
        mensaje: 'Tienes hitos que vencen en los próximos 3 días.'
      });
    }

    // Verificar entregas sin revisar (solo para profesores)
    if (this.userRole === '2' || this.userRole === '3') {
      this.alertas.push({
        id: 'entregas-sin-revisar',
        tipo: 'info',
        icono: 'fa-file-alt',
        titulo: 'Entregas Pendientes',
        mensaje: 'Hay entregas que requieren tu revisión.'
      });
    }
  }

  // Métodos de formateo y utilidades
  formatearPeriodo(): string {
    if (!this.cronograma) return '';
    
    const inicio = new Date(this.cronograma.fecha_inicio).toLocaleDateString('es-CL');
    const fechaFin = this.cronograma.fecha_fin_estimada || this.cronograma.fecha_fin;
    const fin = new Date(fechaFin).toLocaleDateString('es-CL');
    
    return inicio + ' - ' + fin;
  }

  obtenerTextoEstado(estado: string): string {
    const estados: { [key: string]: string } = {
      'borrador': 'Borrador',
      'activo': 'Activo',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    };
    return estados[estado] || estado;
  }

  obtenerTextoAccionEstado(): string {
    if (!this.cronograma) return 'Activar';
    
    switch (this.cronograma.estado) {
      case 'borrador': return 'Activar';
      case 'activo': return 'Completar';
      case 'completado': return 'Reactivar';
      case 'cancelado': return 'Reactivar';
      default: return 'Actualizar';
    }
  }

  calcularProgreso(): number {
    if (!this.estadisticas || this.estadisticas.total_hitos === 0) return 0;
    
    return Math.round((this.estadisticas.hitos_completados / this.estadisticas.total_hitos) * 100);
  }

  // Métodos de permisos
  puedeEditarCronograma(): boolean {
    return this.userRole === '2' || this.userRole === '3'; // Solo profesores y admins
  }

  // Métodos de acciones
  editarCronograma() {
    // Abrir modal de edición de cronograma
  }

  cambiarEstadoCronograma() {
    if (!this.cronograma) return;

    let nuevoEstado = '';
    switch (this.cronograma.estado) {
      case 'borrador':
        nuevoEstado = 'activo';
        break;
      case 'activo':
        nuevoEstado = 'completado';
        break;
      case 'completado':
      case 'cancelado':
        nuevoEstado = 'activo';
        break;
    }

    // Actualizar estado del cronograma
    this.apiService.actualizarHitoCronograma(this.cronogramaId, this.cronograma.id, { estado: nuevoEstado }).subscribe({
      next: () => {
        this.cargarCronograma();
      },
      error: (error: any) => {
      }
    });
  }

  descartarAlerta(alerta: any) {
    this.alertas = this.alertas.filter(a => a.id !== alerta.id);
  }

  onHitosActualizados() {
    this.cargarEstadisticas();
    this.verificarAlertas();
  }

  toggleTimeline() {
    this.mostrarTimeline = !this.mostrarTimeline;
  }
}