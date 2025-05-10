import { Component, ViewChild, ElementRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    NgClass
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'] // Note: Can be removed if using Tailwind CSS exclusively
})
export class UserComponent {
  @ViewChild('avatarUpload') avatarUpload!: ElementRef<HTMLInputElement>;

  showAvatar = true;
  user = {
    avatar: 'assets/image.png',
    status: 'online' as 'online' | 'away' | 'busy' | 'not-visible'
  };

  
  updateUserStatus(status: 'online' | 'away' | 'busy' | 'not-visible'): void {
    this.user.status = status;
  }

  signOut(): void {
    console.log('Sign out clicked');
  }
}