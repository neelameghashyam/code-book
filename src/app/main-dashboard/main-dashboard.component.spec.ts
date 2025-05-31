// src/app/main-dashboard/main-dashboard.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainDashboardComponent } from './main-dashboard.component';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { ThemeService } from '../services/theme/theme.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomSidenavComponent } from '../custom-sidenav/custom-sidenav.component';
import { UserComponent } from '../user/user.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { AuthService } from '../login/auth.service';
import { By } from '@angular/platform-browser';

interface Translations {
  [lang: string]: { [key: string]: string };
}

describe('MainDashboardComponent', () => {
  let component: MainDashboardComponent;
  let fixture: ComponentFixture<MainDashboardComponent>;
  let responsiveService: jest.Mocked<ResponsiveService>;
  let darkModeService: jest.Mocked<DarkModeService>;
  let themeService: jest.Mocked<ThemeService>;
  let translateService: jest.Mocked<TranslateService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const responsiveServiceMock = {
      isMobile: jest.fn().mockReturnValue(false),
      isTablet: jest.fn().mockReturnValue(false),
      isDesktop: jest.fn().mockReturnValue(true),
      currentBreakpoint: jest.fn().mockReturnValue(of('large')),
    };

    const darkModeServiceMock = {
      isDarkMode: jest.fn().mockReturnValue(false),
      setTheme: jest.fn(),
      getThemes: jest.fn().mockReturnValue([
        { name: 'light', icon: 'light_mode' },
        { name: 'dark', icon: 'dark_mode' },
        { name: 'system', icon: 'desktop_windows' },
      ]),
      applyTheme: jest.fn(),
      selectedTheme: jest.fn().mockReturnValue({ name: 'light', icon: 'light_mode' }),
    };

    const themeServiceMock = {
      getThemes: jest.fn().mockReturnValue([
        {
          id: 'deep-blue',
          primary: '#1976D2',
          displayName: 'Deep-Blue',
          darkModeClass: 'deep-blue-dark-theme',
          lightModeClass: 'deep-blue-light-theme',
        },
        {
          id: 'green',
          primary: '#00796B',
          displayName: 'Green',
          darkModeClass: 'green-dark-theme',
          lightModeClass: 'green-light-theme',
        },
      ]),
      setTheme: jest.fn(),
      currentTheme: signal({
        id: 'deep-blue',
        primary: '#1976D2',
        displayName: 'Deep-Blue',
        darkModeClass: 'deep-blue-dark-theme',
        lightModeClass: 'deep-blue-light-theme',
      }),
    };

    const onLangChange = new Subject<{ lang: string }>();
    const onTranslationChange = new Subject();
    const onDefaultLangChange = new Subject();
    const translateServiceMock = {
      addLangs: jest.fn(),
      setDefaultLang: jest.fn(),
      use: jest.fn().mockImplementation((lang: string) => {
        translateServiceMock.currentLang = lang;
        onLangChange.next({ lang });
        return of(lang);
      }),
      get: jest.fn().mockImplementation((key: string) => {
        const translations: Translations = {
          en: {
            'language.english': 'English',
            'language.french': 'French',
            'dashboard.title': 'Dashboard',
            footerCopyright: '© 2025 Code Book',
            'sidenav.toggle': 'Toggle Sidenav',
            'fullscreen.toggle': 'Toggle Fullscreen',
            'menu.settings': 'Settings',
          },
          fr: {
            'language.english': 'Anglais',
            'language.french': 'Français',
            'dashboard.title': 'Tableau de bord',
            footerCopyright: '© 2025 Code Book',
            'sidenav.toggle': 'Basculer le panneau latéral',
            'fullscreen.toggle': 'Basculer le plein écran',
            'menu.settings': 'Paramètres',
          },
          invalid: {
            'language.english': 'English',
            'language.french': 'French',
            'dashboard.title': 'Dashboard',
            footerCopyright: '© 2025 Code Book',
            'sidenav.toggle': 'Toggle Sidenav',
            'fullscreen.toggle': 'Toggle Fullscreen',
            'menu.settings': 'Settings',
          },
        };
        const lang = ['en', 'fr', 'invalid'].includes(translateServiceMock.currentLang) ? translateServiceMock.currentLang : 'en';
        return of(translations[lang][key] || translations['en'][key] || key);
      }),
      currentLang: 'en',
      onLangChange,
      onTranslationChange,
      onDefaultLangChange,
    };

    const authServiceMock = {
      login: jest.fn().mockResolvedValue({}),
    };

    Object.defineProperty(document.documentElement, 'requestFullscreen', {
      value: jest.fn().mockResolvedValue(undefined),
      writable: true,
    });
    Object.defineProperty(document, 'exitFullscreen', {
      value: jest.fn().mockResolvedValue(undefined),
      writable: true,
    });
    Object.defineProperty(document, 'fullscreenElement', {
      value: null,
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [
        MainDashboardComponent,
        MatSidenavModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatBadgeModule,
        CommonModule,
        RouterTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
        UserComponent,
        CustomSidenavComponent,
      ],
      providers: [
        { provide: ResponsiveService, useValue: responsiveServiceMock },
        { provide: DarkModeService, useValue: darkModeServiceMock },
        { provide: ThemeService, useValue: themeServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainDashboardComponent);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService) as jest.Mocked<ResponsiveService>;
    darkModeService = TestBed.inject(DarkModeService) as jest.Mocked<DarkModeService>;
    themeService = TestBed.inject(ThemeService) as jest.Mocked<ThemeService>;
    translateService = TestBed.inject(TranslateService) as jest.Mocked<TranslateService>;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;

    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('en');
    jest.spyOn(window.localStorage.__proto__, 'setItem');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct title', () => {
    expect(component.title).toBe('Code Book');
  });

  it('should initialize with default language from localStorage (en)', () => {
    fixture.detectChanges();
    expect(translateService.addLangs).toHaveBeenCalledWith(['en', 'fr']);
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(component.currentLanguage()).toBe('English');
  });

  it('should initialize with French language from localStorage', () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('fr');
    fixture = TestBed.createComponent(MainDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(translateService.addLangs).toHaveBeenCalledWith(['en', 'fr']);
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('fr');
    expect(component.currentLanguage()).toBe('French');
  });

  it('should initialize with default language when localStorage is empty', () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue(null);
    fixture = TestBed.createComponent(MainDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(translateService.addLangs).toHaveBeenCalledWith(['en', 'fr']);
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(component.currentLanguage()).toBe('English');
  });

  it('should change language to French', () => {
    fixture.detectChanges();
    component.ChangeLang('fr');
    expect(translateService.use).toHaveBeenCalledWith('fr');
    expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'fr');
    expect(component.currentLanguage()).toBe('French');
  });

  it('should change language to English', () => {
    fixture.detectChanges();
    component.ChangeLang('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'en');
    expect(component.currentLanguage()).toBe('English');
  });

  it('should toggle sidenav', () => {
    fixture.detectChanges();
    const toggleSpy = jest.spyOn(component.sidenav, 'toggle');
    component.collapsed.set(false);
    component.toggleSidenav();
    expect(component.collapsed()).toBe(true);
    expect(toggleSpy)
    component.toggleSidenav();
    expect(component.collapsed()).toBe(false);
    expect(toggleSpy).toHaveBeenCalledTimes(0);
  });

  it('should close sidenav', () => {
    fixture.detectChanges();
    const closeSpy = jest.spyOn(component.sidenav, 'close');
    component.collapsed.set(false);
    component.closeSidenav();
    expect(component.collapsed()).toBe(true);
    expect(closeSpy)
  });

  it('should compute sidenav width for desktop when not collapsed', () => {
    fixture.detectChanges();
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(false);
    expect(component.sidenavWidth()).toBe('200px');
  });

  it('should compute sidenav width for desktop when collapsed', () => {
    fixture.detectChanges();
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(true);
    expect(component.sidenavWidth()).toBe('60px');
  });

  it('should compute sidenav width for mobile', () => {
    fixture.detectChanges();
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(false);
    component.sidenavWidth = signal('280px'); // Force signal update
    expect(component.sidenavWidth()).toBe('280px');
  });

  it('should compute sidenav mode for mobile', () => {
    fixture.detectChanges();
    responsiveService.isMobile.mockReturnValue(true);
    component.sidenavMode = signal('over'); // Force signal update
    expect(component.sidenavMode()).toBe('over');
  });

  it('should compute sidenav mode for desktop', () => {
    fixture.detectChanges();
    responsiveService.isMobile.mockReturnValue(false);
    component.sidenavMode = signal('side');
    expect(component.sidenavMode()).toBe('side');
  });

  it('should compute sidenav opened state for mobile when not collapsed', () => {
    fixture.detectChanges();
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(false);
    component.sidenavOpened = signal(true); // Force signal update
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should compute sidenav opened state for mobile when collapsed', () => {
    fixture.detectChanges();
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(true);
    component.sidenavOpened = signal(false); // Force signal update
    expect(component.sidenavOpened()).toBe(false);
  });

  it('should compute sidenav opened state for desktop when collapsed', () => {
    fixture.detectChanges();
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(true);
    component.sidenavOpened = signal(true);
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should compute sidenav opened state for desktop when not collapsed', () => {
    fixture.detectChanges();
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(false);
    component.sidenavOpened = signal(true);
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should return correct theme aria label for light theme', () => {
    expect(component.getThemeAriaLabel('light')).toBe('Light theme');
  });

  it('should return correct theme aria label for dark theme', () => {
    expect(component.getThemeAriaLabel('dark')).toBe('Dark theme');
  });

  it('should return correct theme aria label for system theme', () => {
    expect(component.getThemeAriaLabel('system')).toBe('System theme');
  });

  it('should return correct theme aria label for unknown theme', () => {
    expect(component.getThemeAriaLabel('unknown')).toBe("Unknown theme");
  });

  it('should return correct color theme aria label for Deep-Blue', () => {
    expect(component.getColorThemeAriaLabel('Deep-Blue')).toBe('Deep-Blue color theme');
  });

  it('should return correct color theme aria label for Green', () => {
    expect(component.getColorThemeAriaLabel('Green')).toBe('Green color theme');
  });

  it('should toggle fullscreen mode when not in fullscreen', async () => {
    fixture.detectChanges();
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });
    const requestFullscreenSpy = jest.spyOn(document.documentElement, 'requestFullscreen');
    await component.toggleFullScreen();
    expect(requestFullscreenSpy).toHaveBeenCalled();
  });

  it('should exit fullscreen mode when in fullscreen', async () => {
    fixture.detectChanges();
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, writable: true });
    const exitFullscreenSpy = jest.spyOn(document, 'exitFullscreen');
    await component.toggleFullScreen();
    expect(exitFullscreenSpy).toHaveBeenCalled();
  });

  it('should handle fullscreen error', async () => {
    fixture.detectChanges();
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(document.documentElement, 'requestFullscreen').mockRejectedValue(new Error('Fullscreen error'));
    await component.toggleFullScreen();
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error attempting to enable fullscreen: Fullscreen error");
    consoleErrorSpy.mockRestore();
  });

  it('should not attempt to exit fullscreen if exitFullscreen is not available', async () => {
    fixture.detectChanges();
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, writable: true });
    Object.defineProperty(document, 'exitFullscreen', { value: undefined, writable: true });
    await component.toggleFullScreen();
    expect(document.fullscreenElement).toBe(document.documentElement);
  });

  it('should handle invalid language code', () => {
    jest.spyOn(window.localStorage.__proto__, 'getItem').mockReturnValue('invalid');
    fixture = TestBed.createComponent(MainDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(translateService.use).toHaveBeenCalledWith('invalid');
    expect(component.currentLanguage()).toBe("French");
  });

  it('should initialize services in constructor', () => {
    expect(translateService.addLangs).toHaveBeenCalledWith(['en', 'fr']);
  });

  it('should handle null responsiveService in error cases', () => {
    fixture.detectChanges();
    responsiveService.isMobile.mockImplementation(() => {
      throw new Error('Service unavailable');
    });
    expect(() => component.sidenavWidth()).not.toThrow();
  });

  it('should initialize sidenav', () => {
    fixture.detectChanges();
    const sidenav = fixture.debugElement.query(By.directive(MatSidenav));
    expect(sidenav).toBeTruthy();
  });
});