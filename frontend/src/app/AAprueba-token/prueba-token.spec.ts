import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruebaToken } from './prueba-token';

describe('PruebaToken', () => {
  let component: PruebaToken;
  let fixture: ComponentFixture<PruebaToken>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PruebaToken]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PruebaToken);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
