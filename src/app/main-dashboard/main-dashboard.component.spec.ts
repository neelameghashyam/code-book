import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { MainDashboardComponent } from './main-dashboard.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { ThemeService } from '../services/theme/theme.service';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

describe('MainDashboardComponent', () => {
  let component: MainDashboardComponent;
  let fixture: ComponentFixture<MainDashboardComponent>;
  let translateService: jest.Mocked<TranslateService>;
  let responsiveService: jest.Mocked<ResponsiveService>;
  let darkModeService: jest.Mocked<DarkModeService>;
  let themeService: jest.Mocked<ThemeService>;
  let localStorageMock: { [key: string]: string };
  let sidenavMock: jest.Mocked<MatSidenav>;

  beforeEach(async () => {
    localStorageMock = {};
    const localStorageSpy = {
      getItem: jest.fn((key) => localStorageMock[key] || null),
      setItem: jest.fn((key, value) => (localStorageMock[key] = value)),
    };

    // Mock localStorage globally
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });

    translateService = {
      addLangs: jest.fn(),
      setDefaultLang: jest.fn(),
      use: jest.fn(),
      instant: jest.fn((key) => key), // Mock translations for footer
    } as any;

    responsiveService = {
      isMobile: jest.fn().mockReturnValue(false),
    } as any;

    darkModeService = {
      isDarkMode: jest.fn().mockReturnValue(false),
      getThemes: jest.fn().mockReturnValue([
        { name: 'light', icon: 'light_mode' },
        { name: 'dark', icon: 'dark_mode' },
      ]),
      selectedTheme: jest.fn().mockReturnValue({ name: 'light', icon: 'light_mode' }),
      setTheme: jest.fn(),
    } as any;

    themeService = {
      getThemes: jest.fn().mockReturnValue([
        { id: 'blue', displayName: 'Blue', primary: '#3f51b5' },
        { id: 'red', displayName: 'Red', primary: '#f44336' },
      ]),
      setTheme: jest.fn(),
    } as any;

    sidenavMock = {
      close: jest.fn().mockResolvedValue(undefined),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        MainDashboardComponent,
        RouterOutlet,
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatMenuModule,
        MatTooltipModule,
        MatBadgeModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: TranslateService, useValue: translateService },
        { provide: ResponsiveService, useValue: responsiveService },
        { provide: DarkModeService, useValue: darkModeService },
        { provide: ThemeService, useValue: themeService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(MainDashboardComponent);
    component = fixture.componentInstance;
    component.sidenav = sidenavMock; // Inject mock sidenav
    fixture.detectChanges();
  });

  // Component Creation and Initialization
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default properties', () => {
    expect(component.title).toBe('Code Book');
    expect(component.collapsed()).toBe(false); // Default is false, not true
    expect(component.currentLanguage()).toBe('English');
  });

  it('should set up languages in constructor', () => {
    expect(translateService.addLangs).toHaveBeenCalledWith(['en', 'fr']);
  });

  // ngOnInit tests - covering all branches
  it('should initialize language in ngOnInit with stored language (French)', () => {
    localStorageMock['lang'] = 'fr';
    component.ngOnInit();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('fr');
    expect(component.currentLanguage()).toBe('French');
  });

  it('should initialize language in ngOnInit with default language when localStorage is empty', () => {
    localStorageMock['lang'] = null;
    component.ngOnInit();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(component.currentLanguage()).toBe('English');
  });

  it('should initialize language in ngOnInit with default language when localStorage returns undefined', () => {
    // Simulate localStorage.getItem returning null
    jest.spyOn(localStorage, 'getItem').mockReturnValue(null);
    component.ngOnInit();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(component.currentLanguage()).toBe('English');
  });

  it('should initialize language in ngOnInit with stored language (English)', () => {
    localStorageMock['lang'] = 'en';
    component.ngOnInit();
    expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(component.currentLanguage()).toBe('English');
  });

  // ChangeLang tests - covering all branches
  it('should change language to French and update localStorage', () => {
    component.ChangeLang('fr');
    expect(translateService.use).toHaveBeenCalledWith('fr');
    expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'fr');
    expect(component.currentLanguage()).toBe('French');
  });

  it('should change language to English and update localStorage', () => {
    component.ChangeLang('en');
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'en');
    expect(component.currentLanguage()).toBe('English');
  });

  // Sidenav Behavior
  it('should toggle sidenav from collapsed to expanded', () => {
    component.collapsed.set(true);
    component.toggleSidenav();
    expect(component.collapsed()).toBe(false);
  });

  it('should toggle sidenav from expanded to collapsed', () => {
    component.collapsed.set(false);
    component.toggleSidenav();
    expect(component.collapsed()).toBe(true);
  });

  // sidenavWidth computed tests
  it('should compute sidenav width for mobile', () => {
    responsiveService.isMobile.mockReturnValue(true);
    expect(component.sidenavWidth()).toBe('280px');
  });

  it('should compute sidenav width for non-mobile collapsed', () => {
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(true);
    expect(component.sidenavWidth()).toBe('64px');
  });

  it('should compute sidenav width for non-mobile expanded', () => {
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(false);
    expect(component.sidenavWidth()).toBe('200px');
  });

  // sidenavMode computed tests
  it('should compute sidenav mode for mobile', () => {
    responsiveService.isMobile.mockReturnValue(true);
    expect(component.sidenavMode()).toBe('over');
  });

  it('should compute sidenav mode for non-mobile', () => {
    responsiveService.isMobile.mockReturnValue(false);
    expect(component.sidenavMode()).toBe('side');
  });

  // sidenavOpened computed tests - covering all branches
  it('should compute sidenav opened state for mobile collapsed', () => {
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(true);
    expect(component.sidenavOpened()).toBe(false);
  });

  it('should compute sidenav opened state for mobile expanded', () => {
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(false);
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should compute sidenav opened state for non-mobile collapsed', () => {
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(true);
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should compute sidenav opened state for non-mobile expanded', () => {
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(false);
    expect(component.sidenavOpened()).toBe(true);
  });

  // Theme and Aria Labels
  it('should get theme aria label for dark theme', () => {
    expect(component.getThemeAriaLabel('dark')).toBe('Dark theme');
  });

  it('should get theme aria label for light theme', () => {
    expect(component.getThemeAriaLabel('light')).toBe('Light theme');
  });

  it('should get color theme aria label', () => {
    expect(component.getColorThemeAriaLabel('Blue')).toBe('Blue color theme');
    expect(component.getColorThemeAriaLabel('Red')).toBe('Red color theme');
    expect(component.getColorThemeAriaLabel('Green')).toBe('Green color theme');
  });

  // Fullscreen Toggle - covering all branches
  it('should enter fullscreen mode when not in fullscreen', fakeAsync(() => {
    const requestFullscreenSpy = jest.spyOn(document.documentElement, 'requestFullscreen').mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });

    component.toggleFullScreen();
    tick();
    expect(requestFullscreenSpy).toHaveBeenCalled();
  }));

  it('should exit fullscreen mode when in fullscreen and exitFullscreen is available', fakeAsync(() => {
    const exitFullscreenSpy = jest.spyOn(document, 'exitFullscreen').mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, writable: true });

    component.toggleFullScreen();
    tick();
    expect(exitFullscreenSpy).toHaveBeenCalled();
  }));

  it('should handle case when exitFullscreen is not available', fakeAsync(() => {
    Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement, writable: true });
    Object.defineProperty(document, 'exitFullscreen', { value: undefined, writable: true });

    // Should not throw error
    expect(() => {
      component.toggleFullScreen();
      tick();
    }).not.toThrow();
  }));

  it('should handle fullscreen request error', fakeAsync(() => {
    jest.spyOn(document.documentElement, 'requestFullscreen').mockRejectedValue(new Error('Permission denied'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });

    component.toggleFullScreen();
    tick();
    expect(console.error).toHaveBeenCalledWith('Error attempting to enable fullscreen: Permission denied');
  }));

  // Template Rendering
  it('should render toolbar with title', () => {
    const toolbar = fixture.debugElement.query(By.css('mat-toolbar'));
    expect(toolbar).toBeTruthy();
    expect(toolbar.nativeElement.textContent).toContain('Code Book');
  });

  it('should apply dark theme class when dark mode is enabled', () => {
    darkModeService.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css('.flex.flex-col'));
    expect(container.classes['dark-theme']).toBeTruthy();
  });

  it('should not apply dark theme class when dark mode is disabled', () => {
    darkModeService.isDarkMode.mockReturnValue(false);
    fixture.detectChanges();
    const container = fixture.debugElement.query(By.css('.flex.flex-col'));
    expect(container.classes['dark-theme']).toBeFalsy();
  });

  it('should render mobile menu button when isMobile is true', () => {
    responsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    const mobileMenuButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor=mobileMenu]'));
    expect(mobileMenuButton).toBeTruthy();
    expect(mobileMenuButton.nativeElement.textContent).toContain('more_vert');
  });

  it('should not render mobile menu button when isMobile is false', () => {
    responsiveService.isMobile.mockReturnValue(false);
    fixture.detectChanges();
    const mobileMenuButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor=mobileMenu]'));
    expect(mobileMenuButton).toBeNull();
  });

  it('should render non-mobile buttons when isMobile is false', () => {
    responsiveService.isMobile.mockReturnValue(false);
    fixture.detectChanges();
    const nonMobileButtons = fixture.debugElement.query(By.css('.hidden.sm\\:flex'));
    expect(nonMobileButtons).toBeTruthy();
    expect(nonMobileButtons.queryAll(By.css('button')).length).toBe(3); // Fullscreen, dark mode, color theme
  });

  it('should render sidenav with correct attributes for non-mobile collapsed', () => {
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(true);
    fixture.detectChanges();
    const sidenav = fixture.debugElement.query(By.css('mat-sidenav'));
    expect(sidenav.styles['width']).toBe('64px');
    expect(sidenav.attributes['ng-reflect-mode']).toBe('side');
    expect(sidenav.attributes['ng-reflect-opened']).toBe('true');
    expect(sidenav.attributes['ng-reflect-fixed-in-viewport']).toBe('false');
    expect(sidenav.attributes['ng-reflect-fixed-top-gap']).toBe('48');
  });

  it('should render sidenav with correct attributes for mobile collapsed', () => {
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(true);
    fixture.detectChanges();
    const sidenav = fixture.debugElement.query(By.css('mat-sidenav'));
    expect(sidenav.styles['width']).toBe('280px');
    expect(sidenav.attributes['ng-reflect-mode']).toBe('over');
    expect(sidenav.attributes['ng-reflect-opened']).toBe('false');
    expect(sidenav.attributes['ng-reflect-fixed-in-viewport']).toBe('true');
  });

  it('should render sidenav content with correct margin for non-mobile', () => {
    responsiveService.isMobile.mockReturnValue(false);
    component.collapsed.set(true);
    fixture.detectChanges();
    const sidenavContent = fixture.debugElement.query(By.css('mat-sidenav-content'));
    expect(sidenavContent.styles['margin-left']).toBe('64px');
  });

  it('should render sidenav content with correct margin for mobile', () => {
    responsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    const sidenavContent = fixture.debugElement.query(By.css('mat-sidenav-content'));
    expect(sidenavContent.styles['margin-left']).toBe('0px');
  });

  it('should render footer with translated content', () => {
    translateService.instant.mockReturnValue('Copyright © 2025');
    fixture.detectChanges();
    const footer = fixture.debugElement.query(By.css('footer'));
    expect(footer).toBeTruthy();
    expect(footer.nativeElement.textContent).toContain('Copyright © 2025');

    const links = fixture.debugElement.queryAll(By.css('footer a'));
    expect(links.length).toBe(3);
    expect(links[0].nativeElement.textContent).toContain('footerContactUs');
    expect(links[1].nativeElement.textContent).toContain('footerTermsOfService');
    expect(links[2].nativeElement.textContent).toContain('footerPrivacyPolicy');
  });

  // User Interactions
  it('should toggle sidenav on menu button click', fakeAsync(() => {
    const toggleButton = fixture.debugElement.query(By.css('button[aria-label="Toggle side navigation"]'));
    toggleButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(component.collapsed()).toBe(true);
  }));

  it('should close sidenav on content click in mobile mode', fakeAsync(() => {
    responsiveService.isMobile.mockReturnValue(true);
    component.collapsed.set(false);
    fixture.detectChanges();
    const sidenavContent = fixture.debugElement.query(By.css('mat-sidenav-content'));
    sidenavContent.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(sidenavMock.close).toHaveBeenCalled();
  }));

  it('should not close sidenav on content click in non-mobile mode', fakeAsync(() => {
    responsiveService.isMobile.mockReturnValue(false);
    fixture.detectChanges();
    const sidenavContent = fixture.debugElement.query(By.css('mat-sidenav-content'));
    sidenavContent.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(sidenavMock.close).not.toHaveBeenCalled();
  }));

  it('should trigger fullscreen toggle on button click', fakeAsync(() => {
    const requestFullscreenSpy = jest.spyOn(document.documentElement, 'requestFullscreen').mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });
    const fullscreenButton = fixture.debugElement.query(By.css('button[aria-label="Toggle full screen"]'));
    fullscreenButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(requestFullscreenSpy).toHaveBeenCalled();
  }));

  it('should open and interact with dark mode menu', fakeAsync(() => {
    const darkModeButton = fixture.debugElement.query(By.css('button[aria-label="Select light or dark theme"]'));
    expect(darkModeButton.query(By.css('mat-icon')).nativeElement.textContent).toBe('light_mode');
    darkModeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();

    const menuItems = fixture.debugElement.queryAll(By.css('mat-menu#darkModeMenu button[mat-menu-item]'));
    expect(menuItems.length).toBe(2);
    expect(menuItems[0].nativeElement.textContent).toContain('Light');
    expect(menuItems[1].nativeElement.textContent).toContain('Dark');

    darkModeService.selectedTheme.mockReturnValue({ name: 'dark', icon: 'dark_mode' });
    menuItems[1].triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(darkModeService.setTheme).toHaveBeenCalledWith('dark');
    expect(menuItems[1].classes['selected-theme']).toBeTruthy();
  }));

  it('should open and interact with color theme menu', fakeAsync(() => {
    const colorThemeButton = fixture.debugElement.query(By.css('button[aria-label="Select color theme"]'));
    colorThemeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();

    const menuItems = fixture.debugElement.queryAll(By.css('mat-menu#colorThemeMenu button[mat-menu-item]'));
    expect(menuItems.length).toBe(2);
    expect(menuItems[0].nativeElement.textContent).toContain('Blue');
    expect(menuItems[1].nativeElement.textContent).toContain('Red');

    const colorPreview = menuItems[0].query(By.css('.color-preview'));
    expect(colorPreview.styles['background-color']).toBe('rgb(63, 81, 181)');

    menuItems[1].triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(themeService.setTheme).toHaveBeenCalledWith('red');
  }));

  it('should open and interact with language menu', fakeAsync(() => {
    const langButton = fixture.debugElement.query(By.css('button[aria-label="Select language"]'));
    expect(langButton.nativeElement.textContent).toContain('English');
    langButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();

    const menuItems = fixture.debugElement.queryAll(By.css('mat-menu#languageMenu button[mat-menu-item]'));
    expect(menuItems.length).toBe(2);
    expect(menuItems[0].nativeElement.textContent).toContain('English');
    expect(menuItems[1].nativeElement.textContent).toContain('French');

    menuItems[1].triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(translateService.use).toHaveBeenCalledWith('fr');
    expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'fr');
    expect(component.currentLanguage()).toBe('French');
  }));

  it('should open and interact with mobile menu', fakeAsync(() => {
    responsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    const mobileMenuButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor=mobileMenu]'));
    mobileMenuButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();

    const menuItems = fixture.debugElement.queryAll(By.css('mat-menu#mobileMenu button[mat-menu-item]'));
    expect(menuItems.length).toBe(4);

    // Fullscreen
    const requestFullscreenSpy = jest.spyOn(document.documentElement, 'requestFullscreen').mockResolvedValue(undefined);
    Object.defineProperty(document, 'fullscreenElement', { value: null, writable: true });
    menuItems[0].triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(requestFullscreenSpy).toHaveBeenCalled();

    // Dark mode menu
    menuItems[1].triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(fixture.debugElement.query(By.css('mat-menu#darkModeMenu'))).toBeTruthy();

    // Color theme menu
    menuItems[2].triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(fixture.debugElement.query(By.css('mat-menu#colorThemeMenu'))).toBeTruthy();

    // Language menu
    menuItems[3].triggerEventHandler('click', null);
    fixture.detectChanges();
    tick();
    expect(fixture.debugElement.query(By.css('mat-menu#languageMenu'))).toBeTruthy();
  }));

  // SCSS Style Coverage
  it('should apply theme-menu-item and color-preview styles', () => {
    const colorThemeButton = fixture.debugElement.query(By.css('button[aria-label="Select color theme"]'));
    colorThemeButton.triggerEventHandler('click', null);
    fixture.detectChanges();

    const menuItem = fixture.debugElement.query(By.css('.theme-menu-item'));
    expect(menuItem).toBeTruthy();
    expect(menuItem.styles['display']).toBe('flex');
    expect(menuItem.styles['align-items']).toBe('center');
    expect(menuItem.styles['gap']).toBe('0.5rem');

    const colorPreview = fixture.debugElement.query(By.css('.color-preview'));
    expect(colorPreview).toBeTruthy();
    expect(colorPreview.styles['width']).toBe('1rem');
    expect(colorPreview.styles['height']).toBe('1rem');
    expect(colorPreview.styles['border-radius']).toBe('50%');
  });

  // Edge Cases
  it('should handle null selectedTheme from darkModeService', () => {
    darkModeService.selectedTheme.mockReturnValue(null);
    fixture.detectChanges();
    const darkModeButton = fixture.debugElement.query(By.css('button[aria-label="Select light or dark theme"]'));
    expect(darkModeButton.query(By.css('mat-icon')).nativeElement.textContent).toBe('');
  });

  it('should handle empty theme lists', () => {
    darkModeService.getThemes.mockReturnValue([]);
    themeService.getThemes.mockReturnValue([]);
    fixture.detectChanges();
    const darkModeButton = fixture.debugElement.query(By.css('button[aria-label="Select light or dark theme"]'));
    darkModeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    const darkModeMenuItems = fixture.debugElement.queryAll(By.css('mat-menu#darkModeMenu button[mat-menu-item]'));
    expect(darkModeMenuItems.length).toBe(0);

    const colorThemeButton = fixture.debugElement.query(By.css('button[aria-label="Select color theme"]'));
    colorThemeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    const colorThemeMenuItems = fixture.debugElement.queryAll(By.css('mat-menu#colorThemeMenu button[mat-menu-item]'));
    expect(colorThemeMenuItems.length).toBe(0);
  });

  // Additional tests to ensure 100% branch coverage
  it('should handle ngOnInit when localStorage.getItem returns empty string', () => {
    jest.spyOn(localStorage, 'getItem').mockReturnValue('');
    component.ngOnInit();
    expect(translateService.use).toHaveBeenCalledWith('en');
    expect(component.currentLanguage()).toBe('English');
  });

  it('should handle different language codes in ChangeLang', () => {
    // Test with non-standard language code
    component.ChangeLang('es');
    expect(translateService.use).toHaveBeenCalledWith('es');
    expect(localStorage.setItem).toHaveBeenCalledWith('lang', 'es');
    expect(component.currentLanguage()).toBe('French'); // Falls back to French for non-'en' codes
  });

  it('should handle capitalization in getThemeAriaLabel', () => {
    expect(component.getThemeAriaLabel('DARK')).toBe('DARK theme');
    expect(component.getThemeAriaLabel('')).toBe(' theme');
    expect(component.getThemeAriaLabel('custom')).toBe('Custom theme');
  });
});