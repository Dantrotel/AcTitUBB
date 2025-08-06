import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true; // Si hay error al parsear, considerar como expirado
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No hay token, redirigiendo al login');
      this.router.navigate(['/login']);
      return false;
    }

    if (this.isTokenExpired(token)) {
      console.warn('Token expirado, limpiando datos y redirigiendo al login');
      this.clearAuthData();
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
