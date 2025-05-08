import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUserComponent } from './add-user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserStore } from '../store/user-store';
import { DarkModeService } from '../../../services/dark-mode.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { User } from '../user';
import { By } from '@angular/platform-browser';

// Define a type for the UserStore mock to match the expected methods
interface UserStoreMock {
  getUser: jest.Mock<User | undefined, [number]>;
  addUser: jest.Mock<void, [User]>;
  updateUser: jest.Mock<void, [User]>;
}

describe('AddUserComponent', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;
  let userStoreMock: UserStoreMock;
  let toastrServiceMock: jest.Mocked<ToastrService>;
  let dialogRefMock: jest.Mocked<MatDialogRef<AddUserComponent>>;
  let darkModeServiceMock: Partial<DarkModeService>;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    company: 'Acme Corp',
    bs: 'Innovation',
    website: 'https://acme.com',
  };

  beforeEach(async () => {
    userStoreMock = {
      getUser: jest.fn(),
      addUser: jest.fn(),
      updateUser: jest.fn(),
    };

    toastrServiceMock = {
      success: jest.fn(),
      error: jest.fn(),
    } as any;

    dialogRefMock = {
      close: jest.fn(),
    } as any;

    darkModeServiceMock = {
      get isDarkMode() {
        return false;
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        AddUserComponent,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: UserStore, useValue: userStoreMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: DarkModeService, useValue: darkModeServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with Add User title and empty form', () => {
      expect(component.title).toBe('Add User');
      expect(component.isEdit).toBe(false);
      expect(component.userForm.get('id')?.value).toBe(0);
      expect(component.userForm.get('name')?.value).toBe('');
      expect(component.userForm.get('company')?.value).toBe('');
      expect(component.userForm.get('bs')?.value).toBe('');
      expect(component.userForm.get('website')?.value).toBe('');
    });

    it('should initialize in edit mode with user data when userId is provided', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          AddUserComponent,
          ReactiveFormsModule,
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          BrowserAnimationsModule,
        ],
        providers: [
          { provide: UserStore, useValue: userStoreMock },
          { provide: ToastrService, useValue: toastrServiceMock },
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: { userId: 1 } },
          { provide: DarkModeService, useValue: darkModeServiceMock },
        ],
      }).compileComponents();

      userStoreMock.getUser.mockReturnValue(mockUser);
      fixture = TestBed.createComponent(AddUserComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.title).toBe('Edit User');
      expect(component.isEdit).toBe(true);
      expect(component.userForm.get('id')?.value).toBe(mockUser.id);
      expect(component.userForm.get('name')?.value).toBe(mockUser.name);
      expect(component.userForm.get('company')?.value).toBe(mockUser.company);
      expect(component.userForm.get('bs')?.value).toBe(mockUser.bs);
      expect(component.userForm.get('website')?.value).toBe(mockUser.website);
    });

    it('should show error and close dialog if user data is not found in edit mode', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          AddUserComponent,
          ReactiveFormsModule,
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          BrowserAnimationsModule,
        ],
        providers: [
          { provide: UserStore, useValue: userStoreMock },
          { provide: ToastrService, useValue: toastrServiceMock },
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: { userId: 1 } },
          { provide: DarkModeService, useValue: darkModeServiceMock },
        ],
      }).compileComponents();

      userStoreMock.getUser.mockReturnValue(undefined);
      fixture = TestBed.createComponent(AddUserComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(toastrServiceMock.error).toHaveBeenCalledWith('Failed to load user data');
      expect(dialogRefMock.close).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid if required fields are empty', () => {
      expect(component.userForm.invalid).toBe(true);
    });

    it('should mark form as valid when all required fields are filled', () => {
      component.userForm.patchValue({
        name: 'John Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });
      expect(component.userForm.valid).toBe(true);
    });

    it('should disable id field', () => {
      expect(component.userForm.get('id')?.disabled).toBe(true);
    });
  });

  describe('saveUser', () => {
    it('should show error if form is invalid', () => {
      component.saveUser();
      expect(toastrServiceMock.error).toHaveBeenCalledWith('Please fill all required fields');
      expect(userStoreMock.addUser).not.toHaveBeenCalled();
      expect(userStoreMock.updateUser).not.toHaveBeenCalled();
      expect(dialogRefMock.close).not.toHaveBeenCalled();
    });

    it('should add new user and close dialog when form is valid', () => {
      jest.spyOn(Date, 'now').mockReturnValue(123456);
      component.userForm.patchValue({
        name: 'John Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });

      component.saveUser();

      expect(userStoreMock.addUser).toHaveBeenCalledWith({
        id: 123456,
        name: 'John Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });
      expect(toastrServiceMock.success).toHaveBeenCalledWith('User added successfully');
      expect(dialogRefMock.close).toHaveBeenCalled();
    });

    it('should update existing user and close dialog when in edit mode', () => {
      component.isEdit = true;
      component.userForm.patchValue({
        id: 1,
        name: 'Jane Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });

      component.saveUser();

      expect(userStoreMock.updateUser).toHaveBeenCalledWith({
        id: 1,
        name: 'Jane Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });
      expect(toastrServiceMock.success).toHaveBeenCalledWith('User updated successfully');
      expect(dialogRefMock.close).toHaveBeenCalled();
    });

    it('should show error if adding user fails', () => {
      userStoreMock.addUser.mockImplementation(() => {
        throw new Error('Add user failed');
      });
      component.userForm.patchValue({
        name: 'John Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });

      component.saveUser();

      expect(toastrServiceMock.error).toHaveBeenCalledWith('Failed to add user');
      expect(dialogRefMock.close).toHaveBeenCalled();
    });

    it('should show error if updating user fails', () => {
      userStoreMock.updateUser.mockImplementation(() => {
        throw new Error('Update user failed');
      });
      component.isEdit = true;
      component.userForm.patchValue({
        id: 1,
        name: 'Jane Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });

      component.saveUser();

      expect(toastrServiceMock.error).toHaveBeenCalledWith('Failed to update user');
      expect(dialogRefMock.close).toHaveBeenCalled();
    });
  });

  describe('closePopup', () => {
    it('should close the dialog', () => {
      component.closePopup();
      expect(dialogRefMock.close).toHaveBeenCalled();
    });
  });

  describe('Template', () => {
    it('should display the correct title', () => {
      const titleElement = fixture.debugElement.query(By.css('h2')).nativeElement;
      expect(titleElement.textContent).toBe('Add User');
    });

    it('should apply dark theme class when darkModeService.isDarkMode is true', () => {
      darkModeServiceMock = {
        get isDarkMode() {
          return true;
        },
      };
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          AddUserComponent,
          ReactiveFormsModule,
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          BrowserAnimationsModule,
        ],
        providers: [
          { provide: UserStore, useValue: userStoreMock },
          { provide: ToastrService, useValue: toastrServiceMock },
          { provide: MatDialogRef, useValue: dialogRefMock },
          { provide: MAT_DIALOG_DATA, useValue: {} },
          { provide: DarkModeService, useValue: darkModeServiceMock },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(AddUserComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      const formElement = fixture.debugElement.query(By.css('form')).nativeElement;
      expect(formElement.classList).toContain('dark-theme');
    });

    it('should disable the id input field', () => {
      const idInput = fixture.debugElement.query(By.css('input[formControlName="id"]')).nativeElement;
      expect(idInput.hasAttribute('readonly')).toBe(true);
    });

    it('should call saveUser on form submit', () => {
      jest.spyOn(component, 'saveUser');
      const form = fixture.debugElement.query(By.css('form'));
      form.triggerEventHandler('ngSubmit', null);
      expect(component.saveUser).toHaveBeenCalled();
    });

    it('should call closePopup on close button click', () => {
      jest.spyOn(component, 'closePopup');
      const closeButton = fixture.debugElement.query(By.css('button[type="button"]')).nativeElement;
      closeButton.click();
      expect(component.closePopup).toHaveBeenCalled();
    });
  });
});