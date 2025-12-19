import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambiar-password.html',
  styleUrls: ['./cambiar-password.scss']
})
export class CambiarPasswordComponent {
  passwordActual = '';
  passwordNueva = '';
  passwordConfirmacion = '';
  
  mensaje = '';
  error = '';
  procesando = false;
  mostrarPasswordActual = false;
  mostrarPasswordNueva = false;
  mostrarPasswordConfirmacion = false;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    // Verificar que realmente debe cambiar contraseña
    const debeCambiar = localStorage.getItem('debe_cambiar_password');
    if (!debeCambiar) {
      // Si no debe cambiar, redirigir a su dashboard
      this.router.navigate(['/']);
    }
  }

  cambiarPassword() {
    this.error = '';
    this.mensaje = '';

    // Validaciones
    if (!this.passwordActual || !this.passwordNueva || !this.passwordConfirmacion) {
      this.error = 'Todos los campos son obligatorios';
      return;
    }

    if (this.passwordNueva.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.passwordNueva !== this.passwordConfirmacion) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    if (this.passwordActual === this.passwordNueva) {
      this.error = 'La nueva contraseña debe ser diferente a la actual';
      return;
    }

    this.procesando = true;

    this.apiService.cambiarPasswordPropia(this.passwordActual, this.passwordNueva).subscribe({
      next: () => {
        this.mensaje = '✅ Contraseña cambiada exitosamente. Redirigiendo...';
        
        // Limpiar flag y redirigir
        localStorage.removeItem('debe_cambiar_password');
        
        setTimeout(() => {
          // Redirigir según rol
          const userData = localStorage.getItem('userData');
          if (userData) {
            const user = JSON.parse(userData);
            const rutasPorRol: { [key: string]: string } = {
              '1': '/estudiante',
              '2': '/profesor',
              '3': '/admin'
            };
            const ruta = rutasPorRol[user.rol_id?.toString()] || '/';
            this.router.navigate([ruta]);
          } else {
            this.router.navigate(['/']);
          }
        }, 2000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al cambiar la contraseña';
        this.procesando = false;
      }
    });
  }

  toggleMostrarPassword(campo: string) {
    if (campo === 'actual') {
      this.mostrarPasswordActual = !this.mostrarPasswordActual;
    } else if (campo === 'nueva') {
      this.mostrarPasswordNueva = !this.mostrarPasswordNueva;
    } else if (campo === 'confirmacion') {
      this.mostrarPasswordConfirmacion = !this.mostrarPasswordConfirmacion;
    }
  }

  cerrarSesion() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
