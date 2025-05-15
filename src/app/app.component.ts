import { Component, computed, signal, inject, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSidenav } from '@angular/material/sidenav';
import { TranslocoRootModule } from './transloco-root.module';
import { CustomSidenavComponent } from './custom-sidenav/custom-sidenav.component';
import { ResponsiveService } from './services/responsive/responsive.service';
import { DarkModeService } from './services/dark-mode.service';
import { ThemeService } from './services/theme/theme.service';
import { UserComponent } from './user/user.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    TranslocoRootModule,
    CustomSidenavComponent,
    UserComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Code Book';
  collapsed = signal(true);
  currentLanguage = signal('English');

  public responsiveService = inject(ResponsiveService);
  public darkModeService = inject(DarkModeService);
  themeService = inject(ThemeService);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  // Compute aria-label for dark mode themes
  getThemeAriaLabel(themeName: string): string {
    return `${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme`;
  }

  // Compute aria-label for color themes
  getColorThemeAriaLabel(displayName: string): string {
    return `${displayName} color theme`;
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  setLanguage(lang: string) {
    this.currentLanguage.set(lang === 'en' ? 'English' : 'French');
  }

  sidenavWidth = computed(() => {
    if (this.responsiveService.isMobile()) return '280px';
    return this.collapsed() ? '64px' : '200px';
  });

  sidenavMode = computed(() => {
    return this.responsiveService.isMobile() ? 'over' : 'side';
  });

  sidenavOpened = computed(() => {
    return !this.responsiveService.isMobile() || !this.collapsed();
  });

  toggleSidenav() {
    this.collapsed.set(!this.collapsed());
  }
}