import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { DarkModeService } from '../../services/dark-mode.service';
import { UserStore } from './store/user-store';
import { AddUserComponent } from './add-user/add-user.component';
import { MatTableDataSource } from '@angular/material/table';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { User } from './user';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Define interface for UserStore
interface UserStoreInterface {
  users: jest.Mock<User[]>;
  error: jest.Mock<string | null>;
  loadUsers: jest.Mock<void>;
  deleteUser: jest.Mock<void>;
}

// Define interface for DarkModeService
interface DarkModeServiceInterface {
  isDarkMode: jest.Mock<boolean>;
}

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userStoreMock: jest.Mocked<UserStoreInterface>;
  let toastrServiceMock: jest.Mocked<ToastrService>;
  let darkModeServiceMock: jest.Mocked<DarkModeServiceInterface>;
  let dialogMock: jest.Mocked<MatDialog>;
  let cdrMock: jest.Mocked<ChangeDetectorRef>;

  const mockUsers: User[] = [
    { id: 1, name: 'John Doe', company: 'Acme Corp', bs: 'Innovate', website: 'www.acme.com' },
    { id: 2, name: 'Jane Smith', company: 'Globex', bs: 'Synergize', website: 'www.globex.com' },
  ];

  beforeEach(async () => {
    userStoreMock = {
      users: jest.fn().mockReturnValue(mockUsers),
      error: jest.fn().mockReturnValue(null),
      loadUsers: jest.fn(),
      deleteUser: jest.fn(),
    };

    toastrServiceMock = {
      error: jest.fn(),
    } as any;

    darkModeServiceMock = {
      isDarkMode: jest.fn().mockReturnValue(false),
    };

    dialogMock = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of({}) }),
    } as any;

    cdrMock = {
      detectChanges: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        MatInputModule,
        NoopAnimationsModule,
        UsersComponent, // Import standalone component
        AddUserComponent, // Import standalone AddUserComponent (or mock if needed)
      ],
      providers: [
        { provide: UserStore, useValue: userStoreMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: DarkModeService, useValue: darkModeServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: ChangeDetectorRef, useValue: cdrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  describe('Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize properties', () => {
      expect(component.store).toBeDefined(); // Verify store injection
      expect(component.toastr).toBeDefined();
      expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
      expect(component.dataSource.data).toEqual([]);
      expect(component.displayedColumns).toEqual(['id', 'name', 'company', 'bs', 'website', 'action']);
      expect(component.pageSizeOptions).toEqual([5, 10, 25]);
      expect(component.pageSize).toBe(5);
      expect(component.searchTerm).toBe('');
      expect(component.darkModeService).toBeDefined();
      expect(component.paginator).toBeUndefined(); // Not set until ViewChild is resolved
    });

    it('should call loadUsers and set filterPredicate on ngOnInit', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      component.ngOnInit();
      expect(consoleLogSpy).toHaveBeenCalledWith('Initializing UsersComponent');
      expect(userStoreMock.loadUsers).toHaveBeenCalled();
      const filterPredicate = component.dataSource.filterPredicate;
      const user = mockUsers[0];
      expect(filterPredicate(user, 'john')).toBe(true); // name
      expect(filterPredicate(user, 'acme')).toBe(true); // company
      expect(filterPredicate(user, 'innovate')).toBe(true); // bs
      expect(filterPredicate(user, 'www.acme.com')).toBe(true); // website
      expect(filterPredicate(user, '1')).toBe(true); // id
      expect(filterPredicate(user, 'xyz')).toBe(false); // no match
      consoleLogSpy.mockRestore();
    });

    it('should set dataSource.data, paginator, and call detectChanges when users change', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      component.paginator = { pageIndex: 0, pageSize: 5 } as MatPaginator;
      fixture.detectChanges(); // Trigger effect
      expect(consoleLogSpy).toHaveBeenCalledWith('Users updated:', mockUsers);
      expect(component.dataSource.data).toEqual(mockUsers);
      expect(component.dataSource.paginator).toBe(component.paginator);
      expect(cdrMock.detectChanges).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });

    it('should show error toast and log error when store has error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      userStoreMock.error.mockReturnValue('Failed to load users');
      fixture.detectChanges(); // Trigger effect
      expect(consoleErrorSpy).toHaveBeenCalledWith('Store error:', 'Failed to load users');
      expect(toastrServiceMock.error).toHaveBeenCalledWith('Failed to load users');
      expect(cdrMock.detectChanges).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should log warning if paginator is not initialized', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      component.paginator = undefined;
      fixture.detectChanges(); // Trigger effect
      expect(consoleWarnSpy).toHaveBeenCalledWith('Paginator not initialized');
      expect(cdrMock.detectChanges).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('User Actions', () => {
    it('should open dialog for adding user', () => {
      component.addUser();
      expect(component.openPopup).toBeDefined();
      expect(dialogMock.open).toHaveBeenCalledWith(AddUserComponent, {
        width: '50%',
        exitAnimationDuration: '1000ms',
        enterAnimationDuration: '1000ms',
        data: { userId: 0 },
      });
    });

    it('should open dialog for editing user', () => {
      component.editUser(1);
      expect(component.openPopup).toBeDefined();
      expect(dialogMock.open).toHaveBeenCalledWith(AddUserComponent, {
        width: '50%',
        exitAnimationDuration: '1000ms',
        enterAnimationDuration: '1000ms',
        data: { userId: 1 },
      });
    });

    it('should call deleteUser on store when deleting user', () => {
      component.deleteUser(1);
      expect(userStoreMock.deleteUser).toHaveBeenCalledWith(1);
    });

    it('should open popup with correct configuration', () => {
      component.openPopup(42);
      expect(dialogMock.open).toHaveBeenCalledWith(AddUserComponent, {
        width: '50%',
        exitAnimationDuration: '1000ms',
        enterAnimationDuration: '1000ms',
        data: { userId: 42 },
      });
    });
  });

  describe('Filtering', () => {
    it('should apply filter when search term changes with paginator', () => {
      component.paginator = { pageIndex: 0, pageSize: 5, firstPage: jest.fn() } as any;
      component.dataSource.data = mockUsers;
      const event = { target: { value: 'john' } } as any;
      component.applyFilter(event);
      expect(component.searchTerm).toBeDefined();
      expect(component.dataSource.filter).toBe('john');
      expect(component.dataSource.paginator!.firstPage).toHaveBeenCalled();
      expect(cdrMock.detectChanges).toHaveBeenCalled();
    });

    it('should apply filter when search term changes without paginator', () => {
      component.paginator = undefined;
      component.dataSource.data = mockUsers;
      const event = { target: { value: 'john' } } as any;
      component.applyFilter(event);
      expect(component.dataSource.filter).toBe('john');
      expect(cdrMock.detectChanges).toHaveBeenCalled();
    });

    it('should filter dataSource based on search term', () => {
      component.dataSource.data = mockUsers;
      component.dataSource.filter = 'john';
      expect(component.dataSource.filteredData).toEqual([mockUsers[0]]);
    });
  });

  describe('Pagination', () => {
    it('should initialize paginator with correct pageSizeOptions and pageSize', () => {
      expect(component.pageSizeOptions).toEqual([5, 10, 25]);
      expect(component.pageSize).toBe(5);
    });

    it('should slice data correctly based on paginator', () => {
      component.paginator = { pageIndex: 0, pageSize: 1 } as MatPaginator;
      component.dataSource.data = mockUsers;
      fixture.detectChanges();
      const slicedData = component.dataSource.filteredData.slice(0, 1);
      expect(slicedData).toEqual([mockUsers[0]]);
    });
  });

  describe('Template Interactions', () => {
    beforeEach(() => {
      component.paginator = { pageIndex: 0, pageSize: 5 } as MatPaginator;
      component.dataSource.data = mockUsers;
      fixture.detectChanges();
    });

    it('should display users in table view on desktop', () => {
      const tableRows = fixture.debugElement.queryAll(By.css('table tbody tr'));
      expect(tableRows.length).toBe(mockUsers.length);
      expect(tableRows[0].nativeElement.textContent).toContain('John Doe');
    });

    it('should display users in card view on mobile', () => {
      const cardView = fixture.debugElement.query(By.css('.md\\:hidden'));
      expect(cardView).toBeTruthy();
      const cards = cardView.queryAll(By.css('.bg-white.rounded-lg.shadow'));
      expect(cards.length).toBe(mockUsers.length);
      expect(cards[0].nativeElement.textContent).toContain('John Doe');
    });

    it('should trigger addUser when clicking Add New button', () => {
      jest.spyOn(component, 'addUser');
      const addButton = fixture.debugElement.query(By.css('button.bg-blue-600'));
      addButton.nativeElement.click();
      expect(component.addUser).toHaveBeenCalled();
    });

    it('should trigger editUser when clicking Edit button', () => {
      jest.spyOn(component, 'editUser');
      const editButton = fixture.debugElement.query(By.css('button.bg-blue-600.mr-2'));
      editButton.nativeElement.click();
      expect(component.editUser).toHaveBeenCalledWith(mockUsers[0].id);
    });

    it('should trigger deleteUser when clicking Delete button', () => {
      jest.spyOn(component, 'deleteUser');
      const deleteButton = fixture.debugElement.query(By.css('button.bg-red-600'));
      deleteButton.nativeElement.click();
      expect(component.deleteUser).toHaveBeenCalledWith(mockUsers[0].id);
    });

    it('should apply filter when typing in search input', () => {
      jest.spyOn(component, 'applyFilter');
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'john';
      input.nativeElement.dispatchEvent(new Event('input'));
      expect(component.applyFilter).toHaveBeenCalled();
      expect(component.searchTerm).toBe('john');
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark-theme class when darkModeService.isDarkMode is true', () => {
      darkModeServiceMock.isDarkMode.mockReturnValue(true);
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.bg-white'));
      expect(container.classes['dark-theme']).toBe(true);
    });

    it('should not apply dark-theme class when darkModeService.isDarkMode is false', () => {
      darkModeServiceMock.isDarkMode.mockReturnValue(false);
      fixture.detectChanges();
      const container = fixture.debugElement.query(By.css('.bg-white'));
      expect(container.classes['dark-theme']).toBeUndefined();
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should log on ngOnInit', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      component.ngOnInit();
      expect(consoleLogSpy).toHaveBeenCalledWith('Initializing UsersComponent');
      consoleLogSpy.mockRestore();
    });

    it('should log on ngOnDestroy', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      component.ngOnDestroy();
      expect(consoleLogSpy).toHaveBeenCalledWith('Destroying UsersComponent');
      consoleLogSpy.mockRestore();
    });
  });
});