import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgClass } from '@angular/common';
import { AuthService } from '../login/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    NgClass,
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent {
  showAvatar = true;
  user = {
    avatar: 'assets/image.png',
    status: 'online' as 'online' | 'away' | 'busy' | 'not-visible',
  };

  constructor(private authService: AuthService, private router: Router) {}

  updateUserStatus(status: 'online' | 'away' | 'busy' | 'not-visible'): void {
    this.user.status = status;
  }

  signOut(): void {
    this.authService.signout();
    this.router.navigate(['/login']);
  }
}