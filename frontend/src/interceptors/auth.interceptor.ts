import { Injectable, NgZone } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router, private zone: NgZone) {}

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

  private redirectToLogin(): void {
    this.zone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    console.log('Interceptando solicitud:', req.url);

    // Verificar si el token existe y está expirado antes de hacer la petición
    if (token && this.isTokenExpired(token)) {
      console.warn('Token expirado, redirigiendo al login');
      this.clearAuthData();
      this.redirectToLogin();
      return throwError(() => new Error('Token expirado'));
    }

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Interceptado error:', error);
        
        // Manejar errores de autenticación (401) o token expirado
        if (error.status === 401 || 
            (error.error && (error.error.message === 'Token expirado' || 
                            error.error.message === 'jwt expired' ||
                            error.error.message === 'invalid token'))) {
          console.warn('Error de autenticación detectado, limpiando sesión');
          this.clearAuthData();
          this.redirectToLogin();
        }

        return throwError(() => error);
      })
    );
  }
}