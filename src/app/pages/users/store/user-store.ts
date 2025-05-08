import {
    patchState,
    signalStore,
    withComputed,
    withHooks,
    withMethods,
    withState,
  } from '@ngrx/signals';
  import { computed, inject } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { User } from '../user';
  import { lastValueFrom } from 'rxjs';
  
  interface ApiUser {
    id: number;
    name: string;
    username: string;
    email: string;
    address: {
      street: string;
      suite: string;
      city: string;
      zipcode: string;
      geo: {
        lat: string;
        lng: string;
      };
    };
    phone: string;
    website: string;
    company: {
      name: string;
      catchPhrase: string;
      bs: string;
    };
  }
  
  type UserState = {
    initialized: boolean;
    error: string | null;
    users: User[];
  };
  
  const initialState: UserState = {
    initialized: false,
    error: null,
    users: [],
  };
  
  const apiUrl = 'https://jsonplaceholder.typicode.com/users';
  
  export const UserStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withComputed(({ users }) => ({
      users: computed(() => users()),
      isLoading: computed(() => !initialState.initialized),
    })),
    withMethods((store, http = inject(HttpClient)) => ({
      async loadUsers() {
        try {
          const localData = localStorage.getItem('users');
          if (localData) {
            const users: User[] = JSON.parse(localData);
            patchState(store, { users, initialized: true, error: null });
            return;
          }
  
          const response = await lastValueFrom(http.get<ApiUser[]>(apiUrl));
          const mappedUsers: User[] = response.map(user => ({
            id: user.id,
            name: user.name,
            company: user.company.name,
            bs: user.company.bs,
            website: user.website,
          }));
          localStorage.setItem('users', JSON.stringify(mappedUsers));
          patchState(store, { users: mappedUsers, initialized: true, error: null });
        } catch (error) {
          patchState(store, { error: 'Failed to load users' });
          throw error;
        }
      },
      addUser(user: User) {
        try {
          const newUsers = [...store.users(), { ...user, id: Date.now() }];
          localStorage.setItem('users', JSON.stringify(newUsers));
          patchState(store, { users: newUsers, error: null });
        } catch (error) {
          patchState(store, { error: 'Failed to add user' });
          throw error;
        }
      },
      updateUser(user: User) {
        try {
          const updatedUsers = store.users().map(u =>
            u.id === user.id ? user : u
          );
          localStorage.setItem('users', JSON.stringify(updatedUsers));
          patchState(store, { users: updatedUsers, error: null });
        } catch (error) {
          patchState(store, { error: 'Failed to update user' });
          throw error;
        }
      },
      deleteUser(userId: number) {
        try {
          const updatedUsers = store.users().filter(u => u.id !== userId);
          localStorage.setItem('users', JSON.stringify(updatedUsers));
          patchState(store, { users: updatedUsers, error: null });
        } catch (error) {
          patchState(store, { error: 'Failed to delete user' });
          throw error;
        }
      },
      getUser(userId: number): User | undefined {
        try {
          return store.users().find(u => u.id === userId);
        } catch (error) {
          patchState(store, { error: `Failed to fetch user with ID ${userId}` });
          throw error;
        }
      },
    })),
    withHooks({
      onInit(store) {
        store.loadUsers();
      },
    })
  );