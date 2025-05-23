import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPincodesComponent } from './add-pincodes.component';

describe('AddPincodesComponent', () => {
  let component: AddPincodesComponent;
  let fixture: ComponentFixture<AddPincodesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPincodesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddPincodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
