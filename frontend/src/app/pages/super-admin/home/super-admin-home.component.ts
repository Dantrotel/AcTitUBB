import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api';

@Component({
  selector: 'app-super-admin-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './super-admin-home.component.html',
  styleUrls: ['./super-admin-home.component.scss']
})
export class SuperAdminHomeComponent implements OnInit {
  userData = signal<any>(null);
  loading = signal(true);
  showUserMenu = signal(false);
  
  // Estadísticas de estructura académica
  estadisticasEstructura = signal<any>({
    totalFacultades: 0,
    totalDepartamentos: 0,
    totalCarreras: 0,
    carrerasConJefe: 0,
    carrerasSinJefe: 0
  });
  
  // Estadísticas de usuarios
  estadisticasUsuarios = signal<any>({
    totalUsuarios: 0,
    totalProfesores: 0,
    totalEstudiantes: 0,
    totalAdmins: 0,
    usuariosActivos: 0,
    usuariosPendientes: 0
  });
  
  // Estadísticas de propuestas y proyectos
  estadisticasProyectos = signal<any>({
    totalPropuestas: 0,
    propuestasPendientes: 0,
    propuestasAprobadas: 0,
    propuestasRechazadas: 0,
    totalProyectosActivos: 0,
    proyectosFinalizados: 0
  });
  
  // Estadísticas de carga
  estadisticasCarga = signal<any>({
    profesoresConCarga: 0,
    profesoresSinCarga: 0,
    promedioCargaProfesor: 0,
    maxCargaProfesor: 0
  });

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarTodasLasEstadisticas();
  }

  cargarDatosUsuario(): void {
    const userData = localStorage.getItem('userData');
    if (userData) {
      this.userData.set(JSON.parse(userData));
    }
  }

  cargarTodasLasEstadisticas(): void {
    this.loading.set(true);
    
    // Cargar estructura académica
    Promise.all([
      new Promise(resolve => this.apiService.getFacultades(true).subscribe(res => resolve(res))),
      new Promise(resolve => this.apiService.getDepartamentos(true).subscribe(res => resolve(res))),
      new Promise(resolve => this.apiService.getCarreras(true).subscribe(res => resolve(res)))
    ]).then(([facultades, departamentos, carreras]: any[]) => {
      const carrerasData = carreras.carreras || carreras;
      const carrerasConJefe = carrerasData.filter((c: any) => c.jefe_carrera_rut).length;
      
      this.estadisticasEstructura.set({
        totalFacultades: (facultades.facultades || facultades).length,
        totalDepartamentos: (departamentos.departamentos || departamentos).length,
        totalCarreras: carrerasData.length,
        carrerasConJefe: carrerasConJefe,
        carrerasSinJefe: carrerasData.length - carrerasConJefe
      });
    });

    // Cargar usuarios
    this.apiService.get('/admin/usuarios').subscribe({
      next: (response: any) => {
        const usersArray = response.usuarios || response;
        const profesores = usersArray.filter((u: any) => u.rol_id === 2);
        const estudiantes = usersArray.filter((u: any) => u.rol_id === 1);
        const admins = usersArray.filter((u: any) => u.rol_id === 3 || u.rol_id === 4);
        const activos = usersArray.filter((u: any) => u.confirmado);
        
        this.estadisticasUsuarios.set({
          totalUsuarios: usersArray.length,
          totalProfesores: profesores.length,
          totalEstudiantes: estudiantes.length,
          totalAdmins: admins.length,
          usuariosActivos: activos.length,
          usuariosPendientes: usersArray.length - activos.length
        });
      }
    });

    // Cargar propuestas (TODAS - sin filtro de carrera)
    this.apiService.getPropuestas().subscribe({
      next: (propuestas: any) => {
        const propuestasArray = propuestas.propuestas || propuestas;
        const pendientes = propuestasArray.filter((p: any) => p.estado === 'Pendiente' || p.estado === 'pendiente').length;
        const aprobadas = propuestasArray.filter((p: any) => p.estado === 'Aprobada' || p.estado === 'aprobada').length;
        const rechazadas = propuestasArray.filter((p: any) => p.estado === 'Rechazada' || p.estado === 'rechazada').length;
        
        // Set both propuestas stats and use propuestas as proxy for proyectos
        this.estadisticasProyectos.set({
          totalPropuestas: propuestasArray.length,
          propuestasPendientes: pendientes,
          propuestasAprobadas: aprobadas,
          propuestasRechazadas: rechazadas,
          totalProyectosActivos: aprobadas, // Propuestas aprobadas become proyectos activos
          proyectosFinalizados: 0 // We don't have separate proyectos endpoint
        });
      }
    });

    // Cargar carga administrativa
    this.apiService.obtenerCargaProfesores().then((data: any) => {
      const profesores = data.profesores || [];
      const conCarga = profesores.filter((p: any) => p.total_proyectos > 0).length;
      const estadisticas = data.estadisticas || {};
      
      this.estadisticasCarga.set({
        profesoresConCarga: conCarga,
        profesoresSinCarga: profesores.length - conCarga,
        promedioCargaProfesor: Number(estadisticas.promedio_proyectos_profesor || 0),
        maxCargaProfesor: Number(estadisticas.max_proyectos_profesor || 0)
      });
      
      this.loading.set(false);
    }).catch(error => {
      this.loading.set(false);
    });
  }

  toggleUserMenu(): void {
    this.showUserMenu.set(!this.showUserMenu());
  }

  logout(): void {
    this.apiService.logout();
  }
}
