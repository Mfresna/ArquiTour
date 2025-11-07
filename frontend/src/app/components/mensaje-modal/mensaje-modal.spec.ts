import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajeModal } from './mensaje-modal';

describe('MensajeModal', () => {
  let component: MensajeModal;
  let fixture: ComponentFixture<MensajeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MensajeModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MensajeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
