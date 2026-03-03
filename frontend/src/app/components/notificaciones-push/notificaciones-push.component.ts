// Componente de notificaciones push en tiempo real
import { Component, OnInit, OnDestroy, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

interface Notificacion {
  id?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
  action?: {
    label: string;
    url: string;
  };
}

@Component({
  selector: 'app-notificaciones-push',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notif-wrapper" (click)="$event.stopPropagation()">
      <!-- Botón campana -->
      <button class="btn-bell" (click)="toggleMenu()" title="Notificaciones">
        <i class="fas fa-bell"></i>
        @if (contadorNoLeidas() > 0) {
          <span class="notif-badge">{{ contadorNoLeidas() > 99 ? '99+' : contadorNoLeidas() }}</span>
        }
      </button>

      <!-- Panel desplegable -->
      @if (menuAbierto()) {
        <div class="notif-panel">
          <!-- Header -->
          <div class="notif-panel-header">
            <h3>
              <i class="fas fa-bell"></i>
              Notificaciones
            </h3>
            @if (notificaciones().length > 0) {
              <button class="btn-mark-all" (click)="marcarTodasLeidas()">
                <i class="fas fa-check-double"></i>
                Todas leídas
              </button>
            }
          </div>

          <!-- Cuerpo -->
          <div class="notif-panel-body">
            @if (notificaciones().length === 0) {
              <div class="notif-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No tienes notificaciones</p>
              </div>
            } @else {
              @for (notif of notificaciones(); track notif.id) {
                <div
                  class="notif-item"
                  [class.unread]="!notif.read"
                  [class.type-success]="notif.type === 'success'"
                  [class.type-error]="notif.type === 'error'"
                  [class.type-warning]="notif.type === 'warning'"
                  [class.type-info]="notif.type === 'info'"
                  (click)="handleNotificationClick(notif)">
                  <div class="notif-icon">
                    <i [class]="getIcon(notif.type)"></i>
                  </div>
                  <div class="notif-content">
                    <div class="notif-title">{{ notif.title }}</div>
                    <div class="notif-message">{{ notif.message }}</div>
                    <div class="notif-time">{{ formatTime(notif.timestamp) }}</div>
                  </div>
                  @if (!notif.read) {
                    <span class="notif-dot"></span>
                  }
                </div>
              }
            }
          </div>

          <!-- Footer -->
          @if (notificaciones().length > 0) {
            <div class="notif-panel-footer">
              <button class="btn-clear" (click)="limpiarNotificaciones()">
                <i class="fas fa-trash-alt"></i>
                Limpiar todas
              </button>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .notif-wrapper {
      position: relative;
    }

    .btn-bell {
      position: relative;
      background: transparent;
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;

      &:hover {
        background: rgba(255,255,255,0.15);
      }
    }

    .notif-badge {
      position: absolute;
      top: 2px;
      right: 2px;
      background: #e53935;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      padding: 0 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .notif-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 380px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      overflow: hidden;
      z-index: 1000;
    }

    .notif-panel-header {
      padding: 16px;
      background: linear-gradient(135deg, #004b8d 0%, #0066cc 100%);
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .btn-mark-all {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: #fff;
      font-size: 11px;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: background 0.2s;

      &:hover {
        background: rgba(255,255,255,0.25);
      }
    }

    .notif-panel-body {
      max-height: 380px;
      overflow-y: auto;

      &::-webkit-scrollbar { width: 5px; }
      &::-webkit-scrollbar-track { background: #f5f5f5; }
      &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    }

    .notif-empty {
      padding: 40px 20px;
      text-align: center;
      color: #999;

      i {
        font-size: 40px;
        margin-bottom: 12px;
        display: block;
        opacity: 0.4;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      position: relative;
      transition: background 0.15s;

      &:hover { background: #f7f9fc; }

      &.unread { background: #f0f7ff; }
      &.unread:hover { background: #e3eeff; }

      &.type-success .notif-icon { color: #388e3c; }
      &.type-error .notif-icon { color: #d32f2f; }
      &.type-warning .notif-icon { color: #f57c00; }
      &.type-info .notif-icon { color: #1976d2; }
    }

    .notif-icon {
      font-size: 22px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .notif-content {
      flex: 1;
      min-width: 0;
    }

    .notif-title {
      font-weight: 600;
      font-size: 13px;
      color: #222;
      margin-bottom: 3px;
    }

    .notif-message {
      font-size: 12px;
      color: #555;
      line-height: 1.45;
      margin-bottom: 4px;
      word-wrap: break-word;
    }

    .notif-time {
      font-size: 11px;
      color: #aaa;
    }

    .notif-dot {
      width: 8px;
      height: 8px;
      background: #1976d2;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 6px;
    }

    .notif-panel-footer {
      padding: 10px 16px;
      background: #fafafa;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: center;
    }

    .btn-clear {
      background: transparent;
      border: 1px solid #e53935;
      color: #e53935;
      font-size: 12px;
      padding: 5px 14px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

      &:hover {
        background: #ffebee;
      }
    }
  `]
})
export class NotificacionesPushComponent implements OnInit, OnDestroy {
  private socket: Socket | null = null;
  private primeraConexion = true;
  notificaciones = signal<Notificacion[]>([]);
  menuAbierto = signal(false);

  contadorNoLeidas = computed(() =>
    this.notificaciones().filter(n => !n.read).length
  );

  constructor(private router: Router) {}

  ngOnInit() {
    this.conectarSocket();
    this.cargarNotificacionesGuardadas();
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.menuAbierto()) {
      this.menuAbierto.set(false);
    }
  }

  toggleMenu() {
    this.menuAbierto.update(v => !v);
  }

  private conectarSocket() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = io(environment.wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      this.primeraConexion = false;
    });

    this.socket.on('connect_error', (error) => {});
    this.socket.on('reconnect', (attemptNumber) => {});
    this.socket.on('reconnect_attempt', (attemptNumber) => {});
    this.socket.on('reconnect_error', (error) => {});
    this.socket.on('reconnect_failed', () => {});

    const eventosNotificacion = [
      'propuesta:aprobada',
      'propuesta:rechazada',
      'reunion:solicitada',
      'reunion:confirmada',
      'reunion:recordatorio',
      'hito:proximo_vencimiento',
      'documento:revisado',
      'proyecto:asignado',
      'proyecto:inactividad',
      'proyecto:inactividad-estudiante',
      'fecha:recordatorio',
      'fecha:recordatorio-proyecto'
    ];

    eventosNotificacion.forEach(evento => {
      this.socket?.on(evento, (data) => {
        this.agregarNotificacion(data);
      });
    });

    this.socket.on('disconnect', (reason) => {
      if (this.primeraConexion) return;
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });
  }

  private agregarNotificacion(data: Notificacion) {
    const notificacion: Notificacion = {
      id: `notif_${Date.now()}_${Math.random()}`,
      ...data,
      timestamp: data.timestamp || new Date().toISOString(),
      read: false
    };

    const current = this.notificaciones();
    this.notificaciones.set([notificacion, ...current].slice(0, 50));
    this.guardarNotificaciones();
    this.mostrarNotificacionBrowser(notificacion);
  }

  private mostrarNotificacionBrowser(notif: Notificacion) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notif.title, {
        body: notif.message,
        icon: '/assets/logo.png',
        badge: '/assets/badge.png'
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notif.title, {
            body: notif.message,
            icon: '/assets/logo.png'
          });
        }
      });
    }
  }

  handleNotificationClick(notif: Notificacion) {
    const current = this.notificaciones();
    const updated = current.map(n =>
      n.id === notif.id ? { ...n, read: true } : n
    );
    this.notificaciones.set(updated);
    this.guardarNotificaciones();

    if (notif.action?.url) {
      this.router.navigate([notif.action.url]);
      this.menuAbierto.set(false);
    }
  }

  marcarTodasLeidas() {
    const updated = this.notificaciones().map(n => ({ ...n, read: true }));
    this.notificaciones.set(updated);
    this.guardarNotificaciones();
  }

  limpiarNotificaciones() {
    this.notificaciones.set([]);
    this.guardarNotificaciones();
  }

  private guardarNotificaciones() {
    localStorage.setItem('notificaciones', JSON.stringify(this.notificaciones()));
  }

  private cargarNotificacionesGuardadas() {
    try {
      const saved = localStorage.getItem('notificaciones');
      if (saved) {
        const notifs = JSON.parse(saved);
        this.notificaciones.set(notifs.slice(0, 50));
      }
    } catch (error) {}
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'fas fa-check-circle',
      error: 'fas fa-times-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[type] || 'fas fa-bell';
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;

    return date.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short'
    });
  }
}
