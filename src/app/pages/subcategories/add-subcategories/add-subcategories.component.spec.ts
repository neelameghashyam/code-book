import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSubcategoriesComponent } from './add-subcategories.component';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Subcategory } from '../subcategories';

// Mock dependencies
class MockMatDialogRef {
  close = jest.fn();
}

describe('AddSubcategoriesComponent', () => {
  let component: AddSubcategoriesComponent;
  let fixture: ComponentFixture<AddSubcategoriesComponent>;
  let mockDialogRef: MockMatDialogRef;

  beforeEach(async () => {
    mockDialogRef = new MockMatDialogRef();

    await TestBed.configureTestingModule({
      imports: [
        AddSubcategoriesComponent,
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatIconModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddSubcategoriesComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize formSubcategory with default values when no data is provided', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: {} });
    fixture = TestBed.createComponent(AddSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.formSubcategory).toEqual({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
      categoryId: 0,
      CategoryName: ''
    });
  });

  it('should initialize formSubcategory with subcategory data in edit mode', () => {
    const subcategory: Subcategory = {
      id: 1,
      name: 'Test Subcategory',
      icon: 'star',
      imageUrl: 'http://example.com/image.jpg',
      comments: 'Test comment',
      categoryId: 2,
      CategoryName: 'Test Category',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02'
    };
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { subcategory, categoryId: 2, CategoryName: 'Test Category' } });
    fixture = TestBed.createComponent(AddSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.formSubcategory).toEqual(subcategory);
  });

  it('should not close dialog when form is invalid in saveSubcategory', () => {
    component.formSubcategory = { name: '', icon: '', imageUrl: '', comments: '', categoryId: 1, CategoryName: 'Test' };
    const form = { invalid: true } as NgForm;

    component.saveSubcategory(form);

    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog with formSubcategory when form is valid and isFormInvalid is false', () => {
    component.formSubcategory = {
      name: 'Test Subcategory',
      icon: 'star',
      imageUrl: 'http://example.com/image.jpg',
      comments: 'Test comment',
      categoryId: 1,
      CategoryName: 'Test'
    };
    const form = { invalid: false } as NgForm;

    component.saveSubcategory(form);

    expect(mockDialogRef.close).toHaveBeenCalledWith(component.formSubcategory);
  });

  it('should return true in isFormInvalid when name is missing', () => {
    component.formSubcategory = { name: '', icon: 'star', imageUrl: 'http://example.com/image.jpg', comments: '', categoryId: 1, CategoryName: 'Test' };

    expect(component.isFormInvalid()).toBe(true);
  });

  it('should return true in isFormInvalid when icon is missing', () => {
    component.formSubcategory = { name: 'Test Subcategory', icon: '', imageUrl: 'http://example.com/image.jpg', comments: '', categoryId: 1, CategoryName: 'Test' };

    expect(component.isFormInvalid()).toBe(true);
  });

  it('should return true in isFormInvalid when imageUrl is missing', () => {
    component.formSubcategory = { name: 'Test Subcategory', icon: 'star', imageUrl: '', comments: '', categoryId: 1, CategoryName: 'Test' };

    expect(component.isFormInvalid()).toBe(true);
  });

  it('should return true in isFormInvalid when categoryId is 0', () => {
    component.formSubcategory = { name: 'Test Subcategory', icon: 'star', imageUrl: 'http://example.com/image.jpg', comments: '', categoryId: 0, CategoryName: 'Test' };

    expect(component.isFormInvalid()).toBe(true);
  });

  it('should return false in isFormInvalid when all required fields are present', () => {
    component.formSubcategory = { name: 'Test Subcategory', icon: 'star', imageUrl: 'http://example.com/image.jpg', comments: '', categoryId: 1, CategoryName: 'Test' };

    expect(component.isFormInvalid()).toBe(false);
  });

  it('should close dialog when cancel is called', () => {
    component.cancel();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should trigger saveSubcategory on form submission', () => {
    const saveSubcategorySpy = jest.spyOn(component, 'saveSubcategory');
    component.formSubcategory = { name: 'Test', icon: 'star', imageUrl: 'http://example.com/image.jpg', comments: '', categoryId: 1, CategoryName: 'Test' };
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(saveSubcategorySpy).toHaveBeenCalled();
  });

  it('should trigger cancel on cancel button click', () => {
    const cancelSpy = jest.spyOn(component, 'cancel');
    fixture.detectChanges();

    const cancelButton = fixture.debugElement.nativeElement.querySelector('button[aria-label="Cancel subcategory form"]');
    cancelButton.click();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should show validation errors for required fields when form is submitted', () => {
    component.formSubcategory = { name: '', icon: '', imageUrl: '', comments: '', categoryId: 1, CategoryName: 'Test' };
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const nameInput = fixture.debugElement.nativeElement.querySelector('#name');
    const iconInput = fixture.debugElement.nativeElement.querySelector('#icon');
    const imageUrlInput = fixture.debugElement.nativeElement.querySelector('#imageUrl');
    const nameError = fixture.debugElement.nativeElement.querySelector('#nameError');
    const iconError = fixture.debugElement.nativeElement.querySelector('#iconError');
    const imageUrlError = fixture.debugElement.nativeElement.querySelector('#imageUrlError');

    expect(nameInput.classList).toContain('border-red-500');
    expect(iconInput.classList).toContain('border-red-500');
    expect(imageUrlInput.classList).toContain('border-red-500');
    expect(nameError.classList).toContain('visible');
    expect(iconError.classList).toContain('visible');
    expect(imageUrlError.classList).toContain('visible');
  });

  it('should display "Add Subcategory" title when no subcategory is provided', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { categoryId: 1, CategoryName: 'Test' } });
    fixture = TestBed.createComponent(AddSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const title = fixture.debugElement.nativeElement.querySelector('h2').textContent;
    expect(title).toBe('Add Subcategory');
  });

  it('should display "Edit Subcategory" title when subcategory is provided', () => {
    const subcategory: Subcategory = {
      id: 1,
      name: 'Test Subcategory',
      icon: 'star',
      imageUrl: 'http://example.com/image.jpg',
      comments: 'Test comment',
      categoryId: 2,
      CategoryName: 'Test Category',
      createdAt: '2023-01-01',
      modifiedAt: '2023-01-02'
    };
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { subcategory, categoryId: 2, CategoryName: 'Test Category' } });
    fixture = TestBed.createComponent(AddSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const title = fixture.debugElement.nativeElement.querySelector('h2').textContent;
    expect(title).toBe('Edit Subcategory');
  });

  it('should disable save button when form is invalid', () => {
    component.formSubcategory = { name: '', icon: '', imageUrl: '', comments: '', categoryId: 1, CategoryName: 'Test' };
    fixture.detectChanges();

    const saveButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    expect(saveButton.disabled).toBe(true);
  });

  it('should enable save button when form is valid', () => {
    component.formSubcategory = { name: 'Test', icon: 'star', imageUrl: 'http://example.com/image.jpg', comments: '', categoryId: 1, CategoryName: 'Test' };
    fixture.detectChanges();

    const saveButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    expect(saveButton.disabled).toBe(false);
  });
});