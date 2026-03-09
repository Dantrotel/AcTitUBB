import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
   private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  constructor(private http: HttpClient, private router: Router) {}

  // ===== MÉTODOS DE AUTENTICACIÓN =====
  
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || localStorage.getItem('token');
    if (!tokenToCheck) return true;
    
    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true;
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token ? !this.isTokenExpired(token) : false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }

  checkTokenAndRedirect(): boolean {
    if (!this.isAuthenticated()) {
      this.logout();
      return false;
    }
    return true;
  }

  // ===== MÉTODOS PARA EL CALENDARIO =====

  // Obtener fechas del calendario según el rol del usuario
  getMisFechasCalendario() {
    // Obtener rol del usuario desde el token
    const token = localStorage.getItem('token');
    let rol = '';
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        rol = payload.rol;
      } catch (error) {
        console.error('Error al decodificar token:', error);
      }
    }

    // Estudiantes: usar endpoint específico que incluye fechas globales + específicas del profesor
    if (rol === 'estudiante') {
      return this.http.get(`${this.baseUrl}/calendario/estudiante/mis-fechas`, {
        headers: this.getHeaders()
      });
    }
    
    // Profesores: usar endpoint que devuelve fechas globales + las que creó el profesor
    if (rol === 'profesor') {
      return this.http.get(`${this.baseUrl}/calendario/profesor/mis-fechas`, {
        headers: this.getHeaders()
      });
    }
    
    // Admin y otros: fechas globales
    return this.http.get(`${this.baseUrl}/calendario/globales`, {
      headers: this.getHeaders()
    });
  }

  // Obtener fechas próximas (para todos los roles)
  getFechasProximas(limite?: number) {
    const url = limite ? 
      `${this.baseUrl}/calendario/proximas?limite=${limite}` : 
      `${this.baseUrl}/calendario/proximas`;
    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }

  // Admin: crear fecha global
  crearFechaGlobal(data: any) {
    return this.http.post(`${this.baseUrl}/calendario/admin/global`, data, {
      headers: this.getHeaders()
    });
  }

  // Admin: obtener fechas globales
  getFechasGlobales() {
    return this.http.get(`${this.baseUrl}/calendario/admin/globales`, {
      headers: this.getHeaders()
    });
  }

  // Admin: obtener estadísticas de fechas
  getEstadisticasFechas() {
    return this.http.get(`${this.baseUrl}/calendario/admin/estadisticas`, {
      headers: this.getHeaders()
    });
  }

  // Profesor: crear fecha específica para estudiante
  crearFechaEspecifica(data: any) {
    return this.http.post(`${this.baseUrl}/calendario/profesor/especifica`, data, {
      headers: this.getHeaders()
    });
  }

  // Profesor: obtener sus fechas creadas
  getMisFechasProfesor() {
    return this.http.get(`${this.baseUrl}/calendario/profesor/mis-fechas`, {
      headers: this.getHeaders()
    });
  }

  // General: obtener fecha por ID
  getFechaPorId(id: string) {
    return this.http.get(`${this.baseUrl}/calendario/${id}`, {
      headers: this.getHeaders()
    });
  }

  // General: actualizar fecha
  actualizarFecha(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/calendario/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  // General: eliminar fecha
  eliminarFecha(id: string) {
    return this.http.delete(`${this.baseUrl}/calendario/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ===== MÉTODOS PARA FECHAS IMPORTANTES =====

  // Obtener fechas importantes de un proyecto (funciona para profesor y estudiante)
  getFechasImportantesProyecto(proyectoId: string) {
    // Usar la ruta general de proyectos que funciona con verificación de permisos
    return this.http.get(`${this.baseUrl}/projects/${proyectoId}/fechas-importantes`, {
      headers: this.getHeaders()
    });
  }

  // Profesor: obtener fechas importantes de proyectos asignados
  getFechasImportantesTodosProyectos() {
    return this.http.get(`${this.baseUrl}/calendario/profesor/mis-fechas`, {
      headers: this.getHeaders()
    });
  }

  login(data: any) {
    return this.http.post(`${this.baseUrl}/users/login`, data);
  }

  register(data:any){
    return this.http.post(`${this.baseUrl}/users/register`, data);
  }

  // Refresh token para renovar access token automáticamente
  refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.http.post(`${this.baseUrl}/users/refresh-token`, { refreshToken });
  }

  // ===== RESET DE CONTRASEÑA =====

  // Solicitar reset de contraseña (público, no requiere autenticación)
  forgotPassword(email: string): Promise<any> {
    return this.http.post(`${this.baseUrl}/users/forgot-password`, { email }).toPromise();
  }

  // Cambiar contraseña obligatoria después de reset
  cambiarPasswordObligatorio(password_nueva: string): Promise<any> {
    return this.http.put(`${this.baseUrl}/users/cambiar-password-obligatorio`, 
      { password_nueva }, 
      { headers: this.getHeaders() }
    ).toPromise();
  }

  // ===== CARGA ADMINISTRATIVA =====
  
  // Obtener carga administrativa de todos los profesores (accesible para todos)
  obtenerCargaProfesores(): Promise<any> {
    return this.http.get(`${this.baseUrl}/carga-profesores`, {
      headers: this.getHeaders()
    }).toPromise();
  }

  // ===== DASHBOARDS =====
  
  // Dashboard Estudiante
  getDashboardEstudiante(): Promise<any> {
    return this.http.get(`${this.baseUrl}/dashboard/estudiante`, {
      headers: this.getHeaders()
    }).toPromise();
  }

  // Dashboard Profesor
  getDashboardProfesor(): Promise<any> {
    return this.http.get(`${this.baseUrl}/dashboard/profesor`, {
      headers: this.getHeaders()
    }).toPromise();
  }

  // Dashboard Admin
  getDashboardAdmin(): Promise<any> {
    return this.http.get(`${this.baseUrl}/dashboard/admin`, {
      headers: this.getHeaders()
    }).toPromise();
  }

  // ===== MONITOREO REGULATORIO =====
  
  // Obtener proyectos en riesgo de abandono
  getProyectosRiesgo(): Promise<any> {
    return this.http.get(`${this.baseUrl}/dashboard/proyectos-riesgo`, {
      headers: this.getHeaders()
    }).toPromise();
  }

  // Obtener entregas pendientes de Informante
  getInformantesPendientes(): Promise<any> {
    return this.http.get(`${this.baseUrl}/dashboard/informantes-pendientes`, {
      headers: this.getHeaders()
    }).toPromise();
  }

  // Obtener alertas de abandono activas
  getAlertasAbandono(proyectoId?: number): Promise<any> {
    const url = proyectoId 
      ? `${this.baseUrl}/dashboard/alertas-abandono?proyecto_id=${proyectoId}`
      : `${this.baseUrl}/dashboard/alertas-abandono`;
    return this.http.get(url, {
      headers: this.getHeaders()
    }).toPromise();
  }

  // Marcar alerta como atendida
  marcarAlertaAtendida(alertaId: number, observaciones?: string): Promise<any> {
    return this.http.patch(`${this.baseUrl}/dashboard/alertas-abandono/${alertaId}/atender`, 
      { observaciones },
      { headers: this.getHeaders() }
    ).toPromise();
  }

  // Obtener configuración de umbrales
  getConfiguracionAbandono(): Promise<any> {
    return this.http.get(`${this.baseUrl}/dashboard/configuracion-abandono`, {
      headers: this.getHeaders()
    }).toPromise();
  }

  getPropuestas() {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/propuestas/`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  // Nuevo método: obtener solo las propuestas del estudiante autenticado
  getMisPropuestas() {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/propuestas/estudiante/mis-propuestas`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  getPropuestaById(id: string) {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/propuestas/get/${id}`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

 createPropuesta(data: FormData) {
  const token = localStorage.getItem('token');
  return this.http.post(`${this.baseUrl}/propuestas/`, data, {
    headers: new HttpHeaders({
      Authorization: `Bearer ${token}`
    })
  });
}

  updatePropuesta(id: string, data: any) {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.baseUrl}/propuestas/${id}`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    });
  }

  updatePropuestaWithFile(id: string, formData: FormData) {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.baseUrl}/propuestas/${id}`, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
        // No incluir Content-Type para que el navegador establezca el boundary automáticamente
      })
    });
  }

  revisarPropuesta(id: string, data: { comentarios_profesor: string, estado: string }) {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.baseUrl}/propuestas/${id}/revisar`, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  revisarPropuestaConArchivo(id: string, formData: FormData) {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.baseUrl}/propuestas/${id}/revisar`, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  subirCorreccion(id: number, formData: FormData) {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.baseUrl}/propuestas/${id}/subir-correccion`, formData, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  asignarPropuesta(id: string, data: any) {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.baseUrl}/propuestas/${id}/asignar-profesor`, data, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  deletePropuesta(id: string) {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.baseUrl}/propuestas/${id}`, {
       headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  // ========== PROYECTOS ==========

  getProyectos() {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/projects/`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  deleteProyecto(id: string) {
    const token = localStorage.getItem('token');
    return this.http.delete(`${this.baseUrl}/projects/${id}`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  descargarArchivo(nombreArchivo: string) {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}/descargar/${nombreArchivo}`;
    return this.http.get(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      }),
      responseType: 'blob' // Muy importante para descargar archivos binarios
    });
  }

  descargarArchivoVersionado(archivoId: number) {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}/propuestas/archivos/${archivoId}/download`;
    return this.http.get(url, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      }),
      responseType: 'blob'
    });
  }

  buscaruserByrut(rut:string){
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/users/${rut}`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  getPropuestasAsignadasProfesor(profesor_rut: string) {
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/propuestas/profesor/${profesor_rut}`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  getBaseUrl(): string {
    // URL base usando el proxy de Nginx
    return '/api/v1';
  }

  // ===== MÉTODOS DE ADMINISTRACIÓN =====

  // Gestión de usuarios
  getUsuarios() {
    return this.http.get(`${this.baseUrl}/admin/usuarios`, {
      headers: this.getHeaders()
    });
  }

  getRoles() {
    return this.http.get(`${this.baseUrl}/admin/roles`, {
      headers: this.getHeaders()
    });
  }

  getDetalleUsuario(rut: string) {
    return this.http.get(`${this.baseUrl}/admin/usuarios/${rut}`, {
      headers: this.getHeaders()
    });
  }

  crearUsuario(data: any) {
    return this.http.post(`${this.baseUrl}/admin/usuarios`, data, {
      headers: this.getHeaders()
    });
  }

  actualizarUsuario(rut: string, data: any) {
    return this.http.put(`${this.baseUrl}/admin/usuarios/${rut}`, data, {
      headers: this.getHeaders()
    });
  }

  cambiarEstadoUsuario(rut: string, confirmado: boolean) {
    return this.http.put(`${this.baseUrl}/admin/usuarios/${rut}/estado`, { confirmado }, {
      headers: this.getHeaders()
    });
  }

  cambiarRolUsuario(rut: string, rol_id: number) {
    return this.http.put(`${this.baseUrl}/admin/usuarios/${rut}/rol`, { rol_id }, {
      headers: this.getHeaders()
    });
  }

  resetearPasswordUsuario(rut: string, nueva_password: string) {
    return this.http.post(`${this.baseUrl}/admin/usuarios/${rut}/reset-password`, { nueva_password }, {
      headers: this.getHeaders()
    });
  }

  // Método específico para actualizar el perfil propio del usuario autenticado
  actualizarPerfil(data: any) {
    return this.http.put(`${this.baseUrl}/users/perfil`, data, {
      headers: this.getHeaders()
    });
  }

  cambiarPasswordPropia(password_actual: string, password_nueva: string) {
    return this.http.put(`${this.baseUrl}/users/cambiar-password`, 
      { password_actual, password_nueva },
      { headers: this.getHeaders() }
    );
  }

  eliminarUsuario(rut: string) {
    return this.http.delete(`${this.baseUrl}/admin/usuarios/${rut}`, {
      headers: this.getHeaders()
    });
  }

  // Gestión de profesores (ahora a través de usuarios)
  getProfesores() {
    // Obtener todos los usuarios y filtrar profesores y admins (que también pueden ser profesores)
    // No usamos rol_filter porque necesitamos tanto rol 2 (profesor) como rol 3 (admin/profesor)
    const token = localStorage.getItem('token');
    return this.http.get(`${this.baseUrl}/admin/usuarios`, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
  }

  // Gestión de asignaciones
  getAsignaciones() {
    return this.http.get(`${this.baseUrl}/admin/asignaciones`, {
      headers: this.getHeaders()
    });
  }

  crearAsignacion(data: { propuesta_id: number, profesor_rut: string }) {
    return this.http.post(`${this.baseUrl}/admin/asignaciones`, data, {
      headers: this.getHeaders()
    });
  }

  eliminarAsignacion(id: number) {
    return this.http.delete(`${this.baseUrl}/admin/asignaciones/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Estadísticas
  getEstadisticas() {
    return this.http.get(`${this.baseUrl}/admin/estadisticas`, {
      headers: this.getHeaders()
    });
  }

  // ===== MÉTODOS DE PROYECTOS =====

  // Obtener todos los proyectos (admin)
  getAllProyectos() {
    return this.http.get(`${this.baseUrl}/projects`, {
      headers: this.getHeaders()
    });
  }

  // Obtener proyectos asignados al profesor autenticado
  getProyectosAsignados() {
    return this.http.get(`${this.baseUrl}/projects/profesor/proyectos-asignados`, {
      headers: this.getHeaders()
    });
  }

  // Obtener proyectos del estudiante autenticado
  getMisProyectos() {
    return this.http.get(`${this.baseUrl}/projects/estudiante/mis-proyectos`, {
      headers: this.getHeaders()
    });
  }

  // Obtener dashboard de proyecto específico
  getDashboardProyecto(id: string) {
    return this.http.get(`${this.baseUrl}/projects/${id}/dashboard`, {
      headers: this.getHeaders()
    });
  }

  // ===== SISTEMA UNIFICADO DE CRONOGRAMAS Y HITOS ✅ =====
  // Ver documentación: backend/SISTEMA_HITOS_UNIFICADO.md

  // Gestión de Cronogramas
  getCronogramaProyecto(proyectoId: string) {
    return this.http.get(`${this.baseUrl}/projects/${proyectoId}/cronograma`, {
      headers: this.getHeaders()
    });
  }

  crearCronograma(proyectoId: string, data: any) {
    return this.http.post(`${this.baseUrl}/projects/${proyectoId}/cronograma`, data, {
      headers: this.getHeaders()
    });
  }

  aprobarCronograma(cronogramaId: string) {
    return this.http.patch(`${this.baseUrl}/projects/cronogramas/${cronogramaId}/aprobar`, {}, {
      headers: this.getHeaders()
    });
  }

  // Gestión de Hitos del Cronograma
  getHitosCronograma(cronogramaId: string) {
    return this.http.get(`${this.baseUrl}/projects/cronogramas/${cronogramaId}/hitos`, {
      headers: this.getHeaders()
    });
  }

  crearHitoCronograma(cronogramaId: string, data: any) {
    // Mapear campos para compatibilidad
    const hitoData = {
      nombre_hito: data.nombre_hito || data.nombre,
      descripcion: data.descripcion,
      tipo_hito: data.tipo_hito || this.mapearTipoHito(data.tipo || 'entregable'),
      fecha_limite: data.fecha_limite,
      peso_en_proyecto: data.peso_en_proyecto || data.peso_porcentual || 0,
      es_critico: data.es_critico || false,
      hito_predecesor_id: data.hito_predecesor_id || null
    };

    return this.http.post(`${this.baseUrl}/projects/cronogramas/${cronogramaId}/hitos`, hitoData, {
      headers: this.getHeaders()
    });
  }

  // Entregas y Revisiones de Hitos
  entregarHito(hitoId: string, archivo: File, comentarios: string) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('comentarios_estudiante', comentarios);

    // Headers sin Content-Type para FormData
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post(`${this.baseUrl}/projects/hitos/${hitoId}/entregar`, formData, {
      headers: headers
    });
  }

  revisarHito(hitoId: string, revision: any) {
    const revisionData = {
      comentarios_profesor: revision.retroalimentacion || revision.comentarios_profesor,
      estado: revision.estado === 'aprobado' ? 'aprobado' : 'requiere_correcciones'
    };

    return this.http.patch(`${this.baseUrl}/projects/hitos/${hitoId}/revisar`, revisionData, {
      headers: this.getHeaders()
    });
  }

  revisarHitoCompleto(hitoId: string, datos: { comentarios_profesor: string; estado: string } | FormData) {
    const token = localStorage.getItem('token');
    if (datos instanceof FormData) {
      return this.http.patch(`${this.baseUrl}/projects/hitos/${hitoId}/revisar`, datos, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    return this.http.patch(`${this.baseUrl}/projects/hitos/${hitoId}/revisar`, datos, {
      headers: this.getHeaders()
    });
  }

  // Estadísticas de Cumplimiento
  getEstadisticasCumplimiento(proyectoId: string) {
    return this.http.get(`${this.baseUrl}/projects/${proyectoId}/estadisticas`, {
      headers: this.getHeaders()
    });
  }

  // Notificaciones
  getNotificaciones() {
    return this.http.get(`${this.baseUrl}/projects/notificaciones`, {
      headers: this.getHeaders()
    });
  }

  marcarNotificacionLeida(notificacionId: string) {
    return this.http.patch(`${this.baseUrl}/projects/notificaciones/${notificacionId}/leer`, {}, {
      headers: this.getHeaders()
    });
  }

  // Configuración de Alertas
  configurarAlertas(proyectoId: string, alertas: any) {
    return this.http.post(`${this.baseUrl}/projects/${proyectoId}/alertas`, alertas, {
      headers: this.getHeaders()
    });
  }

  // ⚠️ MÉTODOS DEPRECATED (Sistema Antiguo - Usar cronogramas) ⚠️
  /** @deprecated Usar getCronogramaProyecto() y getHitosCronograma() en su lugar */
  getHitosProyecto(id: string) {
    console.warn('⚠️ getHitosProyecto() está DEPRECATED. Usar getCronogramaProyecto() + getHitosCronograma()');
    return this.http.get(`${this.baseUrl}/projects/${id}/hitos`, {
      headers: this.getHeaders()
    });
  }

  /** @deprecated Usar crearHitoCronograma() en su lugar */
  crearHitoProyecto(id: string, data: any) {
    console.warn('⚠️ crearHitoProyecto() está DEPRECATED. Usar crearHitoCronograma()');
    return this.http.post(`${this.baseUrl}/projects/${id}/hitos`, data, {
      headers: this.getHeaders()
    });
  }

  /** @deprecated Sistema unificado maneja esto automáticamente */
  actualizarHitoProyecto(id: string, hitoId: string, data: any) {
    console.warn('⚠️ actualizarHitoProyecto() está DEPRECATED');
    return this.http.put(`${this.baseUrl}/projects/${id}/hitos/${hitoId}`, data, {
      headers: this.getHeaders()
    });
  }

  /** @deprecated Usar entregarHito() en su lugar */
  completarHito(id: string, hitoId: string) {
    console.warn('⚠️ completarHito() está DEPRECATED. Usar entregarHito()');
    return this.http.patch(`${this.baseUrl}/projects/${id}/hitos/${hitoId}/completar`, {}, {
      headers: this.getHeaders()
    });
  }

  /** @deprecated Los hitos se obtienen del cronograma */
  getDetalleHito(proyectoId: string, hitoId: string) {
    console.warn('⚠️ getDetalleHito() está DEPRECATED');
    return this.http.get(`${this.baseUrl}/projects/${proyectoId}/hitos/${hitoId}`, {
      headers: this.getHeaders()
    });
  }

  // ===== FUNCIONES HELPER =====
  
  private mapearTipoHito(tipoLegacy: string): string {
    const mapa: { [key: string]: string } = {
      'entregable': 'entrega_documento',
      'revision': 'revision_avance',
      'presentacion': 'defensa',
      'documento': 'entrega_documento',
      'codigo': 'entrega_documento',
      'reunion': 'reunion_seguimiento'
    };
    return mapa[tipoLegacy] || 'entrega_documento';
  }

  /**
   * Normaliza hito del backend para compatibilidad con componentes
   */
  normalizarHito(hito: any): any {
    return {
      ...hito,
      nombre: hito.nombre_hito || hito.nombre,
      peso_porcentual: hito.peso_en_proyecto || hito.peso_porcentual || 0,
      prioridad: this.calcularPrioridad(hito),
      obligatorio: true,
      acepta_entregas: true,
      fecha_inicio: hito.created_at
    };
  }

  private calcularPrioridad(hito: any): string {
    if (hito.es_critico) return 'critica';
    
    const diasRestantes = Math.ceil(
      (new Date(hito.fecha_limite).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (diasRestantes < 0) return 'critica';
    if (diasRestantes <= 3) return 'alta';
    if (diasRestantes <= 7) return 'media';
    return 'baja';
  }



  // ===== MÉTODOS ESPECÍFICOS PARA PROFESORES =====
  
  // Obtener proyectos asignados al profesor (como guía o co-guía)
  getProyectosProfesor() {
    return this.http.get(`${this.baseUrl}/profesor/proyectos`, {
      headers: this.getHeaders()
    });
  }

  // Gestión de fechas importantes para profesores
  crearFechaImportante(proyectoId: string, fechaData: any) {
    return this.http.post(`${this.baseUrl}/profesor/proyectos/${proyectoId}/fechas-importantes`, fechaData, {
      headers: this.getHeaders()
    });
  }

  actualizarFechaImportante(proyectoId: string, fechaId: string, fechaData: any) {
    return this.http.put(`${this.baseUrl}/profesor/proyectos/${proyectoId}/fechas-importantes/${fechaId}`, fechaData, {
      headers: this.getHeaders()
    });
  }

  eliminarFechaImportante(proyectoId: string, fechaId: string) {
    return this.http.delete(`${this.baseUrl}/profesor/proyectos/${proyectoId}/fechas-importantes/${fechaId}`, {
      headers: this.getHeaders()
    });
  }

  marcarFechaCompletada(proyectoId: string, fechaId: string, completada: boolean) {
    return this.http.patch(`${this.baseUrl}/profesor/proyectos/${proyectoId}/fechas-importantes/${fechaId}/completar`, 
      { completada }, {
      headers: this.getHeaders()
    });
  }

  // ===== MÉTODOS DE ROLES DE PROFESORES =====

  // Obtener roles de profesores disponibles
  getRolesProfesores() {
    console.log('🌐 Llamando a:', `${this.baseUrl}/admin/roles-profesores`);
    return this.http.get(`${this.baseUrl}/admin/roles-profesores`, {
      headers: this.getHeaders()
    });
  }

  // Desasignar profesor de proyecto (versión simplificada)
  desasignarProfesorDeProyecto(proyectoId: string, profesorRut: string) {
    return this.http.delete(`${this.baseUrl}/asignaciones-profesores/${proyectoId}/${profesorRut}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener asignaciones de un proyecto
  getAsignacionesProyecto(proyectoId: string) {
    return this.http.get(`${this.baseUrl}/asignaciones-profesores/proyecto/${proyectoId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener estadísticas de asignaciones
  getEstadisticasAsignaciones() {
    return this.http.get(`${this.baseUrl}/roles/asignaciones/estadisticas`, {
      headers: this.getHeaders()
    });
  }

  // Obtener historial de asignaciones
  getHistorialAsignaciones(proyectoId?: string, profesorRut?: string, limite?: number) {
    let params = new URLSearchParams();
    if (proyectoId) params.append('proyecto_id', proyectoId);
    if (profesorRut) params.append('profesor_rut', profesorRut);
    if (limite) params.append('limite', limite.toString());

    const queryString = params.toString();
    const url = queryString ? 
      `${this.baseUrl}/roles/asignaciones/historial?${queryString}` : 
      `${this.baseUrl}/roles/asignaciones/historial`;

    return this.http.get(url, {
      headers: this.getHeaders()
    });
  }

  // ===== MÉTODOS MEJORADOS PARA ASIGNACIONES-PROFESORES =====

  // Crear asignación múltiple (nuevo)
  crearAsignacionesMultiples(data: any) {
    return this.http.post(`${this.baseUrl}/asignaciones-profesores/multiples`, data, {
      headers: this.getHeaders()
    });
  }

  // Actualizar asignación profesor-proyecto
  actualizarAsignacionProfesorProyecto(proyectoId: string, rolProfesorId: string, data: any) {
    return this.http.put(`${this.baseUrl}/asignaciones-profesores/proyecto/${proyectoId}/rol/${rolProfesorId}`, data, {
      headers: this.getHeaders()
    });
  }

  // Eliminar asignación específica por proyecto y rol
  eliminarAsignacionProyectoRol(proyectoId: string, rolProfesorId: string) {
    return this.http.delete(`${this.baseUrl}/asignaciones-profesores/proyecto/${proyectoId}/rol/${rolProfesorId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener profesores disponibles por rol
  getProfesoresDisponiblesPorRol(rolProfesorId: string) {
    return this.http.get(`${this.baseUrl}/asignaciones-profesores/disponibles/${rolProfesorId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener asignación específica por ID
  getAsignacionProfesorPorId(asignacionId: string) {
    return this.http.get(`${this.baseUrl}/asignaciones-profesores/${asignacionId}`, {
      headers: this.getHeaders()
    });
  }

  // Asignar profesor a proyecto (versión simplificada)
  asignarProfesorAProyecto(data: any) {
    return this.http.post(`${this.baseUrl}/asignaciones-profesores`, data, {
      headers: this.getHeaders()
    });
  }

  // Obtener profesores asignados a un proyecto específico
  getProfesoresProyecto(proyectoId: string) {
    return this.http.get(`${this.baseUrl}/asignaciones-profesores/proyecto/${proyectoId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener proyectos asignados a un profesor (versión simplificada)
  getProyectosAsignadosProfesor(profesorRut: string) {
    return this.http.get(`${this.baseUrl}/asignaciones-profesores/profesor/${profesorRut}`, {
      headers: this.getHeaders()
    });
  }

  // Crear nueva asignación profesor-proyecto
  crearAsignacionProfesorProyecto(data: any) {
    return this.http.post(`${this.baseUrl}/asignaciones-profesores`, data, {
      headers: this.getHeaders()
    });
  }

  // Eliminar asignación profesor-proyecto
  eliminarAsignacionProfesorProyecto(asignacionId: string) {
    return this.http.delete(`${this.baseUrl}/asignaciones-profesores/${asignacionId}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener todas las asignaciones de profesores (admin)
  getAllAsignacionesProfesores() {
    return this.http.get(`${this.baseUrl}/asignaciones-profesores/admin/todas`, {
      headers: this.getHeaders()
    });
  }

  // Obtener estadísticas de asignaciones profesores
  getEstadisticasAsignacionesProfesores() {
    return this.http.get(`${this.baseUrl}/asignaciones-profesores/admin/estadisticas`, {
      headers: this.getHeaders()
    });
  }

  // ===== SEMESTRES ACADÉMICOS =====

  getSemestreActivo() {
    return this.http.get(`${this.baseUrl}/semestres/activo`, { headers: this.getHeaders() });
  }

  getSemestres() {
    return this.http.get(`${this.baseUrl}/semestres`, { headers: this.getHeaders() });
  }

  crearSemestre(data: any) {
    return this.http.post(`${this.baseUrl}/semestres`, data, { headers: this.getHeaders() });
  }

  actualizarSemestre(id: number, data: any) {
    return this.http.put(`${this.baseUrl}/semestres/${id}`, data, { headers: this.getHeaders() });
  }

  activarSemestre(id: number) {
    return this.http.put(`${this.baseUrl}/semestres/${id}/activar`, {}, { headers: this.getHeaders() });
  }

  eliminarSemestre(id: number) {
    return this.http.delete(`${this.baseUrl}/semestres/${id}`, { headers: this.getHeaders() });
  }

  getHistorialSemestre(id: number) {
    return this.http.get(`${this.baseUrl}/semestres/${id}/historial`, { headers: this.getHeaders() });
  }

  getMisInscripciones() {
    return this.http.get(`${this.baseUrl}/semestres/mis-inscripciones`, { headers: this.getHeaders() });
  }

  actualizarResultadoProyecto(semestreId: number, proyectoId: number, resultado: string) {
    return this.http.put(`${this.baseUrl}/semestres/${semestreId}/resultado-proyecto`,
      { proyecto_id: proyectoId, resultado }, { headers: this.getHeaders() });
  }

  // ===== INSCRIPCIONES DE RAMO =====

  getInscripcionRamoActiva() {
    return this.http.get(`${this.baseUrl}/inscripciones-ramo/activa`, { headers: this.getHeaders() });
  }

  getInscripcionesRamoEstudiante(rut: string) {
    return this.http.get(`${this.baseUrl}/inscripciones-ramo/estudiante/${rut}`, { headers: this.getHeaders() });
  }

  getAllInscripcionesRamo() {
    return this.http.get(`${this.baseUrl}/inscripciones-ramo`, { headers: this.getHeaders() });
  }

  crearInscripcionRamo(tipo_ramo: 'AP' | 'PT', estudiante_rut?: string) {
    return this.http.post(`${this.baseUrl}/inscripciones-ramo`,
      { tipo_ramo, estudiante_rut }, { headers: this.getHeaders() });
  }

  actualizarInscripcionRamo(id: number, tipo_ramo: 'AP' | 'PT') {
    return this.http.put(`${this.baseUrl}/inscripciones-ramo/${id}`,
      { tipo_ramo }, { headers: this.getHeaders() });
  }

  generarInscripcionesSiguienteSemestre(semestre_origen_id: number, semestre_destino_id: number) {
    return this.http.post(
      `${this.baseUrl}/inscripciones-ramo/semestre/${semestre_origen_id}/generar-siguiente`,
      { semestre_destino_id }, { headers: this.getHeaders() });
  }

  // ===== GUÍAS PRE-ASIGNADOS A ESTUDIANTES =====

  // Estudiante: obtener su propio guía
  getMiGuia() {
    return this.http.get(`${this.baseUrl}/guias-estudiantes/mis-datos`, {
      headers: this.getHeaders()
    });
  }

  // Admin: obtener guía de un estudiante específico
  getGuiaEstudiante(estudianteRut: string) {
    return this.http.get(`${this.baseUrl}/guias-estudiantes/estudiante/${estudianteRut}`, {
      headers: this.getHeaders()
    });
  }

  // Admin: listar todas las asignaciones guía-estudiante
  getAllGuiasEstudiantes() {
    return this.http.get(`${this.baseUrl}/guias-estudiantes`, {
      headers: this.getHeaders()
    });
  }

  // Admin: asignar guía a un estudiante
  asignarGuiaEstudiante(data: { estudiante_rut: string; profesor_guia_rut: string; observaciones?: string }) {
    return this.http.post(`${this.baseUrl}/guias-estudiantes`, data, {
      headers: this.getHeaders()
    });
  }

  // Admin: desasignar guía de un estudiante
  desasignarGuiaEstudiante(estudianteRut: string) {
    return this.http.delete(`${this.baseUrl}/guias-estudiantes/estudiante/${estudianteRut}`, {
      headers: this.getHeaders()
    });
  }

  // ===== MÉTODOS ADICIONALES DEL SISTEMA =====

  // Obtener cronograma activo de un proyecto (alias)
  obtenerCronograma(projectId: string) {
    return this.getCronogramaProyecto(projectId);
  }

  // Obtener hitos de un cronograma (alias)
  obtenerHitosCronograma(cronogramaId: string) {
    return this.getHitosCronograma(cronogramaId);
  }

  // Obtener notificaciones del usuario
  obtenerNotificaciones(soloNoLeidas: boolean = false) {
    const params = soloNoLeidas ? '?solo_no_leidas=true' : '';
    return this.http.get(`${this.baseUrl}/projects/notificaciones${params}`, {
      headers: this.getHeaders()
    });
  }

  // Obtener estadísticas de cumplimiento (alias)
  obtenerEstadisticasCumplimiento(projectId: string) {
    return this.getEstadisticasCumplimiento(projectId);
  }

  // Actualizar hito existente
  actualizarHitoCronograma(cronogramaId: string, hitoId: string, hitoData: any) {
    return this.http.put(`${this.baseUrl}/projects/cronogramas/${cronogramaId}/hitos/${hitoId}`, hitoData, {
      headers: this.getHeaders()
    });
  }

  // Eliminar hito
  eliminarHitoCronograma(cronogramaId: string, hitoId: string) {
    return this.http.delete(`${this.baseUrl}/projects/cronogramas/${cronogramaId}/hitos/${hitoId}`, {
      headers: this.getHeaders()
    });
  }

  // ===== MÉTODOS PARA GESTIÓN COMPLETA DE ENTREGAS =====
  
  // Obtener todas las entregas de un hito
  obtenerEntregasHito(projectId: string, cronogramaId: string, hitoId: string) {
    return this.http.get(`${this.baseUrl}/projects/${projectId}/cronogramas/${cronogramaId}/hitos/${hitoId}/entregas`, {
      headers: this.getHeaders()
    });
  }

  // Crear nueva entrega para un hito
  crearEntregaHito(projectId: string, cronogramaId: string, hitoId: string, entregaData: FormData) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.post(`${this.baseUrl}/projects/${projectId}/cronogramas/${cronogramaId}/hitos/${hitoId}/entregas`, entregaData, {
      headers: headers
    });
  }

  // Actualizar entrega existente
  actualizarEntregaHito(projectId: string, cronogramaId: string, hitoId: string, entregaId: string, entregaData: FormData) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    return this.http.put(`${this.baseUrl}/projects/${projectId}/cronogramas/${cronogramaId}/hitos/${hitoId}/entregas/${entregaId}`, entregaData, {
      headers: headers
    });
  }

  // Eliminar entrega
  eliminarEntregaHito(projectId: string, cronogramaId: string, hitoId: string, entregaId: string) {
    return this.http.delete(`${this.baseUrl}/projects/${projectId}/cronogramas/${cronogramaId}/hitos/${hitoId}/entregas/${entregaId}`, {
      headers: this.getHeaders()
    });
  }

  // Descargar archivo de entrega
  descargarArchivoEntrega(nombreArchivo: string) {
    return this.http.get(`${this.baseUrl}/descargar/${nombreArchivo}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // ===== MÉTODOS DE CALENDARIO MATCHING =====
  
  // Disponibilidades
  createDisponibilidad(data: any) {
    return this.http.post(`${this.baseUrl}/calendario-matching/disponibilidades`, data, {
      headers: this.getHeaders()
    });
  }

  getDisponibilidades() {
    return this.http.get(`${this.baseUrl}/calendario-matching/disponibilidades`, {
      headers: this.getHeaders()
    });
  }

  updateDisponibilidad(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/calendario-matching/disponibilidades/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteDisponibilidad(id: string) {
    return this.http.delete(`${this.baseUrl}/calendario-matching/disponibilidades/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // SISTEMA DE RESERVAS (NUEVO)
  // ========================================

  // Estudiante: obtener profesores asignados a su proyecto
  getProfesoresAsignados() {
    return this.http.get(`${this.baseUrl}/sistema-reservas/profesores-asignados`, {
      headers: this.getHeaders()
    });
  }

  // Estudiante: ver horarios disponibles de un profesor
  getHorariosDisponibles(profesorRut: string, diasAdelante: number = 14) {
    return this.http.get(`${this.baseUrl}/sistema-reservas/horarios-disponibles/${profesorRut}?dias_adelante=${diasAdelante}`, {
      headers: this.getHeaders()
    });
  }

  // Estudiante: reservar un horario
  reservarHorario(data: {
    disponibilidad_id: number;
    proyecto_id: number;
    tipo_reunion: string;
    descripcion: string;
  }) {
    return this.http.post(`${this.baseUrl}/sistema-reservas/reservar`, data, {
      headers: this.getHeaders()
    });
  }

  // Estudiante: ver mis solicitudes
  getMisSolicitudes() {
    return this.http.get(`${this.baseUrl}/sistema-reservas/mis-solicitudes`, {
      headers: this.getHeaders()
    });
  }

  // Estudiante: cancelar una reserva pendiente
  cancelarReserva(solicitudId: number) {
    return this.http.delete(`${this.baseUrl}/sistema-reservas/cancelar-reserva/${solicitudId}`, {
      headers: this.getHeaders()
    });
  }

  // Profesor: crear disponibilidad
  crearDisponibilidad(data: {
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
    fecha_especifica?: string;
  }) {
    return this.http.post(`${this.baseUrl}/sistema-reservas/disponibilidades`, data, {
      headers: this.getHeaders()
    });
  }

  // Profesor: ver todas mis disponibilidades
  getMisDisponibilidades() {
    return this.http.get(`${this.baseUrl}/sistema-reservas/mis-disponibilidades`, {
      headers: this.getHeaders()
    });
  }

  // Profesor: actualizar disponibilidad
  actualizarDisponibilidad(id: number, data: any) {
    return this.http.put(`${this.baseUrl}/sistema-reservas/disponibilidades/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  // Profesor: eliminar disponibilidad
  eliminarDisponibilidad(id: number) {
    return this.http.delete(`${this.baseUrl}/sistema-reservas/disponibilidades/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Profesor: ver solicitudes pendientes
  getSolicitudesPendientes() {
    return this.http.get(`${this.baseUrl}/sistema-reservas/solicitudes-pendientes`, {
      headers: this.getHeaders()
    });
  }

  // Profesor: responder a una reserva
  responderReserva(solicitudId: number, data: {
    respuesta: 'aceptar' | 'rechazar';
    comentarios?: string;
  }) {
    return this.http.post(`${this.baseUrl}/sistema-reservas/responder-reserva/${solicitudId}`, data, {
      headers: this.getHeaders()
    });
  }

  // Ambos roles: obtener dashboard personalizado
  getDashboardReservas() {
    return this.http.get(`${this.baseUrl}/sistema-reservas/dashboard`, {
      headers: this.getHeaders()
    });
  }

  // ========================================
  // MÉTODOS ANTIGUOS (MANTENER POR COMPATIBILIDAD)
  // ========================================

  // Solicitudes de reunión (sistema antiguo)
  buscarReunion(data: any) {
    return this.http.post(`${this.baseUrl}/calendario-matching/buscar-reunion`, data, {
      headers: this.getHeaders()
    });
  }

  crearSolicitudReunion(data: any) {
    return this.http.post(`${this.baseUrl}/calendario-matching/solicitudes`, data, {
      headers: this.getHeaders()
    });
  }

  getSolicitudesReunion() {
    return this.http.get(`${this.baseUrl}/calendario-matching/solicitudes`, {
      headers: this.getHeaders()
    });
  }

  getProfesoresParaReunion() {
    return this.http.get(`${this.baseUrl}/calendario-matching/profesores`, {
      headers: this.getHeaders()
    });
  }

  responderSolicitudReunion(id: string, data: any) {
    return this.http.post(`${this.baseUrl}/calendario-matching/solicitudes/${id}/responder`, data, {
      headers: this.getHeaders()
    });
  }

  // Reuniones
  getReunionesProgramadas() {
    return this.http.get(`${this.baseUrl}/calendario-matching/reuniones`, {
      headers: this.getHeaders()
    });
  }

  confirmarReunion(id: string, data: any) {
    return this.http.post(`${this.baseUrl}/calendario-matching/reuniones/${id}/confirmar`, data, {
      headers: this.getHeaders()
    });
  }

  reprogramarReunion(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/calendario-matching/reuniones/${id}/reprogramar`, data, {
      headers: this.getHeaders()
    });
  }

  cancelarReunion(id: string, data: any) {
    return this.http.post(`${this.baseUrl}/calendario-matching/reuniones/${id}/cancelar`, data, {
      headers: this.getHeaders()
    });
  }

  marcarReunionRealizada(id: string, data: any) {
    return this.http.post(`${this.baseUrl}/calendario-matching/reuniones/${id}/marcar-realizada`, data, {
      headers: this.getHeaders()
    });
  }

  getHistorialReuniones() {
    return this.http.get(`${this.baseUrl}/calendario-matching/historial-reuniones`, {
      headers: this.getHeaders()
    });
  }

  // Dashboard
  getDashboardReuniones() {
    return this.http.get(`${this.baseUrl}/calendario-matching/dashboard`, {
      headers: this.getHeaders()
    });
  }

  // Bloqueos de horarios
  crearBloqueoHorario(data: any) {
    return this.http.post(`${this.baseUrl}/calendario-matching/bloqueos`, data, {
      headers: this.getHeaders()
    });
  }

  getBloqueos() {
    return this.http.get(`${this.baseUrl}/calendario-matching/bloqueos`, {
      headers: this.getHeaders()
    });
  }

  eliminarBloqueo(id: string) {
    return this.http.delete(`${this.baseUrl}/calendario-matching/bloqueos/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ===== MÉTODOS DE ESTRUCTURA ACADÉMICA =====

  // FACULTADES
  getFacultades(activas?: boolean, facultadId?: number) {
    let url = `${this.baseUrl}/estructura/facultades`;
    const params: string[] = [];
    if (activas !== undefined) params.push(`activas=${activas}`);
    if (facultadId) params.push(`facultad_id=${facultadId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getFacultadById(id: number) {
    return this.http.get(`${this.baseUrl}/estructura/facultades/${id}`, {
      headers: this.getHeaders()
    });
  }

  createFacultad(data: any) {
    return this.http.post(`${this.baseUrl}/estructura/facultades`, data, {
      headers: this.getHeaders()
    });
  }

  updateFacultad(id: number, data: any) {
    return this.http.put(`${this.baseUrl}/estructura/facultades/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteFacultad(id: number) {
    return this.http.delete(`${this.baseUrl}/estructura/facultades/${id}`, {
      headers: this.getHeaders()
    });
  }

  reactivarFacultad(id: number) {
    return this.http.put(`${this.baseUrl}/estructura/facultades/${id}/reactivar`, {}, {
      headers: this.getHeaders()
    });
  }

  deleteFacultadPermanente(id: number) {
    return this.http.delete(`${this.baseUrl}/estructura/facultades/${id}/permanente`, {
      headers: this.getHeaders()
    });
  }

  getEstadisticasFacultad(id: number) {
    return this.http.get(`${this.baseUrl}/estructura/facultades/${id}/estadisticas`, {
      headers: this.getHeaders()
    });
  }

  // DEPARTAMENTOS
  getDepartamentos(activos?: boolean, facultadId?: number) {
    let url = `${this.baseUrl}/estructura/departamentos`;
    const params: string[] = [];
    if (activos !== undefined) params.push(`activos=${activos}`);
    if (facultadId) params.push(`facultad_id=${facultadId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Método público para obtener departamentos sin autenticación (para registro)
  getDepartamentosPublicos() {
    return this.http.get(`${this.baseUrl}/estructura/departamentos/public`);
  }

  getDepartamentoById(id: number) {
    return this.http.get(`${this.baseUrl}/estructura/departamentos/${id}`, {
      headers: this.getHeaders()
    });
  }

  createDepartamento(data: any) {
    return this.http.post(`${this.baseUrl}/estructura/departamentos`, data, {
      headers: this.getHeaders()
    });
  }

  updateDepartamento(id: number, data: any) {
    return this.http.put(`${this.baseUrl}/estructura/departamentos/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteDepartamento(id: number) {
    return this.http.delete(`${this.baseUrl}/estructura/departamentos/${id}`, {
      headers: this.getHeaders()
    });
  }

  reactivarDepartamento(id: number) {
    return this.http.put(`${this.baseUrl}/estructura/departamentos/${id}/reactivar`, {}, {
      headers: this.getHeaders()
    });
  }

  deleteDepartamentoPermanente(id: number) {
    return this.http.delete(`${this.baseUrl}/estructura/departamentos/${id}/permanente`, {
      headers: this.getHeaders()
    });
  }

  asignarProfesorDepartamento(departamentoId: number, data: { profesor_rut: string, es_principal?: boolean }) {
    return this.http.post(`${this.baseUrl}/estructura/departamentos/${departamentoId}/profesores`, data, {
      headers: this.getHeaders()
    });
  }

  removerProfesorDepartamento(departamentoId: number, profesorRut: string) {
    return this.http.delete(`${this.baseUrl}/estructura/departamentos/${departamentoId}/profesores/${profesorRut}`, {
      headers: this.getHeaders()
    });
  }

  getProfesoresDepartamento(departamentoId: number, soloActivos?: boolean) {
    let url = `${this.baseUrl}/estructura/departamentos/${departamentoId}/profesores`;
    if (soloActivos !== undefined) url += `?activos=${soloActivos}`;
    
    return this.http.get(url, { headers: this.getHeaders() });
  }

  asignarJefeDepartamento(departamentoId: number, profesorRut: string) {
    return this.http.put(`${this.baseUrl}/estructura/departamentos/${departamentoId}/jefe`, { profesor_rut: profesorRut }, {
      headers: this.getHeaders()
    });
  }

  // CARRERAS
  getCarreras(activas?: boolean, facultadId?: number) {
    let url = `${this.baseUrl}/estructura/carreras`;
    const params: string[] = [];
    if (activas !== undefined) params.push(`activas=${activas}`);
    if (facultadId) params.push(`facultad_id=${facultadId}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // Método público para obtener carreras sin autenticación (para registro)
  getCarrerasPublicas() {
    return this.http.get(`${this.baseUrl}/estructura/carreras/public`);
  }

  getCarreraById(id: number) {
    return this.http.get(`${this.baseUrl}/estructura/carreras/${id}`, {
      headers: this.getHeaders()
    });
  }

  createCarrera(data: any) {
    return this.http.post(`${this.baseUrl}/estructura/carreras`, data, {
      headers: this.getHeaders()
    });
  }

  updateCarrera(id: number, data: any) {
    return this.http.put(`${this.baseUrl}/estructura/carreras/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  deleteCarrera(id: number) {
    return this.http.delete(`${this.baseUrl}/estructura/carreras/${id}`, {
      headers: this.getHeaders()
    });
  }

  reactivarCarrera(id: number) {
    return this.http.put(`${this.baseUrl}/estructura/carreras/${id}/reactivar`, {}, {
      headers: this.getHeaders()
    });
  }

  deleteCarreraPermanente(id: number) {
    return this.http.delete(`${this.baseUrl}/estructura/carreras/${id}/permanente`, {
      headers: this.getHeaders()
    });
  }

  removerEstudianteCarrera(carreraId: number, estudianteRut: string) {
    return this.http.delete(`${this.baseUrl}/estructura/carreras/${carreraId}/estudiantes/${estudianteRut}`, {
      headers: this.getHeaders()
    });
  }

  asignarJefeCarrera(carreraId: number, profesorRut: string) {
    return this.http.post(`${this.baseUrl}/estructura/carreras/${carreraId}/jefe`, { profesor_rut: profesorRut }, {
      headers: this.getHeaders()
    });
  }

  removerJefeCarrera(carreraId: number) {
    return this.http.delete(`${this.baseUrl}/estructura/carreras/${carreraId}/jefe`, {
      headers: this.getHeaders()
    });
  }

  asignarEstudianteCarrera(carreraId: number, data: any) {
    return this.http.post(`${this.baseUrl}/estructura/carreras/${carreraId}/estudiantes`, data, {
      headers: this.getHeaders()
    });
  }

  getEstudiantesCarrera(carreraId: number, estado?: string) {
    let url = `${this.baseUrl}/estructura/carreras/${carreraId}/estudiantes`;
    if (estado) url += `?estado=${estado}`;
    
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getPropuestasPendientesCarrera(carreraId: number) {
    return this.http.get(`${this.baseUrl}/estructura/carreras/${carreraId}/propuestas-pendientes`, {
      headers: this.getHeaders()
    });
  }

  getEstadisticasCarrera(carreraId: number) {
    return this.http.get(`${this.baseUrl}/estructura/carreras/${carreraId}/estadisticas`, {
      headers: this.getHeaders()
    });
  }

  // ===== GESTIÓN DE DEPARTAMENTOS Y CARRERAS =====
  
  obtenerDepartamentos() {
    return this.http.get(`${this.baseUrl}/admin/departamentos`, {
      headers: this.getHeaders()
    });
  }

  obtenerCarreras() {
    return this.http.get(`${this.baseUrl}/admin/carreras`, {
      headers: this.getHeaders()
    });
  }

  obtenerDepartamentosDeCarrera(carreraId: number) {
    return this.http.get(`${this.baseUrl}/admin/carreras/${carreraId}/departamentos`, {
      headers: this.getHeaders()
    });
  }

  obtenerCarrerasDeDepartamento(departamentoId: number) {
    return this.http.get(`${this.baseUrl}/admin/departamentos/${departamentoId}/carreras`, {
      headers: this.getHeaders()
    });
  }

  // ===== GESTIÓN DE RELACIONES DEPARTAMENTOS-CARRERAS =====
  
  obtenerRelacionesDepartamentosCarreras() {
    return this.http.get(`${this.baseUrl}/admin/departamentos-carreras`, {
      headers: this.getHeaders()
    });
  }

  crearRelacionDepartamentoCarrera(data: { departamento_id: number, carrera_id: number, es_principal: boolean }) {
    return this.http.post(`${this.baseUrl}/admin/departamentos-carreras`, data, {
      headers: this.getHeaders()
    });
  }

  actualizarRelacionDepartamentoCarrera(id: number, data: { es_principal?: boolean, activo?: boolean }) {
    return this.http.put(`${this.baseUrl}/admin/departamentos-carreras/${id}`, data, {
      headers: this.getHeaders()
    });
  }

  eliminarRelacionDepartamentoCarrera(id: number) {
    return this.http.delete(`${this.baseUrl}/admin/departamentos-carreras/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ===== GESTIÓN DE AVANCES POR PROYECTO =====
  
  getAvancesByProyecto(proyectoId: string) {
    return this.http.get(`${this.baseUrl}/proyectos/${proyectoId}/avances`, {
      headers: this.getHeaders()
    });
  }

  // Descargar documento de proyecto (autenticado)
  descargarDocumentoProyecto(documentoId: number) {
    return this.http.get(`${this.baseUrl}/documentos/${documentoId}/download`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // ===== MÉTODOS GENÉRICOS HTTP =====
  get(endpoint: string) {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  post(endpoint: string, data: any) {
    // Para FormData, no agregar Content-Type header
    if (data instanceof FormData) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return this.http.post(`${this.baseUrl}${endpoint}`, data, { headers });
    }
    return this.http.post(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  put(endpoint: string, data: any) {
    return this.http.put(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    });
  }

  delete(endpoint: string) {
    return this.http.delete(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders()
    });
  }

  // ==================== MÉTRICAS Y REPORTES DE PROFESOR ====================
  
  /**
   * Obtener métricas completas del profesor
   */
  getMetricasProfesor(periodo: string = 'mes') {
    return this.http.get<any>(`${this.baseUrl}/profesor/metricas?periodo=${periodo}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener propuestas revisadas por el profesor
   */
  getPropuestasRevisadas() {
    return this.http.get<any>(`${this.baseUrl}/profesor/propuestas-revisadas`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Obtener reuniones del profesor
   */
  getReunionesProfesor() {
    return this.http.get<any>(`${this.baseUrl}/profesor/reuniones`, {
      headers: this.getHeaders()
    });
  }
}
