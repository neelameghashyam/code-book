import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './login/auth.service';

// Mock Router and AuthService
const mockRouter = {
  navigate: jest.fn(),
};

const mockAuthService = {
  getIsAuthenticated: jest.fn(),
};

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;
  let authService: AuthService;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);

    // Mock route and state snapshots
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/protected' } as RouterStateSnapshot;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow navigation when user is authenticated', () => {
    // Arrange
    mockAuthService.getIsAuthenticated.mockReturnValue(true);

    // Act
    const result = guard.canActivate(mockRoute, mockState);

    // Assert
    expect(authService.getIsAuthenticated).toHaveBeenCalled();
    expect(result).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Arrange
    mockAuthService.getIsAuthenticated.mockReturnValue(false);

    // Act
    const result = guard.canActivate(mockRoute, mockState);

    // Assert
    expect(authService.getIsAuthenticated).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/protected' },
    });
    expect(result).toBe(false);
  });
});