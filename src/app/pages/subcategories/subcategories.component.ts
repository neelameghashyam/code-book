import { Component, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { SubcategoriesService } from './subcategories.service';
import { Subcategory } from './subcategories';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/category';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { AddSubcategoriesComponent } from './add-subcategories/add-subcategories.component';
import { DarkModeService } from '../../services/dark-mode.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subcategories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatIcon,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatCheckboxModule,
    MatMenuModule,
    MatSelectModule,
  ],
  templateUrl: './subcategories.component.html',
  styleUrls: ['./subcategories.component.scss'],
})
export class SubcategoriesComponent implements OnInit, OnDestroy {
  service = inject(SubcategoriesService);
  categoryService = inject(CategoriesService);
  dialog = inject(MatDialog);
  responsive = inject(ResponsiveService);
  darkModeService = inject(DarkModeService);

  editingSubcategory: Subcategory | null = null;
  selectedSubcategories: Subcategory[] = [];
  displayedColumns: string[] = [];
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  isMobile: boolean = false;
  isTablet: boolean = false;
  breakpointSubscription: Subscription | undefined;
  categories: Category[] = [];
  selectedCategoryId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.breakpointSubscription = this.responsive.currentBreakpoint().subscribe(breakpoint => {
      this.isMobile = breakpoint === 'xsmall';
      this.isTablet = breakpoint === 'small' || breakpoint === 'medium';
      this.updateDisplayedColumns();
    });
    this.darkModeService.applyTheme();
    this.categoryService.getCategories();
    this.categories = this.categoryService.categories();
    this.service.getSubcategories();
  }

  ngOnDestroy() {
    this.breakpointSubscription?.unsubscribe();
  }

  updateDisplayedColumns() {
    if (this.isMobile) {
      this.displayedColumns = ['name', 'icon', 'actions'];
    } else if (this.isTablet) {
      this.displayedColumns = ['select', 'name', 'icon', 'imageUrl', 'CategoryName', 'actions'];
    } else {
      this.displayedColumns = ['select', 'name', 'icon', 'imageUrl', 'CategoryName', 'createdAt', 'modifiedAt', 'comments', 'actions'];
    }
  }

  onCategoryChange(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    this.service.setSelectedCategoryId(categoryId);
    this.selectedSubcategories = [];
  }

  refreshTable() {
    this.sortField = null;
    this.sortDirection = 'asc';
    this.service.sortSubcategories(null, 'asc');
    this.service.setPage(1);
    this.service.setSearchQuery('');
    this.selectedSubcategories = [];
    const searchInput = document.getElementById('searchSubcategories') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    this.service.getSubcategories();
  }

 openAddSubcategoryDialog() {
  if (!this.selectedCategoryId || !this.categories.find(c => c.id === this.selectedCategoryId)) {
    console.warn('Please select a valid category.');
    return;
  }
  const dialogWidth = this.isMobile ? '90vw' : this.isTablet ? '80vw' : '800px';
  const category = this.categories.find(c => c.id === this.selectedCategoryId)!;
  this.dialog.open(AddSubcategoriesComponent, {
    width: dialogWidth,
    maxWidth: '100vw',
    data: { categoryId: this.selectedCategoryId, CategoryName: category.name }
  }).afterClosed().subscribe(result => result && this.service.addSubcategory(result));
}

startEdit(subcategory: Subcategory) {
  this.editingSubcategory = { ...subcategory };
  const dialogWidth = this.isMobile ? '90vw' : this.isTablet ? '80vw' : '800px';
  this.dialog.open(AddSubcategoriesComponent, {
    width: dialogWidth,
    maxWidth: '100vw',
    data: { subcategory: this.editingSubcategory, categoryId: subcategory.categoryId, CategoryName: subcategory.CategoryName }
  }).afterClosed().subscribe(result => {
    if (result) this.service.updateSubcategory(result as Subcategory);
    this.editingSubcategory = null;
  });
}

  onSearchQueryChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.service.setSearchQuery(inputElement.value);
  }

  onPageChange(event: any) {
    this.service.setPage(event.page + 1);
    this.selectedSubcategories = [];
  }

  sortColumn(field: string, direction: 'asc' | 'desc') {
    this.sortField = field;
    this.sortDirection = direction;
    this.service.sortSubcategories(this.sortField, this.sortDirection);
  }

  toggleSubcategory(subcategory: Subcategory) {
    const index = this.selectedSubcategories.findIndex(s => s.id === subcategory.id);
    if (index === -1) {
      this.selectedSubcategories.push(subcategory);
    } else {
      this.selectedSubcategories.splice(index, 1);
    }
  }

  isSelected(subcategory: Subcategory): boolean {
    return this.selectedSubcategories.some(s => s.id === subcategory.id);
  }

  toggleAllSubcategories(checked: boolean) {
    if (checked) {
      this.selectedSubcategories = [...this.service.paginatedSubcategories()];
    } else {
      this.selectedSubcategories = [];
    }
  }

  isAllSelected(): boolean {
    return this.service.paginatedSubcategories().length > 0 &&
           this.service.paginatedSubcategories().every(subcategory => this.isSelected(subcategory));
  }

  deleteSelectedSubcategories() {
    this.selectedSubcategories.forEach(subcategory => this.deleteSubcategory(subcategory.id));
    this.selectedSubcategories = [];
  }

  deleteSubcategory(subcategoryId: number) {
    this.service.deleteSubcategory(subcategoryId);
  }

  getPageNumbers(): number[] {
    const totalPages = this.service.totalPages();
    const currentPage = this.service.currentPage();
    const maxPagesToShow = this.isMobile ? 3 : this.isTablet ? 4 : 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    const pages: number[] = [];
    if (totalPages > 0) {
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  }

  trackById(index: number, subcategory: Subcategory): number {
    return subcategory.id;
  }
}