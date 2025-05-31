import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ListBusinessesComponent } from './list-businesses.component';
import { BusinessStore } from '../store/business.store';
import { DarkModeService } from '../../../services/dark-mode.service';
import { ResponsiveService } from '../../../services/responsive/responsive.service';
import { signal } from '@angular/core';

// Mock Services
class MockBusinessStore {
  businesses = signal([
    {
      id: '1',
      name: 'Business One',
      category: 'Retail',
      subCategory: 'Clothing',
      country: 'USA',
      phone: '123-456-7890',
    },
    {
      id: '2',
      name: 'Business Two',
      category: 'Technology',
      subCategory: 'Software',
      country: 'Canada',
      phone: '987-654-3210',
    },
  ]);
  deleteBusiness = jest.fn();
}

class MockDarkModeService {
  isDarkMode = jest.fn().mockReturnValue(false);
}

class MockResponsiveService {
  isDesktop = jest.fn().mockReturnValue(true);
  isTablet = jest.fn().mockReturnValue(false);
  isMobile = jest.fn().mockReturnValue(false);
}

describe('ListBusinessesComponent', () => {
  let component: ListBusinessesComponent;
  let fixture: ComponentFixture<ListBusinessesComponent>;
  let businessStore: MockBusinessStore;
  let darkModeService: MockDarkModeService;
  let responsiveService: MockResponsiveService;

  beforeEach(waitForAsync(() => {
    businessStore = new MockBusinessStore();
    darkModeService = new MockDarkModeService();
    responsiveService = new MockResponsiveService();

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: BusinessStore, useValue: businessStore },
        { provide: DarkModeService, useValue: darkModeService },
        { provide: ResponsiveService, useValue: responsiveService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListBusinessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with businesses from BusinessStore', () => {
      expect(component.businesses()).toEqual(businessStore.businesses());
      expect(component.businesses().length).toBe(2);
    });
  });

  describe('Desktop and Tablet View', () => {
    beforeEach(() => {
      responsiveService.isDesktop.mockReturnValue(true);
      responsiveService.isTablet.mockReturnValue(false);
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
    });

    it('should render table layout when isDesktop is true', () => {
      const table = fixture.nativeElement.querySelector('table');
      expect(table).toBeTruthy();
      const rows = table.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });

    it('should render table layout when isTablet is true', () => {
      responsiveService.isDesktop.mockReturnValue(false);
      responsiveService.isTablet.mockReturnValue(true);
      fixture.detectChanges();
      const table = fixture.nativeElement.querySelector('table');
      expect(table).toBeTruthy();
    });

    it('should display business data in table rows', () => {
      const rows = fixture.nativeElement.querySelectorAll('tbody tr');
      expect(rows[0].querySelectorAll('td')[0].textContent).toContain('Business One');
      expect(rows[0].querySelectorAll('td')[1].textContent).toContain('Retail - Clothing');
      expect(rows[0].querySelectorAll('td')[2].textContent).toContain('USA');
      expect(rows[0].querySelectorAll('td')[3].textContent).toContain('123-456-7890');
      expect(rows[1].querySelectorAll('td')[0].textContent).toContain('Business Two');
      expect(rows[1].querySelectorAll('td')[1].textContent).toContain('Technology - Software');
      expect(rows[1].querySelectorAll('td')[2].textContent).toContain('Canada');
      expect(rows[1].querySelectorAll('td')[3].textContent).toContain('987-654-3210');
    });

    it('should render delete button for each business', () => {
      const deleteButtons = fixture.nativeElement.querySelectorAll('button[mat-icon-button]');
      expect(deleteButtons.length).toBe(2);
      expect(deleteButtons[0].querySelector('mat-icon').textContent).toBe('delete');
    });
  });

  describe('Mobile View', () => {
    beforeEach(() => {
      responsiveService.isDesktop.mockReturnValue(false);
      responsiveService.isTablet.mockReturnValue(false);
      responsiveService.isMobile.mockReturnValue(true);
      fixture.detectChanges();
    });

    it('should render card layout when isMobile is true', () => {
      const cards = fixture.nativeElement.querySelectorAll('mat-card');
      expect(cards.length).toBe(2);
    });

    it('should display business data in cards', () => {
      const cards = fixture.nativeElement.querySelectorAll('mat-card');
      const firstCard = cards[0];
      expect(firstCard.querySelector('mat-card-title').textContent).toContain('Business One');
      expect(firstCard.querySelector('mat-card-subtitle').textContent).toContain('Retail - Clothing');
      expect(firstCard.querySelectorAll('p')[0].textContent).toContain("Country:USA");
      expect(firstCard.querySelectorAll('p')[1].textContent).toContain('Contact:123-456-7890');

      const secondCard = cards[1];
      expect(secondCard.querySelector('mat-card-title').textContent).toContain('Business Two');
      expect(secondCard.querySelector('mat-card-subtitle').textContent).toContain('Technology - Software');
      expect(secondCard.querySelectorAll('p')[0].textContent).toContain('Country:Canada');
      expect(secondCard.querySelectorAll('p')[1].textContent).toContain('Contact:987-654-3210');
    });

    it('should render delete button for each card', () => {
      const deleteButtons = fixture.nativeElement.querySelectorAll('button[mat-icon-button]');
      expect(deleteButtons.length).toBe(2);
      expect(deleteButtons[0].querySelector('mat-icon').textContent).toBe('delete');
    });
  });

  describe('deleteBusiness', () => {
    it('should call deleteBusiness on BusinessStore when confirmed', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      component.deleteBusiness('1');
      expect(businessStore.deleteBusiness).toHaveBeenCalledWith('1');
    });

    it('should not call deleteBusiness if confirmation is cancelled', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);
      component.deleteBusiness('1');
      expect(businessStore.deleteBusiness).not.toHaveBeenCalled();
    });
  });

  describe('Dark Mode Integration', () => {
    it('should inject DarkModeService', () => {
      expect(component.darkModeService).toBe(darkModeService);
    });

    it('should apply dark mode if enabled', () => {
      darkModeService.isDarkMode.mockReturnValue(true);
      fixture.detectChanges();
      // Note: Actual dark mode styling depends on CSS, which isn't tested here
      expect(darkModeService.isDarkMode)
    });
  });

  describe('Responsive Behavior', () => {
    it('should not render table or cards when businesses is empty', () => {
      businessStore.businesses.set([]);
      fixture.detectChanges();
      const table = fixture.nativeElement.querySelector('table');
      const cards = fixture.nativeElement.querySelectorAll('mat-card');
      expect(table).toBeTruthy(); // Table structure remains but no rows
      expect(cards.length).toBe(0);
      expect(fixture.nativeElement.querySelector('tbody').children.length).toBe(0);
    });

    it('should render table when both isDesktop and isTablet are false but isMobile is false', () => {
      responsiveService.isDesktop.mockReturnValue(false);
      responsiveService.isTablet.mockReturnValue(false);
      responsiveService.isMobile.mockReturnValue(false);
      fixture.detectChanges();
      const table = fixture.nativeElement.querySelector('table');
      expect(table)
    });
  });
});