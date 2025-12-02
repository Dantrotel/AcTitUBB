import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';
import { Facultad, Departamento, Carrera } from '../../../interfaces/estructura-academica.interface';

type TabActiva = 'facultades' | 'departamentos' | 'carreras' | 'relaciones';

@Component({
  selector: 'app-gestion-estructura',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gestion-estructura.html',
  styleUrls: ['./gestion-estructura.scss']
})
export class GestionEstructuraComponent implements OnInit {
  tabActiva = signal<TabActiva>('facultades');
  
  // Signals para datos
  facultades = signal<Facultad[]>([]);
  departamentos = signal<Departamento[]>([]);
  carreras = signal<Carrera[]>([]);
  relaciones = signal<any[]>([]);
  
  // Estados de carga
  cargando = signal(false);
  mensaje = signal('');
  tipoMensaje = signal<'success' | 'error'>('success');
  
  // Modal de facultades
  modalFacultadAbierto = signal(false);
  modoEdicion = signal(false);
  facultadForm = signal<Partial<Facultad>>({});
  
  // Modal de departamentos
  modalDepartamentoAbierto = signal(false);
  departamentoForm = signal<Partial<Departamento>>({});
  
  // Modal de carreras
  modalCarreraAbierto = signal(false);
  carreraForm = signal<Partial<Carrera>>({});
  
  // Modal de relaciones departamentos-carreras
  modalRelacionAbierto = signal(false);
  relacionForm = signal<any>({
    departamento_id: null,
    carrera_id: null,
    es_principal: false
  });
  
  // Filtros para relaciones
  filtroCarrera = signal('');
  filtroDepartamento = signal('');
  filtroTipo = signal('');
  
  private notificationService = inject(NotificationService);

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cambiarTab(tab: TabActiva): void {
    this.tabActiva.set(tab);
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    
    if (this.tabActiva() === 'facultades') {
      this.cargarFacultades();
    } else if (this.tabActiva() === 'departamentos') {
      this.cargarDepartamentos();
    } else if (this.tabActiva() === 'carreras') {
      this.cargarCarreras();
    } else if (this.tabActiva() === 'relaciones') {
      this.cargarRelaciones();
    }
  }

  // ===== FACULTADES =====
  cargarFacultades(): void {
    this.apiService.getFacultades().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.facultades.set(res.facultades);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar facultades:', err);
        this.mostrarMensaje('Error al cargar facultades', 'error');
        this.cargando.set(false);
      }
    });
  }

  abrirModalFacultad(facultad?: Facultad): void {
    this.modoEdicion.set(!!facultad);
    this.facultadForm.set(facultad ? { ...facultad } : {});
    this.modalFacultadAbierto.set(true);
  }

  cerrarModalFacultad(): void {
    this.modalFacultadAbierto.set(false);
    this.facultadForm.set({});
  }

  guardarFacultad(): void {
    const form = this.facultadForm();
    
    if (!form.nombre || !form.codigo) {
      this.mostrarMensaje('Por favor completa los campos requeridos', 'error');
      return;
    }

    this.cargando.set(true);

    const operacion = this.modoEdicion()
      ? this.apiService.updateFacultad(form.id!, form)
      : this.apiService.createFacultad(form);

    operacion.subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje(
            this.modoEdicion() ? 'Facultad actualizada exitosamente' : 'Facultad creada exitosamente',
            'success'
          );
          this.cerrarModalFacultad();
          this.cargarFacultades();
        }
      },
      error: (err) => {
        console.error('Error al guardar facultad:', err);
        this.mostrarMensaje(err.error?.message || 'Error al guardar facultad', 'error');
        this.cargando.set(false);
      }
    });
  }

  async eliminarFacultad(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que deseas desactivar esta facultad? (Soft Delete)',
      'Confirmar desactivación',
      'Desactivar',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }

    this.cargando.set(true);
    this.apiService.deleteFacultad(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje('Facultad desactivada exitosamente', 'success');
          this.cargarFacultades();
        }
      },
      error: (err) => {
        console.error('Error al desactivar facultad:', err);
        this.mostrarMensaje(err.error?.message || 'Error al desactivar facultad', 'error');
        this.cargando.set(false);
      }
    });
  }

  async eliminarFacultadPermanente(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE esta facultad? Esta acción NO se puede deshacer.',
      'Confirmar eliminación permanente',
      'Eliminar Permanentemente',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }

    this.cargando.set(true);
    this.apiService.deleteFacultadPermanente(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje('Facultad eliminada permanentemente', 'success');
          this.cargarFacultades();
        }
      },
      error: (err) => {
        const mensaje = err.error?.message || err.message || 'Error al eliminar facultad permanentemente';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando.set(false);
      }
    });
  }

  async reactivarFacultad(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que deseas reactivar esta facultad?',
      'Confirmar reactivación',
      'Reactivar',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }

    this.cargando.set(true);
    this.apiService.reactivarFacultad(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje('Facultad reactivada exitosamente', 'success');
          this.cargarFacultades();
        }
      },
      error: (err) => {
        const mensaje = err.error?.message || err.message || 'Error al reactivar facultad';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando.set(false);
      }
    });
  }

  // ===== DEPARTAMENTOS =====
  cargarDepartamentos(): void {
    this.apiService.getDepartamentos().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.departamentos.set(res.departamentos);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar departamentos:', err);
        this.mostrarMensaje('Error al cargar departamentos', 'error');
        this.cargando.set(false);
      }
    });
  }

  abrirModalDepartamento(departamento?: Departamento): void {
    this.modoEdicion.set(!!departamento);
    this.departamentoForm.set(departamento ? { ...departamento } : {});
    this.modalDepartamentoAbierto.set(true);
    
    // Cargar facultades si no están cargadas
    if (this.facultades().length === 0) {
      this.apiService.getFacultades(true).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.facultades.set(res.facultades);
          }
        }
      });
    }
  }

  cerrarModalDepartamento(): void {
    this.modalDepartamentoAbierto.set(false);
    this.departamentoForm.set({});
  }

  guardarDepartamento(): void {
    const form = this.departamentoForm();
    
    if (!form.nombre || !form.codigo || !form.facultad_id) {
      this.mostrarMensaje('Por favor completa los campos requeridos', 'error');
      return;
    }

    this.cargando.set(true);

    const operacion = this.modoEdicion()
      ? this.apiService.updateDepartamento(form.id!, form)
      : this.apiService.createDepartamento(form);

    operacion.subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje(
            this.modoEdicion() ? 'Departamento actualizado exitosamente' : 'Departamento creado exitosamente',
            'success'
          );
          this.cerrarModalDepartamento();
          this.cargarDepartamentos();
        }
      },
      error: (err) => {
        console.error('Error al guardar departamento:', err);
        this.mostrarMensaje(err.error?.message || 'Error al guardar departamento', 'error');
        this.cargando.set(false);
      }
    });
  }

  async eliminarDepartamento(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que deseas desactivar este departamento? (Soft Delete)',
      'Confirmar desactivación',
      'Desactivar',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }

    this.cargando.set(true);
    this.apiService.deleteDepartamento(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje('Departamento desactivado exitosamente', 'success');
          this.cargarDepartamentos();
        }
      },
      error: (err) => {
        console.error('Error al desactivar departamento:', err);
        this.mostrarMensaje(err.error?.message || 'Error al desactivar departamento', 'error');
        this.cargando.set(false);
      }
    });
  }

  async reactivarDepartamento(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que deseas reactivar este departamento?',
      'Confirmar reactivación',
      'Reactivar',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }

    this.cargando.set(true);
    this.apiService.reactivarDepartamento(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje('Departamento reactivado exitosamente', 'success');
          this.cargarDepartamentos();
        }
      },
      error: (err) => {
        const mensaje = err.error?.message || err.message || 'Error al reactivar departamento';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando.set(false);
      }
    });
  }

  async eliminarDepartamentoPermanente(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE este departamento? Esta acción NO se puede deshacer.',
      'Confirmar eliminación permanente',
      'Eliminar Permanentemente',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }

    this.cargando.set(true);
    this.apiService.deleteDepartamentoPermanente(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje('Departamento eliminado permanentemente', 'success');
          this.cargarDepartamentos();
        }
      },
      error: (err) => {
        console.error('Error al eliminar departamento permanentemente:', err);
        const mensaje = err.error?.message || err.message || 'Error al eliminar departamento permanentemente';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando.set(false);
      }
    });
  }

  // ===== CARRERAS =====
  cargarCarreras(): void {
    this.apiService.getCarreras().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.carreras.set(res.carreras);
        }
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar carreras:', err);
        this.mostrarMensaje('Error al cargar carreras', 'error');
        this.cargando.set(false);
      }
    });
  }

  abrirModalCarrera(carrera?: Carrera): void {
    this.modoEdicion.set(!!carrera);
    this.carreraForm.set(carrera ? { ...carrera } : { modalidad: 'presencial' });
    this.modalCarreraAbierto.set(true);
    
    // Cargar facultades si no están cargadas
    if (this.facultades().length === 0) {
      this.apiService.getFacultades(true).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.facultades.set(res.facultades);
          }
        }
      });
    }
  }

  cerrarModalCarrera(): void {
    this.modalCarreraAbierto.set(false);
    this.carreraForm.set({});
  }

  guardarCarrera(): void {
    const form = this.carreraForm();
    
    if (!form.nombre || !form.codigo || !form.facultad_id || !form.titulo_profesional || !form.duracion_semestres) {
      this.mostrarMensaje('Por favor completa los campos requeridos', 'error');
      return;
    }

    this.cargando.set(true);

    const operacion = this.modoEdicion()
      ? this.apiService.updateCarrera(form.id!, form)
      : this.apiService.createCarrera(form);

    operacion.subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje(
            this.modoEdicion() ? 'Carrera actualizada exitosamente' : 'Carrera creada exitosamente',
            'success'
          );
          this.cerrarModalCarrera();
          this.cargarCarreras();
        }
      },
      error: (err) => {
        console.error('Error al guardar carrera:', err);
        this.mostrarMensaje(err.error?.message || 'Error al guardar carrera', 'error');
        this.cargando.set(false);
      }
    });
  }

  async eliminarCarrera(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que deseas desactivar esta carrera? (Soft Delete)',
      'Confirmar desactivación',
      'Desactivar',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }

    this.cargando.set(true);
    this.apiService.deleteCarrera(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje('Carrera desactivada exitosamente', 'success');
          this.cargarCarreras();
        }
      },
      error: (err) => {
        console.error('Error al desactivar carrera:', err);
        this.mostrarMensaje(err.error?.message || 'Error al desactivar carrera', 'error');
        this.cargando.set(false);
      }
    });
  }

  async reactivarCarrera(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que deseas reactivar esta carrera?',
      'Confirmar reactivación',
      'Reactivar',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }

    this.cargando.set(true);
    this.apiService.reactivarCarrera(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje('Carrera reactivada exitosamente', 'success');
          this.cargarCarreras();
        }
      },
      error: (err) => {
        const mensaje = err.error?.message || err.message || 'Error al reactivar carrera';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando.set(false);
      }
    });
  }

  async eliminarCarreraPermanente(id: number): Promise<void> {
    const confirmed = await this.notificationService.confirm(
      '¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE esta carrera? Esta acción NO se puede deshacer.',
      'Confirmar eliminación permanente',
      'Eliminar Permanentemente',
      'Cancelar'
    );
    
    if (!confirmed) {
      return;
    }

    this.cargando.set(true);
    this.apiService.deleteCarreraPermanente(id).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.mostrarMensaje('Carrera eliminada permanentemente', 'success');
          this.cargarCarreras();
        }
      },
      error: (err) => {
        console.error('Error al eliminar carrera permanentemente:', err);
        const mensaje = err.error?.message || err.message || 'Error al eliminar carrera permanentemente';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando.set(false);
      }
    });
  }

  // ===== RELACIONES DEPARTAMENTOS-CARRERAS =====
  cargarRelaciones(): void {
    // Cargar todos los datos necesarios
    Promise.all([
      this.apiService.obtenerRelacionesDepartamentosCarreras().toPromise(),
      this.apiService.obtenerDepartamentos().toPromise(),
      this.apiService.obtenerCarreras().toPromise()
    ]).then(([relaciones, departamentos, carreras]: any) => {
      this.relaciones.set(Array.isArray(relaciones) ? relaciones : []);
      this.departamentos.set(Array.isArray(departamentos) ? departamentos : []);
      this.carreras.set(Array.isArray(carreras) ? carreras : []);
      this.cargando.set(false);
    }).catch(error => {
      console.error('Error al cargar relaciones:', error);
      this.mostrarMensaje('Error al cargar relaciones', 'error');
      this.cargando.set(false);
    });
  }

  get relacionesFiltradas() {
    return this.relaciones().filter(rel => {
      const matchCarrera = !this.filtroCarrera() || 
        rel.carrera_nombre.toLowerCase().includes(this.filtroCarrera().toLowerCase()) ||
        rel.carrera_codigo.toLowerCase().includes(this.filtroCarrera().toLowerCase());
      
      const matchDepartamento = !this.filtroDepartamento() || 
        rel.departamento_nombre.toLowerCase().includes(this.filtroDepartamento().toLowerCase()) ||
        rel.departamento_codigo.toLowerCase().includes(this.filtroDepartamento().toLowerCase());
      
      const matchTipo = !this.filtroTipo() || 
        (this.filtroTipo() === 'principal' && rel.es_principal) ||
        (this.filtroTipo() === 'servicio' && !rel.es_principal);
      
      return matchCarrera && matchDepartamento && matchTipo;
    });
  }

  abrirModalRelacion(relacion?: any): void {
    this.modoEdicion.set(!!relacion);
    this.relacionForm.set(relacion ? { ...relacion } : {
      departamento_id: null,
      carrera_id: null,
      es_principal: false
    });
    this.modalRelacionAbierto.set(true);
  }

  cerrarModalRelacion(): void {
    this.modalRelacionAbierto.set(false);
    this.relacionForm.set({
      departamento_id: null,
      carrera_id: null,
      es_principal: false
    });
  }

  guardarRelacion(): void {
    const form = this.relacionForm();
    
    if (!form.departamento_id || !form.carrera_id) {
      this.mostrarMensaje('Debe seleccionar un departamento y una carrera', 'error');
      return;
    }

    this.cargando.set(true);
    
    if (this.modoEdicion()) {
      this.apiService.actualizarRelacionDepartamentoCarrera(form.id, {
        es_principal: form.es_principal,
        activo: form.activo
      }).subscribe({
        next: () => {
          this.mostrarMensaje('Relación actualizada exitosamente', 'success');
          this.cargarRelaciones();
          this.cerrarModalRelacion();
        },
        error: (err) => {
          console.error('Error al actualizar relación:', err);
          this.mostrarMensaje('Error al actualizar relación', 'error');
          this.cargando.set(false);
        }
      });
    } else {
      this.apiService.crearRelacionDepartamentoCarrera({
        departamento_id: form.departamento_id,
        carrera_id: form.carrera_id,
        es_principal: form.es_principal
      }).subscribe({
        next: () => {
          this.mostrarMensaje('Relación creada exitosamente', 'success');
          this.cargarRelaciones();
          this.cerrarModalRelacion();
        },
        error: (err) => {
          console.error('Error al crear relación:', err);
          if (err.status === 409) {
            this.mostrarMensaje('Esta relación ya existe', 'error');
          } else {
            this.mostrarMensaje('Error al crear relación', 'error');
          }
          this.cargando.set(false);
        }
      });
    }
  }

  eliminarRelacion(id: number): void {
    if (!confirm('¿Está seguro de eliminar esta relación?')) {
      return;
    }

    this.cargando.set(true);
    this.apiService.eliminarRelacionDepartamentoCarrera(id).subscribe({
      next: () => {
        this.mostrarMensaje('Relación eliminada exitosamente', 'success');
        this.cargarRelaciones();
      },
      error: (err) => {
        console.error('Error al eliminar relación:', err);
        this.mostrarMensaje('Error al eliminar relación', 'error');
        this.cargando.set(false);
      }
    });
  }

  toggleActivoRelacion(relacion: any): void {
    this.cargando.set(true);
    this.apiService.actualizarRelacionDepartamentoCarrera(relacion.id, {
      activo: !relacion.activo
    }).subscribe({
      next: () => {
        this.mostrarMensaje(
          `Relación ${!relacion.activo ? 'activada' : 'desactivada'} exitosamente`,
          'success'
        );
        this.cargarRelaciones();
      },
      error: (err) => {
        console.error('Error al cambiar estado:', err);
        this.mostrarMensaje('Error al cambiar estado', 'error');
        this.cargando.set(false);
      }
    });
  }

  limpiarFiltrosRelaciones(): void {
    this.filtroCarrera.set('');
    this.filtroDepartamento.set('');
    this.filtroTipo.set('');
  }

  // ===== UTILIDADES =====
  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje.set(texto);
    this.tipoMensaje.set(tipo);
    setTimeout(() => {
      this.mensaje.set('');
    }, 4000);
  }
}
