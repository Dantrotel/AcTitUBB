import { Component, Input, OnInit, signal, inject, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    MatDialogModule
  ],
  template: `
    <div class="historial-card">
      <!-- Header -->
      <div class="historial-header">
        <h2 class="historial-title">
          <i class="fas fa-history"></i>
          Historial de Versiones
        </h2>
        @if (puedeSubirVersion()) {
          <button class="btn btn-primary" (click)="abrirDialogoSubirVersion()">
            <i class="fas fa-upload"></i>
            Subir Nueva Versión
          </button>
        }
      </div>

      <!-- Cuerpo -->
      @if (cargando()) {
        <div class="loading-wrap">
          <div class="spinner"></div>
          <p>Cargando versiones...</p>
        </div>
      } @else if (versiones().length === 0) {
        <div class="empty-state">
          <i class="fas fa-folder-open"></i>
          <p>No hay versiones disponibles</p>
          @if (puedeSubirVersion()) {
            <button class="btn btn-primary" (click)="abrirDialogoSubirVersion()">
              <i class="fas fa-upload"></i>
              Subir Primera Versión
            </button>
          }
        </div>
      } @else {
        <div class="timeline">
          @for (version of versionesOrdenadas(); track version.id; let last = $last) {
            <div class="timeline-item" [class.version-final]="version.es_version_final">
              @if (!last) {
                <div class="timeline-line"></div>
              }

              <!-- Dot -->
              <div class="timeline-dot" [ngClass]="getDotClass(version)">
                <i [class]="getFAIcono(version)"></i>
              </div>

              <!-- Contenido -->
              <div class="timeline-content">
                <div class="version-header">
                  <div class="version-info">
                    <h3>
                      {{ version.numero_version }}
                      @if (version.es_version_final) {
                        <span class="chip chip-final">
                          <i class="fas fa-check-circle"></i> Versión Final
                        </span>
                      }
                    </h3>
                    <span class="version-tipo">{{ getTipoVersionLabel(version.tipo_version) }}</span>
                  </div>

                  <!-- Menú de acciones -->
                  <div class="version-menu" (click)="$event.stopPropagation()">
                    <button class="btn-menu-trigger" (click)="toggleMenu(version.id)">
                      <i class="fas fa-ellipsis-v"></i>
                    </button>
                    @if (menuAbierto() === version.id) {
                      <div class="dropdown-menu">
                        <button class="dropdown-item" (click)="descargarVersion(version); closeMenu()">
                          <i class="fas fa-download"></i> Descargar
                        </button>
                        <button class="dropdown-item" (click)="verComentarios(version); closeMenu()">
                          <i class="fas fa-comments"></i>
                          Ver Comentarios
                          @if (version.total_comentarios) {
                            <span class="chip chip-sm">{{ version.total_comentarios }}</span>
                          }
                        </button>
                        @if (puedeActualizarEstado() && !version.es_version_final) {
                          <button class="dropdown-item" (click)="cambiarEstado(version); closeMenu()">
                            <i class="fas fa-edit"></i> Cambiar Estado
                          </button>
                          @if (puedeMarcarFinal()) {
                            <button class="dropdown-item" (click)="marcarComoFinal(version); closeMenu()">
                              <i class="fas fa-check-circle"></i> Marcar como Final
                            </button>
                          }
                        }
                      </div>
                    }
                  </div>
                </div>

                <div class="version-details">
                  <div class="detail-row">
                    <i class="fas fa-user detail-icon"></i>
                    <span>{{ version.autor_nombre }} {{ version.autor_apellido }}</span>
                    <span [ngClass]="getChipRol(version.autor_rol)" class="chip">
                      {{ getRolLabel(version.autor_rol) }}
                    </span>
                  </div>

                  <div class="detail-row">
                    <i class="fas fa-clock detail-icon"></i>
                    <span>{{ formatearFecha(version.fecha_subida) }}</span>
                  </div>

                  <div class="detail-row">
                    <i class="fas fa-file detail-icon"></i>
                    <span>{{ version.archivo_nombre }}</span>
                    <span class="file-size">({{ formatearTamano(version.archivo_tamano_kb) }})</span>
                  </div>

                  <div class="detail-row">
                    <span [ngClass]="getChipEstado(version.estado)" class="chip">
                      {{ getEstadoLabel(version.estado) }}
                    </span>
                  </div>

                  @if (version.descripcion_cambios) {
                    <div class="info-box info-box-blue">
                      <strong>Descripción de cambios:</strong>
                      <p>{{ version.descripcion_cambios }}</p>
                    </div>
                  }

                  @if (version.comentarios_generales) {
                    <div class="info-box info-box-amber">
                      <i class="fas fa-comment-alt"></i>
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
    </div>
  `,
  styles: [`
    .historial-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      margin: 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }

    .historial-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .historial-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #004b8d;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: 8px;
      border: none;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #004b8d;
      color: #fff;
      &:hover { background: #003a6e; }
    }

    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      color: #666;
      gap: 16px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e0e0e0;
      border-top-color: #004b8d;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
      color: #999;

      i {
        font-size: 52px;
        margin-bottom: 16px;
        opacity: 0.4;
      }

      p {
        font-size: 15px;
        margin-bottom: 20px;
        color: #666;
      }
    }

    .timeline {
      position: relative;
      padding: 8px 0;
    }

    .timeline-item {
      position: relative;
      display: flex;
      gap: 20px;
      padding-bottom: 36px;

      &.version-final .timeline-dot {
        background: linear-gradient(135deg, #388e3c, #66bb6a);
        box-shadow: 0 0 16px rgba(56,142,60,0.4);
      }
    }

    .timeline-line {
      position: absolute;
      left: 23px;
      top: 48px;
      bottom: -8px;
      width: 2px;
      background: linear-gradient(180deg, #e0e0e0, transparent);
    }

    .timeline-dot {
      position: relative;
      z-index: 1;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #fff;
      font-size: 18px;

      &.dot-estudiante { background: linear-gradient(135deg, #004b8d, #0066cc); }
      &.dot-profesor { background: linear-gradient(135deg, #f57c00, #ffa726); }
      &.dot-admin { background: linear-gradient(135deg, #6a1b9a, #ab47bc); }
      &.dot-final { background: linear-gradient(135deg, #388e3c, #66bb6a); }
    }

    .timeline-content {
      flex: 1;
      background: #fff;
      border-radius: 10px;
      padding: 18px 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border: 1px solid #f0f0f0;
      transition: box-shadow 0.2s, transform 0.2s;

      &:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        transform: translateY(-1px);
      }
    }

    .version-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #1a1a2e;
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
    }

    .version-info {
      .version-tipo {
        font-size: 13px;
        color: #777;
        margin-top: 2px;
        display: block;
      }
    }

    .version-menu {
      position: relative;
      flex-shrink: 0;
    }

    .btn-menu-trigger {
      background: transparent;
      border: 1px solid #e0e0e0;
      color: #555;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;

      &:hover { background: #f5f5f5; border-color: #bbb; }
    }

    .dropdown-menu {
      position: absolute;
      top: 36px;
      right: 0;
      background: #fff;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      min-width: 180px;
      z-index: 100;
      overflow: hidden;
    }

    .dropdown-item {
      width: 100%;
      background: transparent;
      border: none;
      padding: 10px 16px;
      text-align: left;
      cursor: pointer;
      font-size: 13px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: background 0.15s;

      &:hover { background: #f5f7fa; }

      i { color: #004b8d; width: 14px; }
    }

    .version-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #444;
    }

    .detail-icon {
      color: #aaa;
      width: 14px;
      text-align: center;
      flex-shrink: 0;
    }

    .file-size {
      color: #aaa;
      font-size: 12px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
    }

    .chip-sm {
      padding: 2px 7px;
      font-size: 10px;
    }

    .chip-final {
      background: #e8f5e9;
      color: #2e7d32;
      border: 1px solid #a5d6a7;
    }

    .chip-rol-estudiante { background: #e3f2fd; color: #1565c0; }
    .chip-rol-profesor_guia { background: #fff3e0; color: #e65100; }
    .chip-rol-profesor_informante { background: #fff3e0; color: #e65100; }
    .chip-rol-admin { background: #f3e5f5; color: #6a1b9a; }

    .chip-estado-borrador { background: #eceff1; color: #455a64; }
    .chip-estado-enviado { background: #e3f2fd; color: #1565c0; }
    .chip-estado-en_revision { background: #fff3e0; color: #e65100; }
    .chip-estado-revisado { background: #e0f2f1; color: #00695c; }
    .chip-estado-aprobado { background: #e8f5e9; color: #2e7d32; }
    .chip-estado-rechazado { background: #ffebee; color: #b71c1c; }

    .info-box {
      margin-top: 10px;
      padding: 12px 14px;
      background: #f8f9fa;
      border-radius: 8px;

      strong {
        display: block;
        font-size: 12px;
        margin-bottom: 4px;
        color: #333;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #555;
        line-height: 1.5;
      }

      &.info-box-blue { border-left: 3px solid #004b8d; }
      &.info-box-amber {
        border-left: 3px solid #f57c00;
        display: flex;
        gap: 10px;

        i { color: #f57c00; margin-top: 2px; }
      }
    }

    @media (max-width: 768px) {
      .timeline-item { gap: 12px; }
      .timeline-dot { width: 40px; height: 40px; font-size: 15px; }
      .timeline-line { left: 19px; }
      .version-header { flex-direction: column; gap: 10px; }
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
  menuAbierto = signal<number | null>(null);

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

  @HostListener('document:click')
  onDocumentClick() {
    if (this.menuAbierto() !== null) {
      this.menuAbierto.set(null);
    }
  }

  toggleMenu(id: number) {
    this.menuAbierto.update(current => current === id ? null : id);
  }

  closeMenu() {
    this.menuAbierto.set(null);
  }

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
      error: () => {
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
      if (result) this.cargarVersiones();
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
      error: () => {
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
      error: () => {
        this.snackBar.open('Error al marcar como final', 'Cerrar', { duration: 3000 });
      }
    });
  }

  getFAIcono(version: VersionDocumento): string {
    if (version.es_version_final) return 'fas fa-check-circle';
    if (version.tipo_version === 'estudiante') return 'fas fa-graduation-cap';
    return 'fas fa-user';
  }

  getDotClass(version: VersionDocumento): string {
    if (version.es_version_final) return 'dot-final';
    if (version.autor_rol === 'estudiante') return 'dot-estudiante';
    if (version.autor_rol === 'admin') return 'dot-admin';
    return 'dot-profesor';
  }

  getChipRol(rol: string): string {
    return 'chip-rol-' + rol;
  }

  getChipEstado(estado: string): string {
    return 'chip-estado-' + estado;
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
