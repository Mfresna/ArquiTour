import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PinVerificador } from './pin-verificador';

describe('PinVerificador', () => {
  let component: PinVerificador;
  let fixture: ComponentFixture<PinVerificador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PinVerificador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PinVerificador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
