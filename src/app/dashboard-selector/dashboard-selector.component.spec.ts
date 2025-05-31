import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { DashboardSelectorComponent } from './dashboard-selector.component';

// Mock Router
const mockRouter = {
  navigate: jest.fn()
};

describe('DashboardSelectorComponent', () => {
  let component: DashboardSelectorComponent;
  let fixture: ComponentFixture<DashboardSelectorComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardSelectorComponent,
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardSelectorComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  // Test component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test navigation to Dashboard 1
  it('should navigate to main-dashboard when navigateToDashboard1 is called', () => {
    component.navigateToDashboard1();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/main-dashboard']);
  });

  // Test navigation to Dashboard 2
  it('should navigate to main-dashboard-2 when navigateToDashboard2 is called', () => {
    component.navigateToDashboard2();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/main-dashboard-2']);
  });

  // Test template rendering
  it('should render the title correctly', () => {
    const titleElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(titleElement.textContent).toContain('Select a Dashboard');
    expect(titleElement.classList).toContain('mat-headline-5');
    expect(titleElement.classList).toContain('text-center');
    expect(titleElement.classList).toContain('mb-8');
    expect(titleElement.classList).toContain('text-gray-900');
  });

  // Test rendering of dashboard cards
  it('should render two mat-card elements', () => {
    const cardElements = fixture.debugElement.queryAll(By.css('mat-card'));
    expect(cardElements.length).toBe(2);
  });

  // Test Dashboard 1 card content
  it('should render Dashboard 1 card with correct content', () => {
    const cardElements = fixture.debugElement.queryAll(By.css('mat-card'));
    const dashboard1Card = cardElements[0].nativeElement;

    // Check card classes
    expect(dashboard1Card.classList).toContain('mat-elevation-z4');
    expect(dashboard1Card.classList).toContain('square-card');

    // Check card header
    const cardTitle = cardElements[0].query(By.css('mat-card-title')).nativeElement;
    expect(cardTitle.textContent).toContain('Dashboard 1');
    expect(cardTitle.classList).toContain('mat-headline-6');
    expect(cardTitle.classList).toContain('text-gray-900');

    const cardSubtitle = cardElements[0].query(By.css('mat-card-subtitle')).nativeElement;
    expect(cardSubtitle.textContent).toContain('without title in header');
    expect(cardSubtitle.classList).toContain('mat-body-2');
    expect(cardSubtitle.classList).toContain('text-gray-600');

    // Check card avatar icon
    const cardIcon = cardElements[0].query(By.css('mat-icon')).nativeElement;
    expect(cardIcon.textContent).toContain('dashboard');
    expect(cardIcon.classList).toContain('text-4xl');
    expect(cardIcon.classList).toContain('text-blue-700');

    // Check card image
    const cardImage = cardElements[0].query(By.css('img')).nativeElement;
    expect(cardImage.getAttribute('src')).toBe('assets/dashboard1.png');
    expect(cardImage.getAttribute('alt')).toBe('Dashboard 1 Preview');
    expect(cardImage.classList).toContain('object-contain');
    expect(cardImage.classList).toContain('w-full');
    expect(cardImage.classList).toContain('h-full');

    // Check card button
    const button = cardElements[0].query(By.css('button')).nativeElement;
    expect(button.textContent).toContain('Go to Dashboard 1');
    expect(button.classList)
    expect(button.getAttribute('color')).toBe('primary');
  });

  // Test Dashboard 2 card content
  it('should render Dashboard 2 card with correct content', () => {
    const cardElements = fixture.debugElement.queryAll(By.css('mat-card'));
    const dashboard2Card = cardElements[1].nativeElement;

    // Check card classes
    expect(dashboard2Card.classList).toContain('mat-elevation-z4');
    expect(dashboard2Card.classList).toContain('square-card');

    // Check card header
    const cardTitle = cardElements[1].query(By.css('mat-card-title')).nativeElement;
    expect(cardTitle.textContent).toContain('Dashboard 2');
    expect(cardTitle.classList).toContain('mat-headline-6');
    expect(cardTitle.classList).toContain('text-gray-900');

    const cardSubtitle = cardElements[1].query(By.css('mat-card-subtitle')).nativeElement;
    expect(cardSubtitle.textContent).toContain('with title');
    expect(cardSubtitle.classList).toContain('mat-body-2');
    expect(cardSubtitle.classList).toContain('text-gray-600');

    // Check card avatar icon
    const cardIcon = cardElements[1].query(By.css('mat-icon')).nativeElement;
    expect(cardIcon.textContent).toContain('dashboard');
    expect(cardIcon.classList).toContain('text-4xl');
    expect(cardIcon.classList).toContain('text-green-700');

    // Check card image
    const cardImage = cardElements[1].query(By.css('img')).nativeElement;
    expect(cardImage.getAttribute('src')).toBe('assets/dashboard2.png');
    expect(cardImage.getAttribute('alt')).toBe('Dashboard 2 Preview');
    expect(cardImage.classList).toContain('object-contain');
    expect(cardImage.classList).toContain('w-full');
    expect(cardImage.classList).toContain('h-full');

    // Check card button
    const button = cardElements[1].query(By.css('button')).nativeElement;
    expect(button.textContent).toContain('Go to Dashboard 2');
    expect(button.classList)
    expect(button.getAttribute('color')).toBe('primary');
  });

  // Test button click for Dashboard 1
  it('should call navigateToDashboard1 when Dashboard 1 button is clicked', () => {
    jest.spyOn(component, 'navigateToDashboard1');
    const button = fixture.debugElement.queryAll(By.css('button'))[0].nativeElement;
    button.click();
    fixture.detectChanges();
    expect(component.navigateToDashboard1).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/main-dashboard']);
  });

  // Test button click for Dashboard 2
  it('should call navigateToDashboard2 when Dashboard 2 button is clicked', () => {
    jest.spyOn(component, 'navigateToDashboard2');
    const button = fixture.debugElement.queryAll(By.css('button'))[1].nativeElement;
    button.click();
    fixture.detectChanges();
    expect(component.navigateToDashboard2).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/main-dashboard-2']);
  });

  // Test container classes
  it('should have correct classes on the container div', () => {
    const container = fixture.debugElement.query(By.css('div')).nativeElement;
    expect(container.classList).toContain('flex');
    expect(container.classList).toContain('flex-col');
    expect(container.classList).toContain('items-center');
    expect(container.classList).toContain('justify-center');
    expect(container.classList).toContain('min-h-screen');
    expect(container.classList).toContain('px-4');
    expect(container.classList).toContain('py-8');
  });

  // Test grid classes
  it('should have correct classes on the grid div', () => {
    const grid = fixture.debugElement.query(By.css('.grid')).nativeElement;
    expect(grid.classList).toContain('grid');
    expect(grid.classList).toContain('grid-cols-1');
    expect(grid.classList).toContain('md:grid-cols-2');
    expect(grid.classList).toContain('gap-6');
    expect(grid.classList).toContain('max-w-5xl');
    expect(grid.classList).toContain('w-full');
  });
});