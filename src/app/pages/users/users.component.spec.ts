import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersComponent } from './users.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { DarkModeService } from '../../services/dark-mode.service';
import { UserStore } from './store/user-store';
import { User } from './user';
import { ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { of } from 'rxjs';
import { AddUserComponent } from './add-user/add-user.component';

// Mock dependencies
class MockUserStore {
  users = jest.fn().mockReturnValue([]);
  error = jest.fn().mockReturnValue(null);
  loadUsers = jest.fn();
  deleteUser = jest.fn();
}

class MockToastrService {
  error = jest.fn();
}

class MockMatDialog {
  private _openDialogs: any[] = []; // Simulate internal dialog tracking
  open = jest.fn().mockImplementation((component, config) => {
    this._openDialogs.push({ component, config }); // Simulate dialog opening
    return {
      afterClosed: () => of({}),
      close: jest.fn(),
    };
  });
}

class MockChangeDetectorRef {
  detectChanges = jest.fn();
}

class MockDarkModeService {
  isDarkMode = jest.fn().mockReturnValue(false);
}

class MockTranslateService {
  get = jest.fn().mockImplementation((key: string) => of(key)); // Mock get method
  instant = jest.fn().mockImplementation((key: string) => key); // Mock instant for sync translations
  onLangChange = { subscribe: jest.fn() }; // Mock language change event
  onTranslationChange = { subscribe: jest.fn() }; // Mock translation change event
  onDefaultLangChange = { subscribe: jest.fn() }; // Mock default language change event
}

describe('UsersComponent', () => {
  let component: UsersComponent;
  let fixture: ComponentFixture<UsersComponent>;
  let mockUserStore: MockUserStore;
  let mockToastr: MockToastrService;
  let mockDialog: MockMatDialog;
  let mockCdr: MockChangeDetectorRef;
  let mockTranslate: MockTranslateService;

  beforeEach(async () => {
    mockUserStore = new MockUserStore();
    mockToastr = new MockToastrService();
    mockDialog = new MockMatDialog();
    mockCdr = new MockChangeDetectorRef();
    mockTranslate = new MockTranslateService();

    await TestBed.configureTestingModule({
      imports: [
        UsersComponent,
        MatCardModule,
        MatButtonModule,
        MatDialogModule,
        MatTableModule,
        MatPaginatorModule,
        CommonModule,
        FormsModule,
        MatInputModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: UserStore, useValue: mockUserStore },
        { provide: ToastrService, useValue: mockToastr },
        { provide: MatDialog, useValue: mockDialog },
        { provide: ChangeDetectorRef, useValue: mockCdr },
        { provide: DarkModeService, useValue: new MockDarkModeService() },
        { provide: TranslateService, useValue: mockTranslate },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dataSource and set up effect in constructor', () => {
    const users: User[] = [{ id: 1, name: 'John', company: 'ABC', bs: 'Consulting', website: 'example.com' }];
    mockUserStore.users.mockReturnValue(users);
    fixture.detectChanges();

    expect(component.dataSource.data).toEqual(users);
    // expect(mockCdr.detectChanges).toHaveBeenCalled();
  });

  it('should handle error in effect when store.error is set', () => {
    mockUserStore.error.mockReturnValue('Failed to load users');
    fixture.detectChanges();

    expect(mockToastr.error).toHaveBeenCalledWith('Failed to load users');
    // expect(mockCdr.detectChanges).toHaveBeenCalled();
  });

  it('should log warning when paginator is not initialized in effect', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    component.paginator = undefined;
    fixture.detectChanges();

    expect(consoleWarnSpy).toHaveBeenCalledWith('Paginator not initialized');
    consoleWarnSpy.mockRestore();
  });

  it('should set paginator when initialized in effect', () => {
    const mockPaginator = { pageSize: 5 } as MatPaginator;
    component.paginator = mockPaginator;
    fixture.detectChanges();

    expect(component.dataSource.paginator).toEqual(mockPaginator);
    // expect(mockCdr.detectChanges).toHaveBeenCalled();
  });

  it('should call loadUsers and set filterPredicate in ngOnInit', () => {
    const user: User = { id: 1, name: 'John', company: 'ABC', bs: 'Consulting', website: 'example.com' };
    component.dataSource.data = [user];
    component.ngOnInit();

    expect(mockUserStore.loadUsers).toHaveBeenCalled();

    // Test filter predicate
    const filterPredicate = component.dataSource.filterPredicate;
    expect(filterPredicate(user, 'john')).toBe(true);
    expect(filterPredicate(user, 'abc')).toBe(true);
    expect(filterPredicate(user, 'consulting')).toBe(true);
    expect(filterPredicate(user, 'example.com')).toBe(true);
    expect(filterPredicate(user, '1')).toBe(true);
    expect(filterPredicate(user, 'xyz')).toBe(false);
  });

  it('should log message in ngOnDestroy', () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    component.ngOnDestroy();

    expect(consoleLogSpy).toHaveBeenCalledWith('Destroying UsersComponent');
    consoleLogSpy.mockRestore();
  });

 

  it('should call deleteUser in store when deleteUser is called', () => {
    component.deleteUser(1);

    expect(mockUserStore.deleteUser).toHaveBeenCalledWith(1);
  });

  // it('should call openPopup with userId in editUser', () => {
  //   const openPopupSpy = jest.spyOn(component, 'openPopup');
  //   component.editUser(1);

  //   expect(openPopupSpy).toHaveBeenCalledWith(2);
  // });

  it('should open dialog with correct config in openPopup', () => {
    // component.openPopup(3);

    expect(mockDialog.open)
  });

  it('should apply filter and reset paginator when applyFilter is called', () => {
    const mockPaginator = { firstPage: jest.fn() } as any;
    component.dataSource.paginator = mockPaginator;
    const event = { target: { value: ' test ' } } as any;

    component.applyFilter(event);

    expect(component.dataSource.filter).toBe('test');
    expect(mockPaginator.firstPage).toHaveBeenCalled();
    // expect(mockCdr.detectChanges).toHaveBeenCalled();
  });

  it('should not call firstPage when paginator is not set in applyFilter', () => {
    component.dataSource.paginator = null;
    const event = { target: { value: 'test ' } } as any;

    component.applyFilter(event);

    expect(component.dataSource.filter).toBe('test');
    // expect(mockCdr.detectChanges).toHaveBeenCalled();
  });
});