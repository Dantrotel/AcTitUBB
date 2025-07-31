import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { EstudianteHomeComponent } from './pages/estudiante/home/home';
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
import { GestionProfesoresComponent } from './pages/admin/gestion-profesores/gestion-profesores';
import { AsignacionesComponent } from './pages/admin/asignaciones/asignaciones';
import { GestionCalendarioComponent } from './pages/admin/gestion-calendario/gestion-calendario';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Rutas públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rutas protegidas con AuthGuard
  { path: 'estudiante', component: EstudianteHomeComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/crear', component: CrearPropuestaComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/listar-propuesta', component: ListarPropuestasComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/editar-propuesta/:id', component: ActualizarPropuestaComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/ver-detalle/:id', component: VerPropuestaComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/asignadas', component: PropuestasAsignadasComponent, canActivate: [AuthGuard] },
  { path: 'propuestas/todas', component: PropuestasTodas, canActivate: [AuthGuard] },

  // Rutas del administrador
  { path: 'admin', component: HomeAdminComponent, canActivate: [AuthGuard] },
  { path: 'admin/propuestas', component: GestionPropuestasComponent, canActivate: [AuthGuard] },
  { path: 'admin/asignar-profesor/:id', component: AsignarProfesorComponent, canActivate: [AuthGuard] },
  { path: 'admin/usuarios', component: GestionUsuariosComponent, canActivate: [AuthGuard] },
  { path: 'admin/profesores', component: GestionProfesoresComponent, canActivate: [AuthGuard] },
  { path: 'admin/asignaciones', component: AsignacionesComponent, canActivate: [AuthGuard] },
  { path: 'admin/calendario', component: GestionCalendarioComponent, canActivate: [AuthGuard] },

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
      }
    ],
  },
];
