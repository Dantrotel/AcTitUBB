import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { ApiService } from '../../services/api';
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: MenuItem[];
  expanded?: boolean;
  roles?: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.scss']
})
export class AppLayoutComponent implements OnInit {
  sidebarCollapsed = signal(false);
  userMenuOpen = signal(false);
  mobileMenuOpen = signal(false);
  
  currentUser: any = null;
  currentRoute = '';
  breadcrumbs: string[] = [];
  currentYear = new Date().getFullYear();

  menuItems: MenuItem[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router
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
        this.currentUser = payload;
      } catch (error) {
        console.error('Error al decodificar token:', error);
        this.currentUser = null;
      }
    }
  }

  buildMenuForRole() {
    const role = this.currentUser?.rol_id;

    // Menú base común para todos
    const commonItems: MenuItem[] = [
      {
        label: 'Inicio',
        icon: 'fas fa-home',
        route: this.getHomeRoute(),
        roles: ['estudiante', 'profesor', 'jefe_curso', 'super_admin']
      }
    ];

    // Menú específico por rol (1=Estudiante, 2=Profesor, 3=Jefe de Curso, 4=Super Admin)
    switch (role) {
      case 1:
        this.menuItems = [
          ...commonItems,
          {
            label: 'Mi Propuesta',
            icon: 'fas fa-file-alt',
            children: [
              { label: 'Ver Propuestas', icon: 'fas fa-list', route: '/propuestas/todas' },
              { label: 'Crear Nueva', icon: 'fas fa-plus-circle', route: '/propuestas/crear' },
              { label: 'Mis Borradores', icon: 'fas fa-edit', route: '/propuestas/mis-propuestas' }
            ]
          },
          {
            label: 'Mi Proyecto',
            icon: 'fas fa-rocket',
            children: [
              { label: 'Ver Proyecto', icon: 'fas fa-eye', route: '/estudiante/mi-proyecto' },
              { label: 'Solicitar Extensión', icon: 'fas fa-clock', route: '/estudiante/solicitar-extension' }
            ]
          },
          {
            label: 'Plantillas',
            icon: 'fas fa-folder-open',
            route: '/estudiante/plantillas'
          },
          {
            label: 'Calendario',
            icon: 'fas fa-calendar-alt',
            children: [
              { label: 'Mi Calendario', icon: 'fas fa-calendar', route: '/estudiante/calendario' },
              { label: 'Solicitudes', icon: 'fas fa-inbox', route: '/estudiante/calendario/solicitudes' },
              { label: 'Reuniones', icon: 'fas fa-video', route: '/estudiante/calendario/gestion' }
            ]
          },
          {
            label: 'Chat',
            icon: 'fas fa-comments',
            route: '/estudiante/chat'
          },
          {
            label: 'Mi Perfil',
            icon: 'fas fa-user',
            route: '/estudiante/perfil'
          }
        ];
        break;

      case 2:
        this.menuItems = [
          ...commonItems,
          {
            label: 'Propuestas',
            icon: 'fas fa-file-alt',
            children: [
              { label: 'Todas las Propuestas', icon: 'fas fa-list-alt', route: '/propuestas/todas' },
              { label: 'Asignadas a Mí', icon: 'fas fa-tasks', route: '/propuestas/asignadas' }
            ]
          },
          {
            label: 'Mis Proyectos',
            icon: 'fas fa-project-diagram',
            route: '/profesor/proyectos'
          },
          {
            label: 'Calendario',
            icon: 'fas fa-calendar-check',
            children: [
              { label: 'Dashboard', icon: 'fas fa-tachometer-alt', route: '/profesor/calendario/dashboard' },
              { label: 'Mis Horarios', icon: 'fas fa-clock', route: '/profesor/calendario/disponibilidades' },
              { label: 'Solicitudes', icon: 'fas fa-inbox', route: '/profesor/calendario/solicitudes' },
              { label: 'Mis Reuniones', icon: 'fas fa-calendar-check', route: '/profesor/calendario/gestion' }
            ]
          },
          {
            label: 'Reuniones',
            icon: 'fas fa-video',
            route: '/profesor/reuniones'
          },
          {
            label: 'Reportes',
            icon: 'fas fa-chart-bar',
            route: '/profesor/reportes'
          },
          {
            label: 'Fechas Importantes',
            icon: 'fas fa-calendar-day',
            route: '/profesor/fechas-importantes'
          }
        ];
        break;

      case 3:
        this.menuItems = [
          ...commonItems,
          {
            label: 'Gestión',
            icon: 'fas fa-cogs',
            children: [
              { label: 'Usuarios', icon: 'fas fa-users', route: '/admin/usuarios' },
              { label: 'Propuestas', icon: 'fas fa-file-alt', route: '/admin/propuestas' },
              { label: 'Proyectos', icon: 'fas fa-rocket', route: '/admin/proyectos' },
              { label: 'Asignaciones', icon: 'fas fa-user-check', route: '/admin/asignaciones' },
              { label: 'Comisión', icon: 'fas fa-users-cog', route: '/admin/comision' },
              { label: 'Carga de Profesores', icon: 'fas fa-balance-scale', route: '/admin/carga-profesores' }
            ]
          },
          {
            label: 'Calendario',
            icon: 'fas fa-calendar-alt',
            children: [
              { label: 'Gestión de Horarios', icon: 'fas fa-calendar', route: '/admin/calendario' },
              { label: 'Vista Unificada', icon: 'fas fa-calendar-week', route: '/admin/calendario-unificado' }
            ]
          },
          {
            label: 'Configuración',
            icon: 'fas fa-sliders-h',
            children: [
              { label: 'Períodos de Propuestas', icon: 'fas fa-calendar-alt', route: '/admin/periodos' },
              { label: 'Extensiones', icon: 'fas fa-clock', route: '/admin/extensiones' },
              { label: 'Fechas Importantes', icon: 'fas fa-calendar-day', route: '/admin/fechas-importantes' },
              { label: 'Plantillas', icon: 'fas fa-file-word', route: '/admin/plantillas' },
              { label: 'Entidades Externas', icon: 'fas fa-building', route: '/admin/entidades-externas' },
              { label: 'Colaboradores Ext.', icon: 'fas fa-handshake', route: '/admin/colaboradores-externos' }
            ]
          },
          {
            label: 'Reportes',
            icon: 'fas fa-chart-line',
            route: '/admin/reportes'
          }
        ];
        break;

      case 4:
        this.menuItems = [
          ...commonItems,
          {
            label: 'Dashboard',
            icon: 'fas fa-tachometer-alt',
            children: [
              { label: 'Métricas', icon: 'fas fa-chart-bar', route: '/super-admin/dashboard-metricas' },
              { label: 'Actividad en Tiempo Real', icon: 'fas fa-signal', route: '/super-admin/actividad' }
            ]
          },
          {
            label: 'Administración',
            icon: 'fas fa-users-cog',
            children: [
              { label: 'Jefes de Curso', icon: 'fas fa-user-tie', route: '/super-admin/jefes' },
              { label: 'Estructura Académica', icon: 'fas fa-sitemap', route: '/super-admin/gestion-estructura' },
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
    const role = this.currentUser?.rol_id;
    switch (role) {
      case 1: return '/estudiante/home';
      case 2: return '/profesor/home';
      case 3: return '/admin/home';
      case 4: return '/super-admin/home';
      default: return '/estudiante/home';
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
    this.breadcrumbs = paths.map(path => 
      path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')
    );
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
    const role = this.currentUser?.rol_id;
    const roleMap: { [key: number]: string } = {
      1: 'Estudiante',
      2: 'Profesor',
      3: 'Jefe de Curso',
      4: 'Super Administrador'
    };
    return roleMap[role] || 'Usuario';
  }

  getUserInitials(): string {
    if (!this.currentUser?.nombre) return 'U';
    const names = this.currentUser.nombre.split(' ');
    return names.map((n: string) => n.charAt(0)).slice(0, 2).join('').toUpperCase();
  }
}
