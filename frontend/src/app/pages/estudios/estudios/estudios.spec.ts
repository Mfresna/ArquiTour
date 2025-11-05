import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Estudios } from './estudios';

describe('Estudios', () => {
  let component: Estudios;
  let fixture: ComponentFixture<Estudios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Estudios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Estudios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
