import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSidenavComponent } from './custom-sidenav.component';
import { ResponsiveService } from '../services/responsive/responsive.service';
import { DarkModeService } from '../services/dark-mode.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';

describe('CustomSidenavComponent', () => {
  let component: CustomSidenavComponent;
  let fixture: ComponentFixture<CustomSidenavComponent>;
  let responsiveService: ResponsiveService;
  let darkModeService: DarkModeService;
  let translateService: TranslateService;

  // Mock services
  const responsiveServiceMock = {
    // Add mock methods if used in template/component logic
  };
  const darkModeServiceMock = {
    // Add mock methods if used in template/component logic
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CustomSidenavComponent,
        CommonModule,
        MatListModule,
        MatIconModule,
        RouterTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ResponsiveService, useValue: responsiveServiceMock },
        { provide: DarkModeService, useValue: darkModeServiceMock },
        TranslateService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSidenavComponent);
    component = fixture.componentInstance;
    responsiveService = TestBed.inject(ResponsiveService);
    darkModeService = TestBed.inject(DarkModeService);
    translateService = TestBed.inject(TranslateService);

    // Mock translateService.instant to return the input key
    jest.spyOn(translateService, 'instant').mockImplementation((key: string) => key);

    fixture.detectChanges(); // Trigger initial rendering
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should inject ResponsiveService', () => {
    expect(component.responsiveService).toBe(responsiveService);
  });

  it('should inject DarkModeService', () => {
    expect(component.darkModeService).toBe(darkModeService);
  });

  it('should initialize menuItems signal with correct items', () => {
    const expectedItems = [
      { icon: 'dashboard', label: 'Dashboard', route: 'dashboard' },
      { icon: 'group', label: 'Users', route: 'users' },
      { icon: 'business_center', label: 'Business', route: 'business' },
      { icon: 'business', label: 'Business List', route: 'business-list' },
    ];
    expect(component.menuItems()).toEqual(expectedItems);
  });

  it('should initialize sideNavCollapsed signal as false', () => {
    expect(component.sideNavCollapsed()).toBe(false);
  });

  it('should set sideNavCollapsed signal when collapsed input is set', () => {
    component.collapsed = true;
    expect(component.sideNavCollapsed()).toBe(true);

    component.collapsed = false;
    expect(component.sideNavCollapsed()).toBe(false);
  });

  it('should render all menu items in the template', () => {
    const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(listItems.length).toBe(component.menuItems().length);

    component.menuItems().forEach((item, index) => {
      const listItem = listItems[index];
      const icon = listItem.query(By.css('mat-icon'));
      const link = listItem.query(By.css('a'));

      expect(icon.nativeElement.textContent).toBe(item.icon);
      expect(link.nativeElement.getAttribute('ng-reflect-router-link')).toBe(item.route);
      // Translated label should match the input key (mocked translateService.instant)
      expect(link.nativeElement.textContent.trim()).toContain(item.label);
    });
  });

  it('should apply collapsed class when sideNavCollapsed is true', () => {
    component.collapsed = true;
    fixture.detectChanges();

    const sidenav = fixture.debugElement.query(By.css('.sidenav-container'));
    expect(sidenav.classes['collapsed']).toBeTruthy();
  });

  it('should not apply collapsed class when sideNavCollapsed is false', () => {
    component.collapsed = false;
    fixture.detectChanges();

    const sidenav = fixture.debugElement.query(By.css('.sidenav-container'));
    expect(sidenav.classes['collapsed']).toBeFalsy();
  });

  it('should handle empty menuItems signal', () => {
    component.menuItems.set([]);
    fixture.detectChanges();

    const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(listItems.length).toBe(0);
  });

  it('should update menuItems signal and reflect in template', () => {
    const newItems = [
      { icon: 'home', label: 'Home', route: 'home' },
    ];
    component.menuItems.set(newItems);
    fixture.detectChanges();

    const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    expect(listItems.length).toBe(1);
    const icon = listItems[0].query(By.css('mat-icon'));
    const link = listItems[0].query(By.css('a'));
    expect(icon.nativeElement.textContent).toBe('home');
    expect(link.nativeElement.getAttribute('ng-reflect-router-link')).toBe('home');
    expect(link.nativeElement.textContent.trim()).toContain('Home');
  });

  it('should handle null collapsed input gracefully', () => {
    component.collapsed = null as any;
    expect(component.sideNavCollapsed()).toBe(false); // Signal should remain unchanged or default
  });

  it('should use translate pipe for menu item labels', () => {
    // Mock translateService.instant to return a modified label
    jest.spyOn(translateService, 'instant').mockImplementation((key: string) => `Translated_${key}`);

    component.menuItems().forEach((item) => {
      expect(translateService.instant(item.label)).toBe(`Translated_${item.label}`);
    });

    fixture.detectChanges();
    const listItems = fixture.debugElement.queryAll(By.css('mat-list-item'));
    listItems.forEach((listItem, index) => {
      const link = listItem.query(By.css('a'));
      expect(link.nativeElement.textContent.trim()).toContain(
        `Translated_${component.menuItems()[index].label}`
      );
    });
  });
});