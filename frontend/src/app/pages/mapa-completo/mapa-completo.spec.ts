import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaCompleto } from './mapa-completo';

describe('MapaCompleto', () => {
  let component: MapaCompleto;
  let fixture: ComponentFixture<MapaCompleto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaCompleto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaCompleto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
