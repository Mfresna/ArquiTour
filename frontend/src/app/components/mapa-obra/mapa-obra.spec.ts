import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaObra } from './mapa-obra';

describe('MapaObra', () => {
  let component: MapaObra;
  let fixture: ComponentFixture<MapaObra>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaObra]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaObra);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
