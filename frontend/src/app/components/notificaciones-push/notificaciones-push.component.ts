// Componente de notificaciones push en tiempo real
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { io, Socket } from 'socket.io-client';
import { Router } from '@angular/router';

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
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatTooltipModule
  ],
  template: `
    <div class="notificaciones-container">
      <button 
        mat-icon-button 
        [matMenuTriggerFor]="menu"
        [matBadge]="contadorNoLeidas()"
        [matBadgeHidden]="contadorNoLeidas() === 0"
        matBadgeColor="warn"
        matTooltip="Notificaciones"
        class="notification-button">
        <mat-icon>notifications</mat-icon>
      </button>

      <mat-menu #menu="matMenu" class="notifications-menu" xPosition="before">
        <div class="notifications-header" (click)="$event.stopPropagation()">
          <h3>
            <mat-icon>notifications_active</mat-icon>
            Notificaciones
          </h3>
          @if (notificaciones().length > 0) {
            <button mat-button (click)="marcarTodasLeidas()" class="mark-all-read">
              <mat-icon>done_all</mat-icon>
              Marcar todas como leídas
            </button>
          }
        </div>

        <div class="notifications-body">
          @if (notificaciones().length === 0) {
            <div class="no-notifications">
              <mat-icon>notifications_none</mat-icon>
              <p>No tienes notificaciones</p>
            </div>
          } @else {
            @for (notif of notificaciones(); track notif.id) {
              <div 
                class="notification-item"
                [class.unread]="!notif.read"
                [class.notification-success]="notif.type === 'success'"
                [class.notification-error]="notif.type === 'error'"
                [class.notification-warning]="notif.type === 'warning'"
                [class.notification-info]="notif.type === 'info'"
                (click)="handleNotificationClick(notif)">
                
                <div class="notification-icon">
                  <mat-icon>{{ getIcon(notif.type) }}</mat-icon>
                </div>

                <div class="notification-content">
                  <div class="notification-title">{{ notif.title }}</div>
                  <div class="notification-message">{{ notif.message }}</div>
                  <div class="notification-time">{{ formatTime(notif.timestamp) }}</div>
                </div>

                @if (!notif.read) {
                  <div class="notification-badge"></div>
                }
              </div>
            }
          }
        </div>

        @if (notificaciones().length > 0) {
          <div class="notifications-footer" (click)="$event.stopPropagation()">
            <button mat-button (click)="limpiarNotificaciones()" class="clear-all">
              <mat-icon>delete_sweep</mat-icon>
              Limpiar todas
            </button>
          </div>
        }
      </mat-menu>
    </div>
  `,
  styles: [`
    .notificaciones-container {
      position: relative;
    }

    .notification-button {
      color: #fff;
    }

    ::ng-deep .notifications-menu {
      .mat-mdc-menu-content {
        padding: 0 !important;
      }
    }

    .notifications-header {
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      .mark-all-read {
        color: white;
        font-size: 12px;
        padding: 4px 12px;
        min-width: auto;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          margin-right: 4px;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }

    .notifications-body {
      max-height: 400px;
      overflow-y: auto;
      min-width: 380px;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
      }

      &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;

        &:hover {
          background: #555;
        }
      }
    }

    .no-notifications {
      padding: 40px 20px;
      text-align: center;
      color: #999;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    .notification-item {
      display: flex;
      gap: 12px;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;

      &:hover {
        background: #f5f5f5;
      }

      &.unread {
        background: #f0f7ff;

        &:hover {
          background: #e3f2fd;
        }
      }

      &.notification-success .notification-icon {
        color: #4caf50;
      }

      &.notification-error .notification-icon {
        color: #f44336;
      }

      &.notification-warning .notification-icon {
        color: #ff9800;
      }

      &.notification-info .notification-icon {
        color: #2196f3;
      }

      .notification-icon {
        flex-shrink: 0;
        
        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
      }

      .notification-content {
        flex: 1;
        min-width: 0;

        .notification-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
          color: #333;
        }

        .notification-message {
          font-size: 13px;
          color: #666;
          line-height: 1.4;
          margin-bottom: 4px;
          word-wrap: break-word;
        }

        .notification-time {
          font-size: 11px;
          color: #999;
        }
      }

      .notification-badge {
        width: 8px;
        height: 8px;
        background: #2196f3;
        border-radius: 50%;
        position: absolute;
        top: 20px;
        right: 16px;
      }
    }

    .notifications-footer {
      padding: 12px;
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: center;

      .clear-all {
        color: #f44336;
        font-size: 13px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          margin-right: 4px;
        }

        &:hover {
          background: rgba(244, 67, 54, 0.05);
        }
      }
    }
  `]
})
export class NotificacionesPushComponent implements OnInit, OnDestroy {
  private socket: Socket | null = null;
  private primeraConexion = true;
  notificaciones = signal<Notificacion[]>([]);
  
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

  private conectarSocket() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = io('http://localhost:3000', {
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

    this.socket.on('connect_error', (error) => {
    });

    this.socket.on('reconnect', (attemptNumber) => {
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
    });

    this.socket.on('reconnect_error', (error) => {
    });

    this.socket.on('reconnect_failed', () => {
    });

    // Escuchar todos los tipos de notificaciones
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
      'fecha:recordatorio-proyecto',
      'evaluacion:pendiente-urgente'
    ];

    eventosNotificacion.forEach(evento => {
      this.socket?.on(evento, (data) => {
        this.agregarNotificacion(data);
      });
    });

    this.socket.on('disconnect', (reason) => {
      // No mostrar mensajes de desconexión durante el proceso de conexión inicial
      if (this.primeraConexion) {
        return;
      }
      
      if (reason === 'io server disconnect') {
        // El servidor forzó la desconexión, reconectar manualmente
        this.socket?.connect();
      } else if (reason === 'io client disconnect') {
        // Desconexión manual, no mostrar error
      } else {
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
    this.notificaciones.set([notificacion, ...current].slice(0, 50)); // Máximo 50 notificaciones
    
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
    // Marcar como leída
    const current = this.notificaciones();
    const updated = current.map(n => 
      n.id === notif.id ? { ...n, read: true } : n
    );
    this.notificaciones.set(updated);
    this.guardarNotificaciones();

    // Navegar si tiene acción
    if (notif.action?.url) {
      this.router.navigate([notif.action.url]);
    }
  }

  marcarTodasLeidas() {
    const current = this.notificaciones();
    const updated = current.map(n => ({ ...n, read: true }));
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
    } catch (error) {
    }
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type] || 'notifications';
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
