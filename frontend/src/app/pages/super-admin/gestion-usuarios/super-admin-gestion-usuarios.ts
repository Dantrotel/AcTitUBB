import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NavbarComponent } from '../../../components/navbar/navbar.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  selector: 'super-admin-gestion-usuarios',
  templateUrl: './super-admin-gestion-usuarios.html',
  styleUrls: ['./super-admin-gestion-usuarios.scss']
})
export class SuperAdminGestionUsuariosComponent implements OnInit {
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

  constructor(
    private router: Router,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.nombre || 'Super Administrador';
    }
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarDepartamentos();
    this.cargarCarreras();
  }

  volver(): void {
    this.router.navigate(['/super-admin']);
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
        if (Array.isArray(data)) {
          this.roles = data;
        } else if (data && Array.isArray(data.roles)) {
          this.roles = data.roles;
        } else {
          this.roles = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
        this.roles = [
          { id: 1, nombre: 'estudiante' },
          { id: 2, nombre: 'profesor' },
          { id: 3, nombre: 'admin' },
          { id: 4, nombre: 'superadmin' }
        ];
      }
    });
  }

  cargarDepartamentos() {
    this.apiService.getDepartamentos().subscribe({
      next: (data: any) => {
        this.departamentos = data || [];
      },
      error: (error) => {
        console.error('Error al cargar departamentos:', error);
        this.departamentos = [];
      }
    });
  }

  cargarCarreras() {
    this.apiService.getCarreras().subscribe({
      next: (data: any) => {
        this.carreras = data || [];
      },
      error: (error) => {
        console.error('Error al cargar carreras:', error);
        this.carreras = [];
      }
    });
  }

  cargarUsuarios() {
    this.loading = true;
    this.error = '';
    
    // Cargar usuario actual
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        this.usuarioActual = JSON.parse(userData);
      } catch (error) {
        console.error('Error al parsear userData:', error);
      }
    }

    this.apiService.getUsuarios().subscribe({
      next: (data: any) => {
        // Super Admin ve TODOS los usuarios
        this.usuarios = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.error = 'Error al cargar usuarios. Por favor, intenta nuevamente.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get usuariosFiltrados() {
    return this.usuarios.filter(u => {
      const matchRol = !this.filtroRol || u.rol_id?.toString() === this.filtroRol;
      const matchNombre = !this.filtroNombre || 
        u.nombre?.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const matchRut = !this.filtroRut || 
        u.rut?.toLowerCase().includes(this.filtroRut.toLowerCase());
      const matchCarrera = !this.filtroCarrera || 
        u.carrera_id?.toString() === this.filtroCarrera;
      const matchDepartamento = !this.filtroDepartamento || 
        u.departamento_id?.toString() === this.filtroDepartamento;
      
      // Filtro de estado (activo/inactivo)
      let matchEstado = true;
      if (this.filtroEstado === 'activo') {
        matchEstado = u.activo === true || u.activo === 1;
      } else if (this.filtroEstado === 'inactivo') {
        matchEstado = u.activo === false || u.activo === 0;
      }

      // Filtro de confirmado/pendiente
      let matchConfirmado = true;
      if (this.filtroConfirmado === 'confirmado') {
        matchConfirmado = u.confirmado === true || u.confirmado === 1;
      } else if (this.filtroConfirmado === 'pendiente') {
        matchConfirmado = u.confirmado === false || u.confirmado === 0;
      }

      return matchRol && matchNombre && matchRut && matchCarrera && 
             matchDepartamento && matchEstado && matchConfirmado;
    });
  }

  abrirModalCrear() {
    this.mostrarModalCrear = true;
    this.nuevoUsuario = {
      rut: '',
      nombre: '',
      email: '',
      password: '',
      rol_id: 1,
      confirmado: true
    };
  }

  cerrarModalCrear() {
    this.mostrarModalCrear = false;
  }

  crearUsuario() {
    if (!this.nuevoUsuario.rut || !this.nuevoUsuario.nombre || !this.nuevoUsuario.email || !this.nuevoUsuario.password) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    this.procesando = true;

    this.apiService.crearUsuario(this.nuevoUsuario).subscribe({
      next: (response: any) => {
        this.mensaje = 'Usuario creado exitosamente';
        this.cargarUsuarios();
        this.cerrarModalCrear();
        this.procesando = false;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error al crear usuario:', error);
        this.error = error.error?.message || 'Error al crear usuario';
        this.procesando = false;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  abrirModalEditar(usuario: any) {
    this.usuarioEditar = { ...usuario };
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.usuarioEditar = null;
  }

  actualizarUsuario() {
    if (!this.usuarioEditar || !this.usuarioEditar.rut) return;

    this.procesando = true;
    const updates: any = {
      nombre: this.usuarioEditar.nombre,
      email: this.usuarioEditar.email
    };

    // Super Admin puede cambiar rol, departamento y carrera
    if (this.usuarioEditar.rol_id === 2 && this.usuarioEditar.departamento_id) {
      const deptData = {
        profesor_rut: this.usuarioEditar.rut,
        es_principal: true
      };
      
      this.apiService.asignarProfesorDepartamento(this.usuarioEditar.departamento_id, deptData).subscribe({
        next: () => console.log('Departamento asignado'),
        error: (error: any) => console.error('Error al asignar departamento:', error)
      });
    }

    if (this.usuarioEditar.rol_id === 1 && this.usuarioEditar.carrera_id) {
      const carreraData = {
        estudiante_rut: this.usuarioEditar.rut,
        ano_ingreso: new Date().getFullYear(),
        semestre_actual: 1,
        estado_estudiante: 'regular',
        fecha_ingreso: new Date().toISOString().split('T')[0]
      };
      
      this.apiService.asignarEstudianteCarrera(this.usuarioEditar.carrera_id, carreraData).subscribe({
        next: () => console.log('Carrera asignada'),
        error: (error: any) => console.error('Error al asignar carrera:', error)
      });
    }

    // Cambiar rol si fue modificado
    const usuarioOriginal = this.usuarios.find(u => u.rut === this.usuarioEditar.rut);
    if (this.usuarioEditar.rol_id !== usuarioOriginal?.rol_id) {
      this.apiService.cambiarRolUsuario(this.usuarioEditar.rut, this.usuarioEditar.rol_id).subscribe({
        next: () => {
          console.log('Rol actualizado');
        },
        error: (error) => {
          console.error('Error al cambiar rol:', error);
        }
      });
    }

    // Cambiar contraseña si se proporcionó
    if (this.usuarioEditar.password) {
      updates.password = this.usuarioEditar.password;
    }

    this.apiService.actualizarUsuario(this.usuarioEditar.rut, updates).subscribe({
      next: () => {
        this.mensaje = 'Usuario actualizado exitosamente';
        this.cargarUsuarios();
        this.cerrarModalEditar();
        this.procesando = false;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error al actualizar usuario:', error);
        this.error = error.error?.message || 'Error al actualizar usuario';
        this.procesando = false;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  abrirModalResetPassword(usuario: any) {
    this.usuarioEditar = { ...usuario };
    this.mostrarModalResetPassword = true;
    this.passwordTemporal = this.generarPasswordTemporal();
  }

  cerrarModalResetPassword() {
    this.mostrarModalResetPassword = false;
    this.usuarioEditar = null;
    this.passwordTemporal = '';
  }

  generarPasswordTemporal(): string {
    return Math.random().toString(36).slice(-8);
  }

  resetearPassword() {
    if (!this.usuarioEditar || !this.passwordTemporal) return;

    this.procesando = true;

    this.apiService.resetearPasswordUsuario(this.usuarioEditar.rut, this.passwordTemporal).subscribe({
      next: () => {
        this.mensaje = `Contraseña reseteada exitosamente. Nueva contraseña: ${this.passwordTemporal}`;
        this.cerrarModalResetPassword();
        this.procesando = false;
        setTimeout(() => this.mensaje = '', 10000);
      },
      error: (error: any) => {
        console.error('Error al resetear contraseña:', error);
        this.error = error.error?.message || 'Error al resetear contraseña';
        this.procesando = false;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  abrirModalConfirmarEliminar(usuario: any) {
    this.usuarioEliminar = usuario;
    this.mostrarModalConfirmarEliminar = true;
  }

  cerrarModalConfirmarEliminar() {
    this.mostrarModalConfirmarEliminar = false;
    this.usuarioEliminar = null;
  }

  eliminarUsuario() {
    if (!this.usuarioEliminar || !this.usuarioEliminar.rut) return;

    this.procesando = true;

    this.apiService.eliminarUsuario(this.usuarioEliminar.rut).subscribe({
      next: () => {
        this.mensaje = 'Usuario eliminado exitosamente';
        this.cargarUsuarios();
        this.cerrarModalConfirmarEliminar();
        this.procesando = false;
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (error: any) => {
        console.error('Error al eliminar usuario:', error);
        this.error = error.error?.message || 'Error al eliminar usuario';
        this.procesando = false;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }
}

