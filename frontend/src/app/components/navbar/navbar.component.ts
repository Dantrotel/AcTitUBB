import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface NavbarAction {
  icon: string;
  label: string;
  action?: () => void;
  route?: string;
  dropdown?: NavbarAction[];
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @Input() userName: string = '';
  @Input() userRole: 'estudiante' | 'profesor' | 'admin' | 'superadmin' = 'estudiante';
  @Input() actions: NavbarAction[] = [];
  @Input() showBackButton: boolean = false;
  @Input() pageTitle: string = 'AcTitUBB';
  
  @Output() logout = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  
  showUserMenu = false;
  activeDropdown: number | null = null;

  constructor(private router: Router) {}

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.activeDropdown = null;
    }
  }

  toggleDropdown(index: number): void {
    this.activeDropdown = this.activeDropdown === index ? null : index;
    if (this.activeDropdown !== null) {
      this.showUserMenu = false;
    }
  }

  executeAction(action: NavbarAction, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (action.action) {
      action.action();
    } else if (action.route) {
      this.router.navigate([action.route]);
    }
    
    // Cerrar menús
    this.activeDropdown = null;
    this.showUserMenu = false;
  }

  onLogout(): void {
    this.logout.emit();
  }

  onBack(): void {
    this.back.emit();
  }

  goToProfile(): void {
    this.router.navigate(['/perfil']);
  }

  goToHome(): void {
    switch (this.userRole) {
      case 'estudiante':
        this.router.navigate(['/estudiante']);
        break;
      case 'profesor':
        this.router.navigate(['/profesor']);
        break;
      case 'admin':
        this.router.navigate(['/admin']);
        break;
      case 'superadmin':
        this.router.navigate(['/super-admin']);
        break;
    }
  }

  getRoleLabel(): string {
    switch (this.userRole) {
      case 'estudiante': return 'Estudiante';
      case 'profesor': return 'Profesor';
      case 'admin': return 'Jefe de Curso';
      case 'superadmin': return 'Super Admin';
      default: return 'Usuario';
    }
  }
}

