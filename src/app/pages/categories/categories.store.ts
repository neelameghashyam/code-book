import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { Category } from './category';

interface CategoryState {
  categories: Category[];
  initialized: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
  isLoading: boolean;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
}

const initialState: CategoryState = {
  categories: [],
  initialized: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  isLoading: false,
  sortField: null,
  sortDirection: 'asc',
};

export const CategoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ categories, searchQuery, currentPage, pageSize, isLoading, error, sortField, sortDirection }) => {
    const filteredCategories = computed(() => {
      let filtered = categories().filter(c =>
        (String(c.name || '').toLowerCase().includes(searchQuery().toLowerCase())) ||
        (String(c.icon || '').toLowerCase().includes(searchQuery().toLowerCase())) ||
        (String(c.comments || '').toLowerCase().includes(searchQuery().toLowerCase()))
      );

      if (sortField()) {
        filtered = filtered.sort((a, b) => {
          const field = sortField() as keyof Category;
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
      categories: computed(() => categories()),
      filteredCategories,
      paginatedCategories: computed(() => {
        const start = (currentPage() - 1) * pageSize();
        return filteredCategories().slice(start, start + pageSize());
      }),
      totalPages: computed(() => Math.ceil(filteredCategories().length / pageSize())),
      currentPage: computed(() => currentPage()),
      pageSize: computed(() => pageSize()),
      isLoading: computed(() => isLoading()),
      error: computed(() => error()),
    };
  }),
  withMethods((store) => ({
    loadCategories() {
      try {
        patchState(store, { isLoading: true, error: null });
        const localData = localStorage.getItem('categories');
        let categories: Category[] = [];
        if (localData) {
          categories = JSON.parse(localData).map((c: Category) => ({
            ...c,
            name: String(c.name || ''),
            icon: String(c.icon || ''),
            imageUrl: String(c.imageUrl || ''),
            createdAt: String(c.createdAt || new Date().toISOString()),
            modifiedAt: String(c.modifiedAt || new Date().toISOString()),
            comments: String(c.comments || ''),
          }));
        }
        patchState(store, { categories, initialized: true, isLoading: false, error: null });
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load categories';
        patchState(store, { error: errorMessage, isLoading: false });
        throw error;
      }
    },
    addCategory(category: Omit<Category, 'id' | 'createdAt' | 'modifiedAt'>) {
      try {
        patchState(store, { isLoading: true, error: null });
        const newCategory: Category = {
          ...category,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          name: String(category.name || ''),
          icon: String(category.icon || ''),
          imageUrl: String(category.imageUrl || ''),
          comments: String(category.comments || ''),
        };
        const localData = localStorage.getItem('categories');
        const categories = localData ? JSON.parse(localData) : [];
        categories.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories));
        patchState(store, {
          categories: [...store.categories(), newCategory],
          isLoading: false,
          error: null,
        });
        return newCategory;
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to add category';
        patchState(store, { error: errorMessage, isLoading: false });
        throw error;
      }
    },
    updateCategory(category: Category) {
      try {
        patchState(store, { isLoading: true, error: null });
        const localData = localStorage.getItem('categories');
        if (localData) {
          const categories = JSON.parse(localData);
          const updatedCategories = categories.map((c: Category) =>
            c.id === category.id
              ? {
                  ...category,
                  modifiedAt: new Date().toISOString(),
                  name: String(category.name || ''),
                  icon: String(category.icon || ''),
                  imageUrl: String(category.imageUrl || ''),
                  comments: String(category.comments || ''),
                }
              : c
          );
          localStorage.setItem('categories', JSON.stringify(updatedCategories));
          patchState(store, {
            categories: store.categories().map(c =>
              c.id === category.id
                ? {
                    ...category,
                    modifiedAt: new Date().toISOString(),
                    name: String(category.name || ''),
                    icon: String(category.icon || ''),
                    imageUrl: String(category.imageUrl || ''),
                    comments: String(category.comments || ''),
                  }
                : c
            ),
            isLoading: false,
            error: null,
          });
        }
      } catch (error: any) {
        // const errorMessage = error.message || 'Failed to update category';
        // patchState(store, { error: errorMessage, isLoading: false });
        // throw error;
      }
    },
    deleteCategory(id: number) {
      try {
        patchState(store, { isLoading: true, error: null });
        const localData = localStorage.getItem('categories');
        if (localData) {
          const categories = JSON.parse(localData);
          const updatedCategories = categories.filter((c: Category) => c.id !== id);
          localStorage.setItem('categories', JSON.stringify(updatedCategories));
          patchState(store, {
            categories: store.categories().filter(c => c.id !== id),
            isLoading: false,
            error: null,
          });
        }
      } catch (error: any) {
        // const errorMessage = error.message || 'Failed to delete category';
        // patchState(store, { error: errorMessage, isLoading: false });
        // throw error;
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
    sortCategories(field: string | null, direction: 'asc' | 'desc') {
      patchState(store, { sortField: field, sortDirection: direction, currentPage: 1 });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadCategories();
    },
  })
);