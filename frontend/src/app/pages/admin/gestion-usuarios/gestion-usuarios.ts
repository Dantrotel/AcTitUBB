import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'gestion-usuarios',
  templateUrl: './gestion-usuarios.html',
  styleUrls: ['./gestion-usuarios.scss']
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  loading = true;
  error = '';
  filtroRol = '';
  filtroNombre = '';
  filtroRut = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  // Método público para cargar usuarios
  cargarUsuarios(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getUsuarios().subscribe({
      next: (data: any) => {
        this.usuarios = data;
        this.loading = false;
        console.log('Usuarios cargados:', data);
      },
      error: (err) => {
        this.error = 'Error al cargar los usuarios';
        this.loading = false;
        console.error('Error cargando usuarios:', err);
      }
    });
  }

  // Método para obtener la fecha actual en el footer
  fechaActual(): Date {
    return new Date();
  }

  // Filtros
  get usuariosFiltrados(): any[] {
    let filtrados = this.usuarios;

    if (this.filtroRol) {
      filtrados = filtrados.filter(u => 
        u.rol_nombre?.toLowerCase().includes(this.filtroRol.toLowerCase())
      );
    }

    if (this.filtroNombre) {
      filtrados = filtrados.filter(u => 
        u.nombre?.toLowerCase().includes(this.filtroNombre.toLowerCase())
      );
    }

    if (this.filtroRut) {
      filtrados = filtrados.filter(u => 
        u.rut?.includes(this.filtroRut)
      );
    }

    return filtrados;
  }

  // Navegación
  volver() {
    this.router.navigate(['/admin']);
  }

  limpiarFiltros() {
    this.filtroRol = '';
    this.filtroNombre = '';
    this.filtroRut = '';
  }

  editarUsuario(usuario: any) {
    const nuevoNombre = prompt('Nuevo nombre:', usuario.nombre);
    const nuevoEmail = prompt('Nuevo email:', usuario.email);
    
    if (nuevoNombre && nuevoEmail) {
      this.apiService.actualizarUsuario(usuario.rut, {
        nombre: nuevoNombre,
        email: nuevoEmail
      }).subscribe({
        next: () => {
          alert('Usuario actualizado correctamente');
          this.cargarUsuarios(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          alert('Error al actualizar el usuario');
        }
      });
    }
  }

  cambiarEstado(usuario: any) {
    const nuevoEstado = !usuario.confirmado;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';
    
    if (confirm(`¿Estás seguro de que quieres ${mensaje} este usuario?`)) {
      // Aquí podrías implementar un endpoint para cambiar el estado
      // Por ahora solo mostramos un mensaje
      alert(`Funcionalidad de cambio de estado en desarrollo. Estado actual: ${usuario.confirmado ? 'Activo' : 'Inactivo'}`);
    }
  }

  eliminarUsuario(usuario: any) {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      this.apiService.eliminarUsuario(usuario.rut).subscribe({
        next: () => {
          alert('Usuario eliminado correctamente');
          this.cargarUsuarios(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          alert('Error al eliminar el usuario');
        }
      });
    }
  }

  obtenerClaseEstado(estado: string): string {
    return estado === 'Activo' ? 'estado-activo' : 'estado-inactivo';
  }

  obtenerClaseRol(rol: string): string {
    switch (rol.toLowerCase()) {
      case 'estudiante': return 'rol-estudiante';
      case 'profesor': return 'rol-profesor';
      case 'administrador': return 'rol-admin';
      default: return 'rol-default';
    }
  }
} 