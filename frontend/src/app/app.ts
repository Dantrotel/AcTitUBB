import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { NotificationToastComponent } from './components/notification-toast/notification-toast.component';
import { NotificacionesPushComponent } from './components/notificaciones-push/notificaciones-push.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule, 
    RouterOutlet, 
    NotificationsComponent,
    NotificationToastComponent,
    NotificacionesPushComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'AcTitUBB';
}
