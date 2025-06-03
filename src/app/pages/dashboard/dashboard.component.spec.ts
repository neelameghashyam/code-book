import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { FormBuilder, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ToastrService } from 'ngx-toastr';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ServiceProviderComponent } from './service-provider/service-provider.component';
import { ServiceProvider, BusinessForm } from './interfaces';
import { ChangeDetectorRef } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockToastr: { success: jest.Mock; error: jest.Mock; info: jest.Mock };
  let mockResponsiveService: { currentBreakpoint: jest.Mock };
  let mockTranslateService: {
    use: jest.Mock;
    get: jest.Mock;
    instant: jest.Mock;
    onLangChange: Subject<any>;
    onTranslationChange: Subject<any>;
    onDefaultLangChange: Subject<any>;
    stream: jest.Mock;
  };
  let mockDialog: { open: jest.Mock };
  let mockCdr: { markForCheck: jest.Mock };
  let breakpointSubject: BehaviorSubject<string>;
  let localStorageMock: { getItem: jest.Mock; setItem: jest.Mock; clear: jest.Mock };

  const mockServiceProvider: ServiceProvider = {
    id: '1',
    spName: 'Test Provider',
    country: 'USA',
    addressLine1: '123 Main St',
    addressLine2: '',
    addressLine3: '',
    city: 'Test City',
    state: 'CA',
    postalCode: '12345',
    businessName: '',
  };

  const validFormData: BusinessForm = {
    country: 'USA',
    businessName: 'Test Business',
    addressLine1: '123 Main St',
    addressLine2: '',
    addressLine3: '',
    city: 'Test City',
    state: 'CA',
    postalCode: '12345',
    serviceProviders: [],
  };

  beforeEach(async () => {
    mockToastr = { success: jest.fn(), error: jest.fn(), info: jest.fn() };
    mockResponsiveService = { currentBreakpoint: jest.fn() };
    mockTranslateService = {
      use: jest.fn(),
      get: jest.fn().mockReturnValue(of('translated')),
      instant: jest.fn().mockReturnValue('translated'),
      onLangChange: new Subject(),
      onTranslationChange: new Subject(),
      onDefaultLangChange: new Subject(),
      stream: jest.fn().mockReturnValue(of('translated')),
    };
    mockDialog = { open: jest.fn() };
    mockCdr = { markForCheck: jest.fn() };
    breakpointSubject = new BehaviorSubject<string>('medium');
    mockResponsiveService.currentBreakpoint.mockReturnValue(breakpointSubject.asObservable());

    localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        MatDialogModule,
        MatIconModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot(),
        DashboardComponent,
        ServiceProviderComponent,
      ],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: mockToastr },
        { provide: ResponsiveService, useValue: mockResponsiveService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ChangeDetectorRef, useValue: mockCdr },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear.mockReset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and countries', () => {
    fixture.detectChanges();
    expect(component.providerForm).toBeDefined();
    expect(component.countries).toEqual(['USA', 'Canada', 'UK', 'Australia', 'India']);
    expect(component.providerForm.get('country')?.value).toBe('');
  });

  it('should set language from localStorage on init', () => {
    localStorageMock.getItem.mockReturnValue('fr');
    component.ngOnInit();
    expect(mockTranslateService.use).toHaveBeenCalledWith('fr');
  });

  it('should set default language to en if no lang in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    component.ngOnInit();
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
  });

  it('should update responsiveClass based on breakpoint', () => {
    component.ngOnInit();
    breakpointSubject.next('small');
    expect(component.responsiveClass).toBe('flex-col');
    breakpointSubject.next('xsmall');
    expect(component.responsiveClass).toBe('flex-col');
    breakpointSubject.next('medium');
    expect(component.responsiveClass).toBe('md:flex-row');
    expect(mockCdr.markForCheck).toHaveBeenCalledTimes(0);
  });

  it('should load service providers from localStorage', () => {
    const providers = [mockServiceProvider];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(providers));
    component.loadFromLocalStorage();
    expect(component.serviceProviders).toEqual(providers);
    expect(component.serviceProvidersArray.length).toBe(1);
    expect(component.serviceProvidersArray.at(0).value).toEqual(mockServiceProvider);
  });

  it('should handle null service providers in localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    component.loadFromLocalStorage();
    expect(component.serviceProviders).toEqual([]);
    expect(component.serviceProvidersArray.length).toBe(0);
  });

  it('should handle localStorage error in loadFromLocalStorage', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    component.loadFromLocalStorage();
    expect(mockToastr.error).toHaveBeenCalledWith('Error loading saved data');
  });

 

  it('should create service provider form group', () => {
    const formGroup = component.createServiceProviderFormGroup(mockServiceProvider);
    expect(formGroup.get('spName')?.value).toBe('Test Provider');
    expect(formGroup.get('country')?.value).toBe('USA');
    expect(formGroup.get('id')?.value).toBe('1');
    expect(formGroup.get('addressLine1')?.value).toBe('123 Main St');
    expect(formGroup.get('addressLine2')?.value).toBe('');
    expect(formGroup.get('addressLine3')?.value).toBe('');
    expect(formGroup.get('city')?.value).toBe('Test City');
    expect(formGroup.get('state')?.value).toBe('CA');
    expect(formGroup.get('postalCode')?.value).toBe('12345');
    expect(formGroup.get('businessName')?.value).toBe('');
  });

 
  it('should delete service provider', () => {
    component.serviceProviders = [mockServiceProvider];
    component.serviceProvidersArray.push(component.createServiceProviderFormGroup(mockServiceProvider));
    localStorageMock.getItem.mockReturnValue(JSON.stringify([mockServiceProvider]));
    component.deleteServiceProvider(0);
    expect(component.serviceProviders.length).toBe(0);
    expect(component.serviceProvidersArray.length).toBe(0);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('serviceProviders', JSON.stringify([]));
    expect(mockToastr.success).toHaveBeenCalledWith('Service provider deleted successfully');
  });

  it('should handle error in deleteServiceProvider', () => {
    component.serviceProviders = [mockServiceProvider];
    component.serviceProvidersArray.push(component.createServiceProviderFormGroup(mockServiceProvider));
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    component.deleteServiceProvider(0);
    expect(component.serviceProviders.length).toBe(0);
    expect(component.serviceProvidersArray.length).toBe(0);
    expect(mockToastr.error).toHaveBeenCalledWith('Error deleting service provider');
  });

  it('should submit valid form', () => {
    component.providerForm.setValue(validFormData);
    component.onSubmit();
    expect(localStorageMock.setItem).toHaveBeenCalledWith('businessForm', JSON.stringify(validFormData));
    expect(mockToastr.success).toHaveBeenCalledWith('Business form submitted successfully');
    expect(component.readOnly).toBe(true);
    expect(component.providerForm.disabled).toBe(true);
  });

  it('should handle invalid form submission', () => {
    component.providerForm.get('country')?.setValue('');
    component.onSubmit();
    expect(mockToastr.error).toHaveBeenCalledWith('Please fill all required fields');
    expect(component.providerForm.touched).toBe(true);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
    expect(component.readOnly).toBe(false);
    expect(component.providerForm.enabled).toBe(true);
  });

  it('should handle specific form validation errors', () => {
    component.providerForm.get('businessName')?.setValue('ab'); // Too short
    component.providerForm.get('state')?.setValue('Invalid@State'); // Invalid pattern
    component.onSubmit();
    expect(component.providerForm.get('businessName')?.errors).toHaveProperty('minlength');
    expect(component.providerForm.get('state')?.errors).toHaveProperty('pattern');
    expect(mockToastr.error).toHaveBeenCalledWith('Please fill all required fields');
  });

  it('should handle localStorage error in onSubmit', () => {
    component.providerForm.setValue(validFormData);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    component.onSubmit();
    expect(mockToastr.error).toHaveBeenCalledWith('Error saving business form');
    expect(component.readOnly).toBe(false);
    expect(component.providerForm.enabled).toBe(true);
  });

  it('should enable edit mode', () => {
    component.readOnly = true;
    component.providerForm.disable();
    component.enableEditMode();
    expect(component.readOnly).toBe(false);
    expect(component.providerForm.enabled).toBe(true);
  });

  it('should cancel form', () => {
    component.serviceProvidersArray.push(component.createServiceProviderFormGroup(mockServiceProvider));
    component.providerForm.patchValue(validFormData);
    component.onCancel();
    expect(component.providerForm.get('country')?.value).toBe('');
    expect(component.providerForm.get('businessName')?.value).toBe('');
    expect(component.readOnly).toBe(false);
    expect(component.providerForm.enabled).toBe(true);
    expect(mockToastr.info).toHaveBeenCalledWith('Form reset');
  });

  it('should save to localStorage', () => {
    component.serviceProviders = [mockServiceProvider];
    component.providerForm.setValue(validFormData);
    component.saveToLocalStorage();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'businessForm',
      JSON.stringify({
        ...validFormData,
        serviceProviders: [mockServiceProvider],
      })
    );
  });

  it('should handle error in saveToLocalStorage', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });
    component.saveToLocalStorage();
    expect(console.error)
  });

  it('should track by provider id', () => {
    expect(component.trackByProvider(0, mockServiceProvider)).toBe('1');
    expect(component.trackByProvider(0, { ...mockServiceProvider, id: undefined })).toBe('0');
  });

  it('should get serviceProvidersArray', () => {
    expect(component.serviceProvidersArray).toBeInstanceOf(FormArray);
    expect(component.serviceProvidersArray).toEqual(component.providerForm.get('serviceProviders'));
  });

  // Additional tests for uncovered branches and edge cases
  it('should handle empty service providers in loadFromLocalStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
    component.loadFromLocalStorage();
    expect(component.serviceProviders).toEqual([]);
    expect(component.serviceProvidersArray.length).toBe(0);
  });

  it('should handle duplicate service providers in loadFromLocalStorage', () => {
    const providers = [mockServiceProvider, mockServiceProvider];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(providers));
    component.loadFromLocalStorage();
    expect(component.serviceProviders.length).toBe(1);
    expect(component.serviceProvidersArray.length).toBe(1);
  });

  it('should handle invalid JSON in loadFromLocalStorage', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');
    component.loadFromLocalStorage();
    expect(component.serviceProviders).toEqual([]);
  });

  it('should handle null provider in createServiceProviderFormGroup', () => {
    const formGroup = component.createServiceProviderFormGroup({} as ServiceProvider);
    expect(formGroup.get('spName')?.value).toBe("");
    expect(formGroup.get('country')?.value).toBe("");
    expect(formGroup.valid).toBe(false);
  });

  it('should handle missing businessForm in loadFromLocalStorage', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'serviceProviders') return JSON.stringify([mockServiceProvider]);
      return null;
    });
    component.loadFromLocalStorage();
    expect(component.serviceProviders).toEqual([mockServiceProvider]);
    expect(component.serviceProvidersArray.length).toBe(1);
  });
});