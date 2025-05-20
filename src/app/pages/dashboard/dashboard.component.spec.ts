import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ReactiveFormsModule, FormArray } from '@angular/forms';
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
import { of } from 'rxjs';
import { ServiceProviderComponent } from './service-provider/service-provider.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let toastrService: jest.Mocked<ToastrService>;
  let responsiveService: jest.Mocked<ResponsiveService>;
  let dialog: MatDialog;
  let translateService: TranslateService;

  beforeEach(async () => {
    // Mock services
    toastrService = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    } as any;
    responsiveService = {
      currentBreakpoint: jest.fn(),
    } as any;

    // Configure testing module
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
      ],
      providers: [
        { provide: ToastrService, useValue: toastrService },
        { provide: ResponsiveService, useValue: responsiveService },
        TranslateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    translateService = TestBed.inject(TranslateService);

    // Mock localStorage
    jest.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === 'lang') return 'en';
      if (key === 'serviceProviders') return JSON.stringify([]);
      if (key === 'businessForm') return null;
      return null;
    });
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {});
  });

  beforeEach(() => {
    responsiveService.currentBreakpoint.mockReturnValue(of('large'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct form controls', () => {
    expect(component.providerForm.get('country')).toBeTruthy();
    expect(component.providerForm.get('businessName')).toBeTruthy();
    expect(component.providerForm.get('addressLine1')).toBeTruthy();
    expect(component.providerForm.get('addressLine2')).toBeTruthy();
    expect(component.providerForm.get('addressLine3')).toBeTruthy();
    expect(component.providerForm.get('city')).toBeTruthy();
    expect(component.providerForm.get('state')).toBeTruthy();
    expect(component.providerForm.get('postalCode')).toBeTruthy();
    expect(component.providerForm.get('serviceProviders')).toBeTruthy();
  });

  it('should set translation language from localStorage on init', () => {
    const useSpy = jest.spyOn(translateService, 'use');
    component.ngOnInit();
    expect(useSpy).toHaveBeenCalledWith('en');
  });

  it('should initialize countries array', () => {
    expect(component.countries).toEqual(['USA', 'Canada', 'UK', 'Australia', 'India']);
  });

  it('should set responsive class based on breakpoint', () => {
    responsiveService.currentBreakpoint.mockReturnValue(of('small'));
    component.ngOnInit();
    expect(component.responsiveClass).toBe('flex-col');

    responsiveService.currentBreakpoint.mockReturnValue(of('xsmall'));
    component.ngOnInit();
    expect(component.responsiveClass).toBe('flex-col');

    responsiveService.currentBreakpoint.mockReturnValue(of('large'));
    component.ngOnInit();
    expect(component.responsiveClass).toBe('md:flex-row');
  });

  it('should load service providers from localStorage', () => {
    const mockProviders = [
      {
        id: '1',
        spName: 'Provider1',
        businessName: 'Business1', // Added businessName
        addressLine1: '123 Street',
        addressLine2: '',
        addressLine3: '',
        city: 'City',
        state: 'CA',
        postalCode: '12345',
        country: 'USA',
      },
    ];
    jest.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === 'serviceProviders') return JSON.stringify(mockProviders);
      return null;
    });

    component.loadFromLocalStorage();
    expect(component.serviceProviders).toEqual(mockProviders);
    expect(component.serviceProvidersArray.length).toBe(1);
    expect(component.serviceProvidersArray.at(0).value).toEqual(mockProviders[0]);
  });

  it('should handle empty service providers in localStorage', () => {
    jest.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === 'serviceProviders') return '[]';
      return null;
    });
    component.loadFromLocalStorage();
    expect(component.serviceProviders).toEqual([]);
    expect(component.serviceProvidersArray.length).toBe(0);
  });

  it('should handle localStorage error in loadFromLocalStorage', () => {
    jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    component.loadFromLocalStorage();
    expect(toastrService.error).toHaveBeenCalledWith('Error loading saved data');
    expect(console.error).toHaveBeenCalledWith('LocalStorage error:', expect.any(Error));
  });

  it('should open service provider dialog', () => {
    const dialogOpenSpy = jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of({
        id: '1',
        spName: 'New Provider',
        businessName: 'Business1', // Added businessName
        addressLine1: '123 Street',
        addressLine2: '',
        addressLine3: '',
        city: 'City',
        state: 'CA',
        postalCode: '12345',
        country: 'USA',
      }),
    } as any);

    component.openPopup();
    expect(dialogOpenSpy).toHaveBeenCalledWith(ServiceProviderComponent, {
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
  });

  it('should add new service provider from dialog', fakeAsync(() => {
    const newProvider = {
      id: '1',
      spName: 'New Provider',
      businessName: 'Business1', // Added businessName
      addressLine1: '123 Street',
      addressLine2: '',
      addressLine3: '',
      city: 'City',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    };
    jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(newProvider),
    } as any);

    component.openPopup();
    tick();
    expect(component.serviceProviders).toContain(newProvider);
    expect(component.serviceProvidersArray.length).toBe(1);
    expect(component.serviceProvidersArray.at(0).value).toEqual(newProvider);
    expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
  }));

  it('should update existing service provider from dialog', fakeAsync(() => {
    const existingProvider = {
      id: '1',
      spName: 'Provider1',
      businessName: 'Business1', // Added businessName
      addressLine1: '123 Street',
      addressLine2: '',
      addressLine3: '',
      city: 'City',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    };
    component.serviceProviders = [existingProvider];
    (component.providerForm.get('serviceProviders') as FormArray).push(
      component['createServiceProviderFormGroup'](existingProvider)
    );

    const updatedProvider = {
      id: '1',
      spName: 'Updated Provider',
      businessName: 'Business2', // Added businessName
      addressLine1: '456 Street',
      addressLine2: '',
      addressLine3: '',
      city: 'New City',
      state: 'NY',
      postalCode: '67890',
      country: 'Canada',
    };
    jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(updatedProvider),
    } as any);

    component.openPopup(existingProvider, 0);
    tick();
    expect(component.serviceProviders[0]).toEqual(updatedProvider);
    expect(component.serviceProvidersArray.at(0).value).toEqual(updatedProvider);
    expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
  }));

  it('should not add provider if dialog returns undefined', fakeAsync(() => {
    jest.spyOn(dialog, 'open').mockReturnValue({
      afterClosed: () => of(undefined),
    } as any);

    component.openPopup();
    tick();
    expect(component.serviceProviders.length).toBe(0);
    expect(component.serviceProvidersArray.length).toBe(0);
  }));

  it('should edit service provider', () => {
    const provider = {
      id: '1',
      spName: 'Provider1',
      businessName: 'Business1', // Added businessName
      addressLine1: '123 Street',
      addressLine2: '',
      addressLine3: '',
      city: 'City',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    };
    component.serviceProviders = [provider];
    const openPopupSpy = jest.spyOn(component, 'openPopup');
    component.editServiceProvider(0);
    expect(openPopupSpy).toHaveBeenCalledWith(provider, 0);
  });

  it('should delete service provider', () => {
    const provider = {
      id: '1',
      spName: 'Provider1',
      businessName: 'Business1', // Added businessName
      addressLine1: '123 Street',
      addressLine2: '',
      addressLine3: '',
      city: 'City',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    };
    component.serviceProviders = [provider];
    (component.providerForm.get('serviceProviders') as FormArray).push(
      component['createServiceProviderFormGroup'](provider)
    );

    jest.spyOn(localStorage, 'getItem').mockReturnValue(JSON.stringify([provider]));
    component.deleteServiceProvider(0);
    expect(component.serviceProviders.length).toBe(0);
    expect(component.serviceProvidersArray.length).toBe(0);
    expect(toastrService.success).toHaveBeenCalledWith('Service provider deleted successfully');
    expect(localStorage.setItem).toHaveBeenCalledWith('serviceProviders', JSON.stringify([]));
    expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
  });

  it('should handle error when deleting service provider', () => {
    const provider = {
      id: '1',
      spName: 'Provider1',
      businessName: 'Business1', // Added businessName
      addressLine1: '123 Street',
      addressLine2: '',
      addressLine3: '',
      city: 'City',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    };
    component.serviceProviders = [provider];
    (component.providerForm.get('serviceProviders') as FormArray).push(
      component['createServiceProviderFormGroup'](provider)
    );

    jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    component.deleteServiceProvider(0);
    expect(toastrService.error).toHaveBeenCalledWith('Error deleting service provider');
    expect(console.error).toHaveBeenCalledWith('LocalStorage error:', expect.any(Error));
  });

  it('should submit valid form', () => {
    component.providerForm.setValue({
      country: 'USA',
      businessName: 'Test Business',
      addressLine1: '123 Street',
      addressLine2: '',
      addressLine3: '',
      city: 'City',
      state: 'CA',
      postalCode: '12345',
      serviceProviders: [],
    });

    component.onSubmit();
    expect(localStorage.setItem).toHaveBeenCalledWith('businessForm', expect.any(String));
    expect(toastrService.success).toHaveBeenCalledWith('Business form submitted successfully');
    expect(component.readOnly).toBe(true);
    expect(component.providerForm.disabled).toBe(true);
  });

  it('should show error for invalid form submission', () => {
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
    expect(component.providerForm.touched).toBe(true);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('should handle localStorage error on form submission', () => {
    component.providerForm.setValue({
      country: 'USA',
      businessName: 'Test Business',
      addressLine1: '123 Street',
      addressLine2: '',
      addressLine3: '',
      city: 'City',
      state: 'CA',
      postalCode: '12345',
      serviceProviders: [],
    });

    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    component.onSubmit();
    expect(toastrService.error).toHaveBeenCalledWith('Error saving business form');
    expect(console.error).toHaveBeenCalledWith('LocalStorage error:', expect.any(Error));
  });

  it('should enable edit mode', () => {
    component.readOnly = true;
    component.providerForm.disable();
    component.enableEditMode();
    expect(component.readOnly).toBe(false);
    expect(component.providerForm.enabled).toBe(true);
  });

  it('should reset form on cancel', () => {
    component.providerForm.setValue({
      country: 'USA',
      businessName: 'Test Business',
      addressLine1: '123 Street',
      addressLine2: 'Apt 1',
      addressLine3: '',
      city: 'City',
      state: 'CA',
      postalCode: '12345',
      serviceProviders: [],
    });
    component.readOnly = true;
    component.providerForm.disable();

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
      serviceProviders: [],
    });
    expect(component.readOnly).toBe(false);
    expect(component.providerForm.enabled).toBe(true);
    expect(toastrService.info).toHaveBeenCalledWith('Form reset');
  });

  it('should handle localStorage error in saveToLocalStorage', () => {
    jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    component.serviceProviders = [
      {
        id: '1',
        spName: 'Provider1',
        businessName: 'Business1', // Added businessName
        addressLine1: '123 Street',
        addressLine2: '',
        addressLine3: '',
        city: 'City',
        state: 'CA',
        postalCode: '12345',
        country: 'USA',
      },
    ];
    component.openPopup();
    expect(console.error).toHaveBeenCalledWith('Error saving to localStorage:', expect.any(Error));
  });

  it('should track providers by id', () => {
    const provider = {
      id: '1',
      spName: 'Provider1',
      businessName: 'Business1', // Added businessName
      addressLine1: '123 Street',
      addressLine2: '',
      addressLine3: '',
      city: 'City',
      state: 'CA',
      postalCode: '12345',
      country: 'USA',
    };
    expect(component.trackByProvider(0, provider)).toBe('1');
    expect(component.trackByProvider(0, { ...provider, id: undefined } as any)).toBe('0');
  });

  it('should return countries getter', () => {
    expect(component.countries).toEqual(['USA', 'Canada', 'UK', 'Australia', 'India']);
  });

  it('should return serviceProvidersArray', () => {
    expect(component.serviceProvidersArray).toBe(component.providerForm.get('serviceProviders'));
  });
});