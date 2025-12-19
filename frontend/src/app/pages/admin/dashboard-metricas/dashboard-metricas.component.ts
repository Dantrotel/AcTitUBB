// Dashboard de métricas globales - Super Admin
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-dashboard-metricas',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>
          <mat-icon>dashboard</mat-icon>
          Dashboard Global del Sistema
        </h1>
        <button mat-raised-button color="primary" (click)="recargarDatos()">
          <mat-icon>refresh</mat-icon>
          Actualizar
        </button>
      </div>

      @if (cargando()) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Cargando estadísticas...</p>
        </div>
      } @else {
        <!-- Métricas principales -->
        <div class="metricas-grid">
          <mat-card class="metric-card usuarios">
            <mat-icon>people</mat-icon>
            <div class="metric-content">
              <div class="metric-value">{{ totalUsuarios() }}</div>
              <div class="metric-label">Total Usuarios</div>
              <div class="metric-breakdown">
                <span>👨‍🎓 {{ estadisticas()?.usuarios?.estudiantes || 0 }} Estudiantes</span>
                <span>👨‍🏫 {{ estadisticas()?.usuarios?.profesores || 0 }} Profesores</span>
                <span>🔧 {{ estadisticas()?.usuarios?.admins || 0 }} Admins</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="metric-card proyectos">
            <mat-icon>folder</mat-icon>
            <div class="metric-content">
              <div class="metric-value">{{ totalProyectos() }}</div>
              <div class="metric-label">Proyectos Activos</div>
              <div class="metric-breakdown">
                <span>🚀 En desarrollo</span>
                <span>✅ Completados: {{ estadisticas()?.proyectos?.cerrado || 0 }}</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="metric-card propuestas">
            <mat-icon>description</mat-icon>
            <div class="metric-content">
              <div class="metric-value">{{ totalPropuestas() }}</div>
              <div class="metric-label">Propuestas</div>
              <div class="metric-breakdown">
                <span>⏳ Pendientes</span>
                <span>✅ Aprobadas</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="metric-card cumplimiento">
            <mat-icon>check_circle</mat-icon>
            <div class="metric-content">
              <div class="metric-value">{{ porcentajeCumplimiento() }}%</div>
              <div class="metric-label">Cumplimiento de Plazos</div>
              <div class="metric-breakdown">
                <span>{{ estadisticas()?.cumplimiento_plazos?.entregas_a_tiempo || 0 }} de {{ estadisticas()?.cumplimiento_plazos?.total_entregas || 0 }}</span>
                <span>Últimos 3 meses</span>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Proyectos por carrera -->
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>school</mat-icon>
              Proyectos por Carrera
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="estadisticas()?.proyectos_por_carrera || []">
                <ng-container matColumnDef="carrera">
                  <th mat-header-cell *matHeaderCellDef>Carrera</th>
                  <td mat-cell *matCellDef="let element">{{ element.carrera }}</td>
                </ng-container>

                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let element">
                    <span class="badge badge-primary">{{ element.total_proyectos }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="completados">
                  <th mat-header-cell *matHeaderCellDef>Completados</th>
                  <td mat-cell *matCellDef="let element">
                    <span class="badge badge-success">{{ element.completados }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="en_riesgo">
                  <th mat-header-cell *matHeaderCellDef>En Riesgo</th>
                  <td mat-cell *matCellDef="let element">
                    <span class="badge badge-danger" *ngIf="element.en_riesgo > 0">
                      {{ element.en_riesgo }}
                    </span>
                    <span *ngIf="element.en_riesgo === 0">-</span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="columnasCarrera"></tr>
                <tr mat-row *matRowDef="let row; columns: columnasCarrera;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Carga de profesores -->
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person</mat-icon>
              Carga Administrativa de Profesores (Top 10)
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="table-container">
              <table mat-table [dataSource]="(estadisticas()?.carga_profesores || []).slice(0, 10)">
                <ng-container matColumnDef="nombre">
                  <th mat-header-cell *matHeaderCellDef>Profesor</th>
                  <td mat-cell *matCellDef="let element">
                    <div class="profesor-info">
                      <strong>{{ element.nombre }}</strong>
                      <small>{{ element.departamento || 'Sin departamento' }}</small>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="total">
                  <th mat-header-cell *matHeaderCellDef>Total Proyectos</th>
                  <td mat-cell *matCellDef="let element">
                    <span class="badge badge-primary">{{ element.total_proyectos }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="guia">
                  <th mat-header-cell *matHeaderCellDef>Como Guía</th>
                  <td mat-cell *matCellDef="let element">{{ element.como_guia }}</td>
                </ng-container>

                <ng-container matColumnDef="informante">
                  <th mat-header-cell *matHeaderCellDef>Como Informante</th>
                  <td mat-cell *matCellDef="let element">{{ element.como_informante }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="columnasProfesores"></tr>
                <tr mat-row *matRowDef="let row; columns: columnasProfesores;"></tr>
              </table>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Actividad reciente -->
        <mat-card class="section-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>history</mat-icon>
              Actividad Reciente (Últimos 7 días)
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="actividad-list">
              @for (actividad of estadisticas()?.actividad_reciente || []; track $index) {
                <div class="actividad-item">
                  <mat-icon [class]="'icon-' + actividad.tipo">
                    {{ actividad.tipo === 'propuesta' ? 'description' : 'folder' }}
                  </mat-icon>
                  <div class="actividad-content">
                    <strong>{{ actividad.titulo }}</strong>
                    <small>{{ actividad.usuario }} • {{ formatearFecha(actividad.fecha) }}</small>
                  </div>
                </div>
              } @empty {
                <p class="no-data">No hay actividad reciente</p>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;

      h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        color: #333;
        font-size: 32px;

        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
          color: #667eea;
        }
      }

      button {
        mat-icon {
          margin-right: 8px;
        }
      }
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 20px;
    }

    .metricas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .metric-card {
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      position: relative;
      overflow: hidden;
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
      }

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        opacity: 0.8;
      }

      &.usuarios {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.proyectos {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.propuestas {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }

      &.cumplimiento {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }

      .metric-content {
        flex: 1;

        .metric-value {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .metric-label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 12px;
        }

        .metric-breakdown {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 12px;
          opacity: 0.8;
        }
      }
    }

    .section-card {
      margin-bottom: 24px;

      mat-card-header {
        margin-bottom: 16px;

        mat-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          color: #333;

          mat-icon {
            color: #667eea;
          }
        }
      }
    }

    .table-container {
      overflow-x: auto;

      table {
        width: 100%;

        th {
          font-weight: 600;
          color: #666;
        }

        .profesor-info {
          display: flex;
          flex-direction: column;
          gap: 4px;

          small {
            color: #999;
            font-size: 12px;
          }
        }
      }
    }

    .badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;

      &.badge-primary {
        background: #e3f2fd;
        color: #1976d2;
      }

      &.badge-success {
        background: #e8f5e9;
        color: #388e3c;
      }

      &.badge-danger {
        background: #ffebee;
        color: #d32f2f;
      }
    }

    .actividad-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .actividad-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        background: #f5f5f5;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;

          &.icon-propuesta {
            color: #2196f3;
          }

          &.icon-proyecto {
            color: #4caf50;
          }
        }

        .actividad-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;

          strong {
            color: #333;
            font-size: 14px;
          }

          small {
            color: #666;
            font-size: 12px;
          }
        }
      }

      .no-data {
        text-align: center;
        color: #999;
        padding: 40px 20px;
      }
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;

        h1 {
          font-size: 24px;
        }
      }

      .metricas-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardMetricasComponent implements OnInit {
  estadisticas = signal<any>(null);
  cargando = signal(true);
  
  columnasCarrera = ['carrera', 'total', 'completados', 'en_riesgo'];
  columnasProfesores = ['nombre', 'total', 'guia', 'informante'];

  totalUsuarios = computed(() => {
    const est = this.estadisticas();
    if (!est?.usuarios) return 0;
    return (est.usuarios.estudiantes || 0) + (est.usuarios.profesores || 0) + (est.usuarios.admins || 0) + (est.usuarios.super_admins || 0);
  });

  totalProyectos = computed(() => {
    const est = this.estadisticas();
    if (!est?.proyectos) return 0;
    return Object.values(est.proyectos).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
  });

  totalPropuestas = computed(() => {
    const est = this.estadisticas();
    if (!est?.propuestas) return 0;
    return Object.values(est.propuestas).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
  });

  porcentajeCumplimiento = computed(() => {
    const cumplimiento = this.estadisticas()?.cumplimiento_plazos;
    if (!cumplimiento || !cumplimiento.total_entregas) return 0;
    return Math.round(cumplimiento.porcentaje_cumplimiento || 0);
  });

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  async cargarEstadisticas() {
    this.cargando.set(true);
    try {
      const response: any = await this.apiService.get('configuracion/estadisticas/globales').toPromise();
      if (response.success) {
        this.estadisticas.set(response.estadisticas);
      }
    } catch (error: any) {
      this.notificationService.error(
        'Error',
        'No se pudieron cargar las estadísticas'
      );
    } finally {
      this.cargando.set(false);
    }
  }

  recargarDatos() {
    this.cargarEstadisticas();
    this.notificationService.success('Actualizado', 'Datos recargados correctamente');
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoy';
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    
    return date.toLocaleDateString('es-CL', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
}
