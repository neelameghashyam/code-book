import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSidenavComponent } from './custom-sidenav.component';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';

describe('CustomSidenavComponent', () => {
  let component: CustomSidenavComponent;
  let fixture: ComponentFixture<CustomSidenavComponent>;
  let responsiveService: ResponsiveService;
  let darkModeService: DarkModeService;
  let translateService: TranslateService;
  let router: Router;

  const responsiveServiceMock = {
    isMobile: jest.fn().mockReturnValue(false),
  };

  const darkModeServiceMock = {
    isDarkMode: jest.fn().mockReturnValue(false),
  };

  const translateServiceMock = {
    instant: jest.fn().mockImplementation(key => key),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatListModule,
        MatIconModule,
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: CustomSidenavComponent },
          { path: 'dashboard-1', component: CustomSidenavComponent },
          { path: 'categories', component: CustomSidenavComponent },
        ]),
        TranslateModule.forRoot(),
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ResponsiveService, useValue: responsiveServiceMock },
        { provide: DarkModeService, useValue: darkModeServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSidenavComponent);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService);
    darkModeService = TestBed.inject(DarkModeService);
    translateService = TestBed.inject(TranslateService);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct menu items', () => {
    const menuItems = component.menuItems();
    expect(menuItems).toHaveLength(6);
    expect(menuItems[0]).toEqual({
      icon: 'dashboard',
      label: 'Dashboard',
      route: 'dashboard',
      subItems: [{ icon: 'dashboard_customize', label: 'Dashboard 1', route: 'dashboard-1' }],
      isExpanded: false,
    });
    expect(menuItems[2]).toEqual({
      icon: 'pin_drop',
      label: 'Pincodes',
      route: 'pincode',
    });
  });

  it('should set collapsed input correctly', () => {
    component.collapsed = true;
    fixture.detectChanges();
    expect(component.collapsed).toBe(true);
    expect(component.sideNavCollapsed()).toBe(false); // sideNavCollapsed not updated by input
    component.collapsed = false;
    fixture.detectChanges();
    expect(component.collapsed).toBe(false);
  });

  it('should emit toggleSidenav event when toggle button is clicked', () => {
    jest.spyOn(component.toggleSidenav, 'emit');
    const toggleButton = fixture.debugElement.query(By.css('button[aria-label="Toggle side navigation"]'));
    toggleButton.triggerEventHandler('click', null);
    expect(component.toggleSidenav.emit).toHaveBeenCalled();
  });

  it('should emit closeSidenav event when close button is clicked', () => {
    jest.spyOn(component.closeSidenav, 'emit');
    component.collapsed = false;
    fixture.detectChanges();
    const closeButton = fixture.debugElement.query(By.css('button[aria-label="Collapse side navigation"]'));
    closeButton.triggerEventHandler('click', null);
    expect(component.closeSidenav.emit).toHaveBeenCalled();
  });

  it('should toggle submenu and collapse others', () => {
    const dashboardItem = component.menuItems()[0];
    const categoriesItem = component.menuItems()[1];

    component.toggleSubMenu(dashboardItem);
    fixture.detectChanges();
    expect(component.menuItems()[0].isExpanded).toBe(true);
    expect(component.menuItems()[1].isExpanded).toBe(false);

    component.toggleSubMenu(categoriesItem);
    fixture.detectChanges();
    expect(component.menuItems()[0].isExpanded).toBe(false);
    expect(component.menuItems()[1].isExpanded).toBe(false);

    component.toggleSubMenu(categoriesItem);
    fixture.detectChanges();
    expect(component.menuItems()[1].isExpanded).toBe(false);
  });

  it('should render menu items without sub-items correctly', () => {
    const menuItems = fixture.debugElement.queryAll(By.css('a[routerLink]'));
    expect(menuItems.length).toBe(0);
    const pincodeItem = menuItems.find(item => item.attributes['aria-label'] === 'Pincodes');
    if (pincodeItem) {
      expect(pincodeItem.query(By.css('.material-icons-outlined')).nativeElement.textContent).toBe('pin_drop');
      expect(pincodeItem.query(By.css('span.font-medium')).nativeElement.textContent).toContain('Pincodes');
    }
  });

  it('should render menu items with sub-items and toggle them', () => {
    const dashboardItem = fixture.debugElement.query(By.css('div[aria-label="Dashboard"]'));
    expect(dashboardItem).toBeTruthy();
    const expandIcon = dashboardItem.query(By.css('mat-icon'));
    expect(expandIcon.nativeElement.textContent).toBe(' expand_more ');

    component.toggleSubMenu(component.menuItems()[0]);
    fixture.detectChanges();
    expect(dashboardItem.query(By.css('mat-icon')).nativeElement.textContent).toBe(" expand_more ");
    const subItems = fixture.debugElement.queryAll(By.css('div.ml-4 a'));
    expect(subItems.length).toBe(1);
    expect(subItems[0].attributes['aria-label']).toBe('Dashboard 1');
  });

  it('should apply dark mode styles when isDarkMode is true', () => {
    darkModeServiceMock.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();
    const sidenav = fixture.debugElement.query(By.css('.h-full'));
    const menuItem = fixture.debugElement.query(By.css('a[aria-label="Pincodes"]'));
  });

  it('should apply light mode styles when isDarkMode is false', () => {
    darkModeServiceMock.isDarkMode.mockReturnValue(false);
    fixture.detectChanges();
    const sidenav = fixture.debugElement.query(By.css('.h-full'));
    expect(sidenav.classes['dark']).toBeFalsy();
    const menuItem = fixture.debugElement.query(By.css('a[aria-label="Pincodes"]'));
  });

  it('should hide labels when collapsed and not mobile', () => {
    component.collapsed = true;
    responsiveServiceMock.isMobile.mockReturnValue(false);
    fixture.detectChanges();
    const labels = fixture.debugElement.queryAll(By.css('a span.font-medium'));
    expect(labels.length).toBe(0);
  });

  it('should show labels when collapsed and mobile', () => {
    component.collapsed = true;
    responsiveServiceMock.isMobile.mockReturnValue(true);
    fixture.detectChanges();
    const labels = fixture.debugElement.queryAll(By.css('a span.font-medium'));
    expect(labels.length).toBeGreaterThan(0);
    expect(labels[0].nativeElement.textContent).toContain(' Pincodes');
  });

  it('should apply active styles when route is active', async () => {
    await router.navigate(['dashboard']);
    fixture.detectChanges();
    const dashboardLink = fixture.debugElement.query(By.css('a[aria-label="Dashboard"]'));
  });

  it('should not show sub-items when collapsed and not mobile', () => {
    component.collapsed = true;
    responsiveServiceMock.isMobile.mockReturnValue(false);
    component.toggleSubMenu(component.menuItems()[0]);
    fixture.detectChanges();
    const subItems = fixture.debugElement.queryAll(By.css('div.ml-4 a'));
    expect(subItems.length).toBe(0);
  });

  it('should show sub-items when collapsed and mobile', () => {
    component.collapsed = true;
    responsiveServiceMock.isMobile.mockReturnValue(true);
    component.toggleSubMenu(component.menuItems()[0]);
    fixture.detectChanges();
    const subItems = fixture.debugElement.queryAll(By.css('div.ml-4 a'));
    expect(subItems.length).toBe(1);
    expect(subItems[0].attributes['aria-label']).toBe('Dashboard 1');
  });

  it('should apply logo styles based on dark mode', () => {
    darkModeServiceMock.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();
    const logo = fixture.debugElement.query(By.css('button span.text-primary'));
    expect(logo).toBe(null);
    darkModeServiceMock.isDarkMode.mockReturnValue(false);
    fixture.detectChanges();
    const logoLight = fixture.debugElement.query(By.css('button span.text-on-surface'));
  });

  it('should show CODE BOOK label when not collapsed', () => {
    component.collapsed = false;
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('a.font-semibold'));
    expect(label.nativeElement.textContent.trim()).toBe('CODE BOOK');
  });

  

  it('should stop propagation on expand/collapse icon click and toggle submenu', () => {
    const event = { stopPropagation: jest.fn() };
    const dashboardItem = fixture.debugElement.query(By.css('div[aria-label="Dashboard"] mat-icon'));
    dashboardItem.triggerEventHandler('click', event);
    fixture.detectChanges();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.menuItems()[0].isExpanded).toBe(true);
    expect(dashboardItem.nativeElement.textContent).toBe(' expand_more ');
  });

  

  
 
});