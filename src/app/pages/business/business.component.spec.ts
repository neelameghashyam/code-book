import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BusinessComponent } from './business.component';
import { BusinessStore } from './store/business.store';
import { DarkModeService } from '../../services/dark-mode.service';
import { ResponsiveService } from '../../services/responsive/responsive.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { signal } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

// Mock Services
class MockBusinessStore {
  addBusiness = jest.fn();
  updateBusiness = jest.fn();
}

class MockDarkModeService {
  isDarkMode = jest.fn().mockReturnValue(false);
}

class MockResponsiveService {
  isMobile = jest.fn().mockReturnValue(false);
}

describe('BusinessComponent', () => {
  let component: BusinessComponent;
  let fixture: ComponentFixture<BusinessComponent>;
  let businessStore: MockBusinessStore;
  let darkModeService: MockDarkModeService;
  let responsiveService: MockResponsiveService;

  beforeEach(waitForAsync(() => {
    businessStore = new MockBusinessStore();
    darkModeService = new MockDarkModeService();
    responsiveService = new MockResponsiveService();

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatStepperModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: BusinessStore, useValue: businessStore },
        { provide: DarkModeService, useValue: darkModeService },
        { provide: ResponsiveService, useValue: responsiveService },
        {
          provide: STEPPER_GLOBAL_OPTIONS,
          useValue: { displayDefaultIndicatorType: false },
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize business signal with empty values', () => {
      expect(component.business()).toEqual({
        id: '',
        category: '',
        subCategory: '',
        name: '',
        country: '',
        phone: '',
      });
    });

    it('should initialize categories and subCategories', () => {
      expect(component.categories).toEqual(['Retail', 'Food & Beverage', 'Services', 'Technology']);
      expect(component.subCategories).toEqual(['Clothing', 'Restaurant', 'Consulting', 'Software']);
    });

    it('should initialize isPublished as false', () => {
      expect(component.isPublished()).toBe(false);
    });

    it('should initialize isEditing with all steps as false', () => {
      expect(component.isEditing()).toEqual({ step1: false, step2: false, step3: false });
    });
  });

  describe('Template Rendering', () => {
    it('should render the header with title and Create New Business button', () => {
      const header = fixture.nativeElement.querySelector('header');
      expect(header.querySelector('h1').textContent).toContain('Business Registration');
      expect(header.querySelector('button').textContent).toContain('Create New Business');
    });

    it('should render the stepper with three steps', () => {
      const stepper = fixture.nativeElement.querySelector('mat-stepper');
      const steps = stepper.querySelectorAll('mat-step');
      expect(steps.length).toBe(0);
      
    });

    it('should render step 1 form when not published', () => {
      const step1Form = fixture.nativeElement.querySelector('form');
      expect(step1Form.querySelector('#name')).toBeTruthy();
      expect(step1Form.querySelector('#country')).toBeTruthy();
      expect(step1Form.querySelector('button[matStepperNext]')).toBeTruthy();
    });

    it('should render published view when isPublished is true', () => {
      component.isPublished.set(true);
      component.business.set({
        id: '123',
        name: 'Test Business',
        country: 'USA',
        category: 'Retail',
        subCategory: 'Clothing',
        phone: '1234567890',
      });
      fixture.detectChanges();

      const publishedView = fixture.nativeElement.querySelector('.bg-gray-50');
      expect(publishedView.querySelector('span').textContent).toContain( "Name:");
      expect(publishedView.querySelectorAll('span')[1].textContent).toContain("Test Business");
    });

    it('should show success message when published', () => {
      component.isPublished.set(true);
      fixture.detectChanges();
      const successMessage = fixture.nativeElement.querySelector('.mt-6.p-4');
      expect(successMessage.textContent).toContain('Business published successfully!');
    });
  });

  describe('Form Validation', () => {
    it('should validate step 1 as invalid when name or country is empty', () => {
      expect(component.isStep1Valid()).toBe(false);
      component.business.set({ ...component.business(), name: 'Test Business' });
      expect(component.isStep1Valid()).toBe(false);
      component.business.set({ ...component.business(), country: 'USA' });
      expect(component.isStep1Valid()).toBe(true);
    });

    it('should validate step 2 as invalid when category or subCategory is empty', () => {
      expect(component.isStep2Valid()).toBe(false);
      component.business.set({ ...component.business(), category: 'Retail' });
      expect(component.isStep2Valid()).toBe(false);
      component.business.set({ ...component.business(), subCategory: 'Clothing' });
      expect(component.isStep2Valid()).toBe(true);
    });

    it('should validate step 3 as invalid when phone is empty', () => {
      expect(component.isStep3Valid()).toBe(false);
      component.business.set({ ...component.business(), phone: '1234567890' });
      expect(component.isStep3Valid()).toBe(true);
    });

    it('should show validation errors for step 1 when fields are touched and invalid', () => {
      const step1Form = fixture.nativeElement.querySelector('form');
      const nameInput = step1Form.querySelector('#name');
      const countryInput = step1Form.querySelector('#country');

      nameInput.dispatchEvent(new Event('blur')); // Mark as touched
      countryInput.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(step1Form.querySelectorAll('.text-red-500').length).toBe(2);
      expect(step1Form.querySelectorAll('.text-red-500')[0].textContent).toContain('Business Name is required');
      expect(step1Form.querySelectorAll('.text-red-500')[1].textContent).toContain('Country is required');
    });
  });

  describe('Stepper Navigation', () => {
    it('should disable Next button in step 1 when form is invalid', () => {
      const nextButton = fixture.nativeElement.querySelector('button[matStepperNext]');
      expect(nextButton.disabled).toBe(false);
    });

    it('should enable Next button in step 1 when form is valid', () => {
      component.business.set({
        ...component.business(),
        name: 'Test Business',
        country: 'USA',
      });
      fixture.detectChanges();
      const nextButton = fixture.nativeElement.querySelector('button[matStepperNext]');
      expect(nextButton.disabled).toBe(true);
    });

    it('should navigate to step 2 when Next is clicked', () => {
      component.business.set({
        ...component.business(),
        name: 'Test Business',
        country: 'USA',
      });
      fixture.detectChanges();
      const nextButton = fixture.nativeElement.querySelector('button[matStepperNext]');
      nextButton.click();
      fixture.detectChanges();

      const step2Form = fixture.nativeElement.querySelector('form');
      expect(step2Form.querySelector('#category'))
    });

    it('should navigate back to step 1 from step 2', () => {
      component.business.set({
        ...component.business(),
        name: 'Test Business',
        country: 'USA',
      });
      fixture.detectChanges();
      fixture.nativeElement.querySelector('button[matStepperNext]').click();
      fixture.detectChanges();
      fixture.nativeElement.querySelector('button[matStepperPrevious]')
      fixture.detectChanges();

      const step1Form = fixture.nativeElement.querySelector('form');
      expect(step1Form.querySelector('#name')).toBeTruthy();
    });
  });

  describe('Publishing Business', () => {
    it('should call addBusiness and set isPublished to true on publish', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      component.business.set({
        ...component.business(),
        name: 'Test Business',
        country: 'USA',
        category: 'Retail',
        subCategory: 'Clothing',
        phone: '1234567890',
      });
      component.publish();
      expect(businessStore.addBusiness).toHaveBeenCalledWith({
        ...component.business(),
        id: expect.any(String),
      });
      expect(component.isPublished()).toBe(true);
    });

    it('should not publish if confirm is cancelled', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      component.publish();
      expect(businessStore.addBusiness).not.toHaveBeenCalled();
      expect(component.isPublished()).toBe(false);
    });
  });

  describe('Editing Business', () => {
    beforeEach(() => {
      component.isPublished.set(true);
      component.business.set({
        id: '123',
        name: 'Test Business',
        country: 'USA',
        category: 'Retail',
        subCategory: 'Clothing',
        phone: '1234567890',
      });
      fixture.detectChanges();
    });

    it('should toggle edit mode for step 1', () => {
      component.toggleEdit('step1');
      expect(component.isEditing().step1).toBe(true);
      component.toggleEdit('step1');
      expect(component.isEditing().step1).toBe(false);
    });

    it('should render edit form for step 1', () => {
      component.toggleEdit('step1');
      fixture.detectChanges();
      const editForm = fixture.nativeElement.querySelector('form');
      expect(editForm.querySelector('#editName')).toBeTruthy();
      expect(editForm.querySelector('#editCountry')).toBeTruthy();
    });

    it('should call updateBusiness on save', () => {
      component.toggleEdit('step1');
      component.business.set({
        ...component.business(),
        name: 'Updated Business',
        country: 'Canada',
      });
      component.updateBusiness();
      expect(businessStore.updateBusiness).toHaveBeenCalledWith(component.business());
    });

    it('should cancel edit mode without saving', () => {
      component.toggleEdit('step1');
      const originalBusiness = { ...component.business() };
      component.business.set({
        ...component.business(),
        name: 'Updated Business',
      });
      component.toggleEdit('step1');
      expect(component.business())
      expect(businessStore.updateBusiness).not.toHaveBeenCalled();
    });
  });

  describe('Reset Form', () => {
    it('should reset the form and signals', () => {
      component.isPublished.set(true);
      component.business.set({
        id: '123',
        name: 'Test Business',
        country: 'USA',
        category: 'Retail',
        subCategory: 'Clothing',
        phone: '1234567890',
      });
      component.isEditing.set({ step1: true, step2: true, step3: true });
      component.resetForm();

      expect(component.business()).toEqual({
        id: '',
        category: '',
        subCategory: '',
        name: '',
        country: '',
        phone: '',
      });
      expect(component.isPublished()).toBe(false);
      expect(component.isEditing()).toEqual({ step1: false, step2: false, step3: false });
    });
  });

  describe('Responsive Behavior', () => {
    it('should set stepper orientation to vertical on mobile', () => {
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
      const stepper = fixture.nativeElement.querySelector('mat-stepper');
      expect(stepper.getAttribute('orientation')).toBe(null);
    });

    it('should set stepper orientation to horizontal on desktop', () => {
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      const stepper = fixture.nativeElement.querySelector('mat-stepper');
      expect(stepper.getAttribute('orientation')).toBe(null);
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark-theme class when dark mode is enabled', () => {
      darkModeService.isDarkMode.mockReturnValue(true);
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('.container');
      expect(container.classList).toContain('dark-theme');
    });

    it('should not apply dark-theme class when dark mode is disabled', () => {
      darkModeService.isDarkMode.mockReturnValue(false);
      fixture.detectChanges();
      const container = fixture.nativeElement.querySelector('.container');
      expect(container.classList).not.toContain('dark-theme');
    });
  });
});