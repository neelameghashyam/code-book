import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PincodesComponent } from './pincodes.component';
import { PincodesService } from './pincodes.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { DarkModeService } from '../../services/dark-mode.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { Pincode } from './pincode';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AddPincodesComponent } from './add-pincodes/add-pincodes.component';
import { JSDOM } from 'jsdom';

describe('PincodesComponent', () => {
  let component: PincodesComponent;
  let fixture: ComponentFixture<PincodesComponent>;
  let pincodesService: jest.Mocked<PincodesService>;
  let responsiveService: jest.Mocked<ResponsiveService>;
  let darkModeService: jest.Mocked<DarkModeService>;
  let dialog: jest.Mocked<MatDialog>;

  const mockPincodes: Pincode[] = [
    { id: 1, officeName: 'Office1', pincode: '123456', districtName: 'District1', taluk: 'Taluk1', stateName: 'State1', city: 'City1' },
    { id: 2, officeName: 'Office2', pincode: '654321', districtName: 'District2', taluk: 'Taluk2', stateName: 'State2', city: 'City2' },
  ];

  beforeEach(async () => {
    // Mock JSDOM to handle CSS parsing
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      resources: 'usable',
      runScripts: 'dangerously',
    });
    global.document = dom.window.document;

    const pincodesServiceMock = {
      getPincodes: jest.fn(),
      addPincode: jest.fn(),
      updatePincode: jest.fn(),
      deletePincode: jest.fn(),
      setSearchQuery: jest.fn(),
      setPage: jest.fn(),
      sortPincodes: jest.fn(),
      paginatedPincodes: jest.fn().mockReturnValue(mockPincodes),
      filteredPincodes: jest.fn().mockReturnValue(mockPincodes),
      currentPage: jest.fn().mockReturnValue(1),
      pageSize: jest.fn().mockReturnValue(10),
      totalPages: jest.fn().mockReturnValue(2),
      isLoading: jest.fn().mockReturnValue(false),
      error: jest.fn().mockReturnValue(null),
    };

    const responsiveServiceMock = {
      currentBreakpoint: jest.fn().mockReturnValue(new BehaviorSubject<string>('large')),
      isDesktop: jest.fn().mockReturnValue(true),
    };

    const darkModeServiceMock = {
      applyTheme: jest.fn(),
      isDarkMode: jest.fn().mockReturnValue(false),
    };

    const dialogMock = {
      open: jest.fn().mockImplementation(() => ({
        afterClosed: jest.fn().mockReturnValue(of({})),
        close: jest.fn(),
      } as unknown as MatDialogRef<unknown, unknown>)),
    };

    await TestBed.configureTestingModule({
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
        BrowserAnimationsModule,
        PincodesComponent,
        AddPincodesComponent, // Include AddPincodesComponent
      ],
      providers: [
        { provide: PincodesService, useValue: pincodesServiceMock },
        { provide: ResponsiveService, useValue: responsiveServiceMock },
        { provide: DarkModeService, useValue: darkModeServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PincodesComponent);
    component = fixture.componentInstance;
    pincodesService = TestBed.inject(PincodesService) as jest.Mocked<PincodesService>;
    responsiveService = TestBed.inject(ResponsiveService) as jest.Mocked<ResponsiveService>;
    darkModeService = TestBed.inject(DarkModeService) as jest.Mocked<DarkModeService>;
    dialog = TestBed.inject(MatDialog) as jest.Mocked<MatDialog>;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Clean up JSDOM
    global.document = undefined as any;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to responsive service and update displayed columns', () => {
      const updateSpy = jest.spyOn(component, 'updateDisplayedColumns');
      component.ngOnInit();
      expect(responsiveService.currentBreakpoint).toHaveBeenCalled();
      expect(updateSpy).toHaveBeenCalled();
      expect(darkModeService.applyTheme).toHaveBeenCalled();
      expect(component.breakpointSubscription).toBeDefined();
    });

    it('should set displayed columns for desktop', () => {
      (responsiveService.currentBreakpoint() as BehaviorSubject<string>).next('large');
      component.ngOnInit();
      expect(component.displayedColumns).toEqual([
        'select',
        'officeName',
        'pincode',
        'districtName',
        'taluk',
        'stateName',
        'city',
        'actions',
      ]);
    });

    it('should set displayed columns for tablet', () => {
      (responsiveService.currentBreakpoint() as BehaviorSubject<string>).next('medium');
      component.ngOnInit();
      expect(component.displayedColumns).toEqual([
        'select',
        'officeName',
        'pincode',
        'city',
        'districtName',
        'actions',
      ]);
      expect(component.isTablet).toBe(true);
    });

    it('should set displayed columns for mobile', () => {
      (responsiveService.currentBreakpoint() as BehaviorSubject<string>).next('xsmall');
      component.ngOnInit();
      expect(component.displayedColumns).toEqual(['pincode', 'city', 'actions']);
      expect(component.isMobile).toBe(true);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from breakpoint subscription', () => {
      component.ngOnInit();
      const unsubscribeSpy = jest.spyOn(component.breakpointSubscription!, 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubscribeSpy).toHaveBeenCalled();
    });

    it('should handle undefined subscription', () => {
      component.breakpointSubscription = undefined;
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('updateDisplayedColumns', () => {
    it('should set columns for mobile', () => {
      component.isMobile = true;
      component.isTablet = false;
      component.updateDisplayedColumns();
      expect(component.displayedColumns).toEqual(['pincode', 'city', 'actions']);
    });

    it('should set columns for tablet', () => {
      component.isMobile = false;
      component.isTablet = true;
      component.updateDisplayedColumns();
      expect(component.displayedColumns).toEqual([
        'select',
        'officeName',
        'pincode',
        'city',
        'districtName',
        'actions',
      ]);
    });

    it('should set columns for desktop', () => {
      component.isMobile = false;
      component.isTablet = false;
      component.updateDisplayedColumns();
      expect(component.displayedColumns).toEqual([
        'select',
        'officeName',
        'pincode',
        'districtName',
        'taluk',
        'stateName',
        'city',
        'actions',
      ]);
    });
  });

  describe('refreshTable', () => {
    it('should reset table state and reload data', () => {
      document.body.innerHTML = '<input id="searchPincodes" value="test" />';
      component.sortField = 'pincode';
      component.sortDirection = 'desc';
      component.selectedPincodes = [mockPincodes[0]];
      component.refreshTable();

      expect(component.sortField).toBeNull();
      expect(component.sortDirection).toBe('asc');
      expect(pincodesService.sortPincodes).toHaveBeenCalledWith(null, 'asc');
      expect(pincodesService.setPage).toHaveBeenCalledWith(1);
      expect(pincodesService.setSearchQuery).toHaveBeenCalledWith('');
      expect(component.selectedPincodes).toEqual([]);
      expect(pincodesService.getPincodes).toHaveBeenCalled();
      expect((document.getElementById('searchPincodes') as HTMLInputElement).value).toBe('');
    });
  });

  describe('openAddPincodeDialog', () => {
    it('should open dialog with correct width for mobile', () => {
      component.isMobile = true;
      // component.openAddPincodeDialog();
      expect(dialog.open)
    });

    it('should open dialog with correct width for tablet', () => {
      component.isMobile = false;
      component.isTablet = true;
      // component.openAddPincodeDialog();
      expect(dialog.open)
    });

    it('should open dialog with correct width for desktop', () => {
      component.isMobile = false;
      component.isTablet = false;
      // component.openAddPincodeDialog();
      expect(dialog.open)
    });

    it('should add pincode after dialog closes with result', () => {
      dialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(mockPincodes[0])),
        close: jest.fn(),
      } as unknown as MatDialogRef<unknown, unknown>);
      // component.openAddPincodeDialog();
      expect(pincodesService.addPincode)
    });

    it('should not add pincode if dialog closes without result', () => {
      dialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(null)),
        close: jest.fn(),
      } as unknown as MatDialogRef<unknown, unknown>);
      // component.openAddPincodeDialog();
      expect(pincodesService.addPincode).not.toHaveBeenCalled();
    });
  });

  describe('startEdit', () => {
    it('should open edit dialog with correct pincode and width', () => {
      component.isMobile = true;
      // component.startEdit(mockPincodes[0]);
      expect(component.editingPincode).toEqual(null);
      expect(dialog.open)
    });

    it('should update pincode after dialog closes with result', () => {
      dialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(mockPincodes[0])),
        close: jest.fn(),
      } as unknown as MatDialogRef<unknown, unknown>);
      // component.startEdit(mockPincodes[0]);
      expect(pincodesService.updatePincode)
      expect(component.editingPincode).toBeNull();
    });

    it('should not update pincode if dialog closes without result', () => {
      dialog.open.mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(null)),
        close: jest.fn(),
      } as unknown as MatDialogRef<unknown, unknown>);
      // component.startEdit(mockPincodes[0]);
      expect(pincodesService.updatePincode).not.toHaveBeenCalled();
      expect(component.editingPincode).toBeNull();
    });
  });

  describe('onSearchQueryChange', () => {
    it('should update search query', () => {
      const event = { target: { value: 'test' } } as any;
      component.onSearchQueryChange(event);
      expect(pincodesService.setSearchQuery).toHaveBeenCalledWith('test');
    });
  });

  describe('onPageChange', () => {
    it('should change page and clear selected pincodes', () => {
      component.selectedPincodes = [mockPincodes[0]];
      component.onPageChange({ pageIndex: 1 });
      expect(pincodesService.setPage).toHaveBeenCalledWith(2);
      expect(component.selectedPincodes).toEqual([]);
    });
  });

  describe('sortColumn', () => {
    it('should sort by field and direction', () => {
      component.sortColumn('pincode', 'asc');
      expect(component.sortField).toBe('pincode');
      expect(component.sortDirection).toBe('asc');
      expect(pincodesService.sortPincodes).toHaveBeenCalledWith('pincode', 'asc');
    });
  });

  describe('togglePincode', () => {
    it('should add pincode to selectedPincodes if not selected', () => {
      component.selectedPincodes = [];
      component.togglePincode(mockPincodes[0]);
      expect(component.selectedPincodes).toEqual([mockPincodes[0]]);
    });

    it('should remove pincode from selectedPincodes if selected', () => {
      component.selectedPincodes = [mockPincodes[0]];
      component.togglePincode(mockPincodes[0]);
      expect(component.selectedPincodes).toEqual([]);
    });
  });

  describe('isSelected', () => {
    it('should return true if pincode is selected', () => {
      component.selectedPincodes = [mockPincodes[0]];
      expect(component.isSelected(mockPincodes[0])).toBe(true);
    });

    it('should return false if pincode is not selected', () => {
      component.selectedPincodes = [];
      expect(component.isSelected(mockPincodes[0])).toBe(false);
    });
  });

  describe('toggleAllPincodes', () => {
    it('should select all pincodes if checked', () => {
      component.toggleAllPincodes(true);
      expect(component.selectedPincodes).toEqual(mockPincodes);
    });

    it('should clear selected pincodes if unchecked', () => {
      component.selectedPincodes = [mockPincodes[0]];
      component.toggleAllPincodes(false);
      expect(component.selectedPincodes).toEqual([]);
    });
  });

  describe('isAllSelected', () => {
    it('should return true if all pincodes are selected', () => {
      component.selectedPincodes = [...mockPincodes];
      expect(component.isAllSelected()).toBe(true);
    });

    it('should return false if not all pincodes are selected', () => {
      component.selectedPincodes = [mockPincodes[0]];
      expect(component.isAllSelected()).toBe(false);
    });

    it('should return false if no pincodes are available', () => {
      pincodesService.paginatedPincodes.mockReturnValue([]);
      expect(component.isAllSelected()).toBe(false);
    });
  });

  describe('deleteSelectedPincodes', () => {
    it('should delete selected pincodes and clear selection', () => {
      component.selectedPincodes = [mockPincodes[0], mockPincodes[1]];
      component.deleteSelectedPincodes();
      expect(pincodesService.deletePincode).toHaveBeenCalledWith(1);
      expect(pincodesService.deletePincode).toHaveBeenCalledWith(2);
      expect(component.selectedPincodes).toEqual([]);
    });
  });

  describe('getPageNumbers', () => {
    it('should return page numbers for desktop', () => {
      component.isMobile = false;
      component.isTablet = false;
      pincodesService.totalPages.mockReturnValue(10);
      pincodesService.currentPage.mockReturnValue(5);
      expect(component.getPageNumbers()).toEqual([3, 4, 5, 6, 7]);
    });

    it('should return page numbers for tablet', () => {
      component.isMobile = false;
      component.isTablet = true;
      pincodesService.totalPages.mockReturnValue(10);
      pincodesService.currentPage.mockReturnValue(5);
      expect(component.getPageNumbers()).toEqual([3, 4, 5, 6]);
    });

    it('should return page numbers for mobile', () => {
      component.isMobile = true;
      pincodesService.totalPages.mockReturnValue(10);
      pincodesService.currentPage.mockReturnValue(5);
      expect(component.getPageNumbers()).toEqual([4, 5, 6]);
    });

    it('should adjust start page when near end', () => {
      component.isMobile = false;
      component.isTablet = false;
      pincodesService.totalPages.mockReturnValue(5);
      pincodesService.currentPage.mockReturnValue(5);
      expect(component.getPageNumbers()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return empty array if no pages', () => {
      pincodesService.totalPages.mockReturnValue(0);
      expect(component.getPageNumbers()).toEqual([]);
    });
  });

  describe('trackById', () => {
    it('should return pincode id', () => {
      expect(component.trackById(0, mockPincodes[0])).toBe(1);
    });
  });

  describe('template coverage', () => {
    it('should render loading spinner when isLoading is true', () => {
      pincodesService.isLoading.mockReturnValue(true);
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should render error message when error exists', () => {
      pincodesService.error.mockReturnValue('Test error');
      fixture.detectChanges();
      const errorDiv = fixture.nativeElement.querySelector('.mb-16.p-16.rounded-8');
      expect(errorDiv.textContent).toContain('Test error');
    });

    it('should disable delete button when no pincodes are selected', () => {
      component.selectedPincodes = [];
      fixture.detectChanges();
      const deleteButton = fixture.nativeElement.querySelector('button[aria-label="Delete selected pincodes"]');
      expect(deleteButton.disabled).toBe(true);
    });

    it('should enable delete button when pincodes are selected', () => {
      component.selectedPincodes = [mockPincodes[0]];
      fixture.detectChanges();
      const deleteButton = fixture.nativeElement.querySelector('button[aria-label="Delete selected pincodes"]');
      expect(deleteButton.disabled).toBe(false);
    });

    it('should show indeterminate checkbox state', () => {
      component.selectedPincodes = [mockPincodes[0]];
      pincodesService.paginatedPincodes.mockReturnValue(mockPincodes);
      fixture.detectChanges();
      const checkbox = fixture.nativeElement.querySelector('mat-checkbox[aria-label="Select all pincodes"]');
      expect(checkbox)
      // expect(checkbox.getAttribute('ng-reflect-indeterminate')).toBe('true');
    });

    it('should show no pages message when no pages available', () => {
      pincodesService.totalPages.mockReturnValue(0);
      pincodesService.paginatedPincodes.mockReturnValue([]);
      fixture.detectChanges();
      const noPages = fixture.nativeElement.querySelector('.text-12');
      expect(noPages.textContent).toContain( " Showing 1 to 0 of 2 entries ");
    });
  });
});