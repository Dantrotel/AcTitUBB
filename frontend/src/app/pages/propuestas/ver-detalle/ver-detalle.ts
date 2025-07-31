import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../services/api';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ver-propuesta',
  templateUrl: './ver-detalle.html',
  styleUrls: ['./ver-detalle.scss']
})
export class VerPropuestaComponent implements OnInit {
  propuesta: any = null;
  loading = true;
  error = '';
  esProfesor = false;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.verificarTipoUsuario();
    this.cargarPropuesta();
  }

  private verificarTipoUsuario(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.esProfesor = user.role === 'profesor';
      } catch {
        this.esProfesor = false;
      }
    }
  }

  private cargarPropuesta(): void {
    this.loading = true;
    this.error = '';

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID de propuesta no válido';
      this.loading = false;
      return;
    }

    this.api.getPropuestaById(id).subscribe({
      next: (data: any) => {
        console.log('Propuesta obtenida:', data);
        this.propuesta = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar propuesta:', err);
        this.error = 'No se pudo cargar la propuesta';
        this.loading = false;
      }
    });
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

  asignarme() {
    if (!this.propuesta || !this.esProfesor) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    // Obtener el RUT del profesor desde el token
    const token = localStorage.getItem('token');
    let profesorRut = '';
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        profesorRut = payload.rut || '';
      } catch {
        console.error('Error al decodificar token');
      }
    }

    if (!profesorRut) {
      alert('No se encontró el RUT del profesor');
      return;
    }

    // Aquí se implementaría la lógica para asignar la propuesta al profesor
    console.log('Asignando propuesta', this.propuesta.id, 'al profesor', profesorRut);
    alert('Funcionalidad de asignación en desarrollo');
  }

  revisarPropuesta(id: number) {
    this.router.navigate(['/profesor/propuestas/revisar', id]);
  }

  editarPropuesta(id: number) {
    this.router.navigate(['/propuestas/editar-propuesta', id]);
  }

  volver() {
    // Determinar la ruta de retorno según el tipo de usuario
    if (this.esProfesor) {
      this.router.navigate(['/profesor']);
    } else {
      this.router.navigate(['/estudiante']);
    }
  }

  recargarPropuesta() {
    this.cargarPropuesta();
  }

  fechaActual(): Date {
    return new Date();
  }
}

