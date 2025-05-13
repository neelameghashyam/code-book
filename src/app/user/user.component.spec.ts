import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgClass } from '@angular/common';
import { By } from '@angular/platform-browser';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserComponent,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        NgClass,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with showAvatar as true and user object', () => {
      expect(component.showAvatar).toBe(true);
      expect(component.user).toEqual({
        avatar: '/assets/image.png',
        status: 'online',
      });
    });

    it('should render avatar image when showAvatar is true and avatar exists', () => {
      const imgElement = fixture.debugElement.query(By.css('img'));
      expect(imgElement).toBeTruthy();
      expect(imgElement.attributes['src']).toBe('/assets/image.png');
      expect(imgElement.attributes['alt']).toBe('User avatar');
    });

    it('should render status dot with online class', () => {
      const statusDot = fixture.debugElement.query(By.css('span[ngClass]'));
      expect(statusDot.classes['bg-green-500']).toBeTruthy();
    });
  });

  describe('Avatar Rendering', () => {
    it('should render mat-icon when showAvatar is false', () => {
      component.showAvatar = false;
      fixture.detectChanges();
      const iconElement = fixture.debugElement.query(By.css('mat-icon'));
      const imgElement = fixture.debugElement.query(By.css('img'));
      expect(iconElement).toBeTruthy();
      expect(iconElement.nativeElement.textContent).toBe('account_circle');
      expect(imgElement).toBeNull();
    });

    it('should render mat-icon when user.avatar is empty', () => {
      component.user.avatar = '';
      fixture.detectChanges();
      const iconElement = fixture.debugElement.query(By.css('mat-icon'));
      const imgElement = fixture.debugElement.query(By.css('img'));
      expect(iconElement).toBeTruthy();
      expect(iconElement.nativeElement.textContent).toBe('account_circle');
      expect(imgElement).toBeNull();
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status to online', () => {
      component.updateUserStatus('online');
      expect(component.user.status).toBe('online');
      fixture.detectChanges();
      const statusDot = fixture.debugElement.query(By.css('span[ngClass]'));
      expect(statusDot.classes['bg-green-500']).toBeTruthy();
      expect(statusDot.classes['bg-amber-500']).toBeFalsy();
      expect(statusDot.classes['bg-red-500']).toBeFalsy();
      expect(statusDot.classes['bg-gray-400']).toBeFalsy();
    });

    it('should update user status to away', () => {
      component.updateUserStatus('away');
      expect(component.user.status).toBe('away');
      fixture.detectChanges();
      const statusDot = fixture.debugElement.query(By.css('span[ngClass]'));
      expect(statusDot.classes['bg-amber-500']).toBeTruthy();
      expect(statusDot.classes['bg-green-500']).toBeFalsy();
      expect(statusDot.classes['bg-red-500']).toBeFalsy();
      expect(statusDot.classes['bg-gray-400']).toBeFalsy();
    });

    it('should update user status to busy', () => {
      component.updateUserStatus('busy');
      expect(component.user.status).toBe('busy');
      fixture.detectChanges();
      const statusDot = fixture.debugElement.query(By.css('span[ngClass]'));
      expect(statusDot.classes['bg-red-500']).toBeTruthy();
      expect(statusDot.classes['bg-green-500']).toBeFalsy();
      expect(statusDot.classes['bg-amber-500']).toBeFalsy();
      expect(statusDot.classes['bg-gray-400']).toBeFalsy();
    });

    it('should update user status to not-visible', () => {
      component.updateUserStatus('not-visible');
      expect(component.user.status).toBe('not-visible');
      fixture.detectChanges();
      const statusDot = fixture.debugElement.query(By.css('span[ngClass]'));
      expect(statusDot.classes['bg-gray-400']).toBeTruthy();
      expect(statusDot.classes['bg-green-500']).toBeFalsy();
      expect(statusDot.classes['bg-amber-500']).toBeFalsy();
      expect(statusDot.classes['bg-red-500']).toBeFalsy();
    });
  });

  describe('signOut', () => {
    it('should log sign out message when signOut is called', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      component.signOut();
      expect(consoleSpy).toHaveBeenCalledWith('Sign out clicked');
      consoleSpy.mockRestore();
    });
  });

  describe('Menu Interactions', () => {
    it('should render user menu with profile, settings, status, and sign out options', () => {
      const menuItems = fixture.debugElement.queryAll(By.css('mat-menu#userActions button[mat-menu-item]'));
      expect(menuItems.length).toBe(4);
      expect(menuItems[0].nativeElement.textContent).toContain('Profile');
      expect(menuItems[1].nativeElement.textContent).toContain('Settings');
      expect(menuItems[2].nativeElement.textContent).toContain('Status');
      expect(menuItems[3].nativeElement.textContent).toContain('Sign out');
    });

    it('should render status menu with all status options', () => {
      const statusMenuItems = fixture.debugElement.queryAll(By.css('mat-menu#userStatus button[mat-menu-item]'));
      expect(statusMenuItems.length).toBe(4);
      expect(statusMenuItems[0].nativeElement.textContent).toContain('Online');
      expect(statusMenuItems[1].nativeElement.textContent).toContain('Away');
      expect(statusMenuItems[2].nativeElement.textContent).toContain('Busy');
      expect(statusMenuItems[3].nativeElement.textContent).toContain('Invisible');
    });

    it('should update status to online when online menu item is clicked', () => {
      const statusMenuItems = fixture.debugElement.queryAll(By.css('mat-menu#userStatus button[mat-menu-item]'));
      statusMenuItems[0].nativeElement.click();
      fixture.detectChanges();
      expect(component.user.status).toBe('online');
      const statusDot = fixture.debugElement.query(By.css('span[ngClass]'));
      expect(statusDot.classes['bg-green-500']).toBeTruthy();
    });

    it('should update status to away when away menu item is clicked', () => {
      const statusMenuItems = fixture.debugElement.queryAll(By.css('mat-menu#userStatus button[mat-menu-item]'));
      statusMenuItems[1].nativeElement.click();
      fixture.detectChanges();
      expect(component.user.status).toBe('away');
      const statusDot = fixture.debugElement.query(By.css('span[ngClass]'));
      expect(statusDot.classes['bg-amber-500']).toBeTruthy();
    });

    it('should update status to busy when busy menu item is clicked', () => {
      const statusMenuItems = fixture.debugElement.queryAll(By.css('mat-menu#userStatus button[mat-menu-item]'));
      statusMenuItems[2].nativeElement.click();
      fixture.detectChanges();
      expect(component.user.status).toBe('busy');
      const statusDot = fixture.debugElement.query(By.css('span[ngClass]'));
      expect(statusDot.classes['bg-red-500']).toBeTruthy();
    });

    it('should update status to not-visible when invisible menu item is clicked', () => {
      const statusMenuItems = fixture.debugElement.queryAll(By.css('mat-menu#userStatus button[mat-menu-item]'));
      statusMenuItems[3].nativeElement.click();
      fixture.detectChanges();
      expect(component.user.status).toBe('not-visible');
      const statusDot = fixture.debugElement.query(By.css('span[ngClass]'));
      expect(statusDot.classes['bg-gray-400']).toBeTruthy();
    });

    it('should call signOut when sign out menu item is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const menuItems = fixture.debugElement.queryAll(By.css('mat-menu#userActions button[mat-menu-item]'));
      menuItems[3].nativeElement.click();
      fixture.detectChanges();
      expect(consoleSpy).toHaveBeenCalledWith('Sign out clicked');
      consoleSpy.mockRestore();
    });
  });

  describe('Avatar Click', () => {
    it('should not have avatar upload input (commented out in template)', () => {
      const inputElement = fixture.debugElement.query(By.css('input#avatarUpload'));
      expect(inputElement).toBeNull();
    });

    it('should render avatar with click handler', () => {
      const imgElement = fixture.debugElement.query(By.css('img'));
      expect(imgElement.attributes['src']).toBe('/assets/image.png');
      // Note: The (click) handler is commented out in the template, so no further testing is needed
    });
  });
});