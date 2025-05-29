import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ServiceProviderComponent } from './service-provider.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { ResponsiveService } from '../../../services/responsive/responsive.service';
import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ServiceProvider } from '../interfaces';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Mock TranslateLoader
class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({
      addServiceProviderForm: 'Add Service Provider',
      country: 'Country',
      serviceProviderName: 'Service Provider Name',
      addressLine1: 'Address Line 1',
      addressLine2: 'Address Line 2',
      addressLine3: 'Address Line 3',
      city: 'City',
      state: 'State',
      postalCode: 'Postal Code',
      businessName: 'Business Name',
      save: 'Save',
      cancel: 'Cancel',
      serviceProviderSaved: 'Service provider saved successfully',
      fillRequiredFields: 'Please fill all required fields',
      errorSavingProvider: 'Error saving provider',
      providerNotFound: 'Service provider not found'
    });
  }
}

describe('ServiceProviderComponent', () => {
  let component: ServiceProviderComponent;
  let fixture: ComponentFixture<ServiceProviderComponent>;
  let mockToastrService: { success: jest.Mock; error: jest.Mock };
  let mockResponsiveService: { currentBreakpoint: jest.Mock };
  let mockTranslateService: {
    use: jest.Mock;
    instant: jest.Mock<string, [string]>;
    get: jest.Mock;
    onTranslationChange: Subject<void>;
    onLangChange: Subject<void>;
    onDefaultLangChange: Subject<void>;
  };
  let mockDialogRef: { close: jest.Mock };
  let breakpointSubject: BehaviorSubject<string>;
  let dialogData: { isPopup: boolean; provider?: ServiceProvider };

  const mockServiceProvider: ServiceProvider = {
    id: '1',
    country: 'USA',
    spName: 'Test Provider',
    addressLine1: '123 Main St',
    addressLine2: '',
    addressLine3: '',
    city: 'Test City',
    state: 'CA',
    postalCode: '12345',
    businessName: 'Test Business'
  };

  beforeEach(async () => {
    mockToastrService = { success: jest.fn(), error: jest.fn() };
    mockResponsiveService = { currentBreakpoint: jest.fn() };
    mockTranslateService = {
      use: jest.fn().mockReturnValue(of('en')),
      instant: jest.fn(key => key),
      get: jest.fn(key => of(key)),
      onTranslationChange: new Subject<void>(),
      onLangChange: new Subject<void>(),
      onDefaultLangChange: new Subject<void>()
    };
    mockDialogRef = { close: jest.fn() };
    breakpointSubject = new BehaviorSubject<string>('medium');
    mockResponsiveService.currentBreakpoint.mockReturnValue(breakpointSubject.asObservable());

    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    dialogData = { isPopup: true, provider: null };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        }),
        ServiceProviderComponent
      ],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: mockToastrService },
        { provide: ResponsiveService, useValue: mockResponsiveService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceProviderComponent);
    component = fixture.componentInstance;
    // Defer detectChanges until tests need it
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    fixture.detectChanges();
  });

  it('should initialize form and countries', () => {
    expect(component.providerForm).toBeDefined();
    expect(component.countries).toEqual(['USA', 'Canada', 'UK', 'Australia', 'India']);
    expect(component.providerForm.get('country')?.value).toBe('');
    expect(component.isPopup).toBe(true);
    expect(component.providerId).toBeUndefined();
    fixture.detectChanges();
  });

  it('should patch form with provider data', async () => {
    dialogData.provider = mockServiceProvider;
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CommonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatIconModule,
        BrowserAnimationsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        }),
        ServiceProviderComponent
      ],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: mockToastrService },
        { provide: ResponsiveService, useValue: mockResponsiveService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ServiceProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.providerForm.get('spName')?.value).toBe('Test Provider');
    expect(component.providerId).toBe('1');
  });

  it('should set language from localStorage on init', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('fr');
    component.ngOnInit();
    expect(mockTranslateService.use).toHaveBeenCalledWith('fr');
    fixture.detectChanges();
  });

  it('should set default language to en if no lang in localStorage', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    component.ngOnInit();
    expect(mockTranslateService.use).toHaveBeenCalledWith('en');
    fixture.detectChanges();
  });

  it('should update responsiveClass based on breakpoint', () => {
    component.ngOnInit();
    breakpointSubject.next('small');
    expect(component.responsiveClass).toBe('flex-col');
    breakpointSubject.next('medium');
    expect(component.responsiveClass).toBe('md:flex-row');
    fixture.detectChanges();
  });

  it('should save valid new provider', fakeAsync(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    fixture.detectChanges();
    const newProvider = { ...mockServiceProvider, id: undefined };
    component.providerForm.setValue({
      id: '',
      country: newProvider.country,
      spName: newProvider.spName,
      addressLine1: newProvider.addressLine1,
      addressLine2: newProvider.addressLine2,
      addressLine3: newProvider.addressLine3,
      city: newProvider.city,
      state: newProvider.state,
      postalCode: newProvider.postalCode,
      businessName: newProvider.businessName
    });
    (localStorage.getItem as jest.Mock).mockReturnValue('[]');
    component.saveProvider();
    tick();
    expect(localStorage.setItem).toHaveBeenCalledWith('serviceProviders', expect.any(String));
    const setItemCall = (localStorage.setItem as jest.Mock).mock.calls[0];
    expect(JSON.parse(setItemCall[1])).toEqual([{ ...newProvider, id: '1234567890' }]);
    expect(mockDialogRef.close).toHaveBeenCalledWith({ ...newProvider, id: '1234567890' });
    expect(mockToastrService.success).toHaveBeenCalledWith('serviceProviderSaved');
    expect(component.isSubmitting).toBe(false);
  }));

  it('should save valid new provider with generated ID', fakeAsync(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
    fixture.detectChanges();
    const newProvider = { ...mockServiceProvider, id: undefined };
    component.providerForm.setValue({
      id: '',
      country: newProvider.country,
      spName: newProvider.spName,
      addressLine1: newProvider.addressLine1,
      addressLine2: newProvider.addressLine2,
      addressLine3: newProvider.addressLine3,
      city: newProvider.city,
      state: newProvider.state,
      postalCode: newProvider.postalCode,
      businessName: newProvider.businessName
    });
    (localStorage.getItem as jest.Mock).mockReturnValue('[]');
    component.saveProvider();
    tick();
    expect(localStorage.setItem).toHaveBeenCalledWith('serviceProviders', expect.any(String));
    const setItemCall = (localStorage.setItem as jest.Mock).mock.calls[0];
    expect(JSON.parse(setItemCall[1])).toEqual([{ ...newProvider, id: '1234567890' }]);
    expect(mockDialogRef.close).toHaveBeenCalledWith({ ...newProvider, id: '1234567890' });
    expect(mockToastrService.success).toHaveBeenCalledWith('serviceProviderSaved');
    expect(component.isSubmitting).toBe(false);
  }));

  it('should handle invalid form in saveProvider', fakeAsync(() => {
    fixture.detectChanges();
    component.providerForm.get('spName')?.setValue('');
    component.saveProvider();
    tick();
    expect(mockToastrService.error).toHaveBeenCalledWith('fillRequiredFields');
    expect(component.providerForm.get('spName')?.touched).toBe(true);
    expect(component.isSubmitting).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  }));

  it('should handle localStorage error in saveProvider', fakeAsync(() => {
    fixture.detectChanges();
    component.providerForm.setValue(mockServiceProvider);
    (localStorage.getItem as jest.Mock).mockReturnValue('[]');
    (localStorage.setItem as jest.Mock).mockImplementation(() => { throw new Error('Storage error'); });
    component.saveProvider();
    tick();
    expect(mockToastrService.error).toHaveBeenCalledWith('errorSavingProvider');
    expect(component.isSubmitting).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  }));

  it('should handle invalid localStorage data in saveProvider', fakeAsync(() => {
    fixture.detectChanges();
    component.providerForm.setValue(mockServiceProvider);
    (localStorage.getItem as jest.Mock).mockReturnValue('invalid-json');
    component.saveProvider();
    tick();
    expect(mockToastrService.error).toHaveBeenCalledWith('errorSavingProvider');
    expect(component.isSubmitting).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  }));

 
  it('should update existing provider', fakeAsync(() => {
    fixture.detectChanges();
    component.providerForm.setValue(mockServiceProvider);
    component.providerId = '1';
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([mockServiceProvider]));
    component.saveProvider();
    tick();
    expect(localStorage.setItem).toHaveBeenCalledWith('serviceProviders', expect.any(String));
    const setItemCall = (localStorage.setItem as jest.Mock).mock.calls[0];
    expect(JSON.parse(setItemCall[1])).toEqual([mockServiceProvider]);
    expect(mockDialogRef.close).toHaveBeenCalledWith(mockServiceProvider);
    expect(mockToastrService.success).toHaveBeenCalledWith('serviceProviderSaved');
  }));

  it('should handle provider ID not found', fakeAsync(() => {
    fixture.detectChanges();
    component.providerForm.setValue(mockServiceProvider);
    component.providerId = '2';
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([mockServiceProvider]));
    component.saveProvider();
    tick();
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(mockToastrService.error).toHaveBeenCalledWith('providerNotFound');
    expect(mockDialogRef.close).not.toHaveBeenCalled();
    expect(component.isSubmitting).toBe(false);
  }));

  it('should close popup', () => {
    fixture.detectChanges();
    component.closePopup();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should cancel form and close popup', () => {
    fixture.detectChanges();
    component.isPopup = true;
    component.onCancel();
    expect(component.providerForm.get('country')?.value).toBe('USA');
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should cancel form without closing popup', () => {
    fixture.detectChanges();
    component.isPopup = false;
    component.onCancel();
    expect(component.providerForm.get('country')?.value).toBe('USA');
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should initialize without provider data', () => {
    dialogData.provider = undefined;
    fixture.detectChanges();
    expect(component.providerForm.get('spName')?.value).toBe('');
    expect(component.providerId).toBeUndefined();
  });
});