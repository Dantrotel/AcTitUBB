import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';
import { GestionHitosComponent } from '../../../components/gestion-hitos/gestion-hitos.component';

@Component({
  selector: 'app-cronogramas',
  standalone: true,
  imports: [CommonModule, GestionHitosComponent],
  templateUrl: './cronogramas.html',
  styleUrls: ['./cronogramas.scss']
})
export class CronogramasComponent implements OnInit {

  profesor: any = {};

  proyectosAsignados: any[] = [];
  proyectoSeleccionado: any = null;
  cronogramaId: string = '';

  loading = false;
  loadingCronograma = false;
  error = '';

  constructor(
    private apiService: ApiService,
    public router: Router
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
      this.profesor = { rut: payload.rut, nombre: payload.nombre || 'Profesor', rol_id: payload.rol_id || '2' };
    } catch { /* token inválido */ }
  }

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
    }
  }

  async seleccionarProyecto(proyecto: any) {
    this.proyectoSeleccionado = proyecto;
    this.cronogramaId = '';
    this.error = '';
    await this.cargarCronograma(proyecto.id);
  }

  async cargarCronograma(proyectoId: string) {
    try {
      this.loadingCronograma = true;
      this.error = '';
      const res: any = await this.apiService.getCronogramaProyecto(proyectoId).toPromise();
      const cronograma = res?.cronograma || res?.data?.cronograma || null;
      this.cronogramaId = cronograma?.id ? String(cronograma.id) : '';
      if (!this.cronogramaId) {
        this.error = 'Este proyecto aún no tiene un cronograma. Crea uno para comenzar.';
      }
    } catch {
      this.error = 'Este proyecto aún no tiene un cronograma. Crea uno para comenzar.';
      this.cronogramaId = '';
    } finally {
      this.loadingCronograma = false;
    }
  }

  async crearCronograma() {
    if (!this.proyectoSeleccionado?.id) return;
    try {
      this.loadingCronograma = true;
      this.error = '';
      const hoy = new Date();
      const fechaFin = new Date();
      fechaFin.setMonth(fechaFin.getMonth() + 6);
      const res: any = await this.apiService.crearCronograma(this.proyectoSeleccionado.id, {
        nombre_cronograma: `Cronograma - ${this.proyectoSeleccionado.titulo}`,
        descripcion: 'Cronograma principal del proyecto de titulación',
        fecha_inicio: hoy.toISOString().split('T')[0],
        fecha_fin_estimada: fechaFin.toISOString().split('T')[0],
        dias_alerta_previa: 3
      }).toPromise();
      this.cronogramaId = res?.cronograma_id ? String(res.cronograma_id) : '';
      if (!this.cronogramaId) await this.cargarCronograma(this.proyectoSeleccionado.id);
    } catch (e: any) {
      this.error = 'Error al crear cronograma: ' + (e.error?.message || e.message);
    } finally {
      this.loadingCronograma = false;
    }
  }

  verDetalleProyecto(proyecto: any) {
    this.router.navigate(['/profesor/proyecto', proyecto.id]);
  }

  volver() {
    window.history.back();
  }
}
