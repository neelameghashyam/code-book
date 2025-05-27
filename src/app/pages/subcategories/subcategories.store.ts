import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { Subcategory } from './subcategories';

interface SubcategoryState {
  subcategories: Subcategory[];
  initialized: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  isLoading: boolean;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  selectedCategoryId: number | null;
}

const initialState: SubcategoryState = {
  subcategories: [],
  initialized: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  isLoading: false,
  sortField: null,
  sortDirection: 'asc',
  selectedCategoryId: null,
};

export const SubcategoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ subcategories, searchQuery, currentPage, pageSize, isLoading, error, sortField, sortDirection, selectedCategoryId }) => {
    const filteredSubcategories = computed(() => {
      let filtered = subcategories().filter(s =>
        (selectedCategoryId() === null || s.categoryId === selectedCategoryId()) &&
        ((String(s.name || '').toLowerCase().includes(searchQuery().toLowerCase())) ||
         (String(s.icon || '').toLowerCase().includes(searchQuery().toLowerCase())) ||
         (String(s.comments || '').toLowerCase().includes(searchQuery().toLowerCase())) ||
         (String(s.CategoryName || '').toLowerCase().includes(searchQuery().toLowerCase())))
      );

      if (sortField()) {
        filtered = filtered.sort((a, b) => {
          const field = sortField() as keyof Subcategory;
          if (field === 'createdAt' || field === 'modifiedAt') {
            const dateA = new Date(a[field] || '').getTime();
            const dateB = new Date(b[field] || '').getTime();
            return sortDirection() === 'asc' ? dateA - dateB : dateB - dateA;
          } else {
            const valueA = String(a[field] || '').toLowerCase();
            const valueB = String(b[field] || '').toLowerCase();
            return sortDirection() === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
          }
        });
      }

      return filtered;
    });

    return {
      subcategories: computed(() => subcategories()),
      filteredSubcategories,
      paginatedSubcategories: computed(() => {
        const start = (currentPage() - 1) * pageSize();
        return filteredSubcategories().slice(start, start + pageSize());
      }),
      totalPages: computed(() => Math.ceil(filteredSubcategories().length / pageSize())),
      currentPage: computed(() => currentPage()),
      pageSize: computed(() => pageSize()),
      isLoading: computed(() => isLoading()),
      error: computed(() => error()),
      selectedCategoryId: computed(() => selectedCategoryId()),
    };
  }),
  withMethods((store) => ({
    loadSubcategories() {
      try {
        patchState(store, { isLoading: true, error: null });
        const localData = localStorage.getItem('subcategories');
        let subcategories: Subcategory[] = [];
        if (localData) {
          subcategories = JSON.parse(localData).map((s: Subcategory) => ({
            ...s,
            name: String(s.name || ''),
            icon: String(s.icon || ''),
            imageUrl: String(s.imageUrl || ''),
            createdAt: String(s.createdAt || new Date().toISOString()),
            modifiedAt: String(s.modifiedAt || new Date().toISOString()),
            comments: String(s.comments || ''),
            CategoryName: String(s.CategoryName || ''),
            categoryId: Number(s.categoryId || 0),
          }));
        }
        patchState(store, { subcategories, initialized: true, isLoading: false, error: null });
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load subcategories';
        patchState(store, { error: errorMessage, isLoading: false });
        throw error;
      }
    },
    addSubcategory(subcategory: Omit<Subcategory, 'id' | 'createdAt' | 'modifiedAt'>) {
      try {
        patchState(store, { isLoading: true, error: null });
        const newSubcategory: Subcategory = {
          ...subcategory,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          name: String(subcategory.name || ''),
          icon: String(subcategory.icon || ''),
          imageUrl: String(subcategory.imageUrl || ''),
          comments: String(subcategory.comments || ''),
          CategoryName: String(subcategory.CategoryName || ''),
          categoryId: Number(subcategory.categoryId || 0),
        };
        const localData = localStorage.getItem('subcategories');
        const subcategories = localData ? JSON.parse(localData) : [];
        subcategories.push(newSubcategory);
        localStorage.setItem('subcategories', JSON.stringify(subcategories));
        patchState(store, {
          subcategories: [...store.subcategories(), newSubcategory],
          isLoading: false,
          error: null,
        });
        return newSubcategory;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to add subcategory';
        patchState(store, { error: errorMessage, isLoading: false });
        throw error;
      }
    },
    updateSubcategory(subcategory: Subcategory) {
      try {
        patchState(store, { isLoading: true, error: null });
        const localData = localStorage.getItem('subcategories');
        if (localData) {
          const subcategories = JSON.parse(localData);
          const updatedSubcategories = subcategories.map((s: Subcategory) =>
            s.id === subcategory.id
              ? {
                  ...subcategory,
                  modifiedAt: new Date().toISOString(),
                  name: String(subcategory.name || ''),
                  icon: String(subcategory.icon || ''),
                  imageUrl: String(subcategory.imageUrl || ''),
                  comments: String(subcategory.comments || ''),
                  CategoryName: String(subcategory.CategoryName || ''),
                  categoryId: Number(subcategory.categoryId || 0),
                }
              : s
          );
          localStorage.setItem('subcategories', JSON.stringify(updatedSubcategories));
          patchState(store, {
            subcategories: store.subcategories().map(s =>
              s.id === subcategory.id
                ? {
                    ...subcategory,
                    modifiedAt: new Date().toISOString(),
                    name: String(subcategory.name || ''),
                    icon: String(subcategory.icon || ''),
                    imageUrl: String(subcategory.imageUrl || ''),
                    comments: String(subcategory.comments || ''),
                    CategoryName: String(subcategory.CategoryName || ''),
                    categoryId: Number(subcategory.categoryId || 0),
                  }
                : s
            ),
            isLoading: false,
            error: null,
          });
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to update subcategory';
        patchState(store, { error: errorMessage, isLoading: false });
        throw error;
      }
    },
    deleteSubcategory(id: number) {
      try {
        patchState(store, { isLoading: true, error: null });
        const localData = localStorage.getItem('subcategories');
        if (localData) {
          const subcategories = JSON.parse(localData);
          const updatedSubcategories = subcategories.filter((s: Subcategory) => s.id !== id);
          localStorage.setItem('subcategories', JSON.stringify(updatedSubcategories));
          patchState(store, {
            subcategories: store.subcategories().filter(s => s.id !== id),
            isLoading: false,
            error: null,
          });
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to delete subcategory';
        patchState(store, { error: errorMessage, isLoading: false });
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
    sortSubcategories(field: string | null, direction: 'asc' | 'desc') {
      patchState(store, { sortField: field, sortDirection: direction, currentPage: 1 });
    },
    setSelectedCategoryId(categoryId: number | null) {
      patchState(store, { selectedCategoryId: categoryId, currentPage: 1 });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadSubcategories();
    },
  })
);