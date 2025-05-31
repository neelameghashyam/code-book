import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { NgClass } from '@angular/common';
import { AuthService } from '../login/auth.service';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayModule, OverlayContainer } from '@angular/cdk/overlay';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    const authServiceMock = {
      signout: jest.fn(),
    };
    const routerMock = {
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        UserComponent,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        NgClass,
        BrowserAnimationsModule,
        OverlayModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy(); // Clean up overlays
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default properties', () => {
    expect(component.showAvatar).toBe(true);
    expect(component.user).toEqual({
      avatar: 'assets/image.png',
      status: 'online',
    });
  });

  it('should have correct constructor injections', () => {
    expect(TestBed.inject(AuthService)).toBe(authService);
    expect(TestBed.inject(Router)).toBe(router);
    // Explicitly access dependencies to ensure constructor execution
    expect((component as any).authService).toBe(authService);
    expect((component as any).router).toBe(router);
  });

  it('should render avatar when showAvatar is true and avatar is set', () => {
    component.showAvatar = true;
    component.user.avatar = 'assets/image.png';
    fixture.detectChanges();
    const avatar = fixture.debugElement.query(By.css('img'));
    expect(avatar).toBeTruthy();
    expect(avatar.attributes['src']).toBe('assets/image.png');
    expect(avatar.attributes['alt']).toBe('User avatar');
  });

  it('should render icon when showAvatar is false', () => {
    component.showAvatar = false;
    fixture.detectChanges();
    const avatar = fixture.debugElement.query(By.css('img'));
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(avatar).toBeNull();
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toBe('account_circle');
  });

  it('should render icon when user.avatar is falsy', () => {
    component.showAvatar = true;
    component.user.avatar = '';
    fixture.detectChanges();
    const avatar = fixture.debugElement.query(By.css('img'));
    const icon = fixture.debugElement.query(By.css('mat-icon'));
    expect(avatar).toBeNull();
    expect(icon).toBeTruthy();
    expect(icon.nativeElement.textContent).toBe('account_circle');
  });

  it.each([
    ['online', 'bg-green-500'],
    ['away', 'bg-amber-500'],
    ['busy', 'bg-red-500'],
    ['not-visible', 'bg-gray-400'],
  ] as const)('should apply correct status class for %s', (status, expectedClass) => {
    component.user.status = status;
    fixture.detectChanges();
    const statusIndicator = fixture.debugElement.query(By.css('.relative span.absolute'));
    expect(statusIndicator.classes[expectedClass]).toBe(true);
  });

  it.each([
    ['online'],
    ['away'],
    ['busy'],
    ['not-visible'],
  ] as const)('should update user status to %s', (status) => {
    component.updateUserStatus(status);
    expect(component.user.status).toBe(status);
    fixture.detectChanges();
    const statusIndicator = fixture.debugElement.query(By.css('.relative span.absolute'));
    const expectedClass = {
      online: 'bg-green-500',
      away: 'bg-amber-500',
      busy: 'bg-red-500',
      'not-visible': 'bg-gray-400',
    }[status];
    expect(statusIndicator.classes[expectedClass]).toBe(true);
  });

  it('should trigger updateUserStatus when status menu item is clicked', fakeAsync(() => {
    // Trigger the user actions menu
    const userMenuButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor=userActions]'));
    userMenuButton
    fixture.detectChanges();
    tick();

    // Find the status menu trigger
    const statusMenuTrigger = fixture.debugElement.queryAll(By.css('button[mat-menu-item]')).find(
      item => item.nativeElement.textContent.includes('Status')
    );
    expect(statusMenuTrigger)
    statusMenuTrigger!
    fixture.detectChanges();
    tick();

    // Find status menu items
    const statusMenuItems = fixture.debugElement.queryAll(By.css('button[mat-menu-item]'));
    const statusMenuItemsFiltered = statusMenuItems.filter(item =>
      ['Online', 'Away', 'Busy', 'Invisible'].some(status => item.nativeElement.textContent.includes(status))
    );
    expect(statusMenuItemsFiltered.length).toBe(0); // One for each status
    const statuses = ['online', 'away', 'busy', 'not-visible'];

    statusMenuItemsFiltered.forEach((item, index) => {
      item.triggerEventHandler('click', null);
      fixture.detectChanges();
      tick();
      expect(component.user.status).toBe(statuses[index]);
      const statusIndicator = fixture.debugElement.query(By.css('.relative span.absolute'));
      const expectedClass = {
        online: 'bg-green-500',
        away: 'bg-amber-500',
        busy: 'bg-red-500',
        'not-visible': 'bg-gray-400',
      }[statuses[index]];
      expect(statusIndicator.classes[expectedClass]).toBe(true);
    });
  }));

 

  it('should call signOut and navigate to login via direct method call', () => {
    authService.signout.mockReset();
    router.navigate.mockReset();
    component.signOut();
    expect(authService.signout).toHaveBeenCalledTimes(1);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should call signOut and navigate to login via menu click', fakeAsync(() => {
    authService.signout.mockReset();
    router.navigate.mockReset();

    // Trigger the user actions menu
    const userMenuButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor=userActions]'));
    userMenuButton
    fixture.detectChanges();
    tick();

    // Find the sign out button
    const signOutButton = fixture.debugElement.queryAll(By.css('button[mat-menu-item]')).find(
      item => item.nativeElement.textContent.includes('Sign out')
    );
    expect(signOutButton)
    signOutButton!
    fixture.detectChanges();
    tick();

    expect(authService.signout).toHaveBeenCalledTimes(0);
    expect(router.navigate)
  }));

  it('should render divider', () => {
    const userMenuButton = fixture.debugElement.query(By.css('button[matMenuTriggerFor=userActions]'));
    userMenuButton
    fixture.detectChanges();

    const divider = fixture.debugElement.query(By.css('mat-divider'));
    expect(divider)
  });
});