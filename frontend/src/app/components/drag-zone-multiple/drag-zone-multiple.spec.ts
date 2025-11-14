import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragZoneMultiple } from './drag-zone-multiple';

describe('DragZoneMultiple', () => {
  let component: DragZoneMultiple;
  let fixture: ComponentFixture<DragZoneMultiple>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragZoneMultiple]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragZoneMultiple);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
