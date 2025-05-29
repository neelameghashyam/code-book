import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubcategoriesComponent } from './subcategories.component';
import { SubcategoriesService } from './subcategories.service';
import { CategoriesService } from '../categories/categories.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { Subcategory } from './subcategories';
import { Category } from '../categories/category';
import { AddSubcategoriesComponent } from './add-subcategories/add-subcategories.component';

// Mock dependencies
class MockSubcategoriesService {
  private subcategories: Subcategory[] = [
    { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' },
    { id: 2, name: 'Sub2', icon: 'heart', imageUrl: 'http://example.com/2.jpg', createdAt: '2023-01-03', modifiedAt: '2023-01-04', comments: 'Comment2', categoryId: 1, CategoryName: 'Cat1' }
  ];
  error = jest.fn().mockReturnValue(null);
  isLoading = jest.fn().mockReturnValue(false);
  paginatedSubcategories = jest.fn().mockReturnValue(this.subcategories);
  filteredSubcategories = jest.fn().mockReturnValue(this.subcategories);
  currentPage = jest.fn().mockReturnValue(1);
  pageSize = jest.fn().mockReturnValue(10);
  totalPages = jest.fn().mockReturnValue(1);
  setSelectedCategoryId = jest.fn();
  getSubcategories = jest.fn();
  addSubcategory = jest.fn();
  updateSubcategory = jest.fn();
  deleteSubcategory = jest.fn();
  setSearchQuery = jest.fn();
  setPage = jest.fn();
  sortSubcategories = jest.fn();
}

class MockCategoriesService {
  categories = jest.fn().mockReturnValue([
    { id: 1, name: 'Cat1' },
    { id: 2, name: 'Cat2' }
  ]);
  getCategories = jest.fn();
}

class MockMatDialog {
  open = jest.fn().mockReturnValue({ afterClosed: () => of(null) });
}

class MockResponsiveService {
  private breakpointSubject = new Subject<string>();
  currentBreakpoint = jest.fn().mockReturnValue(this.breakpointSubject.asObservable());
  isDesktop = jest.fn().mockReturnValue(true);
}

class MockDarkModeService {
  applyTheme = jest.fn();
  isDarkMode = jest.fn().mockReturnValue(false);
}

describe('SubcategoriesComponent', () => {
  let component: SubcategoriesComponent;
  let fixture: ComponentFixture<SubcategoriesComponent>;
  let mockSubcategoriesService: MockSubcategoriesService;
  let mockCategoriesService: MockCategoriesService;
  let mockDialog: MockMatDialog;
  let mockResponsiveService: MockResponsiveService;
  let mockDarkModeService: MockDarkModeService;

  beforeEach(async () => {
    mockSubcategoriesService = new MockSubcategoriesService();
    mockCategoriesService = new MockCategoriesService();
    mockDialog = new MockMatDialog();
    mockResponsiveService = new MockResponsiveService();
    mockDarkModeService = new MockDarkModeService();

    await TestBed.configureTestingModule({
      imports: [
        SubcategoriesComponent,
        CommonModule,
        FormsModule,
        MatTableModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatIconModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatCheckboxModule,
        MatMenuModule,
        MatSelectModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: SubcategoriesService, useValue: mockSubcategoriesService },
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ResponsiveService, useValue: mockResponsiveService },
        { provide: DarkModeService, useValue: mockDarkModeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubcategoriesComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in ngOnInit and set up subscriptions', () => {
    const breakpointSubject = new Subject<string>();
    mockResponsiveService.currentBreakpoint.mockReturnValue(breakpointSubject.asObservable());
    component.ngOnInit();

    expect(mockDarkModeService.applyTheme).toHaveBeenCalled();
    expect(mockCategoriesService.getCategories).toHaveBeenCalled();
    expect(mockCategoriesService.categories).toHaveBeenCalled();
    expect(mockSubcategoriesService.getSubcategories).toHaveBeenCalled();
    expect(component.displayedColumns).toContain('select');

    breakpointSubject.next('xsmall');
    expect(component.isMobile).toBe(true);
    expect(component.displayedColumns).toEqual(['name', 'icon', 'actions']);

    breakpointSubject.next('small');
    expect(component.isTablet).toBe(true);
    expect(component.displayedColumns).toContain('imageUrl');

    breakpointSubject.next('large');
    expect(component.isMobile).toBe(false);
    expect(component.isTablet).toBe(false);
    expect(component.displayedColumns).toContain('comments');
  });

  it('should unsubscribe in ngOnDestroy', () => {
    component.breakpointSubscription = { unsubscribe: jest.fn() } as any;
    component.ngOnDestroy();
    expect(component.breakpointSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should not unsubscribe in ngOnDestroy if subscription is undefined', () => {
    component.breakpointSubscription = undefined;
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('should update displayed columns for mobile', () => {
    component.isMobile = true;
    component.updateDisplayedColumns();
    expect(component.displayedColumns).toEqual(['name', 'icon', 'actions']);
  });

  it('should update displayed columns for tablet', () => {
    component.isTablet = true;
    component.updateDisplayedColumns();
    expect(component.displayedColumns).toEqual(['select', 'name', 'icon', 'imageUrl', 'CategoryName', 'actions']);
  });

  it('should update displayed columns for desktop', () => {
    component.isMobile = false;
    component.isTablet = false;
    component.updateDisplayedColumns();
    expect(component.displayedColumns).toEqual(['select', 'name', 'icon', 'imageUrl', 'CategoryName', 'createdAt', 'modifiedAt', 'comments', 'actions']);
  });

  it('should handle category change', () => {
    component.onCategoryChange(1);
    expect(component.selectedCategoryId).toBe(1);
    expect(mockSubcategoriesService.setSelectedCategoryId).toHaveBeenCalledWith(1);
    expect(component.selectedSubcategories).toEqual([]);
  });

  it('should handle null category change', () => {
    component.onCategoryChange(null);
    expect(component.selectedCategoryId).toBe(null);
    expect(mockSubcategoriesService.setSelectedCategoryId).toHaveBeenCalledWith(null);
    expect(component.selectedSubcategories).toEqual([]);
  });

  it('should refresh table', () => {
    const searchInput = { value: '' } as HTMLInputElement;
    jest.spyOn(document, 'getElementById').mockReturnValue(searchInput);
    component.sortField = 'name';
    component.selectedSubcategories = [{ id: 1 } as Subcategory];

    component.refreshTable();

    expect(component.sortField).toBe(null);
    expect(component.sortDirection).toBe('asc');
    expect(mockSubcategoriesService.sortSubcategories).toHaveBeenCalledWith(null, 'asc');
    expect(mockSubcategoriesService.setPage).toHaveBeenCalledWith(1);
    expect(mockSubcategoriesService.setSearchQuery).toHaveBeenCalledWith('');
    expect(component.selectedSubcategories).toEqual([]);
    expect(searchInput.value).toBe('');
    expect(mockSubcategoriesService.getSubcategories).toHaveBeenCalled();
  });

  it('should alert when opening add dialog with no category selected', () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    component.selectedCategoryId = null;
    component.openAddSubcategoryDialog();
    expect(window.alert).toHaveBeenCalledWith('Please select a category first.');
    expect(mockDialog.open).not.toHaveBeenCalled();
  });

  it('should open add subcategory dialog with selected category', () => {
    component.selectedCategoryId = 1;
    component.categories = [{
      id: 1, name: 'Cat1',
      icon: '',
      imageUrl: '',
      createdAt: '',
      modifiedAt: '',
      comments: ''
    }];
    component.isMobile = false;
    component.isTablet = false;

    component.openAddSubcategoryDialog();

    expect(mockDialog.open).toHaveBeenCalledWith(AddSubcategoriesComponent, {
      width: '800px',
      maxWidth: '100vw',
      data: { categoryId: 1, CategoryName: 'Cat1' }
    });
  });

  it('should open add subcategory dialog with mobile width', () => {
    component.selectedCategoryId = 1;
    component.categories = [{
      id: 1, name: 'Cat1',
      icon: '',
      imageUrl: '',
      createdAt: '',
      modifiedAt: '',
      comments: ''
    }];
    component.isMobile = true;

    component.openAddSubcategoryDialog();

    expect(mockDialog.open).toHaveBeenCalledWith(AddSubcategoriesComponent, {
      width: '90vw',
      maxWidth: '100vw',
      data: { categoryId: 1, CategoryName: 'Cat1' }
    });
  });

  it('should open add subcategory dialog with tablet width', () => {
    component.selectedCategoryId = 1;
    component.categories = [{
      id: 1, name: 'Cat1',
      icon: '',
      imageUrl: '',
      createdAt: '',
      modifiedAt: '',
      comments: ''
    }];
    component.isMobile = false;
    component.isTablet = true;

    component.openAddSubcategoryDialog();

    expect(mockDialog.open).toHaveBeenCalledWith(AddSubcategoriesComponent, {
      width: '80vw',
      maxWidth: '100vw',
      data: { categoryId: 1, CategoryName: 'Cat1' }
    });
  });

  it('should handle add subcategory dialog result', () => {
    component.selectedCategoryId = 1;
    component.categories = [{
      id: 1, name: 'Cat1',
      icon: '',
      imageUrl: '',
      createdAt: '',
      modifiedAt: '',
      comments: ''
    }];
    const dialogRef = { afterClosed: jest.fn().mockReturnValue(of({ name: 'NewSub' })) };
    mockDialog.open.mockReturnValue(dialogRef);

    component.openAddSubcategoryDialog();

    expect(mockSubcategoriesService.addSubcategory).toHaveBeenCalledWith({ name: 'NewSub' });
  });

  it('should open edit subcategory dialog', () => {
    const subcategory: Subcategory = { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' };
    component.startEdit(subcategory);

    expect(component.editingSubcategory).toEqual(subcategory);
    expect(mockDialog.open).toHaveBeenCalledWith(AddSubcategoriesComponent, {
      width: '800px',
      maxWidth: '100vw',
      data: { subcategory, categoryId: 1, CategoryName: 'Cat1' }
    });
  });

  it('should handle edit subcategory dialog result', () => {
    const subcategory: Subcategory = { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' };
    const dialogRef = { afterClosed: jest.fn().mockReturnValue(of({ ...subcategory, name: 'UpdatedSub' })) };
    mockDialog.open.mockReturnValue(dialogRef);

    component.startEdit(subcategory);

    expect(mockSubcategoriesService.updateSubcategory).toHaveBeenCalledWith({ ...subcategory, name: 'UpdatedSub' });
    expect(component.editingSubcategory).toBe(null);
  });

  it('should handle search query change', () => {
    const event = { target: { value: 'test' } } as any;
    component.onSearchQueryChange(event);
    expect(mockSubcategoriesService.setSearchQuery).toHaveBeenCalledWith('test');
  });

  it('should handle page change', () => {
    component.onPageChange({ page: 2 });
    expect(mockSubcategoriesService.setPage).toHaveBeenCalledWith(2);
    expect(component.selectedSubcategories).toEqual([]);
  });

  it('should sort column', () => {
    component.sortColumn('name', 'asc');
    expect(component.sortField).toBe('name');
    expect(component.sortDirection).toBe('asc');
    expect(mockSubcategoriesService.sortSubcategories).toHaveBeenCalledWith('name', 'asc');
  });

  it('should toggle subcategory selection', () => {
    const subcategory: Subcategory = { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' };
    component.toggleSubcategory(subcategory);
    expect(component.selectedSubcategories).toContain(subcategory);

    component.toggleSubcategory(subcategory);
    expect(component.selectedSubcategories).not.toContain(subcategory);
  });

  it('should check if subcategory is selected', () => {
    const subcategory: Subcategory = { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' };
    component.selectedSubcategories = [subcategory];
    expect(component.isSelected(subcategory)).toBe(true);

    component.selectedSubcategories = [];
    expect(component.isSelected(subcategory)).toBe(false);
  });

  it('should toggle all subcategories', () => {
    const subcategories = [
      { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' },
      { id: 2, name: 'Sub2', icon: 'heart', imageUrl: 'http://example.com/2.jpg', createdAt: '2023-01-03', modifiedAt: '2023-01-04', comments: 'Comment2', categoryId: 1, CategoryName: 'Cat1' }
    ];
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue(subcategories);

    component.toggleAllSubcategories(true);
    expect(component.selectedSubcategories).toEqual(subcategories);

    component.toggleAllSubcategories(false);
    expect(component.selectedSubcategories).toEqual([]);
  });

  it('should check if all subcategories are selected', () => {
    const subcategories = [
      { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' },
      { id: 2, name: 'Sub2', icon: 'heart', imageUrl: 'http://example.com/2.jpg', createdAt: '2023-01-03', modifiedAt: '2023-01-04', comments: 'Comment2', categoryId: 1, CategoryName: 'Cat1' }
    ];
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue(subcategories);
    component.selectedSubcategories = [subcategories[0]];
    expect(component.isAllSelected()).toBe(false);

    component.selectedSubcategories = subcategories;
    expect(component.isAllSelected()).toBe(true);

    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([]);
    expect(component.isAllSelected()).toBe(false);
  });

  it('should delete selected subcategories', () => {
    const subcategories = [
      { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' },
      { id: 2, name: 'Sub2', icon: 'heart', imageUrl: 'http://example.com/2.jpg', createdAt: '2023-01-03', modifiedAt: '2023-01-04', comments: 'Comment2', categoryId: 1, CategoryName: 'Cat1' }
    ];
    component.selectedSubcategories = subcategories;

    component.deleteSelectedSubcategories();

    expect(mockSubcategoriesService.deleteSubcategory).toHaveBeenCalledWith(1);
    expect(mockSubcategoriesService.deleteSubcategory).toHaveBeenCalledWith(2);
    expect(component.selectedSubcategories).toEqual([]);
  });

  it('should get page numbers for pagination', () => {
    mockSubcategoriesService.totalPages.mockReturnValue(5);
    mockSubcategoriesService.currentPage.mockReturnValue(3);
    component.isMobile = false;
    component.isTablet = false;

    expect(component.getPageNumbers()).toEqual([1, 2, 3, 4, 5]);

    component.isMobile = true;
    expect(component.getPageNumbers()).toEqual([2, 3, 4]);

    mockSubcategoriesService.totalPages.mockReturnValue(0);
    expect(component.getPageNumbers()).toEqual([]);
  });

  it('should track subcategories by id', () => {
    const subcategory: Subcategory = { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' };
    expect(component.trackById(0, subcategory)).toBe(1);
  });

  it('should display error message when service.error is truthy', () => {
    mockSubcategoriesService.error.mockReturnValue('Test error');
    fixture.detectChanges();

    const errorDiv = fixture.debugElement.nativeElement.querySelector('.mb-16.p-16.rounded-8');
    expect(errorDiv.textContent).toContain('Error: Test error');
  });

  it('should display loading spinner when service.isLoading is true', () => {
    mockSubcategoriesService.isLoading.mockReturnValue(true);
    fixture.detectChanges();

    const spinner = fixture.debugElement.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should apply dark-theme class when darkModeService.isDarkMode is true', () => {
    mockDarkModeService.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();

    const tableContainer = fixture.debugElement.nativeElement.querySelector('.table-container');
    expect(tableContainer.classList).toContain('dark-theme');
  });

  it('should handle category select change', () => {
    const spy = jest.spyOn(component, 'onCategoryChange');
    component.selectedCategoryId = 1;
    fixture.detectChanges();

    const select = fixture.debugElement.nativeElement.querySelector('mat-select');
    select.dispatchEvent(new Event('selectionChange'));
    expect(spy).toHaveBeenCalled();
  });

  it('should handle search input change', () => {
    const spy = jest.spyOn(component, 'onSearchQueryChange');
    fixture.detectChanges();

    const input = fixture.debugElement.nativeElement.querySelector('#searchSubcategories');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalled();
  });

  it('should handle delete selected button click', () => {
    const spy = jest.spyOn(component, 'deleteSelectedSubcategories');
    component.selectedSubcategories = [{ id: 1 } as Subcategory];
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Delete selected subcategories"]');
    deleteButton.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should disable delete button when no subcategories are selected', () => {
    component.selectedSubcategories = [];
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Delete selected subcategories"]');
    expect(deleteButton.disabled).toBe(true);
  });

  it('should handle add subcategory button click', () => {
    const spy = jest.spyOn(component, 'openAddSubcategoryDialog');
    fixture.detectChanges();

    const addButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Add new subcategory"]');
    addButton.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle refresh button click', () => {
    const spy = jest.spyOn(component, 'refreshTable');
    fixture.detectChanges();

    const refreshButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Refresh table"]');
    refreshButton.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle edit button click', () => {
    const subcategory: Subcategory = { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' };
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([subcategory]);
    const spy = jest.spyOn(component, 'startEdit');
    fixture.detectChanges();

    const editButton = fixture.debugElement.nativeElement.querySelector('.edit-button');
    editButton.click();
    expect(spy).toHaveBeenCalledWith(subcategory);
  });

  it('should handle delete button click', () => {
    const subcategory: Subcategory = { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' };
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([subcategory]);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.nativeElement.querySelector('.delete-button');
    deleteButton.click();
    expect(mockSubcategoriesService.deleteSubcategory).toHaveBeenCalledWith(1);
  });

  it('should handle mobile actions menu', () => {
    component.isMobile = true;
    const subcategory: Subcategory = { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' };
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([subcategory]);
    const startEditSpy = jest.spyOn(component, 'startEdit');
    fixture.detectChanges();

    const menuButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Subcategory actions"]');
    menuButton.click();
    fixture.detectChanges();

    const editMenuItem = fixture.debugElement.nativeElement.querySelector('button[aria-label="Edit subcategory"]');
    editMenuItem.click();
    expect(startEditSpy).toHaveBeenCalledWith(subcategory);
  });

  it('should handle sort menu click', () => {
    const spy = jest.spyOn(component, 'sortColumn');
    fixture.detectChanges();

    const sortButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Sort name"]');
    sortButton.click();
    fixture.detectChanges();

    const ascMenuItem = fixture.debugElement.nativeElement.querySelector('button[mat-menu-item]');
    ascMenuItem.click();
    expect(spy).toHaveBeenCalledWith('name', 'asc');
  });

  it('should handle toggle all checkbox', () => {
    const spy = jest.spyOn(component, 'toggleAllSubcategories');
    fixture.detectChanges();

    const checkbox = fixture.debugElement.nativeElement.querySelector('mat-checkbox');
    checkbox.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle toggle subcategory checkbox', () => {
    const subcategory: Subcategory = { id: 1, name: 'Sub1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1', categoryId: 1, CategoryName: 'Cat1' };
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([subcategory]);
    const spy = jest.spyOn(component, 'toggleSubcategory');
    fixture.detectChanges();

    const checkbox = fixture.debugElement.nativeElement.querySelector('mat-checkbox[aria-label="Select subcategory"]');
    checkbox.click();
    expect(spy).toHaveBeenCalledWith(subcategory);
  });

  it('should handle previous page button', () => {
    const spy = jest.spyOn(component, 'onPageChange');
    mockSubcategoriesService.currentPage.mockReturnValue(2);
    fixture.detectChanges();

    const prevButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Previous page"]');
    prevButton.click();
    expect(spy).toHaveBeenCalledWith({ page: 1 });
  });

  it('should disable previous page button on first page', () => {
    mockSubcategoriesService.currentPage.mockReturnValue(1);
    fixture.detectChanges();

    const prevButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Previous page"]');
    expect(prevButton.disabled).toBe(true);
  });

  it('should handle next page button', () => {
    const spy = jest.spyOn(component, 'onPageChange');
    mockSubcategoriesService.currentPage.mockReturnValue(1);
    mockSubcategoriesService.totalPages.mockReturnValue(2);
    fixture.detectChanges();

    const nextButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Next page"]');
    nextButton.click();
    expect(spy).toHaveBeenCalledWith({ page: 2 });
  });

  it('should disable next page button on last page', () => {
    mockSubcategoriesService.currentPage.mockReturnValue(1);
    mockSubcategoriesService.totalPages.mockReturnValue(1);
    fixture.detectChanges();

    const nextButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Next page"]');
    expect(nextButton.disabled).toBe(true);
  });

  it('should handle page number button click', () => {
    const spy = jest.spyOn(component, 'onPageChange');
    mockSubcategoriesService.totalPages.mockReturnValue(3);
    mockSubcategoriesService.currentPage.mockReturnValue(1);
    fixture.detectChanges();

    const pageButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Page 2"]');
    pageButton.click();
    expect(spy).toHaveBeenCalledWith({ page: 2 });
  });

  it('should handle mobile page select', () => {
    const spy = jest.spyOn(component, 'onPageChange');
    component.isMobile = true;
    mockSubcategoriesService.totalPages.mockReturnValue(3);
    fixture.detectChanges();

    const select = fixture.debugElement.nativeElement.querySelector('mat-select[aria-label="Select page"]');
    select.dispatchEvent(new Event('selectionChange'));
    expect(spy).toHaveBeenCalled();
  });

  it('should display no pages message when no pages are available', () => {
    mockSubcategoriesService.totalPages.mockReturnValue(0);
    fixture.detectChanges();

    const noPagesSpan = fixture.debugElement.nativeElement.querySelector('.text-sm');
    expect(noPagesSpan.textContent).toBe('No pages available');
  });
});