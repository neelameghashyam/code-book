import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
};

const apiUrl = 'https://api.escuelajs.co';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, http = inject(HttpClient)) => ({
    async login(credentials: { email: string; password: string }) {
      try {
        patchState(store, { isLoading: true, error: null });
        const response = await lastValueFrom(
          http.post<{ access_token: string }>(`${apiUrl}/api/v1/auth/login`, credentials)
        );
        const user = { id: 0, email: credentials.email, name: '' }; // EscuelaJS doesn't return user details
        localStorage.setItem('auth', JSON.stringify({ user, token: response.access_token }));
        patchState(store, {
          user,
          token: response.access_token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        const errorMessage =
          error.status === 401 ? 'Invalid email or password' : error.error?.message || error.message || 'Login failed';
        patchState(store, {
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },
    async signup(userData: { name: string; email: string; password: string }) {
      try {
        patchState(store, { isLoading: true, error: null });
        const payload = {
          ...userData,
          avatar: 'https://i.imgur.com/LDOe7r5.png', // Default avatar URL
        };
        const response = await lastValueFrom(http.post<User>(`${apiUrl}/api/v1/users/`, payload));
        localStorage.setItem('auth', JSON.stringify({ user: response, token: '' }));
        patchState(store, {
          user: response,
          token: '',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        const errorMessage = error.error?.message || error.message || 'Signup failed. Please check your details.';
        patchState(store, {
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },
    signout() {
      try {
        localStorage.removeItem('auth');
        patchState(store, {
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
          isLoading: false,
        });
      } catch (error: any) {
        patchState(store, { error: 'Signout failed' });
        throw error;
      }
    },
  })),
  withHooks({
    onInit(store) {
      const authData = localStorage.getItem('auth');
      if (authData) {
        const { user, token } = JSON.parse(authData);
        patchState(store, { user, token, isAuthenticated: true });
      }
    },
  })
);