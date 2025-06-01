import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSubcategoriesComponent } from './add-subcategories.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
        ReactiveFormsModule, // Use ReactiveFormsModule
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with required fields', () => {
    expect(component.subcategoryForm).toBeTruthy();
    expect(component.subcategoryForm.get('name')).toBeTruthy();
    expect(component.subcategoryForm.get('icon')).toBeTruthy();
    expect(component.subcategoryForm.get('imageUrl')).toBeTruthy();
    expect(component.subcategoryForm.get('categoryId')).toBeTruthy();
  });

  it('should not close dialog when form is invalid in saveSubcategory', () => {
    component.subcategoryForm.setValue({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
      categoryId: 0,
      CategoryName: '',
    });
    component.saveSubcategory();

    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog with form value when form is valid', () => {
    const validFormValue = {
      name: 'Test Subcategory',
      icon: 'star',
      imageUrl: 'http://example.com/image.jpg',
      comments: 'Test comment',
      categoryId: 1,
      CategoryName: 'Test',
    };
    component.subcategoryForm.setValue(validFormValue);
    component.saveSubcategory();

    expect(mockDialogRef.close).toHaveBeenCalledWith(validFormValue);
  });

  it('should mark all controls as touched when form is invalid', () => {
    component.subcategoryForm.setValue({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
      categoryId: 0,
      CategoryName: '',
    });
    component.saveSubcategory();

    expect(component.subcategoryForm.get('name')?.touched).toBe(true);
    expect(component.subcategoryForm.get('icon')?.touched).toBe(true);
    expect(component.subcategoryForm.get('imageUrl')?.touched).toBe(true);
    expect(component.subcategoryForm.get('categoryId')?.touched).toBe(true);
  });

  it('should close dialog when cancel is called', () => {
    component.cancel();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should trigger saveSubcategory on form submission', () => {
    const saveSubcategorySpy = jest.spyOn(component, 'saveSubcategory');
    component.subcategoryForm.setValue({
      name: 'Test',
      icon: 'star',
      imageUrl: 'http://example.com/image.jpg',
      comments: '',
      categoryId: 1,
      CategoryName: 'Test',
    });
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(saveSubcategorySpy).toHaveBeenCalled();
  });

  it('should disable save button when form is invalid', () => {
    component.subcategoryForm.setValue({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
      categoryId: 0,
      CategoryName: '',
    });
    fixture.detectChanges();

    const saveButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    expect(saveButton.disabled).toBe(true);
  });

  it('should enable save button when form is valid', () => {
    component.subcategoryForm.setValue({
      name: 'Test',
      icon: 'star',
      imageUrl: 'http://example.com/image.jpg',
      comments: '',
      categoryId: 1,
      CategoryName: 'Test',
    });
    fixture.detectChanges();

    const saveButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    expect(saveButton.disabled).toBe(false);
  });


  it('should show validation errors for required fields when form is submitted', () => {
    component.subcategoryForm.setValue({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
      categoryId: 0,
      CategoryName: '',
    });
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const nameError = fixture.debugElement.nativeElement.querySelector('mat-error');
    expect(nameError).toBeTruthy();
    expect(nameError.textContent).toContain('Subcategory Name is required');
  });
});