import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
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
import { BusinessForm, ServiceProvider } from './interfaces';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
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
    TranslateModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  public providerForm: FormGroup;
  private _countries: string[] = [];
  public serviceProviders: ServiceProvider[] = [];
  responsiveClass: string = 'md:flex-row';
  readOnly: boolean = false;

  get countries(): string[] {
    return this._countries;
  }

  get serviceProvidersArray(): FormArray {
    return this.providerForm.get('serviceProviders') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private responsiveService: ResponsiveService,
    private translateService: TranslateService
  ) {
    this.providerForm = this.fb.group({
      country: ['', Validators.required],
      businessName: ['', [Validators.required, Validators.minLength(3)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      addressLine3: [''],
      city: ['', Validators.required],
      state: ['', Validators.pattern('^[A-Za-z0-9]{1,10}$')],
      postalCode: ['', [Validators.required, Validators.minLength(3)]],
      serviceProviders: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    const lang = localStorage.getItem('lang') || 'en';
    this.translateService.use(lang);

    this._countries = ['USA', 'Canada', 'UK', 'Australia', 'India'];
    this.loadFromLocalStorage();

    this.responsiveService.currentBreakpoint().subscribe((breakpoint) => {
      this.responsiveClass = breakpoint === 'xsmall' || breakpoint === 'small' ? 'flex-col' : 'md:flex-row';
      this.cdr.markForCheck();
    });
  }

  async openPopup(provider?: ServiceProvider, index?: number): Promise<void> {
    const { ServiceProviderComponent } = await import('./service-provider/service-provider.component');
    const dialogRef = this.dialog.open(ServiceProviderComponent, {
      width: '90%',
      maxWidth: '1200px',
      height: 'auto',
      maxHeight: '120vh',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '300ms',
      data: { isPopup: true, provider, index },
      autoFocus: true,
      restoreFocus: true,
      panelClass: 'custom-service-provider-dialog-large',
    });
  }

  public createServiceProviderFormGroup(provider: ServiceProvider): FormGroup {
    return this.fb.group({
      id: [provider?.id || ''],
      spName: [provider?.spName || '', Validators.required],
      addressLine1: [provider?.addressLine1 || '', Validators.required],
      addressLine2: [provider?.addressLine2 || ''],
      addressLine3: [provider?.addressLine3 || ''],
      city: [provider?.city || '', Validators.required],
      state: [provider?.state || ''],
      postalCode: [provider?.postalCode || '', Validators.required],
      country: [provider?.country || '', Validators.required],
      businessName: [provider?.businessName || ''],
    });
  }

  editServiceProvider(index: number): void {
    if (index >= 0 && index < this.serviceProviders.length) {
      this.openPopup(this.serviceProviders[index], index);
    }
  }

  deleteServiceProvider(index: number): void {
    if (index < 0 || index >= this.serviceProviders.length) {
      this.toastr.error('Invalid provider index');
      return;
    }

    try {
      const deletedProvider = this.serviceProviders.splice(index, 1)[0];
      this.serviceProvidersArray.removeAt(index);

      const existingProviders: ServiceProvider[] = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
      const updatedProviders = existingProviders.filter((provider) => provider.id !== deletedProvider.id);
      localStorage.setItem('serviceProviders', JSON.stringify(updatedProviders));

      this.toastr.success('Service provider deleted successfully');
    } catch (error) {
      this.toastr.error('Error deleting service provider');
      console.error('LocalStorage error:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  onSubmit(): void {
    if (this.providerForm.valid) {
      const formData: BusinessForm = {
        ...this.providerForm.value,
        serviceProviders: this.serviceProviders,
      };
      try {
        localStorage.setItem('businessForm', JSON.stringify(formData));
        this.toastr.success('Business form submitted successfully');
        this.readOnly = true;
        this.providerForm.disable();
      } catch (error) {
        this.toastr.error('Error saving business form');
        console.error('LocalStorage error:', error);
      }
    } else {
      this.toastr.error('Please fill all required fields');
      this.providerForm.markAllAsTouched();
    }
    this.cdr.markForCheck();
  }

  enableEditMode(): void {
    this.readOnly = false;
    this.providerForm.enable();
    this.cdr.markForCheck();
  }

  onCancel(): void {
    this.providerForm.reset({
      country: this.countries[0] || '',
      businessName: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      city: '',
      state: '',
      postalCode: '',
      serviceProviders: this.serviceProvidersArray.value,
    });
    this.readOnly = false;
    this.providerForm.enable();
    this.toastr.info('Form reset');
    this.cdr.markForCheck();
  }

  loadFromLocalStorage(): void {
    try {
      const providerData = localStorage.getItem('serviceProviders');
      let standaloneProviders: ServiceProvider[] = providerData ? JSON.parse(providerData) : [];
      this.serviceProviders = Array.from(
        new Map(standaloneProviders.map((provider) => [provider.id, provider])).values()
      );
      this.serviceProvidersArray.clear();
      this.serviceProviders.forEach((provider) => {
        this.serviceProvidersArray.push(this.createServiceProviderFormGroup(provider));
      });
    } catch (error) {
      this.toastr.error('Error loading saved data');
      console.error('LocalStorage error:', error);
    } finally {
      this.cdr.markForCheck();
    }
  }

  public saveToLocalStorage(): void {
    try {
      const formData: BusinessForm = {
        ...this.providerForm.value,
        serviceProviders: this.serviceProviders,
      };
      localStorage.setItem('businessForm', JSON.stringify(formData));
    } catch (error) {
      this.toastr.error('Error saving data');
      console.error('LocalStorage error:', error);
    }
  }

  trackByProvider(index: number, provider: ServiceProvider): string {
    return provider?.id || index.toString();
  }
}