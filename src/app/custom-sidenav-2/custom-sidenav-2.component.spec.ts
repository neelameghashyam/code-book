import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomSidenav2Component } from './custom-sidenav-2.component';

describe('CustomSidenav2Component', () => {
  let component: CustomSidenav2Component;
  let fixture: ComponentFixture<CustomSidenav2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSidenav2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomSidenav2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
