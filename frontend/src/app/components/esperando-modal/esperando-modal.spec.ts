import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsperandoModal } from './esperando-modal';

describe('EsperandoModal', () => {
  let component: EsperandoModal;
  let fixture: ComponentFixture<EsperandoModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EsperandoModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsperandoModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
