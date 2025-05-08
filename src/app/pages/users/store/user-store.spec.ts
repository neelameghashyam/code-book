import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, of, throwError } from 'rxjs';
import { UserStore } from './user-store';
import { User } from '../user';
import { patchState } from '@ngrx/signals';

describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;
  let httpClientMock: jest.Mocked<HttpClient>;
  let localStorageMock: jest.SpyInstance;

  const mockApiUsers = [
    {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      address: {
        street: '123 Main St',
        suite: 'Apt 4',
        city: 'Anytown',
        zipcode: '12345',
        geo: { lat: '0', lng: '0' },
      },
      phone: '123-456-7890',
      website: 'https://johndoe.com',
      company: {
        name: 'Acme Corp',
        catchPhrase: 'Innovate',
        bs: 'Innovation',
      },
    },
  ];

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'John Doe',
      company: 'Acme Corp',
      bs: 'Innovation',
      website: 'https://johndoe.com',
    },
  ];

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
    } as any;

    // Mock localStorage
    const localStorageStore: { [key: string]: string } = {};
    localStorageMock = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(
      (key) => localStorageStore[key] || null
    );
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(
      (key, value) => (localStorageStore[key] = value)
    );

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

  it('should initialize with correct initial state', () => {
    expect(store.initialized()).toBe(false);
    expect(store.error()).toBe(null);
    expect(store.users()).toEqual([]);
    expect(store.isLoading()).toBe(true);
  });

  describe('loadUsers', () => {
    it('should load users from localStorage if available', async () => {
      localStorageMock.mockReturnValueOnce(JSON.stringify(mockUsers));
      await store.loadUsers();

      expect(localStorageMock).toHaveBeenCalledWith('users');
      expect(httpClientMock.get).not.toHaveBeenCalled();
      expect(store.users()).toEqual(mockUsers);
      expect(store.initialized()).toBe(true);
      expect(store.error()).toBe(null);
      expect(store.isLoading()).toBe(false);
    });

    it('should fetch users from API and store in localStorage if localStorage is empty', async () => {
      localStorageMock.mockReturnValueOnce(null);
      httpClientMock.get.mockReturnValueOnce(of(mockApiUsers));
      await store.loadUsers();

      expect(localStorageMock).toHaveBeenCalledWith('users');
      expect(httpClientMock.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify(mockUsers));
      expect(store.users()).toEqual(mockUsers);
      expect(store.initialized()).toBe(true);
      expect(store.error()).toBe(null);
      expect(store.isLoading()).toBe(false);
    });

    it('should handle API error and update error state', async () => {
      localStorageMock.mockReturnValueOnce(null);
      httpClientMock.get.mockReturnValueOnce(throwError(() => new Error('API error')));
      await expect(store.loadUsers()).rejects.toThrow('API error');

      expect(store.error()).toBe('Failed to load users');
      expect(store.users()).toEqual([]);
      expect(store.initialized()).toBe(false);
      expect(store.isLoading()).toBe(true);
    });
  });

  describe('addUser', () => {
    it('should add a new user and update localStorage', () => {
      const newUser: User = {
        id: 2,
        name: 'Jane Doe',
        company: 'Tech Inc',
        bs: 'Growth',
        website: 'https://janedoe.com',
      };

      jest.spyOn(Date, 'now').mockReturnValue(123456);
      store.addUser(newUser);

      expect(store.users()).toContainEqual({ ...newUser, id: 123456 });
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify([{ ...newUser, id: 123456 }]));
      expect(store.error()).toBe(null);
    });

    it('should handle error when adding user fails', () => {
      const newUser: User = {
        id: 2,
        name: 'Jane Doe',
        company: 'Tech Inc',
        bs: 'Growth',
        website: 'https://janedoe.com',
      };

      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => store.addUser(newUser)).toThrow('Storage error');
      expect(store.error()).toBe('Failed to add user');
      expect(store.users()).toEqual([]);
    });
  });

  describe('updateUser', () => {
    it('should update an existing user and update localStorage', () => {
      store.addUser(mockUsers[0]); // Use addUser to set initial state
      const updatedUser: User = {
        id: 1,
        name: 'John Smith',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://johnsmith.com',
      };

      store.updateUser(updatedUser);

      expect(store.users()).toContainEqual(updatedUser);
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify([updatedUser]));
      expect(store.error()).toBe(null);
    });

    it('should handle error when updating user fails', () => {
      store.addUser(mockUsers[0]); // Use addUser to set initial state
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const updatedUser: User = {
        id: 1,
        name: 'John Smith',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://johnsmith.com',
      };

      expect(() => store.updateUser(updatedUser)).toThrow('Storage error');
      expect(store.error()).toBe('Failed to update user');
      expect(store.users()).toEqual(mockUsers);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and update localStorage', () => {
      store.addUser(mockUsers[0]); // Use addUser to set initial state
      store.deleteUser(1);

      expect(store.users()).toEqual([]);
      expect(localStorage.setItem).toHaveBeenCalledWith('users', JSON.stringify([]));
      expect(store.error()).toBe(null);
    });

    it('should handle error when deleting user fails', () => {
      store.addUser(mockUsers[0]); // Use addUser to set initial state
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => store.deleteUser(1)).toThrow('Storage error');
      expect(store.error()).toBe('Failed to delete user');
      expect(store.users()).toEqual(mockUsers);
    });
  });

  describe('getUser', () => {
    it('should return the user with the given ID', () => {
      store.addUser(mockUsers[0]); // Use addUser to set initial state
      const user = store.getUser(1);

      expect(user).toEqual(mockUsers[0]);
      expect(store.error()).toBe(null);
    });

    it('should return undefined if user is not found', () => {
      store.addUser(mockUsers[0]); // Use addUser to set initial state
      const user = store.getUser(999);

      expect(user).toBeUndefined();
      expect(store.error()).toBe(null);
    });

    it('should handle error when fetching user fails', () => {
      store.addUser(mockUsers[0]); // Use addUser to set initial state
      jest.spyOn(mockUsers, 'find').mockImplementation(() => {
        throw new Error('Find error');
      });

      expect(() => store.getUser(1)).toThrow('Find error');
      expect(store.error()).toBe('Failed to fetch user with ID 1');
    });
  });

  describe('Computed Signals', () => {
    it('should reflect users state in users computed signal', () => {
      store.addUser(mockUsers[0]); // Use addUser to set initial state
      expect(store.users()).toEqual(mockUsers);
    });

    it('should reflect isLoading based on initialized state', () => {
      expect(store.isLoading()).toBe(true);
      // Use type assertion to bypass TypeScript error
      patchState(store as any, { initialized: true });
      expect(store.isLoading()).toBe(false);
    });
  });

  describe('Hooks', () => {
    it('should call loadUsers on initialization', () => {
      const loadUsersSpy = jest.spyOn(store, 'loadUsers');
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          UserStore,
          { provide: HttpClient, useValue: httpClientMock },
        ],
      });
      store = TestBed.inject(UserStore);
      expect(loadUsersSpy).toHaveBeenCalled();
    });
  });
});