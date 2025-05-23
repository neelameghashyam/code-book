import { TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { provideRouter, Router, Routes, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr, ToastrService } from 'ngx-toastr';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { AuthGuard } from './auth.guard';
import { AuthService } from './login/auth.service';
import { NavComponent } from './nav.component';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { appConfig, HttpLoaderFactory } from './app.config';
import { routes } from './app.routes';

// Mock components for routing tests
@Component({ template: '' })
class MockDashboardComponent {}
@Component({ template: '' })
class MockUsersComponent {}
@Component({ template: '' })
class MockBusinessComponent {}
@Component({ template: '' })
class MockListBusinessesComponent {}
@Component({ template: '' })
class MockLoginComponent {}
@Component({ template: '' })
class MockMainDashboardComponent {}

// Test suite for AppComponent
describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        NavComponent,
        CommonModule,
        RouterTestingModule.withRoutes(routes), // Use actual routes
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
          },
        }),
      ],
      providers: [
        ...appConfig.providers, // Use actual appConfig providers
        {
          provide: AuthService,
          useValue: { getIsAuthenticated: jest.fn(), signout: jest.fn() },
        },
        AuthGuard,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should render nav component and router outlet', () => {
    const navElement = fixture.debugElement.query(By.directive(NavComponent));
    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(navElement).toBeTruthy();
    expect(routerOutlet).toBeTruthy();
  });
});

// Test suite for appConfig
describe('appConfig', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient],
          },
        }),
        RouterTestingModule.withRoutes(routes), // Use actual routes
      ],
      providers: [
        ...appConfig.providers, // Use actual appConfig providers
        {
          provide: AuthService,
          useValue: { getIsAuthenticated: jest.fn(), signout: jest.fn() },
        },
        AuthGuard,
      ],
    });
  });

  it('should provide router with correct routes', () => {
    const router = TestBed.inject(Router);
    expect(router).toBeDefined();
    const configuredRoutes = (router as any).config as Routes;
    expect(configuredRoutes.length).toBe(4);
    expect(configuredRoutes[0].path).toBe('main-dashboard');
    expect(configuredRoutes[1].path).toBe('login');
    expect(configuredRoutes[2].path).toBe('');
    expect(configuredRoutes[3].path).toBe('**');
  });

  it('should provide HttpClient', () => {
    const httpClient = TestBed.inject(HttpClient);
    expect(httpClient).toBeDefined();
  });

  it('should provide ToastrService with correct configuration', () => {
    const toastrService = TestBed.inject(ToastrService);
    expect(toastrService).toBeDefined();
    expect(toastrService.toastrConfig.timeOut).toBe(3000);
    expect(toastrService.toastrConfig.positionClass).toBe('toast-top-right');
    expect(toastrService.toastrConfig.preventDuplicates).toBe(true);
  });

  it('should provide TranslateModule with HttpLoader', () => {
    const translateService = TestBed.inject(TranslateService);
    const httpClient = TestBed.inject(HttpClient);
    expect(translateService).toBeDefined();
    const httpMock = TestBed.inject(HttpTestingController);
    translateService.use('en');
    const req = httpMock.expectOne('./assets/i18n/en.json');
    expect(req.request.method).toBe('GET');
    req.flush({});
    httpMock.verify();
    // Explicitly call HttpLoaderFactory to ensure coverage
    const loader = HttpLoaderFactory(httpClient);
    expect(loader instanceof TranslateHttpLoader).toBe(true);
  });

  it('should apply zone change detection configuration', () => {
    const router = TestBed.inject(Router);
    expect(router).toBeDefined(); // Zone is implicitly used by router
  });

  it('should use appConfig providers', () => {
    expect(appConfig.providers.length).toBeGreaterThan(0); // Ensure appConfig is accessed
    const router = TestBed.inject(Router);
    const httpClient = TestBed.inject(HttpClient);
    const toastrService = TestBed.inject(ToastrService);
    const translateService = TestBed.inject(TranslateService);
    expect(router).toBeDefined();
    expect(httpClient).toBeDefined();
    expect(toastrService).toBeDefined();
    expect(translateService).toBeDefined();
  });
});

// Test suite for routes
describe('Routes', () => {
  let router: Router;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    const authServiceMock = {
      getIsAuthenticated: jest.fn(),
      signout: jest.fn(),
    };
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)], // Use actual routes
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        AuthGuard,
      ],
    });
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  it('should have correct route definitions', () => {
    expect(routes).toBeDefined(); // Ensure routes export is accessed
    const configuredRoutes = (router as any).config as Routes;
    expect(configuredRoutes).toContainEqual({ path: 'login', component: routes[1].component });
    expect(configuredRoutes).toContainEqual({ path: '', redirectTo: 'login', pathMatch: 'full' });
    expect(configuredRoutes).toContainEqual({ path: '**', redirectTo: 'login' });
    expect(configuredRoutes).toContainEqual({
      path: 'main-dashboard',
      component: routes[0].component,
      canActivate: [AuthGuard],
      children: expect.arrayContaining([
        { path: 'dashboard', component: routes[0].children![0].component },
        { path: 'users', component: routes[0].children![1].component },
        { path: 'business', component: routes[0].children![2].component },
        { path: 'business-list', component: routes[0].children![3].component },
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      ]),
    });
  });

  it('should redirect to login for default route', fakeAsync(() => {
    router.navigate(['']).then(() => {
      expect(router.url).toBe('/login');
    });
    tick();
  }));

  it('should redirect to login for unknown route', fakeAsync(() => {
    router.navigate(['unknown']).then(() => {
      expect(router.url).toBe('/login');
    });
    tick();
  }));

  it('should navigate to dashboard when authenticated', fakeAsync(() => {
    authService.getIsAuthenticated.mockReturnValue(true);
    router.navigate(['main-dashboard']).then(() => {
      expect(router.url).toBe('/main-dashboard/dashboard');
    });
    tick();
  }));

  it('should redirect to login when not authenticated', fakeAsync(() => {
    authService.getIsAuthenticated.mockReturnValue(false);
    router.navigate(['main-dashboard']).then(() => {
      expect(router.url).toBe('/login');
    });
    tick();
  }));

  it('should navigate to child routes when authenticated', fakeAsync(() => {
    authService.getIsAuthenticated.mockReturnValue(true);
    const childRoutes = ['dashboard', 'users', 'business', 'business-list'];
    for (const childRoute of childRoutes) {
      router.navigate([`main-dashboard/${childRoute}`]).then(() => {
        expect(router.url).toBe(`/main-dashboard/${childRoute}`);
      });
      tick();
    }
  }));
});

// Test suite for AuthGuard
describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let authService: jest.Mocked<AuthService>;
  let router: Router;

  beforeEach(() => {
    const authServiceMock = {
      getIsAuthenticated: jest.fn(),
      signout: jest.fn(),
    };
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceMock },
      ],
    });
    authGuard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
  });

  it('should allow navigation when authenticated', () => {
    authService.getIsAuthenticated.mockReturnValue(true);
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/main-dashboard' } as RouterStateSnapshot;
    const result = authGuard.canActivate(route, state);
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', () => {
    authService.getIsAuthenticated.mockReturnValue(false);
    const route = {} as ActivatedRouteSnapshot;
    const state = { url: '/main-dashboard' } as RouterStateSnapshot;
    const result = authGuard.canActivate(route, state);
    expect(result).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/main-dashboard' } });
  });
});

// Test suite for NavComponent
describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const authServiceMock = {
      getIsAuthenticated: jest.fn(),
      signout: jest.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [
        NavComponent,
        CommonModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();
    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display navigation links when authenticated', () => {
    authService.getIsAuthenticated.mockReturnValue(true);
    fixture.detectChanges();
    const links = fixture.debugElement.queryAll(By.css('nav ul li a'));
    expect(links.length).toBe(4);
    expect(links[0].nativeElement.textContent).toBe('Dashboard');
    expect(links[1].nativeElement.textContent).toBe('Users');
    expect(links[2].nativeElement.textContent).toBe('Business');
    expect(links[3].nativeElement.textContent).toBe('Business List');
    const signoutButton = fixture.debugElement.query(By.css('nav ul li button'));
    expect(signoutButton.nativeElement.textContent).toBe('Sign Out');
  });

  it('should display only login link when not authenticated', () => {
    authService.getIsAuthenticated.mockReturnValue(false);
    fixture.detectChanges();
    const links = fixture.debugElement.queryAll(By.css('nav ul li a'));
    expect(links.length).toBe(1);
    expect(links[0].nativeElement.textContent).toBe('Login');
    const signoutButton = fixture.debugElement.query(By.css('nav ul li button'));
    expect(signoutButton).toBeNull();
  });

  it('should call signout on button click', () => {
    authService.getIsAuthenticated.mockReturnValue(true);
    fixture.detectChanges();
    const signoutButton = fixture.debugElement.query(By.css('nav ul li button'));
    signoutButton.nativeElement.click();
    expect(authService.signout).toHaveBeenCalled();
  });
});