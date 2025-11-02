import { TestBed } from '@angular/core/testing';

import { Estudios } from './estudios';

describe('Estudios', () => {
  let service: Estudios;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Estudios);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
