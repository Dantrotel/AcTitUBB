import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private connected = false;

  constructor() {}

  /**
   * Conectar al servidor WebSocket
   */
  connect(token: string): void {
    if (this.socket && this.connected) {
      return; // Ya está conectado
    }

    this.socket = io(environment.apiUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
    });
  }

  /**
   * Desconectar del servidor WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Escuchar eventos del servidor
   */
  on(eventName: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  }

  /**
   * Dejar de escuchar eventos
   */
  off(eventName: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(eventName, callback);
      } else {
        this.socket.off(eventName);
      }
    }
  }

  /**
   * Emitir eventos al servidor
   */
  emit(eventName: string, data?: any): void {
    if (this.socket && this.connected) {
      this.socket.emit(eventName, data);
    }
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Obtener instancia del socket (para casos especiales)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Emitir cambio de página (para tracking de actividad)
   */
  emitPageChange(pageName: string): void {
    this.emit('page-change', pageName);
  }
}
