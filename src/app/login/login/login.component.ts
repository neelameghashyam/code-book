import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  authForm: FormGroup;
  isSignupMode = false;
  error: () => string | null;
  isLoading: () => boolean;
  showPassword = false;
  showConfirmPassword = false;
  isMobile = false;
  isTablet = false;
  isDesktop = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private responsiveService: ResponsiveService
  ) {
    this.authForm = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: [''],
      rememberMe: [false],
      agreeTerms: [false],
    }, { validators: () => this.passwordMatchValidator() });

    this.error = () => this.authService.error();
    this.isLoading = () => this.authService.getIsLoading();
  }

  ngOnInit() {
    this.toggleMode(this.isSignupMode);
    this.responsiveService.currentBreakpoint().subscribe(breakpoint => {
      this.isMobile = breakpoint === 'xsmall';
      this.isTablet = breakpoint === 'small' || breakpoint === 'medium';
      this.isDesktop = breakpoint === 'large' || breakpoint === 'xlarge';
    });
  }

  passwordMatchValidator(): ValidationErrors | null {
    if (!this.isSignupMode) {
      return null;
    }
    const password = this.authForm.get('password')?.value;
    const confirmPassword = this.authForm.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  toggleMode(isSignup: boolean) {
    this.isSignupMode = isSignup;
    const nameControl = this.authForm.get('name');
    const confirmPasswordControl = this.authForm.get('confirmPassword');
    const agreeTermsControl = this.authForm.get('agreeTerms');

    if (this.isSignupMode) {
      nameControl?.setValidators([Validators.required]);
      confirmPasswordControl?.setValidators([Validators.required]);
      agreeTermsControl?.setValidators([Validators.requiredTrue]);
    } else {
      nameControl?.clearValidators();
      confirmPasswordControl?.clearValidators();
      agreeTermsControl?.clearValidators();
    }

    nameControl?.updateValueAndValidity();
    confirmPasswordControl?.updateValueAndValidity();
    agreeTermsControl?.updateValueAndValidity();
    this.authForm.reset();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async handleLogin() {
    if (this.isSignupMode || this.authForm.invalid || this.isLoading()) {
      this.toggleMode(false);
    } else {
      try {
        await this.authService.login(this.authForm.value);
        this.router.navigate(['/dashboard-selector']);
      } catch {
        this.authForm.get('password')?.reset();
      }
    }
  }

  async handleSignup() {
    if (!this.isSignupMode || this.authForm.invalid || this.isLoading()) {
      this.toggleMode(true);
    } else {
      try {
        await this.authService.signup(this.authForm.value);
        this.router.navigate(['/dashboard-selector']);
      } catch {
        this.authForm.reset();
      }
    }
  }

  async onLogin() {
    if (this.authForm.valid) {
      try {
        await this.authService.login(this.authForm.value);
        this.router.navigate(['/dashboard-selector']);
      } catch {
        this.authForm.get('password')?.reset();
      }
    }
  }

  async onSignup() {
    if (this.authForm.valid) {
      try {
        await this.authService.signup(this.authForm.value);
        this.router.navigate(['/dashboard-selector']);
      } catch {
        this.authForm.reset();
      }
    }
  }
}