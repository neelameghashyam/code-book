import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSidenavComponent } from './custom-sidenav.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

describe('CustomSidenavComponent', () => {
  let component: CustomSidenavComponent;
  let fixture: ComponentFixture<CustomSidenavComponent>;
  let responsiveService: ResponsiveService;
  let darkModeService: DarkModeService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CustomSidenavComponent,
        MatListModule,
        MatIconModule,
        CommonModule,
        RouterTestingModule.withRoutes([
          { path: 'dashboard', component: CustomSidenavComponent },
          { path: 'users', component: CustomSidenavComponent },
        ]),
        NoopAnimationsModule,
      ],
      providers: [
        ResponsiveService,
        {
          provide: DarkModeService,
          useValue: {
            isDarkMode: jest.fn().mockReturnValue(false),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSidenavComponent);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService);
    darkModeService = TestBed.inject(DarkModeService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should initialize menuItems with correct values', () => {
      expect(component.menuItems().length).toBe(2);
      expect(component.menuItems()[0]).toEqual({
        icon: 'dashboard',
        label: 'Dashboard',
        route: 'dashboard',
      });
      expect(component.menuItems()[1]).toEqual({
        icon: 'group',
        label: 'Users',
        route: 'users',
      });
    });

    it('should initialize sideNavCollapsed as false', () => {
      expect(component.sideNavCollapsed()).toBe(false);
    });
  });

  describe('Input collapsed', () => {
    it('should update sideNavCollapsed when input changes to true', () => {
      component.collapsed = true;
      fixture.detectChanges();
      expect(component.sideNavCollapsed()).toBe(true);
    });

    it('should update sideNavCollapsed when input changes to false', () => {
      component.collapsed = false;
      fixture.detectChanges();
      expect(component.sideNavCollapsed()).toBe(false);
    });
  });

  describe('Template rendering', () => {
    it('should render menu items with correct router links', () => {
      const menuItems = fixture.debugElement.queryAll(By.css('a'));
      expect(menuItems.length).toBe(2);
      expect(menuItems[0].attributes['ng-reflect-router-link']).toBe('dashboard');
      expect(menuItems[1].attributes['ng-reflect-router-link']).toBe('users');
    });

    it('should display icon and label when not collapsed on desktop', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
      component.sideNavCollapsed.set(false);
      fixture.detectChanges();

      const menuItem = fixture.debugElement.queryAll(By.css('a'))[0];
      const spans = menuItem.queryAll(By.css('span'));
      expect(spans.length).toBe(2);
      expect(spans[0].nativeElement.textContent.trim()).toBe('dashboard');
      expect(spans[1].nativeElement.textContent.trim()).toBe('Dashboard');
      expect(spans[0].classes['mr-2']).toBe(true);
    });

    it('should display only icon when collapsed on desktop', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
      component.sideNavCollapsed.set(true);
      fixture.detectChanges();

      const menuItem = fixture.debugElement.queryAll(By.css('a'))[0];
      const spans = menuItem.queryAll(By.css('span'));
      expect(spans.length).toBe(1);
      expect(spans[0].nativeElement.textContent.trim()).toBe('dashboard');
      expect(spans[0].classes['mr-0']).toBe(true);
      expect(menuItem.classes['px-0']).toBe(true);
      expect(menuItem.classes['py-3']).toBe(true);
      expect(menuItem.classes['justify-center']).toBe(true);
    });

    it('should display icon and label when collapsed on mobile', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(true);
      component.sideNavCollapsed.set(true);
      fixture.detectChanges();

      const menuItem = fixture.debugElement.queryAll(By.css('a'))[0];
      const spans = menuItem.queryAll(By.css('span'));
      expect(spans.length).toBe(2);
      expect(spans[0].nativeElement.textContent.trim()).toBe('dashboard');
      expect(spans[1].nativeElement.textContent.trim()).toBe('Dashboard');
      expect(spans[0].classes['mr-2']).toBe(true);
      expect(menuItem.classes['px-3']).toBe(true);
    });
  });

  describe('Dark mode behavior', () => {
    it('should apply light mode classes when darkMode is false', () => {
      jest.spyOn(darkModeService, 'isDarkMode').mockReturnValue(false);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('div'));
      const menuItem = fixture.debugElement.queryAll(By.css('a'))[0];
      const icon = menuItem.queryAll(By.css('span'))[0];

      expect(container.classes['bg-white']).toBe(true);
      expect(container.classes['bg-gray-900']).toBeFalsy();
      expect(menuItem.classes['text-gray-900']).toBe(true);
      expect(menuItem.classes['hover:bg-gray-100']).toBe(true);
      expect(icon.classes['text-gray-600']).toBe(true);
    });

    it('should apply dark mode classes when darkMode is true', () => {
      jest.spyOn(darkModeService, 'isDarkMode').mockReturnValue(true);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('div'));
      const menuItem = fixture.debugElement.queryAll(By.css('a'))[0];
      const icon = menuItem.queryAll(By.css('span'))[0];

      expect(container.classes['bg-gray-900']).toBe(true);
      expect(container.classes['bg-white']).toBeFalsy();
      expect(menuItem.classes['text-gray-200']).toBe(true);
      expect(menuItem.classes['hover:bg-gray-800']).toBe(true);
      expect(icon.classes['text-gray-400']).toBe(true);
    });
  });

  describe('Active route behavior', () => {
    beforeEach(async () => {
      // Navigate to dashboard to activate the route
      await router.navigate(['dashboard']);
      fixture.detectChanges();
    });

    it('should apply active classes in light mode', () => {
      jest.spyOn(darkModeService, 'isDarkMode').mockReturnValue(false);
      fixture.detectChanges();

      const menuItem = fixture.debugElement.queryAll(By.css('a'))[0];
      const icon = menuItem.queryAll(By.css('span'))[0];
      const label = menuItem.queryAll(By.css('span'))[1];

      expect(menuItem.classes['bg-primary-50']).toBe(true);
      expect(menuItem.classes['text-primary-600']).toBe(true);
      expect(menuItem.classes['hover:bg-primary-100']).toBe(true);
      expect(icon.classes['text-primary-600']).toBe(true);
      expect(icon.classes['material-icons']).toBe(true);
      expect(label.classes['text-primary-600']).toBe(true);
      expect(label.classes['font-semibold']).toBe(true);
    });

    it('should apply active classes in dark mode', () => {
      jest.spyOn(darkModeService, 'isDarkMode').mockReturnValue(true);
      fixture.detectChanges();

      const menuItem = fixture.debugElement.queryAll(By.css('a'))[0];
      const icon = menuItem.queryAll(By.css('span'))[0];
      const label = menuItem.queryAll(By.css('span'))[1];

      expect(menuItem.classes['bg-gray-700']).toBe(true);
      expect(menuItem.classes['text-white']).toBe(true);
      expect(icon.classes['text-white']).toBe(true);
      expect(icon.classes['material-icons']).toBe(true);
      expect(label.classes['text-white']).toBe(true);
      expect(label.classes['font-semibold']).toBe(true);
    });

    it('should apply inactive classes for non-active routes in light mode', () => {
      jest.spyOn(darkModeService, 'isDarkMode').mockReturnValue(false);
      fixture.detectChanges();

      const menuItem = fixture.debugElement.queryAll(By.css('a'))[1]; // Users route
      const icon = menuItem.queryAll(By.css('span'))[0];
      const label = menuItem.queryAll(By.css('span'))[1];

      expect(menuItem.classes['bg-primary-50']).toBeFalsy();
      expect(menuItem.classes['text-gray-900']).toBe(true);
      expect(icon.classes['text-gray-600']).toBe(true);
      expect(icon.classes['material-icons-outlined']).toBe(true);
      expect(label.classes['text-gray-900']).toBe(true);
    });

    it('should apply inactive classes for non-active routes in dark mode', () => {
      jest.spyOn(darkModeService, 'isDarkMode').mockReturnValue(true);
      fixture.detectChanges();

      const menuItem = fixture.debugElement.queryAll(By.css('a'))[1]; // Users route
      const icon = menuItem.queryAll(By.css('span'))[0];
      const label = menuItem.queryAll(By.css('span'))[1];

      expect(menuItem.classes['bg-gray-700']).toBeFalsy();
      expect(menuItem.classes['text-gray-200']).toBe(true);
      expect(icon.classes['text-gray-400']).toBe(true);
      expect(icon.classes['material-icons-outlined']).toBe(true);
      expect(label.classes['text-gray-300']).toBe(true);
    });
  });

  describe('Responsive behavior', () => {
    it('should apply mobile styling when isMobile returns true', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(true);
      fixture.detectChanges();

      const menuItem = fixture.debugElement.queryAll(By.css('a'))[0];
      expect(menuItem.classes['px-3']).toBe(true);
      expect(menuItem.classes['px-0']).toBeFalsy();
    });

    it('should apply desktop collapsed styling when not mobile and collapsed', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
      component.sideNavCollapsed.set(true);
      fixture.detectChanges();

      const menuItem = fixture.debugElement.queryAll(By.css('a'))[0];
      expect(menuItem.classes['px-0']).toBe(true);
      expect(menuItem.classes['py-3']).toBe(true);
      expect(menuItem.classes['justify-center']).toBe(true);
    });

    it('should apply desktop expanded styling when not mobile and not collapsed', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
      component.sideNavCollapsed.set(false);
      fixture.detectChanges();

      const menuItem = fixture.debugElement.queryAll(By.css('a'))[0];
      expect(menuItem.classes['px-3']).toBe(true);
      expect(menuItem.classes['px-0']).toBeFalsy();
    });
  });
});