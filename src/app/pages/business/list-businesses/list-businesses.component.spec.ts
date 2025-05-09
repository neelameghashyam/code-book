import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBusinessesComponent } from './list-businesses.component';

describe('ListBusinessesComponent', () => {
  let component: ListBusinessesComponent;
  let fixture: ComponentFixture<ListBusinessesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListBusinessesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListBusinessesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
