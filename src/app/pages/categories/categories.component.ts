import { Component, inject, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CategoriesService } from './categories.service';
import { Category } from './category';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { AddCategoriesComponent } from './add-categories/add-categories.component';
import { DarkModeService } from '../../services/dark-mode.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-categories',
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
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit, OnDestroy {
  service = inject(CategoriesService);
  dialog = inject(MatDialog);
  responsive = inject(ResponsiveService);
  darkModeService = inject(DarkModeService);

  editingCategory: Category | null = null;
  selectedCategories: Category[] = [];
  displayedColumns: string[] = [];
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  isMobile: boolean = false;
  isTablet: boolean = false;
  breakpointSubscription: Subscription | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.breakpointSubscription = this.responsive.currentBreakpoint().subscribe(breakpoint => {
      this.isMobile = breakpoint === 'xsmall';
      this.isTablet = breakpoint === 'small' || breakpoint === 'medium';
      this.updateDisplayedColumns();
    });
    this.darkModeService.applyTheme();
  }

  ngOnDestroy() {
    this.breakpointSubscription?.unsubscribe();
  }

  updateDisplayedColumns() {
    if (this.isMobile) {
      this.displayedColumns = ['name', 'icon', 'actions'];
    } else if (this.isTablet) {
      this.displayedColumns = ['select', 'name', 'icon', 'imageUrl', 'actions'];
    } else {
      this.displayedColumns = ['select', 'name', 'icon', 'imageUrl', 'createdAt', 'modifiedAt', 'comments', 'actions'];
    }
  }

  refreshTable() {
    this.sortField = null;
    this.sortDirection = 'asc';
    this.service.sortCategories(null, 'asc');
    this.service.setPage(1);
    this.service.setSearchQuery('');
    this.selectedCategories = [];
    const searchInput = document.getElementById('searchCategories') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    this.service.getCategories();
  }

  private openCategoryDialog(config: MatDialogConfig) {
    const dialogWidth = this.isMobile ? '90vw' : this.isTablet ? '80vw' : '800px';
    const defaultConfig: MatDialogConfig = {
      width: dialogWidth,
      maxWidth: '100vw',
      disableClose: false,
      hasBackdrop: true,
    };
    return this.dialog.open(AddCategoriesComponent, { ...defaultConfig, ...config });
  }

  openAddCategoryDialog() {
    this.openCategoryDialog({ data: {} }).afterClosed().subscribe(result => {
      if (result) this.service.addCategory(result);
    });
  }

  startEdit(category: Category) {
    this.editingCategory = { ...category };
    this.openCategoryDialog({ data: { category: this.editingCategory } }).afterClosed().subscribe(result => {
      if (result) this.service.updateCategory(result as Category);
      this.editingCategory = null;
    });
  }

  onSearchQueryChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.service.setSearchQuery(inputElement.value);
  }

  onPageChange(event: any) {
    this.service.setPage(event.pageIndex + 1);
    this.selectedCategories = [];
  }

  sortColumn(field: string, direction: 'asc' | 'desc') {
    this.sortField = field;
    this.sortDirection = direction;
    this.service.sortCategories(this.sortField, this.sortDirection);
  }

  toggleCategory(category: Category) {
    const index = this.selectedCategories.findIndex(c => c.id === category.id);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
  }

  isSelected(category: Category): boolean {
    return this.selectedCategories.some(c => c.id === category.id);
  }

  toggleAllCategories(checked: boolean) {
    if (checked) {
      this.selectedCategories = [...this.service.paginatedCategories()];
    } else {
      this.selectedCategories = [];
    }
  }

  isAllSelected(): boolean {
    return this.service.paginatedCategories().length > 0 &&
           this.service.paginatedCategories().every(category => this.isSelected(category));
  }

  deleteSelectedCategories() {
    this.selectedCategories.forEach(category => this.service.deleteCategory(category.id));
    this.selectedCategories = [];
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

  trackById(index: number, category: Category | null): number | undefined {
    return category ? category.id : undefined;
  }
}