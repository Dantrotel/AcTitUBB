import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (notification of notifications; track notification.id) {
        <div 
          class="toast toast-{{ notification.type }}"
          (click)="dismiss(notification.id)"
        >
          <div class="toast-icon">
            @switch (notification.type) {
              @case ('success') { <span>✅</span> }
              @case ('error') { <span>❌</span> }
              @case ('warning') { <span>⚠️</span> }
              @case ('info') { <span>ℹ️</span> }
            }
          </div>
          <div class="toast-content">
            @if (notification.title) {
              <div class="toast-title">{{ notification.title }}</div>
            }
            <div class="toast-message">{{ notification.message }}</div>
          </div>
          <button class="toast-close" (click)="dismiss(notification.id)">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 420px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
      background: white;
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
      pointer-events: auto;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .toast:hover {
      transform: translateX(-4px);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.2);
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .toast-success {
      border-left-color: #10b981;
    }

    .toast-error {
      border-left-color: #ef4444;
    }

    .toast-warning {
      border-left-color: #f59e0b;
    }

    .toast-info {
      border-left-color: #3b82f6;
    }

    .toast-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
      font-size: 0.95rem;
    }

    .toast-message {
      color: #4a4a4a;
      font-size: 0.9rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .toast-close {
      background: none;
      border: none;
      color: #999;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .toast-close:hover {
      background: #f0f0f0;
      color: #666;
    }

    @media (max-width: 640px) {
      .toast-container {
        top: 12px;
        right: 12px;
        left: 12px;
        max-width: none;
      }
    }
  `]
})
export class NotificationToastComponent {
  private notificationService = inject(NotificationService);
  notifications: Notification[] = [];

  constructor() {
    this.notificationService.notifications.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  dismiss(id: string) {
    this.notificationService.remove(id);
  }
}
