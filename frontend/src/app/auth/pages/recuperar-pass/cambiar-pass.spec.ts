import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambiarPass } from './cambiar-pass';

describe('RecuperarPass', () => {
  let component: CambiarPass;
  let fixture: ComponentFixture<CambiarPass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambiarPass]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CambiarPass);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
