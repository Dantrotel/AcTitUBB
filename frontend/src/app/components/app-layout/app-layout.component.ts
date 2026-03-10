import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../../services/api';
import { filter } from 'rxjs/operators';
import { NotificacionesPushComponent } from "../notificaciones-push/notificaciones-push.component";

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  queryParams?: { [key: string]: string };
  badge?: number;
  children?: MenuItem[];
  expanded?: boolean;
  roles?: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificacionesPushComponent],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit {
  sidebarCollapsed = signal(false);
  userMenuOpen = signal(false);
  mobileMenuOpen = signal(false);
  
  currentUser: any = null;
  currentRoute = '';
  breadcrumbs: { label: string; route: string }[] = [];
  currentYear = new Date().getFullYear();

  menuItems: MenuItem[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.buildMenuForRole();
    this.setupRouteTracking();
  }

  loadUserData() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Map numeric rol_id to role string used in buildMenuForRole()
        const rolMap: { [key: number]: string } = {
          1: 'estudiante',
          2: 'profesor',
          3: 'jefe_curso',
          4: 'super_admin'
        };
        payload.rol = rolMap[payload.rol_id] ?? 'estudiante';
        this.currentUser = payload;
      } catch (error) {
        console.error('Error al decodificar token:', error);
        this.currentUser = null;
      }
    }
  }

  buildMenuForRole() {
    const role = this.currentUser?.rol;

    // Menú base común para todos
    const commonItems: MenuItem[] = [
      {
        label: 'Inicio',
        icon: 'fas fa-home',
        route: this.getHomeRoute(),
        roles: ['estudiante', 'profesor', 'jefe_curso', 'super_admin']
      }
    ];

    // Menú específico por rol
    switch (role) {
      case 'estudiante':
        this.menuItems = [
          ...commonItems,
          {
            label: 'Propuesta',
            icon: 'fas fa-file-alt',
            children: [
              { label: 'Ver Propuestas', icon: 'fas fa-list', route: '/propuestas/mis-propuestas' },
              { label: 'Crear Nueva', icon: 'fas fa-plus-circle', route: '/propuestas/crear' },

            ]
          },
          {
            label: 'Proyecto',
            icon: 'fas fa-rocket',
            route: '/estudiante/mi-proyecto'
          },
          {
            label: 'Documentos',
            icon: 'fas fa-folder',
            route: '/estudiante/documentos'
          },
          {
            label: 'Calendario',
            icon: 'fas fa-calendar-alt',
            route: '/estudiante/calendario'
          },
          {
            label: 'Mi Perfil',
            icon: 'fas fa-user',
            route: '/estudiante/perfil'
          }
        ];
        break;

      case 'profesor':
        this.menuItems = [
          ...commonItems,
          {
            label: 'Propuestas Asignadas',
            icon: 'fas fa-file-alt',
            route: '/propuestas/asignadas'
          },
          {
            label: 'Mis Proyectos',
            icon: 'fas fa-project-diagram',
            route: '/profesor/cronogramas'
          },
          {
            label: 'Calendario',
            icon: 'fas fa-calendar-alt',
            children: [
              { label: 'Mis Horarios', icon: 'fas fa-clock', route: '/profesor/calendario/disponibilidades' },
              { label: 'Solicitudes de Reunión', icon: 'fas fa-inbox', route: '/profesor/calendario/solicitudes' },
              { label: 'Fechas Importantes', icon: 'fas fa-calendar-day', route: '/profesor/fechas-importantes' }
            ]
          },
          {
            label: 'Mis Reuniones',
            icon: 'fas fa-calendar-check',
            route: '/profesor/reuniones'
          },
          {
            label: 'Chat',
            icon: 'fas fa-comments',
            route: '/profesor/chat'
          },
          {
            label: 'Reportes',
            icon: 'fas fa-chart-bar',
            route: '/profesor/reportes'
          },
          {
            label: 'Mi Perfil',
            icon: 'fas fa-user-circle',
            route: '/estudiante/perfil'
          }
        ];
        break;

      case 'jefe_curso':
        this.menuItems = [
          ...commonItems,
          {
            label: 'Gestión de Usuarios',
            icon: 'fas fa-users',
            children: [
              { label: 'Alumnos', icon: 'fas fa-user-graduate', route: '/admin/usuarios/estudiantes' },
              { label: 'Profesores', icon: 'fas fa-chalkboard-teacher', route: '/admin/usuarios/profesores' }
            ]
          },
          {
            label: 'Asignaciones',
            icon: 'fas fa-user-tie',
            children: [
              { label: 'Revisor', icon: 'fas fa-file-alt', route: '/admin/propuestas' },
              { label: 'Informante', icon: 'fas fa-rocket', route: '/admin/proyectos' },
              { label: 'Comisión', icon: 'fas fa-users-cog', route: '/admin/comision' }
            ]
          },
          {
            label: 'Plan Semestral',
            icon: 'fas fa-calendar-alt',
            children: [
              { label: 'Semestres', icon: 'fas fa-layer-group', route: '/admin/semestres' },
              { label: 'Periodo Propuestas', icon: 'fas fa-calendar-alt', route: '/admin/gestion-periodo-propuestas' },
              { label: 'Gestion Horario', icon: 'fas fa-calendar-alt', route: '/profesor/calendario/disponibilidades' },
              { label: 'Extensiones', icon: 'fas fa-clock', route: '/admin/extensiones' },
              { label: 'Fechas Importantes', icon: 'fas fa-calendar-day', route: '/admin/fechas-importantes' },
              { label: 'Calendario General', icon: 'fas fa-calendar', route: '/admin/calendario' },
            ]
          },
          {
            label: 'Reportes',
            icon: 'fas fa-chart-line',
            route: '/admin/reportes'
          }
        ];
        break;

      case 'super_admin':
        this.menuItems = [
          ...commonItems,
          {
            label: 'Administración',
            icon: 'fas fa-users-cog',
            children: [
              { label: 'Jefes de Curso', icon: 'fas fa-user-tie', route: '/super-admin/gestionar-jefes' },
              { label: 'Respaldos', icon: 'fas fa-database', route: '/super-admin/respaldos' }
            ]
          },
          {
            label: 'Sistema',
            icon: 'fas fa-server',
            route: '/super-admin/configuracion'
          }
        ];
        break;

      default:
        this.menuItems = commonItems;
    }
  }

  getHomeRoute(): string {
    const role = this.currentUser?.rol;
    switch (role) {
      case 'estudiante': return '/estudiante/home';
      case 'profesor': return '/profesor/home';
      case 'jefe_curso': return '/admin/home';
      case 'super_admin': return '/super-admin/home';
      default: return '/';
    }
  }

  setupRouteTracking() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
        this.updateBreadcrumbs(event.url);
        // Cerrar menú móvil al navegar
        this.mobileMenuOpen.set(false);
      });
  }

  updateBreadcrumbs(url: string) {
    const paths = url.split('/').filter(p => p);
    this.breadcrumbs = paths.map((path, index) => ({
      label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      route: '/' + paths.slice(0, index + 1).join('/')
    }));
  }

  goBack() {
    this.location.back();
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleUserMenu() {
    this.userMenuOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleMenuItem(item: MenuItem) {
    if (item.children) {
      item.expanded = !item.expanded;
    } else if (item.route) {
      this.navigateTo(item.route);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActiveRoute(route?: string): boolean {
    if (!route) return false;
    return this.currentRoute.startsWith(route);
  }

  isMenuItemActive(item: MenuItem): boolean {
    if (item.route) {
      return this.isActiveRoute(item.route);
    }
    if (item.children) {
      return item.children.some(child => this.isActiveRoute(child.route));
    }
    return false;
  }

  logout() {
    this.apiService.logout();
  }

  getRoleDisplay(): string {
    const role = this.currentUser?.rol;
    const roleMap: { [key: string]: string } = {
      'estudiante': 'Estudiante',
      'profesor': 'Profesor',
      'jefe_curso': 'Jefe de Curso',
      'super_admin': 'Super Administrador'
    };
    return roleMap[role] || 'Usuario';
  }

  getUserInitials(): string {
    if (!this.currentUser?.nombre) return 'U';
    const names = this.currentUser.nombre.split(' ');
    return names.map((n: string) => n.charAt(0)).slice(0, 2).join('').toUpperCase();
  }
}
