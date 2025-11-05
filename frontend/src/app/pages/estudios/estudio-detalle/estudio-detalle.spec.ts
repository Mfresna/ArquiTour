import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudioDetalle } from './estudio-detalle';

describe('EstudioDetalle', () => {
  let component: EstudioDetalle;
  let fixture: ComponentFixture<EstudioDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudioDetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstudioDetalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
