import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragZoneSimple } from './drag-zone-simple';

describe('DragZoneSimple', () => {
  let component: DragZoneSimple;
  let fixture: ComponentFixture<DragZoneSimple>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragZoneSimple]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragZoneSimple);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
