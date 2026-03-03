// Panel de configuración global del sistema - Super Admin
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

interface Configuracion {
  clave: string;
  valor: string;
  descripcion: string;
  tipo_valor: 'entero' | 'booleano' | 'texto';
}

@Component({
  selector: 'app-configuracion-sistema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="configuracion-container">
      <div class="page-header">
        <div>
          <h1>
            <i class="fas fa-cog"></i>
            Configuración del Sistema
          </h1>
          <p>Gestiona los parámetros globales de la plataforma</p>
        </div>
      </div>

      @if (cargando()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Cargando configuraciones...</p>
        </div>
      } @else {
        <div class="configuraciones-grid">
          @for (config of configuraciones(); track config.clave) {
            <div class="config-card">
              <div class="config-card-header">
                <h3>
                  <i class="fas fa-sliders-h"></i>
                  {{ formatearClave(config.clave) }}
                </h3>
              </div>

              <div class="config-card-body">
                <p class="descripcion">{{ config.descripcion }}</p>

                @if (config.tipo_valor === 'entero') {
                  <div class="form-group">
                    <label class="form-label">Valor (días)</label>
                    <div class="input-with-suffix">
                      <input
                        class="form-input"
                        type="number"
                        [(ngModel)]="config.valor"
                        min="0"
                        [disabled]="guardando().has(config.clave)"
                      />
                      <span class="input-suffix"><i class="fas fa-calendar-alt"></i></span>
                    </div>
                  </div>
                } @else if (config.tipo_valor === 'booleano') {
                  <div class="toggle-control">
                    <label class="toggle-label">
                      <input
                        type="checkbox"
                        class="toggle-input"
                        [checked]="config.valor === 'true'"
                        (change)="onToggleChange($event, config)"
                        [disabled]="guardando().has(config.clave)"
                      />
                      <span class="toggle-slider"></span>
                      <span class="toggle-text">{{ config.valor === 'true' ? 'Activado' : 'Desactivado' }}</span>
                    </label>
                  </div>
                } @else {
                  <div class="form-group">
                    <label class="form-label">Valor</label>
                    <input
                      class="form-input"
                      [(ngModel)]="config.valor"
                      [disabled]="guardando().has(config.clave)"
                    />
                  </div>
                }

                <div class="config-actions">
                  <button
                    class="btn btn-primary"
                    (click)="guardarConfiguracion(config)"
                    [disabled]="guardando().has(config.clave)"
                  >
                    @if (guardando().has(config.clave)) {
                      <span class="spinner-sm"></span>
                    } @else {
                      <i class="fas fa-save"></i>
                    }
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .configuracion-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;

      h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 6px 0;
        color: #1a1a2e;
        font-size: 28px;
        font-weight: 700;
        i { color: #004b8d; }
      }

      p {
        margin: 0;
        color: #666;
        font-size: 15px;
      }
    }

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

    .spinner-sm {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .configuraciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
    }

    .config-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      border: 1px solid #f0f0f0;
      overflow: hidden;
    }

    .config-card-header {
      padding: 16px 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-bottom: 1px solid #e8e8e8;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #1a1a2e;
        display: flex;
        align-items: center;
        gap: 8px;
        i { color: #004b8d; }
      }
    }

    .config-card-body {
      padding: 18px 20px;

      .descripcion {
        color: #666;
        font-size: 13px;
        line-height: 1.55;
        margin-bottom: 16px;
      }
    }

    .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 4px; }

    .form-label {
      font-size: 12px;
      font-weight: 600;
      color: #555;
    }

    .input-with-suffix {
      display: flex;
      align-items: stretch;

      .form-input {
        flex: 1;
        border-right: none;
        border-radius: 7px 0 0 7px;
      }

      .input-suffix {
        padding: 0 12px;
        background: #f0f4fa;
        border: 1px solid #ddd;
        border-radius: 0 7px 7px 0;
        display: flex;
        align-items: center;
        color: #004b8d;
        font-size: 14px;
      }
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
      width: 100%;
      box-sizing: border-box;

      &:focus { border-color: #004b8d; }
      &:disabled { background: #f8f8f8; color: #aaa; cursor: not-allowed; }
    }

    /* Toggle switch */
    .toggle-control {
      margin: 12px 0;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }

    .toggle-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: relative;
      width: 46px;
      height: 24px;
      background: #ddd;
      border-radius: 12px;
      transition: background 0.25s;
      flex-shrink: 0;

      &::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 18px;
        height: 18px;
        background: #fff;
        border-radius: 50%;
        transition: left 0.25s;
        box-shadow: 0 1px 4px rgba(0,0,0,0.2);
      }
    }

    .toggle-input:checked + .toggle-slider {
      background: #004b8d;
      &::after { left: 25px; }
    }

    .toggle-input:disabled + .toggle-slider {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .toggle-text {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .config-actions {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 8px 18px;
      border-radius: 7px;
      border: none;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .btn-primary { background: #004b8d; color: #fff; &:hover:not(:disabled) { background: #003a6e; } }

    @media (max-width: 768px) {
      .configuraciones-grid { grid-template-columns: 1fr; }
      .page-header h1 { font-size: 22px; }
    }
  `]
})
export class ConfiguracionSistemaComponent implements OnInit {
  configuraciones = signal<Configuracion[]>([]);
  cargando = signal(true);
  guardando = signal(new Set<string>());

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarConfiguraciones();
  }

  async cargarConfiguraciones() {
    this.cargando.set(true);
    try {
      const response: any = await this.apiService.get('configuracion').toPromise();
      if (response.success) {
        this.configuraciones.set(response.configuraciones);
      }
    } catch (error: any) {
      this.notificationService.error('Error', 'No se pudieron cargar las configuraciones');
    } finally {
      this.cargando.set(false);
    }
  }

  async guardarConfiguracion(config: Configuracion) {
    const guardandoActual = this.guardando();
    guardandoActual.add(config.clave);
    this.guardando.set(new Set(guardandoActual));

    try {
      const response: any = await this.apiService.put(
        `configuracion/${config.clave}`,
        { valor: config.valor }
      ).toPromise();

      if (response.success) {
        this.notificationService.success(
          'Configuración Guardada',
          `${this.formatearClave(config.clave)} actualizado correctamente`
        );
      }
    } catch (error: any) {
      this.notificationService.error('Error', error.error?.message || 'No se pudo guardar la configuración');
      await this.cargarConfiguraciones();
    } finally {
      const guardandoActual = this.guardando();
      guardandoActual.delete(config.clave);
      this.guardando.set(new Set(guardandoActual));
    }
  }

  onToggleChange(event: Event, config: Configuracion) {
    const checked = (event.target as HTMLInputElement).checked;
    config.valor = checked ? 'true' : 'false';
    this.guardarConfiguracion(config);
  }

  formatearClave(clave: string): string {
    return clave
      .split('_')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }
}
