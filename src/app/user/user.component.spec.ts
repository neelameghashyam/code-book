import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgClass } from '@angular/common';
import { UserComponent } from './user.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        NgClass,
        NoopAnimationsModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize user with default avatar and online status', () => {
      expect(component.user).toEqual({
        avatar: 'assets/image.png',
        status: 'online',
      });
      expect(component.showAvatar).toBe(true);
    });

    it('should initialize avatarUpload ViewChild', () => {
      expect(component.avatarUpload).toBeDefined();
      expect(component.avatarUpload.nativeElement.type).toBe('file');
      expect(component.avatarUpload.nativeElement.classList).toContain('hidden');
    });
  });

  describe('Template Rendering', () => {
    it('should render user menu button with avatar when showAvatar and user.avatar are true', () => {
      component.showAvatar = true;
      component.user.avatar = 'assets/image.png';
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img');
      expect(img).toBeTruthy();
      expect(img.src).toContain('assets/image.png');
      expect(img.alt).toBe('User avatar');
    });

    it('should render default SVG icon when showAvatar is false', () => {
      component.showAvatar = false;
      fixture.detectChanges();

      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(fixture.nativeElement.querySelector('img')).toBeNull();
    });

    it('should render default SVG icon when user.avatar is empty', () => {
      component.showAvatar = true;
      component.user.avatar = '';
      fixture.detectChanges();

      const svg = fixture.nativeElement.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(fixture.nativeElement.querySelector('img')).toBeNull();
    });

    it('should render status indicator with correct class based on user.status', () => {
      const statusClasses = [
        { status: 'online', class: 'bg-green-500' },
        { status: 'away', class: 'bg-amber-500' },
        { status: 'busy', class: 'bg-red-500' },
        { status: 'not-visible', class: 'bg-gray-400' },
      ];

      statusClasses.forEach(({ status, class: expectedClass }) => {
        component.user.status = status as any;
        fixture.detectChanges();
        const statusDot = fixture.nativeElement.querySelector('span.absolute');
        expect(statusDot.classList).toContain(expectedClass);
      });
    });

    it('should render user menu with all items', () => {
      const menuTrigger = fixture.debugElement.query(By.css('button[matMenuTriggerFor]'));
      menuTrigger.nativeElement.click();
      fixture.detectChanges();

      const menuItems = fixture.nativeElement.querySelectorAll('button[mat-menu-item]');
      expect(menuItems.length).toBe(4); // Profile, Settings, Status, Sign out
      expect(menuItems[0].textContent).toContain('Profile');
      expect(menuItems[1].textContent).toContain('Settings');
      expect(menuItems[2].textContent).toContain('Status');
      expect(menuItems[3].textContent).toContain('Sign out');
    });

    it('should render status sub-menu with all options', () => {
      const menuTrigger = fixture.debugElement.query(By.css('button[matMenuTriggerFor]'));
      menuTrigger.nativeElement.click();
      fixture.detectChanges();

      const statusTrigger = fixture.debugElement.query(By.css('button[matMenuTriggerFor="userStatus"]'));
      statusTrigger.nativeElement.click();
      fixture.detectChanges();

      const statusItems = fixture.nativeElement.querySelectorAll('mat-menu[ng-reflect-menu="userStatus"] button[mat-menu-item]');
      expect(statusItems.length).toBe(4); // Online, Away, Busy, Invisible
      expect(statusItems[0].textContent).toContain('Online');
      expect(statusItems[1].textContent).toContain('Away');
      expect(statusItems[2].textContent).toContain('Busy');
      expect(statusItems[3].textContent).toContain('Invisible');
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status correctly', () => {
      component.updateUserStatus('away');
      expect(component.user.status).toBe('away');
      component.updateUserStatus('busy');
      expect(component.user.status).toBe('busy');
      component.updateUserStatus('not-visible');
      expect(component.user.status).toBe('not-visible');
      component.updateUserStatus('online');
      expect(component.user.status).toBe('online');
    });

    it('should reflect status change in UI', () => {
      component.updateUserStatus('busy');
      fixture.detectChanges();
      const statusDot = fixture.nativeElement.querySelector('span.absolute');
      expect(statusDot.classList).toContain('bg-red-500');
    });

    it('should update status when status menu item is clicked', () => {
      const menuTrigger = fixture.debugElement.query(By.css('button[matMenuTriggerFor]'));
      menuTrigger.nativeElement.click();
      fixture.detectChanges();

      const statusTrigger = fixture.debugElement.query(By.css('button[matMenuTriggerFor="userStatus"]'));
      statusTrigger.nativeElement.click();
      fixture.detectChanges();

      const statusItems = fixture.debugElement.queryAll(By.css('mat-menu[ng-reflect-menu="userStatus"] button[mat-menu-item]'));
      statusItems[1].nativeElement.click(); // Click "Away"
      fixture.detectChanges();

      expect(component.user.status).toBe('away');
      expect(fixture.nativeElement.querySelector('span.absolute').classList).toContain('bg-amber-500');
    });
  });

  describe('signOut', () => {
    it('should log sign out message when sign out is clicked', () => {
      jest.spyOn(console, 'log').mockImplementation();
      component.signOut();
      expect(console.log).toHaveBeenCalledWith('Sign out clicked');
    });

    it('should trigger sign out when sign out menu item is clicked', () => {
      jest.spyOn(console, 'log').mockImplementation();
      const menuTrigger = fixture.debugElement.query(By.css('button[matMenuTriggerFor]'));
      menuTrigger.nativeElement.click();
      fixture.detectChanges();

      const signOutButton = fixture.debugElement.queryAll(By.css('button[mat-menu-item]'))[3];
      signOutButton.nativeElement.click();
      fixture.detectChanges();

      expect(console.log).toHaveBeenCalledWith('Sign out clicked');
    });
  });

  describe('Avatar Upload Input', () => {
    it('should render hidden file input', () => {
      const fileInput = fixture.nativeElement.querySelector('#avatarUpload');
      expect(fileInput).toBeTruthy();
      expect(fileInput.type).toBe('file');
      expect(fileInput.classList).toContain('hidden');
    });
  });
});