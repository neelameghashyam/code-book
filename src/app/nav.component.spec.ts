// nav.component.spec.ts
import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavComponent } from './nav.component';
import { AuthService } from './login/auth.service';

// Mock AuthService
const mockAuthService = {
  getIsAuthenticated: jest.fn(),
  signout: jest.fn(),
};

describe('NavComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    jest.clearAllMocks();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(NavComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should bind isAuthenticated to authService.getIsAuthenticated', () => {
    const fixture = TestBed.createComponent(NavComponent);
    const component = fixture.componentInstance;

    // Mock authenticated state
    mockAuthService.getIsAuthenticated.mockReturnValue(true);
    expect(component.isAuthenticated()).toBe(true);
    expect(mockAuthService.getIsAuthenticated).toHaveBeenCalled();

    // Mock unauthenticated state
    mockAuthService.getIsAuthenticated.mockReturnValue(false);
    expect(component.isAuthenticated()).toBe(false);
    expect(mockAuthService.getIsAuthenticated).toHaveBeenCalledTimes(2);
  });

  it('should call authService.signout when signout is called', () => {
    const fixture = TestBed.createComponent(NavComponent);
    const component = fixture.componentInstance;

    component.signout();
    expect(mockAuthService.signout).toHaveBeenCalled();
  });
});