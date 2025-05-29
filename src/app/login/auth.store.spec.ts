import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthStore } from './auth.store';
import { Signal } from '@angular/core';
import { patchState } from '@ngrx/signals';

interface AuthStoreType {
  user: Signal<{ id: number; email: string; name: string } | null>;
  token: Signal<string | null>;
  isAuthenticated: Signal<boolean>;
  error: Signal<string | null>;
  isLoading: Signal<boolean>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (userData: { name: string; email: string; password: string }) => Promise<void>;
  signout: () => void;
}

describe('AuthStore', () => {
  let authStore: AuthStoreType;
  let httpClient: HttpClient;

  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  const httpClientMock = {
    post: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });

    authStore = TestBed.inject(AuthStore) as unknown as AuthStoreType;
    httpClient = TestBed.inject(HttpClient);
    jest.clearAllMocks();
  });

  describe('Initial State and Signals', () => {
    it('should initialize with default state', () => {
      expect(authStore.user()).toBeNull();
      expect(authStore.token()).toBeNull();
      expect(authStore.isAuthenticated()).toBe(false);
      expect(authStore.error()).toBeNull();
      expect(authStore.isLoading()).toBe(false);
    });
  });

  describe('onInit Hook', () => {
    it('should load auth data from localStorage on init', () => {
      const authData = {
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        token: 'test-token',
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(authData));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthStore,
          { provide: HttpClient, useValue: httpClientMock },
        ],
      });
      authStore = TestBed.inject(AuthStore) as unknown as AuthStoreType;

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth');
      expect(authStore.user()).toEqual(authData.user);
      expect(authStore.token()).toEqual(authData.token);
      expect(authStore.isAuthenticated()).toBe(true);
    });

    it('should not update state if no auth data in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthStore,
          { provide: HttpClient, useValue: httpClientMock },
        ],
      });
      authStore = TestBed.inject(AuthStore) as unknown as AuthStoreType;

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth');
      expect(authStore.user()).toBeNull();
      expect(authStore.token()).toBeNull();
      expect(authStore.isAuthenticated()).toBe(false);
    });
  });

  describe('login Method', () => {
    it('should login successfully and update state', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const response = { access_token: 'test-token' };
      httpClientMock.post.mockReturnValue(of(response));

      await authStore.login(credentials);

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'https://api.escuelajs.co/api/v1/auth/login',
        credentials
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth',
        JSON.stringify({ user: { id: 0, email: credentials.email, name: '' }, token: response.access_token })
      );
      expect(authStore.user()).toEqual({ id: 0, email: credentials.email, name: '' });
      expect(authStore.token()).toEqual(response.access_token);
      expect(authStore.isAuthenticated()).toBe(true);
      expect(authStore.isLoading()).toBe(false);
      expect(authStore.error()).toBeNull();
    });

    it('should handle 401 error during login', async () => {
      const credentials = { email: 'test@example.com', password: 'wrong' };
      const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
      httpClientMock.post.mockReturnValue(throwError(() => error));

      try {
        await authStore.login(credentials);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpErrorResponse);
      }
      expect(authStore.error()).toBe('Invalid email or password');
      expect(authStore.isLoading()).toBe(false);
      expect(authStore.user()).toBeNull();
      expect(authStore.token()).toBeNull();
      expect(authStore.isAuthenticated()).toBe(false);
    });

    it('should handle error with error.error.message during login', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const error = new HttpErrorResponse({ error: { message: 'API error' } });
      httpClientMock.post.mockReturnValue(throwError(() => error));

      try {
        await authStore.login(credentials);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpErrorResponse);
      }
      expect(authStore.error()).toBe('API error');
      expect(authStore.isLoading()).toBe(false);
    });

    it('should handle generic error during login', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const error = new HttpErrorResponse({ error: new Error('Server error') });
      httpClientMock.post.mockReturnValue(throwError(() => error));

      try {
        await authStore.login(credentials);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpErrorResponse);
      }
      expect(authStore.error()).toBe('Server error');
      expect(authStore.isLoading()).toBe(false);
    });

    it('should handle error with no message during login', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const error = new HttpErrorResponse({});
      httpClientMock.post.mockReturnValue(throwError(() => error));

      try {
        await authStore.login(credentials);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpErrorResponse);
      }
      expect(authStore.error()).toBe("Http failure response for (unknown url): undefined undefined");
      expect(authStore.isLoading()).toBe(false);
    });

    it('should set isLoading to true before HTTP request', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const response = { access_token: 'test-token' };
      httpClientMock.post.mockReturnValue(of(response));

      const promise = authStore.login(credentials);
      expect(authStore.isLoading()).toBe(true);
      await promise;
      expect(authStore.isLoading()).toBe(false);
    });
  });

  describe('signup Method', () => {
    it('should signup successfully and update state', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
      const response = { id: 1, name: 'Test User', email: 'test@example.com' };
      httpClientMock.post.mockReturnValue(of(response));

      await authStore.signup(userData);

      expect(httpClientMock.post).toHaveBeenCalledWith(
        'https://api.escuelajs.co/api/v1/users/',
        { ...userData, avatar: 'https://i.imgur.com/LDOe7r5.png' }
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth',
        JSON.stringify({ user: response, token: '' })
      );
      expect(authStore.user()).toEqual(response);
      expect(authStore.token()).toBe('');
      expect(authStore.isAuthenticated()).toBe(true);
      expect(authStore.isLoading()).toBe(false);
      expect(authStore.error()).toBeNull();
    });

    it('should handle error with error.error.message during signup', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
      const error = new HttpErrorResponse({ error: { message: 'API error' } });
      httpClientMock.post.mockReturnValue(throwError(() => error));

      try {
        await authStore.signup(userData);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpErrorResponse);
      }
      expect(authStore.error()).toBe('API error');
      expect(authStore.isLoading()).toBe(false);
    });

    it('should handle error with error.message during signup', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
      const error = new HttpErrorResponse({ error: new Error('Signup error') });
      httpClientMock.post.mockReturnValue(throwError(() => error));

      try {
        await authStore.signup(userData);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpErrorResponse);
      }
      expect(authStore.error()).toBe('Signup error');
      expect(authStore.isLoading()).toBe(false);
    });

    it('should handle default error during signup', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
      const error = new HttpErrorResponse({});
      httpClientMock.post.mockReturnValue(throwError(() => error));

      try {
        await authStore.signup(userData);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpErrorResponse);
      }
      expect(authStore.error()).toBe("Http failure response for (unknown url): undefined undefined");
      expect(authStore.isLoading()).toBe(false);
    });

    it('should set isLoading to true before HTTP request', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
      const response = { id: 1, name: 'Test User', email: 'test@example.com' };
      httpClientMock.post.mockReturnValue(of(response));

      const promise = authStore.signup(userData);
      expect(authStore.isLoading()).toBe(true);
      await promise;
      expect(authStore.isLoading()).toBe(false);
    });
  });

  describe('signout Method', () => {
    it('should sign out successfully and clear state', () => {
      patchState(authStore as any, {
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        token: 'test-token',
        isAuthenticated: true,
      });

      authStore.signout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth');
      expect(authStore.user()).toBeNull();
      expect(authStore.token()).toBeNull();
      expect(authStore.isAuthenticated()).toBe(false);
      expect(authStore.error()).toBeNull();
      expect(authStore.isLoading()).toBe(false);
    });

    it('should handle error during signout', () => {
      patchState(authStore as any, {
        user: { id: 1, email: 'test@example.com', name: 'Test User' },
        token: 'test-token',
        isAuthenticated: true,
      });

      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => authStore.signout()).toThrow('Storage error');
      expect(authStore.error()).toBe('Signout failed');
      expect(authStore.isLoading()).toBe(false);
    });
  });
});