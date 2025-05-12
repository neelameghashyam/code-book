import { Component } from '@angular/core';
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
  styleUrls: ['./user.component.scss']
})
export class UserComponent {
[x: string]: any;
  showAvatar = true;
  user = {
    avatar: '/assets/image.png',
    status: 'online' as 'online' | 'away' | 'busy' | 'not-visible'
  };


  updateUserStatus(status: 'online' | 'away' | 'busy' | 'not-visible'): void {
    this.user.status = status;
  }

  signOut(): void {
    console.log('Sign out clicked');
    // Add your sign out logic here
  }
}