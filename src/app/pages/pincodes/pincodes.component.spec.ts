import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PincodesComponent } from './pincodes.component';

describe('PincodesComponent', () => {
  let component: PincodesComponent;
  let fixture: ComponentFixture<PincodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PincodesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PincodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
