import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Pincode } from './pincode';

interface PincodeState {
  pincodes: Pincode[];
  initialized: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  isLoading: boolean;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
}

const initialState: PincodeState = {
  pincodes: [],
  initialized: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  isLoading: false,
  sortField: null,
  sortDirection: 'asc',
};

const apiUrl = 'https://dbapiservice.onrender.com/dbapis/v1/pincodes';

export const PincodeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ pincodes, searchQuery, currentPage, pageSize, sortField, sortDirection }) => {
    const filteredPincodes = computed(() => {
      let filtered = pincodes().filter(p =>
        (String(p.officeName || '').toLowerCase().includes(searchQuery().toLowerCase())) ||
        (String(p.pincode || '').toLowerCase().includes(searchQuery().toLowerCase())) ||
        (String(p.districtName || '').toLowerCase().includes(searchQuery().toLowerCase())) ||
        (String(p.taluk || '').toLowerCase().includes(searchQuery().toLowerCase())) ||
        (String(p.stateName || '').toLowerCase().includes(searchQuery().toLowerCase())) ||
        (String(p.city || '').toLowerCase().includes(searchQuery().toLowerCase()))
      );

      if (sortField()) {
        filtered = filtered.sort((a, b) => {
          const field = sortField() as keyof Pincode;
          const valueA = String(a[field] || '').toLowerCase();
          const valueB = String(b[field] || '').toLowerCase();
          return sortDirection() === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
      }

      return filtered;
    });

    return {
      filteredPincodes,
      paginatedPincodes: computed(() => {
        const start = (currentPage() - 1) * pageSize();
        return filteredPincodes().slice(start, start + pageSize());
      }),
      totalPages: computed(() => Math.ceil(filteredPincodes().length / pageSize())),
    };
  }),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadPincodes() {
      try {
        patchState(store, { isLoading: true, error: null });
        const localData = localStorage.getItem('pincodes');
        let pincodes: Pincode[] = [];
        if (localData) {
          pincodes = JSON.parse(localData).map((p: Pincode) => ({
            ...p,
            pincode: String(p.pincode || ''),
            officeName: String(p.officeName || ''),
            districtName: String(p.districtName || ''),
            taluk: String(p.taluk || ''),
            stateName: String(p.stateName || ''),
            city: String(p.city || ''),
          }));
        } else {
          pincodes = await lastValueFrom(http.get<Pincode[]>(apiUrl));
          pincodes = pincodes.map(p => ({
            ...p,
            pincode: String(p.pincode || ''),
            officeName: String(p.officeName || ''),
            districtName: String(p.districtName || ''),
            taluk: String(p.taluk || ''),
            stateName: String(p.stateName || ''),
            city: String(p.city || ''),
          }));
          localStorage.setItem('pincodes', JSON.stringify(pincodes));
        }
        patchState(store, { pincodes, initialized: true, isLoading: false, error: null });
      } catch (error: any) {
        patchState(store, { error: error.message || 'Failed to load pincodes', isLoading: false });
        throw error;
      }
    },
    async addPincode(pincode: Omit<Pincode, 'id'>) {
      try {
        patchState(store, { isLoading: true, error: null });
        const newPincode: Pincode = {
          ...pincode,
          id: Date.now(),
          pincode: String(pincode.pincode || ''),
          officeName: String(pincode.officeName || ''),
          districtName: String(pincode.districtName || ''),
          taluk: String(pincode.taluk || ''),
          stateName: String(pincode.stateName || ''),
          city: String(pincode.city || ''),
        };
        const localData = localStorage.getItem('pincodes');
        const pincodes = localData ? JSON.parse(localData) : [];
        pincodes.push(newPincode);
        localStorage.setItem('pincodes', JSON.stringify(pincodes));
        patchState(store, { pincodes: [...store.pincodes(), newPincode], isLoading: false, error: null });
        return newPincode;
      } catch (error: any) {
        patchState(store, { error: error.message || 'Failed to add pincode', isLoading: false });
        throw error;
      }
    },
    async updatePincode(pincode: Pincode) {
      try {
        patchState(store, { isLoading: true, error: null });
        const localData = localStorage.getItem('pincodes');
        if (localData) {
          const pincodes = JSON.parse(localData);
          const updatedPincodes = pincodes.map((p: Pincode) =>
            p.id === pincode.id
              ? {
                  ...pincode,
                  pincode: String(pincode.pincode || ''),
                  officeName: String(pincode.officeName || ''),
                  districtName: String(pincode.districtName || ''),
                  taluk: String(pincode.taluk || ''),
                  stateName: String(pincode.stateName || ''),
                  city: String(pincode.city || ''),
                }
              : p
          );
          localStorage.setItem('pincodes', JSON.stringify(updatedPincodes));
          patchState(store, {
            pincodes: store.pincodes().map(p =>
              p.id === pincode.id
                ? {
                    ...pincode,
                    pincode: String(pincode.pincode || ''),
                    officeName: String(pincode.officeName || ''),
                    districtName: String(pincode.districtName || ''),
                    taluk: String(pincode.taluk || ''),
                    stateName: String(pincode.stateName || ''),
                    city: String(pincode.city || ''),
                  }
                : p
            ),
            isLoading: false,
            error: null,
          });
        } else {
          patchState(store, { isLoading: false, error: null });
        }
      } catch (error: any) {
        patchState(store, { error: error.message || 'Failed to update pincode', isLoading: false });
        throw error;
      }
    },
    async deletePincode(id: number) {
      try {
        patchState(store, { isLoading: true, error: null });
        const localData = localStorage.getItem('pincodes');
        if (localData) {
          const pincodes = JSON.parse(localData);
          const updatedPincodes = pincodes.filter((p: Pincode) => p.id !== id);
          localStorage.setItem('pincodes', JSON.stringify(updatedPincodes));
          patchState(store, { pincodes: store.pincodes().filter(p => p.id !== id), isLoading: false, error: null });
        } else {
          patchState(store, { isLoading: false, error: null });
        }
      } catch (error: any) {
        patchState(store, { error: error.message || 'Failed to delete pincode', isLoading: false });
        throw error;
      }
    },
    setPage(page: number) {
      patchState(store, { currentPage: page });
    },
    setPageSize(pageSize: number) {
      patchState(store, { pageSize, currentPage: 1 });
    },
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query, currentPage: 1 });
    },
    sortPincodes(field: string, direction: 'asc' | 'desc') {
      patchState(store, { sortField: field, sortDirection: direction, currentPage: 1 });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadPincodes();
    },
  })
);