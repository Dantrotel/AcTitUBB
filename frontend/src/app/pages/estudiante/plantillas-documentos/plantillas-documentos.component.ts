import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VersionesPlantillasService, PlantillaDocumento } from '../../../services/versiones-plantillas.service';

@Component({
  selector: 'app-plantillas-estudiante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="plantillas-container">
      <div class="page-header">
        <div>
          <h1>
            <i class="fas fa-file-alt"></i>
            Plantillas de Documentos
          </h1>
          <p class="subtitle">Descarga las plantillas oficiales para tus documentos de titulación</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filtros-card">
        <div class="filtros-container">
          <div class="form-group">
            <label class="form-label">Tipo de Documento</label>
            <select class="form-input" [(ngModel)]="tipoFiltro" (ngModelChange)="aplicarFiltros()">
              <option value="">Todos los tipos</option>
              <option value="propuesta">Propuesta</option>
              <option value="informe_avance">Informe de Avance</option>
              <option value="informe_final">Informe Final</option>
              <option value="presentacion">Presentación</option>
              <option value="poster">Póster</option>
            </select>
          </div>

          <div class="form-group search-group">
            <label class="form-label">Buscar</label>
            <div class="search-input-wrap">
              <i class="fas fa-search search-icon"></i>
              <input
                class="form-input search-input"
                [(ngModel)]="busqueda"
                (ngModelChange)="aplicarFiltros()"
                placeholder="Buscar plantillas..."
              />
            </div>
          </div>

          <button class="btn btn-ghost" (click)="limpiarFiltros()">
            <i class="fas fa-times"></i>
            Limpiar
          </button>
        </div>
      </div>

      <!-- Lista de plantillas -->
      @if (cargando()) {
        <div class="loading-container">
          <div class="spinner"></div>
          <p>Cargando plantillas...</p>
        </div>
      } @else if (plantillasFiltradas().length === 0) {
        <div class="empty-state">
          <i class="fas fa-folder-open"></i>
          <h2>No se encontraron plantillas</h2>
          <p>No hay plantillas disponibles con los filtros seleccionados</p>
        </div>
      } @else {
        <!-- Plantillas obligatorias -->
        @if (plantillasObligatorias().length > 0) {
          <div class="seccion-plantillas">
            <h2 class="seccion-titulo">
              <i class="fas fa-exclamation-circle"></i>
              Plantillas Obligatorias
            </h2>
            <div class="plantillas-grid">
              @for (plantilla of plantillasObligatorias(); track plantilla.id) {
                <div class="plantilla-card obligatoria">
                  <div class="card-header">
                    <div class="card-header-left">
                      <div class="tipo-icon-wrap">
                        <i [class]="getFAIconoTipo(plantilla.tipo_documento)"></i>
                      </div>
                      <div class="header-info">
                        <h3>{{ plantilla.nombre }}</h3>
                        <span class="subtitle-small">{{ getTipoLabel(plantilla.tipo_documento) }}</span>
                      </div>
                    </div>
                    <span class="chip chip-obligatoria">
                      <i class="fas fa-star"></i>
                      Obligatoria
                    </span>
                  </div>

                  <div class="card-body">
                    @if (plantilla.descripcion) {
                      <p class="descripcion">{{ plantilla.descripcion }}</p>
                    }

                    <div class="plantilla-metadata">
                      <div class="metadata-item">
                        <i class="fas fa-file"></i>
                        <span>{{ plantilla.archivo_nombre }}</span>
                      </div>
                      <div class="metadata-item">
                        <i class="fas fa-weight"></i>
                        <span>{{ formatearTamano(plantilla.archivo_tamano_kb) }}</span>
                      </div>
                      @if (plantilla.formato_requerido) {
                        <div class="metadata-item">
                          <i class="fas fa-file-alt"></i>
                          <span>Formato: {{ plantilla.formato_requerido }}</span>
                        </div>
                      }
                      <div class="metadata-item">
                        <i class="fas fa-download"></i>
                        <span>{{ plantilla.descargas }} descargas</span>
                      </div>
                    </div>

                    @if (plantilla.instrucciones) {
                      <div class="instrucciones-box">
                        <strong>Instrucciones:</strong>
                        <p>{{ plantilla.instrucciones }}</p>
                      </div>
                    }
                  </div>

                  <div class="card-footer">
                    <button class="btn btn-primary" (click)="descargarPlantilla(plantilla)">
                      <i class="fas fa-download"></i>
                      Descargar Plantilla
                    </button>
                    @if (plantilla.ejemplo_url) {
                      <button class="btn btn-ghost" (click)="abrirEjemplo(plantilla.ejemplo_url)">
                        <i class="fas fa-eye"></i>
                        Ver Ejemplo
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- Plantillas opcionales -->
        @if (plantillasOpcionales().length > 0) {
          <div class="seccion-plantillas">
            <h2 class="seccion-titulo">
              <i class="fas fa-book"></i>
              Plantillas Opcionales
            </h2>
            <div class="plantillas-grid">
              @for (plantilla of plantillasOpcionales(); track plantilla.id) {
                <div class="plantilla-card">
                  <div class="card-header">
                    <div class="card-header-left">
                      <div class="tipo-icon-wrap">
                        <i [class]="getFAIconoTipo(plantilla.tipo_documento)"></i>
                      </div>
                      <div class="header-info">
                        <h3>{{ plantilla.nombre }}</h3>
                        <span class="subtitle-small">{{ getTipoLabel(plantilla.tipo_documento) }}</span>
                      </div>
                    </div>
                    @if (plantilla.version_plantilla) {
                      <span class="chip chip-version">v{{ plantilla.version_plantilla }}</span>
                    }
                  </div>

                  <div class="card-body">
                    @if (plantilla.descripcion) {
                      <p class="descripcion">{{ plantilla.descripcion }}</p>
                    }

                    <div class="plantilla-metadata">
                      <div class="metadata-item">
                        <i class="fas fa-file"></i>
                        <span>{{ plantilla.archivo_nombre }}</span>
                      </div>
                      <div class="metadata-item">
                        <i class="fas fa-weight"></i>
                        <span>{{ formatearTamano(plantilla.archivo_tamano_kb) }}</span>
                      </div>
                      <div class="metadata-item">
                        <i class="fas fa-download"></i>
                        <span>{{ plantilla.descargas }} descargas</span>
                      </div>
                    </div>
                  </div>

                  <div class="card-footer">
                    <button class="btn btn-primary" (click)="descargarPlantilla(plantilla)">
                      <i class="fas fa-download"></i>
                      Descargar
                    </button>
                  </div>
                </div>
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
      margin-bottom: 28px;
      h1 {
        display: flex;
        align-items: center;
        gap: 14px;
        margin: 0 0 6px 0;
        font-size: 26px;
        font-weight: 700;
        color: #1a1a2e;
        i { color: #004b8d; }
      }
      .subtitle { margin: 0; color: #666; font-size: 14px; }
    }

    .filtros-card {
      background: #fff;
      border-radius: 10px;
      padding: 18px 20px;
      margin-bottom: 28px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.07);
      border: 1px solid #f0f0f0;
    }

    .filtros-container {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
      min-width: 180px;
    }

    .search-group { flex: 2; }

    .form-label {
      font-size: 12px;
      font-weight: 600;
      color: #555;
    }

    .form-input {
      border: 1px solid #ddd;
      border-radius: 7px;
      padding: 9px 12px;
      font-size: 13px;
      outline: none;
      background: #fff;
      transition: border-color 0.2s;
      font-family: inherit;
      &:focus { border-color: #004b8d; }
    }

    .search-input-wrap {
      position: relative;
      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #aaa;
        font-size: 13px;
      }
      .search-input { padding-left: 34px; width: 100%; box-sizing: border-box; }
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      border-radius: 7px;
      border: none;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .btn-primary { background: #004b8d; color: #fff; &:hover { background: #003a6e; } }
    .btn-ghost { background: transparent; color: #555; border: 1px solid #ddd; &:hover { background: #f5f5f5; } }

    .loading-container, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      text-align: center;
      color: #aaa;
      i { font-size: 64px; margin-bottom: 16px; }
      h2 { margin: 0 0 8px 0; color: #666; }
      p { color: #999; margin: 0; }
    }

    .spinner {
      width: 44px;
      height: 44px;
      border: 4px solid #e0e0e0;
      border-top-color: #004b8d;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 14px;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .seccion-plantillas { margin-bottom: 36px; }

    .seccion-titulo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 18px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #e8e8e8;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      i { color: #004b8d; }
    }

    .plantillas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
      gap: 18px;
    }

    .plantilla-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.07);
      border: 1px solid #f0f0f0;
      display: flex;
      flex-direction: column;
      transition: all 0.2s;
      overflow: hidden;

      &:hover {
        box-shadow: 0 6px 20px rgba(0,0,0,0.12);
        transform: translateY(-3px);
      }

      &.obligatoria {
        border: 2px solid #f57c00;
        background: linear-gradient(to bottom, #fff8f0 0%, #fff 8%);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 18px 18px 12px 18px;
      border-bottom: 1px solid #f5f5f5;
    }

    .card-header-left {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      flex: 1;
    }

    .tipo-icon-wrap {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #004b8d;
      flex-shrink: 0;
    }

    .header-info {
      flex: 1;
      h3 { margin: 0 0 4px 0; font-size: 15px; font-weight: 700; color: #1a1a2e; }
      .subtitle-small { font-size: 12px; color: #777; }
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .chip-obligatoria { background: #f57c00; color: #fff; }
    .chip-version { background: #e3f2fd; color: #1565c0; }

    .card-body {
      padding: 14px 18px;
      flex: 1;

      .descripcion { margin: 0 0 12px 0; color: #555; font-size: 13px; line-height: 1.5; }
    }

    .plantilla-metadata {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 12px;
      i { color: #aaa; width: 14px; text-align: center; }
    }

    .instrucciones-box {
      margin-top: 12px;
      padding: 10px 12px;
      background: #e3f2fd;
      border-radius: 6px;
      border-left: 3px solid #004b8d;
      strong { display: block; margin-bottom: 4px; color: #004b8d; font-size: 12px; }
      p { margin: 0; font-size: 12px; color: #555; line-height: 1.5; }
    }

    .card-footer {
      display: flex;
      gap: 10px;
      padding: 14px 18px;
      border-top: 1px solid #f0f0f0;
      background: #fafafa;
    }

    @media (max-width: 768px) {
      .plantillas-grid { grid-template-columns: 1fr; }
      .filtros-container { flex-direction: column; }
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
    if (this.tipoFiltro) resultado = resultado.filter(p => p.tipo_documento === this.tipoFiltro);
    if (this.busqueda) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(busquedaLower) ||
        p.descripcion?.toLowerCase().includes(busquedaLower)
      );
    }
    return resultado;
  });

  plantillasObligatorias = computed(() => this.plantillasFiltradas().filter(p => p.obligatoria));
  plantillasOpcionales = computed(() => this.plantillasFiltradas().filter(p => !p.obligatoria));

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
      error: () => {
        this.snackBar.open('Error al cargar plantillas', 'Cerrar', { duration: 3000 });
        this.cargando.set(false);
      }
    });
  }

  aplicarFiltros() {}

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
        setTimeout(() => this.cargarPlantillas(), 1000);
      },
      error: () => {
        this.snackBar.open('Error al descargar plantilla', 'Cerrar', { duration: 3000 });
      }
    });
  }

  abrirEjemplo(url: string) {
    window.open(url, '_blank');
  }

  getFAIconoTipo(tipo: string): string {
    const icons: Record<string, string> = {
      propuesta: 'fas fa-lightbulb',
      informe_avance: 'fas fa-chart-line',
      informe_final: 'fas fa-file-check',
      presentacion: 'fas fa-presentation',
      poster: 'fas fa-image',
      acta: 'fas fa-scroll',
      otro: 'fas fa-file-alt'
    };
    return icons[tipo] || 'fas fa-file-alt';
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
