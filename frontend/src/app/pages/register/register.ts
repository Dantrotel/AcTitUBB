import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent {
  rut = '';
  nombre = '';
  email = '';
  password = '';
  mensaje = '';

  constructor(private apiService: ApiService, private router: Router) {}

 register() {
  if (!this.rut || !this.nombre || !this.email || !this.password) {
    this.mensaje = 'Por favor completa todos los campos';
    return;
  }

  if (!this.email.endsWith('@alumnos.ubiobio.cl') && !this.email.endsWith('@ubiobio.cl')) {
    this.mensaje = 'El correo debe ser institucional (@alumnos.ubiobio.cl o @ubiobio.cl)';
    return;
  }

  const payload = {
    rut: this.rut,
    nombre: this.nombre,
    email: this.email,
    password: this.password,
  };

  console.log('Payload enviado al backend:', payload);

  this.apiService.register(payload).subscribe({
    next: (res: any) => {
      console.log('Registro exitoso:', res);
      this.mensaje = 'Registro exitoso!';
      this.rut = '';
      this.nombre = '';
      this.email = '';
      this.password = '';

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    },
    error: (err: any) => {
      console.error('Error en registro:', err);
      this.mensaje = err.error?.message || 'Error al registrarse';
    }
  });
}

   

  volver() {
    this.router.navigate(['/login']); // Cambia a la ruta que uses
  }
}
