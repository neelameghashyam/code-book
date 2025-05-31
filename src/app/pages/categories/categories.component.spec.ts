import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CategoriesComponent } from './categories.component';
import { CategoriesService } from './categories.service';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
  totalPages = jest.fn().mockReturnValue(2);
  getCategories = jest.fn().mockReturnValue(of(this.categories));
  addCategory = jest.fn();
  updateCategory = jest.fn();
  deleteCategory = jest.fn();
  setSearchQuery = jest.fn();
  setPage = jest.fn();
  sortCategories = jest.fn();
}

class MockMatDialog {
  open = jest.fn().mockImplementation(() => ({
    afterClosed: jest.fn().mockReturnValue(of(null)),
    componentInstance: {},
    backdropClick: jest.fn().mockReturnValue(of(null)),
    close: jest.fn(),
  }));
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
        CategoriesComponent,
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

  it('should initialize in ngOnInit and set up subscriptions', fakeAsync(() => {
    component.ngOnInit();
    expect(mockDarkModeService.applyTheme).toHaveBeenCalled();
    expect(component.breakpointSubscription).toBeDefined();

    breakpointSubject.next('xsmall');
    fixture.detectChanges();
    tick();
    expect(component.isMobile).toBe(true);
    expect(component.displayedColumns).toEqual(['name', 'icon', 'actions']);

    breakpointSubject.next('small');
    fixture.detectChanges();
    tick();
    expect(component.isTablet).toBe(true);
    expect(component.displayedColumns).toEqual(['select', 'name', 'icon', 'imageUrl', 'actions']);

    breakpointSubject.next('large');
    fixture.detectChanges();
    tick();
    expect(component.isMobile).toBe(false);
    expect(component.isTablet).toBe(false);
    expect(component.displayedColumns).toEqual(['select', 'name', 'icon', 'imageUrl', 'createdAt', 'modifiedAt', 'comments', 'actions']);
  }));

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

  it('should handle pagination with single page', () => {
    mockCategoriesService.totalPages.mockReturnValue(1);
    mockCategoriesService.currentPage.mockReturnValue(1);
    expect(component.getPageNumbers()).toEqual([1]);
  });

  it('should handle pagination with no pages', () => {
    mockCategoriesService.totalPages.mockReturnValue(0);
    mockCategoriesService.currentPage.mockReturnValue(0);
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

  it('should handle trackById with null category', () => {
    expect(component.trackById(0, null as any)).toBeUndefined();
  });

  it('should display error message when service.error is truthy', fakeAsync(() => {
    mockCategoriesService.error.mockReturnValue('Test error');
    fixture.detectChanges();
    tick();

    const errorDiv = fixture.debugElement.nativeElement.querySelector('.mb-16');
    expect(errorDiv.textContent).toContain('Error: Test error');
  }));

  it('should display loading spinner when service.isLoading is true', fakeAsync(() => {
    mockCategoriesService.isLoading.mockReturnValue(true);
    fixture.detectChanges();
    tick();

    const spinner = fixture.debugElement.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  }));

  it('should apply dark-theme class when darkModeService.isDarkMode is true', fakeAsync(() => {
    mockDarkModeService.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();
    tick();

    const tableContainer = fixture.debugElement.nativeElement.querySelector('.table-container');
    expect(tableContainer.classList).toContain('dark-theme');
  }));

  it('should handle search input change', fakeAsync(() => {
    const spy = jest.spyOn(component, 'onSearchQueryChange');
    fixture.detectChanges();
    tick();

    const input = fixture.debugElement.nativeElement.querySelector('#searchCategories');
    input.value = 'test';
    input.dispatchEvent(new Event('input'));
    expect(spy).toHaveBeenCalled();
  }));

  it('should display no pages message when no pages are available', fakeAsync(() => {
    mockCategoriesService.totalPages.mockReturnValue(0);
    mockCategoriesService.paginatedCategories.mockReturnValue([]);
    fixture.detectChanges();
    tick();

    const noPagesSpan = fixture.debugElement.nativeElement.querySelector('.text-sm');
    expect(noPagesSpan).toBeTruthy();
  }));

  it('should handle empty category list', () => {
    mockCategoriesService.paginatedCategories.mockReturnValue([]);
    component.toggleAllCategories(true);
    expect(component.selectedCategories).toEqual([]);
  });

  it('should handle sort direction toggle', () => {
    component.sortField = 'name';
    component.sortDirection = 'asc';
    component.sortColumn('name', 'desc');
    expect(component.sortDirection).toBe('desc');
    expect(mockCategoriesService.sortCategories).toHaveBeenCalledWith('name', 'desc');
  });
});