import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, Notification, ConfirmDialog, PromptDialog } from '../../services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Toast Notifications -->
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

    <!-- Confirm Dialog -->
    @if (confirmDialog) {
      <div class="modal-overlay" (click)="onConfirm(false)">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ confirmDialog.title }}</h3>
          </div>
          <div class="modal-body">
            <p>{{ confirmDialog.message }}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="onConfirm(false)">
              {{ confirmDialog.cancelText }}
            </button>
            <button class="btn btn-primary" (click)="onConfirm(true)">
              {{ confirmDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Prompt Dialog -->
    @if (promptDialog) {
      <div class="modal-overlay" (click)="onPrompt(null)">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ promptDialog.title }}</h3>
          </div>
          <div class="modal-body">
            <p>{{ promptDialog.message }}</p>
            <input 
              type="text" 
              [(ngModel)]="promptValue" 
              class="form-control"
              (keyup.enter)="onPrompt(promptValue)"
              #promptInput
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="onPrompt(null)">
              {{ promptDialog.cancelText }}
            </button>
            <button class="btn btn-primary" (click)="onPrompt(promptValue)">
              {{ promptDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
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

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-dialog {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .modal-header {
      padding: 24px 24px 16px;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-body p {
      margin: 0 0 16px 0;
      color: #4b5563;
      line-height: 1.6;
    }

    .form-control {
      width: 100%;
      padding: 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .modal-footer {
      padding: 16px 24px 24px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #4b5563;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    @media (max-width: 640px) {
      .modal-dialog {
        width: 95%;
      }

      .modal-header {
        padding: 20px 20px 12px;
      }

      .modal-body {
        padding: 20px;
      }

      .modal-footer {
        padding: 12px 20px 20px;
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class NotificationToastComponent {
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  
  notifications: Notification[] = [];
  confirmDialog: ConfirmDialog | null = null;
  promptDialog: PromptDialog | null = null;
  promptValue: string = '';

  constructor() {
    console.log('🍞 NotificationToastComponent inicializado');
    
    this.notificationService.notifications.subscribe(notifications => {
      console.log('🍞 Toast recibió notificaciones:', notifications.length, notifications);
      setTimeout(() => {
        this.notifications = notifications;
        console.log('🍞 Notificaciones actualizadas');
      });
    });

    this.notificationService.confirmDialog.subscribe(dialog => {
      console.log('🔔 Modal de confirmación recibido:', dialog);
      this.confirmDialog = dialog;
      this.cdr.detectChanges();
      console.log('✅ ChangeDetectorRef.detectChanges() llamado');
    });

    this.notificationService.promptDialog.subscribe(dialog => {
      this.promptDialog = dialog;
      if (dialog) {
        this.promptValue = dialog.defaultValue;
      }
      this.cdr.detectChanges();
      
      // Focus input after a tick
      if (dialog) {
        setTimeout(() => {
          const input = document.querySelector('.modal-dialog input') as HTMLInputElement;
          if (input) input.focus();
        }, 100);
      }
    });
  }

  dismiss(id: string) {
    this.notificationService.remove(id);
  }

  onConfirm(confirmed: boolean) {
    this.notificationService.dismissConfirm(confirmed);
  }

  onPrompt(value: string | null) {
    this.notificationService.dismissPrompt(value);
  }
}
