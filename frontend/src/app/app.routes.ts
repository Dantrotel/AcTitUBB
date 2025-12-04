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
import { AsignarProfesorComponent } from './pages/admin/asignar-profesor/asignar-profesor';
import { GestionUsuariosComponent } from './pages/admin/gestion-usuarios/gestion-usuarios';
import { AsignacionesComponent } from './pages/admin/asignaciones/asignaciones';
import { GestionCalendarioComponent } from './pages/admin/gestion-calendario/gestion-calendario';
import { GestionComisionComponent } from './pages/admin/gestion-comision/gestion-comision';
import { GestionExtensionesComponent } from './pages/admin/gestion-extensiones/gestion-extensiones.component';
import { GestionPeriodoPropuestasComponent } from './pages/admin/gestion-periodo-propuestas/gestion-periodo-propuestas.component';
import { FechasImportantesComponent } from './pages/admin/fechas-importantes/fechas-importantes.component';
import { CalendarioUnificadoComponent } from './pages/admin/calendario-unificado/calendario-unificado.component';
import { SolicitarExtensionComponent } from './pages/estudiante/solicitar-extension/solicitar-extension.component';
import { PerfilEstudianteComponent } from './pages/estudiante/perfil/perfil';
import { FechasImportantesProfesorComponent } from './pages/profesor/fechas-importantes/fechas-importantes-profesor.component';

// Super Admin Components
import { SuperAdminHomeComponent } from './pages/super-admin/home/super-admin-home.component';
import { GestionEstructuraComponent } from './pages/super-admin/gestion-estructura/gestion-estructura';
import { GestionarJefesComponent } from './pages/super-admin/gestionar-jefes/gestionar-jefes';

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

// Documentos Component
import { DocumentosProyectoComponent } from './components/documentos-proyecto/documentos-proyecto.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Rutas públicas
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

  // Rutas protegidas con AuthGuard
  { path: 'perfil', component: PerfilEstudianteComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/crear', component: CrearPropuestaComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/listar-propuesta', component: ListarPropuestasComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/editar-propuesta/:id', component: ActualizarPropuestaComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/ver-detalle/:id', component: VerPropuestaComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/asignadas', component: PropuestasAsignadasComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/todas', component: PropuestasTodas, canActivate: [AuthGuard] },

  // Rutas del Sistema de Reuniones (sin matching automático)
  { path: 'calendario-matching', redirectTo: '/calendario-matching/solicitudes', pathMatch: 'full' },
  { path: 'calendario-matching/solicitudes', component: SolicitudesReunionComponent, canActivate: [AuthGuard] },
  { path: 'calendario-matching/gestion', component: GestionReunionesComponent, canActivate: [AuthGuard] },

  // Rutas del Super Administrador
  { path: 'super-admin', component: SuperAdminHomeComponent, canActivate: [AuthGuard], data: { requiredRoles: [4] } },
  { path: 'super-admin/propuestas/revisar/:id', component: RevisarPropuestaComponent, canActivate: [AuthGuard], data: { requiredRoles: [4] } },
  { path: 'super-admin/gestion-estructura', component: GestionEstructuraComponent, canActivate: [AuthGuard], data: { requiredRoles: [4] } },
  { path: 'super-admin/gestionar-jefes', component: GestionarJefesComponent, canActivate: [AuthGuard], data: { requiredRoles: [4] } },

  // Rutas del administrador
  { path: 'admin', component: HomeAdminComponent, canActivate: [AuthGuard] },
  { path: 'admin/propuestas', component: GestionPropuestasComponent, canActivate: [AuthGuard] },
  { path: 'admin/propuestas/revisar/:id', component: RevisarPropuestaComponent, canActivate: [AuthGuard] },
  { path: 'admin/asignar-profesor/:id', component: AsignarProfesorComponent, canActivate: [AuthGuard] },
  { path: 'admin/usuarios', component: GestionUsuariosComponent, canActivate: [AuthGuard] },
  { path: 'admin/asignaciones', component: AsignacionesComponent, canActivate: [AuthGuard] },
  { path: 'admin/calendario', component: GestionCalendarioComponent, canActivate: [AuthGuard] },
  { path: 'admin/comision', component: GestionComisionComponent, canActivate: [AuthGuard] },
  { path: 'admin/extensiones', component: GestionExtensionesComponent, canActivate: [AuthGuard] },
  { path: 'admin/gestion-periodo-propuestas', component: GestionPeriodoPropuestasComponent, canActivate: [AuthGuard] },
  { path: 'admin/fechas-importantes', component: FechasImportantesComponent, canActivate: [AuthGuard] },
  { path: 'admin/calendario-unificado', component: CalendarioUnificadoComponent, canActivate: [AuthGuard] },
  { 
    path: 'admin/carga-profesores', 
    loadComponent: () => import('./pages/admin/carga-administrativa/carga-administrativa').then(m => m.CargaAdministrativaComponent),
    canActivate: [AuthGuard] 
  },

  {
    path: 'profesor',
    children: [
      {
        path: '',
        component: HomeProfesor,
        canActivate: [AuthGuard],
      },
      {
        path: 'propuestas/todas',
        component: PropuestasTodas,
        canActivate: [AuthGuard]
      },
      {
        path: 'propuestas/asignadas',
        component: PropuestasAsignadasComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'propuestas/revisar/:id',
        component: RevisarPropuestaComponent,
        canActivate: [AuthGuard]
      },
      // Rutas de gestión de proyectos
      {
        path: 'cronogramas',
        component: CronogramasComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'proyectos',
        redirectTo: 'cronogramas',
        pathMatch: 'full'
      },
      // Ruta para ver proyecto y cronograma específico
      {
        path: 'proyecto/:id',
        component: ProyectoCronogramaComponent,
        canActivate: [AuthGuard]
      },
      // Rutas de Reuniones para Profesores
      {
        path: 'calendario/dashboard',
        component: DashboardReunionesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'calendario/disponibilidades',
        component: DisponibilidadesComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'calendario/solicitudes',
        component: SolicitudesReunionComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'calendario/gestion',
        component: GestionReunionesComponent,
        canActivate: [AuthGuard]
      },
      // Ruta para gestión de reuniones del profesor
      {
        path: 'reuniones',
        component: ReunionesProfesorComponent,
        canActivate: [AuthGuard]
      },
      // Ruta para fechas importantes
      {
        path: 'fechas-importantes',
        component: FechasImportantesProfesorComponent,
        canActivate: [AuthGuard]
      },
      // Ruta para gestión de documentos del proyecto
      {
        path: 'proyecto/:id/documentos',
        component: DocumentosProyectoComponent,
        canActivate: [AuthGuard]
      }
    ],
  },

  // Rutas adicionales para estudiantes
  {
    path: 'estudiante',
    children: [
      {
        path: '',
        component: EstudianteHomeComponent,
        canActivate: [AuthGuard],
        pathMatch: 'full'
      },
      // Ruta para ver proyecto y cronograma
      {
        path: 'proyecto/:id',
        component: ProyectoCronogramaComponent,
        canActivate: [AuthGuard]
      },
      // Ruta para calendario unificado (visual completo)
      {
        path: 'calendario',
        component: CalendarioUnificadoComponent,
        canActivate: [AuthGuard]
      },
      // Rutas de Reuniones para Estudiantes (sin disponibilidades ni matching)
      {
        path: 'calendario/solicitudes',
        component: SolicitudesReunionComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'calendario/gestion',
        component: GestionReunionesComponent,
        canActivate: [AuthGuard]
      },
      // Ruta para gestión de documentos del proyecto
      {
        path: 'proyecto/:id/documentos',
        component: DocumentosProyectoComponent,
        canActivate: [AuthGuard]
      },
      // Ruta para solicitar extensión de plazo
      {
        path: 'solicitar-extension',
        component: SolicitarExtensionComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'solicitar-extension/:proyectoId',
        component: SolicitarExtensionComponent,
        canActivate: [AuthGuard]
      }
    ],
  },
];
