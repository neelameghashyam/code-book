import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUserComponent } from './add-user.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserStore } from '../store/user-store';
import { DarkModeService } from '../../../services/dark-mode.service';
import { User } from '../user';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Mock dependencies
class MockUserStore {
  getUser = jest.fn();
  addUser = jest.fn();
  updateUser = jest.fn();
}

class MockToastrService {
  error = jest.fn();
  success = jest.fn();
}

class MockMatDialogRef {
  close = jest.fn();
}

class MockDarkModeService {
  isDarkMode = jest.fn().mockReturnValue(false);
}

class MockTranslateService {}

describe('AddUserComponent', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;
  let mockUserStore: MockUserStore;
  let mockToastr: MockToastrService;
  let mockDialogRef: MockMatDialogRef;
  let mockDarkModeService: MockDarkModeService;

  beforeEach(async () => {
    mockUserStore = new MockUserStore();
    mockToastr = new MockToastrService();
    mockDialogRef = new MockMatDialogRef();
    mockDarkModeService = new MockDarkModeService();

    await TestBed.configureTestingModule({
      imports: [
        AddUserComponent,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule
      ],
      providers: [
        { provide: UserStore, useValue: mockUserStore },
        { provide: ToastrService, useValue: mockToastr },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { userId: 0 } },
        { provide: DarkModeService, useValue: mockDarkModeService },
        { provide: TranslateService, useClass: MockTranslateService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and set title to "Add User" when userId is 0', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { userId: 0 } });
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.title).toBe('Add User');
    expect(component.isEdit).toBe(false);
    expect(component.userForm.get('id')?.disabled).toBe(true);
    expect(component.userForm.get('name')?.hasValidator(Validators.required)).toBe(true);
  });

  it('should initialize form and set title to "Add User" when data is undefined', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: undefined });
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.title).toBe('Add User');
    expect(component.isEdit).toBe(false);
    expect(component.userForm.get('id')?.disabled).toBe(true);
    expect(component.userForm.get('name')?.hasValidator(Validators.required)).toBe(true);
    expect(mockUserStore.getUser).not.toHaveBeenCalled();
    expect(mockToastr.error).not.toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should initialize form and set title to "Add User" when userId is undefined', () => {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { userId: undefined } });
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.title).toBe('Add User');
    expect(component.isEdit).toBe(false);
    expect(component.userForm.get('id')?.disabled).toBe(true);
    expect(component.userForm.get('name')?.hasValidator(Validators.required)).toBe(true);
    expect(mockUserStore.getUser).not.toHaveBeenCalled();
    expect(mockToastr.error).not.toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should set edit mode and populate form when userId is provided and user exists', () => {
    const user: User = { id: 1, name: 'John', company: 'ABC', bs: 'Consulting', website: 'example.com' };
    mockUserStore.getUser.mockReturnValue(user);
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { userId: 1 } });
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.isEdit).toBe(true);
    expect(component.title).toBe('Edit User');
    expect(component.userForm.getRawValue()).toEqual({
      id: 1,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com'
    });
  });

  it('should show error and close dialog when userId is provided but user is not found', () => {
    mockUserStore.getUser.mockReturnValue(null);
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { userId: 1 } });
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to load user data');
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should show error when form is invalid in saveUser', () => {
    component.userForm.setValue({ id: 0, name: '', company: '', bs: '', website: '' });
    component.saveUser();

    expect(mockToastr.error).toHaveBeenCalledWith('Please fill all required fields');
    expect(mockUserStore.addUser).not.toHaveBeenCalled();
    expect(mockUserStore.updateUser).not.toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should add user and show success toast when form is valid in add mode', () => {
    component.isEdit = false;
    component.userForm.setValue({
      id: 0,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com'
    });
    const expectedUser: User = {
      id: expect.any(Number),
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com'
    };

    component.saveUser();

    expect(mockUserStore.addUser).toHaveBeenCalledWith(expectedUser);
    expect(mockToastr.success).toHaveBeenCalledWith('User added successfully');
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should update user and show success toast when form is valid in edit mode', () => {
    component.isEdit = true;
    component.userForm.setValue({
      id: 1,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com'
    });
    const expectedUser: User = {
      id: 1,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com'
    };

    component.saveUser();

    expect(mockUserStore.updateUser).toHaveBeenCalledWith(expectedUser);
    expect(mockToastr.success).toHaveBeenCalledWith('User updated successfully');
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should show error toast when addUser throws an error', () => {
    mockUserStore.addUser.mockImplementation(() => { throw new Error('Add error'); });
    component.isEdit = false;
    component.userForm.setValue({
      id: 0,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com'
    });

    component.saveUser();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to add user');
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should show error toast when updateUser throws an error', () => {
    mockUserStore.updateUser.mockImplementation(() => { throw new Error('Update error'); });
    component.isEdit = true;
    component.userForm.setValue({
      id: 1,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com'
    });

    component.saveUser();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to update user');
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close dialog when closePopup is called', () => {
    component.closePopup();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should trigger saveUser on form submission', () => {
    const saveUserSpy = jest.spyOn(component, 'saveUser');
    component.userForm.setValue({
      id: 0,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com'
    });
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(saveUserSpy).toHaveBeenCalled();
  });

  it('should trigger closePopup on close button click', () => {
    const closePopupSpy = jest.spyOn(component, 'closePopup');
    fixture.detectChanges();

    const closeButton = fixture.debugElement.nativeElement.querySelector('button[type="button"]');
    closeButton.click();

    expect(closePopupSpy).toHaveBeenCalled();
  });

  it('should apply dark-theme class when darkModeService.isDarkMode returns true', () => {
    mockDarkModeService.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    expect(form.classList).toContain('dark-theme');
  });

  it('should not apply dark-theme class when darkModeService.isDarkMode returns false', () => {
    mockDarkModeService.isDarkMode.mockReturnValue(false);
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    expect(form.classList).not.toContain('dark-theme');
  });
});