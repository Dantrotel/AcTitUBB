import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';

interface Alerta {
  id: number;
  tipo_notificacion: string;
  titulo: string;
  mensaje: string;
  fecha_titulo?: string;
  fecha_limite?: string;
  tipo_fecha?: string;
  dias_restantes?: number;
  created_at: string;
  leida: boolean;
  // Para profesores y admin
  titulo_proyecto?: string;
  nombre_estudiante?: string;
  estudiante_rut?: string;
}

@Component({
  selector: 'app-alertas-fechas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alertas-container" *ngIf="alertas.length > 0">
      <div class="alertas-header">
        <h4>
          <i class="fas fa-bell"></i>
          Alertas de Fechas Importantes
          <span class="badge-count" *ngIf="alertas.length > 0">{{alertas.length}}</span>
        </h4>
        <button 
          class="btn-marcar-leidas" 
          (click)="marcarTodasLeidas()"
          *ngIf="alertas.length > 0">
          <i class="fas fa-check-double"></i>
          Marcar todas como leídas
        </button>
      </div>

      <div class="alertas-list">
        <div 
          *ngFor="let alerta of alertas" 
          class="alerta-card"
          [class.alerta-danger]="alerta.tipo_notificacion === 'alerta_vencida' || alerta.tipo_notificacion === 'alerta_hoy'"
          [class.alerta-warning]="alerta.tipo_notificacion === 'alerta_10_dias'"
          [class.alerta-info]="alerta.tipo_notificacion === 'alerta_30_dias'">
          
          <div class="alerta-icon">
            <i [class]="getIconoAlerta(alerta.tipo_notificacion)"></i>
          </div>

          <div class="alerta-content">
            <div class="alerta-titulo">{{ alerta.titulo }}</div>
            <div class="alerta-mensaje">{{ alerta.mensaje }}</div>
            
            <div class="alerta-meta" *ngIf="alerta.fecha_titulo">
              <span class="meta-item">
                <i class="fas fa-calendar-day"></i>
                {{ alerta.fecha_titulo }}
              </span>
              <span class="meta-item" *ngIf="alerta.fecha_limite">
                <i class="fas fa-clock"></i>
                {{ alerta.fecha_limite | date:'dd/MM/yyyy' }}
              </span>
              <span class="meta-item tipo-fecha" *ngIf="alerta.tipo_fecha">
                {{ formatearTipoFecha(alerta.tipo_fecha) }}
              </span>
            </div>

            <!-- Información adicional para profesores/admin -->
            <div class="alerta-proyecto-info" *ngIf="alerta.titulo_proyecto">
              <span class="proyecto-nombre">
                <i class="fas fa-project-diagram"></i>
                {{ alerta.titulo_proyecto }}
              </span>
              <span class="estudiante-nombre" *ngIf="alerta.nombre_estudiante">
                <i class="fas fa-user"></i>
                {{ alerta.nombre_estudiante }}
              </span>
            </div>

            <div class="alerta-footer">
              <span class="tiempo-alerta">
                <i class="fas fa-clock"></i>
                {{ calcularTiempoTranscurrido(alerta.created_at) }}
              </span>
              <span class="dias-restantes" *ngIf="alerta.dias_restantes !== undefined">
                {{ getDiasRestantesTexto(alerta.dias_restantes) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="alertas-footer" *ngIf="alertas.length >= 10">
        <button class="btn-ver-todas" (click)="verTodasAlertas()">
          Ver todas las alertas
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>

    <div class="sin-alertas" *ngIf="alertas.length === 0 && !cargando">
      <i class="fas fa-check-circle"></i>
      <p>No tienes alertas pendientes</p>
    </div>

    <div class="cargando-alertas" *ngIf="cargando">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Cargando alertas...</p>
    </div>
  `,
  styles: [`
    .alertas-container {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
    }

    .alertas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e9ecef;
    }

    .alertas-header h4 {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.2rem;
      color: #2c3e50;
    }

    .badge-count {
      background: #dc3545;
      color: white;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .btn-marcar-leidas {
      background: #28a745;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .btn-marcar-leidas:hover {
      background: #218838;
      transform: translateY(-2px);
    }

    .alertas-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .alerta-card {
      display: flex;
      gap: 15px;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid;
      background: #f8f9fa;
      transition: all 0.3s ease;
    }

    .alerta-card:hover {
      transform: translateX(5px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .alerta-info {
      border-left-color: #17a2b8;
      background: #e7f7f9;
    }

    .alerta-warning {
      border-left-color: #ffc107;
      background: #fff8e1;
    }

    .alerta-danger {
      border-left-color: #dc3545;
      background: #ffe6e6;
    }

    .alerta-icon {
      font-size: 1.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .alerta-info .alerta-icon {
      color: #17a2b8;
    }

    .alerta-warning .alerta-icon {
      color: #ffc107;
    }

    .alerta-danger .alerta-icon {
      color: #dc3545;
    }

    .alerta-content {
      flex: 1;
    }

    .alerta-titulo {
      font-weight: 600;
      font-size: 1rem;
      color: #2c3e50;
      margin-bottom: 5px;
    }

    .alerta-mensaje {
      color: #6c757d;
      font-size: 0.95rem;
      margin-bottom: 10px;
    }

    .alerta-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      margin-bottom: 8px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.85rem;
      color: #6c757d;
    }

    .tipo-fecha {
      background: #e9ecef;
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 500;
    }

    .alerta-proyecto-info {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 8px 0;
      font-size: 0.9rem;
      border-top: 1px dashed #dee2e6;
      margin-top: 8px;
    }

    .proyecto-nombre,
    .estudiante-nombre {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #495057;
    }

    .alerta-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #dee2e6;
    }

    .tiempo-alerta {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.8rem;
      color: #6c757d;
    }

    .dias-restantes {
      font-weight: 600;
      font-size: 0.85rem;
      padding: 3px 8px;
      border-radius: 10px;
      background: #fff;
      color: #495057;
    }

    .sin-alertas,
    .cargando-alertas {
      text-align: center;
      padding: 40px 20px;
      color: #6c757d;
    }

    .sin-alertas i {
      font-size: 3rem;
      color: #28a745;
      margin-bottom: 10px;
    }

    .cargando-alertas i {
      font-size: 2rem;
      color: #007bff;
      margin-bottom: 10px;
    }

    .alertas-footer {
      margin-top: 15px;
      text-align: center;
      padding-top: 15px;
      border-top: 1px solid #dee2e6;
    }

    .btn-ver-todas {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
    }

    .btn-ver-todas:hover {
      background: #0056b3;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .alertas-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }

      .alerta-card {
        flex-direction: column;
      }

      .alerta-meta {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class AlertasFechasComponent implements OnInit {
  @Input() maximoAlertas: number = 10; // Número máximo de alertas a mostrar
  @Input() autoRefresh: boolean = false; // Auto-refrescar cada X minutos

  alertas: Alerta[] = [];
  cargando: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.cargarAlertas();

    // Auto-refrescar si está habilitado
    if (this.autoRefresh) {
      setInterval(() => {
        this.cargarAlertas();
      }, 5 * 60 * 1000); // Cada 5 minutos
    }
  }

  cargarAlertas() {
    this.cargando = true;
    this.apiService.get('/fechas-importantes/alertas/mis-alertas').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alertas = response.data.slice(0, this.maximoAlertas);
        }
        this.cargando = false;
      },
      error: (error) => {
        this.cargando = false;
      }
    });
  }

  marcarTodasLeidas() {
    this.apiService.put('/fechas-importantes/alertas/marcar-leidas', {}).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.alertas = [];
        }
      },
      error: (error) => {
      }
    });
  }

  getIconoAlerta(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'alerta_30_dias': 'fas fa-info-circle',
      'alerta_10_dias': 'fas fa-exclamation-triangle',
      'alerta_hoy': 'fas fa-exclamation-circle',
      'alerta_vencida': 'fas fa-times-circle'
    };
    return iconos[tipo] || 'fas fa-bell';
  }

  formatearTipoFecha(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'entrega_avance': 'Entrega de Avance',
      'entrega_final': 'Entrega Final',
      'defensa': 'Defensa',
      'presentacion': 'Presentación',
      'revision_parcial': 'Revisión Parcial'
    };
    return tipos[tipo] || tipo;
  }

  getDiasRestantesTexto(dias: number): string {
    if (dias < 0) {
      return `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`;
    } else if (dias === 0) {
      return '¡HOY!';
    } else if (dias === 1) {
      return 'Mañana';
    } else {
      return `En ${dias} días`;
    }
  }

  calcularTiempoTranscurrido(fecha: string): string {
    const ahora = new Date();
    const fechaAlerta = new Date(fecha);
    const diferencia = ahora.getTime() - fechaAlerta.getTime();
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 60) {
      return `Hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    } else if (horas < 24) {
      return `Hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    } else {
      return `Hace ${dias} día${dias !== 1 ? 's' : ''}`;
    }
  }

  verTodasAlertas() {
    // Navegar a una página de todas las alertas (implementar según necesidad)
  }
}
