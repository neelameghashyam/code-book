import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainDashboard2Component } from './main-dashboard-2.component';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { ThemeService } from '../services/theme/theme.service';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslocoRootModule } from '../transloco-root.module';
import { CustomSidenav2Component } from '../custom-sidenav-2/custom-sidenav-2.component';
import { UserComponent } from '../user/user.component';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, of, Subject } from 'rxjs';

// Define Theme interface to match expected structure
interface Theme {
  id: string;
  displayName: string;
  primary: string;
  darkModeClass: string;
  lightModeClass: string;
}

describe('MainDashboard2Component', () => {
  let component: MainDashboard2Component;
  let fixture: ComponentFixture<MainDashboard2Component>;
  let responsiveService: jest.Mocked<ResponsiveService>;
  let darkModeService: jest.Mocked<DarkModeService>;
  let themeService: jest.Mocked<ThemeService>;
  let translateService: jest.Mocked<TranslateService>;

  beforeEach(async () => {
    // Mock services with all required properties and methods
    responsiveService = {
      currentBreakpoint: jest.fn(() => of('desktop') as Observable<string>),
      isMobile: jest.fn(),
      isTablet: jest.fn(),
      isDesktop: jest.fn(),
    } as unknown as jest.Mocked<ResponsiveService>;

    darkModeService = {
      isVisible: jest.fn(),
      selectedTheme: jest.fn(),
      isDarkMode: jest.fn(),
      setTheme: jest.fn(),
      getThemes: jest.fn(),
      applyTheme: jest.fn(),
    } as unknown as jest.Mocked<DarkModeService>;

    themeService = {
      currentTheme: jest.fn(),
      getThemes: jest.fn(),
      setTheme: jest.fn(),
    } as unknown as jest.Mocked<ThemeService>;

    // Enhanced TranslateService mock
    translateService = {
      store: new TranslateStore(),
      currentLoader: {} as any,
      compiler: {} as any,
      parser: {} as any,
      addLangs: jest.fn(),
      setDefaultLang: jest.fn(),
      use: jest.fn().mockReturnValue(of('en')),
      getBrowserLang: jest.fn(),
      getBrowserCultureLang: jest.fn(),
      get: jest.fn().mockImplementation((key: string) => of(`translated-${key}`)),
      onTranslationChange: new Subject(),
      onLangChange: new Subject(),
      onDefaultLangChange: new Subject(),
    } as unknown as jest.Mocked<TranslateService>;

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn((key: string) => (key === 'lang' ? 'en' : null)),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    // Mock document fullscreen APIs
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
        MainDashboard2Component,
        RouterTestingModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatSidenavModule,
        MatMenuModule,
        MatTooltipModule,
        MatBadgeModule,
        TranslocoRootModule,
        CustomSidenav2Component,
        UserComponent,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ResponsiveService, useValue: responsiveService },
        { provide: DarkModeService, useValue: darkModeService },
        { provide: ThemeService, useValue: themeService },
        { provide: TranslateService, useValue: translateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainDashboard2Component);
    component = fixture.componentInstance;

    // Mock ViewChild
    component.sidenav = {
      open: jest.fn(),
      close: jest.fn(),
    } as any;

    // Mock service return values
    responsiveService.isMobile.mockReturnValue(false);
    responsiveService.isTablet.mockReturnValue(false);
    responsiveService.isDesktop.mockReturnValue(true);
    darkModeService.getThemes.mockReturnValue([
      { name: 'light', icon: 'light_mode' },
      { name: 'dark', icon: 'dark_mode' },
    ]);
    darkModeService.selectedTheme.mockReturnValue({ name: 'light', icon: 'light_mode' });
    themeService.getThemes.mockReturnValue([
      { id: 'theme1', displayName: 'Blue', primary: '#0000FF', darkModeClass: 'dark-blue', lightModeClass: 'light-blue' },
      { id: 'theme2', displayName: 'Red', primary: '#FF0000', darkModeClass: 'dark-red', lightModeClass: 'light-red' },
    ]);
    themeService.currentTheme.mockReturnValue({
      id: 'theme1',
      displayName: 'Blue',
      primary: '#0000FF',
      darkModeClass: 'dark-blue',
      lightModeClass: 'light-blue',
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct title', () => {
    expect(component.title).toBe('Code Book');
  });

  it('should initialize collapsed signal as false', () => {
    expect(component.collapsed()).toBe(false);
  });

  it('should initialize currentLanguage signal as English', () => {
    expect(component.currentLanguage()).toBe('English');
  });

  it('should add languages in constructor', () => {
    expect(translateService.addLangs).toHaveBeenCalledWith(['en', 'fr']);
  });

  it('should set up language in ngOnInit with stored language (en)', () => {
    component.ngOnInit();
    expect(localStorage.getItem).toHaveBeenCalledWith('lang');
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(component.currentLanguage()).toBe('English');
  });

  it('should set up language in ngOnInit with stored language (fr)', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('fr');
    component.ngOnInit();
    expect(localStorage.getItem).toHaveBeenCalledWith('lang');
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('fr');
    expect(component.currentLanguage()).toBe('French');
  });

  it('should set up language in ngOnInit with no stored language', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    component.ngOnInit();
    expect(localStorage.getItem).toHaveBeenCalledWith('lang');
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(component.currentLanguage()).toBe('English');
  });

  it('should change language to French', () => {
    component.ChangeLang('fr');
    expect(translateService.use).toHaveBeenCalledWith('fr');
    expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'fr');
    expect(component.currentLanguage()).toBe('French');
  });

  it('should change language to English', () => {
    component.ChangeLang('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'en');
    expect(component.currentLanguage()).toBe('English');
  });

  it('should return correct theme aria label', () => {
    expect(component.getThemeAriaLabel('dark')).toBe('Dark theme');
    expect(component.getThemeAriaLabel('light')).toBe('Light theme');
  });

  it('should return correct color theme aria label', () => {
    expect(component.getColorThemeAriaLabel('Blue')).toBe('Blue color theme');
    expect(component.getColorThemeAriaLabel('Red')).toBe('Red color theme');
  });

  it('should toggle fullscreen when not in fullscreen', async () => {
    await component.toggleFullScreen();
    expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
  });

  it('should exit fullscreen when in fullscreen', async () => {
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, writable: true });
    await component.toggleFullScreen();
    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  it('should handle fullscreen error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (document.documentElement.requestFullscreen as jest.Mock).mockRejectedValue(new Error('Fullscreen denied'));
    await component.toggleFullScreen();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error attempting to enable fullscreen: Fullscreen denied');
    consoleErrorSpy.mockRestore();
  });

  it('should compute sidenavWidth for mobile', () => {
    responsiveService.isMobile.mockReturnValue(true);
    expect(component.sidenavWidth()).toBe('200px');
  });

  it('should compute sidenavWidth for non-mobile collapsed', () => {
    component.collapsed.set(true);
    expect(component.sidenavWidth()).toBe('60px');
  });

  it('should compute sidenavWidth for non-mobile non-collapsed', () => {
    component.collapsed.set(false);
    expect(component.sidenavWidth()).toBe('200px');
  });

  it('should compute sidenavMode for mobile', () => {
    responsiveService.isMobile.mockReturnValue(true);
    expect(component.sidenavMode()).toBe('side');
  });

  it('should compute sidenavMode for non-mobile', () => {
    responsiveService.isMobile.mockReturnValue(false);
    expect(component.sidenavMode()).toBe('side');
  });

  it('should compute sidenavOpened for mobile and collapsed', () => {
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(true);
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should compute sidenavOpened for mobile and non-collapsed', () => {
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(false);
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should compute sidenavOpened for non-mobile', () => {
    responsiveService.isMobile.mockReturnValue(false);
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should toggle sidenav collapsed state', () => {
    component.toggleSidenav();
    expect(component.collapsed()).toBe(true);
    component.toggleSidenav();
    expect(component.collapsed()).toBe(false);
  });
});