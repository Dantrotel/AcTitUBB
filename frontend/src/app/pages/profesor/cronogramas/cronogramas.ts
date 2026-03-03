import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-cronogramas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cronogramas.html',
  styleUrls: ['./cronogramas.scss']
})
export class CronogramasComponent implements OnInit {
  profesor: any = {};

  // Proyectos
  proyectosAsignados: any[] = [];
  proyectoSeleccionado: any = null;

  // Estados
  loading = false;
  loadingFechas = false;
  error = '';
  success = '';

  // Fechas importantes
  fechasImportantes: any[] = [];
  todasLasFechas: any[] = [];

  // Modales
  mostrarModalFecha = false;
  mostrarModalEditarFecha = false;
  fechaEditando: any = null;

  // Vista
  vistaActual: 'lista' | 'timeline' = 'lista';
  vistaGlobal = false;

  // Filtros
  filtroTipo = '';
  filtroPrioridad = '';
  filtroOrden = 'fecha_asc';

  // Formulario nueva fecha
  nuevaFecha: any = {
    titulo: '',
    descripcion: '',
    tipo_fecha: 'entrega',
    fecha_limite: null,
    prioridad: 'media'
  };

  tiposFecha = [
    { value: 'entrega',      label: 'Entrega' },
    { value: 'reunion',      label: 'Reunión' },
    { value: 'hito',         label: 'Hito' },
    { value: 'deadline',     label: 'Fecha límite' },
    { value: 'presentacion', label: 'Presentación' }
  ];

  prioridades = [
    { value: 'baja',   label: 'Baja' },
    { value: 'media',  label: 'Media' },
    { value: 'alta',   label: 'Alta' },
    { value: 'critica', label: 'Crítica' }
  ];

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    public router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarProfesor();
    this.cargarProyectosAsignados();
  }

  cargarProfesor() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.profesor = { rut: payload.rut, nombre: payload.nombre || 'Profesor' };
    } catch { /* token inválido */ }
  }

  cerrarSesion() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // ===== UTILIDADES DE FECHAS =====

  getDiasRestantes(fecha: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fl = new Date(fecha);
    fl.setHours(0, 0, 0, 0);
    return Math.ceil((fl.getTime() - hoy.getTime()) / 86400000);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  getConteoRegresivo(fecha: any): { texto: string; clase: string } {
    if (fecha.completada) return { texto: 'Completada', clase: 'estado-completada' };
    const d = this.getDiasRestantes(fecha.fecha || fecha.fecha_limite);
    if (d < 0)  return { texto: `Vencida hace ${Math.abs(d)} día${Math.abs(d) !== 1 ? 's' : ''}`, clase: 'estado-vencida' };
    if (d === 0) return { texto: 'Vence hoy', clase: 'estado-hoy' };
    if (d === 1) return { texto: 'Vence mañana', clase: 'estado-urgente' };
    if (d <= 3)  return { texto: `${d} días restantes`, clase: 'estado-urgente' };
    if (d <= 7)  return { texto: `${d} días restantes`, clase: 'estado-proximo' };
    return { texto: `${d} días restantes`, clase: 'estado-normal' };
  }

  getIconoTipoFecha(tipo: string): string {
    const map: any = {
      entrega:      'fas fa-file-upload',
      reunion:      'fas fa-users',
      hito:         'fas fa-flag-checkered',
      deadline:     'fas fa-exclamation-triangle',
      presentacion: 'fas fa-chalkboard-teacher'
    };
    return map[tipo] || 'fas fa-calendar';
  }

  getTipoFechaLabel(tipo: string): string {
    const map: any = {
      entrega: 'Entrega', reunion: 'Reunión', hito: 'Hito',
      deadline: 'Fecha límite', presentacion: 'Presentación'
    };
    return map[tipo] || tipo;
  }

  getPrioridadLabel(p: string): string {
    const map: any = { baja: 'Baja', media: 'Media', alta: 'Alta', critica: 'Crítica' };
    return map[p] || p;
  }

  // ===== CARGA DE DATOS =====

  async cargarProyectosAsignados() {
    try {
      this.loading = true;
      this.error = '';
      const res: any = await this.apiService.getProyectosAsignados().toPromise();
      this.proyectosAsignados = res?.projects || res || [];
    } catch (e: any) {
      this.error = 'Error al cargar proyectos: ' + (e.error?.message || e.message);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async seleccionarProyecto(proyecto: any) {
    this.proyectoSeleccionado = proyecto;
    this.vistaGlobal = false;
    this.limpiarFiltros();
    await this.cargarFechasImportantes();
  }

  async cargarFechasImportantes() {
    if (!this.proyectoSeleccionado?.id) return;
    try {
      this.loadingFechas = true;
      const res: any = await this.apiService.getFechasImportantesProyecto(
        this.proyectoSeleccionado.id
      ).toPromise();
      this.fechasImportantes = res?.success ? (res.data?.fechas_importantes || []) : [];
    } catch {
      this.error = 'Error al cargar fechas importantes';
      this.fechasImportantes = [];
    } finally {
      this.loadingFechas = false;
      this.cdr.detectChanges();
    }
  }

  async cargarTodasLasFechas() {
    if (this.proyectosAsignados.length === 0) return;
    try {
      this.loadingFechas = true;
      const acumuladas: any[] = [];

      for (const proyecto of this.proyectosAsignados) {
        try {
          const res: any = await this.apiService
            .getFechasImportantesProyecto(proyecto.id)
            .toPromise();
          const fechas: any[] = res?.success
            ? (res.data?.fechas_importantes || [])
            : [];
          // Agregar info del proyecto a cada fecha para mostrarla en la card
          acumuladas.push(
            ...fechas.map((f: any) => ({
              ...f,
              proyecto_titulo: proyecto.titulo,
              proyecto_id: proyecto.id
            }))
          );
        } catch {
          // Si falla un proyecto individual, continuamos con los demás
        }
      }

      this.todasLasFechas = acumuladas;
    } catch {
      this.error = 'Error al cargar vista global';
      this.todasLasFechas = [];
    } finally {
      this.loadingFechas = false;
      this.cdr.detectChanges();
    }
  }

  async toggleVistaGlobal() {
    this.vistaGlobal = !this.vistaGlobal;
    if (this.vistaGlobal) {
      this.proyectoSeleccionado = null;
      this.limpiarFiltros();
      // Asegurar que los proyectos estén cargados antes de iterar
      if (this.proyectosAsignados.length === 0) {
        await this.cargarProyectosAsignados();
      }
      await this.cargarTodasLasFechas();
    }
  }

  // ===== FILTROS Y ORDENAMIENTO =====

  get fechasFiltradas(): any[] {
    let lista = this.vistaGlobal ? [...this.todasLasFechas] : [...this.fechasImportantes];
    if (this.filtroTipo)      lista = lista.filter(f => f.tipo_fecha === this.filtroTipo);
    if (this.filtroPrioridad) lista = lista.filter(f => f.prioridad === this.filtroPrioridad);

    const ord: any = { critica: 0, alta: 1, media: 2, baja: 3 };
    switch (this.filtroOrden) {
      case 'fecha_asc':
        lista.sort((a, b) => new Date(a.fecha || a.fecha_limite).getTime() - new Date(b.fecha || b.fecha_limite).getTime());
        break;
      case 'fecha_desc':
        lista.sort((a, b) => new Date(b.fecha || b.fecha_limite).getTime() - new Date(a.fecha || a.fecha_limite).getTime());
        break;
      case 'prioridad':
        lista.sort((a, b) => (ord[a.prioridad] ?? 4) - (ord[b.prioridad] ?? 4));
        break;
      case 'tipo':
        lista.sort((a, b) => (a.tipo_fecha || '').localeCompare(b.tipo_fecha || ''));
        break;
    }
    return lista;
  }

  get fechasAgrupadasPorMes(): { mes: string; fechas: any[] }[] {
    const grupos: { [k: string]: { label: string; fechas: any[] } } = {};
    for (const f of this.fechasFiltradas) {
      const d = new Date(f.fecha || f.fecha_limite);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!grupos[key]) {
        grupos[key] = {
          label: d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }),
          fechas: []
        };
      }
      grupos[key].fechas.push(f);
    }
    return Object.keys(grupos).sort().map(k => ({
      mes: grupos[k].label,
      fechas: grupos[k].fechas
    }));
  }

  get progreso(): { total: number; completadas: number; porcentaje: number } {
    const total = this.fechasImportantes.length;
    const completadas = this.fechasImportantes.filter(f => f.completada).length;
    return { total, completadas, porcentaje: total > 0 ? Math.round((completadas / total) * 100) : 0 };
  }

  get hayFiltrosActivos(): boolean {
    return !!(this.filtroTipo || this.filtroPrioridad || this.filtroOrden !== 'fecha_asc');
  }

  limpiarFiltros() {
    this.filtroTipo = '';
    this.filtroPrioridad = '';
    this.filtroOrden = 'fecha_asc';
  }

  // ===== CREAR FECHA =====

  abrirModalFecha() {
    this.nuevaFecha = {
      titulo: '', descripcion: '', tipo_fecha: 'entrega',
      fecha_limite: null, prioridad: 'media'
    };
    this.mostrarModalFecha = true;
  }

  cerrarModalFecha() {
    this.mostrarModalFecha = false;
  }

  async crearFechaImportante() {
    if (!this.proyectoSeleccionado?.id) return;
    if (!this.nuevaFecha.titulo?.trim()) { this.error = 'El título es requerido'; return; }
    if (!this.nuevaFecha.fecha_limite)   { this.error = 'La fecha límite es requerida'; return; }
    try {
      this.loading = true;
      this.error = '';
      await this.apiService.crearFechaImportante(this.proyectoSeleccionado.id, {
        titulo:      this.nuevaFecha.titulo.trim(),
        descripcion: this.nuevaFecha.descripcion?.trim() || '',
        tipo_fecha:  this.nuevaFecha.tipo_fecha,
        fecha_limite: this.nuevaFecha.fecha_limite,
        prioridad:   this.nuevaFecha.prioridad
      }).toPromise();
      this.notificationService.success('Fecha creada exitosamente');
      await this.cargarFechasImportantes();
      this.cerrarModalFecha();
    } catch (e: any) {
      this.error = 'Error al crear fecha: ' + (e.error?.message || e.message);
    } finally {
      this.loading = false;
    }
  }

  // ===== EDITAR FECHA =====

  abrirModalEditarFecha(fecha: any) {
    const fl = (fecha.fecha_limite || fecha.fecha || '').split('T')[0];
    this.fechaEditando = {
      id:          fecha.id,
      titulo:      fecha.titulo,
      descripcion: fecha.descripcion || '',
      tipo_fecha:  fecha.tipo_fecha,
      fecha_limite: fl,
      prioridad:   fecha.prioridad || 'media'
    };
    this.mostrarModalEditarFecha = true;
  }

  cerrarModalEditarFecha() {
    this.mostrarModalEditarFecha = false;
    this.fechaEditando = null;
  }

  async guardarEdicionFecha() {
    if (!this.fechaEditando?.titulo?.trim()) { this.error = 'El título es requerido'; return; }
    if (!this.fechaEditando.fecha_limite)    { this.error = 'La fecha es requerida'; return; }
    try {
      this.loading = true;
      this.error = '';
      await this.apiService.actualizarFechaImportante(
        this.proyectoSeleccionado.id,
        String(this.fechaEditando.id),
        {
          titulo:      this.fechaEditando.titulo.trim(),
          descripcion: this.fechaEditando.descripcion?.trim() || '',
          tipo_fecha:  this.fechaEditando.tipo_fecha,
          fecha_limite: this.fechaEditando.fecha_limite,
          prioridad:   this.fechaEditando.prioridad
        }
      ).toPromise();
      this.notificationService.success('Fecha actualizada exitosamente');
      await this.cargarFechasImportantes();
      this.cerrarModalEditarFecha();
    } catch (e: any) {
      this.error = 'Error al actualizar: ' + (e.error?.message || e.message);
    } finally {
      this.loading = false;
    }
  }

  // ===== ELIMINAR FECHA =====

  async eliminarFecha(fecha: any) {
    const ok = await this.notificationService.confirm(
      `¿Estás seguro de eliminar "${fecha.titulo}"?`,
      'Eliminar Fecha', 'Eliminar', 'Cancelar'
    );
    if (!ok) return;
    try {
      this.loading = true;
      await this.apiService.eliminarFechaImportante(
        this.proyectoSeleccionado.id, String(fecha.id)
      ).toPromise();
      this.notificationService.success('Fecha eliminada');
      await this.cargarFechasImportantes();
    } catch (e: any) {
      this.error = 'Error al eliminar: ' + (e.error?.message || e.message);
    } finally {
      this.loading = false;
    }
  }

  // ===== MARCAR COMPLETADA =====

  async toggleCompletada(fecha: any) {
    try {
      const nueva = !fecha.completada;
      await this.apiService.marcarFechaCompletada(
        this.proyectoSeleccionado.id, String(fecha.id), nueva
      ).toPromise();
      fecha.completada = nueva;
      this.notificationService.success(nueva ? 'Marcada como completada' : 'Desmarcada');
      this.cdr.detectChanges();
    } catch (e: any) {
      this.error = 'Error al actualizar estado: ' + (e.error?.message || e.message);
    }
  }

  // ===== VISTA Y EXPORTAR =====

  setVista(vista: 'lista' | 'timeline') {
    this.vistaActual = vista;
  }

  exportarCronograma() {
    window.print();
  }

  // ===== UTILIDADES =====

  limpiarMensajes() {
    this.error = '';
    this.success = '';
  }

  volver() {
    window.history.back();
  }
}
