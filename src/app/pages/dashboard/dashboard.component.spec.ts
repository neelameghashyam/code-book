import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
import { ServiceProviderComponent } from './service-provider/service-provider.component';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectorRef } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let responsiveServiceMock: Partial<ResponsiveService>;
  let toastrServiceMock: Partial<ToastrService>;
  let dialogMock: Partial<MatDialog>;
  let cdrMock: Partial<ChangeDetectorRef>;
  let dialogRefMock: { afterClosed: jest.Mock };
  let fb: FormBuilder;

  const mockProvider: any = {
    id: '123',
    spName: 'Test Provider',
    addressLine1: '123 Main St',
    addressLine2: '',
    addressLine3: '',
    city: 'Test City',
    state: 'CA',
    postalCode: '12345',
    country: 'USA',
  };

  const mockProvider2: any = {
    id: '456',
    spName: 'Another Provider',
    addressLine1: '456 Elm St',
    addressLine2: '',
    addressLine3: '',
    city: 'Another City',
    state: 'NY',
    postalCode: '67890',
    country: 'USA',
  };

  beforeEach(async () => {
    responsiveServiceMock = {
      currentBreakpoint: jest.fn().mockReturnValue(of('medium')),
    };

    toastrServiceMock = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    };

    dialogRefMock = {
      afterClosed: jest.fn().mockReturnValue(of(undefined)),
    };

    dialogMock = {
      open: jest.fn().mockReturnValue(dialogRefMock),
    };

    cdrMock = {
      markForCheck: jest.fn(),
    };

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
        NoopAnimationsModule,
      ],
      providers: [
        FormBuilder,
        { provide: ResponsiveService, useValue: responsiveServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: ChangeDetectorRef, useValue: cdrMock },
      ],
    }).compileComponents();

    fb = TestBed.inject(FormBuilder);
    localStorage.clear();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('constructor and form initialization', () => {
    it('should create component and initialize form', () => {
      expect(component).toBeTruthy();
      expect(component.providerForm).toBeDefined();
      expect(component.providerForm.get('country')?.value).toBe('');
      expect(component.providerForm.get('businessName')?.value).toBe('');
      expect(component.serviceProvidersArray).toBeInstanceOf(FormArray);
      expect(component.serviceProvidersArray.length).toBe(0);
      expect(component.readOnly).toBe(false);
      expect(component.responsiveClass).toBe('md:flex-row');
    });
  });

  describe('ngOnInit', () => {
    it('should initialize countries and load from localStorage', () => {
      component.ngOnInit();
      expect(component.countries).toEqual(['USA', 'Canada', 'UK', 'Australia', 'India']);
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });

    it('should set responsiveClass to flex-col for xsmall breakpoint', () => {
      (responsiveServiceMock.currentBreakpoint as jest.Mock).mockReturnValue(of('xsmall'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('flex-col');
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });

    it('should set responsiveClass to flex-col for small breakpoint', () => {
      (responsiveServiceMock.currentBreakpoint as jest.Mock).mockReturnValue(of('small'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('flex-col');
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });

    it('should set responsiveClass to md:flex-row for medium breakpoint', () => {
      (responsiveServiceMock.currentBreakpoint as jest.Mock).mockReturnValue(of('medium'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('md:flex-row');
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });

    it('should set responsiveClass to md:flex-row for large breakpoint', () => {
      (responsiveServiceMock.currentBreakpoint as jest.Mock).mockReturnValue(of('large'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('md:flex-row');
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });

    it('should set responsiveClass to md:flex-row for xlarge breakpoint', () => {
      (responsiveServiceMock.currentBreakpoint as jest.Mock).mockReturnValue(of('xlarge'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('md:flex-row');
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });
  });

  describe('countries getter', () => {
    it('should return countries array', () => {
      component.ngOnInit();
      expect(component.countries).toEqual(['USA', 'Canada', 'UK', 'Australia', 'India']);
    });
  });

  describe('serviceProvidersArray getter', () => {
    it('should return serviceProviders FormArray', () => {
      expect(component.serviceProvidersArray).toBe(component.providerForm.get('serviceProviders'));
      expect(component.serviceProvidersArray).toBeInstanceOf(FormArray);
    });
  });

  describe('openPopup', () => {
    it('should open dialog for adding new provider', () => {
      component.openPopup();
      expect(dialogMock.open).toHaveBeenCalledWith(ServiceProviderComponent, expect.objectContaining({
        data: { isPopup: true, provider: undefined, index: undefined },
      }));
    });

    it('should open dialog for editing existing provider', () => {
      component.serviceProviders = [mockProvider];
      component.openPopup(mockProvider, 0);
      expect(dialogMock.open).toHaveBeenCalledWith(ServiceProviderComponent, expect.objectContaining({
        data: { isPopup: true, provider: mockProvider, index: 0 },
      }));
    });

    it('should add new provider after dialog closes with result', () => {
      dialogRefMock.afterClosed.mockReturnValue(of(mockProvider));
      component.openPopup(); // index is undefined, triggers else branch
      expect(component.serviceProviders).toContain(mockProvider);
      expect(component.serviceProvidersArray.length).toBe(1);
      expect(component.serviceProvidersArray.at(0).value).toEqual(mockProvider);
      expect(cdrMock.markForCheck).toHaveBeenCalled();
      expect(localStorage.getItem('businessForm')).toBeDefined();
    });

    it('should update existing provider after dialog closes with result', () => {
      component.serviceProviders = [mockProvider];
      component.serviceProvidersArray.push(fb.group({
        id: [mockProvider.id],
        spName: [mockProvider.spName, Validators.required],
        addressLine1: [mockProvider.addressLine1, Validators.required],
        addressLine2: [mockProvider.addressLine2],
        addressLine3: [mockProvider.addressLine3],
        city: [mockProvider.city, Validators.required],
        state: [mockProvider.state],
        postalCode: [mockProvider.postalCode, Validators.required],
        country: [mockProvider.country, Validators.required],
      }));
      const updatedProvider = { ...mockProvider, spName: 'Updated Provider' };
      dialogRefMock.afterClosed.mockReturnValue(of(updatedProvider));
      component.openPopup(mockProvider, 0); // index is defined, triggers if branch
      expect(component.serviceProviders[0]).toEqual(updatedProvider);
      expect(component.serviceProvidersArray.at(0).value).toEqual(updatedProvider);
      expect(cdrMock.markForCheck).toHaveBeenCalled();
      expect(localStorage.getItem('businessForm')).toBeDefined();
    });

    it('should not update providers if dialog closes without result', () => {
      dialogRefMock.afterClosed.mockReturnValue(of(undefined));
      component.serviceProviders = [mockProvider];
      component.openPopup();
      expect(component.serviceProviders).toEqual([mockProvider]);
      expect(component.serviceProvidersArray.length).toBe(0);
      expect(cdrMock.markForCheck).not.toHaveBeenCalled();
    });
  });

  describe('editServiceProvider', () => {
    it('should call openPopup with provider and index', () => {
      jest.spyOn(component, 'openPopup');
      component.serviceProviders = [mockProvider];
      component.editServiceProvider(0);
      expect(component.openPopup).toHaveBeenCalledWith(mockProvider, 0);
    });
  });

  describe('deleteServiceProvider', () => {
    it('should delete provider and update localStorage', () => {
      localStorage.setItem('serviceProviders', JSON.stringify([mockProvider]));
      component.serviceProviders = [mockProvider];
      component.serviceProvidersArray.push(fb.group({
        id: [mockProvider.id],
        spName: [mockProvider.spName, Validators.required],
        addressLine1: [mockProvider.addressLine1, Validators.required],
        addressLine2: [mockProvider.addressLine2],
        addressLine3: [mockProvider.addressLine3],
        city: [mockProvider.city, Validators.required],
        state: [mockProvider.state],
        postalCode: [mockProvider.postalCode, Validators.required],
        country: [mockProvider.country, Validators.required],
      }));

      component.deleteServiceProvider(0);

      expect(component.serviceProviders).toEqual([]);
      expect(component.serviceProvidersArray.length).toBe(0);
      expect(localStorage.getItem('serviceProviders')).toBe('[]');
      expect(toastrServiceMock.success).toHaveBeenCalledWith('Service provider deleted successfully');
      expect(cdrMock.markForCheck).toHaveBeenCalled();
      expect(localStorage.getItem('businessForm')).toBeDefined();
    });

    it('should handle error when deleting provider', () => {
      jest.spyOn(JSON, 'parse').mockImplementation(() => {
        throw new Error('Parse error');
      });
      component.serviceProviders = [mockProvider];
      component.serviceProvidersArray.push(fb.group({
        id: [mockProvider.id],
        spName: [mockProvider.spName, Validators.required],
        addressLine1: [mockProvider.addressLine1, Validators.required],
        addressLine2: [mockProvider.addressLine2],
        addressLine3: [mockProvider.addressLine3],
        city: [mockProvider.city, Validators.required],
        state: [mockProvider.state],
        postalCode: [mockProvider.postalCode, Validators.required],
        country: [mockProvider.country, Validators.required],
      }));

      component.deleteServiceProvider(0);

      expect(toastrServiceMock.error).toHaveBeenCalledWith('Error deleting service provider');
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });
  });

  describe('onSubmit', () => {
    it('should save form and switch to read-only mode when valid', () => {
      component.providerForm.setValue({
        country: 'USA',
        businessName: 'Test Business',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        serviceProviders: [],
      });

      component.onSubmit();

      expect(localStorage.getItem('businessForm')).toBeDefined();
      expect(toastrServiceMock.success).toHaveBeenCalledWith('Business form submitted successfully');
      expect(component.readOnly).toBe(true);
      expect(component.providerForm.disabled).toBe(true);
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });

    it('should show error and mark form as touched when invalid', () => {
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

      expect(toastrServiceMock.error).toHaveBeenCalledWith('Please fill all required fields');
      expect(component.providerForm.touched).toBe(true);
      expect(component.readOnly).toBe(false);
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });

    it('should handle error when saving form', () => {
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});
      component.providerForm.setValue({
        country: 'USA',
        businessName: 'Test Business',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        serviceProviders: [],
      });

      component.onSubmit();

      expect(toastrServiceMock.error).toHaveBeenCalledWith('Error saving business form');
      expect(console.error).toHaveBeenCalledWith('LocalStorage error:', expect.any(Error));
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });
  });

  describe('enableEditMode', () => {
    it('should enable form and set readOnly to false', () => {
      component.readOnly = true;
      component.providerForm.disable();
      component.enableEditMode();
      expect(component.readOnly).toBe(false);
      expect(component.providerForm.enabled).toBe(true);
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should reset form, set default country, and enable form', () => {
      component.serviceProviders = [mockProvider];
      component.serviceProvidersArray.push(fb.group({
        id: [mockProvider.id],
        spName: [mockProvider.spName, Validators.required],
        addressLine1: [mockProvider.addressLine1, Validators.required],
        addressLine2: [mockProvider.addressLine2],
        addressLine3: [mockProvider.addressLine3],
        city: [mockProvider.city, Validators.required],
        state: [mockProvider.state],
        postalCode: [mockProvider.postalCode, Validators.required],
        country: [mockProvider.country, Validators.required],
      }));
      component.providerForm.setValue({
        country: 'Canada',
        businessName: 'Test',
        addressLine1: '123 St',
        addressLine2: '',
        addressLine3: '',
        city: 'City',
        state: 'ON',
        postalCode: '12345',
        serviceProviders: [mockProvider],
      });
      component.readOnly = true;
      component.providerForm.disable();

      component.onCancel();

      expect(component.providerForm.get('country')?.value).toBe('USA');
      expect(component.providerForm.get('businessName')?.value).toBe('');
      expect(component.providerForm.get('serviceProviders')?.value).toEqual([mockProvider]);
      expect(component.readOnly).toBe(false);
      expect(component.providerForm.enabled).toBe(true);
      expect(toastrServiceMock.info).toHaveBeenCalledWith('Form reset');
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });
  });

  describe('loadFromLocalStorage', () => {
    it('should load service providers from localStorage', () => {
      localStorage.setItem('serviceProviders', JSON.stringify([mockProvider]));
      component.loadFromLocalStorage();
      expect(component.serviceProviders).toEqual([mockProvider]);
      expect(component.serviceProvidersArray.length).toBe(1);
      expect(component.serviceProvidersArray.at(0).value).toEqual(mockProvider);
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });

    it('should handle empty serviceProviders in localStorage', () => {
      localStorage.setItem('serviceProviders', '[]');
      component.loadFromLocalStorage();
      expect(component.serviceProviders).toEqual([]);
      expect(component.serviceProvidersArray.length).toBe(0);
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });

    it('should handle duplicate providers in localStorage', () => {
      const duplicateProviders = [mockProvider, mockProvider, mockProvider2];
      localStorage.setItem('serviceProviders', JSON.stringify(duplicateProviders));
      component.loadFromLocalStorage();
      expect(component.serviceProviders).toEqual([mockProvider, mockProvider2]);
      expect(component.serviceProvidersArray.length).toBe(2);
      expect(component.serviceProvidersArray.at(0).value).toEqual(mockProvider);
      expect(component.serviceProvidersArray.at(1).value).toEqual(mockProvider2);
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });

    it('should handle error when loading from localStorage', () => {
      jest.spyOn(JSON, 'parse').mockImplementation(() => {
        throw new Error('Parse error');
      });
      localStorage.setItem('serviceProviders', JSON.stringify([mockProvider]));
      component.loadFromLocalStorage();
      expect(toastrServiceMock.error).toHaveBeenCalledWith('Error loading saved data');
      expect(cdrMock.markForCheck).toHaveBeenCalled();
    });
  });

  describe('saveToLocalStorage', () => {
    it('should save form data to localStorage', () => {
      component.serviceProviders = [mockProvider];
      component.providerForm.setValue({
        country: 'USA',
        businessName: 'Test Business',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
        serviceProviders: [mockProvider],
      });

      dialogRefMock.afterClosed.mockReturnValue(of(mockProvider));
      component.openPopup();

      const savedData = JSON.parse(localStorage.getItem('businessForm') || '{}');
      expect(savedData.serviceProviders).toEqual([mockProvider]);
    });

    it('should handle error when saving to localStorage', () => {
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      jest.spyOn(console, 'error').mockImplementation(() => {});
      dialogRefMock.afterClosed.mockReturnValue(of(mockProvider));
      component.openPopup();
      expect(console.error).toHaveBeenCalledWith('Error saving to localStorage:', expect.any(Error));
    });
  });

  describe('trackByProvider', () => {
    it('should return provider id if present', () => {
      expect(component.trackByProvider(0, mockProvider)).toBe(mockProvider.id);
    });

    it('should return index as string if provider id is not present', () => {
      const providerWithoutId = { ...mockProvider, id: undefined };
      expect(component.trackByProvider(5, providerWithoutId)).toBe('5');
    });
  });
});