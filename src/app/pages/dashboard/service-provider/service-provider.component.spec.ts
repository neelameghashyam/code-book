import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServiceProviderComponent } from './service-provider.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ResponsiveService } from '../../../services/responsive/responsive.service';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ServiceProviderComponent', () => {
  let component: ServiceProviderComponent;
  let fixture: ComponentFixture<ServiceProviderComponent>;
  let responsiveServiceMock: Partial<ResponsiveService>;
  let toastrServiceMock: Partial<ToastrService>;
  let dialogRefMock: Partial<MatDialogRef<ServiceProviderComponent>>;
  let dialogData: { isPopup: boolean; provider?: any };

  const mockProvider = {
    id: '123',
    country: 'USA',
    spName: 'Test Provider',
    addressLine1: '123 Main St',
    addressLine2: '',
    addressLine3: '',
    city: 'Test City',
    state: 'CA',
    postalCode: '12345',
  };

  beforeEach(async () => {
    responsiveServiceMock = {
      currentBreakpoint: jest.fn().mockReturnValue(of('medium')),
    };

    toastrServiceMock = {
      success: jest.fn(),
      error: jest.fn(),
    };

    dialogRefMock = {
      close: jest.fn(),
    };

    dialogData = { isPopup: true, provider: undefined };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        NoopAnimationsModule,
        MatIcon,
      ],
      providers: [
        { provide: ResponsiveService, useValue: responsiveServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    // Clear localStorage before each test
    localStorage.clear();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('constructor and form initialization', () => {
    it('should create component and initialize form without provider', () => {
      expect(component).toBeTruthy();
      expect(component.providerForm).toBeDefined();
      expect(component.providerForm.get('id')?.value).toBe('');
      expect(component.providerForm.get('country')?.value).toBe('');
      expect(component.isPopup).toBe(true);
      expect(component.providerId).toBeUndefined();
    });

    it('should initialize form with provider data', () => {
      dialogData.provider = mockProvider;
      fixture = TestBed.createComponent(ServiceProviderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.providerId).toBe(mockProvider.id);
      expect(component.providerForm.get('country')?.value).toBe(mockProvider.country);
      expect(component.providerForm.get('spName')?.value).toBe(mockProvider.spName);
      expect(component.providerForm.get('addressLine1')?.value).toBe(mockProvider.addressLine1);
      expect(component.providerForm.get('city')?.value).toBe(mockProvider.city);
      expect(component.providerForm.get('state')?.value).toBe(mockProvider.state);
      expect(component.providerForm.get('postalCode')?.value).toBe(mockProvider.postalCode);
    });

    it('should set isPopup to false when no dialog data provided', () => {
      dialogData.isPopup = false;
      fixture = TestBed.createComponent(ServiceProviderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isPopup).toBe(false);
    });
  });

  describe('ngOnInit', () => {
    it('should set responsiveClass to flex-col for xsmall breakpoint', () => {
      (responsiveServiceMock.currentBreakpoint as jest.Mock).mockReturnValue(of('xsmall'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('flex-col');
    });

    it('should set responsiveClass to flex-col for small breakpoint', () => {
      (responsiveServiceMock.currentBreakpoint as jest.Mock).mockReturnValue(of('small'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('flex-col');
    });

    it('should set responsiveClass to md:flex-row for medium breakpoint', () => {
      (responsiveServiceMock.currentBreakpoint as jest.Mock).mockReturnValue(of('medium'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('md:flex-row');
    });

    it('should set responsiveClass to md:flex-row for large breakpoint', () => {
      (responsiveServiceMock.currentBreakpoint as jest.Mock).mockReturnValue(of('large'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('md:flex-row');
    });

    it('should set responsiveClass to md:flex-row for xlarge breakpoint', () => {
      (responsiveServiceMock.currentBreakpoint as jest.Mock).mockReturnValue(of('xlarge'));
      component.ngOnInit();
      expect(component.responsiveClass).toBe('md:flex-row');
    });
  });

  describe('saveProvider', () => {
    it('should save new provider and close dialog when form is valid', fakeAsync(() => {
      component.providerForm.setValue({
        id: '',
        country: 'USA',
        spName: 'Test Provider',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
      });

      component.saveProvider();
      tick();

      expect(component.isSubmitting).toBe(false);
      expect(toastrServiceMock.success).toHaveBeenCalledWith('Service provider saved successfully');
      expect(dialogRefMock.close).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          country: 'USA',
          spName: 'Test Provider',
          addressLine1: '123 Main St',
          city: 'Test City',
          state: 'CA',
          postalCode: '12345',
        })
      );

      const savedProviders = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      expect(savedProviders.length).toBe(1);
      expect(savedProviders[0].spName).toBe('Test Provider');
    }));

    it('should update existing provider and close dialog when form is valid', fakeAsync(() => {
      localStorage.setItem('serviceProviders', JSON.stringify([mockProvider]));
      component.providerId = mockProvider.id;
      component.providerForm.setValue({
        id: mockProvider.id,
        country: 'Canada',
        spName: 'Updated Provider',
        addressLine1: '456 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'New City',
        state: 'ON',
        postalCode: '67890',
      });

      component.saveProvider();
      tick();

      expect(component.isSubmitting).toBe(false);
      expect(toastrServiceMock.success).toHaveBeenCalledWith('Service provider saved successfully');
      expect(dialogRefMock.close).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockProvider.id,
          country: 'Canada',
          spName: 'Updated Provider',
          addressLine1: '456 Main St',
          city: 'New City',
          state: 'ON',
          postalCode: '67890',
        })
      );

      const savedProviders = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      expect(savedProviders.length).toBe(1);
      expect(savedProviders[0].spName).toBe('Updated Provider');
    }));

    it('should handle error when saving provider', fakeAsync(() => {
      jest.spyOn(JSON, 'parse').mockImplementation(() => {
        throw new Error('Parse error');
      });

      component.providerForm.setValue({
        id: '',
        country: 'USA',
        spName: 'Test Provider',
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'Test City',
        state: 'CA',
        postalCode: '12345',
      });

      component.saveProvider();
      tick();

      expect(component.isSubmitting).toBe(false);
      expect(toastrServiceMock.error).toHaveBeenCalledWith('Error saving service provider');
      expect(dialogRefMock.close).not.toHaveBeenCalled();
    }));

    it('should show error and mark form as touched when form is invalid', () => {
      component.providerForm.setValue({
        id: '',
        country: '',
        spName: '',
        addressLine1: '',
        addressLine2: '',
        addressLine3: '',
        city: '',
        state: '',
        postalCode: '',
      });

      component.saveProvider();

      expect(component.isSubmitting).toBe(false);
      expect(toastrServiceMock.error).toHaveBeenCalledWith('Please fill all required fields');
      expect(component.providerForm.touched).toBe(true);
      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });
  });

  describe('closePopup', () => {
    it('should close dialog', () => {
      component.closePopup();
      expect(dialogRefMock.close).toHaveBeenCalled();
    });
  });

  describe('onCancel', () => {
    it('should reset form and set default country when not in popup', () => {
      dialogData.isPopup = false;
      fixture = TestBed.createComponent(ServiceProviderComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      component.providerForm.setValue({
        id: '123',
        country: 'Canada',
        spName: 'Test',
        addressLine1: '123 St',
        addressLine2: '',
        addressLine3: '',
        city: 'City',
        state: 'ON',
        postalCode: '12345',
      });

      component.onCancel();

      expect(component.providerForm.get('id')?.value).toBe('');
      expect(component.providerForm.get('country')?.value).toBe('USA');
      expect(component.providerForm.get('spName')?.value).toBe(null);
      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });

    it('should reset form, set default country, and close dialog when in popup', () => {
      component.providerForm.setValue({
        id: '123',
        country: 'Canada',
        spName: 'Test',
        addressLine1: '123 St',
        addressLine2: '',
        addressLine3: '',
        city: 'City',
        state: 'ON',
        postalCode: '12345',
      });

      component.onCancel();

      expect(component.providerForm.get('id')?.value).toBe('');
      expect(component.providerForm.get('country')?.value).toBe('USA');
      expect(component.providerForm.get('spName')?.value).toBe(null);
      expect(dialogRefMock.close).toHaveBeenCalled();
    });
  });
});