import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EntidadExterna {
  id?: number;
  nombre: string;
  razon_social?: string;
  rut_empresa?: string;
  tipo: 'empresa_privada' | 'empresa_publica' | 'institucion_educativa' | 'ong' | 'organismo_publico' | 'otra';
  email_contacto?: string;
  telefono?: string;
  direccion?: string;
  sitio_web?: string;
  descripcion?: string;
  area_actividad?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColaboradorExterno {
  id?: number;
  nombre_completo: string;
  rut?: string;
  email: string;
  telefono?: string;
  entidad_id: number;
  entidad_nombre?: string;
  cargo?: string;
  area_departamento?: string;
  especialidad?: string;
  anos_experiencia?: number;
  linkedin?: string;
  tipo_colaborador: 'supervisor_empresa' | 'mentor' | 'asesor_tecnico' | 'evaluador_externo' | 'coach' | 'otro';
  biografia?: string;
  observaciones?: string;
  activo?: boolean;
  verificado?: boolean;
  fecha_verificacion?: string;
  verificado_por?: string;
  verificador_nombre?: string;
  creado_por?: string;
  creador_nombre?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColaboradorProyecto {
  id?: number;
  proyecto_id: number;
  colaborador_id: number;
  rol_en_proyecto?: string;
  descripcion_rol?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  horas_dedicadas?: number;
  frecuencia_interaccion?: string;
  puede_evaluar?: boolean;
  evaluacion_realizada?: boolean;
  comentarios_participacion?: string;
  activo?: boolean;
  motivo_desvinculacion?: string;
  asignado_por?: string;
  // Datos expandidos
  nombre_completo?: string;
  email?: string;
  telefono?: string;
  entidad_nombre?: string;
  cargo?: string;
  asignador_nombre?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluacionColaborador {
  id?: number;
  colaborador_proyecto_id: number;
  proyecto_id: number;
  colaborador_id: number;
  estudiante_rut: string;
  fecha_evaluacion: string;
  calificacion: number;
  asistencia_puntualidad?: number;
  calidad_trabajo?: number;
  proactividad?: number;
  trabajo_equipo?: number;
  comunicacion?: number;
  cumplimiento_plazos?: number;
  fortalezas?: string;
  areas_mejora?: string;
  comentarios_generales?: string;
  recomendaria_estudiante?: boolean;
  documento_evaluacion?: string;
  aprobada_por_profesor?: boolean;
  fecha_aprobacion?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ColaboradoresExternosService {
  private http: HttpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/colaboradores-externos`;

  // ========== ENTIDADES EXTERNAS (EMPRESAS) ==========

  obtenerEntidades(activo?: boolean): Observable<{ success: boolean; entidades: EntidadExterna[] }> {
    const params: any = {};
    if (activo !== undefined) {
      params.activo = String(activo);
    }
    return this.http.get<{ success: boolean; entidades: EntidadExterna[] }>(
      `${this.apiUrl}/entidades`,
      Object.keys(params).length > 0 ? { params } : {}
    );
  }

  crearEntidad(entidad: EntidadExterna): Observable<{ success: boolean; mensaje: string; id: number }> {
    return this.http.post<{ success: boolean; mensaje: string; id: number }>(
      `${this.apiUrl}/entidades`,
      entidad
    );
  }

  // ========== COLABORADORES EXTERNOS ==========

  obtenerColaboradores(filtros?: {
    activo?: boolean;
    entidad_id?: number;
    tipo_colaborador?: string;
    busqueda?: string;
  }): Observable<{ success: boolean; colaboradores: ColaboradorExterno[] }> {
    let params: any = {};
    if (filtros) {
      if (filtros.activo !== undefined) params.activo = String(filtros.activo);
      if (filtros.entidad_id) params.entidad_id = String(filtros.entidad_id);
      if (filtros.tipo_colaborador) params.tipo_colaborador = filtros.tipo_colaborador;
      if (filtros.busqueda) params.busqueda = filtros.busqueda;
    }
    return this.http.get<{ success: boolean; colaboradores: ColaboradorExterno[] }>(
      this.apiUrl,
      { params }
    );
  }

  crearColaborador(colaborador: ColaboradorExterno): Observable<{ success: boolean; mensaje: string; id: number }> {
    return this.http.post<{ success: boolean; mensaje: string; id: number }>(
      this.apiUrl,
      colaborador
    );
  }

  verificarColaborador(colaboradorId: number): Observable<{ success: boolean; mensaje: string }> {
    return this.http.put<{ success: boolean; mensaje: string }>(
      `${this.apiUrl}/${colaboradorId}/verificar`,
      {}
    );
  }

  // ========== ASIGNACIÓN A PROYECTOS ==========

  asignarColaboradorAProyecto(datos: {
    proyecto_id: number;
    colaborador_id: number;
    rol_en_proyecto?: string;
    descripcion_rol?: string;
    fecha_inicio?: string;
    horas_dedicadas?: number;
    frecuencia_interaccion?: string;
    puede_evaluar?: boolean;
  }): Observable<{ success: boolean; mensaje: string; id: number }> {
    return this.http.post<{ success: boolean; mensaje: string; id: number }>(
      `${this.apiUrl}/proyectos/asignar`,
      datos
    );
  }

  obtenerColaboradoresDeProyecto(
    proyectoId: number,
    activo?: boolean
  ): Observable<{ success: boolean; colaboradores: ColaboradorProyecto[] }> {
    const params: any = {};
    if (activo !== undefined) {
      params.activo = String(activo);
    }
    return this.http.get<{ success: boolean; colaboradores: ColaboradorProyecto[] }>(
      `${this.apiUrl}/proyectos/${proyectoId}`,
      Object.keys(params).length > 0 ? { params } : {}
    );
  }

  desasignarColaborador(
    colaboradorProyectoId: number,
    motivo: string
  ): Observable<{ success: boolean; mensaje: string }> {
    return this.http.delete<{ success: boolean; mensaje: string }>(
      `${this.apiUrl}/proyectos/${colaboradorProyectoId}`,
      { body: { motivo } }
    );
  }

  // ========== EVALUACIONES ==========

  crearEvaluacion(evaluacion: EvaluacionColaborador): Observable<{ success: boolean; mensaje: string; id: number }> {
    return this.http.post<{ success: boolean; mensaje: string; id: number }>(
      `${this.apiUrl}/evaluaciones`,
      evaluacion
    );
  }
}
