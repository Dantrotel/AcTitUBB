import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-gestion-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-estudiantes.component.html',
  styleUrls: ['./gestion-estudiantes.component.scss']
})
export class GestionEstudiantesComponent implements OnInit {
  estudiantes: any[] = [];
  loading = true;
  error = '';
  currentYear = new Date().getFullYear();

  filtroBusqueda = '';
  filtroCarrera = '';
  filtroEstado = '';

  // Datos auxiliares
  carreras: any[] = [];
  profesores: any[] = [];

  mostrarModalEditar = false;
  estudianteEditar: any = null;
  mostrarModalPassword = false;
  estudiantePassword: any = null;
  nuevaPassword = '';
  procesando = false;

  guiasMap: Record<string, any> = {};
  inscripcionesMap: Record<string, any> = {};
  // Modelos para los selects inline (ngModel necesita una variable mutable)
  guiaSelects: Record<string, string> = {};
  ramoSelects: Record<string, string> = {};

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEstudiantes();
    this.cargarCarreras();
    this.cargarProfesores();
    this.cargarGuiasEstudiantes();
    this.cargarInscripcionesRamo();
  }

  cargarEstudiantes(): void {
    this.loading = true;
    this.error = '';
    this.apiService.getUsuarios().subscribe({
      next: (data: any) => {
        const todos = Array.isArray(data) ? data : [];
        this.estudiantes = todos.filter((u: any) => parseInt(u.rol_id) === 1);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los estudiantes';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarCarreras(): void {
    this.apiService.getCarreras(true).subscribe({
      next: (data: any) => {
        this.carreras = Array.isArray(data) ? data : (data?.carreras ?? []);
        this.cdr.detectChanges();
      },
      error: () => { this.carreras = []; }
    });
  }

  cargarProfesores(): void {
    this.apiService.getProfesores().subscribe({
      next: (data: any) => {
        const todos = Array.isArray(data) ? data : [];
        this.profesores = todos.filter((u: any) => u.rol_id === 2 || u.rol_nombre?.toLowerCase() === 'profesor');
        this.cdr.detectChanges();
      },
      error: () => { this.profesores = []; }
    });
  }

  cargarGuiasEstudiantes(): void {
    this.apiService.getAllGuiasEstudiantes().subscribe({
      next: (res: any) => {
        const list: any[] = res.data || [];
        this.guiasMap = {};
        this.guiaSelects = {};
        list.forEach(g => {
          this.guiasMap[g.estudiante_rut] = g;
          this.guiaSelects[g.estudiante_rut] = g.profesor_guia_rut;
        });
        this.cdr.detectChanges();
      },
      error: () => { this.guiasMap = {}; this.guiaSelects = {}; }
    });
  }

  cargarInscripcionesRamo(): void {
    this.apiService.getAllInscripcionesRamo().subscribe({
      next: (res: any) => {
        const list: any[] = res.data || [];
        this.inscripcionesMap = {};
        this.ramoSelects = {};
        list.forEach(i => {
          const existing = this.inscripcionesMap[i.estudiante_rut];
          if (!existing || i.semestre_id > existing.semestre_id) {
            this.inscripcionesMap[i.estudiante_rut] = i;
            this.ramoSelects[i.estudiante_rut] = i.tipo_ramo;
          }
        });
        this.cdr.detectChanges();
      },
      error: () => { this.inscripcionesMap = {}; this.ramoSelects = {}; }
    });
  }

  cambiarGuia(estudiante: any, profesorRut: string): void {
    if (!profesorRut) return;
    this.apiService.asignarGuiaEstudiante({
      estudiante_rut: estudiante.rut,
      profesor_guia_rut: profesorRut
    }).subscribe({
      next: () => {
        this.notificationService.success('Profesor guía actualizado');
        this.cargarGuiasEstudiantes();
      },
      error: (err: any) => {
        // Revertir el select al valor anterior
        this.guiaSelects[estudiante.rut] = this.guiasMap[estudiante.rut]?.profesor_guia_rut || '';
        this.notificationService.error('Error al asignar guía', err.error?.message || '');
        this.cdr.detectChanges();
      }
    });
  }

  cambiarRamo(estudiante: any, tipo: string): void {
    if (!tipo) return;
    const inscActual = this.inscripcionesMap[estudiante.rut];
    const obs = inscActual
      ? this.apiService.actualizarInscripcionRamo(inscActual.id, tipo as 'AP' | 'PT')
      : this.apiService.crearInscripcionRamo(tipo as 'AP' | 'PT', estudiante.rut);
    obs.subscribe({
      next: () => {
        this.notificationService.success('Ramo actualizado');
        this.cargarInscripcionesRamo();
      },
      error: (err: any) => {
        // Revertir el select al valor anterior
        this.ramoSelects[estudiante.rut] = this.inscripcionesMap[estudiante.rut]?.tipo_ramo || '';
        this.notificationService.error('Error al actualizar ramo', err.error?.message || '');
        this.cdr.detectChanges();
      }
    });
  }

  get estudiantesFiltrados(): any[] {
    return this.estudiantes.filter(e => {
      const matchBusqueda = !this.filtroBusqueda ||
        e.nombre?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
        e.rut?.includes(this.filtroBusqueda) ||
        e.email?.toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      const matchCarrera = !this.filtroCarrera ||
        e.carrera_id?.toString() === this.filtroCarrera;
      const matchEstado = !this.filtroEstado ||
        (this.filtroEstado === 'activo' && (e.confirmado === true || e.confirmado === 1)) ||
        (this.filtroEstado === 'pendiente' && (e.confirmado === false || e.confirmado === 0));
      return matchBusqueda && matchCarrera && matchEstado;
    });
  }

  abrirEditar(estudiante: any): void {
    this.estudianteEditar = { ...estudiante };
    this.mostrarModalEditar = true;
  }

  cerrarEditar(): void {
    this.mostrarModalEditar = false;
    this.estudianteEditar = null;
  }

  guardarEditar(): void {
    if (!this.estudianteEditar) return;
    this.procesando = true;
    this.apiService.actualizarUsuario(this.estudianteEditar.rut, {
      nombre: this.estudianteEditar.nombre,
      email: this.estudianteEditar.email,
      carrera_id: this.estudianteEditar.carrera_id
    }).subscribe({
      next: () => {
        this.notificationService.success('Estudiante actualizado correctamente');
        this.procesando = false;
        this.cerrarEditar();
        this.cargarEstudiantes();
      },
      error: () => {
        this.notificationService.error('Error al actualizar el estudiante');
        this.procesando = false;
      }
    });
  }

  abrirResetPassword(estudiante: any): void {
    this.estudiantePassword = estudiante;
    this.nuevaPassword = '';
    this.mostrarModalPassword = true;
  }

  cerrarResetPassword(): void {
    this.mostrarModalPassword = false;
    this.estudiantePassword = null;
    this.nuevaPassword = '';
  }

  resetPassword(): void {
    if (!this.nuevaPassword || this.nuevaPassword.length < 6) {
      this.notificationService.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    this.procesando = true;
    this.apiService.resetearPasswordUsuario(this.estudiantePassword.rut, this.nuevaPassword).subscribe({
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

  async eliminar(estudiante: any): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      `¿Eliminar al estudiante ${estudiante.nombre}? Esta acción no se puede deshacer.`,
      'Eliminar Estudiante', 'Eliminar', 'Cancelar'
    );
    if (!confirmed) return;
    this.apiService.eliminarUsuario(estudiante.rut).subscribe({
      next: () => {
        this.notificationService.success('Estudiante eliminado correctamente');
        this.cargarEstudiantes();
      },
      error: () => this.notificationService.error('Error al eliminar el estudiante')
    });
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroCarrera = '';
    this.filtroEstado = '';
  }
}
