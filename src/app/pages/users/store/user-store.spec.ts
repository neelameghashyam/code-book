import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, of, throwError } from 'rxjs';
import { UserStore } from './user-store'; // Matches user.store.ts
import { User } from '../user'; // Adjusted for src/app/user.ts
import { patchState } from '@ngrx/signals'; // Required import

describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;
  let httpClientMock: jest.Mocked<HttpClient>;

  // Sample user data
  const mockApiUsers = [
    {
      id: 1,
      name: 'John Doe',
      username: 'john',
      email: 'john@example.com',
      address: {
        street: '123 Main St',
        suite: 'Apt 4',
        city: 'Anytown',
        zipcode: '12345',
        geo: { lat: '0', lng: '0' },
      },
      phone: '555-1234',
      website: 'johndoe.com',
      company: {
        name: 'Doe Inc',
        catchPhrase: 'Innovate',
        bs: 'Synergy',
      },
    },
  ];

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      company: 'Doe Inc',
      bs: 'Synergy',
      website: 'johndoe.com',
    },
  ];

  beforeEach(() => {
    // Mock HttpClient
    httpClientMock = {
      get: jest.fn().mockReturnValue(of(mockApiUsers)),
    } as any;

    // Mock localStorage
    const localStorageMock = {
      store: {} as { [key: string]: string },
      getItem: jest.fn((key: string) => localStorageMock.store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        localStorageMock.store[key] = value;
      }),
      clear: jest.fn(() => {
        localStorageMock.store = {};
      }),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        UserStore,
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });

    store = TestBed.inject(UserStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default state', () => {
      expect(store.initialized()).toBe(true);
      expect(store.error()).toBe(null);
      expect(store.users())
      expect(store.isLoading()).toBe(true);
    });
  });

  describe('Computed Properties', () => {
    it('should compute users correctly', () => {
      patchState(store as any, { users: mockUsers });
      expect(store.users()).toEqual(mockUsers);
    });

    it('should compute isLoading correctly', () => {
      expect(store.isLoading()).toBe(true);
      patchState(store as any, { initialized: true });
      expect(store.isLoading()).toBe(true);
    });
  });

  describe('loadUsers', () => {
    it('should load users from local storage if available', async () => {
      localStorage.setItem('users', JSON.stringify(mockUsers));
      await store.loadUsers();
      expect(localStorage.getItem).toHaveBeenCalledWith('users');
      expect(httpClientMock.get)
      expect(store.users()).toEqual(mockUsers);
      expect(store.initialized()).toBe(true);
      expect(store.error()).toBe(null);
    });

    it('should load users from API if local storage is empty', async () => {
      localStorage.getItem = jest.fn().mockReturnValue(null);
      await store.loadUsers();
      expect(localStorage.getItem).toHaveBeenCalledWith('users');
      expect(httpClientMock.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify(mockUsers));
      expect(store.users()).toEqual(mockUsers);
      expect(store.initialized()).toBe(true);
      expect(store.error()).toBe(null);
    });

    it('should handle API error', async () => {
      localStorage.getItem = jest.fn().mockReturnValue(null);
      httpClientMock.get.mockReturnValue(throwError(() => new Error('API Error')));
      await expect(store.loadUsers()).rejects.toThrow('API Error');
      expect(store.error()).toBe('Failed to load users');
      expect(store.users())
      expect(store.initialized()).toBe(true);
    });
  });

  describe('addUser', () => {
    it('should add a new user', () => {
      const newUser: User = {
        id: 2,
        name: 'Jane Doe',
        company: 'Jane Inc',
        bs: 'Innovation',
        website: 'janedoe.com',
      };
      store.addUser(newUser);
      expect(store.users())
      expect(localStorage.setItem)
      expect(store.error()).toBe(null);
    });

    it('should handle error when adding user', () => {
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage Error');
      });
      const newUser: User = {
        id: 2,
        name: 'Jane Doe',
        company: 'Jane Inc',
        bs: 'Innovation',
        website: 'janedoe.com',
      };
      expect(() => store.addUser(newUser)).toThrow('Storage Error');
      expect(store.error()).toBe('Failed to add user');
      expect(store.users())
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', () => {
      patchState(store as any, { users: mockUsers });
      const updatedUser: User = {
        id: 1,
        name: 'John Smith',
        company: 'Smith Inc',
        bs: 'Collaboration',
        website: 'johnsmith.com',
      };
      store.updateUser(updatedUser);
      expect(store.users()).toContainEqual(updatedUser);
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify([updatedUser]));
      expect(store.error()).toBe(null);
    });

    it('should handle error when updating user', () => {
      patchState(store as any, { users: mockUsers });
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage Error');
      });
      const updatedUser: User = {
        id: 1,
        name: 'John Smith',
        company: 'Smith Inc',
        bs: 'Collaboration',
        website: 'johnsmith.com',
      };
      expect(() => store.updateUser(updatedUser)).toThrow('Storage Error');
      expect(store.error()).toBe('Failed to update user');
      expect(store.users()).toEqual(mockUsers);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', () => {
      patchState(store as any, { users: mockUsers });
      store.deleteUser(1);
      expect(store.users()).toEqual([]);
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify([]));
      expect(store.error()).toBe(null);
    });

    it('should handle error when deleting user', () => {
      patchState(store as any, { users: mockUsers });
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage Error');
      });
      expect(() => store.deleteUser(1)).toThrow('Storage Error');
      expect(store.error()).toBe('Failed to delete user');
      expect(store.users()).toEqual(mockUsers);
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', () => {
      patchState(store as any, { users: mockUsers });
      const user = store.getUser(1);
      expect(user).toEqual(mockUsers[0]);
      expect(store.error()).toBe(null);
    });

    it('should return undefined if user is not found', () => {
      patchState(store as any, { users: mockUsers });
      const user = store.getUser(999);
      expect(user).toBeUndefined();
      expect(store.error()).toBe(null);
    });

    it('should handle error when fetching user', () => {
      patchState(store as any, { users: mockUsers });
      // Mock Array.prototype.find to throw an error
      jest.spyOn(Array.prototype, 'find').mockImplementation(() => {
        throw new Error('Find Error');
      });
      expect(() => store.getUser(1)).toThrow('Find Error');
      expect(store.error()).toBe('Failed to fetch user with ID 1');
      jest.spyOn(Array.prototype, 'find').mockRestore();
    });
  });

  describe('onInit Hook', () => {
    it('should call loadUsers on initialization', () => {
      const loadUsersSpy = jest.spyOn(store, 'loadUsers');
      TestBed.inject(UserStore); // Re-inject to trigger onInit
      expect(loadUsersSpy)
      loadUsersSpy.mockRestore();
    });
  });
});