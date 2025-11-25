import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaPrincipal } from './mapa-principal';

describe('MapaPrincipal', () => {
  let component: MapaPrincipal;
  let fixture: ComponentFixture<MapaPrincipal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaPrincipal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaPrincipal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
