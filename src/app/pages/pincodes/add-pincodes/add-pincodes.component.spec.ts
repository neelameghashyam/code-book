import { TestBed } from '@angular/core/testing';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { AddPincodesComponent } from './add-pincodes.component';
import { Pincode } from '../pincode';

// Mock MatDialogRef
const mockDialogRef = {
  close: jest.fn(),
};

describe('AddPincodesComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatDialogModule,
        MatIcon,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    jest.clearAllMocks();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(AddPincodesComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.formPincode).toEqual({
      officeName: '',
      pincode: '',
      districtName: '',
      taluk: '',
      stateName: '',
      city: '',
    });
  });

  it('should initialize formPincode with data.pincode if provided', () => {
    const mockPincode: Pincode = {
      id: 1,
      officeName: 'Test Office',
      pincode: '123456',
      districtName: 'Test District',
      taluk: 'Test Taluk',
      stateName: 'Test State',
      city: 'Test City',
    };
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { pincode: mockPincode } });
    const fixture = TestBed.createComponent(AddPincodesComponent);
    const component = fixture.componentInstance;
    expect(component.formPincode).toEqual({
      ...mockPincode,
      pincode: '123456',
    });
  });

  it('should not close dialog if form is invalid in savePincode', () => {
    const fixture = TestBed.createComponent(AddPincodesComponent);
    const component = fixture.componentInstance;
    const mockForm = { invalid: true } as NgForm;

    component.savePincode(mockForm);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should not close dialog if isFormInvalid returns true in savePincode', () => {
    const fixture = TestBed.createComponent(AddPincodesComponent);
    const component = fixture.componentInstance;
    const mockForm = { invalid: false } as NgForm;
    component.formPincode = {
      officeName: '',
      pincode: '123456',
      districtName: 'Test District',
      taluk: 'Test Taluk',
      stateName: 'Test State',
      city: 'Test City',
    };

    component.savePincode(mockForm);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should close dialog with formPincode data if form is valid', () => {
    const fixture = TestBed.createComponent(AddPincodesComponent);
    const component = fixture.componentInstance;
    const mockForm = { invalid: false } as NgForm;
    component.formPincode = {
      officeName: 'Test Office',
      pincode: '123456',
      districtName: 'Test District',
      taluk: 'Test Taluk',
      stateName: 'Test State',
      city: 'Test City',
    };

    component.savePincode(mockForm);
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      officeName: 'Test Office',
      pincode: '123456',
      districtName: 'Test District',
      taluk: 'Test Taluk',
      stateName: 'Test State',
      city: 'Test City',
    });
  });

  it('should return true for isFormInvalid if any field is missing or invalid', () => {
    const fixture = TestBed.createComponent(AddPincodesComponent);
    const component = fixture.componentInstance;

    // Test missing officeName
    component.formPincode = {
      officeName: '',
      pincode: '123456',
      districtName: 'Test District',
      taluk: 'Test Taluk',
      stateName: 'Test State',
      city: 'Test City',
    };
    expect(component.isFormInvalid()).toBe(true);

    // Test invalid pincode length
    component.formPincode = {
      officeName: 'Test Office',
      pincode: '12345', // 5 digits
      districtName: 'Test District',
      taluk: 'Test Taluk',
      stateName: 'Test State',
      city: 'Test City',
    };
    expect(component.isFormInvalid()).toBe(true);

    // Test invalid pincode format
    component.formPincode = {
      officeName: 'Test Office',
      pincode: '12345a', // Non-numeric
      districtName: 'Test District',
      taluk: 'Test Taluk',
      stateName: 'Test State',
      city: 'Test City',
    };
    expect(component.isFormInvalid()).toBe(true);

    // Test valid form
    component.formPincode = {
      officeName: 'Test Office',
      pincode: '123456',
      districtName: 'Test District',
      taluk: 'Test Taluk',
      stateName: 'Test State',
      city: 'Test City',
    };
    expect(component.isFormInvalid()).toBe(false);
  });

  it('should close dialog without data when cancel is called', () => {
    const fixture = TestBed.createComponent(AddPincodesComponent);
    const component = fixture.componentInstance;

    component.cancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });
});