import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DebugElement } from '@angular/core';
import { CommonModule } from '@angular/common';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UserComponent,
        NoopAnimationsModule,
        CommonModule,
        MatMenuModule,
        MatButtonModule,
        MatIconModule,
        MatDividerModule
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the avatar if showAvatar is true and user has avatar', () => {
    const imgEl: DebugElement = fixture.debugElement.query(By.css('img'));
    expect(imgEl).toBeTruthy();
    expect(imgEl.nativeElement.getAttribute('src')).toBe('assets/image.png');
  });

  it('should render mat-icon if showAvatar is false', () => {
    component.showAvatar = false;
    fixture.detectChanges();
    const iconEl = fixture.debugElement.query(By.css('mat-icon'));
    expect(iconEl.nativeElement.textContent.trim()).toBe('account_circle');
  });

  it('should apply correct status color based on user status', () => {
    const dot = fixture.debugElement.query(By.css('.absolute span'));
    expect(dot.nativeElement.classList).toContain('bg-green-500');

    component.updateUserStatus('away');
    fixture.detectChanges();
    expect(dot.nativeElement.classList).toContain('bg-amber-500');

    component.updateUserStatus('busy');
    fixture.detectChanges();
    expect(dot.nativeElement.classList).toContain('bg-red-500');

    component.updateUserStatus('not-visible');
    fixture.detectChanges();
    expect(dot.nativeElement.classList).toContain('bg-gray-400');
  });

  it('should call updateUserStatus and update user status', () => {
    component.updateUserStatus('busy');
    expect(component.user.status).toBe('busy');
  });

  it('should call signOut and log to console', () => {
    const spy = jest.spyOn(console, 'log');
    component.signOut();
    expect(spy).toHaveBeenCalledWith('Sign out clicked');
  });

  it('should simulate avatar upload click', () => {
    const clickSpy = jest.spyOn(document, 'getElementById');
    component.showAvatar = true;
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css('img'));
    img.nativeElement.click();

    expect(clickSpy).toHaveBeenCalledWith('avatarUpload');
  });
});
