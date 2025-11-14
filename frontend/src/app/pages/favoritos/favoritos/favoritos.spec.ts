import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Favoritos } from './favoritos';

describe('Favoritos', () => {
  let component: Favoritos;
  let fixture: ComponentFixture<Favoritos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Favoritos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Favoritos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
