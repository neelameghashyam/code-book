import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { DarkModeService } from '../../services/dark-mode.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockDarkModeService: jest.Mocked<DarkModeService>;
  let mockResponsiveService: jest.Mocked<ResponsiveService>;

  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  beforeEach(async () => {
    // Mock services
    mockDarkModeService = {
      isDarkMode: jest.fn().mockReturnValue(false),
    } as any;
    mockResponsiveService = {} as any;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CommonModule, FormsModule, DashboardComponent],
      providers: [
        { provide: DarkModeService, useValue: mockDarkModeService },
        { provide: ResponsiveService, useValue: mockResponsiveService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize the form with all controls', () => {
      const formControls = component.providerForm.controls;
      expect(formControls['country']).toBeDefined();
      expect(formControls['spName']).toBeDefined();
      expect(formControls['addressLine1']).toBeDefined();
      expect(formControls['addressLine2']).toBeDefined();
      expect(formControls['addressLine3']).toBeDefined();
      expect(formControls['city']).toBeDefined();
      expect(formControls['state']).toBeDefined();
      expect(formControls['postalCode']).toBeDefined();
      expect(formControls['id']).toBeDefined();
    });

    it('should mark required fields as invalid when empty', () => {
      component.providerForm.markAllAsTouched();
      expect(component.providerForm.get('country')?.invalid).toBe(true);
      expect(component.providerForm.get('spName')?.invalid).toBe(true);
      expect(component.providerForm.get('addressLine1')?.invalid).toBe(true);
      expect(component.providerForm.get('city')?.invalid).toBe(true);
      expect(component.providerForm.get('postalCode')?.invalid).toBe(true);
    });

    it('should validate spName minLength (3 characters)', () => {
      const spNameControl = component.providerForm.get('spName');
      spNameControl?.setValue('ab');
      spNameControl?.markAsTouched();
      expect(spNameControl?.invalid).toBe(true);

      spNameControl?.setValue('abc');
      expect(spNameControl?.valid).toBe(true);
    });

    it('should validate state code pattern (2 or 3 characters)', () => {
      const stateControl = component.providerForm.get('state');
      stateControl?.setValue('A');
      stateControl?.markAsTouched();
      expect(stateControl?.invalid).toBe(true);

      stateControl?.setValue('AB');
      expect(stateControl?.valid).toBe(true);

      stateControl?.setValue('ABC');
      expect(stateControl?.valid).toBe(true);

      stateControl?.setValue('ABCD');
      expect(stateControl?.invalid).toBe(true);
    });

    it('should validate postalCode minLength (5 characters)', () => {
      const postalCodeControl = component.providerForm.get('postalCode');
      postalCodeControl?.setValue('1234');
      postalCodeControl?.markAsTouched();
      expect(postalCodeControl?.invalid).toBe(true);

      postalCodeControl?.setValue('12345');
      expect(postalCodeControl?.valid).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should initialize countries', () => {
      expect(component.countries).toEqual(['USA', 'Canada', 'UK', 'Australia', 'India']);
    });

    it('should load service providers from localStorage', () => {
      const mockData = [
        { id: 1, country: 'USA', spName: 'Provider1', addressLine1: '123 Main St', addressLine2: '', addressLine3: '', city: 'New York', state: 'NY', postalCode: '10001' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
      component.ngOnInit();
      expect(component.serviceProviders).toEqual(mockData);
      expect(component.filteredProviders).toEqual(mockData);
    });
  });

  describe('onSubmit', () => {
    it('should add a new service provider when form is valid', () => {
      component.providerForm.setValue({
        id: null,
        country: 'USA',
        spName: 'Provider1',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
      });
      component.onSubmit();
      expect(component.serviceProviders.length).toBe(1);
      expect(component.serviceProviders[0]).toEqual({
        id: 1,
        country: 'USA',
        spName: 'Provider1',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('serviceProviders', JSON.stringify(component.serviceProviders));
      expect(component.providerForm.value.country).toBe('USA');
    });

    it('should update an existing service provider when form has an id', () => {
      component.serviceProviders = [
        { id: 1, country: 'USA', spName: 'Provider1', addressLine1: '123 Main St', addressLine2: '', addressLine3: '', city: 'New York', state: 'NY', postalCode: '10001' },
      ];
      component.providerForm.setValue({
        id: 1,
        country: 'Canada',
        spName: 'Provider1 Updated',
        addressLine1: '456 Maple Ave',
        addressLine2: '',
        addressLine3: '',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M5V2T6',
      });
      component.onSubmit();
      expect(component.serviceProviders.length).toBe(1);
      expect(component.serviceProviders[0]).toEqual({
        id: 1,
        country: 'Canada',
        spName: 'Provider1 Updated',
        addressLine1: '456 Maple Ave',
        addressLine2: '',
        addressLine3: '',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M5V2T6',
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('serviceProviders', JSON.stringify(component.serviceProviders));
    });

    it('should not add or update if form is invalid', () => {
      component.providerForm.setValue({
        id: null,
        country: '',
        spName: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        postalCode: '',
      });
      const consoleSpy = jest.spyOn(console, 'log');
      component.onSubmit();
      expect(component.serviceProviders.length).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith('Form is invalid. Please check the fields.');
      expect(component.providerForm.touched).toBe(true);
    });
  });

  describe('onCancel', () => {
    it('should reset the form and set country to first option', () => {
      component.providerForm.setValue({
        id: 1,
        country: 'Canada',
        spName: 'Provider1',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'Toronto',
        state: 'ON',
        postalCode: 'M5V2T6',
      });
      component.onCancel();
      expect(component.providerForm.value).toEqual({
        id: null,
        country: 'USA',
        spName: null,
        addressLine1: null,
        addressLine2: null,
        addressLine3: null,
        city: null,
        state: null,
        postalCode: null,
      });
    });
  });

  describe('editProvider', () => {
    it('should populate the form with provider data', () => {
      const provider = {
        id: 1,
        country: 'USA',
        spName: 'Provider1',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
      };
      component.editProvider(provider);
      expect(component.providerForm.value).toEqual(provider);
    });
  });

  describe('deleteProvider', () => {
    it('should delete a provider by id', () => {
      component.serviceProviders = [
        { id: 1, country: 'USA', spName: 'Provider1', addressLine1: '123 Main St', addressLine2: '', addressLine3: '', city: 'New York', state: 'NY', postalCode: '10001' },
        { id: 2, country: 'Canada', spName: 'Provider2', addressLine1: '456 Maple Ave', addressLine2: '', addressLine3: '', city: 'Toronto', state: 'ON', postalCode: 'M5V2T6' },
      ];
      component.filteredProviders = [...component.serviceProviders];
      component.deleteProvider(1);
      expect(component.serviceProviders.length).toBe(1);
      expect(component.serviceProviders[0].id).toBe(2);
      expect(component.filteredProviders).toEqual(component.serviceProviders);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('serviceProviders', JSON.stringify(component.serviceProviders));
      expect(component.pageIndex).toBe(0);
    });
  });

  describe('applyFilter', () => {
    it('should filter providers based on search term', () => {
      component.serviceProviders = [
        { id: 1, country: 'USA', spName: 'Provider1', addressLine1: '123 Main St', addressLine2: '', addressLine3: '', city: 'New York', state: 'NY', postalCode: '10001' },
        { id: 2, country: 'Canada', spName: 'Provider2', addressLine1: '456 Maple Ave', addressLine2: '', addressLine3: '', city: 'Toronto', state: 'ON', postalCode: 'M5V2T6' },
      ];
      component.filteredProviders = [...component.serviceProviders];
      component.searchTerm = 'USA';
      component.applyFilter();
      expect(component.filteredProviders.length).toBe(1);
      expect(component.filteredProviders[0].country).toBe('USA');
      expect(component.pageIndex).toBe(0);
    });

    it('should return all providers when search term is empty', () => {
      component.serviceProviders = [
        { id: 1, country: 'USA', spName: 'Provider1', addressLine1: '123 Main St', addressLine2: '', addressLine3: '', city: 'New York', state: 'NY', postalCode: '10001' },
        { id: 2, country: 'Canada', spName: 'Provider2', addressLine1: '456 Maple Ave', addressLine2: '', addressLine3: '', city: 'Toronto', state: 'ON', postalCode: 'M5V2T6' },
      ];
      component.filteredProviders = [...component.serviceProviders];
      component.searchTerm = '';
      component.applyFilter();
      expect(component.filteredProviders.length).toBe(2);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      component.serviceProviders = [
        { id: 1, country: 'USA', spName: 'Provider1', addressLine1: '123 Main St', addressLine2: '', addressLine3: '', city: 'New York', state: 'NY', postalCode: '10001' },
        { id: 2, country: 'Canada', spName: 'Provider2', addressLine1: '456 Maple Ave', addressLine2: '', addressLine3: '', city: 'Toronto', state: 'ON', postalCode: 'M5V2T6' },
        { id: 3, country: 'UK', spName: 'Provider3', addressLine1: '789 High St', addressLine2: '', addressLine3: '', city: 'London', state: '', postalCode: 'SW1A1AA' },
      ];
      component.filteredProviders = [...component.serviceProviders];
      component.pageSize = 2;
      component.pageIndex = 0;
    });

    it('should return correct paginated data', () => {
      const paginatedData = component.paginatedData;
      expect(paginatedData.length).toBe(2);
      expect(paginatedData[0].id).toBe(1);
      expect(paginatedData[1].id).toBe(2);
    });

    it('should change page correctly', () => {
      component.changePage(1);
      expect(component.pageIndex).toBe(1);
      const paginatedData = component.paginatedData;
      expect(paginatedData.length).toBe(1);
      expect(paginatedData[0].id).toBe(3);
    });

    it('should change page size and reset page index', () => {
      component.pageIndex = 1;
      component.changePageSize(3);
      expect(component.pageSize).toBe(3);
      expect(component.pageIndex).toBe(0);
      const paginatedData = component.paginatedData;
      expect(paginatedData.length).toBe(3);
    });

    it('should calculate total pages correctly', () => {
      expect(component.totalPages).toBe(2);
      component.pageSize = 3;
      expect(component.totalPages).toBe(1);
    });
  });

  describe('Local Storage', () => {
    it('should save providers to localStorage', () => {
      component.serviceProviders = [
        { id: 1, country: 'USA', spName: 'Provider1', addressLine1: '123 Main St', addressLine2: '', addressLine3: '', city: 'New York', state: 'NY', postalCode: '10001' },
      ];
      component.saveToLocalStorage();
      expect(localStorageMock.setItem).toHaveBeenCalledWith('serviceProviders', JSON.stringify(component.serviceProviders));
    });

    it('should load providers from localStorage', () => {
      const mockData = [
        { id: 1, country: 'USA', spName: 'Provider1', addressLine1: '123 Main St', addressLine2: '', addressLine3: '', city: 'New York', state: 'NY', postalCode: '10001' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));
      component.loadFromLocalStorage();
      expect(component.serviceProviders).toEqual(mockData);
      expect(component.filteredProviders).toEqual(mockData);
    });

    it('should handle empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      component.loadFromLocalStorage();
      expect(component.serviceProviders).toEqual([]);
      expect(component.filteredProviders).toEqual([]);
    });
  });
});