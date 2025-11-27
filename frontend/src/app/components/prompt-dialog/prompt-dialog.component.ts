import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-prompt-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (dialog) {
      <div class="modal-overlay" (click)="onCancel()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ dialog.title }}</h3>
          </div>
          <div class="modal-body">
            <p>{{ dialog.message }}</p>
            <input 
              type="text" 
              [(ngModel)]="inputValue" 
              (keyup.enter)="onConfirm()"
              (keyup.escape)="onCancel()"
              class="input-field"
              autofocus
            />
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="onCancel()">
              {{ dialog.cancelText }}
            </button>
            <button class="btn btn-primary" (click)="onConfirm()">
              {{ dialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-dialog {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 90%;
      animation: slideUp 0.3s ease-out;
      overflow: hidden;
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
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1a1a1a;
    }

    .modal-body {
      padding: 24px;
    }

    .modal-body p {
      margin: 0 0 16px 0;
      color: #4a4a4a;
      line-height: 1.6;
    }

    .input-field {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s;
    }

    .input-field:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: #f5f5f5;
      color: #666;
    }

    .btn-secondary:hover {
      background: #e0e0e0;
    }

    .btn-primary {
      background: #0066cc;
      color: white;
    }

    .btn-primary:hover {
      background: #0052a3;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
    }

    .btn:active {
      transform: translateY(0);
    }
  `]
})
export class PromptDialogComponent {
  private notificationService = inject(NotificationService);
  dialog: any = null;
  inputValue: string = '';

  constructor() {
    this.notificationService.promptDialog.subscribe(dialog => {
      this.dialog = dialog;
      if (dialog) {
        this.inputValue = dialog.defaultValue || '';
      }
    });
  }

  onConfirm() {
    this.notificationService.dismissPrompt(this.inputValue);
  }

  onCancel() {
    this.notificationService.dismissPrompt(null);
  }
}
