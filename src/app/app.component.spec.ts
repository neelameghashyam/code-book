import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { TranslocoRootModule } from './transloco-root.module';
import { CustomSidenavComponent } from './custom-sidenav/custom-sidenav.component';
import { ResponsiveService } from './services/responsive/responsive.service';
import { DarkModeService } from './services/dark-mode.service';
import { ThemeService } from './services/theme/theme.service';
import { UserComponent } from './user/user.component';
import { TranslateService, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { Component, Input, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatSidenav } from '@angular/material/sidenav';
import { appConfig } from './app.config';
import { routes } from './app.routes';

// Mock CustomSidenavComponent
@Component({
  selector: 'app-custom-sidenav',
  template: '',
})
class MockCustomSidenavComponent {
  @Input() collapsed = false;
  @Input() sidenavWidth = '200px';
}

// Mock UserComponent
@Component({
  selector: 'app-user',
  template: '',
})
class MockUserComponent {}

// Mock MatSidenav
@Component({
  selector: 'mat-sidenav',
  template: '<ng-content></ng-content>',
  host: { 'style': '' } // Allow style bindings
})
class MockMatSidenav {
  @Input() mode: string;
  @Input() opened: boolean;
  @Input() fixedInViewport: boolean;
  @Input() fixedTopGap: number;
  @Input() style: { [key: string]: string } = {};
  toggle = jest.fn().mockResolvedValue(undefined);
  open = jest.fn().mockResolvedValue(undefined);
  close = jest.fn().mockResolvedValue(undefined);
}

// Mock MatSidenavContainer
@Component({
  selector: 'mat-sidenav-container',
  template: '<ng-content></ng-content>',
})
class MockMatSidenavContainer {}

// Mock MatSidenavContent
@Component({
  selector: 'mat-sidenav-content',
  template: '<ng-content></ng-content>',
  host: { 'style': '' } // Allow style bindings
})
class MockMatSidenavContent {}

// Mock Services
class MockResponsiveService {
  isMobile = jest.fn().mockReturnValue(false);
}

class MockDarkModeService {
  isDarkMode = jest.fn().mockReturnValue(false);
  selectedTheme = jest.fn().mockReturnValue({ name: 'light', icon: 'light_mode' });
  getThemes = jest.fn().mockReturnValue([
    { name: 'light', icon: 'light_mode' },
    { name: 'dark', icon: 'dark_mode' },
  ]);
  setTheme = jest.fn();
}

class MockThemeService {
  getThemes = jest.fn().mockReturnValue([
    { id: 'blue', displayName: 'Blue', primary: '#3b82f6' },
    { id: 'green', displayName: 'Green', primary: '#10b981' },
  ]);
  setTheme = jest.fn();
}

class MockTranslateService {
  addLangs = jest.fn();
  setDefaultLang = jest.fn();
  use = jest.fn();
  instant = jest.fn().mockImplementation(key => key);
}

// Mock TranslatePipe
class MockTranslatePipe {
  transform(value: string) {
    return value;
  }
}

// HttpLoaderFactory
function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let responsiveService: MockResponsiveService;
  let darkModeService: MockDarkModeService;
  let themeService: MockThemeService;
  let translateService: MockTranslateService;
  let originalDocument: Document;

  // Mock localStorage
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  // Mock document for fullscreen
  const documentMock = {
    documentElement: {
      requestFullscreen: jest.fn().mockResolvedValue(undefined),
    },
    fullscreenElement: null,
    exitFullscreen: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(waitForAsync(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    originalDocument = window.document;
    (window as any).document = documentMock;

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatMenuModule,
        MatTooltipModule,
        MatBadgeModule,
        TranslocoRootModule,
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateHttpLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        AppComponent,
        MockCustomSidenavComponent,
        MockUserComponent,
        MockMatSidenav,
        MockMatSidenavContainer,
        MockMatSidenavContent,
      ],
      providers: [
        { provide: ResponsiveService, useClass: MockResponsiveService },
        { provide: DarkModeService, useClass: MockDarkModeService },
        { provide: ThemeService, useClass: MockThemeService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: TranslatePipe, useClass: MockTranslatePipe },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService) as unknown as MockResponsiveService;
    darkModeService = TestBed.inject(DarkModeService) as unknown as MockDarkModeService;
    themeService = TestBed.inject(ThemeService) as unknown as MockThemeService;
    translateService = TestBed.inject(TranslateService) as unknown as MockTranslateService;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  }));

  afterEach(() => {
    (window as any).document = originalDocument;
    jest.clearAllMocks();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default title', () => {
    expect(component.title).toBe('Code Book');
  });

  it('should initialize collapsed signal to true', () => {
    expect(component.collapsed()).toBe(true);
  });

  it('should initialize currentLanguage signal to English', () => {
    expect(component.currentLanguage()).toBe('English');
  });

  it('should call addLangs in constructor', () => {
    const newComponent = new AppComponent(translateService as unknown as TranslateService);
    expect(translateService.addLangs).toHaveBeenCalledWith(['en', 'fr']);
  });

  describe('ngOnInit', () => {
    it('should set default language to English if no lang in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      component.ngOnInit();
      expect(translateService.setDefaultLang).toHaveBeenCalledWith('en');
      expect(translateService.use).toHaveBeenCalledWith('en');
      expect(component.currentLanguage()).toBe('English');
    });

    it('should use stored language (French)', () => {
      localStorageMock.getItem.mockReturnValue('fr');
      component.ngOnInit();
      expect(translateService.use).toHaveBeenCalledWith('fr');
      expect(component.currentLanguage()).toBe('French');
    });

    it('should use stored language (English)', () => {
      localStorageMock.getItem.mockReturnValue('en');
      component.ngOnInit();
      expect(translateService.use).toHaveBeenCalledWith('en');
      expect(component.currentLanguage()).toBe('English');
    });
  });

  describe('ChangeLang', () => {
    it('should change to French and update localStorage', () => {
      component.ChangeLang('fr');
      expect(translateService.use).toHaveBeenCalledWith('fr');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('lang', 'fr');
      expect(component.currentLanguage()).toBe('French');
    });

    it('should change to English and update localStorage', () => {
      component.ChangeLang('en');
      expect(translateService.use).toHaveBeenCalledWith('en');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('lang', 'en');
      expect(component.currentLanguage()).toBe('English');
    });
  });

  describe('toggleFullScreen', () => {
    it('should request fullscreen when not in fullscreen', () => {
      documentMock.fullscreenElement = null;
      component.toggleFullScreen();
      expect(documentMock.documentElement.requestFullscreen).toHaveBeenCalled();
      expect(documentMock.exitFullscreen).not.toHaveBeenCalled();
    });

    it('should exit fullscreen when in fullscreen and exitFullscreen is defined', () => {
      documentMock.fullscreenElement = {} as Element;
      documentMock.exitFullscreen = jest.fn().mockResolvedValue(undefined);
      component.toggleFullScreen();
      expect(documentMock.exitFullscreen).toHaveBeenCalled();
      expect(documentMock.documentElement.requestFullscreen).not.toHaveBeenCalled();
    });

    it('should do nothing when in fullscreen and exitFullscreen is undefined', () => {
      documentMock.fullscreenElement = {} as Element;
      documentMock.exitFullscreen = undefined;
      component.toggleFullScreen();
      expect(documentMock.documentElement.requestFullscreen).not.toHaveBeenCalled();
    });

    it('should log error if requestFullscreen fails', async () => {
      documentMock.fullscreenElement = null;
      documentMock.documentElement.requestFullscreen.mockRejectedValue(new Error('Permission denied'));
      await component.toggleFullScreen();
      expect(console.error).toHaveBeenCalledWith('Error attempting to enable fullscreen: Permission denied');
    });
  });

  describe('getThemeAriaLabel', () => {
    it('should return capitalized theme name', () => {
      expect(component.getThemeAriaLabel('dark')).toBe('Dark theme');
      expect(component.getThemeAriaLabel('light')).toBe('Light theme');
    });
  });

  describe('getColorThemeAriaLabel', () => {
    it('should return color theme with display name', () => {
      expect(component.getColorThemeAriaLabel('Blue')).toBe('Blue color theme');
    });
  });

  describe('sidenavWidth', () => {
    it('should return 280px for mobile', () => {
      responsiveService.isMobile.mockReturnValue(true);
      expect(component.sidenavWidth()).toBe('280px');
    });

    it('should return 64px for desktop when collapsed', () => {
      responsiveService.isMobile.mockReturnValue(false);
      component.collapsed.set(true);
      expect(component.sidenavWidth()).toBe('64px');
    });

    it('should return 200px for desktop when not collapsed', () => {
      responsiveService.isMobile.mockReturnValue(false);
      component.collapsed.set(false);
      expect(component.sidenavWidth()).toBe('200px');
    });
  });

  describe('sidenavMode', () => {
    it('should return "over" for mobile', () => {
      responsiveService.isMobile.mockReturnValue(true);
      expect(component.sidenavMode()).toBe('over');
    });

    it('should return "side" for desktop', () => {
      responsiveService.isMobile.mockReturnValue(false);
      expect(component.sidenavMode()).toBe('side');
    });
  });

  describe('sidenavOpened', () => {
    it('should return false for mobile when collapsed', () => {
      responsiveService.isMobile.mockReturnValue(true);
      component.collapsed.set(true);
      expect(component.sidenavOpened()).toBe(false);
    });

    it('should return true for mobile when not collapsed', () => {
      responsiveService.isMobile.mockReturnValue(true);
      component.collapsed.set(false);
      expect(component.sidenavOpened()).toBe(true);
    });

    it('should return true for desktop when collapsed', () => {
      responsiveService.isMobile.mockReturnValue(false);
      component.collapsed.set(true);
      expect(component.sidenavOpened()).toBe(true);
    });

    it('should return true for desktop when not collapsed', () => {
      responsiveService.isMobile.mockReturnValue(false);
      component.collapsed.set(false);
      expect(component.sidenavOpened()).toBe(true);
    });
  });

  describe('toggleSidenav', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.sidenav = fixture.debugElement.query(By.directive(MockMatSidenav)).componentInstance;
    });

    it('should toggle collapsed state from true to false', () => {
      component.collapsed.set(true);
      component.toggleSidenav();
      expect(component.collapsed()).toBe(false);
      expect(component.sidenav.toggle).toHaveBeenCalled();
    });

    it('should toggle collapsed state from false to true', () => {
      component.collapsed.set(false);
      component.toggleSidenav();
      expect(component.collapsed()).toBe(true);
      expect(component.sidenav.toggle).toHaveBeenCalled();
    });
  });

  describe('Service Injections', () => {
    it('should inject responsiveService', () => {
      expect(component.responsiveService).toBeDefined();
      expect(responsiveService.isMobile).toBeDefined();
    });

    it('should inject darkModeService', () => {
      expect(component.darkModeService).toBeDefined();
      expect(darkModeService.isDarkMode).toBeDefined();
    });

    it('should inject themeService', () => {
      expect(component.themeService).toBeDefined();
      expect(themeService.getThemes).toBeDefined();
    });
  });

  describe('Sidenav ViewChild', () => {
    it('should initialize sidenav ViewChild', () => {
      fixture.detectChanges();
      expect(component.sidenav).toBeDefined();
      expect(component.sidenav).toBeInstanceOf(MockMatSidenav);
    });
  });

  describe('Template Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should apply dark-theme class when darkModeService.isDarkMode is true', () => {
      darkModeService.isDarkMode.mockReturnValue(true);
      fixture.detectChanges();
      const rootEl = fixture.debugElement.query(By.css('.flex.flex-col'));
      expect(rootEl.classes['dark-theme']).toBe(true);
    });

    it('should not apply dark-theme class when darkModeService.isDarkMode is false', () => {
      darkModeService.isDarkMode.mockReturnValue(false);
      fixture.detectChanges();
      const rootEl = fixture.debugElement.query(By.css('.flex.flex-col'));
      expect(rootEl.classes['dark-theme']).toBeUndefined();
    });

    it('should display title in toolbar', () => {
      const titleEl = fixture.debugElement.query(By.css('mat-toolbar span'));
      expect(titleEl.nativeElement.textContent).toContain('Code Book');
    });

    it('should show mobile menu button when isMobile is true', () => {
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
      const mobileMenuButton = fixture.debugElement.query(By.css('button[aria-label="Open mobile menu"]'));
      expect(mobileMenuButton).toBeTruthy();
    });

    it('should hide mobile menu button when isMobile is false', () => {
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      const mobileMenuButton = fixture.debugElement.query(By.css('button[aria-label="Open mobile menu"]'));
      expect(mobileMenuButton).toBeNull();
    });

    it('should trigger toggleSidenav on sidenav button click', () => {
      const toggleSpy = jest.spyOn(component, 'toggleSidenav');
      const button = fixture.debugElement.query(By.css('button[aria-label="Toggle side navigation"]'));
      button.triggerEventHandler('click', null);
      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should trigger toggleFullScreen on fullscreen button click (desktop)', () => {
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      const toggleSpy = jest.spyOn(component, 'toggleFullScreen');
      const button = fixture.debugElement.query(By.css('button[aria-label="Toggle full screen"]'));
      button.triggerEventHandler('click', null);
      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should trigger toggleFullScreen from mobile menu', () => {
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
      const toggleSpy = jest.spyOn(component, 'toggleFullScreen');
      const fullscreenMenuItem = fixture.debugElement.query(By.css('button[aria-label="Toggle full screen"]'));
      fullscreenMenuItem.triggerEventHandler('click', null);
      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should display dark mode menu and select theme', () => {
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      const darkModeButton = fixture.debugElement.query(By.css('button[aria-label="Select light or dark theme"]'));
      expect(darkModeButton).toBeTruthy();
      const setThemeSpy = jest.spyOn(darkModeService, 'setTheme');
      const themeButtons = fixture.debugElement.queryAll(By.css('button[aria-label*="theme"]'));
      themeButtons[1].triggerEventHandler('click', null);
      expect(setThemeSpy).toHaveBeenCalledWith('dark');
    });

    it('should apply selected-theme class when theme is selected', () => {
      darkModeService.selectedTheme.mockReturnValue({ name: 'dark', icon: 'dark_mode' });
      fixture.detectChanges();
      const themeButtons = fixture.debugElement.queryAll(By.css('button[aria-label*="theme"]'));
      const darkThemeButton = themeButtons.find(btn =>
        btn.attributes['aria-label'] === 'Dark theme'
      );
      expect(darkThemeButton.classes['selected-theme']).toBe(true);
    });

    it('should not apply selected-theme class when theme is not selected', () => {
      darkModeService.selectedTheme.mockReturnValue({ name: 'light', icon: 'light_mode' });
      fixture.detectChanges();
      const themeButtons = fixture.debugElement.queryAll(By.css('button[aria-label*="theme"]'));
      const darkThemeButton = themeButtons.find(btn =>
        btn.attributes['aria-label'] === 'Dark theme'
      );
      expect(darkThemeButton.classes['selected-theme']).toBeUndefined();
    });

    it('should handle null selectedTheme', () => {
      darkModeService.selectedTheme.mockReturnValue(null);
      fixture.detectChanges();
      const themeButtons = fixture.debugElement.queryAll(By.css('button[aria-label*="theme"]'));
      themeButtons.forEach(btn => {
        expect(btn.classes['selected-theme']).toBeUndefined();
      });
    });

    it('should handle empty dark mode themes list', () => {
      darkModeService.getThemes.mockReturnValue([]);
      fixture.detectChanges();
      const themeButtons = fixture.debugElement.queryAll(By.css('button[aria-label*="theme"]'));
      expect(themeButtons.length).toBe(0);
    });

    it('should display color theme menu and select theme', () => {
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      const colorThemeButton = fixture.debugElement.query(By.css('button[aria-label="Select color theme"]'));
      expect(colorThemeButton).toBeTruthy();
      const setThemeSpy = jest.spyOn(themeService, 'setTheme');
      const themeButtons = fixture.debugElement.queryAll(By.css('button[aria-label*="color theme"]'));
      themeButtons[0].triggerEventHandler('click', null);
      expect(setThemeSpy).toHaveBeenCalledWith('blue');
    });

    it('should handle empty color themes list', () => {
      themeService.getThemes.mockReturnValue([]);
      fixture.detectChanges();
      const colorThemeButtons = fixture.debugElement.queryAll(By.css('button[aria-label*="color theme"]'));
      expect(colorThemeButtons.length).toBe(0);
    });

    it('should display language menu and change language', () => {
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      const languageButton = fixture.debugElement.query(By.css('button[aria-label="Select language"]'));
      expect(languageButton.nativeElement.textContent).toContain('English');
      const changeLangSpy = jest.spyOn(component, 'ChangeLang');
      const languageItems = fixture.debugElement.queryAll(By.css('button[aria-label*="language"]'));
      languageItems[1].triggerEventHandler('click', null);
      expect(changeLangSpy).toHaveBeenCalledWith('fr');
    });

    it('should close sidenav on content click in mobile mode', () => {
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
      component.sidenav = fixture.debugElement.query(By.directive(MockMatSidenav)).componentInstance;
      const content = fixture.debugElement.query(By.directive(MockMatSidenavContent));
      content.triggerEventHandler('click', null);
      expect(component.sidenav.close).toHaveBeenCalled();
    });

    it('should not close sidenav on content click in desktop mode', () => {
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      component.sidenav = fixture.debugElement.query(By.directive(MockMatSidenav)).componentInstance;
      const content = fixture.debugElement.query(By.directive(MockMatSidenavContent));
      content.triggerEventHandler('click', null);
      expect(component.sidenav.close).not.toHaveBeenCalled();
    });

    it('should render footer with translated content', () => {
      translateService.instant.mockReturnValue('Copyright © 2025');
      fixture.detectChanges();
      const footer = fixture.debugElement.query(By.css('footer'));
      expect(footer.nativeElement.textContent).toContain('Copyright © 2025');
    });

    it('should render footer links', () => {
      translateService.instant
        .mockReturnValueOnce('Contact Us')
        .mockReturnValueOnce('Terms of Service')
        .mockReturnValueOnce('Privacy Policy');
      fixture.detectChanges();
      const links = fixture.debugElement.queryAll(By.css('footer a'));
      expect(links.length).toBe(3);
      expect(links[0].nativeElement.textContent).toContain('Contact Us');
      expect(links[1].nativeElement.textContent).toContain('Terms of Service');
      expect(links[2].nativeElement.textContent).toContain('Privacy Policy');
    });
  });

  describe('Sidenav Template', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.sidenav = fixture.debugElement.query(By.directive(MockMatSidenav)).componentInstance;
    });

    it('should set sidenav mode correctly', () => {
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
      expect(component.sidenav.mode).toBe('over');
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      expect(component.sidenav.mode).toBe('side');
    });

    it('should set sidenav opened state correctly', () => {
      responsiveService.isMobile.mockReturnValue(true);
      component.collapsed.set(true);
      fixture.detectChanges();
      expect(component.sidenav.opened).toBe(false);
      component.collapsed.set(false);
      fixture.detectChanges();
      expect(component.sidenav.opened).toBe(true);
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      expect(component.sidenav.opened).toBe(true);
    });

    it('should set sidenav width correctly', () => {
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
      const sidenavEl = fixture.debugElement.query(By.directive(MockMatSidenav));
      expect(sidenavEl.nativeElement.style.width).toBe('280px');

      responsiveService.isMobile.mockReturnValue(false);
      component.collapsed.set(true);
      fixture.detectChanges();
      expect(sidenavEl.nativeElement.style.width).toBe('64px');

      component.collapsed.set(false);
      fixture.detectChanges();
      expect(sidenavEl.nativeElement.style.width).toBe('200px');
    });

    it('should set fixedInViewport and fixedTopGap for mobile', () => {
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
      expect(component.sidenav.fixedInViewport).toBe(true);
      expect(component.sidenav.fixedTopGap).toBe(48);
    });

    it('should not set fixedInViewport for desktop', () => {
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      expect(component.sidenav.fixedInViewport).toBe(false);
    });

    it('should pass collapsed state to custom-sidenav', () => {
      const customSidenav = fixture.debugElement.query(By.directive(MockCustomSidenavComponent));
      expect(customSidenav.componentInstance.collapsed).toBe(true);
      component.collapsed.set(false);
      fixture.detectChanges();
      expect(customSidenav.componentInstance.collapsed).toBe(false);
    });

    it('should set sidenav-content margin-left correctly', () => {
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
      const content = fixture.debugElement.query(By.directive(MockMatSidenavContent));
      expect(content.nativeElement.style.marginLeft).toBe('0px');

      responsiveService.isMobile.mockReturnValue(false);
      component.collapsed.set(true);
      fixture.detectChanges();
      expect(content.nativeElement.style.marginLeft).toBe('64px');

      component.collapsed.set(false);
      fixture.detectChanges();
      expect(content.nativeElement.style.marginLeft).toBe('200px');
    });
  });
});

describe('appConfig', () => {
  it('should provide all necessary providers', () => {
    const providers = appConfig.providers;
    expect(providers).toContainEqual(expect.objectContaining({ provide: 'ZoneChangeDetection' }));
    expect(providers).toContainEqual(expect.objectContaining({ provide: 'Router' }));
    expect(providers).toContainEqual(expect.objectContaining({ provide: 'HttpClient' }));
    expect(providers).toContainEqual(expect.objectContaining({ provide: 'Animations' }));
    expect(providers).toContainEqual(expect.objectContaining({ provide: 'Toastr' }));
    expect(providers.some(p => Array.isArray(p))).toBe(true);
  });

  it('should configure TranslateModule with HttpLoaderFactory', () => {
    const httpClient = {} as HttpClient;
    const loader = HttpLoaderFactory(httpClient);
    expect(loader).toBeInstanceOf(TranslateHttpLoader);
  });

  it('should include toastr configuration', () => {
    const toastrProvider = appConfig.providers.find(p => 'provide' in p && p.provide === 'Toastr');
    expect(toastrProvider).toBeDefined();
    expect(toastrProvider).toEqual(
      expect.objectContaining({
        provide: 'Toastr',
        useValue: expect.objectContaining({
          timeOut: 3000,
          positionClass: 'toast-top-right',
          preventDuplicates: true,
        }),
      })
    );
  });
});

describe('routes', () => {
  it('should define all routes correctly', () => {
    expect(routes).toEqual([
      { path: 'dashboard', component: expect.any(Function) },
      { path: 'users', component: expect.any(Function) },
      { path: 'business', component: expect.any(Function) },
      { path: 'business-list', component: expect.any(Function) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: '**', redirectTo: 'dashboard' },
    ]);
  });

  it('should redirect empty path to dashboard', () => {
    const redirectRoute = routes.find(r => r.path === '');
    expect(redirectRoute).toEqual({
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    });
  });

  it('should redirect unknown paths to dashboard', () => {
    const wildcardRoute = routes.find(r => r.path === '**');
    expect(wildcardRoute).toEqual({
      path: '**',
      redirectTo: 'dashboard',
    });
  });
});