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
  mensaje = '';
  filtroRol = '';
  filtroNombre = '';
  filtroRut = '';

  // Modales
  mostrarModalCrear = false;
  mostrarModalEditar = false;
  mostrarModalResetPassword = false;
  mostrarModalConfirmarEliminar = false;

  // Formularios
  nuevoUsuario = {
    rut: '',
    nombre: '',
    email: '',
    password: '',
    rol_id: 1,
    confirmado: true
  };

  usuarioEditar: any = null;
  usuarioEliminar: any = null;
  passwordTemporal = '';
  procesando = false;

  roles = [
    { id: 1, nombre: 'Estudiante' },
    { id: 2, nombre: 'Profesor' },
    { id: 3, nombre: 'Administrador' }
  ];

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
    // Usar history.back() para volver a la p�gina anterior sin activar guards
    window.history.back();
  }

  limpiarFiltros() {
    this.filtroRol = '';
    this.filtroNombre = '';
    this.filtroRut = '';
  }

  // ===== MODAL CREAR USUARIO =====
  abrirModalCrear() {
    this.nuevoUsuario = {
      rut: '',
      nombre: '',
      email: '',
      password: '',
      rol_id: 1,
      confirmado: true
    };
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
  }

  crearUsuario() {
    this.procesando = true;
    this.error = '';

    this.apiService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        this.mensaje = 'Usuario creado exitosamente';
        this.cerrarModalCrear();
        this.cargarUsuarios();
        this.procesando = false;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.error = err.error?.message || 'Error al crear el usuario';
        this.procesando = false;
      }
    });
  }

  // ===== MODAL EDITAR USUARIO =====
  abrirModalEditar(usuario: any) {
    this.usuarioEditar = { ...usuario };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.usuarioEditar = null;
  }

  guardarEdicion() {
    if (!this.usuarioEditar) return;

    this.procesando = true;
    this.error = '';

    this.apiService.actualizarUsuario(this.usuarioEditar.rut, {
      nombre: this.usuarioEditar.nombre,
      email: this.usuarioEditar.email
    }).subscribe({
      next: () => {
        // Cambiar rol si fue modificado
        if (this.usuarioEditar.rol_id !== this.usuarios.find(u => u.rut === this.usuarioEditar.rut)?.rol_id) {
          this.apiService.cambiarRolUsuario(this.usuarioEditar.rut, this.usuarioEditar.rol_id).subscribe({
            next: () => {
              this.mensaje = 'Usuario actualizado exitosamente';
              this.cerrarModalEditar();
              this.cargarUsuarios();
              this.procesando = false;
              setTimeout(() => this.mensaje = '', 3000);
            },
            error: (err) => {
              console.error('Error al cambiar rol:', err);
              this.error = 'Error al cambiar el rol';
              this.procesando = false;
            }
          });
        } else {
          this.mensaje = 'Usuario actualizado exitosamente';
          this.cerrarModalEditar();
          this.cargarUsuarios();
          this.procesando = false;
          setTimeout(() => this.mensaje = '', 3000);
        }
      },
      error: (err) => {
        console.error('Error al actualizar usuario:', err);
        this.error = err.error?.message || 'Error al actualizar el usuario';
        this.procesando = false;
      }
    });
  }

  // ===== CAMBIAR ESTADO =====
  cambiarEstado(usuario: any) {
    const nuevoEstado = !usuario.confirmado;
    
    this.apiService.cambiarEstadoUsuario(usuario.rut, nuevoEstado).subscribe({
      next: () => {
        this.mensaje = `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`;
        this.cargarUsuarios();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.error = 'Error al cambiar el estado del usuario';
      }
    });
  }

  // ===== RESETEAR CONTRASEÑA =====
  abrirModalResetPassword(usuario: any) {
    this.usuarioEditar = { ...usuario }; // Clonar el objeto
    this.passwordTemporal = this.generarPasswordTemporal();
    this.mostrarModalResetPassword = true;
    this.error = '';
    this.mensaje = '';
  }

  cerrarModalResetPassword() {
    this.mostrarModalResetPassword = false;
    this.usuarioEditar = null;
    this.passwordTemporal = '';
    this.error = '';
  }

  confirmarResetPassword() {
    if (!this.usuarioEditar || !this.passwordTemporal) {
      this.error = 'Datos incompletos';
      return;
    }

    this.procesando = true;
    this.error = '';

    console.log('Reseteando contraseña para:', this.usuarioEditar.rut);
    console.log('Nueva contraseña:', this.passwordTemporal);

    this.apiService.resetearPasswordUsuario(this.usuarioEditar.rut, this.passwordTemporal).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        this.mensaje = '✅ Contraseña reseteada exitosamente. Cópiala y entrégasela al usuario.';
        this.procesando = false;
        // NO cerrar el modal para que el admin pueda copiar la contraseña
        setTimeout(() => this.mensaje = '', 5000);
      },
      error: (err) => {
        console.error('Error al resetear contraseña:', err);
        this.error = err.error?.message || 'Error al resetear la contraseña';
        this.procesando = false;
      }
    });
  }

  generarPasswordTemporal(): string {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return password;
  }

  copiarPassword() {
    navigator.clipboard.writeText(this.passwordTemporal).then(() => {
      this.mensaje = 'Contraseña copiada al portapapeles';
      setTimeout(() => this.mensaje = '', 2000);
    });
  }

  // ===== ELIMINAR USUARIO =====
  abrirModalEliminar(usuario: any) {
    this.usuarioEliminar = usuario;
    this.mostrarModalConfirmarEliminar = true;
  }

  cerrarModalEliminar() {
    this.mostrarModalConfirmarEliminar = false;
    this.usuarioEliminar = null;
  }

  confirmarEliminar() {
    if (!this.usuarioEliminar) return;

    this.procesando = true;
    this.error = '';

    this.apiService.eliminarUsuario(this.usuarioEliminar.rut).subscribe({
      next: () => {
        this.mensaje = 'Usuario eliminado exitosamente';
        this.cerrarModalEliminar();
        this.cargarUsuarios();
        this.procesando = false;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        this.error = err.error?.message || 'Error al eliminar el usuario';
        this.procesando = false;
      }
    });
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