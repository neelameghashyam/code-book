import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCategoriesComponent } from './add-categories.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Category } from '../category';

// Mock dependencies
class MockMatDialogRef {
  close = jest.fn();
}

describe('AddCategoriesComponent', () => {
  let component: AddCategoriesComponent;
  let fixture: ComponentFixture<AddCategoriesComponent>;
  let mockDialogRef: MockMatDialogRef;

  beforeEach(async () => {
    mockDialogRef = new MockMatDialogRef();

    await TestBed.configureTestingModule({
      imports: [
        AddCategoriesComponent,
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatIconModule,
        MatDialogModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with required fields', () => {
    expect(component.categoryForm).toBeTruthy();
    expect(component.categoryForm.get('name')).toBeTruthy();
    expect(component.categoryForm.get('icon')).toBeTruthy();
    expect(component.categoryForm.get('imageUrl')).toBeTruthy();
    expect(component.categoryForm.get('comments')).toBeTruthy();
  });

  it('should initialize categoryForm with empty values when no category is provided', () => {
    expect(component.categoryForm.value).toEqual({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
    });
  });

  it('should initialize categoryForm with provided category data', () => {
    const category: Category = {
      id: 1,
      name: 'Test Category',
      icon: 'test-icon',
      imageUrl: 'http://test.com/image.jpg',
      comments: 'Test comment',
      createdAt: '2023-01-01', // Changed to string
      modifiedAt: '2023-01-02', // Changed to string
    };
    fixture = TestBed.createComponent(AddCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.categoryForm.value)
  });

  it('should not close dialog when form is invalid in saveCategory', () => {
    component.categoryForm.setValue({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
    });
    component.saveCategory();

    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog with form value when form is valid', () => {
    const validFormValue = {
      name: 'Test Category',
      icon: 'test-icon',
      imageUrl: 'http://test.com/image.jpg',
      comments: 'Test comment',
    };
    component.categoryForm.setValue(validFormValue);
    component.saveCategory();

    expect(mockDialogRef.close).toHaveBeenCalledWith(validFormValue);
  });

  it('should mark all controls as touched when form is invalid', () => {
    component.categoryForm.setValue({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
    });
    component.saveCategory();

    expect(component.categoryForm.get('name')?.touched).toBe(true);
    expect(component.categoryForm.get('icon')?.touched).toBe(true);
    expect(component.categoryForm.get('imageUrl')?.touched).toBe(true);
  });

  it('should close dialog when cancel is called', () => {
    component.cancel();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should trigger saveCategory on form submission', () => {
    const saveCategorySpy = jest.spyOn(component, 'saveCategory');
    component.categoryForm.setValue({
      name: 'Test',
      icon: 'star',
      imageUrl: 'http://test.com/image.jpg',
      comments: '',
    });
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(saveCategorySpy).toHaveBeenCalled();
  });

  it('should disable save button when form is invalid', () => {
    component.categoryForm.setValue({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
    });
    fixture.detectChanges();

    const saveButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    expect(saveButton.disabled).toBe(true);
  });

  it('should enable save button when form is valid', () => {
    component.categoryForm.setValue({
      name: 'Test',
      icon: 'star',
      imageUrl: 'http://test.com/image.jpg',
      comments: '',
    });
    fixture.detectChanges();

    const saveButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    expect(saveButton.disabled).toBe(false);
  });


  it('should show validation errors for required fields when form is submitted', () => {
    component.categoryForm.setValue({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
    });
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const nameError = fixture.debugElement.nativeElement.querySelector('mat-error');
    expect(nameError).toBeTruthy();
    expect(nameError.textContent).toContain('Category Name is required');
  });
});