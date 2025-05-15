import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, FormArray } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { ServiceProviderComponent } from './service-provider/service-provider.component';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let toastrService: ToastrService;
  let responsiveService: ResponsiveService;
  let dialog: MatDialog;
  let cdr: ChangeDetectorRef;

  const mockToastrService = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  };

  const mockResponsiveService = {
    currentBreakpoint: jest.fn(() => of('medium')),
  };

  const mockDialog = {
    open: jest.fn(() => ({
      afterClosed: jest.fn(() => of(null)),
    })),
  };

  const mockChangeDetectorRef = {
    markForCheck: jest.fn(),
  };

  const mockProvider = {
    id: '1',
    spName: 'Provider 1',
    addressLine1: '456 Elm St',
    addressLine2: '',
    addressLine3: '',
    city: 'Boston',
    state: 'MA',
    postalCode: '02108',
    country: 'USA',
    businessName: '',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
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
        NoopAnimationsModule,
        DashboardComponent,
      ],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: mockToastrService },
        { provide: ResponsiveService, useValue: mockResponsiveService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    toastrService = TestBed.inject(ToastrService);
    responsiveService = TestBed.inject(ResponsiveService);
    dialog = TestBed.inject(MatDialog);
    cdr = TestBed.inject(ChangeDetectorRef);
    jest.spyOn(localStorage, 'getItem').mockReturnValue(null);
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize the form with correct controls', () => {
      expect(component.providerForm).toBeDefined();
      expect(component.providerForm.get('country')).toBeDefined();
      expect(component.providerForm.get('businessName')).toBeDefined();
      expect(component.providerForm.get('addressLine1')).toBeDefined();
      expect(component.providerForm.get('addressLine2')).toBeDefined();
      expect(component.providerForm.get('addressLine3')).toBeDefined();
      expect(component.providerForm.get('city')).toBeDefined();
      expect(component.providerForm.get('state')).toBeDefined();
      expect(component.providerForm.get('postalCode')).toBeDefined();
      expect(component.providerForm.get('serviceProviders')).toBeDefined();
    });

    it('should set countries array and access getter', () => {
      expect(component.countries).toEqual(['USA', 'Canada', 'UK', 'Australia', 'India']);
      expect(component.countries.length).toBe(5);
      expect(component.countries[0]).toBe('USA');
      expect(component.countries[4]).toBe('India');
    });

    it('should subscribe to responsive service and set responsiveClass for medium breakpoint', () => {
      expect(responsiveService.currentBreakpoint).toHaveBeenCalled();
      expect(component.responsiveClass).toBe('md:flex-row');
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should set responsiveClass to flex-col for small breakpoint', () => {
      mockResponsiveService.currentBreakpoint.mockReturnValue(of('small'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('flex-col');
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should set responsiveClass to flex-col for xsmall breakpoint', () => {
      mockResponsiveService.currentBreakpoint.mockReturnValue(of('xsmall'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('flex-col');
      expect(cdr.markForCheck).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when required fields are empty', () => {
      component.providerForm.setValue({
        country: '',
        businessName: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        postalCode: '',
        serviceProviders: [],
      });
      expect(component.providerForm.valid).toBeFalsy();
    });

    it('should mark form as valid when required fields are filled correctly', () => {
      component.providerForm.setValue({
        country: 'USA',
        businessName: 'Test Business',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        serviceProviders: [],
      });
      expect(component.providerForm.valid).toBeTruthy();
    });

    it('should invalidate businessName if less than 3 characters', () => {
      component.providerForm.get('businessName')?.setValue('ab');
      component.providerForm.get('businessName')?.markAsTouched();
      expect(component.providerForm.get('businessName')?.valid).toBeFalsy();
    });

    it('should invalidate state if pattern does not match', () => {
      component.providerForm.get('state')?.setValue('invalid_state');
      component.providerForm.get('state')?.markAsTouched();
      expect(component.providerForm.get('state')?.valid).toBeFalsy();
    });

    it('should validate state if pattern matches', () => {
      component.providerForm.get('state')?.setValue('NY');
      component.providerForm.get('state')?.markAsTouched();
      expect(component.providerForm.get('state')?.valid).toBeTruthy();
    });

    it('should invalidate postalCode if less than 3 characters', () => {
      component.providerForm.get('postalCode')?.setValue('ab');
      component.providerForm.get('postalCode')?.markAsTouched();
      expect(component.providerForm.get('postalCode')?.valid).toBeFalsy();
    });

    it('should validate postalCode if 3 or more characters', () => {
      component.providerForm.get('postalCode')?.setValue('12345');
      component.providerForm.get('postalCode')?.markAsTouched();
      expect(component.providerForm.get('postalCode')?.valid).toBeTruthy();
    });
  });

  describe('Service Provider Management', () => {
    it('should open dialog with correct configuration when adding a new service provider', () => {
      component.openPopup();
      expect(dialog.open).toHaveBeenCalledWith(ServiceProviderComponent, {
        width: '90%',
        maxWidth: '1200px',
        height: 'auto',
        maxHeight: '120vh',
        enterAnimationDuration: '300ms',
        exitAnimationDuration: '300ms',
        data: { isPopup: true, provider: undefined, index: undefined },
        autoFocus: true,
        restoreFocus: true,
        panelClass: 'custom-service-provider-dialog-large',
      });
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should open dialog with correct configuration when editing a service provider', () => {
      component.serviceProviders = [mockProvider];
      component.openPopup(mockProvider, 0);
      expect(dialog.open).toHaveBeenCalledWith(ServiceProviderComponent, {
        width: '90%',
        maxWidth: '1200px',
        height: 'auto',
        maxHeight: '120vh',
        enterAnimationDuration: '300ms',
        exitAnimationDuration: '300ms',
        data: { isPopup: true, provider: mockProvider, index: 0 },
        autoFocus: true,
        restoreFocus: true,
        panelClass: 'custom-service-provider-dialog-large',
      });
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should add new service provider when dialog closes with result', () => {
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(mockProvider),
      } as any);
      component.openPopup();
      expect(component.serviceProviders).toContain(mockProvider);
      expect(component.serviceProvidersArray.length).toBe(1);
      expect(component.serviceProvidersArray.at(0).value).toEqual(mockProvider);
      expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should update existing service provider when dialog closes with result', () => {
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(mockProvider),
      } as any);
      component.openPopup();
      const updatedProvider = { ...mockProvider, spName: 'Updated Provider' };
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(updatedProvider),
      } as any);
      component.openPopup(mockProvider, 0);
      expect(component.serviceProviders[0]).toBe(updatedProvider);
      expect(component.serviceProvidersArray.at(0).value).toEqual(updatedProvider);
      expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should handle dialog close with no result', () => {
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(null),
      } as any);
      component.openPopup();
      expect(component.serviceProviders.length).toBe(0);
      expect(component.serviceProvidersArray.length).toBe(0);
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should edit service provider via editServiceProvider', () => {
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(mockProvider),
      } as any);
      component.openPopup();
      const updatedProvider = { ...mockProvider, spName: 'Edited Provider' };
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(updatedProvider),
      } as any);
      component.editServiceProvider(0);
      expect(component.serviceProviders[0]).toBe(updatedProvider);
      expect(component.serviceProvidersArray.at(0).value).toEqual(updatedProvider);
      expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should delete service provider and update localStorage', () => {
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(mockProvider),
      } as any);
      component.openPopup();
      jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify([mockProvider]));
      component.deleteServiceProvider(0);
      expect(component.serviceProviders.length).toBe(0);
      expect(component.serviceProvidersArray.length).toBe(0);
      expect(localStorage.setItem).toHaveBeenCalledWith('serviceProviders', JSON.stringify([]));
      expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
      expect(toastrService.success).toHaveBeenCalledWith('Service provider deleted successfully');
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should handle error when deleting service provider', () => {
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(mockProvider),
      } as any);
      component.openPopup();
      jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('LocalStorage error');
      });
      component.deleteServiceProvider(0);
      expect(toastrService.error).toHaveBeenCalledWith('Error deleting service provider');
      expect(console.error).toHaveBeenCalledWith('LocalStorage error:', expect.any(Error));
      expect(cdr.markForCheck).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should save form data to localStorage and switch to read-only mode on valid submission', () => {
      component.providerForm.setValue({
        country: 'USA',
        businessName: 'Test Business',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        serviceProviders: [],
      });
      component.onSubmit();
      expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
      expect(component.readOnly).toBeTruthy();
      expect(component.providerForm.disabled).toBeTruthy();
      expect(toastrService.success).toHaveBeenCalledWith('Business form submitted successfully');
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should show error toast if form is invalid', () => {
      component.providerForm.setValue({
        country: '',
        businessName: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        postalCode: '',
        serviceProviders: [],
      });
      component.onSubmit();
      expect(toastrService.error).toHaveBeenCalledWith('Please fill all required fields');
      expect(component.providerForm.touched).toBeTruthy();
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should handle localStorage error during submission', () => {
      component.providerForm.setValue({
        country: 'USA',
        businessName: 'Test Business',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        serviceProviders: [],
      });
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('LocalStorage error');
      });
      component.onSubmit();
      expect(toastrService.error).toHaveBeenCalledWith('Error saving business form');
      expect(console.error).toHaveBeenCalledWith('LocalStorage error:', expect.any(Error));
      expect(cdr.markForCheck).toHaveBeenCalled();
    });
  });

  describe('Form Cancel and Reset', () => {
    it('should reset form and enable it on cancel', () => {
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(mockProvider),
      } as any);
      component.openPopup();
      component.providerForm.setValue({
        country: 'USA',
        businessName: 'Test Business',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4',
        addressLine3: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        serviceProviders: component.serviceProvidersArray.value,
      });
      component.onCancel();
      expect(component.providerForm.value).toEqual({
        country: 'USA',
        businessName: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        postalCode: '',
        serviceProviders: component.serviceProvidersArray.value,
      });
      expect(component.readOnly).toBeFalsy();
      expect(component.providerForm.enabled).toBeTruthy();
      expect(toastrService.info).toHaveBeenCalledWith('Form reset');
      expect(cdr.markForCheck).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    it('should enable form and switch to edit mode', () => {
      component.readOnly = true;
      component.providerForm.disable();
      component.enableEditMode();
      expect(component.readOnly).toBeFalsy();
      expect(component.providerForm.enabled).toBeTruthy();
      expect(cdr.markForCheck).toHaveBeenCalled();
    });
  });

  describe('LocalStorage Loading', () => {
    it('should load service providers from localStorage', () => {
      const mockProviders = [
        mockProvider,
        {
          id: '2',
          spName: 'Provider 2',
          addressLine1: '789 Oak St',
          addressLine2: '',
          addressLine3: '',
          city: 'Boston',
          state: 'MA',
          postalCode: '02109',
          country: 'USA',
          businessName: '',
        },
      ];
      jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify(mockProviders));
      component.loadFromLocalStorage();
      expect(component.serviceProviders).toEqual(mockProviders);
      expect(component.serviceProvidersArray.length).toBe(2);
      expect(component.serviceProvidersArray.at(0).value).toEqual(mockProviders[0]);
      expect(component.serviceProvidersArray.at(1).value).toEqual(mockProviders[1]);
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should handle empty localStorage', () => {
      jest.spyOn(localStorage, 'getItem').mockReturnValue('[]');
      component.loadFromLocalStorage();
      expect(component.serviceProviders).toEqual([]);
      expect(component.serviceProvidersArray.length).toBe(0);
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should handle localStorage error during loading', () => {
      jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('LocalStorage error');
      });
      component.loadFromLocalStorage();
      expect(toastrService.error).toHaveBeenCalledWith('Error loading saved data');
      expect(console.error).toHaveBeenCalledWith('LocalStorage error:', expect.any(Error));
      expect(cdr.markForCheck).toHaveBeenCalled();
    });
  });

  describe('Save to LocalStorage', () => {
    it('should save form data to localStorage via onSubmit', () => {
      component.providerForm.setValue({
        country: 'USA',
        businessName: 'Test Business',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        serviceProviders: [],
      });
      component.onSubmit();
      expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
      expect(toastrService.success).toHaveBeenCalledWith('Business form submitted successfully');
    });

    it('should handle error when saving to localStorage via onSubmit', () => {
      component.providerForm.setValue({
        country: 'USA',
        businessName: 'Test Business',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        serviceProviders: [],
      });
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('LocalStorage error');
      });
      component.onSubmit();
      expect(console.error).toHaveBeenCalledWith('LocalStorage error:', expect.any(Error));
      expect(toastrService.error).toHaveBeenCalledWith('Error saving business form');
      expect(cdr.markForCheck).toHaveBeenCalled();
    });

    it('should save form data to localStorage via openPopup', () => {
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(mockProvider),
      } as any);
      component.openPopup();
      expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
    });

    it('should save form data to localStorage via deleteServiceProvider', () => {
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(mockProvider),
      } as any);
      component.openPopup();
      jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify([mockProvider]));
      component.deleteServiceProvider(0);
      expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
    });
  });

  describe('Track By Function', () => {
    it('should return provider id if available', () => {
      const provider = { id: '123', spName: 'Test' } as any;
      expect(component.trackByProvider(0, provider)).toBe('123');
    });

    it('should return index as string if no id', () => {
      const provider = { spName: 'Test' } as any;
      expect(component.trackByProvider(5, provider)).toBe('5');
    });
  });

  describe('UI Interactions', () => {
    it('should render form fields correctly', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('#country')).toBeTruthy();
      expect(compiled.querySelector('#businessName')).toBeTruthy();
      expect(compiled.querySelector('#addressLine1')).toBeTruthy();
      expect(compiled.querySelector('#addressLine2')).toBeTruthy();
      expect(compiled.querySelector('#addressLine3')).toBeTruthy();
      expect(compiled.querySelector('#city')).toBeTruthy();
      expect(compiled.querySelector('#state')).toBeTruthy();
      expect(compiled.querySelector('#postalCode')).toBeTruthy();
    });

    it('should show error messages when fields are invalid and touched', () => {
      component.providerForm.get('country')?.markAsTouched();
      component.providerForm.get('country')?.setValue('');
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const countryError = compiled.querySelector('#countryError');
      expect(countryError.textContent).toContain('Country is required');
      expect(countryError.classList).toContain('visible');
    });

    it('should disable submit button when form is invalid', () => {
      component.providerForm.setValue({
        country: '',
        businessName: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        postalCode: '',
        serviceProviders: [],
      });
      fixture.detectChanges();
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeTruthy();
    });

    it('should enable submit button when form is valid', () => {
      component.providerForm.setValue({
        country: 'USA',
        businessName: 'Test Business',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        serviceProviders: [],
      });
      fixture.detectChanges();
      const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
      expect(submitButton.disabled).toBeFalsy();
    });

    it('should show edit button in read-only mode', () => {
      component.readOnly = true;
      fixture.detectChanges();
      const editButton = fixture.nativeElement.querySelector('button[mat-icon="edit"]');
      expect(editButton).toBeTruthy();
    });

    it('should show service providers table when providers exist', () => {
      jest.spyOn(dialog, 'open').mockReturnValue({
        afterClosed: () => of(mockProvider),
      } as any);
      component.openPopup();
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const tableRows = compiled.querySelectorAll('tbody tr');
      expect(tableRows.length).toBe(1);
      expect(tableRows[0].querySelector('td').textContent).toContain('Provider 1');
    });

    it('should not show service providers table when no providers exist', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const tableRows = compiled.querySelectorAll('tbody tr');
      expect(tableRows.length).toBe(0);
    });
  });
});