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
import { CustomSidenav2Component } from '../custom-sidenav-2/custom-sidenav-2.component';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { ThemeService } from '../services/theme/theme.service';
import { UserComponent } from '../user/user.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-main-dashboard-2',
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
    CustomSidenav2Component,
    UserComponent,
    TranslateModule,
  ],
  templateUrl: './main-dashboard-2.component.html',
  styleUrl: './main-dashboard-2.component.scss',
})
export class MainDashboard2Component implements OnInit {
  title = 'Code Book';
  collapsed = signal(false);
  currentLanguage = signal('English');

  constructor(private translateService: TranslateService) {
    this.translateService.addLangs(['en', 'fr']);
  }

  ngOnInit(): void {
    const storedLang = localStorage.getItem('lang') || 'en';
    this.translateService.setDefaultLang('en');
    this.translateService.use(storedLang);
    this.currentLanguage.set(storedLang === 'en' ? 'English' : 'French');
  }

  ChangeLang(langCode: string) {
    this.translateService.use(langCode);
    localStorage.setItem('lang', langCode);
    this.currentLanguage.set(langCode === 'en' ? 'English' : 'French');
  }

  public responsiveService = inject(ResponsiveService);
  public darkModeService = inject(DarkModeService);
  themeService = inject(ThemeService);

  @ViewChild('sidenav') sidenav!: MatSidenav;

  getThemeAriaLabel(themeName: string): string {
    return `${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme`;
  }

  getColorThemeAriaLabel(displayName: string): string {
    return `${displayName} color theme`;
  }

  toggleFullScreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  sidenavWidth = computed(() => {
    if (this.responsiveService.isMobile()) return '200px';
    return this.collapsed() ? '60px' : '200px';
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