import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectFavorito } from './select-favorito';

describe('SelectFavorito', () => {
  let component: SelectFavorito;
  let fixture: ComponentFixture<SelectFavorito>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectFavorito]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectFavorito);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
