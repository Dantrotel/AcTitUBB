import { Component } from '@angular/core';
import { ChatComponent } from '../../../components/chat/chat.component';
import { NavbarComponent } from '../../../components/navbar/navbar.component';

@Component({
  selector: 'app-admin-chat',
  standalone: true,
  imports: [NavbarComponent, ChatComponent],
  template: `
    <app-navbar></app-navbar>
    <app-chat></app-chat>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AdminChatComponent {}
