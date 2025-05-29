import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';
import { Signal } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { patchState } from '@ngrx/signals';

// Declare ZoneAwarePromise globally to avoid TS errors
declare const ZoneAwarePromise: typeof Promise;

// Define AuthStore interface to match signal store
interface AuthStoreInterface {
  login(credentials: { email: string; password: string }): Promise<void>;
  signup(userData: { name: string; email: string; password: string }): Promise<void>;
  signout(): void;
  user: Signal<{ id: number; email: string; name: string } | null>;
  isAuthenticated: Signal<boolean>;
  isLoading: Signal<boolean>;
  error: Signal<string | null>;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let authStore: AuthStoreInterface;

  const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
  const mockCredentials = { email: 'test@example.com', password: 'password123' };
  const mockUserData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
  const apiUrl = 'https://api.escuelajs.co';

  // Mock localStorage
  const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    // Replace global localStorage with mock
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, AuthStore],
    });

    service = TestBed.inject(AuthService);
    authStore = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);

    // Reset localStorage mock
    localStorageMock.clear();
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should call authStore.login with credentials', async () => {
      const loginSpy = jest.spyOn(authStore, 'login');
      const result = service.login(mockCredentials);

      const req = httpMock.expectOne(`${apiUrl}/api/v1/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCredentials);
      req.flush({ access_token: 'mock-token' });

      await result;
      expect(loginSpy).toHaveBeenCalledWith(mockCredentials);
    });

    it('should handle different credentials', async () => {
      const differentCredentials = { email: 'other@example.com', password: 'different123' };
      const loginSpy = jest.spyOn(authStore, 'login');
      const result = service.login(differentCredentials);

      const req = httpMock.expectOne(`${apiUrl}/api/v1/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(differentCredentials);
      req.flush({ access_token: 'mock-token' });

      await result;
      expect(loginSpy).toHaveBeenCalledWith(differentCredentials);
    });
  });

  describe('signup', () => {
    it('should call authStore.signup with user data', async () => {
      const signupSpy = jest.spyOn(authStore, 'signup');
      const result = service.signup(mockUserData);

      const req = httpMock.expectOne(`${apiUrl}/api/v1/users/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        ...mockUserData,
        avatar: 'https://i.imgur.com/LDOe7r5.png',
      });
      req.flush(mockUser);

      await result;
      expect(signupSpy).toHaveBeenCalledWith(mockUserData);
    });

    it('should handle different user data', async () => {
      const differentUserData = { name: 'Other User', email: 'other@example.com', password: 'different123' };
      const signupSpy = jest.spyOn(authStore, 'signup');
      const result = service.signup(differentUserData);

      const req = httpMock.expectOne(`${apiUrl}/api/v1/users/`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        ...differentUserData,
        avatar: 'https://i.imgur.com/LDOe7r5.png',
      });
      req.flush({ id: 2, name: 'Other User', email: 'other@example.com' });

      await result;
      expect(signupSpy).toHaveBeenCalledWith(differentUserData);
    });
  });

  describe('signout', () => {
    it('should call authStore.signout', () => {
      const signoutSpy = jest.spyOn(authStore, 'signout');
      service.signout();
      expect(signoutSpy).toHaveBeenCalled();
    });
  });

  describe('getUser', () => {
    it('should return authStore.user signal', () => {
      // Set AuthStore state directly
      patchState(authStore as any, {
        user: mockUser,
        token: 'mock-token',
        isAuthenticated: true,
      });

      const userSignal = service.getUser;
      expect(userSignal).toBe(authStore.user);
      expect(userSignal()).toEqual(mockUser);
    });
  });

  describe('getIsAuthenticated', () => {
    it('should return authStore.isAuthenticated signal', () => {
      // Set AuthStore state directly
      patchState(authStore as any, {
        user: mockUser,
        token: 'mock-token',
        isAuthenticated: true,
      });

      const isAuthenticatedSignal = service.getIsAuthenticated;
      expect(isAuthenticatedSignal).toBe(authStore.isAuthenticated);
      expect(isAuthenticatedSignal()).toBe(true);
    });
  });

  describe('getIsLoading', () => {
    it('should return authStore.isLoading signal', async () => {
      // Trigger login to set isLoading
      const loginPromise = service.login(mockCredentials);
      const req = httpMock.expectOne(`${apiUrl}/api/v1/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ access_token: 'mock-token' });

      // Wait for login to complete and update isLoading
      await loginPromise;

      const isLoadingSignal = service.getIsLoading;
      expect(isLoadingSignal).toBe(authStore.isLoading);
      expect(isLoadingSignal()).toBe(false); // isLoading should be false after request
    });
  });

  describe('error', () => {
    it('should return authStore.error signal', () => {
      const errorSignal = service.error;
      expect(errorSignal).toBe(authStore.error);
      expect(errorSignal()).toBe(null);
    });

    it('should handle non-null error', async () => {
      const errorMessage = 'Invalid email or password';
      const loginPromise = service.login(mockCredentials);
      const req = httpMock.expectOne(`${apiUrl}/api/v1/auth/login`);
      req.error(new ProgressEvent('error'), {
        status: 401,
        statusText: 'Unauthorized',
      });

      // Wait for error to propagate
      try {
        await loginPromise;
      } catch (e) {
        // Ignore error for test to continue
      }

      // Allow signal to update
      await new Promise(resolve => setTimeout(resolve, 0));

      const errorSignal = service.error;
      expect(errorSignal()).toBe(errorMessage);
    });
  });
});