import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ResponsiveService } from '../../../services/responsive/responsive.service';
import { ServiceProvider } from '../interfaces';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-service-provider',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIcon
  ],
  templateUrl: './service-provider.component.html',
  styleUrls: ['./service-provider.component.scss']
})
export class ServiceProviderComponent implements OnInit {
  providerForm: FormGroup;
  countries: string[] = ['USA', 'Canada', 'UK', 'Australia', 'India'];
  isPopup: boolean = false;
  providerId?: string;
  responsiveClass: string = 'md:flex-row';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private responsiveService: ResponsiveService,
    @Inject(MAT_DIALOG_DATA) public data: { isPopup: boolean; provider?: ServiceProvider },
    private dialogRef: MatDialogRef<ServiceProviderComponent>
  ) {
    this.isPopup = data?.isPopup || false;
    this.providerId = data?.provider?.id;
    this.providerForm = this.fb.group({
      id: [this.providerId || ''],
      country: ['', Validators.required],
      spName: ['', [Validators.required, Validators.minLength(3)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      addressLine3: [''],
      city: ['', Validators.required],
      state: ['', Validators.pattern('^[A-Za-z0-9]{1,10}$')],
      postalCode: ['', [Validators.required, Validators.minLength(3)]]
    });

    if (data?.provider) {
      this.providerForm.patchValue(data.provider);
    }
  }

  ngOnInit(): void {
    

    // Update layout based on breakpoint
    this.responsiveService.currentBreakpoint().subscribe(breakpoint => {
      this.responsiveClass = breakpoint === 'xsmall' || breakpoint === 'small' ? 'flex-col' : 'md:flex-row';
    });
  }

  async saveProvider(): Promise<void> {
    if (this.providerForm.valid) {
      this.isSubmitting = true;
      try {
        const providerData: ServiceProvider = {
          id: this.providerId || Date.now().toString(),
          ...this.providerForm.value
        };

        const existingProviders: ServiceProvider[] = JSON.parse(localStorage.getItem('serviceProviders') || '[]');
        
        if (this.providerId) {
          const index = existingProviders.findIndex(p => p.id === this.providerId);
          if (index !== -1) {
            existingProviders[index] = providerData;
          }
        } else {
          existingProviders.push(providerData);
        }

        localStorage.setItem('serviceProviders', JSON.stringify(existingProviders));

        this.dialogRef.close(providerData);
        this.toastr.success('Service provider saved successfully');
      } catch (error) {
        this.toastr.error('Error saving service provider');
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.toastr.error('Please fill all required fields');
      this.providerForm.markAllAsTouched();
      this.isSubmitting = false;
    }
  }

  closePopup(): void {
    this.dialogRef.close();
  }

  onCancel(): void {
    this.providerForm.reset();
    this.providerForm.patchValue({ country: this.countries[0] });
    if (this.isPopup) {
      this.closePopup();
    }
  }
}