import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritosDetalle } from './favoritos-detalle';

describe('FavoritosDetalle', () => {
  let component: FavoritosDetalle;
  let fixture: ComponentFixture<FavoritosDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritosDetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritosDetalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
