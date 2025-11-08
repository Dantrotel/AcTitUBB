import { Injectable, NgZone } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private router: Router, private zone: NgZone, private http: HttpClient) {}

  private refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.clearAuthData();
      this.redirectToLogin();
      return throwError(() => new Error('No refresh token'));
    }

    return this.http.post('http://localhost:3000/api/v1/users/refresh-token', { refreshToken });
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

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

  private redirectToLogin(): void {
    this.zone.run(() => {
      this.router.navigate(['/login']);
    });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    console.log('Interceptando solicitud:', req.url);

    // Si es la ruta de refresh token, no agregar token ni verificar expiración
    if (req.url.includes('/refresh-token')) {
      return next.handle(req);
    }

    // Verificar si el token existe y está expirado antes de hacer la petición
    if (token && this.isTokenExpired(token)) {
      console.warn('Token expirado, intentando renovar automáticamente');
      return this.handleTokenRefresh(req, next);
    }

    let authReq = req;
    if (token) {
      authReq = this.addToken(req, token);
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Interceptado error:', error);
        
        // Manejar errores de autenticación (401) o token expirado
        if (error.status === 401) {
          // Verificar si el error es específicamente de token expirado
          if (error.error?.code === 'TOKEN_EXPIRED' || 
              error.error?.message?.includes('Token expirado') ||
              error.error?.message?.includes('jwt expired')) {
            console.warn('Token expirado detectado en respuesta, renovando...');
            return this.handleTokenRefresh(req, next);
          } else {
            // Otros errores 401 (credenciales inválidas, etc.)
            console.warn('Error de autenticación, limpiando sesión');
            this.clearAuthData();
            this.redirectToLogin();
          }
        }

        return throwError(() => error);
      })
    );
  }

  private handleTokenRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((response: any) => {
          this.isRefreshing = false;
          const newToken = response.token;
          localStorage.setItem('token', newToken);
          this.refreshTokenSubject.next(newToken);
          
          console.log('✅ Token renovado exitosamente');
          return next.handle(this.addToken(req, newToken));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          console.error('❌ Error al renovar token:', error);
          this.clearAuthData();
          this.redirectToLogin();
          return throwError(() => error);
        })
      );
    } else {
      // Si ya está renovando, esperar a que termine
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addToken(req, token)))
      );
    }
  }
}