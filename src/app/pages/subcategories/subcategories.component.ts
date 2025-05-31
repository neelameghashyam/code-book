import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SubcategoriesService } from './subcategories.service';
import { CategoriesService } from '../categories/categories.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { Subcategory } from './subcategories';
import { Category } from '../categories/category';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AddSubcategoriesComponent } from './add-subcategories/add-subcategories.component';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-subcategories',
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
  standalone: true
})
export class SubcategoriesComponent implements OnInit, OnDestroy {
  subcategories: Subcategory[] = [];
  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  displayedColumns: string[] = [];
  selectedSubcategories: Subcategory[] = [];
  editingSubcategory: Subcategory | null = null;
  sortField: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  isMobile = false;
  isTablet = false;
  breakpointSubscription: Subscription | undefined;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    public subcategoriesService: SubcategoriesService,
    private categoriesService: CategoriesService,
    private dialog: MatDialog,
    private responsiveService: ResponsiveService,
    public darkModeService: DarkModeService
  ) {}

  ngOnInit(): void {
    this.darkModeService.applyTheme();
    this.categoriesService.getCategories();
    this.categories = this.categoriesService.categories();
    this.subcategoriesService.getSubcategories();
    this.breakpointSubscription = this.responsiveService.currentBreakpoint().subscribe(breakpoint => {
      this.isMobile = breakpoint === 'xsmall';
      this.isTablet = breakpoint === 'small';
      this.updateDisplayedColumns();
    });
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }

  updateDisplayedColumns(): void {
    if (this.isMobile) {
      this.displayedColumns = ['name', 'icon', 'actions'];
    } else if (this.isTablet) {
      this.displayedColumns = ['select', 'name', 'icon', 'imageUrl', 'CategoryName', 'actions'];
    } else {
      this.displayedColumns = ['select', 'name', 'icon', 'imageUrl', 'CategoryName', 'createdAt', 'modifiedAt', 'comments', 'actions'];
    }
  }

  onCategoryChange(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
    this.subcategoriesService.setSelectedCategoryId(categoryId);
    this.selectedSubcategories = [];
  }

  refreshTable(): void {
    this.sortField = null;
    this.sortDirection = 'asc';
    this.subcategoriesService.sortSubcategories(null, 'asc');
    this.subcategoriesService.setPage(1);
    this.subcategoriesService.setSearchQuery('');
    this.selectedSubcategories = [];
    const searchInput = document.getElementById('searchSubcategories') as HTMLInputElement | null;
    if (searchInput) {
      searchInput.value = '';
    }
    this.subcategoriesService.getSubcategories();
  }

  openAddSubcategoryDialog(): void {
  if (!this.selectedCategoryId) {
    console.warn('Please select a category first.');
    return;
  }
  const dialogWidth = this.isMobile ? '90vw' : this.isTablet ? '80vw' : '800px';
  const category = this.categories.find(c => c.id === this.selectedCategoryId);
  if (!category) {
    console.warn('Selected category not found.');
    return;
  }
  const dialogRef = this.dialog.open(AddSubcategoriesComponent, {
    width: dialogWidth,
    maxWidth: '100vw',
    data: { categoryId: this.selectedCategoryId, CategoryName: category.name }
  });

  dialogRef.afterClosed().subscribe(result => result && this.subcategoriesService.addSubcategory(result));
}

startEdit(subcategory: Subcategory): void {
  this.editingSubcategory = { ...subcategory };
  const dialogWidth = this.isMobile ? '90vw' : this.isTablet ? '80vw' : '800px';
  const dialogRef = this.dialog.open(AddSubcategoriesComponent, {
    width: dialogWidth,
    maxWidth: '100vw',
    data: { subcategory: this.editingSubcategory, categoryId: subcategory.categoryId, CategoryName: subcategory.CategoryName }
  });

  dialogRef.afterClosed().subscribe(result => {
    result && this.subcategoriesService.updateSubcategory(result);
    this.editingSubcategory = null;
  });
}

  onSearchQueryChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.subcategoriesService.setSearchQuery(query);
  }

  onPageChange(event: { page: number }): void {
    this.subcategoriesService.setPage(event.page);
    this.selectedSubcategories = [];
  }

  sortColumn(field: string, direction: 'asc' | 'desc'): void {
    this.sortField = field;
    this.sortDirection = direction;
    this.subcategoriesService.sortSubcategories(field, direction);
  }

  toggleSubcategory(subcategory: Subcategory): void {
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

  toggleAllSubcategories(checked: boolean): void {
    this.selectedSubcategories = checked ? [...this.subcategoriesService.paginatedSubcategories()] : [];
  }

  isAllSelected(): boolean {
    const paginated = this.subcategoriesService.paginatedSubcategories();
    return paginated.length > 0 && this.selectedSubcategories.length === paginated.length;
  }

  deleteSelectedSubcategories(): void {
    this.selectedSubcategories.forEach(subcategory => {
      this.subcategoriesService.deleteSubcategory(subcategory.id);
    });
    this.selectedSubcategories = [];
  }

  deleteSubcategory(id: number): void {
    this.subcategoriesService.deleteSubcategory(id);
  }

  getPageNumbers(): number[] {
    const totalPages = this.subcategoriesService.totalPages();
    const currentPage = this.subcategoriesService.currentPage();
    if (totalPages === 0) return [];
    if (this.isMobile) {
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages, currentPage + 1);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  trackById(index: number, item: Subcategory): number {
    return item.id;
  }
}