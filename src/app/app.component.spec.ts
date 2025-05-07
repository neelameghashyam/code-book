import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { CustomSidenavComponent } from './custom-sidenav/custom-sidenav.component';
import { ResponsiveService } from './services/responsive/responsive.service';
import { TranslocoRootModule } from './transloco-root.module';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { routes } from './app.routes';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { Subject } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let responsiveService: ResponsiveService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        NoopAnimationsModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatSidenavModule,
        MatMenuModule,
        MatTooltipModule,
        MatBadgeModule,
        TranslocoRootModule,
        CustomSidenavComponent,
        RouterTestingModule.withRoutes(routes)
      ],
      providers: [ResponsiveService]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService);
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should have title "Code Book"', () => {
    expect(component.title).toBe('Code Book');
  });

  describe('Initial state', () => {
    it('should initialize collapsed as false', () => {
      expect(component.collapsed()).toBe(false);
    });

    it('should initialize currentLanguage as "English"', () => {
      expect(component.currentLanguage()).toBe('English');
    });
  });

  describe('toggleFullScreen()', () => {
    beforeEach(() => {
      Object.defineProperty(document, 'fullscreenElement', {
        writable: true,
        value: null
      });
      document.documentElement.requestFullscreen = jest.fn();
      document.exitFullscreen = jest.fn();
    });

    it('should enter fullscreen when not in fullscreen', () => {
      component.toggleFullScreen();
      expect(document.documentElement.requestFullscreen).toHaveBeenCalled();
    });

    it('should exit fullscreen when in fullscreen', () => {
      Object.defineProperty(document, 'fullscreenElement', {
        value: true,
        writable: true
      });
      
      component.toggleFullScreen();
      expect(document.exitFullscreen).toHaveBeenCalled();
    });

    it('should handle fullscreen error', () => {
      const mockError = new Error('Fullscreen error');
      document.documentElement.requestFullscreen = jest.fn().mockRejectedValue(mockError);
      const consoleSpy = jest.spyOn(console, 'error');
      
      component.toggleFullScreen();
      expect(consoleSpy).toHaveBeenCalledWith(`Error attempting to enable fullscreen: ${mockError.message}`);
    });
  });

  describe('setLanguage()', () => {
    it('should set language to English when "en" is passed', () => {
      component.setLanguage('en');
      expect(component.currentLanguage()).toBe('English');
    });

    it('should set language to French when "fr" is passed', () => {
      component.setLanguage('fr');
      expect(component.currentLanguage()).toBe('French');
    });

    it('should keep current language when unknown code is passed', () => {
      component.setLanguage('de');
      expect(component.currentLanguage()).toBe('English');
    });

    it('should actually change language in transloco service', () => {
      const translocoService = TestBed.inject(TranslocoService);
      const setActiveLangSpy = jest.spyOn(translocoService, 'setActiveLang');
      
      component.setLanguage('fr');
      expect(setActiveLangSpy).toHaveBeenCalledWith('fr');
    });
  });

  describe('toggleSidenav()', () => {
    it('should toggle collapsed state', () => {
      const initialValue = component.collapsed();
      component.toggleSidenav();
      expect(component.collapsed()).toBe(!initialValue);
      component.toggleSidenav();
      expect(component.collapsed()).toBe(initialValue);
    });
  });

  describe('computed properties', () => {
    describe('sidenavWidth()', () => {
      it('should return 280px for mobile', () => {
        jest.spyOn(responsiveService, 'isMobile').mockReturnValue(true);
        expect(component.sidenavWidth()).toBe('280px');
      });

      it('should return 64px when collapsed on desktop', () => {
        jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
        component.collapsed.set(true);
        expect(component.sidenavWidth()).toBe('64px');
      });

      it('should return 200px when not collapsed on desktop', () => {
        jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
        component.collapsed.set(false);
        expect(component.sidenavWidth()).toBe('200px');
      });
    });

    describe('sidenavMode()', () => {
      it('should return "over" for mobile', () => {
        jest.spyOn(responsiveService, 'isMobile').mockReturnValue(true);
        expect(component.sidenavMode()).toBe('over');
      });

      it('should return "side" for desktop', () => {
        jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
        expect(component.sidenavMode()).toBe('side');
      });
    });

    describe('sidenavOpened()', () => {
      it('should return true for desktop regardless of collapsed state', () => {
        jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
        component.collapsed.set(true);
        expect(component.sidenavOpened()).toBe(true);
        component.collapsed.set(false);
        expect(component.sidenavOpened()).toBe(true);
      });

      it('should return false when collapsed on mobile', () => {
        jest.spyOn(responsiveService, 'isMobile').mockReturnValue(true);
        component.collapsed.set(true);
        expect(component.sidenavOpened()).toBe(false);
      });

      it('should return true when not collapsed on mobile', () => {
        jest.spyOn(responsiveService, 'isMobile').mockReturnValue(true);
        component.collapsed.set(false);
        expect(component.sidenavOpened()).toBe(true);
      });
    });
  });

  describe('Template', () => {
    it('should display the correct title in toolbar', () => {
      const titleElement = fixture.debugElement.query(By.css('mat-toolbar .title'));
      expect(titleElement.nativeElement.textContent).toContain('Code Book');
    });

    it('should call toggleSidenav when menu button is clicked', () => {
      const toggleSpy = jest.spyOn(component, 'toggleSidenav');
      const menuButton = fixture.debugElement.query(By.css('mat-toolbar button[aria-label="Toggle sidenav"]'));
      menuButton.triggerEventHandler('click', null);
      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should call toggleFullScreen when fullscreen button is clicked', () => {
      const fullscreenSpy = jest.spyOn(component, 'toggleFullScreen');
      const fullscreenButton = fixture.debugElement.query(By.css('mat-toolbar button[aria-label="Toggle fullscreen"]'));
      fullscreenButton.triggerEventHandler('click', null);
      expect(fullscreenSpy).toHaveBeenCalled();
    });

    it('should contain app-custom-sidenav component', () => {
      const sidenavComponent = fixture.debugElement.query(By.directive(CustomSidenavComponent));
      expect(sidenavComponent).toBeTruthy();
    });

    it('should pass collapsed state to custom sidenav', () => {
      component.collapsed.set(true);
      fixture.detectChanges();
      const sidenavComponent = fixture.debugElement.query(By.directive(CustomSidenavComponent));
      expect(sidenavComponent.componentInstance.collapsed).toBe(true);
    });
  });

  describe('Integration with ResponsiveService', () => {
    it('should update sidenav when responsive service emits changes', () => {
      // Create a mock observable
      const mockObservable = new Subject<boolean>();
      
      // Properly type the spy and mock the property
      jest.spyOn(responsiveService as any, 'screenWidth$', 'get').mockReturnValue(mockObservable);
      
      // Recreate component with new spy
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      
      mockObservable.next(true); // Simulate mobile
      fixture.detectChanges();
      expect(component.sidenavMode()).toBe('over');
      
      mockObservable.next(false); // Simulate desktop
      fixture.detectChanges();
      expect(component.sidenavMode()).toBe('side');
    });
  });

  describe('App Routing', () => {
    let router: Router;

    beforeEach(() => {
      router = TestBed.inject(Router);
    });

    it('should redirect empty path to dashboard', fakeAsync(() => {
      router.navigate(['']);
      tick();
      expect(router.url).toBe('/dashboard');
    }));

    it('should redirect unknown paths to dashboard', fakeAsync(() => {
      router.navigate(['nonexistent']);
      tick();
      expect(router.url).toBe('/dashboard');
    }));

    it('should route to dashboard component', fakeAsync(() => {
      router.navigate(['dashboard']);
      tick();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.directive(DashboardComponent))).toBeTruthy();
    }));

    it('should route to users component', fakeAsync(() => {
      router.navigate(['users']);
      tick();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.directive(UsersComponent))).toBeTruthy();
    }));
  });
});

describe('AppConfig', () => {
  it('should provide zone change detection with event coalescing', () => {
    // Type-safe check for zone provider
    const zoneProvider = appConfig.providers.find(
      (p: any) => p?.ɵproviders?.some((prov: any) => prov?.provide === 'eventCoalescingEnabled')
    );
    expect(zoneProvider).toBeDefined();
  });

  it('should provide router with correct routes', () => {
    // Type-safe check for router provider
    const routerProvider = appConfig.providers.find(
      (p: any) => p?.ɵproviders?.some((prov: any) => prov?.provide === Router)
    );
    expect(routerProvider).toBeDefined();
  });
});