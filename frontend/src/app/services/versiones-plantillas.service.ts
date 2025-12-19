// Servicio de Versiones de Documentos y Plantillas
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VersionDocumento {
  id: number;
  avance_id: number;
  proyecto_id: number;
  numero_version: string;
  tipo_version: 'estudiante' | 'profesor_revision' | 'profesor_comentarios' | 'version_final';
  archivo_nombre: string;
  archivo_ruta: string;
  archivo_tamano_kb: number;
  archivo_tipo: string;
  descripcion_cambios?: string;
  cambios_principales?: string;
  autor_rut: string;
  autor_nombre?: string;
  autor_apellido?: string;
  autor_rol: 'estudiante' | 'profesor_guia' | 'profesor_informante' | 'admin';
  comentarios_generales?: string;
  estado: 'borrador' | 'enviado' | 'en_revision' | 'revisado' | 'aprobado' | 'rechazado';
  requiere_correccion?: boolean;
  es_version_final?: boolean;
  visible_para_estudiante?: boolean;
  fecha_subida: Date;
  fecha_revision?: Date;
  total_comentarios?: number;
  avance_titulo?: string;
}

export interface ComentarioVersion {
  id: number;
  version_id: number;
  autor_rut: string;
  autor_nombre: string;
  autor_rol: string;
  comentario: string;
  tipo_comentario: 'general' | 'sugerencia' | 'error' | 'aprobacion' | 'rechazo';
  prioridad: 'baja' | 'media' | 'alta';
  seccion_referencia?: string;
  resuelto: boolean;
  fecha_resolucion?: Date;
  created_at: Date;
}

export interface PlantillaDocumento {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo_documento: 'propuesta' | 'informe_avance' | 'informe_final' | 'presentacion' | 'poster' | 'acta' | 'otro';
  archivo_nombre: string;
  archivo_ruta: string;
  archivo_tipo: string;
  archivo_tamano_kb: number;
  carrera_id?: number;
  departamento_id?: number;
  facultad_id?: number;
  carrera_nombre?: string;
  departamento_nombre?: string;
  facultad_nombre?: string;
  version_plantilla?: string;
  formato_requerido?: string;
  instrucciones?: string;
  ejemplo_url?: string;
  activa: boolean;
  obligatoria: boolean;
  descargas: number;
  creado_por: string;
  creador_nombre?: string;
  creador_apellido?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ResultadoFinal {
  id: number;
  proyecto_id: number;
  estado_final: 'aprobado' | 'aprobado_con_distincion' | 'aprobado_con_observaciones' | 'reprobado' | 'abandonado' | 'anulado';
  evaluacion_profesor_guia?: number;
  evaluacion_profesor_informante?: number;
  evaluacion_comision?: number;
  observaciones_finales?: string;
  recomendaciones?: string;
  areas_destacadas?: string;
  documento_final?: string;
  acta_aprobacion?: string;
  mencion_honores: boolean;
  mencion_excelencia: boolean;
  publicacion_recomendada: boolean;
  fecha_aprobacion?: Date;
  fecha_cierre?: Date;
  cerrado_por: string;
  cerrado_por_nombre?: string;
  cerrado_por_apellido?: string;
  created_at: Date;
}

export interface HistorialEstado {
  id: number;
  proyecto_id: number;
  estado_anterior?: string;
  estado_nuevo: string;
  motivo?: string;
  observaciones?: string;
  cambiado_por: string;
  cambiado_por_nombre?: string;
  cambiado_por_apellido?: string;
  fecha_cambio: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VersionesPlantillasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/versiones`;

  // ========== VERSIONES DE DOCUMENTOS ==========

  /**
   * Subir nueva versión de documento
   */
  subirVersion(datosVersion: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}`, datosVersion);
  }

  /**
   * Obtener versiones de un avance
   */
  obtenerVersionesAvance(avance_id: number): Observable<{ versiones: VersionDocumento[] }> {
    return this.http.get<{ versiones: VersionDocumento[] }>(`${this.apiUrl}/avance/${avance_id}`);
  }

  /**
   * Obtener versiones de un proyecto con filtros opcionales
   */
  obtenerVersionesProyecto(
    proyecto_id: number,
    filtros?: {
      tipo_version?: string;
      estado?: string;
      autor_rol?: string;
    }
  ): Observable<{ versiones: VersionDocumento[] }> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.tipo_version) params = params.set('tipo_version', filtros.tipo_version);
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.autor_rol) params = params.set('autor_rol', filtros.autor_rol);
    }

    return this.http.get<{ versiones: VersionDocumento[] }>(
      `${this.apiUrl}/proyecto/${proyecto_id}`,
      { params }
    );
  }

  /**
   * Obtener detalles de una versión específica
   */
  obtenerVersion(version_id: number): Observable<{ version: VersionDocumento }> {
    return this.http.get<{ version: VersionDocumento }>(`${this.apiUrl}/${version_id}`);
  }

  /**
   * Descargar archivo de una versión
   */
  descargarVersion(version_id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${version_id}/descargar`, {
      responseType: 'blob'
    });
  }

  /**
   * Actualizar estado de una versión
   */
  actualizarEstadoVersion(
    version_id: number,
    estado: string,
    comentarios?: string
  ): Observable<any> {
    return this.http.put(`${this.apiUrl}/${version_id}/estado`, {
      estado,
      comentarios
    });
  }

  /**
   * Marcar versión como final
   */
  marcarVersionFinal(version_id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${version_id}/marcar-final`, {});
  }

  // ========== COMENTARIOS DE VERSIONES ==========

  /**
   * Crear comentario en una versión
   */
  crearComentario(
    version_id: number,
    datosComentario: {
      comentario: string;
      tipo_comentario?: string;
      prioridad?: string;
      seccion_referencia?: string;
    }
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/${version_id}/comentarios`, datosComentario);
  }

  /**
   * Obtener comentarios de una versión
   */
  obtenerComentarios(version_id: number): Observable<{ comentarios: ComentarioVersion[] }> {
    return this.http.get<{ comentarios: ComentarioVersion[] }>(
      `${this.apiUrl}/${version_id}/comentarios`
    );
  }

  /**
   * Marcar comentario como resuelto
   */
  resolverComentario(comentario_id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/comentarios/${comentario_id}/resolver`, {});
  }

  // ========== PLANTILLAS ==========

  /**
   * Subir plantilla de documento (solo admin)
   */
  subirPlantilla(datosPlantilla: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/plantillas`, datosPlantilla);
  }

  /**
   * Obtener plantillas disponibles con filtros opcionales
   */
  obtenerPlantillas(filtros?: {
    tipo_documento?: string;
    carrera_id?: number;
    obligatoria?: boolean;
  }): Observable<{ plantillas: PlantillaDocumento[] }> {
    let params = new HttpParams();

    if (filtros) {
      if (filtros.tipo_documento) params = params.set('tipo_documento', filtros.tipo_documento);
      if (filtros.carrera_id) params = params.set('carrera_id', filtros.carrera_id.toString());
      if (filtros.obligatoria !== undefined) {
        params = params.set('obligatoria', filtros.obligatoria.toString());
      }
    }

    return this.http.get<{ plantillas: PlantillaDocumento[] }>(
      `${this.apiUrl}/plantillas`,
      { params }
    );
  }

  /**
   * Descargar plantilla
   */
  descargarPlantilla(plantilla_id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/plantillas/${plantilla_id}/descargar`, {
      responseType: 'blob'
    });
  }

  /**
   * Actualizar plantilla (solo admin)
   */
  actualizarPlantilla(plantilla_id: number, datosPlantilla: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/plantillas/${plantilla_id}`, datosPlantilla);
  }

  /**
   * Desactivar plantilla (solo admin)
   */
  desactivarPlantilla(plantilla_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/plantillas/${plantilla_id}`);
  }

  // ========== RESULTADOS FINALES ==========

  /**
   * Crear resultado final de proyecto
   */
  crearResultadoFinal(proyecto_id: number, datosResultado: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/proyectos/${proyecto_id}/resultado-final`, datosResultado);
  }

  /**
   * Obtener resultado final de proyecto
   */
  obtenerResultadoFinal(proyecto_id: number): Observable<{ resultado: ResultadoFinal }> {
    return this.http.get<{ resultado: ResultadoFinal }>(
      `${this.apiUrl}/proyectos/${proyecto_id}/resultado-final`
    );
  }

  /**
   * Obtener historial de estados de proyecto
   */
  obtenerHistorialEstados(proyecto_id: number): Observable<{ historial: HistorialEstado[] }> {
    return this.http.get<{ historial: HistorialEstado[] }>(
      `${this.apiUrl}/proyectos/${proyecto_id}/historial-estados`
    );
  }

  // ========== HELPERS ==========

  /**
   * Crear FormData para subir versión
   */
  crearFormDataVersion(datos: {
    avance_id: number;
    proyecto_id: number;
    tipo_version: string;
    archivo: File;
    descripcion_cambios?: string;
    cambios_principales?: string;
    comentarios_generales?: string;
    es_version_final?: boolean;
  }): FormData {
    const formData = new FormData();

    formData.append('avance_id', datos.avance_id.toString());
    formData.append('proyecto_id', datos.proyecto_id.toString());
    formData.append('tipo_version', datos.tipo_version);
    formData.append('archivo', datos.archivo);

    if (datos.descripcion_cambios) {
      formData.append('descripcion_cambios', datos.descripcion_cambios);
    }
    if (datos.cambios_principales) {
      formData.append('cambios_principales', datos.cambios_principales);
    }
    if (datos.comentarios_generales) {
      formData.append('comentarios_generales', datos.comentarios_generales);
    }
    if (datos.es_version_final !== undefined) {
      formData.append('es_version_final', datos.es_version_final.toString());
    }

    return formData;
  }

  /**
   * Crear FormData para subir plantilla
   */
  crearFormDataPlantilla(datos: {
    nombre: string;
    tipo_documento: string;
    archivo: File;
    descripcion?: string;
    carrera_id?: number;
    departamento_id?: number;
    facultad_id?: number;
    version_plantilla?: string;
    formato_requerido?: string;
    instrucciones?: string;
    ejemplo_url?: string;
    obligatoria?: boolean;
  }): FormData {
    const formData = new FormData();

    formData.append('nombre', datos.nombre);
    formData.append('tipo_documento', datos.tipo_documento);
    formData.append('archivo', datos.archivo);

    if (datos.descripcion) formData.append('descripcion', datos.descripcion);
    if (datos.carrera_id) formData.append('carrera_id', datos.carrera_id.toString());
    if (datos.departamento_id) {
      formData.append('departamento_id', datos.departamento_id.toString());
    }
    if (datos.facultad_id) formData.append('facultad_id', datos.facultad_id.toString());
    if (datos.version_plantilla) {
      formData.append('version_plantilla', datos.version_plantilla);
    }
    if (datos.formato_requerido) {
      formData.append('formato_requerido', datos.formato_requerido);
    }
    if (datos.instrucciones) formData.append('instrucciones', datos.instrucciones);
    if (datos.ejemplo_url) formData.append('ejemplo_url', datos.ejemplo_url);
    if (datos.obligatoria !== undefined) {
      formData.append('obligatoria', datos.obligatoria.toString());
    }

    return formData;
  }

  /**
   * Obtener icono según tipo de documento
   */
  obtenerIconoTipoDocumento(tipo_documento: string): string {
    const iconos: Record<string, string> = {
      propuesta: 'description',
      informe_avance: 'assignment',
      informe_final: 'assignment_turned_in',
      presentacion: 'slideshow',
      poster: 'image',
      acta: 'gavel',
      otro: 'insert_drive_file'
    };
    return iconos[tipo_documento] || 'insert_drive_file';
  }

  /**
   * Obtener color según estado de versión
   */
  obtenerColorEstado(estado: string): string {
    const colores: Record<string, string> = {
      borrador: 'grey',
      enviado: 'blue',
      en_revision: 'orange',
      revisado: 'cyan',
      aprobado: 'green',
      rechazado: 'red'
    };
    return colores[estado] || 'grey';
  }

  /**
   * Obtener color según prioridad de comentario
   */
  obtenerColorPrioridad(prioridad: string): string {
    const colores: Record<string, string> = {
      baja: 'green',
      media: 'orange',
      alta: 'red'
    };
    return colores[prioridad] || 'grey';
  }

  /**
   * Formatear tamaño de archivo
   */
  formatearTamano(tamanoKb: number): string {
    if (tamanoKb < 1024) {
      return `${tamanoKb} KB`;
    }
    const tamanoMb = tamanoKb / 1024;
    return `${tamanoMb.toFixed(2)} MB`;
  }
}
