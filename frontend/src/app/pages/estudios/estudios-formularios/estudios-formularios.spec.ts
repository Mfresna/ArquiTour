import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstudiosFormularios } from './estudios-formularios';

describe('EstudiosFormularios', () => {
  let component: EstudiosFormularios;
  let fixture: ComponentFixture<EstudiosFormularios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudiosFormularios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstudiosFormularios);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
