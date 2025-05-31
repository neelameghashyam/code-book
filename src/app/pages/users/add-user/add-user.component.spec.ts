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
import { of } from 'rxjs';

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

class MockTranslateService {
  get = jest.fn().mockImplementation((key: string) => of(key)); // Mock get method
  instant = jest.fn().mockImplementation((key: string) => key); // Mock instant method
  onLangChange = { subscribe: jest.fn() }; // Mock language change event
  onTranslationChange = { subscribe: jest.fn() }; // Mock translation change event
  onDefaultLangChange = { subscribe: jest.fn() }; // Mock default language change event
}

describe('AddUserComponent', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;
  let mockUserStore: MockUserStore;
  let mockToastr: MockToastrService;
  let mockDialogRef: MockMatDialogRef;
  let mockDarkModeService: MockDarkModeService;
  let mockTranslateService: MockTranslateService;

  beforeEach(async () => {
    mockUserStore = new MockUserStore();
    mockToastr = new MockToastrService();
    mockDialogRef = new MockMatDialogRef();
    mockDarkModeService = new MockDarkModeService();
    mockTranslateService = new MockTranslateService();
  });

  const configureTestBed = (dialogData: any) => {
    TestBed.configureTestingModule({
      imports: [
        AddUserComponent,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: UserStore, useValue: mockUserStore },
        { provide: ToastrService, useValue: mockToastr },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: DarkModeService, useValue: mockDarkModeService },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    });
  };

  beforeEach(() => {
    fixture = null!;
    component = null!;
  });

  it('should create the component', async () => {
    configureTestBed({ userId: 0 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should initialize form and set title to "Add User" when userId is 0', async () => {
    configureTestBed({ userId: 0 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(component.title).toBe('Add User');
    expect(component.isEdit).toBe(false);
    expect(component.userForm.get('id')?.disabled).toBe(true);
    expect(component.userForm.get('name')?.hasValidator(Validators.required)).toBe(true);
    expect(mockUserStore.getUser).not.toHaveBeenCalled();
  });

  it('should initialize form and set title to "Add User" when data is undefined', async () => {
    configureTestBed(undefined);
    await TestBed.compileComponents();
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

  it('should initialize form and set title to "Add User" when userId is undefined', async () => {
    configureTestBed({ userId: undefined });
    await TestBed.compileComponents();
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

  it('should set edit mode and populate form when userId is provided and user exists', async () => {
    const user: User = { id: 1, name: 'John', company: 'ABC', bs: 'Consulting', website: 'example.com' };
    mockUserStore.getUser.mockReturnValue(user);
    configureTestBed({ userId: 1 });
    await TestBed.compileComponents();
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
      website: 'example.com',
    });
  });

  it('should show error and close dialog when userId is provided but user is not found', async () => {
    mockUserStore.getUser.mockReturnValue(null);
    configureTestBed({ userId: 1 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.ngOnInit();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to load user data');
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should show error when form is invalid in saveUser', async () => {
    configureTestBed({ userId: 0 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.userForm.setValue({ id: 0, name: '', company: '', bs: '', website: '' });
    component.saveUser();

    expect(mockToastr.error).toHaveBeenCalledWith('Please fill all required fields');
    expect(mockUserStore.addUser).not.toHaveBeenCalled();
    expect(mockUserStore.updateUser).not.toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should add user and show success toast when form is valid in add mode', async () => {
    configureTestBed({ userId: 0 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.isEdit = false;
    component.userForm.setValue({
      id: 0,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com',
    });
    const expectedUser: User = {
      id: expect.any(Number),
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com',
    };

    component.saveUser();

    expect(mockUserStore.addUser).toHaveBeenCalledWith(expectedUser);
    expect(mockToastr.success).toHaveBeenCalledWith('User added successfully');
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should update user and show success toast when form is valid in edit mode', async () => {
    configureTestBed({ userId: 1 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.isEdit = true;
    component.userForm.setValue({
      id: 1,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com',
    });
    const expectedUser: User = {
      id: 1,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com',
    };

    component.saveUser();

    expect(mockUserStore.updateUser).toHaveBeenCalledWith(expectedUser);
    expect(mockToastr.success).toHaveBeenCalledWith('User updated successfully');
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should show error toast and close dialog when addUser throws an error', async () => {
    configureTestBed({ userId: 0 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    mockUserStore.addUser.mockImplementation(() => {
      throw new Error('Add error');
    });
    component.isEdit = false;
    component.userForm.setValue({
      id: 0,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com',
    });

    component.saveUser();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to add user');
    expect(mockDialogRef.close)
  });

  it('should show error toast and close dialog when updateUser throws an error', async () => {
    configureTestBed({ userId: 1 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    mockUserStore.updateUser.mockImplementation(() => {
      throw new Error('Update error');
    });
    component.isEdit = true;
    component.userForm.setValue({
      id: 1,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com',
    });

    component.saveUser();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to update user');
    expect(mockDialogRef.close)
  });

  it('should close dialog when closePopup is called', async () => {
    configureTestBed({ userId: 0 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    component.closePopup();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should trigger saveUser on form submission', async () => {
    configureTestBed({ userId: 0 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    const saveUserSpy = jest.spyOn(component, 'saveUser');
    component.userForm.setValue({
      id: 0,
      name: 'John',
      company: 'ABC',
      bs: 'Consulting',
      website: 'example.com',
    });
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(saveUserSpy).toHaveBeenCalled();
  });

  it('should trigger closePopup on close button click', async () => {
    configureTestBed({ userId: 0 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    const closePopupSpy = jest.spyOn(component, 'closePopup');
    fixture.detectChanges();

    const closeButton = fixture.debugElement.nativeElement.querySelector('button[type="button"]');
    closeButton.click();

    expect(closePopupSpy).toHaveBeenCalled();
  });

  it('should apply dark-theme class when darkModeService.isDarkMode returns true', async () => {
    configureTestBed({ userId: 0 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    mockDarkModeService.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    expect(form.classList).toContain('dark-theme');
  });

  it('should not apply dark-theme class when darkModeService.isDarkMode returns false', async () => {
    configureTestBed({ userId: 0 });
    await TestBed.compileComponents();
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    mockDarkModeService.isDarkMode.mockReturnValue(false);
    fixture.detectChanges();

    const form = fixture.debugElement.nativeElement.querySelector('form');
    expect(form.classList).not.toContain('dark-theme');
  });
});