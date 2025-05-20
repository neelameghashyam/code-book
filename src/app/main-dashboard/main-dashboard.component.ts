import { Component, computed, signal, inject, ViewChild, OnInit } from '@angular/core';
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
import { TranslocoRootModule } from '../transloco-root.module';
import { CustomSidenavComponent } from '../custom-sidenav/custom-sidenav.component';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { ThemeService } from '../services/theme/theme.service';
import { UserComponent } from '../user/user.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-main-dashboard',
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
    UserComponent,
    TranslateModule
  ],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.scss'
})
export class MainDashboardComponent implements OnInit {
  title = 'Code Book';
  collapsed = signal(true);
  currentLanguage = signal('English'); // Default language display name

  constructor(private translateService: TranslateService) {
    // Set available languages
    this.translateService.addLangs(['en', 'fr']);
  }

  ngOnInit(): void {
    // Get language from localStorage or default to 'en'
    const storedLang = localStorage.getItem('lang') || 'en';
    this.translateService.setDefaultLang('en'); // Set default language
    this.translateService.use(storedLang); // Use stored or default language
    // Update currentLanguage signal based on stored language
    this.currentLanguage.set(storedLang === 'en' ? 'English' : 'French');
  }

  ChangeLang(langCode: string) {
    // Update translation service
    this.translateService.use(langCode);
    // Update localStorage
    localStorage.setItem('lang', langCode);
    // Update currentLanguage signal
    this.currentLanguage.set(langCode === 'en' ? 'English' : 'French');
  }

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