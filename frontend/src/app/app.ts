import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';
import { NotificationToastComponent } from './components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule, 
    RouterOutlet, 
    NotificationsComponent,
    ConfirmDialogComponent,
    PromptDialogComponent,
    NotificationToastComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'AcTitUBB';
}
