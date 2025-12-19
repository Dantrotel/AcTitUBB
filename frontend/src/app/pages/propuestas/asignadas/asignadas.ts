import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'asignadas',
  templateUrl: './asignadas.html',
  styleUrls: ['./asignadas.scss']
})
export class PropuestasAsignadasComponent implements OnInit {
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
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPropuestasAsignadas();
  }

  private cargarPropuestasAsignadas(): void {
    this.loading = true;
    this.error = '';

    // Obtener el RUT del profesor desde el token
    const token = localStorage.getItem('token');
    let profesorRut = '';
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        profesorRut = payload.rut || '';
      } catch {
      }
    }

    if (!profesorRut) {
      this.error = 'No se encontró el RUT del profesor';
      this.loading = false;
      return;
    }

    this.api.getPropuestasAsignadasProfesor(profesorRut).subscribe({
      next: (data: any) => {
        this.propuestas = Array.isArray(data) ? data : [];
        this.aplicarFiltros();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'No se pudieron cargar las propuestas asignadas';
        this.loading = false;
        this.cdr.detectChanges();
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
        (p.nombre_estudiante || p.alumnoNombre)?.toLowerCase().includes(busqueda)
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
          return (a.nombre_estudiante || a.alumnoNombre || '').localeCompare(b.nombre_estudiante || b.alumnoNombre || '');
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
    this.cdr.detectChanges();
  }

  calcularPaginas() {
    this.totalPaginas = Math.ceil(this.propuestasFiltradas.length / this.elementosPorPagina);
  }

  aplicarPaginacion() {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    this.propuestasPaginadas = this.propuestasFiltradas.slice(inicio, fin);
    this.cdr.detectChanges();
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
      queryParams: { from: '/profesor/propuestas/asignadas' }
    });
  }

  revisarPropuesta(id: number) {
    this.router.navigate(['/profesor/propuestas/revisar', id]);
  }

  descargarArchivo(nombreArchivo: string) {
    if (!nombreArchivo) {
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
        this.notificationService.error('Error al descargar el archivo');
      }
    });
  }

  volver() {
    // Usar history.back() para volver a la p�gina anterior sin activar guards
    window.history.back();
  }

  recargarPropuestas() {
    this.cargarPropuestasAsignadas();
  }

  fechaActual(): Date {
    return new Date();
  }
}
