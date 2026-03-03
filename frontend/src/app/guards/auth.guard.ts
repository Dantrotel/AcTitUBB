import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private router: Router, private tokenService: TokenService) {}

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.tokenService.getPayload()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (this.tokenService.isExpired()) {
      this.clearAuthData();
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar roles si están especificados en la ruta
    const requiredRoles = route.data['requiredRoles'] as number[] | undefined;
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = this.tokenService.getRolId();

      if (userRole === null || !requiredRoles.includes(userRole)) {
        // Usuario autenticado pero sin permiso → redirigir a su home, no al login
        const homeRoutes: Record<number, string> = {
          1: '/estudiante/home',
          2: '/profesor/home',
          3: '/admin/home',
          4: '/super-admin/home'
        };
        const home = userRole !== null ? (homeRoutes[userRole] ?? '/login') : '/login';
        this.router.navigate([home]);
        return false;
      }
    }

    return true;
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot): boolean {
    return this.canActivate(childRoute);
  }
}
