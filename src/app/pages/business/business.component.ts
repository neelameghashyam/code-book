import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BusinessStore } from './store/business.store';
import { Business } from './business.model';
import { v4 as uuidv4 } from 'uuid';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { DarkModeService } from '../../services/dark-mode.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    }
  ],
  templateUrl: './business.component.html'
})
export class BusinessComponent {
  public darkModeService = inject(DarkModeService);
  public responsiveService = inject(ResponsiveService);

  business = signal<Business>({
    id: '',
    category: '',
    subCategory: '',
    name: '',
    country: '',
    phone: ''
  });

  categories = ['Retail', 'Food & Beverage', 'Services', 'Technology'];
  subCategories = ['Clothing', 'Restaurant', 'Consulting', 'Software'];
  isPublished = signal(false);
  isEditing = signal({ step1: false, step2: false, step3: false });

  private businessStore = inject(BusinessStore);

  // Validation methods for each step
  isStep1Valid(): boolean {
    return !!this.business().name && !!this.business().country;
  }

  isStep2Valid(): boolean {
    return !!this.business().category && !!this.business().subCategory;
  }

  isStep3Valid(): boolean {
    return !!this.business().phone;
  }

  publish() {
    if (confirm('Are you sure you want to publish this business?')) {
      const businessWithId = { ...this.business(), id: uuidv4() };
      this.businessStore.addBusiness(businessWithId);
      this.business.set(businessWithId);
      this.isPublished.set(true);
    }
  }

  resetForm() {
    this.business.set({
      id: '',
      category: '',
      subCategory: '',
      name: '',
      country: '',
      phone: ''

    });
    this.isPublished.set(false);
    this.isEditing.set({ step1: false, step2: false, step3: false });
  }

  toggleEdit(step: string) {
    this.isEditing.set({
      ...this.isEditing(),
      [step]: !this.isEditing()[step]
    });
  }

  updateBusiness() {
    if (this.business().id) {
      this.businessStore.updateBusiness(this.business());
    }
  }
}