import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BusinessStore } from '../store/business.store';
import { DarkModeService } from '../../../services/dark-mode.service';
import { ResponsiveService } from '../../../services/responsive/responsive.service';

@Component({
  selector: 'app-list-businesses',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './list-businesses.component.html'
})
export class ListBusinessesComponent {
public darkModeService = inject(DarkModeService);
public responsiveService = inject(ResponsiveService);
    
  private businessStore = inject(BusinessStore);
  businesses = this.businessStore.businesses;

  deleteBusiness(id: string) {
    if (confirm('Are you sure you want to delete this business?')) {
      this.businessStore.deleteBusiness(id);
    }
  }
}