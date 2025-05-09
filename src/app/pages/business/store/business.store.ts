import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { Business } from '../business.model';
import { v4 as uuidv4 } from 'uuid';

interface BusinessState {
  businesses: Business[];
  loading: boolean;
  error: string | null;
}

const initialState: BusinessState = {
  businesses: [],
  loading: false,
  error: null,
};

const STORAGE_KEY = 'businesses';

export const BusinessStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ businesses }) => ({
    businessCount: computed(() => businesses().length),
  })),
  withMethods((store) => ({
    loadBusinesses(): void {
      try {
        patchState(store, { loading: true });
        const data = localStorage.getItem(STORAGE_KEY);
        const businesses = data ? JSON.parse(data) : [];
        patchState(store, { businesses, loading: false, error: null });
      } catch (error) {
        patchState(store, { loading: false, error: 'Failed to load businesses' });
      }
    },

    addBusiness(business: Business): void {
      try {
        patchState(store, { loading: true });
        const businesses = [...store.businesses()];
        business.id = uuidv4();
        businesses.push(business);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
        patchState(store, { businesses, loading: false, error: null });
      } catch (error) {
        patchState(store, { loading: false, error: 'Failed to add business' });
      }
    },

    updateBusiness(business: Business): void {
      try {
        patchState(store, { loading: true });
        const businesses = [...store.businesses()];
        const index = businesses.findIndex(b => b.id === business.id);
        if (index === -1) {
          throw new Error('Business not found');
        }
        businesses[index] = business;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
        patchState(store, { businesses, loading: false, error: null });
      } catch (error) {
        patchState(store, { loading: false, error: 'Failed to update business' });
      }
    },

    deleteBusiness(id: string): void {
      try {
        patchState(store, { loading: true });
        const businesses = store.businesses().filter(b => b.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(businesses));
        patchState(store, { businesses, loading: false, error: null });
      } catch (error) {
        patchState(store, { loading: false, error: 'Failed to delete business' });
      }
    },

    getBusiness(id: string): Business | undefined {
      try {
        return store.businesses().find(b => b.id === id);
      } catch (error) {
        patchState(store, { error: `Failed to fetch business with ID ${id}` });
        return undefined;
      }
    },
  })),
  withHooks({
    onInit(store) {
      store.loadBusinesses();
    },
  })
);