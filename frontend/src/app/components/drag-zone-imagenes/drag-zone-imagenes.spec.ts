import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragZoneImagenes } from './drag-zone-imagenes';

describe('DragZoneImagenes', () => {
  let component: DragZoneImagenes;
  let fixture: ComponentFixture<DragZoneImagenes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragZoneImagenes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragZoneImagenes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
