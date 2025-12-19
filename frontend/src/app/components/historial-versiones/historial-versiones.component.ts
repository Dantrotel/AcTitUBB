import { Component, Input, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from '../../services/notification.service';
import { VersionesPlantillasService, VersionDocumento } from '../../services/versiones-plantillas.service';
import { ComentariosVersionComponent } from '../comentarios-version/comentarios-version.component';
import { SubirVersionComponent } from '../subir-version/subir-version.component';

@Component({
  selector: 'app-historial-versiones',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatMenuModule,
    MatDialogModule
  ],
  template: `
    <mat-card class="historial-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>history</mat-icon>
          Historial de Versiones
        </mat-card-title>
        <div class="header-actions">
          @if (puedeSubirVersion()) {
            <button mat-raised-button color="primary" (click)="abrirDialogoSubirVersion()">
              <mat-icon>upload</mat-icon>
              Subir Nueva Versión
            </button>
          }
        </div>
      </mat-card-header>

      <mat-card-content>
        @if (cargando()) {
          <div class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Cargando versiones...</p>
          </div>
        } @else if (versiones().length === 0) {
          <div class="empty-state">
            <mat-icon>folder_open</mat-icon>
            <p>No hay versiones disponibles</p>
            @if (puedeSubirVersion()) {
              <button mat-raised-button color="primary" (click)="abrirDialogoSubirVersion()">
                <mat-icon>upload</mat-icon>
                Subir Primera Versión
              </button>
            }
          </div>
        } @else {
          <div class="timeline">
            @for (version of versionesOrdenadas(); track version.id) {
              <div class="timeline-item" [class.version-final]="version.es_version_final">
                <!-- Línea conectora -->
                @if (!$last) {
                  <div class="timeline-line"></div>
                }

                <!-- Icono de versión -->
                <div class="timeline-icon" [class]="getClaseIcono(version)">
                  <mat-icon>{{ getIcono(version) }}</mat-icon>
                </div>

                <!-- Contenido de versión -->
                <div class="timeline-content">
                  <div class="version-header">
                    <div class="version-info">
                      <h3>
                        {{ version.numero_version }}
                        @if (version.es_version_final) {
                          <mat-chip class="chip-final">
                            <mat-icon>check_circle</mat-icon>
                            Versión Final
                          </mat-chip>
                        }
                      </h3>
                      <span class="version-tipo">
                        {{ getTipoVersionLabel(version.tipo_version) }}
                      </span>
                    </div>

                    <div class="version-actions">
                      <button mat-icon-button [matMenuTriggerFor]="menu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #menu="matMenu">
                        <button mat-menu-item (click)="descargarVersion(version)">
                          <mat-icon>download</mat-icon>
                          Descargar
                        </button>
                        <button mat-menu-item (click)="verComentarios(version)">
                          <mat-icon [matBadge]="version.total_comentarios || 0" 
                                    [matBadgeHidden]="!version.total_comentarios">
                            comment
                          </mat-icon>
                          Ver Comentarios
                        </button>
                        @if (puedeActualizarEstado() && !version.es_version_final) {
                          <button mat-menu-item (click)="cambiarEstado(version)">
                            <mat-icon>edit</mat-icon>
                            Cambiar Estado
                          </button>
                          @if (puedeMarcarFinal()) {
                            <button mat-menu-item (click)="marcarComoFinal(version)">
                              <mat-icon>check_circle</mat-icon>
                              Marcar como Final
                            </button>
                          }
                        }
                      </mat-menu>
                    </div>
                  </div>

                  <div class="version-details">
                    <div class="detail-row">
                      <mat-icon class="detail-icon">person</mat-icon>
                      <span>{{ version.autor_nombre }} {{ version.autor_apellido }}</span>
                      <mat-chip [class]="'chip-rol-' + version.autor_rol">
                        {{ getRolLabel(version.autor_rol) }}
                      </mat-chip>
                    </div>

                    <div class="detail-row">
                      <mat-icon class="detail-icon">schedule</mat-icon>
                      <span>{{ formatearFecha(version.fecha_subida) }}</span>
                    </div>

                    <div class="detail-row">
                      <mat-icon class="detail-icon">insert_drive_file</mat-icon>
                      <span>{{ version.archivo_nombre }}</span>
                      <span class="file-size">({{ formatearTamano(version.archivo_tamano_kb) }})</span>
                    </div>

                    <div class="detail-row">
                      <mat-chip [class]="'chip-estado-' + version.estado">
                        {{ getEstadoLabel(version.estado) }}
                      </mat-chip>
                    </div>

                    @if (version.descripcion_cambios) {
                      <div class="cambios-section">
                        <strong>Descripción de cambios:</strong>
                        <p>{{ version.descripcion_cambios }}</p>
                      </div>
                    }

                    @if (version.comentarios_generales) {
                      <div class="comentarios-section">
                        <mat-icon>comment</mat-icon>
                        <div>
                          <strong>Comentarios generales:</strong>
                          <p>{{ version.comentarios_generales }}</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .historial-card {
      margin: 20px;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 24px;
      }
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #999;
        margin-bottom: 20px;
      }

      p {
        color: #666;
        font-size: 16px;
        margin-bottom: 20px;
      }
    }

    .timeline {
      position: relative;
      padding: 20px 0;
    }

    .timeline-item {
      position: relative;
      display: flex;
      gap: 20px;
      padding-bottom: 40px;

      &.version-final {
        .timeline-icon {
          background: linear-gradient(135deg, #4CAF50, #8BC34A);
          box-shadow: 0 0 20px rgba(76, 175, 80, 0.5);
        }
      }
    }

    .timeline-line {
      position: absolute;
      left: 24px;
      top: 48px;
      bottom: -40px;
      width: 2px;
      background: linear-gradient(180deg, #e0e0e0, transparent);
    }

    .timeline-icon {
      position: relative;
      z-index: 1;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;

      mat-icon {
        color: white;
      }

      &.icono-estudiante {
        background: linear-gradient(135deg, #2196F3, #03A9F4);
      }

      &.icono-profesor {
        background: linear-gradient(135deg, #FF9800, #FFC107);
      }

      &.icono-admin {
        background: linear-gradient(135deg, #9C27B0, #E91E63);
      }
    }

    .timeline-content {
      flex: 1;
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        transform: translateY(-2px);
      }
    }

    .version-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;

      h3 {
        margin: 0;
        font-size: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
    }

    .version-info {
      .version-tipo {
        color: #666;
        font-size: 14px;
      }
    }

    .version-details {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #555;

      .detail-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #999;
      }

      .file-size {
        color: #999;
        font-size: 12px;
      }
    }

    .cambios-section, .comentarios-section {
      margin-top: 15px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 8px;
      border-left: 4px solid #2196F3;

      strong {
        display: block;
        margin-bottom: 8px;
        color: #333;
      }

      p {
        margin: 0;
        color: #555;
        line-height: 1.6;
      }
    }

    .comentarios-section {
      display: flex;
      gap: 12px;
      border-left-color: #FF9800;

      mat-icon {
        color: #FF9800;
      }
    }

    .chip-final {
      background: #4CAF50 !important;
      color: white !important;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .chip-rol-estudiante { background: #E3F2FD; color: #1976D2; }
    .chip-rol-profesor_guia { background: #FFF3E0; color: #F57C00; }
    .chip-rol-profesor_informante { background: #FFF3E0; color: #F57C00; }
    .chip-rol-admin { background: #F3E5F5; color: #7B1FA2; }

    .chip-estado-borrador { background: #ECEFF1; color: #546E7A; }
    .chip-estado-enviado { background: #E3F2FD; color: #1976D2; }
    .chip-estado-en_revision { background: #FFF3E0; color: #F57C00; }
    .chip-estado-revisado { background: #E0F2F1; color: #00796B; }
    .chip-estado-aprobado { background: #E8F5E9; color: #388E3C; }
    .chip-estado-rechazado { background: #FFEBEE; color: #C62828; }

    @media (max-width: 768px) {
      .timeline-item {
        gap: 10px;
      }

      .timeline-icon {
        width: 40px;
        height: 40px;
      }

      .timeline-line {
        left: 19px;
      }

      .version-header {
        flex-direction: column;
        gap: 10px;
      }
    }
  `]
})
export class HistorialVersionesComponent implements OnInit {
  @Input() avanceId!: number;
  @Input() proyectoId!: number;
  @Input() rolUsuario!: string;

  private versionesService = inject(VersionesPlantillasService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private notificationService = inject(NotificationService);

  versiones = signal<VersionDocumento[]>([]);
  cargando = signal(true);

  versionesOrdenadas = computed(() => {
    return [...this.versiones()].sort((a, b) => 
      new Date(b.fecha_subida).getTime() - new Date(a.fecha_subida).getTime()
    );
  });

  puedeSubirVersion = computed(() => {
    return ['estudiante', 'profesor_guia', 'profesor_informante'].includes(this.rolUsuario);
  });

  puedeActualizarEstado = computed(() => {
    return ['profesor_guia', 'profesor_informante', 'admin'].includes(this.rolUsuario);
  });

  puedeMarcarFinal = computed(() => {
    return ['profesor_guia', 'admin'].includes(this.rolUsuario);
  });

  ngOnInit() {
    this.cargarVersiones();
  }

  cargarVersiones() {
    this.cargando.set(true);
    this.versionesService.obtenerVersionesAvance(this.avanceId).subscribe({
      next: (response) => {
        this.versiones.set(response.versiones);
        this.cargando.set(false);
      },
      error: (error) => {
        this.snackBar.open('Error al cargar versiones', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  abrirDialogoSubirVersion() {
    const dialogRef = this.dialog.open(SubirVersionComponent, {
      width: '600px',
      data: {
        avanceId: this.avanceId,
        proyectoId: this.proyectoId,
        rolUsuario: this.rolUsuario
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarVersiones();
      }
    });
  }

  descargarVersion(version: VersionDocumento) {
    this.versionesService.descargarVersion(version.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = version.archivo_nombre;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Descarga iniciada', 'Cerrar', { duration: 2000 });
      },
      error: (error) => {
        this.snackBar.open('Error al descargar archivo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  verComentarios(version: VersionDocumento) {
    this.dialog.open(ComentariosVersionComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: {
        versionId: version.id,
        version: version,
        rolUsuario: this.rolUsuario
      }
    });
  }

  cambiarEstado(version: VersionDocumento) {
    // TODO: Implementar diálogo para cambiar estado
  }

  async marcarComoFinal(version: VersionDocumento) {
    const confirmed = await this.notificationService.confirm(
      `¿Marcar ${version.numero_version} como versión final?`,
      'Marcar como Final',
      'Marcar',
      'Cancelar'
    );
    
    if (!confirmed) return;
    
    this.versionesService.marcarVersionFinal(version.id).subscribe({
      next: () => {
        this.snackBar.open('Versión marcada como final', 'Cerrar', { duration: 3000 });
        this.cargarVersiones();
      },
      error: (error) => {
        this.snackBar.open('Error al marcar como final', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getIcono(version: VersionDocumento): string {
    if (version.es_version_final) return 'check_circle';
    if (version.tipo_version === 'estudiante') return 'school';
    return 'person';
  }

  getClaseIcono(version: VersionDocumento): string {
    if (version.autor_rol === 'estudiante') return 'icono-estudiante';
    if (version.autor_rol === 'admin') return 'icono-admin';
    return 'icono-profesor';
  }

  getTipoVersionLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'estudiante': 'Versión del Estudiante',
      'profesor_revision': 'Revisión del Profesor',
      'profesor_comentarios': 'Comentarios del Profesor',
      'version_final': 'Versión Final Aprobada'
    };
    return labels[tipo] || tipo;
  }

  getRolLabel(rol: string): string {
    const labels: Record<string, string> = {
      'estudiante': 'Estudiante',
      'profesor_guia': 'Profesor Guía',
      'profesor_informante': 'Profesor Informante',
      'admin': 'Administrador'
    };
    return labels[rol] || rol;
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'borrador': 'Borrador',
      'enviado': 'Enviado',
      'en_revision': 'En Revisión',
      'revisado': 'Revisado',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado'
    };
    return labels[estado] || estado;
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearTamano(tamanoKb: number): string {
    return this.versionesService.formatearTamano(tamanoKb);
  }
}
