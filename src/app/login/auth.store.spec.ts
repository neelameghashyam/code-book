import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthStore } from './auth.store';
import { AuthService } from './auth.service';
import { Signal } from '@angular/core';

// Define the AuthStore instance type
interface AuthStoreType {
  user: Signal<{ id: number; email: string; name: string } | null>;
  token: Signal<string | null>;
  isAuthenticated: Signal<boolean>;
  error: Signal<string | null>;
  isLoading: Signal<boolean>;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (userData: { name: string; email: string; password: string }) => Promise<void>;
  signout: () => void;
  patchState: (state: Partial<{
    user: { id: number; email: string; name: string } | null;
    token: string | null;
    isAuthenticated: boolean;
    error: string | null;
    isLoading: boolean;
  }>) => void;
}

describe('AuthStore and AuthService', () => {
  let authStore: AuthStoreType;
  let authService: AuthService;
  let httpClient: HttpClient;

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  // Mock HttpClient
  const httpClientMock = {
    post: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        AuthService,
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });

    authStore = TestBed.inject(AuthStore) as unknown as AuthStoreType;
    authService = TestBed.inject(AuthService);
    httpClient = TestBed.inject(HttpClient);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('AuthStore', () => {
    describe('Initial State and Computed Signals', () => {
      it('should initialize with default state', () => {
        expect(authStore.user()).toBeNull();
        expect(authStore.token()).toBeNull();
        expect(authStore.isAuthenticated()).toBe(false);
        expect(authStore.error()).toBeNull();
        expect(authStore.isLoading()).toBe(false);
      });

      it('should compute user signal with valid user', () => {
        const user = { id: 1, email: 'test@example.com', name: 'Test User' };
        authStore['patchState']({ user });
        expect(authStore.user()).toEqual(user);
      });

      it('should compute user signal with null', () => {
        authStore['patchState']({ user: null });
        expect(authStore.user()).toBeNull();
      });

      it('should compute isAuthenticated signal with true', () => {
        authStore['patchState']({ isAuthenticated: true });
        expect(authStore.isAuthenticated()).toBe(true);
      });

      it('should compute isAuthenticated signal with false', () => {
        authStore['patchState']({ isAuthenticated: false });
        expect(authStore.isAuthenticated()).toBe(false);
      });

      it('should compute isLoading signal with true', () => {
        authStore['patchState']({ isLoading: true });
        expect(authStore.isLoading()).toBe(true);
      });

      it('should compute isLoading signal with false', () => {
        authStore['patchState']({ isLoading: false });
        expect(authStore.isLoading()).toBe(false);
      });

      it('should compute error signal with string', () => {
        authStore['patchState']({ error: 'Test error' });
        expect(authStore.error()).toBe('Test error');
      });

      it('should compute error signal with null', () => {
        authStore['patchState']({ error: null });
        expect(authStore.error()).toBeNull();
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
        expect(authStore.error()).toBeNull();
        expect(authStore.isLoading()).toBe(false);
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
        expect(authStore.error()).toBeNull();
        expect(authStore.isLoading()).toBe(false);
      });
    });

    describe('login Method', () => {
      it('should login successfully and update state', async () => {
        const credentials = { email: 'test@example.com', password: 'password' };
        const response = { access_token: 'test-token' };
        const expectedUser = { id: 0, email: credentials.email, name: '' };
        httpClientMock.post.mockReturnValue(of(response));

        await authStore.login(credentials);

        expect(httpClientMock.post).toHaveBeenCalledWith(
          'https://api.escuelajs.co/api/v1/auth/login',
          credentials
        );
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'auth',
          JSON.stringify({ user: expectedUser, token: response.access_token })
        );
        expect(authStore.user()).toEqual(expectedUser);
        expect(authStore.token()).toEqual(response.access_token);
        expect(authStore.isAuthenticated()).toBe(true);
        expect(authStore.isLoading()).toBe(false);
        expect(authStore.error()).toBeNull();
      });

      it('should handle 401 error during login', async () => {
        const credentials = { email: 'test@example.com', password: 'wrong' };
        const error = new Error('Unauthorized');
        error['status'] = 401;
        httpClientMock.post.mockReturnValue(throwError(() => error));

        await expect(authStore.login(credentials)).rejects.toThrow('Unauthorized');
        expect(authStore.error()).toBe('Invalid email or password');
        expect(authStore.isLoading()).toBe(false);
        expect(authStore.user()).toBeNull();
        expect(authStore.token()).toBeNull();
        expect(authStore.isAuthenticated()).toBe(false);
      });

      it('should handle generic error during login', async () => {
        const credentials = { email: 'test@example.com', password: 'password' };
        const error = new Error('Server error');
        httpClientMock.post.mockReturnValue(throwError(() => error));

        await expect(authStore.login(credentials)).rejects.toThrow('Server error');
        expect(authStore.error()).toBe('Server error');
        expect(authStore.isLoading()).toBe(false);
        expect(authStore.user()).toBeNull();
        expect(authStore.token()).toBeNull();
        expect(authStore.isAuthenticated()).toBe(false);
      });

      it('should handle error with error.error.message during login', async () => {
        const credentials = { email: 'test@example.com', password: 'password' };
        const error = new Error('API error');
        error['error'] = { message: 'API error' };
        httpClientMock.post.mockReturnValue(throwError(() => error));

        await expect(authStore.login(credentials)).rejects.toThrow('API error');
        expect(authStore.error()).toBe('API error');
        expect(authStore.isLoading()).toBe(false);
        expect(authStore.user()).toBeNull();
        expect(authStore.token()).toBeNull();
        expect(authStore.isAuthenticated()).toBe(false);
      });

      it('should set isLoading to true before HTTP request', async () => {
        const credentials = { email: 'test@example.com', password: 'password' };
        const response = { access_token: 'test-token' };
        httpClientMock.post.mockReturnValue(of(response));

        const patchStateSpy = jest.spyOn(authStore, 'patchState');
        await authStore.login(credentials);

        expect(patchStateSpy).toHaveBeenNthCalledWith(1, { isLoading: true, error: null });
        patchStateSpy.mockRestore();
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
          {
            ...userData,
            avatar: 'https://i.imgur.com/LDOe7r5.png',
          }
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

      it('should handle error during signup with error.error.message', async () => {
        const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
        const error = new Error('API error');
        error['error'] = { message: 'API error' };
        httpClientMock.post.mockReturnValue(throwError(() => error));

        await expect(authStore.signup(userData)).rejects.toThrow('API error');
        expect(authStore.error()).toBe('API error');
        expect(authStore.isLoading()).toBe(false);
        expect(authStore.user()).toBeNull();
        expect(authStore.token()).toBeNull();
        expect(authStore.isAuthenticated()).toBe(false);
      });

      it('should handle error during signup with error.message', async () => {
        const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
        const error = new Error('Signup error');
        httpClientMock.post.mockReturnValue(throwError(() => error));

        await expect(authStore.signup(userData)).rejects.toThrow('Signup error');
        expect(authStore.error()).toBe('Signup error');
        expect(authStore.isLoading()).toBe(false);
        expect(authStore.user()).toBeNull();
        expect(authStore.token()).toBeNull();
        expect(authStore.isAuthenticated()).toBe(false);
      });

      it('should handle error during signup with default error message', async () => {
        const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
        const error = new Error(''); // No error.message or error.error.message
        httpClientMock.post.mockReturnValue(throwError(() => error));

        await expect(authStore.signup(userData)).rejects.toThrow('');
        expect(authStore.error()).toBe('Signup failed. Please check your details.');
        expect(authStore.isLoading()).toBe(false);
        expect(authStore.user()).toBeNull();
        expect(authStore.token()).toBeNull();
        expect(authStore.isAuthenticated()).toBe(false);
      });

      it('should set isLoading to true before HTTP request', async () => {
        const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
        const response = { id: 1, name: 'Test User', email: 'test@example.com' };
        httpClientMock.post.mockReturnValue(of(response));

        const patchStateSpy = jest.spyOn(authStore, 'patchState');
        await authStore.signup(userData);

        expect(patchStateSpy).toHaveBeenNthCalledWith(1, { isLoading: true, error: null });
        patchStateSpy.mockRestore();
      });
    });

    describe('signout Method', () => {
      it('should sign out successfully and clear state', () => {
        authStore['patchState']({
          user: { id: 1, email: 'test@example.com', name: 'Test User' },
          token: 'test-token',
          isAuthenticated: true,
          error: 'Some error',
          isLoading: true,
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
        localStorageMock.removeItem.mockImplementation(() => {
          throw new Error('Storage error');
        });

        expect(() => authStore.signout()).toThrow('Storage error');
        expect(authStore.error()).toBe('Signout failed');
        expect(authStore.isLoading()).toBe(false);
      });
    });
  });

  describe('AuthService', () => {
    it('should call login method of AuthStore', async () => {
      const credentials = { email: 'test@example.com', password: 'password' };
      const loginSpy = jest.spyOn(authStore, 'login').mockResolvedValue();

      await authService.login(credentials);

      expect(loginSpy).toHaveBeenCalledWith(credentials);
      loginSpy.mockRestore();
    });

    it('should call signup method of AuthStore', async () => {
      const userData = { name: 'Test User', email: 'test@example.com', password: 'password' };
      const signupSpy = jest.spyOn(authStore, 'signup').mockResolvedValue();

      await authService.signup(userData);

      expect(signupSpy).toHaveBeenCalledWith(userData);
      signupSpy.mockRestore();
    });

    it('should call signout method of AuthStore', () => {
      const signoutSpy = jest.spyOn(authStore, 'signout').mockImplementation(() => {});

      authService.signout();

      expect(signoutSpy).toHaveBeenCalled();
      signoutSpy.mockRestore();
    });

    it('should expose user signal getter with null value', () => {
      authStore['patchState']({ user: null });
      expect(authService.getUser()).toBeNull();
    });

    it('should expose user signal getter with user value', () => {
      const user = { id: 1, email: 'test@example.com', name: 'Test User' };
      authStore['patchState']({ user });
      expect(authService.getUser()).toEqual(user);
    });

    it('should expose isAuthenticated signal getter with true value', () => {
      authStore['patchState']({ isAuthenticated: true });
      expect(authService.getIsAuthenticated()).toBe(true);
    });

    it('should expose isAuthenticated signal getter with false value', () => {
      authStore['patchState']({ isAuthenticated: false });
      expect(authService.getIsAuthenticated()).toBe(false);
    });

    it('should expose isLoading signal getter with true value', () => {
      authStore['patchState']({ isLoading: true });
      expect(authService.getIsLoading()).toBe(true);
    });

    it('should expose isLoading signal getter with false value', () => {
      authStore['patchState']({ isLoading: false });
      expect(authService.getIsLoading()).toBe(false);
    });

    it('should expose error signal getter with null value', () => {
      authStore['patchState']({ error: null });
      expect(authService.error()).toBeNull();
    });

    it('should expose error signal getter with error value', () => {
      authStore['patchState']({ error: 'Test error' });
      expect(authService.error()).toBe('Test error');
    });
  });
});