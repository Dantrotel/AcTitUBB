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
    return this.propuestas.filter(p => p.estado === 'pendiente').length;
  }

  get propuestasAprobadas(): number {
    return this.propuestas.filter(p => p.estado === 'aprobada').length;
  }

  get propuestasEnCorrecciones(): number {
    return this.propuestas.filter(p => p.estado === 'correcciones').length;
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
    let estudianteRut = '';
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        estudianteRut = payload.rut || '';
      } catch {
        console.error('Error al decodificar token');
      }
    }

    if (!estudianteRut) {
      this.error = 'No se encontró el RUT del estudiante';
      this.loading = false;
      return;
    }

    // Primero obtener las propuestas del estudiante usando buscaruserByrut
    this.api.buscaruserByrut(estudianteRut).subscribe({
      next: (userData: any) => {
        console.log('Datos del usuario obtenidos:', userData);
        
        // Luego obtener todas las propuestas y filtrar las del estudiante
        this.api.getPropuestas().subscribe({
          next: (propuestasData: any) => {
            console.log('Todas las propuestas obtenidas:', propuestasData);
            
            // Filtrar SOLO las propuestas del estudiante actual
            const todasLasPropuestas = Array.isArray(propuestasData) ? propuestasData : [];
            this.propuestas = todasLasPropuestas.filter(propuesta => {
              return propuesta.estudiante_rut === estudianteRut;
            });
            
            console.log('Propuestas del estudiante actual:', this.propuestas);
            console.log('RUT del estudiante:', estudianteRut);
            
            this.aplicarFiltros();
            this.loading = false;
          },
          error: (err) => {
            console.error('Error al cargar propuestas:', err);
            this.error = 'No se pudieron cargar las propuestas';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al buscar usuario por RUT:', err);
        this.error = 'No se pudo verificar el usuario';
        this.loading = false;
      }
    });
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
    this.router.navigate(['/propuestas/ver-detalle', id]);
  }

  editarPropuesta(id: number) {
    this.router.navigate(['/propuestas/editar-propuesta', id]);
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
    this.router.navigate(['/estudiante']);
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
