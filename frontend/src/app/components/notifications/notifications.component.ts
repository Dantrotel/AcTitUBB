import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div
        *ngFor="let notification of notifications"
        class="notification"
        [ngClass]="'notification-' + notification.type"
        [@slideIn]
        (click)="close(notification.id)"
      >
        <div class="notification-icon">
          <span *ngIf="notification.type === 'success'">✓</span>
          <span *ngIf="notification.type === 'error'">✕</span>
          <span *ngIf="notification.type === 'warning'">⚠</span>
          <span *ngIf="notification.type === 'info'">ℹ</span>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message" *ngIf="notification.message">
            {{ notification.message }}
          </div>
        </div>
        <button class="notification-close" (click)="close(notification.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(10px);
      cursor: pointer;
      pointer-events: auto;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      min-width: 320px;
      border-left: 4px solid;
    }

    .notification:hover {
      transform: translateX(-5px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .notification-success {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
      border-left-color: #28a745;
      color: #155724;
    }

    .notification-error {
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      border-left-color: #dc3545;
      color: #721c24;
    }

    .notification-warning {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
      border-left-color: #ffc107;
      color: #856404;
    }

    .notification-info {
      background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
      border-left-color: #17a2b8;
      color: #0c5460;
    }

    .notification-icon {
      font-size: 24px;
      font-weight: bold;
      min-width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 4px;
      word-wrap: break-word;
    }

    .notification-message {
      font-size: 13px;
      opacity: 0.9;
      line-height: 1.4;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.5;
      transition: opacity 0.2s;
      color: inherit;
    }

    .notification-close:hover {
      opacity: 1;
    }

    @media (max-width: 640px) {
      .notifications-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .notification {
        min-width: auto;
      }
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(400px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(400px)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.notificationService.notifications.subscribe(
      notifications => this.notifications = notifications
    );
  }

  close(id: string) {
    this.notificationService.remove(id);
  }
}
