import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecuperarPass } from './recuperar-pass';

describe('RecuperarPass', () => {
  let component: RecuperarPass;
  let fixture: ComponentFixture<RecuperarPass>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecuperarPass]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecuperarPass);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
