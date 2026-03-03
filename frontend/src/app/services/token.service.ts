import { Injectable } from '@angular/core';

export interface TokenPayload {
  rut: string;
  nombre: string;
  email?: string;
  rol_id: number;
  rol?: string;
  carrera?: string;
  exp: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private getRawToken(): string | null {
    return localStorage.getItem('token');
  }

  getPayload(): TokenPayload | null {
    const token = this.getRawToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])) as TokenPayload;
    } catch {
      return null;
    }
  }

  getRut(): string | null {
    return this.getPayload()?.rut ?? null;
  }

  getRolId(): number | null {
    return this.getPayload()?.rol_id ?? null;
  }

  getNombre(): string | null {
    return this.getPayload()?.nombre ?? null;
  }

  getCarrera(): string | null {
    return this.getPayload()?.carrera ?? null;
  }

  isExpired(): boolean {
    const payload = this.getPayload();
    if (!payload?.exp) return true;
    return payload.exp * 1000 < Date.now();
  }

  isValid(): boolean {
    return this.getPayload() !== null && !this.isExpired();
  }
}
