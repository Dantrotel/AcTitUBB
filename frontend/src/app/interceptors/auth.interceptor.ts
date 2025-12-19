import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor HTTP para agregar el token JWT a todas las peticiones
 * y manejar errores de autenticación (401).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  // Obtener el token del localStorage
  const token = localStorage.getItem('token');
  
  // Debug: Log para verificar que el interceptor funciona
  console.log('🔍 AuthInterceptor - URL:', req.url);
  console.log('🔑 AuthInterceptor - Token presente:', !!token);
  
  // Clonar la request y agregar el header de autorización si existe el token
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('✅ AuthInterceptor - Token agregado a headers');
  } else {
    console.warn('⚠️ AuthInterceptor - No hay token disponible');
  }
  
  // Procesar la request y manejar errores de autenticación
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('❌ AuthInterceptor - Error HTTP:', error.status, error.statusText);
      
      // Si es error 401 (no autorizado), limpiar datos y redirigir al login
      if (error.status === 401) {
        console.warn('🚫 AuthInterceptor - Error 401: Sesión no autorizada. Redirigiendo al login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('refreshToken');
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};

