import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
  facultad_nombre: string;
  jefe_carrera_rut: string | null;
  jefe_carrera_nombre: string | null;
  jefe_carrera_email: string | null;
}

interface Profesor {
  rut: string;
  nombre: string;
  email: string;
}

@Component({
  selector: 'app-gestionar-jefes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestionar-jefes.html',
  styleUrls: ['./gestionar-jefes.scss']
})
export class GestionarJefesComponent implements OnInit {
  carreras = signal<Carrera[]>([]);
  profesores = signal<Profesor[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  // Modal
  mostrarModal = signal(false);
  carreraSeleccionada = signal<Carrera | null>(null);
  profesorSeleccionado = signal<string>('');
  
  // Mensaje
  mensaje = signal<{ texto: string; tipo: 'success' | 'error' } | null>(null);
  
  private location = inject(Location);
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit() {
    this.cargarDatos();
  }
  
  volverAtras() {
    this.location.back();
  }
  
  cargarDatos() {
    this.loading.set(true);
    this.error.set(null);
    
    // Cargar carreras y profesores en paralelo
    Promise.all([
      new Promise<Carrera[]>((resolve, reject) => {
        this.apiService.getCarreras(true).subscribe({
          next: (data: any) => resolve(data.carreras || data),
          error: (err) => reject(err)
        });
      }),
      new Promise<Profesor[]>((resolve, reject) => {
        // Obtener todos los usuarios y filtrar profesores y jefes de carrera (rol_id = 2 o 3)
        this.apiService.getUsuarios().subscribe({
          next: (data: any) => {
            const usuarios = Array.isArray(data) ? data : [];
            // Filtrar profesores (rol_id = 2) y admins/jefes de carrera (rol_id = 3)
            // para permitir que un profesor sea jefe de múltiples carreras
            const profesores = usuarios.filter((u: any) => 
              u.rol_nombre?.toLowerCase() === 'profesor' || 
              u.rol_nombre?.toLowerCase() === 'admin' ||
              u.rol_id === 2 || 
              u.rol_id === 3
            );
            resolve(profesores);
          },
          error: (err) => reject(err)
        });
      })
    ])
    .then(([carrerasData, profesoresData]) => {
      this.carreras.set(Array.isArray(carrerasData) ? carrerasData : []);
      this.profesores.set(Array.isArray(profesoresData) ? profesoresData : []);
      this.loading.set(false);
    })
    .catch((error: any) => {
      this.error.set('Error al cargar la información');
      this.loading.set(false);
    });
  }
  
  abrirModal(carrera: Carrera) {
    this.carreraSeleccionada.set(carrera);
    this.profesorSeleccionado.set(carrera.jefe_carrera_rut || '');
    this.mostrarModal.set(true);
  }
  
  cerrarModal() {
    this.mostrarModal.set(false);
    this.carreraSeleccionada.set(null);
    this.profesorSeleccionado.set('');
  }
  
  asignarJefe() {
    const carrera = this.carreraSeleccionada();
    const profesorRut = this.profesorSeleccionado();
    
    if (!carrera || !profesorRut) {
      this.mostrarMensaje('Debe seleccionar un profesor', 'error');
      return;
    }
    
    this.apiService.asignarJefeCarrera(carrera.id, profesorRut).subscribe({
      next: () => {
        this.mostrarMensaje(`Jefe de carrera asignado exitosamente`, 'success');
        this.cerrarModal();
        this.cargarDatos();
      },
      error: (error: any) => {
        this.mostrarMensaje(error.message || 'Error al asignar jefe de carrera', 'error');
      }
    });
  }
  
  private notificationService = inject(NotificationService);
  
  async removerJefe(carrera: Carrera) {
    const confirmed = await this.notificationService.confirm(
      `¿Está seguro de remover a ${carrera.jefe_carrera_nombre} como jefe de ${carrera.nombre}?`,
      'Confirmar remoción',
      'Remover',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }
    
    this.apiService.removerJefeCarrera(carrera.id).subscribe({
      next: () => {
        this.mostrarMensaje(`Jefe de carrera removido exitosamente`, 'success');
        this.cargarDatos();
      },
      error: (error: any) => {
        this.mostrarMensaje(error.message || 'Error al remover jefe de carrera', 'error');
      }
    });
  }
  
  mostrarMensaje(texto: string, tipo: 'success' | 'error') {
    this.mensaje.set({ texto, tipo });
    setTimeout(() => {
      this.mensaje.set(null);
    }, 4000);
  }
  
  obtenerIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
