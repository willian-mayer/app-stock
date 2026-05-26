import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  navItems = [
    { path: '/dashboard', icon: '▦', label: 'Dashboard' },
    { path: '/products', icon: '◈', label: 'Products' },
    { path: '/categories', icon: '⊞', label: 'Categories' },
  ];

  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
  }
}
