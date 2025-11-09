import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObraForm } from './obra-form';

describe('ObraForm', () => {
  let component: ObraForm;
  let fixture: ComponentFixture<ObraForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObraForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObraForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
