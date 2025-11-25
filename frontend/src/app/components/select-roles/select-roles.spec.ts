import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectRoles } from './select-roles';

describe('SelectRoles', () => {
  let component: SelectRoles;
  let fixture: ComponentFixture<SelectRoles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectRoles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectRoles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
