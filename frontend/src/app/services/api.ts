import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api/v1';  // Usa el proxy de Nginx para conectar al backend
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

  // Obtener fechas globales (visibles para todos los roles)
  getMisFechasCalendario() {
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

  login(data: any) {
    return this.http.post(`${this.baseUrl}/users/login`, data);
  }

  register(data:any){
    return this.http.post(`${this.baseUrl}/users/register`, data);
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

  actualizarUsuario(rut: string, data: any) {
    return this.http.put(`${this.baseUrl}/admin/usuarios/${rut}`, data, {
      headers: this.getHeaders()
    });
  }

  // Método específico para actualizar el perfil propio del usuario autenticado
  actualizarPerfil(data: any) {
    return this.http.put(`${this.baseUrl}/users/perfil`, data, {
      headers: this.getHeaders()
    });
  }

  eliminarUsuario(rut: string) {
    return this.http.delete(`${this.baseUrl}/admin/usuarios/${rut}`, {
      headers: this.getHeaders()
    });
  }

  // Gestión de profesores
  getProfesores() {
    return this.http.get(`${this.baseUrl}/admin/profesores`, {
      headers: this.getHeaders()
    });
  }

  getPropuestasAsignadasAProfesor(rut: string) {
    return this.http.get(`${this.baseUrl}/admin/profesores/${rut}/propuestas`, {
      headers: this.getHeaders()
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

  // Obtener proyectos asignados al profesor autenticado
  getProyectosAsignados() {
    return this.http.get(`${this.baseUrl}/projects/asignados`, {
      headers: this.getHeaders()
    });
  }

  // Obtener dashboard de proyecto específico
  getDashboardProyecto(id: string) {
    return this.http.get(`${this.baseUrl}/projects/${id}/dashboard`, {
      headers: this.getHeaders()
    });
  }

  // Gestión de hitos
  getHitosProyecto(id: string) {
    return this.http.get(`${this.baseUrl}/projects/${id}/hitos`, {
      headers: this.getHeaders()
    });
  }

  crearHitoProyecto(id: string, data: any) {
    return this.http.post(`${this.baseUrl}/projects/${id}/hitos`, data, {
      headers: this.getHeaders()
    });
  }

  actualizarHitoProyecto(id: string, hitoId: string, data: any) {
    return this.http.put(`${this.baseUrl}/projects/${id}/hitos/${hitoId}`, data, {
      headers: this.getHeaders()
    });
  }

  completarHito(id: string, hitoId: string) {
    return this.http.put(`${this.baseUrl}/projects/${id}/hitos/${hitoId}/completar`, {}, {
      headers: this.getHeaders()
    });
  }

  // Gestión de evaluaciones
  getEvaluacionesProyecto(id: string) {
    return this.http.get(`${this.baseUrl}/projects/${id}/evaluaciones`, {
      headers: this.getHeaders()
    });
  }

  crearEvaluacionProyecto(id: string, data: any) {
    return this.http.post(`${this.baseUrl}/projects/${id}/evaluaciones`, data, {
      headers: this.getHeaders()
    });
  }

  // ===== MÉTODOS DE ROLES DE PROFESORES =====

  // Obtener roles de profesores disponibles
  getRolesProfesores() {
    return this.http.get(`${this.baseUrl}/roles/profesores`, {
      headers: this.getHeaders()
    });
  }

  // Asignar profesor a proyecto con rol específico
  asignarProfesorAProyecto(data: any) {
    return this.http.post(`${this.baseUrl}/roles/asignaciones`, data, {
      headers: this.getHeaders()
    });
  }

  // Desasignar profesor de proyecto
  desasignarProfesorDeProyecto(asignacionId: string, observaciones?: string) {
    return this.http.delete(`${this.baseUrl}/roles/asignaciones/${asignacionId}`, {
      headers: this.getHeaders(),
      body: { observaciones }
    });
  }

  // Obtener asignaciones de un proyecto
  getAsignacionesProyecto(proyectoId: string) {
    return this.http.get(`${this.baseUrl}/roles/asignaciones/proyecto/${proyectoId}`, {
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

  // ===== MÉTODOS PARA SISTEMA DE CRONOGRAMAS Y ENTREGAS =====

  // Crear cronograma para un proyecto
  crearCronograma(projectId: string, cronogramaData: any) {
    return this.http.post(`${this.baseUrl}/projects/${projectId}/cronograma`, cronogramaData, {
      headers: this.getHeaders()
    });
  }

  // Obtener cronograma activo de un proyecto
  obtenerCronograma(projectId: string) {
    return this.http.get(`${this.baseUrl}/projects/${projectId}/cronograma`, {
      headers: this.getHeaders()
    });
  }

  // Aprobar cronograma (desde perspectiva del estudiante)
  aprobarCronograma(cronogramaId: string) {
    return this.http.patch(`${this.baseUrl}/cronogramas/${cronogramaId}/aprobar`, {}, {
      headers: this.getHeaders()
    });
  }

  // Crear hito en cronograma
  crearHitoCronograma(cronogramaId: string, hitoData: any) {
    return this.http.post(`${this.baseUrl}/cronogramas/${cronogramaId}/hitos`, hitoData, {
      headers: this.getHeaders()
    });
  }

  // Obtener hitos de un cronograma
  obtenerHitosCronograma(cronogramaId: string) {
    return this.http.get(`${this.baseUrl}/cronogramas/${cronogramaId}/hitos`, {
      headers: this.getHeaders()
    });
  }

  // Entregar hito (subir archivo)
  entregarHito(hitoId: string, formData: FormData) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
      // No incluir Content-Type para FormData
    });

    return this.http.post(`${this.baseUrl}/hitos/${hitoId}/entregar`, formData, {
      headers: headers
    });
  }

  // Revisar hito entregado
  revisarHito(hitoId: string, revisionData: any) {
    return this.http.patch(`${this.baseUrl}/hitos/${hitoId}/revisar`, revisionData, {
      headers: this.getHeaders()
    });
  }

  // Obtener notificaciones del usuario
  obtenerNotificaciones(soloNoLeidas: boolean = false) {
    const params = soloNoLeidas ? '?solo_no_leidas=true' : '';
    return this.http.get(`${this.baseUrl}/notificaciones${params}`, {
      headers: this.getHeaders()
    });
  }

  // Marcar notificación como leída
  marcarNotificacionLeida(notificacionId: string) {
    return this.http.patch(`${this.baseUrl}/notificaciones/${notificacionId}/leer`, {}, {
      headers: this.getHeaders()
    });
  }

  // Configurar alertas de proyecto
  configurarAlertas(projectId: string, configData: any) {
    return this.http.post(`${this.baseUrl}/projects/${projectId}/alertas`, configData, {
      headers: this.getHeaders()
    });
  }

  // Obtener estadísticas de cumplimiento
  obtenerEstadisticasCumplimiento(projectId: string) {
    return this.http.get(`${this.baseUrl}/projects/${projectId}/estadisticas`, {
      headers: this.getHeaders()
    });
  }

  // Descargar archivo de entrega
  descargarArchivoEntrega(nombreArchivo: string) {
    return this.http.get(`${this.baseUrl}/uploads/propuestas/${nombreArchivo}`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }
}
