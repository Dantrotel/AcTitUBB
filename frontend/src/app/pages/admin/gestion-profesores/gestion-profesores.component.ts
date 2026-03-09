import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-gestion-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-profesores.component.html',
  styleUrls: ['./gestion-profesores.component.scss']
})
export class GestionProfesoresComponent implements OnInit {
  profesores: any[] = [];
  loading = true;
  error = '';
  currentYear = new Date().getFullYear();

  // Filtros
  filtroBusqueda = '';
  filtroDepartamento = '';
  filtroEstado = '';

  // Datos auxiliares
  departamentos: any[] = [];

  // Modal editar
  mostrarModalEditar = false;
  profesorEditar: any = null;

  // Modal reset password
  mostrarModalPassword = false;
  profesorPassword: any = null;
  nuevaPassword = '';
  procesando = false;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarProfesores();
    this.cargarDepartamentos();
  }

  cargarProfesores(): void {
    this.loading = true;
    this.error = '';
    this.apiService.getUsuarios().subscribe({
      next: (data: any) => {
        const todos = Array.isArray(data) ? data : [];
        this.profesores = todos.filter((u: any) => parseInt(u.rol_id) === 2);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los profesores';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarDepartamentos(): void {
    this.apiService.getDepartamentos(true).subscribe({
      next: (data: any) => {
        this.departamentos = Array.isArray(data) ? data : (data?.departamentos ?? []);
        this.cdr.detectChanges();
      },
      error: () => { this.departamentos = []; }
    });
  }

  get profesoresFiltrados(): any[] {
    return this.profesores.filter(p => {
      const matchBusqueda = !this.filtroBusqueda ||
        p.nombre?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        p.rut?.includes(this.filtroBusqueda) ||
        p.email?.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      const matchDepartamento = !this.filtroDepartamento ||
        p.departamento_id?.toString() === this.filtroDepartamento;
      const matchEstado = !this.filtroEstado ||
        (this.filtroEstado === 'activo' && (p.confirmado === true || p.confirmado === 1)) ||
        (this.filtroEstado === 'pendiente' && (p.confirmado === false || p.confirmado === 0));
      return matchBusqueda && matchDepartamento && matchEstado;
    });
  }

  abrirEditar(profesor: any): void {
    this.profesorEditar = { ...profesor };
    this.mostrarModalEditar = true;
  }

  cerrarEditar(): void {
    this.mostrarModalEditar = false;
    this.profesorEditar = null;
  }

  guardarEditar(): void {
    if (!this.profesorEditar) return;
    this.procesando = true;
    this.apiService.actualizarUsuario(this.profesorEditar.rut, {
      nombre: this.profesorEditar.nombre,
      email: this.profesorEditar.email,
      departamento_id: this.profesorEditar.departamento_id
    }).subscribe({
      next: () => {
        this.notificationService.success('Profesor actualizado correctamente');
        this.procesando = false;
        this.cerrarEditar();
        this.cargarProfesores();
      },
      error: () => {
        this.notificationService.error('Error al actualizar el profesor');
        this.procesando = false;
      }
    });
  }

  abrirResetPassword(profesor: any): void {
    this.profesorPassword = profesor;
    this.nuevaPassword = '';
    this.mostrarModalPassword = true;
  }

  cerrarResetPassword(): void {
    this.mostrarModalPassword = false;
    this.profesorPassword = null;
    this.nuevaPassword = '';
  }

  resetPassword(): void {
    if (!this.nuevaPassword || this.nuevaPassword.length < 6) {
      this.notificationService.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    this.procesando = true;
    this.apiService.resetearPasswordUsuario(this.profesorPassword.rut, this.nuevaPassword).subscribe({
      next: () => {
        this.notificationService.success('Contraseña restablecida correctamente');
        this.procesando = false;
        this.cerrarResetPassword();
      },
      error: () => {
        this.notificationService.error('Error al restablecer la contraseña');
        this.procesando = false;
      }
    });
  }

  async eliminar(profesor: any): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Eliminar al profesor ${profesor.nombre}? Esta acción no se puede deshacer.`,
      'Eliminar Profesor', 'Eliminar', 'Cancelar'
    );
    if (!confirmed) return;
    this.apiService.eliminarUsuario(profesor.rut).subscribe({
      next: () => {
        this.notificationService.success('Profesor eliminado correctamente');
        this.cargarProfesores();
      },
      error: () => this.notificationService.error('Error al eliminar el profesor')
    });
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroDepartamento = '';
    this.filtroEstado = '';
  }
}
