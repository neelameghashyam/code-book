import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubcategoriesComponent } from './add-subcategories.component';

describe('AddSubcategoriesComponent', () => {
  let component: AddSubcategoriesComponent;
  let fixture: ComponentFixture<AddSubcategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSubcategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
