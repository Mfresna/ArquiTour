import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudForm } from './solicitud-form';

describe('SolicitudForm', () => {
  let component: SolicitudForm;
  let fixture: ComponentFixture<SolicitudForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
