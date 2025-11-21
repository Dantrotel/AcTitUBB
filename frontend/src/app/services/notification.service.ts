import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  public notifications = this.notifications$.asObservable();

  show(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration: number = 5000) {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration,
      timestamp: new Date()
    };

    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    // Auto-remove después de la duración especificada
    if (duration > 0) {
      setTimeout(() => this.remove(notification.id), duration);
    }
  }

  success(title: string, message: string = '', duration: number = 4000) {
    this.show('success', title, message, duration);
  }

  error(title: string, message: string = '', duration: number = 6000) {
    this.show('error', title, message, duration);
  }

  warning(title: string, message: string = '', duration: number = 5000) {
    this.show('warning', title, message, duration);
  }

  info(title: string, message: string = '', duration: number = 4000) {
    this.show('info', title, message, duration);
  }

  remove(id: string) {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.id !== id));
  }

  clear() {
    this.notifications$.next([]);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
