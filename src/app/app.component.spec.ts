import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterOutlet, Router, provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, HttpClient } from '@angular/common/http';
import { provideToastr, ToastrService } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideZoneChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';
import { ResponsiveService } from './services/responsive/responsive.service';
import { DarkModeService } from './services/dark-mode.service';
import { ThemeService } from './services/theme/theme.service';
import { TranslocoRootModule } from './transloco-root.module';
import { routes } from './app.routes';
import { appConfig } from './app.config';
import { Component, signal, NgModule } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { BusinessComponent } from './pages/business/business.component';
import { ListBusinessesComponent } from './pages/business/list-businesses/list-businesses.component';

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
    { id: 'deep-blue', primary: '#1976D2', displayName: 'Deep-Blue' },
    { id: 'green', primary: '#00796B', displayName: 'Green' },
  ]);
  setTheme = jest.fn();
}

// Mock Components
@Component({ selector: 'app-custom-sidenav', template: '' })
class MockCustomSidenavComponent {
  collapsed = signal(true);
}

@Component({ selector: 'app-user', template: '' })
class MockUserComponent {}

@Component({ selector: 'app-dashboard', template: '<div>Dashboard</div>' })
class MockDashboardComponent {}

@Component({ selector: 'app-users', template: '<div>Users</div>' })
class MockUsersComponent {}

@Component({ selector: 'app-business', template: '<div>Business</div>' })
class MockBusinessComponent {}

@Component({ selector: 'app-list-businesses', template: '<div>List Businesses</div>' })
class MockListBusinessesComponent {}

// Mock TranslocoRootModule
@NgModule({
  imports: [],
  exports: [],
})
class MockTranslocoRootModule {}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let responsiveService: MockResponsiveService;
  let darkModeService: MockDarkModeService;
  let themeService: MockThemeService;
  let router: Router;

  beforeEach(waitForAsync(() => {
    responsiveService = new MockResponsiveService();
    darkModeService = new MockDarkModeService();
    themeService = new MockThemeService();

    TestBed.configureTestingModule({
      imports: [
        RouterOutlet,
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatMenuModule,
        MatTooltipModule,
        MatBadgeModule,
        NoopAnimationsModule,
        MockTranslocoRootModule,
      ],
      providers: [
        { provide: ResponsiveService, useValue: responsiveService },
        { provide: DarkModeService, useValue: darkModeService },
        { provide: ThemeService, useValue: themeService },
        ...appConfig.providers,
      ],
    })
      .overrideComponent(AppComponent, {
        set: {
          imports: [
            RouterOutlet,
            CommonModule,
            MatToolbarModule,
            MatButtonModule,
            MatIconModule,
            MatSidenavModule,
            MatMenuModule,
            MatTooltipModule,
            MatBadgeModule,
            MockTranslocoRootModule,
            MockCustomSidenavComponent,
            MockUserComponent,
          ],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with default title, collapsed, and currentLanguage', () => {
      expect(component.title).toBe('Code Book');
      expect(component.collapsed()).toBe(true);
      expect(component.currentLanguage()).toBe('English');
    });

    it('should inject services', () => {
      expect(component.responsiveService).toBe(responsiveService);
      expect(component.darkModeService).toBe(darkModeService);
      expect(component.themeService).toBe(themeService);
    });
  });

  describe('Template Rendering', () => {
    it('should render toolbar with title and buttons', () => {
      const toolbar = fixture.nativeElement.querySelector('mat-toolbar');
      expect(toolbar).toBeTruthy();
      expect(toolbar.querySelector('span').textContent).toContain('Code Book');
      expect(toolbar.querySelectorAll('button[mat-icon-button]').length).toBe(3);
      expect(toolbar.querySelector('button[mat-button]')).toBeTruthy();
      expect(toolbar.querySelector('app-user')).toBeTruthy();
      expect(toolbar.querySelector('button[mat-icon-button] mat-icon').textContent).toBe('menu');
      expect(toolbar.querySelectorAll('button[mat-icon-button]')[1].querySelector('mat-icon').textContent).toBe('fullscreen');
      expect(toolbar.querySelectorAll('button[mat-icon-button]')[2].querySelector('mat-icon').textContent).toBe('light_mode');
    });

    it('should render sidenav with CustomSidenavComponent', () => {
      const sidenav = fixture.nativeElement.querySelector('mat-sidenav');
      expect(sidenav).toBeTruthy();
      expect(sidenav.querySelector('app-custom-sidenav')).toBeTruthy();
    });

    it('should render router-outlet in sidenav-content', () => {
      const sidenavContent = fixture.nativeElement.querySelector('mat-sidenav-content');
      expect(sidenavContent.querySelector('router-outlet')).toBeTruthy();
    });

    it('should render footer with copyright and links', () => {
      const footer = fixture.nativeElement.querySelector('footer');
      expect(footer.textContent).toContain('© 2025 Your Code Book All rights reserved');
      const links = footer.querySelectorAll('a');
      expect(links.length).toBe(3);
      expect(links[0].textContent).toBe('Privacy Policy');
      expect(links[1].textContent).toBe('Terms of Service');
      expect(links[2].textContent).toBe('Contact Us');
    });

    it('should apply dark-theme class when dark mode is enabled', () => {
      darkModeService.isDarkMode.mockReturnValue(true);
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('.flex.flex-col');
      expect(container.classList).toContain('dark-theme');
    });
  });

  describe('Computed Signals', () => {
    it('should compute sidenavWidth based on collapsed and isMobile', () => {
      expect(component.sidenavWidth()).toBe('64px');
      component.collapsed.set(false);
      expect(component.sidenavWidth()).toBe('200px');
      responsiveService.isMobile.mockReturnValue(true);
      expect(component.sidenavWidth()).toBe('280px');
    });

    it('should compute sidenavMode based on isMobile', () => {
      expect(component.sidenavMode()).toBe('side');
      responsiveService.isMobile.mockReturnValue(true);
      expect(component.sidenavMode()).toBe('over');
    });

    it('should compute sidenavOpened based on isMobile and collapsed', () => {
      expect(component.sidenavOpened()).toBe(true);
      component.collapsed.set(false);
      expect(component.sidenavOpened()).toBe(true);
      responsiveService.isMobile.mockReturnValue(true);
      expect(component.sidenavOpened()).toBe(false);
      component.collapsed.set(false);
      expect(component.sidenavOpened()).toBe(true);
    });
  });

  describe('toggleSidenav', () => {
    it('should toggle collapsed state', () => {
      expect(component.collapsed()).toBe(true);
      component.toggleSidenav();
      expect(component.collapsed()).toBe(false);
      component.toggleSidenav();
      expect(component.collapsed()).toBe(true);
    });

    it('should toggle sidenav when menu button is clicked', () => {
      const menuButton = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      menuButton.nativeElement.click();
      fixture.detectChanges();
      expect(component.collapsed()).toBe(false);
    });

    it('should update sidenav width in UI', () => {
      component.toggleSidenav();
      fixture.detectChanges();
      const sidenav = fixture.nativeElement.querySelector('mat-sidenav');
      expect(sidenav.style.width).toBe('200px');
    });
  });

  describe('toggleFullScreen', () => {
    let requestFullscreenSpy: jest.SpyInstance;
    let exitFullscreenSpy: jest.SpyInstance;

    beforeEach(() => {
      // Set default mocks
      requestFullscreenSpy = jest.spyOn(document.documentElement, 'requestFullscreen').mockImplementation(() => Promise.resolve());
      exitFullscreenSpy = jest.spyOn(document, 'exitFullscreen').mockImplementation(() => Promise.resolve());
      // Ensure document properties are writable
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(document, 'exitFullscreen', {
        value: jest.fn().mockImplementation(() => Promise.resolve()),
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      requestFullscreenSpy.mockRestore();
      exitFullscreenSpy.mockRestore();
      // Reset document properties to avoid test interference
      Object.defineProperty(document, 'fullscreenElement', {
        value: null,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(document, 'exitFullscreen', {
        value: jest.fn().mockImplementation(() => Promise.resolve()),
        writable: true,
        configurable: true,
      });
    });

    it('should request fullscreen when not in fullscreen', async () => {
      Object.defineProperty(document, 'fullscreenElement', { value: null });
      await component.toggleFullScreen();
      expect(requestFullscreenSpy).toHaveBeenCalled();
      expect(exitFullscreenSpy).not.toHaveBeenCalled();
    });

    it('should exit fullscreen when in fullscreen and exitFullscreen is available', async () => {
      Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement });
      Object.defineProperty(document, 'exitFullscreen', { value: jest.fn().mockImplementation(() => Promise.resolve()) });
      await component.toggleFullScreen();
      expect(document.exitFullscreen).toHaveBeenCalled();
      expect(requestFullscreenSpy).not.toHaveBeenCalled();
    });

    it('should not attempt to exit fullscreen when in fullscreen but exitFullscreen is undefined', async () => {
      Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement });
      Object.defineProperty(document, 'exitFullscreen', { value: undefined });
      await component.toggleFullScreen();
      expect(requestFullscreenSpy).not.toHaveBeenCalled();
      expect(exitFullscreenSpy).not.toHaveBeenCalled();
    });

    it('should not attempt to exit fullscreen when in fullscreen but exitFullscreen is null', async () => {
      Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement });
      Object.defineProperty(document, 'exitFullscreen', { value: null });
      await component.toggleFullScreen();
      expect(requestFullscreenSpy).not.toHaveBeenCalled();
      expect(exitFullscreenSpy).not.toHaveBeenCalled();
    });

    it('should log error when fullscreen request fails', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      requestFullscreenSpy.mockRejectedValue(new Error('Permission denied'));
      Object.defineProperty(document, 'fullscreenElement', { value: null });
      await component.toggleFullScreen();
      expect(console.error).toHaveBeenCalledWith('Error attempting to enable fullscreen: Permission denied');
    });

    it('should trigger fullscreen toggle when button is clicked (enter fullscreen)', async () => {
      Object.defineProperty(document, 'fullscreenElement', { value: null });
      const fullscreenButton = fixture.debugElement.queryAll(By.css('button[mat-icon-button]'))[1];
      fullscreenButton.nativeElement.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(requestFullscreenSpy).toHaveBeenCalled();
    });

    it('should trigger fullscreen toggle when button is clicked (exit fullscreen)', async () => {
      Object.defineProperty(document, 'fullscreenElement', { value: document.documentElement });
      Object.defineProperty(document, 'exitFullscreen', { value: jest.fn().mockImplementation(() => Promise.resolve()) });
      const fullscreenButton = fixture.debugElement.queryAll(By.css('button[mat-icon-button]'))[1];
      fullscreenButton.nativeElement.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(document.exitFullscreen).toHaveBeenCalled();
    });
  });

  describe('setLanguage', () => {
    it('should set language to English for "en"', () => {
      component.setLanguage('en');
      expect(component.currentLanguage()).toBe('English');
    });

    it('should set language to French for "fr"', () => {
      component.setLanguage('fr');
      expect(component.currentLanguage()).toBe('French');
    });

    it('should update language when menu item is clicked', () => {
      const languageButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor="languageMenu"]'));
      languageButton.nativeElement.click();
      fixture.detectChanges();

      const menuItems = fixture.debugElement.queryAll(By.css('mat-menu[ng-reflect-menu="languageMenu"] button[mat-menu-item]'));
      menuItems[1].nativeElement.click();
      fixture.detectChanges();

      expect(component.currentLanguage()).toBe('French');
      expect(fixture.nativeElement.querySelector('button[matMenuTriggerFor="languageMenu"] a').textContent).toBe('French');
    });
  });

  describe('Dark Mode Menu', () => {
    it('should render dark mode menu items', () => {
      const darkModeButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor="darkModeMenu"]'));
      darkModeButton.nativeElement.click();
      fixture.detectChanges();

      const menuItems = fixture.debugElement.queryAll(By.css('mat-menu[ng-reflect-menu="darkModeMenu"] button[mat-menu-item]'));
      expect(menuItems.length).toBe(2);
      expect(menuItems[0].nativeElement.textContent).toContain('Light');
      expect(menuItems[1].nativeElement.textContent).toContain('Dark');
    });

    it('should apply selected-theme class to current dark mode theme', () => {
      darkModeService.selectedTheme.mockReturnValue({ name: 'dark', icon: 'dark_mode' });
      fixture.detectChanges();

      const darkModeButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor="darkModeMenu"]'));
      darkModeButton.nativeElement.click();
      fixture.detectChanges();

      const menuItems = fixture.debugElement.queryAll(By.css('mat-menu[ng-reflect-menu="darkModeMenu"] button[mat-menu-item]'));
      expect(menuItems[1].nativeElement.classList).toContain('selected-theme');
      expect(menuItems[0].nativeElement.classList).not.toContain('selected-theme');
    });

    it('should call setTheme when dark mode menu item is clicked', () => {
      const darkModeButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor="darkModeMenu"]'));
      darkModeButton.nativeElement.click();
      fixture.detectChanges();

      const menuItems = fixture.debugElement.queryAll(By.css('mat-menu[ng-reflect-menu="darkModeMenu"] button[mat-menu-item]'));
      menuItems[1].nativeElement.click();
      fixture.detectChanges();

      expect(darkModeService.setTheme).toHaveBeenCalledWith('dark');
    });
  });

  describe('Color Theme Menu', () => {
    it('should render color theme menu items with color preview', () => {
      const colorThemeButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor="colorThemeMenu"]'));
      colorThemeButton.nativeElement.click();
      fixture.detectChanges();

      const menuItems = fixture.debugElement.queryAll(By.css('mat-menu[ng-reflect-menu="colorThemeMenu"] button[mat-menu-item]'));
      expect(menuItems.length).toBe(2);
      expect(menuItems[0].nativeElement.textContent).toContain('Deep-Blue');
      expect(menuItems[1].nativeElement.textContent).toContain('Green');

      const colorPreviews = fixture.debugElement.queryAll(By.css('.color-preview'));
      expect(colorPreviews[0].nativeElement.style.backgroundColor).toBe('rgb(25, 118, 210)');
      expect(colorPreviews[1].nativeElement.style.backgroundColor).toBe('rgb(0, 121, 107)');
    });

    it('should call setTheme when color theme menu item is clicked', () => {
      const colorThemeButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor="colorThemeMenu"]'));
      colorThemeButton.nativeElement.click();
      fixture.detectChanges();

      const menuItems = fixture.debugElement.queryAll(By.css('mat-menu[ng-reflect-menu="colorThemeMenu"] button[mat-menu-item]'));
      menuItems[1].nativeElement.click();
      fixture.detectChanges();

      expect(themeService.setTheme).toHaveBeenCalledWith('green');
    });
  });

  describe('Responsive Behavior', () => {
    it('should set sidenav margin-left to 0 on mobile', () => {
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
      const sidenavContent = fixture.nativeElement.querySelector('mat-sidenav-content');
      expect(sidenavContent.style.marginLeft).toBe('0px');
    });

    it('should set fixedInViewport and fixedTopGap on mobile', () => {
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
      const sidenav = fixture.nativeElement.querySelector('mat-sidenav');
      expect(sidenav.getAttribute('ng-reflect-fixed-in-viewport')).toBe('true');
      expect(sidenav.getAttribute('ng-reflect-fixed-top-gap')).toBe('48');
    });

    it('should close sidenav on content click when mobile', () => {
      responsiveService.isMobile.mockReturnValue(true);
      component.collapsed.set(false);
      fixture.detectChanges();

      const sidenav = fixture.debugElement.query(By.css('mat-sidenav')).componentInstance;
      const closeSpy = jest.spyOn(sidenav, 'close');
      const sidenavContent = fixture.debugElement.query(By.css('mat-sidenav-content'));
      sidenavContent.triggerEventHandler('click', {});
      fixture.detectChanges();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should not close sidenav on content click when not mobile', () => {
      responsiveService.isMobile.mockReturnValue(false);
      component.collapsed.set(false);
      fixture.detectChanges();

      const sidenav = fixture.debugElement.query(By.css('mat-sidenav')).componentInstance;
      const closeSpy = jest.spyOn(sidenav, 'close');
      const sidenavContent = fixture.debugElement.query(By.css('mat-sidenav-content'));
      sidenavContent.triggerEventHandler('click', {});
      fixture.detectChanges();

      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  describe('Tooltip Integration', () => {
    it('should render tooltips for fullscreen, dark mode, color theme, and language buttons', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button[matTooltip]'));
      expect(buttons.length).toBe(3);
      expect(buttons[0].nativeElement.getAttribute('matTooltip')).toBe('Full Screen');
      expect(buttons[1].nativeElement.getAttribute('matTooltip')).toBe('Select Light/Dark Mode');
      expect(buttons[2].nativeElement.getAttribute('matTooltip')).toBe('Select Color Theme');
    });
  });

  describe('Routing Integration', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          RouterOutlet,
          CommonModule,
          MatToolbarModule,
          MatButtonModule,
          MatIconModule,
          MatSidenavModule,
          MatMenuModule,
          MatTooltipModule,
          MatBadgeModule,
          NoopAnimationsModule,
          MockTranslocoRootModule,
        ],
        providers: [
          { provide: ResponsiveService, useValue: responsiveService },
          { provide: DarkModeService, useValue: darkModeService },
          { provide: ThemeService, useValue: themeService },
          ...appConfig.providers,
        ],
      })
        .overrideComponent(AppComponent, {
          set: {
            imports: [
              RouterOutlet,
              CommonModule,
              MatToolbarModule,
              MatButtonModule,
              MatIconModule,
              MatSidenavModule,
              MatMenuModule,
              MatTooltipModule,
              MatBadgeModule,
              MockTranslocoRootModule,
              MockCustomSidenavComponent,
              MockUserComponent,
            ],
          },
        })
        .compileComponents();

      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    it('should render DashboardComponent for /dashboard route', async () => {
      await router.navigate(['dashboard']);
      fixture.detectChanges();
      const dashboard = fixture.debugElement.query(By.css('app-dashboard'));
      expect(dashboard).toBeTruthy();
      expect(dashboard.nativeElement.textContent).toContain('Dashboard');
    });

    it('should render UsersComponent for /users route', async () => {
      await router.navigate(['users']);
      fixture.detectChanges();
      const users = fixture.debugElement.query(By.css('app-users'));
      expect(users).toBeTruthy();
      expect(users.nativeElement.textContent).toContain('Users');
    });

    it('should render BusinessComponent for /business route', async () => {
      await router.navigate(['business']);
      fixture.detectChanges();
      const business = fixture.debugElement.query(By.css('app-business'));
      expect(business).toBeTruthy();
      expect(business.nativeElement.textContent).toContain('Business');
    });

    it('should render ListBusinessesComponent for /business-list route', async () => {
      await router.navigate(['business-list']);
      fixture.detectChanges();
      const listBusinesses = fixture.debugElement.query(By.css('app-list-businesses'));
      expect(listBusinesses).toBeTruthy();
      expect(listBusinesses.nativeElement.textContent).toContain('List Businesses');
    });

    it('should redirect to /dashboard for empty route', async () => {
      await router.navigate(['']);
      fixture.detectChanges();
      const dashboard = fixture.debugElement.query(By.css('app-dashboard'));
      expect(dashboard).toBeTruthy();
      expect(router.url).toBe('/dashboard');
    });

    it('should redirect to /dashboard for unknown route', async () => {
      await router.navigate(['unknown']);
      fixture.detectChanges();
      const dashboard = fixture.debugElement.query(By.css('app-dashboard'));
      expect(dashboard).toBeTruthy();
      expect(router.url).toBe('/dashboard');
    });
  });

  describe('AppConfig Integration', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          RouterOutlet,
          CommonModule,
          MatToolbarModule,
          MatButtonModule,
          MatIconModule,
          MatSidenavModule,
          MatMenuModule,
          MatTooltipModule,
          MatBadgeModule,
          NoopAnimationsModule,
          MockTranslocoRootModule,
        ],
        providers: [
          { provide: ResponsiveService, useValue: responsiveService },
          { provide: DarkModeService, useValue: darkModeService },
          { provide: ThemeService, useValue: themeService },
          ...appConfig.providers,
        ],
      })
        .overrideComponent(AppComponent, {
          set: {
            imports: [
              RouterOutlet,
              CommonModule,
              MatToolbarModule,
              MatButtonModule,
              MatIconModule,
              MatSidenavModule,
              MatMenuModule,
              MatTooltipModule,
              MatBadgeModule,
              MockTranslocoRootModule,
              MockCustomSidenavComponent,
              MockUserComponent,
            ],
          },
        })
        .compileComponents();
    });

    it('should include all providers from appConfig', () => {
      expect(appConfig.providers.length).toBe(5);
      expect(appConfig.providers).toContainEqual(provideZoneChangeDetection({ eventCoalescing: true }));
      expect(appConfig.providers).toContainEqual(provideRouter(routes));
      expect(appConfig.providers).toContainEqual(provideHttpClient());
      expect(appConfig.providers).toContainEqual(provideAnimations());
      expect(appConfig.providers).toContainEqual(
        provideToastr({
          timeOut: 3000,
          positionClass: 'toast-top-right',
          preventDuplicates: true,
        })
      );
    });

    it('should provide ZoneChangeDetection with eventCoalescing', () => {
      const zoneConfig = TestBed.inject(provideZoneChangeDetection);
      expect(zoneConfig).toBeDefined();
      expect(zoneConfig({ eventCoalescing: true })).toBeDefined();
    });

    it('should provide Router with routes', () => {
      const routerInstance = TestBed.inject(Router);
      expect(routerInstance).toBeTruthy();
      expect(routerInstance.config).toContainEqual(expect.objectContaining({ path: 'dashboard' }));
      expect(routerInstance.config).toContainEqual(expect.objectContaining({ path: 'users' }));
      expect(routerInstance.config).toContainEqual(expect.objectContaining({ path: 'business' }));
      expect(routerInstance.config).toContainEqual(expect.objectContaining({ path: 'business-list' }));
      expect(routerInstance.config).toContainEqual(expect.objectContaining({ path: '', redirectTo: 'dashboard' }));
      expect(routerInstance.config).toContainEqual(expect.objectContaining({ path: '**', redirectTo: 'dashboard' }));
    });

    it('should provide HttpClient', () => {
      const httpClient = TestBed.inject(HttpClient);
      expect(httpClient).toBeTruthy();
    });

    it('should provide Animations', () => {
      const animations = TestBed.inject(provideAnimations);
      expect(animations).toBeDefined();
    });

    it('should provide Toastr with correct configuration', () => {
      const toastrService = TestBed.inject(ToastrService);
      expect(toastrService).toBeTruthy();
      expect(toastrService.toastrConfig.timeOut).toBe(3000);
      expect(toastrService.toastrConfig.positionClass).toBe('toast-top-right');
      expect(toastrService.toastrConfig.preventDuplicates).toBe(true);
    });
  });
});