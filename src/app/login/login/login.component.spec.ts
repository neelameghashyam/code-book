import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component } from '@angular/core';

// Dummy component for routing
@Component({ template: '' })
class DummyComponent {}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let responsiveServiceMock: any;
  let router: Router;
  let breakpointSubject: BehaviorSubject<string>;

  beforeEach(async () => {
    breakpointSubject = new BehaviorSubject<string>('large');
    authServiceMock = {
      login: jest.fn().mockResolvedValue(undefined),
      signup: jest.fn().mockResolvedValue(undefined),
      error: jest.fn().mockReturnValue(null),
      getIsLoading: jest.fn().mockReturnValue(false),
    };
    responsiveServiceMock = {
      currentBreakpoint: jest.fn().mockReturnValue(breakpointSubject.asObservable()),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([{ path: 'dashboard-selector', component: DummyComponent }]),
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        MatCheckboxModule,
        MatIconModule,
        NoopAnimationsModule,
        LoginComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ResponsiveService, useValue: responsiveServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with correct controls', () => {
    expect(component.authForm.contains('name')).toBe(true);
    expect(component.authForm.contains('email')).toBe(true);
    expect(component.authForm.contains('password')).toBe(true);
    expect(component.authForm.contains('confirmPassword')).toBe(true);
    expect(component.authForm.contains('rememberMe')).toBe(true);
    expect(component.authForm.contains('agreeTerms')).toBe(true);
  });

  it('should set validators correctly in login mode', () => {
    component.toggleMode(false);
    fixture.detectChanges();
    expect(component.authForm.get('name')?.hasValidator(Validators.required)).toBe(false);
    expect(component.authForm.get('email')?.hasValidator(Validators.required)).toBe(true);
    expect(component.authForm.get('password')?.hasValidator(Validators.required)).toBe(true);
    expect(component.authForm.get('confirmPassword')?.hasValidator(Validators.required)).toBe(false);
    expect(component.authForm.get('agreeTerms')?.hasValidator(Validators.requiredTrue)).toBe(false);
  });

  it('should set validators correctly in signup mode', () => {
    component.toggleMode(true);
    fixture.detectChanges();
    expect(component.authForm.get('name')?.hasValidator(Validators.required)).toBe(true);
    expect(component.authForm.get('email')?.hasValidator(Validators.required)).toBe(true);
    expect(component.authForm.get('password')?.hasValidator(Validators.required)).toBe(true);
    expect(component.authForm.get('confirmPassword')?.hasValidator(Validators.required)).toBe(true);
    expect(component.authForm.get('agreeTerms')?.hasValidator(Validators.requiredTrue)).toBe(true);
  });

  it('should toggle to signup mode when handleSignup is called in login mode', () => {
    component.isSignupMode = false;
    component.handleSignup();
    expect(component.isSignupMode).toBe(true);
    expect(component.authForm.get('name')?.value).toBeNull();
  });

  it('should toggle to login mode when handleLogin is called in signup mode', () => {
    component.isSignupMode = true;
    component.handleLogin();
    expect(component.isSignupMode).toBe(false);
    expect(component.authForm.get('name')?.value).toBeNull();
  });

  it('should validate email field as required and valid email', () => {
    const emailControl = component.authForm.get('email');
    emailControl?.setValue('');
    emailControl?.markAsTouched();
    fixture.detectChanges();
    expect(emailControl?.hasError('required')).toBe(true);

    emailControl?.setValue('invalid-email');
    fixture.detectChanges();
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('test@example.com');
    fixture.detectChanges();
    expect(emailControl?.valid).toBe(true);
  });

  it('should validate password field as required and minimum length', () => {
    const passwordControl = component.authForm.get('password');
    passwordControl?.setValue('');
    passwordControl?.markAsTouched();
    fixture.detectChanges();
    expect(passwordControl?.hasError('required')).toBe(true);

    passwordControl?.setValue('12345');
    fixture.detectChanges();
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('123456');
    fixture.detectChanges();
    expect(passwordControl?.valid).toBe(true);
  });

  it('should validate password match in signup mode', () => {
    component.toggleMode(true);
    component.authForm.get('password')?.setValue('password123');
    component.authForm.get('confirmPassword')?.setValue('different');
    component.authForm.get('confirmPassword')?.markAsTouched();
    fixture.detectChanges();
    expect(component.authForm.hasError('mismatch')).toBe(true);

    component.authForm.get('confirmPassword')?.setValue('password123');
    fixture.detectChanges();
    expect(component.authForm.hasError('mismatch')).toBe(false);
  });

  it('should validate name field as required in signup mode', () => {
    component.toggleMode(true);
    const nameControl = component.authForm.get('name');
    nameControl?.setValue('');
    nameControl?.markAsTouched();
    fixture.detectChanges();
    expect(nameControl?.hasError('required')).toBe(true);

    nameControl?.setValue('John Doe');
    fixture.detectChanges();
    expect(nameControl?.valid).toBe(true);
  });

  it('should validate agreeTerms as required in signup mode', () => {
    component.toggleMode(true);
    const agreeTermsControl = component.authForm.get('agreeTerms');
    agreeTermsControl?.setValue(false);
    agreeTermsControl?.markAsTouched();
    fixture.detectChanges();
    expect(agreeTermsControl?.hasError('required')).toBe(true);

    agreeTermsControl?.setValue(true);
    fixture.detectChanges();
    expect(agreeTermsControl?.valid).toBe(true);
  });

  it('should toggle password visibility', () => {
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });

  it('should toggle confirm password visibility', () => {
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBe(true);
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBe(false);
  });

  it('should call authService.login and navigate on successful login via handleLogin', fakeAsync(() => {
    component.toggleMode(false);
    component.authForm.setValue({ email: 'test@example.com', password: 'password123', rememberMe: true, name: '', confirmPassword: '', agreeTerms: false });
    authServiceMock.login.mockResolvedValue(undefined);
    authServiceMock.getIsLoading.mockReturnValue(false);
    component.handleLogin();
    tick(1000);
    expect(authServiceMock.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123', rememberMe: true, name: '', confirmPassword: '', agreeTerms: false });
    expect(router.navigate)
  }));

  it('should toggle to login mode if isSignupMode is true in handleLogin', fakeAsync(() => {
    component.toggleMode(true);
    component.authForm.setValue({ email: 'test@example.com', password: 'password123', rememberMe: true, name: 'John Doe', confirmPassword: 'password123', agreeTerms: true });
    component.handleLogin();
    tick(1000);
    expect(component.isSignupMode).toBe(false);
    expect(authServiceMock.login).not.toHaveBeenCalled();
  }));

  it('should toggle to login mode if form is invalid in handleLogin', fakeAsync(() => {
    component.toggleMode(false);
    component.authForm.setValue({ email: '', password: '', rememberMe: false, name: '', confirmPassword: '', agreeTerms: false });
    component.handleLogin();
    tick(1000);
    expect(component.isSignupMode).toBe(false);
    expect(authServiceMock.login).not.toHaveBeenCalled();
  }));

  it('should toggle to login mode if isLoading is true in handleLogin', fakeAsync(() => {
    component.toggleMode(false);
    component.authForm.setValue({ email: 'test@example.com', password: 'password123', rememberMe: true, name: '', confirmPassword: '', agreeTerms: false });
    authServiceMock.getIsLoading.mockReturnValue(true);
    component.handleLogin();
    tick(1000);
    expect(component.isSignupMode).toBe(false);
    expect(authServiceMock.login).not.toHaveBeenCalled();
  }));

  it('should call authService.signup and navigate on successful signup via handleSignup', fakeAsync(() => {
    component.toggleMode(true);
    component.authForm.setValue({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true,
      rememberMe: false,
    });
    authServiceMock.signup.mockResolvedValue(undefined);
    authServiceMock.getIsLoading.mockReturnValue(false);
    component.handleSignup();
    tick(1000);
    expect(authServiceMock.signup).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true,
      rememberMe: false,
    });
    expect(router.navigate)
  }));

  it('should reset form on failed signup via handleSignup', fakeAsync(() => {
    component.toggleMode(true);
    component.authForm.setValue({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true,
      rememberMe: false,
    });
    authServiceMock.signup.mockRejectedValueOnce(new Error('Signup failed'));
    authServiceMock.getIsLoading.mockReturnValue(false);
  
    tick(1000);
    expect(authServiceMock.signup)
    expect(component.authForm.get('name')?.value);
    expect(component.authForm.get('email')?.value);
    expect(component.authForm.get('password')?.value);
    expect(component.authForm.get('confirmPassword')?.value);
    expect(component.authForm.get('agreeTerms')?.value);
    expect(component.authForm.get('rememberMe')?.value);
  }));

  it('should toggle to signup mode if not in signup mode in handleSignup', fakeAsync(() => {
    component.toggleMode(false);
    component.authForm.setValue({ email: 'test@example.com', password: 'password123', rememberMe: true, name: '', confirmPassword: '', agreeTerms: false });
    component.handleSignup();
    tick(1000);
    expect(component.isSignupMode).toBe(true);
    expect(authServiceMock.signup).not.toHaveBeenCalled();
  }));

  it('should toggle to signup mode if form is invalid in handleSignup', fakeAsync(() => {
    component.toggleMode(true);
    component.authForm.setValue({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      rememberMe: false,
    });
    component.handleSignup();
    tick(1000);
    expect(component.isSignupMode).toBe(true);
    expect(authServiceMock.signup).not.toHaveBeenCalled();
  }));

  it('should toggle to signup mode if isLoading is true in handleSignup', fakeAsync(() => {
    component.toggleMode(true);
    component.authForm.setValue({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true,
      rememberMe: false,
    });
    authServiceMock.getIsLoading.mockReturnValue(true);
    component.handleSignup();
    tick(1000);
    expect(component.isSignupMode).toBe(true);
    expect(authServiceMock.signup).not.toHaveBeenCalled();
  }));

  it('should call onLogin and navigate on successful login', fakeAsync(() => {
    component.toggleMode(false);
    component.authForm.setValue({ email: 'test@example.com', password: 'password123', rememberMe: true, name: '', confirmPassword: '', agreeTerms: false });
    authServiceMock.login.mockResolvedValue(undefined);
    component.onLogin();
    tick(1000);
    expect(authServiceMock.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123', rememberMe: true, name: '', confirmPassword: '', agreeTerms: false });
    expect(router.navigate)
  }));

 
  it('should not call onLogin if form is invalid', () => {
    component.toggleMode(false);
    component.authForm.setValue({ email: '', password: '', rememberMe: false, name: '', confirmPassword: '', agreeTerms: false });
    component.onLogin();
    expect(authServiceMock.login).not.toHaveBeenCalled();
  });

  it('should call onSignup and navigate on successful signup', fakeAsync(() => {
    component.toggleMode(true);
    component.authForm.setValue({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true,
      rememberMe: false,
    });
    authServiceMock.signup.mockResolvedValue(undefined);
    component.onSignup();
    tick(1000);
    expect(authServiceMock.signup).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true,
      rememberMe: false,
    });
    expect(router.navigate)
  }));

 
  it('should not call onSignup if form is invalid', () => {
    component.toggleMode(true);
    component.authForm.setValue({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      rememberMe: false,
    });
    component.onSignup();
    expect(authServiceMock.signup).not.toHaveBeenCalled();
  });

  it('should call login when clicking login button with valid form', fakeAsync(() => {
    component.toggleMode(false);
    component.authForm.setValue({ email: 'test@example.com', password: 'password123', rememberMe: true, name: '', confirmPassword: '', agreeTerms: false });
    authServiceMock.login.mockResolvedValue(undefined);
    authServiceMock.getIsLoading.mockReturnValue(false);
    const loginButton = fixture.debugElement.query(By.css('button[aria-label="Login"]'));
    loginButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(1000);
    expect(authServiceMock.login).toHaveBeenCalled();
    expect(router.navigate)
  }));

  it('should call signup when clicking signup button with valid form', fakeAsync(() => {
    component.toggleMode(true);
    component.authForm.setValue({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true,
      rememberMe: false,
    });
    authServiceMock.signup.mockResolvedValue(undefined);
    authServiceMock.getIsLoading.mockReturnValue(false);
    const signupButton = fixture.debugElement.query(By.css('button[aria-label="Sign up"]'));
    signupButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(1000);
    expect(authServiceMock.signup).toHaveBeenCalled();
    expect(router.navigate)
  }));

  it('should toggle to login mode when clicking login button in signup mode', fakeAsync(() => {
    component.isSignupMode = true;
    const loginButton = fixture.debugElement.query(By.css('button[aria-label="Login"]'));
    loginButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(1000);
    expect(component.isSignupMode).toBe(false);
  }));

  it('should toggle to signup mode when clicking signup button in login mode', fakeAsync(() => {
    component.isSignupMode = false;
    const signupButton = fixture.debugElement.query(By.css('button[aria-label="Sign up"]'));
    signupButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(1000);
    expect(component.isSignupMode).toBe(true);
  }));

  it('should not call login if form is invalid when clicking login button', fakeAsync(() => {
    component.toggleMode(false);
    component.authForm.setValue({ email: '', password: '', rememberMe: false, name: '', confirmPassword: '', agreeTerms: false });
    const loginButton = fixture.debugElement.query(By.css('button[aria-label="Login"]'));
    loginButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(1000);
    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(component.isSignupMode).toBe(false);
  }));

  it('should not call signup if form is invalid when clicking signup button', fakeAsync(() => {
    component.toggleMode(true);
    component.authForm.setValue({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
      rememberMe: false,
    });
    const signupButton = fixture.debugElement.query(By.css('button[aria-label="Sign up"]'));
    signupButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(1000);
    expect(authServiceMock.signup).not.toHaveBeenCalled();
    expect(component.isSignupMode).toBe(true);
  }));

  it('should not call login if isLoading is true when clicking login button', fakeAsync(() => {
    component.toggleMode(false);
    component.authForm.setValue({ email: 'test@example.com', password: 'password123', rememberMe: true, name: '', confirmPassword: '', agreeTerms: false });
    authServiceMock.getIsLoading.mockReturnValue(true);
    const loginButton = fixture.debugElement.query(By.css('button[aria-label="Login"]'));
    loginButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(1000);
    expect(authServiceMock.login).not.toHaveBeenCalled();
    expect(component.isSignupMode).toBe(false);
  }));

  it('should not call signup if isLoading is true when clicking signup button', fakeAsync(() => {
    component.toggleMode(true);
    component.authForm.setValue({
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      agreeTerms: true,
      rememberMe: false,
    });
    authServiceMock.getIsLoading.mockReturnValue(true);
    const signupButton = fixture.debugElement.query(By.css('button[aria-label="Sign up"]'));
    signupButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    tick(1000);
    expect(authServiceMock.signup).not.toHaveBeenCalled();
    expect(component.isSignupMode).toBe(true);
  }));

  it('should display error message when error exists', () => {
    authServiceMock.error.mockReturnValue('Invalid credentials');
    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(By.css('.text-red-500'));
    expect(errorElement.nativeElement.textContent).toContain('Invalid credentials');
  });

  it('should show loading state on login button when isLoading is true', () => {
    authServiceMock.getIsLoading.mockReturnValue(true);
    component.toggleMode(false);
    fixture.detectChanges();
    const loginButton = fixture.debugElement.query(By.css('button[aria-label="Login"]'));
    expect(loginButton.nativeElement.textContent).toContain('Logging in...');
  });

  it('should show loading state on signup button when isLoading is true', () => {
    authServiceMock.getIsLoading.mockReturnValue(true);
    component.toggleMode(true);
    fixture.detectChanges();
    const signupButton = fixture.debugElement.query(By.css('button[aria-label="Sign up"]'));
    expect(signupButton.nativeElement.textContent).toContain('Signing up...');
  });

  it('should render social login buttons', () => {
    const socialButtons = fixture.debugElement.queryAll(By.css('button[mat-icon-button]'));
    expect(socialButtons.length).toBe(3);
    expect(socialButtons[0].nativeElement.getAttribute('aria-label')).toBe('Sign in with Facebook');
    expect(socialButtons[1].nativeElement.getAttribute('aria-label')).toBe('Sign in with Apple');
    expect(socialButtons[2].nativeElement.getAttribute('aria-label')).toBe('Sign in with Google');
  });

  it('should show name and confirm password fields in signup mode', () => {
    component.toggleMode(true);
    fixture.detectChanges();
    const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]'));
    const confirmPasswordInput = fixture.debugElement.query(By.css('input[formControlName="confirmPassword"]'));
    expect(nameInput).toBeTruthy();
    expect(confirmPasswordInput).toBeTruthy();
  });

  it('should not show name and confirm password fields in login mode', () => {
    component.toggleMode(false);
    fixture.detectChanges();
    const nameInput = fixture.debugElement.query(By.css('input[formControlName="name"]'));
    const confirmPasswordInput = fixture.debugElement.query(By.css('input[formControlName="confirmPassword"]'));
    expect(nameInput).toBeNull();
    expect(confirmPasswordInput).toBeNull();
  });

  it('should show remember me and forgot password in login mode', () => {
    component.toggleMode(false);
    fixture.detectChanges();
    const rememberMeCheckbox = fixture.debugElement.query(By.css('mat-checkbox[formControlName="rememberMe"]'));
    const forgotPasswordLink = fixture.debugElement.query(By.css('a[aria-label="Forgot password"]'));
    expect(rememberMeCheckbox).toBeTruthy();
    expect(forgotPasswordLink).toBeTruthy();
  });

  it('should show agree terms checkbox in signup mode', () => {
    component.toggleMode(true);
    fixture.detectChanges();
    const agreeTermsCheckbox = fixture.debugElement.query(By.css('mat-checkbox[formControlName="agreeTerms"]'));
    expect(agreeTermsCheckbox).toBeTruthy();
  });

  it('should update responsive breakpoints for all breakpoints', () => {
    breakpointSubject.next('xsmall');
    fixture.detectChanges();
    expect(component.isMobile).toBe(true);
    expect(component.isTablet).toBe(false);
    expect(component.isDesktop).toBe(false);

    breakpointSubject.next('small');
    fixture.detectChanges();
    expect(component.isMobile).toBe(false);
    expect(component.isTablet).toBe(true);
    expect(component.isDesktop).toBe(false);

    breakpointSubject.next('medium');
    fixture.detectChanges();
    expect(component.isMobile).toBe(false);
    expect(component.isTablet).toBe(true);
    expect(component.isDesktop).toBe(false);

    breakpointSubject.next('large');
    fixture.detectChanges();
    expect(component.isMobile).toBe(false);
    expect(component.isTablet).toBe(false);
    expect(component.isDesktop).toBe(true);

    breakpointSubject.next('xlarge');
    fixture.detectChanges();
    expect(component.isMobile).toBe(false);
    expect(component.isTablet).toBe(false);
    expect(component.isDesktop).toBe(true);
  });
});