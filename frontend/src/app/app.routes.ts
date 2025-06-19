import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { EstudianteHomeComponent } from './pages/estudiante/home/home';
import { CrearPropuestaComponent } from './pages/estudiante/crear-propuesta/crear-propuesta';
import { ListarPropuestasComponent } from './pages/estudiante/lista-propuestas/lista-propuestas';
import { ActualizarPropuestaComponent } from './pages/estudiante/editar-propuesta/editar-propuesta';
// import { HomeProfesorComponent } from './pages/profesor/home/homeP';
// import { ListaPropuestasProfesorComponent } from './pages/profesor/lista-propuestas/lista-propuestas';



export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    //estudiantes
    { path: 'estudiante', component: EstudianteHomeComponent },
    { path: 'propuestas/crear', component: CrearPropuestaComponent },
    { path: 'propuestas/listar-propuesta', component: ListarPropuestasComponent},
    { path: 'propuestas/editar-propuesta/:id', component: ActualizarPropuestaComponent},
    // //profesores
    // { path: 'profesor', component: HomeProfesorComponent },
    // { path: 'propuestas/asignadas', component: ListaPropuestasProfesorComponent },
    // { path: 'propuestas/disponibles', component: ListaPropuestasProfesorComponent },




];
