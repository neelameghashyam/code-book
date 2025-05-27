import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDashboard2Component } from './main-dashboard-2.component';

describe('MainDashboard2Component', () => {
  let component: MainDashboard2Component;
  let fixture: ComponentFixture<MainDashboard2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainDashboard2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainDashboard2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
