import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-perfil-estudiante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.scss']
})
export class PerfilEstudianteComponent implements OnInit {
  estudiante: any = {};
  loading = false;
  guardando = false;
  mensaje = '';
  tipoMensaje = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.loading = true;
    const token = localStorage.getItem('token');
    
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const rut = payload.rut;
      
      this.apiService.buscaruserByrut(rut).subscribe({
        next: (data: any) => {
          this.estudiante = { ...data };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar perfil:', error);
          this.mostrarMensaje('Error al cargar el perfil', 'error');
          this.loading = false;
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  guardarCambios() {
    if (!this.validarDatos()) {
      return;
    }

    this.guardando = true;
    
    const datosActualizados = {
      nombre: this.estudiante.nombre,
      email: this.estudiante.email,
      telefono: this.estudiante.telefono,
      carrera: this.estudiante.carrera,
      matricula: this.estudiante.matricula
    };

    this.apiService.actualizarPerfil(datosActualizados).subscribe({
      next: (response) => {
        this.mostrarMensaje('Perfil actualizado exitosamente', 'success');
        this.guardando = false;
        
        // Actualizar localStorage si existe
        const userData = localStorage.getItem('userData');
        if (userData) {
          const updatedUserData = { ...JSON.parse(userData), ...datosActualizados };
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
        }
      },
      error: (error) => {
        console.error('Error al actualizar perfil:', error);
        this.mostrarMensaje('Error al actualizar el perfil', 'error');
        this.guardando = false;
      }
    });
  }

  validarDatos(): boolean {
    if (!this.estudiante.nombre || this.estudiante.nombre.trim() === '') {
      this.mostrarMensaje('El nombre es obligatorio', 'error');
      return false;
    }

    if (!this.estudiante.email || this.estudiante.email.trim() === '') {
      this.mostrarMensaje('El email es obligatorio', 'error');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.estudiante.email)) {
      this.mostrarMensaje('Formato de email inválido', 'error');
      return false;
    }

    return true;
  }

  mostrarMensaje(texto: string, tipo: string) {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    
    setTimeout(() => {
      this.mensaje = '';
      this.tipoMensaje = '';
    }, 5000);
  }

  volver() {
    // Obtener el rol del usuario del token para navegar al home correcto
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const rolId = Number(payload.rol_id);
        
        // Navegar según el rol del usuario
        const rutasPorRol: { [key: string]: string } = {
          '1': '/estudiante',  // Estudiante
          '2': '/profesor',    // Profesor
          '3': '/admin'        // Admin
        };

        const rutaDestino = rutasPorRol[rolId.toString()];
        if (rutaDestino) {
          console.log(`Navegando a home del rol ${rolId}: ${rutaDestino}`);
          this.router.navigate([rutaDestino]);
        } else {
          console.error(`Rol ID ${rolId} no reconocido, navegando a estudiante por defecto`);
          this.router.navigate(['/estudiante']);
        }
      } catch (error) {
        console.error('Error al decodificar token:', error);
        this.router.navigate(['/login']);
      }
    } else {
      // Sin token, redirigir al login
      this.router.navigate(['/login']);
    }
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }
}