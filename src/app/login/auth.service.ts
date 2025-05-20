import { Injectable, inject } from '@angular/core';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStore = inject(AuthStore);

  login(credentials: { email: string; password: string }) {
    return this.authStore.login(credentials);
  }

  signup(userData: { name: string; email: string; password: string }) {
    return this.authStore.signup(userData);
  }

  signout() {
    this.authStore.signout();
  }

  get getUser() {
    return this.authStore.user;
  }

  get getIsAuthenticated() {
    return this.authStore.isAuthenticated;
  }

  get getIsLoading() {
    return this.authStore.isLoading;
  }

  get error() {
    return this.authStore.error;
  }
}