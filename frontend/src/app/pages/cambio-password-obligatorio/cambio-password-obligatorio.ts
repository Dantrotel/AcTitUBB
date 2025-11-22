import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-cambio-password-obligatorio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambio-password-obligatorio.html',
  styleUrls: ['./cambio-password-obligatorio.scss']
})
export class CambioPasswordObligatorioComponent implements OnInit {
  password_nueva = signal('');
  password_confirmacion = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verificar si el usuario tiene token válido
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  validatePassword(): string | null {
    const password = this.password_nueva().trim();
    
    if (!password) {
      return 'La contraseña es requerida';
    }

    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    if (password.length > 50) {
      return 'La contraseña no debe exceder los 50 caracteres';
    }

    // Validaciones adicionales opcionales
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);

    if (!hasNumber || !hasLetter) {
      return 'La contraseña debe contener al menos una letra y un número';
    }

    return null;
  }

  async onSubmit() {
    if (this.isLoading()) return;

    const passwordNueva = this.password_nueva().trim();
    const passwordConfirmacion = this.password_confirmacion().trim();

    // Validar contraseña
    const validationError = this.validatePassword();
    if (validationError) {
      this.showMessage(validationError, 'error');
      return;
    }

    // Validar confirmación
    if (passwordNueva !== passwordConfirmacion) {
      this.showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    this.isLoading.set(true);
    this.message.set('');

    try {
      const response = await this.apiService.cambiarPasswordObligatorio(passwordNueva);
      this.showMessage(response.message || 'Contraseña actualizada correctamente', 'success');
      
      // Limpiar campos
      this.password_nueva.set('');
      this.password_confirmacion.set('');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        // Limpiar token para forzar nuevo login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        this.router.navigate(['/login']);
      }, 2000);
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      const errorMessage = error.error?.message || 'Error al cambiar la contraseña. Inténtalo nuevamente.';
      this.showMessage(errorMessage, 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  private showMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }
}
