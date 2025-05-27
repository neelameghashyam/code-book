import { Component, computed, Input, signal, inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  subItems?: MenuItem[];
  isExpanded?: boolean;
}

@Component({
  selector: 'app-custom-sidenav-2',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, RouterModule, TranslateModule],
  templateUrl: './custom-sidenav-2.component.html',
  styleUrls: ['./custom-sidenav-2.component.scss']
})
export class CustomSidenav2Component {
  public responsiveService = inject(ResponsiveService);
  public darkModeService = inject(DarkModeService);
  private translateService = inject(TranslateService);

  menuItems = signal<MenuItem[]>([
    { icon: 'dashboard', label: 'DASHBOARD', route: 'dashboard' },
    {
      icon: 'category', label: 'CATEGORIES', route: 'categories',
      subItems: [
        { icon: 'dashboard_customize', label: 'SUBCATEGORIES', route: 'sub-categories' },
      ],
      isExpanded: false,
    },
    { icon: 'pin_drop', label: 'PINCODES', route: 'pincode' },
    { icon: 'group', label: 'USERS', route: 'users' },
    { icon: 'business_center', label: 'BUSINESS', route: 'business' },
    { icon: 'business', label: 'BUSINESS_LIST', route: 'business-list' },
  ]);

  sideNavCollapsed = signal(false);

  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  toggleSubMenu(item: MenuItem): void {
    if (item.subItems) {
      this.menuItems.update(items =>
        items.map(i => ({
          ...i,
          isExpanded: i === item ? !i.isExpanded : false
        }))
      );
    }
  }
}