import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaObras } from './mapa-obras';

describe('MapaObras', () => {
  let component: MapaObras;
  let fixture: ComponentFixture<MapaObras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaObras]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaObras);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
