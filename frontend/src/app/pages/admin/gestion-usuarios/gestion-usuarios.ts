import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NavbarComponent } from '../../../components/navbar/navbar.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  selector: 'gestion-usuarios',
  templateUrl: './gestion-usuarios.html',
  styleUrls: ['./gestion-usuarios.scss']
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];
  loading = true;
  error = '';
  mensaje = '';
  userName = '';
  filtroRol = '';
  filtroNombre = '';
  filtroRut = '';
  filtroCarrera = '';
  filtroDepartamento = '';
  filtroEstado = '';  // 'activo', 'inactivo', 'todos'
  filtroConfirmado = '';  // 'confirmado', 'pendiente', 'todos'

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
  usuarioActual: any = null;
  passwordTemporal = '';
  procesando = false;

  roles: any[] = [];
  departamentos: any[] = [];
  carreras: any[] = [];

  // Helper method para obtener nombre del rol
  getRolNombre(rolId: number): string {
    const rol = this.roles.find(r => r.id === rolId);
    return rol ? rol.nombre : '';
  }
  esSuperAdmin: boolean = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.nombre || 'Jefe de Curso';
    }
    // Verificar primero si es super admin antes de cargar usuarios
    this.verificarSuperAdmin();
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarDepartamentos();
    this.cargarCarreras();
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

  cargarRoles() {
    this.apiService.getRoles().subscribe({
      next: (data: any) => {
        // Manejar si la respuesta es un objeto con propiedad 'roles' o directamente un array
        if (Array.isArray(data)) {
          this.roles = data;
        } else if (data && Array.isArray(data.roles)) {
          this.roles = data.roles;
        } else {
          this.roles = [];
        }
      },
      error: (err) => {
        // Fallback con roles básicos si falla la carga
        this.roles = [
          { id: 1, nombre: 'estudiante' },
          { id: 2, nombre: 'profesor' },
          { id: 3, nombre: 'admin' },
          { id: 4, nombre: 'Super Administrador' }
        ];
      }
    });
  }

  cargarDepartamentos() {
    this.apiService.getDepartamentos(true).subscribe({
      next: (data: any) => {
        // Manejar si la respuesta es un objeto con propiedad 'departamentos' o directamente un array
        if (Array.isArray(data)) {
        this.departamentos = data;
        } else if (data && Array.isArray(data.departamentos)) {
          this.departamentos = data.departamentos;
        } else {
          this.departamentos = [];
        }
      },
      error: () => {
        this.departamentos = [];
      }
    });
  }

  cargarCarreras() {
    this.apiService.getCarreras(true).subscribe({
      next: (data: any) => {
        // Manejar si la respuesta es un objeto con propiedad 'carreras' o directamente un array
        if (Array.isArray(data)) {
        this.carreras = data;
        } else if (data && Array.isArray(data.carreras)) {
          this.carreras = data.carreras;
        } else {
          this.carreras = [];
        }
      },
      error: () => {
        this.carreras = [];
      }
    });
  }

  verificarSuperAdmin() {
    // Intentar obtener de token JWT primero
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.usuarioActual = payload;
      } catch (e) {
        // Fallback a localStorage
        const userDataStr = localStorage.getItem('userData') || localStorage.getItem('usuario') || '{}';
        this.usuarioActual = JSON.parse(userDataStr);
      }
    }
    
    
    // Comparación robusta que maneja tanto string como number
    const rolId = parseInt(this.usuarioActual.rol_id);
    this.esSuperAdmin = rolId === 4;
    
    
    // Forzar detección de cambios inmediata
    this.cdr.detectChanges();
  }
  // Constructor and lifecycle method
  // Only one constructor and one ngOnInit allowed

  // Método público para cargar usuarios
  cargarUsuarios(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.apiService.getUsuarios().subscribe({
      next: (data: any) => {
        // Si no es super admin, filtrar para excluir admins (rol 3) y super admins (rol 4)
        if (!this.esSuperAdmin) {
          this.usuarios = (data || []).filter((u: any) => {
            const rolId = parseInt(u.rol_id || u.rol || '0');
            // Solo incluir estudiantes (1) y profesores (2)
            return rolId === 1 || rolId === 2;
          });
        } else {
          this.usuarios = data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Error al cargar los usuarios';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Método para obtener la fecha actual en el footer
  fechaActual(): Date {
    return new Date();
  }

  // Filtros avanzados
  get usuariosFiltrados(): any[] {
    let filtrados = this.usuarios;

    // Filtro por rol
    if (this.filtroRol) {
      filtrados = filtrados.filter(u => 
        u.rol_nombre?.toLowerCase().includes(this.filtroRol.toLowerCase())
      );
    }

    // Filtro por nombre
    if (this.filtroNombre) {
      filtrados = filtrados.filter(u => 
        u.nombre?.toLowerCase().includes(this.filtroNombre.toLowerCase())
      );
    }

    // Filtro por RUT
    if (this.filtroRut) {
      filtrados = filtrados.filter(u => 
        u.rut?.includes(this.filtroRut)
      );
    }

    // Filtro por carrera
    if (this.filtroCarrera) {
      filtrados = filtrados.filter(u => 
        u.carrera_id?.toString() === this.filtroCarrera
      );
    }

    // Filtro por departamento
    if (this.filtroDepartamento) {
      filtrados = filtrados.filter(u => 
        u.departamento_id?.toString() === this.filtroDepartamento
      );
    }

    // Filtro por estado de confirmación
    if (this.filtroConfirmado === 'confirmado') {
      filtrados = filtrados.filter(u => u.confirmado === true || u.confirmado === 1);
    } else if (this.filtroConfirmado === 'pendiente') {
      filtrados = filtrados.filter(u => u.confirmado === false || u.confirmado === 0);
    }

    return filtrados;
  }

  // Limpiar todos los filtros
  limpiarFiltros(): void {
    this.filtroRol = '';
    this.filtroNombre = '';
    this.filtroRut = '';
    this.filtroCarrera = '';
    this.filtroDepartamento = '';
    this.filtroEstado = '';
    this.filtroConfirmado = '';
  }

  // Navegación
  volver() {
    // Usar history.back() para volver a la página anterior sin activar guards
    window.history.back();
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
        this.error = err.error?.message || 'Error al crear el usuario';
        this.procesando = false;
      }
    });
  }

  // ===== MODAL EDITAR USUARIO =====
  abrirModalEditar(usuario: any) {
    this.usuarioEditar = { ...usuario };
      // Preselección de departamento/carrera
      if (this.usuarioEditar.rol_id === 2) {
        this.usuarioEditar.departamento_id = this.usuarioEditar.departamento_id || null;
      }
      if (this.usuarioEditar.rol_id === 1) {
        this.usuarioEditar.carrera_id = this.usuarioEditar.carrera_id || null;
      }
    
    // Debug logs
    
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

    const payload: any = {
      nombre: this.usuarioEditar.nombre,
      email: this.usuarioEditar.email
    };
    
    // Solo Super Admin puede cambiar rol, departamento y carrera
    if (this.esSuperAdmin) {
      // Agregar departamento si es profesor (rol 2)
    if (this.usuarioEditar.rol_id === 2) {
      payload.departamento_id = this.usuarioEditar.departamento_id;
    }
      // Agregar carrera si es estudiante (rol 1)
    if (this.usuarioEditar.rol_id === 1) {
      payload.carrera_id = this.usuarioEditar.carrera_id;
    }
      // Cambiar password si se proporcionó
      if (this.usuarioEditar.password) {
      payload.password = this.usuarioEditar.password;
    }
    }
    
    this.apiService.actualizarUsuario(this.usuarioEditar.rut, payload).subscribe({
      next: () => {
        // Cambiar rol si fue modificado (solo Super Admin)
        const usuarioOriginal = this.usuarios.find(u => u.rut === this.usuarioEditar.rut);
        if (this.esSuperAdmin && this.usuarioEditar.rol_id !== usuarioOriginal?.rol_id) {
          this.apiService.cambiarRolUsuario(this.usuarioEditar.rut, this.usuarioEditar.rol_id).subscribe({
            next: () => {
              this.mensaje = 'Usuario actualizado exitosamente';
              this.cerrarModalEditar();
              this.cargarUsuarios();
              this.procesando = false;
              setTimeout(() => this.mensaje = '', 3000);
            },
            error: (err) => {
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


    this.apiService.resetearPasswordUsuario(this.usuarioEditar.rut, this.passwordTemporal).subscribe({
      next: (response: any) => {
        this.mensaje = '✅ Contraseña reseteada exitosamente. Cópiala y entrégasela al usuario.';
        this.procesando = false;
        // NO cerrar el modal para que el admin pueda copiar la contraseña
        setTimeout(() => this.mensaje = '', 5000);
      },
      error: (err) => {
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
      case 'jefe_curso': return 'rol-admin';
      case 'administrador': return 'rol-admin'; // Mantener por compatibilidad
      default: return 'rol-default';
    }
  }
} 