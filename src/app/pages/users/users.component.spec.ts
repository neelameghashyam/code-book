import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { UserStore } from './store/user-store';
import { ToastrService } from 'ngx-toastr';
import { DarkModeService } from '../../services/dark-mode.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { User } from './user';
import { AddUserComponent } from './add-user/add-user.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

interface UserStoreMock {
  loadUsers: jest.Mock;
  deleteUser: jest.Mock;
  users: jest.Mock;
  error: jest.Mock;
}

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let userStoreMock: UserStoreMock;
  let toastrServiceMock: { error: jest.Mock };
  let darkModeServiceMock: { isDarkMode: jest.Mock };
  let translateServiceMock: { instant: jest.Mock };
  let dialogMock: { open: jest.Mock };
  let cdrMock: { detectChanges: jest.Mock };

  const mockUsers: User[] = [
    { id: 1, name: 'John Doe', company: 'Acme Corp', bs: 'Synergy', website: 'www.acme.com' },
    { id: 2, name: 'Jane Smith', company: 'Tech Inc', bs: 'Innovation', website: 'www.tech.com' },
  ];

  beforeEach(async () => {
    userStoreMock = {
      loadUsers: jest.fn(),
      deleteUser: jest.fn(),
      users: jest.fn().mockReturnValue(mockUsers),
      error: jest.fn().mockReturnValue(null),
    };
    toastrServiceMock = { error: jest.fn() };
    darkModeServiceMock = { isDarkMode: jest.fn() };
    translateServiceMock = { instant: jest.fn() };
    dialogMock = {
      open: jest.fn().mockReturnValue({ afterClosed: () => ({ subscribe: jest.fn() }) }),
    };
    cdrMock = { detectChanges: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatButtonModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        CommonModule,
        FormsModule,
        MatInputModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
      ],
      declarations: [UsersComponent, AddUserComponent],
      providers: [
        { provide: UserStore, useValue: userStoreMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: DarkModeService, useValue: darkModeServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: ChangeDetectorRef, useValue: cdrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct defaults', () => {
    expect(component.displayedColumns).toEqual(['id', 'name', 'company', 'bs', 'website', 'action']);
    expect(component.pageSizeOptions).toEqual([5, 10, 25]);
    expect(component.pageSize).toBe(5);
    expect(component.searchTerm).toBe('');
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
  });

  it('should call loadUsers on ngOnInit', () => {
    component.ngOnInit();
    expect(userStoreMock.loadUsers).toHaveBeenCalled();
  });

  it('should set up filter predicate in ngOnInit', () => {
    component.ngOnInit();
    const filterPredicate = component.dataSource.filterPredicate;
    const user = mockUsers[0];
    expect(filterPredicate(user, 'john')).toBe(true);
    expect(filterPredicate(user, 'acme')).toBe(true);
    expect(filterPredicate(user, 'synergy')).toBe(true);
    expect(filterPredicate(user, 'www.acme.com')).toBe(true);
    expect(filterPredicate(user, '1')).toBe(true);
    expect(filterPredicate(user, 'nonexistent')).toBe(false);
  });

  it('should update dataSource and paginator when users signal changes', () => {
    component.paginator = { firstPage: jest.fn() } as any;
    fixture.detectChanges();
    expect(component.dataSource.data).toEqual(mockUsers);
    expect(component.dataSource.paginator).toBe(component.paginator);
    expect(cdrMock.detectChanges).toHaveBeenCalled();
  });

  it('should log warning if paginator is not initialized', () => {
    console.warn = jest.fn();
    component.paginator = undefined;
    fixture.detectChanges();
    expect(console.warn).toHaveBeenCalledWith('Paginator not initialized');
  });

  it('should show error toast when error signal is present', () => {
    userStoreMock.error.mockReturnValue('Failed to load users');
    fixture.detectChanges();
    expect(toastrServiceMock.error).toHaveBeenCalledWith('Failed to load users');
    expect(cdrMock.detectChanges).toHaveBeenCalled();
  });

  it('should call openPopup with userId 0 on addUser', () => {
    jest.spyOn(component, 'openPopup');
    component.addUser();
    expect(component.openPopup).toHaveBeenCalledWith(0);
  });

  it('should call deleteUser on store with correct userId', () => {
    component.deleteUser(1);
    expect(userStoreMock.deleteUser).toHaveBeenCalledWith(1);
  });

  it('should call openPopup with correct userId on editUser', () => {
    jest.spyOn(component, 'openPopup');
    component.editUser(2);
    expect(component.openPopup).toHaveBeenCalledWith(2);
  });

  it('should open dialog with correct config in openPopup', () => {
    component.openPopup(3);
    expect(dialogMock.open).toHaveBeenCalledWith(AddUserComponent, {
      width: '50%',
      exitAnimationDuration: '1000ms',
      enterAnimationDuration: '1000ms',
      data: { userId: 3 },
    });
  });

  it('should apply filter and reset paginator on applyFilter', () => {
    component.paginator = { firstPage: jest.fn() } as any;
    component.dataSource.paginator = component.paginator;
    const event = { target: { value: 'test' } } as any;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('test');
    expect(component.paginator.firstPage).toHaveBeenCalled();
    expect(cdrMock.detectChanges).toHaveBeenCalled();
  });

  it('should handle applyFilter without paginator', () => {
    component.dataSource.paginator = null;
    const event = { target: { value: 'test' } } as any;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('test');
    expect(cdrMock.detectChanges).toHaveBeenCalled();
  });

  it('should log message on ngOnDestroy', () => {
    console.log = jest.fn();
    component.ngOnDestroy();
    expect(console.log).toHaveBeenCalledWith('Destroying UsersComponent');
  });

  it('should handle filter predicate case insensitivity', () => {
    component.ngOnInit();
    const filterPredicate = component.dataSource.filterPredicate;
    const user = mockUsers[0];
    expect(filterPredicate(user, 'JOHN')).toBe(true);
    expect(filterPredicate(user, 'ACME')).toBe(true);
  });

  it('should handle empty filter in applyFilter', () => {
    component.paginator = { firstPage: jest.fn() } as any;
    component.dataSource.paginator = component.paginator;
    const event = { target: { value: '  ' } } as any;
    component.applyFilter(event);
    expect(component.dataSource.filter).toBe('');
    expect(component.paginator.firstPage).toHaveBeenCalled();
    expect(cdrMock.detectChanges).toHaveBeenCalled();
  });
});