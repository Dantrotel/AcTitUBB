// Panel de configuración global del sistema - Super Admin
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatTooltipModule
  ],
  template: `
    <div class="configuracion-container">
      <div class="header">
        <h1>
          <mat-icon>settings</mat-icon>
          Configuración del Sistema
        </h1>
        <p>Gestiona los parámetros globales de la plataforma</p>
      </div>

      @if (cargando()) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Cargando configuraciones...</p>
        </div>
      } @else {
        <div class="configuraciones-grid">
          @for (config of configuraciones(); track config.clave) {
            <mat-card class="config-card">
              <mat-card-header>
                <mat-card-title>
                  <mat-icon>tune</mat-icon>
                  {{ formatearClave(config.clave) }}
                </mat-card-title>
              </mat-card-header>

              <mat-card-content>
                <p class="descripcion">{{ config.descripcion }}</p>

                @if (config.tipo_valor === 'entero') {
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Valor (días)</mat-label>
                    <input 
                      matInput 
                      type="number" 
                      [(ngModel)]="config.valor"
                      min="0"
                      [disabled]="guardando().has(config.clave)">
                    <mat-icon matSuffix matTooltip="Número de días">calendar_today</mat-icon>
                  </mat-form-field>
                } @else if (config.tipo_valor === 'booleano') {
                  <div class="boolean-control">
                    <mat-slide-toggle 
                      [checked]="config.valor === 'true'"
                      (change)="onToggleChange($event, config)"
                      [disabled]="guardando().has(config.clave)">
                      {{ config.valor === 'true' ? 'Activado' : 'Desactivado' }}
                    </mat-slide-toggle>
                  </div>
                } @else {
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Valor</mat-label>
                    <input 
                      matInput 
                      [(ngModel)]="config.valor"
                      [disabled]="guardando().has(config.clave)">
                  </mat-form-field>
                }

                <div class="config-actions">
                  <button 
                    mat-raised-button 
                    color="primary"
                    (click)="guardarConfiguracion(config)"
                    [disabled]="guardando().has(config.clave)">
                    @if (guardando().has(config.clave)) {
                      <mat-spinner diameter="20"></mat-spinner>
                    } @else {
                      <mat-icon>save</mat-icon>
                    }
                    Guardar
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
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

    .header {
      margin-bottom: 32px;

      h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 8px 0;
        color: #333;
        font-size: 32px;

        mat-icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
          color: #667eea;
        }
      }

      p {
        margin: 0;
        color: #666;
        font-size: 16px;
      }
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      gap: 20px;

      p {
        color: #666;
        font-size: 16px;
      }
    }

    .configuraciones-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .config-card {
      mat-card-header {
        mat-card-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #333;
          font-size: 18px;

          mat-icon {
            color: #667eea;
            font-size: 24px;
            width: 24px;
            height: 24px;
          }
        }
      }

      mat-card-content {
        padding-top: 16px;

        .descripcion {
          color: #666;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .full-width {
          width: 100%;
        }

        .boolean-control {
          padding: 16px 0;

          mat-slide-toggle {
            font-size: 16px;
          }
        }

        .config-actions {
          margin-top: 16px;
          display: flex;
          justify-content: flex-end;

          button {
            mat-icon {
              margin-right: 8px;
            }

            mat-spinner {
              display: inline-block;
              margin-right: 8px;
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .configuraciones-grid {
        grid-template-columns: 1fr;
      }

      .header h1 {
        font-size: 24px;
      }
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
      this.notificationService.error(
        'Error',
        'No se pudieron cargar las configuraciones'
      );
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
      this.notificationService.error(
        'Error',
        error.error?.message || 'No se pudo guardar la configuración'
      );
      await this.cargarConfiguraciones(); // Recargar valores originales
    } finally {
      const guardandoActual = this.guardando();
      guardandoActual.delete(config.clave);
      this.guardando.set(new Set(guardandoActual));
    }
  }

  onToggleChange(event: any, config: Configuracion) {
    config.valor = event.checked ? 'true' : 'false';
    this.guardarConfiguracion(config);
  }

  formatearClave(clave: string): string {
    return clave
      .split('_')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  }
}
