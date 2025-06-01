import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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
import { By } from '@angular/platform-browser';

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
    { id: 1, name: 'Cat1', icon: '', imageUrl: '', createdAt: '', modifiedAt: '', comments: '' },
    { id: 2, name: 'Cat2', icon: '', imageUrl: '', createdAt: '', modifiedAt: '', comments: '' }
  ]);
  getCategories = jest.fn();
}

class MockMatDialog {
  open = jest.fn().mockReturnValue({
    afterClosed: () => of(null),
    componentInstance: { onSave: new Subject() },
    close: jest.fn()
  });
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

    jest.spyOn(window, 'alert').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [
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
        SubcategoriesComponent
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
    component.categories = mockCategoriesService.categories();
    component.paginator = { pageIndex: 0, pageSize: 10, length: 2 } as any;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in ngOnInit and set up subscriptions', fakeAsync(() => {
    const breakpointSubject = new Subject<string>();
    mockResponsiveService.currentBreakpoint.mockReturnValue(breakpointSubject.asObservable());
    component.ngOnInit();
    fixture.detectChanges();

    expect(mockDarkModeService.applyTheme).toHaveBeenCalled();
    expect(mockCategoriesService.getCategories).toHaveBeenCalled();
    expect(mockCategoriesService.categories).toHaveBeenCalled();
    expect(mockSubcategoriesService.getSubcategories).toHaveBeenCalled();

    breakpointSubject.next('xsmall');
    tick();
    expect(component.isMobile).toBe(true);
    expect(component.displayedColumns).toEqual(['name', 'icon', 'actions']);

    breakpointSubject.next('small');
    tick();
    expect(component.isTablet).toBe(true);
    expect(component.displayedColumns).toEqual(['select', 'name', 'icon', 'imageUrl', 'CategoryName', 'actions']);

    breakpointSubject.next('large');
    tick();
    expect(component.isMobile).toBe(false);
    expect(component.isTablet).toBe(false);
    expect(component.displayedColumns).toEqual(['select', 'name', 'icon', 'imageUrl', 'CategoryName', 'createdAt', 'modifiedAt', 'comments', 'actions']);
  }));

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

  it('should warn when opening add dialog with no category selected', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    component.selectedCategoryId = null;
    component.openAddSubcategoryDialog();
    expect(console.warn).toHaveBeenCalledWith("Please select a valid category.");
    expect(mockDialog.open).not.toHaveBeenCalled();
  });

  it('should warn when selected category is not found', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    component.selectedCategoryId = 999;
    component.categories = [];
    component.openAddSubcategoryDialog();
    expect(console.warn).toHaveBeenCalledWith("Please select a valid category.");
    expect(mockDialog.open)
  });

  it('should handle search query change', () => {
    const event = { target: { value: 'test' } } as any;
    component.onSearchQueryChange(event);
    expect(mockSubcategoriesService.setSearchQuery).toHaveBeenCalledWith('test');
  });

  it('should delete a subcategory by id', () => {
    const subcategoryId = 1;
    component.deleteSubcategory(subcategoryId);
    expect(mockSubcategoriesService.deleteSubcategory).toHaveBeenCalledWith(subcategoryId);
  });

  it('should handle page change', () => {
    component.onPageChange({ page: 2 });
    expect(mockSubcategoriesService.setPage).toHaveBeenCalledWith(3);
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

  it('should display loading spinner when service.isLoading is true', fakeAsync(() => {
    mockSubcategoriesService.isLoading.mockReturnValue(true);
    fixture.detectChanges();
    tick();
    const spinner = fixture.debugElement.query(By.css('mat-spinner'));
    expect(spinner).toBeTruthy();
  }));

  it('should apply dark-theme class when darkModeService.isDarkMode is true', fakeAsync(() => {
    mockDarkModeService.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();
    tick();
    const tableContainer = fixture.debugElement.query(By.css('.table-container'));
    expect(tableContainer.classes['dark-theme']).toBeTruthy();
  }));

  it('should handle search input change', fakeAsync(() => {
    const spy = jest.spyOn(component, 'onSearchQueryChange');
    fixture.detectChanges();
    tick();
    const input = fixture.debugElement.query(By.css('#searchSubcategories'));
    expect(input).toBeTruthy();
    input.nativeElement.value = 'test';
    input.triggerEventHandler('input', { target: input.nativeElement });
    tick();
    expect(spy).toHaveBeenCalled();
  }));

  it('should handle delete selected button click', fakeAsync(() => {
    const spy = jest.spyOn(component, 'deleteSelectedSubcategories');
    component.selectedSubcategories = [{ id: 1 } as Subcategory];
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([{ id: 1 } as Subcategory]);
    fixture.detectChanges();
    tick();
    const deleteButton = fixture.debugElement.query(By.css('button[aria-label="Delete selected subcategories"]'));
    expect(deleteButton).toBeTruthy();
    deleteButton.triggerEventHandler('click', {});
    tick();
    expect(spy).toHaveBeenCalled();
  }));

  it('should disable delete button when no subcategories are selected', fakeAsync(() => {
    component.selectedSubcategories = [];
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([{ id: 1 } as Subcategory]);
    fixture.detectChanges();
    tick();
    const deleteButton = fixture.debugElement.query(By.css('button[aria-label="Delete selected subcategories"]'));
    expect(deleteButton).toBeTruthy();
    expect(deleteButton.nativeElement.disabled).toBe(true);
  }));

  it('should handle previous page button', fakeAsync(() => {
    const spy = jest.spyOn(component, 'onPageChange');
    mockSubcategoriesService.currentPage.mockReturnValue(2);
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([{ id: 1 } as Subcategory]);
    fixture.detectChanges();
    tick();
    const prevButton = fixture.debugElement.query(By.css('button[aria-label="Previous page"]'));
    expect(prevButton).toBeTruthy();
    prevButton.triggerEventHandler('click', {});
    tick();
    expect(spy).toHaveBeenCalledWith({ page: 1 });
  }));

  it('should disable previous page button on first page', fakeAsync(() => {
    mockSubcategoriesService.currentPage.mockReturnValue(1);
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([{ id: 1 } as Subcategory]);
    component.paginator = { pageIndex: 0, pageSize: 10, length: 10 } as any;
    fixture.detectChanges();
    tick();
    const prevButton = fixture.debugElement.query(By.css('button[aria-label="Previous page"]'));
    expect(prevButton).toBeTruthy();
    expect(prevButton.nativeElement.disabled).toBe(true);
  }));

  it('should handle next page button', fakeAsync(() => {
    const spy = jest.spyOn(component, 'onPageChange');
    mockSubcategoriesService.currentPage.mockReturnValue(1);
    mockSubcategoriesService.totalPages.mockReturnValue(2);
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([{ id: 1 } as Subcategory]);
    component.paginator = { pageIndex: 0, pageSize: 10, length: 20 } as any;
    fixture.detectChanges();
    tick();
    const nextButton = fixture.debugElement.query(By.css('button[aria-label="Next page"]'));
    expect(nextButton).toBeTruthy();
    nextButton.triggerEventHandler('click', {});
    tick();
    expect(spy).toHaveBeenCalledWith({ page: 2 });
  }));

  it('should disable next page button on last page', fakeAsync(() => {
    mockSubcategoriesService.currentPage.mockReturnValue(1);
    mockSubcategoriesService.totalPages.mockReturnValue(1);
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([{ id: 1 } as Subcategory]);
    component.paginator = { pageIndex: 0, pageSize: 10, length: 10 } as any;
    fixture.detectChanges();
    tick();
    const nextButton = fixture.debugElement.query(By.css('button[aria-label="Next page"]'));
    expect(nextButton).toBeTruthy();
    expect(nextButton.nativeElement.disabled).toBe(true);
  }));

  it('should handle page number button click', fakeAsync(() => {
    const spy = jest.spyOn(component, 'onPageChange');
    mockSubcategoriesService.totalPages.mockReturnValue(3);
    mockSubcategoriesService.currentPage.mockReturnValue(1);
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([{ id: 1 } as Subcategory]);
    component.paginator = { pageIndex: 0, pageSize: 10, length: 30 } as any;
    fixture.detectChanges();
    tick();
    const pageButton = fixture.debugElement.query(By.css('button[aria-label="Page 2"]'));
    expect(pageButton).toBeTruthy();
    pageButton.triggerEventHandler('click', {});
    tick();
    expect(spy).toHaveBeenCalledWith({ page: 2 });
  }));

  it('should handle mobile page select', fakeAsync(() => {
    const spy = jest.spyOn(component, 'onPageChange');
    component.isMobile = true;
    mockSubcategoriesService.totalPages.mockReturnValue(3);
    mockSubcategoriesService.paginatedSubcategories.mockReturnValue([{ id: 1 } as Subcategory]);
    component.paginator = { pageIndex: 0, pageSize: 10, length: 30 } as any;
    fixture.detectChanges();
    tick();
    const select = fixture.debugElement.query(By.css('mat-select[aria-label="Select page"]'));
    expect(select).toBeTruthy();
    select.triggerEventHandler('selectionChange', { value: 2 });
    tick();
    expect(spy).toHaveBeenCalledWith({ page: 2 });
  }));
});