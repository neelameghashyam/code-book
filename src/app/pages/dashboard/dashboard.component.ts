import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DarkModeService } from '../../services/dark-mode.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public darkModeService = inject(DarkModeService);
  public responsiveService = inject(ResponsiveService);
  public providerForm: FormGroup;
  private _countries: string[] = [];
  public exampleCountries: string[] = [];

  get countries(): string[] {
    return this._countries;
  }

  constructor(private fb: FormBuilder) {
    this.providerForm = this.fb.group({
      country: ['', Validators.required],
      spName: ['', [Validators.required, Validators.minLength(3)]],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      addressLine3: [''],
      city: ['', Validators.required],
      state: ['', Validators.pattern('^[A-Za-z]{2,3}$')],
      postalCode: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    this._countries = ['USA', 'Canada', 'UK', 'Australia', 'India'];
  }

  onSubmit() {
    console.log('Form Submitted - Raw Values:', this.providerForm.getRawValue());
    console.log('Form Valid:', this.providerForm.valid);
    console.log('Form Errors:', this.providerForm.errors);

    Object.keys(this.providerForm.controls).forEach(controlName => {
      const control = this.providerForm.get(controlName);
      if (control?.invalid) {
        console.log(`Control ${controlName} Errors:`, control.errors);
      }
    });

    if (this.providerForm.valid) {
      console.log('Form is valid! Submitting data:', this.providerForm.value);
    } else {
      console.log('Form is invalid. Please check the fields.');
      this.providerForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.providerForm.reset();
    this.providerForm.patchValue({
      country: this._countries[0]
    });
  }
}