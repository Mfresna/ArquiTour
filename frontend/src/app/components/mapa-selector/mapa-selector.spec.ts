import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaSelector } from './mapa-selector';

describe('MapaSelector', () => {
  let component: MapaSelector;
  let fixture: ComponentFixture<MapaSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaSelector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaSelector);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
