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

  

  // Optional: Handle file selection for avatar upload
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Example: Update user.avatar with a local URL for preview
      const reader = new FileReader();
      reader.onload = () => {
        this.user.avatar = reader.result as string;
      };
      reader.readAsDataURL(file);
      // Add logic to upload the file to a server if needed
      console.log('Selected file:', file);
    }
  }

  updateUserStatus(status: 'online' | 'away' | 'busy' | 'not-visible'): void {
    this.user.status = status;
  }

  signOut(): void {
    console.log('Sign out clicked');
  }
}