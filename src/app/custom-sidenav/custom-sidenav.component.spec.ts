import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSidenavComponent } from './custom-sidenav.component';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CustomSidenavComponent', () => {
  let component: CustomSidenavComponent;
  let fixture: ComponentFixture<CustomSidenavComponent>;
  let mockResponsiveService: any;

  beforeEach(async () => {
    mockResponsiveService = { isMobile: jest.fn().mockReturnValue(false) };
    
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatListModule,
        MatIconModule,
        RouterTestingModule,
        CustomSidenavComponent
      ],
      providers: [
        { provide: ResponsiveService, useValue: mockResponsiveService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default menu items', () => {
    expect(component.menuItems().length).toBe(2);
    expect(component.menuItems()[0]).toEqual({ icon: 'dashboard', label: 'Dashboard', route: 'dashboard' });
    expect(component.menuItems()[1]).toEqual({ icon: 'group', label: 'Users', route: 'users' });
  });

  it('should initialize with sideNavCollapsed as false', () => {
    expect(component.sideNavCollapsed()).toBeFalsy();
  });

  it('should update sideNavCollapsed when collapsed input changes', () => {
    component.collapsed = true;
    expect(component.sideNavCollapsed()).toBeTruthy();
    
    component.collapsed = false;
    expect(component.sideNavCollapsed()).toBeFalsy();
  });

  it('should render menu items correctly when sideNav is not collapsed', () => {
    component.sideNavCollapsed.set(false);
    fixture.detectChanges();
    
    const menuItems = fixture.debugElement.queryAll(By.css('a'));
    expect(menuItems.length).toBe(2);
    
    const firstItem = menuItems[0];
    expect(firstItem.query(By.css('.material-icons-outlined')).nativeElement.textContent).toContain('dashboard');
    expect(firstItem.query(By.css('span.font-medium')).nativeElement.textContent).toContain('Dashboard');
  });

  it('should render only icons when sideNav is collapsed and not mobile', () => {
    component.sideNavCollapsed.set(true);
    mockResponsiveService.isMobile.mockReturnValue(false);
    fixture.detectChanges();
    
    const menuItems = fixture.debugElement.queryAll(By.css('a'));
    expect(menuItems.length).toBe(2);
    
    const firstItem = menuItems[0];
    expect(firstItem.query(By.css('.material-icons-outlined')).nativeElement.textContent).toContain('dashboard');
    expect(firstItem.query(By.css('span.font-medium'))).toBeNull();
  });

  it('should show labels when sideNav is collapsed but is mobile', () => {
    component.sideNavCollapsed.set(true);
    mockResponsiveService.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    
    const menuItems = fixture.debugElement.queryAll(By.css('a'));
    expect(menuItems.length).toBe(2);
    
    const firstItem = menuItems[0];
    expect(firstItem.query(By.css('.material-icons-outlined')).nativeElement.textContent).toContain('dashboard');
    expect(firstItem.query(By.css('span.font-medium')).nativeElement.textContent).toContain('Dashboard');
  });

  it('should apply active styles when route is active', () => {
    const routerLinkDirective = fixture.debugElement.query(By.css('a')).injector.get('rla');
    jest.spyOn(routerLinkDirective, 'isActive', 'get').mockReturnValue(true);
    fixture.detectChanges();
    
    const activeItem = fixture.debugElement.query(By.css('a.bg-primary-50'));
    expect(activeItem).toBeTruthy();
    expect(activeItem.query(By.css('.material-icons.text-primary-600'))).toBeTruthy();
    expect(activeItem.query(By.css('span.text-primary-600.font-semibold'))).toBeTruthy();
  });

  it('should apply correct icon margin classes based on collapse state', () => {
    component.sideNavCollapsed.set(false);
    fixture.detectChanges();
    
    let icon = fixture.debugElement.query(By.css('.material-icons-outlined'));
    expect(icon.classes['mr-2']).toBeTruthy();
    
    component.sideNavCollapsed.set(true);
    mockResponsiveService.isMobile.mockReturnValue(false);
    fixture.detectChanges();
    
    icon = fixture.debugElement.query(By.css('.material-icons-outlined'));
    expect(icon.classes['mr-0']).toBeTruthy();
  });

  it('should apply correct justification classes when collapsed and not mobile', () => {
    component.sideNavCollapsed.set(true);
    mockResponsiveService.isMobile.mockReturnValue(false);
    fixture.detectChanges();
    
    const menuItem = fixture.debugElement.query(By.css('a'));
    expect(menuItem.classes['justify-center']).toBeTruthy();
    expect(menuItem.classes['py-3']).toBeTruthy();
    expect(menuItem.classes['px-0']).toBeTruthy();
  });

  it('should not apply justification classes when not collapsed', () => {
    component.sideNavCollapsed.set(false);
    fixture.detectChanges();
    
    const menuItem = fixture.debugElement.query(By.css('a'));
    expect(menuItem.classes['justify-center']).toBeFalsy();
    expect(menuItem.classes['py-3']).toBeFalsy();
    expect(menuItem.classes['px-0']).toBeFalsy();
  });

  it('should use routerLink directive correctly', () => {
    const menuItems = fixture.debugElement.queryAll(By.css('a'));
    expect(menuItems[0].attributes['ng-reflect-router-link']).toBe('dashboard');
    expect(menuItems[1].attributes['ng-reflect-router-link']).toBe('users');
  });

  it('should apply hover styles', () => {
    const menuItem = fixture.debugElement.query(By.css('a'));
    expect(menuItem.classes['hover:bg-gray-100']).toBeTruthy();
  });

  it('should apply transition classes', () => {
    const menuItem = fixture.debugElement.query(By.css('a'));
    expect(menuItem.classes['transition-all']).toBeTruthy();
    expect(menuItem.classes['duration-300']).toBeTruthy();
    expect(menuItem.classes['ease-in-out']).toBeTruthy();
  });

  it('should handle empty menu items', () => {
    component.menuItems.set([]);
    fixture.detectChanges();
    
    const menuItems = fixture.debugElement.queryAll(By.css('a'));
    expect(menuItems.length).toBe(0);
  });

  it('should properly inject ResponsiveService', () => {
    expect(component.responsiveService).toBe(mockResponsiveService);
  });

  it('should maintain menu items signal immutability', () => {
    const originalMenuItems = component.menuItems();
    component.menuItems().push({ icon: 'test', label: 'Test', route: 'test' });
    expect(component.menuItems()).toEqual(originalMenuItems);
  });
});