import { Injectable, inject } from '@angular/core';
import { CategoryStore } from './categories.store';
import { Category } from './category';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private categoryStore = inject(CategoryStore);

  categories = this.categoryStore.categories;
  filteredCategories = this.categoryStore.filteredCategories;
  paginatedCategories = this.categoryStore.paginatedCategories;
  totalPages = this.categoryStore.totalPages;
  currentPage = this.categoryStore.currentPage;
  pageSize = this.categoryStore.pageSize;
  isLoading = this.categoryStore.isLoading;
  error = this.categoryStore.error;

  getCategories() {
    return this.categoryStore.loadCategories();
  }

  addCategory(category: Omit<Category, 'id' | 'createdAt' | 'modifiedAt'>) {
    return this.categoryStore.addCategory(category);
  }

  updateCategory(category: Category) {
    return this.categoryStore.updateCategory(category);
  }

  deleteCategory(id: number) {
    return this.categoryStore.deleteCategory(id);
  }

  setPage(page: number) {
    this.categoryStore.setPage(page);
  }

  setPageSize(pageSize: number) {
    this.categoryStore.setPageSize(pageSize);
  }

  setSearchQuery(query: string) {
    this.categoryStore.setSearchQuery(query);
  }

  sortCategories(field: string | null, direction: 'asc' | 'desc') {
    this.categoryStore.sortCategories(field, direction);
  }
}