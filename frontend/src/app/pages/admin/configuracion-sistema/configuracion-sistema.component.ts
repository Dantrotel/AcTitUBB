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
  templateUrl: './configuracion-sistema.component.html',
  styleUrl: './configuracion-sistema.component.scss'
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
      const response: any = await this.apiService.get('/configuracion').toPromise();
      if (response.success) {
        this.configuraciones.set(response.configuraciones);
      }
    } catch (error: any) {
      this.notificationService.error('Error al cargar configuraciones', 'No fue posible obtener las configuraciones del sistema. Intente nuevamente.');
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
      this.notificationService.error('Error al guardar configuración', error.error?.message || 'No fue posible guardar el cambio de configuración. Intente nuevamente.');
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
