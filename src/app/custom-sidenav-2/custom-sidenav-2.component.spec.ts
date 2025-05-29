import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSidenav2Component } from './custom-sidenav-2.component';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { TranslateService, TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';

describe('CustomSidenav2Component', () => {
  let component: CustomSidenav2Component;
  let fixture: ComponentFixture<CustomSidenav2Component>;
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
    get: jest.fn().mockImplementation(key => of(key)),
    use: jest.fn().mockReturnValue({}),
    onLangChange: new Subject(),
    onTranslationChange: new Subject(),
    onDefaultLangChange: new Subject(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatListModule,
        MatIconModule,
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: CustomSidenav2Component },
          { path: 'categories', component: CustomSidenav2Component },
          { path: 'sub-categories', component: CustomSidenav2Component },
        ]),
        TranslateModule.forRoot(),
        NoopAnimationsModule,
        CustomSidenav2Component, // Standalone component
      ],
      providers: [
        { provide: ResponsiveService, useValue: responsiveServiceMock },
        { provide: DarkModeService, useValue: darkModeServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSidenav2Component);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService);
    darkModeService = TestBed.inject(DarkModeService);
    translateService = TestBed.inject(TranslateService);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('collapsed input setter', () => {
    it('should update sideNavCollapsed signal with true value', () => {
      const setSpy = jest.spyOn(component.sideNavCollapsed, 'set');
      component.collapsed = true;
      expect(setSpy).toHaveBeenCalledWith(true);
      expect(component.sideNavCollapsed()).toBe(true);
    });

    it('should update sideNavCollapsed signal with false value', () => {
      const setSpy = jest.spyOn(component.sideNavCollapsed, 'set');
      component.collapsed = false;
      expect(setSpy).toHaveBeenCalledWith(false);
      expect(component.sideNavCollapsed()).toBe(false);
    });
  });

  describe('toggleSubMenu', () => {
    it('should update menuItems when item has subItems', () => {
      const menuItem = {
        icon: 'test',
        label: 'TEST',
        subItems: [{ icon: 'sub', label: 'SUB' }],
        isExpanded: false,
      };
      component.menuItems.set([menuItem]);
      component.toggleSubMenu(menuItem);
      expect(component.menuItems()[0].isExpanded).toBe(true);
      component.toggleSubMenu(menuItem);
      expect(component.menuItems()[0].isExpanded).toBe(false);
    });

    it('should not update menuItems when item has no subItems', () => {
      const menuItem = { icon: 'test', label: 'TEST' };
      component.menuItems.set([menuItem]);
      const updateSpy = jest.spyOn(component.menuItems, 'update');
      component.toggleSubMenu(menuItem);
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('should collapse other items when toggling one', () => {
      const item1 = {
        icon: 'item1',
        label: 'ITEM1',
        subItems: [{ icon: 'sub1', label: 'SUB1' }],
        isExpanded: false,
      };
      const item2 = {
        icon: 'item2',
        label: 'ITEM2',
        subItems: [{ icon: 'sub2', label: 'SUB2' }],
        isExpanded: true,
      };
      component.menuItems.set([item1, item2]);
      component.toggleSubMenu(item1);
      expect(component.menuItems()[0].isExpanded).toBe(true);
      expect(component.menuItems()[1].isExpanded).toBe(false);
    });

    it('should handle empty subItems array', () => {
      const menuItem = {
        icon: 'test',
        label: 'TEST',
        subItems: [],
        isExpanded: false,
      };
      component.menuItems.set([menuItem]);
      component.toggleSubMenu(menuItem);
      expect(component.menuItems()[0].isExpanded).toBe(true);
    });

    it('should handle undefined subItems', () => {
      const menuItem = {
        icon: 'test',
        label: 'TEST',
        subItems: undefined,
        isExpanded: false,
      };
      component.menuItems.set([menuItem]);
      component.toggleSubMenu(menuItem);
      expect(component.menuItems()[0].isExpanded).toBeUndefined();
    });
  });

  it('should initialize with correct menu items', () => {
    const menuItems = component.menuItems();
    expect(menuItems).toHaveLength(6);
    expect(menuItems[0]).toEqual({ icon: 'dashboard', label: 'DASHBOARD', route: 'dashboard' });
    expect(menuItems[1]).toEqual({
      icon: 'category',
      label: 'CATEGORIES',
      route: 'categories',
      subItems: [{ icon: 'dashboard_customize', label: 'SUBCATEGORIES', route: 'sub-categories' }],
      isExpanded: false,
    });
  });

  it('should render menu items without sub-items correctly', () => {
    const menuItems = fixture.debugElement.queryAll(By.css('a[routerLink]'));
    const pincodeItem = menuItems.find(item => item.attributes['aria-label'] === 'PINCODES');
    expect(pincodeItem).toBeTruthy();
    expect(pincodeItem?.query(By.css('.material-icons-outlined')).nativeElement.textContent).toBe('pin_drop');
  });

  it('should render menu items with sub-items and toggle them', () => {
    const categoriesItem = fixture.debugElement.query(By.css('div[aria-label="CATEGORIES"]'));
    expect(categoriesItem).toBeTruthy();
    component.toggleSubMenu(component.menuItems()[1]);
    fixture.detectChanges();
    const subItems = fixture.debugElement.queryAll(By.css('div.ml-4 a'));
    expect(subItems.length).toBe(1);
    expect(subItems[0].attributes['aria-label']).toBe('SUBCATEGORIES');
  });

  it('should apply dark mode styles when isDarkMode is true', () => {
    darkModeServiceMock.isDarkMode.mockReturnValue(true);
    fixture.detectChanges();
    const sidenav = fixture.debugElement.query(By.css('.h-full'));
    expect(sidenav.classes['dark']).toBeTruthy();
  });

  it('should apply light mode styles when isDarkMode is false', () => {
    darkModeServiceMock.isDarkMode.mockReturnValue(false);
    fixture.detectChanges();
    const sidenav = fixture.debugElement.query(By.css('.h-full'));
    expect(sidenav.classes['dark']).toBeFalsy();
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
  });

  it('should apply active styles when route is active', async () => {
    await router.navigate(['dashboard']);
    fixture.detectChanges();
    const dashboardLink = fixture.debugElement.query(By.css('a[aria-label="DASHBOARD"]'));
    expect(dashboardLink.classes['active']).toBeTruthy();
  });

  it('should not show sub-items when collapsed and not mobile', () => {
    component.collapsed = true;
    responsiveServiceMock.isMobile.mockReturnValue(false);
    component.toggleSubMenu(component.menuItems()[1]);
    fixture.detectChanges();
    const subItems = fixture.debugElement.queryAll(By.css('div.ml-4 a'));
    expect(subItems.length).toBe(0);
  });

  it('should show sub-items when collapsed and mobile', () => {
    component.collapsed = true;
    responsiveServiceMock.isMobile.mockReturnValue(true);
    component.toggleSubMenu(component.menuItems()[1]);
    fixture.detectChanges();
    const subItems = fixture.debugElement.queryAll(By.css('div.ml-4 a'));
    expect(subItems.length).toBe(1);
  });

  it('should translate menu item labels', () => {
    translateServiceMock.instant.mockReturnValue('Translated Dashboard');
    component.menuItems.set([{ icon: 'dashboard', label: 'DASHBOARD', route: 'dashboard' }]);
    fixture.detectChanges();
    const label = fixture.debugElement.query(By.css('a span.font-medium'));
    expect(translateServiceMock.instant).toHaveBeenCalledWith('DASHBOARD');
    expect(label.nativeElement.textContent).toContain('Translated Dashboard');
  });

  it('should handle menu item without route', () => {
    component.menuItems.set([{ icon: 'test', label: 'TEST' }]);
    fixture.detectChanges();
    const menuItem = fixture.debugElement.query(By.css('div[aria-label="TEST"]'));
    expect(menuItem.attributes['routerLink']).toBeUndefined();
  });

  it('should stop propagation on expand/collapse icon click', () => {
    const event = { stopPropagation: jest.fn() };
    const categoriesItem = fixture.debugElement.query(By.css('div[aria-label="CATEGORIES"] mat-icon'));
    categoriesItem.triggerEventHandler('click', event);
    fixture.detectChanges();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.menuItems()[1].isExpanded).toBe(true);
  });
});