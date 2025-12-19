import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { VersionesPlantillasService, PlantillaDocumento } from '../../../services/versiones-plantillas.service';

@Component({
  selector: 'app-plantillas-estudiante',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="plantillas-container">
      <div class="page-header">
        <div class="header-content">
          <h1>
            <mat-icon>description</mat-icon>
            Plantillas de Documentos
          </h1>
          <p class="subtitle">
            Descarga las plantillas oficiales para tus documentos de titulación
          </p>
        </div>
      </div>

      <!-- Filtros -->
      <mat-card class="filtros-card">
        <div class="filtros-container">
          <mat-form-field appearance="outline">
            <mat-label>Tipo de Documento</mat-label>
            <mat-select [(ngModel)]="tipoFiltro" (selectionChange)="aplicarFiltros()">
              <mat-option value="">Todos los tipos</mat-option>
              <mat-option value="propuesta">Propuesta</mat-option>
              <mat-option value="informe_avance">Informe de Avance</mat-option>
              <mat-option value="informe_final">Informe Final</mat-option>
              <mat-option value="presentacion">Presentación</mat-option>
              <mat-option value="poster">Póster</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Buscar</mat-label>
            <input matInput 
                   [(ngModel)]="busqueda"
                   (ngModelChange)="aplicarFiltros()"
                   placeholder="Buscar plantillas...">
            <mat-icon matPrefix>search</mat-icon>
          </mat-form-field>

          <button mat-raised-button (click)="limpiarFiltros()">
            <mat-icon>clear</mat-icon>
            Limpiar
          </button>
        </div>
      </mat-card>

      <!-- Lista de plantillas -->
      @if (cargando()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
          <p>Cargando plantillas...</p>
        </div>
      } @else if (plantillasFiltradas().length === 0) {
        <mat-card class="empty-state">
          <mat-icon>folder_open</mat-icon>
          <h2>No se encontraron plantillas</h2>
          <p>No hay plantillas disponibles con los filtros seleccionados</p>
        </mat-card>
      } @else {
        <!-- Plantillas obligatorias -->
        @if (plantillasObligatorias().length > 0) {
          <div class="seccion-plantillas">
            <h2 class="seccion-titulo">
              <mat-icon>priority_high</mat-icon>
              Plantillas Obligatorias
            </h2>
            <div class="plantillas-grid">
              @for (plantilla of plantillasObligatorias(); track plantilla.id) {
                <mat-card class="plantilla-card obligatoria">
                  <mat-card-header>
                    <div class="card-header-content">
                      <mat-icon class="tipo-icon">
                        {{ obtenerIconoTipo(plantilla.tipo_documento) }}
                      </mat-icon>
                      <div class="header-info">
                        <mat-card-title>{{ plantilla.nombre }}</mat-card-title>
                        <mat-card-subtitle>{{ getTipoLabel(plantilla.tipo_documento) }}</mat-card-subtitle>
                      </div>
                    </div>
                    <mat-chip class="chip-obligatoria">
                      <mat-icon>star</mat-icon>
                      Obligatoria
                    </mat-chip>
                  </mat-card-header>

                  <mat-card-content>
                    @if (plantilla.descripcion) {
                      <p class="descripcion">{{ plantilla.descripcion }}</p>
                    }

                    <div class="plantilla-metadata">
                      <div class="metadata-item">
                        <mat-icon>insert_drive_file</mat-icon>
                        <span>{{ plantilla.archivo_nombre }}</span>
                      </div>

                      <div class="metadata-item">
                        <mat-icon>straighten</mat-icon>
                        <span>{{ formatearTamano(plantilla.archivo_tamano_kb) }}</span>
                      </div>

                      @if (plantilla.formato_requerido) {
                        <div class="metadata-item">
                          <mat-icon>description</mat-icon>
                          <span>Formato: {{ plantilla.formato_requerido }}</span>
                        </div>
                      }

                      <div class="metadata-item">
                        <mat-icon>download</mat-icon>
                        <span>{{ plantilla.descargas }} descargas</span>
                      </div>
                    </div>

                    @if (plantilla.instrucciones) {
                      <div class="instrucciones-section">
                        <strong>Instrucciones:</strong>
                        <p>{{ plantilla.instrucciones }}</p>
                      </div>
                    }
                  </mat-card-content>

                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="descargarPlantilla(plantilla)">
                      <mat-icon>download</mat-icon>
                      Descargar Plantilla
                    </button>
                    @if (plantilla.ejemplo_url) {
                      <button mat-button (click)="abrirEjemplo(plantilla.ejemplo_url)">
                        <mat-icon>visibility</mat-icon>
                        Ver Ejemplo
                      </button>
                    }
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          </div>
        }

        <!-- Plantillas opcionales -->
        @if (plantillasOpcionales().length > 0) {
          <div class="seccion-plantillas">
            <h2 class="seccion-titulo">
              <mat-icon>library_books</mat-icon>
              Plantillas Opcionales
            </h2>
            <div class="plantillas-grid">
              @for (plantilla of plantillasOpcionales(); track plantilla.id) {
                <mat-card class="plantilla-card">
                  <mat-card-header>
                    <div class="card-header-content">
                      <mat-icon class="tipo-icon">
                        {{ obtenerIconoTipo(plantilla.tipo_documento) }}
                      </mat-icon>
                      <div class="header-info">
                        <mat-card-title>{{ plantilla.nombre }}</mat-card-title>
                        <mat-card-subtitle>{{ getTipoLabel(plantilla.tipo_documento) }}</mat-card-subtitle>
                      </div>
                    </div>
                    @if (plantilla.version_plantilla) {
                      <mat-chip class="chip-version">v{{ plantilla.version_plantilla }}</mat-chip>
                    }
                  </mat-card-header>

                  <mat-card-content>
                    @if (plantilla.descripcion) {
                      <p class="descripcion">{{ plantilla.descripcion }}</p>
                    }

                    <div class="plantilla-metadata">
                      <div class="metadata-item">
                        <mat-icon>insert_drive_file</mat-icon>
                        <span>{{ plantilla.archivo_nombre }}</span>
                      </div>

                      <div class="metadata-item">
                        <mat-icon>straighten</mat-icon>
                        <span>{{ formatearTamano(plantilla.archivo_tamano_kb) }}</span>
                      </div>

                      <div class="metadata-item">
                        <mat-icon>download</mat-icon>
                        <span>{{ plantilla.descargas }} descargas</span>
                      </div>
                    </div>
                  </mat-card-content>

                  <mat-card-actions>
                    <button mat-raised-button color="primary" (click)="descargarPlantilla(plantilla)">
                      <mat-icon>download</mat-icon>
                      Descargar
                    </button>
                  </mat-card-actions>
                </mat-card>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .plantillas-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 30px;

      .header-content {
        h1 {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 0 0 10px 0;
          font-size: 32px;
          color: #333;

          mat-icon {
            font-size: 40px;
            width: 40px;
            height: 40px;
            color: #2196F3;
          }
        }

        .subtitle {
          margin: 0;
          color: #666;
          font-size: 16px;
          padding-left: 55px;
        }
      }
    }

    .filtros-card {
      margin-bottom: 30px;
      
      .filtros-container {
        display: flex;
        gap: 20px;
        align-items: center;
        flex-wrap: wrap;

        mat-form-field {
          flex: 1;
          min-width: 200px;
        }
      }
    }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;

      mat-icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: #ccc;
        margin-bottom: 20px;
      }

      h2 {
        margin: 0 0 10px 0;
        color: #666;
      }

      p {
        color: #999;
      }
    }

    .seccion-plantillas {
      margin-bottom: 40px;

      .seccion-titulo {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 0 0 20px 0;
        padding-bottom: 10px;
        border-bottom: 2px solid #e0e0e0;
        color: #333;

        mat-icon {
          color: #2196F3;
        }
      }
    }

    .plantillas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
    }

    .plantilla-card {
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        transform: translateY(-4px);
      }

      &.obligatoria {
        border: 2px solid #FF9800;
        background: linear-gradient(to bottom, #FFF3E0 0%, white 10%);
      }

      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 16px;

        .card-header-content {
          display: flex;
          gap: 15px;
          align-items: start;
          flex: 1;

          .tipo-icon {
            font-size: 40px;
            width: 40px;
            height: 40px;
            color: #2196F3;
          }

          .header-info {
            flex: 1;

            mat-card-title {
              font-size: 18px;
              margin-bottom: 5px;
            }

            mat-card-subtitle {
              color: #666;
            }
          }
        }
      }

      mat-card-content {
        flex: 1;
        
        .descripcion {
          margin: 0 0 15px 0;
          color: #555;
          line-height: 1.5;
        }

        .plantilla-metadata {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 15px;

          .metadata-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #666;
            font-size: 14px;

            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
              color: #999;
            }
          }
        }

        .instrucciones-section {
          margin-top: 15px;
          padding: 12px;
          background: #E3F2FD;
          border-radius: 6px;
          border-left: 3px solid #2196F3;

          strong {
            display: block;
            margin-bottom: 5px;
            color: #1976D2;
          }

          p {
            margin: 0;
            font-size: 13px;
            color: #555;
            line-height: 1.5;
          }
        }
      }

      mat-card-actions {
        display: flex;
        gap: 10px;
        padding: 16px;
        border-top: 1px solid #e0e0e0;
      }
    }

    .chip-obligatoria {
      background: #FF9800 !important;
      color: white !important;
      font-weight: 500;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .chip-version {
      background: #E3F2FD;
      color: #1976D2;
    }

    @media (max-width: 768px) {
      .plantillas-grid {
        grid-template-columns: 1fr;
      }

      .filtros-container {
        flex-direction: column;

        mat-form-field, button {
          width: 100%;
        }
      }

      .page-header .header-content h1 {
        font-size: 24px;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }
    }
  `]
})
export class PlantillasEstudianteComponent implements OnInit {
  private versionesService = inject(VersionesPlantillasService);
  private snackBar = inject(MatSnackBar);

  plantillas = signal<PlantillaDocumento[]>([]);
  cargando = signal(true);

  tipoFiltro = '';
  busqueda = '';

  plantillasFiltradas = computed(() => {
    let resultado = this.plantillas();

    // Filtrar por tipo
    if (this.tipoFiltro) {
      resultado = resultado.filter(p => p.tipo_documento === this.tipoFiltro);
    }

    // Filtrar por búsqueda
    if (this.busqueda) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busquedaLower) ||
        p.descripcion?.toLowerCase().includes(busquedaLower)
      );
    }

    return resultado;
  });

  plantillasObligatorias = computed(() => {
    return this.plantillasFiltradas().filter(p => p.obligatoria);
  });

  plantillasOpcionales = computed(() => {
    return this.plantillasFiltradas().filter(p => !p.obligatoria);
  });

  ngOnInit() {
    this.cargarPlantillas();
  }

  cargarPlantillas() {
    this.cargando.set(true);
    this.versionesService.obtenerPlantillas().subscribe({
      next: (response) => {
        this.plantillas.set(response.plantillas);
        this.cargando.set(false);
      },
      error: (error) => {
        this.snackBar.open('Error al cargar plantillas', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros() {
    // Los filtros se aplican automáticamente gracias a los computed signals
  }

  limpiarFiltros() {
    this.tipoFiltro = '';
    this.busqueda = '';
  }

  descargarPlantilla(plantilla: PlantillaDocumento) {
    this.versionesService.descargarPlantilla(plantilla.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = plantilla.archivo_nombre;
        link.click();
        window.URL.revokeObjectURL(url);
        this.snackBar.open('Descarga iniciada', 'Cerrar', { duration: 2000 });
        // Refrescar plantillas para actualizar contador de descargas
        setTimeout(() => this.cargarPlantillas(), 1000);
      },
      error: (error) => {
        this.snackBar.open('Error al descargar plantilla', 'Cerrar', { duration: 3000 });
      }
    });
  }

  abrirEjemplo(url: string) {
    window.open(url, '_blank');
  }

  obtenerIconoTipo(tipo: string): string {
    return this.versionesService.obtenerIconoTipoDocumento(tipo);
  }

  getTipoLabel(tipo: string): string {
    const labels: Record<string, string> = {
      propuesta: 'Propuesta de Proyecto',
      informe_avance: 'Informe de Avance',
      informe_final: 'Informe Final',
      presentacion: 'Presentación',
      poster: 'Póster Científico',
      acta: 'Acta',
      otro: 'Otro Documento'
    };
    return labels[tipo] || tipo;
  }

  formatearTamano(tamanoKb: number): string {
    return this.versionesService.formatearTamano(tamanoKb);
  }
}
