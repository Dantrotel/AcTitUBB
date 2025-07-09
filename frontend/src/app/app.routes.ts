import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { EstudianteHomeComponent } from './pages/estudiante/home/home';
import { CrearPropuestaComponent } from './pages/estudiante/crear-propuesta/crear-propuesta';
import { ListarPropuestasComponent } from './pages/estudiante/lista-propuestas/lista-propuestas';
import { ActualizarPropuestaComponent } from './pages/estudiante/editar-propuesta/editar-propuesta';
import { VerPropuestaComponent } from './pages/estudiante/ver-detalle/ver-detalle';
import { HomeProfesor } from './pages/profesor/home-profesor/home-profesor';
import { PropuestasTodas } from './pages/profesor/AllPropuestas/propuestas-todas';
import { AuthGuard } from './guards/auth.guard';
//



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
      }
      //{
    //     path: 'visualizacion/:id',
    //     loadComponent: () =>
    //       import('./profesor/propuesta-visualizacion/propuesta-visualizacion.component').then(m => m.PropuestaVisualizacionComponent),
    //   },
    //   {
    //     path: 'detalle/:id',
    //     loadComponent: () =>
    //       import('./profesor/propuesta-detalle/propuesta-detalle.component').then(m => m.PropuestaDetalleComponent),
    //   },
    //   {
    //     path: 'comentario/:id',
    //     loadComponent: () =>
    //       import('./profesor/propuesta-comentario/propuesta-comentario.component').then(m => m.PropuestaComentarioComponent),
    //   },
    ],
  },




];
