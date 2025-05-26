import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Inject } from '@angular/core';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-custom-sidenav',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, RouterModule, TranslateModule],
  templateUrl: './custom-sidenav.component.html',
  styleUrl: './custom-sidenav.component.scss',
})
export class CustomSidenavComponent {
  public responsiveService = inject(ResponsiveService);
  public darkModeService = inject(DarkModeService);

  menuItems = signal<MenuItem[]>([
    { icon: 'dashboard', label: 'Dashboard', route: 'dashboard' },
    { icon: 'pin_drop', label: 'Pincodes', route: 'pincode' },
    { icon: 'group', label: 'Users', route: 'users' },
    { icon: 'business_center', label: 'Business', route: 'business' },
    { icon: 'business', label: 'Business List', route: 'business-list' },
  ]);

  sideNavCollapsed = signal(false);

  @Input() collapsed = false;
  @Output() toggleSidenav = new EventEmitter<void>();
  @Output() closeSidenav = new EventEmitter<void>();

  constructor(@Inject(TranslateService) private translateService: TranslateService) {}
}