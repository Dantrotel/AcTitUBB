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

export interface ConfirmDialog {
  id: string;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve: (confirmed: boolean) => void;
}

export interface PromptDialog {
  id: string;
  title: string;
  message: string;
  defaultValue: string;
  confirmText: string;
  cancelText: string;
  resolve: (value: string | null) => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  public notifications = this.notifications$.asObservable();
  
  private confirmDialog$ = new BehaviorSubject<ConfirmDialog | null>(null);
  public confirmDialog = this.confirmDialog$.asObservable();
  
  private promptDialog$ = new BehaviorSubject<PromptDialog | null>(null);
  public promptDialog = this.promptDialog$.asObservable();

  show(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration: number = 5000) {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration,
      timestamp: new Date()
    };

    console.log('🔔 NotificationService.show() llamado:', {
      type,
      title,
      message,
      duration,
      notificationId: notification.id
    });

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

  // Confirmación
  confirm(
    message: string, 
    title: string = '¿Estás seguro?', 
    confirmText: string = 'Confirmar', 
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmDialog$.next({
        id: this.generateId(),
        title,
        message,
        confirmText,
        cancelText,
        resolve
      });
    });
  }

  dismissConfirm(confirmed: boolean) {
    const dialog = this.confirmDialog$.value;
    if (dialog) {
      dialog.resolve(confirmed);
      this.confirmDialog$.next(null);
    }
  }

  // Prompt
  prompt(
    message: string, 
    title: string = 'Ingrese un valor', 
    defaultValue: string = '', 
    confirmText: string = 'Aceptar', 
    cancelText: string = 'Cancelar'
  ): Promise<string | null> {
    return new Promise((resolve) => {
      this.promptDialog$.next({
        id: this.generateId(),
        title,
        message,
        defaultValue,
        confirmText,
        cancelText,
        resolve
      });
    });
  }

  dismissPrompt(value: string | null) {
    const dialog = this.promptDialog$.value;
    if (dialog) {
      dialog.resolve(value);
      this.promptDialog$.next(null);
    }
  }
}
