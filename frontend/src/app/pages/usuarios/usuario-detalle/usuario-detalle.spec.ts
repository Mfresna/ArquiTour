import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioDetalle } from './usuario-detalle';

describe('UsuarioDetalle', () => {
  let component: UsuarioDetalle;
  let fixture: ComponentFixture<UsuarioDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioDetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioDetalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
