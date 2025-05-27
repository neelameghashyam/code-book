import { Injectable, inject } from '@angular/core';
import { SubcategoryStore } from './subcategories.store';
import { Subcategory } from './subcategories';

@Injectable({ providedIn: 'root' })
export class SubcategoriesService {
  private subcategoryStore = inject(SubcategoryStore);

  subcategories = this.subcategoryStore.subcategories;
  filteredSubcategories = this.subcategoryStore.filteredSubcategories;
  paginatedSubcategories = this.subcategoryStore.paginatedSubcategories;
  totalPages = this.subcategoryStore.totalPages;
  currentPage = this.subcategoryStore.currentPage;
  pageSize = this.subcategoryStore.pageSize;
  isLoading = this.subcategoryStore.isLoading;
  error = this.subcategoryStore.error;
  selectedCategoryId = this.subcategoryStore.selectedCategoryId;

  getSubcategories() {
    return this.subcategoryStore.loadSubcategories();
  }

  addSubcategory(subcategory: Omit<Subcategory, 'id' | 'createdAt' | 'modifiedAt'>) {
    return this.subcategoryStore.addSubcategory(subcategory);
  }

  updateSubcategory(subcategory: Subcategory) {
    return this.subcategoryStore.updateSubcategory(subcategory);
  }

  deleteSubcategory(id: number) {
    return this.subcategoryStore.deleteSubcategory(id);
  }

  setPage(page: number) {
    this.subcategoryStore.setPage(page);
  }

  setPageSize(pageSize: number) {
    this.subcategoryStore.setPageSize(pageSize);
  }

  setSearchQuery(query: string) {
    this.subcategoryStore.setSearchQuery(query);
  }

  sortSubcategories(field: string | null, direction: 'asc' | 'desc') {
    this.subcategoryStore.sortSubcategories(field, direction);
  }

  setSelectedCategoryId(categoryId: number | null) {
    this.subcategoryStore.setSelectedCategoryId(categoryId);
  }
}