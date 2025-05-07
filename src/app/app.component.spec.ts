import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ResponsiveService } from './services/responsive/responsive.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterOutlet } from '@angular/router';
import { CustomSidenavComponent } from './custom-sidenav/custom-sidenav.component';
import { TranslocoRootModule } from './transloco-root.module';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let responsiveService: ResponsiveService;

  // Mock ResponsiveService
  const responsiveServiceMock = {
    isMobile: jest.fn().mockReturnValue(false),
  };

  // Mock document fullscreen APIs
  const mockRequestFullscreen = jest.fn();
  const mockExitFullscreen = jest.fn();
  const mockDocument = {
    fullscreenElement: null,
    documentElement: { requestFullscreen: mockRequestFullscreen },
    exitFullscreen: mockExitFullscreen,
  };

  beforeEach(async () => {
    // Reset mocks
    responsiveServiceMock.isMobile.mockReset();
    mockRequestFullscreen.mockReset();
    mockExitFullscreen.mockReset();
    mockDocument.fullscreenElement = null;

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatMenuModule,
        MatTooltipModule,
        MatBadgeModule,
        NoopAnimationsModule,
        TranslocoRootModule,
      ],
      declarations: [AppComponent, CustomSidenavComponent],
      providers: [
        { provide: ResponsiveService, useValue: responsiveServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService);
    fixture.detectChanges();

    // Override document with mock
    Object.defineProperty(window, 'document', {
      value: mockDocument,
      writable: true,
    });
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.title).toBe('Code Book');
    expect(component.collapsed()).toBe(false);
    expect(component.currentLanguage()).toBe('English');
  });

  describe('sidenavWidth', () => {
    it('should return 280px when isMobile is true', () => {
      responsiveServiceMock.isMobile.mockReturnValue(true);
      expect(component.sidenavWidth()).toBe('280px');
    });

    it('should return 64px when isMobile is false and collapsed is true', () => {
      responsiveServiceMock.isMobile.mockReturnValue(false);
      component.collapsed.set(true);
      expect(component.sidenavWidth()).toBe('64px');
    });

    it('should return 200px when isMobile is false and collapsed is false', () => {
      responsiveServiceMock.isMobile.mockReturnValue(false);
      component.collapsed.set(false);
      expect(component.sidenavWidth()).toBe('200px');
    });
  });

  describe('sidenavMode', () => {
    it('should return "over" when isMobile is true', () => {
      responsiveServiceMock.isMobile.mockReturnValue(true);
      expect(component.sidenavMode()).toBe('over');
    });

    it('should return "side" when isMobile is false', () => {
      responsiveServiceMock.isMobile.mockReturnValue(false);
      expect(component.sidenavMode()).toBe('side');
    });
  });

  describe('sidenavOpened', () => {
    it('should return false when isMobile is true and collapsed is true', () => {
      responsiveServiceMock.isMobile.mockReturnValue(true);
      component.collapsed.set(true);
      expect(component.sidenavOpened()).toBe(false);
    });

    it('should return true when isMobile is true and collapsed is false', () => {
      responsiveServiceMock.isMobile.mockReturnValue(true);
      component.collapsed.set(false);
      expect(component.sidenavOpened()).toBe(true);
    });

    it('should return true when isMobile is false', () => {
      responsiveServiceMock.isMobile.mockReturnValue(false);
      component.collapsed.set(true); // Should not affect
      expect(component.sidenavOpened()).toBe(true);
    });
  });

  describe('toggleSidenav', () => {
    it('should toggle collapsed state from false to true', () => {
      component.collapsed.set(false);
      component.toggleSidenav();
      expect(component.collapsed()).toBe(true);
    });

    it('should toggle collapsed state from true to false', () => {
      component.collapsed.set(true);
      component.toggleSidenav();
      expect(component.collapsed()).toBe(false);
    });

    it('should trigger sidenav toggle button click', () => {
      const button = fixture.debugElement.query(By.css('button[mat-icon-button]'));
      const toggleSpy = jest.spyOn(component, 'toggleSidenav');
      button.triggerEventHandler('click', null);
      expect(toggleSpy).toHaveBeenCalled();
    });
  });

  describe('setLanguage', () => {
    it('should set language to English when lang is "en"', () => {
      component.setLanguage('en');
      expect(component.currentLanguage()).toBe('English');
    });

    it('should set language to French when lang is "fr"', () => {
      component.setLanguage('fr');
      expect(component.currentLanguage()).toBe('French');
    });

    it('should trigger language menu item click for English', () => {
      const menuItems = fixture.debugElement.queryAll(By.css('button[mat-menu-item]'));
      const setLanguageSpy = jest.spyOn(component, 'setLanguage');
      menuItems[0].triggerEventHandler('click', null);
      expect(setLanguageSpy).toHaveBeenCalledWith('en');
    });

    it('should trigger language menu item click for French', () => {
      const menuItems = fixture.debugElement.queryAll(By.css('button[mat-menu-item]'));
      const setLanguageSpy = jest.spyOn(component, 'setLanguage');
      menuItems[1].triggerEventHandler('click', null);
      expect(setLanguageSpy).toHaveBeenCalledWith('fr');
    });
  });

  describe('toggleFullScreen', () => {
    it('should request fullscreen when not in fullscreen', async () => {
      mockDocument.fullscreenElement = null;
      component.toggleFullScreen();
      expect(mockRequestFullscreen).toHaveBeenCalled();
    });

    it('should exit fullscreen when in fullscreen', async () => {
      mockDocument.fullscreenElement = document.documentElement;
      component.toggleFullScreen();
      expect(mockExitFullscreen).toHaveBeenCalled();
    });

    it('should log error when requestFullscreen fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockDocument.fullscreenElement = null;
      mockRequestFullscreen.mockRejectedValueOnce(new Error('Permission denied'));
      component.toggleFullScreen();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error attempting to enable fullscreen: Permission denied');
      consoleErrorSpy.mockRestore();
    });

    it('should trigger fullscreen button click', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button[mat-icon-button]'));
      const fullscreenButton = buttons.find(btn =>
        btn.attributes['matTooltip'] === 'Full Screen'
      );
      const toggleFullScreenSpy = jest.spyOn(component, 'toggleFullScreen');
      fullscreenButton.triggerEventHandler('click', null);
      expect(toggleFullScreenSpy).toHaveBeenCalled();
    });
  });

  describe('template bindings', () => {
    it('should display title in toolbar', () => {
      const toolbar = fixture.debugElement.query(By.css('mat-toolbar'));
      expect(toolbar.nativeElement.textContent).toContain('Code Book');
    });

    it('should display current language in language button', () => {
      component.currentLanguage.set('French');
      fixture.detectChanges();
      const languageButton = fixture.debugElement.query(By.css('button[matTooltip="Language"]'));
      expect(languageButton.nativeElement.textContent).toContain('French');
    });

    it('should apply correct sidenav width based on collapsed state', () => {
      responsiveServiceMock.isMobile.mockReturnValue(false);
      component.collapsed.set(true);
      fixture.detectChanges();
      const sidenav = fixture.debugElement.query(By.css('mat-sidenav'));
      expect(sidenav.styles['width']).toBe('64px');

      component.collapsed.set(false);
      fixture.detectChanges();
      expect(sidenav.styles['width']).toBe('200px');
    });

    it('should close sidenav on content click when isMobile is true', () => {
      responsiveServiceMock.isMobile.mockReturnValue(true);
      const sidenavContent = fixture.debugElement.query(By.css('mat-sidenav-content'));
      const sidenav = fixture.debugElement.query(By.css('mat-sidenav'));
      const closeSpy = jest.fn();
      sidenav.componentInstance.close = closeSpy;
      sidenavContent.triggerEventHandler('click', null);
      expect(closeSpy).toHaveBeenCalled();
    });

    it('should not close sidenav on content click when isMobile is false', () => {
      responsiveServiceMock.isMobile.mockReturnValue(false);
      const sidenavContent = fixture.debugElement.query(By.css('mat-sidenav-content'));
      const sidenav = fixture.debugElement.query(By.css('mat-sidenav'));
      const closeSpy = jest.fn();
      sidenav.componentInstance.close = closeSpy;
      sidenavContent.triggerEventHandler('click', null);
      expect(closeSpy).not.toHaveBeenCalled();
    });
  });

  describe('footer', () => {
    it('should display correct footer content', () => {
      const footer = fixture.debugElement.query(By.css('footer'));
      expect(footer.nativeElement.textContent).toContain('© 2025 Your Code Book All rights reserved');
      expect(footer.nativeElement.textContent).toContain('Privacy Policy');
      expect(footer.nativeElement.textContent).toContain('Terms of Service');
      expect(footer.nativeElement.textContent).toContain('Contact Us');
    });
  });
});