import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'listar-propuestas',
  templateUrl: './lista-propuestas.html',
  styleUrls: ['./lista-propuestas.scss']
})
export class ListarPropuestasComponent implements OnInit {
  propuestas: any[] = [];
  propuestasFiltradas: any[] = [];
  propuestasPaginadas: any[] = [];
  loading = true;
  error = '';
  
  // Propiedades de usuario
  userRut = '';
  userRole = '';
  esEstudiante = false;
  esProfesor = false;
  esAdmin = false;
  
  // Filtros
  filtroBusqueda = '';
  filtroEstado = '';
  ordenarPor = 'fecha';
  
  // Paginación
  paginaActual = 1;
  elementosPorPagina = 6;
  totalPaginas = 1;
  
  // Math para usar en template
  Math = Math;

  // Propiedades computadas para estadísticas
  get totalPropuestas(): number {
    return this.propuestas.length;
  }

  get propuestasPendientes(): number {
    return this.propuestas.filter(p => p.estado_id === 1).length;
  }

  get propuestasAprobadas(): number {
    return this.propuestas.filter(p => p.estado_id === 4).length;
  }

  get propuestasEnCorrecciones(): number {
    return this.propuestas.filter(p => p.estado_id === 3).length;
  }

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarPropuestas();
  }

  private cargarPropuestas(): void {
    this.loading = true;
    this.error = '';

    // Obtener el RUT del estudiante desde el token
  const token = localStorage.getItem('token');

  if (token) {
      try {
    const payload = JSON.parse(atob(token.split('.')[1]));
        this.userRut = payload.rut || '';
        this.userRole = payload.rol_id || '';
        this.esEstudiante = String(this.userRole) === '1'; // 1 para estudiante
        this.esProfesor = String(this.userRole) === '2'; // 2 para profesor
        this.esAdmin = String(this.userRole) === '3'; // 3 para admin
        
        console.log('🔍 Usuario detectado:', {
          rut: this.userRut,
          rol_id: this.userRole,
          tipo_rol_id: typeof this.userRole,
          esEstudiante: this.esEstudiante,
          esProfesor: this.esProfesor,
          esAdmin: this.esAdmin
        });
      } catch {
        console.error('Error al decodificar token');
      }
    }

    if (!this.userRut) {
      this.error = 'No se encontró el RUT del usuario';
      this.loading = false;
      return;
    }

    // Primero obtener las propuestas del estudiante usando buscaruserByrut
    this.api.buscaruserByrut(this.userRut).subscribe({
      next: (userData: any) => {
        console.log('Datos del usuario obtenidos:', userData);
        
        // Usar el endpoint específico para estudiantes
        if (this.esEstudiante) {
          this.api.getMisPropuestas().subscribe({
            next: (propuestasData: any) => {
              console.log('✅ Propuestas del estudiante (endpoint específico):', propuestasData);
              this.propuestas = Array.isArray(propuestasData) ? propuestasData : [];
              this.procesarPropuestasCargadas();
            },
            error: (error: any) => {
              console.error('❌ Error al cargar propuestas del estudiante:', error);
              // Fallback al método anterior
              this.cargarPropuestasFallback();
            }
          });
        } else {
          // Para profesores y admins, usar el endpoint general
          this.api.getPropuestas().subscribe({
          next: (propuestasData: any) => {
            console.log('🔍 Backend response completo:', propuestasData);
            console.log('🔍 Tipo de respuesta:', typeof propuestasData);
            console.log('🔍 Es array:', Array.isArray(propuestasData));
            console.log('🔍 Longitud del array:', Array.isArray(propuestasData) ? propuestasData.length : 'No es array');
            
            const todasLasPropuestas = Array.isArray(propuestasData) ? propuestasData : [];
            
            console.log('🔍 Todas las propuestas procesadas:', todasLasPropuestas);
            console.log('🔍 Total de propuestas antes del filtro:', todasLasPropuestas.length);
            
            // Filtrar propuestas según el rol del usuario
            if (this.esEstudiante) {
              console.log('🔍 Filtrando propuestas para estudiante');
              console.log('🔍 RUT del estudiante:', this.userRut);
              
              // Estudiantes ven solo sus propias propuestas
              this.propuestas = todasLasPropuestas.filter(propuesta => {
                console.log('🔍 Comparando propuesta:', {
                  propuesta_estudiante_rut: propuesta.estudiante_rut,
                  user_rut: this.userRut,
                  coincide: propuesta.estudiante_rut === this.userRut,
                  coincide_trim: propuesta.estudiante_rut?.trim() === this.userRut?.trim()
                });
                
                // Comparar con y sin espacios
                const propuestaRut = propuesta.estudiante_rut?.trim();
                const userRut = this.userRut?.trim();
                return propuestaRut === userRut;
              });
              
              console.log('🔍 Propuestas filtradas para estudiante:', this.propuestas.length);
              
              // Verificación temporal: si no se encontraron propuestas, mostrar todas para debugging
              if (this.propuestas.length === 0) {
                console.log('⚠️ No se encontraron propuestas para el estudiante, mostrando todas para debugging');
                this.propuestas = todasLasPropuestas;
              }
            } else if (this.esProfesor) {
              console.log('🔍 Filtrando propuestas para profesor');
              // Profesores ven propuestas asignadas a ellos
              this.propuestas = todasLasPropuestas.filter(propuesta => {
                return propuesta.profesor_rut === this.userRut;
              });
            } else if (this.esAdmin) {
              console.log('🔍 Mostrando todas las propuestas para admin');
              // Administradores ven todas las propuestas
              this.propuestas = todasLasPropuestas;
            } else {
              // Fallback: si no se detectó ningún rol, mostrar todas las propuestas
              console.log('⚠️ No se detectó rol específico, mostrando todas las propuestas como fallback');
              this.propuestas = todasLasPropuestas;
            }
            
            console.log('Propuestas filtradas:', this.propuestas);
            console.log('RUT del usuario:', this.userRut);
            console.log('Rol del usuario:', this.userRole);
            
            this.procesarPropuestasCargadas();
          },
          error: (err: any) => {
            console.error('Error al cargar propuestas:', err);
            this.error = 'No se pudieron cargar las propuestas';
            this.loading = false;
          }
        });
        }
      },
      error: (err: any) => {
        console.error('Error al buscar usuario por RUT:', err);
        this.error = 'No se pudo verificar el usuario';
        this.loading = false;
      }
    });
  }

  private procesarPropuestasCargadas() {
    // Agregar permisos a cada propuesta
    this.propuestas = this.propuestas.map(propuesta => {
      return {
        ...propuesta,
        puedeEditar: this.puedeEditarPropuesta(propuesta, this.userRut, this.userRole),
        puedeEliminar: this.puedeEliminarPropuesta(propuesta, this.userRut, this.userRole),
        puedeVer: this.puedeVerPropuesta(propuesta, this.userRut, this.userRole)
      };
    });
    
    console.log('✅ Propuestas procesadas:', this.propuestas);
    this.aplicarFiltros();
    this.loading = false;
  }

  private cargarPropuestasFallback() {
    console.warn('⚠️ Usando método fallback para cargar propuestas');
    this.api.getPropuestas().subscribe({
      next: (propuestasData: any) => {
        const todasLasPropuestas = Array.isArray(propuestasData) ? propuestasData : [];
        this.propuestas = todasLasPropuestas.filter(p => p.estudiante_rut === this.userRut);
        this.procesarPropuestasCargadas();
      },
      error: (error: any) => {
        console.error('❌ Error en método fallback:', error);
        this.error = 'Error al cargar las propuestas';
        this.loading = false;
      }
    });
  }

  // Métodos para determinar permisos
  private puedeEditarPropuesta(propuesta: any, userRut: string, userRole: string): boolean {
    // Solo el creador puede editar su propuesta
    return propuesta.estudiante_rut === userRut;
  }

  private puedeEliminarPropuesta(propuesta: any, userRut: string, userRole: string): boolean {
    // Solo el creador puede eliminar su propuesta
    return propuesta.estudiante_rut === userRut;
  }

  private puedeVerPropuesta(propuesta: any, userRut: string, userRole: string): boolean {
    // El creador siempre puede ver su propuesta
    if (propuesta.estudiante_rut === userRut) {
      return true;
    }
    
    // Los profesores pueden ver todas las propuestas sin asignar
    if (userRole === '2') { // Profesor
      // Si la propuesta no tiene profesor asignado, cualquier profesor puede verla
      if (!propuesta.profesor_rut || propuesta.profesor_rut === null) {
        return true;
      }
      // Si ya tiene profesor asignado, solo ese profesor puede verla
      return propuesta.profesor_rut === userRut;
    }
    
    // Los administradores pueden ver todas las propuestas
    if (userRole === '3') { // Admin
      return true;
    }
    
    // Otros estudiantes no pueden ver propuestas de otros estudiantes
    return false;
  }

  aplicarFiltros() {
    let filtradas = [...this.propuestas];

    // Filtro por búsqueda
    if (this.filtroBusqueda) {
      const busqueda = this.filtroBusqueda.toLowerCase();
      filtradas = filtradas.filter(p => 
        p.titulo?.toLowerCase().includes(busqueda) ||
        p.descripcion?.toLowerCase().includes(busqueda) ||
        p.nombre_profesor?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por estado
    if (this.filtroEstado) {
      filtradas = filtradas.filter(p => p.estado === this.filtroEstado);
    }

    // Ordenamiento
    filtradas.sort((a, b) => {
      switch (this.ordenarPor) {
        case 'titulo':
          return (a.titulo || '').localeCompare(b.titulo || '');
        case 'estado':
          return (a.estado || '').localeCompare(b.estado || '');
        case 'fecha':
        default:
          return new Date(b.fecha_envio || 0).getTime() - new Date(a.fecha_envio || 0).getTime();
      }
    });

    this.propuestasFiltradas = filtradas;
    this.paginaActual = 1;
    this.calcularPaginas();
    this.aplicarPaginacion();
  }

  calcularPaginas() {
    this.totalPaginas = Math.ceil(this.propuestasFiltradas.length / this.elementosPorPagina);
  }

  aplicarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.propuestasPaginadas = this.propuestasFiltradas.slice(inicio, fin);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.aplicarPaginacion();
    }
  }

  obtenerPaginas(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    
    return paginas;
  }

  obtenerEstadoDisplay(estado: string): string {
    const estadosMap: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_revision': 'En Revisión',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'correcciones': 'Correcciones'
    };
    return estadosMap[estado] || estado;
  }

  obtenerClaseEstado(estado: string): string {
    const estadoLower = estado?.toLowerCase();
    if (estadoLower === 'pendiente') return 'estado-pendiente';
    if (estadoLower === 'en_revision' || estadoLower === 'en revisión') return 'estado-en-revision';
    if (estadoLower === 'aprobada') return 'estado-aprobada';
    if (estadoLower === 'rechazada') return 'estado-rechazada';
    if (estadoLower === 'correcciones') return 'estado-correcciones';
    return 'estado-sin-estado';
  }

  verDetalle(id: number) {
    this.router.navigate(['/propuestas/ver-detalle', id], {
      queryParams: { from: '/propuestas/listar-propuesta' }
    });
  }

  editarPropuesta(id: number) {
    this.router.navigate(['/propuestas/editar-propuesta', id]);
  }

  revisarPropuesta(id: number) {
    this.router.navigate(['/propuestas/revisar', id]);
  }

  eliminarPropuesta(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar esta propuesta? Esta acción no se puede deshacer.')) {
      this.api.deletePropuesta(id).subscribe({
        next: () => {
          console.log('Propuesta eliminada exitosamente');
          alert('Propuesta eliminada exitosamente');
          this.cargarPropuestas(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar propuesta:', err);
          alert('Error al eliminar la propuesta');
        }
      });
    }
  }

  descargarArchivo(nombreArchivo: string) {
    if (!nombreArchivo) {
      console.error('No hay archivo para descargar');
      return;
    }

    this.api.descargarArchivo(nombreArchivo).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error al descargar archivo:', err);
        alert('Error al descargar el archivo');
      }
    });
  }

  volver() {
    // Usar history.back() para volver a la página anterior sin activar guards
    window.history.back();
  }

  recargarPropuestas() {
    this.cargarPropuestas();
  }

  crearNuevaPropuesta() {
    this.router.navigate(['/propuestas/crear']);
  }

  fechaActual(): Date {
    return new Date();
  }
}
