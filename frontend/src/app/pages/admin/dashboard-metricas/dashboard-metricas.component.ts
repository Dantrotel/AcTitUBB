// Dashboard de métricas globales - Super Admin
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-dashboard-metricas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <div class="page-header">
        <div>
          <h1>
            <i class="fas fa-chart-bar"></i>
            Dashboard Global del Sistema
          </h1>
        </div>
        <button class="btn btn-primary" (click)="recargarDatos()">
          <i class="fas fa-sync-alt"></i>
          Actualizar
        </button>
      </div>

      @if (cargando()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando estadísticas...</p>
        </div>
      } @else {
        <!-- Métricas principales -->
        <div class="metricas-grid">
          <div class="metric-card usuarios">
            <div class="metric-icon"><i class="fas fa-users"></i></div>
            <div class="metric-content">
              <div class="metric-value">{{ totalUsuarios() }}</div>
              <div class="metric-label">Total Usuarios</div>
              <div class="metric-breakdown">
                <span>👨‍🎓 {{ estadisticas()?.usuarios?.estudiantes || 0 }} Estudiantes</span>
                <span>👨‍🏫 {{ estadisticas()?.usuarios?.profesores || 0 }} Profesores</span>
                <span>🔧 {{ estadisticas()?.usuarios?.admins || 0 }} Admins</span>
              </div>
            </div>
          </div>

          <div class="metric-card proyectos">
            <div class="metric-icon"><i class="fas fa-folder-open"></i></div>
            <div class="metric-content">
              <div class="metric-value">{{ totalProyectos() }}</div>
              <div class="metric-label">Proyectos Activos</div>
              <div class="metric-breakdown">
                <span>🚀 En desarrollo</span>
                <span>✅ Completados: {{ estadisticas()?.proyectos?.cerrado || 0 }}</span>
              </div>
            </div>
          </div>

          <div class="metric-card propuestas">
            <div class="metric-icon"><i class="fas fa-file-alt"></i></div>
            <div class="metric-content">
              <div class="metric-value">{{ totalPropuestas() }}</div>
              <div class="metric-label">Propuestas</div>
              <div class="metric-breakdown">
                <span>⏳ Pendientes</span>
                <span>✅ Aprobadas</span>
              </div>
            </div>
          </div>

          <div class="metric-card cumplimiento">
            <div class="metric-icon"><i class="fas fa-check-circle"></i></div>
            <div class="metric-content">
              <div class="metric-value">{{ porcentajeCumplimiento() }}%</div>
              <div class="metric-label">Cumplimiento de Plazos</div>
              <div class="metric-breakdown">
                <span>{{ estadisticas()?.cumplimiento_plazos?.entregas_a_tiempo || 0 }} de {{ estadisticas()?.cumplimiento_plazos?.total_entregas || 0 }}</span>
                <span>Últimos 3 meses</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Proyectos por carrera -->
        <div class="section-card">
          <div class="section-header">
            <h2><i class="fas fa-graduation-cap"></i> Proyectos por Carrera</h2>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Carrera</th>
                  <th>Total</th>
                  <th>Completados</th>
                  <th>En Riesgo</th>
                </tr>
              </thead>
              <tbody>
                @for (element of estadisticas()?.proyectos_por_carrera || []; track $index) {
                  <tr>
                    <td>{{ element.carrera }}</td>
                    <td><span class="badge badge-primary">{{ element.total_proyectos }}</span></td>
                    <td><span class="badge badge-success">{{ element.completados }}</span></td>
                    <td>
                      @if (element.en_riesgo > 0) {
                        <span class="badge badge-danger">{{ element.en_riesgo }}</span>
                      } @else {
                        <span class="text-muted">-</span>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="text-center text-muted">Sin datos</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Carga de profesores -->
        <div class="section-card">
          <div class="section-header">
            <h2><i class="fas fa-chalkboard-teacher"></i> Carga Administrativa de Profesores (Top 10)</h2>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Profesor</th>
                  <th>Total Proyectos</th>
                  <th>Como Guía</th>
                  <th>Como Informante</th>
                </tr>
              </thead>
              <tbody>
                @for (element of (estadisticas()?.carga_profesores || []).slice(0, 10); track $index) {
                  <tr>
                    <td>
                      <div class="profesor-info">
                        <strong>{{ element.nombre }}</strong>
                        <small>{{ element.departamento || 'Sin departamento' }}</small>
                      </div>
                    </td>
                    <td><span class="badge badge-primary">{{ element.total_proyectos }}</span></td>
                    <td>
                      <span class="badge badge-info">
                        <i class="fas fa-graduation-cap"></i>
                        {{ element.como_guia }} Guía
                      </span>
                    </td>
                    <td>
                      <span class="badge badge-success">
                        <i class="fas fa-users"></i>
                        {{ element.como_informante }} Informante
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="4" class="text-center text-muted">Sin datos</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Actividad reciente -->
        <div class="section-card">
          <div class="section-header">
            <h2><i class="fas fa-history"></i> Actividad Reciente (Últimos 7 días)</h2>
          </div>
          <div class="actividad-list">
            @for (actividad of estadisticas()?.actividad_reciente || []; track $index) {
              <div class="actividad-item">
                <div class="actividad-icon" [class.icon-propuesta]="actividad.tipo === 'propuesta'" [class.icon-proyecto]="actividad.tipo !== 'propuesta'">
                  <i [class]="actividad.tipo === 'propuesta' ? 'fas fa-file-alt' : 'fas fa-folder'"></i>
                </div>
                <div class="actividad-content">
                  <strong>{{ actividad.titulo }}</strong>
                  <small>{{ actividad.usuario }} • {{ formatearFecha(actividad.fecha) }}</small>
                </div>
              </div>
            } @empty {
              <p class="text-center text-muted" style="padding:32px">No hay actividad reciente</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1600px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;

      h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        color: #1a1a2e;
        font-size: 28px;
        font-weight: 700;
        i { color: #004b8d; }
      }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 20px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary { background: #004b8d; color: #fff; &:hover { background: #003a6e; } }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 20px;
      color: #666;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e0e0e0;
      border-top-color: #004b8d;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .metricas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      margin-bottom: 28px;
    }

    .metric-card {
      border-radius: 14px;
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      color: #fff;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);

      &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }

      &.usuarios { background: linear-gradient(135deg, #004b8d 0%, #0066cc 100%); }
      &.proyectos { background: linear-gradient(135deg, #1b5e20 0%, #388e3c 100%); }
      &.propuestas { background: linear-gradient(135deg, #e65100 0%, #f57c00 100%); }
      &.cumplimiento { background: linear-gradient(135deg, #006064 0%, #00acc1 100%); }
    }

    .metric-icon {
      font-size: 40px;
      opacity: 0.85;
      flex-shrink: 0;
    }

    .metric-content {
      flex: 1;
      .metric-value { font-size: 36px; font-weight: 700; margin-bottom: 4px; }
      .metric-label { font-size: 14px; opacity: 0.9; margin-bottom: 10px; }
      .metric-breakdown {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 12px;
        opacity: 0.8;
      }
    }

    .section-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07);
      border: 1px solid #f0f0f0;
    }

    .section-header {
      margin-bottom: 18px;
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #1a1a2e;
        display: flex;
        align-items: center;
        gap: 10px;
        i { color: #004b8d; }
      }
    }

    .table-wrap { overflow-x: auto; }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;

      th {
        background: #f8f9fa;
        padding: 10px 14px;
        text-align: left;
        font-weight: 600;
        color: #555;
        border-bottom: 2px solid #e8e8e8;
        white-space: nowrap;
      }

      td {
        padding: 10px 14px;
        color: #333;
        border-bottom: 1px solid #f0f0f0;
        vertical-align: middle;
      }

      tr:hover td { background: #f7f9fc; }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;

      &.badge-primary { background: #e3f2fd; color: #1565c0; }
      &.badge-success { background: #e8f5e9; color: #2e7d32; }
      &.badge-danger { background: #ffebee; color: #b71c1c; }
      &.badge-info { background: #e0f7fa; color: #006064; }
    }

    .profesor-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      strong { color: #222; }
      small { color: #999; font-size: 11px; }
    }

    .actividad-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .actividad-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      border-radius: 8px;
      background: #f8f9fa;
      transition: background 0.15s;

      &:hover { background: #f0f4fa; }
    }

    .actividad-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;

      &.icon-propuesta { background: #e3f2fd; color: #1565c0; }
      &.icon-proyecto { background: #e8f5e9; color: #2e7d32; }
    }

    .actividad-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 3px;
      strong { color: #222; font-size: 13px; }
      small { color: #777; font-size: 12px; }
    }

    .text-center { text-align: center; }
    .text-muted { color: #aaa; }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 14px; }
      .page-header h1 { font-size: 22px; }
      .metricas-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardMetricasComponent implements OnInit {
  estadisticas = signal<any>(null);
  cargando = signal(true);

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
      const response: any = await this.apiService.get('/configuracion/estadisticas/globales').toPromise();
      if (response.success) {
        this.estadisticas.set(response.estadisticas);
      }
    } catch (error: any) {
      this.notificationService.error('Error', 'No se pudieron cargar las estadísticas');
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

    return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  }
}
