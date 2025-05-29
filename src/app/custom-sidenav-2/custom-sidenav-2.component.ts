import { Component, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core'; // Import TranslatePipe
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';

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
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    RouterModule,
    TranslatePipe, // Add TranslatePipe to imports
  ],
  templateUrl: './custom-sidenav-2.component.html',
  styleUrls: ['./custom-sidenav-2.component.scss'],
})
export class CustomSidenav2Component {
  sideNavCollapsed = signal<boolean>(false);
  @Input() set collapsed(val: boolean) {
    this.sideNavCollapsed.set(val);
  }

  menuItems = signal<MenuItem[]>([
    { icon: 'dashboard', label: 'DASHBOARD', route: 'dashboard' },
    {
      icon: 'category',
      label: 'CATEGORIES',
      route: 'categories',
      subItems: [{ icon: 'dashboard_customize', label: 'SUBCATEGORIES', route: 'sub-categories' }],
      isExpanded: false,
    },
    { icon: 'pin_drop', label: 'PINCODES', route: 'pincodes' },
    { icon: 'shopping_cart', label: 'PRODUCTS', route: 'products' },
    { icon: 'people', label: 'USERS', route: 'users' },
    { icon: 'receipt_long', label: 'ORDERS', route: 'orders' },
  ]);

  constructor(
    public responsiveService: ResponsiveService,
    public darkModeService: DarkModeService
  ) {}

  toggleSubMenu(item: MenuItem): void {
    if (item.subItems) {
      this.menuItems.update(items =>
        items.map(i => ({
          ...i,
          isExpanded: i === item ? !i.isExpanded : false,
        }))
      );
    }
  }
}