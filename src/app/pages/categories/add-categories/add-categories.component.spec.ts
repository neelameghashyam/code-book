import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCategoriesComponent } from './add-categories.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Define Category interface
interface Category {
  id?: number;
  name: string;
  icon: string;
  imageUrl: string;
  comments: string;
  createdAt?: Date;
  modifiedAt?: Date;
}

describe('AddCategoriesComponent', () => {
  let component: AddCategoriesComponent;
  let fixture: ComponentFixture<AddCategoriesComponent>;
  let dialogRefMock: jest.Mocked<MatDialogRef<AddCategoriesComponent>>;
  let dialogData: { category?: Category | null };

  beforeEach(async () => {
    // Mock MatDialogRef
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as jest.Mocked<MatDialogRef<AddCategoriesComponent>>;

    // Default dialog data (no category)
    dialogData = {};

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule, // Assuming MatIcon is MatIconModule
        BrowserAnimationsModule, // Required for Material animations
        AddCategoriesComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize formCategory with empty values when no category is provided', () => {
    expect(component.formCategory).toEqual({
      name: '',
      icon: '',
      imageUrl: '',
      comments: '',
    });
  });

  it('should initialize formCategory with provided category data', () => {
    // Reset component with category data
    dialogData.category = {
      id: 1,
      name: 'Test Category',
      icon: 'test-icon',
      imageUrl: 'http://test.com/image.jpg',
      comments: 'Test comment',
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatDialogModule,
        MatIconModule,
        BrowserAnimationsModule,
        AddCategoriesComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AddCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.formCategory).toEqual(dialogData.category);
  });

  it('should not save and not close dialog if form is invalid', () => {
    const form = { invalid: true } as NgForm;
    component.saveCategory(form);
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('should not save and not close dialog if formCategory is invalid', () => {
    const form = { invalid: false } as NgForm;
    component.formCategory = { name: '', icon: '', imageUrl: '', comments: '' };
    component.saveCategory(form);
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });

  it('should save category and close dialog if form is valid', () => {
    const form = { invalid: false } as NgForm;
    component.formCategory = {
      name: 'Test Category',
      icon: 'test-icon',
      imageUrl: 'http://test.com/image.jpg',
      comments: 'Test comment',
    };
    component.saveCategory(form);
    expect(dialogRefMock.close).toHaveBeenCalledWith(component.formCategory);
  });

  it('should return true for isFormInvalid if name is empty', () => {
    component.formCategory = {
      name: '',
      icon: 'test-icon',
      imageUrl: 'http://test.com/image.jpg',
      comments: '',
    };
    expect(component.isFormInvalid()).toBe(true);
  });

  it('should return true for isFormInvalid if icon is empty', () => {
    component.formCategory = {
      name: 'Test Category',
      icon: '',
      imageUrl: 'http://test.com/image.jpg',
      comments: '',
    };
    expect(component.isFormInvalid()).toBe(true);
  });

  it('should return true for isFormInvalid if imageUrl is empty', () => {
    component.formCategory = {
      name: 'Test Category',
      icon: 'test-icon',
      imageUrl: '',
      comments: '',
    };
    expect(component.isFormInvalid()).toBe(true);
  });

  it('should return false for isFormInvalid if all required fields are filled', () => {
    component.formCategory = {
      name: 'Test Category',
      icon: 'test-icon',
      imageUrl: 'http://test.com/image.jpg',
      comments: '',
    };
    expect(component.isFormInvalid()).toBe(false);
  });

  it('should close dialog without data on cancel', () => {
    component.cancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith();
  });
});