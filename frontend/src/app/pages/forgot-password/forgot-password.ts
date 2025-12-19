import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss']
})
export class ForgotPasswordComponent {
  email = signal('');
  isLoading = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  async onSubmit() {
    if (this.isLoading()) return;

    const emailValue = this.email().trim();
    if (!emailValue) {
      this.showMessage('Por favor ingresa tu correo electrónico', 'error');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      this.showMessage('Por favor ingresa un correo electrónico válido', 'error');
      return;
    }

    // Validar que sea dominio UBB
    if (!emailValue.endsWith('@alumnos.ubiobio.cl') && !emailValue.endsWith('@ubiobio.cl')) {
      this.showMessage('Debes usar tu correo institucional (@ubiobio.cl o @alumnos.ubiobio.cl)', 'error');
      return;
    }

    this.isLoading.set(true);
    this.message.set('');

    try {
      const response = await this.apiService.forgotPassword(emailValue);
      this.showMessage(response.message || 'Se ha enviado un correo con tu contraseña temporal', 'success');
      this.email.set('');
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
    } catch (error: any) {
      const errorMessage = error.error?.message || 'Error al procesar tu solicitud. Inténtalo nuevamente.';
      this.showMessage(errorMessage, 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  private showMessage(msg: string, type: 'success' | 'error') {
    this.message.set(msg);
    this.messageType.set(type);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
