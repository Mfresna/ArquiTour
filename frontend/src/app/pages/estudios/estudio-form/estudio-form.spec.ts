import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudioForm } from './estudio-form';

describe('EstudioForm', () => {
  let component: EstudioForm;
  let fixture: ComponentFixture<EstudioForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudioForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstudioForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
