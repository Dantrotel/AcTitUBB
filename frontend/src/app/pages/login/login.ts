import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  usuario = '';
  password = '';

  constructor(private apiService: ApiService, private router:Router) {}


login() {
  const esEmail = this.usuario.includes('@');
  const payload: { password: string; email?: string; rut?: string } = {
    password: this.password
  };

  if (esEmail) {
    payload.email = this.usuario;
  } else {
    payload.rut = this.usuario;
  }

  console.log('Payload enviado al backend:', payload);

  this.apiService.login(payload).subscribe(
    (res: any) => {
      console.log('Login exitoso:', res);
      // Aquí podrías redirigir al usuario a otra página
      //tomar el token y decofificarlo para obtener el rol_id
      const token = res.token;
      if (!token) {
        console.error('No se recibió un token de autenticación');
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Payload decodificado:', payload);
      // Guardar el token en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(payload));

      // Redirigir según el rol (comparando como número)
      const rolId = Number(payload.rol_id);
      // Redirigir según el rol del usuario
        const rutasPorRol: { [key: string]: string } = {
        '1': '/estudiante',
        '2': '/profesor',
        '3': '/admin'
      };

      if (rutasPorRol[rolId.toString()]) {
        this.router.navigate([rutasPorRol[rolId.toString()]]);
      } else {
        console.error(`Rol ID ${rolId} no está configurado para redirección`);
        // Redirigir a una página por defecto o mostrar error
        this.router.navigate(['/']);
      }
  
    },
    (err) => {
      console.error('Error al iniciar sesión:', err);
    }
  );

  
}
 goToRegister() {
    this.router.navigate(['/register']);
  }

}
