import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AddUserComponent } from './add-user.component';
import { UserStore } from '../store/user-store';
import { DarkModeService } from '../../../services/dark-mode.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { User } from '../user';

// Mock Services
class MockUserStore {
  getUser = jest.fn();
  addUser = jest.fn();
  updateUser = jest.fn();
}

class MockDarkModeService {
  isDarkMode = jest.fn().mockReturnValue(false);
}

class MockToastrService {
  success = jest.fn();
  error = jest.fn();
}

class MockMatDialogRef {
  close = jest.fn();
}

describe('AddUserComponent', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;
  let userStore: MockUserStore;
  let darkModeService: MockDarkModeService;
  let toastrService: MockToastrService;
  let dialogRef: MockMatDialogRef;

  const mockUser: User = {
    id: 1,
    name: 'John Doe',
    company: 'Acme Corp',
    bs: 'Innovation',
    website: 'https://acme.com',
  };

  beforeEach(waitForAsync(() => {
    userStore = new MockUserStore();
    darkModeService = new MockDarkModeService();
    toastrService = new MockToastrService();
    dialogRef = new MockMatDialogRef();

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: UserStore, useValue: userStore },
        { provide: DarkModeService, useValue: darkModeService },
        { provide: ToastrService, useValue: toastrService },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { userId: null } },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize form with default values for add mode', () => {
      expect(component.userForm.value).toEqual({
        id: 0,
        name: '',
        company: '',
        bs: '',
        website: '',
      });
      expect(component.isEdit).toBe(false);
      expect(component.title).toBe('Add User');
      expect(component.userForm.get('id')?.disabled).toBe(true);
    });

    it('should initialize form with user data for edit mode', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          NoopAnimationsModule,
        ],
        providers: [
          { provide: UserStore, useValue: userStore },
          { provide: DarkModeService, useValue: darkModeService },
          { provide: ToastrService, useValue: toastrService },
          { provide: MatDialogRef, useValue: dialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { userId: 1 } },
        ],
      }).compileComponents();

      userStore.getUser.mockReturnValue(mockUser);
      fixture = TestBed.createComponent(AddUserComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isEdit).toBe(true);
      expect(component.title).toBe('Edit User');
      expect(component.userForm.value).toEqual({
        id: 1,
        name: 'John Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });
    });

    it('should show error and close dialog if user not found in edit mode', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          NoopAnimationsModule,
        ],
        providers: [
          { provide: UserStore, useValue: userStore },
          { provide: DarkModeService, useValue: darkModeService },
          { provide: ToastrService, useValue: toastrService },
          { provide: MatDialogRef, useValue: dialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { userId: 1 } },
        ],
      }).compileComponents();

      userStore.getUser.mockReturnValue(null);
      fixture = TestBed.createComponent(AddUserComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(toastrService.error).toHaveBeenCalledWith('Failed to load user data');
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should render form with all fields', () => {
      const form = fixture.nativeElement.querySelector('form');
      expect(form.querySelector('input[formControlName="id"]')).toBeTruthy();
      expect(form.querySelector('input[formControlName="name"]')).toBeTruthy();
      expect(form.querySelector('input[formControlName="company"]')).toBeTruthy();
      expect(form.querySelector('input[formControlName="bs"]')).toBeTruthy();
      expect(form.querySelector('input[formControlName="website"]')).toBeTruthy();
      expect(form.querySelector('button[type="submit"]')).toBeTruthy();
      expect(form.querySelector('button[type="button"]')).toBeTruthy();
    });

    it('should apply dark-theme class when dark mode is enabled', () => {
      darkModeService.isDarkMode.mockReturnValue(true);
      fixture.detectChanges();
      const form = fixture.nativeElement.querySelector('form');
      expect(form.classList).toContain('dark-theme');
    });

    it('should display title correctly', () => {
      expect(fixture.nativeElement.querySelector('h2').textContent).toBe('Add User');
      component.isEdit = true;
      component.title = 'Edit User';
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('h2').textContent).toBe('Edit User');
    });

    it('should mark id field as readonly', () => {
      const idInput = fixture.nativeElement.querySelector('input[formControlName="id"]');
      expect(idInput.hasAttribute('readonly')).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should mark form as invalid when required fields are empty', () => {
      expect(component.userForm.invalid).toBe(true);
      component.userForm.patchValue({ name: 'John' });
      expect(component.userForm.invalid).toBe(true);
      component.userForm.patchValue({
        name: 'John',
        company: 'Acme',
        bs: 'Innovation',
        website: 'https://acme.com',
      });
      expect(component.userForm.invalid).toBe(false);
    });

    it('should show error toast when submitting invalid form', () => {
      component.saveUser();
      expect(toastrService.error).toHaveBeenCalledWith('Please fill all required fields');
      expect(userStore.addUser).not.toHaveBeenCalled();
      expect(userStore.updateUser).not.toHaveBeenCalled();
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('saveUser', () => {
    beforeEach(() => {
      component.userForm.patchValue({
        name: 'John Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });
    });

    it('should add new user and close dialog in add mode', () => {
      component.isEdit = false;
      component.saveUser();
      expect(userStore.addUser).toHaveBeenCalledWith({
        id: expect.any(Number),
        name: 'John Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });
      expect(toastrService.success).toHaveBeenCalledWith('User added successfully');
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should update user and close dialog in edit mode', () => {
      component.isEdit = true;
      component.userForm.patchValue({ id: 1 });
      component.saveUser();
      expect(userStore.updateUser).toHaveBeenCalledWith({
        id: 1,
        name: 'John Doe',
        company: 'Acme Corp',
        bs: 'Innovation',
        website: 'https://acme.com',
      });
      expect(toastrService.success).toHaveBeenCalledWith('User updated successfully');
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should show error toast and not close dialog on add failure', () => {
      userStore.addUser.mockImplementation(() => {
        throw new Error('Add failed');
      });
      component.isEdit = false;
      component.saveUser();
      expect(userStore.addUser).toHaveBeenCalled();
      expect(toastrService.error).toHaveBeenCalledWith('Failed to add user');
      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should show error toast and not close dialog on update failure', () => {
      userStore.updateUser.mockImplementation(() => {
        throw new Error('Update failed');
      });
      component.isEdit = true;
      component.userForm.patchValue({ id: 1 });
      component.saveUser();
      expect(userStore.updateUser).toHaveBeenCalled();
      expect(toastrService.error).toHaveBeenCalledWith('Failed to update user');
      expect(dialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('closePopup', () => {
    it('should close the dialog', () => {
      component.closePopup();
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });

  describe('Dark Mode Integration', () => {
    it('should inject DarkModeService', () => {
      expect(component.darkModeService).toBe(darkModeService);
    });

    it('should not apply dark-theme class when dark mode is disabled', () => {
      darkModeService.isDarkMode.mockReturnValue(false);
      fixture.detectChanges();
      const form = fixture.nativeElement.querySelector('form');
      expect(form.classList).not.toContain('dark-theme');
    });
  });
});