import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategoriesComponent } from './categories.component';
import { CategoriesService } from './categories.service';
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
import { Category } from './category';
import { AddCategoriesComponent } from './add-categories/add-categories.component';

// Mock dependencies
class MockCategoriesService {
  private categories: Category[] = [
    { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    { id: 2, name: 'Cat2', icon: 'heart', imageUrl: 'http://example.com/2.jpg', createdAt: '2023-01-03', modifiedAt: '2023-01-04', comments: 'Comment2' },
  ];
  error = jest.fn().mockReturnValue(null);
  isLoading = jest.fn().mockReturnValue(false);
  paginatedCategories = jest.fn().mockReturnValue(this.categories);
  filteredCategories = jest.fn().mockReturnValue(this.categories);
  currentPage = jest.fn().mockReturnValue(1);
  pageSize = jest.fn().mockReturnValue(10);
  totalPages = jest.fn().mockReturnValue(1);
  getCategories = jest.fn();
  addCategory = jest.fn();
  updateCategory = jest.fn();
  deleteCategory = jest.fn();
  setSearchQuery = jest.fn();
  setPage = jest.fn();
  sortCategories = jest.fn();
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

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let mockCategoriesService: MockCategoriesService;
  let mockDialog: MockMatDialog;
  let mockResponsiveService: MockResponsiveService;
  let mockDarkModeService: MockDarkModeService;
  let breakpointSubject: Subject<string>;

  beforeEach(async () => {
    mockCategoriesService = new MockCategoriesService();
    mockDialog = new MockMatDialog();
    mockResponsiveService = new MockResponsiveService();
 mockDarkModeService = new MockDarkModeService();
    breakpointSubject = new Subject<string>();
    mockResponsiveService.currentBreakpoint.mockReturnValue(breakpointSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [
        CategoriesComponent,
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
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ResponsiveService, useValue: mockResponsiveService },
        { provide: DarkModeService, useValue: mockDarkModeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in ngOnInit and set up subscriptions', () => {
    component.ngOnInit();
    expect(mockDarkModeService.applyTheme).toHaveBeenCalled();
    expect(component.breakpointSubscription).toBeDefined();

    breakpointSubject.next('xsmall');
    fixture.detectChanges();
    expect(component.isMobile).toBe(true);
    expect(component.displayedColumns).toEqual(['name', 'icon', 'actions']);

    breakpointSubject.next('small');
    fixture.detectChanges();
    expect(component.isTablet).toBe(true);
    expect(component.displayedColumns).toEqual(['select', 'name', 'icon', 'imageUrl', 'actions']);

    breakpointSubject.next('large');
    fixture.detectChanges();
    expect(component.isMobile).toBe(false);
    expect(component.isTablet).toBe(false);
    expect(component.displayedColumns).toEqual(['select', 'name', 'icon', 'imageUrl', 'createdAt', 'modifiedAt', 'comments', 'actions']);
  });

  it('should unsubscribe in ngOnDestroy', () => {
    component.breakpointSubscription = { unsubscribe: jest.fn() } as any;
    component.ngOnDestroy();
    expect(component.breakpointSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should not throw error if breakpointSubscription is undefined in ngOnDestroy', () => {
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
    expect(component.displayedColumns).toEqual(['select', 'name', 'icon', 'imageUrl', 'actions']);
  });

  it('should update displayed columns for desktop', () => {
    component.isMobile = false;
    component.isTablet = false;
    component.updateDisplayedColumns();
    expect(component.displayedColumns).toEqual(['select', 'name', 'icon', 'imageUrl', 'createdAt', 'modifiedAt', 'comments', 'actions']);
  });

  it('should refresh table', fakeAsync(() => {
    const searchInput = { value: 'test' } as HTMLInputElement;
    jest.spyOn(document, 'getElementById').mockReturnValue(searchInput);
    component.sortField = 'name';
    component.sortDirection = 'desc';
    component.selectedCategories = [{ id: 1 } as Category];

    component.refreshTable();
    tick();

    expect(component.sortField).toBe(null);
    expect(component.sortDirection).toBe('asc');
    expect(mockCategoriesService.sortCategories).toHaveBeenCalledWith(null, 'asc');
    expect(mockCategoriesService.setPage).toHaveBeenCalledWith(1);
    expect(mockCategoriesService.setSearchQuery).toHaveBeenCalledWith('');
    expect(component.selectedCategories).toEqual([]);
    expect(searchInput.value).toBe('');
    expect(mockCategoriesService.getCategories).toHaveBeenCalled();
  }));

  it('should handle refresh table when search input is not found', () => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    component.sortField = 'name';
    component.selectedCategories = [{ id: 1 } as Category];

    component.refreshTable();

    expect(component.sortField).toBe(null);
    expect(mockCategoriesService.getCategories).toHaveBeenCalled();
  });

  it('should open add category dialog', fakeAsync(() => {
    component.isMobile = false;
    component.isTablet = false;
    const dialogRef = { afterClosed: jest.fn().mockReturnValue(of({ name: 'NewCat' })) };
    mockDialog.open.mockReturnValue(dialogRef);

    component.openAddCategoryDialog();
    tick();

    expect(mockDialog.open).toHaveBeenCalledWith(AddCategoriesComponent, {
      width: '800px',
      maxWidth: '100vw',
      data: {},
    });
    expect(mockCategoriesService.addCategory).toHaveBeenCalledWith({ name: 'NewCat' });
  }));

  it('should open add category dialog with mobile width', fakeAsync(() => {
    component.isMobile = true;
    component.openAddCategoryDialog();
    tick();

    expect(mockDialog.open).toHaveBeenCalledWith(AddCategoriesComponent, {
      width: '90vw',
      maxWidth: '100vw',
      data: {},
    });
  }));

  it('should open add category dialog with tablet width', fakeAsync(() => {
    component.isMobile = false;
    component.isTablet = true;
    component.openAddCategoryDialog();
    tick();

    expect(mockDialog.open).toHaveBeenCalledWith(AddCategoriesComponent, {
      width: '80vw',
      maxWidth: '100vw',
      data: {},
    });
  }));

  it('should handle add category dialog with no result', fakeAsync(() => {
    const dialogRef = { afterClosed: jest.fn().mockReturnValue(of(null)) };
    mockDialog.open.mockReturnValue(dialogRef);

    component.openAddCategoryDialog();
    tick();

    expect(mockCategoriesService.addCategory).not.toHaveBeenCalled();
  }));

  it('should open edit category dialog', fakeAsync(() => {
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'star',
      imageUrl: 'http://example.com/1.jpg',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02',
      comments: 'Comment1',
    };
    const dialogRef = { afterClosed: jest.fn().mockReturnValue(of({ ...category, name: 'UpdatedCat' })) };
    mockDialog.open.mockReturnValue(dialogRef);

    component.startEdit(category);
    tick();

    expect(component.editingCategory).toEqual(category);
    expect(mockDialog.open).toHaveBeenCalledWith(AddCategoriesComponent, {
      width: '800px',
      maxWidth: '100vw',
      data: { category },
    });
    expect(mockCategoriesService.updateCategory).toHaveBeenCalledWith({ ...category, name: 'UpdatedCat' });
    expect(component.editingCategory).toBe(null);
  }));

  it('should handle edit category dialog with no result', fakeAsync(() => {
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'star',
      imageUrl: 'http://example.com/1.jpg',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02',
      comments: 'Comment1',
    };
    const dialogRef = { afterClosed: jest.fn().mockReturnValue(of(null)) };
    mockDialog.open.mockReturnValue(dialogRef);

    component.startEdit(category);
    tick();

    expect(mockCategoriesService.updateCategory).not.toHaveBeenCalled();
    expect(component.editingCategory).toBe(null);
  }));

  it('should handle search query change', () => {
    const event = { target: { value: 'test' } } as any;
    component.onSearchQueryChange(event);
    expect(mockCategoriesService.setSearchQuery).toHaveBeenCalledWith('test');
  });

  it('should handle page change', () => {
    component.onPageChange({ pageIndex: 1 });
    expect(mockCategoriesService.setPage).toHaveBeenCalledWith(2);
    expect(component.selectedCategories).toEqual([]);
  });

  it('should sort column', () => {
    component.sortColumn('name', 'asc');
    expect(component.sortField).toBe('name');
    expect(component.sortDirection).toBe('asc');
    expect(mockCategoriesService.sortCategories).toHaveBeenCalledWith('name', 'asc');
  });

  it('should toggle category selection', () => {
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'star',
      imageUrl: 'http://example.com/1.jpg',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02',
      comments: 'Comment1',
    };
    component.toggleCategory(category);
    expect(component.selectedCategories).toContain(category);

    component.toggleCategory(category);
    expect(component.selectedCategories).not.toContain(category);
  });

  it('should check if category is selected', () => {
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'star',
      imageUrl: 'http://example.com/1.jpg',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02',
      comments: 'Comment1',
    };
    component.selectedCategories = [category];
    expect(component.isSelected(category)).toBe(true);

    component.selectedCategories = [];
    expect(component.isSelected(category)).toBe(false);
  });

  it('should toggle all categories', () => {
    const categories: Category[] = [
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
      { id: 2, name: 'Cat2', icon: 'heart', imageUrl: 'http://example.com/2.jpg', createdAt: '2023-01-03', modifiedAt: '2023-01-04', comments: 'Comment2' },
    ];
    mockCategoriesService.paginatedCategories.mockReturnValue(categories);

    component.toggleAllCategories(true);
    expect(component.selectedCategories).toEqual(categories);

    component.toggleAllCategories(false);
    expect(component.selectedCategories).toEqual([]);
  });

  it('should check if all categories are selected', () => {
    const categories: Category[] = [
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
      { id: 2, name: 'Cat2', icon: 'heart', imageUrl: 'http://example.com/2.jpg', createdAt: '2023-01-03', modifiedAt: '2023-01-04', comments: 'Comment2' },
    ];
    mockCategoriesService.paginatedCategories.mockReturnValue(categories);
    component.selectedCategories = [categories[0]];
    expect(component.isAllSelected()).toBe(false);

    component.selectedCategories = categories;
    expect(component.isAllSelected()).toBe(true);

    mockCategoriesService.paginatedCategories.mockReturnValue([]);
    expect(component.isAllSelected()).toBe(false);
  });

  it('should delete selected categories', () => {
    const categories: Category[] = [
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
      { id: 2, name: 'Cat2', icon: 'heart', imageUrl: 'http://example.com/2.jpg', createdAt: '2023-01-03', modifiedAt: '2023-01-04', comments: 'Comment2' },
    ];
    component.selectedCategories = categories;

    component.deleteSelectedCategories();

    expect(mockCategoriesService.deleteCategory).toHaveBeenCalledWith(1);
    expect(mockCategoriesService.deleteCategory).toHaveBeenCalledWith(2);
    expect(component.selectedCategories).toEqual([]);
  });

  it('should get page numbers for pagination', () => {
    mockCategoriesService.totalPages.mockReturnValue(5);
    mockCategoriesService.currentPage.mockReturnValue(3);
    component.isMobile = false;
    component.isTablet = false;

    expect(component.getPageNumbers()).toEqual([1, 2, 3, 4, 5]);

    component.isMobile = true;
    expect(component.getPageNumbers()).toEqual([2, 3, 4]);

    component.isTablet = true;
    component.isMobile = false;
    expect(component.getPageNumbers()).toEqual([1, 2, 3, 4]);

    mockCategoriesService.totalPages.mockReturnValue(0);
    expect(component.getPageNumbers()).toEqual([]);
  });

  it('should track categories by id', () => {
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'star',
      imageUrl: 'http://example.com/1.jpg',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02',
      comments: 'Comment1',
    };
    expect(component.trackById(0, category)).toBe(1);
  });

  it('should display error message when service.error is truthy', () => {
    mockCategoriesService.error.mockReturnValue('Test error');
    fixture.detectChanges();

    const errorDiv = fixture.debugElement.nativeElement.querySelector('.mb-16');
    expect(errorDiv.textContent).toContain('Error: Test error');
  });

  it('should display loading spinner when service.isLoading is true', () => {
    mockCategoriesService.isLoading.mockReturnValue(true);
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

  it('should handle category select change', fakeAsync(() => {
    const spy = jest.spyOn(component, 'onPageChange');
    mockCategoriesService.paginatedCategories.mockReturnValue([
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    ]);
    fixture.detectChanges();

    const select = fixture.debugElement.nativeElement.querySelector('mat-select[aria-label="Select page"]');
    select.value = 2;
    select.dispatchEvent(new Event('selectionChange'));
    tick();
    expect(spy).toHaveBeenCalledWith({ pageIndex: 1 });
  }));

  it('should handle search input change', () => {
    const spy = jest.spyOn(component, 'onSearchQueryChange');
    fixture.detectChanges();

    const input = fixture.debugElement.nativeElement.querySelector('#searchCategories');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalled();
  });

  it('should handle delete selected button click', () => {
    const spy = jest.spyOn(component, 'deleteSelectedCategories');
    component.selectedCategories = [{ id: 1 } as Category];
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Delete selected categories"]');
    deleteButton.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should disable delete button when no categories are selected', () => {
    component.selectedCategories = [];
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Delete selected categories"]');
    expect(deleteButton.disabled).toBe(true);
  });

  it('should handle add category button click', () => {
    const spy = jest.spyOn(component, 'openAddCategoryDialog');
    fixture.detectChanges();

    const addButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Add new category"]');
    addButton.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle refresh button click', () => {
    const spy = jest.spyOn(component, 'refreshTable');
    mockCategoriesService.paginatedCategories.mockReturnValue([
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    ]);
    fixture.detectChanges();

    const refreshButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Refresh table"]');
    refreshButton.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle edit button click', () => {
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'star',
      imageUrl: 'http://example.com/1.jpg',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02',
      comments: 'Comment1',
    };
    mockCategoriesService.paginatedCategories.mockReturnValue([category]);
    const spy = jest.spyOn(component, 'startEdit');
    fixture.detectChanges();

    const editButton = fixture.debugElement.nativeElement.querySelector('.edit-button');
    editButton.click();
    expect(spy).toHaveBeenCalledWith(category);
  });

  it('should handle delete button click', () => {
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'star',
      imageUrl: 'http://example.com/1.jpg',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02',
      comments: 'Comment1',
    };
    mockCategoriesService.paginatedCategories.mockReturnValue([category]);
    fixture.detectChanges();

    const deleteButton = fixture.debugElement.nativeElement.querySelector('.delete-button');
    deleteButton.click();
    expect(mockCategoriesService.deleteCategory).toHaveBeenCalledWith(1);
  });

  it('should handle mobile actions menu', () => {
    component.isMobile = true;
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'star',
      imageUrl: 'http://example.com/1.jpg',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02',
      comments: 'Comment1',
    };
    mockCategoriesService.paginatedCategories.mockReturnValue([category]);
    const startEditSpy = jest.spyOn(component, 'startEdit');
    fixture.detectChanges();

    const menuButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Category actions"]');
    menuButton.click();
    fixture.detectChanges();

    const editMenuItem = fixture.debugElement.nativeElement.querySelector('button[aria-label="Edit category"]');
    editMenuItem.click();
    expect(startEditSpy).toHaveBeenCalledWith(category);
  });

  it('should handle sort menu click', () => {
    const spy = jest.spyOn(component, 'sortColumn');
    mockCategoriesService.paginatedCategories.mockReturnValue([
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    ]);
    fixture.detectChanges();

    const sortButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Sort name"]');
    sortButton.click();
    fixture.detectChanges();

    const ascMenuItem = fixture.debugElement.nativeElement.querySelector('button[mat-menu-item]');
    ascMenuItem.click();
    expect(spy).toHaveBeenCalledWith('name', 'asc');
  });

  it('should handle toggle all checkbox', () => {
    const spy = jest.spyOn(component, 'toggleAllCategories');
    mockCategoriesService.paginatedCategories.mockReturnValue([
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    ]);
    fixture.detectChanges();

    const checkbox = fixture.debugElement.nativeElement.querySelector('mat-checkbox[aria-label="Select all categories"]');
    checkbox.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle toggle category checkbox', () => {
    const category: Category = {
      id: 1,
      name: 'Cat1',
      icon: 'star',
      imageUrl: 'http://example.com/1.jpg',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02',
      comments: 'Comment1',
    };
    mockCategoriesService.paginatedCategories.mockReturnValue([category]);
    const spy = jest.spyOn(component, 'toggleCategory');
    fixture.detectChanges();

    const checkbox = fixture.debugElement.nativeElement.querySelector('mat-checkbox[aria-label="Select category"]');
    checkbox.click();
    expect(spy).toHaveBeenCalledWith(category);
  });

  it('should handle previous page button', () => {
    const spy = jest.spyOn(component, 'onPageChange');
    mockCategoriesService.currentPage.mockReturnValue(2);
    mockCategoriesService.paginatedCategories.mockReturnValue([
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    ]);
    fixture.detectChanges();

    const prevButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Previous page"]');
    prevButton.click();
    expect(spy).toHaveBeenCalledWith({ pageIndex: 1 });
  });

  it('should disable previous page button on first page', () => {
    mockCategoriesService.currentPage.mockReturnValue(1);
    mockCategoriesService.paginatedCategories.mockReturnValue([
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    ]);
    fixture.detectChanges();

    const prevButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Previous page"]');
    expect(prevButton.disabled).toBe(true);
  });

  it('should handle next page button', () => {
    const spy = jest.spyOn(component, 'onPageChange');
    mockCategoriesService.currentPage.mockReturnValue(1);
    mockCategoriesService.totalPages.mockReturnValue(2);
    mockCategoriesService.paginatedCategories.mockReturnValue([
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    ]);
    fixture.detectChanges();

    const nextButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Next page"]');
    nextButton.click();
    expect(spy).toHaveBeenCalledWith({ pageIndex: 1 });
  });

  it('should disable next page button on last page', () => {
    mockCategoriesService.currentPage.mockReturnValue(1);
    mockCategoriesService.totalPages.mockReturnValue(1);
    mockCategoriesService.paginatedCategories.mockReturnValue([
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    ]);
    fixture.detectChanges();

    const nextButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Next page"]');
    expect(nextButton.disabled).toBe(true);
  });

  it('should handle page number button click', () => {
    const spy = jest.spyOn(component, 'onPageChange');
    mockCategoriesService.totalPages.mockReturnValue(3);
    mockCategoriesService.currentPage.mockReturnValue(1);
    mockCategoriesService.paginatedCategories.mockReturnValue([
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    ]);
    fixture.detectChanges();

    const pageButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Page 2"]');
    pageButton.click();
    expect(spy).toHaveBeenCalledWith({ pageIndex: 1 });
  });

  it('should handle mobile page select', fakeAsync(() => {
    const spy = jest.spyOn(component, 'onPageChange');
    component.isMobile = true;
    mockCategoriesService.totalPages.mockReturnValue(3);
    mockCategoriesService.paginatedCategories.mockReturnValue([
      { id: 1, name: 'Cat1', icon: 'star', imageUrl: 'http://example.com/1.jpg', createdAt: '2023-01-01', modifiedAt: '2023-01-02', comments: 'Comment1' },
    ]);
    fixture.detectChanges();

    const select = fixture.debugElement.nativeElement.querySelector('mat-select[aria-label="Select page"]');
    select.value = 2;
    select.dispatchEvent(new Event('selectionChange'));
    tick();
    expect(spy).toHaveBeenCalledWith({ pageIndex: 1 });
  }));

  it('should display no pages message when no pages are available', () => {
    mockCategoriesService.totalPages.mockReturnValue(0);
    mockCategoriesService.paginatedCategories.mockReturnValue([]);
    fixture.detectChanges();

    const noPagesSpan = fixture.debugElement.nativeElement.querySelector('.text-12');
    expect(noPagesSpan.textContent.trim()).toBe('No pages available');
  });
});