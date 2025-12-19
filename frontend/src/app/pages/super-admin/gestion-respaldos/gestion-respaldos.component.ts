import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../services/notification.service';

interface Backup {
  nombre: string;
  fecha: string;
  tamano_db: string;
  tamano_archivos: string;
  duracion: number;
}

@Component({
  selector: 'app-gestion-respaldos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-respaldos.component.html',
  styleUrls: ['./gestion-respaldos.component.scss']
})
export class GestionRespaldosComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  
  backups: Backup[] = [];
  cargando = false;
  mensajeExito = '';
  mensajeError = '';
  realizandoBackup = false;
  restaurando = false;
  
  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.cargarBackups();
  }
  
  cargarBackups(): void {
    this.cargando = true;
    this.http.get<any>(`${this.apiUrl}/respaldo/listar`).subscribe({
      next: (response) => {
        if (response.success) {
          this.backups = response.backups;
        }
        this.cargando = false;
      },
      error: (error) => {
        this.mostrarError('Error cargando lista de backups');
        this.cargando = false;
      }
    });
  }
  
  async crearBackup(): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Desea crear un backup manual del sistema?',
      'Crear Backup',
      'Crear',
      'Cancelar'
    );
    if (!confirmed) return;
    
    this.realizandoBackup = true;
    this.limpiarMensajes();
    
    this.http.post<any>(`${this.apiUrl}/respaldo/crear`, {}).subscribe({
      next: (response) => {
        if (response.success) {
          this.mostrarExito('Backup creado exitosamente');
          this.cargarBackups();
        }
        this.realizandoBackup = false;
      },
      error: (error) => {
        this.mostrarError('Error creando backup');
        this.realizandoBackup = false;
      }
    });
  }
  
  async restaurarBackup(nombreBackup: string): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `Está a punto de restaurar el backup "${nombreBackup}". Esto sobrescribirá los datos actuales. ¿Continuar?`,
      '⚠️ ADVERTENCIA',
      'Restaurar',
      'Cancelar'
    );
    if (!confirmed) return;
    
    this.restaurando = true;
    this.limpiarMensajes();
    
    this.http.post<any>(`${this.apiUrl}/respaldo/restaurar/${nombreBackup}`, {}).subscribe({
      next: (response) => {
        if (response.success) {
          this.mostrarExito('Backup restaurado exitosamente');
        }
        this.restaurando = false;
      },
      error: (error) => {
        this.mostrarError('Error restaurando backup');
        this.restaurando = false;
      }
    });
  }
  
  async eliminarBackup(nombreBackup: string): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Está seguro de eliminar el backup "${nombreBackup}"?`,
      'Eliminar Backup',
      'Eliminar',
      'Cancelar'
    );
    if (!confirmed) return;
    
    this.http.delete<any>(`${this.apiUrl}/respaldo/${nombreBackup}`).subscribe({
      next: (response) => {
        if (response.success) {
          this.mostrarExito('Backup eliminado');
          this.cargarBackups();
        }
      },
      error: (error) => {
        this.mostrarError('Error eliminando backup');
      }
    });
  }
  
  private mostrarExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    setTimeout(() => this.mensajeExito = '', 5000);
  }
  
  private mostrarError(mensaje: string): void {
    this.mensajeError = mensaje;
    setTimeout(() => this.mensajeError = '', 5000);
  }
  
  private limpiarMensajes(): void {
    this.mensajeExito = '';
    this.mensajeError = '';
  }
  
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-CL');
  }
}
