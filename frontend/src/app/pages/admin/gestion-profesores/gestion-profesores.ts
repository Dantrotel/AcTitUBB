import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'gestion-profesores',
  templateUrl: './gestion-profesores.html',
  styleUrls: ['./gestion-profesores.scss']
})
export class GestionProfesoresComponent implements OnInit {
  profesores: any[] = [];
  loading = true;
  error = '';
  filtroEspecialidad = '';
  filtroNombre = '';
  filtroEstado = '';

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.cargarProfesores();
  }

  // Método público para cargar profesores
  cargarProfesores(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getProfesores().subscribe({
      next: (data: any) => {
        this.profesores = data;
        this.loading = false;
        console.log('Profesores cargados:', data);
      },
      error: (err) => {
        this.error = 'Error al cargar los profesores';
        this.loading = false;
        console.error('Error cargando profesores:', err);
      }
    });
  }

  // Método para obtener la fecha actual en el footer
  fechaActual(): Date {
    return new Date();
  }

  // Filtros
  get profesoresFiltrados(): any[] {
    let filtrados = this.profesores;

    if (this.filtroEspecialidad) {
      filtrados = filtrados.filter(p => 
        p.especialidad?.toLowerCase().includes(this.filtroEspecialidad.toLowerCase())
      );
    }

    if (this.filtroNombre) {
      filtrados = filtrados.filter(p => 
        p.nombre?.toLowerCase().includes(this.filtroNombre.toLowerCase())
      );
    }

    if (this.filtroEstado) {
      filtrados = filtrados.filter(p => 
        (p.confirmado ? 'Activo' : 'Inactivo') === this.filtroEstado
      );
    }

    return filtrados;
  }

  // Navegación
  volver() {
    // Usar history.back() para volver a la p�gina anterior sin activar guards
    window.history.back();
  }

  limpiarFiltros() {
    this.filtroEspecialidad = '';
    this.filtroNombre = '';
    this.filtroEstado = '';
  }

  editarProfesor(profesor: any) {
    const nuevoNombre = prompt('Nuevo nombre:', profesor.nombre);
    const nuevoEmail = prompt('Nuevo email:', profesor.email);
    
    if (nuevoNombre && nuevoEmail) {
      this.apiService.actualizarUsuario(profesor.rut, {
        nombre: nuevoNombre,
        email: nuevoEmail
      }).subscribe({
        next: () => {
          alert('Profesor actualizado correctamente');
          this.cargarProfesores(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al actualizar profesor:', err);
          alert('Error al actualizar el profesor');
        }
      });
    }
  }

  cambiarEstado(profesor: any) {
    const nuevoEstado = !profesor.confirmado;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';
    
    if (confirm(`¿Estás seguro de que quieres ${mensaje} este profesor?`)) {
      // Aquí podrías implementar un endpoint para cambiar el estado
      // Por ahora solo mostramos un mensaje
      alert(`Funcionalidad de cambio de estado en desarrollo. Estado actual: ${profesor.confirmado ? 'Activo' : 'Inactivo'}`);
    }
  }

  verPropuestasAsignadas(profesor: any) {
    this.apiService.getPropuestasAsignadasAProfesor(profesor.rut).subscribe({
      next: (propuestas: any) => {
        if (propuestas.length > 0) {
          const propuestasList = propuestas.map((p: any) => 
            `- ${p.titulo} (${p.estado})`
          ).join('\n');
          alert(`Propuestas asignadas a ${profesor.nombre}:\n\n${propuestasList}`);
        } else {
          alert(`${profesor.nombre} no tiene propuestas asignadas.`);
        }
      },
      error: (err) => {
        console.error('Error al obtener propuestas del profesor:', err);
        alert('Error al obtener las propuestas asignadas');
      }
    });
  }

  eliminarProfesor(profesor: any) {
    if (confirm('¿Estás seguro de que quieres eliminar este profesor? Esta acción no se puede deshacer.')) {
      this.apiService.eliminarUsuario(profesor.rut).subscribe({
        next: () => {
          alert('Profesor eliminado correctamente');
          this.cargarProfesores(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar profesor:', err);
          alert('Error al eliminar el profesor');
        }
      });
    }
  }

  obtenerClaseEstado(estado: string): string {
    return estado === 'Activo' ? 'estado-activo' : 'estado-inactivo';
  }

  obtenerClaseCapacidad(capacidad: string): string {
    return capacidad === 'Disponible' ? 'capacidad-disponible' : 'capacidad-ocupado';
  }

  obtenerClasePropuestas(cantidad: number): string {
    if (cantidad === 0) return 'propuestas-vacias';
    if (cantidad <= 3) return 'propuestas-pocas';
    if (cantidad <= 5) return 'propuestas-moderadas';
    return 'propuestas-muchas';
  }
} 