import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../services/api';
import { CalendarModalComponent } from '../../../components/calendar-modal/calendar-modal.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    CalendarModalComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class EstudianteHomeComponent implements OnInit {
  estudiante: any = {};
  showUserMenu = false;
  propuestas: any[] = [];
  ultimaPropuesta: any = null;
  progresoProyecto = 0;
  proximasFechas: any[] = [];
  estadisticas = {
    totalPropuestas: 0,
    enRevision: 0,
    aprobadas: 0,
    diasRestantes: 0
  };
  showCalendarModal = false;
  
  opciones = [
    { 
      titulo: 'Crear Propuesta', 
      icono: 'add_circle', 
      descripcion: 'Crea una nueva propuesta de proyecto', 
      ruta: 'propuestas/crear' 
    },
    { 
      titulo: 'Ver Propuestas', 
      icono: 'visibility', 
      descripcion: 'Consulta tus propuestas enviadas', 
      ruta: 'propuestas/listar-propuesta' 
    }
  ];

  constructor(private router: Router, private ApiService: ApiService) {}

   ngOnInit() {
    // Obtener rut del token o del localStorage
    const token = localStorage.getItem('token');
    let rut = '';
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      rut = payload.rut;
    }

    if (rut) {
      this.buscarUserByRut(rut);
      this.cargarPropuestas(rut);
    } else {
      // Fallback
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        this.estudiante.nombre = userData.nombre || 'Estudiante';
        this.estudiante.matricula = userData.matricula || '';
        this.estudiante.carrera = userData.carrera || '';
      } else {
        this.estudiante.nombre = 'Estudiante';
      }
    }
  }

  buscarUserByRut(rut: string) {
    this.ApiService.buscaruserByrut(rut).subscribe({
      next: (data: any) => {
        this.estudiante = data;
      },
      error: (err) => {
        console.error('Error al obtener usuario:', err);
        this.estudiante.nombre = 'Estudiante';
      }
    });
  }

  cargarPropuestas(rut: string) {
    // Obtener todas las propuestas y filtrar las del estudiante
    this.ApiService.getPropuestas().subscribe({
      next: (data: any) => {
        const todasLasPropuestas = Array.isArray(data) ? data : [];
        this.propuestas = todasLasPropuestas.filter(propuesta => {
          return propuesta.estudiante_rut === rut;
        });
        
        this.calcularEstadisticas();
        this.obtenerUltimaPropuesta();
        this.calcularProgresoProyecto();
        this.generarProximasFechas();
      },
      error: (err) => {
        console.error('Error al cargar propuestas:', err);
      }
    });
  }

  calcularEstadisticas() {
    this.estadisticas.totalPropuestas = this.propuestas.length;
    this.estadisticas.enRevision = this.propuestas.filter(p => 
      p.estado === 'en_revision' || p.estado === 'pendiente'
    ).length;
    this.estadisticas.aprobadas = this.propuestas.filter(p => 
      p.estado === 'aprobada'
    ).length;
    
    // Calcular días restantes hasta el final del año académico
    const hoy = new Date();
    const finAno = new Date(hoy.getFullYear(), 11, 31); // 31 de diciembre
    this.estadisticas.diasRestantes = Math.ceil((finAno.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  obtenerUltimaPropuesta() {
    if (this.propuestas.length > 0) {
      // Ordenar por fecha de envío y tomar la más reciente
      this.propuestas.sort((a, b) => {
        return new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime();
      });
      this.ultimaPropuesta = this.propuestas[0];
    }
  }

  calcularProgresoProyecto() {
    if (this.propuestas.length === 0) {
      this.progresoProyecto = 0;
      return;
    }

    // Calcular progreso basado en el estado de las propuestas
    let progreso = 0;
    const totalPropuestas = this.propuestas.length;
    
    this.propuestas.forEach(propuesta => {
      switch (propuesta.estado) {
        case 'pendiente':
          progreso += 10;
          break;
        case 'en_revision':
          progreso += 30;
          break;
        case 'aprobada':
          progreso += 60;
          break;
        case 'correcciones':
          progreso += 40;
          break;
        case 'rechazada':
          progreso += 20;
          break;
        default:
          progreso += 10;
      }
    });

    this.progresoProyecto = Math.min(100, Math.round(progreso / totalPropuestas));
  }

  generarProximasFechas() {
    this.proximasFechas = [];
    
    if (this.propuestas.length > 0) {
      // Fecha de entrega final (30 días desde la última propuesta)
      const ultimaFecha = new Date(this.ultimaPropuesta?.fecha_envio || new Date());
      const entregaFinal = new Date(ultimaFecha.getTime() + (30 * 24 * 60 * 60 * 1000));
      
      // Fecha de defensa (45 días desde la última propuesta)
      const defensa = new Date(ultimaFecha.getTime() + (45 * 24 * 60 * 60 * 1000));
      
      this.proximasFechas = [
        {
          titulo: 'Entrega final',
          fecha: entregaFinal,
          icono: 'fas fa-clock'
        },
        {
          titulo: 'Defensa',
          fecha: defensa,
          icono: 'fas fa-gavel'
        }
      ];
    } else {
      // Fechas por defecto si no hay propuestas
      const hoy = new Date();
      this.proximasFechas = [
        {
          titulo: 'Entrega final',
          fecha: new Date(hoy.getFullYear(), 11, 15), // 15 de diciembre
          icono: 'fas fa-clock'
        },
        {
          titulo: 'Defensa',
          fecha: new Date(hoy.getFullYear(), 11, 20), // 20 de diciembre
          icono: 'fas fa-gavel'
        }
      ];
    }
  }

  obtenerFaseProyecto(): string {
    if (this.propuestas.length === 0) return 'Sin iniciar';
    
    const ultimaPropuesta = this.propuestas[0];
    switch (ultimaPropuesta.estado) {
      case 'pendiente':
        return 'Fase 1: Propuesta enviada';
      case 'en_revision':
        return 'Fase 2: En revisión';
      case 'aprobada':
        return 'Fase 3: Aprobada';
      case 'correcciones':
        return 'Fase 3: Correcciones finales';
      case 'rechazada':
        return 'Fase 1: Propuesta rechazada';
      default:
        return 'Fase 1: Propuesta enviada';
    }
  }

  navegarAUltimaPropuesta() {
    if (this.ultimaPropuesta) {
      this.router.navigate(['/propuestas/ver-detalle', this.ultimaPropuesta.id]);
    } else {
      this.router.navigate(['/propuestas/crear']);
    }
  }

  abrirCalendario() {
    console.log('Abriendo calendario con propuestas:', this.propuestas);
    this.showCalendarModal = true;
  }

  cerrarCalendario() {
    this.showCalendarModal = false;
  }

  fechaActual(): Date {
    return new Date();
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  navegar(ruta: string) {
    this.showUserMenu = false; // Cerrar menú al navegar
    this.router.navigate([ruta]);
  }

  cerrarSesion() {
    this.showUserMenu = false;
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['/login']);
  }
}
