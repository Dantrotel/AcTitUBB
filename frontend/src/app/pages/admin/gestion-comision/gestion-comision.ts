import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';

interface Proyecto {
  id: number;
  titulo: string;
  estudiante_nombre: string;
  total_miembros: number;
  tiene_presidente: number;
  tiene_secretario: number;
  total_vocales: number;
  comision_completa: boolean;
}

interface MiembroComision {
  id: number;
  profesor_rut: string;
  profesor_nombre: string;
  profesor_email: string;
  rol_comision: string;
  fecha_designacion: string;
  observaciones: string | null;
}

interface ProfesorDisponible {
  rut: string;
  nombre: string;
  email: string;
  total_comisiones_activas: number;
}

@Component({
  selector: 'app-gestion-comision',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-comision.html',
  styleUrls: ['./gestion-comision.scss']
})
export class GestionComisionComponent implements OnInit {
  proyectos: Proyecto[] = [];
  proyectoSeleccionado: Proyecto | null = null;
  comision: MiembroComision[] = [];
  profesoresDisponibles: ProfesorDisponible[] = [];
  
  // Formulario agregar miembro
  mostrarFormulario = false;
  profesorSeleccionado = '';
  rolSeleccionado = '';
  observaciones = '';
  
  loading = false;
  error = '';
  mensaje = '';

  rolesDisponibles = [
    { value: 'presidente', label: 'Presidente' },
    { value: 'secretario', label: 'Secretario' },
    { value: 'vocal', label: 'Vocal' },
    { value: 'suplente', label: 'Suplente' }
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarProyectos();
  }

  async cargarProyectos() {
    try {
      this.loading = true;
      this.error = '';
      
      const response: any = await this.apiService.get('/comision/proyectos');
      this.proyectos = response.proyectos || [];
    } catch (error: any) {
      console.error('Error al cargar proyectos:', error);
      this.error = 'Error al cargar proyectos';
    } finally {
      this.loading = false;
    }
  }

  async seleccionarProyecto(proyecto: Proyecto) {
    this.proyectoSeleccionado = proyecto;
    this.mostrarFormulario = false;
    await Promise.all([
      this.cargarComision(proyecto.id),
      this.cargarProfesoresDisponibles(proyecto.id)
    ]);
  }

  async cargarComision(proyectoId: number) {
    try {
      this.loading = true;
      this.error = '';
      
      const response: any = await this.apiService.get(`/comision/proyecto/${proyectoId}`);
      this.comision = response.comision || [];
    } catch (error: any) {
      console.error('Error al cargar comisión:', error);
      this.error = 'Error al cargar comisión';
    } finally {
      this.loading = false;
    }
  }

  async cargarProfesoresDisponibles(proyectoId: number) {
    try {
      const response: any = await this.apiService.get(`/comision/proyecto/${proyectoId}/profesores-disponibles`);
      this.profesoresDisponibles = response.profesores || [];
    } catch (error: any) {
      console.error('Error al cargar profesores:', error);
    }
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.profesorSeleccionado = '';
    this.rolSeleccionado = '';
    this.observaciones = '';
    this.error = '';
    this.mensaje = '';
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.profesorSeleccionado = '';
    this.rolSeleccionado = '';
    this.observaciones = '';
    this.error = '';
    this.mensaje = '';
  }

  async agregarMiembro() {
    if (!this.validarFormulario()) {
      return;
    }

    try {
      this.loading = true;
      this.error = '';
      this.mensaje = '';

      await this.apiService.post('/comision/miembro', {
        proyecto_id: this.proyectoSeleccionado!.id,
        profesor_rut: this.profesorSeleccionado,
        rol_comision: this.rolSeleccionado,
        observaciones: this.observaciones || null
      });

      this.mensaje = 'Miembro agregado exitosamente';
      
      // Recargar datos
      await this.cargarComision(this.proyectoSeleccionado!.id);
      await this.cargarProfesoresDisponibles(this.proyectoSeleccionado!.id);
      await this.cargarProyectos();
      
      setTimeout(() => this.cerrarFormulario(), 1500);
    } catch (error: any) {
      console.error('Error al agregar miembro:', error);
      this.error = error.error?.message || 'Error al agregar miembro a la comisión';
    } finally {
      this.loading = false;
    }
  }

  async removerMiembro(comisionId: number) {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de remover este miembro de la comisión?',
      'Remover Miembro',
      'Remover',
      'Cancelar'
    );
    if (!confirmed) return;

    try {
      this.loading = true;
      this.error = '';

      await this.apiService.delete(`/comision/miembro/${comisionId}`);
      this.mensaje = 'Miembro removido exitosamente';

      // Recargar datos
      await this.cargarComision(this.proyectoSeleccionado!.id);
      await this.cargarProfesoresDisponibles(this.proyectoSeleccionado!.id);
      await this.cargarProyectos();

      setTimeout(() => this.mensaje = '', 3000);
    } catch (error: any) {
      console.error('Error al remover miembro:', error);
      this.error = error.error?.message || 'Error al remover miembro';
    } finally {
      this.loading = false;
    }
  }

  validarFormulario(): boolean {
    if (!this.profesorSeleccionado) {
      this.error = 'Debe seleccionar un profesor';
      return false;
    }

    if (!this.rolSeleccionado) {
      this.error = 'Debe seleccionar un rol';
      return false;
    }

    return true;
  }

  getRolLabel(rol: string): string {
    const labels: { [key: string]: string } = {
      'presidente': 'Presidente',
      'secretario': 'Secretario',
      'vocal': 'Vocal',
      'suplente': 'Suplente'
    };
    return labels[rol] || rol;
  }

  getRolClass(rol: string): string {
    const classes: { [key: string]: string } = {
      'presidente': 'badge-presidente',
      'secretario': 'badge-secretario',
      'vocal': 'badge-vocal',
      'suplente': 'badge-suplente'
    };
    return classes[rol] || '';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  volver() {
    window.history.back();
  }
}
