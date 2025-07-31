import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './../../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-propuestas-todas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './propuestas-todas.html',
  styleUrls: ['./propuestas-todas.scss']
})
export class PropuestasTodas implements OnInit {
  propuestas: any[] = [];
  propuestasFiltradas: any[] = [];
  propuestasPaginadas: any[] = [];
  loading = true;
  
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

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.cargarPropuestas();
  }

  cargarPropuestas() {
    this.loading = true;
    this.apiService.getPropuestas().subscribe({
      next: (res: any) => {
        console.log('Propuestas obtenidas:', res);
        this.propuestas = Array.isArray(res) ? res : (res.propuestas || []);
        this.aplicarFiltros();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar propuestas:', err);
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
        p.nombre_estudiante?.toLowerCase().includes(busqueda) ||
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
        case 'estudiante':
          return (a.nombre_estudiante || '').localeCompare(b.nombre_estudiante || '');
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

  asignarPropuesta(id: string) {
    this.apiService.asignarPropuesta(id, {}).subscribe({
      next: () => alert('Te has asignado esta propuesta correctamente.'),
      error: () => alert('No se pudo asignar la propuesta.')
    });
  }

  revisarPropuesta(id: number) {
    this.router.navigate(['/profesor/propuestas/revisar', id]);
  }

  volver() {
    this.router.navigate(['/profesor']);
  }

  recargarPropuestas() {
    this.cargarPropuestas();
  }

  fechaActual(): Date {
    return new Date();
  }
}
