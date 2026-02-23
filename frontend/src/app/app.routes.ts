import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { EstudianteHomeComponent } from './pages/estudiante/home/estudiante-home.component';
import { CrearPropuestaComponent } from './pages/propuestas/crear-propuesta/crear-propuesta';
import { ListarPropuestasComponent } from './pages/propuestas/lista-propuestas/lista-propuestas';
import { ActualizarPropuestaComponent } from './pages/propuestas/editar-propuesta/editar-propuesta';
import { VerPropuestaComponent } from './pages/propuestas/ver-detalle/ver-detalle';
import { HomeProfesor } from './pages/profesor/home-profesor/home-profesor';
import { PropuestasTodas } from './pages/propuestas/AllPropuestas/propuestas-todas';
import { AuthGuard } from './guards/auth.guard';
import { PropuestasAsignadasComponent } from './pages/propuestas/asignadas/asignadas';
import { RevisarPropuestaComponent } from './pages/propuestas/revisarPropuesta/revisar-propuesta';
import { HomeAdminComponent } from './pages/admin/home-admin/home-admin';
import { GestionPropuestasComponent } from './pages/admin/gestion-propuestas/gestion-propuestas';
import { GestionProyectosComponent } from './pages/admin/gestion-proyectos/gestion-proyectos.component';
import { AsignarProfesorComponent } from './pages/admin/asignar-profesor/asignar-profesor';
import { GestionUsuariosComponent } from './pages/admin/gestion-usuarios/gestion-usuarios';
import { AsignacionesComponent } from './pages/admin/asignaciones/asignaciones';
import { GestionCalendarioComponent } from './pages/admin/gestion-calendario/gestion-calendario';
import { ProfesorChatComponent } from './pages/profesor/chat/profesor-chat.component';
import { EstudianteChatComponent } from './pages/estudiante/chat/estudiante-chat.component';
import { AdminChatComponent } from './pages/admin/chat/admin-chat.component';
import { SuperAdminChatComponent } from './pages/super-admin/chat/super-admin-chat.component';
import { GestionComisionComponent } from './pages/admin/gestion-comision/gestion-comision';
import { GestionExtensionesComponent } from './pages/admin/gestion-extensiones/gestion-extensiones.component';
import { GestionPeriodoPropuestasComponent } from './pages/admin/gestion-periodo-propuestas/gestion-periodo-propuestas.component';
import { FechasImportantesComponent } from './pages/admin/fechas-importantes/fechas-importantes.component';
import { CalendarioUnificadoComponent } from './pages/admin/calendario-unificado/calendario-unificado.component';
import { SolicitarExtensionComponent } from './pages/estudiante/solicitar-extension/solicitar-extension.component';
import { PerfilEstudianteComponent } from './pages/estudiante/perfil/perfil';
import { FechasImportantesProfesorComponent } from './pages/profesor/fechas-importantes/fechas-importantes-profesor.component';

// Layout Component
import { AppLayoutComponent } from './components/app-layout/app-layout.component';

// Super Admin Components
import { SuperAdminHomeComponent } from './pages/super-admin/home/super-admin-home.component';
import { GestionEstructuraComponent } from './pages/super-admin/gestion-estructura/gestion-estructura';
import { GestionarJefesComponent } from './pages/super-admin/gestionar-jefes/gestionar-jefes';
import { SuperAdminGestionUsuariosComponent } from './pages/super-admin/gestion-usuarios/super-admin-gestion-usuarios';

// Calendario Matching Components
import { DisponibilidadesComponent } from './components/calendario-matching/disponibilidades.component';
import { SolicitudesReunionComponent } from './components/calendario-matching/solicitudes-reunion.component';
import { DashboardReunionesComponent } from './components/calendario-matching/dashboard-reuniones.component';
import { GestionReunionesComponent } from './components/calendario-matching/gestion-reuniones.component';

// Cronogramas Component
import { CronogramasComponent } from './pages/profesor/cronogramas/cronogramas';
import { ProyectoCronogramaComponent } from './pages/proyecto-cronograma/proyecto-cronograma.component';

// Reuniones Profesor Component
import { ReunionesProfesorComponent } from './pages/profesor/reuniones/reuniones-profesor.component';

// Reportes Profesor Component
import { ReportesProfesorComponent } from './pages/profesor/reportes/reportes-profesor.component';

// Documentos Component
import { DocumentosProyectoComponent } from './components/documentos-proyecto/documentos-proyecto.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Rutas públicas (sin layout)
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'forgot-password', 
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent)
  },
  { 
    path: 'cambiar-password', 
    loadComponent: () => import('./pages/cambiar-password/cambiar-password').then(m => m.CambiarPasswordComponent)
  },
  { 
    path: 'cambiar-password-obligatorio', 
    loadComponent: () => import('./pages/cambio-password-obligatorio/cambio-password-obligatorio').then(m => m.CambioPasswordObligatorioComponent),
    canActivate: [AuthGuard]
  },

  // Rutas protegidas CON LAYOUT
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      // Perfil
      { path: 'perfil', component: PerfilEstudianteComponent },
      
      // Propuestas
      { path: 'propuestas/crear', component: CrearPropuestaComponent },
      { path: 'propuestas/listar-propuesta', component: ListarPropuestasComponent },
      { path: 'propuestas/mis-propuestas', component: ListarPropuestasComponent },
      { path: 'propuestas/editar-propuesta/:id', component: ActualizarPropuestaComponent },
      { path: 'propuestas/ver-detalle/:id', component: VerPropuestaComponent },
      { path: 'propuestas/asignadas', component: PropuestasAsignadasComponent },
      { path: 'propuestas/todas', component: PropuestasTodas },

      // Calendario Matching
      { path: 'calendario-matching', redirectTo: '/calendario-matching/solicitudes', pathMatch: 'full' },
      { path: 'calendario-matching/solicitudes', component: SolicitudesReunionComponent },
      { path: 'calendario-matching/gestion', component: GestionReunionesComponent },

      // ========================================
      // SUPER ADMIN ROUTES
      // ========================================
      { 
        path: 'super-admin', 
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'home', component: SuperAdminHomeComponent, data: { requiredRoles: [4] } },
          { path: 'propuestas/revisar/:id', component: RevisarPropuestaComponent, data: { requiredRoles: [4] } },
          { path: 'gestion-estructura', component: GestionEstructuraComponent, data: { requiredRoles: [4] } },
          { path: 'jefes', component: GestionarJefesComponent, data: { requiredRoles: [4] } },
          { path: 'gestionar-jefes', component: GestionarJefesComponent, data: { requiredRoles: [4] } },
          { 
            path: 'configuracion', 
            loadComponent: () => import('./pages/admin/configuracion-sistema/configuracion-sistema.component').then(m => m.ConfiguracionSistemaComponent),
            data: { requiredRoles: [4] } 
          },
          { 
            path: 'dashboard-metricas', 
            loadComponent: () => import('./pages/admin/dashboard-metricas/dashboard-metricas.component').then(m => m.DashboardMetricasComponent),
            data: { requiredRoles: [4] } 
          },
          { 
            path: 'actividad', 
            loadComponent: () => import('./pages/super-admin/actividad-tiempo-real/actividad-tiempo-real.component').then(m => m.ActividadTiempoRealComponent),
            data: { requiredRoles: [4] } 
          },
          { 
            path: 'respaldos', 
            loadComponent: () => import('./pages/super-admin/gestion-respaldos/gestion-respaldos.component').then(m => m.GestionRespaldosComponent),
            data: { requiredRoles: [4] } 
          }
        ]
      },

      // ========================================
      // ADMIN ROUTES (Jefe de Curso)
      // ========================================
      {
        path: 'admin',
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'home', component: HomeAdminComponent, data: { requiredRoles: [3, 4] } },
          { 
            path: 'reportes', 
            loadComponent: () => import('./pages/admin/reportes/reportes.component').then(m => m.ReportesComponent),
            data: { requiredRoles: [3, 4] }
          },
          { path: 'propuestas', component: GestionPropuestasComponent, data: { requiredRoles: [3, 4] } },
          { path: 'propuestas/revisar/:id', component: RevisarPropuestaComponent, data: { requiredRoles: [3, 4] } },
          { path: 'proyectos', component: GestionProyectosComponent, data: { requiredRoles: [3, 4] } },
          { path: 'asignar-profesor/:id', component: AsignarProfesorComponent, data: { requiredRoles: [3, 4] } },
          { path: 'usuarios', component: GestionUsuariosComponent, data: { requiredRoles: [3, 4] } },
          { path: 'asignaciones', component: AsignacionesComponent, data: { requiredRoles: [3, 4] } },
          { path: 'calendario', component: GestionCalendarioComponent, data: { requiredRoles: [3, 4] } },
          { path: 'comision', component: GestionComisionComponent, data: { requiredRoles: [3, 4] } },
          { path: 'extensiones', component: GestionExtensionesComponent, data: { requiredRoles: [3, 4] } },
          { path: 'periodos', component: GestionPeriodoPropuestasComponent, data: { requiredRoles: [3, 4] } },
          { path: 'gestion-periodo-propuestas', component: GestionPeriodoPropuestasComponent, data: { requiredRoles: [3, 4] } },
          { path: 'fechas-importantes', component: FechasImportantesComponent, data: { requiredRoles: [3, 4] } },
          { path: 'calendario-unificado', component: CalendarioUnificadoComponent, data: { requiredRoles: [3, 4] } },
          { 
            path: 'carga-profesores', 
            loadComponent: () => import('./pages/admin/carga-administrativa/carga-administrativa').then(m => m.CargaAdministrativaComponent),
            data: { requiredRoles: [3, 4] } 
          },
          {
            path: 'entidades-externas',
            loadComponent: () => import('./pages/admin/gestion-entidades/gestion-entidades.component').then(m => m.GestionEntidadesComponent),
            data: { requiredRoles: [3, 4] }
          },
          {
            path: 'colaboradores-externos',
            loadComponent: () => import('./pages/admin/gestion-colaboradores/gestion-colaboradores.component').then(m => m.GestionColaboradoresComponent),
            data: { requiredRoles: [2, 3, 4] }
          },
          {
            path: 'plantillas',
            loadComponent: () => import('./pages/admin/gestion-plantillas/gestion-plantillas.component').then(m => m.GestionPlantillasComponent),
            data: { requiredRoles: [3, 4] }
          }
        ]
      },

      // ========================================
      // PROFESOR ROUTES
      // ========================================
      // ========================================
      // PROFESOR ROUTES
      // ========================================
      {
        path: 'profesor',
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'home', component: HomeProfesor, data: { requiredRoles: [2, 3, 4] } },
          { path: 'propuestas/todas', component: PropuestasTodas, data: { requiredRoles: [2, 3, 4] } },
          { path: 'propuestas/asignadas', component: PropuestasAsignadasComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'propuestas/revisar/:id', component: RevisarPropuestaComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'cronogramas', component: CronogramasComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'proyectos', redirectTo: 'cronogramas', pathMatch: 'full' },
          { path: 'proyecto/:id', component: ProyectoCronogramaComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'calendario/dashboard', component: DashboardReunionesComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'calendario/disponibilidades', component: DisponibilidadesComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'calendario/solicitudes', component: SolicitudesReunionComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'calendario/gestion', component: GestionReunionesComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'reuniones', component: ReunionesProfesorComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'fechas-importantes', component: FechasImportantesProfesorComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'reportes', component: ReportesProfesorComponent, data: { requiredRoles: [2, 3, 4] } },
          { path: 'proyecto/:id/documentos', component: DocumentosProyectoComponent, data: { requiredRoles: [2, 3, 4] } }
        ]
      },

      // ========================================
      // ESTUDIANTE ROUTES
      // ========================================
      {
        path: 'estudiante',
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'home', component: EstudianteHomeComponent },
          { path: 'mi-proyecto', component: EstudianteHomeComponent },
          { path: 'proyecto/:id', component: ProyectoCronogramaComponent },
          { path: 'calendario', component: CalendarioUnificadoComponent },
          { path: 'calendario/solicitudes', component: SolicitudesReunionComponent },
          { path: 'calendario/gestion', component: GestionReunionesComponent },
          { path: 'proyecto/:id/documentos', component: DocumentosProyectoComponent },
          { path: 'solicitar-extension', component: SolicitarExtensionComponent },
          { path: 'solicitar-extension/:proyectoId', component: SolicitarExtensionComponent },
          { path: 'chat', component: EstudianteChatComponent },
          { path: 'perfil', component: PerfilEstudianteComponent },
          { path: 'documentos', redirectTo: 'plantillas', pathMatch: 'full' },
          { 
            path: 'plantillas',
            loadComponent: () => import('./pages/estudiante/plantillas-documentos/plantillas-documentos.component').then(m => m.PlantillasEstudianteComponent)
          }
        ]
      }
    ]
  }
];
