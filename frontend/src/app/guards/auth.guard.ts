import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

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
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  }

  private getUserRole(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol_id;
    } catch (error) {
      console.error('Error al extraer rol del token:', error);
      return null;
    }
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
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

    // Verificar roles si están especificados en la ruta
    const requiredRoles = route.data['requiredRoles'] as number[] | undefined;
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = this.getUserRole();
      
      if (userRole === null) {
        console.warn('No se pudo determinar el rol del usuario');
        this.router.navigate(['/login']);
        return false;
      }

      if (!requiredRoles.includes(userRole)) {
        console.warn(`Acceso denegado. Rol requerido: ${requiredRoles}, rol actual: ${userRole}`);
        this.router.navigate(['/acceso-denegado']);
        return false;
      }
    }

    return true;
  }
}
