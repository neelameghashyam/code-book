import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddUserComponent } from './add-user.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserStore } from '../store/user-store';
import { DarkModeService } from '../../../services/dark-mode.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { User } from '../user';

interface MockUserStore {
  getUser: jest.Mock;
  addUser: jest.Mock;
  updateUser: jest.Mock;
}

describe('AddUserComponent', () => {
  let component: AddUserComponent;
  let fixture: ComponentFixture<AddUserComponent>;
  let mockDialogRef: jest.Mocked<MatDialogRef<AddUserComponent>>;
  let mockToastr: jest.Mocked<ToastrService>;
  let mockUserStore: MockUserStore;
  let mockDarkModeService: jest.Mocked<DarkModeService>;

  beforeEach(async () => {
    mockDialogRef = {
      close: jest.fn()
    } as unknown as jest.Mocked<MatDialogRef<AddUserComponent>>;

    mockToastr = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    mockUserStore = {
      getUser: jest.fn(),
      addUser: jest.fn(),
      updateUser: jest.fn()
    };

    mockDarkModeService = {
      isDarkMode: jest.fn().mockReturnValue(false)
    } as unknown as jest.Mocked<DarkModeService>;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule
      ],
      declarations: [AddUserComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: ToastrService, useValue: mockToastr },
        { provide: UserStore, useValue: mockUserStore },
        { provide: DarkModeService, useValue: mockDarkModeService },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize form for adding user when no userId provided', () => {
      expect(component.isEdit).toBe(false);
      expect(component.title).toBe('Add User');
      expect(component.userForm.valid).toBe(false);
    });

    it('should patch form values when editing existing user', () => {
      const mockUser: User = {
        id: 1,
        name: 'Test User',
        company: 'Test Company',
        bs: 'Test BS',
        website: 'test.com'
      };
      
      mockUserStore.getUser.mockReturnValue(mockUser);
      
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          NoopAnimationsModule
        ],
        declarations: [AddUserComponent],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: ToastrService, useValue: mockToastr },
          { provide: UserStore, useValue: mockUserStore },
          { provide: DarkModeService, useValue: mockDarkModeService },
          { provide: MAT_DIALOG_DATA, useValue: { userId: 1 } }
        ]
      }).compileComponents();

      const editFixture = TestBed.createComponent(AddUserComponent);
      const editComponent = editFixture.componentInstance;
      editFixture.detectChanges();

      expect(editComponent.userForm.value).toEqual({
        id: 1,
        name: 'Test User',
        company: 'Test Company',
        bs: 'Test BS',
        website: 'test.com'
      });
    });

    it('should show error and close when user not found for edit', () => {
      mockUserStore.getUser.mockReturnValue(undefined);
      
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          ReactiveFormsModule,
          MatCardModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          MatIconModule,
          NoopAnimationsModule
        ],
        declarations: [AddUserComponent],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: ToastrService, useValue: mockToastr },
          { provide: UserStore, useValue: mockUserStore },
          { provide: DarkModeService, useValue: mockDarkModeService },
          { provide: MAT_DIALOG_DATA, useValue: { userId: 999 } }
        ]
      }).compileComponents();

      const errorFixture = TestBed.createComponent(AddUserComponent);
      errorFixture.detectChanges();

      expect(mockToastr.error).toHaveBeenCalledWith('Failed to load user data');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('saveUser', () => {
    it('should show error when form is invalid', () => {
      component.userForm.controls.name.setValue('');
      component.saveUser();
      
      expect(mockToastr.error).toHaveBeenCalledWith('Please fill all required fields');
      expect(mockUserStore.addUser).not.toHaveBeenCalled();
      expect(mockUserStore.updateUser).not.toHaveBeenCalled();
    });

    it('should add new user when form is valid and not in edit mode', () => {
      component.userForm.setValue({
        id: 0,
        name: 'New User',
        company: 'New Company',
        bs: 'New BS',
        website: 'new.com'
      });

      component.saveUser();

      expect(mockUserStore.addUser).toHaveBeenCalledWith({
        id: expect.any(Number),
        name: 'New User',
        company: 'New Company',
        bs: 'New BS',
        website: 'new.com'
      });
      expect(mockToastr.success).toHaveBeenCalledWith('User added successfully');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should update user when form is valid and in edit mode', () => {
      component.isEdit = true;
      component.userForm.setValue({
        id: 1,
        name: 'Updated User',
        company: 'Updated Company',
        bs: 'Updated BS',
        website: 'updated.com'
      });

      component.saveUser();

      expect(mockUserStore.updateUser).toHaveBeenCalledWith({
        id: 1,
        name: 'Updated User',
        company: 'Updated Company',
        bs: 'Updated BS',
        website: 'updated.com'
      });
      expect(mockToastr.success).toHaveBeenCalledWith('User updated successfully');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should show error when adding user fails', () => {
      mockUserStore.addUser.mockImplementation(() => {
        throw new Error('Add failed');
      });

      component.userForm.setValue({
        id: 0,
        name: 'New User',
        company: 'New Company',
        bs: 'New BS',
        website: 'new.com'
      });

      component.saveUser();

      expect(mockToastr.error).toHaveBeenCalledWith('Failed to add user');
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should show error when updating user fails', () => {
      component.isEdit = true;
      mockUserStore.updateUser.mockImplementation(() => {
        throw new Error('Update failed');
      });

      component.userForm.setValue({
        id: 1,
        name: 'Updated User',
        company: 'Updated Company',
        bs: 'Updated BS',
        website: 'updated.com'
      });

      component.saveUser();

      expect(mockToastr.error).toHaveBeenCalledWith('Failed to update user');
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  describe('closePopup', () => {
    it('should close the dialog', () => {
      component.closePopup();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('form validation', () => {
    it('should mark name as invalid when empty', () => {
      const nameControl = component.userForm.controls.name;
      nameControl.setValue('');
      expect(nameControl.valid).toBe(false);
    });

    it('should mark company as invalid when empty', () => {
      const companyControl = component.userForm.controls.company;
      companyControl.setValue('');
      expect(companyControl.valid).toBe(false);
    });

    it('should mark bs as invalid when empty', () => {
      const bsControl = component.userForm.controls.bs;
      bsControl.setValue('');
      expect(bsControl.valid).toBe(false);
    });

    it('should mark website as invalid when empty', () => {
      const websiteControl = component.userForm.controls.website;
      websiteControl.setValue('');
      expect(websiteControl.valid).toBe(false);
    });

    it('should mark form as valid when all fields are filled', () => {
      component.userForm.setValue({
        id: 0,
        name: 'Valid User',
        company: 'Valid Company',
        bs: 'Valid BS',
        website: 'valid.com'
      });
      expect(component.userForm.valid).toBe(true);
    });
  });
});