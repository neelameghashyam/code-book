import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSidenavComponent } from './custom-sidenav.component';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CustomSidenavComponent', () => {
  let component: CustomSidenavComponent;
  let fixture: ComponentFixture<CustomSidenavComponent>;
  let responsiveService: ResponsiveService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CustomSidenavComponent,
        MatListModule,
        MatIconModule,
        CommonModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [ResponsiveService]
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSidenavComponent);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should initialize menuItems with correct values', () => {
      expect(component.menuItems().length).toBe(2);
      expect(component.menuItems()[0].label).toBe('Dashboard');
      expect(component.menuItems()[1].label).toBe('Users');
    });

    it('should initialize sideNavCollapsed as false', () => {
      expect(component.sideNavCollapsed()).toBe(false);
    });
  });

  describe('Input collapsed', () => {
    it('should update sideNavCollapsed when input changes', () => {
      component.collapsed = true;
      fixture.detectChanges();
      expect(component.sideNavCollapsed()).toBe(true);
    });
  });

  describe('Template', () => {
    it('should render menu items', () => {
      const menuItems = fixture.debugElement.queryAll(By.css('a'));
      expect(menuItems.length).toBe(2);
      expect(menuItems[0].nativeElement.textContent).toContain('dashboard');
      expect(menuItems[1].nativeElement.textContent).toContain('group');
    });

    it('should show both icon and label when not collapsed on desktop', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
      component.sideNavCollapsed.set(false);
      fixture.detectChanges();
      
      const menuItem = fixture.debugElement.query(By.css('a'));
      const spans = menuItem.queryAll(By.css('span'));
      expect(spans.length).toBe(2);
      expect(spans[0].nativeElement.textContent).toBeTruthy(); // Icon
      expect(spans[1].nativeElement.textContent).toBeTruthy(); // Label
    });

    it('should show only icon when collapsed on desktop', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
      component.sideNavCollapsed.set(true);
      fixture.detectChanges();
      
      const menuItem = fixture.debugElement.query(By.css('a'));
      const spans = menuItem.queryAll(By.css('span'));
      expect(spans.length).toBe(1); // Only icon
    });

    it('should show both icon and label when on mobile', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(true);
      component.sideNavCollapsed.set(true);
      fixture.detectChanges();
      
      const menuItem = fixture.debugElement.query(By.css('a'));
      const spans = menuItem.queryAll(By.css('span'));
      expect(spans.length).toBe(2);
    });

    it('should have correct routerLink attributes', () => {
      const menuItems = fixture.debugElement.queryAll(By.css('a'));
      expect(menuItems[0].properties['href']).toContain('dashboard');
      expect(menuItems[1].properties['href']).toContain('users');
    });
  });

  describe('Responsive behavior', () => {
    it('should use mobile styling when isMobile returns true', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(true);
      fixture.detectChanges();
      
      const menuItem = fixture.debugElement.query(By.css('a'));
      expect(menuItem.nativeElement.classList.contains('px-3')).toBe(true);
    });

    it('should use desktop collapsed styling when not mobile and collapsed', () => {
      jest.spyOn(responsiveService, 'isMobile').mockReturnValue(false);
      component.sideNavCollapsed.set(true);
      fixture.detectChanges();
      
      const menuItem = fixture.debugElement.query(By.css('a'));
      expect(menuItem.nativeElement.classList.contains('px-0')).toBe(true);
    });
  });
});